import { motion } from 'framer-motion'
import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight01Icon, SparklesIcon, ShieldEnergyIcon, Award01Icon } from 'hugeicons-react'
import ProductCard from '@/modules/marketing/products/components/ProductCard'
import Skeleton from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { Helmet } from 'react-helmet-async'
import { getOptimizedImage } from '@/utils/imageOptimizer'

// Brand Visual Assets
import heroImg from '@/assets/Images/hero2.jpeg'
import chainsImg from '@/assets/Images/Chains.jpg'
import advertImg from '@/assets/Images/advert.jpg'
import menJewelryImg from '@/assets/Images/Men jewelry.jpg'
import mensBraceletsImg from '@/assets/Images/Mens-Bracelets.jpg'
import womanNeckImg from '@/assets/Images/woman-neck.jpg'

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[3/4] rounded-[4px]" />
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newReleases, setNewReleases] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    if (heroRef.current?.complete) setHeroLoaded(true)

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
    <div className="bg-white min-h-screen text-charcoal">
      <Helmet>
        <title>Lustrax Jewelries | Contemporary Urban Luxury & Fine Jewelry</title>
        <meta 
          name="description" 
          content="Discover handcrafted contemporary fine jewelry, solid gold chains, bespoke rings and timeless accessories created for individuality and royalty." 
        />
        <link rel="canonical" href="https://lustrax-jewelries.com/home" />
      </Helmet>

      {/* 1. CINEMATIC EDITORIAL HERO */}
      <section className="relative min-h-[92vh] flex items-end justify-start overflow-hidden bg-obsidian text-white pt-24 pb-16 lg:pb-24">
        {/* Cinematic Backdrop Image with Fine Grain & Gradient Scrim */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full relative"
          >
            <img 
              ref={heroRef}
              src={getOptimizedImage(heroImg, 1920)} 
              alt="Lustrax Luxury Jewellery Campaign"
              fetchPriority="high"
              onLoad={() => setHeroLoaded(true)}
              className={`w-full h-full object-cover object-center transition-all duration-700 ${heroLoaded ? 'opacity-70 blur-0' : 'opacity-0 blur-md'}`}
            />
            {/* Architectural Darkness Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/40 to-transparent" />
          </motion.div>
        </div>

        {/* Hero Content Block */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-8"
          >
            <div className="inline-flex items-center space-x-3 border-l-2 border-gold pl-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-gold">
                New Collection, 2025
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-display font-normal tracking-[-0.03em] leading-[0.95] text-white">
              STAND OUT <br />
              <span className="italic font-normal font-serif text-gold-light">EVERY DAY.</span>
            </h1>

            <p className="text-body text-gray-300 max-w-xl text-base sm:text-lg leading-relaxed font-normal">
              Real jewelry, real quality. Lustrax makes chains, rings and accessories that look great and last long.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link 
                to="/" 
                className="inline-flex items-center justify-center px-8 py-4 bg-gold text-obsidian text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-gold-light transition-luxury shadow-premium"
              >
                Shop Now
              </Link>
              <a 
                href="#manifesto" 
                className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-white hover:text-obsidian transition-luxury"
              >
                Our Story
              </a>
            </div>
          </motion.div>
        </div>

        {/* Discreet Downward Anchor */}
        <div className="absolute bottom-6 right-8 lg:right-12 hidden lg:flex items-center space-x-3 text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">
          <span>Lagos × Global</span>
        </div>
      </section>

      {/* 2. BRAND MANIFESTO SECTION */}
      <section id="manifesto" className="py-24 lg:py-36 bg-stone border-b border-neutral-border">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <span className="text-subheading text-gold block">
            About Lustrax
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight text-charcoal">
            "WE MAKE PIECES YOU'LL BE PROUD TO WEAR EVERY SINGLE DAY."
          </h2>
          <div className="w-16 h-[2px] bg-gold mx-auto"></div>
          <p className="text-body text-gray-600 max-w-2xl mx-auto text-base lg:text-lg leading-relaxed">
            Good jewelry should speak for you without saying too much. We design solid, well-made pieces that match your everyday style and help you stand out with confidence.
          </p>
        </div>
      </section>

      {/* 3. EDITORIAL COLLECTION SHOWCASES */}
      <section className="py-24 lg:py-36 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-neutral-border">
            <div>
              <span className="text-subheading text-gold block mb-2">Our Top Picks</span>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-charcoal">Featured Categories</h2>
            </div>
            <Link 
              to="/" 
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-ui text-charcoal hover:text-gold transition-luxury group"
            >
              <span>View All Items</span>
              <ArrowRight01Icon size={14} className="group-hover:translate-x-1.5 transition-luxury" />
            </Link>
          </div>

          {/* Asymmetric Editorial Collage */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Major Card 1 */}
            <div className="md:col-span-7 group relative overflow-hidden bg-stone aspect-[16/11]">
              <img 
                src={getOptimizedImage(chainsImg, 1000)} 
                alt="Chains and Necklaces"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-transparent p-8 lg:p-12 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold mb-2">Chains</span>
                <h3 className="text-2xl lg:text-4xl font-display font-bold mb-3">Chains & Cuban Links</h3>
                <p className="text-xs text-gray-300 max-w-md mb-6 hidden sm:block">
                  Strong, clean links built for everyday wear and made to last.
                </p>
                <Link 
                  to="/?category=Necklaces" 
                  className="inline-flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.25em] text-white hover:text-gold transition-luxury"
                >
                  <span>Shop Chains</span>
                  <ArrowRight01Icon size={14} />
                </Link>
              </div>
            </div>

            {/* Major Card 2 */}
            <div className="md:col-span-5 group relative overflow-hidden bg-stone aspect-[4/5]">
              <img 
                src={getOptimizedImage(womanNeckImg, 800)} 
                alt="Pendants and Necklaces"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-transparent p-8 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold mb-2">Necklaces</span>
                <h3 className="text-2xl lg:text-3xl font-display font-bold mb-3">Pendants & Necklaces</h3>
                <Link 
                  to="/?category=Necklaces" 
                  className="inline-flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.25em] text-white hover:text-gold transition-luxury"
                >
                  <span>Shop Necklaces</span>
                  <ArrowRight01Icon size={14} />
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="md:col-span-6 group relative overflow-hidden bg-stone aspect-[16/10]">
              <img 
                src={getOptimizedImage(mensBraceletsImg, 900)} 
                alt="Men's Bracelets"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-transparent p-8 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold mb-2">Wristwear</span>
                <h3 className="text-2xl font-display font-bold mb-2">Bracelets & Cuffs</h3>
                <Link 
                  to="/?category=Bracelets" 
                  className="inline-flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.25em] text-white hover:text-gold transition-luxury"
                >
                  <span>Shop Bracelets</span>
                  <ArrowRight01Icon size={14} />
                </Link>
              </div>
            </div>

            {/* Card 4 */}
            <div className="md:col-span-6 group relative overflow-hidden bg-stone aspect-[16/10]">
              <img 
                src={getOptimizedImage(menJewelryImg, 900)} 
                alt="Rings and Watches"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-transparent p-8 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold mb-2">Rings & Watches</span>
                <h3 className="text-2xl font-display font-bold mb-2">Rings & Watches</h3>
                <Link 
                  to="/?category=Rings" 
                  className="inline-flex items-center space-x-2 text-[10px] uppercase font-bold tracking-[0.25em] text-white hover:text-gold transition-luxury"
                >
                  <span>Shop Rings & Watches</span>
                  <ArrowRight01Icon size={14} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. THE SIGNATURE VAULT (FEATURED DATABASE PRODUCTS) */}
      {(loading || featuredProducts.length > 0) && (
        <section className="py-24 lg:py-36 bg-soft-bg border-y border-neutral-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-neutral-border">
              <div>
                <span className="text-subheading text-gold block mb-2">Popular Items</span>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-charcoal">Featured Products</h2>
              </div>
              <Link 
                to="/" 
                className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-ui text-charcoal hover:text-gold transition-luxury group"
              >
                <span>Shop All Items</span>
                <ArrowRight01Icon size={14} className="group-hover:translate-x-1.5 transition-luxury" />
              </Link>
            </div>
            <ProductGrid products={featuredProducts} loading={loading} />
          </div>
        </section>
      )}

      {/* 5. EDITORIAL CAMPAIGN BANNER */}
      <section className="py-32 bg-obsidian text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src={getOptimizedImage(advertImg, 1400)} 
            alt="Lustrax Banner"
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-obsidian/70" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 space-y-6">
          <span className="text-subheading text-gold">Exclusive Pieces</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight">
            QUALITY THAT STANDS OUT.
          </h2>
          <p className="text-body text-gray-300 max-w-2xl mx-auto text-base leading-relaxed">
            Every piece is crafted in limited batches so you get something special that not everyone has.
          </p>
          <div className="pt-4">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center px-10 py-4 border border-gold text-gold text-[11px] uppercase font-bold tracking-[0.25em] hover:bg-gold hover:text-obsidian transition-luxury"
            >
              Shop All Products
            </Link>
          </div>
        </div>
      </section>

      {/* 6. NEW RELEASES */}
      {(loading || newReleases.length > 0) && (
        <section className="py-24 lg:py-36 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-neutral-border">
              <div>
                <span className="text-subheading text-gold block mb-2">Just Dropped</span>
                <h2 className="text-3xl lg:text-4xl font-display font-bold text-charcoal">New Arrivals</h2>
              </div>
              <Link 
                to="/" 
                className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-ui text-charcoal hover:text-gold transition-luxury group"
              >
                <span>View All Arrivals</span>
                <ArrowRight01Icon size={14} className="group-hover:translate-x-1.5 transition-luxury" />
              </Link>
            </div>
            <ProductGrid products={newReleases} loading={loading} />
          </div>
        </section>
      )}

      {/* 7. CRAFTSMANSHIP & ATELIER VALUES */}
      <section className="py-24 bg-stone border-t border-neutral-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <Award01Icon size={28} className="text-gold mx-auto md:mx-0" />
              <h3 className="text-lg font-bold font-display uppercase tracking-wider text-charcoal">
                Quality Materials
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We carefully finish and polish each item so it keeps its shine and holds up over time.
              </p>
            </div>
            <div className="space-y-4">
              <ShieldEnergyIcon size={28} className="text-gold mx-auto md:mx-0" />
              <h3 className="text-lg font-bold font-display uppercase tracking-wider text-charcoal">
                100% Authentic
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Every order comes packaged nicely with receipt details and genuine product certification.
              </p>
            </div>
            <div className="space-y-4">
              <SparklesIcon size={28} className="text-gold mx-auto md:mx-0" />
              <h3 className="text-lg font-bold font-display uppercase tracking-wider text-charcoal">
                Fast Support & Delivery
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Reach us on WhatsApp anytime for sizing help, order questions, or delivery across Nigeria.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default LandingPage




