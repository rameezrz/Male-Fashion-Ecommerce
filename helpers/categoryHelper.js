const Category = require("../Models/categorySchema");
const SubCategory = require("../Models/subCategorySchema");
const Product = require('../Models/productSchema')

module.exports = {
  //Adding new category by checking it's not already there
  addCategory: (data) => {
    const category = data.category;
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const isCategory = await Category.findOne({
          name: { $regex: new RegExp("^" + category + "$", "i") }
        });
        if (isCategory) {
          response.status = false;
          response.message = `${category} already exists!!!`;
          resolve(response);
        } else {
          const newCategory = new Category({ name: category });
          await newCategory.save().then((categoryDB) => {
            response.status = true;
            response.message = `${categoryDB.name} added to Categories`;
            response.category = categoryDB;
            resolve(response);
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //Adding sub categories under selected categories
  addSubCategory: (data) => {
    const { subCategory, category } = data;
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const isSubCategory = await SubCategory.findOne({
          name: { $regex: new RegExp("^" + subCategory + "$", "i") }
        });
        if (isSubCategory) {
          response.status = false;
          response.message = `${subCategory} already exists!!!`;
          resolve(response);
        } else {
          const newSubCategory = new SubCategory({
            name: subCategory,
            category,
          });
          newSubCategory.save().then((subCategory) => {
            response.status = true;
            response.message = `${subCategory.name} added to Sub-Categories`;
            response.subCategory = subCategory;
            resolve(response);
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //deleting category by checking no products under particular category
  deleteCategory: (id) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const isProduct = await Product.findOne({ category: id })
        if (isProduct) {
          response.status = false;
          response.message = `Cannot Delete!!! Product Exist Under Category`;
          resolve(response);
        } else {
          const deleteCategory = await Category.deleteOne({ _id: id });
          if (deleteCategory) {
            response.status = true;
            response.message = `Category Deleted Successfully`;
            resolve(response);
          } else {
            response.status = false;
            response.message = `Error occured`;
            resolve(response);
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  //deleting subcategory
  deleteSubCategory: (id) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const deleteSubCategory = await SubCategory.deleteOne({ _id: id });
        if (deleteSubCategory) {
          response.status = true;
          response.message = `Sub-Category Deleted Successfully`;
          resolve(response);
        } else {
          response.status = false;
          response.message = `Error occured`;
          resolve(response);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};
