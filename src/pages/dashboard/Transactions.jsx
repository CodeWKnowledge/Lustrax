import { formatCurrency } from '../../utils/formatters';
﻿import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { generateReceipt } from '../../utils/receiptGenerator';
import { 
  Invoice01Icon, 
  Download01Icon, 
  Search01Icon,
  FilterIcon,
  InformationCircleIcon
} from 'hugeicons-react';

const Transactions = () => {
  const { user } = useAuth();
  const { showAlert } = useModal();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          order:orders (
            id,
            total_amount,
            order_items (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      showAlert('Error', 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (transaction) => {
    const name = user.user_metadata?.full_name || user.email || 'Valued Customer';
    const receiptData = {
      order: {
        ...transaction.order,
        items: transaction.order.order_items
      },
      transaction: transaction,
      user: {
        full_name: name,
        email: user.email
      },
      customerName: name
    };
    generateReceipt(receiptData);
  };

  const filteredTransactions = transactions.filter(t => 
    t.payment_reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-charcoal uppercase tracking-tighter">Transaction History</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Official records of your luxury acquisitions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH REFERENCE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50/50 border border-gray-100 rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-widest outline-none focus:border-gold/30 focus:bg-white transition-all w-64 uppercase"
            />
          </div>
          <button className="p-3 bg-gray-50 border border-gray-100 rounded-full text-gray-400 hover:text-gold hover:border-gold/20 transition-all">
            <FilterIcon size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
           ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <InformationCircleIcon size={32} className="text-gray-200" />
          </div>
          <h3 className="text-lg font-serif text-charcoal mb-2">No Records Found</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your transaction history is currently empty</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white border border-gray-50 rounded-3xl shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] uppercase font-bold tracking-[0.3em] text-gray-400">
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Reference</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="group hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-charcoal">{new Date(trx.created_at).toLocaleDateString()}</p>
                    <p className="text-[9px] text-gray-300 font-medium">{new Date(trx.created_at).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-bold text-charcoal tracking-wider font-mono">{trx.payment_reference}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-gold">â‚¦{trx.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      trx.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDownloadReceipt(trx)}
                      className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal hover:text-gold transition-colors pt-1"
                    >
                      <Download01Icon size={14} />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;


