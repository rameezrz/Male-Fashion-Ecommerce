const Cart = require("../Models/cartSchema");
const Order = require("../Models/orderSchema");
const Coupon = require('../Models/couponSchema')
const cartHelper = require("../helpers/cartHelper");
const orderHelper = require("../helpers/orderHelper");

// placing order AJAX function
const placeOrder = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const order = req.body;
    let cart = await Cart.findOne({ user: userId });
    let totalAmount = await cartHelper.getTotalAmount(userId);
    orderHelper
      .placeOrder(order, cart.products, totalAmount)
      .then((orderDetails) => {
        if (req.body.paymentMethod === "COD" || req.body.paymentMethod === "WALLET") {
          res.json({ placed: true });
        } else {
          orderHelper.generateRazorpay(orderDetails).then((response) => {
            console.log('razorpay called');
            res.json({placed:false, response});
          });
        }
      });
  } catch (error) {
    console.log(error);
  }
};

//verifying Razorpay Payment
const verifyPayment = (req, res) => {
  try {
    orderHelper.verifyPayment(req.body).then(() => {
      orderHelper.changeOrderStatus(req.body.receipt,req.session.user._id).then(() => {
        res.json({placed:true})
      })
    }).catch(() => {
      res.json({placed:false})
    })
  } catch (error) {
    console.log(error);
  }
};

// display Order Success
const orderSuccess = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const user = req.session.user;
    const activeMenuItem = "/shop";
    const order = await Order.findOne({}, {}, { sort: { createdAt: -1 } })
    let cartCount = 0;
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id);
    }
    res.render("user/orderSuccess", {
      isUserLoggedIn,
      userName,
      activeMenuItem,
      cartCount,
      order,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

//display Orders page
const displayOrders = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const user = req.session.user;
    const activeMenuItem = "/home";
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    let cartCount = 0;
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id);
    }
    res.render("user/orders", {
      userName,
      isUserLoggedIn,
      activeMenuItem,
      cartCount,
      user,
      orders,
      layout: "layouts/profileLayout",
      activeMenuItem: "/orders",
    });
  } catch (error) {
    console.log(error);
  }
};

//display Detailed Order Page
const orderDetails = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const user = req.session.user;
    const activeMenuItem = "/home";
    let cartCount = 0;
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id);
    }
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    let coupon = ''
    if (order.discountAmount !== '') {
      coupon = await Coupon.findById(order.coupon)
    }
    const orderItems = await orderHelper.getOrderProducts(orderId);
    console.log(orderItems);
    res.render("user/orderDetails", {
      userName,
      isUserLoggedIn,
      activeMenuItem,
      cartCount,
      user,
      order,
      coupon,
      orderItems,
    });
  } catch (error) {
    console.log(error);
  }
};

//cancel products from the order
const cancelOrder = async (req, res) => {
  try {
    await orderHelper.cancelOrderProducts(req.body);
    res.json(true);
  } catch (error) {
    console.log(error);
  }
};


//return products from the order
const returnOrder = async (req, res) => {
  try {
    await orderHelper.returnOrderProducts(req.body);
    res.json(true);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  placeOrder,
  verifyPayment,
  orderSuccess,
  displayOrders,
  orderDetails,
  cancelOrder,
  returnOrder
};
