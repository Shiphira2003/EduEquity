import { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AvatarSelector, AvatarDisplay } from '../../components/AvatarSelector';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Edit2, Shield, Mail, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminProfile() {
    const { loginUser, user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form fields for editing
    const [fullName, setFullName] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState("av1");

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/profile');
            setProfile(res.data);
            setFullName(res.data.fullName || "");
            setIdNumber(res.data.idNumber || "");
            setSelectedAvatar(res.data.imageIcon || "av1");
        } catch (err) {
            console.error("Error fetching admin profile", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                full_name: fullName,
                id_number: idNumber,
                avatar: selectedAvatar
            };

            const res = await api.put('/admin/profile', payload);
            setProfile(res.data);
            setIsEditing(false);

            // Update local auth context for Navbar/Toast visibility
            if (user) {
                loginUser(localStorage.getItem('token') || '', {
                    ...user,
                    fullName: res.data.fullName,
                    avatar: res.data.imageIcon
                });
            }

            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Admin profile updated'
            });
        } catch (err: any) {
            Swal.fire('Error', err.response?.data?.error || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-zinc-500 font-medium">Loading administrative profile...</div>;
    if (!profile) return <div className="p-12 text-center text-red-500 font-medium">Failed to load profile.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Admin Profile Header */}
            <div className="bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden relative p-8">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl opacity-30" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-10 text-white">
                    <AvatarDisplay id={profile.imageIcon} className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2rem] border-4 border-white/5 shadow-2xl" />
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
                            <h1 className="text-4xl font-black tracking-tight">
                                {profile.fullName || 'Administrator'}
                            </h1>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                <Shield size={12} />
                                System Admin
                            </span>
                        </div>
                        <p className="text-zinc-400 font-medium text-lg mb-8">
                            {profile.email}
                        </p>
                        
                        <Button 
                            onClick={() => setIsEditing(true)}
                            className="bg-white text-zinc-900 border-none px-10 py-4 rounded-2xl shadow-xl hover:bg-zinc-100 transition-all font-bold transform active:scale-95 flex items-center gap-2"
                            variant="primary"
                        >
                            <Edit2 size={18} />
                            Edit Settings
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats/Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-400">
                            <Mail size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Email Access</p>
                            <p className="text-lg font-semibold text-zinc-900">{profile.email}</p>
                            <p className="text-sm text-zinc-500 mt-1">Primary administrative contact</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-8 border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-400">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Identification</p>
                            <p className="text-lg font-semibold text-zinc-900">{profile.idNumber || 'Not provided'}</p>
                            <p className="text-sm text-zinc-500 mt-1">National ID for verified actions</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                    <Card className="relative w-full max-w-2xl bg-white border-none shadow-2xl rounded-3xl overflow-hidden animate-scale-up">
                        {/* Modal Header */}
                        <div className="bg-zinc-900 px-8 py-10 text-white relative">
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <h2 className="text-3xl font-black">Configure Identity</h2>
                            <p className="text-zinc-400 mt-2 font-medium">Customize your administrative presence</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="space-y-6">
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-[0.2em] text-center">Choose Your Avatar</label>
                                    <div className="flex justify-center border-b border-zinc-100 pb-10">
                                        <AvatarSelector 
                                            selectedId={selectedAvatar} 
                                            onSelect={setSelectedAvatar} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700 ml-1">Full Administrative Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                                            placeholder="Enter your registered name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-700 ml-1">National ID Number</label>
                                        <input
                                            type="text"
                                            value={idNumber}
                                            onChange={e => setIdNumber(e.target.value)}
                                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium"
                                            placeholder="Enter ID for verification"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <Button 
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-none py-4 rounded-2xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={saving}
                                        className="flex-[2] bg-primary text-white border-none py-4 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-95 transition-all font-bold disabled:opacity-50"
                                    >
                                        {saving ? 'Syncing Profile...' : 'Save Admin Profile'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
