const User = require("../Models/userSchema");
const Product = require("../Models/productSchema");
const Admin = require("../Models/adminSchema");
const Order = require("../Models/orderSchema");
const categoryHelper = require("../helpers/categoryHelper");
const orderHelper = require("../helpers/orderHelper");
const Category = require("../Models/categorySchema");
const SubCategory = require("../Models/subCategorySchema");
const productHelper = require("../helpers/productHelper");
const uploadImg = require("../middlewares/uploadImg");
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const multer = require("multer");
const sharp = require("sharp");

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
const dashboard = (req, res) => {
  try {
    const activeMenuItem = "/admin_panel";
    res.render("admin/indexAdmin", {
      title: "Admin Dashboard",
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

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

      // Proceed with adding the product using the imageDetails
      const response = await productHelper.addProduct(req.body, req.files);
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
    uploadImg.array("images", 4)(req, res, async (error) => {
      if (error) {
        req.flash("errorMsg", error);
        return;
      }
      const imageDetails = req.files;
      const response = await productHelper.editProduct(req.body, imageDetails);
      if (!response.status) {
        req.flash("errorMsg", response.message);
      } else {
        req.flash("successMsg", response.message);
      }
    });
  } catch (error) {
    console.log("error:", error);
  } finally {
    res.redirect("/admin-panel/products");
  }
};

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
    console.log(orderId);
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

module.exports = {
  displayLogin,
  postLogin,
  dashboard,
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
  displayAddProduct,
  displayEditProduct,
  editProduct,
  displayAddCategories,
  displayAddSubCategories,
  deleteProduct,
  unblockProduct,
  displayOrders,
  orderDetails,
  cancelOrder,
  logout,
};
