const Banner = require('../Models/bannerSchema')
const Coupon = require('../Models/couponSchema')
const uploadImg = require("../middlewares/uploadImg");
const multer = require("multer");
const sharp = require("sharp");
const fs = require('fs/promises');
const path = require('path');

const displayBannerManagement = async(req, res) => {
    try {
        const activeMenuItem = "/banner";
        const coupons = await Coupon.find()
        let banner = await Banner.find()
    banner = banner[0].filename
    res.render("admin/banner", {
      title: "Banner Management",
      layout: "layouts/adminLayout",
        activeMenuItem,
        coupons,
        banner
    });
    } catch (error) {
        console.log(error);
    }
}

const addBanner = (req, res) => {
    try {
        uploadImg.single("image")(req, res, async (error) => {
          if (error instanceof multer.MulterError) {
            req.flash("errorMsg", error);
            res.redirect("/admin-panel/banner");
            return;
          }
        
          if (!req.file) {
            req.flash("errorMsg", "No valid image was uploaded.");
            res.redirect("/admin-panel/banner");
            return;
            }
            
    
          const croppedImagePath = `./public/admin/productImgMulter/${req.file.filename}`;
          
          // Perform image cropping using Sharp and save the result to a file
          await sharp(req.file.path)
            .resize(1920, 800, { fit: 'cover', background: 'white' }) // Apply fit contain and white background color
            .toFile(croppedImagePath);
          
          deleteAllFilesInDir('./public/admin/uploads')
          
            const isBanner = await Banner.find()
            if (isBanner.length) {
                await Banner.findByIdAndUpdate({_id:isBanner[0]._id}, {
                    filename:req.file.filename
                })
            } else {
                const newBanner = new Banner({
                    filename:req.file.filename
                })
                newBanner.save()
            }
            res.redirect(`/admin-panel/banner`)
        })
      } catch (error) {
        console.log(error);
    }
}

module.exports = {
    displayBannerManagement,
    addBanner
}

async function deleteAllFilesInDir(dirPath) {
    try {
      const files = await fs.readdir(dirPath);
  
      const deleteFilePromises = files.map(file =>
        fs.unlink(path.join(dirPath, file)),
      );
  
      await Promise.all(deleteFilePromises);
    } catch (err) {
      console.log(err);
    }
  }