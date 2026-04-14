// src/pages/RegisterStudent.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerStudent } from "../api/student.api";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { kenyaData } from "../data/kenya";
import {
    User,
    Mail,
    CreditCard,
    Lock,
    Building2,
    BookOpen,
    Calendar,
    ArrowRight,
    Landmark
} from "lucide-react";
import axios from "axios";
import logo from "../images/logo.png";
import registerImage from "../images/register-image.jpg";
import Swal from "sweetalert2";

type StudentForm = {
    email: string;
    password: string;
    full_name: string;
    national_id: string;
    institution: string;
    education_level: string;
    course: string;
    year_of_study: number;
    school_bank_name: string;
    school_account_number: string;
    county: string;
    constituency: string;
};

export default function RegisterStudent() {
    const [form, setForm] = useState<StudentForm>({
        email: "",
        password: "",
        full_name: "",
        national_id: "",
        institution: "",
        education_level: "TERTIARY",
        course: "",
        year_of_study: 1,
        school_bank_name: "",
        school_account_number: "",
        county: "",
        constituency: ""
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
                    : value,
        }));
        
        // Reset constituency if county changes
        if (name === "county") {
            setForm(prev => ({ ...prev, constituency: "" }));
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await registerStudent(form);

            await Swal.fire({
                title: 'Account Created!',
                text: response.message || 'Your account has been registered successfully. Please verify your email.',
                icon: 'success',
                confirmButtonColor: '#2563EB'
            });

            navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
        } catch (err: unknown) {
            let errorMsg = "Registration failed";
            if (axios.isAxiosError(err)) {
                errorMsg = err.response?.data?.error || "Registration failed";
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }
            
            setError(errorMsg);
            
            Swal.fire({
                title: 'Registration Error',
                text: errorMsg,
                icon: 'error',
                confirmButtonColor: '#0052FF'
            });
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
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
                    <div className="w-full max-w-md space-y-8 animate-fade-in">
                        <div className="text-center lg:text-left">
                            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
                                <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-gray-100 overflow-hidden p-1">
                                    <img src={logo} alt="BursarHub" className="w-full h-full object-contain" />
                                </div>
                            </Link>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
                        </div>
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                                {String(error)}
                            </div>
                        )}

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

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Education Level</label>
                                    <select
                                        name="education_level"
                                        value={form.education_level}
                                        onChange={handleChange}
                                        className="block w-full rounded-xl border border-gray-200 shadow-sm py-2.5 px-3 sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white"
                                        required
                                    >
                                        <option value="PRIMARY">Primary School</option>
                                        <option value="SECONDARY">Secondary (High School)</option>
                                        <option value="TERTIARY">Tertiary (College/University)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className={form.education_level === "TERTIARY" ? "" : "md:col-span-2"}>
                                        <Input
                                            label="Institution"
                                            name="institution"
                                            placeholder={form.education_level === 'TERTIARY' ? "University of Nairobi" : "Prestige Academy"}
                                            value={form.institution}
                                            onChange={handleChange}
                                            required
                                            startIcon={<Building2 className="w-5 h-5" />}
                                        />
                                    </div>

                                    {form.education_level === "TERTIARY" && (
                                        <Input
                                            label="Course"
                                            name="course"
                                            placeholder="Computer Science"
                                            value={form.course}
                                            onChange={handleChange}
                                            required
                                            startIcon={<BookOpen className="w-5 h-5" />}
                                        />
                                    )}
                                </div>

                                <Input
                                    label={form.education_level === 'PRIMARY' ? 'Grade' : form.education_level === 'SECONDARY' ? 'Form' : 'Year of Study'}
                                    type="number"
                                    name="year_of_study"
                                    min={1}
                                    max={form.education_level === 'PRIMARY' ? 8 : form.education_level === 'SECONDARY' ? 4 : 6}
                                    value={form.year_of_study}
                                    onChange={handleChange}
                                    required
                                    startIcon={<Calendar className="w-5 h-5" />}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
                                    <Input
                                        label="School Bank Name"
                                        name="school_bank_name"
                                        placeholder="e.g. Equity Bank"
                                        value={form.school_bank_name}
                                        onChange={handleChange}
                                        required
                                        startIcon={<Landmark className="w-5 h-5" />}
                                    />
                                    <Input
                                        label="School Account Number"
                                        name="school_account_number"
                                        placeholder="e.g. 1100223344"
                                        value={form.school_account_number}
                                        onChange={handleChange}
                                        required
                                        startIcon={<CreditCard className="w-5 h-5" />}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-gray-100">
                                    <div className="space-y-1.5 text-left">
                                        <label className="block text-sm font-medium text-gray-700 text-left">County</label>
                                        <select
                                            name="county"
                                            value={form.county}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-gray-200 shadow-sm py-2.5 px-3 sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white"
                                            required
                                        >
                                            <option value="">Select County</option>
                                            {kenyaData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 text-left">
                                        <label className="block text-sm font-medium text-gray-700 text-left">Constituency</label>
                                        <select
                                            name="constituency"
                                            value={form.constituency}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-gray-200 shadow-sm py-2.5 px-3 sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 bg-white"
                                            disabled={!form.county}
                                            required
                                        >
                                            <option value="">Select Constituency</option>
                                            {kenyaData.find(c => c.name === form.county)?.constituencies.map(con => (
                                                <option key={con} value={con}>{con}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

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
                                <div className="bg-zinc-50 border-l-4 border-primary p-4 rounded-r-lg animate-slide-up">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <p className="text-sm text-black font-medium">{error}</p>
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

                        </form>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/auth/login" className="font-semibold text-primary hover:text-primary-light hover:underline transition-all">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
