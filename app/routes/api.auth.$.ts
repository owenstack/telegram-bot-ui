import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { auth } from "~/utils/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
	return auth(context.cloudflare.env).handler(request);
}

export async function action({ request, context }: ActionFunctionArgs) {
	return auth(context.cloudflare.env).handler(request);
}
