const profileService = require("../services/user.service");
const nodemailer = require("nodemailer");
require("dotenv").config();

// SIGN UP
const signUp = async (request, response, next) => {
  try {
    const { name, email, password, address, phoneNumber } = request.body;
    console.log("request.body: ", request.body);

    const data = await profileService.signUpServices(request.body);
    const { signupuser, error } = data;

    if (error) return next(error);

    // send confirmation email only when signup is successful
    if (signupuser) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.ADMIN,
          pass: process.env.PASS,
        },
      });

      const mailOptions = {
        from: process.env.ADMIN,
        to: email,
        subject: "NO reply",
        html: `
          <p>Hello <b>${name}</b>,</p>
          <p>You have successfully registered with us. Now you can access all Services of Medshub24/7.</p>
          <p><span>Thanks and Regards,</span><br><span>MedsHub24/7</span></p>
        `,
      };

      transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log("Email error:", err);
        else console.log("Email sent:", info.response);
      });
    }

    return response.json({ status: "200", signupuser });
  } catch (err) {
    return next(err);
  }
};

// LOGIN
const logIn = async (request, response, next) => {
  try {
    const data = await profileService.logInServices(request.body);
    const { loguser, error } = data;

    if (error) return next(error);

    return response.json({
      status: loguser ? "200" : "404",
      loguser,
      error,
    });
  } catch (err) {
    return next(err);
  }
};

// UPDATE USER
const edit = async (request, response, next) => {
  try {
    const _id = request.params.id;
    const update = await profileService.editUserServices(_id, request.body);
    const { editUser, error } = update;

    if (error) return next(error);

    return response.json({ status: "200", editUser });
  } catch (err) {
    return next(err);
  }
};

// DELETE USER
const deleteUser = async (request, response, next) => {
  try {
    const _id = request.params.id;
    const del = await profileService.deleteUserServices(_id);
    const { deleteUserAccount, error } = del;

    if (error) return next(error);

    return response.json({ status: "200", deleteUserAccount });
  } catch (err) {
    return next(err);
  }
};

// GET ALL USERS
const getAllUsers = async (request, response, next) => {
  try {
    const user = await profileService.getAllUsersServices();
    const { allusers, error } = user;

    if (error) return next(error);

    return response.json({ status: "200", allusers });
  } catch (err) {
    return next(err);
  }
};

// FORGOT PASSWORD
const forgotPass = async (request, response, next) => {
  try {
    const { email } = request.body;
    const data = await profileService.forgotPassServices(email);
    const { result, error } = data;

    if (error) return response.json({ error });

    return response.json({ result });
  } catch (err) {
    return next(err);
  }
};

// RESET PASSWORD
const resetPass = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const data = await profileService.resetPassServices(email, password);
    const { result, error } = data;

    if (error) return response.json({ error });

    return response.json({ result });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  signUp,
  logIn,
  edit,
  deleteUser,
  getAllUsers,
  forgotPass,
  resetPass,
};
