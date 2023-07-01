const User = require('../model/userModel')
const Category = require("../model/catagoryModel");
const Product = require("../model/productModel");
const Order = require('../model/orderModel')
const Address = require('../model/adressModel')
const Coupon = require('../model/couponModel')
const Razorpay = require('razorpay');
const moment = require('moment');
const { ObjectId } = require('mongodb');
//const puppeteer = require('puppeteer');
//const { PDFDocument, StandardFonts } = require('pdf-lib');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const pdf = require('html-pdf');
const path = require('path')




const checkStock = async (req, res) => {
    try {
        const userData = req.session.cartUser;
        const userId = userData._id;

        const userCart = await User.findOne({ _id: userId }).populate("cart.product").lean();
        const cart = userCart.cart;
        let stock = [];

        cart.forEach((element) => {
            if (element.product.stock - element.quantity <= 0) {
                stock.push(element.product);
            }
        });

        if (stock.length > 0) {
            res.json(stock);
        } else {
            res.json({ message: "In stock" });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadCheckOut = async (req, res) => {
    try {
        console.log(102)
        const userDetail = req.session.cartUser
        const userData = await User.findById(userDetail._id)
        const userId = userData._id;
        const categoryData = await Category.find({ is_blocked: false });
        const addressData = await Address.find({ userId: userId });

        const userCart = await User.findOne({ _id: userId }).populate("cart.product").lean();
        const cart = userCart.cart;

        let subTotal = 0;

        cart.forEach((element) => {
            element.total = element.product.price * element.quantity;
            subTotal += element.total;
        });
        const now = new Date();
        const availableCoupons = await Coupon.find({
            expiryDate: { $gte: now },
            usedBy: { $nin: [userId] },
            status: true,
        });


        res.render("checkOut", { userData, categoryData, addressData, subTotal, cart, availableCoupons });
    } catch (error) {
        console.log(error.message);
    }
};




const placeOrder = async (req, res) => {

    const couponData = req.body.couponData;
    const currentUser = req.session.cartUser;
    const userId = currentUser._id;
    const addressId = req.body.selectedAddress;
    const payMethod = req.body.selectedPayment;
    const userData = await User.findOne({ _id: userId }).populate('cart.product')
    const cartProduct = userData.cart


    let couponName
    let subTotal = 0;

    cartProduct.forEach((val) => {
        val.total = val.product.price * val.quantity
        subTotal += val.total
    })
    const totalPrice = subTotal
    if (couponData) {
        const couponDiscount = couponData.discountAmount;
        subTotal = subTotal - couponDiscount;
        couponName = couponData.couponName;
    }


    let productDetail = cartProduct.map(item => {
        return {
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.imageUrl[0].url,
        }
    })

    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const ordeId = result + id;


    let saveOrder = async () => {

        if (couponData) {
            const couponName = couponData.couponName
            const order = new Order({
                userId: userId,
                product: productDetail,
                address: addressId,
                orderId: ordeId,
                total: totalPrice,
                paymentMethod: payMethod,
                discountAmount: couponData.discountAmount,
                totalAmount: subTotal,
                couponName: couponName

            })
            await Coupon.updateOne({ code: couponName }, { $push: { usedBy: userId } });
            await order.save()
            const ordered = await order.save()
            console.log('order saved with coupon code')
        } else {
            const order = new Order({
                userId: userId,
                product: productDetail,
                address: addressId,
                orderId: ordeId,
                total: subTotal,
                paymentMethod: payMethod,
                totalAmount: subTotal,
            })

            await order.save()
            const ordered = await order.save()
        }
    }

    let userDetails = await User.findById(userId)
    let userCart = userDetails.cart

    userCart.forEach(async item => {
        const productId = item.product
        const qty = item.quantity

        const product = await Product.findById(productId)
        const stock = product.stock
        const updatedStock = stock - qty

        await Product.updateOne(
            { _id: productId },
            { $set: { stock: updatedStock, isOnCart: false } }
        );

    })

    userDetails.cart = []
    await userDetails.save()

    if (addressId) {
        if (payMethod === 'Cash On Delivery') {
            saveOrder()
            res.json({
                CODsuccess: true,
                total: subTotal,
                message: 'success'
            });
        }
        if (payMethod === 'razorpay') {

            const amount = req.body.amount

            var instance = new Razorpay({
                key_id: process.env.KEY_ID,
                key_secret: process.env.KEY_PASS,
            });

            const order = await instance.orders.create({
                amount: amount * 100,
                currency: 'INR',
                receipt: 'shijith',
            })
            saveOrder()

            res.json({
                razorPaySucess: true,
                order,
                amount,
            })
        }
        if (payMethod === 'Wallet') {

            const newWallet = req.body.updateWallet
            const userData = req.session.cartUser
            const userId = userData._id

            await User.findByIdAndUpdate(userId, { $set: { wallet: newWallet } }, { new: true })
            saveOrder()
            res.json(newWallet)
        }
    }
}

const loadOrderList = async (req, res) => {
    try {

        const orderDetail = await Order.find().sort({ _id: -1 })
        const orderData = await Order.aggregate([
            { $sort: { _id: -1 } },
            {
                $lookup: {
                    from: 'addresses',
                    localField: 'address',
                    foreignField: '_id',
                    as: 'addresses'
                }
            }
        ]);
        res.render('admin_order_list', { orderData })
    } catch (error) {
        console.log(error.message)
    }
}
const changeStatus = async (req, res) => {
    try {
        const id = req.query.id;
        const status = req.body.status;
        const deliveredDate = new Date();
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 5);
        if (status == 'Delivered') {
            const order = await Order.findByIdAndUpdate(
                id,
                { $set: { deliveredDate: deliveredDate, returnDate: returnDate } },
                { new: true }
            );
        }
        const order = await Order.findByIdAndUpdate(
            id,
            { $set: { status: status } },
            { new: true }
        );
        res.redirect("/admin/orders");
    } catch (error) {
        console.log(error.message)
    }
}

const orderSuccess = async (req, res) => {
    try {
        const orderDetail = await Order.find().sort({ _id: -1 }).limit(1);
        const userDetail = req.session.cartUser;
        const userId = userDetail._id
        const user = await User.find({ _id: userId });

        res.render('orderSuccess', { orderDetail, user })
    } catch (error) {
        console.log(error.message)
    }
}

const viewOrderDetail = async (req, res) => {
    try {
        const order = req.query.id;
        const today = new Date();
        const orderId = new ObjectId(order);
        const orderDetails = await Order.findById(orderId);
        const address = await Address.findById(orderDetails.address)
        const product = orderDetails.product

        const clearOrderData = await Order.aggregate([
            { $match: { _id: orderId } },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "addresses",
                    localField: "address",
                    foreignField: "_id",
                    as: "address"
                }
            },
            { $unwind: "$address" }
        ])
        console.log(clearOrderData, 'shijith clear ordr data')

        res.render('orderManage', { orderDetails, clearOrderData, address, product, today })
    } catch (error) {
        console.log(error.message)
    }
}

