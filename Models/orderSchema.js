const mongoose = require("mongoose");

var orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    subTotal: String,
    discountAmount: String,
    totalAmount: String,
    paymentMethod: {
      type: String,
    },
    products: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
        },
        status: String,
        reason: String,
        date: {
          type: Date,
        },
      },
    ],
    deliveryAddress: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      phone: {
        type: String,
      },
      email: {
        type: String,
      },
      address1: {
        type: String,
      },
      address2: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      country: {
        type: String,
      },
      pincode: {
        type: String,
      },
      orderNotes: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
