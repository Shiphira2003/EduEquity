import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.api";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Mail, ArrowLeft } from "lucide-react";
import logo from "../images/logo.png";
import { Card } from "../components/Card";
import Swal from "sweetalert2";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            await forgotPassword(email);
            const successMsg = "If an account exists with that email, we've sent a password reset link.";
            setMessage({
                type: 'success',
                text: successMsg
            });
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000,
                icon: 'success',
                title: "Email Sent",
                text: successMsg
            });
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "An error occurred. Please try again.";
            setMessage({
                type: 'error',
                text: errorMsg
            });
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
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="h-14 w-14 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100 overflow-hidden p-1">
                        <img src={logo} alt="BursarHub" className="w-full h-full object-contain" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-black">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-8 px-4 sm:px-10">
                    <form className="space-y-6" onSubmit={submit}>
                        {message && (
                            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-zinc-50 border border-primary text-black' : 'bg-red-50 text-red-700'}`}>
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}

                        <Input
                            label="Email address"
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            startIcon={<Mail className="w-5 h-5" />}
                        />

                        <div>
                            <Button
                                type="submit"
                                fullWidth
                                isLoading={isLoading}
                                variant="primary"
                            >
                                Send Reset Link
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/auth/login" className="flex items-center justify-center text-sm font-medium text-primary hover:text-primary/80">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to sign in
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
