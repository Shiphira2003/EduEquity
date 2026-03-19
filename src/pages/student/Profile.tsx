import React, { useEffect, useState } from 'react';
import { getStudentProfile, updateStudentProfile } from '../../api/student.api';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getStudentProfile();
            setProfile(data);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Failed to load profile." });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await updateStudentProfile({
                full_name: profile.full_name,
                institution: profile.institution,
                course: profile.course,
                year_of_study: profile.year_of_study
            });
            setProfile(res.student);
            setMessage({ type: 'success', text: "Profile updated successfully!" });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Profile data not available.</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            name="full_name"
                            value={profile.full_name || ''}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="National ID (Read Only)"
                            value={profile.national_id || ''}
                            disabled
                        />

                        <div className="col-span-1 md:col-span-2">
                            <Input
                                label="Institution"
                                name="institution"
                                value={profile.institution || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Input
                            label="Course"
                            name="course"
                            value={profile.course || ''}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Year of Study"
                            type="number"
                            name="year_of_study"
                            value={profile.year_of_study || 1}
                            onChange={handleChange}
                            min={1}
                            max={6}
                            required
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            isLoading={saving}
                            disabled={saving}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
