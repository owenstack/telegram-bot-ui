import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react

const authClient = createAuthClient({
	baseURL: "http://localhost:8787",
});

export const { signIn, signUp, useSession } = authClient;
