const express = require('express');
const app = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(cookieParser());
const path = require('path');
const jwt = require('jsonwebtoken');

const { db } = require('./DB_cnx');

app.use((req, res, next) => {
  jwt.verify(
    req.cookies.jwtToken,
    String(process.env.sessionSecret),
    (err, decoded) => {
      if (err) {
        res.redirect(`/ERP/login?next=${req.originalUrl}`);
      } else {
        next();
      }
    }
  );
});

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

//app.get('/', (req, res) => {
// res.sendFile(path.join(__dirname, '../frntEnd', ''));
//});

app.use('/Nouvelle-Offer', require('./rcrtNewOffer'));
app.use('/Les-offres', require('./OffersLst'));
app.use('/Candidats', require('./condidats'));
app.use('/', require('./rcrtDashBoard'));

//app.get('/Candidatures', async (req, res) => {
// res.sendFile(path.join(__dirname, '../frntEnd', 'Candidatures.html'));
//});

// app.get('/Fiche-Candidat', async (req, res) => {
//   res.sendFile(path.join(__dirname, '../frntEnd', 'Fiche-Candidat.html'));
// });

module.exports = app;
