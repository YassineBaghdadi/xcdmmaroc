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

//app.get('/Candidatures', async (req, res) => {
// res.sendFile(path.join(__dirname, '../frntEnd', 'Candidatures.html'));
//});

function getCurrentDteTime() {
  return moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss');
}
var formateDate = (d) => {
  if (d) {
    return d.getHours()
      ? moment(d).format('DD/MM/YYYY HH:mm:ss')
      : moment(d).format('DD/MM/YYYY');
  } else {
    return 'N/A';
  }
};
app.get('/Offer/:of', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select recrutAddOffer as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'Nouvelle-Offer.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});
app.get('/', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select vewRecrutDchbrd as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'DashboardRcrtmt.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.get('/getCV', async (req, res) => {
  try {
    var [usId] = await db.execute(
      `select id, fname, lname from _carreerCondidats where uniqID = "${req.query.i}"`
    );
    const [rows] = await db.execute(
      'SELECT cv, cvEXT FROM _carreerCondidats WHERE id = ?',
      [usId[0].id]
    );

    if (rows.length === 0) {
      return res.status(404).send('File not found');
    }

    const fileData = rows[0].cv;
    const fileExtension = rows[0].cvEXT;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="CV de ${usId[0].fname} ${usId[0].lname}.${fileExtension}"`
    );

    res.end(fileData, 'binary');
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).send('An error occurred while fetching the file');
  }
});

app.get('/getUsersList', async (req, res) => {
  let [usrs] = await db.execute(
    `select DISTINCT u.id, concat(u.fname, " ", u.lname) as nme from _JobOffers j inner join _Users u on j.createdBy = u.id;`
  );
  res.json(usrs);
});

app.post('/getOffers', async (req, res) => {
  var cndtions = [];

  if (req.body.dte) {
    cndtions.push(`jo.dte like "${req.body.dte}%"`);
  }

  if (req.body.createdBy) {
    cndtions.push(`jo.createdBy = "${req.body.createdBy}"`);
  }

  // var [dt] = await db.execute(
  //   `select jo.id as ofId, jo.uniqId, jo.nme, jo.entity, jo.dte, concat(u.fname, " ", u.lname) as unme, jo.stts from _JobOffers jo left join _Entity en on jo.entity = en.id inner join _Users u on jo.createdBy = u.id  order by jo.id desc`
  // );

  // elements.map(el => `"${el}"`).join(', ')
  cndtions = cndtions.length ? `where ${cndtions.join(' and ')}` : '';

  var qr = `select jo.id as ofId, jo.uniqId, jo.nme, jo.dte, concat(u.fname, " ", u.lname) as unme from _JobOffers jo inner join _Users u on jo.createdBy = u.id ${cndtions} order by jo.id desc`;

  var [dt] = await db.execute(qr);
  // console.log(qr);

  var tbl = ``;
  for (const e of dt) {
    var [applies] = await db.execute(
      `select count(id) as c from _carreerCondidatsAplies where ofr = ${e.ofId}`
    );

    var [validApplies] = await db.execute(
      `select count(id) as c from _carreerCondidatsAplies where ofr = ${e.ofId} and qlf = "Accépter Pour Le poste"`
    );
    // Accépter Pour Le poste

    tbl += `<tr>
      
      <td class="text-center">${e.nme}</td>
      <td  class="text-center">${formateDate(e.dte).split(' ')[0]}</td>
      <td  class="font-weight-bold text-center"d>${e.unme}</td>
      <td class="font-weight-medium text-center">
        <div class="badge badge-primary">${applies[0].c}</div>
      </td>
      <td class="font-weight-medium text-center">
        <div class="badge badge-success">${validApplies[0].c}</div>
      </td>
      
      </tr>`;
  }
  // console.log(tbl);

  res.json(tbl);
});

app.post('/getOfrsFltr', async (req, res) => {
  var cndtions = [];

  if (req.body.dte) {
    cndtions.push(`t.dte like "${req.body.dte}%"`);
  }

  if (req.body.createdBy) {
    cndtions.push(`t.createdBy = "${req.body.createdBy}"`);
  }

  // var [dt] = await db.execute(
  //   `select jo.id as ofId, jo.uniqId, jo.nme, jo.entity, jo.dte, concat(u.fname, " ", u.lname) as unme, jo.stts from _JobOffers jo left join _Entity en on jo.entity = en.id inner join _Users u on jo.createdBy = u.id  order by jo.id desc`
  // );

  // elements.map(el => `"${el}"`).join(', ')
  cndtions = cndtions.length ? `and ${cndtions.join(' and ')}` : '';

  var qr = `SELECT p.status, COUNT(t.stts) AS c
FROM (
    SELECT 'Public' AS status
    UNION ALL
    SELECT 'En instance'
    UNION ALL
    SELECT 'Clôturées'
    UNION ALL
    SELECT 'Expiré'
) p
LEFT JOIN _JobOffers t ON p.status = t.stts ${cndtions}
GROUP BY p.status;`;

  `select count(id) as c from _JobOffers where stts = "" ${cndtions}`;

  var [dt] = await db.execute(qr);

  // console.log(dt);

  // console.log(tbl);

  res.json(dt);
});
module.exports = app;
