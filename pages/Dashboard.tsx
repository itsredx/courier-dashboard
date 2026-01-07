import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Package, Users, DollarSign, Clock, Star, Trophy, Bike, AlertCircle, Building2, MapPin, Phone, ArrowRight, X } from 'lucide-react';
import { getCompanySummary, getCompanyRevenueChart, getCompanyDeliveryStats, getDeliveries, getDrivers, createCompany } from '../services/api';
import { DashboardStats, RevenueData, DeliveryStat, Delivery, Driver } from '../types';

const COLORS = ['#4f46e5', '#f59e0b', '#3b82f6', '#ef4444'];

// Onboarding Modal Component
const OnboardingModal = ({ onComplete }: { onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await createCompany(formData);
      // Update localStorage user with company ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.company = response?.id || 1; // Use real ID from response
      localStorage.setItem('user', JSON.stringify(user));
      onComplete();
    } catch (err) {
      console.error('Company creation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create company.');
    } finally {
      setLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.first_name || 'Admin'}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">To get started, please register your company details.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                placeholder="Acme Logistics"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Business Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                placeholder="123 Main St, Lagos"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Contact Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                placeholder="+234..."
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            {loading ? 'Creating Company...' : 'Create Company & Continue'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      {trend && <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1"><TrendingUp size={12} /> {trend}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const LeaderboardRow = ({ rank, name, value, label, colorClass, icon: Icon }: any) => (
  <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0">
    <div className="flex items-center gap-4">
      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${rank === 1 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50' :
        rank === 2 ? 'bg-gray-100 text-gray-700' :
          'bg-orange-50 text-orange-800'
        }`}>
        {rank}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-50 shadow-sm">
          {name.charAt(0)}
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
      </div>
    </div>
    <div className="text-right flex items-center gap-2">
      {Icon && <Icon size={14} className={colorClass} />}
      <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Onboarding modal state
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user needs onboarding
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'company_admin' && !user.company) {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.error('Failed to check user onboarding status', e);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to fetch from real API endpoints
        const [summaryData, revData, delStats, deliveries, drivers] = await Promise.all([
          getCompanySummary('week').catch(() => null),
          getCompanyRevenueChart().catch(() => []),
          getCompanyDeliveryStats().catch(() => []),
          getDeliveries().catch(() => []),
          getDrivers().catch(() => []),
        ]);

        // Build dashboard stats from API responses
        const deliveriesArray = Array.isArray(deliveries) ? deliveries : [];
        const driversArray = Array.isArray(drivers) ? drivers : [];

        const statsData: DashboardStats = {
          total_deliveries: (summaryData as any)?.total_deliveries ?? deliveriesArray.length,
          active_deliveries: deliveriesArray.filter((d: Delivery) => d.status === 'in_transit' || d.status === 'assigned').length,
          active_drivers: driversArray.filter((d: Driver) => d.status === 'active').length,
          total_revenue: (summaryData as any)?.financials?.total_revenue ?? 0,
          recent_deliveries: deliveriesArray.slice(0, 5),
          top_rated_drivers: driversArray
            .filter((d: Driver) => d.rating)
            .sort((a: Driver, b: Driver) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3),
          top_delivery_drivers: [], // Would need additional API
        };

        setStats(statsData);
        setRevenueData(Array.isArray(revData) ? revData : []);
        setDeliveryStats(Array.isArray(delStats) ? delStats : []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center text-gray-500">Loading dashboard...</div>;

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      <div className="space-y-6 pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, here's what's happening today.</p>
          </div>
          <div className="flex gap-2">
            <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₦${(stats?.total_revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="bg-emerald-500"
            trend="+12.5% from last week"
          />
          <StatCard
            title="Active Deliveries"
            value={stats?.active_deliveries || 0}
            icon={Package}
            color="bg-indigo-500"
          />
          <StatCard
            title="Active Drivers"
            value={stats?.active_drivers || 0}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Deliveries"
            value={stats?.total_deliveries || 0}
            icon={Clock}
            color="bg-amber-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
            <div className="h-80">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No revenue data available
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Delivery Status</h3>
            <div className="h-48 shrink-0">
              {deliveryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {deliveryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No status data
                </div>
              )}
            </div>
            <div className="mt-4 space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-hide">
              {stats?.recent_deliveries?.map(d => (
                <div key={d.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">#{d.id} - {d.customer?.name || 'Customer'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{d.dropoff_address}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${d.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    d.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {d.status}
                  </span>
                </div>
              )) || <div className="text-gray-400 text-center py-4">No recent deliveries</div>}
            </div>
          </div>
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Rated Drivers */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-500">
                <Star size={20} className="fill-yellow-600 dark:fill-yellow-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Top Rated Drivers</h3>
            </div>
            <div className="space-y-1">
              {stats?.top_rated_drivers?.length ? (
                stats.top_rated_drivers.map((driver, index) => (
                  <LeaderboardRow
                    key={driver.id}
                    rank={index + 1}
                    name={driver.name}
                    value={driver.rating?.toFixed(1)}
                    icon={Star}
                    colorClass="text-yellow-600 fill-yellow-600"
                  />
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">No rated drivers yet</div>
              )}
            </div>
          </div>

          {/* Most Deliveries */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Trophy size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">Top Delivery Riders</h3>
            </div>
            <div className="space-y-1">
              {stats?.top_delivery_drivers?.length ? (
                stats.top_delivery_drivers.map((driver, index) => (
                  <LeaderboardRow
                    key={driver.id}
                    rank={index + 1}
                    name={driver.name}
                    value={driver.count}
                    icon={Bike}
                    colorClass="text-indigo-600"
                  />
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">Delivery stats coming soon</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;