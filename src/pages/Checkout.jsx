import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useModal } from '../context/ModalContext'
import { supabase } from '../lib/supabase'
import { 
  Payment02Icon, 
  ArrowLeft01Icon, 
  ShieldEnergyIcon, 
  ShoppingBag02Icon, 
  InformationCircleIcon,
  TruckDeliveryIcon,
  CheckmarkCircle01Icon
} from 'hugeicons-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../components/ui/Button'
import PaymentSuccessModal from '../components/ui/PaymentSuccessModal'
import { formatCurrency } from '../utils/formatters'
import { toast } from 'react-hot-toast'

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const { showAlert } = useModal()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    address: '',
    city: '',
    phone: profile?.phone || ''
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const navigate = useNavigate()

  const validateCartIntegrity = async () => {
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .in('id', cartItems.map(item => item.id))

    if (error) throw error

    for (const item of cartItems) {
      const dbProduct = dbProducts.find(p => p.id === item.id)
      if (!dbProduct) return { valid: false, error: `Item ${item.name} is no longer available.` }
      if (parseFloat(dbProduct.price) !== parseFloat(item.price)) return { valid: false, error: 'Inventory values have changed. Please refresh your bag.' }
      if (dbProduct.stock_quantity < item.quantity) return { valid: false, error: `Only ${dbProduct.stock_quantity} units of ${item.name} remain.` }
    }

    return { valid: true }
  }

  const handlePaystack = async (e) => {
    e.preventDefault()
    // 1. Validation
    if (!formData.name.trim() || formData.name.trim().split(' ').length < 2) {
       toast.error('Please provide your full legal name (First & Last).')
       return
    }
    
    if (!formData.address.trim() || formData.address.length < 10) {
       toast.error('Please provide a complete shipping address.')
       return
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
       toast.error('Please provide a valid phone number.')
       return
    }


    setLoading(true)
    
    try {
      const validation = await validateCartIntegrity()
      if (!validation.valid) {
        toast.error(validation.error)
        navigate('/cart')
        return
      }

      const reference = `LST-${Math.floor(Math.random() * 1000000000)}`

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email, 
        amount: Math.round(cartTotal * 100),
        ref: reference,
        callback: function(response) {
          // Move async logic to a separate call to avoid 'async function' validation issues
          verifyPaymentOnServer(response);
        },
        onSuccess: function(response) {
          verifyPaymentOnServer(response);
        },
        onClose: () => {
          setLoading(false)
        }
      })

      async function verifyPaymentOnServer(response) {
        setLoading(true)
        try {
          const verificationResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` 
            },
            body: JSON.stringify({ 
              reference: response.reference,
              userId: user.id,
              cartItems: cartItems,
              shippingDetails: formData,
              totalAmount: cartTotal
            })
          })

          const result = await verificationResponse.json()
          console.log('LUSTRAX DEBUG: Verification Response:', result)
          
          if (result.success) { 
            setPaymentData({
              order: { ...result.order, items: cartItems },
              transaction: {
                payment_reference: response.reference,
                created_at: new Date().toISOString()
              },
              user: user,
              customerName: formData.name,
              phone: formData.phone
            })
            setShowSuccess(true)
            clearCart()
          } else {
            console.error('LUSTRAX DEBUG: Verification Logic Error:', result.error)
            const isStockError = result.error && result.error.includes('Insufficient stock');
            showAlert(isStockError ? 'Acquisition Halted' : 'Verification Failed', 
              isStockError 
                ? 'We apologize, but a selected piece was secured by another client just moments ago. Your payment has been voided.' 
                : result.error || 'Payment could not be verified.'
            )
          }
        } catch (err) {
          showAlert('System Error', 'An error occurred during verification. Please contact support with your reference: ' + response.reference)
        } finally {
          setLoading(false)
        }
      }
      handler.openIframe()
    } catch (err) { 
      setLoading(false)
      toast.error(`Acquisition protocol error: ${err.message}`)
    }
  }

  if (cartItems.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-8">
        <div className="w-20 h-20 bg-soft-bg rounded-full flex items-center justify-center text-gray-200">
           <ShoppingBag02Icon size={32} />
        </div>
        <p className="text-subheading text-gray-300 italic">Your acquisition manifest is empty</p>
        <Link to="/">
          <Button variant="outline" className="px-12">Return to Boutique</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pt-24 lg:pt-40 pb-20 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 lg:mb-24 border-b border-gray-50 pb-12">
           <div className="space-y-4">
              <button 
                onClick={() => navigate('/cart')}
                className="group flex items-center text-ui text-gray-300 hover:text-gold transition-luxury mb-4"
              >
                <ArrowLeft01Icon size={12} className="mr-2 group-hover:-translate-x-1 transition-luxury" /> 
                Revise Selection
              </button>
              <h1 className="text-h2 text-charcoal">Unified Checkout</h1>
           </div>
           <div className="hidden lg:flex items-center space-x-12">
              <div className="flex items-center space-x-4">
                 <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold"><TruckDeliveryIcon size={16} /></div>
                 <span className="text-ui text-charcoal/40">Secure Delivery</span>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center text-gold"><ShieldEnergyIcon size={16} /></div>
                 <span className="text-ui text-charcoal/40">Encrypted Protocol</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Main Checkout Flow */}
          <div className="lg:col-span-7 space-y-20 lg:space-y-32">
            {/* Delivery Section */}
            <section className="space-y-12">
               <div className="flex items-center space-x-6">
                  <span className="text-xl font-playfair italic text-gold">01</span>
                  <h2 className="text-h2 !text-xl lg:!text-2xl text-charcoal !tracking-tight border-b border-gold/20 pb-2 flex-grow uppercase">Delivery Coordinates</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-3">
                    <label className="text-ui text-gray-400">Recipient Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm placeholder:text-gray-100 font-inter"
                      placeholder="THE HONORABLE..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-ui text-gray-400">Contact Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm placeholder:text-gray-100 font-inter"
                      placeholder="+234..."
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-ui text-gray-400">Residency Address</label>
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm font-inter"
                      placeholder="AVENUE / ESTATE / HOUSE NO."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-ui text-gray-400">City / State</label>
                    <input 
                      type="text" 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm font-inter"
                      placeholder="LAGOS, NIGERIA"
                    />
                  </div>
               </div>
            </section>

            {/* Selection Review Section */}
            <section className="space-y-12">
               <div className="flex items-center space-x-6">
                  <span className="text-xl font-playfair italic text-gold">02</span>
                  <h2 className="text-h2 !text-xl lg:!text-2xl text-charcoal !tracking-tight border-b border-gold/20 pb-2 flex-grow uppercase">Selection Review</h2>
               </div>
               
               <div className="space-y-8 bg-soft-bg/30 p-8 lg:p-12 rounded-luxury border border-gray-50">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start group">
                       <div className="space-y-1">
                          <p className="text-sm font-playfair font-bold text-charcoal">{item.name}</p>
                          <p className="text-ui text-gray-300 opacity-80">QTY: {item.quantity}</p>
                       </div>
                       <span className="text-price text-charcoal/60">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  
                  <div className="pt-8 border-t border-gray-100 space-y-4">
                     <div className="flex justify-between items-center text-ui text-gray-400">
                        <span>Manifest Subtotal</span>
                        <span className="text-price !text-sm">{formatCurrency(cartTotal)}</span>
                     </div>
                     <div className="flex justify-between items-center text-ui text-gray-400">
                        <span>Exclusive Delivery</span>
                        <span className="text-green-600 font-inter">Complimentary</span>
                     </div>
                  </div>
               </div>
            </section>
          </div>

          {/* Acquisition Authorization (Sticky) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-40 mt-12 lg:mt-0">
            <div className="bg-charcoal rounded-luxury p-12 lg:p-16 space-y-12 relative overflow-hidden shadow-premium">
               <div className="absolute top-0 right-0 w-full h-full bg-gold/5 blur-[120px] pointer-events-none"></div>
               
               <div className="space-y-6 relative z-10">
                  <div className="space-y-2">
                     <span className="text-subheading text-gold">Final Valuations</span>
                     <p className="text-5xl lg:text-7xl font-bold tracking-tighter text-white font-playfair">{formatCurrency(cartTotal)}</p>
                  </div>
                  <p className="text-body text-gray-500 !text-[11px] leading-relaxed">
                     By proceeding, you authorize the secure collection of funds for your selected luxury pieces.
                  </p>
               </div>
               
               <div className="space-y-6 relative z-10">
                  <Button 
                    onClick={handlePaystack} 
                    disabled={loading}
                    variant="gold"
                    size="lg"
                    className="w-full h-20 text-md active:scale-95 shadow-lg shadow-gold/10 group overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span 
                          key="loading"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center space-x-4"
                        >
                           <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                           <span>VALIDATING...</span>
                        </motion.span>
                      ) : (
                        <motion.span 
                          key="idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center space-x-3"
                        >
                           <CheckmarkCircle01Icon size={20} className="group-hover:scale-110 transition-luxury" />
                           <span className="text-ui">AUTHORIZE ACQUISITION</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                  
                  <div className="pt-10 flex flex-col items-center space-y-6 border-t border-white/5 opacity-40">
                     <div className="flex items-center space-x-3 text-ui !text-[8px] text-white">
                        <ShieldEnergyIcon size={12} className="text-gold" />
                        <span>Encrypted Protocol IX</span>
                     </div>
                     <div className="flex space-x-6 items-center grayscale opacity-80">
                        <div className="h-4 w-12 bg-white/20 rounded-sm"></div>
                        <div className="h-4 w-12 bg-white/20 rounded-sm"></div>
                        <div className="h-4 w-12 bg-white/20 rounded-sm"></div>
                     </div>
                  </div>
               </div>
            </div>
          </aside>
        </div>
      </div>
      
      <PaymentSuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        data={paymentData} 
      />
    </div>
  )
}

export default Checkout
