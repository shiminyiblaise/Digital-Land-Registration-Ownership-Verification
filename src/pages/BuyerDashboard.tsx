import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Land } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Search, Heart, ShoppingCart, Clock, Eye, Loader2, Home, FileText, CheckCircle, Trash2, Plus } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

interface CartItem {
  land_id: Land;
  added_at: string;
}

const BuyerDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [lands, setLands] = useState<Land[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'cart' | 'purchased'>('marketplace');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [landsRes, cartRes] = await Promise.all([
        api.getMarketplace(),
        api.getCart()
      ]);
      if (landsRes.lands) setLands(landsRes.lands);
      if (cartRes && cartRes.items) {
        setCart(cartRes.items);
        setCartTotal(cartRes.total || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleAddToCart = async (landId: string) => {
    setAddingToCart(landId);
    const result = await api.addToCart(landId);
    if (!result.error) {
      await fetchData();
    }
    setAddingToCart(null);
  };

  const handleRemoveFromCart = async (landId: string) => {
    await api.removeFromCart(landId);
    await fetchData();
  };

  const handleClearCart = async () => {
    await api.clearCart();
    await fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
          <p className="text-gray-500 mt-1">Browse and purchase lands from the marketplace</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{lands.length}</p>
                <p className="text-sm text-gray-500">Available Lands</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{cart.length}</p>
                <p className="text-sm text-gray-500">In Cart</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Heart className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Saved Lands</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-4 h-4 inline-block mr-2" />
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'cart'
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="w-4 h-4 inline-block mr-2" />
              Cart ({cart.length})
            </button>
            <button
              onClick={() => setActiveTab('purchased')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'purchased'
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4 inline-block mr-2" />
              Purchases
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'marketplace' ? (
          <div>
            {lands.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No lands available</h3>
                <p className="text-gray-500 mb-4">Check back later for new listings</p>
                <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800">
                  Browse Full Marketplace
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lands.slice(0, 6).map(land => (
                  <div key={land._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}
                        alt={land.city}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                          land.status === 'sold' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {land.status === 'sold' ? 'SOLD' : 'AVAILABLE'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-500">{land.land_code}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                          land.property_type === 'house_under_construction' ? 'bg-amber-100 text-amber-700' :
                          land.property_type === 'house_completed' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {land.property_type === 'house_under_construction' ? 'Under Construction' :
                           land.property_type === 'house_completed' ? 'Completed House' : 'Land'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{land.city}, {land.region}</h3>
                      <p className="text-sm text-gray-500 mb-3">{land.size_sqm.toLocaleString()} m²</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-blue-900">{formatPrice(land.total_price)}</p>
                        <div className="flex gap-2">
                          {land.status !== 'sold' && (
                            <button
                              onClick={() => handleAddToCart(land._id)}
                              disabled={addingToCart === land._id}
                              className="px-3 py-1.5 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50"
                            >
                              {addingToCart === land._id ? 'Adding...' : 'Add to Cart'}
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/land/${land.land_code}`)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {lands.length > 6 && (
              <div className="text-center mt-6">
                <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800">
                  View All {lands.length} Lands
                </Link>
              </div>
            )}
          </div>
        ) : activeTab === 'cart' ? (
          <div>
            {cart.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-4">Add properties from the marketplace</p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Property</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Size</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price per m²</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cart.map((item) => (
                          <tr key={item.land_id._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.land_id.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100'}
                                  alt={item.land_id.city}
                                  className="w-16 h-12 object-cover rounded-lg"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.land_id.land_code}</p>
                                  <p className="text-xs text-gray-500 capitalize">{item.land_id.property_type?.replace('_', ' ') || 'Land'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.land_id.city}, {item.land_id.region}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.land_id.size_sqm?.toLocaleString()} m²</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatPrice(item.land_id.price_per_sqm)}</td>
                            <td className="px-4 py-3 text-sm font-bold text-blue-900">{formatPrice(item.land_id.total_price)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/land/${item.land_id.land_code}`)}
                                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4 text-gray-500" />
                                </button>
                                <button
                                  onClick={() => handleRemoveFromCart(item.land_id._id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Price Calculator Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Price Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Number of Properties</span>
                      <span className="font-medium">{cart.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Registration Fee</span>
                      <span className="font-medium">0 FCFA</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-blue-900">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={handleClearCart}
                      className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                    >
                      Clear Cart
                    </button>
                    <button
                      className="flex-1 py-3 px-4 bg-blue-900 text-white font-medium rounded-xl hover:bg-blue-800"
                    >
                      Proceed to Purchase
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-500 mb-4">Browse the marketplace to find your perfect land</p>
            <button
              onClick={() => setActiveTab('marketplace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800"
            >
              Browse Marketplace
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BuyerDashboard;
