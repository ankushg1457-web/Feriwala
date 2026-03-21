import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setStats(res.data.data)).catch(console.error);
  }, []);

  const cards = stats ? [
    { label: 'Total Shops', value: stats.totalShops, color: 'bg-blue-500' },
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.totalOrders, color: 'bg-purple-500' },
    { label: "Today's Orders", value: stats.todayOrders, color: 'bg-orange-500' },
    { label: 'Active Products', value: stats.totalProducts, color: 'bg-pink-500' },
  ] : [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {!stats ? (
        <p className="text-gray-500">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {cards.map(card => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4`}>
                {card.value}
              </div>
              <p className="text-gray-600 text-sm">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
