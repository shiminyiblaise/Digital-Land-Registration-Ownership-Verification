import React from 'react';
import { Link } from 'react-router-dom';
import { Land } from '@/lib/types';
import { MapPin, Maximize2, Tag, Clock, CheckCircle, XCircle } from 'lucide-react';

interface LandCardProps {
  land: Land;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-CM', { style: 'decimal' }).format(price) + ' FCFA';
};

const LandCard: React.FC<LandCardProps> = ({ land }) => {
  const isSold = land.status === 'sold';
  const isPending = land.status === 'pending';

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'house_under_construction':
        return { label: 'Under Construction', color: 'bg-amber-500' };
      case 'house_completed':
        return { label: 'Completed', color: 'bg-emerald-500' };
      default:
        return { label: 'Land', color: 'bg-blue-600' };
    }
  };

  const propertyType = getPropertyTypeLabel(land.property_type || 'land');

  return (
    <Link
      to={`/land/${land.land_code}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'}
          alt={`Land in ${land.city}, ${land.region}`}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isSold ? 'grayscale opacity-70' : ''}`}
        />
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isSold ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">
              <XCircle className="w-3.5 h-3.5" /> SOLD OUT
            </span>
          ) : isPending ? (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg">
              <Clock className="w-3.5 h-3.5" /> Pending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
              <CheckCircle className="w-3.5 h-3.5" /> Available
            </span>
          )}
          {/* Property Type Badge */}
          <span className={`inline-flex items-center px-2.5 py-1 ${propertyType.color} text-white text-[10px] font-semibold rounded-full shadow-lg`}>
            {propertyType.label}
          </span>
        </div>
        {/* Land Code */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono rounded-md">
            {land.land_code}
          </span>
        </div>
        {/* Sold Date Overlay */}
        {isSold && land.sold_at && (
          <div className="absolute bottom-0 inset-x-0 bg-red-900/90 backdrop-blur-sm px-3 py-2">
            <p className="text-white text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Sold on {new Date(land.sold_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>{land.city}, {land.region}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
          {land.description?.slice(0, 80) || `Land for sale in ${land.city}`}
          {(land.description?.length || 0) > 80 ? '...' : ''}
        </h3>

        {/* Details */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Maximize2 className="w-3 h-3" />
            {land.size_sqm.toLocaleString()} m²
          </span>
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {formatPrice(land.price_per_sqm)}/m²
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <p className={`text-lg font-bold ${isSold ? 'text-gray-400 line-through' : 'text-blue-900'}`}>
            {formatPrice(land.total_price)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default LandCard;
