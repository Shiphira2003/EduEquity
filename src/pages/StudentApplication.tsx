import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createApplication } from "../api/applications.api";
import { kenyaData } from "../data/kenya";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Swal from "sweetalert2";
import { SearchableSelect } from "../components/SearchableSelect";

// --- Zod Schema ---
const applicationSchema = z.object({
    familyIncome: z.number().min(0, "Family income must be 0 or greater"),
    dependents: z.number().min(0, "Dependents must be 0 or greater"),
    orphaned: z.boolean().default(false),
    disabled: z.boolean().default(false),
    otherHardships: z.string().optional(),

    bursaryTypes: z.array(z.string()).min(1, "Please select at least one bursary type"),
    county: z.string().optional(),
    constituency: z.string().optional(),
    cycleYear: z.number().min(2020),
    feeBalance: z.number().min(1, "Fee balance must be greater than 0"),
    institution: z.string().min(1, "Institution is required"),
    course: z.string().optional(),
    yearOfStudy: z.number().min(1, "Year must be at least 1"),
    educationLevel: z.string().min(1, "Education level is required"),
}).superRefine((data, ctx) => {
    const hasRegionalBursary = data.bursaryTypes.some(t => t === "COUNTY" || t === "CDF");
    const hasCdf = data.bursaryTypes.includes("CDF");

    if (hasRegionalBursary && !data.county) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "County is required for County/CDF Bursary", path: ["county"] });
    }
    if (hasCdf && !data.constituency) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Constituency is required for CDF", path: ["constituency"] });
    }
});

type ApplicationForm = z.infer<typeof applicationSchema>;

