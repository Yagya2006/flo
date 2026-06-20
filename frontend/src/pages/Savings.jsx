import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/index.js';
import { Plus, X, Trash2 } from 'lucide-react';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [addingTo, setAddingTo] = useState(null);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal? Saved funds will return to your wallet.')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Savings goals</h1>
          <p className="text-[#6B7280] mt-1">Set targets and save towards them</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-5 py-2.5 rounded-xl transition cursor-pointer"
        >
          <Plus size={18} />
          New goal
        </button>
      </div>

      {loading ? (
        <p className="text-[#6B7280]">Loading...</p>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
          <p className="text-[#6B7280]">No savings goals yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
            return (
              <div key={goal._id} className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[#111827]">{goal.name}</h3>
                    {goal.isCompleted && (
                      <span className="text-xs font-medium text-[#00C48C] bg-green-50 px-2 py-0.5 rounded-full">
                        Goal reached
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(goal._id)} className="text-[#9CA3AF] hover:text-[#EF4444] cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-[#111827]">{formatCurrency(goal.savedAmount)}</span>
                    <span className="text-[#6B7280]">of {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-[#F4F6FA] rounded-full h-2.5">
                    <div
                      className="bg-[#2563EB] h-2.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {!goal.isCompleted && (
                  <button
                    onClick={() => setAddingTo(goal)}
                    className="w-full bg-[#F4F6FA] hover:bg-[#E5E7EB] text-[#111827] font-medium py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Add money
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateGoalModal onClose={() => setShowCreate(false)} onSuccess={fetchGoals} />
      )}

      {addingTo && (
        <AddToGoalModal goal={addingTo} onClose={() => setAddingTo(null)} onSuccess={fetchGoals} />
      )}
    </DashboardLayout>
  );
};

const CreateGoalModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/goals', { name, targetAmount: parseFloat(targetAmount) });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#111827]">New savings goal</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Goal name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Holiday fund"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Target amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">£</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="500"
                required
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create goal'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AddToGoalModal = ({ goal, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post(`/goals/${goal._id}/add`, { amount: parseFloat(amount) });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#111827]">Add to "{goal.name}"</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#111827] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">£</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
          >
            {loading ? 'Adding...' : 'Add money'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Savings;