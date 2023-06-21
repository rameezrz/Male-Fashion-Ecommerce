const Address = require('../Models/addressSchema')
const cartHelper = require('../helpers/cartHelper')

//Display Addresses on user Side (user Profile)
const displayAddress = async(req, res) => {
    try {
        const isUserLoggedIn = req.session.isUserLoggedIn || false;
        const userName = isUserLoggedIn ? req.session.userName : "";
        const user=req.session.user
        const activeMenuItem = "/home";
        let cartCount = 0
        if (isUserLoggedIn) {
          cartCount = await cartHelper.getCartCount(req.session.user._id)
        }
        const addressList = await Address.findOne({ user: user._id })
        res.render("user/addresses", { userName, isUserLoggedIn, activeMenuItem, cartCount,user,addressList });
      } catch (error) {
        console.log(error);
      }
}

//Adding new Address of user to Delivery
const addAddress = async(req, res) => {
    try {
        const newAddress = req.body
        let deliveryAddress =  {
            firstName: newAddress.firstName,
            lastName: newAddress.lastName,
            phone: newAddress.phone,
            email: newAddress.email,
            address1: newAddress.address1,
            address2: newAddress.address2,
            city: newAddress.city,
            state: newAddress.state,
            country:newAddress.country,
            pincode: newAddress.pincode,
        }
        const isAddress = await Address.findOne({ user: newAddress.userId})
        if (isAddress) {
            await Address.updateOne({ user: newAddress.userId }, {
                $push:{deliveryAddress}
            })
        } else {
            const newAddressInstance = new Address({
                user: newAddress.userId,
                deliveryAddress
            })
            await newAddressInstance.save()            
        }
        res.redirect("/profile/addresses")
    } catch (error) {
        console.log(error);
    }
}

//Delete Address from user profile
const deleteAddress = async(req, res) => {
    try {
        const userId = req.params.userId
        const addressId = req.params.addressId
        await Address.updateOne({ user: userId }, {
            $pull: { deliveryAddress: { _id:addressId } }
        })
        res.redirect("/profile/addresses")
    } catch (error) {
        console.log(error);
    }
}

//Display Edit Address page to user side
const displayEditAddress = async(req, res) => {
    try {
        const userId = req.params.userId
        const addressId = req.params.addressId
        const address = await Address.findOne({ user: userId, 'deliveryAddress._id': addressId }, { 'deliveryAddress.$': 1})
        res.json(address.deliveryAddress[0])
    } catch (error) {
        console.log(error);
    }
}

//Edit Address function on user side
const editAddress = async (req, res) => {
    try {
        const newAddress = req.body
        await Address.updateOne(
            { user: newAddress.userId, "deliveryAddress._id": newAddress.addressId },
            {
              $set: {
                "deliveryAddress.$.firstName": newAddress.firstName,
                "deliveryAddress.$.lastName": newAddress.lastName,
                "deliveryAddress.$.phone": newAddress.phone,
                "deliveryAddress.$.email": newAddress.email,
                "deliveryAddress.$.address1": newAddress.address1,
                "deliveryAddress.$.address2": newAddress.address2,
                "deliveryAddress.$.city": newAddress.city,
                "deliveryAddress.$.state": newAddress.state,
                "deliveryAddress.$.country": newAddress.country,
                "deliveryAddress.$.pincode": newAddress.pincode,
              },
            }
        );
        res.redirect("/profile/addresses");
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    displayAddress,
    addAddress,
    deleteAddress,
    displayEditAddress,
    editAddress
}