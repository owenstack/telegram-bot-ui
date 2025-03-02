import { checkInactiveUsers } from "telegram/handler";
import app from "./server";

export default {
	async scheduled(env: Env) {
		await checkInactiveUsers(env);
	},

	async fetch(request: Request, env: Env) {
		return app.fetch(request, env);
	},
};
