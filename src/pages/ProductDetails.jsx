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
import { getOptimizedImage } from '../utils/imageOptimizer'
import { findMatchingVariant, getEffectivePrice, getVariantOptions } from '../utils/variantHelpers'

const ProductDetails = () => {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-start">
          {/* Visual Presentation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-luxury bg-soft-bg relative border-subtle group">
               <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
               <img 
                 key={activeImage}
                 src={getOptimizedImage(activeImage, 1200)} 
                 alt={`Lustrax Jewelries: ${product.name} Detailed View`}
                 fetchPriority="high"
                 onLoad={() => setMainImgLoaded(true)}
                 className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110 relative z-10 ${mainImgLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}`} 
               />
               <div className="absolute inset-0 bg-black/5 pointer-events-none z-20"></div>
            </div>

            {/* Gallery Thumbnails */}
            {product.additional_images?.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                 <div 
                   onClick={() => setSelectedImage(product.image_url)}
                   className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 relative ${activeImage === product.image_url ? 'border-gold shadow-md' : 'border-transparent hover:border-gold/50'}`}
                   aria-label="View primary angle"
                 >
                    <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
                    <img onLoad={({ target }) => { target.classList.remove('opacity-0'); target.classList.add('opacity-100') }} src={getOptimizedImage(product.image_url, 400)} className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300" alt="Primary view" />
                 </div>
                 {product.additional_images.map((img, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => setSelectedImage(img)}
                     className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 relative ${activeImage === img ? 'border-gold shadow-md' : 'border-transparent hover:border-gold/50'}`} aria-label={`View detail angle ${idx + 1}`}
                   >
                      <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
                      <img onLoad={({ target }) => { target.classList.remove('opacity-0'); target.classList.add('opacity-100') }} src={getOptimizedImage(img, 400)} className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-300" alt={`Detail angle ${idx + 1}`} />
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
               
               
               <p className={`text-price !text-2xl lg:!text-3xl ${((variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity) === 0) ? 'text-gray-400 line-through' : 'text-charcoal'}`}>
                  ₦{getEffectivePrice(product, selectedVariant).toLocaleString()}
               </p>
            </div>

            {/* Variant Selection UI */}
            {variants.length > 0 && (
              <div className="space-y-12">
                {Array.from(new Set(variants.flatMap(v => Object.keys(v.attributes)))).map(attrName => {
                  const availableValues = Array.from(new Set(variants.map(v => v.attributes[attrName])))
                  return (
                    <div key={attrName} className="space-y-4">
                      <p className="text-subheading text-charcoal/40 uppercase tracking-[0.2em] font-bold text-[10px]">{attrName}</p>
                      <div className="flex flex-wrap gap-3">
                        {availableValues.map(val => (
                          <button
                            key={val}
                            onClick={() => {
                              const newSelected = { ...selectedAttributes, [attrName]: val }
                              setSelectedAttributes(newSelected)
                              setSelectedVariant(findMatchingVariant(variants, newSelected))
                            }}
                            className={`px-6 py-3 border rounded-full text-[10px] font-bold uppercase tracking-widest transition-luxury ${selectedAttributes[attrName] === val ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-400 border-gray-100 hover:border-gold hover:text-gold'}`}
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
                         onClick={() => setQuantity(Math.min((variants.length > 0 ? selectedVariant?.stock_quantity : product?.stock_quantity) ?? 0, quantity + 1))}
                         className="w-14 lg:w-16 h-full hover:bg-white transition-luxury text-sm"
                       >+</button>
                    </div>
                    {(variants.length > 0 ? selectedVariant?.stock_quantity : product?.stock_quantity) > 0 && (variants.length > 0 ? selectedVariant?.stock_quantity : product?.stock_quantity) <= 3 && (
                      <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest animate-pulse mt-1 block">
                        Only {(variants.length > 0 ? selectedVariant?.stock_quantity : product?.stock_quantity)} remaining
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
                     className="flex-grow group h-14 lg:h-16 text-ui"
                  >
                     <span>
                       {variants.length > 0 && !selectedVariant 
                        ? 'SELECT OPTIONS' 
                        : (variants.length > 0 ? selectedVariant?.stock_quantity === 0 : product.stock_quantity === 0) 
                         ? 'OUT OF STOCK' 
                         : 'ADD TO CART'}
                     </span>
                     {((variants.length > 0 && selectedVariant && selectedVariant.stock_quantity > 0) || (variants.length === 0 && product.stock_quantity > 0)) && <ShoppingBag02Icon size={18} className="ml-4 group-hover:scale-110 transition-luxury" />}
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
                       (variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity) > 3 ? 'text-charcoal' : 
                       (variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity) > 0 ? 'text-orange-500 animate-pulse' : 
                       'text-red-500'
                     }`}>
                       {(variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity) > 3 ? `${(variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity)} Units Available` : 
                        (variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity) > 0 ? `Only ${(variants.length > 0 ? selectedVariant?.stock_quantity : product.stock_quantity)} Remaining` : 
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
