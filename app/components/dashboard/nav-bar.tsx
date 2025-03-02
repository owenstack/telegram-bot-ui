import { Menu } from "lucide-react";
import { Logo } from "../logo";
import { ModeToggle } from "../mode-toggle";
import { Button } from "../ui/button";
import { UserNav } from "./user-nav";

interface NavBarProps {
	data: {
		name?: string;
		image?: string | null;
	};
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

export function NavBar({
	data: { name, image },
	sidebarOpen,
	setSidebarOpen,
}: NavBarProps) {
	return (
		<header className="w-full flex items-center justify-between gap-4 px-4 py-2 sticky top-0 border-b z-30 backdrop-blur-sm bg-background/90">
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					onClick={() => setSidebarOpen(!sidebarOpen)}
				>
					<Menu className="h-5 w-5" />
				</Button>
				<Logo />
			</div>
			<div className="flex items-center gap-2">
				<ModeToggle />
				<UserNav name={name} image={image} />
			</div>
		</header>
	);
}
