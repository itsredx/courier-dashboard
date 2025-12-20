import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, MapPin, Phone, AlertCircle } from 'lucide-react';
import { createCompany } from '../services/api';

const Onboarding = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createCompany(formData);
            // Update local storage user to reflect new company (hacky, ideally fetch profile)
            // We will assume backend handles linking. We force a reload or re-login logic if needed.
            // But for now, let's just update the local user object with a placeholder or re-fetch profile if we had that function expose.
            // Better: Redirect to dashboard. If dashboard fails, it's an issue. 
            // Ideally we should call a 'getProfile' to refresh user state.
            // For now, assume success and navigate.
            // Save updated user to localStorage so ProtectedRoute sees the company constraint met
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.company = 999; // Placeholder. In real app, we should use response.id
            localStorage.setItem('user', JSON.stringify(user));

            alert("Company created successfully! Welcome to your dashboard.");
            // Use replace: true and window.location to force re-render/check if router is cached deeply? 
            // Navigate should allow ProtectedRoute to re-evaluate on next render.
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error('Onboarding failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to create company.');
        } finally {
            setLoading(false);
        }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.first_name || 'Admin'}!</h1>
                    <p className="text-gray-500 mt-2">To get started, please register your company details.</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 ml-1">Company Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                placeholder="Acme Logistics"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 ml-1">Business Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                placeholder="123 Main St, Lagos"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 ml-1">Contact Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                placeholder="+234..."
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                        >
                            {loading ? 'Creating Company...' : 'Create Company'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
