const User = require('../model/userModel')
const Category = require("../model/catagoryModel");
const Product = require("../model/productModel");



const addToCartFromWishlist = async (req, res) => {
    try {

        const userData = req.session.cartUser;
        const userId = userData._id
        const productId = req.query.productId

        const user = await User.findById(userId)
        const product = await Product.findById(productId)
        const existed = await User.findOne({ _id: userId, "cart.product": productId })

        if (existed) {

            res.json({ message: "Product is already in cart!!" });

        } else {

            await Product.findOneAndUpdate(productId, { isOnCart: true })
            await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        cart: {
                            product: product._id,
                            quantity: 1
                        }
                    }
                },
                { new: true }
            )
            const itemIndex = user.wishlist.indexOf(productId)

            if (itemIndex >= 0) {
                await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } })
                await Product.updateOne({ _id: productId }, { isWishlisted: false })

            } else {
                res.json({
                    message: "Error Occured!"
                })
            }

            res.json({ message: "Moved to cart from wishlist" })
        }

    } catch (error) {
        console.log(error.message);
    }
}


const loadWishlist = async (req, res) => {
    try {

        const userData = req.session.cartUser
        const userId = userData._id
        const categoryData = await Category.find({ is_blocked: false })

        const user = await User.findById(userId).populate('wishlist')
        const wishlistItems = user.wishlist

        const userCart = await User.findOne({ _id: userId }).populate("cart.product").lean();
        const cart = userCart.cart;

        if (wishlistItems.length === 0) {

            res.render('emptyWishlist', { user: userData, userData })

        } else {

            res.render('wishlist', { userData, categoryData, cart, wishlistItems })

        }


    } catch (error) {
        console.log(error.message);
    }
}

const addToWishlist = async (req, res) => {
    try {
        const userData = req.session.cartUser
        const userId = userData._id
        const productId = req.query.productId
        const cartId = req.query.cartId;

        const existItem = await User.findOne({ _id: userId, wishlist: { $in: [productId] } });

        if (!existItem) {

            await User.updateOne({ _id: userId }, { $push: { wishlist: productId } })
            await Product.updateOne({ _id: productId }, { isWishlisted: true })

            await Product.findOneAndUpdate({ _id: productId }, { $set: { isOnCart: false } }, { new: true });
            await User.updateOne({ _id: userId }, { $pull: { cart: { _id: cartId } } });
            res.json({
                message: "Added to wishlist"
            })

        } else {
            res.json({
                message: "Already Exists in the wishlist"
            })
        }

    } catch (error) {
        console.log(error.message);
    }

}

const removeWishlist = async (req, res) => {
    try {

        const userData = req.session.cartUser
        const userId = userData._id
        const productId = req.query.productId

        const user = await User.findById(userId)
        const itemIndex = user.wishlist.indexOf(productId)

        if (itemIndex >= 0) {
            await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } })
            await Product.updateOne({ _id: productId }, { isWishlisted: false })

            res.status(200).send();
        } else {
            res.json({
                message: "Error Occured!"
            })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const removeCart = async (req, res) => {
    try {
        console.log('hi')
        const userData = req.session.cartUser;
        const userId = userData._id;
        const productId = req.query.productId;
        const cartId = req.query.cartId;

        await Product.findOneAndUpdate({ _id: productId }, { $set: { isOnCart: false } }, { new: true });
        await User.updateOne({ _id: userId }, { $pull: { cart: { _id: cartId } } });
        res.status(200).send();
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadWishlist,
    addToWishlist,
    addToCartFromWishlist,
    removeWishlist,
    removeCart
}