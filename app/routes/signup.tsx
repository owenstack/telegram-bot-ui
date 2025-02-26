import { Label } from "@radix-ui/react-label";
import { Form, Link, useNavigate } from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { GoogleSignIn } from "~/components/auth/google";
import { signUp } from "~/utils/auth.client";
import { useState, useTransition } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export default function SignUp() {
	const [pending, startTransition] = useTransition();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const submit = () => {
		startTransition(() => {
			async () => {
				try {
					await signUp.email(
						{ name, email, password },
						{
							onError: (ctx) => {
								toast.error(ctx.error.message);
							},
							onSuccess: () => {
								toast.success("Signed up successfully");
								navigate("/dashboard");
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
		});
	};
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<Logo />
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<div className="flex flex-col gap-6">
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">Sign up to continue</h1>
								<p className="text-muted-foreground text-sm text-balance">
									Enter your details below to create a new account
								</p>
							</div>
							<Form onSubmit={submit} className="grid gap-4">
								<div className="grid gap-2">
									<Label htmlFor="name">Full name</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Lee A"
										autoComplete="name"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										autoComplete="email"
										placeholder="m@example.com"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
								<Button type="submit" className="w-full" disabled={pending}>
									{pending ? <Loader className="animate-spin" /> : "Sign up"}
								</Button>
							</Form>
							<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
								<span className="bg-background text-muted-foreground relative z-10 px-2">
									Or continue with
								</span>
							</div>
							<GoogleSignIn />
							<div className="text-center text-sm">
								Already have an account?{" "}
								<Link to="/login" className="underline underline-offset-4">
									Log in
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<img
					src="/house.jpg"
					alt="placeholder"
					className="absolute inset-o h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}
