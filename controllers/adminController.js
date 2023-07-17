const User = require("../Models/userSchema");
const Product = require("../Models/productSchema");
const Admin = require("../Models/adminSchema");
const Order = require("../Models/orderSchema");
const Category = require("../Models/categorySchema");
const SubCategory = require("../Models/subCategorySchema");
const categoryHelper = require("../helpers/categoryHelper");
const orderHelper = require("../helpers/orderHelper");
const productHelper = require("../helpers/productHelper");
const adminHelper = require('../helpers/adminHelper')
const salesHelper = require('../helpers/salesHelper')
const uploadImg = require("../middlewares/uploadImg");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const multer = require("multer");
const sharp = require("sharp");
const fs = require('fs/promises');
const path = require('path');

//Admin Login Page Display
const displayLogin = (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect('/admin-panel')
    } else {
      res.render("admin/login", {
        title: "Admin Login",
        layout: "layouts/adminLayoutBlank",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//Admin Login Verifying
const postLogin = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    console.log(admin);
    if (!admin) {
      req.flash("errorMsg", "Email not found");
      res.redirect("/admin-panel/login");
    }
    const dbPassword = admin.password;
    await bcrypt.compare(password, dbPassword).then((match) => {
      if (!match) {
        req.flash("errorMsg", "Invalid Login Credentials");
        res.redirect("/admin-panel/login");
      } else {
        let maxAge = 60 * 60 * 24 * 3 * 1000;
        const accessToken = createJwtToken(admin);
        req.session.admin=admin
        res.cookie("jwtToken", accessToken, { maxAge, httpOnly: true });
        req.flash("successMsg", "Login Successful");
        res.redirect("/admin-panel");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//display Admin Dashboard
const dashboard = async(req, res) => {
  try {
    const data = await adminHelper.getDashboardData()
    const activeMenuItem = "/admin_panel";
    res.render("admin/indexAdmin", {
      title: "Admin Dashboard",
      layout: "layouts/adminLayout",
      activeMenuItem,
      data
    });
  } catch (error) {
    console.log(error);
  }
};

//dashboard chart data
const getDashboardChartData = async (req, res) => {
  try {
    const data = await adminHelper.getChartData()
    res.json(data)
  } catch (error) {
    console.log(error);
  }
}


//display Users
const displayUsers = async (req, res) => {
  try {
    const users = await User.find();
    const activeMenuItem = "/user_management";
    res.render("admin/customers", {
      title: "User Management",
      users,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//block User
const blockUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: true } });
    req.flash("successMsg", "Blocked User Successfully");
    res.redirect("/admin-panel/user-management");
  } catch (error) {
    console.log(error);
  }
};

//Unblock User
const UnblockUser = async (req, res) => {
  try {
    const id = req.params.id;
    await User.updateOne({ _id: id }, { $set: { isBlocked: false } });
    req.flash("successMsg", "Unblocked User Successfully");
    res.redirect("/admin-panel/user-management");
  } catch (error) {
    console.log(error);
  }
};

//display Add Categories
const displayAddCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    const subCategories = await SubCategory.find();
    const activeMenuItem = "/addCategories";
    res.render("admin/addCategories", {
      title: "Category Management",
      categories,
      subCategories,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//display Add Sub-Categories
const displayAddSubCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    const subCategories = await SubCategory.find();

    const categoryMap = new Map();
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), category.name);
    });

    const getCategoryName = (categoryId) => {
      return categoryMap.get(categoryId.toString());
    };
    const activeMenuItem = "/addSubCategories";
    res.render("admin/addSubCategories", {
      categories,
      subCategories,
      getCategoryName,
      layout: "layouts/adminLayout",
      title: "Sub-Category Management",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//Add New Categories
const addCategory = async (req, res) => {
  try {
    const response = await categoryHelper.addCategory(req.body);
    if (!response.status) {
      req.flash("errorMsg", response.message);
    } else {
      req.flash("successMsg", response.message);
    }
  } catch (error) {
    console.log(error);
  } finally {
    res.redirect("/admin-panel/add-categories");
  }
};

//Delete Categories
const deleteCategory = async (req, res) => {
  try {
    const response = await categoryHelper.deleteCategory(req.params.id);
    if (!response.status) {
      req.flash("errorMsg", response.message);
    } else {
      req.flash("successMsg", response.message);
    }
  } catch (error) {
    console.log(error);
  } finally {
    res.redirect("/admin-panel/add-categories");
  }
};

//Add Sub Category
const addSubCategory = async (req, res) => {
  try {
    const response = await categoryHelper.addSubCategory(req.body);
    if (!response.status) {
      req.flash("errorMsg", response.message);
    } else {
      req.flash("successMsg", response.message);
    }
  } catch (error) {
    console.log(error);
  } finally {
    res.redirect("/admin-panel/add-subCategories");
  }
};

//Delete Sub Category
const deleteSubCategory = async (req, res) => {
  try {
    const response = await categoryHelper.deleteSubCategory(req.params.id);
    if (!response.status) {
      req.flash("errorMsg", response.message);
    } else {
      req.flash("successMsg", response.message);
    }
  } catch (error) {
    console.log(error);
  } finally {
    res.redirect("/admin-panel/add-subCategories");
  }
};

//get Sub Categories Based on Selected Category
const getSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.body;
    const subCategories = await SubCategory.find({ category: categoryId });
    res.json(subCategories);
  } catch (error) {
    console.log(error);
  }
};

//display Product List
const displayProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const categories = await Category.find();
    const categoryMap = new Map();
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), category.name);
    });
    const getCategoryName = (categoryId) => {
      return categoryMap.get(categoryId.toString());
    };
    const activeMenuItem = "/products";
    res.render("admin/products", {
      title: "Product Management",
      products,
      categories,
      getCategoryName,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//Adding Product 
const addProduct = async (req, res) => {
  try {
    uploadImg.array("images", 4)(req, res, async (error) => {
      if (error instanceof multer.MulterError) {
        req.flash("errorMsg", error);
        res.redirect("/admin-panel/products");
        return;
      }

      if (!req.files || req.files.length === 0) {
        req.flash("errorMsg", "No valid images were uploaded.");
        res.redirect("/admin-panel/products");
        return;
      }

      const croppedImages = [];

      for (const file of req.files) {
        const croppedImagePath = `./public/admin/productImgMulter/${file.filename}`;
      
        // Perform image cropping using Sharp and save the result to a file
        await sharp(file.path)
          .resize(960, 1200, { fit: 'contain', background: 'white' }) // Apply fit contain and white background color
          .toFile(croppedImagePath);
      
        // Push the cropped image details to an array or perform further operations
        croppedImages.push({
          filename: file.filename,
          mimetype: file.mimetype,
          path: croppedImagePath,
        });
      }
      deleteAllFilesInDir('./public/admin/uploads')
      // Proceed with adding the product using the imageDetails
      const response = await productHelper.addProduct(req.body, croppedImages);
      if (!response.status) {
        req.flash("errorMsg", response.message);
      } else {
        req.flash("successMsg", response.message);
      }
    });
    res.redirect("/admin-panel/products");
  } catch (error) {
    console.log(error);
  }
};


const addProductImage = (req, res) => {
  try {
    uploadImg.single("image")(req, res, async (error) => {
      if (error instanceof multer.MulterError) {
        req.flash("errorMsg", error);
        res.redirect("/admin-panel/products");
        return;
      }
    
      if (!req.file) {
        req.flash("errorMsg", "No valid image was uploaded.");
        res.redirect("/admin-panel/products");
        return;
      }

      const croppedImagePath = `./public/admin/productImgMulter/${req.file.filename}`;
      
      // Perform image cropping using Sharp and save the result to a file
      await sharp(req.file.path)
        .resize(960, 1200, { fit: 'contain', background: 'white' }) // Apply fit contain and white background color
        .toFile(croppedImagePath);
      
      deleteAllFilesInDir('./public/admin/uploads')
      
      const { proId } = req.body
      console.log(req.body);
      await Product.updateOne({ _id: proId }, {
        $push:{images:{filename:req.file.filename}}
      })
      res.redirect(`/admin-panel/edit-product/${proId}`)
    })
  } catch (error) {
    console.log(error);
  }
}



//Display Add Product Page
const displayAddProduct = async (req, res) => {
  try {
    const categories = await Category.find();
    const subCategories = await SubCategory.find();
    const activeMenuItem = "/products";
    res.render("admin/addProduct", {
      title: "Add Product",
      categories,
      subCategories,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//Display Edit product Page
const displayEditProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById({ _id: id });
    const activeMenuItem = "/products";
    const categories = await Category.find();
    const selectedCategory = await Category.findOne({ _id: product.category });
    const selectedSubCategory = await SubCategory.findOne({
      _id: product.subCategory,
    });
    res.render("admin/editProduct", {
      title: "Edit Product",
      selectedCategory,
      selectedSubCategory,
      categories,
      product,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//Edit Product
const editProduct = async (req, res) => {
  try {
      const response = await productHelper.editProduct(req.body);
      if (!response.status) {
        req.flash("errorMsg", response.message);
      } else {
        req.flash("successMsg", response.message);
      }
  } catch (error) {
    console.log("error:", error);
  } finally {
    res.redirect("/admin-panel/products");
  }
};

//Edit Product Image
const editProductImage = (req, res) => {
  try {
    uploadImg.single("image")(req, res, async (error) => {
      if (error instanceof multer.MulterError) {
        req.flash("errorMsg", error);
        res.redirect("/admin-panel/products");
        return;
      }
    
      if (!req.file) {
        req.flash("errorMsg", "No valid image was uploaded.");
        res.redirect("/admin-panel/products");
        return;
      }
      
      
      const croppedImagePath = `./public/admin/productImgMulter/${req.file.filename}`;
      
      // Perform image cropping using Sharp and save the result to a file
      await sharp(req.file.path)
      .resize(960, 1200, { fit: 'contain', background: 'white' }) // Apply fit contain and white background color
      .toFile(croppedImagePath);
      
      deleteAllFilesInDir('./public/admin/uploads')
      
      const { proId, imgId } = req.body
      await Product.updateOne({ _id: proId, 'images._id':imgId}, {
        $set:{'images.$.filename':req.file.filename}
      })
      res.redirect(`/admin-panel/edit-product/${proId}`)
    });
  } catch (error) {
    console.log(error);
  }
}

//Delete Product (Soft Delete)
const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.updateOne({ _id: id }, { $set: { isRemoved: true } });
    req.flash("successMsg", "Product Deleted Successfully");
    res.redirect("/admin-panel/products");
  } catch (error) {
    console.log(error);
  }
};

//Delete Product Image
const deleteProductImage = async (req, res) => {
  try {
    const { proId, imgId } = req.body
    console.log(req.body);
    await Product.updateOne({ _id: proId }, {
      $pull:{images:{_id:imgId}}
    })
    res.json({status:true})
  } catch (error) {
    console.log(error);
  }
}

//Unblocking Product (Soft Delete)
const unblockProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.updateOne({ _id: id }, { $set: { isRemoved: false } });
    req.flash("successMsg", "Product Added back Successfully");
    res.redirect("/admin-panel/products");
  } catch (error) {
    console.log(error);
  }
};

//Display Users Orders
const displayOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    const activeMenuItem = "/order_history";
    res.render("admin/orders", {
      title: "Order History",
      orders,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//Detailed view of every Order
const orderDetails = async (req, res) => {
  try {
    const activeMenuItem = "/order_history";
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    const orderItems = await orderHelper.getOrderProducts(orderId);
    res.render("admin/orderDetails", {
      title: "Order History",
      order,
      orderItems,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

//Deliver Order
const deliverOrder = async (req, res) => {
  try {
    const { orderId, cartItem } = req.body
    console.log(req.body);
    await Order.findOneAndUpdate({ _id: orderId,'products._id':cartItem }, {
      $set: {
          'products.$.status': 'Delivered',
          'products.$.reason':'from Admin Side',
          'products.$.date':Date.now()
      }
    }).then(() => {
    res.json(true)
  })
  } catch (error) {
    console.log(error);
  }
}

//Cancel Order
const cancelOrder = async (req, res) => {
  try {
    console.log(req.body);
    await orderHelper.cancelOrderProducts(req.body)
    res.json(true)
  } catch (error) {
    console.log(error);
  }
}

//display Sales Report
const displaySalesReport = async (req, res) => {
  try {
    const dailySalesReport = await salesHelper.dailySalesReport()
    const monthlySalesReport = await salesHelper.monthlySalesReport()
    const yearlySalesReport = await salesHelper.yearlySalesReport()
    const users = await User.find();
    const activeMenuItem = "/sales_report";
    res.render("admin/salesReport", {
      title: "Sales Report",
      users,
      dailySalesReport,
      monthlySalesReport,
      yearlySalesReport,
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};


//sales Report custom
const customSalesReport = async (req, res) => {
  try {
    const {startDateISO,endDateISO} = req.body
    const salesReport = await salesHelper.customSalesReport(startDateISO,endDateISO)
    res.json(salesReport)
  } catch (error) {
    console.log(error);
  }
}

//Admin Logout
const logout = (req, res) => {
  try {
    res.clearCookie("jwtToken");
    req.session.destroy();
    res.redirect("/admin-panel/login");
  } catch (error) {
    console.log(error);
  }
};

const createJwtToken = (user) => {
  const accessToken = sign(
    {
      userName: user.name,
      id: user._id,
    },
    process.env.JWT_SECRET
  );
  return accessToken;
};

async function deleteAllFilesInDir(dirPath) {
  try {
    const files = await fs.readdir(dirPath);

    const deleteFilePromises = files.map(file =>
      fs.unlink(path.join(dirPath, file)),
    );

    await Promise.all(deleteFilePromises);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  displayLogin,
  postLogin,
  dashboard,
  getDashboardChartData,
  displayUsers,
  blockUser,
  UnblockUser,
  addCategory,
  deleteCategory,
  addSubCategory,
  deleteSubCategory,
  getSubCategory,
  displayProducts,
  addProduct,
  addProductImage,
  displayAddProduct,
  displayEditProduct,
  editProduct,
  editProductImage,
  displayAddCategories,
  displayAddSubCategories,
  deleteProduct,
  deleteProductImage,
  unblockProduct,
  displayOrders,
  orderDetails,
  deliverOrder,
  cancelOrder,
  displaySalesReport,
  customSalesReport,
  logout,
};
