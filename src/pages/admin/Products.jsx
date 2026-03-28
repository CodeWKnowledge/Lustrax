import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useModal } from '../../context/ModalContext'
import { supabase } from '../../lib/supabase'
import AdminTable from '../../components/admin/ui/AdminTable'
import DetailsModal from '../../components/admin/ui/DetailsModal'
import Button from '../../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency, formatLuxuryDate } from '../../utils/formatters'
import { toast } from 'react-hot-toast'
import { 
  PlusSignIcon, 
  Delete02Icon, 
  Edit01Icon,
  Image01Icon,
  ViewIcon,
  Search01Icon
} from 'hugeicons-react'

const PAGE_SIZE = 10

const Products = () => {
  const navigate = useNavigate()
  const { showConfirm } = useModal()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
    
    if (error) {
      toast.error('Inventory retrieval failed')
    } else {
      setProducts(data || [])
      setFilteredProducts(data || [])
      setHasMore(data?.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [page])

  useEffect(() => {
    fetchProducts()

    const channelKey = `products-admin-${Date.now()}`
    const channel = supabase
      .channel(channelKey)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
        setProducts(prev => [payload.new, ...prev].slice(0, PAGE_SIZE))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'products' }, (payload) => {
        setProducts(prev => prev.filter(p => p.id !== payload.old.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchProducts])

  useEffect(() => {
    const term = searchTerm.toLowerCase()
    const result = products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.category && p.category.toLowerCase().includes(term)) ||
      p.id.toLowerCase().includes(term)
    )
    setFilteredProducts(result)
  }, [searchTerm, products])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id))
    } else {
      setSelectedProductIds([])
    }
  }

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, id])
    } else {
      setSelectedProductIds(prev => prev.filter(pid => pid !== id))
    }
  }

  const handleDelete = async (product) => {
    const confirmed = await showConfirm('Permanent Deletion', 'Are you sure you want to delete this piece? This action cannot be revoked.')
    if (confirmed) {
      try {
        const pathsToDelete = []
        
        // 1. Collect Main Image Path
        if (product.image_url) {
          const path = product.image_url.split('/').pop()
          pathsToDelete.push(`products/${path}`)
        }
        
        // 2. Collect Gallery Paths
        if (product.additional_images && Array.isArray(product.additional_images)) {
          product.additional_images.forEach(url => {
            const path = url.split('/').pop()
            pathsToDelete.push(`products/gallery/${path}`)
          })
        }

        // 3. Batch Remove from Storage
        if (pathsToDelete.length > 0) {
          await supabase.storage.from('products').remove(pathsToDelete)
        }
        
        // 4. Delete from Database
        const { error } = await supabase.from('products').delete().eq('id', product.id)
        if (error) throw error
        
        toast.success('Piece and all associated assets removed')
        fetchProducts()
      } catch (err) {
        toast.error('Deletion protocol failed')
      }
    }
  }

  const togglePlacement = async (id, field, currentValue) => {
    try {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: !currentValue } : p))
      setFilteredProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: !currentValue } : p))
      
      const { error } = await supabase.from('products').update({ [field]: !currentValue }).eq('id', id)
      if (error) throw error
      
      toast.success('Placement updated successfully')
    } catch (err) {
      toast.error('Failed to synchronize placement')
      fetchProducts()
    }
  }

  const handleBulkDelete = async () => {
    const confirmed = await showConfirm('Permanent Bulk Deletion', `Are you sure you want to delete ${selectedProductIds.length} pieces? This action is irreversible.`)
    if (confirmed) {
      setIsBulkDeleting(true)
      try {
        const { error } = await supabase.from('products').delete().in('id', selectedProductIds)
        if (error) throw error
        
        toast.success(`Successfully removed ${selectedProductIds.length} pieces`)
        setSelectedProductIds([])
        fetchProducts()
      } catch (err) {
        toast.error('Bulk deletion protocol failed')
      }
      setIsBulkDeleting(false)
    }
  }

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleOpenForm = (product = null) => {
    if (product) {
      navigate(`/admin/products/edit/${product.id}`)
    } else {
      navigate('/admin/products/add')
    }
  }

  const getModalSections = (product) => {
    if (!product) return []
    return [
      { label: 'Product ID', value: product.id },
      { label: 'Date Added', value: formatLuxuryDate(product.created_at) },
      { label: 'Name', value: product.name },
      { label: 'Price', value: formatCurrency(product.price) },
      { label: 'Category', value: product.category || 'Collection' },
      { label: 'Description', value: product.description || 'No description available.', fullWidth: true }
    ]
  }

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
       <p className="text-[10px] text-gold font-bold uppercase tracking-[0.5em] italic">Accessing Inventory...</p>
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 md:space-y-10 lg:space-y-12 pb-20 relative"
    >
      <DetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Product Intelligence"
        sections={getModalSections(selectedProduct)}
      />


      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedProductIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-white px-8 py-4 rounded-luxury shadow-2xl flex items-center space-x-8 border border-white/10 backdrop-blur-md"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
               {selectedProductIds.length} Pieces Selected
            </span>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button 
              disabled={isBulkDeleting}
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-widest hover:text-red-400 transition-luxury disabled:opacity-50"
            >
              <Delete02Icon size={14} />
              <span>Bulk Delete</span>
            </button>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <button 
              onClick={() => setSelectedProductIds([])}
              className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-luxury"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-50 pb-12">
        <div className="space-y-4">
           <span className="text-[10px] uppercase tracking-[0.6em] font-bold text-gold italic">Inventory List</span>
           <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">Inventory</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 w-full md:w-auto">
          <div className="flex items-center space-x-4 bg-soft-bg px-4 py-3 rounded-luxury border border-gray-50 focus-within:border-gold/30 transition-luxury min-w-[320px]">
            <Search01Icon size={14} className="text-gray-300" />
            <input 
              type="text"
              placeholder="SEARCH BY NAME, CATEGORY, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal outline-none w-full placeholder:text-gray-200"
            />
          </div>

          <Button 
            onClick={() => navigate('/admin/products/add')}
            variant="primary" 
            className="px-8 h-12 group"
          >
            <PlusSignIcon size={16} className="mr-3 group-hover:rotate-90 transition-luxury" /> 
            <span>Add Products</span>
          </Button>

        </div>
      </div>

      <AdminTable 
        onSelectAll={handleSelectAll}
        isAllSelected={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
        headers={[
          { label: 'Product Manifest' },
          { label: 'Valuation', align: 'center' },
          { label: 'Stock Allocation', align: 'center' },
          { label: 'Placement', align: 'center' },
          { label: 'Actions', align: 'right' }
        ]}
      >
        {filteredProducts.map(p => (
          <tr key={p.id} className={`block lg:table-row text-sm border border-gray-100 lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:border-b lg:border-gray-50 rounded-xl mb-4 lg:mb-0 lg:rounded-none lg:last:border-b-0 group transition-luxury p-5 lg:p-0 ${selectedProductIds.includes(p.id) ? 'bg-gold/5' : 'hover:bg-soft-bg/20'}`}>
            <td className="px-3 py-3 lg:px-6 lg:py-4 w-12 hidden lg:table-cell">
               <input 
                 type="checkbox" 
                 checked={selectedProductIds.includes(p.id)}
                 onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                 className="w-4 h-4 accent-gold cursor-pointer border-gray-200 rounded-sm"
               />
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-6 py-2 lg:py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-luxury overflow-hidden border-subtle flex-shrink-0 bg-soft-bg">
                  {p.image_url ? (
                    <img src={p.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-luxury duration-700" alt={p.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200"><Image01Icon size={16} /></div>
                  )}
                </div>
                <div className="flex flex-col space-y-0.5 overflow-hidden max-w-[140px] lg:max-w-[200px]">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal truncate" title={p.name}>{p.name}</span>
                   <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-300 italic truncate">{p.category || 'Uncategorized'}</span>
                </div>
              </div>
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-6 py-2 lg:py-4 text-center">
               <span className="lg:hidden text-gray-400 mr-2 text-[10px] font-normal uppercase tracking-widest">Valuation:</span>
               <span className="text-[10px] font-bold tracking-widest text-charcoal">{formatCurrency(p.price)}</span>
            </td>
            <td className="block lg:table-cell px-0 lg:px-6 py-2 lg:py-4 text-center">
               <span className="lg:hidden text-gray-400 mr-2 text-[10px] font-normal uppercase tracking-widest">Stock:</span>
               <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-soft-bg border border-gray-50">
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${p.stock_quantity > 5 ? 'bg-green-400' : p.stock_quantity > 0 ? 'bg-orange-400' : 'bg-red-400'}`}></span>
                  <span className="text-[9px] font-bold tracking-widest text-charcoal">{p.stock_quantity || 0} UNITS</span>
               </div>
            </td>

            <td className="block lg:table-cell px-0 lg:px-4 xl:px-6 py-2 lg:py-4 lg:text-center">
               <span className="lg:hidden text-gray-400 mr-2 text-[10px] font-normal uppercase tracking-widest">Placement:</span>
               <div className="flex items-center lg:justify-center gap-1.5 flex-wrap max-w-[140px] mx-auto">
                 <button onClick={() => togglePlacement(p.id, 'is_featured', p.is_featured)} className={`px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest rounded-sm transition-luxury ${p.is_featured ? 'bg-gold text-white shadow-premium-sm' : 'bg-gray-100 text-gray-400 hover:bg-gold/20'}`}>Featured</button>
                 <button onClick={() => togglePlacement(p.id, 'is_new_release', p.is_new_release)} className={`px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest rounded-sm transition-luxury ${p.is_new_release ? 'bg-charcoal text-white shadow-premium-sm' : 'bg-gray-100 text-gray-400 hover:bg-charcoal/20'}`}>New</button>
                 <button onClick={() => togglePlacement(p.id, 'is_best_seller', p.is_best_seller)} className={`px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest rounded-sm transition-luxury ${p.is_best_seller ? 'bg-orange-500 text-white shadow-premium-sm' : 'bg-gray-100 text-gray-400 hover:bg-orange-500/20'}`}>Best</button>
               </div>
            </td>
            <td className="block lg:table-cell px-0 lg:px-4 xl:px-6 py-3 lg:py-4 lg:text-right">
               <div className="flex items-center justify-between lg:justify-end lg:space-x-2">
                 <span className="lg:hidden text-gray-400 text-[8px] font-bold uppercase tracking-widest">Actions</span>
                 <div className="flex items-center space-x-1 lg:space-x-2">
                   <button onClick={() => handleViewDetails(p)} className="text-gray-300 hover:text-gold transition-luxury p-1.5" title="View"><ViewIcon size={16} /></button>
                   <button onClick={() => handleOpenForm(p)} className="text-gray-300 hover:text-gold transition-luxury p-1.5" title="Edit"><Edit01Icon size={16} /></button>
                   <button onClick={() => handleDelete(p)} className="text-gray-300 hover:text-red-500 transition-luxury p-1.5" title="Delete"><Delete02Icon size={16} /></button>
                 </div>
               </div>
            </td>
          </tr>
        ))}
        {filteredProducts.length === 0 && (
          <tr>
            <td colSpan={6} className="py-20 text-center">
               <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em] italic">No matching pieces found in the inventory ledger.</p>
            </td>
          </tr>
        )}
      </AdminTable>

      <div className="flex items-center justify-between pt-8 border-t border-gray-50">
         <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-300">
           Manifest Page {page}
         </span>
         <div className="flex items-center space-x-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="text-[9px] font-black uppercase tracking-[0.4em] text-charcoal disabled:opacity-20 hover:text-gold transition-luxury px-4 py-2"
            >
              Previous
            </button>
            <div className="w-[1px] h-4 bg-gray-50"></div>
            <button 
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="text-[9px] font-black uppercase tracking-[0.4em] text-charcoal disabled:opacity-20 hover:text-gold transition-luxury px-4 py-2"
            >
              Next Protocol
            </button>
         </div>
      </div>
    </motion.div>
  )
}

export default Products
