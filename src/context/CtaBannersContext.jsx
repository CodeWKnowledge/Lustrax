import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Default fallback banners (urban contemporary luxury & simple everyday language)
export const DEFAULT_CTA_BANNERS = [
  {
    id: 'banner-vip-whatsapp',
    headline: 'LOOKING FOR SOMETHING SPECIAL?',
    subheading: 'Chat with our team directly on WhatsApp for custom sizing, recommendations, and fast order assistance.',
    button_text: 'Chat on WhatsApp',
    button_link: 'https://wa.me/2348126839505?text=Hello%20Lustrax,%20I%20need%20help%20choosing%20a%20piece',
    is_external: true,
    tag: 'Quick Support',
    theme: 'gold', // 'gold' | 'dark' | 'minimal'
    background_image: '',
    active: true,
    insert_after_index: 8 // Place after 8 products
  },
  {
    id: 'banner-chains-drop',
    headline: 'EXPLORE OUR SOLID CHAINS',
    subheading: 'Handcrafted links with premium weight and daily durability. Find your signature style.',
    button_text: 'Shop Chains',
    button_link: '/?category=Necklaces',
    is_external: false,
    tag: 'Popular Collection',
    theme: 'dark',
    background_image: '',
    active: true,
    insert_after_index: 20 // Place after 20 products
  },
  {
    id: 'banner-free-delivery',
    headline: 'FREE DELIVERY ACROSS NIGERIA',
    subheading: 'Every order is insured and safely packaged with certificate of authenticity included.',
    button_text: 'Browse Best Sellers',
    button_link: '/?category=All',
    is_external: false,
    tag: 'Lustrax Promise',
    theme: 'minimal',
    background_image: '',
    active: true,
    insert_after_index: 36 // Place after 36 products
  }
]

const STORAGE_KEY = 'lustrax_cta_banners_config'
const HEADER_CONFIG_KEY = 'lustrax_catalog_header_config'

export const DEFAULT_HEADER_CONFIG = {
  background_image: '',
  title: 'All Products',
  subtitle: 'Explore our chains, necklaces, rings, and bracelets. Made with high quality materials for everyday wear.',
  tag: 'Online Shop',
  overlay_opacity: 50 // 0 to 100
}

const CtaBannersContext = createContext(null)

export const CtaBannersProvider = ({ children }) => {
  const [headerConfig, setHeaderConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(HEADER_CONFIG_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return DEFAULT_HEADER_CONFIG
  })

  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('Failed reading banners from storage', e)
    }
    return DEFAULT_CTA_BANNERS
  })

  const [loading, setLoading] = useState(true)

  // Try fetching from Supabase table `cta_banners` if it exists, otherwise fall back to local/default
  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('cta_banners')
        .select('*')
        .order('insert_after_index', { ascending: true })

      if (!error && data && data.length > 0) {
        setBanners(data)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        } catch (e) {}
      }
    } catch (err) {
      // Table doesn't exist yet, silently keep local/default
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()

    // Listen for realtime changes if table is present
    const channel = supabase
      .channel('public:cta_banners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cta_banners' }, () => {
        loadBanners()
      })
      .subscribe()

    // Also listen for local storage sync across tabs
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setBanners(JSON.parse(e.newValue))
        } catch (err) {}
      }
      if (e.key === HEADER_CONFIG_KEY && e.newValue) {
        try {
          setHeaderConfig(JSON.parse(e.newValue))
        } catch (err) {}
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Save banners: attempts Supabase first, always persists locally
  const saveBanners = async (updatedBanners) => {
    setBanners(updatedBanners)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBanners))
    } catch (e) {
      console.warn('Failed saving banners to localStorage', e)
    }

    try {
      // Upsert into Supabase if table is created
      const { error } = await supabase
        .from('cta_banners')
        .upsert(updatedBanners, { onConflict: 'id' })

      if (!error) {
        return { success: true, savedTo: 'supabase' }
      }
    } catch (err) {
      // Ignore if table not created
    }

    return { success: true, savedTo: 'local' }
  }

  const resetToDefaults = async () => {
    saveHeaderConfig(DEFAULT_HEADER_CONFIG)
    return saveBanners(DEFAULT_CTA_BANNERS)
  }

  const saveHeaderConfig = async (newConfig) => {
    setHeaderConfig(newConfig)
    try {
      localStorage.setItem(HEADER_CONFIG_KEY, JSON.stringify(newConfig))
    } catch (e) {}

    try {
      await supabase.from('site_settings').upsert({
        key: 'catalog_header',
        value: newConfig,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
    } catch (e) {}
  }

  return (
    <CtaBannersContext.Provider
      value={{
        banners,
        activeBanners: banners.filter(b => b.active),
        headerConfig,
        saveHeaderConfig,
        loading,
        saveBanners,
        resetToDefaults,
        refreshBanners: loadBanners
      }}
    >
      {children}
    </CtaBannersContext.Provider>
  )
}

export const useCtaBanners = () => {
  const context = useContext(CtaBannersContext)
  if (!context) {
    throw new Error('useCtaBanners must be used within a CtaBannersProvider')
  }
  return context
}

