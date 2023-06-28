const User = require('../model/userModel')
const Category = require("../model/catagoryModel");
const Product = require("../model/productModel");
const path = require('path')
require('dotenv').config();

///////////////////ADMIN CREDENTIAL///////////////

const credentials = {
    email: 'admin@gmail.com',
    password: process.env.ADMIN_KEY,
}
//////////////////////////////////////////////////


/////////////////ADMIN CONTROLLER/////////////////


const loadLogin = async (req, res) => {
    try {
        res.render('adminlogin')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {
    try {
        if (req.body.email == credentials.email && req.body.password == credentials.password) {
            req.session.admin = true;
            res.redirect('/admin/admin_dashboard')
        } else {
            res.render("adminlogin", { invalid: "invalid details" });
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadAdmniDashboard = async (req, res) => {
    try {
        res.render('admin_dashboard')
    } catch (error) {
        cosole.log(error.message)
    }
}

const loadUsersList = async (req, res) => {
    try {
        const userData = await User.find()
        res.render('admin_user_list', { users: userData })
    } catch (error) {
        console.log(error.message)
    }
}

const listAndUnlistUser = async (req, res) => {
    try {
        const id = req.params.id;
        const blockUser = await User.findById(id);
        await User.findByIdAndUpdate(id, { $set: { is_blocked: !blockUser.is_blocked } }, { new: true });
        res.redirect("/admin/users");
    } catch (error) {
        console.log(error.message)

    }
}

const Logout = async (req, res) => {
    try {
        req.session.admin = null
        res.redirect('/admin//')
    } catch (error) {
        console.log(error.message);
    }
}

const loginPage = async (req, res) => {
    try {
        res.render('adminlogin')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadUsersList,
    loadAdmniDashboard,
    listAndUnlistUser,
    Logout,
    loginPage
}