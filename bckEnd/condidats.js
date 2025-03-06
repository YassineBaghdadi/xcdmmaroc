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
var formateDate = (d) => {
  if (d) {
    return d.getHours()
      ? moment(d).format('DD/MM/YYYY HH:mm:ss')
      : moment(d).format('DD/MM/YYYY');
  } else {
    return 'N/A';
  }
};

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

app.get('/', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select recrutViewCondidats as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'Candidats.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.get('/:i', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select recrutViewFcondidat as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    var [ofr] = await db.execute(
      `SELECT COUNT(id) AS i FROM _carreerCondidats WHERE uniqId = ?`,
      [req.params.i]
    );

    if (ofr[0].i > 0) {
      res.sendFile(path.join(__dirname, '../frntEnd', 'Fiche-Candidat.html'));
    } else {
      res.redirect(`/ERP/Recrutement/Candidats/`);
    }
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.post('/getCnds', async (req, res) => {
  var tbl = '';

  var cndtions = [];

  if (req.body.SectorF) {
    cndtions.push(`desiredSector = "${req.body.SectorF}"`);
  }
  if (req.body.functionF) {
    cndtions.push(`desiredFonction = "${req.body.functionF}"`);
  }

  if (req.body.regionF) {
    cndtions.push(`desiredRegion = "${req.body.regionF}"`);
  }
  if (req.body.salaireF) {
    cndtions.push(`desiredSalaire = "${req.body.salaireF}"`);
  }

  if (req.body.etudF) {
    cndtions.push(`etudLevel = "${req.body.etudF}"`);
  }
  if (req.body.formationF) {
    cndtions.push(`formation = "${req.body.formationF}"`);
  }

  if (req.body.expF) {
    cndtions.push(`expYrs = "${req.body.expF}"`);
  }
  // if (req.body.langsF) {
  //   cndtions.push(`jo.expYrs = "${req.body.langsF}"`);
  // }

  cndtions = cndtions.length ? `WHERE ${cndtions.join(' AND ')}` : '';
  let [dt] = await db.execute(`SELECT * FROM _carreerCondidats ${cndtions}`);

  // console.log(dt);

  const tblRows = await Promise.all(
    dt.map(async (e) => {
      const [skls] = await db.execute(
        `SELECT nme FROM _carreerCondidatsSkills WHERE cndidat = ?`,
        [e.id]
      );
      const [langs] = await db.execute(
        `SELECT nme FROM _carreerCondidatsLangs WHERE cndidat = ?`,
        [e.id]
      );

      return `
      <tr>
          <td class="py-1 "><a href="/ERP/Recrutement/Candidats/${
            e.uniqID
          }"><img src="images/faces/Default.jpg" alt="image" width="30px" height="30px"/>${
        e.fname
      } ${e.lname}</a></td>
          <td class="text-center">${e.prflTtle}</td>
          <td class="text-center"><textarea class="form-control" rows="3" placeholder="" disabled>${
            skls.map((skill) => skill.nme).join(' , ') || ''
          }</textarea></td>
          <td class="text-center"><textarea class="form-control" rows="3" placeholder="" disabled>${
            langs.map((lang) => lang.nme).join(' , ') || ''
          }</textarea></td>
          <td class="py-1 text-center"><a href="/Recrutement/getCV?i=${
            e.uniqID
          }">Télécharger</a></td>
      </tr>
  `;
    })
  );

  tbl += tblRows.join('');

  res.json(tbl);
});

// app.get('/getCV', async (req, res) => {
//   //todo > need fix
//   const fileId = req.query.i;

//   try {
//     const [rows] = await db.execute(
//       'SELECT cv, cvEXT FROM _carreerCondidats WHERE uniqID = ?',
//       [fileId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).send('File not found');
//     }

//     const fileData = rows[0].cv;
//     const fileExtension = rows[0].cvEXT;

