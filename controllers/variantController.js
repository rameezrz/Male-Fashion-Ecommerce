const Product = require("../Models/productSchema");
const Category = require('../Models/categorySchema')
const Variant = require("../Models/variantSchema");

//Display Add Variant Page
const displayAddVariant = async (req, res) => {
  try {
    const products = await Product.find();
    const activeMenuItem = "/addVariant";
    res.render("admin/addVariant", {
      title: "Add Variant",
      products,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//Add Variant to the product
const addVariant = async (req, res) => {
  try {
    const { product, size, color, productPrice, salePrice, stock } = req.body;
    const variantObj = {
      product,
      size,
      color,
      productPrice,
      salePrice,
      stock,
      };
      const isProduct = await Variant.findOne({ product })
      if (isProduct) {
          let variantExist = isProduct.variants.findIndex(
              (variant)=> variant.size == size && variant.color == color
          )
          if (variantExist != -1) {
            req.flash("errorMsg","This combination already exists")
            res.redirect('/admin-panel/add-variant')
          } else {
            await Variant.updateOne({ product }, {
                $push:{variants:variantObj}
            }).then(() => {
              req.flash("successMsg","Variant Added Successfully")
              res.redirect('/admin-panel/add-variant')
            }) 
          }
      } else {
          const newVariant = new Variant({
              product,
              variants:variantObj
          })
          newVariant.save().then(async() => {
              await Product.updateOne({ _id: product }, {
                  $inc:{stock:stock}
              })
              req.flash("successMsg","Variant Added Successfully")
              res.redirect('/admin-panel/add-variant')
          })
      }
  } catch (error) {
      console.log(error);
  }
};

//Display Edit Variant data
const displayVariantData = async (req, res) => {
    try {
        const { productId, variantId } = req.params
        const variantData = await Variant.findOne({
            _id: productId, variants: {
                $elemMatch: { _id: variantId }
            }
        }, {
            'variants.$': 1, product : 1
        })
        console.log(variantData);
        res.json(variantData)
    } catch (error) {
        console.log(error);
    }
}

//Edit Variant of the product
const editVariant = async (req, res) => {
    try {
        const { productId, variantId, productPrice, salePrice, stock } = req.body;
        await Variant.updateOne({ product: productId,'variants._id':variantId }, {
            $set: {
                'variants.$.productPrice' : productPrice,
                'variants.$.salePrice' : salePrice,
            }, $inc: {
                'variants.$.stock' : stock
                
            }
        }).then(async () => {
            await Product.updateOne({ _id: productId }, {
                $inc:{stock:stock}
            })
            res.json({status:true,message:"Variant edited Successfully"})
        })
    } catch (error) {
        console.log(error);
    }
}


//Delete Variant from the product
const deleteVariant = async (req, res) => {
    try {
        const { productId, variantId } = req.body
        const variantData = await Variant.findOne({
            product: productId, variants: {
                $elemMatch: { _id: variantId }
            }
        }, {
            'variants.$': 1, product : 1
        })
        await Variant.findOneAndUpdate({ product: productId }, {
            $pull:{variants:{_id:variantId}}
        }).then(async() => {
            await Product.updateOne({ _id: productId }, {
                $inc:{stock:-variantData.variants[0].stock}
            })
            //Delete the variant document if the variants array is empty
            await Variant.deleteOne({ product: productId, variants: { $size: 0 } })
            res.json({status:true,message:"Variant deleted Successfully"})
        })
    } catch (error) {
        console.log(error);
    }
}



//Display Add Variant Page
const displayProductVariant = async (req, res) => {
    try {
        const products = await Variant.find({}).populate("product").exec();
        const categories = await Category.find();
    const categoryMap = new Map();
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), category.name);
    });
    const getCategoryName = (categoryId) => {
      return categoryMap.get(categoryId.toString());
    };
      const activeMenuItem = "/productVariant";
      res.render("admin/productVariant", {
        title: "Product with Variants",
          products,
          getCategoryName,
        layout: "layouts/adminLayout",
        activeMenuItem,
      });
    } catch (error) {
      console.log(error);
    }
};
  

//display colors to the frontend
const getColors = async (req, res) => {
    try {
      //Get the product id and the selected size from the query parameters
      const { productId, selectedSize } = req.query;
      //Find the variant document by the product id and select only the variants field
      const variant = await Variant.findOne({ product: productId }, { variants: 1 });
      //Filter the variants array and get only the ones that have the selected size
        let colors = variant.variants.filter(variantElement => variantElement.size === selectedSize);
        console.log(colors);
      //Send back the colors array as a JSON response
      res.json(colors);
    } catch (error) {
      //Handle any error that may occur
      console.log(error);
    }
}

  

const getVariantByFilters = async(req, res) => {
    try {
        //Get the product id, the selected size and the selected color from the query parameters
        const { productId, selectedSize, selectedColor } = req.query;
        //Find the variant document by the product id and select only the variants field
        const variantDB = await Variant.findOne({ product: productId }, { variants: 1 });
        //Initialize an empty object to store the variant
        let variantObj = {};
        //Loop through the variants array and check if each variant has both the selected size and color
        for (let variant of variantDB.variants) {
          if (variant.size === selectedSize && variant.color === selectedColor) {
            //If yes, assign the variant object to the variantObj variable
            variantObj = variant;
            //Break out of the loop as there is no need to check further
            break;
          }
        }
        //Send back the variantObj object as a JSON response
        res.json(variantObj);
      } catch (error) {
        //Handle any error that may occur
        console.log(error);
      }
}


module.exports = {
    displayAddVariant,
    addVariant,
    displayVariantData,
    editVariant,
    deleteVariant,
    displayProductVariant,
    getColors,
    getVariantByFilters
};
