import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
	Card,
	CardHeader,
	CardContent,
	CardDescription,
	CardTitle,
} from "~/components/ui/card";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Telegraf } from "telegraf";

export async function action({ context, request }: ActionFunctionArgs) {
	const { env } = context.cloudflare;
	const bot = new Telegraf(env.TELEGRAM_BOT_KEY);
	try {
		const form = new URLSearchParams(await request.text());
		const message = form.get("message") as string;

		if (!message?.trim()) {
			return { error: "Message cannot be empty" };
		}

		await bot.telegram.sendMessage(env.SUPER_GROUP_CHAT_ID, message);
		return { success: true };
	} catch (error) {
		console.error(error);
		return {
			error: error instanceof Error ? error.message : "Internal server error",
		};
	}
}
export default function Dashboard() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const [showFeedback, setShowFeedback] = useState(false);

	const isSubmitting = navigation.state === "submitting";

	useEffect(() => {
		if (actionData) {
			setShowFeedback(true);
			const timer = setTimeout(() => setShowFeedback(false), 5000);
			return () => clearTimeout(timer);
		}
	}, [actionData]);

	if (showFeedback && actionData) {
		if (actionData.success) {
			toast.success("Message sent successfully");
		} else {
			toast.error(actionData.error);
		}
	}

	return (
		<section className="flex flex-col h-[calc(100vh-150px)] items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Message the group</CardTitle>
					<CardDescription>
						Type a message here and it will be sent by the bot to the group
						chat.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form method="post" className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="message">Group message</Label>
							<Input
								id="message"
								name="message"
								placeholder="Type your message here"
								required
								disabled={isSubmitting}
							/>
						</div>
						<Button type="submit" disabled={isSubmitting} className="w-full">
							{isSubmitting ? "Sending..." : "Send message"}
						</Button>
					</Form>
				</CardContent>
			</Card>
		</section>
	);
}
