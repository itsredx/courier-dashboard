import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react';
import { mockApi } from '../services/mockService';
import { Transaction, Wallet as WalletType } from '../types';

const Finance = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutAmount, setPayoutAmount] = useState('');

  useEffect(() => {
    const load = async () => {
      const [w, t] = await Promise.all([mockApi.getWalletBalance(), mockApi.getTransactions()]);
      setWallet(w);
      setTransactions(t);
    };
    load();
  }, []);

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutAmount) return;
    await mockApi.requestPayout(Number(payoutAmount));
    setPayoutAmount('');
    alert('Payout requested successfully. Ref: PAY-88332');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Finance & Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-3 mb-6 opacity-90">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Wallet size={24} />
            </div>
            <span className="font-medium tracking-wide">Available Balance</span>
          </div>
          <div className="mb-8">
            <h2 className="text-4xl font-bold">{wallet?.currency} {wallet?.balance.toLocaleString()}</h2>
            <p className="text-sm opacity-70 mt-1">Last updated just now</p>
          </div>
          <div className="flex gap-3">
             <button className="flex-1 bg-white text-indigo-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
               Withdraw
             </button>
             <button className="flex-1 bg-indigo-500/50 text-white border border-white/20 py-2.5 rounded-lg font-semibold hover:bg-indigo-500/70 transition-colors">
               Add Funds
             </button>
          </div>
        </div>

        {/* Payout Request Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Landmark size={20} className="text-gray-500"/> Request Payout
          </h3>
          <form onSubmit={handlePayout} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Amount</label>
              <input 
                type="number" 
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900" 
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Bank Name</label>
                <select className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900">
                  <option>GTBank</option>
                  <option>Zenith Bank</option>
                  <option>Access Bank</option>
                </select>
              </div>
              <div>
                 <label className="text-xs font-semibold text-gray-500 uppercase">Account Number</label>
                 <input type="text" className="w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900" placeholder="0123456789"/>
              </div>
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-black transition-colors">
              Process Request
            </button>
          </form>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h3 className="font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <span className={`flex items-center gap-2 font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'credit' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-gray-900">{t.description}</td>
                  <td className="p-4 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                  <td className={`p-4 text-right font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                    {t.type === 'credit' ? '+' : '-'} ₦{t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;