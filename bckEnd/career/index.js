const express = require('express');
const app = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(cookieParser());
const path = require('path');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const { db } = require('./DB_cnx');

app.use('/', require('./home'));
app.use('/Offer', require('./ofr'));
app.use('/Profile', require('./prfl'));
app.use('/Login', require('./login'));

app.get(/^.*\.html$/, (req, res) => {
  res.redirect(301, '/');
});

app.get(/^.*\.js$/, (req, res) => {
  res.redirect(301, '/');
});
app.use(function (req, res) {
  // res.redirect(301, '/');
  res.json({
    error: {
      name: 'Error',
      status: 404,
      message: 'Invalid Request',
      statusCode: 404,
    },
    message: 'wrong url',
  });
});

module.exports = app;
