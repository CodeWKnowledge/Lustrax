import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminTable from '../../components/admin/ui/AdminTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import DetailsModal from '../../components/admin/ui/DetailsModal'
import { motion } from 'framer-motion'
import { 
  Payment02Icon,
  ViewIcon
} from 'hugeicons-react'

const PAGE_SIZE = 10

const Finance = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPayments()
  }, [page])

  const fetchPayments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(email, full_name), order_items(*, products(name, price))')
      .not('payment_reference', 'is', null)
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    
    if (data) {
      setPayments(data)
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment)
    setIsModalOpen(true)
  }

  const getModalSections = (payment) => {
    if (!payment) return []
    return [
      { label: 'Settlement Ref', value: payment.payment_reference?.toUpperCase() || 'N/A' },
      { label: 'Timestamp', value: new Date(payment.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) },
      { label: 'Client Identity', value: `${payment.profiles?.full_name || 'Anonymous'} (${payment.profiles?.email || 'N/A'})` },
      { label: 'Gross Settlement', value: <span className="text-gold font-bold">₦{parseFloat(payment.total_amount).toLocaleString()}</span> },
      { label: 'Status', value: <StatusBadge status={payment.status} /> },
      { 
        label: 'Itemized Manifest', 
        value: (
          <div className="space-y-4 pt-2">
            {payment.order_items?.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] border-b border-gray-50 pb-2">
                <span className="font-bold uppercase tracking-widest text-charcoal">{item.products?.name} (x{item.quantity})</span>
                <span className="text-gray-400">₦{(parseFloat(item.price) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ),
        fullWidth: true 
      }
    ]
  }

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.5em] italic">Balancing Master Ledger...</p>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 md:space-y-12 pb-20"
    >
      <DetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Settlement Intelligence"
        sections={getModalSections(selectedPayment)}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-50 pb-8 md:pb-10">
        <div className="space-y-2">
           <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-gold italic">Financial Intelligence</span>
           <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Settlement Ledger</h1>
        </div>
        <span className="text-[8px] lg:text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em]">{payments.length} Verified Transactions</span>
      </div>

      <AdminTable 
        headers={[
          { label: 'Settlement Ref' },
          { label: 'Client Identity' },
          { label: 'Gross Amount' },
          { label: 'Verification Status', align: 'center' },
          { label: 'Action', align: 'right' }
        ]}
      >
        {payments.map(pay => (
          <tr key={pay.id} className="block lg:table-row text-sm border border-gray-100 lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:border-b lg:border-gray-50 rounded-xl mb-4 lg:mb-0 lg:rounded-none group hover:bg-soft-bg/30 transition-luxury p-5 lg:p-0">
            <td className="block lg:table-cell px-0 lg:px-10 py-2 lg:py-8 font-mono text-[9px] text-gray-300 group-hover:text-charcoal transition-luxury">
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="hidden lg:flex w-10 h-10 rounded-full bg-soft-bg border-subtle items-center justify-center text-gray-200 group-hover:text-gold transition-luxury flex-shrink-0">
                  <Payment02Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                   <span className="lg:hidden text-gray-400 mr-2 uppercase tracking-widest font-bold">Ref:</span>
                   <span className="truncate inline-block max-w-[180px] sm:max-w-none">
                     {pay.payment_reference?.toUpperCase()}
                   </span>
                </div>
              </div>
            </td>
            <td className="block lg:table-cell px-0 lg:px-10 py-2 lg:py-8 text-[11px] font-bold uppercase tracking-widest text-charcoal truncate">
               <span className="lg:hidden text-gray-400 mr-2 font-normal lowercase">Client:</span>
               <span className="truncate inline-block max-w-[220px] sm:max-w-none">
                 {pay.profiles?.email || 'Unknown Client'}
               </span>
            </td>
            <td className="block lg:table-cell px-0 lg:px-10 py-2 lg:py-8 text-[11px] font-bold text-charcoal tracking-widest">
               <span className="lg:hidden text-gray-400 mr-2 font-normal">Gross:</span>
               ₦{parseFloat(pay.total_amount).toLocaleString()}
            </td>
            <td className="block lg:table-cell px-0 lg:px-10 py-3 lg:py-8 lg:text-center">
               <StatusBadge status={pay.status} />
            </td>
            <td className="block lg:table-cell px-0 lg:px-10 py-4 lg:py-8 lg:text-right">
                <div className="flex items-center justify-between lg:justify-end">
                   <span className="lg:hidden text-gray-400 text-[8px] font-bold uppercase tracking-widest">Action</span>
                   <button onClick={() => handleViewDetails(pay)} className="text-gray-200 hover:text-gold transition-luxury p-2">
                       <ViewIcon size={18} />
                   </button>
                </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
         <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300">
           Ledger Page {page}
         </span>
         <div className="flex items-center space-x-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="text-[9px] font-black uppercase tracking-[0.4em] text-charcoal disabled:opacity-20 hover:text-gold transition-luxury px-4 py-2"
            >
              Previous
            </button>
            <div className="w-[1px] h-4 bg-gray-50"></div>
            <button 
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="text-[9px] font-black uppercase tracking-[0.4em] text-charcoal disabled:opacity-20 hover:text-gold transition-luxury px-4 py-2"
            >
              Next Protocol
            </button>
         </div>
      </div>
    </motion.div>
  )
}

export default Finance
