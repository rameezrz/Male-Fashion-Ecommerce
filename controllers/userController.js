const userHelper = require("../helpers/userHelper");
const cartHelper = require('../helpers/cartHelper')
const User = require('../Models/userSchema')
const Product = require("../Models/productSchema");
const Category = require("../Models/categorySchema");
const SubCategory = require("../Models/subCategorySchema");
const Cart = require('../Models/cartSchema')
const Wallet = require('../Models/walletSchema')
const Address = require('../Models/addressSchema')
const Banner = require('../Models/bannerSchema')
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;
const client = require("twilio")(accountSid, authToken); 
const bcrypt = require('bcrypt');
const productHelper = require("../helpers/productHelper");



const generateResult = (items) => {
  let html = ''
  items.forEach(item => {
    html+= `<div class="col-lg-4 col-md-6 col-sm-6">
    <div class="product__item">
        <a href="/shop/product/${item._id}"><div class="product__item__pic set-bg" data-setbg="/admin/productImgMulter/${item.images[0].filename}">
        </div></a>
        <div class="product__item__text">
            <h6 style="color: #b19975;font-weight: 800;">${ item.brand }</h6>
            <h6>${item.productName}</h6>
            <input type="text" id="isUserLoggedIn" value="${ item.isUserLoggedIn }" hidden>
            <a href="#" id="addToCart" onclick="addToCart('${item._id}'),event.preventDefault()" class="add-cart">+ Add To Cart</a>
            <h5 class="d-inline">₹${ item.salePrice  } </h5><p style="color: #b19975;" class="text-decoration-line-through d-inline">₹${ item.productPrice  }</p>
        </div>
    </div>
</div>`
  });
}

//Display home Page
const baseRoute = async(req, res) => { 
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const activeMenuItem = "/home";
    let banner = await Banner.find()
    banner = banner[0].filename
    let cartCount = 0
    if (isUserLoggedIn) {
      let isCart = await Cart.findOne({ user: req.session.user._id })
    if (isCart) {
      cartCount = await cartHelper.getCartCount(req.session.user._id)
    }
    }
    res.render("user/index", { userName, isUserLoggedIn, activeMenuItem, cartCount,banner });
  } catch (error) {
    console.log(error);
  }
};


//Display SignIn Page
const displaySignIn = (req, res) => {
  try {
    res.render("user/signIn", { layout: "layouts/blankLayout" });
  } catch (error) {
    console.log(error);
  }
};


//Verifying User SignIn
const signIn = async (req, res) => {
  try {
    const response = await userHelper.signIn(req.body);
    if (response.status) {
      let maxAge = 60 * 60 * 24 * 3 * 1000;
      const accessToken = userHelper.createJwtToken(response.user);
      res.cookie("jwtToken", accessToken, { maxAge, httpOnly: true });
      req.session.isUserLoggedIn = true;
      req.session.userName = response.user.name;
      req.session.user = response.user
      res.redirect("/");
    } else {
      req.flash("errorMsg", response.message);
      res.redirect("/user-signin");
    }
  } catch (error) {
    console.log(error);
  }
};


//Display Mobile Otp Login Page
const displayOtpLogin = (req, res) => {
  try {
    res.render("user/otpLogin", { layout: "layouts/blankLayout" });
  } catch (error) {
    console.log(error);
  }
}


//Sending OTP to User Mobile
const sendOtp = (req, res) => {
  try {
    const mob = req.body.phone
    req.session.phone = mob
    userHelper.sendOtp(mob);
    res.json('Otp sent')
  } catch (error) {
    console.log(error);
  }
}


