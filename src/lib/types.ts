// Type definitions for the Digital Land Registration System

export interface LandUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string;
  id_number?: string;
  role: 'admin' | 'officer' | 'seller' | 'buyer';
  profile_photo?: string;
  facial_photo?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Land {
  _id: string;
  id?: string;
  land_code: string;
  owner_id?: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  owner_id_number?: string;
  owner_facial_photo?: string;
  region: string;
  city: string;
  size_sqm: number;
  price_per_sqm: number;
  total_price: number;
  description?: string;
  images?: string[];
  map_location?: { lat: number; lng: number; address: string };
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  registration_type: 'online' | 'manual';
  property_type: 'land' | 'house_under_construction' | 'house_completed';
  is_advertised: boolean;
  advertisement_paid: boolean;
  approved_by?: string;
  approved_at?: string;
  sold_at?: string;
  sold_to?: string;
  created_at: string;
  updated_at: string;
}

export interface LandPayment {
  id: string;
  land_id: string;
  seller_id: string;
  amount: number;
  currency: string;
  method: 'paypal' | 'uba_bank' | 'mtn_momo' | 'orange_money' | 'stripe';
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paid_at?: string;
  created_at: string;
  land?: Land;
}

export interface LandVerification {
  id: string;
  land_id: string;
  officer_id: string;
  facial_match: boolean;
  id_verified: boolean;
  document_verified: boolean;
  notes?: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  created_at: string;
}

// Cameroon regions and cities
export const CAMEROON_REGIONS = [
  'Adamawa', 'Centre', 'East', 'Far North', 'Littoral',
  'North', 'North-West', 'South', 'South-West', 'West'
] as const;

export const CAMEROON_CITIES: Record<string, string[]> = {
  'Adamawa': ['Ngaoundéré', 'Meiganga', 'Tibati', 'Banyo'],
  'Centre': ['Yaoundé', 'Mbalmayo', 'Obala', 'Nanga-Eboko', 'Eseka'],
  'East': ['Bertoua', 'Batouri', 'Yokadouma', 'Abong-Mbang'],
  'Far North': ['Maroua', 'Kousseri', 'Mokolo', 'Mora'],
  'Littoral': ['Douala', 'Nkongsamba', 'Edéa', 'Loum'],
  'North': ['Garoua', 'Guider', 'Poli', 'Tchollire'],
  'North-West': ['Bamenda', 'Kumbo', 'Wum', 'Ndop'],
  'South': ['Ebolowa', 'Kribi', 'Sangmélima', 'Ambam'],
  'South-West': ['Buea', 'Limbe', 'Kumba', 'Mamfe', 'Tiko'],
  'West': ['Bafoussam', 'Dschang', 'Mbouda', 'Foumban', 'Bangangté']
};

export type PaymentMethod = 'paypal' | 'uba_bank' | 'mtn_momo' | 'orange_money' | 'stripe';

export const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: string; color: string }[] = [
  { id: 'mtn_momo', name: 'MTN Mobile Money', icon: '📱', color: '#FFC300' },
  { id: 'orange_money', name: 'Orange Money', icon: '📲', color: '#FF6600' },
  { id: 'uba_bank', name: 'UBA Bank Transfer', icon: '🏦', color: '#CC0000' },
  { id: 'paypal', name: 'PayPal', icon: '💳', color: '#003087' },
  { id: 'stripe', name: 'Stripe (Card)', icon: '💳', color: '#635BFF' },
];

export const ADVERTISEMENT_FEE = 30000; // 30,000 FCFA
