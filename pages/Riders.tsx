import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Phone, MapPin, MoreHorizontal, MessageSquare, AlertCircle } from 'lucide-react';
import { getDrivers, inviteDriver as apiInviteDriver, startConversation as apiStartConversation, updateDriverStatus } from '../services/api';
import { Driver } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to auto-fit map bounds to markers
const FitBounds = ({ markers }: { markers: Driver[] }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(
      markers.map(m => [Number(m.current_latitude), Number(m.current_longitude)])
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
};

const Riders = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState<Driver[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', phone: '' });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const activeRiders = riders.filter(r => r.status === 'active' && r.current_latitude && r.current_longitude);

  const handleStatusUpdate = async (riderId: number, newStatus: 'active' | 'suspended' | 'terminated') => {
    try {
      await updateDriverStatus(riderId, newStatus);
      setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: newStatus } : r));
      setOpenMenuId(null);
    } catch (err) {
      console.error("Failed to update status", err);
      alert('Failed to update status by API');
    }
  };

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDrivers();
      const ridersArray = Array.isArray(data) ? data : (data as any)?.results || [];
      setRiders(ridersArray);
    } catch (err) {
      console.error('Failed to load riders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load riders');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await apiInviteDriver(inviteData);
      setShowInviteForm(false);
      setInviteData({ name: '', email: '', phone: '' });
      alert('Invitation sent successfully!');
    } catch (err) {
      console.error('Failed to invite driver:', err);
      alert(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleStartChat = async (userId: number) => {
    try {
      const conversation = await apiStartConversation(userId);
      navigate('/chat', { state: { conversationId: (conversation as any).id } });
    } catch (err) {
      console.error("Failed to start chat", err);
      alert(err instanceof Error ? err.message : 'Failed to start conversation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riders Management</h1>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Invite Rider
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
          <button onClick={loadRiders} className="ml-auto text-red-600 hover:underline text-sm">Retry</button>
        </div>
      )}

      {/* Invite Driver Drawer */}
      {showInviteForm && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowInviteForm(false)}
          />

          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="text-indigo-600" size={24} />
                Invite New Rider
              </h2>
              <button
                onClick={() => setShowInviteForm(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-700 dark:text-indigo-300 text-sm">
                Send an invitation to a new rider. They will receive an email with instructions to join your fleet.
              </div>

              <form onSubmit={handleInvite} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                    className="w-full mt-2 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    className="w-full mt-2 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="rider@example.com"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={inviteData.phone}
                    onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })}
                    className="w-full mt-2 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="+234..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={inviting}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {inviting ? 'Sending Invitation...' : 'Send Invitation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteForm(false)}
                    className="w-full mt-3 text-gray-500 dark:text-gray-400 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Grid of Riders & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rider List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading riders...</div>
          ) : riders.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
              No riders found. Invite your first rider to get started.
            </div>
          ) : (
            riders.map(rider => (
              <div key={rider.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-lg">
                    {rider.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{rider.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Phone size={12} /> {rider.phone || 'N/A'}</span>
                      <span className="flex items-center gap-1">★ {rider.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${rider.status === 'active' ? 'bg-green-100 text-green-700' :
                    rider.status === 'suspended' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {rider.status}
                  </span>
                  <button
                    onClick={() => rider.user && handleStartChat(rider.user)}
                    disabled={!rider.user}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={rider.user ? "Chat with Rider" : "Rider has no user account"}
                  >
                    <MessageSquare size={18} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === rider.id ? null : rider.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {openMenuId === rider.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-10 py-1">
                        <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Change Status
                        </div>
                        <button
                          onClick={() => handleStatusUpdate(rider.id, 'active')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Set Active
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(rider.id, 'suspended')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                          Suspend Driver
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(rider.id, 'terminated')}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                          Terminate Driver
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Live Fleet Map */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[500px]">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-indigo-600" />
            Live Fleet Map
          </h3>
          <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg relative overflow-hidden z-0">
            <MapContainer
              center={[6.5244, 3.3792]}
              zoom={12}
              style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitBounds markers={activeRiders} />

              {/* Render Driver Markers */}
              {activeRiders.map(rider => (
                <Marker
                  key={rider.id}
                  position={[Number(rider.current_latitude), Number(rider.current_longitude)]}
                >
                  <Popup>
                    <div className="p-1">
                      <h5 className="font-bold text-sm">{rider.name}</h5>
                      <p className="text-xs text-gray-500">{rider.vehicle || 'Rider'}</p>
                      <span className="text-green-600 text-xs font-bold">Active</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riders;