//Checking User Entered OTP is correct or not
const checkLoginOtp = async(req, res) => {
  try {
    const otp = req.body.otp;
    const mob = req.session.phone;
    console.log(mob);
    let response = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${mob}`, code: otp });
    if (response.valid) {
      const user = await User.findOne({ phone: mob })
      console.log(user);
      req.flash("successMsg", "User created Successfully");
      let maxAge = 60 * 60 * 24 * 3 * 1000;
      const accessToken = userHelper.createJwtToken(user);
      res.cookie("jwtToken", accessToken, { maxAge, httpOnly: true });
      req.session.user=user
      req.session.isUserLoggedIn = true;
      req.session.userName = user.name;
      res.redirect("/");
    }else {
      req.flash("errorMsg", "Invalid OTP");
      res.redirect("/otp-login");
    }
  } catch (error) {
    console.log(error);
  }
}


//Display User Registration Form
const displayRegistration = (req, res) => {
  try {
    var name = "";
    var email = "";
    var phone = "";
    if (req.session.body) {
      name = req.session.body.name;
      email = req.session.body.email;
      phone = req.session.body.phone;
    }
    res.render("user/registration", {
      name,
      email,
      phone,
      layout: "layouts/blankLayout",
    });
  } catch (error) {
    console.log(error);
  }
};


//Registering new User
const registration = (req, res) => {
  try {
    const mob = req.body.phone;
    req.session.body = req.body;
    userHelper.findSignUp(req.body).then(async (response) => {
      if (response.status) {
        userHelper.sendOtp(mob);
        res.redirect("/user-otp");
      } else {
        console.log(response.message);
        req.flash("errorMsg", "User already Registered");
        res.redirect("/user-registration");
      }
    });
  } catch (error) {
    console.log(error);
  }
};


//Resending OTP to User
const resendOtp = (req, res) => {
  try {
    const mob = req.session.body.phone;
    userHelper.sendOtp(mob);
    res.redirect("/user-otp");
  } catch (error) {
    console.log(error);
  }
};


//Displaying OTP Entering Page
const userOtp = (req, res) => {
  try {
    res.render("user/otp", { layout: "layouts/blankLayout" });
  } catch (error) {
    console.log(error);
  }
};


//Checking OTP User Entered
const checkOtp = async (req, res) => {
  try {
    const otp = req.body.otp;
    const mob = req.session.body.phone;
    let response = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${mob}`, code: otp });
    response.valid = true;
    if (response.valid) {
      const user = await userHelper.signUp(req.session.body);
      req.flash("successMsg", "User created Successfully");
      let maxAge = 60 * 60 * 24 * 3 * 1000;
      const accessToken = userHelper.createJwtToken(user);
      res.cookie("jwtToken", accessToken, { maxAge, httpOnly: true });
      req.session.isUserLoggedIn = true;
      req.session.userName = user.name;
      res.redirect("/");
    } else {
      req.flash("errorMsg", "Invalid OTP");
      res.redirect("/user-otp");
    }
  } catch (error) {
    console.log(error)
  }
};


//Displaying Products to the User
const displayShop = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";

    const pageNum = req.query.pageNum
    const perPage = 6
    let docCount;
    const products = await Product.find()
      .countDocuments()
      .then((documents) => {
        docCount = documents
        return Product.find()
        .skip((pageNum - 1)*perPage)
        .limit(perPage)
      })
    const brandList = await Product.distinct("brand");
    const categories = await Category.find();
    const subCategories = await SubCategory.find();
    const activeMenuItem = "/shop";
    let cartCount = 0
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id)
    }
    res.render("user/shop2", {
      userName,
      isUserLoggedIn,
      products,
      activeMenuItem,
      categories,
      subCategories,
      brandList,
      cartCount,
      currentPage: pageNum,
      totalDocuments: docCount,
      pages:Math.ceil(docCount/perPage)
    });
  } catch (error) {
    console.log(error);
  }
};

//Displaying Products to the User by sorting and filtering
const displayShopByFilters = async (req, res) => {
  try {
    console.log("apiiii");
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";

    let query = [
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categories"
        }
      },
      { $unwind: "$categories" }
    ];

    if (req.query.searchKeyword && req.query.searchKeyword !== "") {
      query.push({
        $match: {
          $or: [
            {
              product_name: { $regex: req.query.searchKeyword, $options: "i" }
            }
          ]
        }
      });
    }

    if (req.query.category && req.query.category !== "") {
      query.push({
        $match: { "categories._id": req.query.category }
      });
    }

    // let sortField = req.query.sortBy;
    // let sortQuery = {};

    // if (sortField === "price_low") {
    //   sortQuery = { "categories.name": 1, product_price: 1 };
    // } else if (sortField === "price_high") {
    //   sortQuery = { "categories.name": 1, product_price: -1 };
    // }

    // if (Object.keys(sortQuery).length > 0) {
    //   query.push({ $sort: sortQuery });
    // }

    console.log(query,'----------------');

    let result = await Product.aggregate(query);
    console.log(result,'result')
    let shopItems = generateResult(result)
    console.log(shopItems);

    const pageNum = req.query.pageNum
    const perPage = 6
    let docCount;
    const products = await Product.find()
      .countDocuments()
      .then((documents) => {
        docCount = documents
        return Product.find()
        .skip((pageNum - 1)*perPage)
        .limit(perPage)
      })
    const brandList = await Product.distinct("brand");
    const categories = await Category.find();
    const subCategories = await SubCategory.find();
    const activeMenuItem = "/shop";
    let cartCount = 0
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id)
    }
    res.render("user/shop", {
      userName,
      isUserLoggedIn,
      products,
      activeMenuItem,
      categories,
      subCategories,
      brandList,
      shopItems:shopItems,
      cartCount,
      currentPage: pageNum,
      totalDocuments: docCount,
      pages:Math.ceil(docCount/perPage)
    });
  } catch (error) {
    console.log(error);
  }
};




