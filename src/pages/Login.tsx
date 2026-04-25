import { useState } from "react";
import { login } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import logo from "../images/logo.png";
import loginImage from "../images/login-image.jpg";
import Swal from "sweetalert2";
import { User, ShieldCheck, ArrowRight, Mail, Lock } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { loginUser } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

    const location = useLocation();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await login(email, password);
            loginUser(res.accessToken, res.user);

            const firstName = res.user?.fullName ? res.user.fullName.split(' ')[0] : 'User';
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true,
                icon: 'success',
                title: `Welcome back, ${firstName}!`,
                background: '#ffffff',
                color: '#09090B',
                iconColor: '#2563EB',
                customClass: {
                    popup: 'rounded-xl border border-zinc-100 shadow-xl'
                }
            });

            const isAdmin = res.user.role === "ADMIN" || res.user.role === "SUPER_ADMIN";
            const redirectTo = location.state?.from || (isAdmin ? "/admin" : "/student");
            navigate(redirectTo);
        } catch (err: any) {
            let errorMsg = "Invalid email or password";
            
            // Handle specific 403 Forbidden errors from the backend
            if (err.response?.status === 403) {
                errorMsg = err.response.data?.message || "Account not verified or unauthorized.";
            }

            setError(errorMsg);
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000,
                icon: 'error',
                title: errorMsg
            });
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
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                    <div className="w-full max-w-md space-y-8 animate-fade-in">
                        <div className="text-center lg:text-left mb-8">
                            <div className="flex justify-center lg:justify-start mb-6">
                                <div className="h-14 w-14 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100 overflow-hidden p-1">
                                    <img src={logo} alt="BursarHub" className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-extrabold text-black tracking-tight">
                                {selectedRole === 'STUDENT' ? 'Student Portal' : 'Admin Nexus'}
                            </h2>
                            <p className="mt-2 text-zinc-500 font-medium">Please enter your credentials to gain access.</p>
                        </div>

                        {/* Role Selector */}
                        <div className="flex p-1.5 bg-gray-100/80 rounded-2xl mb-8 border border-gray-200/50">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('STUDENT')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                                    selectedRole === 'STUDENT'
                                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'
                                }`}
                            >
                                <User className={`w-4 h-4 ${selectedRole === 'STUDENT' ? 'text-primary' : 'text-zinc-400'}`} />
                                Student Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole('ADMIN')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                                    selectedRole === 'ADMIN'
                                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                                        : 'text-zinc-500 hover:text-zinc-700 hover:bg-white/50'
                                }`}
                            >
                                <ShieldCheck className={`w-4 h-4 ${selectedRole === 'ADMIN' ? 'text-primary' : 'text-zinc-400'}`} />
                                Administrative
                            </button>
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
                                        className="h-14 text-base font-bold shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all rounded-2xl flex items-center justify-center gap-3"
                                    >
                                        Log In as {selectedRole === 'STUDENT' ? 'Student' : 'Admin'}
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="text-center mt-6">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link to="/register-student" className="font-medium text-primary hover:text-primary/80">
                                            Create a new student account
                                        </Link>
                                    </p>
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
