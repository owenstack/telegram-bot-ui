import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { NavBar } from "~/components/dashboard/nav-bar";
import { Sidebar } from "~/components/dashboard/side-bar";
import { auth } from "~/utils/auth.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
	const { env } = context.cloudflare;
	const authz = await auth(env).api.getSession({ headers: request.headers });
	if (!authz?.user) {
		return redirect("/login");
	}
	return { data: { name: authz?.user.name, image: authz?.user.image } };
}

export default function Admin() {
	const { data } = useLoaderData<typeof loader>();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="flex flex-col h-screen bg-background">
			<NavBar
				data={data}
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
			/>
			<div className="flex flex-1 overflow-hidden">
				<Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
				<main className="flex-1 overflow-y-auto p-4">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
