import { Hono } from "hono";
import { auth } from "~/utils/auth.server";
import { createCloudflareContext, setupRemixHandler } from "~/utils/handlers";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "trpc/router";
import { createContext } from "trpc/context";

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
