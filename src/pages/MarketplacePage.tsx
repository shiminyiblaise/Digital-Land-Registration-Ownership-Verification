import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { Land, CAMEROON_REGIONS, CAMEROON_CITIES } from '@/lib/types';
import LandCard from '@/components/LandCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LandMapView from '@/components/LandMapView';
import { Search, SlidersHorizontal, MapPin, X, ArrowUpDown, LayoutGrid, Map as MapIcon, Loader2 } from 'lucide-react';

const MarketplacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || '');
  const [selectedCity, setSelectedCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(!!searchParams.get('region'));
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    setLoading(true);
    const result = await api.getMarketplace();
    if (result.lands) {
      setLands(result.lands);
    }
    setLoading(false);
  };

  const availableCities = selectedRegion ? CAMEROON_CITIES[selectedRegion] || [] : [];

  const filteredLands = useMemo(() => {
    let result = [...lands];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.land_code.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.owner_name.toLowerCase().includes(q)
      );
    }

    if (selectedRegion) {
      result = result.filter(l => l.region === selectedRegion);
    }

    if (selectedCity) {
      result = result.filter(l => l.city === selectedCity);
    }

    if (minPrice) {
      result = result.filter(l => l.total_price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter(l => l.total_price <= Number(maxPrice));
    }

    if (minSize) {
      result = result.filter(l => l.size_sqm >= Number(minSize));
    }
    if (maxSize) {
      result = result.filter(l => l.size_sqm <= Number(maxSize));
    }

    if (selectedPropertyType) {
      result = result.filter(l => l.property_type === selectedPropertyType);
    }

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.total_price - b.total_price); break;
      case 'price-desc': result.sort((a, b) => b.total_price - a.total_price); break;
      case 'size-asc': result.sort((a, b) => a.size_sqm - b.size_sqm); break;
      case 'size-desc': result.sort((a, b) => b.size_sqm - a.size_sqm); break;
      case 'newest': result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: break;
    }

    return result;
  }, [lands, searchQuery, selectedRegion, selectedCity, minPrice, maxPrice, minSize, maxSize, sortBy, selectedPropertyType]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRegion('');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinSize('');
    setMaxSize('');
    setSortBy('newest');
    setSelectedPropertyType('');
  };

  const hasActiveFilters = searchQuery || selectedRegion || selectedCity || minPrice || maxPrice || minSize || maxSize || selectedPropertyType;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Land Marketplace</h1>
          <p className="text-blue-200">Browse verified land listings across all regions of Cameroon</p>

          {/* Search Bar */}
          <div className="mt-6 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by land code, city, region, or description..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-lg text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-lg ${
                showFilters ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filter Listings</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                  <X className="w-4 h-4" /> Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => { setSelectedRegion(e.target.value); setSelectedCity(''); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Regions</option>
                  {CAMEROON_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedRegion}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">All Cities</option>
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Price Range (FCFA)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Land Size (m²)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minSize}
                    onChange={(e) => setMinSize(e.target.value)}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={maxSize}
                    onChange={(e) => setMaxSize(e.target.value)}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Property Type</label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="land">Land</option>
                  <option value="house_under_construction">Under Construction</option>
                  <option value="house_completed">Completed House</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Header with View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredLands.length}</span> land{filteredLands.length !== 1 ? 's' : ''}
              {hasActiveFilters && <span className="text-blue-600"> (filtered)</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>

            {/* Sort (only in grid view) */}
            {viewMode === 'grid' && (
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="size-asc">Size: Small to Large</option>
                  <option value="size-desc">Size: Large to Small</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLands.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No lands found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search terms</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800">
                Clear All Filters
              </button>
            )}
          </div>
        ) : viewMode === 'map' ? (
          /* ===== MAP VIEW ===== */
          <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-sm" style={{ height: '650px' }}>
            <LandMapView lands={filteredLands} />
          </div>
        ) : (
          /* ===== GRID VIEW ===== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLands.map(land => (
              <LandCard key={land._id} land={land} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MarketplacePage;
