const Medicine = require("../models/medicineModel");
const service = require("../services/medicine.service");
const HttpError = require("../middlewares/HttpError");

// ---------------------- ADD MEDICINE ----------------------
const addMedicine = async (req, res, next) => {
  try {
    const {
      medicineName,
      medicinePrice,
      manufacturerName,
      availableStatus,
      medicineCategory,
      medicineDescription,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return next(new HttpError(400, "No images uploaded"));
    }

    const baseUrl = req.protocol + "://" + req.get("host");
    const medicineImage = req.files.map(
      (file) => `${baseUrl}/medicineImages/${file.filename}`
    );

    const body = {
      medicineName,
      medicinePrice,
      medicineImage,
      manufacturerName,
      availableStatus,
      medicineCategory,
      medicineDescription,
    };

    const result = await service.postMedicineApi(body);
    if (result.error) return next(result.error);

    return res.json({ status: "200", newMeds: result.newMeds });
  } catch (error) {
    next(error);
  }
};

// ---------------------- GET ALL MEDICINES ----------------------
const getAllMedicine = async (req, res, next) => {
  try {
    const result = await service.getMedicineApi();
    if (result.error) return next(result.error);

    return res.json({ status: "200", medicines: result.medicines });
  } catch (error) {
    next(error);
  }
};

// ---------------------- UPDATE MEDICINE ----------------------
const updateMedicine = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const existing = await Medicine.findById(_id);

    if (!existing) {
      return next(new HttpError(404, "Medicine not found"));
    }

    const {
      medicineName,
      medicinePrice,
      manufacturerName,
      availableStatus,
      medicineCategory,
      medicineDescription,
    } = req.body;

    let medicineImage = req.body.medicineImage;

    // If new images uploaded → replace
    if (!medicineImage || medicineImage.length === 0) {
      if (!req.files || req.files.length === 0) {
        // keep old images
        medicineImage = existing.medicineImage;
      } else {
        const baseUrl = req.protocol + "://" + req.get("host");
        medicineImage = req.files.map(
          (file) => `${baseUrl}/medicineImages/${file.filename}`
        );
      }
    }

    const body = {
      medicineName,
      medicinePrice,
      manufacturerName,
      medicineImage,
      availableStatus,
      medicineCategory,
      medicineDescription,
    };

    const data = { _id, body };
    const result = await service.updateMedicineApi(data);

    if (result.error) return next(result.error);

    return res.json({ status: "200", medicine: result.medicine });
  } catch (error) {
    next(error);
  }
};

// ---------------------- DELETE MEDICINE ----------------------
const deleteMedicine = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const result = await service.deleteMedicineApi(_id);

    if (result.error) return next(result.error);

    return res.json({ status: "200", success: result.success });
  } catch (error) {
    next(error);
  }
};

// ---------------------- SEARCH MEDICINE ----------------------
const getSearchMedicine = async (req, res, next) => {
  try {
    const med = req.params.name;

    const result = await service.searchMedicineApi(med);
    if (result.error) return next(result.error);

    return res.json({ status: "200", searchmed: result.searchmed });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMedicine,
  getAllMedicine,
  updateMedicine,
  deleteMedicine,
  getSearchMedicine,
};
