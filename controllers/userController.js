const userHelper = require("../helpers/userHelper");
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const verifySid = process.env.VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

const baseRoute = (req, res) => {
  const isUserLoggedIn = req.session.isUserLoggedIn || false;
  const userName = isUserLoggedIn ? req.session.userName : "";
  res.render("user/index", { userName, isUserLoggedIn });
};

const displaySignIn = (req, res) => {
  res.render("user/signIn");
};

const signIn = async (req, res) => {
  const response = await userHelper.signIn(req.body);
  if (response.status) {
    let maxAge = 60 * 60 * 24 * 3 * 1000
    const accessToken = userHelper.createJwtToken(response.user)
    res.cookie("jwtToken", accessToken, {maxAge,httpOnly:true})
    req.session.isUserLoggedIn = true;
    req.session.userName = response.user.name;
    res.redirect("/");
  } else {
    req.flash("errorMsg", response.message);
    res.redirect("/user_signin");
  }
};

const displayRegistration = (req, res) => {
  var name = "";
  var email = "";
  var phone = "";
  if (req.session.body) {
    name = req.session.body.name;
    email = req.session.body.email;
    phone = req.session.body.phone;
  }
  res.render("user/registration", { name, email, phone });
};

const registration = (req, res) => {
  const mob = req.body.phone;
  req.session.body = req.body;
  userHelper.findSignUp(req.body).then(async (response) => {
    if (response.status) {
      // userHelper.sendOtp(mob);
      res.redirect("/user_otp");
    } else {
      console.log(response.message);
      req.flash("errorMsg", "User already Registered");
      res.redirect("/user_registration");
    }
  });
};

const resendOtp = (req, res) => {
  const mob = req.session.body.phone;
  userHelper.sendOtp(mob);
  res.redirect("/user_otp");
};

const userOtp = (req, res) => {
  res.render("user/otp");
};

const checkOtp = async (req, res) => {
  let response={}
  // const otp = req.body.otp;
  // const mob = req.session.body.phone;
  // let response = await client.verify.v2
  //   .services(verifySid)
  //   .verificationChecks.create({ to: `+91${mob}`, code: otp });
  response.valid = true
  if (response.valid) {
    const user = await userHelper.signUp(req.session.body);
    req.flash("successMsg", "User created Successfully");
    let maxAge = 60 * 60 * 24 * 3 * 1000
    const accessToken = userHelper.createJwtToken(user)
    res.cookie("jwtToken", accessToken, {maxAge,httpOnly:true})
    req.session.isUserLoggedIn = true;
    req.session.userName = user.name;
    res.redirect("/");
  } else {
    req.flash("errorMsg", "Invalid OTP");
    res.redirect("/user_otp");
  }
};

const displayCustomers = (req, res) => {
  res.render('admin/customers')
}



module.exports = {
  baseRoute,
  displaySignIn,
  displayRegistration,
  registration,
  userOtp,
  checkOtp,
  resendOtp,
  signIn,
  displayCustomers,
};
