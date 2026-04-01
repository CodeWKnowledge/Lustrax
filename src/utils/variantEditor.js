/**
 * Computes the Cartesian product of an array of arrays.
 * Used for generating all possible variant combinations.
 * @param {Array} arrays - Array of option value arrays.
 * @returns {Array} - All combinations.
 */
export const cartesianProduct = (arrays) => {
  return arrays.reduce((a, b) => 
    a.flatMap(d => b.map(e => [d, e].flat()))
  , [[]]);
};

/**
 * Generates initial variant objects from variant options.
 * @param {Array} options - Array of { name, values } objects.
 * @param {number} basePrice - Product base price.
 * @returns {Array} - Array of variant objects.
 */
export const generateVariants = (options, basePrice) => {
  if (!options || options.length === 0) return [];
  
  const names = options.map(o => o.name);
  const values = options.map(o => o.values);
  
  const combinations = cartesianProduct(values);
  
  return combinations.map(combo => {
    const attributes = {};
    names.forEach((name, i) => {
      attributes[name.toLowerCase()] = combo[i];
    });
    
    return {
      attributes,
      stock_quantity: 1,
      price: basePrice, // Initial price calculation happens later based on adjustments
      is_overridden: false,
      manual_price: null
    };
  });
};

/**
 * Calculates the final price for a variant combination.
 * @param {number} basePrice - Base price of the product.
 * @param {Object} attributes - Selected attributes for the variant.
 * @param {Array} priceRules - Array of { variant_name, value, price_adjustment } objects.
 * @returns {number} - Calculated price.
 */
export const calculateAutoPrice = (basePrice, attributes, priceRules) => {
  let adjustmentSum = 0;
  
  priceRules.forEach(rule => {
    const attrKey = rule.variant_name.toLowerCase();
    if (attributes[attrKey] === rule.value) {
      adjustmentSum += parseFloat(rule.price_adjustment) || 0;
    }
  });
  
  return parseFloat(basePrice) + adjustmentSum;
};
