const User = require('../model/userModel')
const Category = require("../model/catagoryModel");
const Product = require("../model/productModel");
const Coupon = require('../model/couponModel')
const moment = require('moment');





const loadCouponPage = async (req, res) => {
    console.log('check-1')
    try {
        const coupon = await Coupon.find();
        const couponData = coupon.map((element) => {
            const formattedDate = moment(element.expiryDate).format("MMMM D, YYYY");
            return {
                ...element,
                expiryDate: formattedDate,
            };
        });
        res.render("admin_coupon_list", { couponData });
    } catch (error) {
        console.log(error.messaage);
    }
};


const loadAddCoupon = async (req, res) => {
    try {
        res.render('add_coupon')
    } catch (error) {
        console.log(error.message)
    }
}

const addCoupon = async (req, res) => {
    try {
        console.log(req.body, '---------this is coupon data')
        const { couponCode, couponDiscount, maximumAmount, couponDate, } = req.body;
        const couponCodeUpperCase = couponCode.toUpperCase();
        const couponExist = await Coupon.findOne({ code: couponCodeUpperCase });

        if (!couponExist) {
            const coupon = new Coupon({
                code: couponCodeUpperCase,
                discount: couponDiscount,
                expiryDate: couponDate,
                maxAmount: maximumAmount,
            });

            await coupon.save();
            res.json({ message: "coupon addedd" });
        } else {
            res.json({ messaage: "coupon exists" });
        }
    } catch (error) {
        console.log(error.messaage);
    }
}

const validateCoupon = async (req, res) => {
    try {
        const { coupon, subTotal } = req.body;
        const couponData = await Coupon.findOne({ code: coupon });

        if (!couponData) {
            res.json("invalid");
        } else if (couponData.expiryDate < new Date()) {
            res.json("expired");
        } else {
            const couponId = couponData._id;
            const discount = couponData.discount;
            const userId = req.session.cartUser._id;
            const maxAmount = couponData.maxAmount;

            const couponUsed = await Coupon.findOne({ _id: couponId, usedBy: { $in: [userId] } });

            if (couponUsed) {
                res.json("already used");
            } else {

                let newTotal

                const discountValue = Number(discount);
                const maximumDiscount = Number(maxAmount)
                const discountPrice = (subTotal * discountValue) / 100;

                if (maximumDiscount < discountPrice) {
                    newTotal = subTotal - maximumDiscount;
                } else {
                    newTotal = subTotal - discountPrice;
                }

                const discountAmount = maximumDiscount < discountPrice ? maximumDiscount : discountPrice
                const couponName = coupon

                res.json({
                    discountAmount,
                    newTotal,
                    couponName
                });
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        await Coupon.findByIdAndDelete(id);
        res.redirect("/admin/coupon");

    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {
    loadCouponPage,
    loadAddCoupon,
    addCoupon,
    validateCoupon,
    deleteCoupon
}