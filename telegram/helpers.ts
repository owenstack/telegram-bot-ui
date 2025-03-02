import type { Context } from "telegraf";

export async function isAdmin(ctx: Context): Promise<boolean> {
	if (!ctx.from || ctx.chat?.type === "private") return false;

	try {
		const chatMember = await ctx.telegram.getChatMember(
			ctx.chat?.id as number,
			ctx.from.id,
		);

		return ["creator", "administrator"].includes(chatMember.status);
	} catch (error) {
		console.error("Error checking admin status:", error);
		return false;
	}
}
