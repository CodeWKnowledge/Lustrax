import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
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
import locationData from '../data/nigeria-locations.json'
import PolicyModal from '../components/ui/PolicyModal'
import { TermsContent, RefundContent } from '../data/legal-content'

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const { showAlert } = useModal()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    state: '',
    city: '',
    area: '',
    customArea: '',
    street: '',
    landmark: '',
    coordinates: { lat: null, lng: null }
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [policyModal, setPolicyModal] = useState({ isOpen: false, title: '', content: null })
  const navigate = useNavigate()
  const location = useLocation()
  const checkoutItems = cartItems
  const totalToPay = cartTotal

  const stats = {
    states: Object.keys(locationData),
    cities: formData.state ? Object.keys(locationData[formData.state] || {}) : [],
    areas: (formData.state && formData.city) ? locationData[formData.state][formData.city] || [] : []
  }

  const validateCartIntegrity = async () => {

    const productIds = cartItems.map(item => item.id)
    const variantIds = cartItems.filter(item => item.variant_id).map(item => item.variant_id)

    const { data: dbProducts, error: pError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .in('id', productIds)

    if (pError) throw pError

    let dbVariants = []
    if (variantIds.length > 0) {
      const { data: vData, error: vError } = await supabase
        .from('product_variants')
        .select('id, price_override, stock_quantity')
        .in('id', variantIds)
      if (vError) throw vError
      dbVariants = vData || []
    }

    for (const item of cartItems) {
      const dbProduct = dbProducts.find(p => p.id === item.id)
      if (!dbProduct) return { valid: false, error: `Item ${item.name} is no longer available.` }
      
      let price = parseFloat(dbProduct.price)
      let stock = dbProduct.stock_quantity

      if (item.variant_id) {
        const dbVariant = dbVariants.find(v => v.id === item.variant_id)
        if (!dbVariant) return { valid: false, error: `Variant for ${item.name} is no longer available.` }
        const variantPrice = dbVariant.price_override ?? dbProduct.price
        price = parseFloat(variantPrice)
        stock = dbVariant.stock_quantity
      }
      
      const itemPrice = parseFloat(item.price)
      if (Math.abs(price - itemPrice) > 0.01) {
        return { valid: false, error: `Valuation for ${item.name} has changed. Please refresh your bag.` }
      }
      if (item.quantity <= 0) return { valid: false, error: `${item.name} is currently out of stock. Please remove it from your selection.` }
      if (stock < item.quantity) return { valid: false, error: `Only ${stock} units of ${item.name} (selected variation) remain.` }
    }

    return { valid: true }
  }

  const handlePaystack = async (e) => {
    e.preventDefault()
    
    // 1. Basic Identity Validation
    if (!formData.name.trim() || formData.name.trim().split(' ').length < 2) {
       toast.error('Please provide your full legal name (First & Last).')
       return
    }
    
    if (!formData.phone.trim() || formData.phone.length < 10) {
       toast.error('Please provide a valid phone number.')
       return
    }

    // 2. Strict Hierarchical Address Validation
    if (!formData.state) return toast.error('Please select your State')
    if (!formData.city) return toast.error('Please select your City')
    if (!formData.area && !formData.customArea) return toast.error('Please select your delivery area')
    if (!formData.street.trim() || formData.street.length < 5) return toast.error('Please provide a detailed Residency Address')
    if (!formData.landmark.trim()) return toast.error('Please specify a recognizable Landmark')

    if (!agreedToTerms) {
      toast.error('Protocol Error: You must agree to the Terms & Conditions and Refund Policy to proceed.')
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

      // Logistics-grade address construction
      const structuredAddress = {
        name: formData.name,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        area: formData.area === 'Other' ? formData.customArea : formData.area,
        street_address: formData.street,
        landmark: formData.landmark,
        full_address: `${formData.street}, ${formData.area === 'Other' ? formData.customArea : formData.area}, ${formData.city}, ${formData.state}`,
        coordinates: formData.coordinates,
        // Fallbacks for legacy/system compatibility
        address: formData.street,
        city_system: formData.city
      }

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user.email, 
        amount: Math.round(totalToPay * 100),
        ref: reference,
        callback: function(response) {
          verifyPaymentOnServer(response, structuredAddress);
        },
        onSuccess: function(response) {
          verifyPaymentOnServer(response, structuredAddress);
        },
        onClose: () => {
          setLoading(false)
        }
      })

      async function verifyPaymentOnServer(response, addrMeta) {
        setLoading(true)
        try {
          const { error: logError } = await supabase.from('payment_reconciliation').insert({
            reference: response.reference,
            user_id: user.id,
            amount: totalToPay,
            metadata: {
              items: checkoutItems.map(i => ({ id: i.id, variant_id: i.variant_id, qty: i.quantity })),
              shipping_details: addrMeta
            }
          });



          const verificationResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` 
            },
            body: JSON.stringify({ 
              reference: response.reference,
              userId: user.id,
              cartItems: checkoutItems,
              shippingDetails: addrMeta,
              totalAmount: totalToPay,
              legalAgreement: { 
                agreedAt: new Date().toISOString(),
                version: '1.0'
              }
            })
          })

          const result = await verificationResponse.json()
          
          if (result.success) { 
            setPaymentData({
              order: { id: result.orderId, total_amount: totalToPay, items: checkoutItems },
              transaction: { payment_reference: response.reference, created_at: new Date().toISOString() },
              user: user, customerName: formData.name, phone: formData.phone
            })
            setShowSuccess(true)
            clearCart()
          } else {
            const isStockError = result.error && result.error.includes('Insufficient stock');
            showAlert(isStockError ? 'Acquisition Halted' : 'Verification Denied', 
              result.error || 'Protocol mismatch. Ref: ' + response.reference
            )
          }
        } catch (err) {
          showAlert('Connection Issue', 'Network latency detected. Your payment may still be processing — please check your orders before retrying.')
        }
      }
      handler.openIframe()
    } catch (err) { 
      setLoading(false)
      toast.error(`Acquisition protocol error: ${err.message}`)
    }
  }

  if (checkoutItems.length === 0 && !showSuccess) {
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
                    <label className="text-ui text-gray-400" htmlFor="checkout-name">Recipient Name</label>
                    <input 
                      id="checkout-name"
                      type="text"
                      name="name"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm placeholder:text-gray-100 font-inter"
                      placeholder="e.g. John Doe"
                      autoComplete="name"
                      autoCorrect="on"
                      autoCapitalize="words"
                      spellCheck="true"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-ui text-gray-400" htmlFor="checkout-phone">Contact Number</label>
                    <input 
                      id="checkout-phone"
                      type="tel"
                      name="tel"
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm placeholder:text-gray-100 font-inter"
                      placeholder="e.g. 08012345678"
                      autoComplete="tel"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      inputMode="tel"
                    />
                  </div>
                  {/* Hierarchical Selectors */}
                  <div className="space-y-3">
                    <label className="text-ui text-gray-400">State</label>
                    <div className="relative">
                      <select 
                        value={formData.state}
                        onChange={e => setFormData({...formData, state: e.target.value, city: '', area: ''})}
                        className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm font-inter appearance-none cursor-pointer"
                      >
                        <option value="">SELECT STATE</option>
                        {stats.states.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className={`text-ui transition-luxury ${!formData.state ? 'text-gray-100' : 'text-gray-400'}`}>City / Major Town</label>
                    <select 
                      disabled={!formData.state}
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value, area: ''})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm font-inter appearance-none disabled:opacity-30 cursor-pointer"
                    >
                      <option value="">SELECT CITY</option>
                      {stats.cities.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className={`text-ui transition-luxury ${!formData.city ? 'text-gray-100' : 'text-gray-400'}`}>Delivery Area</label>
                    <select 
                      disabled={!formData.city}
                      value={formData.area}
                      onChange={e => setFormData({...formData, area: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm font-inter appearance-none disabled:opacity-30 cursor-pointer"
                    >
                      <option value="">SELECT AREA</option>
                      {stats.areas.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                      <option value="Other">OTHER (SPECIFY BELOW)</option>
                    </select>
                  </div>

                  {formData.area === 'Other' && (
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-ui text-gold" htmlFor="checkout-custom-area">Specify Your Area / Neighborhood</label>
                      <input 
                        id="checkout-custom-area"
                        type="text"
                        name="address-level3"
                        value={formData.customArea} 
                        onChange={e => setFormData({...formData, customArea: e.target.value})}
                        className="w-full bg-transparent border-b border-gold py-3 outline-none transition-luxury font-medium text-sm font-inter"
                        placeholder="e.g. Lekki Phase 3, Chevron Drive"
                        autoComplete="address-level3"
                        autoCorrect="on"
                        autoCapitalize="words"
                        spellCheck="true"
                        inputMode="text"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-ui text-gray-400" htmlFor="checkout-street">Detailed Street Address (House No, Street Name)</label>
                    <input 
                      id="checkout-street"
                      type="text"
                      name="street-address"
                      value={formData.street} 
                      onChange={e => setFormData({...formData, street: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm font-inter"
                      placeholder="e.g. 24B Allen Avenue, Opebi"
                      autoComplete="street-address"
                      autoCorrect="on"
                      autoCapitalize="words"
                      spellCheck="true"
                      inputMode="text"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-ui text-gray-400" htmlFor="checkout-landmark">Closest Landmark (Required)</label>
                    <input 
                      id="checkout-landmark"
                      type="text"
                      name="landmark"
                      value={formData.landmark} 
                      onChange={e => setFormData({...formData, landmark: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm font-inter"
                      placeholder="e.g. Opposite GTBank / Near Opebi Junction"
                      autoComplete="off"
                      autoCorrect="on"
                      autoCapitalize="sentences"
                      spellCheck="true"
                      inputMode="text"
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
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start group">
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
                        <span className="text-price !text-sm">{formatCurrency(totalToPay)}</span>
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
                     <p className="text-5xl lg:text-7xl font-bold tracking-tighter text-white font-playfair">{formatCurrency(totalToPay)}</p>
                  </div>
                  <p className="text-body text-gray-500 !text-[11px] leading-relaxed">
                     By proceeding, you authorize the secure collection of funds for your selected luxury pieces.
                  </p>
               </div>
               
               <div className="space-y-6 relative z-10">
                  <div className="flex items-start space-x-4 group cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                    <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${agreedToTerms ? 'bg-gold border-gold' : 'border-white/20 bg-transparent group-hover:border-white/40'}`}>
                      {agreedToTerms && <CheckmarkCircle01Icon size={12} className="text-charcoal" />}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest select-none">
                      I agree to the <button onClick={(e) => { e.stopPropagation(); setPolicyModal({ isOpen: true, title: 'Terms & Conditions', content: <TermsContent /> }) }} className="text-gold hover:underline">Terms & Conditions</button> and <button onClick={(e) => { e.stopPropagation(); setPolicyModal({ isOpen: true, title: 'Refund Policy', content: <RefundContent /> }) }} className="text-gold hover:underline">Refund Policy</button>
                    </p>
                  </div>

                  <Button 
                    onClick={handlePaystack} 
                    disabled={loading || totalToPay === 0 || checkoutItems.some(i => i.quantity === 0)}
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
      
      <PolicyModal 
        isOpen={policyModal.isOpen} 
        onClose={() => setPolicyModal({ ...policyModal, isOpen: false })} 
        title={policyModal.title}
      >
        {policyModal.content}
      </PolicyModal>

      <PaymentSuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        data={paymentData} 
      />
    </div>
  )
}

export default Checkout
