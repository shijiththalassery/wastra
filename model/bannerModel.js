const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    public_id: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
},
  link: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: false,
  }
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;