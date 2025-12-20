import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, Landmark, AlertCircle } from 'lucide-react';
import { getWalletBalance, getTransactions, requestPayout as apiRequestPayout } from '../services/api';
import { Transaction, Wallet as WalletType } from '../types';

const Finance = () => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payoutData, setPayoutData] = useState({
    amount: '',
    bank_name: 'GTBank',
    account_number: '',
    account_name: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletData, txData] = await Promise.all([
        getWalletBalance().catch(() => ({ balance: 0, currency: 'NGN' })),
        getTransactions().catch(() => [])
      ]);
      setWallet(walletData as WalletType);
      const txArray = Array.isArray(txData) ? txData : (txData as any)?.results || [];
      setTransactions(txArray);
    } catch (err) {
      console.error('Failed to load finance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutData.amount || !payoutData.account_number) return;

    setSubmitting(true);
    try {
      await apiRequestPayout({
        amount: Number(payoutData.amount),
        bank_name: payoutData.bank_name,
        account_number: payoutData.account_number,
        account_name: payoutData.account_name,
      });
      setPayoutData({ amount: '', bank_name: 'GTBank', account_number: '', account_name: '' });
      alert('Payout requested successfully!');
      setShowDrawer(false); // Close drawer on success
      loadData(); // Refresh data
    } catch (err) {
      console.error('Payout request failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to request payout');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-gray-500">Loading finance data...</div>;
  }

  return (
    <div className="space-y-6 relative">
      <h1 className="text-2xl font-bold text-gray-900">Finance & Wallet</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
          <button onClick={loadData} className="ml-auto text-red-600 hover:underline text-sm">Retry</button>
        </div>
      )}

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-3 mb-6 opacity-90">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Wallet size={24} />
          </div>
          <span className="font-medium tracking-wide">Available Balance</span>
        </div>
        <div className="mb-8">
          <h2 className="text-4xl font-bold">{wallet?.currency || 'NGN'} {(wallet?.balance || 0).toLocaleString()}</h2>
          <p className="text-sm opacity-70 mt-1">Last updated just now</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDrawer(true)}
            className="flex-1 bg-white text-indigo-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Withdraw
          </button>
          <button className="flex-1 bg-indigo-500/50 text-white border border-white/20 py-2.5 rounded-lg font-semibold hover:bg-indigo-500/70 transition-colors">
            Add Funds
          </button>
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
              {transactions.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No transactions found</td></tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <span className={`flex items-center gap-2 font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900">{t.description}</td>
                    <td className="p-4 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                    <td className={`p-4 text-right font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                      {t.type === 'credit' ? '+' : '-'} ₦{t.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Drawer */}
      {showDrawer && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setShowDrawer(false)}
          />

          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Landmark className="text-indigo-600" />
                Request Payout
              </h2>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-indigo-700 text-sm">
                Available for withdrawal: <br />
                <span className="text-xl font-bold">{wallet?.currency || 'NGN'} {(wallet?.balance || 0).toLocaleString()}</span>
              </div>

              <form onSubmit={handlePayout} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Amount to Withdraw</label>
                  <input
                    type="number"
                    value={payoutData.amount}
                    onChange={(e) => setPayoutData({ ...payoutData, amount: e.target.value })}
                    className="w-full mt-2 p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 font-medium"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 border-t border-gray-100 pt-4">Bank Details</h4>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Bank Name</label>
                    <select
                      value={payoutData.bank_name}
                      onChange={(e) => setPayoutData({ ...payoutData, bank_name: e.target.value })}
                      className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-lg outline-none text-gray-900"
                    >
                      <option>GTBank</option>
                      <option>Zenith Bank</option>
                      <option>Access Bank</option>
                      <option>First Bank</option>
                      <option>UBA</option>
                      <option>Kuda Bank</option>
                      <option>Opay</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Account Number</label>
                    <input
                      type="text"
                      value={payoutData.account_number}
                      onChange={(e) => setPayoutData({ ...payoutData, account_number: e.target.value })}
                      className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-lg outline-none text-gray-900"
                      placeholder="0123456789"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Account Name</label>
                    <input
                      type="text"
                      value={payoutData.account_name}
                      onChange={(e) => setPayoutData({ ...payoutData, account_name: e.target.value })}
                      className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-lg outline-none text-gray-900"
                      placeholder="Account holder name"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                  >
                    {submitting ? 'Processing Request...' : 'Confirm Withdrawal'}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Payouts are usually processed within 24 hours.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Finance;