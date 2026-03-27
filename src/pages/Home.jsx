import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight01Icon } from 'hugeicons-react'
import Button from '../components/ui/Button'
import ProductCard from '../components/ui/ProductCard'
import Skeleton from '../components/ui/Skeleton'
import { supabase } from '../lib/supabase'

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[4/5] rounded-luxury" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // C-6: Use parallel Promise.all instead of 3 sequential queries
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const [featuredRes, newRes, bestRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_featured', true).limit(8),
          supabase.from('products').select('*').eq('is_new_release', true).limit(8),
          supabase.from('products').select('*').eq('is_best_seller', true).limit(8),
        ])
        if (featuredRes.data) setFeaturedProducts(featuredRes.data)
        if (newRes.data) setNewReleases(newRes.data)
        if (bestRes.data) setBestSellers(bestRes.data)
      } catch (err) {
        console.error('Home products fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()

    // Realtime synchronization for homepage collections
    const channel = supabase
      .channel('public:products:home')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        const updateList = (list) => list.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
        setFeaturedProducts(prev => updateList(prev))
        setNewReleases(prev => updateList(prev))
        setBestSellers(prev => updateList(prev))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
           <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.05 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="w-full h-full"
           >
              <img 
                src="https://images.unsplash.com/photo-1515562141207-7a18b5ce7142?q=80&w=2070&auto=format&fit=crop" 
                alt="Brand Background"
                className="w-full h-full object-cover grayscale"
              />
           </motion.div>
        </div>

        <div className="relative z-10 text-center space-y-10 max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-4 lg:space-y-6"
          >
            <div className="flex justify-center items-center space-x-4 lg:space-x-6 mb-6 mt-16">
              <span className="w-8 lg:w-12 h-[1px] bg-gold/30"></span>
              <span className="text-subheading text-gold">High-End Essentials</span>
              <span className="w-8 lg:w-12 h-[1px] bg-gold/30"></span>
            </div>
            
            <h1 className="text-h1 text-gold leading-[1.1]">
              LUSTRAX JEWELRIES
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link to="/products">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-12">
                Discover the Collection
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {(loading || featuredProducts.length > 0) && (
        <section className="py-20 lg:py-32 bg-soft-bg">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 lg:mb-16 space-y-4 lg:space-y-0">
               <div>
                 <span className="text-subheading text-gold block mb-2">Curated Selection</span>
                 <h2 className="text-h2 text-charcoal">Featured Products</h2>
               </div>
               <Link to="/products" className="group flex items-center space-x-2 text-ui text-charcoal hover:text-gold transition-luxury">
                  <span>View All Features</span>
                  <ArrowRight01Icon size={14} className="group-hover:translate-x-1 transition-luxury" />
               </Link>
            </div>
            <ProductGrid products={featuredProducts} loading={loading} />
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      <section className="py-20 bg-charcoal text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1611085583191-a3b1a1a27e7?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Campaign Banner" />
         </div>
         <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
            <span className="text-subheading text-gold mb-4 inline-block">The Summer Campaign</span>
            <h2 className="text-h2 mb-6">ELEVATE YOUR AURA.</h2>
            <p className="text-body text-gray-400 max-w-2xl mx-auto mb-8">
              Discover our latest exclusive drops, crafted with impeccable attention to detail and designed to transcend seasons. Limited availability.
            </p>
            <Link to="/products">
              <button className="px-8 py-4 border border-gold text-gold font-inter text-[10px] uppercase font-bold tracking-widest hover:bg-gold hover:text-white transition-luxury">
                Explore the Campaign
              </button>
            </Link>
         </div>
      </section>

      {/* New Releases */}
      {(loading || newReleases.length > 0) && (
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 lg:mb-16 space-y-4 lg:space-y-0">
               <div>
                 <span className="text-subheading text-gold block mb-2">Just Arrived</span>
                 <h2 className="text-h2 text-charcoal">New Releases</h2>
               </div>
               <Link to="/products" className="group flex items-center space-x-2 text-ui text-charcoal hover:text-gold transition-luxury">
                  <span>Shop New Arrivals</span>
                  <ArrowRight01Icon size={14} className="group-hover:translate-x-1 transition-luxury" />
               </Link>
            </div>
            <ProductGrid products={newReleases} loading={loading} />
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {(loading || bestSellers.length > 0) && (
        <section className="py-20 lg:py-32 bg-soft-bg">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 lg:mb-16 space-y-4 lg:space-y-0">
               <div>
                 <span className="text-subheading text-gold block mb-2">Crowd Favorites</span>
                 <h2 className="text-h2 text-charcoal">Best Sellers</h2>
               </div>
               <Link to="/products" className="group flex items-center space-x-2 text-ui text-charcoal hover:text-gold transition-luxury">
                  <span>Shop Best Sellers</span>
                  <ArrowRight01Icon size={14} className="group-hover:translate-x-1 transition-luxury" />
               </Link>
            </div>
            <ProductGrid products={bestSellers} loading={loading} />
          </div>
        </section>
      )}

    </div>
  )
}

export default Home