const cancellOrder = async (req, res) => {
    try {
        const user = req.session.cartUser;
        const userData = await User.findById(user._id)

        const orderId = req.query.id;
        let orderData = await Order.findById(orderId);

        const productId = orderData.product[0].id;
        const product = await Product.findById(productId);
        let newStock = product.stock + orderData.product[0].quantity

        const status = 'Cancelled';
        const order = await Order.findByIdAndUpdate(
            orderId,
            { $set: { status: status } },
            { new: true }
        );
        const productDetail = await Product.findByIdAndUpdate(
            productId,
            { $set: { stock: newStock } },
            { new: true }
        );
        if (orderData.paymentMethod == 'Wallet' || orderData.paymentMethod == 'razorpay') {
            const newWallet = userData.wallet + orderData.totalAmount
            const updateWallet = await User.findByIdAndUpdate(
                userData._id,
                { $set: { wallet: newWallet } },
                { new: true }
            );
        }
        res.redirect('/user_profile/')
    } catch (error) {
        console.log(error.message)
    }
}
const oderDetailsPage = async (req, res) => {

    try {
        const orderId = req.query.id;
        const oderDetail = await Order.findById(orderId)

        res.render('singleOrderDetail', { oderDetail })
    } catch (error) {
        console.log(error.message)
    }
}

