const Order = require("../Models/orderSchema");
const Product = require("../Models/productSchema");
const User = require("../Models/userSchema");
const Category = require("../Models/categorySchema");

const findCategory = async() => {
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
}

const getChartData = async() => {
    try {
        
        const aggregatePipeline = [
            {
              $facet: {
                revenue: [
                  {
                    $group: {
                      _id: { $month: "$createdAt" },
                      monthlyRevenue: { $sum: { $toDouble: "$totalAmount" } }
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      monthlyRevenues: {
                        $push: {
                          month: { $toInt: "$_id" },
                          revenue: "$monthlyRevenue"
                        }
                      }
                    }
                  },
                  {
                    $project: {
                      _id: 0,
                      monthlyRevenues: {
                        $map: {
                          input: Array.from({ length: 12 }, (_, i) => i + 1),
                          as: "month",
                          in: {
                            month: "$$month",
                            revenue: {
                              $filter: {
                                input: "$monthlyRevenues",
                                as: "mr",
                                cond: { $eq: ["$$mr.month", "$$month"] }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  {
                    $unwind: "$monthlyRevenues"
                  },
                  {
                    $replaceRoot: {
                      newRoot: "$monthlyRevenues"
                    }
                  },
                  {
                    $sort: { month: 1 }
                  },
                  {
                    $project: {
                      month: 1,
                      revenue: {
                        $cond: [
                          { $eq: [{ $size: "$revenue" }, 0] },
                          0,
                          { $arrayElemAt: ["$revenue.revenue", 0] }
                        ]
                      }
                    }
                  }
                ],
                monthlyOrders: [
                  {
                    $group: {
                      _id: { $month: "$createdAt" },
                      orderCount: { $sum: 1 }
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      monthlyOrders: {
                        $push: {
                          month: { $toInt: "$_id" },
                          orderCount: "$orderCount"
                        }
                      }
                    }
                  },
                  {
                    $project: {
                      _id: 0,
                      monthlyOrders: {
                        $map: {
                          input: Array.from({ length: 12 }, (_, i) => i + 1),
                          as: "month",
                          in: {
                            month: "$$month",
                            orderCount: {
                              $reduce: {
                                input: "$monthlyOrders",
                                initialValue: 0,
                                in: {
                                  $cond: [
                                    { $eq: ["$$this.month", "$$month"] },
                                    "$$this.orderCount",
                                    "$$value"
                                  ]
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  {
                    $unwind: "$monthlyOrders"
                  },
                  {
                    $replaceRoot: {
                      newRoot: "$monthlyOrders"
                    }
                  },
                  {
                    $sort: { month: 1 }
                  }
                ],
                canceledOrders: [
                  {
                    $match: { "products.status": "Cancelled" }
                  },
                  {
                    $group: {
                      _id: { $month: "$createdAt" },
                      canceledOrderCount: { $sum: 1 }
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      monthlyCanceledOrders: {
                        $push: {
                          month: { $toInt: "$_id" },
                          canceledOrderCount: "$canceledOrderCount"
                        }
                      }
                    }
                  },
                 {
                    $project: {
                      _id: 0,
                      monthlyCanceledOrders: {
                        $map: {
                          input: Array.from({ length: 12 }, (_, i) => i + 1),
                          as: "month",
                          in: {
                            month: "$$month",
                            canceledOrderCount: {
                              $reduce: {
                                input: "$monthlyCanceledOrders",
                                initialValue: 0,
                                in: {
                                  $cond: [
                                    { $eq: ["$$this.month", "$$month"] },
                                    "$$this.canceledOrderCount",
                                    "$$value"
                                  ]
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  {
                    $unwind: "$monthlyCanceledOrders"
                  },
                  {
                    $replaceRoot: {
                      newRoot: "$monthlyCanceledOrders"
                    }
                  },
                  {
                    $sort: { month: 1 }
                  }
                ]
              }
            }
          ];
          
          const [result] = await Order.aggregate(aggregatePipeline);
          const { revenue, monthlyOrders, canceledOrders } = result;
        const categories = await findCategory()
        return {categories,revenue,monthlyOrders,canceledOrders}
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
          const categories = await findCategory()
        resolve({ ordersCount, productsCount, usersCount, revenue, orders,categories });
      } catch (error) {
        reject(error);
      }
    });
    },
    getChartData,
};




