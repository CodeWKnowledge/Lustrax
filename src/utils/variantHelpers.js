/**
 * LUSTRAX VARIANT INTELLIGENCE UTILITY
 * 
 * Centralized logic for matching attribute selections to product variants
 * and managing the complex price inheritance model.
 */

/**
 * Finds a matching variant from a list based on selected attributes.
 * @param {Array} variants - List of variant objects from the DB
 * @param {Object} selectedAttributes - Key-value pair of current selections (e.g. {Size: "20", Color: "Gold"})
 * @returns {Object|null} - The matching variant or null
 */
export const findMatchingVariant = (variants, selectedAttributes) => {
  if (!variants || !selectedAttributes) return null;
  
  // Identify all attribute keys that actually exist for this product (e.g. ['Size', 'Color'])
  const allAttrNames = Array.from(new Set(variants.flatMap(v => Object.keys(v.attributes))));
  
  // Only search if the user has selected EVERY mandatory attribute
  const selectedKeys = Object.keys(selectedAttributes);
  if (selectedKeys.length < allAttrNames.length) return null;

  return variants.find(variant => {
    return Object.entries(selectedAttributes).every(([key, value]) => {
      // Direct comparison of stringified attributes from JSONB
      return String(variant.attributes[key]) === String(value);
    });
  }) || null;
};

/**
 * Resolves the "Inherited Price" for a product/variant.
 * Prioritizes the variant's price_override, falling back to the base product price.
 * 
 * @param {Object} product - Base product object
 * @param {Object} variant - Currently selected variant object (optional)
 * @returns {number} - The final numeric price
 */
export const getEffectivePrice = (product, variant) => {
  if (!product) return 0;
  
  // If a variant is selected and has an override, use it.
  // Otherwise, use the base product price.
  const price = (variant && variant.price_override !== null && typeof variant.price_override !== 'undefined')
    ? variant.price_override 
    : product.price;

  return Number(price);
};

/**
 * Extracts unique attribute options from a collection of variants.
 * Used for building dynamic selection UIs.
 */
export const getVariantOptions = (variants) => {
  if (!variants || variants.length === 0) return {};
  
  const options = {};
  variants.forEach(v => {
    Object.entries(v.attributes).forEach(([key, val]) => {
      if (!options[key]) options[key] = new Set();
      options[key].add(val);
    });
  });

  // Convert Sets to Arrays for easier rendering
  const mappedOptions = {};
  Object.keys(options).forEach(key => {
    mappedOptions[key] = Array.from(options[key]);
  });
  
  return mappedOptions;
};
