import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Land } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Maximize2, Tag, Clock, CheckCircle, XCircle, Phone, Mail, IdCard, ArrowLeft, Share2, Shield, Facebook, Instagram, Linkedin, Twitter, MessageCircle } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

const LandDetailPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const fetchLand = async () => {
      if (!code) return;
      setLoading(true);
      const result = await api.getLandById(code);
      if (result.land) {
        setLand(result.land);
      }
      setLoading(false);
    };
    fetchLand();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse grid md:grid-cols-2 gap-8">
            <div className="aspect-[4/3] bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Land Not Found</h2>
          <p className="text-gray-500 mb-6">The land with code "{code}" could not be found.</p>
          <Link to="/marketplace" className="px-6 py-3 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800">
            Back to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isSold = land.status === 'sold';
  const isApproved = land.status === 'approved';
  const canShowContact = isApproved && land.advertisement_paid;
  const images = land.images?.length ? land.images : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left - Images */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className={`relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 mb-3 ${isSold ? 'grayscale' : ''}`}>
              <img
                src={images[selectedImage]}
                alt={`Land in ${land.city}`}
                className="w-full h-full object-cover"
              />
              {isSold && (
                <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                  <div className="bg-red-600 text-white px-8 py-4 rounded-xl text-center shadow-2xl">
                    <XCircle className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-2xl font-bold">SOLD OUT</p>
                    {land.sold_at && (
                      <p className="text-sm mt-1 opacity-90">
                        {new Date(land.sold_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-mono rounded-lg">
                  {land.land_code}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-blue-600 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{land.description || 'No description available.'}</p>
            </div>

            {/* Map Location */}
            {land.map_location && (
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">{(land.map_location as any).address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {(land.map_location as any).lat}, Lng: {(land.map_location as any).lng}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status */}
            <div className="flex items-center gap-2">
              {isSold ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                  <XCircle className="w-4 h-4" /> SOLD OUT
                </span>
              ) : isApproved ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                  <CheckCircle className="w-4 h-4" /> Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full">
                  <Clock className="w-4 h-4" /> Pending Review
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full capitalize">
                <Shield className="w-3.5 h-3.5" /> {land.registration_type} Registration
              </span>
            </div>

            {/* Price Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className={`text-3xl font-bold mb-1 ${isSold ? 'text-gray-400 line-through' : 'text-blue-900'}`}>
                {formatPrice(land.total_price)}
              </p>
              <p className="text-sm text-gray-500">{formatPrice(land.price_per_sqm)} per m²</p>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Land Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{land.city}, {land.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Land Size</p>
                    <p className="text-sm font-medium text-gray-900">{land.size_sqm.toLocaleString()} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Land Code</p>
                    <p className="text-sm font-mono font-medium text-gray-900">{land.land_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Listed</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(land.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Contact - Only shown after approval + payment */}
            {canShowContact && !isSold && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Verified Seller Contact</h3>
                {showContact ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 font-bold">{land.owner_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{land.owner_name}</p>
                        <p className="text-xs text-gray-500">Verified Seller</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <a href={`tel:${land.owner_phone}`} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">{land.owner_phone}</span>
                      </a>
                      <a href={`mailto:${land.owner_email}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">{land.owner_email}</span>
                      </a>
                      {land.owner_id_number && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <IdCard className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">ID: {land.owner_id_number}</span>
                        </div>
                      )}
                    </div>
                    {/* Social Media Contact */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Connect on Social Media</p>
                      <div className="flex gap-2">
                        <a href={`https://wa.me/${land.owner_phone?.replace(/\s/g, '').replace('+', '')}`} target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                          <MessageCircle className="w-4 h-4 text-white" />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                          <Facebook className="w-4 h-4 text-white" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-pink-600 rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors">
                          <Instagram className="w-4 h-4 text-white" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors">
                          <Twitter className="w-4 h-4 text-white" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 bg-blue-800 rounded-lg flex items-center justify-center hover:bg-blue-900 transition-colors">
                          <Linkedin className="w-4 h-4 text-white" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContact(true)}
                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors text-sm"
                  >
                    Show Seller Contact
                  </button>
                )}
              </div>
            )}

            {/* Share */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share This Listing
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandDetailPage;
