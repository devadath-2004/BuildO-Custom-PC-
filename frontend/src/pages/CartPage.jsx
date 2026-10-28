import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Trash2, ArrowRight, Tag, ShieldCheck, ChevronLeft } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, setActivePage, showNotification, discountCode, setDiscountCode } = useApp();
  const [couponCode, setCouponCode] = useState(discountCode);
  const discountPercent = discountCode === 'BUILDO10' ? 10 : discountCode === 'PCBUILDER' ? 5 : 0;

  const getItemPrice = (item) => item.components?.length
    ? item.components.reduce((sum, component) => sum + Number(component.price || 0), 0)
    : Number(item.price || 0);
  const subtotal = cart.reduce((sum, item) => sum + getItemPrice(item) * (item.quantity || 1), 0);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'BUILDO10') {
      setDiscountCode('BUILDO10');
      showNotification('Coupon BUILDO10 applied: 10% discount!', 'success');
    } else if (couponCode.toUpperCase() === 'PCBUILDER') {
      setDiscountCode('PCBUILDER');
      showNotification('Coupon PCBUILDER applied: 5% discount!', 'success');
    } else {
      setDiscountCode('');
      showNotification('Invalid or expired promo code.', 'error');
    }
  };

  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableSubtotal * 0.18;
  const finalTotal = taxableSubtotal + taxAmount;

  if (cart.length === 0) {
    return (
      <div className="buildo-shop-page buildo-cart-page max-w-3xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500 mx-auto">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          You haven't added any custom builds or preset systems to your cart yet.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => setActivePage('configurator')}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            Open Configurator
          </button>
          <button
            onClick={() => setActivePage('presets')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Browse Presets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="buildo-shop-page buildo-cart-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="buildo-page-eyebrow">YOUR SELECTED BUILD</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Shopping cart.</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Review your custom configuration before secure checkout.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map(item => (
            <div
              key={item.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={item.imageUrl || '/desk-setup.jpg'}
                  alt={item.name}
                  onError={(e) => {
                    if (e.currentTarget.src !== `${window.location.origin}/desk-setup.jpg`) {
                      e.currentTarget.src = '/desk-setup.jpg';
                    }
                  }}
                  className="w-20 h-20 rounded-xl object-cover bg-dark-950 border border-slate-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-mono">
                    {item.type || 'CUSTOM PC'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1">{item.name}</h3>

                  {item.components && (
                    <div className="mt-1 text-[11px] text-slate-400 font-mono line-clamp-1">
                      {item.components.length} verified components included
                    </div>
                  )}

                  <div className="text-xs font-extrabold text-cyan-400 font-mono mt-2">
                    ₹{getItemPrice(item).toLocaleString('en-IN')} each
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Item total</span>
                  <div className="text-lg font-bold text-white font-mono">
                    ₹{(getItemPrice(item) * (item.quantity || 1)).toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  title="Remove from Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Return CTA */}
          <div className="pt-2">
            <button
              onClick={() => setActivePage('configurator')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Continue configuring components</span>
            </button>
          </div>
        </div>

        {/* Financial Summary & Promo Code (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Promo Code Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Have a discount coupon?
            </span>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. BUILDO10"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Totals */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div>
              <span className="buildo-page-eyebrow">SECURE CHECKOUT</span>
              <h3 className="text-base font-bold text-white mt-1">Order summary</h3>
            </div>

            <div className="space-y-2.5 text-xs border-y border-slate-800/80 py-4">
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
                <span>Insured doorstep shipping:</span>
                <span className="font-mono text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                <div>
                  <span className="block">Total payable</span>
                  <span className="text-[10px] font-normal text-slate-500">GST included</span>
                </div>
                <span className="text-xl font-extrabold text-cyan-400 font-mono">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActivePage('checkout')}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <span>Proceed to checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="uppercase tracking-[0.16em]">Safe and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
