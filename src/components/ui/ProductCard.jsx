import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag02Icon, FavouriteIcon } from 'hugeicons-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

const ProductCard = ({ product }) => {
  if (!product) {
    return (
      <div className="group opacity-40 grayscale pointer-events-none">
        <div className="relative aspect-[4/5] overflow-hidden bg-soft-bg rounded-luxury mb-4 border border-gray-100 flex items-center justify-center">
           <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 italic">Piece Removed</span>
        </div>
        <div className="space-y-1.5 px-1">
           <h3 className="text-sm font-playfair font-bold text-gray-300 tracking-tight">Product Unavailable</h3>
           <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">N/A</p>
        </div>
      </div>
    )
  }

  const { user, openAuthModal } = useAuth()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const handleAction = (e, callback) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) openAuthModal()
    else callback()
  }

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x500?text=LUSTRAX';
    if (typeof url !== 'string' || url.startsWith('{') || url.startsWith('[')) {
      console.warn('Potential malformed image URL detected:', url);
      return 'https://via.placeholder.com/400x500?text=LUSTRAX';
    }
    return url;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-soft-bg rounded-luxury mb-4 transition-luxury border border-transparent group-hover:border-black/5">
          <img 
            src={getImageUrl(product.image_url)} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-luxury duration-1000 group-hover:scale-105"
          />
          
          {/* Quick Actions (Accessible) */}
          <div className="absolute top-4 right-4 translate-x-10 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-luxury flex flex-col space-y-3">
             <button 
               aria-label={`Add ${product.name} to Wishlist`}
               onClick={(e) => handleAction(e, () => toggleWishlist(product))}
               className={`p-3 bg-white shadow-premium rounded-full transition-luxury group/fav ${isInWishlist(product.id) ? 'text-gold' : 'text-charcoal hover:text-gold'}`}
             >
               <FavouriteIcon size={18} className={`group-hover/fav:scale-110 ${isInWishlist(product.id) ? 'fill-gold' : ''}`} />
             </button>
             <button 
                aria-label={product.stock_quantity === 0 ? `${product.name} is Sold Out` : `Add ${product.name} to Cart`}
                onClick={(e) => handleAction(e, () => addToCart(product, 1))}
                disabled={product.stock_quantity === 0}
                className={`p-3 bg-white shadow-premium rounded-full transition-luxury group/cart ${
                  product.stock_quantity === 0 ? 'opacity-20 cursor-not-allowed' : 'text-charcoal hover:text-gold'
                }`}
             >
               <ShoppingBag02Icon size={18} className={product.stock_quantity === 0 ? '' : 'group-hover/cart:scale-110'} />
             </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-luxury bg-gradient-to-t from-white/90 to-transparent backdrop-blur-[2px]">
             <span className="text-ui text-charcoal opacity-70">Quick View</span>
          </div>
        </div>

        <div className="space-y-1.5 px-1">
          <div className="flex justify-between items-start">
            <h3 className="text-sm md:text-base font-playfair font-bold text-charcoal group-hover:text-gold transition-luxury tracking-tight truncate mr-2">{product.name}</h3>
            {/* Realtime Stock Indicator */}
            {product.stock_quantity !== undefined && (
              <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 whitespace-nowrap ${
                product.stock_quantity > 3 ? 'text-gray-300' : 
                product.stock_quantity > 0 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Sold Out'}
              </span>
            )}
          </div>
          <p className="text-price text-charcoal/80">
            ₦{parseFloat(product.price || 0).toLocaleString()}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard
