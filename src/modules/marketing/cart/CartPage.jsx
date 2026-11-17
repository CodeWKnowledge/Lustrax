import { formatCurrency } from '@/utils/formatters'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { ShoppingBag02Icon, Delete02Icon, ArrowRight01Icon, ShieldEnergyIcon } from 'hugeicons-react'
import Button from '@/components/ui/Button'

const SHIPPING_POLICY = 'Complimentary'

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart()
  const { user, openAuthModal } = useAuth()
  const navigate = useNavigate()

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 max-w-md"
        >
          <div className="flex justify-center">
             <div className="w-20 h-20 bg-stone flex items-center justify-center border border-neutral-border">
                <ShoppingBag02Icon size={28} className="text-gray-400" />
             </div>
          </div>
          <div className="space-y-3">
            <span className="text-subheading text-gold block">Your Cart</span>
            <h1 className="text-3xl font-display font-extrabold text-charcoal">Your Bag is Empty</h1>
            <p className="text-body text-gray-500 text-sm leading-relaxed">
              Looks like you haven't added anything to your cart yet. Check out our latest jewelry and find something you love.
            </p>
          </div>
          <Link to="/" className="inline-block pt-2">
            <Button 
              variant="primary" 
              size="lg"
              className="!bg-obsidian !text-gold hover:!bg-black text-[10px] uppercase font-bold tracking-[0.25em] px-8 py-4"
            >
              Start Shopping
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pt-28 lg:pt-36 pb-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 lg:mb-16 border-b border-neutral-border pb-6 lg:pb-8">
           <div className="space-y-2">
              <span className="text-subheading text-gold block">Review Items</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-charcoal">
                Shopping Bag
              </h1>
           </div>
           <p className="text-ui text-gray-400 mt-3 md:mt-0 tracking-[0.2em]">
             {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in Bag
           </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Order List */}
          <div className="lg:col-span-8 space-y-8">
              {cartItems.map((item, i) => {
                const itemKey = item.variant_id ? `${item.id}-${item.variant_id}` : item.id
                return (
                  <motion.div 
                    key={itemKey}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col sm:flex-row gap-6 lg:gap-8 pb-8 border-b border-neutral-border group last:border-0"
                  >
                <Link to={`/product/${item.id}`} className="w-full sm:w-36 lg:w-40 aspect-[4/5] overflow-hidden bg-stone border border-neutral-border flex-shrink-0">
                  <img 
                    src={item.image_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-luxury duration-700" 
                  />
                </Link>

                <div className="flex-grow flex flex-col justify-between py-1">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-base lg:text-lg font-bold text-charcoal group-hover:text-gold transition-luxury">
                          {item.name}
                        </h3>
                        <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400">
                          {item.category || 'Fine Jewelry'}
                        </p>
                        
                        {/* Selected Variant Attributes */}
                        {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1.5">
                            {Object.entries(item.selected_attributes).map(([key, val]) => (
                              <span key={key} className="text-[8px] uppercase font-bold tracking-widest text-charcoal bg-stone px-2.5 py-1 border border-neutral-border">
                                {key}: {val}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.stock_quantity != null && (
                          <p className={`text-[8px] font-bold uppercase tracking-widest pt-1 ${
                            item.stock_quantity > 3 ? 'text-gray-400' : item.stock_quantity > 0 ? 'text-amber-600' : 'text-red-500'
                          }`}>
                            {item.stock_quantity > 0 ? `${item.stock_quantity} left in stock` : 'Out of stock'}
                          </p>
                        )}
                      </div>
                      <button 
                        aria-label={`Remove ${item.name} from bag`}
                        onClick={() => removeFromCart(itemKey)}
                        className="text-gray-400 hover:text-red-500 transition-luxury p-1.5"
                      >
                        <Delete02Icon size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start sm:space-x-8 pt-2">
                       <div className="flex items-center bg-stone border border-neutral-border h-10">
                          <button 
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)} 
                            className="w-10 h-full hover:text-gold transition-luxury font-bold text-sm"
                          >—</button>
                          <span className="w-10 text-center font-bold text-xs tracking-widest">{item.quantity}</span>
                          <button 
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            disabled={item.stock_quantity != null && item.quantity >= item.stock_quantity}
                            className="w-10 h-full hover:text-gold transition-luxury font-bold text-sm disabled:opacity-20 disabled:cursor-not-allowed"
                          >+</button>
                       </div>
                       <p className="text-price text-base font-bold text-charcoal">
                          ₦{(item.price * item.quantity).toLocaleString()}
                       </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>

          {/* Investment Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
             <div className="bg-stone p-8 space-y-8 border border-neutral-border">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-charcoal border-b border-neutral-border pb-4">
                   Order Summary
                </h2>
                
                <div className="space-y-4">
                   <div className="flex justify-between text-xs text-gray-500">
                      <span className="uppercase tracking-wider">Subtotal</span>
                      <span className="font-bold text-charcoal">₦{cartTotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between text-xs text-gray-500">
                      <span className="uppercase tracking-wider">Shipping</span>
                      <span className="text-gold font-bold uppercase tracking-wider">{SHIPPING_POLICY === 'Complimentary' ? 'Free Delivery' : SHIPPING_POLICY}</span>
                   </div>
                   <div className="flex justify-between items-baseline pt-6 border-t border-neutral-border">
                      <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-charcoal">Total</span>
                      <span className="text-2xl font-bold tracking-tight text-charcoal font-price">
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
                   className="w-full !bg-obsidian !text-gold hover:!bg-black h-13 text-[10px] uppercase font-bold tracking-[0.25em] transition-luxury"
                >
                   <span>PROCEED TO CHECKOUT</span>
                   <ArrowRight01Icon size={16} className="ml-3" />
                </Button>

                <div className="flex items-center justify-center space-x-2 text-[9px] uppercase tracking-widest text-gray-400">
                   <ShieldEnergyIcon size={14} className="text-gold" />
                   <span>Safe & Secure Paystack Checkout</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
