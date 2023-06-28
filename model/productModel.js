const mongoose = require('mongoose')
const { array } = require('../middleware/multer')

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    imageUrl: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        },
    ],
    is_blocked: {
        type: Boolean,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },

    isOnCart: {
        type: Boolean,
        default: false
    },
    isWishlisted: {
        type: Boolean,
        default: false
    },
    reviews: [
        {
            review: {
                type: String,
                required: false,
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                required: false
            },
            name: {
                type: String,
                required: false
            },
            date: {
                type: Date,
                required: false
            }
        }
    ]
})


module.exports = mongoose.model('Product', productSchema)