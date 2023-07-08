const Product = require("../Models/productSchema");
const Review = require('../Models/reviewSchema')
const mongoose = require('mongoose')

module.exports = {
  //Adding new Products to database from admin side
  addProduct: (productData, imageDetails) => {
    const { productName, brand, productPrice, salePrice, stock, description } =
      productData;
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const isProduct = await Product.findOne({ name: productName });
        if (isProduct) {
          response.status = false;
          response.message = `${productName} already exists`;
          resolve(response);
        } else {
          const newProduct = new Product({
            productName,
            brand,
            productPrice,
            salePrice,
            stock,
            description,
            category: productData.category,
            subCategory: productData.subCategory,
            images: imageDetails.map((image) => {
              return {
                filename: image.filename,
              };
            }),
          });

          newProduct.save().then((product) => {
            response.status = true;
            response.message = `${product.productName} added Successfully`;
            response.newProduct = product;
            resolve(response);
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //editing Product from admin side
  editProduct: (productData) => {
    const { productName, brand, productPrice, salePrice, stock, description } =
      productData;
    return new Promise(async (resolve, reject) => {
      try {
          let updatedProduct = await Product.updateOne(
            { _id: productData.id },
            {
              productName,
              brand,
              productPrice,
              salePrice,
              stock,
              description,
              category: productData.category,
              subCategory: productData.subCategory,
            }
          );

        let response = {};
        if (updatedProduct) {
          response = {
            status: true,
            message: "Product Edited Successfully",
            product: updatedProduct,
          };
          resolve(response);
        } else {
          response = {
            status: false,
            message: "Product not found",
          };
          resolve(response);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  

  getProductReviews: (productId) => {
    return new Promise(async(resolve, reject) => {
      try {
        const proId = new mongoose.Types.ObjectId(productId)
        const productReviewAggregate = await Review.aggregate([
          {
            $match: { product: proId } // Replace 'productId' with the actual product ID
          },
          {
            $unwind: '$review'
          },
          {
            $lookup: {
              from: 'users',
              localField: 'review.user',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $project: {
              _id: 0,
              rating: '$review.rating',
              reviewText: '$review.review',
              userName: '$user.name',
              timestamp: '$review.timestamp'
            }
          }
        ]);
        
        
        
        
        resolve(productReviewAggregate)
      } catch (error) {
        console.log(error);
      }
    })
  }
};
