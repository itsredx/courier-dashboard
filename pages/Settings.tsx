import React, { useState, useEffect } from 'react';
import { Save, Building, DollarSign, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { mockApi } from '../services/mockService';
import { CompanyProfile, PriceTier, DistanceZone } from '../types';

const SettingsPage = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [distanceZones, setDistanceZones] = useState<DistanceZone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeModal, setActiveModal] = useState<'tier' | 'zone' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null); // Holds the item being edited or null for new

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, tiers, zones] = await Promise.all([
          mockApi.getCompanyProfile(),
          mockApi.getPriceTiers(),
          mockApi.getDistanceZones()
        ]);
        setProfile(prof);
        setPriceTiers(tiers);
        setDistanceZones(zones);
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) {
      await mockApi.updateCompanyProfile(profile);
      alert("Profile settings saved successfully!");
    }
  };

  // --- Price Tier Handlers ---
  const handleSaveTier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tierData = {
      name: formData.get('name') as string,
      min_weight: Number(formData.get('min_weight')),
      max_weight: Number(formData.get('max_weight')),
      base_price: Number(formData.get('base_price')),
      price_per_km: Number(formData.get('price_per_km')),
    };

    try {
      if (editingItem) {
        await mockApi.updatePriceTier(editingItem.id, tierData);
        setPriceTiers(prev => prev.map(t => t.id === editingItem.id ? { ...tierData, id: editingItem.id } : t));
      } else {
        const newTier = await mockApi.addPriceTier(tierData);
        setPriceTiers(prev => [...prev, newTier]);
      }
      setActiveModal(null);
      setEditingItem(null);
    } catch (err) {
      alert("Failed to save price tier");
    }
  };

  const handleDeleteTier = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this tier?")) {
      await mockApi.deletePriceTier(id);
      setPriceTiers(prev => prev.filter(t => t.id !== id));
    }
  };

  // --- Distance Zone Handlers ---
  const handleSaveZone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const zoneData = {
      name: formData.get('name') as string,
      min_distance: Number(formData.get('min_distance')),
      max_distance: Number(formData.get('max_distance')),
      surcharge_amount: Number(formData.get('surcharge_amount')),
      price_multiplier: Number(formData.get('price_multiplier')),
    };

    try {
      if (editingItem) {
        await mockApi.updateDistanceZone(editingItem.id, zoneData);
        setDistanceZones(prev => prev.map(z => z.id === editingItem.id ? { ...zoneData, id: editingItem.id } : z));
      } else {
        const newZone = await mockApi.addDistanceZone(zoneData);
        setDistanceZones(prev => [...prev, newZone]);
      }
      setActiveModal(null);
      setEditingItem(null);
    } catch (err) {
      alert("Failed to save distance zone");
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this zone?")) {
      await mockApi.deleteDistanceZone(id);
      setDistanceZones(prev => prev.filter(z => z.id !== id));
    }
  };

  if (loading || !profile) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>

      {/* Company Profile */}
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <Building className="text-indigo-600" size={24} />
          <h2 className="text-lg font-bold text-gray-900">Company Profile</h2>
        </div>
        
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700">Company Name</label>
             <input 
               value={profile.name} 
               onChange={e => setProfile({...profile, name: e.target.value})}
               className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" 
             />
          </div>
          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700">Support Email</label>
             <input 
               value={profile.support_email} 
               onChange={e => setProfile({...profile, support_email: e.target.value})}
               className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" 
             />
          </div>
          <div className="space-y-1 md:col-span-2">
             <label className="text-sm font-medium text-gray-700">Address</label>
             <input 
               value={profile.address} 
               onChange={e => setProfile({...profile, address: e.target.value})}
               className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" 
             />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Save size={18} /> Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* Pricing Configuration */}
      <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <DollarSign className="text-green-600" size={24} />
          <h2 className="text-lg font-bold text-gray-900">Pricing Configuration</h2>
        </div>

        <div className="space-y-10">
           {/* Price Tiers */}
           <div>
             <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className="font-bold text-gray-800 text-base">Base Price Tiers</h3>
                  <p className="text-xs text-gray-500">Configure base delivery costs based on package weight.</p>
               </div>
               <button 
                 onClick={() => { setEditingItem(null); setActiveModal('tier'); }}
                 className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-lg font-semibold transition-colors"
               >
                 <Plus size={16} /> Add Tier
               </button>
             </div>
             
             <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="p-3 font-medium">Name</th>
                        <th className="p-3 font-medium">Weight (kg)</th>
                        <th className="p-3 font-medium">Base Price</th>
                        <th className="p-3 font-medium">Per KM</th>
                        <th className="p-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {priceTiers.map(tier => (
                        <tr key={tier.id} className="hover:bg-gray-50 group">
                          <td className="p-3 font-medium text-gray-900">{tier.name}</td>
                          <td className="p-3 text-gray-600">{tier.min_weight} - {tier.max_weight} kg</td>
                          <td className="p-3 text-gray-900">₦{tier.base_price.toLocaleString()}</td>
                          <td className="p-3 text-gray-900">₦{tier.price_per_km}</td>
                          <td className="p-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingItem(tier); setActiveModal('tier'); }} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteTier(tier.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                      {priceTiers.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-gray-500 text-xs">No price tiers defined.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
           </div>

           {/* Distance Zones */}
           <div>
             <div className="flex items-center justify-between mb-4">
               <div>
                  <h3 className="font-bold text-gray-800 text-base">Distance Zones</h3>
                  <p className="text-xs text-gray-500">Apply surcharges or multipliers based on delivery distance.</p>
               </div>
               <button 
                 onClick={() => { setEditingItem(null); setActiveModal('zone'); }}
                 className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-lg font-semibold transition-colors"
               >
                 <Plus size={16} /> Add Zone
               </button>
             </div>
             
             <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="p-3 font-medium">Name</th>
                        <th className="p-3 font-medium">Distance (km)</th>
                        <th className="p-3 font-medium">Surcharge</th>
                        <th className="p-3 font-medium">Multiplier</th>
                        <th className="p-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {distanceZones.map(zone => (
                        <tr key={zone.id} className="hover:bg-gray-50 group">
                          <td className="p-3 font-medium text-gray-900">{zone.name}</td>
                          <td className="p-3 text-gray-600">{zone.min_distance} - {zone.max_distance} km</td>
                          <td className="p-3 text-gray-900">{zone.surcharge_amount > 0 ? `+₦${zone.surcharge_amount.toLocaleString()}` : '-'}</td>
                          <td className="p-3 text-gray-900">{zone.price_multiplier}x</td>
                          <td className="p-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingItem(zone); setActiveModal('zone'); }} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteZone(zone.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                      {distanceZones.length === 0 && (
                        <tr><td colSpan={5} className="p-4 text-center text-gray-500 text-xs">No distance zones defined.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {editingItem ? 'Edit' : 'Add'} {activeModal === 'tier' ? 'Price Tier' : 'Distance Zone'}
              </h3>
              <button onClick={() => { setActiveModal(null); setEditingItem(null); }} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
            </div>
            
            {activeModal === 'tier' ? (
              <form onSubmit={handleSaveTier} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tier Name</label>
                  <input name="name" defaultValue={editingItem?.name} required placeholder="e.g. Standard" className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Min Weight (kg)</label>
                    <input type="number" step="0.1" name="min_weight" defaultValue={editingItem?.min_weight} required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Max Weight (kg)</label>
                    <input type="number" step="0.1" name="max_weight" defaultValue={editingItem?.max_weight} required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Base Price (₦)</label>
                    <input type="number" name="base_price" defaultValue={editingItem?.base_price} required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Price per KM (₦)</label>
                    <input type="number" name="price_per_km" defaultValue={editingItem?.price_per_km} required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                   <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
                   <button type="submit" className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Tier</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveZone} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Zone Name</label>
                  <input name="name" defaultValue={editingItem?.name} required placeholder="e.g. Metro Area" className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Min Dist (km)</label>
                    <input type="number" step="0.1" name="min_distance" defaultValue={editingItem?.min_distance} required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Max Dist (km)</label>
                    <input type="number" step="0.1" name="max_distance" defaultValue={editingItem?.max_distance} required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Surcharge (₦)</label>
                    <input type="number" name="surcharge_amount" defaultValue={editingItem?.surcharge_amount ?? 0} className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Multiplier (x)</label>
                    <input type="number" step="0.1" name="price_multiplier" defaultValue={editingItem?.price_multiplier ?? 1.0} required className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 text-sm" />
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg flex gap-2 items-start border border-amber-100">
                   <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                   <p className="text-xs text-amber-700">Multiplier applies to the total calculated base cost.</p>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                   <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
                   <button type="submit" className="px-6 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save Zone</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
