require('dotenv').config();
const nodemailer = require('nodemailer');
const { lg } = require('./lg');
var sendMail = (to, sbj, msg) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.mlHost,
      port: 465,
      secure: true,
      auth: {
        user: `${process.env.mlsnder}`,
        pass: `${process.env.mlPwd}`,
      },
    });

    transporter.verify(function (error, success) {
      if (error) {
        console.log('Verification failed:', error);
      }
    });

    const mailOptions = {
      from: process.env.mlFrom,
      to: to,
      subject: sbj,
      html: msg,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.error('Error:', error);
      }
      console.log('Email sent:', info.response);
    });
  } catch (error) {
    lg.error(error);
  }
};

module.exports = { sendMail };
