const Category = require('../Models/categorySchema')
const SubCategory = require('../Models/subCategorySchema')


module.exports = {
    addCategory: (data) => {
        const category = data.category
        let response = {}
        return new Promise(async(resolve, reject) => {
            try {
                const isCategory = await Category.findOne({ name: category })
            if (isCategory) {
                response.status = false
                response.message = `${category} already exists!!!`
                resolve(response)
            } else {
                const newCategory = new Category({ name: category })
                await newCategory.save().then((categoryDB) => {
                    response.status = true
                    response.message = `${categoryDB.name} added to Categories`
                    response.category = categoryDB
                    resolve(response)
                })       
            }
            } catch (error) {
                reject(error)
            }
        })
    },

    addSubCategory: (data) => {
        const { subCategory, category } = data
        let response = {}
        return new Promise(async(resolve, reject) => {
            try {
                const isSubCategory = await SubCategory.findOne({ name: subCategory })
                if (isSubCategory) {
                    response.status = false
                    response.message = `${subCategory} already exists!!!`
                    resolve(response)
                } else {
                    const newSubCategory = new SubCategory({ name: subCategory, category })
                    newSubCategory.save().then((subCategory) => {
                        response.status = true
                        response.message = `${subCategory.name} added to Sub-Categories`
                        response.subCategory = subCategory
                        resolve(response) 
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    }
}