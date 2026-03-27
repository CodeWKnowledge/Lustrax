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
        const validIds = cartItems.filter(item => isUUID(item.id)).map(item => item.id)

        // If we found malformed IDs, purge them silently to prevent infinite crash loops
        if (validIds.length !== cartItems.length) {
          console.warn('LUSTRAX: Purging malformed inventory references.')
          setCartItems(prev => prev.filter(item => isUUID(item.id)))
        }

        if (validIds.length === 0) return

        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, stock_quantity')
          .in('id', validIds)

        if (error) throw error

        setCartItems(prev => prev.map(item => {
          const dbProduct = data.find(p => p.id === item.id)
          if (!dbProduct) return item
          
          return { 
            ...item, 
            ...dbProduct, 
            quantity: Math.min(item.quantity, dbProduct.stock_quantity) 
          }
        }))
      } catch (err) {
        console.error('LUSTRAX: Stock Sweep Protocol Interrupted.', err)
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
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'products' 
      }, (payload) => {
        setCartItems(prev => {
          const itemToUpdate = prev.find(item => item.id === payload.new.id)
          if (!itemToUpdate) return prev
          
          // Only update if the stock count has actually changed to avoid redundant renders
          if (itemToUpdate.stock_quantity === payload.new.stock_quantity) return prev

          console.log(`LUSTRAX SYNC: Stock adjustment for ${payload.new.name} -> ${payload.new.stock_quantity}`)
          return prev.map(item => 
            item.id === payload.new.id 
              ? { ...item, ...payload.new, quantity: Math.min(item.quantity, payload.new.stock_quantity || 1) } 
              : item
          )
        })
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('LUSTRAX DEBUG: Cart synchronization vault active')
        }
        if (err) {
          console.error('LUSTRAX ERROR: Cart sync failure:', err)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [cartItems.length > 0]) // Stable dependency: only flips when transitioning from/to empty cart

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      const newQuantity = existing ? existing.quantity + quantity : quantity
      
      if (product.stock_quantity !== undefined && newQuantity > product.stock_quantity) {
        toast.error(`Only ${product.stock_quantity} unit(s) available in the vault.`)
        return prev
      }

      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId)
    setCartItems(prev => {
      const itemToUpdate = prev.find(item => item.id === productId)
      if (itemToUpdate && itemToUpdate.stock_quantity !== undefined && quantity > itemToUpdate.stock_quantity) {
        toast.error(`Only ${itemToUpdate.stock_quantity} unit(s) available in the vault.`)
        return prev
      }
      return prev.map(item => item.id === productId ? { ...item, quantity } : item)
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
