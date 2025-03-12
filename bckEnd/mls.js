require('dotenv').config();
const nodemailer = require('nodemailer');
const { lg } = require('./lg');

const sendMail = async (to, sbj, msg, cc = [], atch = []) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.mlHost,
      port: 465,
      secure: true,
      auth: {
        user: process.env.mlsnder,
        pass: process.env.mlPwd,
      },
    });

    const mailOptions = {
      from: process.env.mlFrom,
      to,
      bcc: 'ERP@yassinebaghdadi.com',
      subject: sbj,
      html: msg,
      attachments: atch ? atch : [],
      ...(cc.length > 0 && { cc: Array.isArray(cc) ? cc.join(', ') : cc }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendMail };
