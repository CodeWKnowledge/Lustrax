import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft01Icon, ImageAdd02Icon, InformationCircleIcon, CheckmarkCircle01Icon } from 'hugeicons-react'
import { supabase } from '../../lib/supabase'
import { useModal } from '../../context/ModalContext'
import { toast } from 'react-hot-toast'
import Button from '../../components/ui/Button'


const ProductForm = () => {
  const { id } = useParams()
  const isEdit = Boolean(id)
  
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    category: '',
    material: '18k Gold & VVS Gems',
    weight: '',
    stock_quantity: 1,
    is_featured: false,
    is_new_release: false,
    is_best_seller: false
  })
  const [imageFile, setImageFile] = useState(null)
  const [additionalFiles, setAdditionalFiles] = useState([])
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isGalleryCleared, setIsGalleryCleared] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const navigate = useNavigate()
  const { showAlert } = useModal()

  // Fetch product data for edit mode
  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        
        if (data) {
          setFormData({
            name: data.name,
            description: data.description,
            price: data.price,
            category: data.category,
            material: data.material || '18k Gold & VVS Gems',
            weight: data.weight || '',
            stock_quantity: data.stock_quantity || 1,
            is_featured: data.is_featured,
            is_new_release: data.is_new_release,
            is_best_seller: data.is_best_seller
          })
          setExistingImageUrl(data.image_url)
          setExistingAdditionalImages(data.additional_images || [])
          setPreviewUrl(data.image_url)
        }
        setFetching(false)
      }
      fetchProduct()
    }
  }, [id, isEdit])

  // Manage main preview URL cleanup
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [imageFile])

  // Safe UUID generator for production environments
  const generateUUID = () => {
    try {
      return crypto.randomUUID()
    } catch {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let image_url = ''
      let additional_images = []

      // 1. Upload Main Image
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${generateUUID()}.${fileExt}`
        const filePath = `products/${fileName}`
        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, imageFile)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath)
        image_url = publicUrl
      }

      // 2. Upload Additional Gallery Images
      if (additionalFiles.length > 0) {
        const uploadPromises = additionalFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${generateUUID()}.${fileExt}`
          const filePath = `products/gallery/${fileName}`
          const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file)
          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath)
          return publicUrl
        })
        additional_images = await Promise.all(uploadPromises)
      }


      // 3. Synchronize with Database
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        material: formData.material,
        weight: formData.weight,
        stock_quantity: parseInt(formData.stock_quantity) || 1,
        image_url: image_url || existingImageUrl,
        additional_images: (additional_images && additional_images.length > 0) 
          ? additional_images 
          : (isGalleryCleared ? [] : existingAdditionalImages),
        is_featured: formData.is_featured,
        is_new_release: formData.is_new_release,
        is_best_seller: formData.is_best_seller
      }

      const { error: dbError } = isEdit 
        ? await supabase.from('products').update(payload).eq('id', id)
        : await supabase.from('products').insert([payload])

      if (dbError) throw dbError

      toast.success(isEdit ? 'Collection updated successfully' : 'Inventory state successfully synchronized')
      navigate('/admin/products')
    } catch (err) {
      console.error(err)
      showAlert(isEdit ? 'Update Error' : 'Creation Error', `We couldn't synchronize this entry: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin"></div>
       <p className="text-[10px] text-gold font-bold uppercase tracking-[0.5em] italic">Retrieving Artisan Blueprint...</p>
    </div>
  )



  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 md:space-y-10 lg:space-y-12 pb-20"
    >
      <div className="flex flex-col space-y-4">
        <Link 
          to="/admin/products" 
          className="group flex items-center text-[10px] uppercase tracking-[0.4em] font-bold text-gray-400 hover:text-gold transition-luxury w-fit"
        >
          <ArrowLeft01Icon size={14} className="mr-3 group-hover:-translate-x-1 transition-luxury" /> 
          Back to Inventory
        </Link>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif text-charcoal uppercase tracking-tighter">
          {isEdit ? 'Modify Selection' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Visual Assets */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-2xl border-subtle overflow-hidden shadow-premium group">
              <label className="flex flex-col items-center justify-center w-full aspect-[4/5] cursor-pointer relative overflow-hidden">
                {previewUrl ? (
                  <div className="relative w-full h-full group">
                    <img 
                      src={previewUrl} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                      alt="Preview"
                    />
                    <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-luxury">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white border border-white/20 px-4 py-2 backdrop-blur-sm">Forge New Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4 px-10 text-center">
                    <div className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center text-gray-200 group-hover:border-gold group-hover:text-gold transition-all">
                      <ImageAdd02Icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold uppercase tracking-[0.3em] text-charcoal">Primary Asset</span>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Select Master Visual</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" accept="image/*" 
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) setImageFile(file)
                  }}
                  className="hidden" 
                />
              </label>
           </div>

           {/* Gallery Section */}
           <div className="p-8 bg-white rounded-luxury border-subtle shadow-premium space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                 <span className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Atmospheric Gallery</span>
                 <span className="text-[8px] text-gold font-bold">
                  {isEdit && !additionalFiles.length && !isGalleryCleared ? existingAdditionalImages.length : additionalFiles.length}/3
                 </span>
              </div>
              
              {isEdit && (existingAdditionalImages.length > 0 || additionalFiles.length > 0) && (
                <button 
                  type="button"
                  onClick={() => {
                    setAdditionalFiles([])
                    setIsGalleryCleared(true)
                  }}
                  className="text-[8px] font-bold text-red-400 uppercase tracking-widest hover:text-red-500 transition-luxury"
                >
                  Clear Gallery
                </button>
              )}

              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <label key={i} className="aspect-square bg-soft-bg rounded-luxury border border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-gold transition-luxury relative overflow-hidden group">
                    {additionalFiles[i] || (isEdit && existingAdditionalImages[i]) ? (
                      <img 
                        src={additionalFiles[i] ? URL.createObjectURL(additionalFiles[i]) : existingAdditionalImages[i]} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-luxury duration-700" 
                        alt="Gallery"
                      />
                    ) : (
                      <span className="text-gray-200 group-hover:text-gold transition-luxury">+</span>
                    )}
                    <input 
                      type="file" accept="image/*" 
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const newFiles = [...additionalFiles]
                          newFiles[i] = file
                          setAdditionalFiles(newFiles.filter(Boolean))
                        }
                      }}
                      className="hidden" 
                    />
                  </label>
                ))}
              </div>
               {isEdit && existingAdditionalImages.length > 0 && !additionalFiles.length && !isGalleryCleared && (
                <p className="text-[8px] text-gray-400 uppercase tracking-widest text-center">Legacy Gallery Active</p>
              )}
              {isGalleryCleared && (
                <p className="text-[8px] text-orange-400 uppercase tracking-widest text-center italic">Gallery will be cleared on Save</p>
              )}
           </div>
           
           <div className="p-8 bg-white rounded-luxury border-subtle shadow-premium space-y-6">
              <span className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400 border-b border-gray-50 pb-4 block">Storefront Intelligence</span>
              <div className="space-y-4">
                {[
                  { id: 'is_featured', label: 'Featured Selection' },
                  { id: 'is_new_release', label: 'New Arrival' },
                  { id: 'is_best_seller', label: 'Best Seller' }
                ].map(opt => (
                  <label key={opt.id} className="flex items-center justify-between cursor-pointer group">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 group-hover:text-charcoal transition-luxury">{opt.label}</span>
                    <input 
                      type="checkbox" 
                      checked={formData[opt.id]} 
                      onChange={e => setFormData({...formData, [opt.id]: e.target.checked})}
                      className="w-4 h-4 accent-gold cursor-pointer"
                    />
                  </label>
                ))}
              </div>
           </div>
        </div>

        {/* Right Side: Specifications */}
        <div className="lg:col-span-8 bg-white p-8 lg:p-12 rounded-2xl border-subtle shadow-premium space-y-12">
           <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                   <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Registry Name</label>
                   <input 
                     type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                     className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-bold text-sm uppercase tracking-widest text-charcoal placeholder:text-gray-100"
                     placeholder="e.g. LUSTRAX NO. 09" required
                   />
                 </div>
                 <div className="space-y-4">
                   <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Valuation (₦)</label>
                   <input 
                     type="number" step="1" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                     className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-bold text-sm tracking-widest text-charcoal"
                     placeholder="0.00" required
                   />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Collection Protocol</label>
                    <select 
                      value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-bold text-sm uppercase tracking-widest text-charcoal appearance-none cursor-pointer"
                      required
                    >
                       <option value="" disabled>Select Segment...</option>
                       <option value="Watches">Watches</option>
                       <option value="Necklaces">Necklaces</option>
                       <option value="Earrings">Earrings</option>
                       <option value="Rings">Rings</option>
                       <option value="Bracelets">Bracelets</option>
                       <option value="Collections">Special Collections</option>
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Inventory Allocation</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.stock_quantity} 
                      onChange={e => setFormData({...formData, stock_quantity: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-bold text-sm tracking-widest text-charcoal"
                      placeholder="Units" required
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-10 border-t border-gray-50 pt-10">
              <span className="text-[10px] uppercase font-bold tracking-[0.6em] text-gold italic">Artisan Specifications</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Crafting Material</label>
                    <input 
                      type="text" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-bold text-sm uppercase tracking-widest text-charcoal"
                      placeholder="e.g. 18K Yellow Gold"
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Calculated Weight</label>
                    <input 
                      type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
                      className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-bold text-sm uppercase tracking-widest text-charcoal"
                      placeholder="e.g. 12.5g"
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-gray-400">Design Narrative</label>
                 <textarea 
                   value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full bg-transparent border-b border-gray-100 py-3 outline-none focus:border-gold transition-luxury font-medium text-sm text-gray-600 h-32 resize-none leading-relaxed"
                   placeholder="Elaborate on the craftsmanship and inspiration..."
                   required
                 />
              </div>
           </div>           <div className="pt-6 border-t border-gray-50">
              <Button 
                type="submit" 
                disabled={loading || (!isEdit && !imageFile)} 
                variant="primary"
                size="lg"
                className="w-full h-16 shadow-luxury active:scale-95 transition-all group overflow-hidden relative"
              >
                <span className="relative z-10 font-bold tracking-[0.5em] uppercase">
                  {loading ? (isEdit ? 'Updating Vault...' : 'Committing to Vault...') : (isEdit ? 'Authorize Adjustment' : 'Authorize Listing')}
                </span>
                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-luxury duration-700 opacity-10"></div>
              </Button>
           </div>
        </div>

      </form>
    </motion.div>
  )
}

export default ProductForm
