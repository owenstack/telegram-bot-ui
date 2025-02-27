import { Logo } from "../logo";
import { ModeToggle } from "../mode-toggle";
import { UserNav } from "./user-nav";

export function NavBar({
	data: { name, image },
}: { data: { name?: string; image?: string | null } }) {
	return (
		<header className="w-full flex items-center justify-between gap-4 px-4 py-2 sticky top-0 border-b z-20 backdrop-blur-sm">
			<Logo />
			<div className="flex items-center gap-1">
				<UserNav name={name} image={image} />
				{/* <ModeToggle /> */}
			</div>
		</header>
	);
}
