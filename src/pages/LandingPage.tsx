import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Carousel from '../components/Carousel';
import { Footer } from '../components/Footer';
import {
    GraduationCap,
    FileText,
    CreditCard,
    ArrowRight,
    CheckCircle2,
    Users,
    Building2
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const { user } = useAuth();
    const dashboardLink = user?.role === 'ADMIN' ? '/admin' : '/student/dashboard';
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Navbar */}
            <nav className="bg-surface/80 backdrop-blur-md sticky top-0 border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                    <span className="text-white font-bold text-xl">E E</span>
                                </div>
                                <span className="font-bold text-xl text-primary tracking-tight">EduEquity</span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-text-light hover:text-primary text-sm font-medium transition-colors">
                                Home
                            </Link>
                            <Link to="/about" className="text-text-light hover:text-primary text-sm font-medium transition-colors">
                                About
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <Link to={dashboardLink} className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/auth/login" className="text-text-light hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register-student" className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex-grow flex items-center justify-center relative overflow-hidden pt-10 pb-20">
                {/* Background Decor */}
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
                <div className="absolute top-20 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-action/5 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16 relative z-10 w-full">
                    <div className="md:w-1/2 text-center md:text-left space-y-8 animate-fade-in">
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-primary shadow-sm border border-gray-100">
                            <span className="w-2 h-2 rounded-full bg-action animate-pulse"></span>
                            Applications Open for 2026
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-primary leading-[1.1] tracking-tight">
                            Your Education, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                                Fully Funded.
                            </span>
                        </h1>

                        <p className="text-xl text-text-light max-w-lg mx-auto md:mx-0 leading-relaxed">
                            Secure your future with county bursaries and scholarships. A streamlined digital gateway connecting students to financial freedom.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                            {user ? (
                                <Link to={dashboardLink} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-action hover:bg-action-hover text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                                    Go to Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register-student" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-action hover:bg-action-hover text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                                        Apply Now
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link to="/auth/login" className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-text font-medium border border-gray-200 rounded-xl shadow-sm hover:shadow transition-all">
                                        Admin Portal
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="pt-8 flex items-center justify-center md:justify-start gap-8 text-sm text-text-light font-medium">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-action" />
                                <span>Fast Process</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-action" />
                                <span>Secure Data</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-action" />
                                <span>Direct Deposits</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Visual - Carousel */}
                    <div className="md:w-1/2 w-full relative animate-slide-up" style={{ animationDelay: '0.2s', paddingBottom: '80px' }}>
                        <Carousel />
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Students Funded", value: "12k+", icon: Users },
                            { label: "Total Disbursed", value: "KES 500M+", icon: CreditCard },
                            { label: "Institutions", value: "150+", icon: Building2 },
                            { label: "Success Rate", value: "98%", icon: CheckCircle2 },
                        ].map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-4 justify-center md:justify-start">
                                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                                    <p className="text-sm text-text-light">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-background py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">How It Works</h2>
                        <p className="text-lg text-text-light">
                            We've simplified the process to get you the funding you need. Three simple steps to secure your education.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Create Account",
                                desc: "Register in minutes using your National ID or Student credentials. Secure and simple.",
                                icon: Users,
                                link: "/register-student"
                            },
                            {
                                title: "Submit Application",
                                desc: "Fill out the digitized form and upload required documents. No more long queues.",
                                icon: FileText,
                                link: "/student/apply"
                            },
                            {
                                title: "Get Funded",
                                desc: "Receive funds directly to your institution account upon approval. Real-time notifications.",
                                icon: GraduationCap,
                                link: "/student/dashboard"
                            },
                        ].map((feature, idx) => (
                            <Link to={feature.link} key={idx} className="bg-surface p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group block cursor-pointer hover:-translate-y-1">
                                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                                <p className="text-text-light leading-relaxed">{feature.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-action/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Secure Your Future?</h2>
                        <p className="text-lg text-blue-100">
                            Join thousands of students who have already benefited from the  EduEquity System.
                        </p>
                        <div className="flex justify-center gap-4">
                            {user ? (
                                <Link to={dashboardLink} className="px-8 py-3 bg-action hover:bg-action-hover text-white font-semibold rounded-xl shadow-lg transition-colors">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link to="/register-student" className="px-8 py-3 bg-action hover:bg-action-hover text-white font-semibold rounded-xl shadow-lg transition-colors">
                                    Create Account
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default LandingPage;
