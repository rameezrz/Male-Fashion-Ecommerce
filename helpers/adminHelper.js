const Order = require("../Models/orderSchema");
const Product = require("../Models/productSchema");
const User = require("../Models/userSchema");
const Category = require("../Models/categorySchema");

const hello = () => {
    console.log('hello world');
}

const getCategories = async() => {
    try {
        let categories = await Category.aggregate([
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "category",
                as: "products"
              }
            },
            {
              $project: {
                name: 1,
                productCount: { $size: "$products" }
              }
            }
        ]);
        return categories
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
  getDashboardData: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const ordersCount = await Order.find().count();
        const productsCount = await Product.find().count();
        const usersCount = await User.find().count();
        const orders = await Order.find().sort({ createdAt: -1 }).limit(6);
        let revenue = await Order.aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: { $toDouble: "$totalAmount" } },
            },
          },
        ]);
        revenue = revenue[0].totalAmount;

        let categories = await getCategories()
          
          
          


        resolve({ ordersCount, productsCount, usersCount, revenue, orders,categories });
      } catch (error) {
        reject(error);
      }
    });
    },
    getCategories,
    hello
};




