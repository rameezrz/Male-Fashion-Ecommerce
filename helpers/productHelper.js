const Product = require("../Models/productSchema");

module.exports = {
  addProduct: (productData, imageDetails) => {
    const { productName, brand, productPrice, salePrice, stock, description } =
      productData;
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        const isProduct = await Product.findOne({ name: productName });
        if (isProduct) {
          response.status = false;
          response.message = `${productName} already exists`;
          resolve(response);
        } else {
          const newProduct = new Product({
            productName,
            brand,
            productPrice,
            salePrice,
            stock,
            description,
            images: imageDetails.map((image) => image.filename),
            category: productData.category,
            subCategory: productData.subCategory,
          });

          newProduct.save().then((product) => {
            response.status = true;
            response.message = `${product.productName} added Successfully`;
            response.newProduct = product;
            resolve(response);
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  editProduct: (productData, imageDetails) => {
    const { productName, brand, productPrice, salePrice, stock, description } =
      productData;
    return new Promise(async (resolve, reject) => {
      try {
        let updatedProduct;
        if (imageDetails.length > 0) {
          updatedProduct = await Product.updateOne(
            { _id: productData.id },
            {
              productName,
              brand,
              productPrice,
              salePrice,
              stock,
              description,
              images: imageDetails.map((image) => image.filename),
              category: productData.category,
              subCategory: productData.subCategory,
            }
          );
        } else {
          updatedProduct = await Product.updateOne(
            { _id: productData.id },
            {
              productName,
              brand,
              productPrice,
              salePrice,
              stock,
              description,
              category: productData.category,
              subCategory: productData.subCategory,
            }
          );
        }

        let response = {};
        if (updatedProduct) {
          response = {
            status: true,
            message: "Product Edited Successfully",
            product: updatedProduct,
          };
          resolve(response);
        } else {
          response = {
            status: false,
            message: "Product not found",
          };
          resolve(response);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};
