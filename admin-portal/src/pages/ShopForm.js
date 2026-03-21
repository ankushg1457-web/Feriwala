import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ShopForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      api.get(`/shops/${id}`).then(res => reset(res.data.data)).catch(() => toast.error('Shop not found'));
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (id) {
        await api.put(`/shops/${id}`, data);
        toast.success('Shop updated!');
      } else {
        await api.post('/admin/shops', {
          ...data,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        });
        toast.success('Shop registered!');
      }
      navigate('/shops');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {id ? 'Edit Shop' : 'Register New Shop'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-8 max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
            <input {...register('name', { required: true })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
            {errors.name && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Code *</label>
            <input {...register('code', { required: true })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="e.g. FW-DEL-01" />
            {errors.code && <span className="text-red-500 text-xs">Required</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows="3" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
          <input {...register('addressLine1', { required: true })} className="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
          <input {...register('addressLine2')} className="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input {...register('city', { required: true })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input {...register('state', { required: true })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
            <input {...register('pincode', { required: true })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
            <input {...register('latitude', { required: true })} type="number" step="any" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
            <input {...register('longitude', { required: true })} type="number" step="any" className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
            <input {...register('deliveryRadiusKm')} type="number" step="0.5" defaultValue="5" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (₹)</label>
            <input {...register('minOrderAmount')} type="number" step="0.01" defaultValue="0" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
            <input {...register('deliveryFee')} type="number" step="0.01" defaultValue="0" className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Saving...' : (id ? 'Update Shop' : 'Register Shop')}
          </button>
          <button type="button" onClick={() => navigate('/shops')} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
