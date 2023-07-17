const mongoose = require("mongoose");

var variantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  variants: [
    {
      size: String,
      color: String,
      productPrice: Number,
      salePrice: Number,
      stock: Number,
    },
  ],
});

module.exports = mongoose.model("Variant", variantSchema);
