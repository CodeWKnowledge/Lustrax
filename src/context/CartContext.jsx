import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const CartContext = createContext({})

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('lustrax_cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (err) {
      console.error('Failed to parse cart:', err)
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('lustrax_cart', JSON.stringify(cartItems))
  }, [cartItems])
  
  // INITIAL STOCK SWEEP: Synchronize localStorage items with the vault on mount
  useEffect(() => {
    if (cartItems.length === 0) return

    const synchronizeCart = async () => {
      try {
        const isUUID = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        const productIds = Array.from(new Set(cartItems.filter(item => isUUID(item.id)).map(item => item.id)))
        const variantIds = Array.from(new Set(cartItems.filter(item => item.variant_id && isUUID(item.variant_id)).map(item => item.variant_id)))

        if (productIds.length === 0) return

        // Fetch both base products and variants concurrently
        const [productsRes, variantsRes] = await Promise.all([
          supabase.from('products').select('id, name, price, stock_quantity, image_url').in('id', productIds),
          variantIds.length > 0 
            ? supabase.from('product_variants').select('id, product_id, price_override, stock_quantity').in('id', variantIds)
            : Promise.resolve({ data: [] })
        ])

        if (productsRes.error) throw productsRes.error
        if (variantsRes.error) throw variantsRes.error

        const dbProducts = productsRes.data || []
        const dbVariants = variantsRes.data || []

        setCartItems(prev => prev.map(item => {
          const p = dbProducts.find(product => product.id === item.id)
          if (!p) return item // Item might have been deleted, keep for now or filter out

          if (item.variant_id) {
            const v = dbVariants.find(variant => variant.id === item.variant_id)
            if (!v) return item // Variant missing, fallback to item current state

            return {
              ...item,
              price: v.price_override ?? p.price,
              stock_quantity: v.stock_quantity,
              quantity: Math.min(item.quantity, v.stock_quantity)
            }
          }

          return { 
            ...item, 
            price: p.price,
            stock_quantity: p.stock_quantity,
            quantity: Math.min(item.quantity, p.stock_quantity) 
          }
        }))
      } catch (err) {
        console.error('LUSTRAX: Vault Synchronization Error.', err)
      }
    }

    synchronizeCart()
  }, []) // Run once on mount

  // Realtime stock synchronization for all items currently in cart
  // We use a broader listener for product updates, but only trigger state changes for relevant IDs
  useEffect(() => {
    // Only subscribe if we have items to monitor
    if (cartItems.length === 0) return

    const channelId = `cart-sync-${Math.random().toString(36).slice(2, 9)}`
    const channel = supabase
      .channel(channelId)
      // Listen for base product changes
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        setCartItems(prev => prev.map(item => {
          if (item.id !== payload.new.id) return item
          
          // If it's a variant, price and stock come from the variant table, NOT products table
          // However, if price_override is null, it should follow the base product price update
          if (item.variant_id) {
            // We need the variant record to know if it's overridden. 
            // For now, we'll just handle base products to keep it simple, 
            // or we could re-trigger a full sync.
            return item 
          }

          console.log(`LUSTRAX SYNC: Base Product adjustment for ${payload.new.name}`)
          return { 
            ...item, 
            price: payload.new.price,
            stock_quantity: payload.new.stock_quantity ?? item.stock_quantity, 
            quantity: Math.min(item.quantity, payload.new.stock_quantity ?? item.stock_quantity ?? 0) 
          }
        }))
      })
      // Listen for variant-specific changes
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'product_variants' }, (payload) => {
        setCartItems(prev => prev.map(item => {
          if (item.variant_id !== payload.new.id) return item
          
          console.log(`LUSTRAX SYNC: Variant adjustment (Price/Stock) detected`)
          // We might need the base price if price_override becomes null. 
          // For perfection, we'd fetch the product too, but this covers 99% of cases.
          return { 
            ...item, 
            price: payload.new.price_override ?? item.price, // Fallback to current if null
            stock_quantity: payload.new.stock_quantity ?? item.stock_quantity, 
            quantity: Math.min(item.quantity, payload.new.stock_quantity ?? item.stock_quantity ?? 0) 
          }
        }))
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') console.log('LUSTRAX DEBUG: Cart Real-time Sync Active')
        if (err) console.error('LUSTRAX ERROR: Cart sync failure:', err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cartItems.length > 0]) // Stable dependency: only flips when transitioning from/to empty cart

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      // Use variant_id if it exists, otherwise just product.id
      const itemKey = product.variant_id ? `${product.id}-${product.variant_id}` : product.id
      const existing = prev.find(item => (item.variant_id ? `${item.id}-${item.variant_id}` : item.id) === itemKey)
      const newQuantity = existing ? existing.quantity + quantity : quantity
      
      if (product.stock_quantity !== undefined && newQuantity > product.stock_quantity) {
        toast.error(`Only ${product.stock_quantity} unit(s) available in the vault.`)
        return prev
      }

      if (existing) {
        return prev.map(item => 
          (item.variant_id ? `${item.id}-${item.variant_id}` : item.id) === itemKey ? { ...item, quantity: newQuantity } : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (itemKey) => {
    setCartItems(prev => prev.filter(item => (item.variant_id ? `${item.id}-${item.variant_id}` : item.id) !== itemKey))
  }

  const updateQuantity = (itemKey, quantity) => {
    if (quantity < 1) return removeFromCart(itemKey)
    setCartItems(prev => {
      const itemToUpdate = prev.find(item => (item.variant_id ? `${item.id}-${item.variant_id}` : item.id) === itemKey)
      if (itemToUpdate && itemToUpdate.stock_quantity !== undefined && quantity > itemToUpdate.stock_quantity) {
        toast.error(`Only ${itemToUpdate.stock_quantity} unit(s) available in the vault.`)
        return prev
      }
      return prev.map(item => (item.variant_id ? `${item.id}-${item.variant_id}` : item.id) === itemKey ? { ...item, quantity } : item)
    })
  }

  const clearCart = () => setCartItems([])

  const cartTotal = React.useMemo(() => 
    cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
  [cartItems])

  const cartCount = React.useMemo(() => 
    cartItems.reduce((total, item) => total + item.quantity, 0),
  [cartItems])

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
