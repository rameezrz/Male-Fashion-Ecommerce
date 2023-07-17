const mongoose = require('mongoose')
const Order = require('../Models/orderSchema')
const Cart = require('../Models/cartSchema')
const Address = require('../Models/addressSchema')
const Product = require('../Models/productSchema')
const Wallet = require('../Models/walletSchema')
const Variant = require('../Models/variantSchema')
const Razorpay = require('razorpay') 
const crypto = require('crypto')

module.exports = {
    // placing order AJAX function
    placeOrder: (order, products, totalAmount) => {
        return new Promise(async(resolve, reject) => {
            try {
                let status = order.paymentMethod === 'COD' || order.paymentMethod === 'WALLET'? 'Placed' : 'Pending'
                let isSave = order.isSave === 'on' ? true : false
                let isSavedAddress = order.savedAddress ? true : false
                let deliveryAddress =  {
                    firstName: order.firstName,
                    lastName: order.lastName,
                    phone: order.phone,
                    email: order.email,
                    address1: order.address1,
                    address2: order.address2,
                    city: order.city,
                    state: order.state,
                    country: order.country,
                    pincode: order.pincode,
                    orderNotes: order.orderNotes
                }

                if (isSavedAddress) {
                    let user = await Address.findOne({ 'deliveryAddress._id': order.savedAddress }, { 'deliveryAddress.$': 1 });
                    deliveryAddress = user.deliveryAddress[0]
                }

                if (isSave) {
                    let isAddress = await Address.findOne({ user: order.userId })
                    if (isAddress) {
                        await Address.findOneAndUpdate({ user: order.userId }, {
                            $push:{deliveryAddress}
                        })
                    } else {
                        let newAddress = new Address({
                            user: order.userId,
                            deliveryAddress
                        })
                        newAddress.save()
                    }
              }
              
              const isCoupon = await Cart.findOne({ user: order.userId })
              let coupon = new mongoose.Types.ObjectId();
              let subTotal = ''
              let discountAmount = ''
              if (isCoupon.coupon) {
                coupon = isCoupon.coupon
                subTotal = isCoupon.subTotal
                discountAmount = isCoupon.discountAmount
                totalAmount = isCoupon.totalAmount
              }
                
                let newOrder = new Order({
                    user: order.userId,
                  paymentMethod: order.paymentMethod,
                  coupon,
                  subTotal,
                    discountAmount,
                    totalAmount,
                    products: products.map(product => ({
                      ...product,
                        status: status,
                        reason: '',
                      date:Date.now()
                    })),
                    deliveryAddress
                  });
                  
              newOrder.save().then(async (response) => {
                if (status === 'Placed') {
                  await Cart.findOneAndRemove({ user: order.userId })
                  const decreaseStock = products.map((product) => ({
                      updateOne: {
                        filter: { _id: product.item },
                        update: {
                          $inc: { stock: -product.quantity }
                        }
                      }
                  }));
                  const decreaseVariantStock = async (productId, variantId, quantity) => {
                    try {
                      await Variant.updateOne(
                        { product: productId, "variants._id": variantId },
                        { $inc: { "variants.$.stock": -quantity } }
                      );
                    } catch (error) {
                      console.error("Error decreasing variant stock:", error);
                    }
                  };
                  
                  await Product.bulkWrite(decreaseStock)
                  products.forEach(product => {
                    if (product.variantId) {
                      decreaseVariantStock(product.item,product.variantId,product.quantity)
                    }
                  });
                }
                
                if (order.paymentMethod === 'WALLET') {
                  await Wallet.updateOne({ user: order.userId }, {
                    $inc: { balance: -totalAmount },
                    $push: {
                      transactions: {
                        type: 'debit',
                        amount: totalAmount,
                        timestamp: Date.now()
                      }
                    }
                  })
                }

                  let orderDetails = {
                    orderId: response._id,
                    totalAmount : response.totalAmount
                  }
                    resolve(orderDetails)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    
    //get order product details from product collection
    getOrderProducts: (orderId) => {
        return new Promise(async(resolve, reject) => {
            try {
                const orderObjId = new mongoose.Types.ObjectId(orderId);
        
              
        let orderItems = await Order.aggregate([
          {
            $match: { _id: orderObjId },
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
              status: '$products.status',
              reason: '$products.reason',
              date: '$products.date',
              rating: '$products.rating',
              review: '$products.review',
        
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
              status:1,reason:1,date:1,rating:1,review:1,
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
              status:1,reason:1,date:1,rating:1,review:1,
              variants : { $arrayElemAt : ["$variantDetails.variant",0] }
            },
          },
        ]);
                resolve(orderItems)
            } catch (error) {
                reject(error)
            }
        })
    },

    //cancel order products
    cancelOrderProducts: (order) => {
        return new Promise(async(resolve, reject) => {
          try {
              console.log(order);
                let orderDB = await Order.findOneAndUpdate({ _id: order.orderId,'products._id':order.cartItem }, {
                    $set: {
                        'products.$.status': 'Cancelled',
                        'products.$.reason':order.reason,
                        'products.$.date':Date.now()
                    }
                })
              console.log(orderDB);
              if (orderDB.paymentMethod != 'COD') {
                const discountAmount = orderDB.discountAmount
                const productId = orderDB.products[0].item
                const quantity = orderDB.products[0].quantity
                const product = await Product.findById(productId)
                let walletAmount = 0
                if (discountAmount != '') {
                  walletAmount = (product.salePrice*quantity)-discountAmount
                } else {
                  walletAmount = (product.salePrice*quantity)
                }
                await Wallet.updateOne(
                  { user: orderDB.user },
                  {
                    $inc: { balance: walletAmount },
                    $push: {
                      transactions: {
                        type: 'credit',
                        amount: walletAmount,
                        timestamp: Date.now()
                      }
                    }
                  }
                );
              }
              
            const quantity = parseInt(order.quantity)
            if (order.variantId != '') {
              await Variant.findOneAndUpdate(
                { product: order.productId, 'variants._id': order.variantId },
                { $inc: { 'variants.$.stock': quantity } }
              );
              await Product.findOneAndUpdate({ _id: order.productId }, {
                $inc:{stock:quantity}
              })
            } else {
              await Product.findOneAndUpdate({ _id: order.productId }, {
                $inc:{stock:quantity}
              })
            }
                resolve()
            } catch (error) {
                reject(error)
            }
        })
  },
    
    //cancel order products
    returnOrderProducts: (order) => {
      return new Promise(async(resolve, reject) => {
          try {
              let orderDB = await Order.findOneAndUpdate({ _id: order.orderId,'products._id':order.cartItem }, {
                  $set: {
                      'products.$.status': 'Returned',
                      'products.$.reason':order.reason,
                      'products.$.date':Date.now()
                  }
              })
              const discountAmount = orderDB.discountAmount
              const productId = orderDB.products[0].item
              const orderQuantity = orderDB.products[0].quantity
              const product = await Product.findById(productId)
              let walletAmount = 0
              if (discountAmount != '') {
                walletAmount = (product.salePrice*orderQuantity)-discountAmount
              } else {
                walletAmount = (product.salePrice*orderQuantity)
              }
              await Wallet.updateOne(
                { user: orderDB.user },
                {
                  $inc: { balance: walletAmount },
                  $push: {
                    transactions: {
                      type: 'credit',
                      amount: walletAmount,
                      timestamp: Date.now()
                    }
                  }
                }
              );
            
              const quantity = parseInt(order.quantity)
              if (order.variantId != '') {
                await Variant.findOneAndUpdate(
                  { product: order.productId, 'variants._id': order.variantId },
                  { $inc: { 'variants.$.stock': quantity } }
                );
                await Product.findOneAndUpdate({ _id: order.productId }, {
                  $inc:{stock:quantity}
                })
              } else {
                await Product.findOneAndUpdate({ _id: order.productId }, {
                  $inc:{stock:quantity}
                })
              }
              resolve()
          } catch (error) {
              reject(error)
          }
      })
},
    
    //Generate Razorpay payment function
  generateRazorpay: (orderDetails) => {
    return new Promise((resolve, reject) => {
        try {
          var instance = new Razorpay({
            key_id: process.env.RAZOR_KEY_ID,
            key_secret: process.env.RAZOR_SECRET_KEY
          })

          let options = {
            amount: orderDetails.totalAmount*100,
            currency: "INR",
            receipt: String(orderDetails.orderId)
          }
          instance.orders.create(options, (err, order) => {
            console.log(order);
            resolve(order)
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
  },
  
  //verify Razorpay payment
  verifyPayment: (paymentDetails) => {
    return new Promise((resolve, reject) => {
      try {
        let hmac = crypto.createHmac('sha256', process.env.RAZOR_SECRET_KEY)
        hmac.update(paymentDetails.razorpay_order_id + '|' + paymentDetails.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if (hmac == paymentDetails.razorpay_signature) {
          resolve()
        } else {
          reject()
        }
      } catch (error) {
        
      }
    })
  },

  //Change Order Status
  changeOrderStatus: (orderId,userId) => {
    return new Promise(async(resolve, reject) => {
      try {
        await Order.updateOne({ _id: orderId }, {
          $set: {
            "products.$[].status": "Placed"
          }
        }).then(async() => {
          await Cart.findOneAndRemove({user:userId})
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}