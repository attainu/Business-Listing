// Importing nodemialer
const [nodemailer] = [require("nodemailer")];

const { EMAIL, EMAILPASSWORD, PORT } = process.env;

module.exports = async (email, secretToken) => {
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
      subject: "Account Verification",
      html: `<h3><a href='http://localhost:${PORT}/verifyEmail/admin/${secretToken}'>${secretToken}</a></h3>`
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};
