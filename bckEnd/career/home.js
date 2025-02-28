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

// app.use((req, res, next) => {
//   jwt.verify(
//     req.cookies.jwtCndTkn,
//     String(process.env.sessionSecret),
//     (err, decoded) => {
//       if (err) {
//         res.redirect(`/login?next=${req.originalUrl}`);
//       } else {
//         next();
//       }
//     }
//   );
// });

app.use(
  express.static(path.join(__dirname, '../../frntEnd/career'), { index: false })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frntEnd/career', 'index.html'));
});

app.get('/getOffres', async (req, res) => {
  let cndx = [];

  if (req.query.f) {
    cndx.push(`fonctions like "${req.query.f.replaceAll('|', ' ')}"`);
  }

  if (req.query.r) {
    cndx.push(`place like "${req.query.r.replaceAll('|', ' ')}"`);
  }
  if (req.query.s) {
    cndx.push(`salair like "${req.query.s.replaceAll('|', ' ')}"`);
  }

  if (req.query.sctr) {
    cndx.push(`sector like "${req.query.sctr.replaceAll('|', ' ')}"`);
  }
  if (req.query.exp) {
    cndx.push(`expYrs like "${req.query.exp.replaceAll('|', ' ')}"`);
  }
  if (req.query.etd) {
    cndx.push(`etudLevel like "${req.query.etd.replaceAll('|', ' ')}"`);
  }
  if (req.query.frmtion) {
    cndx.push(`formation like "${req.query.frmtion.replaceAll('|', ' ')}"`);
  }

  if (req.query.c) {
    cndx.push(
      `(nme like "%${req.query.c.replaceAll(
        '|',
        ' '
      )}%" or cntrTpe = "${req.query.c.replaceAll(
        '|',
        ' '
      )}" or city  = "${req.query.c.replaceAll('|', ' ')}")`
    );
  }

  var [offres] = await db.execute(
    `select * from _JobOffers ${
      cndx.length ? `where ${cndx.join(' and ')}` : ''
    } order by id desc`
  );

  // console.log(
  //   `select * from _JobOffers ${
  //     cndx.length ? `where ${cndx.join(" and ")}` : ""
  //   } order by id desc`
  // );

  res.json(offres);
});

app.post('/subscribe', async (req, res) => {
  var [id] = await db.execute(
    `select id from _cndNewsLetters where email = "${req.body.e}"`
  );
  if (!id.length) {
    await db.execute(
      `insert into _cndNewsLetters (email, addDte) value("${
        req.body.e
      }", "${moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss')}")`
    );
  }

  res.json('subscribed');
});

module.exports = app;
