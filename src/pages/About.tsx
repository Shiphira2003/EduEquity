import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
    Target,
    Heart,
    Globe,
    Zap,
    Users,
    Award,
    ArrowRight,
} from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <div className="bg-gradient-to-b from-blue-50/50 to-transparent py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-8 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-primary shadow-sm border border-gray-100">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            About BursarHub
                        </div>

                        <h1 className="text-5xl md:text-6xl font-extrabold text-black leading-[1.1] tracking-tight">
                            Bridging the Gap in
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
                                Education Funding
                            </span>
                        </h1>

                        <p className="text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto">
                            BursarHub is a revolutionary digital platform designed to democratize access to education financing. We believe every deserving student should have access to funds without barriers or bureaucracy.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="bg-white border-y border-gray-100 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Mission */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-lg">
                                <Target className="w-5 h-5 text-black" />
                                <span className="text-sm font-semibold text-black">Our Mission</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-black">
                                Empower Through Education
                            </h2>
                            <p className="text-lg text-zinc-500 leading-relaxed">
                                Our mission is to create a streamlined, transparent, and accessible pathway for students to access educational funding. We aim to eliminate the barriers that prevent talented students from pursuing their dreams.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    </div>
                                    <span className="text-black">Digital-first approach to funding</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    </div>
                                    <span className="text-black">Reduced processing time & bureaucracy</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    </div>
                                    <span className="text-black">Transparent and fair allocation</span>
                                </li>
                            </ul>
                        </div>

                        {/* Vision */}
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-lg">
                                <Heart className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold text-primary">Our Vision</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-black">
                                Education for All
                            </h2>
                            <p className="text-lg text-zinc-500 leading-relaxed">
                                We envision a future where financial constraints are no longer a barrier to quality education. A world where every student, regardless of their economic background, can access the funding they need to succeed.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center mt-1 flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                    </div>
                                    <span className="text-black">Nationwide coverage & accessibility</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center mt-1 flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                    </div>
                                    <span className="text-black">Technology-driven solutions</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center mt-1 flex-shrink-0">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                    </div>
                                    <span className="text-black">Partnerships across institutions</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Values Section */}
            <div className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Our Core Values</h2>
                        <p className="text-lg text-text-light">
                            These principles guide everything we do
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Transparency",
                                desc: "We believe in clear communication and honest dealings. Every process is documented and accessible.",
                                icon: Globe,
                                color: "primary",
                            },
                            {
                                title: "Efficiency",
                                desc: "Leveraging technology to reduce delays and streamline processes. Quick approvals mean faster support.",
                                icon: Zap,
                                color: "black",
                            },
                            {
                                title: "Inclusivity",
                                desc: "Everyone deserves a chance. We ensure equal opportunity regardless of background or circumstances.",
                                icon: Users,
                                color: "primary",
                            },
                        ].map((value, idx) => {
                            const IconComponent = value.icon;
                            return (
                                <div key={idx} className="bg-surface p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 ${value.color === 'primary'
                                            ? 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'
                                            : 'bg-black/5 text-black group-hover:bg-black group-hover:text-white'
                                        }`}>
                                        <IconComponent className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                                    <p className="text-zinc-500 leading-relaxed">{value.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Impact Stats Section */}
            <div className="bg-white border-y border-gray-100 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">Our Impact So Far</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Students Served", value: "12,000+", icon: Users },
                            { label: "Funds Disbursed", value: "KES 500M+", icon: Award },
                            { label: "Countries Aided", value: "1", icon: Globe },
                            { label: "Success Rate", value: "98%", icon: Award },
                        ].map((stat, idx) => {
                            const IconComponent = stat.icon;
                            return (
                                <div key={idx} className="flex flex-col items-center gap-4 justify-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                                        <p className="text-sm text-text-light">{stat.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-primary rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-action/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Be Part of Our Mission</h2>
                        <p className="text-lg text-blue-100">
                            Join us in creating equal access to education funding. Apply now or contact us to learn more.
                        </p>
                        <div className="flex justify-center gap-4 flex-col sm:flex-row">
                            <Link to="/register-student" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-action hover:bg-action-hover text-white font-semibold rounded-xl shadow-lg transition-colors">
                                Get Started
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/" className="inline-flex items-center justify-center px-8 py-3 bg-white hover:bg-gray-100 text-primary font-semibold rounded-xl shadow-lg transition-colors">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default About;
