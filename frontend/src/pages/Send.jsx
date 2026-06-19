import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/index.js';
import { Send as SendIcon, CheckCircle2 } from 'lucide-react';

const Send = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/wallet/transfer', {
        recipientEmail,
        amount: parseFloat(amount),
        note,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-12 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-[#00C48C]" />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">Money sent!</h2>
          <p className="text-[#6B7280] mt-2">
            £{amount} sent to {recipientEmail}
          </p>
          <div className="flex gap-3 mt-8 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold px-6 py-3 rounded-xl transition cursor-pointer"
            >
              Back to dashboard
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setRecipientEmail('');
                setAmount('');
                setNote('');
              }}
              className="bg-white border border-[#E5E7EB] text-[#111827] font-semibold px-6 py-3 rounded-xl hover:bg-[#F4F6FA] transition cursor-pointer"
            >
              Send another
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">Send money</h1>
          <p className="text-[#6B7280] mt-1">Transfer to another Flo user</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Recipient's email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Amount
              </label>
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
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Note <span className="text-[#9CA3AF]">(optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's it for?"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              <SendIcon size={18} />
              {loading ? 'Sending...' : 'Send money'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Send;