import { cn } from "~/lib/utils";
import { GalleryVerticalEnd } from "lucide-react";
import { Link } from "@remix-run/react";

export function Logo({ className }: { className?: string }) {
	return (
		<Link
			to="/"
			className={cn("flex items-center gap-2 font-medium", className)}
		>
			<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
				<GalleryVerticalEnd className="size-4" />
			</div>
			Acme Inc.
		</Link>
	);
}
