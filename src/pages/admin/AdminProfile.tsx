import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import api from '../../api/axios';
import { UserCircle } from 'lucide-react';

export default function AdminProfile() {
    const [profile, setProfile] = useState<{ full_name: string; id_number: string; image_icon: string; email: string }>({
        full_name: '',
        id_number: '',
        image_icon: '',
        email: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/profile');
            // Backend returns full_name, id_number, image_icon, email
            setProfile({
                full_name: res.data.full_name || '',
                id_number: res.data.id_number || '',
                image_icon: res.data.image_icon || '',
                email: res.data.email || '' // If not set up yet, returns email minimum
            });
        } catch (err) {
            console.error("Error fetching profile", err);
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
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('full_name', profile.full_name);
            formData.append('id_number', profile.id_number);
            if (file) {
                formData.append('image_icon', file);
            }

            const res = await api.put('/admin/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local state with returned URL
            setProfile(prev => ({
                ...prev,
                full_name: res.data.full_name,
                id_number: res.data.id_number,
                image_icon: res.data.image_icon || prev.image_icon
            }));
            setFile(null); // Clear selected file after upload

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Profile</h1>

            <Card>
                {message.text && (
                    <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="flex flex-col items-center mb-8">
                        {profile.image_icon ? (
                            <img
                                src={`http://localhost:5000/${profile.image_icon.replace(/\\/g, '/')}`}
                                alt="Profile Icon"
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }}
                            />
                        ) : (
                            <UserCircle className="w-24 h-24 text-gray-300" />
                        )}

                        <div className="mt-4 flex items-center">
                            <label className="cursor-pointer bg-white px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                                <span>Change Image</span>
                                <input
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                                    }}
                                />
                            </label>
                            {file && <span className="ml-3 text-sm text-gray-500">{file.name}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <div className="mt-1">
                            <input
                                type="email"
                                disabled
                                value={profile.email}
                                className="bg-gray-100 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="mt-1">
                            <input
                                type="text"
                                required
                                value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID Number</label>
                        <div className="mt-1">
                            <input
                                type="text"
                                value={profile.id_number}
                                onChange={(e) => setProfile({ ...profile, id_number: e.target.value })}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Enter ID number"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
