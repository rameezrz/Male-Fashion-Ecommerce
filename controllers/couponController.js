const Coupon = require('../Models/couponSchema')

//Display coupon management page on admin side
const displayCoupon = async(req, res) => {
    try {
        const activeMenuItem = "/coupon";
        const coupons = await Coupon.find()
    res.render("admin/coupon", {
      title: "Coupon Management",
      layout: "layouts/adminLayout",
        activeMenuItem,
        coupons
    });
    } catch (error) {
        console.log(error);
    }
}

//Adding new Coupon to Database
const addCoupon = async(req, res) => {
    try {
        const { name, minPurchase, discount, maxDiscount, expiry } = req.body
        const isCoupon = await Coupon.findOne({ name })
        if (isCoupon) {
            req.flash("errorMsg", "Coupon Name already exists!!!")
            res.redirect('/admin-panel/coupon')
        } else {
            const newCoupon = new Coupon({
                name,
                minPurchase,
                discount,
                expiry,
                maxDiscount
            })
            newCoupon.save().then(() => {
                req.flash("successMsg", `${name} added Successfully...`)
                res.redirect('/admin-panel/coupon')
            })
        }
    } catch (error) {
        console.log(error);
    }
}

//Display Edit Coupon page(Modal) with it's data
const displayEditCoupon = async (req, res) => {
    try {
        const { id } = req.params
        const coupon = await Coupon.findById(id)
        res.json(coupon)
    } catch (error) {
        console.log(error);
    }
}

//Editing a coupon
const editCoupon = async (req, res) => {
    try {
        const { id, name, minPurchase, discount, maxDiscount, expiry } = req.body;
        const isActive = req.body.isActive ? true : false;
        const coupon = await Coupon.findById(id);

        if (coupon.name !== name) {
            const isCoupon = await Coupon.findOne({ name });
            if (isCoupon) {
                req.flash("errorMsg", "Coupon Name already exists!!!");
                res.redirect('/admin-panel/coupon');
                return;
            }
        }

        await Coupon.updateOne({ _id: id }, {
            name,
            minPurchase,
            discount,
            maxDiscount,
            expiry,
            isActive
        }).then(() => {
            req.flash("successMsg", `${name} edited Successfully...`);
            res.redirect('/admin-panel/coupon');
        });
    } catch (error) {
        console.log(error);
    }
};



//Deleting a Coupon from Database
const deleteCoupon = async(req, res) => {
    try {
        const { id } = req.params
        await Coupon.findByIdAndRemove(id).then(() => {
            req.flash("successMsg", "Coupon deleted Successfully")
            res.redirect('/admin-panel/coupon')
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    displayCoupon,
    addCoupon,
    displayEditCoupon,
    editCoupon,
    deleteCoupon
}