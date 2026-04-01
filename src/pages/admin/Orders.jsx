import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import AdminTable from '../../components/admin/ui/AdminTable'
import StatusBadge from '../../components/admin/ui/StatusBadge'
import DetailsModal from '../../components/admin/ui/DetailsModal'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency, formatLuxuryDate } from '../../utils/formatters'
import { toast } from 'react-hot-toast'
import { 
  ViewIcon, 
  FilterIcon,
  Search01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  PackageIcon,
  TruckDeliveryIcon
} from 'hugeicons-react'

const PAGE_SIZE = 10

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedOrderIds, setSelectedOrderIds] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(email, full_name, phone), order_items(*)')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    
    if (error) {
      toast.error('Failed to retrieve order intelligence')
    } else {
      setOrders(data || [])
      setFilteredOrders(data || [])
      setHasMore(data?.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [page])

  useEffect(() => {
    fetchOrders()

    // Real-time synchronization protocol
    const channel = supabase
      .channel('admin-orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOrders, page])

  useEffect(() => {
    let result = orders
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter)
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) || 
        order.profiles?.full_name?.toLowerCase().includes(term) ||
        order.profiles?.email?.toLowerCase().includes(term) ||
        order.payment_reference?.toLowerCase().includes(term)
      )
    }
    setFilteredOrders(result)
    // Clear selection if filtered items don't include them
    setSelectedOrderIds(prev => prev.filter(id => result.some(o => o.id === id)))
  }, [statusFilter, searchTerm, orders])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id))
    } else {
      setSelectedOrderIds([])
    }
  }

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, id])
    } else {
      setSelectedOrderIds(prev => prev.filter(oid => oid !== id))
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    
    if (error) {
      toast.error('Protocol override failed')
    } else {
      toast.success(`Order ${newStatus.toUpperCase()} successfully`)
      fetchOrders()
    }
  }

  const handleBulkUpdateStatus = async (newStatus) => {
    setIsBulkUpdating(true)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .in('id', selectedOrderIds)
    
    if (error) {
      toast.error(`Bulk update failed for ${selectedOrderIds.length} orders`)
    } else {
      toast.success(`Successfully updated ${selectedOrderIds.length} orders`)
      setSelectedOrderIds([])
      fetchOrders()
    }
    setIsBulkUpdating(false)
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const getModalSections = (order) => {
    if (!order) return []
    return [
      { label: 'Order ID', value: `#${order.id.slice(0,8).toUpperCase()}` },
      { label: 'Date', value: formatLuxuryDate(order.created_at) },
      { label: 'Customer Name', value: order.profiles?.full_name || 'Anonymous' },
      { label: 'Customer Contact', value: 
        <div className="flex flex-col">
          <span className="text-gray-400">{order.profiles?.email || 'N/A'}</span>
          <span className="text-gold font-bold">{order.profiles?.phone || 'NO PHONE'}</span>
        </div>
      },
      { label: 'Total Amount', value: formatCurrency(order.total_amount) },
      { label: 'Reference', value: order.payment_reference || 'MANUAL' },
      { label: 'Current Status', value: <StatusBadge status={order.status} /> },
      { 
        label: 'Order Manifest', 
        fullWidth: true,
        value: (
          <div className="mt-2 space-y-3 border-t border-gray-50 pt-4">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex flex-col space-y-2 border-b border-gray-50/50 pb-3 last:border-0 last:pb-0 pt-3 first:pt-0">
                <div className="flex justify-between items-center text-[10px] tracking-[0.2em] uppercase">
                  <span className="text-gray-500">{item.quantity}x <span className="text-charcoal font-bold ml-2">{item.product_name}</span></span>
                  <span className="font-bold text-charcoal">{formatCurrency(item.price * item.quantity)}</span>
                </div>
                {item.attributes && Object.keys(item.attributes).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(item.attributes).map(([key, val]) => (
                      <span key={key} className="text-[7px] font-bold uppercase tracking-widest text-gold bg-gold/5 px-2 py-1 rounded-sm border border-gold/10">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    ]
  }

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
       <p className="text-[10px] text-gold font-bold uppercase tracking-[0.5em] italic">Accessing Order Ledger...</p>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 md:space-y-16 lg:space-y-20 pb-20 relative"
    >
      <DetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Order Intelligence"
        sections={getModalSections(selectedOrder)}
      />

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white px-8 py-4 rounded-luxury shadow-2xl flex items-center space-x-8 border border-white/10 backdrop-blur-md"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
               {selectedOrderIds.length} Orders Selected
            </span>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex items-center space-x-4">
               <button 
                 disabled={isBulkUpdating}
                 onClick={() => handleBulkUpdateStatus('shipped')}
                 className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest hover:text-gold transition-luxury disabled:opacity-50"
               >
                 <TruckDeliveryIcon size={14} />

                 <span>Mark Shipped</span>
               </button>
               <button 
                 disabled={isBulkUpdating}
                 onClick={() => handleBulkUpdateStatus('paid')}
                 className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest hover:text-gold transition-luxury disabled:opacity-50"
               >
                 <CheckmarkCircle01Icon size={14} />
                 <span>Mark Paid</span>
               </button>
               <button 
                 disabled={isBulkUpdating}
                 onClick={() => handleBulkUpdateStatus('cancelled')}
                 className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest hover:text-red-400 transition-luxury disabled:opacity-50"
               >
                 <Cancel01Icon size={14} />
                 <span>Cancel</span>
               </button>
            </div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button 
              onClick={() => setSelectedOrderIds([])}
              className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-luxury"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-50 pb-8 md:pb-12">
        <div className="space-y-4">
           <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-gold italic">Orders Management</span>
         <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Order Intelligence</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 w-full md:w-auto">
           <div className="flex items-center space-x-4 bg-soft-bg px-4 py-3 rounded-luxury border border-gray-50 focus-within:border-gold/30 transition-luxury min-w-[280px]">
              <Search01Icon size={14} className="text-gray-300" />
              <input 
                type="text"
                placeholder="SEARCH BY NAME, EMAIL, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal outline-none w-full placeholder:text-gray-200"
              />
           </div>

           <div className="flex items-center space-x-4 bg-soft-bg px-4 py-3 rounded-luxury border border-gray-50 focus-within:border-gold/30 transition-luxury">
              <FilterIcon size={14} className="text-gray-300" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal outline-none cursor-pointer"
              >
                 <option value="all">ALL STATUSES</option>
                 <option value="pending">PENDING</option>
                 <option value="paid">PAID</option>
                 <option value="shipped">SHIPPED</option>
                 <option value="delivered">DELIVERED</option>
                 <option value="cancelled">CANCELLED</option>
              </select>
           </div>
           
           <span className="hidden lg:block text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em] pl-4 border-l border-gray-50 h-6 leading-6">
             {filteredOrders.length} DISCOVERED
           </span>
        </div>
      </div>

      <AdminTable 
        onSelectAll={handleSelectAll}
        isAllSelected={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
        headers={[
          { label: 'Customer' },
          { label: 'Total Value' },
          { label: 'Status', align: 'center' },
          { label: 'Actions', align: 'right' }
        ]}
        className="overflow-x-auto"
      >
        {filteredOrders.map(order => (
          <tr key={order.id} className={`block lg:table-row text-sm border-b border-gray-50 last:border-0 group transition-luxury p-4 lg:p-0 ${selectedOrderIds.includes(order.id) ? 'bg-gold/5' : 'hover:bg-soft-bg/20'}`}>
            <td className="px-6 py-5 lg:px-10 lg:py-8 w-12 hidden lg:table-cell">
               <input 
                 type="checkbox" 
                 checked={selectedOrderIds.includes(order.id)}
                 onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                 className="w-4 h-4 accent-gold cursor-pointer border-gray-200 rounded-sm"
               />
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-8 py-1 lg:py-8">
               <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal">{order.profiles?.full_name || 'Anonymous User'}</span>
                  <div className="flex flex-col text-[8px] font-bold uppercase tracking-widest mt-1">
                    <span className="text-gray-300 opacity-40 italic">{order.profiles?.email || 'N/A'}</span>
                    <span className="text-gold/60">{order.profiles?.phone || ''}</span>
                  </div>
               </div>
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-8 py-1 lg:py-8 text-[11px] font-bold text-charcoal tracking-widest">
               <span className="lg:hidden text-gray-400 mr-2 font-normal uppercase">Amount:</span>
               {formatCurrency(order.total_amount)}
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-8 py-4 lg:py-8 lg:text-center">
                <StatusBadge status={order.status} />
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-8 py-4 lg:py-8 lg:text-right">
               <div className="flex items-center justify-between lg:justify-end space-x-6">
                  <div className="relative">
                     <select 
                       onChange={(e) => updateStatus(order.id, e.target.value)}
                       className="bg-transparent border-b border-gray-100 hover:border-gold transition-luxury px-2 py-1 text-[8px] font-bold uppercase tracking-[0.3em] outline-none cursor-pointer text-gray-400 hover:text-charcoal"
                       value={order.status}
                     >
                        <option value="pending">PENDING</option>
                        <option value="paid">PAID</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                     </select>
                  </div>
                  <button onClick={() => handleViewDetails(order)} className="text-gray-200 hover:text-gold transition-luxury p-2">
                     <ViewIcon size={18} />
                  </button>
               </div>
            </td>
          </tr>
        ))}
        {filteredOrders.length === 0 && (
          <tr>
            <td colSpan={6} className="py-20 text-center">
               <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] italic">No matching orders found in the luxury ledger.</p>
            </td>
          </tr>
        )}
      </AdminTable>

      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
         <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300">
           Manifest Page {page}
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

export default Orders
