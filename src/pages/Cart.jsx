import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ShoppingBag02Icon, Delete02Icon, ArrowRight01Icon } from 'hugeicons-react'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'

const SHIPPING_POLICY = 'Complimentary'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()
  const { user, openAuthModal } = useAuth()
  const navigate = useNavigate()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12 max-w-lg"
        >
          <div className="flex justify-center">
             <div className="w-24 h-24 bg-soft-bg rounded-full flex items-center justify-center border-subtle">
                <ShoppingBag02Icon size={32} className="text-charcoal/20" />
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-h2 text-charcoal">Your Bag is Empty</h1>
            <p className="text-subheading text-gray-400 italic">
              Your cart is empty. Browse our collection to find something you love.
            </p>
          </div>
          <Link to="/products">
            <Button variant="primary" size="lg">Explore Creations</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pt-24 lg:pt-48 pb-20 lg:pb-32 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 lg:mb-24 border-b border-gray-50 pb-8 lg:pb-12">
           <div className="space-y-3 lg:space-y-4">
              <span className="text-subheading text-gold">Your Selection</span>
              <h1 className="text-h2 lg:text-7xl text-charcoal uppercase">Shopping Bag</h1>
           </div>
           <p className="text-ui text-gray-400 mt-4 md:mt-0">({cartItems.length} Products)</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-32">
          {/* Order List */}
          <div className="lg:col-span-2 space-y-12 lg:space-y-16">
            {cartItems.map((item, i) => (
              <motion.div 
                 key={item.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="flex flex-col sm:flex-row gap-8 lg:gap-12 pb-12 lg:pb-16 border-b border-gray-50 group last:border-0"
              >
                <Link to={`/product/${item.id}`} className="w-full sm:w-40 lg:w-48 aspect-[4/5] overflow-hidden rounded-luxury bg-soft-bg border-subtle flex-shrink-0">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-luxury duration-1000" 
                  />
                </Link>

                <div className="flex-grow flex flex-col justify-between py-1 lg:py-2">
                  <div className="space-y-6 lg:space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 lg:space-y-2">
                         <h3 className="text-base lg:text-lg font-playfair font-bold text-charcoal">{item.name}</h3>
                         <p className="text-subheading !tracking-widest !text-[8px] text-gray-400 italic">Lustrax Collection</p>
                          {/* C-3: Show remaining stock inline */}
                          {item.stock_quantity != null && (
                            <p className={`text-[8px] font-bold uppercase tracking-widest ${
                              item.stock_quantity > 3 ? 'text-gray-300' : item.stock_quantity > 0 ? 'text-orange-400' : 'text-red-400'
                            }`}>
                              {item.stock_quantity > 0 ? `${item.stock_quantity} units available` : 'Out of stock'}
                            </p>
                          )}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-luxury p-2"
                      >
                        <Delete02Icon size={18} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-6 lg:space-x-8">
                       <div className="flex items-center bg-soft-bg rounded-luxury border-subtle h-11 lg:h-12">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="w-11 lg:w-12 h-full hover:bg-white transition-luxury text-sm"
                          >—</button>
                          <span className="w-10 lg:w-12 text-center font-bold text-[10px] lg:text-[11px] tracking-widest">{item.quantity}</span>
                           {/* C-3: Cap increment at stock_quantity */}
                           <button 
                             onClick={() => updateQuantity(item.id, item.quantity + 1)}
                             disabled={item.stock_quantity != null && item.quantity >= item.stock_quantity}
                             className="w-11 lg:w-12 h-full hover:bg-white transition-luxury text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                           >+</button>
                       </div>
                       <p className="text-price text-charcoal">
                          ₦{(item.price * item.quantity).toLocaleString()}
                       </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Investment Summary */}
          <div className="lg:sticky lg:top-40 h-fit space-y-8 lg:space-y-12">
             <div className="bg-soft-bg rounded-luxury p-8 lg:p-12 space-y-8 lg:space-y-10 border-subtle">
                <h2 className="text-subheading text-gray-400 border-b border-gray-100 pb-6 lg:pb-8">
                   Order Summary
                </h2>
                
                <div className="space-y-4 lg:space-y-6">
                   <div className="flex justify-between text-ui text-gray-500">
                      <span>Subtotal</span>
                      <span className="text-price !text-sm">₦{cartTotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-ui text-gray-500">
                      <span>Shipping</span>
                      <span className="text-gold font-inter">{SHIPPING_POLICY}</span>
                   </div>
                   <div className="flex justify-between items-end pt-8 lg:pt-10 border-t border-gray-100">
                      <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.4em] text-charcoal">Total</span>
                      <span className="text-2xl lg:text-3xl font-bold tracking-tighter text-charcoal font-serif">
                         ₦{cartTotal.toLocaleString()}
                      </span>
                   </div>
                </div>

                <Button 
                   onClick={() => {
                     if (!user) openAuthModal()
                     else navigate('/checkout')
                   }}
                   variant="primary" 
                   size="lg" 
                   className="w-full group h-14 lg:h-16 text-ui"
                >
                   <span>GO TO CHECKOUT</span>
                   <ArrowRight01Icon size={16} className="ml-4 group-hover:translate-x-1 transition-luxury" />
                </Button>

                <p className="text-ui !text-[8px] text-gray-400 text-center opacity-40">
                   Encrypted Handshake Protocol Active
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
