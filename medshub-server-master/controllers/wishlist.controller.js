const Wishlist = require("../models/wishlistModel");
const HttpError = require("../middlewares/HttpError");
const service = require("../services/wishlist.service");

// ---------------------- ADD PRODUCT TO WISHLIST ----------------------
const addWishlistProduct = async (req, res, next) => {
  try {
    const { productId } = req.query;
    const user = req.user;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }
    if (!user) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const data = { productId, _id: user._id };
    const result = await service.postWishlistProductApi(data);

    if (result.error) return next(result.error);

    return res.json({ status: "200", liked: result.liked });
  } catch (err) {
    next(err);
  }
};

// ---------------------- GET USER WISHLIST ----------------------
const getWishlist = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Unauthorized user" });

    const result = await service.getWishlistApi(user._id);

    if (result.error) return next(result.error);

    return res.json({ status: "200", list: result.list });
  } catch (err) {
    next(err);
  }
};

// ---------------------- REMOVE ITEM FROM WISHLIST ----------------------
const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlistItemId = req.params.id;

    if (!wishlistItemId) {
      return res.status(400).json({ error: "Wishlist item ID is required" });
    }

    const result = await service.deleteWishlistApi(wishlistItemId);

    if (result.error) return next(result.error);

    return res.json({
      status: "200",
      success: "Item removed from wishlist successfully",
      exist: result.exist,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------- ADD MEDICINE TO WISHLIST ----------------------
const addWishlistMedicine = async (req, res, next) => {
  try {
    const { medicineId } = req.query;
    const user = req.user;

    if (!medicineId) {
      return res.status(400).json({ error: "medicineId is required" });
    }
    if (!user) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    const data = { medicineId, _id: user._id };
    const result = await service.postWishlistMedicineApi(data);

    if (result.error) return next(result.error);

    return res.json({ status: "200", liked: result.liked });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addWishlistProduct,
  getWishlist,
  removeFromWishlist,
  addWishlistMedicine,
};
