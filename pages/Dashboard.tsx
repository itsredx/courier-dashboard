import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Package, Users, DollarSign, Clock, Star, Trophy, Bike } from 'lucide-react';
import { mockApi } from '../services/mockService';
import { DashboardStats, RevenueData, DeliveryStat } from '../types';

const COLORS = ['#4f46e5', '#f59e0b', '#3b82f6', '#ef4444'];

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {trend && <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1"><TrendingUp size={12}/> {trend}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

const LeaderboardRow = ({ rank, name, value, label, colorClass, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
            rank === 1 ? 'bg-yellow-100 text-yellow-700 ring-4 ring-yellow-50' : 
            rank === 2 ? 'bg-gray-100 text-gray-700' : 
            'bg-orange-50 text-orange-800'
        }`}>
          {rank}
        </div>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-50 shadow-sm">
                {name.charAt(0)}
            </div>
            <p className="text-sm font-semibold text-gray-900">{name}</p>
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, revData, delData] = await Promise.all([
          mockApi.getDashboardStats(),
          mockApi.getRevenueChart(),
          mockApi.getDeliveryStats()
        ]);
        setStats(statsData);
        setRevenueData(revData);
        setDeliveryStats(delData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
           <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
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
          value={`₦${stats?.total_revenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-emerald-500" 
          trend="+12.5% from last week"
        />
        <StatCard 
          title="Active Deliveries" 
          value={stats?.active_deliveries} 
          icon={Package} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Active Drivers" 
          value={stats?.active_drivers} 
          icon={Users} 
          color="bg-blue-500" 
        />
         <StatCard 
          title="Total Deliveries" 
          value={stats?.total_deliveries} 
          icon={Clock} 
          color="bg-amber-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Delivery Status</h3>
          <div className="h-48 shrink-0">
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
          </div>
          <div className="mt-4 space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-hide">
             {stats?.recent_deliveries.map(d => (
                <div key={d.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                   <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">#{d.id} - {d.customer.name}</p>
                      <p className="text-xs text-gray-500 truncate">{d.dropoff_address}</p>
                   </div>
                   <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                     d.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                     d.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                   }`}>
                     {d.status}
                   </span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Top Rated Drivers */}
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                <Star size={20} className="fill-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900">Top Rated Drivers</h3>
            </div>
            <div className="space-y-1">
              {stats?.top_rated_drivers.map((driver, index) => (
                <LeaderboardRow 
                   key={driver.id} 
                   rank={index + 1} 
                   name={driver.name} 
                   value={driver.rating?.toFixed(1)} 
                   icon={Star}
                   colorClass="text-yellow-600 fill-yellow-600"
                />
              ))}
            </div>
         </div>

         {/* Most Deliveries */}
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Trophy size={20} />
              </div>
              <h3 className="font-bold text-gray-900">Top Delivery Riders</h3>
            </div>
            <div className="space-y-1">
              {stats?.top_delivery_drivers.map((driver, index) => (
                <LeaderboardRow 
                   key={driver.id} 
                   rank={index + 1} 
                   name={driver.name} 
                   value={driver.count} 
                   icon={Bike}
                   colorClass="text-indigo-600"
                />
              ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;