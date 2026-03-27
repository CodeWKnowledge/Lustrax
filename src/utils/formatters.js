/**
 * LUSTRAX JEWELRIES - FORMATTING UTILITIES 
 * 
 * Centralized logic for maintaining consistency across the luxury platform.
 */

/**
 * Formats a numeric value into a localized currency string.
 * @param {number|string} amount 
 * @param {string} locale - Default is 'en-US'
 * @param {string} currency - Default is 'USD'
 * @returns {string}
 */
export const formatCurrency = (amount, locale = 'en-NG', currency = 'NGN') => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return '₦0';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};


/**
 * Formats a date string into a luxury-inspired readable format.
 * Example: 24 MAR 2026, 12:45
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatLuxuryDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  };
  
  const datePart = d.toLocaleDateString('en-GB', options).toUpperCase();
  const timePart = d.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  return `${datePart}, ${timePart}`;
};

/**
 * Truncates a string with luxury-style indicators if needed.
 * @param {string} str 
 * @param {number} length 
 * @returns {string}
 */
export const truncateLuxury = (str, length = 12) => {
  if (!str) return '---';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};
