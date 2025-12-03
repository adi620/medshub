const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const adminauth = require("../middlewares/adminauth");
const upload = require("../config/multer"); // ✅ CLOUDINARY MULTER

const {
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getSearchProduct,
  getSearchProductbyBrand,
  getSearchProductbyCategory,
} = require("../controllers/product.controller");

// ✅ ADMIN ROUTES
router.post(
  "/addProduct",
  auth,
  adminauth,
  upload.array("productImage", 4), // ✅ CLOUDINARY UPLOAD
  addProduct
);

router.get("/getAllProducts", auth, adminauth, getAllProduct);

router.put(
  "/updateProduct/:id",
  auth,
  adminauth,
  upload.array("productImage", 4), // ✅ CLOUDINARY UPLOAD
  updateProduct
);

router.delete("/deleteProduct/:id", auth, adminauth, deleteProduct);

// ✅ USER ROUTES
router.get("/getProducts", getProduct);
router.get("/getAllProducts", getAllProduct);
router.get("/getSearchProduct/:name", getSearchProduct);
router.get("/getSearchProductbyBrand/:brand", getSearchProductbyBrand);
router.get("/searchProductbyCategory/:category", getSearchProductbyCategory);

module.exports = router;
