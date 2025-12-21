import React, { useEffect, useState } from 'react';
import { Filter, MapPin, Search, User, X, AlertCircle } from 'lucide-react';
import { getDeliveries, getDrivers, assignDriver as apiAssignDriver } from '../services/api';
import { Delivery, Driver } from '../types';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [delData, driverData] = await Promise.all([
        getDeliveries(filter),
        getDrivers()
      ]);

      // Handle API response - could be array or paginated object
      const deliveriesArray = Array.isArray(delData) ? delData : (delData as any)?.results || [];
      const driversArray = Array.isArray(driverData) ? driverData : (driverData as any)?.results || [];

      setDeliveries(deliveriesArray);
      setDrivers(driversArray.filter((d: Driver) => d.status === 'active'));
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (driverId: number) => {
    if (!selectedDelivery) return;
    setAssigning(true);
    try {
      await apiAssignDriver(selectedDelivery.id, driverId);
      setAssignModalOpen(false);
      setSelectedDelivery(null);
      fetchData(); // Refresh list
    } catch (err) {
      console.error('Failed to assign driver:', err);
      alert(err instanceof Error ? err.message : 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deliveries Management</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search ID or Customer..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg w-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm appearance-none focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
          <button onClick={fetchData} className="ml-auto text-red-600 hover:underline text-sm">Retry</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Route</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading deliveries...</td></tr>
              ) : deliveries.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No deliveries found.</td></tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">#{d.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="truncate max-w-[150px]">{d.pickup_address}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="truncate max-w-[150px]">{d.dropoff_address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">{d.customer?.name || 'N/A'}</td>
                    <td className="p-4">
                      {d.driver ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {d.driver.name.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{d.driver.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">₦{(d.estimated_price || 0).toLocaleString()}</td>
                    <td className="p-4"><StatusBadge status={d.status} /></td>
                    <td className="p-4 text-right">
                      {d.status === 'pending' && (
                        <button
                          onClick={() => { setSelectedDelivery(d); setAssignModalOpen(true); }}
                          className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Assign
                        </button>
                      )}
                      {d.status !== 'pending' && (
                        <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-1.5">
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Driver Modal */}
      {isAssignModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assign Driver</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={20} /></button>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Delivery Route</p>
              <div className="flex items-start gap-3 mb-2">
                <MapPin size={16} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-900 dark:text-gray-300">{selectedDelivery.pickup_address}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-red-500 mt-0.5" />
                <span className="text-sm text-gray-900 dark:text-gray-300">{selectedDelivery.dropoff_address}</span>
              </div>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">Available Drivers</p>
              <div className="space-y-2">
                {drivers.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No active drivers available</div>
                ) : (
                  drivers.map(driver => (
                    <button
                      key={driver.id}
                      onClick={() => handleAssign(driver.id)}
                      disabled={assigning}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                          <User size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{driver.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Rating: {driver.rating || 'N/A'} ★</p>
                        </div>
                      </div>
                      <span className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 font-medium">
                        {assigning ? 'Assigning...' : 'Select'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;