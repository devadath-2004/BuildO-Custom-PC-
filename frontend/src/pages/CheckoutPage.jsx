import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';
import PaymentGatewayModal from '../components/PaymentGatewayModal';
import { 
  Lock, MapPin, Mail, Phone, User as UserIcon, 
  ArrowRight, ChevronLeft
} from 'lucide-react';

export default function CheckoutPage() {
  const { 
    cart, 
    clearCart, 
    user, 
    setActivePage, 
    showNotification,
    discountCode
  } = useApp();

  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [shippingCity, setShippingCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [activePaymentOrder, setActivePaymentOrder] = useState(null);

  const subtotal = cart.reduce((sum, item) => {
    const itemQuantity = item.quantity || 1;
    const itemPrice = item.components?.length
      ? item.components.reduce((componentSum, component) => componentSum + Number(component.price || 0), 0)
      : Number(item.price || 0);
    return sum + itemPrice * itemQuantity;
  }, 0);
  const discountPercent = discountCode?.toUpperCase() === 'BUILDO10' ? 10
    : discountCode?.toUpperCase() === 'PCBUILDER' ? 5 : 0;
  const discountAmount = subtotal * discountPercent / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableSubtotal * 0.18;
  const finalTotal = taxableSubtotal + taxAmount;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showNotification('Cart is empty', 'error');
      return;
    }

    setLoading(true);

    try {
      // Flatten all components from cart items
      const itemsPayload = [];
      let buildTitle = 'Custom PC Build';

      cart.forEach(item => {
        if (item.components && item.components.length > 0) {
          buildTitle = item.name;
          item.components.forEach(c => {
            itemsPayload.push({
              componentId: c.id,
              quantity: item.quantity || 1
            });
          });
        }
      });

      const orderPayload = {
        buildName: buildTitle,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        shippingCity,
        postalCode,
        discountCode,
        items: itemsPayload
      };

      const razorpayConfig = await apiClient.getRazorpayConfig();
      const createdOrder = await apiClient.createOrder(orderPayload);
      setLoading(false);
      setActivePaymentOrder({
        ...createdOrder,
        razorpayVerificationMode: razorpayConfig.verificationMode
      });
      showNotification(
        razorpayConfig.verificationMode
          ? `Order #${createdOrder.orderNumber} created. Razorpay will verify with ₹1 and request a refund.`
          : `Order #${createdOrder.orderNumber} initiated. Opening secure payment gateway...`,
        'info'
      );

    } catch (err) {
      setLoading(false);
      showNotification(err.message || 'Failed to initialize order', 'error');
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    setActivePaymentOrder(null);
    clearCart();

    try {
      const [refreshedOrder, invoiceData] = await Promise.all([
        apiClient.getOrderById(paymentResponse.orderId),
        apiClient.getInvoiceByOrderId(paymentResponse.orderId)
      ]);
      showNotification(
        `Payment verified! Invoice ${invoiceData.invoiceNumber} is ready for order #${refreshedOrder.orderNumber}.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showNotification('Payment was verified. Your order is opening; you can retry the invoice from Orders.', 'info');
    }
    setActivePage('orders');
  };

  return (
    <div className="buildo-shop-page buildo-checkout-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <button
          onClick={() => setActivePage('cart')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>
        <span className="buildo-page-eyebrow">SECURE CHECKOUT</span>
        <h1 className="mt-1 text-3xl sm:text-5xl font-semibold text-white tracking-[-0.06em]">Checkout &amp; delivery.</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Confirm where your finished BuildO system should arrive.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Details */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Doorstep shipping address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email for invoice and tracking</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Street address or landmark</label>
              <textarea
                rows={2}
                required
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                className="w-full p-3 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={shippingCity}
                  onChange={e => setShippingCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Postal PIN code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Secure payment with Razorpay</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Available methods appear after BuildO confirms your order total.
            </p>
          </div>
        </div>

        {/* Sticky Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Order summary</h3>

            <div className="space-y-2 text-xs border-y border-slate-800/80 py-4 max-h-48 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-slate-300">
                  <span className="truncate flex-1 pr-2">{item.name}</span>
                  <span className="font-mono font-semibold text-white">
                    ₹{((item.components?.length
                      ? item.components.reduce((sum, component) => sum + Number(component.price || 0), 0)
                      : Number(item.price || 0)) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountPercent}%):</span>
                  <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Estimated GST (18%):</span>
                <span className="font-mono text-slate-200">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Insured shipping:</span>
                <span className="font-mono text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                <div>
                  <span className="block">Grand total</span>
                  <span className="text-[10px] font-normal text-slate-500">GST included</span>
                </div>
                <span className="text-xl font-extrabold text-cyan-400 font-mono">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
            >
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full" />
              ) : (
                <>
                  <span>Continue to payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Interactive Payment Gateway Modal */}
      {activePaymentOrder && (
        <PaymentGatewayModal
          order={activePaymentOrder}
          onSuccess={handlePaymentSuccess}
          onClose={() => setActivePaymentOrder(null)}
        />
      )}
    </div>
  );
}
