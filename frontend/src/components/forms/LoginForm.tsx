import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormType } from "@/schemas/auth";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useState, useTransition } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookIllustration from "@/assets/undraw_books_wxzz.svg";
import { Checkbox } from "@/components/ui/checkbox";

export const LoginPage = () => {
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition()
    const [isAdmin, setIsAdmin] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const form = useForm<LoginFormType>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (values: LoginFormType) => {
        setError("");
        setSuccess("")
        startTransition(async () => {
            const data = await login(values, isAdmin);
            if (data.error) {
                setError(data.error);
            }
            if (data.success) {
                setSuccess(data.success);
                form.reset();
                navigate('/dashboard');
            }
        })
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - gradient + illustration */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center relative">
                <h1 className="text-white text-4xl font-bold absolute top-10 left-10">
                    Welcome Back to BookHub!
                </h1>
                <img
                    src={BookIllustration}
                    alt="Login Illustration"
                    className="w-64 h-64 object-contain z-10"
                />
                <div className="absolute inset-0 bg-purple-900/20 backdrop-blur-sm rounded-l-3xl -z-10"></div>
            </div>

            {/* Right side - form */}
            <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-10 shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                        Login
                    </h2>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Email</Label>
                                        <Input placeholder="Email" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Password</Label>
                                        <Input type="password" placeholder="Password" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            {success && <p className="text-green-500 text-sm">{success}</p>}

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isAdmin"
                                    checked={isAdmin}
                                    onCheckedChange={(checked) => setIsAdmin(!!checked)}
                                />
                                <Label htmlFor="isAdmin" className="text-sm text-gray-700">
                                    Login as admin
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
                            >
                                {isPending ? "Logging in..." : "Login to BookHub"}
                            </Button>
                        </form>
                    </Form>

                    <p className="mt-4 text-center text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/register"
                            className="text-indigo-600 hover:underline font-medium"
                        >
                            Join BookHub
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
