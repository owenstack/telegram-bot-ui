import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { createContext } from "trpc/context";
import { appRouter } from "trpc/router";
import { auth } from "~/utils/auth.server";
import { createBotHandler } from "../telegram/handler";
import { createCloudflareContext, setupRemixHandler } from "./handlers";

const app = new Hono<{ Bindings: Env }>();

app.get("/hello", (c) => {
	return c.text("Hello World");
});

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
	}),
);

app.use("/api/bot", async (c) => {
	const botHandler = createBotHandler(c.env);
	return botHandler(c);
});

app.all("*", async (c) => {
	try {
		const handleRemixRequest = setupRemixHandler();
		const loadContext = createCloudflareContext(
			c.req.raw,
			c.env,
			c.executionCtx as ExecutionContext,
		);
		const response = await handleRemixRequest(c.req.raw, loadContext);

		return response;
	} catch (error) {
		console.error(error);
		return new Response("An unexpected error occurred", { status: 500 });
	}
});

export default app;
