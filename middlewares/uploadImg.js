const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/admin/productImgMulter');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
      cb(null, fileName);
    },
  });
  

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only .png, .jpg, and .jpeg format allowed!"));
      }
    },
  });
  



module.exports = upload