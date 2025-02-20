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
        res.redirect(`/login?next=${req.originalUrl}`);
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

// app.use('/Candidature', require('./cnd'));

app.get('/', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select recrutViewOffers as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'Job-Offers.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
  res.sendFile(path.join(__dirname, '../frntEnd', 'Job-Offers.html'));
});

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

app.post('/getOffers', async (req, res) => {
  var cndtions = [];
  var access = true;
  var [prms] = await db.execute(
    `select recrutAddOffer, recrutMdfOthersOffer from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (prms[0].recrutAddOffer == 0) {
    access = false;
  }

  if (req.body.entity) {
    cndtions.push(`jo.entity = "${req.body.entity}"`);
  }
  if (req.body.stts) {
    cndtions.push(`jo.stts = "${req.body.stts}"`);
  }

  if (req.body.fonctions) {
    cndtions.push(`jo.fonctions = "${req.body.fonctions}"`);
  }
  if (req.body.place) {
    cndtions.push(`jo.place = "${req.body.place}"`);
  }

  if (req.body.salair) {
    cndtions.push(`jo.salair = "${req.body.salair}"`);
  }
  if (req.body.formation) {
    cndtions.push(`jo.formation = "${req.body.formation}"`);
  }

  if (req.body.sector) {
    cndtions.push(`jo.sector = "${req.body.sector}"`);
  }
  if (req.body.expYrs) {
    cndtions.push(`jo.expYrs = "${req.body.expYrs}"`);
  }
  if (req.body.etudLevel) {
    cndtions.push(`jo.etudLevel = "${req.body.etudLevel}"`);
  }

  if (req.body.dte) {
    cndtions.push(`jo.dte = "${req.body.dte}"`);
  }

  if (req.body.createdBy) {
    cndtions.push(`jo.createdBy = "${req.body.createdBy}"`);
  }

  if (req.body.startDte) {
    cndtions.push(`jo.startDte >= "${req.body.startDte}"`);
  }

  if (req.body.endDte) {
    cndtions.push(`jo.endDte <= "${req.body.endDte}"`);
  }
  if (req.body.cleF) {
    cndtions.push(
      `(jo.uniqId = "${req.body.cleF}" or jo.nme = "${req.body.cleF}" or jo.city = "${req.body.cleF}" or u.fname = "${req.body.cleF}" or u.lname = "${req.body.cleF}" )`
    );
  }
  // var [dt] = await db.execute(
  //   `select jo.id as ofId, jo.uniqId, jo.nme, jo.entity, jo.dte, concat(u.fname, " ", u.lname) as unme, jo.stts from _JobOffers jo left join _Entity en on jo.entity = en.id inner join _Users u on jo.createdBy = u.id  order by jo.id desc`
  // );

  // elements.map(el => `"${el}"`).join(', ')
  cndtions = cndtions.length ? `where ${cndtions.join(' and ')}` : '';

  var qr = `select jo.id as ofId, jo.uniqId, jo.nme, jo.rcrtTpe, jo.rcrtPar, jo.rcrtPour, jo.wrkTpe, jo.dte, concat(u.fname, " ", u.lname) as unme, jo.stts, jo.createdBy from _JobOffers jo inner join _Users u on jo.createdBy = u.id ${cndtions} order by jo.id desc`;

  var [dt] = await db.execute(qr);

  var tbl = ``;
  for (const e of dt) {
    var [applies] = await db.execute(
      `select count(id) as c from _carreerCondidatsAplies where ofr = ${e.ofId}`
    );

    var iid = `<a href="/Recrutement/Nouvelle-Offer?Offer=${e.uniqId}" >${e.nme}</a >`;

    if (
      req.cookies.usdt.id != e.createdBy &&
      prms[0].recrutMdfOthersOffer == 0
    ) {
      iid = `<span title="Vous n'avez pas accès aux offres que vous n'avez pas créées." style="cursor: not-allowed;">${e.nme}</span>`;
    }

    // console.log(applies[0].c);

    tbl += `<tr>
                                <td class="py-1">
                                  ${iid}
                                </td>
                                <td>${e.stts}</td>
                                <td>${e.rcrtPour ? e.rcrtPour : 'Interne'}</td>
                                <td>${formateDate(e.dte).split(' ')[0]}</td>
                                <td>${e.unme}</td>
                                <td class="text-center">
                                ${
                                  applies[0].c != 0
                                    ? `<a
                                    href="#"
                                    class="nav-link"
                                    data-toggle="modal"
                                    data-target="#Candidatures"
                                    data-id="${e.uniqId}"
                                    ><span id="TotalCandidatures" class="h4"
                                      >${applies[0].c}</span
                                    ></a
                                  >`
                                    : `<span style="cursor: not-allowed;" id="TotalCandidatures" class="h4"
                                      >${applies[0].c}</span
                                    >`
                                }
                                  
                                </td>

                                <td class="text-center">
                                  <div
                                    class="default-select"
                                    id="default-selects"
                                  >
                                    <select
                                      class="js-example-basic-single w-100"
                                      name="etude"
                                    >
                                      <option value="${
                                        e.uniqId
                                      }?p=JobBoard">JobBoard</option>
                                      <option value="${
                                        e.uniqId
                                      }?p=Facebook">Facebook</option>
                                      <option value="${
                                        e.uniqId
                                      }?p=Linkedin">Linkedin</option>
                                      <option value="${
                                        e.uniqId
                                      }?p=Instgram">Instgram</option>
                                      <option value="${
                                        e.uniqId
                                      }?p=Avito">Avito</option>
                                      <option value="${
                                        e.uniqId
                                      }?p=Moncallcenter">Moncallcenter.ma</option>
                                      <option value="${
                                        e.uniqId
                                      }?p=ERP">Autre</option>
                                    </select>
                                  </div>
                                </td>

                                <td class="text-center">
                                  <button
                                    type="button"
                                    class="btn btn-primary btn-rounded cpLnk"  onclick="navigator.clipboard.writeText('http://career.xcdmmaroc.com/Offer/' + this.closest('tr').querySelector('select').value); Toast.fire({icon: 'success', title: 'Le Lien copié avec succès !'});"
                                  >
                                    <i class="mdi mdi-link"></i>
                                  </button>
                                </td>
                              </tr>`;
  }
  // console.log(tbl);

  res.json({ t: tbl, access: access });
});

app.get('/getOffresApllies/:i', async (req, res) => {
  let c = [];
  if (req.query.s) {
    c.push(`qlf = "${req.query.s}"`);
  }
  if (req.query.d) {
    c.push(`dte = "${req.query.d}"`);
  }
  var [ofId] = await db.execute(
    `select id, nme from _JobOffers where uniqId = "${req.params.i}"`
  );

  var [applies] = await db.execute(
    `select ap.id, ap.dte, cn.uniqID, concat(cn.fname, " ", cn.lname) as cndNme, ap.qlf, concat(u.fname, " ", u.lname) as qlfBy, ap.qlfDte 
    from _carreerCondidatsAplies ap inner join _carreerCondidats cn on ap.cndidat = cn.id left join _Users u on ap.qlfBy = u.id where ap.ofr = ${
      ofId[0].id
    } ${c.length ? `and ${c.join('and')}` : ''}`
  );

  res.json({ ap: applies, of: ofId[0].nme });
});

module.exports = app;
