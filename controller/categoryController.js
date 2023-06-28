const User = require('../model/userModel')
const Category = require("../model/catagoryModel");
const Product = require("../model/productModel");
const cloudinary = require("../config/cloudinary");
require("dotenv").config();

const loadCatagoryList = async (req, res) => {

    try {
        const categoryData = await Category.find();
        if (req.session.categoryUpdate) {
            res.render("admin_catagory_list", {
                categoryData,
                newCategoryMessage: "Category updated successfully",
                user: req.session.admin,
            });
            req.session.categoryUpdate = false;
        }
        else if (req.session.categoryExist) {
            res.render("admin_catagory_list", {
                categoryData,
                newCategoryMessage: "Category Already Exists!!",
                user: req.session.admin
            });
            req.session.categoryExist = false;
        }
        else if (req.session.categorySave) {
            res.render("admin_catagory_list", {
                categoryData,
                newCategoryMessage: "Category Added successfully",
                user: req.session.admin
            });
            req.session.categorySave = false;
        }
        else {
            res.render('admin_catagory_list', { categoryData })
        }
    } catch (error) {
        console.log(error.message)
    }
}

const addNewCategory = async (req, res) => {
    const categoryName = req.body.categoryName;
    const categoryDescription = req.body.description
    const image = req.file;
    const lowerCategoryName = categoryName.toLowerCase();
    try {
        const result = await cloudinary.uploader.upload(image.path, {
            folder: "Categories",
        });
        const categoryExist = await Category.findOne({ category: lowerCategoryName });
        if (!categoryExist) {
            const category = new Category({
                category: lowerCategoryName,
                imageUrl: {
                    public_id: result.public_id,
                    url: result.secure_url,
                },
                description: categoryDescription,
                is_blocked: false
            });

            await category.save();
            req.session.categorySave = true;
            res.redirect("/admin/catagories");

        } else {
            req.session.categoryExist = true;
            res.redirect("/admin/catagories");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loadAddCatagoryPage = async (req, res) => {

    try {
        res.render('admin_add_catagory')
    } catch (error) {
        console.log(error.message)
    }
}

const loadEditCategory = async (req, res) => {
    const categoryId = req.params.id;
    try {
        const categoryData = await Category.findById({ _id: categoryId });
        res.render("editCategory", { categoryData: categoryData });
    } catch (error) {
        console.log(error.message);
    }
}
const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryName = req.body.name;
        const lowerCategoryName = categoryName.toLowerCase();
        const categoryDescription = req.body.categoryDescription;
        const newImage = req.file;

        const categoryData = await Category.findById(categoryId);
        const categoryImage = categoryData.imageUrl.url;
        const categoryImageUrl = categoryData.imageUrl.url;
        let updatedImage;
        if (newImage) {
            if (categoryImageUrl) {
                await cloudinary.uploader.destroy(categoryData.imageUrl.public_id);
            }
            result = await cloudinary.uploader.upload(newImage.path, {
                folder: "Categories",
            });
        } else {
            result = {
                public_id: categoryData.imageUrl.public_id,
                secure_url: categoryImageUrl,
            };
        }

        const catExist = await Category.findOne({ category: lowerCategoryName });

        if (!catExist || catExist._id.equals(categoryId)) { 
            await Category.findByIdAndUpdate(
                categoryId,
                {
                    category: lowerCategoryName,
                    imageUrl: {
                        public_id: result.public_id,
                        url: result.secure_url,
                    },
                    description: categoryDescription,
                    is_blocked: false
                },
                { new: true }
            );
            req.session.categoryUpdate = true;
            res.redirect("/admin/catagories");
        } else {
            req.session.categoryExist = true;
            res.redirect("/admin/catagories");
        }
    } catch (error) {
        console.log(error.message);
    }
};



const listAndUnlistCategory = async (req, res) => {

    try {
        const id = req.params.id;
        const blocCategory = await Category.findById(id);

        await Category.findByIdAndUpdate(id, { $set: { is_blocked: !blocCategory.is_blocked } }, { new: true });
        res.redirect("/admin/catagories");
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCatagoryList,
    addNewCategory,
    loadAddCatagoryPage,
    loadEditCategory,
    updateCategory,
    listAndUnlistCategory,
}