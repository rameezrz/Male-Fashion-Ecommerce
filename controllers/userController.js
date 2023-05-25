const userHelper = require("../helpers/userHelper")
const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const verifySid = process.env.VERIFY_SID
const client = require("twilio")(accountSid, authToken);
var userName = ''

const baseRoute = (req, res) => {
  var isUserLoggedIn = false
  isUserLoggedIn = req.session.isUserLoggedIn
  res.render("user/index",{userName,isUserLoggedIn});
};

const SignIn = (req, res) => {
  res.render("user/signIn");
};

const displayRegistration = (req, res) => {
  var userData = undefined
  res.render("user/registration", { userData });
};



const registration = (req, res) => {
  const mob = req.body.phone
  req.session.body = req.body
  userHelper.findSignUp(req.body).then(async(response) => {
    if (response.status) {
      await client.verify.v2.services(verifySid).verifications.create({to: `+91${mob}`, channel: "sms" });
      res.redirect('/user_otp')
    } else {
      console.log(response.message);
      req.flash('errorMsg',"User already Registered")
      res.redirect('/user_registration')
    }
  })
};

const resendOtp = (req, res) => {
  const mob = req.session.body.phone
  userHelper.sendOtp(mob)
  res.redirect("/user_otp")
}



const userOtp = (req, res) => {
  res.render("user/otp");
};

const checkOtp = async(req, res) => {
  const otp = req.body.otp
  const mob = req.session.body.phone
  let response = await client.verify.v2.services(verifySid).verificationChecks.create({ to: `+91${mob}`, code: otp })
  if (response.valid) {
    const user = await userHelper.signUp(req.session.body)
    req.flash('successMsg', "User created Successfully")
    req.session.isUserLoggedIn = true
    req.session.user = user
    userName = user.name
    res.redirect('/')
  } else {
    req.flash('errorMsg', "Invalid OTP")
    res.redirect('/user_otp')
  }
}

module.exports = {
  baseRoute,
  SignIn,
  displayRegistration,
  registration,
  userOtp,
  checkOtp,
  resendOtp
};
