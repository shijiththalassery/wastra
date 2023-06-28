const User = require('../model/userModel')
const Category = require("../model/catagoryModel");
const Product = require("../model/productModel");
const Order = require('../model/orderModel')
const moment = require('moment');
const mongoose = require('mongoose');
const cloudinary = require("../config/cloudinary");
require("dotenv").config();


const loadShopAllProduct = async (req, res) => {
    try {
        const category = await Category.find({ is_blocked: false })
        console.log(req.query.page);
        const page = parseInt(req.query.page) || 1

        const limit = 3; 

        const count = await Product.countDocuments({ is_blocked: false });
        const totalPages = Math.ceil(count / limit);

        const skip = (page - 1) * limit;

        const products = await Product.find({ is_blocked: false })
            .skip(skip)
            .limit(limit);

        if (req.session.cartUser) {
            const userData = req.session.cartUser;
            console.log(userData);
            res.render('allProducts', { products, userData, currentPage: page, totalPages, category });

        } else {
            res.render('allProducts', { products, currentPage: page, totalPages, category });
        }
    } catch (error) {
        console.log(error.message);
    }
};



const loadProductView = async (req, res) => {
    try {

        const userData = req.session.cartUser;
        const productId = req.query.id;
        const productData = await Product.findById(productId);
        const categoryData = await Category.find();

        if (!productData) {
            res.send('no product')//render('404',{userData})
        }
        else if (userData) {

            const userId = userData._id
            const productId = req.query.id;
            const myId = new mongoose.Types.ObjectId(userId);
            const proId = new mongoose.Types.ObjectId(productId);

            let user = req.session.user
            const result = await Order.aggregate([
                { $unwind: "$product" },
                { $match: { userId: myId } },
                { $match: { "product.id": proId } }
            ]);
            if (result[0]) {

                res.render("productView", { productData, categoryData, user, userData, result });
            }
            else {
                res.render("productView", { productData, categoryData, user, userData, });
            }
        }
        else {
            res.render("productView", { productData, categoryData, });
        }

    } catch (error) {
        console.log(error.message)
    }
}
const loadProduct = async (req, res) => {
    try {
        let user = req.session.user;
        const categoryId = req.query.id;
        const productData = await Product.find({ category: categoryId, is_blocked: false });
        const categoryData = await Category.find();
        if (req.session.cartUser) {
            const userData = req.session.cartUser;
            res.render("products", { productData, categoryData, userData });
        }
        if (!productData) {
            res.send('no product')
        }
        res.render("products", { productData, categoryData, user });
    } catch (error) {
        console.log(error.message)
    }

}

const loadProductList = async (req, res) => {

    try {
        const productData = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: "$category",
            },
        ]);
        if (req.session.productUpdate) {
            res.render("admin_product_list", {
                productData,
                productUpdated: "Product Updated successfully!!",
  
            });
            req.session.productUpdate = false;
        }
        if (req.session.productSave) {
            res.render("admin_product_list", {
                productData,
                productSave: "Product Added successfully!!",
            });
            req.session.productSave = false;
        } else {
            res.render('admin_product_list', { productData })
        }
        res.render('admin_product_list', { productData })
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddProduct = async (req, res) => {
    try {

        const categoryData = await Category.find();
        res.render('add_new_product', { categoryData })
    } catch (error) {
        console.log(error.message)
    }
}

const addProduct = async (req, res) => {

    try {
        const files = req.files;
        const productImages = [];

        for (const file of files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "Products",
            });
            const image = {
                public_id: result.public_id,
                url: result.secure_url,
            };

            productImages.push(image);
        }

        const { name, price, description, category } = req.body;
        const product = new Product({
            name: name,
            price: price,
            description: description,
            category: category,
            imageUrl: productImages,
            stock: req.body.stock,
            is_blocked: false,
            isOnCart: false,
        });
        await product.save();
        req.session.productSave = true;
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }

}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const productData = await Product.findById({ _id: productId });
        const categories = await Category.find();
        res.render('edit_product', { productId, productData, categories })
    } catch (error) {
        console.log(error.message);
    }
};

const deleteProductImage = async (req, res) => {
    try {
        const { id, image } = req.query;
        const product = await Product.findById(id);

        product.imageUrl.splice(image, 1);

        await product.save();
        res.status(200).send({ message: "Image deleted successfully" });

    } catch (error) {
        console.log(error.message);
    }
};

const updateExistProduct = async (req, res) => {
    try {
        const proId = req.params.id;
        const product = await Product.findById(proId);
        const exImage = product.imageUrl;
        const files = req.files;
        let updImages = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "Products",
                });

                const image = {
                    public_id: result.public_id,
                    url: result.secure_url,
                };

                updImages.push(image);
            }

            updImages = [...exImage, ...updImages];
            product.imageUrl = updImages;
        } else {
            updImages = exImage;
        }

        const { name, price, description, category } = req.body;
        await Product.findByIdAndUpdate(
            proId,
            {
                name: name,
                price: price,
                description: description,
                category: category,
                imageUrl: updImages,
                stock: req.body.stock,
                isOnCart: false,
                is_blocked: false,
            },
            { new: true }
        );
        req.session.productUpdate = true;
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }

}