const returnOrder = async (req, res) => {
    try {
        const user = req.session.cartUser;
        const oderid = req.query.id;
        const oderData = await Order.findById(oderid)
        const userData = await User.findById(user._id)
        const currenWallet = parseInt(userData.wallet)
        const refundAmount = parseInt(oderData.total)
        const newAmount = currenWallet + refundAmount
        const status = 'Returned'
        const updateWallet = await User.findByIdAndUpdate(
            userData._id,
            { $set: { wallet: newAmount } },
            { new: true }
        );
        const order = await Order.findByIdAndUpdate(
            oderid,
            { $set: { status: status } },
            { new: true }
        );

        res.redirect('/user_profile/')
    } catch (error) {
        console.log(error.message)
    }
}

// const downloadInvoice = async (req, res) => {
//     try {
//         const orderId = req.query.orderId
//         const orderData = await Order.findById(orderId)
//         const browser = await puppeteer.launch({ headless: false })
//         const page = await browser.newPage()


//         await page.goto(`${req.protocol}://${req.get('host')}/invoice?orderId=${orderId}`, {
//             waitUntil: 'networkidle2'
//         })

//         const todayDate = new Date()

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             printBackground: true,
//         });

//         await browser.close()

//         res.set({
//             'Content-Type': 'application/pdf',
//             'Content-Disposition': `attachment; filename=${orderData.orderId}Invoice.pdf`,
//         });

//         res.send(pdfBuffer);
//     } catch (error) {
//         console.log(error.message)
//     }
// }






const renderInvoice = (res, view, data) => {
    console.log('renderInvoice function called');
    return new Promise((resolve, reject) => {
        console.log('res is here')
      res.render(view, data, (err, renderedTemplate) => {
        if (err) {
            console.log('error is generated')
          reject(err);
        } else {
            console.log('resolved aswasam')
          resolve(renderedTemplate);
        }
      });
    });
  };
  
  const downloadInvoice = async (req, res) => {
    try {
      console.log('entering download invoice');
      const orderId = req.query.orderId;
      const orderData = await Order.findById(orderId);
  
      // Render the invoice HBS template to a string
      const renderedInvoice = await renderInvoice('invoice', { orderData });
      console.log(renderedInvoice, 'renderinvoiceeeeeeeeeeeeeeeeeeeeeeeeeeee');
  
      // Create a temporary HTML file with the rendered invoice content
      console.log('shijith pk is here ');
      const tempHtmlFileName = 'temp_invoice.html';
      const tempHtmlPath = path.join(__dirname, tempHtmlFileName);
      fs.writeFileSync(tempHtmlPath, renderedInvoice);
  
      console.log(tempHtmlPath, 'temphtml path is defined here ');
      // Generate the PDF from the HTML file using html-pdf module
      pdf.create(fs.readFileSync(tempHtmlPath, 'utf8')).toStream((err, stream) => {
        if (err) {
          console.error('Error generating PDF:', err);
          // Handle the error appropriately
          return;
        }
  
        // Set the response headers to trigger the download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${orderData.orderId}Invoice.pdf`
        );
  
        // Pipe the PDF stream to the response
        stream.pipe(res);
  
        // Delete the temporary HTML file
        fs.unlinkSync(tempHtmlPath);
      });
    } catch (error) {
      console.log(error.message);
      // Handle the error appropriately
    }
  };
  



//   const invoice = async (req, res) => {
//     try {
//       const orderId = req.query.orderId;
//       const orderData = await Order.findById(orderId);
//       const userDatas = await User.findById(orderData.userId);
//       const address = await Address.findById(orderData.address);
//       const invoiceDate = moment(new Date()).format('MMMM D, YYYY');

//       // Send the invoice data to the invoice template
//       res.render('invoice', {
//         orderData,
//         userDatas,
//         invoiceDate,
//         address,
//       });
//     } catch (error) {
//       console.log(error.message);
//       // Handle the error appropriately
//     }
//   };


module.exports = {
    checkStock,
    loadCheckOut,
    placeOrder,
    loadOrderList,
    changeStatus,
    orderSuccess,
    viewOrderDetail,
    cancellOrder,
    oderDetailsPage,
    returnOrder,
    downloadInvoice,
    //invoice
}