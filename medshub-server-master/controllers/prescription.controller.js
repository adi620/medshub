const PrescriptionServices = require("../services/prescription.service");
const HttpError = require("../middlewares/HttpError");
const nodemailer = require("nodemailer");
const Prescription = require("../models/prescriptionModel");

// ------------------------- UPLOAD PRESCRIPTION -------------------------
const uploadPrescriptionController = async (req, res, next) => {
  try {
    const user = req.user;
    const _id = user._id;

    if (!req.files || req.files.length === 0) {
      return next(new HttpError(400, "No prescription image uploaded"));
    }

    const baseUrl = req.protocol + "://" + req.get("host");
    const prescriptionImage = req.files.map(
      (file) => `${baseUrl}/prescriptionimage/${file.filename}`
    );

    const body = { prescriptionImage, _id };
    const result = await PrescriptionServices.uploadPrescriptionServices(body);

    if (result.error) return next(result.error);
    return res.json({ status: "200", prescription: result.prescription });

  } catch (error) {
    next(error);
  }
};

// ------------------------- GET ALL PRESCRIPTIONS (ADMIN) -------------------------
const allPrescriptionController = async (req, res, next) => {
  try {
    const result = await PrescriptionServices.allPrescriptionService();
    if (result.error) return next(result.error);

    return res.json({ status: "200", allPrescription: result.allPrescription });
  } catch (error) {
    next(error);
  }
};

// ------------------------- UPDATE PRESCRIPTION -------------------------
const updatePrescriptionController = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const updateData = req.body;

    const prescription = await Prescription.findById(_id).populate("owner");
    if (!prescription) return next(new HttpError(404, "Prescription not found"));

    const name = prescription.owner.name;
    const email = prescription.owner.email;

    const updatePayload = { _id, data: updateData };
    const result = await PrescriptionServices.updatePrescriptionServices(updatePayload);

    if (result.error) return next(result.error);

    // Send email to user
    sendEmail(
      email,
      "Prescription Approved",
      `<p>Hello <b>${name}</b>,</p>
       <p>Your medicine prescription has been <b>approved</b> by Medshub24/7. 
       You will receive your medicine within two days.</p>
       <p>If you have any questions, feel free to contact us.</p>
       <p><b>Thanks & Regards</b><br>MedsHub24/7</p>`
    );

    return res.json({
      status: "200",
      updatePrescription: result.updatePrescription,
    });

  } catch (error) {
    next(error);
  }
};

// ------------------------- DELETE PRESCRIPTION -------------------------
const deletePrescriptionController = async (req, res, next) => {
  try {
    const _id = req.params.id;

    const prescription = await Prescription.findById(_id).populate("owner");
    if (!prescription) return next(new HttpError(404, "Prescription not found"));

    const name = prescription.owner.name;
    const email = prescription.owner.email;
    const imageUrl = prescription.prescriptionImage[0];

    const result = await PrescriptionServices.deletePrescriptionServices(_id);
    if (result.error) return next(result.error);

    // Send rejection mail
    sendEmail(
      email,
      "Prescription Rejected",
      `<p>Hello <b>${name}</b>,</p>
       <p>Your medicine prescription has been <b>declined</b> by Medshub24/7 due to invalid or unclear information.</p>
       <img src="${imageUrl}" style="max-width:300px;border:1px solid #ccc;margin-top:10px;" />
       <p>You can upload a new prescription anytime.</p>
       <p><b>Thanks & Regards</b><br>MedsHub24/7</p>`,
      [
        {
          path: imageUrl
        }
      ]
    );

    return res.json({ status: "200", deletePres: result.deletePres });

  } catch (error) {
    next(error);
  }
};

// ------------------------- EMAIL FUNCTION -------------------------
function sendEmail(to, subject, html, attachments = []) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN,
      pass: process.env.PASS,
    },
  });

  transporter.sendMail(
    {
      from: process.env.ADMIN,
      to,
      subject,
      html,
      attachments,
    },
    (err, info) => {
      if (err) console.log("Email error:", err);
      else console.log("Email sent:", info.response);
    }
  );
}

module.exports = {
  uploadPrescriptionController,
  allPrescriptionController,
  updatePrescriptionController,
  deletePrescriptionController,
};
