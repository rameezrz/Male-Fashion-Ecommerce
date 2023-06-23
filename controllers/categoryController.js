const Category = require('../Models/categorySchema')
const SubCategory = require('../Models/subCategorySchema')

//Edit Category Name from Admin Side
const editCategory = async(req, res) => {
    try {
        const { categoryName, categoryId } = req.body
        const isCategory = await Category.findOne({
            name: { $regex: new RegExp("^" + categoryName + "$", "i") }
          });
        if (isCategory) {
            res.json({status:false,message:"Category Name already Exists"})
        } else {
            await Category.updateOne({ _id: categoryId }, {
                $set:{name:categoryName}
            })
            req.flash("successMsg","Category Edited Successfully")
            res.json({status:true})
        }
    } catch (error) {
        console.log(error);
    }
}

//Edit Sub-Category Name from Admin Side
const editSubCategory = async (req, res) => {
    try {
        const { subCategoryName, subCategoryId } = req.body
        const isSubCategory = await SubCategory.findOne({
            name: { $regex: new RegExp("^" + subCategoryName + "$", "i") }
        });
        if (isSubCategory) {
            res.json({status:false,message:"Sub-Category Name already Exists"})
        } else {
            await SubCategory.updateOne({ _id: subCategoryId }, {
                $set:{name:subCategoryName}
            })
            req.flash("successMsg","Sub-Category Edited Successfully")
            res.json({status:true})
        }
    } catch (error) {
        console.log(error);
    }
}




module.exports = {
    editCategory,
    editSubCategory
}