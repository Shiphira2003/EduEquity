import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyOTP, resendOTP } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";
import Swal from "sweetalert2";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";
    const navigate = useNavigate();
    const { loginUser } = useAuth();

    const [otp, setOtp] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate("/auth/login");
        }
    }, [email, navigate]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await verifyOTP(email, otp);
            
            if (res.accessToken) {
                loginUser(res.accessToken, res.user);
            }

            await Swal.fire({
                title: "Email Verified!",
                text: "Your account is now active. Welcome to BursarHub.",
                icon: "success",
                confirmButtonColor: "#2563EB",
            });

            if (res.user?.role === "ADMIN" || res.user?.role === "SUPER_ADMIN") {
                navigate("/admin");
            } else {
                navigate("/student"); // Automatically go to dashboard
            }
        } catch (err: any) {
            Swal.fire({
                title: "Verification Failed",
                text: err.response?.data?.message || "Invalid OTP code. Please try again.",
                icon: "error",
                confirmButtonColor: "#2563EB",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            const res = await resendOTP(email);
            Swal.fire({
                title: "OTP Sent",
                text: res.message || "A new 6-digit verification code has been sent to your email.",
                icon: "success",
                confirmButtonColor: "#2563EB",
            });
        } catch (err: any) {
            Swal.fire({
                title: "Error",
                text: err.response?.data?.message || "Failed to resend OTP.",
                icon: "error",
            });
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-zinc-100">
                    <h2 className="text-3xl font-bold text-black text-center mb-2">Verify Your Email</h2>
                    <p className="text-gray-600 text-center mb-6">
                        We sent a 6-digit confirmation code to <strong>{email}</strong>.
                    </p>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                className="w-full text-center text-4xl tracking-[0.5em] font-bold py-5 border border-zinc-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner bg-zinc-50/50"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={loading}
                            variant="primary"
                            className="h-12 text-base font-semibold"
                            disabled={otp.length !== 6}
                        >
                            Verify Email
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Didn't receive the code?{" "}
                            <button 
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="font-semibold text-primary hover:text-primary-light transition-colors disabled:opacity-50"
                            >
                                {resendLoading ? "Sending..." : "Resend"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
