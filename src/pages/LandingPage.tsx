import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { Footer } from '../components/Footer';
import Carousel from '../components/Carousel';
import {
    FileText,
    CreditCard,
    ArrowRight,
    CheckCircle2,
    Users,
    Building2,
    Search,
    BarChart2,
    ChevronRight,
} from 'lucide-react';
import logo from '../images/logo.png';
import api from '../api/axios';
import Swal from 'sweetalert2';

const LandingPage: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const dashboardLink = isAdmin ? '/admin' : '/student/dashboard';

    const handleShowOpenApplications = async () => {
        try {
            Swal.fire({
                title: 'Fetching Open Cycles...',
                html: 'Finding active bursaries for 2026',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const res = await api.get('/fund-sources/open');
            const openCycles = res.data?.data || [];
            
            if (openCycles.length === 0) {
                Swal.fire({
                    title: 'Applications Closed',
                    text: 'There are currently no open application cycles. Please check back later.',
                    icon: 'info',
                    confirmButtonColor: '#2563EB'
                });
                return;
            }

            const filteredCycles = openCycles; 

            const cyclesHtml = filteredCycles.map((c: any) => `
                <div class="text-left p-4 mb-3 border border-gray-100 rounded-xl bg-gray-50 hover:border-blue-200 transition-all group">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-bold text-gray-900">${c.name}</h4>
                        <span class="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-1 rounded-md">2026 Cycle</span>
                    </div>
                    <p class="text-xs text-gray-500 mb-3">${c.description || 'General bursary funding for eligible students.'}</p>
                    <div class="flex items-center gap-4 text-[11px] text-gray-600 font-medium">
                        <div class="flex items-center gap-1">
                            <span class="text-gray-400">📅 Opens:</span> ${c.start_date ? new Date(c.start_date).toLocaleDateString() : 'Now Open'}
                        </div>
                        <div class="flex items-center gap-1">
                            <span class="text-gray-400">🛑 Closes:</span> ${c.end_date ? new Date(c.end_date).toLocaleDateString() : 'until filled'}
                        </div>
                    </div>
                </div>
            `).join('');

            Swal.fire({
                title: '<span class="text-2xl font-black">Active 2026 Bursaries</span>',
                html: `
                    <div class="mt-4 max-h-[400px] overflow-y-auto px-1">
                        ${cyclesHtml}
                    </div>
                    <p class="mt-4 text-xs text-gray-400 font-medium">Click "Apply / Register" to begin your application</p>
                `,
                showCloseButton: true,
                showConfirmButton: false,
                width: '500px',
                customClass: {
                    container: 'swal2-modern',
                }
            });
        } catch (err) {
            console.error('Failed to fetch open cycles:', err);
            Swal.fire('Error', 'Unable to fetch open applications at this time.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Navbar */}
            <nav className="bg-surface/80 backdrop-blur-md sticky top-0 border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                                    <img src={logo} alt="BursarHub Logo" className="w-full h-full object-contain p-1" />
                                </div>
                                <span className="font-bold text-xl text-primary tracking-tight">BursarHub</span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-text-light hover:text-primary text-sm font-medium transition-colors">Home</Link>
                            <Link to="/about" className="text-text-light hover:text-primary text-sm font-medium transition-colors">About</Link>
                            <Link to="/public-ledger" className="text-text-light hover:text-primary text-sm font-medium transition-colors">Public Ledger</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    {user.role === 'STUDENT' && (
                                        <Link to="/student/apply" className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">Apply Now</Link>
                                    )}
                                    <Link to={dashboardLink} className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">Dashboard</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth/login" className="text-text-light hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors">Login</Link>
                                    <Link to="/register-student" className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg">Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - 50/50 Split for High Contrast Visibility */}
            <div className="bg-white overflow-hidden border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 text-center lg:text-left space-y-8 animate-fade-in">
                            <button onClick={handleShowOpenApplications} className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm font-semibold text-primary border border-blue-100 hover:bg-blue-100 transition-all group">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                Applications Open for 2026
                                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">Your Education, <br /><span className="text-primary">Fully Funded.</span></h1>
                            <p className="text-xl text-zinc-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">Secure your future with regional bursaries and scholarships. A streamlined digital gateway connecting students to financial freedom.</p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                                {user ? (
                                    <Link to={dashboardLink} className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary hover:bg-primary-dark text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1">Go to Dashboard<ArrowRight className="w-5 h-5" /></Link>
                                ) : (
                                    <>
                                        <Link to="/register-student" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary hover:bg-primary-dark text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1">Apply Now<ArrowRight className="w-5 h-5" /></Link>
                                        <Link to="/auth/login" className="inline-flex items-center justify-center px-10 py-4 bg-white hover:bg-gray-50 text-primary font-bold border-2 border-primary/20 rounded-2xl transition-all">Admin Portal</Link>
                                    </>
                                )}
                            </div>
                            
                            <div className="pt-8 flex items-center justify-center lg:justify-start gap-10 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2"><span>Fast Process</span></div>
                                <div className="flex items-center gap-2"><span>•</span><span>Secure Data</span></div>
                                <div className="flex items-center gap-2"><span>•</span><span>Direct Deposits</span></div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 flex justify-center relative">
                            <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-3 transform scale-105" />
                            <div className="relative w-full max-w-md">
                                <Carousel />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Students Funded", value: "12k+", icon: Users },
                            { label: "Total Disbursed", value: "KES 500M+", icon: CreditCard },
                            { label: "Institutions", value: "150+", icon: Building2 },
                            { label: "Success Rate", value: "98%", icon: CheckCircle2 },
                        ].map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-4 justify-center md:justify-start">
                                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary"><stat.icon className="w-6 h-6" /></div>
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
                    <div className="text-center mb-16 flex flex-col items-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight">What You Can Do</h2>
                        <div className="h-0.5 w-12 bg-primary mt-4"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Apply for a Bursary", desc: "Submit your NG-CDF bursary application online in minutes. No queues, no paperwork.", icon: FileText, linkText: "Start Application", link: "/student/apply" },
                            { title: "Track Your Application", desc: "Check your application status and disbursement progress any time, anywhere.", icon: Search, linkText: "Track Status", link: "/student/track-status" },
                            { title: "Public Ledger", desc: "Every disbursed bursary is recorded on our public ledger — full transparency, zero hidden payments.", icon: BarChart2, linkText: "View Ledger", link: "/public-ledger" },
                        ].map((feature, idx) => (
                            <Link to={feature.link} key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col items-start h-full cursor-pointer">
                                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300"><feature.icon className="w-6 h-6 lg:w-7 lg:h-7 stroke-[2]" /></div>
                                <h3 className="text-xl font-bold text-black mb-4">{feature.title}</h3>
                                <p className="text-zinc-500 text-[15px] leading-relaxed mb-8 flex-grow">{feature.desc}</p>
                                <div className="mt-auto flex items-center text-primary font-semibold text-sm group-hover:text-primary-dark transition-colors">{feature.linkText}<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-white py-24 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 flex flex-col items-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-black tracking-tight">How BursarHub Works</h2>
                        <div className="h-0.5 w-12 bg-primary mt-4"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { num: "01", title: "Submit Application", desc: "Fill in your details once. Our system verifies your identity and institution against government records." },
                            { num: "02", title: "Fraud Check", desc: "A rule-based engine scores risk. Low-risk applications are auto-approved immediately." },
                            { num: "03", title: "Admin Review", desc: "Medium and high-risk applications are reviewed by a CDF officer with full fraud context." },
                            { num: "04", title: "Payment Disbursement", desc: "Approved funds are sent directly to your registered institution or preferred payment method." }
                        ].map((step, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                <span className="absolute top-6 right-6 text-primary font-bold text-sm tracking-wide">{step.num}</span>
                                <div className="text-[5.5rem] font-black text-gray-100 mb-2 select-none leading-none -ml-1 transition-colors duration-300 group-hover:text-gray-200">{step.num}</div>
                                <h3 className="text-xl font-bold text-black mb-3 relative z-10">{step.title}</h3>
                                <p className="text-gray-500 text-[15px] leading-relaxed relative z-10 flex-grow">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold">Ready to Secure Your Future?</h2>
                        <p className="text-lg text-blue-100">Join thousands of students who have already benefited from the BursarHub System.</p>
                        <div className="flex justify-center gap-4">
                            {user ? (
                                <Link to={dashboardLink} className="px-8 py-3 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-colors">Go to Dashboard</Link>
                            ) : (
                                <Link to="/register-student" className="px-8 py-3 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-colors">Apply Now</Link>
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
