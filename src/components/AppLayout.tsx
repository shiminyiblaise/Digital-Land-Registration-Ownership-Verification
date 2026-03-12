import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Land } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import LandCard from '@/components/LandCard';
import { MapPin, Shield, FileCheck, Search, ArrowRight, CheckCircle, Users, BarChart3, CreditCard, Loader2, ChevronRight } from 'lucide-react';

const formatPrice = (price: number) => new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [featuredLands, setFeaturedLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<{id: number; title: string; content: string; active: boolean}[]>([]);

  useEffect(() => {
    fetchFeaturedLands();
    // Load active ads
    const savedAds = localStorage.getItem('land_ads');
    if (savedAds) {
      const allAds = JSON.parse(savedAds);
      setAds(allAds.filter((a: any) => a.active));
    }
  }, []);

  const fetchFeaturedLands = async () => {
    const { data } = await supabase
      .from('lands')
      .select('*')
      .eq('status', 'approved')
      .eq('is_advertised', true)
      .eq('advertisement_paid', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (data) setFeaturedLands(data);
    setLoading(false);
  };

  const regions = [
    { name: 'Centre', city: 'Yaoundé', image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400', count: 3 },
    { name: 'Littoral', city: 'Douala', image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=400', count: 4 },
    { name: 'West', city: 'Bafoussam', image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400', count: 1 },
    { name: 'South-West', city: 'Buea', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400', count: 1 },
    { name: 'South', city: 'Kribi', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', count: 1 },
    { name: 'North-West', city: 'Bamenda', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400', count: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Active Ads Banner */}
      {ads.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm font-medium truncate">{ads[0].title}: {ads[0].content}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">How It Works</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">Register your land, get verified, pay the advertisement fee, and reach buyers across Cameroon</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: FileCheck, title: 'Register Land', desc: 'Fill in your land details and owner information through our secure online or manual registration process.' },
              { step: '02', icon: Shield, title: 'Verification', desc: 'Our land officers verify your identity and documents. Manual registration includes facial recognition.' },
              { step: '03', icon: CreditCard, title: 'Pay Ad Fee', desc: 'Pay the 30,000 FCFA advertisement fee via MTN, Orange Money, UBA Bank, or PayPal.' },
              { step: '04', icon: Users, title: 'Reach Buyers', desc: 'Your verified land listing goes live on the marketplace for potential buyers to discover.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-amber-400 text-amber-900 text-xs font-bold rounded-full flex items-center justify-center md:static md:mx-auto md:mb-2 md:w-auto md:h-auto md:bg-transparent md:text-gray-400 md:text-sm">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lands */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Marketplace</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Featured Land Listings</h2>
            </div>
            <Link to="/marketplace" className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredLands.map(land => (
                <LandCard key={land.id} land={land} />
              ))}
            </div>
          )}

          {!loading && featuredLands.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No featured lands available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Browse by Region */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Explore</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Browse by Region</h2>
            <p className="text-gray-500 mt-3">Find land across all 10 regions of Cameroon</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regions.map((region, i) => (
              <Link
                key={i}
                to={`/marketplace?region=${encodeURIComponent(region.name)}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden"
              >
                <img src={region.image} alt={region.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-sm">{region.name}</h3>
                  <p className="text-white/70 text-xs">{region.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-br from-blue-950 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Why Choose Us</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-6">Trusted by Thousands of Cameroonians</h2>
              <p className="text-blue-200 leading-relaxed mb-8">
                Our platform combines government-grade security with modern technology to provide the most reliable 
                land registration and verification system in Cameroon.
              </p>
              <div className="space-y-4">
                {[
                  'Anti-fraud facial recognition technology',
                  'Government officer verification process',
                  'Secure digital land certificates',
                  'Multiple payment options (MTN, Orange, UBA, PayPal)',
                  'Real-time ownership verification',
                  'Coverage across all 10 regions',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-blue-100 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/register-land')}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg"
              >
                Register Your Land Today
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '2,500+', label: 'Lands Registered', icon: MapPin },
                { value: '1,200+', label: 'Verified Owners', icon: Users },
                { value: '10', label: 'Regions Covered', icon: BarChart3 },
                { value: '99.9%', label: 'Fraud Prevention', icon: Shield },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                  <stat.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-blue-200 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Register Your Land?</h2>
          <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Cameroonians who trust CamLand Registry for secure land registration and verification.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/register-land')}
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Register Land Now
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-8 py-4 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition-colors border border-emerald-500"
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AppLayout;
