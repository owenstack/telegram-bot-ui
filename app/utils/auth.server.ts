import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "~/db/schema";

export const auth = (env: Env) => {
	return betterAuth({
		database: drizzleAdapter(drizzle(env.DATABASE), {
			provider: "sqlite",
			schema,
		}),
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
	});
};
