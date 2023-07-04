const cartHelper = require('../helpers/cartHelper')
const Address = require('../Models/addressSchema')
const Coupon = require('../Models/couponSchema')
const Cart = require('../Models/cartSchema')
const Wallet = require('../Models/walletSchema')

//Adding selected product to user cart
const addToCart = async(req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user._id
            const {productId} = req.body
            await cartHelper.addToCart(userId, productId)
            let cartCount = await cartHelper.getCartCount(userId)
                res.json({status:true,cartCount})
        } else {
            res.json({status:false})
        }
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
        let wallet = await Wallet.findOne({user:user._id})
        let addresses = await Address.findOne({ user: user._id })
        addresses = addresses === null ? null : addresses.deliveryAddress
        let products = await cartHelper.getCartProducts(req.session.user._id)
        let coupons = await Coupon.find()
        let cart = await Cart.findOne({ user: user._id })
        if (cart.coupon) {
            await Cart.updateOne({ user: user._id }, {
                $unset: {
                    coupon:1,
                    discountAmount:1,
                    subTotal:1,
                    totalAmount:1
                }
            })
        }
        if (products.length === 0) {
            res.redirect('/cart')
        } else {
            let totalAmount = await cartHelper.getTotalAmount(req.session.user._id)
            res.render('user/checkout',{ isUserLoggedIn, userName,coupons, activeMenuItem, cartCount,products,totalAmount,user,addresses,wallet})
        }
    } catch (error) {
        console.log(error);
    }
}

//Applying Coupon
const applyCoupon = async(req, res) => {
    try {
        const { id } = req.params
        const coupon = await Coupon.findById(id)
        let subTotal = await cartHelper.getTotalAmount(req.session.user._id)
        if (subTotal < coupon.minPurchase) {
            res.json({status:false,subTotal,message:`Purchase for ₹${coupon.minPurchase}  to Apply this Coupon`})
        } else {
            let discountAmount = (subTotal * coupon.discount) / 100
            if (discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount
            }
            let totalAmount = subTotal - discountAmount
            const cart = await Cart.findOneAndUpdate({ user: req.session.user._id }, {
                coupon: id,
                subTotal,
                discountAmount,
                totalAmount
            })
            res.json({status:true,cart,coupon})
        }
    } catch (error) {
        console.log(error);
    }
}

//remove Coupon
const removeCoupon = async(req, res) => {
    try {
        const { id } = req.params
        await Cart.updateOne({ user: id }, {
            $unset: {
                coupon:1,
                discountAmount:1,
                subTotal: 1,
                totalAmount:1
            }
        }).then(() => {
            res.json(true)
        })
    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    addToCart,
    displayCart,
    changeProductQuantity,
    removeProduct,
    displayCheckout,
    applyCoupon,
    removeCoupon
}