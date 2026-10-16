import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, CheckCircle2, Lock, QrCode, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';

const PERSONAL_UPI_ID = (import.meta.env.VITE_UPI_ID || '').trim();
const PERSONAL_UPI_NAME = (import.meta.env.VITE_UPI_PAYEE_NAME || '').trim();

export default function PaymentGatewayModal({ order, onSuccess, onClose }) {
  const { showNotification } = useApp();
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [failureState, setFailureState] = useState(null);
  const [pendingPaymentResponse, setPendingPaymentResponse] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showPersonalQr, setShowPersonalQr] = useState(false);
  const verificationMode = Boolean(order?.razorpayVerificationMode);

  if (!order) return null;

  const personalUpiUri = `upi://pay?${new URLSearchParams({
    pa: PERSONAL_UPI_ID,
    pn: PERSONAL_UPI_NAME,
    am: '1.00',
    cu: 'INR',
    tn: `BuildO verification ${order.orderNumber}`
  }).toString()}`;

  const verifyPayment = async (razorpayResponse) => {
    setVerifying(true);
    setFailureState(null);
    setPendingPaymentResponse(razorpayResponse);

    try {
      const result = await apiClient.verifyRazorpayPayment({
        buildoOrderId: order.id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature
      });

      setVerifying(false);
      if (result.paymentStatus === 'VERIFICATION_REFUND_INITIATED') {
        setPendingPaymentResponse(null);
        setVerificationResult(result);
        showNotification('Razorpay test payment verified; the ₹1 refund was requested.', 'success');
      } else if (result.paymentStatus === 'VERIFICATION_REFUND_FAILED'
        || result.paymentStatus === 'VERIFICATION_CAPTURE_FAILED') {
        setFailureState(result.message || 'Razorpay verified the test payment, but could not complete its refund.');
        showNotification('Keep this checkout open and retry the status check; do not make another payment.', 'error');
      } else if (result.paymentStatus === 'PAID') {
        showNotification('Razorpay payment captured successfully.', 'success');
        onSuccess(result);
      } else if (result.paymentStatus === 'FAILED') {
        setPendingPaymentResponse(null);
        setFailureState('Razorpay reported that this payment failed. You can try again with another method.');
        showNotification('Payment failed. You can retry securely.', 'error');
      } else {
        showNotification('Payment is awaiting capture confirmation.', 'info');
      }
    } catch (error) {
      setVerifying(false);
      setFailureState(error.message || 'Could not verify the payment yet.');
      showNotification('Payment verification is still pending.', 'info');
    }
  };

  const openRazorpayCheckout = async () => {
    setProcessing(true);
    setFailureState(null);

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout did not load. Refresh the page and try again.');
      }

      const gatewayOrder = await apiClient.createRazorpayOrder(order.id);
      if (Boolean(gatewayOrder.verificationMode) !== verificationMode) {
        throw new Error('Razorpay mode changed. Close checkout and reopen it to refresh the payment amount.');
      }
      const checkout = new window.Razorpay({
        key: gatewayOrder.keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        name: 'BuildO',
        description: verificationMode
          ? '₹1 Razorpay test verification for order ' + order.orderNumber + ' (refund requested after verification)'
          : 'Payment for order ' + order.orderNumber,
        order_id: gatewayOrder.razorpayOrderId,
        prefill: {
          name: gatewayOrder.customerName,
          email: gatewayOrder.customerEmail,
          contact: gatewayOrder.customerPhone
        },
        theme: { color: '#d8ff43' },
        handler: verifyPayment,
        modal: {
          ondismiss: () => setProcessing(false)
        }
      });

      checkout.on('payment.failed', (response) => {
        setProcessing(false);
        setFailureState(
          response?.error?.description || 'Razorpay could not complete the payment. You can retry.'
        );
      });

      setProcessing(false);
      checkout.open();
    } catch (error) {
      setProcessing(false);
      setFailureState(error.message || 'Could not start Razorpay Checkout.');
    }
  };

  const busy = processing || verifying;

  return (
    <div className="buildo-payment-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="buildo-payment-modal bg-dark-900 border border-white/10 rounded-[1.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-850 to-dark-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pay securely with Razorpay</h3>
              <p className="text-xs text-slate-400 font-mono">Order #{order.orderNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">
              {verificationMode ? 'Verification amount' : 'Amount due'}
            </span>
            <div className="text-xl font-extrabold text-cyan-400 font-mono">
              {verificationMode ? '₹1.00' : `₹${Number(order.finalAmount).toLocaleString('en-IN')}`}
            </div>
            {verificationMode && (
              <div className="text-[11px] font-semibold text-slate-400 mt-1">
                Build total: ₹{Number(order.finalAmount).toLocaleString('en-IN')} (not charged)
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {verificationResult && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-700/60 rounded-xl flex items-start gap-3 text-emerald-100 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="space-y-1">
                <strong className="block text-sm">Razorpay test payment verified</strong>
                <span className="block">{verificationResult.message}</span>
                <span className="block text-emerald-300/80">Test mode does not move real money. Your order remains unpaid and no invoice was created.</span>
              </div>
            </div>
          )}

          {failureState && (
            <div className="p-4 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-start gap-3 text-rose-200 text-xs">
              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{failureState}</span>
            </div>
          )}

          {pendingPaymentResponse && (
            <div className="p-4 bg-amber-950/40 border border-amber-800/50 rounded-xl flex items-start gap-3 text-amber-100 text-xs">
              <RefreshCw className={verifying ? 'w-4 h-4 text-amber-300 flex-shrink-0 animate-spin' : 'w-4 h-4 text-amber-300 flex-shrink-0'} />
              <span>
                {verificationMode
                  ? 'Razorpay returned a test payment response. BuildO will verify the ₹1 payment on the server and request a full refund.'
                  : 'Razorpay has returned a payment response. BuildO will confirm the order only after the backend verifies it and Razorpay reports the payment as captured.'}
              </span>
            </div>
          )}

          {showPersonalQr && (
            <div className="rounded-xl bg-dark-950 border border-cyan-700/50 p-4 space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
                <QrCode className="w-4 h-4 text-cyan-400" />
                Scan with a UPI app to pay ₹1
              </div>
              <QRCodeSVG
                value={personalUpiUri}
                size={220}
                level="M"
                includeMargin
                title="Personal UPI QR prefilled with ₹1"
                className="mx-auto rounded-xl bg-white p-2"
              />
              <div className="text-xs text-slate-200">
                <div className="font-semibold">{PERSONAL_UPI_NAME}</div>
                <div className="mt-1 font-mono text-cyan-300">{PERSONAL_UPI_ID}</div>
                <div className="mt-1 text-slate-400">Prefilled amount: ₹1.00 · INR</div>
              </div>
              <a
                href={personalUpiUri}
                className="inline-flex items-center justify-center rounded-lg bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/25"
              >
                Open in a UPI app
              </a>
              <p className="text-left text-[11px] leading-relaxed text-amber-200/90">
                This direct UPI transfer bypasses Razorpay. Confirm the ₹1 payment in your UPI app and issue any refund manually there. BuildO cannot automatically verify this QR payment, refund it, or mark this order paid. Check the amount before approving in your UPI app.
              </p>
            </div>
          )}

          <div className="rounded-xl bg-dark-950 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {showPersonalQr
                ? <QrCode className="w-4 h-4 text-cyan-400" />
                : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
              {showPersonalQr ? 'Direct UPI payment' : 'Razorpay Checkout'}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {verificationMode
                ? showPersonalQr
                  ? 'This payment goes directly to the personal UPI account shown above. It is separate from Razorpay Test Mode and needs manual payment confirmation and refund.'
                  : 'Razorpay Checkout uses simulated test-mode ₹1 verification and BuildO requests a full refund in test mode. The order total above is not charged, and the BuildO order remains unpaid.'
                : 'Choose an available payment method in Razorpay’s secure checkout. BuildO never receives or stores your card number or CVV.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {showPersonalQr
                ? 'Personal UPI QR payments are not verified by the BuildO server.'
                : 'Razorpay Checkout payment status is verified by the BuildO server.'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2.5 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Close
            </button>

            {verificationResult ? (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Done
              </button>
            ) : pendingPaymentResponse ? (
              <button
                type="button"
                onClick={() => verifyPayment(pendingPaymentResponse)}
                disabled={busy}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs disabled:opacity-50"
              >
                {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {verificationMode && failureState ? 'Retry verification and refund' : 'Check payment status'}
              </button>
            ) : verificationMode ? (
              <>
                {showPersonalQr ? (
                  <button
                    type="button"
                    onClick={() => setShowPersonalQr(false)}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Back to payment options
                  </button>
                ) : PERSONAL_UPI_ID && PERSONAL_UPI_NAME ? (
                  <button
                    type="button"
                    onClick={() => setShowPersonalQr(true)}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                  >
                    <QrCode className="w-4 h-4" />
                    Show personal UPI QR · ₹1
                  </button>
                ) : null}
                {!showPersonalQr && (
                  <button
                    type="button"
                    onClick={openRazorpayCheckout}
                    disabled={busy}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                  >
                    {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Test ₹1 with Razorpay Checkout
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={openRazorpayCheckout}
                disabled={busy}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Opening checkout…
                  </>
                ) : (
                  <>
                    {`Pay ₹${Number(order.finalAmount).toLocaleString('en-IN')}`}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
