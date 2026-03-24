import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { ADVERTISEMENT_FEE, PaymentMethod } from '@/lib/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  landId: string;
  landCode: string;
  sellerId: string;
  onSuccess: () => void;
}

const paymentMethods = [
  { id: 'mtn_momo' as PaymentMethod, name: 'MTN Mobile Money', icon: Smartphone, color: 'bg-yellow-400 text-yellow-900', borderColor: 'border-yellow-400', bgHover: 'hover:bg-yellow-50' },
  { id: 'orange_money' as PaymentMethod, name: 'Orange Money', icon: Smartphone, color: 'bg-orange-500 text-white', borderColor: 'border-orange-500', bgHover: 'hover:bg-orange-50' },
  { id: 'uba_bank' as PaymentMethod, name: 'UBA Bank Transfer', icon: Building2, color: 'bg-red-700 text-white', borderColor: 'border-red-700', bgHover: 'hover:bg-red-50' },
  { id: 'paypal' as PaymentMethod, name: 'PayPal', icon: CreditCard, color: 'bg-blue-700 text-white', borderColor: 'border-blue-700', bgHover: 'hover:bg-blue-50' },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, landId, landCode, sellerId, onSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<'select' | 'details' | 'processing' | 'success' | 'failed'>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const generateReference = () => {
    const prefix = selectedMethod === 'mtn_momo' ? 'MTN' : selectedMethod === 'orange_money' ? 'OM' : selectedMethod === 'uba_bank' ? 'UBA' : 'PP';
    return `PAY-${prefix}-${Date.now().toString(36).toUpperCase()}`;
  };

  const handlePay = async () => {
    if (!selectedMethod) return;
    if ((selectedMethod === 'mtn_momo' || selectedMethod === 'orange_money') && !phoneNumber) {
      setError('Please enter your phone number');
      return;
    }
    if (selectedMethod === 'uba_bank' && !accountNumber) {
      setError('Please enter your account number');
      return;
    }

    setStep('processing');
    setError('');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 90% success rate simulation
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      await api.advertiseLand(landId);
      setStep('success');
    } else {
      setStep('failed');
    }
  };

  const handleClose = () => {
    if (step === 'success') onSuccess();
    setStep('select');
    setSelectedMethod(null);
    setPhoneNumber('');
    setAccountNumber('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Advertisement Payment</h2>
            <p className="text-xs text-gray-500 mt-0.5">Land Code: {landCode}</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5">
          {/* Amount Display */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5 text-center">
            <p className="text-sm text-blue-600 mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-blue-900">{ADVERTISEMENT_FEE.toLocaleString()} FCFA</p>
            <p className="text-xs text-blue-500 mt-1">One-time advertisement fee</p>
          </div>

          {/* Step: Select Method */}
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</p>
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => { setSelectedMethod(method.id); setStep('details'); }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 ${method.bgHover} transition-all text-left`}
                >
                  <div className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{method.name}</p>
                    <p className="text-xs text-gray-500">Pay {ADVERTISEMENT_FEE.toLocaleString()} FCFA</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step: Payment Details */}
          {step === 'details' && selectedMethod && (
            <div className="space-y-4">
              <button onClick={() => { setStep('select'); setError(''); }} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                &larr; Change payment method
              </button>

              {(selectedMethod === 'mtn_momo' || selectedMethod === 'orange_money') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder={selectedMethod === 'mtn_momo' ? '+237 6XX XXX XXX' : '+237 6XX XXX XXX'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter your {selectedMethod === 'mtn_momo' ? 'MTN' : 'Orange'} mobile money number</p>
                </div>
              )}

              {selectedMethod === 'uba_bank' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UBA Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter your UBA account number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              )}

              {selectedMethod === 'paypal' && (
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-700">You will be redirected to PayPal to complete payment</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={handlePay}
                className="w-full py-4 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors shadow-lg text-sm"
              >
                Pay {ADVERTISEMENT_FEE.toLocaleString()} FCFA
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">Processing Payment...</p>
              <p className="text-sm text-gray-500">Please wait while we verify your payment</p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</p>
              <p className="text-sm text-gray-500 mb-4">Your land listing will be published after admin approval.</p>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold">{ADVERTISEMENT_FEE.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-emerald-600 font-semibold">Completed</span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="mt-6 w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Step: Failed */}
          {step === 'failed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-2">Payment Failed</p>
              <p className="text-sm text-gray-500 mb-6">The payment could not be processed. Please try again.</p>
              <button
                onClick={() => { setStep('select'); setSelectedMethod(null); }}
                className="w-full py-3 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
