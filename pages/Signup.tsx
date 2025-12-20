import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowRight, Lock, Mail, User, Phone, AlertCircle } from 'lucide-react';
import { register } from '../services/api';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        password_confirm: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirm) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await register({
                ...formData,
                role: 'company_admin' // Registering as company admin for this dashboard
            });
            alert("Registration successful! Please login.");
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err instanceof Error ? err.message : 'Registration failed. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8 border border-white/50">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
                        <Package size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 text-sm">Join the Logistics platform as a Company Admin</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                placeholder="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">First Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                    placeholder="John"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Phone Number</label>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                    placeholder="Create a password"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    name="password_confirm"
                                    value={formData.password_confirm}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                                    placeholder="Confirm password"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/" className="text-indigo-600 font-semibold hover:underline">
                        Sign in instead
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
