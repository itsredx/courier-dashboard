import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Phone, MapPin, MoreHorizontal, MessageSquare } from 'lucide-react';
import { mockApi } from '../services/mockService';
import { Driver } from '../types';

const Riders = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState<Driver[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await mockApi.getDrivers();
      setRiders(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockApi.inviteDriver({ email: 'test@test.com', name: 'New Driver', phone: '123' });
    setShowInviteForm(false);
    alert('Invitation sent successfully');
  };

  const handleStartChat = async (riderId: number) => {
    try {
      const conversation = await mockApi.startConversation(riderId);
      navigate('/chat', { state: { conversationId: conversation.id } });
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Riders Management</h1>
        <button 
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Invite Rider
        </button>
      </div>

      {showInviteForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-gray-900 mb-4">Invite New Rider</h3>
          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Full Name" required className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            <input type="email" placeholder="Email Address" required className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            <input type="tel" placeholder="Phone Number" required className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" />
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
               <button type="button" onClick={() => setShowInviteForm(false)} className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium">Cancel</button>
               <button type="submit" className="bg-gray-900 text-white hover:bg-black px-6 py-2 rounded-lg text-sm font-medium">Send Invitation</button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Riders & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rider List */}
        <div className="lg:col-span-2 space-y-4">
           {loading ? <p>Loading riders...</p> : riders.map(rider => (
             <div key={rider.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg">
                      {rider.name.charAt(0)}
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900">{rider.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Phone size={12}/> {rider.phone}</span>
                        <span className="flex items-center gap-1">★ {rider.rating}</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                     rider.status === 'active' ? 'bg-green-100 text-green-700' : 
                     rider.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                   }`}>
                      {rider.status}
                   </span>
                   <button 
                     onClick={() => handleStartChat(rider.id)}
                     className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                     title="Chat with Rider"
                   >
                     <MessageSquare size={18} />
                   </button>
                   <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                </div>
             </div>
           ))}
        </div>

        {/* Live Map Simulation */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col h-[500px]">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-indigo-600" />
            Live Fleet Map
          </h3>
          <div className="flex-1 bg-gray-200 rounded-lg relative overflow-hidden group">
            {/* Fake Map Content */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Simulated Pins */}
            {riders.filter(r => r.status === 'active').map((r, i) => (
               <div 
                 key={r.id}
                 className="absolute w-8 h-8 -ml-4 -mt-8 flex flex-col items-center group cursor-pointer"
                 style={{ 
                   top: `${40 + (i * 15)}%`, 
                   left: `${30 + (i * 20)}%`
                 }}
               >
                 <div className="bg-white px-2 py-0.5 rounded shadow text-[10px] font-bold whitespace-nowrap mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   {r.name}
                 </div>
                 <div className="w-4 h-4 bg-indigo-600 border-2 border-white rounded-full shadow-lg animate-pulse"></div>
               </div>
            ))}

            <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-lg shadow-md text-xs font-medium text-gray-600">
               Updating Live...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Riders;
