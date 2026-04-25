/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlistItems([])
      setLoading(false)
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', user.id)

      if (error) throw error
      // Hardening: Filter out items where the product relationship is null (deleted products)
      const validItems = (data || []).filter(item => item.products !== null)
      setWishlistItems(validItems)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = async (product) => {
    if (!user) return

    const existingItem = wishlistItems.find(item => item.product_id === product.id)

    if (existingItem) {
      // Remove from wishlist
      try {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('id', existingItem.id)

        if (error) throw error
        setWishlistItems(prev => prev.filter(item => item.id !== existingItem.id))
      } catch (error) {
        console.error('Error removing from wishlist:', error)
      }
    } else {
      // Add to wishlist
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .insert([{ user_id: user.id, product_id: product.id }])
          .select('*, products(*)')
          .single()

        if (error) throw error
        setWishlistItems(prev => [...prev, data])
      } catch (error) {
        console.error('Error adding to wishlist:', error)
      }
    }
  }

  const removeFromWishlist = async (id) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id)

      if (error) throw error
      setWishlistItems(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId)
  }

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems, 
      loading, 
      toggleWishlist, 
      removeFromWishlist, 
      isInWishlist,
      wishlistCount: wishlistItems.length 
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}



