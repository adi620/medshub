const Product = require("../models/productModel");
const fs = require("fs");
const service = require("../services/product.service");
const HttpError = require("../middlewares/HttpError");

// ======================================================================
//                        ADD PRODUCT
// ======================================================================
const addProduct = async (req, res, next) => {
  try {
    const {
      productName,
      productPrice,
      availableStatus,
      productBrand,
      productCategory,
      productDescription,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return next(new HttpError(400, "No product images uploaded"));
    }

    const url = req.protocol + "://" + req.get("host");
    const productImage = req.files.map(file => `${url}/productimages/${file.filename}`);

    const body = {
      productName,
      productPrice,
      availableStatus,
      productImage,
      productBrand,
      productCategory,
      productDescription,
    };

    const { newProduct, error } = await service.postProductApi(body);

    if (error) return next(error);

    return res.json({ status: "200", newProduct });

  } catch (err) {
    return next(err);
  }
};

// ======================================================================
//                        UPDATE PRODUCT
// ======================================================================
const updateProduct = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const {
      productName,
      productPrice,
      availableStatus,
      productBrand,
      productCategory,
      productDescription,
      productImage, // old image
    } = req.body;

    let finalImages = productImage; // default: existing images

    // If new images uploaded, replace with new ones
    if (req.files && req.files.length > 0) {
      const url = req.protocol + "://" + req.get("host");
      finalImages = req.files.map(file => `${url}/productimages/${file.filename}`);
    }

    const body = {
      productName,
      productPrice,
      availableStatus,
      productBrand,
      productCategory,
      productDescription,
      productImage: finalImages,
    };

    const data = { _id, body };

    const { product, error } = await service.updateProductApi(data);

    if (error) return next(error);

    return res.json({ status: "200", product });

  } catch (err) {
    return next(err);
  }
};

// ======================================================================
//                     GET ALL USER-VISIBLE PRODUCTS
// ======================================================================
const getProduct = async (req, res, next) => {
  const { products, error } = await service.getproductApi();

  if (error) return next(error);

  return res.status(200).json(products);
};

// ======================================================================
//                        DELETE PRODUCT
// ======================================================================
const deleteProduct = async (req, res, next) => {
  const _id = req.params.id;

  const { success, error } = await service.deleteProductApi(_id);

  if (error) return next(error);

  return res.json({ status: "200", success });
};

// ======================================================================
//                        GET ALL PRODUCTS (ADMIN)
// ======================================================================
const getAllProduct = async (req, res, next) => {
  const { products, error } = await service.getAllProductApi();

  if (error) return next(error);

  return res.status(200).json(products);
};

// ======================================================================
//                       SEARCH PRODUCT BY NAME
// ======================================================================
const getSearchProduct = async (req, res, next) => {
  const search = req.params.name;

  const { found, error } = await service.searchProductApi(search);

  if (error) return next(error);

  return res.json({ status: "200", found });
};

// ======================================================================
//                     SEARCH PRODUCT BY BRAND
// ======================================================================
const getSearchProductbyBrand = async (req, res, next) => {
  const brand = req.params.brand;

  const { found, error } = await service.searchProductbyBrand(brand);

  if (error) return next(error);

  return res.json({ status: "200", found });
};

// ======================================================================
//                    SEARCH PRODUCT BY CATEGORY
// ======================================================================
const getSearchProductbyCategory = async (req, res, next) => {
  const category = req.params.category;

  const { found, error } = await service.searchProductbyCategory(category);

  if (error) return next(error);

  return res.json({ status: "200", found });
};

// ======================================================================

module.exports = {
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProduct,
  getSearchProduct,
  getSearchProductbyBrand,
  getSearchProductbyCategory,
};
