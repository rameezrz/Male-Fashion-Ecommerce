const mongoose = require('mongoose')
const Wishlist = require('../Models/wishlistSchema')

module.exports = {
    addToWishlist: (userId,productId) => {
        return new Promise(async(resolve, reject) => {
            try {
                let wishlistUser = await Wishlist.findOne({ user: userId })
                if (wishlistUser) {
                    let productExist = wishlistUser.products.findIndex(
                        (product) => product.item == productId
                      );
                      if (productExist != -1) {
                          resolve(false);
                      } else {
                        Wishlist.findByIdAndUpdate(wishlistUser._id, {
                          $push: { products: {item:productId} },
                        }).then((response) => {
                          resolve(true);
                        });
                      }  
                } else {
                    const newWishlist = new Wishlist({
                        user: userId,
                        products: [
                            {
                                item:productId
                            }
                        ]
                    })
                    newWishlist.save().then(() => {
                        resolve(true)
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    },

    getWishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            const userObjId = new mongoose.Types.ObjectId(userId);
            
            let wishlistItems = await Wishlist.aggregate([
              {
                $match: { user: userObjId }
              },
              {
                $unwind:'$products'
              }, {
                $project: {
                  item: '$products.item',
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
                  item: 1, product: { $arrayElemAt:['$productDetails',0]}
                }
              }
            ]);
            resolve(wishlistItems);
          } catch (error) {
            reject(error);
          }
        });
    },
    
     //Remove Product from Cart
  removeProduct: (WishlistData) => {
    const { wishlistId, productId } = WishlistData
    return new Promise(async(resolve, reject) => {
      try {
        await Wishlist.updateOne({ _id: wishlistId }, {
          $pull:{products:{item:productId}}
        }).then(() => {
          resolve(true)
        })
      } catch (error) {
        reject(error)
      }
    })
  },
}