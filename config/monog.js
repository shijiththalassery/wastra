const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.DATABASE,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>console.log('database connected')).catch((error)=>console.log('error',error));

module.exports = mongoose;