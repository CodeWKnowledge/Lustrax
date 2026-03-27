import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ui/ProductCard'
import Skeleton from '../components/ui/Skeleton'
import { useSearchParams } from 'react-router-dom'

const CATEGORIES = ['All', 'Watches', 'Necklaces', 'Earrings', 'Rings']

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchParams] = useSearchParams()
  const searchField = searchParams.get('search')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      // Server-side category filtering (M-7: eliminates transferring full dataset)
      if (activeCategory !== 'All') {
        query = query.ilike('category', activeCategory)
      }

      const { data, error: dbError } = await query
      if (dbError) throw dbError
      setProducts(data || [])
    } catch (err) {
      console.error('Products fetch error:', err)
      setError('Unable to load collection. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    fetchProducts()

    // Realtime stock synchronization for the collection list
    const channel = supabase
      .channel('public:products:collection')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts])

  // Client-side search filter applied on top of server-side category data
  const filteredProducts = searchField
    ? products.filter(p => {
        const term = searchField.toLowerCase()
        return (
          p.name?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term)
        )
      })
    : products

  return (
    <div className="bg-white min-h-screen pt-24 lg:pt-32 pb-20 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header & Filters */}
        <div className="mb-12 lg:mb-16">
          <div className="text-center mb-10">
            <h1 className="text-h1 text-charcoal mb-4">The Collection</h1>
            <p className="text-body text-gray-400 max-w-xl mx-auto">Explore our full repertoire of meticulously crafted fine jewelry, designed to elevate your personal narrative.</p>
          </div>
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 border-b border-gray-100 pb-4">
             {CATEGORIES.map(cat => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat)}
                 className={`relative py-2 px-2 text-ui transition-luxury ${activeCategory === cat ? 'text-charcoal' : 'text-gray-400 hover:text-charcoal'}`}
               >
                 {cat}
                 {activeCategory === cat && (
                   <motion.div 
                     layoutId="activeFilter"
                     className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold"
                   />
                 )}
               </button>
             ))}
          </div>
        </div>

        {/* Error State (N-1) */}
        {error && (
          <div className="py-20 text-center">
            <p className="text-subheading text-red-400 italic mb-6">{error}</p>
            <button
              onClick={fetchProducts}
              className="text-[10px] font-bold uppercase tracking-widest text-gold border border-gold/30 px-6 py-3 hover:bg-gold hover:text-white transition-luxury"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {!error && loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 lg:gap-x-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] rounded-luxury" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Animated Product Grid */}
        {!error && !loading && (
          <motion.div 
            layout
            className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 lg:gap-y-16 gap-x-4 lg:gap-x-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <p className="text-subheading text-gray-400 italic">No pieces found in this category.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Products
