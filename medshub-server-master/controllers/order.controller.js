const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

const orderServices = require("../services/order.service");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Medicine = require("../models/medicineModel");
const easyinvoice = require("easyinvoice");

// COMMON EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN,
    pass: process.env.PASS,
  },
});

// ---------------------- PLACE ORDER ----------------------
const placeOrderController = async (req, res, next) => {
  try {
    const { productId, medicineId } = req.query;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "User not authenticated" });

    const payload = {
      productId,
      medicineId,
      _id: user._id,
      email: user.email,
      username: user.name,
      address: user.address,
    };

    const response = await orderServices.placeOrderServices(payload);
    const { order, error } = response;

    if (error) return next(error);

    let item = null;

    if (order.product) {
      item = await Product.findById(order.product).lean();
    } else if (order.medicine) {
      item = await Medicine.findById(order.medicine).lean();
    }

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Prepare invoice
    const invoiceData = {
      sender: {
        company: "MedsHub24/7",
        address: "GLS University",
        zip: "380006",
        city: "Ahmedabad",
        country: "India",
      },
      client: {
        company: user.name,
        address: user.address,
        country: "India",
      },
      information: {
        number: order._id.toString(),
        date: new Date().toLocaleDateString(),
      },
      products: [
        {
          quantity: 1,
          description: item.productName || item.medicineName,
          price: item.productPrice || item.medicinePrice,
        },
      ],
      bottomNotice: "Thank you for ordering from MedsHub24/7.",
      settings: { currency: "INR", "tax-notation": "gst" },
    };

    const invoice = await easyinvoice.createInvoice(invoiceData);
    const invoicePath = `./invoice_${order._id}.pdf`;
    fs.writeFileSync(invoicePath, invoice.pdf, "base64");

    // EMAIL CONTENT
    const htmlTemplate = `
      <p>Hello <b>${user.name}</b>,</p>
      <p>Thank you for your order of <b>${item.productName || item.medicineName}</b>.</p>
      <p>Your order will be shipped in 3–5 business days.</p>
      <hr/>
      <p><b>Order Details:</b></p>
      <p>Name: ${item.productName || item.medicineName}</p>
      <p>Description: ${item.productDescription || item.medicineDescription}</p>
      <p>Price: ₹${item.productPrice || item.medicinePrice}</p>
      <hr/>
      <p>Invoice is attached.</p>
      <p>Regards,<br/>MedsHub24/7</p>
    `;

    await transporter.sendMail({
      from: process.env.ADMIN,
      to: user.email,
      subject: "Order Confirmation - MedsHub24/7",
      html: htmlTemplate,
      attachments: [{ path: invoicePath }],
    });

    return res.json({ status: "200", order });
  } catch (err) {
    next(err);
  }
};

// ---------------------- USER ORDERS ----------------------
const myOrderController = async (req, res, next) => {
  try {
    const user = req.user;
    const response = await orderServices.myOrderServices(user._id);

    const { myOrder, error } = response;
    if (error) return next(error);

    res.json({ status: "200", myOrder });
  } catch (err) {
    next(err);
  }
};

// ---------------------- CANCEL ORDER ----------------------
const cancleOrderController = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const user = req.user;

    const details = await Order.findById(orderId)
      .populate("product")
      .populate("medicine");

    const response = await orderServices.cancleOrderServices(orderId);
    const { cancleOrder, error } = response;

    if (error) return next(error);

    const item = details.product || details.medicine;

    const htmlTemplate = `
      <p>Hello ${user.name},</p>
      <p>Your order has been successfully cancelled.</p>
      <hr/>
      <p><b>Order Details:</b></p>
      <p>Name: ${item.productName || item.medicineName}</p>
      <p>Description: ${item.productDescription || item.medicineDescription}</p>
      <p>Price: ₹${item.productPrice || item.medicinePrice}</p>
      <hr/>
      <p>If you need help, contact support.</p>
      <p>Regards,<br/>MedsHub24/7</p>
    `;

    await transporter.sendMail({
      from: process.env.ADMIN,
      to: user.email,
      subject: "Order Cancelled",
      html: htmlTemplate,
    });

    res.json({ status: "200", cancleOrder });
  } catch (err) {
    next(err);
  }
};

// ---------------------- ADMIN: ALL ORDERS ----------------------
const allOrderController = async (req, res, next) => {
  try {
    const response = await orderServices.allOrderservices();
    const { allOrder, error } = response;

    if (error) return next(error);

    res.json({ status: "200", allOrder });
  } catch (err) {
    next(err);
  }
};

// ---------------------- UPDATE ORDER (ADMIN) ----------------------
const updateOrderController = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const payload = { _id: orderId, data: req.body };

    const details = await Order.findById(orderId)
      .populate("owner")
      .populate("product")
      .populate("medicine");

    const response = await orderServices.updateOrderServices(payload);
    const { updateOrder, error } = response;

    if (error) return next(error);

    const user = details.owner;
    const item = details.product || details.medicine;

    const htmlTemplate = `
      <p>Hello ${user.name},</p>
      <p>Your order has been shipped and will arrive soon.</p>
      <hr/>
      <p><b>Order Details:</b></p>
      <p>Name: ${item.productName || item.medicineName}</p>
      <p>Description: ${item.productDescription || item.medicineDescription}</p>
      <p>Price: ₹${item.productPrice || item.medicinePrice}</p>
      <hr/>
      <p>Regards,<br/>MedsHub24/7</p>
    `;

    await transporter.sendMail({
      from: process.env.ADMIN,
      to: user.email,
      subject: "Your Order is Shipped",
      html: htmlTemplate,
    });

    res.json({ status: "200", updateOrder });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrderController,
  myOrderController,
  cancleOrderController,
  allOrderController,
  updateOrderController,
};
