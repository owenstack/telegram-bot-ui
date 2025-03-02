import Google from "assets/icons/google";
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { signIn } from "~/utils/auth.client";
import { Button } from "../ui/button";

export function GoogleSignIn() {
	const [loading, setLoading] = useState(false);
	const googleSignIn = async () => {
		setLoading(true);
		try {
			await signIn.social(
				{ provider: "google", callbackURL: "/" },
				{
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
					onSuccess: () => {
						toast.success("Signed in successfully");
					},
				},
			);
		} catch (error) {
			toast.error("Something went wrong", {
				description:
					error instanceof Error ? error.message : "Internal server error",
			});
		}
	};
	return (
		<Button
			variant={"outline"}
			disabled={loading}
			onClick={googleSignIn}
			className="w-full mt-2"
		>
			{loading ? (
				<Loader className="animate-spin" />
			) : (
				<span className="flex items-center gap-1">
					<Google />
					<span>Continue with Google</span>
				</span>
			)}
		</Button>
	);
}
