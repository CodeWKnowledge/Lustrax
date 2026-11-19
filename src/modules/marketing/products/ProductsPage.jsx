import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from './components/ProductCard'
import CtaBanner from './components/CtaBanner'
import { useCtaBanners } from '@/context/CtaBannersContext'
import Skeleton from '@/components/ui/Skeleton'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getOptimizedImage } from '@/utils/imageOptimizer'
import heroImg from '@/assets/Images/hero2.jpeg'

const CATEGORIES = ['All', 'Watches', 'Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Collections']

const ProductsPage = () => {
  const { activeBanners, headerConfig } = useCtaBanners()
  const [products, setProducts] = useState([])
  const [categoryCounts, setCategoryCounts] = useState({})
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchParams] = useSearchParams()
  const searchField = searchParams.get('search')

  // Fetch all counts across categories once or on update
  const fetchCounts = useCallback(async () => {
    try {
      const { data, error: countErr } = await supabase
        .from('products')
        .select('category')
      
      if (!countErr && data) {
        const counts = {}
        data.forEach(item => {
          const c = item.category || 'Uncategorized'
          // Match standard casing
          const matched = CATEGORIES.find(cat => cat.toLowerCase() === c.toLowerCase()) || c
          counts[matched] = (counts[matched] || 0) + 1
        })
        setCategoryCounts(counts)
        setTotalCount(data.length)
      }
    } catch (e) {
      console.warn('Failed fetching category counts', e)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: false })
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
    fetchCounts()
    fetchProducts()

    // Realtime stock synchronization for the collection list
    const channel = supabase
      .channel('public:products:collection')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        fetchCounts()
        if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
        } else {
          fetchProducts()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts, fetchCounts])

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

  // Dynamic count for currently active category
  const activeCount = activeCategory === 'All' ? totalCount : (categoryCounts[activeCategory] || 0)

  return (
    <div className="bg-white min-h-screen pb-20 lg:pb-32">
      <Helmet>
        <title>{activeCategory === 'All' ? 'Shop Full Collection' : `Buy ${activeCategory}`} | Lustrax Jewelries Nigeria</title>
        <meta name="description" content={`Explore our exclusive collection of ${activeCategory.toLowerCase()} at Lustrax. Premium handcrafted luxury jewelry delivered across Nigeria.`} />
        <link rel="canonical" href={`https://lustrax-jewelries.com/${activeCategory !== 'All' ? `?category=${activeCategory}` : ''}`} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://lustrax-jewelries.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Collection",
                "item": "https://lustrax-jewelries.com/"
              }
            ]
          })}
        </script>
      </Helmet>

      {/* Full Screen Cinematic Hero Header */}
      {(() => {
        const bgImage = headerConfig?.background_image || heroImg
        return (
          <section className="relative w-full h-[65vh] min-h-[650px] flex items-center justify-center overflow-hidden bg-obsidian text-white mb-2 sm:mb-3">
            {/* Background Picture with Scrim */}
            <div className="absolute inset-0 z-0">
              <img 
                src={bgImage} 
                alt="Lustrax Collection Header" 
                className="w-full h-full object-cover object-center scale-105"
              />
              {/* Architectural Darkening Vignettes */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-obsidian via-black/50 to-black/70"
                style={{ opacity: (headerConfig?.overlay_opacity ?? 60) / 100 }}
              />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-obsidian/90" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center space-y-6 pt-24 pb-16">
              <span className="text-subheading block text-gold-light tracking-[0.4em] font-medium">
                {headerConfig?.tag || 'Online Shop'}
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white drop-shadow-lg">
                {activeCategory === 'All' ? (headerConfig?.title || 'All Products') : activeCategory}
              </h1>
              <div className="w-16 h-[1px] bg-gold mx-auto my-4" />
              <p className="text-body max-w-xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed text-gray-200 font-light">
                {headerConfig?.subtitle || 'Explore our chains, necklaces, rings, and bracelets. Made with high quality materials for everyday wear.'}
              </p>

              {/* Category-Specific Inventory Count Display */}
              <div className="pt-3">
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] font-semibold px-4 py-1.5 rounded-full border bg-black/50 text-gold border-gold/40 backdrop-blur-md shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  {activeCategory === 'All' 
                    ? (totalCount > 0 ? `${totalCount} Pieces in Vault` : 'Exclusive Vault')
                    : (activeCount > 0 ? `${activeCount} ${activeCategory} Available` : `0 ${activeCategory} Available`)
                  }
                </span>
              </div>
            </div>

            {/* Subtle bottom scroll indicator */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center z-10 pointer-events-none">
              <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
                <div className="w-1 h-2 rounded-full bg-gold animate-bounce" />
              </div>
            </div>
          </section>
        )
      })()}

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Editorial Collection Filter Bar */}
        <div className="mb-10 lg:mb-14">
          <div className="border-y border-neutral-border py-3">
             <div className="flex items-center justify-start md:justify-center overflow-x-auto filter-scrollbar gap-2 sm:gap-2.5 py-1 px-1 scroll-smooth">
               {CATEGORIES.map(cat => {
                 const count = cat === 'All' ? totalCount : (categoryCounts[cat] || 0)
                 const isActive = activeCategory === cat
                 return (
                   <button
                     key={cat}
                     onClick={() => setActiveCategory(cat)}
                     className={`flex-shrink-0 inline-flex items-center gap-2 py-1.5 px-3.5 sm:px-4 rounded-full text-[9px] sm:text-[10px] font-normal uppercase tracking-[0.16em] border transition-luxury ${
                       isActive 
                         ? 'bg-obsidian text-gold border-obsidian shadow-premium-sm' 
                         : 'bg-white text-gray-500 border-neutral-border hover:border-charcoal hover:text-charcoal'
                     }`}
                   >
                     <span>{cat}</span>
                     <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-sans transition-luxury ${
                       isActive 
                         ? 'bg-gold/20 text-gold font-bold' 
                         : 'bg-gray-100 text-gray-400 group-hover:text-charcoal'
                     }`}>
                       {count}
                     </span>
                   </button>
                 )
               })}
             </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="py-24 text-center space-y-6">
            <p className="text-subheading text-red-400 italic">{error}</p>
            <button
              onClick={fetchProducts}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold border border-gold px-8 py-3.5 hover:bg-gold hover:text-obsidian transition-luxury"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {!error && loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 lg:gap-x-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5]" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Animated Product Grid with CTA Banners in between */}
        {!error && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-7 sm:gap-y-9 lg:gap-y-11 gap-x-3 sm:gap-x-4 lg:gap-x-6 items-stretch">
            {filteredProducts.map((product, index) => {
              // Find if any active banner is scheduled right after this index (1-based index)
              const productPosition = index + 1
              const matchingBanner = activeBanners.find(
                b => Number(b.insert_after_index) === productPosition
              )

              return (
                <React.Fragment key={product.id}>
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full"
                  >
                    <ProductCard product={product} />
                  </motion.div>

                  {/* Render CTA Banner across full width grid when reached */}
                  {matchingBanner && (
                    <CtaBanner banner={matchingBanner} />
                  )}
                </React.Fragment>
              )
            })}
            
            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-28 text-center space-y-4"
              >
                <span className="text-subheading text-gold block">No Items Found</span>
                <p className="text-body text-gray-400">There are no products matching your search right now.</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
