const User = require('../Models/userSchema')
const categoryHelper = require('../helpers/categoryHelper')
const Category = require('../Models/categorySchema')
const SubCategory = require('../Models/subCategorySchema')

//display Users
const displayUsers = async(req, res) => {
    try {
        const users = await User.find()
        res.render('admin/customers', { users })
    } catch (error) {
        console.log(error);
    }
}

//block User
const blockUser = async(req, res) => {
    try {
        const id = req.params.id
        await User.updateOne({ _id: id },{$set:{isBlocked:true}})
        req.flash("successMsg","Blocked User Successfully")
        res.redirect("/admin_panel/user_management")
    } catch (error) {
        console.log(error);
    }
}

//Unblock User
const UnblockUser = async(req, res) => {
    try {
        const id = req.params.id
        await User.updateOne({ _id: id },{$set:{isBlocked:false}})
        req.flash("successMsg","Unblocked User Successfully")
        res.redirect("/admin_panel/user_management") 
    } catch (error) {
        console.log(error);
    }
}

//display categories
const displayCategories = async(req, res) => { 
    try {
        const categories = await Category.find()
        const subCategories = await SubCategory.find()
        res.render('admin/categories',{categories,subCategories})
    } catch (error) {
        console.log(error);
    }
}

//Add Categories
const addCategory = async (req, res) => {
    
    try {
        const response = await categoryHelper.addCategory(req.body)
        if (!response.status) {
            req.flash("errorMsg", response.message)
        } else {
            req.flash("successMsg", response.message)
        }
    } catch (error) {
        console.log(error);
    } finally {
        res.redirect('/admin_panel/categories') 
    }
}

//Add Sub Category
const addSubCategory = async (req, res) => {
    try {
        const response = await categoryHelper.addSubCategory(req.body)
        if (!response.status) {
            req.flash('errorMsg',response.message)
        } else {
            req.flash('successMsg',response.message)
        }
    } catch (error) {
        console.log(error);
    } finally {
        res.redirect('/admin_panel/categories')
    }
}

//display Product
const displayProducts = (req, res) => {
    try {
        res.render('admin/products')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    displayUsers,
    blockUser,
    UnblockUser,
    displayCategories,
    addCategory,
    addSubCategory,
    displayProducts
}