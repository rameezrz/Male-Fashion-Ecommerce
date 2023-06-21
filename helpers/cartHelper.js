const mongoose = require('mongoose')
const Cart = require("../Models/cartSchema");
const Product = require('../Models/productSchema')



module.exports = {
  addToCart: (userId, productId) => {
    let productObj = {
      item: productId,
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      try {
        let userCart = await Cart.findOne({ user: userId });
        if (userCart) {
          let productExist = userCart.products.findIndex(
            (product) => product.item == productId
          );
          if (productExist != -1) {
            Cart.updateOne(
              {user:userId, "products.item": productId },
              {
                $inc: { "products.$.quantity": 1 },
              }
            ).then((response) => {
              resolve(true);
            });
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
        let cart = await Cart.findOne({ user: userId })
        if (cart) {
          length = cart.products.length
          resolve(length)
        }
      } catch (error) {
          reject(error)
      }
    })
  },
  
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userObjId = new mongoose.Types.ObjectId(userId);
        
        let cartItems = await Cart.aggregate([
          {
            $match: { user: userObjId }
          },
          {
            $unwind:'$products'
          }, {
            $project: {
              item: '$products.item',
              quantity:'$products.quantity'
            }
          }, {
            $lookup: {
              from: 'products',
              localField: 'item',
              foreignField: '_id',
              as:'productDetails'
            }
          }, {
            $project: {
              item: 1, quantity: 1, product: { $arrayElemAt:['$productDetails',0]}
            }
          }
        ]);
        resolve(cartItems);
      } catch (error) {
        reject(error);
      }
    });
  },

  //Increment or Decrement the quantity of the product in the cart
  changeProductQuantity: (cartData) => {
    const { cartId, productId, count, quantity } = cartData
    return new Promise(async(resolve, reject) => {
      try {
        const {stock} = await Product.findOne({ _id: productId }, { _id: 0, stock: 1 })
        console.log(stock);
        if (count == -1 && quantity == 1) {
            cannotDelete=true
            resolve({cannotDelete})
        } else if(count == 1 && quantity>=stock){
          limitExceed = true
          resolve({limitExceed})
        } else {
          await Cart.updateOne({ _id: cartId,"products.item":productId }, {
            $inc:{"products.$.quantity":count}
          })
          let cart = await Cart.findOne({ _id: cartId }, {
            'products' : {$elemMatch : {item:productId}}
          })
          let quantity=cart.products[0].quantity
          resolve(quantity)
        }
      } catch (error) {
        reject(error)
      }
    })
  },

  //Remove Product from Cart
  removeProduct: (cartData) => {
    const { cartId, productId } = cartData
    return new Promise(async(resolve, reject) => {
      try {
        await Cart.updateOne({ _id: cartId }, {
          $pull:{products:{item:productId}}
        }).then(() => {
          resolve(true)
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  //Get Total Cart Products Amount
  getTotalAmount: (userId) => {
    return new Promise(async(resolve, reject) => {
      try {
        const userObjId = new mongoose.Types.ObjectId(userId);
        let totalAmount = await Cart.aggregate([
          {
            $match: { user: userObjId }
          },
          {
            $unwind:'$products'
          }, {
            $project: {
              item: '$products.item',
              quantity:'$products.quantity'
            }
          }, {
            $lookup: {
              from: 'products',
              localField: 'item',
              foreignField: '_id',
              as:'productDetails'
            }
          }, {
            $project: {
              item: 1, quantity: 1, product: { $arrayElemAt:['$productDetails',0]}
            }
          },{
            $group: {
                _id: null,
              total:{$sum:{$multiply:['$quantity','$product.salePrice']}}
              }
            }
        ]);
        resolve(totalAmount[0].total);
      } catch (error) {
        reject(error)
      }
    })
  }
};
