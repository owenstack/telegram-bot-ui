import { Link } from "@remix-run/react";
import { useLocation } from "@remix-run/react";
import {
	History,
	LayoutDashboard,
	type LucideIcon,
	Settings2,
	User2,
	X,
} from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

interface LinkItems {
	name: string;
	href: string;
	icon: LucideIcon;
}

const links: LinkItems[] = [
	{
		name: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		name: "History",
		href: "/dashboard/history",
		icon: History,
	},
	{
		name: "Profile",
		href: "/dashboard/profile",
		icon: User2,
	},
	{
		name: "Settings",
		href: "/dashboard/settings",
		icon: Settings2,
	},
];

export function Sidebar({
	open,
	setOpen,
}: { open: boolean; setOpen: (open: boolean) => void }) {
	const pathname = useLocation().pathname;

	const NavigationLinks = () => (
		<ul className="space-y-1">
			{links.map(({ name, href, icon: Icon }) => (
				<li key={name}>
					<Link
						to={href}
						onClick={() => setOpen(false)}
						className={buttonVariants({
							variant: pathname === href ? "secondary" : "ghost",
							className: "w-full justify-start",
						})}
					>
						<Icon className="mr-2 h-4 w-4" />
						<span>{name}</span>
					</Link>
				</li>
			))}
		</ul>
	);

	return (
		<>
			{/* Desktop sidebar */}
			<aside className="hidden md:block w-64 border-r bg-background h-full overflow-y-auto">
				<nav className="p-4 space-y-2">
					<NavigationLinks />
				</nav>
			</aside>

			{/* Mobile sidebar */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetContent side="left" className="w-[240px] sm:w-[300px]">
					<SheetHeader>
						<SheetTitle>Navigation</SheetTitle>
					</SheetHeader>
					<nav className="space-y-2">
						<NavigationLinks />
					</nav>
				</SheetContent>
			</Sheet>
		</>
	);
}
