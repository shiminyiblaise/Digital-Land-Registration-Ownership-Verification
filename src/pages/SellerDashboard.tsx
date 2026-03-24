import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Land, LandPayment } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import { MapPin, CreditCard, FileText, CheckCircle, XCircle, Clock, Eye, Loader2, Plus, Tag, AlertCircle } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

const SellerDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState<Land[]>([]);
  const [payments, setPayments] = useState<LandPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lands' | 'payments'>('lands');
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; landId: string; landCode: string } | null>(null);
  const [markingSold, setMarkingSold] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    console.log('Fetching data for user:', user.email, user.role);
    try {
      const [landsRes, transactionsRes] = await Promise.all([
        api.getMyLands(),
        api.getTransactions(),
      ]);
      console.log('Lands response:', landsRes);
      console.log('Transactions response:', transactionsRes);
      if (landsRes.lands) setLands(landsRes.lands);
      if (transactionsRes.transactions) setPayments(transactionsRes.transactions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleMarkSold = async (landId: string) => {
    setMarkingSold(landId);
    await api.updateLand(landId, { status: 'sold', sold_at: new Date().toISOString() });
    await fetchData();
    setMarkingSold(null);
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

  const stats = {
    total: lands.length,
    pending: lands.filter(l => l.status === 'pending').length,
    approved: lands.filter(l => l.status === 'approved').length,
    sold: lands.filter(l => l.status === 'sold').length,
    unpaid: lands.filter(l => !l.advertisement_paid && l.status !== 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your land listings and payments</p>
          </div>
          <Link to="/register-land" className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white text-sm font-medium rounded-xl hover:bg-blue-800">
            <Plus className="w-4 h-4" /> Register New Land
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Lands', value: stats.total, icon: MapPin, color: 'text-blue-600 bg-blue-50' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Sold', value: stats.sold, icon: XCircle, color: 'text-red-600 bg-red-50' },
            { label: 'Unpaid Ads', value: stats.unpaid, icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mb-2`}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { id: 'lands', label: 'My Lands', icon: MapPin },
            { id: 'payments', label: 'Payment History', icon: CreditCard },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* My Lands */}
        {activeTab === 'lands' && (
          <div className="space-y-4">
            {lands.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lands Registered</h3>
                <p className="text-sm text-gray-500 mb-4">Start by registering your first land</p>
                <Link to="/register-land" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800">
                  <Plus className="w-4 h-4" /> Register Land
                </Link>
              </div>
            ) : (
              lands.map(land => (
                <div key={land._id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Image */}
                    <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300'} alt="" className="w-full h-full object-cover" />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{land.land_code}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          land.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          land.status === 'sold' ? 'bg-red-100 text-red-700' :
                          land.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {land.status}
                        </span>
                        {!land.advertisement_paid && land.status !== 'rejected' && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700">
                            Ad Unpaid
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{land.city}, {land.region}</p>
                      <p className="text-xs text-gray-500">{land.size_sqm.toLocaleString()} m² &middot; {formatPrice(land.total_price)}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => navigate(`/land/${land.land_code}`)} className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      {!land.advertisement_paid && land.status !== 'rejected' && (
                        <button
                          onClick={() => setPaymentModal({ open: true, landId: land._id, landCode: land.land_code })}
                          className="px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500"
                        >
                          Pay 30,000 FCFA
                        </button>
                      )}
                      {land.status === 'approved' && land.advertisement_paid && (
                        <button
                          onClick={() => handleMarkSold(land._id)}
                          disabled={markingSold === land._id}
                          className="px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                          {markingSold === land._id ? 'Marking...' : 'Mark as Sold'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Payment History */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h3>
                <p className="text-sm text-gray-500">Payment records will appear here after you pay the advertisement fee</p>
              </div>
            ) : (
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
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{p.reference}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatPrice(Number(p.amount))}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{p.method?.replace('_', ' ')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${
                            p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-GB') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <PaymentModal
          isOpen={paymentModal.open}
          onClose={() => setPaymentModal(null)}
          landId={paymentModal.landId}
          landCode={paymentModal.landCode}
          sellerId={user?.id || ''}
          onSuccess={() => { setPaymentModal(null); fetchData(); }}
        />
      )}

      <Footer />
    </div>
  );
};

export default SellerDashboard;
