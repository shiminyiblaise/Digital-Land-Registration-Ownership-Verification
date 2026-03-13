import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Land } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Shield, CheckCircle, XCircle, Clock, MapPin, Maximize2, Tag, User, Calendar, Loader2, AlertTriangle } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

const VerifyLandPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initialCode = searchParams.get('code');
    if (initialCode) {
      setCode(initialCode);
      handleSearch(initialCode);
    }
  }, []);

  const handleSearch = async (searchCode?: string) => {
    const queryCode = (searchCode || code).trim().toUpperCase();
    if (!queryCode) return;

    setLoading(true);
    setError('');
    setSearched(true);

    const { data, error: dbError } = await supabase
      .from('lands')
      .select('*')
      .eq('land_code', queryCode)
      .single();

    if (dbError || !data) {
      setLand(null);
      setError('No land found with this code');
    } else {
      setLand(data);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved': return { icon: CheckCircle, label: 'Verified & Approved', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'sold': return { icon: XCircle, label: 'Sold', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'pending': return { icon: Clock, label: 'Pending Verification', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'rejected': return { icon: AlertTriangle, label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default: return { icon: Clock, label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-emerald-800 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Land Ownership Verification</h1>
          <p className="text-blue-200 mb-8">Enter a unique land code to verify ownership and registration status</p>

          <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter land code (e.g., LND-2024-001)"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Verify
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Searching land records...</p>
          </div>
        )}

        {!loading && searched && !land && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Record Found</h3>
            <p className="text-gray-500 mb-1">No land registration found for code: <span className="font-mono font-bold">{code}</span></p>
            <p className="text-sm text-gray-400">Please verify the code and try again</p>
          </div>
        )}

        {!loading && land && (
          <div className="space-y-6">
            {/* Status Card */}
            {(() => {
              const config = getStatusConfig(land.status);
              return (
                <div className={`${config.bg} border ${config.border} rounded-xl p-6 flex items-center gap-4`}>
                  <div className={`w-14 h-14 ${config.bg} rounded-full flex items-center justify-center`}>
                    <config.icon className={`w-7 h-7 ${config.color}`} />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
                    <p className="text-sm text-gray-600">Land Code: <span className="font-mono font-bold">{land.land_code}</span></p>
                  </div>
                </div>
              );
            })()}

            {/* Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Land Registration Details</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { icon: Tag, label: 'Land Code', value: land.land_code },
                  { icon: User, label: 'Registered Owner', value: land.owner_name },
                  { icon: MapPin, label: 'Location', value: `${land.city}, ${land.region}` },
                  { icon: Maximize2, label: 'Land Size', value: `${land.size_sqm.toLocaleString()} m²` },
                  { icon: Tag, label: 'Price per m²', value: formatPrice(land.price_per_sqm) },
                  { icon: Tag, label: 'Total Price', value: formatPrice(land.total_price) },
                  { icon: Shield, label: 'Registration Type', value: land.registration_type === 'manual' ? 'Manual (Anti-Fraud Verified)' : 'Online Registration' },
                  { icon: Calendar, label: 'Registration Date', value: new Date(land.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <item.icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))}
                {land.status === 'sold' && land.sold_at && (
                  <div className="flex items-center gap-4 px-6 py-4 bg-red-50">
                    <Clock className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-red-500">Sold On</p>
                      <p className="text-sm font-medium text-red-700">
                        {new Date(land.sold_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* View Full Listing */}
            <div className="text-center">
              <Link
                to={`/land/${land.land_code}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white font-medium rounded-xl hover:bg-blue-800 transition-colors"
              >
                View Full Listing
              </Link>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!searched && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: Shield, title: 'Secure Verification', desc: 'All land records are securely stored and verified by government officers.' },
              { icon: Search, title: 'Instant Results', desc: 'Get immediate verification results with complete ownership details.' },
              { icon: CheckCircle, title: 'Anti-Fraud System', desc: 'Manual registrations include facial recognition and ID verification.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VerifyLandPage;