//     res.setHeader('Content-Type', 'application/octet-stream');
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename="cv de ${req.cookies.cndDt.fname} ${req.cookies.cndDt.lname}.${fileExtension}"`
//     );

//     res.end(fileData, 'binary');
//   } catch (error) {
//     console.error('Error fetching file:', error);
//     res.status(500).send('An error occurred while fetching the file');
//   }
// });

app.post('/getCndInfo', async (req, res) => {
  var [info] = await db.execute(
    `select * from _carreerCondidats where uniqID = "${req.body.i}"`
  );

  res.json({ infos: info[0] });
});

app.post('/getLangs', async (req, res) => {
  var [id] = await db.execute(
    `select id from _carreerCondidats where uniqID = "${req.body.i}"`
  );
  var [lngs] = await db.execute(
    `select * from _carreerCondidatsLangs where cndidat = "${id[0].id}"`
  );
  // console.log(lngs);

  res.json(lngs);
});

app.post('/getSkills', async (req, res) => {
  var [id] = await db.execute(
    `select id from _carreerCondidats where uniqID = "${req.body.i}"`
  );
  var [lngs] = await db.execute(
    `select * from _carreerCondidatsSkills where cndidat = "${id[0].id}"`
  );
  // console.log(lngs);

  res.json(lngs);
});

app.post('/getSkills', async (req, res) => {
  var [id] = await db.execute(
    `select id from _carreerCondidats where uniqID = "${req.body.i}"`
  );
  var [lngs] = await db.execute(
    `select * from _carreerCondidatsSkills where cndidat = "${id[0].id}" order by id desc`
  );
  // console.log(lngs);

  res.json(lngs);
});

app.post('/removeSKL', async (req, res) => {
  await db.execute(
    `delete from _carreerCondidatsSkills where id = ${req.body.i}`
  );
  res.json('done');
});

app.post('/addSKL', async (req, res) => {
  var [id] = await db.execute(
    `select id from _carreerCondidats where uniqID = "${req.body.i}"`
  );
  await db.execute(
    `insert into _carreerCondidatsSkills (nme, cndidat) value("${req.body.s}", ${id[0].id})`
  );
  res.json('done');
});

app.post('/getApplies', async (req, res) => {
  var [id] = await db.execute(
    `select id from _carreerCondidats where uniqID = "${req.body.i}"`
  );

  var [lngs] = await db.execute(
    `select a.id, a.dte, o.nme as ofrNme, a.qlfDte, a.qlf, concat(u.fname, " ", u.lname) as qlfByNme, a.qlfCmnt  from 
    _carreerCondidatsAplies a inner join _JobOffers o on a.ofr = o.id left join _Users u on a.qlfBy = u.id where a.cndidat = "${id[0].id}" order by a.id desc
    
    `
  );

  res.json(lngs);
});

app.post('/addLang', async (req, res) => {
  var [id] = await db.execute(
    `select id from _carreerCondidats where uniqID = "${req.body.i}"`
  );
  var [lang] = await db.execute(
    `select id from _carreerCondidatsLangs where nme = "${req.body.lng}" and cndidat = "${id[0].id}"`
  );
  if (lang.length > 0) {
    res.status(500).json('La langue existe déjà');
  } else {
    await db.execute(
      `insert into _carreerCondidatsLangs (nme, cndidat, lvl, addedBy, addedDte) value("${
        req.body.lng
      }", ${id[0].id}, "${req.body.niv}", "${req.cookies.usdt.fname} ${
        req.cookies.usdt.lname
      }", "${getCurrentDteTime()}")`
    );
    res.json('done');
  }
});

app.post('/evalLang', async (req, res) => {
  await db.execute(
    `update  _carreerCondidatsLangs 
          set evaluation = "${req.body.niv}", 
          evaluatedBy = "${req.cookies.usdt.fname} ${req.cookies.usdt.lname}",  
          evaluationDte = "${getCurrentDteTime()}" where id = ${req.body.i}`
  );
  res.json('done');
});

