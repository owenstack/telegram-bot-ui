import { drizzle } from "drizzle-orm/d1";
import { sql } from "drizzle-orm";
import { telegramMember } from "~/db/schema";
import type { Context } from "hono";
import { Markup, Telegraf, session } from "telegraf";
import { isAdmin } from "./helpers";

let botInstance: Telegraf | null = null;
let configuredGroupChatId: string | null = null;

const commands = [
	{ command: "/start", description: "Start the bot" },
	{ command: "/help", description: "Show available commands" },
	// Group management commands
	{ command: "/warn", description: "Warn a user (admin only)" },
	{
		command: "/kick",
		description: "Remove a user from the group (admin only)",
	},
	{ command: "/ban", description: "Ban a user from the group (admin only)" },
	{ command: "/unban", description: "Unban a user (admin only)" },
	{ command: "/pin", description: "Pin a message (admin only)" },
	{ command: "/inactivity", description: "Show inactive users (admin only)" },
	{ command: "/rules", description: "Show group rules" },
];

export function createBotHandler(env: Env) {
	const bot = new Telegraf(env.TELEGRAM_BOT_KEY);
	botInstance = bot;
	configuredGroupChatId = env.SUPER_GROUP_CHAT_ID;

	bot.use(session());
	bot.telegram.setMyCommands(commands);

	bot.start((ctx) => {
		if (ctx.chat.type === "private") {
			return ctx.reply("Message our MEV Bot at @kc_mev");
		}
		return ctx.reply(
			"KC Messages is active. Type /help to see available commands.",
		);
	});

	bot.help((ctx) => {
		const keyboard = Markup.keyboard(
			commands.map((cmd) => [
				Markup.button.callback(cmd.description, cmd.command),
			]),
		);

		const commandsMessage = commands
			.map((cmd) => `${cmd.command} - ${cmd.description}`)
			.join("\n");
		ctx.reply(
			`KC Messages help menu:\n\nAvailable commands:\n${commandsMessage}`,
			keyboard,
		);
	});

	bot.command("kick", async (ctx) => {
		try {
			// Check if user is admin
			if (!(await isAdmin(ctx))) {
				return ctx.reply("You must be an admin to use this command.");
			}

			// Get the username to kick
			const text = ctx.message.text.trim();
			const args = text.split(" ");

			if (args.length < 2) {
				return ctx.reply(
					"Please specify a user to kick: /kick @username [reason]",
				);
			}

			// Extract username (remove @ if present)
			const username = args[1].replace(/^@/, "");
			const reason = args.slice(2).join(" ") || "No reason provided";

			if (!username) {
				return ctx.reply("Invalid username");
			}

			// Find the user in the group
			const chatId = ctx.chat.id;
			const db = drizzle(env.DATABASE);

			try {
				// Find the user by username in the database
				const memberToKick = await db
					.select()
					.from(telegramMember)
					.where(sql`username = ${username} AND is_active = true`)
					.limit(1);

				if (!memberToKick || memberToKick.length === 0) {
					return ctx.reply(`User @${username} not found in the group.`);
				}

				// Kick the user
				await ctx.telegram.banChatMember(
					env.SUPER_GROUP_CHAT_ID,
					memberToKick[0].id,
				);

				// Immediately unban to convert kick to a soft ban
				await ctx.telegram.unbanChatMember(chatId, memberToKick[0].id);

				// Update the database
				await db
					.update(telegramMember)
					.set({ leftAt: new Date(), isActive: false })
					.where(sql`id = ${memberToKick[0].id}`);

				return ctx.reply(
					`User @${username} has been kicked from the group.\nReason: ${reason}`,
				);
			} catch (error) {
				console.error("Error kicking user:", error);
				return ctx.reply("An error occurred while trying to kick the user.");
			}
		} catch (error) {
			console.error("Error in kick command:", error);
			return ctx.reply("An error occurred while processing your command.");
		}
	});

	bot.command("warn", async (ctx) => {
		try {
			// Check if user is admin
			if (!(await isAdmin(ctx))) {
				return ctx.reply("You must be an admin to use this command.");
			}

			const text = ctx.message.text.trim();
			const args = text.split(" ");

			if (args.length < 2) {
				return ctx.reply(
					"Please specify a user to warn: /warn @username [reason]",
				);
			}

			// Extract username and reason
			const username = args[1].replace(/^@/, "");
			const reason = args.slice(2).join(" ") || "No reason provided";

			if (!username) {
				return ctx.reply("Invalid username");
			}

			const db = drizzle(env.DATABASE);
			const memberToWarn = await db
				.select()
				.from(telegramMember)
				.where(sql`username = ${username} AND is_active = true`)
				.limit(1);

			if (!memberToWarn || memberToWarn.length === 0) {
				return ctx.reply(`User @${username} not found in the group.`);
			}

			const warningMessage = `⚠️ WARNING to @${username}\nReason: ${reason}\nIssued by: ${ctx.from.first_name}`;
			await ctx.reply(warningMessage);
		} catch (error) {
			console.error("Error in warn command:", error);
			return ctx.reply("An error occurred while processing your command.");
		}
	});

	bot.command("ban", async (ctx) => {
		try {
			if (!(await isAdmin(ctx))) {
				return ctx.reply("You must be an admin to use this command.");
			}

			const text = ctx.message.text.trim();
			const args = text.split(" ");

			if (args.length < 2) {
				return ctx.reply(
					"Please specify a user to ban: /ban @username [reason]",
				);
			}

			const username = args[1].replace(/^@/, "");
			const reason = args.slice(2).join(" ") || "No reason provided";

			if (!username) {
				return ctx.reply("Invalid username");
			}

			const db = drizzle(env.DATABASE);
			const memberToBan = await db
				.select()
				.from(telegramMember)
				.where(sql`username = ${username} AND is_active = true`)
				.limit(1);

			if (!memberToBan || memberToBan.length === 0) {
				return ctx.reply(`User @${username} not found in the group.`);
			}

			await ctx.telegram.banChatMember(
				env.SUPER_GROUP_CHAT_ID,
				memberToBan[0].id,
			);

			await db
				.update(telegramMember)
				.set({ leftAt: new Date(), isActive: false })
				.where(sql`id = ${memberToBan[0].id}`);

			return ctx.reply(`User @${username} has been banned.\nReason: ${reason}`);
		} catch (error) {
			console.error("Error in ban command:", error);
			return ctx.reply("An error occurred while processing your command.");
		}
	});

	bot.command("pin", async (ctx) => {
		try {
			if (!(await isAdmin(ctx))) {
				return ctx.reply("You must be an admin to use this command.");
			}

			if (!ctx.message.reply_to_message) {
				return ctx.reply("Please reply to a message you want to pin.");
			}

			await ctx.pinChatMessage(ctx.message.reply_to_message.message_id);
			return ctx.reply("Message has been pinned.");
		} catch (error) {
			console.error("Error in pin command:", error);
			return ctx.reply("An error occurred while trying to pin the message.");
		}
	});

	bot.command("rules", async (ctx) => {
		const rules = `📜 Group Rules:

1. Be respectful to all members
2. No spam or self-promotion
3. Stay on topic with MEV and crypto discussions
4. No harassment or hate speech
5. No NSFW content
6. English language only
7. No price discussion
8. Don't share personal information
9. Admin has the final say

Breaking these rules may result in warnings or bans.`;

		return ctx.reply(rules);
	});

	bot.command("inactivity", async (ctx) => {
		try {
			if (!(await isAdmin(ctx))) {
				return ctx.reply("You must be an admin to use this command.");
			}

			const now = new Date();
			const inactiveThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days
			const db = drizzle(env.DATABASE);

			const users = await db
				.select()
				.from(telegramMember)
				.where(sql`is_active = true`);

			const inactiveUsers = users.filter((user) => {
				const inactiveTime = now.getTime() - user.lastActive.getTime();
				return inactiveTime > inactiveThreshold;
			});

			if (inactiveUsers.length === 0) {
				return ctx.reply("No inactive users found.");
			}

			const inactiveList = inactiveUsers
				.map((user) => {
					const daysInactive = Math.floor(
						(now.getTime() - user.lastActive.getTime()) / (24 * 60 * 60 * 1000),
					);
					return `@${user.username || user.firstName} - ${daysInactive} days inactive`;
				})
				.join("\n");

			return ctx.reply(`Inactive users (>30 days):\n\n${inactiveList}`);
		} catch (error) {
			console.error("Error in inactivity command:", error);
			return ctx.reply("An error occurred while checking inactive users.");
		}
	});

	bot.on("chat_member", async (ctx) => {
		if (ctx.chat.id.toString() === env.SUPER_GROUP_CHAT_ID) {
			const { old_chat_member, new_chat_member } = ctx.chatMember;
			const userId = new_chat_member.user.id;
			const db = drizzle(env.DATABASE);

			if (
				new_chat_member.status === "member" &&
				old_chat_member.status !== "member"
			) {
				// New member joined
				const newMember = {
					id: userId,
					firstName: new_chat_member.user.first_name,
					lastName: new_chat_member.user.last_name ?? "",
					username: new_chat_member.user.username ?? "",
					isActive: true,
					lastActive: new Date(ctx.chatMember.date * 1000),
					joinedAt: new Date(ctx.chatMember.date * 1000),
					leftAt: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};

				await db.insert(telegramMember).values(newMember);
				ctx.reply(
					`Welcome, ${new_chat_member.user.first_name}! Type /rules to see our group guidelines.`,
				);
			} else if (
				old_chat_member.status === "member" &&
				new_chat_member.status !== "member"
			) {
				// Member left or was removed
				await db
					.update(telegramMember)
					.set({ leftAt: new Date(), isActive: false })
					.where(sql`id = ${userId}`);
				ctx.reply(
					`Goodbye ${old_chat_member.user.first_name}! We hope to see you again.`,
				);
			}
		}
	});

	bot.on("left_chat_member", async (ctx) => {
		if (ctx.chat.id.toString() === env.SUPER_GROUP_CHAT_ID) {
			const userId = ctx.message.left_chat_member.id;
			const db = drizzle(env.DATABASE);
			await db
				.update(telegramMember)
				.set({ leftAt: new Date(), isActive: false })
				.where(sql`id = ${userId}`);
		}
	});

	bot.on("new_chat_members", async (ctx) => {
		if (ctx.chat.id.toString() === env.SUPER_GROUP_CHAT_ID) {
			const db = drizzle(env.DATABASE);
			for (const member of ctx.message.new_chat_members) {
				const newMember = {
					id: member.id,
					firstName: member.first_name,
					lastName: member.last_name ?? "",
					username: member.username ?? "",
					isActive: true,
					lastActive: new Date(ctx.message.date * 1000),
					joinedAt: new Date(ctx.message.date * 1000),
					leftAt: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				};
				await db.insert(telegramMember).values(newMember);
			}
		}
	});

	bot.on("message", async (ctx) => {
		if (ctx.chat.id.toString() === env.SUPER_GROUP_CHAT_ID) {
			const userId = ctx.from.id;
			const db = drizzle(env.DATABASE);
			await db
				.update(telegramMember)
				.set({
					lastActive: new Date(ctx.message.date * 1000),
					updatedAt: new Date(),
				})
				.where(sql`id = ${userId}`);
		}
	});

	return async (c: Context) => {
		try {
			const body = await c.req.json();
			await bot.handleUpdate(body);
			return new Response("OK", { status: 200 });
		} catch (error) {
			console.error("Error handling Telegram webhook:", error);
			return new Response("Error processing webhook", { status: 500 });
		}
	};
}

