import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, MapPin, FileCheck, ArrowRight, CheckCircle } from 'lucide-react';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      navigate(`/verify?code=${encodeURIComponent(searchCode.trim())}`);
    }
  };

  const stats = [
    { value: '10', label: 'Regions Covered' },
    { value: '2,500+', label: 'Lands Registered' },
    { value: '1,200+', label: 'Verified Owners' },
    { value: '99.9%', label: 'Fraud Prevention' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-emerald-900" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Government Verified Platform</span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              Digital Land
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Registration
              </span>
              <span className="block text-3xl lg:text-4xl mt-1 text-blue-200 font-semibold">& Marketplace</span>
            </h1>

            <p className="text-lg text-blue-200/80 mb-8 max-w-lg leading-relaxed">
              Secure, transparent, and efficient land registration system for the Republic of Cameroon. 
              Register, verify, and trade land with confidence.
            </p>

            {/* Verification Search */}
            <form onSubmit={handleVerify} className="flex gap-2 mb-8 max-w-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Enter land code (e.g., LND-2024-001)"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg flex items-center gap-2"
              >
                <span className="hidden sm:inline">Verify</span>
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/marketplace')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-md text-sm"
              >
                <MapPin className="w-4 h-4" />
                Browse Marketplace
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/register-land')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-sm"
              >
                <FileCheck className="w-4 h-4" />
                Register Your Land
              </button>
            </div>
          </div>

          {/* Right - Features */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: 'Anti-Fraud Protection', desc: 'Facial recognition & ID verification for every registration', color: 'from-blue-500 to-blue-600' },
                { icon: MapPin, title: 'All 10 Regions', desc: 'Complete coverage across all regions of Cameroon', color: 'from-emerald-500 to-emerald-600' },
                { icon: FileCheck, title: 'Digital Certificates', desc: 'Secure digital land ownership certificates', color: 'from-cyan-500 to-cyan-600' },
                { icon: Search, title: 'Instant Verification', desc: 'Verify any land ownership in seconds with unique codes', color: 'from-amber-500 to-amber-600' },
              ].map((feature, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-blue-200/70 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-blue-200/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
