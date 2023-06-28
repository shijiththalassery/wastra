const multer = require('multer')
const path = require('path')
const sharp = require("sharp");
const fs = require("fs");


const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
  'image/avif': 'avif',
  'image/webp': 'webp'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if (isValid) {
      uploadError = null
    }
    cb(uploadError, path.join(__dirname, '../public/uploads'))
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + '_' + file.originalname;
    cb(null, fileName)
  }
})

const store = multer({ storage: storage });

const sharpImage = (req, res, next) => {
  req.files.forEach((file) => {
    const inputBuffer = fs.readFileSync(file.path);
    sharp(inputBuffer)
      .resize({ width: 350, height: 500, fit: "cover" })
      .toFile(file.path, (err) => {
        if (err) throw err;
      });
  });

  next();
};

module.exports = { store, sharpImage };


