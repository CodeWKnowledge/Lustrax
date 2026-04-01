import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ModalProvider } from './context/ModalContext'
import { WishlistProvider } from './context/WishlistContext'
import Layout from './components/Layout'
import GlobalModal from './components/ui/GlobalModal'
import { Toaster } from 'react-hot-toast'
import { NotificationProvider } from './context/NotificationContext'
import { HelmetProvider, Helmet } from 'react-helmet-async'


// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'

// Dashboard Suite (Personalized)
import DashboardLayout from './components/dashboard/DashboardLayout'
import UserOverview from './pages/dashboard/Overview'
import UserOrders from './pages/dashboard/Orders'
import UserWishlist from './pages/dashboard/Wishlist'
import UserTransactions from './pages/dashboard/Transactions'
import UserSettings from './pages/dashboard/Settings'

// Admin Suite (Modern Modular)
import AdminLayout from './components/admin/AdminLayout'
import AdminOverview from './pages/admin/Overview'
import AdminOrders from './pages/admin/Orders'
import AdminProducts from './pages/admin/Products'
import AdminCustomers from './pages/admin/Customers'

import AdminFinance from './pages/admin/Finance'
import AdminWishlist from './pages/admin/Wishlist'
import AdminProductForm from './pages/admin/ProductForm'


import AdminSettings from './pages/admin/Settings'
import AdminNotifications from './pages/admin/Notifications'
import { useEffect } from 'react'


// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading, openAuthModal } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal()
    }
  }, [loading, user, openAuthModal])

  if (loading) return <div className="h-screen flex items-center justify-center text-gold tracking-widest text-xl">LUSTRAX.</div>
  
  if (!user) return <Navigate to="/" />
  
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" />

  return children
}

const GlobalApp = () => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center space-y-6">
         <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.5em] italic">Authenticating Session...</p>
      </div>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        
        {/* Personalized Dashboard Architecture */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<UserOverview />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="wishlist" element={<UserWishlist />} />
          <Route path="transactions" element={<UserTransactions />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>
        
        {/* Modular Admin Architecture */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />
          <Route path="customers" element={<AdminCustomers />} />

          <Route path="payments" element={<AdminFinance />} />

          <Route path="wishlist" element={<AdminWishlist />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <HelmetProvider>
          <Helmet>
            <title>Lustrax Jewelries | Handcrafted Luxury & Elegance in Nigeria</title>
            <meta name="description" content="Discover the world's most exquisite handcrafted jewelry. Custom pieces designed for royalty. Buy gold, diamonds, and luxury jewelry in Nigeria." />
            
            {/* Structured Data: Organization */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Lustrax Jewelries",
                "url": "https://lustrax-jewelries.com",
                "logo": "https://lustrax-jewelries.com/favicon.png",
                "sameAs": [
                  "https://instagram.com/lustrax_jewelries",
                  "https://facebook.com/lustrax_jewelries"
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+234-800-LUSTRAX",
                  "contactType": "Customer Service",
                  "areaServed": "NG",
                  "availableLanguage": "English"
                }
              })}
            </script>
          </Helmet>
          <ModalProvider>
            <CartProvider>
              <WishlistProvider>
                <NotificationProvider>
                  <GlobalApp />
                  <GlobalModal />
                  
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      style: {
                        background: '#1A1A1A',
                        color: '#D4AF37',
                        border: '1px solid rgba(212, 175, 55, 0.1)',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        fontWeight: '700',
                        borderRadius: '0',
                        padding: '16px 24px'
                      },
                      success: {
                        iconTheme: {
                          primary: '#D4AF37',
                          secondary: '#1A1A1A',
                        },
                      },
                    }}
                  />
                </NotificationProvider>
              </WishlistProvider>
            </CartProvider>
          </ModalProvider>
        </HelmetProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
