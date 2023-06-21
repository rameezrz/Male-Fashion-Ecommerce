const mongoose = require('mongoose')
const Order = require('../Models/orderSchema')
const Cart = require('../Models/cartSchema')
const Address = require('../Models/addressSchema')
const Product = require('../Models/productSchema')

module.exports = {
    // placing order AJAX function
    placeOrder: (order, products, totalAmount) => {
        return new Promise(async(resolve, reject) => {
            try {
                let status = order.paymentMethod === 'COD' ? 'Placed' : 'Pending'
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
                console.log(deliveryAddress);

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
                
                let newOrder = new Order({
                    user: order.userId,
                    paymentMethod: order.paymentMethod,
                    totalAmount,
                    products: products.map(product => ({
                      ...product,
                        status: status,
                        reason: '',
                      date:Date.now()
                    })),
                    deliveryAddress
                  });
                  
                newOrder.save().then(async() => {
                    await Cart.updateOne({ user: order.userId }, {
                        $unset: { products: 1 }
                    });

                    const decreaseStock = products.map((product) => ({
                        updateOne: {
                          filter: { _id: product.item },
                          update: {
                            $inc: { stock: -product.quantity }
                          }
                        }
                      }));

                    await Product.bulkWrite(decreaseStock)
                    resolve()
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
            $match: { _id: orderObjId }
          },
          {
            $unwind:'$products'
          }, {
            $project: {
              item: '$products.item',
              quantity:'$products.quantity',
                status: '$products.status',
                reason: '$products.reason',
                date: '$products.date',
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
              item: 1, quantity: 1, status:1,reason:1,date:1, product: { $arrayElemAt:['$productDetails',0]}
            }
          }
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
                await Order.findOneAndUpdate({ _id: order.orderId,'products.item':order.itemId }, {
                    $set: {
                        'products.$.status': 'Cancelled',
                        'products.$.reason':order.reason,
                        'products.$.date':Date.now()
                    }
                })
                const quantity = parseInt(order.quantity)
                await Product.findOneAndUpdate({ _id: order.itemId }, {
                    $inc:{stock:quantity}
                })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }
}