const listAndUnlistProduct = async (req, res) => {

    try {
        const id = req.params.id;
        const blockProduct = await Product.findById(id);
        await Product.findByIdAndUpdate(id, { $set: { is_blocked: !blockProduct.is_blocked } }, { new: true });

        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message)
    }
}

const addNewReview = async (req, res) => {

    try {
        const data = req.body.data;
        const author = data.author;
        const review = data.review;
        const productId = data.product;
        const product = await Product.findById(productId)
        const currentDate = moment().format('YYYY-MM-DD');


        if (req.session.cartUser) {
            const userId = req.session.cartUser._id;
            const myId = new mongoose.Types.ObjectId(userId);
            const proId = new mongoose.Types.ObjectId(productId);
            const check = product.reviews.filter(element => element.user == userId)

            const orderData = await Order.find({ userId: userId })
            const result = await Order.aggregate([
                { $unwind: "$product" },
                { $match: { userId: myId } },
                { $match: { "product.id": proId } }
            ]);
            console.log(result, 3000)
            if (result[0]) {

                if (result[0].status == 'Delivered') {

                    if (!check[0]) {
                        await Product.findByIdAndUpdate(
                            productId, {
                            $push: {
                                reviews: {
                                    review: review,
                                    user: userId,
                                    name: author,
                                    date: currentDate
                                }
                            }
                        },
                            { new: true }
                        )
                        res.json({ message: 'The review has been added successfully.' })
                    } else {
                        res.json({ message: 'The user has already written the review' })
                    }

                } else {
                    res.json({ message: 'The user has not yet purchased this product' })
                }
            }
            else {
                res.json({ message: 'The user has not yet purchased this product' })
            }
        }
        else {
            res.json({ message: 'Please log in to add a review' })
        }

    } catch (error) {
        console.log(error.message)
    }

}

const sortby = async (req, res) => {
    const searchValue = req.query.search;
    const sortValue = req.query.sortBy

    const sortOrder = req.query.sortOrder
    let pageNumber = parseInt(req.query.page || 1)

    const pageSize = 3;
    let sortType = 1;
    const pipeline = [];
    if (req.query.sortOrder) {
        if (req.query.sortOrder === 'desc' || req.query.sortOrder === 'ztoa') {
            sortType = -1;
        }
    }

    if (searchValue) {
        pipeline.push({
            $match: {
                name: {
                    $regex: searchValue,
                    $options: 'i',
                },
            },
        });
    }

    if (sortValue) {
        pipeline.push({
            $sort: {
                [sortValue]: sortType,
            },
        });
    }


    const results = await Product.aggregate(pipeline);
    if (results.length > 0) {


        const userdata = req.session.cartUser;
        const totalItems = results.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
        const pageData = results.slice(startIndex, endIndex + 1);
        const category = await Category.find();

        if (pageData.length === 0) {
            //   res.render('user/Nomatches');
            console.log('no data after filter')
        } else {
            if (req.session.cartUser) {
                const userData = req.session.cartUser;
                res.render('allProducts', {
                    products: pageData,
                    userdata,
                    totalPages,
                    pageNumber,
                    title: 'Products',
                    category,
                    userData
                });

            } else {
                res.render('allProducts', {
                    products: pageData,
                    userdata,
                    totalPages,
                    pageNumber,
                    title: 'Products',
                    category,
                });
            }

        }

    }
    else {
        res.render('allProducts', {
            products: [],
            userdata: {},
            totalPages: 0,
            pageNumber: 0,
            title: 'Products',
            category: [],
        });
    }

}

/////////////CART PAGE CONTROLLER////////////
const loadCartPage = async (req, res) => {

    try {
        const userData = req.session.cartUser;
        const userId = req.query.id;

        const categoryData = await Category.find({ is_blocked: false });

        const user = await User.findOne({ _id: userId }).populate("cart.product").lean();
        console.log(user,'shijith is here')
        const cart = user.cart;
        console.log(cart,'shijith')
        let subTotal = 0;

        cart.forEach((val) => {
            val.total = val.product.price * val.quantity;
            subTotal += val.total;
        });

        if (user.cart.length === 0) {
            res.render("cart", { userData, categoryData, message: 'empty cart' });
        } else {
            res.render("cart", { userData, categoryData, cart, subTotal, });
        }
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadShopAllProduct,
    loadProductView,
    loadProduct,
    loadProductList,
    loadAddProduct,
    addProduct,
    updateProduct,
    deleteProductImage,
    updateExistProduct,
    listAndUnlistProduct,
    addNewReview,
    sortby,

    loadCartPage,
}