const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    mobile: {
        type: Number,
        required: true
    },

    addressLine: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    pincode: {
        type: Number,
        required: true
    },

    is_default: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('address', addressSchema)