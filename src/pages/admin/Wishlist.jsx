import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminTable from '../../components/admin/ui/AdminTable'
import { motion } from 'framer-motion'
import { 
  FavouriteIcon, 
  Analytics02Icon
} from 'hugeicons-react'

const PAGE_SIZE = 10

const Wishlist = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('wishlist')
      .select('*, profiles(email), products!left(name, image_url, price)')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    
    if (data) {
      setItems(data)
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchWishlist()
  }, [page])

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.5em] italic">Loading Wishlists...</p>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 md:space-y-16 lg:space-y-20 pb-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-gray-50 pb-8 md:pb-12">
         <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-gold italic">Global Desires</span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Customer Wishlists</h1>
         </div>
        <div className="flex items-center space-x-4 text-gold mb-2">
           <Analytics02Icon size={16} />
           <span className="text-[9px] font-bold uppercase tracking-[0.3em]">{items.length} Items Saved</span>
        </div>
      </div>

      <AdminTable 
        headers={[
          { label: 'Product' },
          { label: 'Customer' },
          { label: 'Price', align: 'center' },
          { label: 'Date Saved', align: 'right' }
        ]}
      >
        {items.map(item => (
          <tr key={item.id} className="block lg:table-row text-sm border-b border-gray-50 last:border-0 group hover:bg-soft-bg/30 transition-luxury p-3 lg:p-0">
            <td className="block lg:table-cell px-0 lg:px-10 py-1 lg:py-8">
              <div className="flex items-center space-x-4 lg:space-x-6">
                <div className="w-10 h-10 lg:w-12 lg:h-16 rounded-luxury overflow-hidden border-subtle bg-soft-bg flex-shrink-0">
                  <img src={item.products?.image_url} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-luxury duration-700" alt={item.products?.name} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-charcoal">{item.products?.name || 'Unknown Piece'}</span>
              </div>
            </td>
            <td className="block lg:table-cell px-0 lg:px-10 py-1 lg:py-8 text-[11px] font-bold uppercase tracking-widest text-gray-400 italic">
               <span className="lg:hidden text-gray-400 mr-2 font-normal">Customer:</span>
               {item.profiles?.email || 'Unknown Client'}
            </td>
            <td className="block lg:table-cell px-0 lg:px-10 py-3 lg:py-8 lg:text-center text-[11px] font-bold tracking-widest text-charcoal">
               <span className="lg:hidden text-gray-400 mr-2 font-normal">Price:</span>
               ₦{parseFloat(item.products?.price || 0).toLocaleString()}
            </td>
            <td className="block lg:table-cell px-0 lg:px-10 py-4 lg:py-8 lg:text-right text-[9px] text-gray-400 font-bold uppercase tracking-widest">
               <span className="lg:hidden text-gray-400 mr-2 font-normal">Added:</span>
               {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </td>
          </tr>
        ))}
      </AdminTable>

      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
         <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300">
           Registry Page {page}
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

export default Wishlist
