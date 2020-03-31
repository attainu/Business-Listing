// Importing nodemialer
const [nodemailer, dotenv] = [require("nodemailer"), require('dotenv').config()];

const { EMAIL, EMAILPASSWORD } = process.env;

module.exports = async (email, token) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: EMAILPASSWORD
      }
    });
    const mailOptions = {
      from: EMAIL,
      to: email,
      subject: "Password Reset",
      html: `<h1>click on this link to create a new password</h1> <a href='${process.env.SERVER}:${process.env.PORT}'>${token}</a><br />`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};


