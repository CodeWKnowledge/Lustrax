/**
 * LUSTRAX IMAGE OPTIMIZER (CLOUDINARY FETCH API)
 * 
 * Benefits: Auto-format (WebP/AVIF), Auto-quality, Responsive resizing.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const getOptimizedImage = (url, width = 800) => {
  if (!url) return 'https://via.placeholder.com/800x1000?text=LUSTRAX+JEWELRY';
  
  // 1. Check for configuration or bypass
  if (!CLOUD_NAME || CLOUD_NAME === 'your_cloud_name_here' || CLOUD_NAME === '') {
    return url;
  }

  // 2. Prevent infinite loops or unnecessary wraps
  if (url.includes('res.cloudinary.com') || url.includes('placeholder')) {
    return url;
  }

  // 3. Handle local assets or data URLs (Cloudinary Fetch requires absolute HTTP/S URLs)
  if (!url.startsWith('http')) {
    return url;
  }

  // SECURITY FIX: Prevent Denial of Wallet (DoW) attacks
  // Only allow Cloudinary to process images from trusted internal or approved external domains
  try {
     const urlObj = new URL(url);
     const isTrusted = urlObj.hostname.includes('supabase.co') || 
                       urlObj.hostname.includes('unsplash.com') ||
                       urlObj.hostname.includes('lustrax-jewelries.com');
     if (!isTrusted) return url; // Bypass proxy for arbitrary domains
  } catch {
     return url;
  }

  // 4. Handle malformed data
  if (typeof url !== 'string' || url.startsWith('{') || url.startsWith('[')) {
    return 'https://via.placeholder.com/800x1000?text=LUSTRAX+JEWELRY';
  }

  // 4. Cloudinary Fetch logic
  // f_auto,q_auto: THE MAGIC for speed (WebP/AVIF + intelligent compression)
  const params = `f_auto,q_auto,w_${width},c_limit`;

  try {
    // For external URLs like Unsplash, we strip standard query params to avoid encoding issues
    // Cloudinary will re-apply formatting and quality automatically.
    const cleanUrl = url.includes('unsplash.com') ? url.split('?')[0] : url;
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${params}/${encodeURIComponent(cleanUrl)}`;
  } catch {
    return url;
  }
};
