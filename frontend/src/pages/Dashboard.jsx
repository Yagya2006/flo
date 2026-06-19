import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/index.js';
import AddMoneyModal from '../components/AddMoneyModal';
import { ArrowDownLeft, ArrowUpRight, Send, Plus } from 'lucide-react';


const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);

  const fetchData = async () => {
  try {
    const walletRes = await api.get('/wallet');
    const txRes = await api.get('/wallet/transactions');
    setWallet(walletRes.data);
    setTransactions(txRes.data.slice(0, 5));
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchData();
}, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-[#6B7280]">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">
          Hey, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-[#6B7280] mt-1">Here's what's happening with your money</p>
      </div>

      <div className="bg-[#1A1D2E] rounded-2xl p-8 text-white mb-8">
        <p className="text-gray-400 text-sm font-medium">Total balance</p>
        <h2 className="text-4xl font-bold mt-2">
          {formatCurrency(wallet?.balance || 0)}
        </h2>

        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowAddMoney(true)} className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] px-5 py-2.5 rounded-xl font-medium transition cursor-pointer">
            <Plus size={18} />
            Add money
          </button>
          <button onClick={() => navigate('/send')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl font-medium transition cursor-pointer">
  <Send size={18} />
  Send
</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <h3 className="font-semibold text-[#111827] mb-4">Recent activity</h3>

        {transactions.length === 0 ? (
          <p className="text-[#6B7280] text-sm">No transactions yet</p>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.recipient?._id === user?.id);
              return (
                <div key={tx._id} className="flex items-center justify-between py-3 border-b border-[#F4F6FA] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
                      {isCredit ? (
                        <ArrowDownLeft size={18} className="text-[#00C48C]" />
                      ) : (
                        <ArrowUpRight size={18} className="text-[#EF4444]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#111827] text-sm capitalize">{tx.type}</p>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold text-sm ${isCredit ? 'text-[#00C48C]' : 'text-[#EF4444]'}`}>
                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showAddMoney && (
  <AddMoneyModal
    onClose={() => setShowAddMoney(false)}
    onSuccess={fetchData}
  />
)}
    </DashboardLayout>
  );
};

export default Dashboard;