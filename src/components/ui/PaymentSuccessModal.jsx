import { formatCurrency } from '../../utils/formatters';
﻿import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateReceipt } from '../../utils/receiptGenerator';
import { 
  CheckmarkCircle01Icon, 
  Download01Icon, 
  DashboardSquare02Icon, 
  ShoppingBag01Icon,
  Cancel01Icon
} from 'hugeicons-react';

const PaymentSuccessModal = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();

  if (!isOpen || !data) return null;

  const { order, transaction, user } = data;

  const handleDownload = () => {
    generateReceipt({ order, transaction, user, customerName });
  };

  // Personalization logic
  const customerName = (data.customerName || user?.full_name || user?.email || 'Customer')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Item slicing logic
  const MAX_ITEMS = 3;
  const visibleItems = order.items?.slice(0, MAX_ITEMS) || [];
  const hiddenCount = (order.items?.length || 0) - MAX_ITEMS;

  // SVG Repeated Watermark Pattern (Base64)
  const watermarkPattern = `url("data:image/svg+xml,%3Csvg width='120' height='80' viewBox='0 0 120 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='40' font-family='serif' font-size='10' font-weight='bold' fill='%23000' fill-opacity='0.1' transform='rotate(-20 60 40)'%3ELUSTRAX%3C/text%3E%3C/svg%3E")`;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-[380px] h-[580px] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] border border-gray-100 relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 z-50 p-2 text-gray-300 hover:text-gold transition-luxury group"
        >
          <Cancel01Icon size={18} className="group-hover:rotate-90 transition-luxury" />
        </button>
        
        {/* Patterned Watermark Background */}
        <div 
          className="absolute inset-0 pointer-events-none select-none opacity-100"
          style={{ backgroundImage: watermarkPattern }}
        />

        {/* PAID Stamp */}
        <div className="absolute top-6 right-6 pointer-events-none z-10">
          <div className="border-2 border-green-500 text-green-500/40 px-3 py-1 rounded-md text-[10px] font-black tracking-[0.3em] transform rotate-12 flex flex-col items-center">
             <span>PAID</span>
             <span className="text-[5px] tracking-[0.4em] uppercase">Authenticated</span>
          </div>
        </div>

        <div className="h-full flex flex-col">
          <div className="p-8 pb-4 flex-grow space-y-8 relative z-20 overflow-hidden">
            {/* Header */}
            <div className="text-center space-y-4">
               <div className="mx-auto w-12 h-12 bg-charcoal text-white rounded-full flex items-center justify-center shadow-xl shadow-black/10">
                 <CheckmarkCircle01Icon size={24} />
               </div>
                <div className="space-y-1">
                  <h1 className="text-h2 !text-xl text-charcoal tracking-tighter uppercase">Acquisition Confirmed</h1>
                  <p className="text-ui !text-[7px] text-gray-400 tracking-[0.4em]">REFERENCE ID: {transaction.payment_reference.slice(0, 16)}</p>
                </div>
            </div>

            {/* Metadata Section */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-6 border-y border-gray-50/80">
               <div className="space-y-1">
                 <p className="text-subheading !text-[7px] text-gray-300">Transaction Date</p>
                 <p className="text-ui !text-[10px] text-charcoal">{new Date(transaction.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
               </div>
               <div className="space-y-1 text-right">
                 <p className="text-subheading !text-[7px] text-gray-300">Curator</p>
                 <p className="text-ui !text-[10px] text-charcoal truncate">{customerName}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-subheading !text-[7px] text-gray-300">Protocol Email</p>
                 <p className="text-ui !text-[10px] text-charcoal lowercase truncate">{user.email}</p>
               </div>
               <div className="space-y-1 text-right">
                 <p className="text-subheading !text-[7px] text-gray-300">Contact Line</p>
                 <p className="text-ui !text-[10px] text-charcoal truncate">{data.phone || 'N/A'}</p>
               </div>
            </div>

            {/* Sliced Order Items */}
            <div className="space-y-4">
                <div className="flex justify-between items-center text-subheading !text-[8px] text-gray-400 mb-2">
                   <span>Manifest Composition</span>
                   <span>Valuation</span>
                </div>
               <div className="space-y-3">
                  {visibleItems.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-start animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex-grow max-w-[70%]">
                          <p className="text-sm font-playfair font-bold text-charcoal truncate">{item.product_name || item.name}</p>
                          {/* Variant Attributes (Size, Color, etc.) */}
                          {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                              {Object.entries(item.selected_attributes).map(([key, val]) => (
                                <span key={key} className="text-[6px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-2 py-0.5 rounded-sm border border-gold/10">
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-ui !text-[8px] text-gray-400">Qty: {item.quantity}  ₦{(item.price || 0).toLocaleString()}</p>
                        </div>
                        <p className="text-price !text-xs text-charcoal/80">₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                     </div>
                  ))}
                  
                  {hiddenCount > 0 && (
                     <div className="pt-2 flex items-center space-x-2 text-subheading !text-[8px] text-gold !italic">
                        <span className="w-4 h-[1px] bg-gold/30"></span>
                        <span>+ {hiddenCount} more acquisitions</span>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* Fixed Footer with Payment Summary */}
          <div className="bg-soft-bg/50 backdrop-blur-sm p-8 space-y-8 border-t border-gray-100 flex-shrink-0 relative z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
             <div className="flex justify-between items-end">
                <div className="space-y-1">
                   <p className="text-subheading !text-[8px] text-gray-400">Consolidated Total</p>
                   <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                      <span className="text-ui !text-[8px] text-green-600">Verified Payment</span>
                   </div>
                </div>
                <p className="text-h2 !text-3xl text-charcoal !tracking-tighter">â‚¦{(order.total_amount || 0).toLocaleString()}</p>
             </div>

            <div className="space-y-3">
               <button 
                  onClick={handleDownload}
                  className="w-full h-12 bg-charcoal text-white rounded-xl flex items-center justify-center gap-3 text-ui hover:bg-black transition-luxury active:scale-[0.98] shadow-xl shadow-black/10 group"
                >
                  <Download01Icon size={16} className="group-hover:-translate-y-0.5 transition-luxury" />
                  Acquire PDF Manifest
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { onClose(); navigate('/dashboard'); }}
                    className="h-10 border border-gray-100 bg-white text-charcoal rounded-xl flex items-center justify-center gap-2 text-ui !text-[9px] hover:bg-gray-50 transition-luxury"
                  >
                    <DashboardSquare02Icon size={14} />
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { onClose(); navigate('/'); }}
                    className="h-10 border border-gray-100 bg-white text-charcoal rounded-xl flex items-center justify-center gap-2 text-ui !text-[9px] hover:bg-gray-50 transition-luxury"
                  >
                    <ShoppingBag01Icon size={14} />
                    Boutique
                  </button>
                </div>
            </div>

             <div className="pt-2 text-center space-y-2">
                <p className="text-ui !text-[8px] text-gray-300 italic opacity-60">Lustrax Verified Portfolio Report</p>
                <p className="text-[7px] text-gray-300 uppercase tracking-widest opacity-40">
                  By completing this acquisition, you agreed to our Terms & Conditions and Refund Policy.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;


