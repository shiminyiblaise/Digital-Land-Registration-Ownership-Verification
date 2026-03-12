import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Land } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, CheckCircle, XCircle, Clock, Eye, Loader2, Camera, IdCard, FileCheck, User, MapPin, AlertTriangle } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

const OfficerDashboard: React.FC = () => {
  const { user, isOfficer } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'manual' | 'all'>('pending');
  const [selectedLand, setSelectedLand] = useState<Land | null>(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [facialMatch, setFacialMatch] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [docVerified, setDocVerified] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user || !isOfficer) { navigate('/login'); return; }
    fetchData();
  }, [user, isOfficer]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('lands').select('*').order('created_at', { ascending: false });
    if (data) setLands(data);
    setLoading(false);
  };

  const handleVerifyAndApprove = async () => {
    if (!selectedLand || !user) return;
    setActionLoading(true);

    // Create verification record
    await supabase.from('land_verifications').insert({
      land_id: selectedLand.id,
      officer_id: user.id,
      facial_match: facialMatch,
      id_verified: idVerified,
      document_verified: docVerified,
      notes: verifyNotes,
      status: 'verified',
      verified_at: new Date().toISOString(),
    });

    // Approve the land
    await supabase.from('lands').update({
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    }).eq('id', selectedLand.id);

    setSelectedLand(null);
    resetVerifyForm();
    await fetchData();
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedLand || !user) return;
    setActionLoading(true);

    await supabase.from('land_verifications').insert({
      land_id: selectedLand.id,
      officer_id: user.id,
      facial_match: facialMatch,
      id_verified: idVerified,
      document_verified: docVerified,
      notes: verifyNotes,
      status: 'rejected',
    });

    await supabase.from('lands').update({ status: 'rejected' }).eq('id', selectedLand.id);

    setSelectedLand(null);
    resetVerifyForm();
    await fetchData();
    setActionLoading(false);
  };

  const resetVerifyForm = () => {
    setVerifyNotes('');
    setFacialMatch(false);
    setIdVerified(false);
    setDocVerified(false);
  };

  const filteredLands = activeTab === 'pending' ? lands.filter(l => l.status === 'pending')
    : activeTab === 'manual' ? lands.filter(l => l.registration_type === 'manual')
    : lands;

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
            <h1 className="text-2xl font-bold text-gray-900">Land Officer Dashboard</h1>
            <p className="text-sm text-gray-500">Verify registrations and approve anti-fraud checks</p>
          </div>
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Land Officer</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-amber-600">{lands.filter(l => l.status === 'pending').length}</p>
            <p className="text-xs text-gray-500">Pending Review</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-emerald-600">{lands.filter(l => l.registration_type === 'manual').length}</p>
            <p className="text-xs text-gray-500">Manual Registrations</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-blue-600">{lands.filter(l => l.status === 'approved').length}</p>
            <p className="text-xs text-gray-500">Approved</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { id: 'pending', label: 'Pending Review', count: lands.filter(l => l.status === 'pending').length },
            { id: 'manual', label: 'Manual (Anti-Fraud)', count: lands.filter(l => l.registration_type === 'manual').length },
            { id: 'all', label: 'All Registrations', count: lands.length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
              <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-[10px] rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Land List */}
          <div className="lg:col-span-3 space-y-3">
            {filteredLands.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900">No registrations to review</h3>
              </div>
            ) : (
              filteredLands.map(land => (
                <button
                  key={land.id}
                  onClick={() => { setSelectedLand(land); resetVerifyForm(); }}
                  className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-md ${
                    selectedLand?.id === land.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-gray-500">{land.land_code}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-full ${
                          land.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          land.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>{land.status}</span>
                        {land.registration_type === 'manual' && (
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded-full bg-purple-100 text-purple-700">Anti-Fraud</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{land.owner_name}</p>
                      <p className="text-xs text-gray-500">{land.city}, {land.region}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Verification Panel */}
          <div className="lg:col-span-2">
            {selectedLand ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 space-y-4">
                <h3 className="font-semibold text-gray-900">Verification Panel</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Code</span><span className="font-mono">{selectedLand.land_code}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Owner</span><span className="font-medium">{selectedLand.owner_name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">ID Number</span><span>{selectedLand.owner_id_number || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span>{selectedLand.city}, {selectedLand.region}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Size</span><span>{selectedLand.size_sqm.toLocaleString()} m²</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-medium">{formatPrice(selectedLand.total_price)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="capitalize">{selectedLand.registration_type}</span></div>
                </div>

                {/* Facial Photo */}
                {selectedLand.owner_facial_photo && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Facial Capture</p>
                    <img src={selectedLand.owner_facial_photo} alt="Facial" className="w-32 h-24 object-cover rounded-lg border" />
                  </div>
                )}

                {/* Verification Checklist */}
                {selectedLand.status === 'pending' && (
                  <>
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Verification Checklist</p>
                      {[
                        { label: 'Facial Photo Match', checked: facialMatch, onChange: setFacialMatch, icon: Camera },
                        { label: 'ID Card Verified', checked: idVerified, onChange: setIdVerified, icon: IdCard },
                        { label: 'Documents Verified', checked: docVerified, onChange: setDocVerified, icon: FileCheck },
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" checked={item.checked} onChange={e => item.onChange(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Officer Notes</label>
                      <textarea value={verifyNotes} onChange={e => setVerifyNotes(e.target.value)} rows={3}
                        placeholder="Add verification notes..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleVerifyAndApprove} disabled={actionLoading}
                        className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-1">
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                      </button>
                      <button onClick={handleReject} disabled={actionLoading}
                        className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 disabled:opacity-50 flex items-center justify-center gap-1">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center sticky top-24">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select a registration to verify</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OfficerDashboard;
