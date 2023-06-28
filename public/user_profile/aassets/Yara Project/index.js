const express = require("express")
const path = require("path");
const app=express()
const hbs = require('hbs')
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session')
const nocache = require('nocache')
const {v4:uuidv4}=require('uuid')
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

require('dotenv').config();


const port=process.env.PORT


app.set('view engine','hbs')


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "public")));
app.use('/assets',express.static(path.join(__dirname,'public/homeimages')))


app.use(session({
    secret: uuidv4(),
    saveUninitialized: true,
    cookie: { maxAge: 600000000 },
    resave: false 
}));


app.use(nocache());
app.use(logger('dev'));
app.use(cookieParser());



/////////////////hbs helper///////////////


hbs.registerPartials(path.join(__dirname,'/views/partials/home'))
hbs.registerPartials(path.join(__dirname,'/views/partials/dashboard'))
hbs.registerPartials(path.join(__dirname,'/views/partials/signup'))


hbs.registerHelper('slice', function(context, start, end) {
    return context.slice(start, end);
});


hbs.registerHelper('each_from_three', function(context, options) {
    var ret = "";
    for(var i=0; i<3 && i<context.length; i++) {
        ret += options.fn(context[i]);
    }
    return ret;
});

hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

hbs.registerHelper('checkStock', function(stock, options) {
    if (stock <= 5) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
});

/////////////////for routes///////////////

app.use("/", userRoute);
app.use("/admin", adminRoute);



app.use(function(req, res, next) {
    const userData=req.session.user
    res.status(404).render('users/404',{userData});
});



app.listen(port,()=>{
    console.log(`server running on http://localhost:${port}/`)
})

