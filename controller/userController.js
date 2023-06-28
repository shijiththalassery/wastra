const User = require('../model/userModel')
const Category = require("../model/catagoryModel");
const Product = require("../model/productModel");
const Banner = require("../model/bannerModel");
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const path = require('path')



////////////////////////////////////////////////////////////


function generateOTP() {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

const sendOtpMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODE_MAILER_ID,
        pass: process.env.NODE_MAILER_KEY
      }
    });

    // Define email options

    const mailOptions = {
      from: process.env.MY_EMAIL,
      to: email,
      subject: 'Your OTP for user verification',
      text: `Your OTP is ${otp}. Please enter this code to verify your account.</b>`
    };

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    console.log(result);
  } catch (error) {

    console.log(error.message);
  }
}

const securePassword = async (password) => {
  try {

    const passwordHash = await bcrypt.hash(password, 10)
    return passwordHash

  } catch (error) {
    console.log(error.message);
  }
}


/////////////////////////////////////////////////////////////////////////////

const loadRegister = async (req, res) => {

  try {
    res.render('registration')
  }
  catch (error) {
    console.log(error.message)
  }
}

const sendOtp = async (req, res) => {
  try {
    const name = req.session.globalName;
    const email = req.session.globalEmail;
    const password = req.session.globalPassword;
    const mobile = req.session.golbalMobile;

    const emailExist = await User.findOne({ email: req.body.email ? req.body.email : email });
    if (!emailExist) {
      const generatedOtp = generateOTP();
      req.session.otp = generatedOtp;
      req.session.globalName = req.body.name ? req.body.name : req.session.globalName;
      req.session.globalEmail = req.body.email ? req.body.email : req.session.globalEmail;
      req.session.golbalMobile = req.body.mobile ? req.body.mobile : req.session.golbalMobile;
      req.session.globalPassword = req.body.password ? req.body.password : req.session.globalPassword;
      sendOtpMail(req.session.globalEmail, generatedOtp);
      setTimeout(() => {
        req.session.otp = null;
      }, 90000);
      res.redirect('/otpPage');
    } else {
      res.redirect("login");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadOtpPage = async (req, res) => {

  try {
    const gmail = req.session.globalEmail
    const maskedEmail = `${gmail.slice(0, 3)}****@gmail.com`;
    res.render('otpPage', { maskedEmail })
  } catch (error) {
    console.log(error.message)
  }
}

const verifyOtp = async (req, res) => {

  const EnteredOtp = req.body.otp;
  if (EnteredOtp == req.session.otp) {
    const securedPassword = await securePassword(req.session.globalPassword);
    const newUser = new User({
      name: req.session.globalName,
      email: req.session.globalEmail,
      mobile: req.session.golbalMobile,
      is_blocked: false,
      password: securedPassword,
    });
    await newUser.save();
    const successMessage = 'You are successfully registered.';
    res.redirect('/login?message=' + encodeURIComponent(successMessage));
  } else {
    res.render("otpPage", { invalidOtp: "wrong OTP" })
  }
}

const loginLoad = async (req, res) => {

  try {
    if (req.query.message) {
      const successMessage = req.query.message;
      res.render('login', { successMessage })
    } else {
      res.render('login')
    }
  } catch (error) {
    console.log(error.message)
  }
}

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    let userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (userData.is_blocked === true) {
        return res.render("login", {
          blocked: "Your account is blocked - conatct: wastra@gmail.com",
        });
      }

      if (passwordMatch) {
        req.session.user = true;
        req.session.blockedUser = userData._id;
        req.session.cartUser = userData;
        res.redirect("/home",);
      } if (!passwordMatch) {
        res.render("login", { invalid: "Entered Email or Password is wrong" });
      }


    } else {
      res.render("login", { invalid: "You are not registered. Create account now!!" });
    }
  }
  catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {


    const bannerData = await Banner.find()
    const user = req.session.user;

    const categoryData = await Category.find({ is_blocked: false });
    if (user) {
      const userId = req.session.cartUser._id;
      const userData = await User.findById(userId)
      res.render("home", { categoryData, user, userData, bannerData })
    }
    else {
      res.render("home", { categoryData, bannerData })
    }
  } catch (error) {
    console.log(error.message);
  }
}

const loadForgotPage = async (req, res) => {

  try {
    res.render('forgotPage')
  } catch (error) {
    console.log(error.message)
  }
}
const forgotSendOtp = async (req, res) => {
  try {
    const forgotEmail = req.body.email
    const emailExist = await User.findOne({ email: forgotEmail });
    if (emailExist) {
      const generatedOtp = generateOTP();

      req.session.forgotOtp = generatedOtp;
      req.session.globalEmail = req.body.email ? req.body.email : req.session.globalEmail;
      sendOtpMail(forgotEmail, req.session.forgotOtp);

      setTimeout(() => {
        req.session.forgotOtp = null;
      }, 90000);
      res.redirect('/password_otp_verification')
    }
    else {
      res.render("forgotPage", { message: 'Email is not registered' })
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadForgotOtpPage = async (req, res) => {
  try {
    res.render('forgotpasswordOtp')
  } catch (error) {
    console.log(error.message)
  }
}

const verifyOtpWithoutPassword = async (req, res) => {
  try {
    const EnteredOtp = req.body.otp;
    if (EnteredOtp == req.session.forgotOtp) {
      req.session.user = true;
      res.redirect("/");
    } else {
      res.render("forgotpasswordOtp", { invalidOtp: "wrong OTP" })
    }
  } catch (error) {
    console.log(error.message);
  }
}

const toHome = async (req, res) => {
  try {
    res.redirect('/')
  } catch (error) {
    console.log(error.message)
  }
}

const Logout = async (req, res) => {
  try {

    delete req.session.user;
    delete req.session.cartUser;

    const sessionVariableNames = Object.keys(req.session);
    sessionVariableNames.forEach(Element => console.log(sessionVariableNames))
    console.log(sessionVariableNames)

    res.redirect('/login')

  } catch (error) {
    console.log(error.message);
  }
}



const addToCart = async (req, res) => {
  try {
    const userData = req.session.cartUser;
    const productId = req.query.id;
    const quantity = req.query.quantity;
    const extractUserId = req.session.cartUser
    const userId = extractUserId._id;
    const product = await Product.findById(productId);
    const existed = await User.findOne({ _id: userId, "cart.product": productId });

    if (existed) {
      await User.findOneAndUpdate(
        { _id: userId, "cart.product": productId },
        { $inc: { "cart.$.quantity": quantity } },
        { new: true }
      );

      res.json({ message: "Item already in cart!!" });
    } else {
      await Product.findOneAndUpdate(productId, { isOnCart: true });
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            cart: {
              product: product._id,
              quantity: quantity,
            },
          },
        },
        { new: true }
      );
      res.json({ message: "Item added to cart" });

    }
  } catch (error) {
    console.log(error.message);
  }
};


const updateCart = async (req, res) => {
  console.log(1000)
  try {
    const userData = req.session.cartUser;
    const data = await User.find({ _id: userData._id }, { _id: 0, cart: 1 }).lean();

    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
    });

    await User.updateOne({ _id: userData._id }, { $set: { cart: data[0].cart } });
    res.status(200).send();
  } catch (error) {
    console.log(error.message);
  }
}



module.exports = {
  loadRegister,
  sendOtp,
  loadOtpPage,
  verifyOtp,
  verifyLogin,
  loginLoad,
  loadHome,
  loadForgotPage,
  forgotSendOtp,
  loadForgotOtpPage,
  verifyOtpWithoutPassword,
  toHome,
  Logout,
  updateCart,
  addToCart
}