export async function checkInactiveUsers(env: Env) {
	if (!botInstance || !configuredGroupChatId) {
		console.error("Bot not initialized for checkInactiveUsers");
		return false;
	}

	const now = new Date();
	const inactiveThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
	const removeThreshold = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds
	const db = drizzle(env.DATABASE);
	const users = await db
		.select()
		.from(telegramMember)
		.where(sql`is_active = true`);

	const inactiveUsers = [];
	const toRemoveUsers = [];

	for (const member of users) {
		const inactiveTime = now.getTime() - member.lastActive.getTime();
		if (inactiveTime > removeThreshold) {
			toRemoveUsers.push(member);
		} else if (inactiveTime > inactiveThreshold) {
			inactiveUsers.push(member);
		}
	}

	// Send warning to inactive users
	if (inactiveUsers.length > 0) {
		const mentions = inactiveUsers
			.map((member) => `[${member.firstName}](tg://user?id=${member.id})`)
			.join(", ");
		await botInstance.telegram.sendMessage(
			configuredGroupChatId,
			`Hey ${mentions}, you have been inactive for over 30 days. Please be active or you may be removed.`,
			{ parse_mode: "Markdown" },
		);
	}

	// Remove users inactive for over 60 days
	for (const member of toRemoveUsers) {
		await botInstance.telegram.banChatMember(configuredGroupChatId, member.id);
		await botInstance.telegram.unbanChatMember(
			configuredGroupChatId,
			member.id,
		);
		await db
			.update(telegramMember)
			.set({ leftAt: new Date(), isActive: false })
			.where(sql`id = ${member.id}`);
	}

	return true;
}
