import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const STRIPE_ACCOUNT_ID = 'STRIPE_ACCOUNT_ID';
const stripePromise = STRIPE_ACCOUNT_ID && STRIPE_ACCOUNT_ID !== 'STRIPE_ACCOUNT_ID'
  ? loadStripe('pk_live_51OJhJBHdGQpsHqInIzu7c6PzGPSH0yImD4xfpofvxvFZs0VFhPRXZCyEgYkkhOtBOXFWvssYASs851mflwQvjnrl00T6DbUwWZ', { stripeAccount: STRIPE_ACCOUNT_ID })
  : null;

// Stripe Payment Form Component
function StripePaymentForm({ onSuccess }: { onSuccess: (paymentIntent: any) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-4 py-3.5 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        {loading ? 'Processing...' : 'Pay 30,000 FCFA'}
      </button>
    </form>
  );
}

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const landId = searchParams.get('landId');
  const landCode = searchParams.get('landCode');

  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Create payment intent for 30,000 FCFA (convert to smallest unit)
    const createPaymentIntent = async () => {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: 3000000, // 30,000 FCFA in cents
          currency: 'xaf',
          metadata: { land_id: landId, land_code: landCode, seller_id: user.id },
        },
      });

      if (error) {
        setPaymentError('Unable to initialize payment. Please try again.');
        return;
      }
      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        setPaymentError('Unable to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, [user, landId]);

  const handlePaymentSuccess = async (paymentIntent: any) => {
    if (!user || !landId) return;

    // Save payment record
    const reference = `PAY-STRIPE-${Date.now().toString(36).toUpperCase()}`;
    await supabase.from('land_payments').insert({
      land_id: landId,
      seller_id: user.id,
      amount: 30000,
      currency: 'XAF',
      method: 'stripe',
      reference,
      status: 'completed',
      paid_at: new Date().toISOString(),
    });

    // Update land
    await supabase.from('lands').update({
      advertisement_paid: true,
      is_advertised: true,
      updated_at: new Date().toISOString(),
    }).eq('id', landId);

    // Create order in ecom_orders for tracking
    const { data: customer } = await supabase
      .from('ecom_customers')
      .upsert({ email: user.email, name: user.name }, { onConflict: 'email' })
      .select('id')
      .single();

    const { data: order } = await supabase
      .from('ecom_orders')
      .insert({
        customer_id: customer?.id,
        status: 'paid',
        subtotal: 3000000,
        tax: 0,
        shipping: 0,
        total: 3000000,
        shipping_address: { name: user.name, email: user.email },
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select('id')
      .single();

    if (order) {
      await supabase.from('ecom_order_items').insert({
        order_id: order.id,
        product_name: `Land Advertisement - ${landCode}`,
        quantity: 1,
        unit_price: 3000000,
        total: 3000000,
        sku: reference,
      });

      // Send confirmation email
      await supabase.functions.invoke('send-order-confirmation', {
        body: {
          orderId: order.id,
          customerEmail: user.email,
          customerName: user.name,
          orderItems: [{ product_name: `Land Advertisement - ${landCode}`, quantity: 1, unit_price: 3000000, total: 3000000 }],
          subtotal: 3000000,
          shipping: 0,
          tax: 0,
          total: 3000000,
          shippingAddress: { name: user.name },
        },
      });
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-2">Your advertisement payment has been processed.</p>
          <p className="text-sm text-gray-400 mb-6">Land code: <span className="font-mono font-bold">{landCode}</span></p>
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
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisement Payment</h1>
          <p className="text-sm text-gray-500 mt-1">Pay via Stripe to publish your land listing</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-600">Land Advertisement Fee</span>
            <span className="font-semibold">30,000 FCFA</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-600">Land Code</span>
            <span className="font-mono">{landCode}</span>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-blue-900">30,000 FCFA</span>
          </div>
        </div>

        {/* Stripe Payment Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
          {!stripePromise ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm text-amber-800">
                Stripe payment processing is being set up. Please use the alternative payment methods (MTN, Orange Money, UBA) from your seller dashboard.
              </p>
              <button onClick={() => navigate('/seller')} className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-500">
                Go to Dashboard
              </button>
            </div>
          ) : paymentError ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-800">{paymentError}</p>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm onSuccess={handlePaymentSuccess} />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading payment form...</span>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
