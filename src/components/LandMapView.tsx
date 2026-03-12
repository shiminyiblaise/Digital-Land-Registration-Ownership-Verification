import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Land } from '@/lib/types';
import { MapPin, Maximize2, Tag, ExternalLink, CheckCircle, XCircle, Navigation } from 'lucide-react';

// Cameroon center coordinates
const CAMEROON_CENTER: [number, number] = [7.3697, 12.3547];
const DEFAULT_ZOOM = 6;

// Fix default Leaflet icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (status: string) => {
  const color = status === 'sold' ? '#dc2626' : status === 'approved' ? '#059669' : '#f59e0b';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="16" r="8" fill="#fff" opacity="0.9"/>
      <circle cx="16" cy="16" r="5" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-land-marker',
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  });
};

// Custom cluster icon
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = 'small';
  let diameter = 40;
  if (count >= 10) { size = 'large'; diameter = 56; }
  else if (count >= 5) { size = 'medium'; diameter = 48; }

  return L.divIcon({
    html: `<div style="
      width: ${diameter}px;
      height: ${diameter}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e3a8a, #059669);
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: ${size === 'large' ? '16px' : size === 'medium' ? '14px' : '13px'};
      border: 3px solid rgba(255,255,255,0.9);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-family: system-ui, -apple-system, sans-serif;
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(diameter, diameter),
  });
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-CM').format(price) + ' FCFA';

// Sub-component to handle map bounds fitting
function FitBounds({ lands }: { lands: Land[] }) {
  const map = useMap();

  useEffect(() => {
    if (lands.length === 0) return;

    const validLands = lands.filter(
      (l) => l.map_location && (l.map_location as any).lat && (l.map_location as any).lng
        && (l.map_location as any).lat !== 0 && (l.map_location as any).lng !== 0
    );

    if (validLands.length === 0) {
      map.setView(CAMEROON_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (validLands.length === 1) {
      const loc = validLands[0].map_location as any;
      map.setView([loc.lat, loc.lng], 12);
      return;
    }

    const bounds = L.latLngBounds(
      validLands.map((l) => {
        const loc = l.map_location as any;
        return [loc.lat, loc.lng] as [number, number];
      })
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  }, [lands, map]);

  return null;
}

// Sub-component for user's geolocation
function LocateMe() {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        map.setView([latitude, longitude], 14);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location services.');
      }
    );
  };

  return (
    <div className="leaflet-control leaflet-control-custom">
      <button
        onClick={handleLocate}
        className="bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Get my location"
        style={{
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Navigation className="w-5 h-5 text-blue-600" />
      </button>
    </div>
  );
}

interface LandMapViewProps {
  lands: Land[];
}

const LandMapView: React.FC<LandMapViewProps> = ({ lands }) => {
  // Filter lands that have valid map coordinates
  const mappableLands = useMemo(
    () =>
      lands.filter(
        (l) =>
          l.map_location &&
          (l.map_location as any).lat &&
          (l.map_location as any).lng &&
          (l.map_location as any).lat !== 0 &&
          (l.map_location as any).lng !== 0
      ),
    [lands]
  );

  const unmappableCount = lands.length - mappableLands.length;

  return (
    <div className="space-y-3">
      {/* Map info bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{mappableLands.length}</span> land{mappableLands.length !== 1 ? 's' : ''} on map
          </span>
          {unmappableCount > 0 && (
            <span className="text-xs text-gray-400 ml-1">
              ({unmappableCount} without coordinates)
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
            Sold
          </span>
        </div>
      </div>

      {/* Map container */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '600px' }}>
        <MapContainer
          center={CAMEROON_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds lands={mappableLands} />
          <LocateMe />

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={60}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            disableClusteringAtZoom={14}
          >
            {mappableLands.map((land) => {
              const loc = land.map_location as any;
              const isSold = land.status === 'sold';

              return (
                <Marker
                  key={land.id}
                  position={[loc.lat, loc.lng]}
                  icon={createCustomIcon(land.status)}
                >
                  <Popup
                    maxWidth={320}
                    minWidth={280}
                    className="land-popup"
                  >
                    <div className="p-1">
                      {/* Popup header image */}
                      <div className="relative -mx-1 -mt-1 mb-3 rounded-lg overflow-hidden">
                        <img
                          src={land.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}
                          alt={`Land in ${land.city}`}
                          className={`w-full h-32 object-cover ${isSold ? 'grayscale opacity-70' : ''}`}
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {isSold ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-md shadow">
                              <XCircle className="w-3 h-3" /> SOLD
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-md shadow">
                              <CheckCircle className="w-3 h-3" /> Available
                            </span>
                          )}
                          <span className={`px-2 py-1 ${land.property_type === 'house_under_construction' ? 'bg-amber-500' : land.property_type === 'house_completed' ? 'bg-emerald-500' : 'bg-blue-600'} text-white text-[10px] font-semibold rounded-md shadow`}>
                            {land.property_type === 'house_under_construction' ? 'Under Construction' : land.property_type === 'house_completed' ? 'Completed House' : 'Land'}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono rounded-md">
                            {land.land_code}
                          </span>
                        </div>
                      </div>

                      {/* Popup body */}
                      <div className="space-y-2">
                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className="font-medium">{land.city}, {land.region}</span>
                        </div>

                        {/* Description snippet */}
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {land.description?.slice(0, 100) || `Land for sale in ${land.city}`}
                          {(land.description?.length || 0) > 100 ? '...' : ''}
                        </p>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <Maximize2 className="w-3 h-3 text-gray-400" />
                            <div>
                              <p className="text-[10px] text-gray-400">Size</p>
                              <p className="text-xs font-semibold text-gray-800">
                                {land.size_sqm.toLocaleString()} m²
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <div>
                              <p className="text-[10px] text-gray-400">Per m²</p>
                              <p className="text-xs font-semibold text-gray-800">
                                {formatPrice(land.price_per_sqm)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Price</p>
                            <p className={`text-sm font-bold ${isSold ? 'text-gray-400 line-through' : 'text-blue-900'}`}>
                              {formatPrice(land.total_price)}
                            </p>
                          </div>
                        </div>

                        {/* View Details link */}
                        <Link
                          to={`/land/${land.land_code}`}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors mt-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Full Details
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default LandMapView;
