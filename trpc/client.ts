import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./router";

export const client = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "http://localhost:8787/trpc",
		}),
	],
});

console.log(await client.hello.query("Hono"));
