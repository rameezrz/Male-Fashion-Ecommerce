const isAuth = (req, res, next)=>{
    if (req.session.userName) {
        res.redirect('/')
    } else {
        next()
    }
}

module.exports = isAuth