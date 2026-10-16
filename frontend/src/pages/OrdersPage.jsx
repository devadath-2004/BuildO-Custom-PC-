import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import InvoiceView from '../components/InvoiceView';
import { 
  Package, Search, Clock, CheckCircle2, Truck, Wrench, 
  FileText, ArrowRight, ShieldCheck, Download, ExternalLink, RefreshCw 
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Payment verified and order queued' },
  { key: 'PROCESSING', label: 'Assembly', desc: 'Hardware installation and cable routing' },
  { key: 'SHIPPED', label: 'Stress testing', desc: 'Thermal, stability, and benchmark checks' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Insured delivery to your doorstep' }
];

export default function OrdersPage() {
  const { user, showNotification } = useApp();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    apiClient.getMyOrders()
      .then(data => {
        const customerOrders = Array.isArray(data) ? data : [];
        setAllOrders(customerOrders);
        setOrders(customerOrders);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        showNotification('Could not load your orders. Please try again.', 'error');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleLookup = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setOrders(allOrders);
      return;
    }

    if (/^BO-/i.test(query)) {
      setLoading(true);
      try {
        const order = await apiClient.getOrderByNumber(query.toUpperCase());
        setOrders(order ? [order] : []);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    const normalizedQuery = query.toLowerCase();
    setOrders(allOrders.filter(order =>
      [order.orderNumber, order.buildName, order.customerEmail]
        .some(value => String(value || '').toLowerCase().includes(normalizedQuery))
    ));
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'CONFIRMED': return 0;
      case 'PROCESSING': return 1;
      case 'SHIPPED': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  return (
    <div className="buildo-shop-page buildo-orders-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            ORDER LIFECYCLE MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            From our bench to your desk.
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Follow assembly progress, benchmark checks, insured shipping, and every milestone in between.
          </p>
        </div>

        {/* Search within the signed-in customer's orders */}
        <form onSubmit={handleLookup} className="w-full max-w-sm space-y-2">
          <label className="block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400" htmlFor="order-lookup">
            Find an order
          </label>
          <div className="flex gap-2">
            <input
              id="order-lookup"
              type="search"
              placeholder="Order number, build, or email"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-dark-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Lookup
            </button>
          </div>
        </form>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">Retrieving your order records...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-24 text-center text-slate-400 glass-panel rounded-2xl">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">{searchQuery ? 'No matching orders' : 'No orders yet'}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Try another order number, build name, or account email.' : 'Your order progress and invoices will appear here after checkout.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const currentStep = getStepIndex(order.status);

            return (
              <div
                key={order.id}
                className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1.5">{order.buildName || 'Custom Performance Build'}</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedOrderForInvoice(order)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Invoice
                    </button>

                    <button
                      onClick={() => apiClient.downloadInvoicePdf(order.id, order.orderNumber)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Visual Order Progress Tracker */}
                <div className="py-2">
                  <div className="text-xs font-mono font-bold uppercase text-slate-400 mb-4 flex items-center justify-between">
                    <span>Assembly & Delivery Progress:</span>
                    <span className="text-emerald-400 font-semibold font-mono">
                      Current Status: {order.status}
                    </span>
                  </div>

                  <div className="relative">
                    {/* Connecting line */}
                    <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
                    <div
                      className="hidden sm:block absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                      style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                      {STATUS_STEPS.map((step, idx) => {
                        const shipmentHasPassedTesting = order.status === 'SHIPPED' && idx === 2;
                        const isDone = idx < currentStep || idx === currentStep && (order.status !== 'SHIPPED' || shipmentHasPassedTesting);
                        const isCurrent = idx === currentStep && order.status !== 'SHIPPED';

                        return (
                          <div
                            key={step.key}
                            className={`p-4 rounded-xl border flex flex-col items-center sm:items-start text-center sm:text-left transition-all ${
                              isCurrent
                                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-lg'
                                : isDone
                                ? 'bg-dark-900 border-slate-800 text-slate-300'
                                : 'bg-dark-950/60 border-slate-800/60 text-slate-600'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 font-mono ${
                                isDone
                                  ? 'bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <h4 className={`text-xs font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                              {step.label}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Metadata & Components Drawer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
                  <div className="p-4 rounded-xl bg-dark-950 border border-slate-800">
                    <span className="text-slate-500 uppercase font-mono text-[10px] block font-bold">Shipping To:</span>
                    <span className="font-bold text-white block mt-1">{order.customerName}</span>
                    <span className="text-slate-400 block">{order.shippingAddress}, {order.shippingCity}</span>
                    <span className="text-slate-500 block font-mono">{order.customerPhone}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-950 border border-slate-800">
                    <span className="text-slate-500 uppercase font-mono text-[10px] block font-bold">Payment & Tracking:</span>
                    <span className="text-slate-300 block mt-1">Mode: <strong className="text-cyan-400">{order.paymentMethod || 'Razorpay'}</strong></span>
                    <span className="text-slate-400 block font-mono text-[11px]">Txn: {order.transactionId || 'PAID'}</span>
                    <span className="text-slate-400 block font-mono text-[11px]">Track: {order.trackingNumber || 'TRK-IN-TRANSIT'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 text-right flex flex-col justify-center">
                    <span className="text-slate-500 uppercase font-mono text-[10px] block font-bold">Total Paid:</span>
                    <span className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
                      ₹{Number(order.finalAmount).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">18% GST Included</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <InvoiceView
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </div>
  );
}
