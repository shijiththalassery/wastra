const User = require('../model/userModel')
const Category = require("../model/catagoryModel");
const Product = require("../model/productModel");
const Address = require('../model/adressModel')
const Order = require('../model/orderModel')
const { ObjectId } = require('mongodb');

const loadProfilePage = async (req, res) => {

    try {
        const userData = req.session.cartUser;
        const userId = userData._id;
        const userID = new ObjectId(userId);
        const orderDetail = await Order.aggregate([
            {
              $match: {
                userId: userID
              }
            },
            {
              $unwind: "$product"
            },
            {
              $sort: {
                _id: -1
              }
            }
          ]);
          
          
        const categoryData = await Category.find({ is_blocked: false });
        const addressData = await Address.find({ userId: userId });
        const orderData = await Order.find({ userId: userId }).sort({ _id: -1 });
          console.log(orderData[0].product,'this is order data')
        res.render("userProfile", { userData, categoryData, addressData, orderDetail, orderData, image:orderData[0].product});
    } catch (error) {
        console.log(error.message);
    }

}


const addNewAddress = async (req, res) => {
    try {
        const userData = req.session.cartUser;
        const userId = userData._id;

        const address = new Address({
            userId: userId,
            name: req.body.name,
            mobile: req.body.mobileNumber,
            addressLine: req.body.addressLine,
            city: req.body.city,
            email: req.body.email,
            state: req.body.state,
            pincode: req.body.pincode,
            is_default: false,
        });

        await address.save();
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
        console.log(error.message);
    }
};

const getAddressdata = async (req, res) => {
    try {
        const addressId = req.query.addressId;
        const addressData = await Address.findById(addressId);

        if (addressData) {
            res.json(addressData);
        } else {
            res.json({ message: "Address not found" });
        }
    } catch {
        console.log(error.message);
    }
};

const updateAddress = async (req, res) => {
    console.log(1001)
    try {
        const addressId = req.query.addressId;

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            {
                name: req.body.name,
                mobile: req.body.mobile,
                addressLine: req.body.addressLine,
                email: req.body.email,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
            },
            { new: true }
        );

        if (updatedAddress) {
            res.status(200).send();
        } else {
            res.status(500).send();
        }
    } catch (error) {
        console.log(error.message);
    }
};

const deleteAddress = async (req, res) => {
    try {
        const addressId = req.query.addressId;
        const success = await Address.findByIdAndDelete(addressId);

        if (success) {
            res.status(200).send();
        } else {
            res.status(500).send();
        }
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    loadProfilePage,
    addNewAddress,
    getAddressdata,
    updateAddress,
    deleteAddress
}