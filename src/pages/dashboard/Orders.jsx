import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FilterIcon, 
  ViewIcon,
  PackageIcon,
  ShoppingBag02Icon
} from 'hugeicons-react'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import StatusBadge from '../../components/admin/ui/StatusBadge'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const PAGE_SIZE = 10
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()

      const channelKey = `customer-orders-${user.id}-${Date.now()}`
      const channel = supabase
        .channel(channelKey)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` }, (payload) => {
          setOrders(prev => prev.map(order => order.id === payload.new.id ? { ...order, ...payload.new } : order))
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, filter, page])

  const fetchOrders = async () => {
    if (page === 0) setLoading(true)
    
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, count } = await query
    if (data) {
      if (page === 0) {
        setOrders(data)
      } else {
        setOrders(prev => [...prev, ...data])
      }
      setHasMore(orders.length + data.length < (count || 0))
    }
    setLoading(false)
  }

  const loadMore = () => {
    setPage(prev => prev + 1)
  }

  // Reset page when filter changes
  useEffect(() => {
    setPage(0)
  }, [filter])

  const fetchOrderItems = async (order) => {
    setSelectedOrder(order)
    setItemsLoading(true)
    const { data, error } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', order.id)
    
    if (data) setOrderItems(data)
    setItemsLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-50 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Your Orders</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">A list of all your past orders</p>
        </div>
        
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 focus-within:border-gold/30 transition-all">
              <FilterIcon size={14} className="text-gray-300" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-[10px] uppercase font-bold tracking-widest text-charcoal outline-none cursor-pointer"
              >
                 <option value="all">All Orders</option>
                 <option value="pending">Pending</option>
                 <option value="paid">Paid</option>
                 <option value="shipped">Shipped</option>
                 <option value="delivered">Delivered</option>
              </select>
           </div>
           <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
             {orders.length} REQUESTS
           </span>
        </div>
      </div>

      <div className="bg-white rounded-luxury border border-gray-50 shadow-sm overflow-hidden">
        <table className="w-full text-left block lg:table">
          <thead className="bg-gray-50/50 hidden lg:table-header-group">
            <tr>
              <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Reference</th>
              <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Date</th>
              <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Total</th>
              <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Status</th>
              <th className="px-10 py-6 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 block lg:table-row-group">
            {orders.length > 0 ? orders.map(order => (
              <tr key={order.id} className="block lg:table-row text-sm border border-gray-100 lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:border-b lg:border-gray-50 rounded-xl mb-4 lg:mb-0 lg:rounded-none group hover:bg-soft-bg/30 transition-luxury p-5 lg:p-0">
                <td className="block lg:table-cell px-0 lg:px-10 py-1 lg:py-8 font-mono text-[10px] text-gray-400 group-hover:text-charcoal transition-luxury">
                  <span className="lg:hidden text-gray-400 mr-2 uppercase tracking-widest font-bold">Ref:</span>
                  #{order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="block lg:table-cell px-0 lg:px-10 py-1 lg:py-8">
                  <span className="lg:hidden text-gray-400 mr-2 text-[10px] uppercase font-bold tracking-widest">Date:</span>
                  <span className="text-[11px] font-bold text-charcoal tracking-widest uppercase inline-block">
                    {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </td>
                <td className="block lg:table-cell px-0 lg:px-10 py-1 lg:py-8">
                   <span className="lg:hidden text-gray-400 mr-2 text-[10px] uppercase font-bold tracking-widest">Total:</span>
                   <span className="text-[11px] font-bold text-charcoal tracking-widest inline-block">₦{order.total_amount.toLocaleString()}</span>
                </td>
                <td className="block lg:table-cell px-0 lg:px-10 py-4 lg:py-8">
                   <StatusBadge status={order.status} />
                </td>
                <td className="block lg:table-cell px-0 lg:px-10 py-4 lg:py-8 lg:text-right">
                   <div className="flex items-center justify-between lg:justify-end">
                     <span className="lg:hidden text-gray-400 text-[9px] uppercase font-bold tracking-widest">Details</span>
                     <button 
                      onClick={() => fetchOrderItems(order)}
                      className="text-gray-300 hover:text-gold transition-luxury p-2 border border-gray-50 lg:border-none rounded-luxury"
                     >
                        <ViewIcon size={18} />
                     </button>
                   </div>
                </td>
              </tr>
            )) : (
              <tr className="block lg:table-row">
                <td colSpan="5" className="block lg:table-cell py-24 text-center">
                   <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 italic">No orders found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
           <Button 
            variant="outline" 
            onClick={loadMore}
            className="text-[9px] px-12 h-11"
           >
             LOAD MORE ORDERS
           </Button>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        title={`Order Details - #${selectedOrder?.id.slice(0, 8).toUpperCase()}`}
        maxWidth="max-w-3xl"
      >
        {selectedOrder && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="space-y-1">
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Date</p>
                  <p className="text-[10px] font-bold text-charcoal">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Total Amount</p>
                  <p className="text-[10px] font-bold text-charcoal">₦{selectedOrder.total_amount.toLocaleString()}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Status</p>
                  <StatusBadge status={selectedOrder.status} />
               </div>
               <div className="space-y-1">
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Payment</p>
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">PAID</p>
               </div>
            </div>

            <div className="border-t border-gray-50 pt-8 space-y-6">
               <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-charcoal">Order Items</h4>
               {itemsLoading ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
                 </div>
               ) : (
                  <div className="space-y-4">
                     {orderItems.map((item, idx) => (
                       <div key={idx} className="flex items-center space-x-6 bg-gray-50/50 p-4 rounded-luxury border border-gray-50 group hover:border-gold/30 transition-all">
                          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                             {item.products?.image_url ? (
                               <img src={item.products.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-luxury duration-700" />
                             ) : (
                               <div className="w-full h-full bg-soft-bg flex items-center justify-center">
                                 <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">N/A</span>
                               </div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h5 className="text-[10px] font-bold text-charcoal uppercase tracking-widest truncate">
                               {item.products?.name || item.product_name || 'Product Unavailable'}
                             </h5>
                             <p className="text-[8px] text-gray-400 uppercase tracking-tighter mt-1">
                               {item.products?.description?.slice(0, 30) || 'This piece is no longer in the catalogue'}...
                             </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                             <p className="text-[10px] font-bold text-charcoal tracking-widest">₦{(item.price || 0).toLocaleString()}</p>
                             <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">QTY: {item.quantity}</p>
                          </div>
                       </div>
                     ))}
                 </div>
               )}
            </div>

            <div className="bg-soft-bg p-8 rounded-luxury border border-gray-50 mt-10">
               <div className="flex items-start space-x-4">
                  <PackageIcon size={20} className="text-gold" />
                  <div className="space-y-2">
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Shipping Information</h4>
                     <p className="text-[11px] text-gray-400 leading-relaxed italic">
                        Contact: <span className="text-gold font-bold not-italic">{selectedOrder.shipping_phone || user?.phone || 'N/A'}</span>
                     </p>
                     <p className="text-[11px] text-gray-400 leading-relaxed italic">
                        We're preparing your order for shipment to the address provided. You can track its progress here.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Orders
