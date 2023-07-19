const { verify } = require('jsonwebtoken')

const validateToken = (req, res, next) => {
    const accessToken = req.cookies['jwtTokenAdmin']

    if (!accessToken) {
        req.flash("errorMsg", "Not Authenticated")
        res.redirect('/admin-panel/login')
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
    res.redirect('/admin-panel/login')
}

module.exports = validateToken