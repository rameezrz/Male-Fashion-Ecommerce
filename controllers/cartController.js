const cartHelper = require('../helpers/cartHelper')
const Address = require('../Models/addressSchema')

//Adding selected product to user cart
const addToCart = async(req, res) => {
    try {
        const userId = req.session.user._id
        const {productId} = req.body
        await cartHelper.addToCart(userId, productId)
        let cartCount = await cartHelper.getCartCount(userId)
            res.json(cartCount)
    } catch (error) {
        console.log(error);
    }
}


//displaying cart to user
const displayCart = async(req, res) => {
    try {
        const isUserLoggedIn = req.session.isUserLoggedIn || false;
        const userName = isUserLoggedIn ? req.session.userName : "";
        const activeMenuItem = "/shop";
        let cartCount = 0
        if (isUserLoggedIn) {
        cartCount = await cartHelper.getCartCount(req.session.user._id)
        }
        const userId = req.session.user._id
        let products = await cartHelper.getCartProducts(userId)
        let totalAmount = 0
        if (products.length) {
            totalAmount = await cartHelper.getTotalAmount(userId)
        }
        res.render('user/cart', { isUserLoggedIn, userName, activeMenuItem, products, cartCount,totalAmount})
    } catch (error) {
        console.log(error);
    }
}

//Increment or Decrement the quantity of the product in the cart
const changeProductQuantity = async(req, res) => {
    try {
        productQuantity = await cartHelper.changeProductQuantity(req.body)
        totalAmount = await cartHelper.getTotalAmount(req.session.user._id)
        res.json({productQuantity,totalAmount})
    } catch (error) {
        console.log(error);
    }
}

//Remove Product from Cart
const removeProduct = async(req, res) => {
    try {
        let response = await cartHelper.removeProduct(req.body)
        res.json(response)
    } catch (error) {
        console.log(error);
    }
}

//Display Checkout Page
const displayCheckout = async(req, res) => {
    try {
        const isUserLoggedIn = req.session.isUserLoggedIn || false;
        const userName = isUserLoggedIn ? req.session.userName : "";
        const user = req.session.user
        const activeMenuItem = "/shop";
        let cartCount = 0
        if (isUserLoggedIn) {
        cartCount = await cartHelper.getCartCount(user._id)
        }
        let addresses = await Address.findOne({ user: user._id })
        addresses = addresses === null ? null : addresses.deliveryAddress
        console.log(addresses);
        let products = await cartHelper.getCartProducts(req.session.user._id)
        if (products.length === 0) {
            res.redirect('/cart')
        } else {
            let totalAmount = await cartHelper.getTotalAmount(req.session.user._id)
            res.render('user/checkout',{ isUserLoggedIn, userName, activeMenuItem, cartCount,products,totalAmount,user,addresses})
        }
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    addToCart,
    displayCart,
    changeProductQuantity,
    removeProduct,
    displayCheckout
}