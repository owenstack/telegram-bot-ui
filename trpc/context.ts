import type { HonoRequest } from "hono";

export function createContext({ req, env }: { req: HonoRequest; env: Env }) {
	return { req, env };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