const StudentApplication = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Document Upload States (Kept standard for FormData simplicity)
    const [schoolId, setSchoolId] = useState<File | null>(null);
    const [guardianId, setGuardianId] = useState<File | null>(null);
    const [reportCard, setReportCard] = useState<File | null>(null);
    const [admissionLetter, setAdmissionLetter] = useState<File | null>(null);
    const [feeStatement, setFeeStatement] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<number>(1);
    const [profileMissing, setProfileMissing] = useState(false);
    const [publicFundSources, setPublicFundSources] = useState<any[]>([]);

    const form = useForm<ApplicationForm>({
        resolver: zodResolver(applicationSchema) as any,
        defaultValues: {
            familyIncome: 0,
            dependents: 0,
            orphaned: false,
            disabled: false,
            otherHardships: "",
            bursaryTypes: [],
            county: "",
            constituency: "",
            cycleYear: new Date().getFullYear(),
            feeBalance: 0,
            institution: "",
            course: "",
            yearOfStudy: 1,
            educationLevel: "TERTIARY"
        },
        mode: "onTouched"
    });

    useEffect(() => {
        api.get('/fund-sources/public')
            .then(res => {
                const fetched = res.data.data || [];
                setPublicFundSources(fetched);
                const now = new Date();
                const open = fetched.filter((b: any) => {
                    if (!b.is_open) return false;
                    if (b.start_date && now < new Date(b.start_date)) return false;
                    if (b.end_date && now > new Date(b.end_date)) return false;
                    return true;
                });
                if (open.length > 0) {
                    // Set default year if not set
                    form.setValue("cycleYear", open[0].cycle_year);
                }
            })
            .catch(console.error);
    }, [form]);

    useEffect(() => {
        if (user?.role === 'STUDENT') {
            api.get('/students/profile')
                .then(res => {
                    const profileData = res.data;
                    if (profileData) {
                        if (profileData.county) form.setValue("county", profileData.county);
                        if (profileData.constituency) form.setValue("constituency", profileData.constituency);
                        if (profileData.familyIncome) form.setValue("familyIncome", parseFloat(profileData.familyIncome));
                        if (profileData.dependents) form.setValue("dependents", parseInt(profileData.dependents));
                        if (profileData.orphaned !== undefined) form.setValue("orphaned", !!profileData.orphaned);
                        if (profileData.disabled !== undefined) form.setValue("disabled", !!profileData.disabled);
                        if (profileData.institution) form.setValue("institution", profileData.institution);
                        if (profileData.course) form.setValue("course", profileData.course);
                        if (profileData.yearOfStudy) form.setValue("yearOfStudy", parseInt(profileData.yearOfStudy));
                        if (profileData.educationLevel) form.setValue("educationLevel", profileData.educationLevel);
                    }
                })
                .catch((err) => {
                    if (err.response?.status === 404 || err.response?.status === 403) setProfileMissing(true);
                });
        }
    }, [user, form]);

    const now = new Date();
    const openBursaries = publicFundSources.filter(b => {
        if (!b.is_open) return false;
        if (b.start_date && now < new Date(b.start_date)) return false;
        if (b.end_date && now > new Date(b.end_date)) return false;
        return true;
    });
    const closedBursaries = publicFundSources.filter(b => !openBursaries.includes(b));

    const selectedCountyData = kenyaData.find(c => c.name === form.watch("county"));
    const constituencies = selectedCountyData ? selectedCountyData.constituencies : [];

    const handleFetchInstitutions = async (query: string, level?: string) => {
        try {
            const res = await api.get(`/institutions/search?q=${encodeURIComponent(query)}&level=${level || ""}`);
            return res.data.data || [];
        } catch (err) {
            console.error("Institution fetch error:", err);
            return [];
        }
    };

    const handleFetchCourses = async (query: string) => {
        try {
            const res = await api.get(`/courses/search?q=${encodeURIComponent(query)}`);
            return res.data.data || [];
        } catch (err) {
            console.error("Course fetch error:", err);
            return [];
        }
    };

    const handleSpecificFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files.length > 0) setter(e.target.files[0]);
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof ApplicationForm)[] = [];
        if (step === 1) fieldsToValidate = ["familyIncome", "dependents", "orphaned", "disabled", "otherHardships"];
        if (step === 2) fieldsToValidate = ["bursaryTypes", "county", "constituency", "feeBalance", "cycleYear"];
        
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setStep((prev) => prev - 1);
    };

    const onSubmit: SubmitHandler<ApplicationForm> = async (data) => {
        if (!schoolId || !guardianId || !reportCard || !admissionLetter || !feeStatement) {
            Swal.fire('Missing Documents', 'All 5 required documents must be uploaded before submitting.', 'error');
            return;
        }

        const confirmResult = await Swal.fire({
            title: 'Confirm Submission',
            text: `You are applying for ${data.bursaryTypes.length} bursary program(s). Are you sure you want to proceed?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2563EB',
            cancelButtonColor: '#09090B',
            confirmButtonText: 'Yes, submit applications'
        });

        if (!confirmResult.isConfirmed) return;

        setLoading(true);
        try {
            // Loop through each selected bursary and create a separate application
            const results = await Promise.allSettled(data.bursaryTypes.map(async (type) => {
                const formData = new FormData();
                formData.append("cycle_year", data.cycleYear.toString());
                formData.append("amount_requested", data.feeBalance.toString());
                formData.append("fee_balance", data.feeBalance.toString());
                formData.append("bursary_type", type);
                formData.append("county", data.county || "");
                formData.append("constituency", data.constituency || "");
                formData.append("family_income", data.familyIncome.toString());
                formData.append("dependents", data.dependents.toString());
                formData.append("orphaned", data.orphaned.toString());
                formData.append("disabled", data.disabled.toString());
                formData.append("other_hardships", data.otherHardships || "");
                formData.append("institution", data.institution);
                formData.append("course", data.course || "");
                formData.append("year_of_study", data.yearOfStudy.toString());
                formData.append("education_level", data.educationLevel);

                if (schoolId) formData.append("school_id", schoolId);
                if (guardianId) formData.append("guardian_id", guardianId);
                if (reportCard) formData.append("report_card", reportCard);
                if (admissionLetter) formData.append("admission_letter", admissionLetter);
                if (feeStatement) formData.append("fee_statement", feeStatement);

                return createApplication(formData);
            }));

            const successes = results.filter(r => r.status === 'fulfilled');
            const failures = results.filter(r => r.status === 'rejected');

            if (failures.length > 0) {
                await Swal.fire({
                    title: 'Partial Success',
                    text: `Successfully submitted ${successes.length} applications. ${failures.length} failed. Please check your dashboard.`,
                    icon: 'warning',
                    confirmButtonColor: '#2563EB'
                });
            } else {
                await Swal.fire('Success!', `All ${data.bursaryTypes.length} applications submitted successfully!`, 'success');
            }
            
            navigate("/student/dashboard");
        } catch (err: any) {
            Swal.fire('Error!', err.message || "Failed to submit applications", 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== "STUDENT") {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Access Denied</h2>
                    <p className="mt-2 text-gray-600">This application page is restricted to registered <strong>Students</strong> only.</p>
                </div>
            </div>
        );
    }

    if (profileMissing) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white shadow py-8 px-6 text-center rounded-lg">
                    <h2 className="text-2xl font-bold text-black mb-3">Student Profile Not Found</h2>
                    <p className="text-zinc-600 text-sm mb-6">Your account exists but no student profile is linked to it.</p>
                    <Link to="/student/profile" className="inline-flex justify-center px-6 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:opacity-90 transition-all">Update Profile</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Apply for Funding</h2>
                
                <div className="mt-8 flex items-center justify-center space-x-3">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center">
                            <div className={`flex items-center justify-center w-9 h-9 rounded-lg font-bold text-sm transition-all duration-300 ${step === item ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : step > item ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-400'}`}>
                                {step > item ? '✓' : item}
                            </div>
                            {item < 3 && <div className={`w-10 h-0.5 mx-2 rounded-full ${step > item ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-5 border border-zinc-100 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4">Live Bursary Windows</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center bg-primary/5 w-fit px-2 py-0.5 rounded">Active Cycles</h4>
                                {openBursaries.length === 0 ? <p className="text-xs text-zinc-500 italic">No cycles are currently accepting applications.</p> : (
                                    <ul className="space-y-2">
                                        {openBursaries.map(b => (
                                            <li key={b.id} className="text-sm bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                <span className="font-bold text-black">{b.name} ({b.cycle_year})</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center bg-zinc-50 w-fit px-2 py-0.5 rounded">Upcoming / Closed</h4>
                                {closedBursaries.length === 0 ? <p className="text-xs text-zinc-500 italic">No other cycles listed.</p> : (
                                    <ul className="space-y-2">
                                        {closedBursaries.map(b => (
                                            <li key={b.id} className="text-sm bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100/50 opacity-60 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                                                <span className="font-medium text-zinc-600">{b.name} ({b.cycle_year})</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit as any)}>
                        
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Step 1: Financial & Need Assessment</h3>
                                
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 font-sans">
                                    <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">Academic Info (Auto-filled from registration)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <SearchableSelect
                                                label="Institution"
                                                name="institution"
                                                placeholder={form.watch("educationLevel") === 'TERTIARY' ? "Search for your university or college..." : "Type your school name..."}
                                                value={form.watch("institution")}
                                                onChange={(val) => form.setValue("institution", val)}
                                                onFetchOptions={(q) => handleFetchInstitutions(q, form.watch("educationLevel"))}
                                                required
                                                error={form.formState.errors.institution?.message}
                                                footerLabel="Institutions Found"
                                                footerSource="Global Directory"
                                            />
                                        </div>
                                        {form.watch("educationLevel") === "TERTIARY" && (
                                            <div className="md:col-span-2">
                                                <SearchableSelect
                                                    label="Course / Program"
                                                    name="course"
                                                    placeholder="Search for your degree or diploma..."
                                                    value={form.watch("course") || ""}
                                                    onChange={(val) => form.setValue("course", val)}
                                                    onFetchOptions={handleFetchCourses}
                                                    required={form.watch("educationLevel") === "TERTIARY"}
                                                    error={form.formState.errors.course?.message}
                                                    footerLabel="Courses Found"
                                                    footerSource="System Registry"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">
                                                {form.watch("educationLevel") === 'PRIMARY' ? 'Grade' : form.watch("educationLevel") === 'SECONDARY' ? 'Form' : 'Year of Study'}
                                            </label>
                                            <input type="number" {...form.register("yearOfStudy", { valueAsNumber: true })} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-lg bg-white/50 text-xs font-semibold" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500">Education Level</label>
                                            <select {...form.register("educationLevel")} className="mt-1 block w-full px-3 py-1.5 border border-zinc-200 rounded-lg bg-white/50 text-xs font-semibold">
                                                <option value="PRIMARY">Primary School</option>
                                                <option value="SECONDARY">Secondary / High School</option>
                                                <option value="TERTIARY">Tertiary / University</option>
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-400 mt-2 italic">Note: These details are pre-filled from your profile. Update them if your current status has changed.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Annual Family Income (KES)</label>
                                        <input type="number" {...form.register("familyIncome", { valueAsNumber: true })} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-primary focus:border-primary transition-all" />
                                        {form.formState.errors.familyIncome && <p className="text-red-500 text-xs mt-1">{form.formState.errors.familyIncome.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Number of Dependents</label>
                                        <input type="number" {...form.register("dependents", { valueAsNumber: true })} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-primary focus:border-primary transition-all" />
                                        {form.formState.errors.dependents && <p className="text-red-500 text-xs mt-1">{form.formState.errors.dependents.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center">
                                        <input type="checkbox" {...form.register("orphaned")} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                        <label className="ml-2 block text-sm text-gray-900">Are you orphaned?</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input type="checkbox" {...form.register("disabled")} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                        <label className="ml-2 block text-sm text-gray-900">Do you have documented disabilities?</label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Other Hardships (Optional)</label>
                                    <textarea {...form.register("otherHardships")} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Step 2: Application Details</h3>
                                
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700">Select Bursaries to Apply For</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {openBursaries.map(b => {
                                            const isSelected = form.watch("bursaryTypes")?.includes(b.name);
                                            return (
                                                <label 
                                                    key={b.id} 
                                                    className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all duration-200 ${
                                                        isSelected 
                                                            ? 'border-primary bg-primary/5 shadow-md' 
                                                            : 'border-zinc-100 bg-white hover:border-zinc-200'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        value={b.name}
                                                        className="absolute right-4 top-4 h-5 w-5 text-primary border-zinc-300 rounded focus:ring-primary"
                                                        {...form.register("bursaryTypes")}
                                                    />
                                                    <span className="block text-sm font-bold text-gray-900 mb-1">{b.name}</span>
                                                    <span className="block text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{b.cycle_year} Cycle</span>
                                                    <span className="block text-xs text-zinc-500 leading-relaxed">
                                                        {b.description || "General funding for eligible students."}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    {form.formState.errors.bursaryTypes && <p className="text-red-500 text-xs mt-1">{form.formState.errors.bursaryTypes.message}</p>}
                                </div>

                                {(form.watch("bursaryTypes")?.some(t => t === 'COUNTY' || t === 'CDF')) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select County</label>
                                        <select {...form.register("county")} onChange={(e) => {
                                            form.setValue("county", e.target.value); form.setValue("constituency", "");
                                        }} className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-primary focus:border-primary transition-all">
                                            <option value="">-- Select a County --</option>
                                            {kenyaData.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                        {form.formState.errors.county && <p className="text-red-500 text-xs mt-1">{form.formState.errors.county.message}</p>}
                                    </div>
                                )}

                                {form.watch("bursaryTypes")?.includes('CDF') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Constituency</label>
                                        <select {...form.register("constituency")} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                            <option value="">-- Select a Constituency --</option>
                                            {constituencies.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {form.formState.errors.constituency && <p className="text-red-500 text-xs mt-1">{form.formState.errors.constituency.message}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">School Fees Balance (KES)</label>
                                    <input type="number" {...form.register("feeBalance", { valueAsNumber: true })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                                    {form.formState.errors.feeBalance && <p className="text-red-500 text-xs mt-1">{form.formState.errors.feeBalance.message}</p>}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                                    <h4 className="text-sm text-primary font-bold mb-2 flex items-center uppercase tracking-wide">Mandatory Documents</h4>
                                    <p className="text-xs text-primary/70">Kindly provide clear scans of the following documents in PDF or JPG format (Max 10MB each).</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                        <label className="block text-sm font-semibold text-gray-800 mb-1">1. Student/School ID <span className="text-red-500">*</span></label>
                                        <input type="file" onChange={(e) => handleSpecificFileChange(e, setSchoolId)} accept=".pdf,.jpg,.jpeg,.png" required className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" />
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                        <label className="block text-sm font-semibold text-gray-800 mb-1">2. Parent/Guardian ID <span className="text-red-500">*</span></label>
                                        <input type="file" onChange={(e) => handleSpecificFileChange(e, setGuardianId)} accept=".pdf,.jpg,.jpeg,.png" required className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" />
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                        <label className="block text-sm font-semibold text-gray-800 mb-1">3. Report Card/Transcript <span className="text-red-500">*</span></label>
                                        <input type="file" onChange={(e) => handleSpecificFileChange(e, setReportCard)} accept=".pdf,.jpg,.jpeg,.png" required className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" />
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                        <label className="block text-sm font-semibold text-gray-800 mb-1">4. Admission Letter <span className="text-red-500">*</span></label>
                                        <input type="file" onChange={(e) => handleSpecificFileChange(e, setAdmissionLetter)} accept=".pdf,.jpg,.jpeg,.png" required className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" />
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-800 mb-1">5. Fee Statement / Structure <span className="text-red-500">*</span></label>
                                        <input type="file" onChange={(e) => handleSpecificFileChange(e, setFeeStatement)} accept=".pdf,.jpg,.jpeg,.png" required className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-6 border-t border-zinc-100">
                            {step > 1 ? <button type="button" onClick={prevStep} className="px-6 py-2.5 border border-zinc-300 rounded-lg text-sm font-bold text-zinc-700 bg-white hover:bg-zinc-50 transition-all">Back</button> : <div></div>}
                            {step < 3 ? <button type="button" onClick={nextStep} className="px-8 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-lg shadow-zinc-200">Next Step</button> : <button type="submit" disabled={loading} className={`px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 ${loading ? "opacity-75 cursor-not-allowed" : ""}`}>{loading ? "Processing..." : "Submit Application"}</button>}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentApplication;
