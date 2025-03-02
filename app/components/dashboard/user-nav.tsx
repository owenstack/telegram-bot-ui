import { Link } from "@remix-run/react";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { signOut } from "~/utils/auth.client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { buttonVariants } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function UserNav({
	name,
	image,
}: { name?: string; image?: string | null }) {
	const [loading, setLoading] = useState(false);
	const logOut = async () => {
		setLoading(true);
		try {
			await signOut();
			toast.success("Logged out successfully");
		} catch (error) {
			toast.error("Something went wrong", {
				description:
					error instanceof Error ? error.message : "Internal server error",
			});
		} finally {
			setLoading(false);
		}
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar>
					<AvatarImage src={image ?? ""} alt={name} />
					<AvatarFallback>{name?.charAt(0)}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>{name}</DropdownMenuLabel>
				<DropdownMenuItem>
					<Link to="/dashboard/profile">Profile</Link>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Link to="/dashboard/settings">Settings</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
					onClick={logOut}
					disabled={loading}
				>
					{loading ? <Loader className="size-4 animate-spin" /> : "Log out"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
