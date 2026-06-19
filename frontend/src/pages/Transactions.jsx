import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/index.js';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/wallet/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getIsCredit = (tx) => {
    return tx.type === 'deposit' || (tx.type === 'transfer' && tx.recipient?._id === user?.id);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'in') return getIsCredit(tx);
    if (filter === 'out') return !getIsCredit(tx);
    return true;
  });

  const getIcon = (tx) => {
    if (tx.type === 'deposit') return <ArrowDownLeft size={18} className="text-[#00C48C]" />;
    if (tx.type === 'withdrawal') return <ArrowUpRight size={18} className="text-[#EF4444]" />;
    return <ArrowLeftRight size={18} className={getIsCredit(tx) ? 'text-[#00C48C]' : 'text-[#EF4444]'} />;
  };

  const getDescription = (tx) => {
    if (tx.type === 'deposit') return 'Money added';
    if (tx.type === 'withdrawal') return 'Money withdrawn';
    if (tx.type === 'transfer') {
      const isCredit = getIsCredit(tx);
      const otherParty = isCredit ? tx.sender : tx.recipient;
      return isCredit
        ? `From ${otherParty?.name || 'Unknown'}`
        : `To ${otherParty?.name || 'Unknown'}`;
    }
    return tx.type;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Transactions</h1>
        <p className="text-[#6B7280] mt-1">Your full transaction history</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'in', 'out'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              filter === f
                ? 'bg-[#2563EB] text-white'
                : 'bg-white text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F4F6FA]'
            }`}
          >
            {f === 'all' ? 'All' : f === 'in' ? 'Money in' : 'Money out'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        {loading ? (
          <p className="text-[#6B7280] text-sm">Loading...</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="text-[#6B7280] text-sm">No transactions found</p>
        ) : (
          <div className="space-y-1">
            {filteredTransactions.map((tx) => {
              const isCredit = getIsCredit(tx);
              return (
                <div key={tx._id} className="flex items-center justify-between py-4 border-b border-[#F4F6FA] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-50' : 'bg-red-50'}`}>
                      {getIcon(tx)}
                    </div>
                    <div>
                      <p className="font-medium text-[#111827] text-sm">{getDescription(tx)}</p>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {tx.note && ` · ${tx.note}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${isCredit ? 'text-[#00C48C]' : 'text-[#EF4444]'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-[#6B7280]">{formatCurrency(tx.balanceAfter)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;