//Sorting Products based on Category
const shopByCategory = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const id = req.params.id;
    const products = await Product.find({
      $and: [{ category: id }, { isRemoved: false }],
    });
    const brandList = await Product.distinct("brand");
    const categories = await Category.find();
    const activeMenuItem = "/shop";
    let cartCount = 0
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id)
    }
    res.render("user/shop", {
      userName,
      brandList,
      isUserLoggedIn,
      products,
      activeMenuItem,
      categories,
      cartCount
    });
  } catch (error) {}
};


//Sorting Products based on Brands
const shopByBrand = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const brand = req.query.q;
    console.log(brand);
    const products = await Product.find({
      $and: [{ brand }, { isRemoved: false }],
    });
    const brandList = await Product.distinct("brand");
    const categories = await Category.find();
    const activeMenuItem = "/shop";
    res.render("user/shop", {
      userName,
      brandList,
      isUserLoggedIn,
      products,
      activeMenuItem,
      categories,
    });
  } catch (error) {}
};


//Displaying details about the product which user is selected
const displayProduct = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const id = req.params.id;
    const product = await Product.findById(id);
    const category = await Category.findById(product.category);
    const activeMenuItem = "/shop";
    let cartCount = 0
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id)
    }
    const review = await productHelper.getProductReviews(product._id)
    console.log(review);
    res.render("user/productDetails", {
      userName,
      isUserLoggedIn,
      product,
      category,
      activeMenuItem,
      cartCount,
      review
    });
  } catch (error) {
    console.log(error);
  }
};



//Displaying User Profile
const displayProfile = async(req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const user=req.session.user
    const activeMenuItem = "/home";
    let cartCount = 0
    let wallet = await Wallet.findOne({ user: user._id })
    let address = await Address.findOne({ user: user._id })
    if (address) {
      address = address.deliveryAddress[0]
    } else {
      address =''
    }
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id)
    }
    res.render("user/profile", {
      userName, isUserLoggedIn,wallet,address,
      activeMenuItem, cartCount, user,
      layout: "layouts/profileLayout",
      activeMenuItem:"/profile"
    });
  } catch (error) {
    console.log(error);
  }
}

//display Change Password page
const displayChangePassword = async(req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const user=req.session.user
    const activeMenuItem = "/home";
    let cartCount = 0
    if (isUserLoggedIn) {
      cartCount = await cartHelper.getCartCount(req.session.user._id)
    }
    res.render("user/changePassword", {
      userName, isUserLoggedIn,
      activeMenuItem, cartCount, user,
      layout: "layouts/profileLayout",
      activeMenuItem:"/change-password"
    });
  } catch (error) {
    console.log();
  }
}


//check the entered password and send OTP if it's correct
const checkPassword = async(req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.session.user._id)
    const isNewPasswordSame = await bcrypt.compare(newPassword,user.password)
    await bcrypt.compare(currentPassword, user.password).then(async(match) => {
      if (!match) {
        res.json({response:"Current Password is Incorrect",error:true})
      } else if (isNewPasswordSame) {
        res.json({response:"New Password cannot be same to current Password",error:true})
      } else {
        await userHelper.sendOtp(user.phone)
        await bcrypt.hash(newPassword, 10).then((hashedPassword) => {
          req.session.newPassword = hashedPassword
        })
        res.json({response:`We have sent an OTP to your Registered Mobile Number ****${user.phone.toString().slice(6,10)}`})
      }
    })
  } catch (error) {
    console.log(error);
  }
}


//saving new password to DB if OTP is correct
const changePassword = async(req, res) => {
  try {
    const otp = req.body.otp
    const mob = req.session.user.phone
    const newPassword = req.session.newPassword
    delete req.session.newPassword;
    let otpResponse = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${mob}`, code: otp });
    if (otpResponse.valid) {
      await User.updateOne({ _id: req.session.user._id }, { password: newPassword })
      req.flash('successMsg', "Password Updated Successfully")
      res.json({response:"Success"})
    } else {
      res.json({response:"Invalid OTP",error:true})
    }
  } catch (error) {
    console.log(error);
  }

}



//User Logout function
const logout = (req, res) => {
  try {
    res.clearCookie("jwtToken");
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  baseRoute,
  displaySignIn,
  displayOtpLogin,
  sendOtp,
  checkLoginOtp,
  displayRegistration,
  registration,
  userOtp,
  checkOtp,
  resendOtp,
  signIn,
  displayShop,
  displayShopByFilters,
  shopByCategory,
  shopByBrand,
  displayProduct,
  displayProfile,
  displayChangePassword,
  checkPassword,
  changePassword,
  logout,
};
