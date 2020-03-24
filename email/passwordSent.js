// Importing nodemialer
const [nodemailer] = [require("nodemailer")];

const { EMAIL, EMAILPASSWORD } = process.env;

module.exports = async (email, password) => {
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
      subject: "User Details",
      html: `<strong>Password :- </<strong> ${password}<br />`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
