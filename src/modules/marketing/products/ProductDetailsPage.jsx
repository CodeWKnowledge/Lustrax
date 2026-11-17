import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { FavouriteIcon, ArrowLeft01Icon, ShoppingBag02Icon, StarIcon } from 'hugeicons-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { getOptimizedImage } from '@/utils/imageOptimizer'
import { findMatchingVariant, getEffectivePrice, getVariantOptions } from '@/utils/variantHelpers'

const ProductDetailsPage = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [variants, setVariants] = useState([])
  const [selectedAttributes, setSelectedAttributes] = useState({})
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [mainImgLoaded, setMainImgLoaded] = useState(false)
  
  useEffect(() => {
    setMainImgLoaded(false)
  }, [selectedImage, product?.id])
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
      if (!silent) navigate('/')
    } else {
      setProduct(data)
      if (!silent) setSelectedImage(null)
      setQuantity(currentQty => Math.min(currentQty, data.stock_quantity ?? 0))

      // Fetch variants
      const { data: variantData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id)
      
      if (variantData) setVariants(variantData)
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
  
  const activeImage = selectedImage || product.image_url

  return (
    <div className="bg-white min-h-screen pt-24 lg:pt-40 pb-20 lg:pb-32 overflow-hidden">
      <Helmet>
        <title>{selectedVariant ? `${product.name} - ${Object.values(selectedAttributes).join(' / ')}` : product.name} | Luxury Jewelry Nigeria | Lustrax</title>
        <meta name="description" content={selectedVariant ? `Purchase ${product.name} in ${Object.values(selectedAttributes).join(', ')}. Price: ₦${getEffectivePrice(product, selectedVariant).toLocaleString()}. Handcrafted elegance at Lustrax.` : `Experience the brilliance of ${product.name}. A masterpiece of ${product.material}. Handcrafted for timeless elegance at Lustrax Jewelries Nigeria.`} />
        <link rel="canonical" href={`https://lustrax-jewelries.com/product/${product.id}`} />
        
        {/* Structured Data: Product */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": selectedVariant ? `${product.name} (${Object.values(selectedAttributes).join(' / ')})` : product.name,
            "image": product.image_url,
            "description": product.description || "Lustrax Signature Collection Piece",
            "brand": {
              "@type": "Brand",
              "name": "Lustrax Jewelries"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://lustrax-jewelries.com/product/${product.id}`,
              "priceCurrency": "NGN",
              "price": getEffectivePrice(product, selectedVariant),
              "availability": (selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition",
              "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                  "@type": "MonetaryAmount",
                  "value": 2000,
                  "currency": "NGN"
                },
                "shippingDestination": {
                  "@type": "DefinedRegion",
                  "addressCountry": "NG"
                },
                "deliveryTime": {
                  "@type": "ShippingDeliveryTime",
                  "handlingTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 1,
                    "maxValue": 2,
                    "unitCode": "d"
                  },
                  "transitTime": {
                    "@type": "QuantitativeValue",
                    "minValue": 2,
                    "maxValue": 5,
                    "unitCode": "d"
                  }
                }
              },
              "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "NG",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 7,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/ReturnShippingFees"
              }
            }
          })}
        </script>

        {/* Structured Data: Breadcrumb */}
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
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": `https://lustrax-jewelries.com/product/${product.id}`
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center text-ui mb-10 lg:mb-20 hover:text-gold transition-luxury"
          aria-label="Return to previous collection page"
        >
          <ArrowLeft01Icon size={14} className="mr-3 group-hover:-translate-x-1 transition-luxury" /> 
          Back to Selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Visual Presentation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="aspect-[4/5] overflow-hidden bg-stone relative border border-neutral-border group">
               <div className="absolute inset-0 bg-[#F2F2EE] animate-pulse"></div>
               <img 
                 key={activeImage}
                 src={getOptimizedImage(activeImage, 1400)} 
                 alt={`Lustrax Jewelries: ${product.name} Detailed View`}
                 fetchPriority="high"
                 onLoad={() => setMainImgLoaded(true)}
                 className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 relative z-10 ${mainImgLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}`} 
               />
               <div className="absolute top-4 left-4 z-20">
                 <span className="text-[9px] uppercase font-bold tracking-[0.3em] bg-obsidian text-gold px-3 py-1.5 border border-gold/20">
                   {product.category || 'Fine Jewelry'}
                 </span>
               </div>
            </div>

            {/* Gallery Thumbnails */}
            {product.additional_images?.length > 0 && (
              <div className="grid grid-cols-5 gap-3">
                 <div 
                   onClick={() => setSelectedImage(product.image_url)}
                   className={`aspect-square overflow-hidden border cursor-pointer transition-luxury relative bg-stone ${
                     activeImage === product.image_url ? 'border-charcoal shadow-sm' : 'border-neutral-border opacity-70 hover:opacity-100'
                   }`}
                   aria-label="View primary angle"
                 >
                    <img 
                      src={getOptimizedImage(product.image_url, 400)} 
                      className="w-full h-full object-cover" 
                      alt="Primary view" 
                    />
                 </div>
                 {product.additional_images.map((img, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => setSelectedImage(img)}
                     className={`aspect-square overflow-hidden border cursor-pointer transition-luxury relative bg-stone ${
                       activeImage === img ? 'border-charcoal shadow-sm' : 'border-neutral-border opacity-70 hover:opacity-100'
                     }`} 
                     aria-label={`View detail angle ${idx + 1}`}
                   >
                      <img 
                        src={getOptimizedImage(img, 400)} 
                        className="w-full h-full object-cover" 
                        alt={`Detail angle ${idx + 1}`} 
                      />
                   </div>
                 ))}
              </div>
            )}
          </motion.div>


          {/* Intellectual Property & Acquisition */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 space-y-8 lg:space-y-10"
          >
            <div className="space-y-4 pb-6 border-b border-neutral-border">
               <div className="flex items-center space-x-2 text-gold">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} size={11} className="fill-gold" />)}
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400 pl-2">
                    Premium Quality
                  </span>
               </div>
               
               <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-charcoal tracking-tight leading-[1.05]">
                 {product.name}
               </h1>
               
               <p className={`text-2xl sm:text-3xl font-price font-bold ${
                 ((variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity) === 0) ? 'text-gray-400 line-through' : 'text-charcoal'
               }`}>
                  ₦{getEffectivePrice(product, selectedVariant).toLocaleString()}
               </p>
            </div>

            {/* Variant Selection UI */}
            {variants.length > 0 && (
              <div className="space-y-6 pb-6 border-b border-neutral-border">
                {Array.from(new Set(variants.flatMap(v => Object.keys(v.attributes)))).map(attrName => {
                  const availableValues = Array.from(new Set(variants.map(v => v.attributes[attrName])))
                  return (
                    <div key={attrName} className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-gray-400">{attrName}</p>
                      <div className="flex flex-wrap gap-2.5">
                        {availableValues.map(val => (
                          <button
                            key={val}
                            onClick={() => {
                              const newSelected = { ...selectedAttributes, [attrName]: val }
                              setSelectedAttributes(newSelected)
                              setSelectedVariant(findMatchingVariant(variants, newSelected))
                            }}
                            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-luxury border ${
                              selectedAttributes[attrName] === val 
                                ? 'bg-obsidian text-white border-obsidian' 
                                : 'bg-white text-gray-500 border-neutral-border hover:border-charcoal hover:text-charcoal'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="space-y-6">
               <div className="space-y-3">
                  <span className="text-subheading text-gold block">Product Description</span>
                  <p className="text-body text-gray-600 text-sm sm:text-base leading-relaxed border-l-2 border-gold/40 pl-5">
                     {product.description || 'A timeless representation of elegance, meticulously crafted to mirror contemporary luxury and personal expression.'}
                  </p>
               </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-border">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center border border-neutral-border bg-stone h-13 px-2">
                       <button 
                         onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         className="w-10 h-full hover:text-gold transition-luxury font-bold text-base"
                         aria-label="Decrease quantity"
                       >—</button>
                       <span className="w-12 text-center font-bold text-xs tracking-widest">{quantity}</span>
                       <button 
                         onClick={() => setQuantity(Math.min((variants.length > 0 ? selectedVariant?.stock_quantity : product?.stock_quantity) ?? 0, quantity + 1))}
                         className="w-10 h-full hover:text-gold transition-luxury font-bold text-base"
                         aria-label="Increase quantity"
                       >+</button>
                    </div>
                    {(variants.length > 0 ? selectedVariant?.stock_quantity : product?.stock_quantity) > 0 && (variants.length > 0 ? selectedVariant?.stock_quantity : product?.stock_quantity) <= 3 && (
                      <span className="text-[9px] text-amber-600 font-bold uppercase tracking-widest block">
                        Low stock: only {(variants.length > 0 ? selectedVariant?.stock_quantity : product?.stock_quantity)} left
                      </span>
                    )}
                  </div>
                  
                  <Button 
                     onClick={() => {
                       if (!user) openAuthModal()
                       else {
                         const cartProduct = {
                           ...product,
                           price: selectedVariant?.price_override ?? product.price,
                           variant_id: selectedVariant ? selectedVariant.id : null,
                           selected_attributes: selectedAttributes,
                           stock_quantity: selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity
                         }
                         addToCart(cartProduct, quantity)
                       }
                     }}
                     disabled={(variants.length > 0 && !selectedVariant) || (variants.length > 0 ? selectedVariant?.stock_quantity === 0 : product.stock_quantity === 0)}
                     size="lg" 
                     className="flex-grow !bg-obsidian !text-gold hover:!bg-black h-13 text-[10px] uppercase font-bold tracking-[0.25em] transition-luxury"
                  >
                     <span>
                       {variants.length > 0 && !selectedVariant 
                        ? 'SELECT AN OPTION' 
                        : (variants.length > 0 ? selectedVariant?.stock_quantity === 0 : product.stock_quantity === 0) 
                          ? 'OUT OF STOCK' 
                          : 'ADD TO BAG'}
                     </span>
                     {((variants.length > 0 && selectedVariant && selectedVariant.stock_quantity > 0) || (variants.length === 0 && product.stock_quantity > 0)) && <ShoppingBag02Icon size={16} className="ml-3" />}
                  </Button>

                  <button 
                     onClick={() => {
                       if (!user) openAuthModal()
                       else toggleWishlist(product)
                     }}
                     className={`h-13 w-13 flex-shrink-0 flex items-center justify-center border transition-luxury ${isInWishlist(product.id) ? 'text-gold border-gold bg-gold/5' : 'border-neutral-border text-charcoal hover:border-gold hover:text-gold'}`}
                     aria-label="Toggle wishlist"
                  >
                     <FavouriteIcon size={18} className={isInWishlist(product.id) ? 'fill-gold' : ''} />
                  </button>

                </div>

               <div className="grid grid-cols-3 gap-6 py-8 border-y border-neutral-border">
                  <div className="space-y-1">
                     <p className="text-[8px] text-gray-400 uppercase tracking-[0.25em] font-bold">Material</p>
                     <p className="text-xs font-bold text-charcoal">{product.material || 'Solid Standard'}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] text-gray-400 uppercase tracking-[0.25em] font-bold">Weight</p>
                     <p className="text-xs font-bold text-charcoal">{product.weight || 'Standard'}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[8px] text-gray-400 uppercase tracking-[0.25em] font-bold">Availability</p>
                     <p className={`text-xs font-bold ${
                       (variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity) > 0 ? 'text-charcoal' : 'text-red-500'
                     }`}>
                       {(variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity) > 0 ? 'In Stock' : 'Out of Stock'}
                     </p>
                  </div>
               </div>

                <div className="flex items-center space-x-3 pt-2">
                  <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400">
                    Returns accepted within 3 days. <Link to="/refund-policy" className="text-gold hover:underline">See Return Policy</Link>
                  </p>
                </div>

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsPage
