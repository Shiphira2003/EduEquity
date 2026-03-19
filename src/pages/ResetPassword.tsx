import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth.api";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Lock } from "lucide-react";
import { Card } from "../components/Card";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (!token) {
            setMessage({ type: 'error', text: "Invalid or missing reset token." });
        }
    }, [token]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match" });
            return;
        }

        if (password.length < 8) {
            setMessage({ type: 'error', text: "Password must be at least 8 characters" });
            return;
        }

        if (!token) return;

        setIsLoading(true);
        setMessage(null);

        try {
            await resetPassword(token, password);
            setMessage({
                type: 'success',
                text: "Password reset successfully! Redirecting to login..."
            });
            setTimeout(() => navigate("/auth/login"), 2000);
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || "Failed to reset password. Token may be expired."
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12">
                <div className="bg-red-50 p-4 rounded text-red-700">
                    Invalid or missing reset token. Please request a new link.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">E E</span>
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-text">
                    Set new password
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card className="py-8 px-4 sm:px-10">
                    <form className="space-y-6" onSubmit={submit}>
                        {message && (
                            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}

                        <Input
                            label="New Password"
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            startIcon={<Lock className="w-5 h-5" />}
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            startIcon={<Lock className="w-5 h-5" />}
                        />

                        <div>
                            <Button
                                type="submit"
                                fullWidth
                                isLoading={isLoading}
                                variant="primary"
                            >
                                Reset Password
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
