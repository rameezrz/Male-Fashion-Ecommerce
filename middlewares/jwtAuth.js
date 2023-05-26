const { verify } = require('jsonwebtoken')

const validateToken = (req, res, next) => {
    const accessToken = req.cookies['jwtToken']

    if (!accessToken) {
        req.flash("errorMsg", "User not Authenticated")
        res.redirect('/user_signin')
    }

    try {
        const validToken = verify(accessToken, process.env.JWT_SECRET)
        if (validToken) {
            req.authenticated = true
            return next()
        }
    } catch (err) {
        req.flash('errorMsg', "Token malformed")
    }
    res.redirect('/user_signin')
}

module.exports = validateToken