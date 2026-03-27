import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWishlist } from '../../context/WishlistContext'
import { supabase } from '../../lib/supabase'
import { 
  FavouriteIcon, 
  ShoppingBag02Icon,
  Delete02Icon
} from 'hugeicons-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../../components/ui/ProductCard'
import Button from '../../components/ui/Button'

const Wishlist = () => {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-50 pb-8">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Your Wishlist</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">The products you've saved for later</p>
        </div>
        <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">
          {wishlistItems.length} ITEMS SAVED
        </span>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence>
            {wishlistItems.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <ProductCard product={item.products} />
                
                {/* Remove Overlay Button */}
                <button 
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 left-4 p-3 bg-white/80 backdrop-blur-md shadow-premium rounded-full text-red-400 hover:text-red-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10"
                  title="Remove"
                >
                  <Delete02Icon size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center bg-gray-50/50 rounded-luxury border border-dashed border-gray-100">
          <div className="flex justify-center mb-8">
             <div className="w-20 h-20 bg-white shadow-premium rounded-full flex items-center justify-center text-gray-200">
                <FavouriteIcon size={32} />
             </div>
          </div>
          <h3 className="text-lg font-serif text-charcoal uppercase tracking-widest mb-4">Your wishlist is empty</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-12">
            Save your favorite products here to find them later.
          </p>
          <Link to="/products">
            <Button variant="outline" className="text-[10px] h-12 px-10">Explore Collection</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default Wishlist
