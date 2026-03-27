import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { FavouriteIcon, ArrowLeft01Icon, ShoppingBag02Icon, StarIcon } from 'hugeicons-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'

const ProductDetails = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { user, openAuthModal } = useAuth()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProduct()

    // Real-time synchronization for stock updates via WebSocket
    // We use a unique session-based ID to prevent channel collision during rapid navigation
    const channelId = `product-detail-${id}-${Math.random().toString(36).slice(2, 9)}`
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'products', 
        filter: `id=eq.${id}` 
      }, (payload) => {
        setProduct(prev => {
          if (!prev) return payload.new
          const updatedProduct = { ...prev, ...payload.new }
          // Synchronize locally selected quantity with new stock limit
          setQuantity(currentQty => Math.min(currentQty, updatedProduct.stock_quantity ?? 0))
          return updatedProduct
        })
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`LUSTRAX DEBUG: Product ${id} linked to realtime ledger`)
        }
        if (status === 'CLOSED') {
          console.log('LUSTRAX DEBUG: Realtime connection closed. Attempting silent recovery...')
        }
        if (err) {
          console.error('LUSTRAX ERROR: Realtime integrity breach:', err)
        }
      })

    // Fallback: re-fetch latest stock whenever user returns to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProduct(true) // Silent re-fetch to update stock without flickering
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      supabase.removeChannel(channel)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [id])

  const fetchProduct = async (silent = false) => {
    if (!silent) setLoading(true)
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error) {
      if (!silent) navigate('/products')
    } else {
      setProduct(data)
      setQuantity(currentQty => Math.min(currentQty, data.stock_quantity ?? 0))
    }
    setLoading(false)
  }

  if (loading) return (
     <div className="min-h-screen bg-white pt-48">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 lg:grid-cols-2 gap-32">
           <Skeleton className="aspect-[4/5]" />
           <div className="space-y-12">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full" />
           </div>
        </div>
     </div>
  )

  if (!product) return null

  return (
    <div className="bg-white min-h-screen pt-24 lg:pt-40 pb-20 lg:pb-32 overflow-hidden">
      <Helmet>
        <title>{product ? `${product.name} | Lustrax Jewelries` : 'Luxury Piece | Lustrax'}</title>
        <meta name="description" content={product?.description || 'Discover handcrafted luxury jewelry.'} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center text-ui mb-10 lg:mb-20 hover:text-gold transition-luxury"
        >
          <ArrowLeft01Icon size={14} className="mr-3 group-hover:-translate-x-1 transition-luxury" /> 
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-start">
          {/* Visual Presentation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-luxury bg-soft-bg relative border-subtle group">
               <img 
                 src={product.image_url} 
                 alt={product.name}
                 className="w-full h-full object-cover transition-luxury duration-[2000ms] group-hover:scale-110" 
               />
               <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            </div>

            {/* Gallery Thumbnails */}
            {product.additional_images?.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                 <div 
                   className="aspect-square rounded-lg overflow-hidden border-2 border-gold cursor-pointer"
                   onClick={() => {/* In a full impl, we'd swap the main image */}}
                 >
                    <img src={product.image_url} className="w-full h-full object-cover" alt="Main" />
                 </div>
                 {product.additional_images.map((img, idx) => (
                   <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-gold transition-luxury cursor-pointer">
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                   </div>
                 ))}
              </div>
            )}
          </motion.div>


          {/* Intellectual Property & Acquisition */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10 lg:space-y-16"
          >
            <div className="space-y-4 lg:space-y-6">
               <div className="flex items-center space-x-2 text-gold">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} size={10} className="fill-current" />)}
                  <span className="text-[8px] uppercase tracking-widest pl-2 opacity-50">Atelier Selection</span>
               </div>
               
               <h1 className="text-h1 text-charcoal uppercase leading-[1.1]">{product.name}</h1>
               
               <p className="text-price !text-2xl lg:!text-3xl text-charcoal">
                  ₦{parseFloat(product.price).toLocaleString()}
               </p>
            </div>

            <div className="space-y-10 lg:space-y-12">
               <div className="space-y-4 lg:space-y-6">
                  <p className="text-subheading text-gray-400">The Essence</p>
                  <p className="text-body !text-base lg:!text-lg font-libre italic border-l border-gold/30 pl-6 lg:pl-8 text-gray-500">
                     {product.description || 'A timeless representation of elegance, meticulously crafted to mirror the beauty of the cosmos.'}
                  </p>
               </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 pt-10 border-t border-gray-50">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center bg-soft-bg rounded-luxury border-subtle h-14 lg:h-16">
                       <button 
                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         className="w-14 lg:w-16 h-full hover:bg-white transition-luxury text-sm"
                       >—</button>
                       <span className="flex-1 text-center font-bold text-xs tracking-widest min-w-[50px] lg:min-w-[60px]">{quantity}</span>
                       <button 
                         onClick={() => setQuantity(Math.min(product?.stock_quantity ?? 0, quantity + 1))}
                         className="w-14 lg:w-16 h-full hover:bg-white transition-luxury text-sm"
                       >+</button>
                    </div>
                    {product?.stock_quantity > 0 && product?.stock_quantity <= 3 && (
                      <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest animate-pulse mt-1 block">
                        Only {product.stock_quantity} remaining
                      </span>
                    )}
                  </div>
                  
                  <Button 
                     onClick={() => {
                       if (!user) openAuthModal()
                       else addToCart(product, quantity)
                     }}
                     disabled={product.stock_quantity === 0}
                     size="lg" 
                     className="flex-grow group h-14 lg:h-16 text-ui"
                  >
                     <span>{product.stock_quantity === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}</span>
                     {product.stock_quantity > 0 && <ShoppingBag02Icon size={18} className="ml-4 group-hover:scale-110 transition-luxury" />}
                  </Button>

                  <button 
                     onClick={() => {
                       if (!user) openAuthModal()
                       else toggleWishlist(product)
                     }}
                     className={`h-14 lg:h-16 px-6 flex items-center justify-center border rounded-luxury transition-luxury ${isInWishlist(product.id) ? 'text-red-500 border-red-100 bg-red-50/30' : 'border-gray-100 hover:text-red-500 hover:border-red-100'}`}
                  >
                     <FavouriteIcon size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                  </button>

               </div>

               <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 py-10 lg:py-12 border-y border-gray-50">
                  <div className="space-y-2 lg:space-y-3">
                     <p className="text-subheading !text-[8px] lg:!text-[9px] text-gray-300 uppercase tracking-widest">Composition</p>
                     <p className="text-ui !tracking-widest text-charcoal">{product.material || 'Lustrax Signature Standard'}</p>
                  </div>
                  <div className="space-y-2 lg:space-y-3">
                     <p className="text-subheading !text-[8px] lg:!text-[9px] text-gray-300 uppercase tracking-widest">Calculated Mass</p>
                     <p className="text-ui !tracking-widest text-charcoal">{product.weight || 'Refined Variance'}</p>
                  </div>
                  <div className="space-y-2 lg:space-y-3 col-span-2 lg:col-span-1">
                     <p className="text-subheading !text-[8px] lg:!text-[9px] text-gray-300 uppercase tracking-widest">Availability</p>
                     <p className={`text-ui !tracking-widest font-bold ${
                       product.stock_quantity > 3 ? 'text-charcoal' : 
                       product.stock_quantity > 0 ? 'text-orange-500 animate-pulse' : 
                       'text-red-500'
                     }`}>
                       {product.stock_quantity > 3 ? `${product.stock_quantity} Units Available` : 
                        product.stock_quantity > 0 ? `Only ${product.stock_quantity} Remaining` : 
                        'Depleted Vault'}
                     </p>
                  </div>
               </div>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
