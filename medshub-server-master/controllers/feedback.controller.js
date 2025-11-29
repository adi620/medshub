require("dotenv").config();
const { google } = require("googleapis");
const HttpError = require("../middlewares/HttpError");

// ---------------------- COMMON GOOGLE SHEET HELPER ----------------------
async function appendToSheet(sheetName, values) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: "sheet.json",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = process.env.SPREADSHEETID;

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: "USER_ENTERED",
      resource: { values: [values] },
    });

    return { success: true };
  } catch (err) {
    return { error: err };
  }
}

// -----------------------------------------------------------------------
// ----------------------- WEB FEEDBACK ----------------------------------
const postWebFeedback = async (req, res, next) => {
  try {
    const user = req.user;
    const { feedback } = req.body;

    if (!feedback) {
      return next(new HttpError(400, "Feedback is required"));
    }

    const values = [user._id, user.name, user.phoneNumber, feedback];
    const result = await appendToSheet("feedback", values);

    if (result.error) return next(new HttpError(500, "Failed to save feedback"));

    return res.json({ status: "200", message: "Feedback saved" });
  } catch (err) {
    return next(err);
  }
};

// -----------------------------------------------------------------------
// ------------------------ PRODUCT FEEDBACK ------------------------------
const postProductFeedback = async (req, res, next) => {
  try {
    const user = req.user;
    const { feedback, productId, productName, productBrand } = req.body;

    if (!feedback || !productId) {
      return next(new HttpError(400, "Product feedback and ID required"));
    }

    const values = [
      user._id,
      user.name,
      user.phoneNumber,
      productId,
      productName,
      productBrand,
      feedback,
    ];

    const result = await appendToSheet("products", values);
    if (result.error)
      return next(new HttpError(500, "Failed to save product feedback"));

    return res.json({ status: "200", message: "Product feedback saved" });
  } catch (err) {
    return next(err);
  }
};

// -----------------------------------------------------------------------
// ------------------------ MEDICINE FEEDBACK -----------------------------
const postMedicineFeedback = async (req, res, next) => {
  try {
    const user = req.user;
    const { feedback, medicineId, medicineName } = req.body;

    if (!feedback || !medicineId) {
      return next(new HttpError(400, "Medicine feedback and ID required"));
    }

    const values = [
      user._id,
      user.name,
      user.phoneNumber,
      medicineId,
      medicineName,
      feedback,
    ];

    const result = await appendToSheet("medicines", values);
    if (result.error)
      return next(
        new HttpError(500, "Failed to save medicine feedback")
      );

    return res.json({ status: "200", message: "Medicine feedback saved" });
  } catch (err) {
    return next(err);
  }
};

// -----------------------------------------------------------------------
// ----------------------- ORDER ISSUE FEEDBACK ---------------------------
const postOrderProblem = async (req, res, next) => {
  try {
    const user = req.user;
    const { orderId, itemName, problem } = req.body;

    if (!problem || !orderId) {
      return next(new HttpError(400, "Order issue & orderId required"));
    }

    const values = [
      user._id,
      user.name,
      user.phoneNumber,
      orderId,
      itemName,
      problem,
    ];

    const result = await appendToSheet("orders", values);
    if (result.error)
      return next(new HttpError(500, "Failed to save order problem"));

    return res.json({ status: "200", message: "Order issue recorded" });
  } catch (err) {
    return next(err);
  }
};

// -----------------------------------------------------------------------

module.exports = {
  postWebFeedback,
  postProductFeedback,
  postMedicineFeedback,
  postOrderProblem,
};
