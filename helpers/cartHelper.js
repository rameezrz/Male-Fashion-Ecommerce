const mongoose = require("mongoose");
const Cart = require("../Models/cartSchema");
const Product = require("../Models/productSchema");
const Variant = require("../Models/variantSchema");

module.exports = {
  addToCart: (userId, productId, variantId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let productObj = {
          item: productId,
          quantity: 1,
        };
        if (variantId != "") {
          productObj.variantId = variantId;
        }

        let userCart = await Cart.findOne({ user: userId });
        if (userCart) {
          let productExist;
          if (variantId != "") {
            productExist = userCart.products.findIndex(
              (product) =>
                product.item == productId && product.variantId == variantId
            );
            productObj.variantId = variantId;
          } else {
            productExist = userCart.products.findIndex(
              (product) => product.item == productId
            );
          }
          if (productExist != -1) {
            if (variantId != "") {
              Cart.updateOne(
                {
                  user: userId,
                  "products.item": productId,
                  "products.variantId": variantId,
                },
                {
                  $inc: { "products.$.quantity": 1 },
                }
              ).then((response) => {
                resolve(true);
              });
            } else {
              Cart.updateOne(
                { user: userId, "products.item": productId },
                {
                  $inc: { "products.$.quantity": 1 },
                }
              ).then((response) => {
                resolve(true);
              });
            }
          } else {
            Cart.findByIdAndUpdate(userCart._id, {
              $push: { products: productObj },
            }).then((response) => {
              resolve(true);
            });
          }
        } else {
          const newCart = new Cart({
            user: userId,
            products: productObj,
          });
          newCart.save().then((response) => {
            resolve(true);
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //display number of products from the cart in header section
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let length = 0;
        let cart = await Cart.findOne({ user: userId });
        if (cart) {
          length = cart.products.length;
          resolve(length);
        } else {
          resolve(length);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userObjId = new mongoose.Types.ObjectId(userId);

        let cartItems = await Cart.aggregate([
          {
            $match: { user: userObjId },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              productId: "$products.item",
              quantity: "$products.quantity",
              variantId: "$products.variantId",
              cartItem : "$products._id"
        
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              productId: 1,
              quantity: 1,
              variantId: 1,
              cartItem :1,
              product: { $arrayElemAt: ["$productDetails", 0] },
            },
          },
          {
            $lookup: {
              from: "variants",
              let: { productId: "$productId", variantId: "$variantId" }, // define variables for the current document's productId and variantId
              pipeline: [
                // specify a sub-pipeline that filters the variants collection
                {
                  $match: {
                    // use the $toString operator to compare both fields as strings
                    $expr: {
                      $eq: [
                        { $toString: "$product" }, // convert the product field to string
                        { $toString: "$$productId" } // convert the productId variable to string
                      ]
                    }
                  }
                },
                {
                  $project: {
                    // project only the variants array
                    variants: 1
                  }
                },
                {
                  $unwind: "$variants" // deconstruct the variants array into separate documents
                },
                {
                  $match: {
                    // use the $toString operator to compare both fields as strings
                    $expr: {
                      $eq: [
                        { $toString: "$variants._id" }, // convert the variants._id field to string
                        { $toString: "$$variantId" } // convert the variantId variable to string
                      ]
                    }
                  }
                },
                {
                  $project: {
                    // project only the matching variant object
                    variant: "$variants"
                  }
                }
              ],
          
              as: "variantDetails",
            },
          },
          {
            $project: {
              productId: 1,
              quantity: 1,
              variantId : 1,
              cartItem :1,
              product: 1,
              variants : { $arrayElemAt : ["$variantDetails.variant",0] }
            },
          },
        ]);
        resolve(cartItems);
      } catch (error) {
        reject(error);
      }
    });
  },

  //Increment or Decrement the quantity of the product in the cart
  changeProductQuantity: (cartData) => {
    const { cartId, productId, count, quantity, variantId } = cartData;
    return new Promise(async (resolve, reject) => {
      try {
        let cartItem;
        if (variantId != "") {
          cartItem = await Cart.findOne(
            { _id: cartId },
            {
              products: { $elemMatch: { variantId: variantId } },
            }
          );
        } else {
          cartItem = await Cart.findOne(
            { _id: cartId },
            {
              products: { $elemMatch: { item: productId } },
            }
          );
        }
        let stock;
        if (cartItem.products[0].variantId) {
          stock = await Variant.findOne(
            { product: productId },
            {
              variants: { $elemMatch: { _id: cartItem.products[0].variantId } },
            }
          );
          stock = stock.variants[0].stock;
        } else {
          stock = await Product.findOne(
            { _id: productId },
            { _id: 0, stock: 1 }
          );
          stock = stock.stock;
        }
        if (count == -1 && quantity == 1) {
          cannotDelete = true;
          resolve({ cannotDelete });
        } else if (count == 1 && quantity >= stock) {
          limitExceed = true;
          resolve({ limitExceed });
        } else {
          if (variantId != "") {
            await Cart.updateOne(
              { _id: cartId, "products.variantId": variantId },
              {
                $inc: { "products.$.quantity": count },
              }
            );
          } else {
            await Cart.updateOne(
              { _id: cartId, "products.item": productId },
              {
                $inc: { "products.$.quantity": count },
              }
            );
          }
          let cart;
          if (variantId != "") {
            cart = await Cart.findOne(
              { _id: cartId },
              {
                products: { $elemMatch: { variantId: variantId } },
              }
            );
          } else {
            cart = await Cart.findOne(
              { _id: cartId },
              {
                products: { $elemMatch: { item: productId } },
              }
            );
          }

          let quantity = cart.products[0].quantity;
          resolve(quantity);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //Remove Product from Cart
  removeProduct: (cartData) => {
    const { cartId, cartItem } = cartData;
    return new Promise(async (resolve, reject) => {
      try {
        await Cart.updateOne(
          { _id: cartId },
          {
            $pull: { products: { _id: cartItem } },
          }
        ).then(() => {
          resolve(true);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  //Get Total Cart Products Amount
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userObjId = new mongoose.Types.ObjectId(userId);
        // let totalAmount = await Cart.aggregate([
        //   {
        //     $match: { user: userObjId },
        //   },
        //   {
        //     $unwind: "$products",
        //   },
        //   {
        //     $project: {
        //       item: "$products.item",
        //       quantity: "$products.quantity",
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "products",
        //       localField: "item",
        //       foreignField: "_id",
        //       as: "productDetails",
        //     },
        //   },
        //   {
        //     $project: {
        //       item: 1,
        //       quantity: 1,
        //       product: { $arrayElemAt: ["$productDetails", 0] },
        //     },
        //   },
        //   {
        //     $group: {
        //       _id: null,
        //       total: {
        //         $sum: { $multiply: ["$quantity", "$product.salePrice"] },
        //       },
        //     },
        //   },
        // ]);

        let totalAmount = await Cart.aggregate([
          {
            $match: { user: userObjId },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              productId: "$products.item",
              quantity: "$products.quantity",
              variantId: "$products.variantId",
              cartItem: "$products._id",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "productId",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          {
            $project: {
              productId: 1,
              quantity: 1,
              variantId: 1,
              cartItem: 1,
              product: { $arrayElemAt: ["$productDetails", 0] },
            },
          },
          {
            $lookup: {
              from: "variants",
              let: { productId: "$productId", variantId: "$variantId" }, // define variables for the current document's productId and variantId
              pipeline: [
                // specify a sub-pipeline that filters the variants collection
                {
                  $match: {
                    // use the $toString operator to compare both fields as strings
                    $expr: {
                      $eq: [
                        { $toString: "$product" }, // convert the product field to string
                        { $toString: "$$productId" }, // convert the productId variable to string
                      ],
                    },
                  },
                },
                {
                  $project: {
                    // project only the variants array
                    variants: 1,
                  },
                },
                {
                  $unwind: "$variants", // deconstruct the variants array into separate documents
                },
                {
                  $match: {
                    // use the $toString operator to compare both fields as strings
                    $expr: {
                      $eq: [
                        { $toString: "$variants._id" }, // convert the variants._id field to string
                        { $toString: "$$variantId" }, // convert the variantId variable to string
                      ],
                    },
                  },
                },
                {
                  $project: {
                    // project only the matching variant object
                    variant: "$variants",
                  },
                },
              ],
        
              as: "variantDetails",
            },
          },
          {
            $project: {
              productId: 1,
              quantity: 1,
              variantId : 1,
              cartItem :1,
              product : 1,
              variants : { $arrayElemAt : ["$variantDetails.variant",0] }
            }
          },
          {
            $group : {
               _id : null, // group all documents into one
               total : { 
                 $sum : { 
                   $multiply : [ 
                     "$quantity", 
                     { 
                       $cond : [ 
                         // use a conditional expression to choose the price
                         { $gt : ["$variants", null] }, // if the variants field is not null, use it
                         "$variants.salePrice", 
                         "$product.salePrice" // otherwise, use the product salePrice
                       ] 
                     } 
                   ] 
                 } 
               }
            }
          }
        ]);
        resolve(totalAmount[0].total);
      } catch (error) {
        reject(error);
      }
    });
  },
};
