const Variant = require("../Models/variantSchema");

module.exports = {
  getVariants: (productId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let sizes = await Variant.distinct("variants.size", { product: productId });
        let colors = await Variant.distinct("variants.color", { product: productId });
          resolve({ sizes, colors })
      } catch (error) {
          reject(error)
      }
    });
  },
};