app.post('/updatePersonalInfo', async (req, res) => {
  await db.execute(
    `update  _carreerCondidats 
          set civilite = "${req.body.Civilite}", 
          lname = "${req.body.lname}",  
          fname = "${req.body.fname}" ,
          bd = "${req.body.Naissance}" ,
          nationality = "${req.body.nationality}" ,
          familystatus = "${req.body.familystatus}" ,
          phone = "${req.body.phone}" ,
          email = "${req.body.email}" ,
          address = "${req.body.address}" ,
          zip = "${req.body.Postal}" ,
          city = "${req.body.city}" ,
          lastUpdate = "${getCurrentDteTime()}"
          
          
          where uniqID = "${req.body.i}"`
  );
  res.json('done');
});

app.post('/profileInfoUpdate', async (req, res) => {
  await db.execute(
    `update  _carreerCondidats 
          set 
          prflTtle = "${req.body.Nominationposteactuel}", 
          etudLevel = "${req.body.etudLevel}",  
          formation = "${req.body.formation}" ,
          expYrs = "${req.body.expYrs}" ,
          actualSector = "${req.body.actualSector}" ,
          desiredSector = "${req.body.desiredSector}" ,
          actualFonction = "${req.body.actualFonction}" ,
          desiredFonction = "${req.body.desiredFonction}" ,
          actualSalaire = "${req.body.actualSalaire}" ,
          desiredSalaire = "${req.body.desiredSalaire}" ,
          actualRegion = "${req.body.actualRegion}" ,
          desiredRegion = "${req.body.desiredRegion}" ,
          disponibility = "${req.body.disponibility}" ,
          lastUpdate = "${getCurrentDteTime()}"

          
          
          
          where uniqID = "${req.body.i}"`
  );
  res.json('done');
});

app.post('/getAplyQlfHst', async (req, res) => {
  var [h] = await db.execute(
    `select dte, qlf, qlfBy from _carreerApplieQlfHstry where aply = ${req.body.i} order by id desc`
  );
  // console.log(h);

  res.json(h);
});

app.post('/sveCndQlf', async (req, res) => {
  // console.log(req.body);

  await db.execute(`insert into _carreerApplieQlfHstry (aply, dte, qlf, qlfBy, cmnt, interviewDte)
    values (${req.body.i}, "${getCurrentDteTime()}", "${req.body.q}", "${
    req.cookies.usdt.fname
  } ${req.cookies.usdt.lname}", "${req.body.c}", "${req.body.d}")`);

  await db.execute(
    `update _carreerCondidatsAplies set qlf = "${req.body.q}", qlfBy = ${
      req.cookies.usdt.id
    } ,
    interviewDte = "${req.body.d}",
    qlfDte = "${getCurrentDteTime()}",
    qlfCmnt = "${req.body.c}"

    where id = ${req.body.i}`
  );

  if (req.body.sndMl == 'true') {
    // send the convocations to the candidate
    console.log('convocation sent');
  }

  res.json('done');
});

app.post('/getOfrsL', async (req, res) => {
  // var [o] = await db.execute(`select id, nme from _JobOffers  `);
  var [usId] = await db.execute(
    `select id from _carreerCondidats where uniqID = "${req.body.id}"`
  );

  var [o] = await db.execute(
    `SELECT jo.id, jo.nme, ap.cndidat FROM _JobOffers jo LEFT JOIN _carreerCondidatsAplies ap ON jo.id = ap.ofr WHERE ap.cndidat <> ${usId[0].id} OR ap.cndidat IS NULL;
  `
  );
  // console.log(o);

  res.json(o);
});

app.post('/applyForUsr', async (req, res) => {
  var [usId] = await db.execute(
    `select id from _carreerCondidats where uniqID = "${req.body.id}"`
  );
  await db.execute(
    `insert into _carreerCondidatsAplies (dte, cndidat, ofr, appliedBy) values (now(), ${usId[0].id}, ${req.body.ofr}, "${req.cookies.usdt.fname} ${req.cookies.usdt.lname}")`
  );
  res.json('done');
});

module.exports = app;
