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
const crypto = require('crypto');

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

function getCurrentDteTime() {
  return moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss');
}

app.get('/', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select recrutAddOffer as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'Nouvelle-Offer.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.post('/saveJobOffer', async (req, res) => {
  try {
    if (req.body.upt) {
      const updateQuery = `
        UPDATE _JobOffers 
        SET 
          nme = ?, rcrtTpe = ?, rcrtPar = ?, rcrtPour = ?, 
          cntrTpe = ?, wrkTpe = ?, startDte = ?, endDte = ?, 
          stts = ?, fonctions = ?, sector = ?, place = ?, 
          city = ?, salair = ?, formation = ?, expYrs = ?, 
          etudLevel = ?, cmpny = ?, post = ?, missions = ?, 
          prfile = ? 
        WHERE uniqId = ?
      `;

      const updateValues = [
        req.body.Titre,
        req.body.rcrtTpe,
        req.body.rcrtPar,
        req.body.rcrtPour,
        req.body.TypeContrat,
        req.body.wrkTpe,
        req.body.DatePub1,
        req.body.DatePub2,
        req.body.StatutOffre,
        req.body.fonctios,
        req.body.Secteur,
        req.body.Emplacement,
        req.body.Ville,
        req.body.Salaire,
        req.body.Typeformation,
        req.body.experience,
        req.body.etude,
        req.body.Entreprise,
        req.body.Poste,
        req.body.missions,
        req.body.Profil,
        req.body.upt,
      ];

      await db.execute(updateQuery, updateValues);
    } else {
      const insertQuery = `
        INSERT INTO _JobOffers (
          dte, createdBy, nme, rcrtTpe, rcrtPar, rcrtPour, 
          cntrTpe, wrkTpe, startDte, endDte, stts, fonctions, 
          sector, place, city, salair, formation, expYrs, 
          etudLevel, cmpny, post, missions, prfile
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertValues = [
        getCurrentDteTime(),
        req.cookies.usdt.id,
        req.body.Titre,
        req.body.rcrtTpe,
        req.body.rcrtPar,
        req.body.rcrtPour,
        req.body.TypeContrat,
        req.body.wrkTpe,
        req.body.DatePub1,
        req.body.DatePub2,
        req.body.StatutOffre,
        req.body.fonctios,
        req.body.Secteur,
        req.body.Emplacement,
        req.body.Ville,
        req.body.Salaire,
        req.body.Typeformation,
        req.body.experience,
        req.body.etude,
        req.body.Entreprise,
        req.body.Poste,
        req.body.missions,
        req.body.Profil,
      ];

      const [dt] = await db.execute(insertQuery, insertValues);

      const uniqId = crypto
        .createHash('md5')
        .update(`${dt.insertId}`)
        .digest('hex');
      await db.execute(`UPDATE _JobOffers SET uniqId = ? WHERE id = ?`, [
        uniqId,
        dt.insertId,
      ]);
    }

    // Send mail to the newsletter (if required)

    res.json('done');
  } catch (error) {
    console.error('Error in saving job offer:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while saving the job offer.' });
  }
});

app.get('/getEnttiesList', async (req, res) => {
  var [entts] = await db.execute(`select * from _Entity`);
  var out = '<option value="">Recrutement Par</option>';
  entts.forEach((e) => {
    out += `<option value="${e.nme}">${e.nme}</option>`;
  });

  res.json(out);
});
app.get('/getClientsList', async (req, res) => {
  var [entts] = await db.execute(`select * from _Clients`);
  var out = '<option value="">Recrutement Pour</option>';
  entts.forEach((e) => {
    out += `<option value="${e.nme}">${e.nme}</option>`;
  });

  res.json(out);
});
app.get('/getOfr', async (req, res) => {
  let ofId = req.query.o;

  let [of] = await db.execute(
    `select 
        o.dte, 
        concat(u.fname, " ", u.lname) as createdBy, 
        o.nme, 
        o.rcrtTpe, 
        o.rcrtPar, 
        o.rcrtPour, 
        o.cntrTpe, 
        o.wrkTpe, 
        o.startDte, 
        o.endDte, 
        o.stts, 
        o.fonctions, 
        o.sector, 
        o.place, 
        o.city, 
        o.salair, 
        o.formation, 
        o.expYrs, 
        o.etudLevel, 
        o.cmpny, 
        o.post, 
        o.missions, 
        o.prfile 
      from _JobOffers o inner join _Users u on o.createdBy = u.id where o.uniqId = '${ofId}' `
  );

  if (of[0]) {
    if (of[0].createdBy != req.cookies.usdt.id) {
      var [prms] = await db.execute(
        `select recrutMdfOthersOffer from _Managemnt where usr = ${req.cookies.usdt.id}`
      );
      if (prms[0].recrutMdfOthersOffer == 1) {
        res.json(of[0]);
      } else {
        res.json({
          error: "Vous n'avez pas les droits pour accéder à cette offre",
        });
      }
    }
  } else {
    res.status(404).json(null);
  }
});

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

module.exports = app;
