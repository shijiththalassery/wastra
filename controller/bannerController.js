const Banner = require('../model/bannerModel')
const cloudinary = require("../config/cloudinary");


const loadBannerListPage = async (req, res) => {
    try {
        const bannerData = await Banner.find()
        res.render('admin_banner', { bannerData })
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddBannerPage = async (req, res) => {
    try {
        res.render('add_banner')
    } catch (error) {
        console.log(error.message)
    }
}

const AddBannerPage = async (req, res) => {
    try {
        let bannerName = req.body.bannerName;
        const bannerLink = req.body.bannerLink;
        const bannerDescription = req.body.description;
        const bannerImage = req.file
        const result = await cloudinary.uploader.upload(bannerImage.path, {
            folder: "banners",
        });
        bannerName = bannerName.toUpperCase()
        const banner = new Banner({
            title: bannerName,
            imageUrl: {
                public_id: result.public_id,
                url: result.secure_url,
            },
            link: bannerLink,
            active: true,
            description: bannerDescription
        })
        await banner.save();
        res.redirect('/admin/banner')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadBannerListPage,
    loadAddBannerPage,
    AddBannerPage
}