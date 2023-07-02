require('dotenv').config();
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE)
const express = require('express')
const app = express()
const path = require('path')
const userRoute = require('./route/userRoute')
const adminRoute = require('./route/adminRoute')
const bodyparser = require('body-parser')
const logger = require('morgan')
const nocache = require('nocache')
const { v4: uuidv4 } = require('uuid')
const Handlebars = require('handlebars')
const session = require('express-session')
const cookieParser = require('cookie-parser');
const hbs = require('hbs')
const Razorpay = require('razorpay');
const moment = require('moment');



////////////////razor pay///////////////////////////////

const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_PASS,
});


/////////////////helper functions/////////////////////////////////

hbs.registerHelper('incrementedIndex', function (index) {
  return index + 1;
});

hbs.registerHelper('pagination', function (currentPage, totalPages) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  return pages;
});


hbs.registerHelper('formatDate', function (date) {

  return moment(date).format('YYYY-MM-DD'); // Example format: 'YYYY-MM-DD'
});

hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

hbs.registerHelper('or', function (a, b) {
  return a || b;
});

hbs.registerHelper('subtract', function (a, b) {
  return a - b;
});


hbs.registerHelper('add', function (a, b) {
  return a + b;
});

hbs.registerHelper('mul', function (a, b) {
  return a * b;
});

//////////////////end of helper functions/////////////////////////



app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'hbs');
app.use(express.static('./public'))

app.use(session({
  secret: uuidv4(),
  saveUninitialized: true,
  cookie: {
    maxAge: 600000000,
  },
  resave: false
}));

app.use(nocache());
app.use(logger('dev'));
app.use(cookieParser());

///////for user router/////////

app.use('/admin', adminRoute)

app.use('/', userRoute)


///////for admin router////////

app.use(async function(req,res,next){
  res.render('../view/users/404');
})


app.listen(process.env.PORT, function () {
  console.log('server is running on http://localhost:3000/')
})



