import { useLoaderData, Outlet } from "@remix-run/react";
import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { auth } from "~/utils/auth.server";
import { Sidebar } from "~/components/dashboard/side-bar";
import { NavBar } from "~/components/dashboard/nav-bar";

export async function loader({ context, request }: LoaderFunctionArgs) {
	const { env } = context.cloudflare;
	const authz = await auth(env).api.getSession({ headers: request.headers });
	if (!authz?.user) {
		redirect("/login");
	}
	return { data: { name: authz?.user.name, image: authz?.user.image } };
}

export default function Admin() {
	const { data } = useLoaderData<typeof loader>();
	return (
		<div className="flex gap-[2%] flex-wrap content-start h-screen">
			<NavBar data={data} />
			<Sidebar />
			<div className="grow h-[90%]">
				<Outlet />
			</div>
		</div>
	);
}
