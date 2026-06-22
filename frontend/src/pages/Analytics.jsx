import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/index.js';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563EB', '#00C48C', '#F59E0B'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/wallet/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Analytics</h1>
        <p className="text-[#6B7280] mt-1">Your money, visualised</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-2">
            <TrendingUp size={16} className="text-[#00C48C]" />
            Total in
          </div>
          <p className="text-2xl font-bold text-[#111827]">{formatCurrency(data?.totalIn || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="flex items-center gap-2 text-[#6B7280] text-sm mb-2">
            <TrendingDown size={16} className="text-[#EF4444]" />
            Total out
          </div>
          <p className="text-2xl font-bold text-[#111827]">{formatCurrency(data?.totalOut || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5">
          <div className="text-[#6B7280] text-sm mb-2">Net flow</div>
          <p className={`text-2xl font-bold ${data?.net >= 0 ? 'text-[#00C48C]' : 'text-[#EF4444]'}`}>
            {formatCurrency(data?.net || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <h3 className="font-semibold text-[#111827] mb-4">Last 30 days</h3>
          {data?.dailyBreakdown?.length === 0 ? (
            <p className="text-[#6B7280] text-sm">No activity in the last 30 days</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data?.dailyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F6FA" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                />
                <Line type="monotone" dataKey="in" stroke="#00C48C" strokeWidth={2} name="Money in" dot={false} />
                <Line type="monotone" dataKey="out" stroke="#EF4444" strokeWidth={2} name="Money out" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <h3 className="font-semibold text-[#111827] mb-4">Breakdown by type</h3>
          {data?.typeBreakdown?.length === 0 ? (
            <p className="text-[#6B7280] text-sm">No transactions yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.typeBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data?.typeBreakdown?.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;