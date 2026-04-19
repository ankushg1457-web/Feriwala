import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6'];
const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString()}`;

const buildShopStats = (products = [], orders = []) => {
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const today = new Date().toDateString();
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today).length;
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled').length;
  const repeatCustomers = Object.values(
    orders.reduce((acc, order) => {
      const key = order.userId || order.phone || order.id;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).filter((count) => count > 1).length;

  const recentOrders = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - index));
    const label = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = orders.filter((order) => new Date(order.createdAt).toDateString() === day.toDateString()).length;
    return { date: label, orders: count };
  });

  const statusBreakdown = Object.entries(
    orders.reduce((acc, order) => {
      acc[order.status || 'pending'] = (acc[order.status || 'pending'] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return {
    totalRevenue,
    avgOrderValue,
    totalOrders: orders.length,
    todayOrders,
    cancellationRate: orders.length ? ((cancelledOrders / orders.length) * 100).toFixed(1) : '0.0',
    repeatCustomers,
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.isActive).length,
    lowStock: products.filter((product) => Number(product.inventory?.quantity ?? 0) <= 5).length,
    recentOrders,
    statusBreakdown: statusBreakdown.length ? statusBreakdown : [{ status: 'No Orders', count: 1 }],
    recentList: orders.slice(0, 5),
  };
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (user?.role === 'shop_admin' && user?.shopId) {
          const [productsRes, ordersRes] = await Promise.all([
            api.get('/products', { params: { shopId: user.shopId, limit: 100 } }),
            api.get(`/orders/shop/${user.shopId}`, { params: { limit: 50 } }),
          ]);

          setStats(buildShopStats(productsRes.data.data || [], ordersRes.data.data || []));
        } else {
          const res = await api.get('/admin/dashboard');
          setStats(res.data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadStats();
  }, [user?.role, user?.shopId]);

  const isShopAdmin = user?.role === 'shop_admin';

  const cards = stats ? (
    isShopAdmin
      ? [
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: 'bg-emerald-500' },
          { label: 'Avg Order Value', value: formatCurrency(stats.avgOrderValue), color: 'bg-blue-500' },
          { label: 'Total Orders', value: stats.totalOrders, color: 'bg-purple-500' },
          { label: 'Today Orders', value: stats.todayOrders, color: 'bg-orange-500' },
          { label: 'Active Products', value: stats.activeProducts, color: 'bg-cyan-500' },
          { label: 'Low Stock Items', value: stats.lowStock, color: 'bg-rose-500' },
        ]
      : [
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: 'bg-emerald-500' },
          { label: 'Avg Order Value', value: formatCurrency(stats.avgOrderValue), color: 'bg-blue-500' },
          { label: 'Total Orders', value: stats.totalOrders, color: 'bg-purple-500' },
          { label: "Today's Orders", value: stats.todayOrders, color: 'bg-orange-500' },
          { label: 'Cancellation Rate', value: `${stats.cancellationRate}%`, color: 'bg-rose-500' },
          { label: 'Repeat Customers', value: stats.repeatCustomers, color: 'bg-cyan-500' },
        ]
  ) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{isShopAdmin ? 'Shop Overview' : 'Dashboard'}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isShopAdmin
            ? 'Monitor product listings, order flow, and stock health for your shop.'
            : 'Track revenue, order quality, and shop performance in one place.'}
        </p>
      </div>

      {!stats ? (
        <p className="text-gray-500">Loading stats...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4`}>
                  •
                </div>
                <p className="text-gray-600 text-sm">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Last 7 Days</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.recentOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Mix</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.statusBreakdown} dataKey="count" nameKey="status" outerRadius={90} label>
                      {stats.statusBreakdown.map((entry, index) => (
                        <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {isShopAdmin ? (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Catalog Snapshot</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Total Products</span><span className="font-semibold">{stats.totalProducts}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Active Products</span><span className="font-semibold">{stats.activeProducts}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Low Stock</span><span className="font-semibold">{stats.lowStock}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Cancellation Rate</span><span className="font-semibold">{stats.cancellationRate}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Repeat Customers</span><span className="font-semibold">{stats.repeatCustomers}</span></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {stats.recentList.length === 0 ? (
                      <p className="text-gray-500 text-sm">No recent orders yet.</p>
                    ) : (
                      stats.recentList.map((order) => (
                        <div key={order.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-800">{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">{order.status?.replace(/_/g, ' ')}</p>
                          </div>
                          <p className="font-semibold text-gray-800">{formatCurrency(order.total)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Shops</h3>
                  <div className="space-y-3">
                    {stats.topShops.map((shop, index) => (
                      <div key={shop.shopId} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">#{index + 1} {shop.name}</p>
                          <p className="text-sm text-gray-500">{shop.orders} orders</p>
                        </div>
                        <p className="font-semibold text-gray-800">{formatCurrency(shop.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Snapshot</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Total Shops</span><span className="font-semibold">{stats.totalShops}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Users</span><span className="font-semibold">{stats.totalUsers}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Active Products</span><span className="font-semibold">{stats.totalProducts}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Revenue</span><span className="font-semibold">{formatCurrency(stats.totalRevenue)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Repeat Customers</span><span className="font-semibold">{stats.repeatCustomers}</span></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

