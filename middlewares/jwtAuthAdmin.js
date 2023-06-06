const { verify } = require('jsonwebtoken')

const validateToken = (req, res, next) => {
    const accessToken = req.cookies['jwtToken']

    if (!accessToken) {
        req.flash("errorMsg", "Not Authenticated")
        res.redirect('/admin_login')
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
    res.redirect('/admin_login')
}

module.exports = validateToken