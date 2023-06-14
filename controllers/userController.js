const userHelper = require("../helpers/userHelper");
const User = require('../Models/userSchema')
const Product = require("../Models/productSchema");
const Category = require("../Models/categorySchema");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

const baseRoute = (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const activeMenuItem = "/home";
    res.render("user/index", { userName, isUserLoggedIn, activeMenuItem });
  } catch (error) {
    console.log(error);
  }
};

const displaySignIn = (req, res) => {
  try {
    res.render("user/signIn", { layout: "layouts/blankLayout" });
  } catch (error) {
    console.log(error);
  }
};

const signIn = async (req, res) => {
  try {
    const response = await userHelper.signIn(req.body);
    if (response.status) {
      let maxAge = 60 * 60 * 24 * 3 * 1000;
      const accessToken = userHelper.createJwtToken(response.user);
      res.cookie("jwtToken", accessToken, { maxAge, httpOnly: true });
      req.session.isUserLoggedIn = true;
      req.session.userName = response.user.name;
      res.redirect("/");
    } else {
      req.flash("errorMsg", response.message);
      res.redirect("/user_signin");
    }
  } catch (error) {
    console.log(error);
  }
};

const displayOtpLogin = (req, res) => {
  try {
    res.render("user/otpLogin", { layout: "layouts/blankLayout" });
  } catch (error) {
    console.log(error);
  }
}

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

const checkLoginOtp = async(req, res) => {
  try {
    const otp = req.body.otp;
    const mob = req.session.phone;
    console.log(mob);
    let response = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${mob}`, code: otp });
    response.valid = true;
    console.log(response);
    if (response.valid) {
      const user = await User.findOne({ phone: mob })
      console.log(user);
      req.flash("successMsg", "User created Successfully");
      let maxAge = 60 * 60 * 24 * 3 * 1000;
      const accessToken = userHelper.createJwtToken(user);
      res.cookie("jwtToken", accessToken, { maxAge, httpOnly: true });
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

const registration = (req, res) => {
  try {
    const mob = req.body.phone;
    req.session.body = req.body;
    userHelper.findSignUp(req.body).then(async (response) => {
      if (response.status) {
        userHelper.sendOtp(mob);
        res.redirect("/user_otp");
      } else {
        console.log(response.message);
        req.flash("errorMsg", "User already Registered");
        res.redirect("/user_registration");
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const resendOtp = (req, res) => {
  try {
    const mob = req.session.body.phone;
    userHelper.sendOtp(mob);
    res.redirect("/user_otp");
  } catch (error) {
    console.log(error);
  }
};

const userOtp = (req, res) => {
  try {
    res.render("user/otp", { layout: "layouts/blankLayout" });
  } catch (error) {
    console.log(error);
  }
};

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
      res.redirect("/user_otp");
    }
  } catch (error) {
    console.log(error);
  }
};

const displayShop = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const products = await Product.find({ isRemoved: false });
    const brandList = await Product.distinct("brand");
    const categories = await Category.find();
    const activeMenuItem = "/shop";
    res.render("user/shop", {
      userName,
      isUserLoggedIn,
      products,
      activeMenuItem,
      categories,
      brandList,
    });
  } catch (error) {
    console.log(error);
  }
};

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

const displayProduct = async (req, res) => {
  try {
    const isUserLoggedIn = req.session.isUserLoggedIn || false;
    const userName = isUserLoggedIn ? req.session.userName : "";
    const id = req.params.id;
    const product = await Product.findById(id);
    const category = await Category.findById(product.category);
    const activeMenuItem = "/shop";
    res.render("user/productDetails", {
      userName,
      isUserLoggedIn,
      product,
      category,
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

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
  shopByCategory,
  shopByBrand,
  displayProduct,
  logout,
};
