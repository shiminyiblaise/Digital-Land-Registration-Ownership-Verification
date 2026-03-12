import React, { useState, useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CAMEROON_REGIONS, CAMEROON_CITIES } from '@/lib/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Camera, Upload, FileText, Shield, AlertCircle, CheckCircle, Loader2, X, MapPin } from 'lucide-react';

const RegisterLandPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [regType, setRegType] = useState<'online' | 'manual'>('online');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null);

  // Form fields
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [ownerIdNumber, setOwnerIdNumber] = useState(user?.id_number || '');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [sizeSqm, setSizeSqm] = useState('');
  const [pricePerSqm, setPricePerSqm] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [propertyType, setPropertyType] = useState<'land' | 'house_under_construction' | 'house_completed'>('land');

  const totalPrice = Number(sizeSqm) * Number(pricePerSqm);
  const availableCities = region ? CAMEROON_CITIES[region] || [] : [];

  // Camera functions for manual registration
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera access for facial verification.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFacialPhoto(dataUrl);
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(t => t.stop());
        setCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      setCameraActive(false);
    }
  };

  const generateLandCode = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900 + 100);
    return `LND-${year}-${rand}`;
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const landCode = generateLandCode();
      const images = imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'];

      const { error: dbError } = await supabase.from('lands').insert({
        land_code: landCode,
        owner_id: user.id,
        owner_name: ownerName,
        owner_phone: ownerPhone,
        owner_email: ownerEmail,
        owner_id_number: ownerIdNumber,
        owner_facial_photo: facialPhoto,
        region,
        city,
        size_sqm: Number(sizeSqm),
        price_per_sqm: Number(pricePerSqm),
        total_price: totalPrice,
        description,
        images,
        registration_type: regType,
        property_type: propertyType,
        status: 'pending',
        is_advertised: false,
        advertisement_paid: false,
        map_location: { lat: 0, lng: 0, address: `${city}, ${region}` },
      });

      if (dbError) throw new Error(dbError.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-500 mb-6">You need to sign in to register a land.</p>
          <button onClick={() => navigate('/login')} className="px-6 py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800">
            Sign In
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Land Registered Successfully!</h2>
          <p className="text-gray-500 mb-2">Your land registration has been submitted for review.</p>
          <p className="text-sm text-gray-400 mb-6">An administrator will review and approve your listing. You can pay the advertisement fee from your dashboard.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/seller')} className="px-6 py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800">
              Go to Dashboard
            </button>
            <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
              View Marketplace
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Land</h1>
          <p className="text-gray-500">Fill in the details below to register your land on the CamLand platform</p>
        </div>

        {/* Registration Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Registration Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRegType('online')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                regType === 'online' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className={`w-6 h-6 mb-2 ${regType === 'online' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="font-semibold text-sm">Online Registration</p>
              <p className="text-xs text-gray-500 mt-1">Standard digital registration</p>
            </button>
            <button
              onClick={() => setRegType('manual')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                regType === 'manual' ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Camera className={`w-6 h-6 mb-2 ${regType === 'manual' ? 'text-emerald-600' : 'text-gray-400'}`} />
              <p className="font-semibold text-sm">Manual (Anti-Fraud)</p>
              <p className="text-xs text-gray-500 mt-1">With facial verification</p>
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s ? 'bg-blue-900 text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </button>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Owner Info */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-2">Owner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                <input type="tel" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Card Number *</label>
                <input type="text" value={ownerIdNumber} onChange={e => setOwnerIdNumber(e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            {/* Facial Capture for Manual Registration */}
            {regType === 'manual' && (
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Facial Verification Photo
                </h4>
                {facialPhoto ? (
                  <div className="relative w-48">
                    <img src={facialPhoto} alt="Facial capture" className="w-48 h-36 object-cover rounded-xl border-2 border-emerald-500" />
                    <button onClick={() => setFacialPhoto(null)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : cameraActive ? (
                  <div className="space-y-3">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-xl border border-gray-200" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                      <button onClick={capturePhoto} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500">
                        Capture Photo
                      </button>
                      <button onClick={stopCamera} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={startCamera} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors text-sm font-medium">
                    <Camera className="w-5 h-5" />
                    Open Camera for Facial Capture
                  </button>
                )}
              </div>
            )}

            <button onClick={() => {
              if (!ownerName || !ownerPhone || !ownerEmail) { setError('Please fill all required fields'); return; }
              setError(''); setStep(2);
            }} className="w-full py-3 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors">
              Continue to Land Details
            </button>
          </div>
        )}

        {/* Step 2: Land Details */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-2">Property Details</h3>
            
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPropertyType('land')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    propertyType === 'land' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MapPin className={`w-6 h-6 mx-auto mb-1 ${propertyType === 'land' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="font-medium text-sm">Land</p>
                  <p className="text-xs text-gray-500">Empty plot</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType('house_under_construction')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    propertyType === 'house_under_construction' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Camera className={`w-6 h-6 mx-auto mb-1 ${propertyType === 'house_under_construction' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="font-medium text-sm">Under Construction</p>
                  <p className="text-xs text-gray-500">Building in progress</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType('house_completed')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    propertyType === 'house_completed' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield className={`w-6 h-6 mx-auto mb-1 ${propertyType === 'house_completed' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <p className="font-medium text-sm">Completed House</p>
                  <p className="text-xs text-gray-500">Ready to move in</p>
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region *</label>
                <select value={region} onChange={e => { setRegion(e.target.value); setCity(''); }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Region</option>
                  {CAMEROON_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                <select value={city} onChange={e => setCity(e.target.value)} disabled={!region}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50">
                  <option value="">Select City</option>
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Land Size (m²) *</label>
                <input type="number" value={sizeSqm} onChange={e => setSizeSqm(e.target.value)} min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price per m² (FCFA) *</label>
                <input type="number" value={pricePerSqm} onChange={e => setPricePerSqm(e.target.value)} min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            {totalPrice > 0 && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600">Total Price</p>
                <p className="text-2xl font-bold text-blue-900">{new Intl.NumberFormat('fr-CM').format(totalPrice)} FCFA</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                placeholder="Describe the land, its features, nearby landmarks, etc."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Land Image URL</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/land-image.jpg"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">
                Back
              </button>
              <button onClick={() => {
                if (!region || !city || !sizeSqm || !pricePerSqm) { setError('Please fill all required fields'); return; }
                setError(''); setStep(3);
              }} className="flex-1 py-3 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800">
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-2">Review Your Registration</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Registration Type', regType === 'manual' ? 'Manual (Anti-Fraud)' : 'Online'],
                ['Owner Name', ownerName],
                ['Phone', ownerPhone],
                ['Email', ownerEmail],
                ['ID Number', ownerIdNumber],
                ['Region', region],
                ['City', city],
                ['Land Size', `${Number(sizeSqm).toLocaleString()} m²`],
                ['Price/m²', `${Number(pricePerSqm).toLocaleString()} FCFA`],
                ['Total Price', `${totalPrice.toLocaleString()} FCFA`],
              ].map(([label, value], i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            {description && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-700 mt-1">{description}</p>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> After submission, an administrator will review your registration. 
                You will need to pay the 30,000 FCFA advertisement fee for your land to appear publicly.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200">
                Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RegisterLandPage;
