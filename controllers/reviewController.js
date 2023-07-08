const Review = require('../Models/reviewSchema')
const Order = require('../Models/orderSchema')

const addReview = async(req, res) => {
    try {
        const userId = req.session.user._id
        const { productId, orderId, rating, review } = req.body
        const reviewObj = [
            {
                user: userId,
                orderId,
                rating,
                review
            }
        ]
        const isReview = await Review.findOne({ product: productId })
        if (isReview) {
            await Review.findOneAndUpdate({ product: productId }, {
                $push:{review:reviewObj}
            }).then(async() => {
                await addReviewToOrder(orderId,productId, rating, review)
                res.json({status:true,message:'Review Added Successfully'})
            })
        } else {
            const newReview = new Review({
                product: productId,
                review: reviewObj
            })
            newReview.save().then(async() => {
                await addReviewToOrder(orderId,productId, rating, review)
                res.json({status:true,message:'Review Added Successfully'})
            })
        }
    } catch (error) {
        console.log(error);
    }
}

const fetchReview = async (req, res) => {
    try {
        const {orderId, productId} = req.params
        const review = await Review.findOne(
            {
              product: productId,
              review: {
                $elemMatch: { orderId: orderId }
              }
            },
            { 'review.$': 1 }
          );
          
        res.json(review)
    } catch (error) {
        console.log(error);
    }
}

const editReview = async (req, res) => {
  try {
    console.log(req.body);
    const { productId, orderId, review, rating } = req.body
    const userId = req.session.user._id
    await Review.updateOne(
      {
        product: productId,
        'review.user': userId
      },
      {
        $set: {
          'review.$.rating': rating,
          'review.$.review': review
        }
      }
    ).then(async () => {
      await Order.updateOne({ _id: orderId, 'products.item':productId }, {
        $set: {
          'products.$.rating': rating,
          'products.$.review': review
        }
      })
    })
    res.json(true)
  } catch (error) {
    console.log(error);
  }
}

const deleteReview = async(req, res) => {
    try {
        console.log(req.body);
        const { productId,orderId } = req.body
        const userId = req.session.user._id
        await Review.updateOne({ product: productId }, {
            $pull: { review: { user:userId}}
        }).then(async() => {
            await Order.updateOne(
                { _id: orderId, 'products.item': productId },
                {
                  $unset: {
                    'products.$.rating': '',
                    'products.$.review': ''
                  }
                }
              );
        })
        res.json("success")
    } catch (error) {
        console.log(error);
    }
}

const addReviewToOrder = async (orderId, productId, rating, review) => {
    try {
      await Order.updateOne(
        {
          _id: orderId,
          "products.item": productId
        },
        {
          $set: {
            "products.$.rating": rating,
            "products.$.review": review
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  };
  

module.exports = {
    addReview,
  fetchReview,
  editReview,
    deleteReview
}