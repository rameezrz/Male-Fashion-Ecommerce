const User = require('../Models/userSchema')

//Middleware to check if the user is blocked or holds a valid session
const isLoggedIn = async (req, res, next) => {
    let user = {
        isBlocked:null
    };
    if (req.session.user) {
        user = await User.findOne({ _id: req.session.user._id })
    }
    if (user.isBlocked || !req.session.userName) {
        req.session.destroy()
        res.redirect('/user-signin')
    } else {
        next()
    }
}

module.exports = isLoggedIn