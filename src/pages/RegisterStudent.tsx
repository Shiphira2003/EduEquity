// src/pages/RegisterStudent.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerStudent } from "../api/student.api";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { API_CONFIG } from "../constants";
import {
    User,
    Mail,
    CreditCard,
    Lock,
    Building2,
    BookOpen,
    Calendar,
    ArrowRight
} from "lucide-react";
import axios from "axios";
import registerImage from "../images/register-image.jpg";

type StudentForm = {
    email: string;
    password: string;
    full_name: string;
    national_id: string;
    institution: string;
    course: string;
    year_of_study: number;
};

export default function RegisterStudent() {
    const [form, setForm] = useState<StudentForm>({
        email: "",
        password: "",
        full_name: "",
        national_id: "",
        institution: "",
        course: "",
        year_of_study: 1,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "year_of_study"
                    ? Number(value)
                    : value, // convert year_of_study to number
        }));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await registerStudent(form);

            // Store the JWT token if returned
            if (response.token) {
                localStorage.setItem(API_CONFIG.TOKEN_KEY, response.token);
            }

            // Redirect based on role
            if (response.user?.role === "ADMIN") {
                navigate("/admin"); // first user → admin dashboard
            } else {
                navigate("/auth/login"); // students → login page
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Registration failed");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Navbar />
            <div className="flex-1 flex">
                {/* Left Side - Image */}
                <div
                    className="hidden lg:block w-1/2 bg-cover bg-center bg-no-repeat relative border-r border-gray-200"
                    style={{ backgroundImage: `url(${registerImage})` }}
                >
                    <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
                    <div className="w-full max-w-md space-y-8 animate-fade-in">
                        <div className="text-center lg:text-left">
                            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-sm">E E</span>
                                </div>
                            </Link>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
                            <p className="mt-2 text-gray-600">
                                Already have an account?{' '}
                                <Link to="/auth/login" className="font-medium text-primary hover:text-primary-light transition-colors">
                                    Sign in here
                                </Link>
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={submit}>
                            <div className="space-y-5">
                                <Input
                                    label="Full Name"
                                    name="full_name"
                                    placeholder="Shiphira Wamaitha"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    required
                                    startIcon={<User className="w-5 h-5" />}
                                />

                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    placeholder="shiphira@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    startIcon={<Mail className="w-5 h-5" />}
                                />

                                <Input
                                    label="National ID / Birth Cert No."
                                    name="national_id"
                                    placeholder="12345678"
                                    value={form.national_id}
                                    onChange={handleChange}
                                    required
                                    startIcon={<CreditCard className="w-5 h-5" />}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="Institution"
                                        name="institution"
                                        placeholder="University of Nairobi"
                                        value={form.institution}
                                        onChange={handleChange}
                                        required
                                        startIcon={<Building2 className="w-5 h-5" />}
                                    />

                                    <Input
                                        label="Course"
                                        name="course"
                                        placeholder="Computer Science"
                                        value={form.course}
                                        onChange={handleChange}
                                        required
                                        startIcon={<BookOpen className="w-5 h-5" />}
                                    />
                                </div>

                                <Input
                                    label="Year of Study"
                                    type="number"
                                    name="year_of_study"
                                    min={1}
                                    max={6}
                                    value={form.year_of_study}
                                    onChange={handleChange}
                                    required
                                    startIcon={<Calendar className="w-5 h-5" />}
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    startIcon={<Lock className="w-5 h-5" />}
                                    helperText="Must be at least 8 characters long"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-slide-up">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700 font-medium">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    fullWidth
                                    isLoading={loading}
                                    variant="primary"
                                    className="h-12 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Create Account
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </Button>
                            </div>

                            <p className="text-xs text-center text-gray-500">
                                By registering, you agree to our{' '}
                                <Link to="#" className="underline hover:text-primary">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="#" className="underline hover:text-primary">Privacy Policy</Link>
                            </p>

                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{' '}
                                    <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-light hover:underline transition-all">
                                        Log in here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
