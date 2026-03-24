import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Land } from '@/lib/types';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';

const CAMEROON_CENTER: [number, number] = [7.3697, 12.3547];
const DEFAULT_ZOOM = 6;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const formatPrice = (price: number) => new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

interface LandMapViewProps {
  lands: Land[];
}

const LandMapView: React.FC<LandMapViewProps> = ({ lands }) => {
  const validLands = lands.filter(l => l.map_location && (l.map_location as any)?.lat && (l.map_location as any)?.lng);

  return (
    <div className="w-full h-full">
      <div className="bg-white p-3 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-700">
          <span className="font-semibold">{validLands.length}</span> land{validLands.length !== 1 ? 's' : ''} on map
        </span>
      </div>
      <div className="h-[calc(100%-50px)]">
        <MapContainer
          center={CAMEROON_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validLands.map(land => {
            const loc = land.map_location as any;
            return (
              <Marker key={land._id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="w-64 p-2">
                    <img
                      src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}
                      alt={land.city}
                      className="w-full h-28 object-cover rounded-lg mb-2"
                    />
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${land.status === 'sold' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                        {land.status === 'sold' ? 'SOLD' : 'Available'}
                      </span>
                      <span className="text-xs font-mono text-gray-500">{land.land_code}</span>
                    </div>
                    <p className="text-sm font-medium">{land.city}, {land.region}</p>
                    <p className="text-xs text-gray-500">{land.size_sqm.toLocaleString()} m²</p>
                    <p className="text-sm font-bold text-blue-900 mt-1">{formatPrice(land.total_price)}</p>
                    <Link
                      to={`/land/${land.land_code}`}
                      className="block text-center py-2 mt-2 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800"
                    >
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default LandMapView;
