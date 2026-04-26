import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Edit2, X, Lock } from 'lucide-react';
import { getStudentProfile, updateStudentProfile } from '../../api/student.api';
import { kenyaData } from '../../data/kenya';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { AvatarSelector, AvatarDisplay } from '../../components/AvatarSelector';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { SearchableSelect } from '../../components/SearchableSelect';

interface StudentProfile {
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
    familyIncome: number;
    dependents: number;
    orphaned: boolean;
    disabled: boolean;
    avatar?: string;
    is_bank_locked?: boolean;
    isNew?: boolean;
}

const Profile: React.FC = () => {
    const { loginUser, user } = useAuth();
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getStudentProfile();
            setProfile(data);
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setProfile({
                    full_name: '',
                    national_id: '',
                    institution: '',
                    education_level: 'TERTIARY',
                    course: '',
                    year_of_study: 1,
                    school_bank_name: '',
                    school_account_number: '',
                    county: '',
                    constituency: '',
                    familyIncome: 0,
                    dependents: 0,
                    orphaned: false,
                    disabled: false,
                    is_bank_locked: false,
                    isNew: true
                });
            } else {
                setMessage({ type: 'error', text: "Failed to load profile." });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFetchInstitutions = async (query: string) => {
        try {
            const res = await api.get(`/institutions/search?q=${encodeURIComponent(query)}`);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => {
            const updated = { ...prev, [name]: value };
            if (name === "county") {
                updated.constituency = ""; // Reset constituency if county changes
            }
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        const confirmResult = await Swal.fire({
            title: 'Confirm Profile Changes',
            text: "Are you sure you want to save these details?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2563EB',
            cancelButtonColor: '#09090B',
            confirmButtonText: 'Yes, save changes'
        });

        if (!confirmResult.isConfirmed) {
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const payload: any = {
                full_name: profile.full_name,
                institution: profile.institution,
                education_level: profile.education_level || 'TERTIARY',
                course: profile.education_level === 'TERTIARY' ? profile.course : '',
                year_of_study: profile.year_of_study,
                school_bank_name: profile.school_bank_name,
                school_account_number: profile.school_account_number,
                county: profile.county,
                constituency: profile.constituency,
                familyIncome: profile.familyIncome,
                dependents: profile.dependents,
                orphaned: profile.orphaned,
                disabled: profile.disabled,
            };
            if (profile.isNew) {
                payload.national_id = profile.national_id;
            }
            if (profile.avatar) {
                payload.avatar = profile.avatar;
            }
            const res = await updateStudentProfile(payload);
            setProfile({ ...res, isNew: false });
            setIsEditing(false);

            if (user) {
                loginUser(localStorage.getItem('cfg_token') || '', {
                    ...user,
                    fullName: res.fullName,
                    avatar: res.avatar
                });
            }

            Swal.fire({
                title: 'Saved!',
                text: 'Your profile has been updated successfully.',
                icon: 'success',
                confirmButtonColor: '#2563EB'
            });
        } catch (err: any) {
            console.error(err);
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.error || 'Failed to update profile.',
                icon: 'error',
                confirmButtonColor: '#2563EB'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Profile data not available.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-8">
                    <AvatarDisplay id={profile.avatar || 'av1'} className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl" />
                    
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-extrabold text-black tracking-tight mb-2">
                            {profile.full_name || 'Incomplete Profile'}
                        </h1>
                        <p className="text-zinc-500 font-medium mb-6">
                            {profile.institution || 'No Institution Set'} • {profile.education_level || 'STUDENT'}
                        </p>
                        
                        <Button 
                            onClick={() => setIsEditing(true)}
                            className="bg-primary text-white border-none px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-bold"
                            variant="primary"
                        >
                            <Edit2 className="w-4 h-4 mr-2" />
                            {profile.isNew ? "Complete My Profile" : "Edit Profile Settings"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">

                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {profile.isNew ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center text-primary">
                        <p className="font-bold text-lg">Incomplete Profile</p>
                        <p className="text-sm mt-1 opacity-80">Please provide your student and bank information to enable bursary applications.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-1.5">Full Name</p>
                            <p className="text-base text-black font-bold">{profile.full_name || 'Not Set'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">National ID</p>
                            <p className="text-base text-gray-900 font-semibold">{profile.national_id || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Education Level</p>
                            <p className="text-base text-gray-900 font-semibold capitalize">{profile.education_level?.toLowerCase() || 'Tertiary'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Institution</p>
                            <p className="text-base text-gray-900 font-semibold">{profile.institution || 'N/A'}</p>
                        </div>
                        
                        {(profile.education_level === 'TERTIARY' || !profile.education_level) && (
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Course</p>
                                <p className="text-base text-gray-900 font-semibold">{profile.course || 'N/A'}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                                {profile.education_level === 'PRIMARY' ? 'Grade' : profile.education_level === 'SECONDARY' ? 'Form' : 'Year of Study'}
                            </p>
                            <p className="text-base text-gray-900 font-semibold">{profile.year_of_study || 1}</p>
                        </div>
                        
                        <div className="md:col-span-2 mt-8">
                            <h3 className="text-sm font-bold text-black uppercase tracking-widest border-b border-zinc-100 pb-3 mb-6 flex items-center gap-3">
                                Disbursement Routing
                                {profile.is_bank_locked && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold bg-zinc-900 text-white">
                                        <Lock className="w-3 h-3 mr-1.5" /> ACCOUNT LOCKED
                                    </span>
                                )}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">School Bank Name</p>
                                    <p className="text-base text-gray-900 font-semibold">{profile.school_bank_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">School Account Number</p>
                                    <p className="text-base text-gray-900 font-semibold">{profile.school_account_number || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 mt-4 border-t border-zinc-100 pt-6">
                            <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-4">Regional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">County</p>
                                    <p className="text-base text-black font-bold">{profile.county || 'Not Set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Constituency</p>
                                    <p className="text-base text-black font-bold">{profile.constituency || 'Not Set'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 mt-4 border-t border-zinc-100 pt-6">
                            <h3 className="text-sm font-bold text-black uppercase tracking-widest mb-4">Socioeconomic Assessment</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Family Income</p>
                                    <p className="text-sm font-bold text-gray-900">KES {profile.familyIncome?.toLocaleString() || '0'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Dependents</p>
                                    <p className="text-sm font-bold text-gray-900">{profile.dependents || '0'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Priority Tags</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {profile.orphaned && <span className="px-1.5 py-0.5 bg-zinc-900 text-white text-[9px] font-bold rounded">ORPHAN</span>}
                                        {profile.disabled && <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">DISABLED</span>}
                                        {!profile.orphaned && !profile.disabled && <span className="text-[10px] text-gray-400">None</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Editing Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto transform transition-all">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 z-10 px-8 py-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {profile.isNew ? "Complete Profile" : "Edit Profile"}
                            </h2>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">Choose an Avatar</label>
                                    <div className="flex justify-center border-b border-zinc-100 pb-8">
                                        <AvatarSelector 
                                            selectedId={profile.avatar || 'av1'} 
                                            onSelect={(id) => setProfile({ ...profile, avatar: id })} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        name="full_name"
                                        value={profile.full_name || ''}
                                        onChange={handleChange}
                                        required
                                    />

                                    <Input
                                        label={profile.isNew ? "National ID" : "National ID (Read Only)"}
                                        name="national_id"
                                        value={profile.national_id || ''}
                                        onChange={handleChange}
                                        disabled={!profile.isNew}
                                        required
                                    />

                                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                                        <label className="block text-sm font-medium text-gray-700">Education Level</label>
                                        <select
                                            name="education_level"
                                            value={profile.education_level || 'TERTIARY'}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-gray-200 shadow-sm py-2.5 px-3 sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white"
                                            required
                                        >
                                            <option value="PRIMARY">Primary School</option>
                                            <option value="SECONDARY">Secondary (High School)</option>
                                            <option value="TERTIARY">Tertiary (College/University)</option>
                                        </select>
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <SearchableSelect
                                            label="Institution"
                                            name="institution"
                                            placeholder={profile.education_level === 'TERTIARY' ? "Search for your university or college..." : "Type your school name..."}
                                            value={profile.institution || ''}
                                            onChange={(val) => setProfile(prev => prev ? { ...prev, institution: val } : prev)}
                                            onFetchOptions={handleFetchInstitutions}
                                            required
                                            footerLabel="Institutions Found"
                                            footerSource="Global Directory"
                                        />
                                    </div>

                                    {(!profile.education_level || profile.education_level === 'TERTIARY') && (
                                        <div className="col-span-1 md:col-span-2">
                                            <SearchableSelect
                                                label="Course"
                                                name="course"
                                                placeholder="Search for your degree or diploma..."
                                                value={profile.course || ''}
                                                onChange={(val) => setProfile(prev => prev ? { ...prev, course: val } : prev)}
                                                onFetchOptions={handleFetchCourses}
                                                required
                                                footerLabel="Courses Found"
                                                footerSource="System Registry"
                                            />
                                        </div>
                                    )}

                                    <Input
                                        label={profile.education_level === 'PRIMARY' ? 'Grade' : profile.education_level === 'SECONDARY' ? 'Form' : 'Year of Study'}
                                        type="number"
                                        name="year_of_study"
                                        value={profile.year_of_study || 1}
                                        onChange={handleChange}
                                        min={1}
                                        max={profile.education_level === 'PRIMARY' ? 8 : profile.education_level === 'SECONDARY' ? 4 : 6}
                                        required
                                    />

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-gray-700">County</label>
                                        <select
                                            name="county"
                                            value={profile.county || ''}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-gray-200 shadow-sm py-2.5 px-3 sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white"
                                            required
                                        >
                                            <option value="">Select County</option>
                                            {kenyaData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-gray-700">Constituency</label>
                                        <select
                                            name="constituency"
                                            value={profile.constituency || ''}
                                            onChange={handleChange}
                                            className="block w-full rounded-xl border border-gray-200 shadow-sm py-2.5 px-3 sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white"
                                            disabled={!profile.county}
                                            required
                                        >
                                            <option value="">Select Constituency</option>
                                            {kenyaData.find(c => c.name === profile.county)?.constituencies.map(con => (
                                                <option key={con} value={con}>{con}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Socioeconomic Assessment</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Annual Family Income (KES)"
                                            type="number"
                                            name="familyIncome"
                                            value={profile.familyIncome || 0}
                                            onChange={handleChange}
                                            required
                                        />
                                        <Input
                                            label="Number of Dependents"
                                            type="number"
                                            name="dependents"
                                            value={profile.dependents || 0}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="flex gap-6 pt-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!profile.orphaned}
                                                    onChange={(e) => setProfile({ ...profile, orphaned: e.target.checked })}
                                                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Orphaned</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!profile.disabled}
                                                    onChange={(e) => setProfile({ ...profile, disabled: e.target.checked })}
                                                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Disabled</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Bank Details</h3>
                                        {profile.is_bank_locked && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                <Lock className="w-3 h-3 mr-1" /> Locked
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="School Bank Name"
                                            name="school_bank_name"
                                            value={profile.school_bank_name || ''}
                                            onChange={handleChange}
                                            disabled={profile.is_bank_locked && !profile.isNew}
                                            required
                                        />
                                        <Input
                                            label="School Account Number"
                                            name="school_account_number"
                                            value={profile.school_account_number || ''}
                                            onChange={handleChange}
                                            disabled={profile.is_bank_locked && !profile.isNew}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-4 pt-6 mt-2 border-t border-gray-100">
                                    <Button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        disabled={saving}
                                        className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={saving}
                                        disabled={saving}
                                        variant="primary"
                                        className="shadow-lg shadow-primary/20 bg-primary text-white border-none px-8"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
