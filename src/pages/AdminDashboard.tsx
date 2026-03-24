import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Land, LandPayment } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, CheckCircle, XCircle, Clock, MapPin, Eye, Trash2, BarChart3, Users, FileText, CreditCard, Loader2, AlertCircle, Megaphone } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState<Land[]>([]);
  const [payments, setPayments] = useState<LandPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'lands' | 'payments' | 'ads'>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [adTitle, setAdTitle] = useState('');
  const [adContent, setAdContent] = useState('');
  const [ads, setAds] = useState<{id: number; title: string; content: string; active: boolean; createdAt: string}[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      navigate('/login');
      return;
    }
    fetchData();
    const savedAds = localStorage.getItem('land_ads');
    if (savedAds) setAds(JSON.parse(savedAds));
  }, [user, isAdmin, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [landsRes, transactionsRes, statsRes] = await Promise.all([
        api.getLands(),
        api.getTransactions(),
        api.getStats(),
      ]);
      if (landsRes.lands) setLands(landsRes.lands);
      if (transactionsRes.transactions) setPayments(transactionsRes.transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (landId: string) => {
    setActionLoading(landId);
    try {
      const result = await api.approveLand(landId);
      if (result.error) {
        alert('Error: ' + result.error);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setActionLoading(null);
  };

  const handleReject = async (landId: string) => {
    setActionLoading(landId);
    try {
      const result = await api.rejectLand(landId);
      if (result.error) {
        alert('Error: ' + result.error);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setActionLoading(null);
  };

  const handleMarkSold = async (landId: string) => {
    setActionLoading(landId);
    await api.updateLand(landId, { status: 'sold', sold_at: new Date().toISOString() });
    await fetchData();
    setActionLoading(null);
  };

  const handleMarkUnsold = async (landId: string) => {
    setActionLoading(landId);
    await api.updateLand(landId, { status: 'approved', sold_at: null });
    await fetchData();
    setActionLoading(null);
  };

  const handleCreateAd = () => {
    if (!adTitle || !adContent) return;
    const newAd = { id: Date.now(), title: adTitle, content: adContent, active: true, createdAt: new Date().toISOString() };
    const updated = [newAd, ...ads];
    setAds(updated);
    localStorage.setItem('land_ads', JSON.stringify(updated));
    setAdTitle('');
    setAdContent('');
  };

  const toggleAd = (id: number) => {
    const updated = ads.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setAds(updated);
    localStorage.setItem('land_ads', JSON.stringify(updated));
  };

  const deleteAd = (id: number) => {
    const updated = ads.filter(a => a.id !== id);
    setAds(updated);
    localStorage.setItem('land_ads', JSON.stringify(updated));
  };

  const stats = {
    totalLands: lands.length,
    pending: lands.filter(l => l.status === 'pending').length,
    approved: lands.filter(l => l.status === 'approved').length,
    sold: lands.filter(l => l.status === 'sold').length,
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    totalPayments: payments.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage land registrations, payments, and advertisements</p>
          </div>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Administrator</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'lands', label: 'Land Listings', icon: MapPin },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'ads', label: 'Advertisements', icon: Megaphone },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Lands', value: stats.totalLands, icon: MapPin, color: 'bg-blue-50 text-blue-600' },
                { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Sold', value: stats.sold, icon: XCircle, color: 'bg-red-50 text-red-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900">Revenue</h3>
                </div>
                <p className="text-3xl font-bold text-emerald-600">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">From {payments.filter(p => p.status === 'completed').length} completed payments</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                </div>
                <div className="space-y-2">
                  {['mtn_momo', 'orange_money', 'uba_bank', 'paypal'].map(method => {
                    const count = payments.filter(p => p.method === method && p.status === 'completed').length;
                    return (
                      <div key={method} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">{method.replace('_', ' ')}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lands Management */}
        {activeTab === 'lands' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Land Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Owner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lands.map(land => (
                    <tr key={land._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{land.land_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{land.owner_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{land.city}, {land.region}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(land.total_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] font-medium rounded-full ${
                          land.registration_type === 'manual' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {land.registration_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${
                          land.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          land.status === 'sold' ? 'bg-red-100 text-red-700' :
                          land.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {land.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/land/${land.land_code}`)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="View">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          {land.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(land._id)}
                                disabled={actionLoading === land._id}
                                className="p-1.5 hover:bg-emerald-50 rounded-lg" title="Approve"
                              >
                                {actionLoading === land._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                              </button>
                              <button
                                onClick={() => handleReject(land._id)}
                                disabled={actionLoading === land._id}
                                className="p-1.5 hover:bg-red-50 rounded-lg" title="Reject"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </button>
                            </>
                          )}
                          {land.status === 'approved' && (
                            <button
                              onClick={() => handleMarkSold(land._id)}
                              disabled={actionLoading === land._id}
                              className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-medium rounded-lg hover:bg-red-100"
                            >
                              Mark Sold
                            </button>
                          )}
                          {land.status === 'sold' && (
                            <button
                              onClick={() => handleMarkUnsold(land._id)}
                              disabled={actionLoading === land._id}
                              className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-medium rounded-lg hover:bg-emerald-100"
                            >
                              Mark Unsold
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{payment.reference}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(Number(payment.amount))}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{payment.method?.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${
                          payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('en-GB') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Advertisements Management */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Create New Advertisement</h3>
              <div className="space-y-3">
                <input type="text" value={adTitle} onChange={e => setAdTitle(e.target.value)}
                  placeholder="Ad Title" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
                <textarea value={adContent} onChange={e => setAdContent(e.target.value)} rows={3}
                  placeholder="Ad Content / Announcement" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none" />
                <button onClick={handleCreateAd} disabled={!adTitle || !adContent}
                  className="px-6 py-3 bg-blue-900 text-white font-medium rounded-xl hover:bg-blue-800 disabled:opacity-50 text-sm">
                  Publish Advertisement
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {ads.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No advertisements created yet</p>
                </div>
              )}
              {ads.map(ad => (
                <div key={ad.id} className={`bg-white rounded-xl border p-5 ${ad.active ? 'border-emerald-200' : 'border-gray-200 opacity-60'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{ad.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{ad.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(ad.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleAd(ad.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-full ${ad.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {ad.active ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => deleteAd(ad.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
