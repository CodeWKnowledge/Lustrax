import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ModalProvider } from '@/context/ModalContext'
import { WishlistProvider } from '@/context/WishlistContext'
import Layout from '@/components/common/Layout'
import GlobalModal from '@/components/ui/GlobalModal'
import { Toaster } from 'react-hot-toast'
import { NotificationProvider } from '@/context/NotificationContext'
import { HelmetProvider, Helmet } from 'react-helmet-async'


// Marketing Module
import LandingPage from '@/modules/marketing/landing/LandingPage'
import ProductsPage from '@/modules/marketing/products/ProductsPage'
import ProductDetailsPage from '@/modules/marketing/products/ProductDetailsPage'
import CartPage from '@/modules/marketing/cart/CartPage'
import CheckoutPage from '@/modules/marketing/checkout/CheckoutPage'
import TermsPage from '@/modules/marketing/legal/TermsPage'
import RefundPage from '@/modules/marketing/legal/RefundPage'

// Dashboard Module (App/MFI)
import DashboardLayout from '@/modules/app/dashboard/components/DashboardLayout'
import DashboardOverviewPage from '@/modules/app/dashboard/pages/Overview'
import DashboardOrdersPage from '@/modules/app/dashboard/pages/Orders'
import DashboardWishlistPage from '@/modules/app/dashboard/pages/Wishlist'
import DashboardTransactionsPage from '@/modules/app/dashboard/pages/Transactions'
import DashboardSettingsPage from '@/modules/app/dashboard/pages/Settings'

// Admin Module (App/MFI)
import AdminLayout from '@/modules/app/admin/components/AdminLayout'
import AdminOverviewPage from '@/modules/app/admin/pages/Overview'
import AdminOrdersPage from '@/modules/app/admin/pages/Orders'
import AdminProductsPage from '@/modules/app/admin/pages/Products'
import AdminCustomersPage from '@/modules/app/admin/pages/Customers'
import AdminFinancePage from '@/modules/app/admin/pages/Finance'
import AdminWishlistPage from '@/modules/app/admin/pages/Wishlist'
import AdminProductFormPage from '@/modules/app/admin/pages/ProductForm'
import AdminSettingsPage from '@/modules/app/admin/pages/Settings'
import AdminNotificationsPage from '@/modules/app/admin/pages/Notifications'

import NotFound from '@/pages/NotFound'
import ErrorBoundary from '@/components/common/ErrorBoundary'
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
        <Route path="/" element={<ProductsPage />} />
        <Route path="/products" element={<Navigate to="/" replace />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/terms-and-conditions" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPage />} />
        
        {/* Personalized Dashboard Architecture */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="orders" element={<DashboardOrdersPage />} />
          <Route path="wishlist" element={<DashboardWishlistPage />} />
          <Route path="transactions" element={<DashboardTransactionsPage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
        </Route>
        
        {/* Modular Admin Architecture */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminOverviewPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/add" element={<AdminProductFormPage />} />
          <Route path="products/edit/:id" element={<AdminProductFormPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />

          <Route path="payments" element={<AdminFinancePage />} />

          <Route path="wishlist" element={<AdminWishlistPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>
        {/* 404 â€” Catch-all for unknown routes */}
        <Route path="*" element={<NotFound />} />

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
                  <ErrorBoundary>
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
                  </ErrorBoundary>
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


