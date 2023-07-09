const Order = require('../Models/orderSchema')
const moment = require("moment");

module.exports = {
    dailySalesReport: () => {
        return new Promise(async(resolve, reject) => {
            try {
                const startDate = moment().subtract(7, "days").startOf("day"); // Start date: 7 days ago from today
                const endDate = moment().endOf("day"); // End date: today

                const salesReport = await Order.aggregate([
                {
                    $match: {
                    createdAt: {
                        $gte: startDate.toDate(),
                        $lte: endDate.toDate(),
                    },
                    },
                },
                {
                    $group: {
                    _id: {
                        $dateToString: { format: "%d-%m-%Y", date: "$createdAt" }, // Group by date
                    },
                    totalSales: { $sum: { $toDouble: "$totalAmount" } }, // Calculate total sales
                    totalOrders: { $sum: 1 }, // Count the number of orders
                    },
                },
                {
                    $sort: { _id: 1 }, // Sort by date in ascending order
                },
                {
                    $group: {
                    _id: null,
                    totalSalesAllDays: { $sum: "$totalSales" }, // Calculate total sales of all days
                    salesData: { $push: "$$ROOT" }, // Store the sales data for each day
                    },
                },
                {
                    $project: {
                    _id: 0,
                    totalSalesAllDays: 1,
                    salesData: 1,
                    },
                },
                ]);
                
                resolve(salesReport)
            } catch (error) {
                console.log(error);
            }
        })
    },

    monthlySalesReport: () => {
        return new Promise(async (resolve, reject) => {
          try {
            const startDate = moment().subtract(6, 'months').startOf('month'); // Start date: 6 months ago from the beginning of the current month
            const endDate = moment().endOf('month'); // End date: end of the current month
      
            const salesReport = await Order.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: startDate.toDate(),
                      $lte: endDate.toDate(),
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {
                        format: '%m-%Y', // Format the date as "Month Year"
                        date: '$createdAt',
                      },
                    },
                    totalSales: { $sum: { $toDouble: '$totalAmount' } }, // Calculate total sales
                    totalOrders: { $sum: 1 }, // Count the number of orders
                  },
                },
                {
                  $sort: { _id: 1 }, // Sort by month and year in ascending order
                },
                {
                  $group: {
                    _id: null,
                    totalSalesAllMonths: { $sum: '$totalSales' }, // Calculate total sales of all months
                    salesData: { $push: '$$ROOT' }, // Store the sales data for each month
                  },
                },
                {
                  $project: {
                    _id: 0,
                    totalSalesAllMonths: 1,
                    salesData: 1,
                  },
                },
              ]);
              
            resolve(salesReport);
          } catch (error) {
            console.log(error);
          }
        });
    },
    
    yearlySalesReport: () => {
        return new Promise(async (resolve, reject) => {
          try {
            const startDate = moment().subtract(3, 'years').startOf('year'); // Start date: 6 months ago from the beginning of the current month
            const endDate = moment().endOf('year'); // End date: end of the current month
      
            const salesReport = await Order.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: startDate.toDate(),
                      $lte: endDate.toDate(),
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {
                        format: '%Y', // Format the date as "Month Year"
                        date: '$createdAt',
                      },
                    },
                    totalSales: { $sum: { $toDouble: '$totalAmount' } }, // Calculate total sales
                    totalOrders: { $sum: 1 }, // Count the number of orders
                  },
                },
                {
                  $sort: { _id: 1 }, // Sort by month and year in ascending order
                },
                {
                  $group: {
                    _id: null,
                    totalSalesAllMonths: { $sum: '$totalSales' }, // Calculate total sales of all months
                    salesData: { $push: '$$ROOT' }, // Store the sales data for each month
                  },
                },
                {
                  $project: {
                    _id: 0,
                    totalSalesAllMonths: 1,
                    salesData: 1,
                  },
                },
              ]);
              
            resolve(salesReport);
          } catch (error) {
            console.log(error);
          }
        });
    },
    
    customSalesReport: (startDateISO,endDateISO) => {
        return new Promise(async (resolve, reject) => {
            try {
                const startDate = moment(startDateISO).startOf('day');
                const endDate = moment(endDateISO).endOf('day');
                const salesReport = await Order.aggregate([
                {
                  $match: {
                    createdAt: {
                      $gte: startDate.toDate(),
                      $lte: endDate.toDate(),
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      $dateToString: { format: '%d-%m-%Y', date: '$createdAt' }, // Group by date
                    },
                    totalSales: { $sum: { $toDouble: '$totalAmount' } }, // Calculate total sales
                    totalOrders: { $sum: 1 }, // Count the number of orders
                  },
                },
                {
                  $sort: { _id: 1 }, // Sort by date in ascending order
                },
                {
                  $group: {
                    _id: null,
                    totalSalesAllDays: { $sum: '$totalSales' }, // Calculate total sales of all days
                    salesData: { $push: '$$ROOT' }, // Store the sales data for each day
                  },
                },
                {
                  $project: {
                    _id: 0,
                    totalSalesAllDays: 1,
                    salesData: 1,
                  },
                },
              ]);
      
            resolve(salesReport);
          } catch (error) {
            console.log(error);
          }
        });
      },
      
}