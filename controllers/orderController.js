const Cart = require('../Models/cartSchema')
const Order = require('../Models/orderSchema')
const cartHelper = require('../helpers/cartHelper')
const orderHelper = require('../helpers/orderHelper')

// placing order AJAX function
const placeOrder = async(req, res) => {
    try {
        const userId = req.session.user._id
        const order = req.body
        console.log(order);
        let cart = await Cart.findOne({ user: userId })
        let totalAmount = await cartHelper.getTotalAmount(userId)
        orderHelper.placeOrder(order, cart.products, totalAmount).then(() => {
            res.json({status:true})
        })
    } catch (error) {
        console.log(error);
    }
}

// display Order Success
const orderSuccess = async(req, res) => {
    try {
        const isUserLoggedIn = req.session.isUserLoggedIn || false;
        const userName = isUserLoggedIn ? req.session.userName : "";
        const user = req.session.user
        const activeMenuItem = "/shop";
        
        
        let cartCount = 0
        if (isUserLoggedIn) {
        cartCount = await cartHelper.getCartCount(req.session.user._id)
        }
        res.render('user/orderSuccess',{ isUserLoggedIn, userName, activeMenuItem, cartCount,user})
    } catch (error) {
        console.log(error);
    }
}

//display Orders page
const displayOrders = async(req, res) => {
    try {
      const isUserLoggedIn = req.session.isUserLoggedIn || false;
      const userName = isUserLoggedIn ? req.session.userName : "";
      const user=req.session.user
      const activeMenuItem = "/home";
      const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
      let cartCount = 0
      if (isUserLoggedIn) {
        cartCount = await cartHelper.getCartCount(req.session.user._id)
      }
      res.render("user/orders", {
        userName, isUserLoggedIn,
        activeMenuItem, cartCount, user, orders,
        layout: "layouts/profileLayout",
        activeMenuItem:"/orders"
      });
    } catch (error) {
      console.log(error);
    }
}
  
//display Detailed Order Page
const orderDetails = async(req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const user=req.session.user
    const activeMenuItem = "/home";
    let cartCount = 0
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id)
    }
    const orderId = req.params.id
    const order = await Order.findById(orderId)
    const orderItems = await orderHelper.getOrderProducts(orderId)
    res.render("user/orderDetails", { userName, isUserLoggedIn, activeMenuItem, cartCount,user,order,orderItems });
  } catch (error) {
    console.log(error);
  }
}


//cancel products from the order
const cancelOrder = async(req, res) => {
  try {
    await orderHelper.cancelOrderProducts(req.body)
    res.json(true)
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
    placeOrder,
    orderSuccess,
  displayOrders,
  orderDetails,
  cancelOrder
}