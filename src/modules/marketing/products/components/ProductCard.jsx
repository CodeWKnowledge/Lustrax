import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag02Icon, FavouriteIcon, ArrowRight01Icon } from 'hugeicons-react'
import { getOptimizedImage } from '@/utils/imageOptimizer'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

const ProductCard = ({ product }) => {
  if (!product) {
    return (
      <div className="group opacity-30 grayscale pointer-events-none">
        <div className="relative aspect-[3/4] bg-stone mb-3 flex items-center justify-center border border-neutral-border">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Unavailable</span>
        </div>
      </div>
    )
  }

  const { user, openAuthModal } = useAuth()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  
  const [imgLoaded, setImgLoaded] = useState(false)
  const imgRef = useRef(null)
  
  useEffect(() => {
    if (imgRef.current?.complete) {
      setImgLoaded(true)
    }
  }, [])

  const handleAction = (e, callback) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) openAuthModal()
    else callback()
  }

  const isOutOfStock = product.stock_quantity === 0
  const isLimited = product.stock_quantity > 0 && product.stock_quantity <= 3

  return (
    <motion.div 
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col h-full bg-white border border-neutral-border hover:border-charcoal/40 transition-luxury hover:shadow-premium rounded-[4px] overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="flex flex-col flex-grow">
        
        {/* Editorial Frame Image Container */}
        <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-stone border-b border-neutral-border/70">
          
          {/* Subtle loading placeholder */}
          <div className="absolute inset-0 bg-[#F2F2EE] animate-pulse" />
          
          <img 
            ref={imgRef}
            src={getOptimizedImage(product.image_url, 600)} 
            alt={`Lustrax — ${product.name}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out relative z-10 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Luxury Scrim on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-luxury z-15 pointer-events-none" />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-obsidian/65 backdrop-blur-[2px] flex items-center justify-center z-25 pointer-events-none">
              <span className="border border-white/60 text-white px-2.5 py-1 text-[8px] font-bold tracking-[0.25em] uppercase bg-black/40 rounded-[2px]">
                Out of Stock
              </span>
            </div>
          )}

          {/* Top Right Floating Action: Wishlist */}
          <button 
            aria-label={`Save ${product.name} to Wishlist`}
            onClick={(e) => handleAction(e, () => toggleWishlist(product))}
            className={`absolute top-2 right-2 z-30 w-7 h-7 flex items-center justify-center bg-white/95 backdrop-blur-sm border border-neutral-border hover:border-gold transition-luxury shadow-premium-sm rounded-[3px] ${
              isInWishlist(product.id) ? 'text-gold' : 'text-charcoal/70 hover:text-gold'
            }`}
          >
            <FavouriteIcon size={13} className={isInWishlist(product.id) ? 'fill-gold' : ''} />
          </button>

          {/* Bottom Reveal Bar: Direct View Prompt */}
          <div className="absolute inset-x-0 bottom-0 py-1.5 px-2.5 translate-y-full group-hover:translate-y-0 transition-luxury bg-obsidian text-white flex items-center justify-between z-20 text-[8px] uppercase font-bold tracking-[0.2em]">
            <span className="text-gold-light">Quick View</span>
            <ArrowRight01Icon size={11} className="text-gold" />
          </div>

        </div>

        {/* Minimalist Information Floor — Champagne Gold Accent with Refined Typography */}
        <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-grow space-y-2 bg-gradient-to-b from-[#FAF7EE] via-[#F6F1DF] to-[#EFE7CC] border-t border-[#E3D8B8] transition-luxury group-hover:from-[#F7F2E2] group-hover:to-[#E8DCB8]">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-[13px] font-bold text-[#1F1C14] group-hover:text-charcoal transition-luxury tracking-tight line-clamp-1">
              {product.name}
            </h3>
            
            {product.material && (
              <p className="text-[8px] sm:text-[8.5px] uppercase tracking-widest text-[#8A7950] font-medium truncate">
                {product.material}
              </p>
            )}
          </div>

          <div className="pt-1.5 border-t border-[#DFD3AF]/80 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[7px] uppercase tracking-widest text-[#8A7950] font-bold">Price</span>
              <p className="text-price text-xs sm:text-sm text-charcoal font-bold tracking-tight">
                ₦{parseFloat(product.price || 0).toLocaleString()}
              </p>
            </div>

            {/* Quick Add Action Button */}
            <button
              aria-label={isOutOfStock ? 'Sold Out' : `Add ${product.name} to cart`}
              onClick={(e) => handleAction(e, () => addToCart(product, 1))}
              disabled={isOutOfStock}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[8px] sm:text-[8.5px] uppercase font-bold tracking-wider transition-luxury rounded-[2px] shadow-sm ${
                isOutOfStock
                  ? 'bg-black/5 border border-black/10 text-gray-400 opacity-50 cursor-not-allowed'
                  : 'bg-obsidian text-gold hover:bg-black hover:text-white border border-obsidian active:scale-95'
              }`}
            >
              <ShoppingBag02Icon size={11} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>

      </Link>
    </motion.div>
  )
}

export default ProductCard
