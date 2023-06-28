const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController')
const couponController = require('../controller/couponController')
const orderController = require('../controller/orderController')
const bannerController = require('../controller/bannerController')
const adminDashController = require('../controller/adminDashController')
const adminAuth= require('../middleware/adminAuth');
const express = require('express')
const admin_route = express()
const bodyparser=require('body-parser')
const store = require("../middleware/multer");



admin_route.set('view engine','hbs')
admin_route.set("views", "./view/admin");


////////////////ADMIN ROUTE////////////////////


admin_route.get('/',adminAuth.isLogout ,adminController.loadLogin)
admin_route.post('/',adminController.verifyLogin)

admin_route.get('/admin_dashboard',adminAuth.isLogin, adminDashController.loadDashboard)

admin_route.get('/users',adminAuth.isLogin, adminController.loadUsersList)
admin_route.get('/block_user/:id',adminAuth.isLogin, adminController.listAndUnlistUser)
admin_route.get('/logout',adminController.Logout)
admin_route.get('/adminLogin',adminController.loginPage)


admin_route.get('/getChartData',adminAuth.isLogin,adminDashController.getChartData)
admin_route.post('/fetchpieChartData',adminAuth.isLogin,adminDashController.fetchpieChartData)
admin_route.get('/exportPdfDailySales', adminAuth.isLogin,adminDashController.exportPdfDailySales)
admin_route.get('/orderPdf', adminAuth.isLogin,adminDashController.loadOrderPdf)
admin_route.post('/getOrders',adminAuth.isLogin,adminDashController.getOrders)



admin_route.get('/products', adminAuth.isLogin,productController.loadProductList)
admin_route.get('/add_product',adminAuth.isLogin, productController.loadAddProduct)
admin_route.post('/add_product',adminAuth.isLogin, store.store.array('image', 4) , store.sharpImage, productController.addProduct)
admin_route.get('/edit_product/:id',adminAuth.isLogin, store.store.array('image',4),productController.updateProduct)
admin_route.get('/product_img_delete',adminAuth.isLogin,productController.deleteProductImage)
admin_route.post('/update_product/:id',adminAuth.isLogin, store.store.array('image',4), store.sharpImage,productController.updateExistProduct)
admin_route.get('/manageProduct/:id',adminAuth.isLogin, productController.listAndUnlistProduct)


admin_route.get('/catagories', adminAuth.isLogin,categoryController.loadCatagoryList)
admin_route.get('/add_catagory',adminAuth.isLogin, categoryController.loadAddCatagoryPage)
admin_route.post('/add_catagory',adminAuth.isLogin, store.store.single('image') ,categoryController.addNewCategory)
admin_route.get('/edit_category/:id',adminAuth.isLogin, categoryController.loadEditCategory)
admin_route.post('/update_catagory/:id',adminAuth.isLogin, store.store.single('image'),categoryController.updateCategory)
admin_route.get('/manageCategory/:id',adminAuth.isLogin, categoryController.listAndUnlistCategory)

admin_route.get('/coupon',adminAuth.isLogin, couponController.loadCouponPage)
admin_route.get('/add_coupon', adminAuth.isLogin, couponController.loadAddCoupon)
admin_route.post('/add_coupon',adminAuth.isLogin, couponController.addCoupon)
admin_route.get('/delete_coupon',adminAuth.isLogin,couponController.deleteCoupon)

admin_route.get('/orders', orderController.loadOrderList)
admin_route.post('/changeStatus',orderController.changeStatus)
admin_route.get('/oderDetailsPage',orderController.oderDetailsPage)


admin_route.get('/banner',adminAuth.isLogin, bannerController.loadBannerListPage)
admin_route.get('/add_banner',adminAuth.isLogin,bannerController.loadAddBannerPage)
admin_route.post('/add_banner',adminAuth.isLogin,  store.store.single('image'), bannerController.AddBannerPage)









///////////////////////////////////////////////

module.exports = admin_route;