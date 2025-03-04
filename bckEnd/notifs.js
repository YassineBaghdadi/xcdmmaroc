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
        res.redirect('/ERP/login');
      } else {
        next();
      }
    }
  );
});

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

app.get('/', async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM _Notifications where rd = 0 and usr = ' + req.cookies.usdt.id
  );
  var htntf = `<p class='mb-0 font-weight-normal float-left dropdown-header'>Notifications</p><span id="ntfsNmbr" hidden>${rows.length}</span>`;

  rows.forEach((e) => {
    var j = '';
    if (e.rd == 0) {
      j = `style='color:green; font-weight:bold;'`;
    }
    htntf += `<a class='dropdown-item preview-item' onclick='ntfClck(${
      e.id
    }, &quot;${String(
      e.link
    )}&quot;)'> <div class='preview-item-content'> <h6 class='preview-subject font-weight-normal' ${j}>${
      e.ttle
    }</h6> <p class='font-weight-light small-text mb-0 text-muted'>${
      e.msg
    }</p> </div> </a>`;
  });

  if (rows.length == 0) {
    htntf += `<br><br><h6 class='preview-subject font-weight-normal' style='margin-left:20px;margin-bottom:20px;color:red; font-style:italic;' >Vous n'avez pas de Nouvelles Notifications</h6>`;
  }

  var [hh] = await db.execute(
    `select tkn from _Users where id = ${req.cookies.usdt.id}`
  );
  var dlg = String(req.cookies.jwtToken).split('.')[2] !== hh[0].tkn;
  // console.log(dlg);
  // console.log(htntf);
  res.json({ t: htntf, n: rows.length, d: dlg });
});

app.post('/click', async (req, res) => {
  await db.execute(`update _Notifications set rd = 1 where id = ${req.body.i}`);
  res.send('OK');
});

module.exports = app;
