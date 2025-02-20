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
        res.redirect(`/login?next=${req.originalUrl}`);
      } else {
        next();
      }
    }
  );
});

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

app.get('/', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select viewDshbrd as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  console.log(checkPermsion);

  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'MasterPage.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.get('/getName', async (req, res) => {
  const [nme] = await db.execute(
    `select concat(fname, " ", lname) as nme from _Users where id = ${req.cookies.usdt.id}`
  );
  res.send(nme[0].nme);
});

module.exports = app;
