import { useState } from "react";
import { login } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import loginImage from "../images/login-image.jpg";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await login(email, password);
            loginUser(res.token, res.user);

            if (res.user.role === "ADMIN") navigate("/admin");
            else navigate("/student");
        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Navbar />
            <div className="flex-1 flex">
                {/* Left Side - Image */}
                <div
                    className="hidden lg:block w-1/2 bg-cover bg-center bg-no-repeat relative"
                    style={{ backgroundImage: `url(${loginImage})` }}
                >
                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                    <div className="w-full max-w-md space-y-8 animate-fade-in">
                        <div className="text-center lg:text-left mb-8">
                            <div className="flex justify-center lg:justify-start mb-6">
                                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-sm">E E</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-extrabold text-text">
                                Sign in to your account
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Or{' '}
                                <Link to="/register-student" className="font-medium text-primary hover:text-primary/80">
                                    create a new student account
                                </Link>
                            </p>
                        </div>

                        <Card className="py-8 px-4 sm:px-10 shadow-xl border border-gray-100">
                            <form className="space-y-6" onSubmit={submit}>
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Input
                                    label="Email address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <Link to="/auth/forgot-password" className="font-medium text-primary hover:text-primary/80">
                                            Forgot your password?
                                        </Link>
                                    </div>
                                </div>

                                <div>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        isLoading={isLoading}
                                        variant="primary"
                                        className="h-12 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                    >
                                        Sign in
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
