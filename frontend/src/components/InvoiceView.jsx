import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { Download, Printer, X, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';

export default function InvoiceView({ order, invoice, onClose }) {
  const { showNotification } = useApp();
  const [downloading, setDownloading] = useState(false);

  if (!order) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await apiClient.downloadInvoicePdf(order.id, invoice?.invoiceNumber || order.orderNumber);
      showNotification('PDF Invoice downloaded successfully!', 'success');
    } catch (err) {
      showNotification('Failed to generate PDF: ' + err.message, 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Actions Bar */}
        <div className="p-4 border-b border-slate-800 bg-dark-850 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Digital Tax Invoice & Warranty Card</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Downloading...' : 'Download Official PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950 text-slate-200 font-sans space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight">
                Build<span className="text-cyan-400">O</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Custom PC Configurator & High Performance Workstations</p>
              <p className="text-[11px] text-slate-500 font-mono">GSTIN: 27AABCB1234F1Z9 | CIN: U72200KA2026PTC109281</p>
              <p className="text-[11px] text-slate-500">support@buildo.pc • www.buildo.pc</p>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase tracking-wider font-bold text-cyan-400 font-mono">
                ORIGINAL TAX INVOICE
              </span>
              <div className="text-base font-bold text-white font-mono mt-1">
                {invoice?.invoiceNumber || `INV-${order.orderNumber}`}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-xs font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>PAYMENT CONFIRMED (PAID)</span>
              </div>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-dark-900 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider block font-bold">
                Billed & Shipped To:
              </span>
              <div className="text-sm font-bold text-white mt-1">{order.customerName}</div>
              <div className="text-slate-300">{order.shippingAddress}</div>
              <div className="text-slate-400">{order.shippingCity} {order.postalCode}</div>
              <div className="text-slate-400 mt-1">Email: {order.customerEmail}</div>
              <div className="text-slate-400">Phone: {order.customerPhone}</div>
            </div>

            <div className="sm:border-l sm:border-slate-800 sm:pl-4">
              <span className="text-slate-400 uppercase font-mono text-[10px] tracking-wider block font-bold">
                Order & Payment Info:
              </span>
              <div className="mt-1">
                <span className="text-slate-400">Order Ref:</span> <strong className="text-white font-mono">{order.orderNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400">Build Name:</span> <span className="text-slate-200">{order.buildName || 'Custom Configuration'}</span>
              </div>
              <div>
                <span className="text-slate-400">Payment Mode:</span> <strong className="text-cyan-400">{order.paymentMethod || 'Razorpay'}</strong>
              </div>
              <div>
                <span className="text-slate-400">Transaction ID:</span> <span className="text-slate-300 font-mono">{order.transactionId || 'TXN-DIRECT'}</span>
              </div>
              <div>
                <span className="text-slate-400">Tracking Number:</span> <span className="text-slate-300 font-mono">{order.trackingNumber || 'TRK-ASSIGNED'}</span>
              </div>
            </div>
          </div>

          {/* Components Breakdown Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-mono">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3 w-28">Category</th>
                  <th className="p-3">Component Description</th>
                  <th className="p-3 w-16 text-center">Qty</th>
                  <th className="p-3 w-28 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3 font-semibold text-cyan-400 font-mono text-[11px]">{item.category}</td>
                    <td className="p-3 text-slate-200 font-medium">{item.componentName}</td>
                    <td className="p-3 text-center text-slate-400 font-mono">{item.quantity}</td>
                    <td className="p-3 text-right text-white font-mono font-semibold">
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-200">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-₹{Number(order.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>GST Tax (18%):</span>
                <span className="font-mono text-slate-200">₹{Number(order.taxAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Paid:</span>
                <span className="font-mono text-cyan-400 text-base">₹{Number(order.finalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Warranty & Assurance Footer */}
          <div className="p-4 rounded-xl bg-dark-900/60 border border-slate-800/80 flex items-start gap-3 text-[11px] text-slate-400">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div>
              <strong className="text-slate-200 block">3-Year Onsite Comprehensive Hardware Warranty</strong>
              All parts included in this build are covered by both BuildO assembly warranty and official brand warranties (Intel, AMD, NVIDIA, Corsair, ASUS, MSI). Keep this invoice for claim processing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
