const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const profileController = require('../controller/profileController')
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController')
const express = require('express')
const user_route = express()
const auth = require("../middleware/userAuth")



user_route.set('view engine','hbs')
user_route.set('views','./view/users')


user_route.get('/',auth.isLogout, userController.loadHome)
user_route.get('/home',userController.loadHome)

user_route.get('/register' ,auth.isLogout ,userController.loadRegister)
user_route.post('/register' ,auth.isLogout ,userController.sendOtp)
user_route.get('/resend_otp' ,auth.isLogout ,userController.sendOtp)
user_route.get('/otpPage' ,auth.isLogout ,userController.loadOtpPage)

user_route.get('/login' ,auth.isLogout ,userController.loginLoad)
user_route.post('/verify-otp' ,auth.isLogout ,userController.verifyOtp)
user_route.post('/login' ,auth.isLogout ,userController.verifyLogin)
user_route.get('/logout' ,userController.Logout)

user_route.get('/forgotpassword' ,auth.isLogout ,userController.loadForgotPage)
user_route.post('/forgotpassword' ,auth.isLogout ,userController.forgotSendOtp)
user_route.get('/resend_fotp' ,auth.isLogout ,userController.forgotSendOtp)
user_route.get('/password_otp_verification' ,auth.isLogout ,userController.loadForgotOtpPage)
user_route.post('/password_otp_verification' ,auth.isLogout ,userController.verifyOtpWithoutPassword) 

user_route.get('/products', auth.blockCheck, productController.loadProduct)
user_route.get('/products_view', auth.blockCheck, productController.loadProductView)
user_route.get('/shop_all_product', auth.blockCheck, productController.loadShopAllProduct)
user_route.post('/addNewReview',productController.addNewReview)
user_route.get('/sorting',productController.sortby)

user_route.get('/wishlist', auth.blockCheck, auth.isLogin, cartController.loadWishlist)
user_route.get('/addToWishlist',auth.blockCheck, auth.isLogin ,cartController.addToWishlist)
user_route.get('/removeWishlist',auth.blockCheck, auth.isLogin ,cartController.removeWishlist)

user_route.get('/cart', auth.blockCheck, auth.isLogin ,productController.loadCartPage)
user_route.get('/add_to_cart',auth.blockCheck, auth.isLogin ,userController.addToCart)
user_route.post('/cart_updation', auth.blockCheck, auth.isLogin ,userController.updateCart)
user_route.get('/addToCartFromWishlist',auth.blockCheck, auth.isLogin ,cartController.addToCartFromWishlist)
user_route.get('/removeCart',auth.blockCheck, auth.isLogin ,cartController.removeCart)

user_route.get('/user_profile/',auth.blockCheck, auth.isLogin ,profileController.loadProfilePage)
user_route.post('/addNewAddress',auth.blockCheck, auth.isLogin ,profileController.addNewAddress)
user_route.get('/addressData', auth.blockCheck, auth.isLogin ,profileController.getAddressdata)
user_route.post('/updateAddress', auth.blockCheck, auth.isLogin ,profileController.updateAddress)
user_route.get('/deleteAddress', auth.blockCheck, auth.isLogin ,profileController.deleteAddress)

user_route.post('/validateCoupon',auth.blockCheck, auth.isLogin, couponController.validateCoupon)

user_route.get('/checkStock',auth.blockCheck, auth.isLogin, orderController.checkStock)
user_route.get('/checkOut',auth.blockCheck, auth.isLogin, orderController.loadCheckOut)
user_route.post('/place_order',auth.blockCheck, auth.isLogin, orderController.placeOrder)
user_route.get('/orderSuccess',auth.blockCheck, auth.isLogin, orderController.orderSuccess)
user_route.get('/viewOrderdetail',auth.blockCheck, auth.isLogin,orderController.viewOrderDetail)
user_route.get('/cancellOrder',auth.blockCheck, auth.isLogin,orderController.cancellOrder)
user_route.get('/returnOrder',auth.blockCheck, auth.isLogin,orderController.returnOrder)
user_route.get('/downloadInvoice',auth.blockCheck, auth.isLogin,orderController.downloadInvoice)
//user_route.get('/invoice',orderController.invoice)



module.exports = user_route