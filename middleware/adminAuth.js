const User = require('../model/userModel')

const isLogin = async (req, res, next) => {
    try {
        if (!req.session.admin) {
            res.redirect('/admin')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }

}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/admin_dashboard')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }

}


module.exports = {
    isLogin,
    isLogout
}