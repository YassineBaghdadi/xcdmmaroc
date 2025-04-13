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
const { sendMail } = require('./mls');
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

function getCurrentTime() {
  return moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss');
}

app.get('/:ofr', async (req, res) => {
  var [ofr] = await db.execute(
    `select count(id) as i from _JobOffers where uniqId = "${req.params.ofr}"`
  );

  if (ofr[0].i) {
    res.sendFile(
      path.join(__dirname, '../../frntEnd/career', 'Offre-Single.html')
    );
  } else {
    res.json({
      error: {
        name: 'Error',
        status: 404,
        message: 'Invalid Request',
        statusCode: 404,
      },
      message: 'wrong url',
    });
  }

  // if (!id) {
  //     return res.status(400).send('ID is required!');
  // }
});

app.get('/details/:i', async (req, res) => {
  console.log(req.params.i);

  var [ofr] = await db.execute(
    `select * from _JobOffers where uniqId = "${req.params.i}"`
  );

  if (!ofr[0]) {
    res.json({
      error: {
        name: 'Error',
        status: 404,
        message: 'Invalid Request',
        statusCode: 404,
      },
      message: 'wrong url',
    });
    return;
  }
  res.json(ofr[0]);
});

app.post('/Apply', async (req, res) => {
  jwt.verify(
    req.cookies.jwtCndTkn,
    String(process.env.sessionSecret),
    async (err, decoded) => {
      if (err) {
        res.json({ c: 'r', r: `/login?next=${req.originalUrl}`, e: err });
      } else {
        var [ofid] = await db.execute(
          `select id, nme, rcrtPour from _JobOffers where uniqId = '${req.body.o}'`
        );

        var [aplied] = await db.execute(
          `select count(id) as c from _carreerCondidatsAplies where cndidat = ${req.cookies.cndDt.id} and ofr = ${ofid[0].id}`
        );

        if (aplied[0].c > 0) {
          return res.json({ c: 1 });
        }

        await db.execute(
          `insert into _carreerCondidatsAplies (dte, cndidat, ofr) values ("${getCurrentTime()}", ${
            req.cookies.cndDt.id
          }, ${ofid[0].id})`
        );

        sendMail(
          req.cookies.cndDt.email,
          `Accusé de réception de votre candidature - ${ofid[0].nme}`,
          `<p>Bonjour ${req.cookies.cndDt.fname} ${req.cookies.cndDt.lname},<br/><br/>Nous vous remercions pour l'intérêt que vous portez à l'offre de ${ofid[0].nme} au sein de ${ofid[0].rcrtPour}.</p> <p>Nous avons bien reçu votre candidature et nous l'étudions avec attention. Si votre profil correspond aux critères de sélection, nous ne manquerons pas de vous recontacter pour organiser un entretien. Dans le cas contraire, nous conserverons vos informations pour de futures opportunités qui pourraient correspondre davantage à votre profil.</p><p>Nous vous remercions encore une fois pour votre candidature et vous souhaitons beaucoup de succès dans vos démarches.</p><p style='font-style: italic;'><br/>Cordialement,<br />Team Recrutement XCDM Maroc</p>`,
          'noreply@xcdmmaroc.com'
        );

        res.json({ c: 0 });
      }
    }
  );
});

app.post('/checkApply', async (req, res) => {
  jwt.verify(
    req.cookies.jwtCndTkn,
    String(process.env.sessionSecret),
    async (err, decoded) => {
      if (err) {
        res.json({ a: 0 });
      } else {
        var [ofId] = await db.execute(
          `select id from _JobOffers where uniqId = '${req.body.o}'`
        );
        if (req.cookies.cndDt.id) {
          var [isApplied] = await db.execute(
            `select * from _carreerCondidatsAplies where cndidat = ${req.cookies.cndDt.id} and ofr = ${ofId[0].id}`
          );
        }
        if (isApplied.length) {
          return res.json({ a: 1, d: isApplied[0].dte });
        }
        res.json({ a: 0 });
      }
    }
  );
});

module.exports = app;
