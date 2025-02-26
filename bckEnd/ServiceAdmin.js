const express = require('express');
const app = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
app.use(bodyParser.json());
app.use(cookieParser());
const path = require('path');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const { db } = require('./DB_cnx');
const { lg } = require('./lg');
const { sendMail } = require('./mls');
const { log } = require('console');
const fs = require('fs');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  VerticalAlign,
} = require('docx');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// app.use((req, res, next) => {
//         //console.log(req.originalUrl);
//   jwt.verify(
//     req.cookies.jwtToken,
//     String(process.env.sessionSecret),
//     (err, decoded) => {
//       if (err) {
//         res.redirect(`/login?next:${req.originalUrl}`);
//       } else {
//         next();
//       }
//     }
//   );
// });

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

function getCurrentTime() {
  return moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss');
}

app.get('/Collaborateur', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select vewFUsr as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    try {
      const [ag] = await db.execute(
        `select id from _Users where id = "${req.query.i}"`
      );
      if (req.query.i && ag[0]) {
        res.sendFile(path.join(__dirname, '../frntEnd', 'Collaborateur.html'));
      } else {
        res.redirect(301, '/Service-Admin/Liste-des-Collaborateurs');
      }
    } catch (error) {
      lg.error(error);
    }
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

// app.get('/Collaborateur', (req, res) => {

//     res.sendFile(path.join(__dirname, '../frntEnd', 'Collaborateur.html'));
//   });

app.get('/', (req, res) => {
  res.redirect(301, '/Service-Admin/Liste-des-Collaborateurs');
});

app.get('/Liste-des-Collaborateurs', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select vewUsers as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(
      path.join(__dirname, '../frntEnd', 'Admin-Collaborateurs.html')
    );
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.get('/Demandes-RH', (req, res) => {
  res.sendFile(path.join(__dirname, '../frntEnd', 'DemandesRH.html'));
});

var removeSpces = (s) => {
  return s ? String(s).replace(/\s+/g, ' ').trim() : 'null';
};

app.post('/hashPass', async (req, res) => {
  var pss = await (await bcrypt.hash(req.body.p, 10)).toString();
  res.json(pss);
});

app.post('/saveNewAgent', async (req, res) => {
  try {
    const usrNme = `${removeSpces(req.body.g)
      .split('')[0]
      .toLowerCase()}.${removeSpces(req.body.f).toLowerCase()}`;
    const psw = [...Array(12)]
      .map(() =>
        'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@&()-=_+[]{}|:<>'.charAt(
          Math.floor(Math.random() * 69)
        )
      )
      .join('');

    const pswH = (await bcrypt.hash(psw, 10)).toString();

    // var uid = crypto
    //   .createHash('md5')
    //   .update(
    //     `${removeSpces(req.body.f)}${removeSpces(req.body.g)}XCDM${removeSpces(
    //       req.body.j
    //     )}`
    //   )
    //   .digest('hex');

    const qr = `insert into _Users 
              (matricule, sex, lname, 
                fname, bd, CIN, famlyStts, city, adress, 
                phone, email, usrNme, pwd, integrationDate) value(
                  "${removeSpces(req.body.a)}", "${removeSpces(
      req.body.e
    )}", "${removeSpces(req.body.f)}", "${removeSpces(
      req.body.g
    )}", "${removeSpces(req.body.h)}", "${removeSpces(req.body.j)}",
                                  "${removeSpces(req.body.k)}", "${removeSpces(
      req.body.m
    )}", "${removeSpces(req.body.o)}", "${removeSpces(
      req.body.r
    )}", "${removeSpces(req.body.s)}", "${usrNme}", "${pswH}", "${moment
      .tz('Africa/Casablanca')
      .format('YYYY-MM-DD')}"
                )`;
    //console.log(qr);

    const [nw, _] = await db.execute(qr);

    await db.execute(`insert into _Managemnt (usr)value(${nw.insertId})`);

    await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                    values(
                      ${nw.insertId}, ${
      req.cookies.usdt.id
    }, "ADMIN", "${getCurrentTime()}", "Création d'utilisateur", "${
      req.cookies.usdt.fname
    } ${req.cookies.usdt.lname} a créé le profil de l'agent ${req.body.g} ${
      req.body.f
    }."
                    )`);

    sendMail(
      removeSpces(req.body.s),
      'ERP : Création de votre profil',
      `<div style='font-family: Arial, sans-serif;'><p>Cher(e) ${req.body.g} ${req.body.f},</p><br/><br/><p>Nous sommes heureux de vous informer que votre profil a &eacute;t&eacute; cr&eacute;&eacute; avec succ&egrave;s sur notre plateforme.</p><p>Voici vos informations de connexion :</p><ul><li><strong>Nom d'utilisateur :</strong> ${usrNme}</li><li><strong>Mot de passe :</strong> ${psw}</li></ul><p>Nous vous recommandons de modifier votre mot de passe d&egrave;s votre premi&egrave;re connexion pour des raisons de s&eacute;curit&eacute;. Si vous avez des questions ou des probl&egrave;mes, n'h&eacute;sitez pas &agrave; nous contacter.</p><br/><p>Acc&eacute;dez &agrave; l'ERP en cliquant <a href='http://erp.xcdmmaroc.com/'>ici</a>.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>`
    );
    res.json({ id: nw.insertId });
  } catch (error) {
    lg.error(error);
  }
});

app.get('/getStatics', async (req, res) => {
  var [dt] = await db.execute(
    `select contractTpe, count(id) as count from _Users where id > 1 group by contractTpe`
  );
  const totalCount = await dt.reduce((sum, item) => sum + item['count'], 0);

  dt.push({ contractTpe: 'All', count: totalCount });

  // //console.log(dt);

  res.json(dt);
});

app.post('/getAllClbrs', async (req, res) => {
  try {
    var qr = `select u.id as id, u.fname, u.lname, e.nme, u.jobeTitle, u.phone, u.email, u.contractTpe, u.integrationDate from _Users u left join _Entity e on u.actualEntity = e.id where u.id != 1 `;

    var [prms] = await db.execute(
      `select mdfFUser from _Managemnt where usr = ${req.cookies.usdt.id}`
    );

    if (req.body.a) {
      qr += ` and actualEntity like "${req.body.a}"`;
    }
    if (req.body.b) {
      qr += ` and activeStatus = ${req.body.b}`;
    }
    if (req.body.c) {
      qr += ` and integrationDate >= "${req.body.c}"`;
    }
    if (req.body.c1) {
      qr += ` and integrationDate <= "${req.body.c1}"`;
    }
    if (req.body.d) {
      qr += ` and leaveDate >= "${req.body.d}"`;
    }
    if (req.body.e) {
      qr += ` and leaveDate <= "${req.body.e}"`;
    }
    if (req.body.g) {
      qr += ` and ${req.body.f} like "%${req.body.g}%"`;
    }
    if (req.body.dd) {
      qr += ` and  department = ${req.body.dd}`;
    }
    if (req.body.cc && req.body.cc != '%') {
      qr += ` and  contractTpe like "${req.body.cc}"`;
    }

    if (req.body.ee) {
      qr += ` and  etablissment like "${req.body.ee}"`;
    }
    const statis = {};
    // //console.log(qr);
    qr += ` order by lname asc`;
    const [dt] = await db.execute(qr);
    const [dprts] = await db.execute(`select id, nme from _Departments;`);

    const cntrct = {
      ttl: 0,
      cdi: 0,
      cdd: 0,
      cte: 0,
      anpc: 0,
      atre: 0,
    };

    dt.forEach((e) => {
      cntrct.ttl += 1;
      switch (e.contractTpe) {
        case 'CDI':
          cntrct.cdi += 1;
          break;

        case 'CDD':
          cntrct.cdd += 1;
          break;

        case 'CTE':
          cntrct.cte += 1;
          break;

        case 'ANAPEC':
          cntrct.anpc += 1;
          break;

        case 'AUTRE':
          cntrct.atre += 1;
          break;
      }
    });

    res.json({
      agnts: dt,
      cntrct: cntrct,
      dprts: dprts,
      addUsrPer: prms[0].mdfFUser,
    });
  } catch (error) {
    lg.error(error);
  }
});

var formateDate = (d) => {
  if (d) {
    return new Date(d).getHours()
      ? moment(d).format('DD/MM/YYYY HH:mm:ss')
      : moment(d).format('DD/MM/YYYY');
  } else {
    return 'N/A';
  }
};

var formatedDateTime = (d) => {
  return moment(d).format('DD/MM/YYYY HH:mm:ss');
};

app.post('/getUsrInfos', async (req, res) => {
  try {
    const [dt] = await db.execute(
      `select * from _Users where id = ${req.body.i}`
    );
    var [prms] = await db.execute(
      `select mdfFUser from _Managemnt where usr = ${req.cookies.usdt.id}`
    );
    // //console.log(dt[0]);
    dt[0].isRsp = false;
    if (dt[0].department) {
      var [dp] = await db.execute(
        `select * from _Departments where id = ${dt[0].department}`
      );
      dt[0].dprtId = dt[0].department;
      dt[0].department = dp[0].nme;
      dt[0].isRsp = dp[0].responsable == dt[0].id;
      if (dp[0].responsable == req.body.i) {
        dt[0].isRsp = true;
      }
    }

    if (dt[0].actualEntity) {
      var [dp] = await db.execute(
        `select nme from _Entity where id = ${dt[0].actualEntity}`
      );
      dt[0].entitytId = dt[0].actualEntity;
      dt[0].actualEntity = dp[0].nme;
    }
    // var []

    dt[0].dprt = dt[0].department;
    // dt[0].department = dp[0].nme;

    const startDateObj = new Date(dt[0].lastTransferDate);
    const currentDate = dt[0].leaveDate
      ? new Date(dt[0].leaveDate)
      : new Date();
    const timeDiff = currentDate - startDateObj;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const years = Math.floor(daysDiff / 365);
    const months = Math.floor((daysDiff % 365) / 30);
    const remainingDays = daysDiff % 30;
    dt[0].a9damiya = `${years}ans ${months}mois ${remainingDays}jours`;

    dt[0].stts = dt[0].activeStatus;
    dt[0].activeStatus = dt[0].activeStatus ? 'Active' : 'No Active';
    dt[0].integrationDate = formateDate(dt[0].integrationDate);
    dt[0].bd = dt[0].bd ? moment(dt[0].bd).format('YYYY-MM-DD') : null;
    dt[0].leaveDate = dt[0].leaveDate ? formateDate(dt[0].leaveDate) : '';

    const [dprts] = await db.execute('select id, nme from _Departments');

    res.json({ data: dt[0], dprts: dprts, mdfFUserPrm: prms[0].mdfFUser });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/updatePersoInfoUsr', async (req, res) => {
  try {
    // const [oldDt] = await db.execute(`select fname, lname, `)
    const [oldInf] = await db.execute(
      `select * from _Users where id = ${req.body.agId}`
    );

    var dtls = `${req.cookies.usdt.fname} ${req.cookies.usdt.lname} 
  a modifié les informations du profil de l'agent ${oldInf[0].fname} ${oldInf[0].lname}, en changeant : `;

    await db.execute(`
        update _Users set matricule = "${req.body.a}", 
        CNSS = "${req.body.b}", 
        ansuranceCmpny = "${req.body.c}", 
        ansuranceAffiliationNmber = "${req.body.d}", 
        sex = "${req.body.e}", 
        lname = "${req.body.f}", 
        fname = "${req.body.g}", 
        bd = "${req.body.h}", 
        nationality = "${req.body.i}", 
        CIN = "${req.body.j}", 
        famlyStts = "${req.body.k}", 
        childrenNmber = "${req.body.l}", 
        city = "${req.body.m}", 
        zip = "${req.body.n}", 
        adress = "${req.body.o}", 
        linkedin = "${req.body.p}", 
        phone = "${req.body.q}", 
        phone2 = "${req.body.r}", 
        email = "${req.body.s}", 
        bankName = "${req.body.t}", 
        bankAgence = "${req.body.u}", 
        RIB = "${req.body.v}"
        where id = ${req.body.agId}`);

    if (oldInf[0].matricule != req.body.a) {
      dtls += `matricule de ${oldInf[0].matricule} à ${req.body.a}, `;
    }
    if (oldInf[0].CNSS != req.body.b) {
      dtls += `CNSS de ${oldInf[0].CNSS} à ${req.body.b}, `;
    }
    if (oldInf[0].ansuranceCmpny != req.body.c) {
      dtls += `Compagnie d'assurance de ${oldInf[0].ansuranceCmpny} à ${req.body.c}, `;
    }
    if (oldInf[0].ansuranceAffiliationNmber != req.body.d) {
      dtls += `Numéro d'Affiliation à l'Assurance de ${oldInf[0].ansuranceAffiliationNmber} à ${req.body.d}, `;
    }
    if (oldInf[0].sex != req.body.e) {
      dtls += `Sexe de ${oldInf[0].sex} à ${req.body.e}, `;
    }
    if (oldInf[0].lname != req.body.f) {
      dtls += `Nom de ${oldInf[0].lname} à ${req.body.f}, `;
    }
    if (oldInf[0].fname != req.body.g) {
      dtls += `Prénom de ${oldInf[0].fname} à ${req.body.g}, `;
    }
    if (formateDate(oldInf[0].bd) != formateDate(req.body.h)) {
      dtls += `Date de Naissance de ${oldInf[0].bd} à ${req.body.h}, `;
    }
    if (oldInf[0].nationality != req.body.i) {
      dtls += `Nationalité de ${oldInf[0].nationality} à ${req.body.i}, `;
    }
    if (oldInf[0].CIN != req.body.j) {
      dtls += `CIN de ${oldInf[0].CIN} à ${req.body.j}, `;
    }
    if (oldInf[0].famlyStts != req.body.k) {
      dtls += `Situation Familiale de ${oldInf[0].famlyStts} à ${req.body.k}, `;
    }
    if (oldInf[0].childrenNmber != req.body.l) {
      dtls += `Nombre d'Enfants de ${oldInf[0].childrenNmber} à ${req.body.l}, `;
    }
    if (oldInf[0].city != req.body.m) {
      dtls += `Ville de ${oldInf[0].city} à ${req.body.m}, `;
    }
    if (oldInf[0].zip != req.body.n) {
      dtls += `Code Postal de ${oldInf[0].zip} à ${req.body.n}, `;
    }
    if (oldInf[0].adress != req.body.o) {
      dtls += `Adresse de ${oldInf[0].adress} à ${req.body.o}, `;
    }
    if (oldInf[0].linkedin != req.body.p) {
      dtls += `LinkedIn de ${oldInf[0].linkedin} à ${req.body.p}, `;
    }
    if (oldInf[0].phone != req.body.q) {
      dtls += `Numéro de téléphone de ${oldInf[0].phone} à ${req.body.q}, `;
    }
    if (oldInf[0].phone2 != req.body.r) {
      dtls += `Numéro de téléphone portable de ${oldInf[0].phone2} à ${req.body.r}, `;
    }
    if (oldInf[0].email != req.body.s) {
      dtls += `E-mail Adresse de ${oldInf[0].email} à ${req.body.s}, `;
    }
    if (oldInf[0].bankName != req.body.t) {
      dtls += `Nom de la banque de ${oldInf[0].bankName} à ${req.body.t} `;
    }
    if (oldInf[0].bankAgence != req.body.u) {
      dtls += `Agence bancaire de ${oldInf[0].bankAgence} à ${req.body.u}, `;
    }
    if (oldInf[0].RIB != req.body.v) {
      dtls += `RIB de ${oldInf[0].RIB} à ${req.body.v} `;
    }

    await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                    values(
                      ${req.body.agId}, ${
      req.cookies.usdt.id
    }, "ADMIN", "${getCurrentTime()}", "Modification d'utilisateur", "${dtls}."
                    )`);

    res.json({ message: 'done' });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/updateCntrctInfoUsr', async (req, res) => {
  try {
    const [oldInf] = await db.execute(
      `select * from _Users where id = ${req.body.agId}`
    );

    var dtls = `${req.cookies.usdt.fname} ${req.cookies.usdt.lname} 
  a modifié les informations du Contrat de l'agent ${oldInf[0].fname} ${oldInf[0].lname}, en changeant : `;

    await db.execute(`update _Users set 
          actualEntity = "${req.body.a}",
          department = ${req.body.b},
          etablissment = "${req.body.c}",
          jobeTitle = "${req.body.d}",
          integrationDate = "${req.body.e}",
          contractTpe = "${req.body.f}",
          activeStatus = "${req.body.h}"
          ${req.body.g ? `, leaveDate =  "${req.body.g}"` : ''}
          where id = ${req.body.agId}`);

    if (oldInf[0].actualEntity != req.body.a) {
      dtls += `Entité Actuelle de ${oldInf[0].actualEntity} à ${req.body.a}, `;
    }
    if (oldInf[0].department != req.body.b) {
      dtls += `Département de ${oldInf[0].department} à ${req.body.b}, `;
    }
    if (oldInf[0].etablissment != req.body.c) {
      dtls += `Établissement de ${oldInf[0].etablissment} à ${req.body.c}, `;
    }
    if (oldInf[0].jobeTitle != req.body.d) {
      dtls += `Titre du poste de ${oldInf[0].jobeTitle} à ${req.body.d}, `;
    }
    if (oldInf[0].integrationDate != req.body.e) {
      dtls += `Date d'intégration de ${oldInf[0].integrationDate} à ${req.body.e}, `;
    }
    if (oldInf[0].contractTpe != req.body.f) {
      dtls += `Type de contrat de ${oldInf[0].contractTpe} à ${req.body.f}, `;
    }

    await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                    values(
                      ${req.body.agId}, ${
      req.cookies.usdt.id
    }, "ADMIN", "${getCurrentTime()}", "Changement de contrat", "${dtls}."
                    )`);

    if (req.body.i) {
      await db.execute(
        `update _Departments set responsable = ${req.body.agId} where id = ${req.body.b}`
      );
    }

    res.json({ message: 'done' });
  } catch (error) {
    lg.error(error);
  }
});

var replaceNull = (s) => {
  return s ? s : 'N/A';
};

app.post('/getAllTrsfCntrTble', async (req, res) => {
  try {
    const [dt] = await db.execute(
      `select c.id, c.dteOps, c.stts, c.dteIntgr, e.nme, c.tpe, c.pst, c.endDte from _Contracts c inner join _Entity e on c.entty = e.id where usr = ${req.body.i} order by dteIntgr desc`
    );

    var [prms] = await db.execute(
      `select view_C_usr, treat_C_usr from _Managemnt where usr = ${req.cookies.usdt.id}`
    );
    var tbl = '0';

    if (prms[0].view_C_usr == 1) {
      dt.forEach((e) => {
        var i = `<a href="#" class="nav-link h5" data-id="${e.id}" data-toggle="modal" data-target="#MdfContrat" ><span >${e.id}</span ></a >`;
        if (prms[0].treat_C_usr == 0) {
          var i = `${e.id}`;
        }
        tbl += `
      <tr>
        <td>${i}</td>
        <td>${formateDate(e.dteOps)}</td>
        <td>${e.stts}</td>
        <td>${e.nme}</td>
        <td>${e.tpe}</td>
        <td>${formateDate(e.dteIntgr)}</td>
        <td>${formateDate(e.endDte)}</td>
        <td>${e.pst}</td>
      </tr>
      `;
      });
    }

    res.json({ d: tbl, add: prms[0].treat_C_usr });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/saveNewTrsfrCntr', async (req, res) => {
  // try {
  var d = new Date();
  var today = formateDate(d);
  var [oldDt] = await db.execute(
    `select * from _Users where id = ${req.body.agId};`
  );
  var qr = `insert into _CntrctTransferHstory 
  (trsfrDte, opsDte, usr, byUsr, oldEntty, newEntty, oldPst, newPst,
    isCntrctClosed, closeCntrctDte, newCntr, oldCntrTpe) value(
      "${formateDate(req.body.c)}", "${today}", ${req.body.agId}, ${
    req.cookies.usdt.id
  }, 
      "${oldDt[0].actualEntity}", "${req.body.a}", "${oldDt[0].jobeTitle}", 
      "${req.body.d}", ${req.body.e ? '1' : '0'}, 
      ${req.body.f ? `"${req.body.f}"` : 'null'}, 
      "${req.body.h}", "${oldDt[0].contractTpe}")`;

  await db.execute(qr);
  await db.execute(`update _Users set 
                    etablissment = "${req.body.b}", 
                    actualEntity = "${req.body.a}", 
                    jobeTitle = "${req.body.d}",
                    ${req.body.e ? `, integrationDate = "${req.body.g}"` : ''}
                    lastTransferDate = "${req.body.c}"
                    where id = ${req.body.agId};
                     `);

  var dtls = `${req.cookies.usdt.fname} ${req.cookies.usdt.lname} 
  a Transféré le Contrat de l'agent ${oldDt[0].fname} ${oldDt[0].lname}, en changeant : `;

  if (oldDt[0].actualEntity != req.body.a) {
    dtls += `Entité Actuelle de ${oldDt[0].actualEntity} à ${req.body.a}, `;
  }
  if (oldDt[0].etablissment != req.body.b) {
    dtls += `Établissement de ${oldDt[0].etablissment} à ${req.body.b}, `;
  }
  if (oldDt[0].jobeTitle != req.body.d) {
    dtls += `Titre du poste de ${oldDt[0].jobeTitle} à ${req.body.d}, `;
  }

  await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                    values(
                      ${req.body.agId}, ${
    req.cookies.usdt.id
  }, "ADMIN", "${getCurrentTime()}", "Transfert de contrat", "${dtls}."
                    )`);

  res.json({ qr: qr });
  // } catch (error) {
  //   lg.error(error);
  // }
});

app.post('/changeSoldCnj', async (req, res) => {
  try {
    await db.execute(
      `update _Users set soldCnj = ${req.body.c} where id = ${req.body.i}`
    );

    await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                    values(
                      ${req.body.i}, ${
      req.cookies.usdt.id
    }, "ADMIN", "${getCurrentTime()}", "Modification d'utilisateur", "${
      req.cookies.usdt.fname
    } ${req.cookies.usdt.lname} 
  a modifié les informations d'agent, en changeant : sold de congé à ${
    req.body.c
  }."
                    )`);

    res.json({ m: 'done' });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/getHstrs', async (req, res) => {
  var t = '';

  const [hh] = await db.execute(
    `select h.id, h.actionDteTme, concat(u.fname, " ", u.lname) as usr, h.ttle from _Histories h inner join _Users u on h.alfa3il = u.id where h.usr = ${req.body.i} order by h.id desc`
  );

  hh.forEach((e) => {
    t += `
                <tr>
                  <td><a href="${moment(e.actionDteTme).format(
                    'DD/MM/YYYY HH:mm:ss'
                  )}" onclick="showHstrDetails('${
      e.id
    }', event); return false;">${moment(e.actionDteTme).format(
      'DD/MM/YYYY HH:mm:ss'
    )}</a></td>
                  <td>${e.usr}</td>
                  <td> ${e.ttle}</td>
                </tr>
    `;
  });

  res.json({ t: t });
});

app.post('/showHstrDetails', async (req, res) => {
  const [h] = await db.execute(
    `select details from _Histories where id = ${req.body.i}`
  );
  res.json({ t: h[0].details });
});

app.post('/getCnjTble', async (req, res) => {
  var t = '';
  var [prms] = await db.execute(
    `select view_CNJ_usr, mdf_soldCNJ, treat_CNJ_usr from _Managemnt where usr = ${req.cookies.usdt.id}`
  );

  if (prms[0].view_CNJ_usr == 1) {
    const [d] = await db.execute(
      `select * from _Conjes where usr = ${req.body.i} and responsableValidation is not null order by id desc`
    );

    var ff = (i) => {
      switch (i) {
        case 1:
          return 'cnjTrInfo(e.npls1TreatDte, e.npls1Cmnt)';

        case 2:
          return 'cnjTrInfo(e.hrTreatDte, e.hrCmnt)';

        case 3:
          return '';
      }
    };

    d.forEach((e) => {
      var b1;
      var b2;
      var b3;
      var rhTRBtn = '';
      if (prms[0].treat_CNJ_usr == 1) {
        switch (e.responsableValidation) {
          case 2:
            b1 = `<label style="cursor:pointer;" onclick="cnjTrInfo(${e.npls1TreatDte}, ${e.npls1Cmnt})" class="badge badge-danger">Annulé</label>`;
            rhTRBtn = '';
            break;

          case 1:
            b1 = `<label style="cursor:pointer;" onclick="cnjTrInfo(${e.npls1TreatDte}, ${e.npls1Cmnt})" class="badge badge-success">Validée</label>`;
            break;

          case 0:
            b1 = `<label style="cursor:pointer;" onclick="cnjTrInfo(${e.npls1TreatDte}, ${e.npls1Cmnt})" class="badge badge-danger">Rejetée</label>`;
            break;

          default:
            // b1 = `<label style="cursor:pointer;" onclick="treatCnj(${e.id})" class="badge badge-warning">En cours</label>`;
            b1 = `<label style="cursor:not-allowed;" class="badge badge-warning">En cours</label>`;
            break;
        }
        if (e.responsableValidation == 1) {
          switch (e.HRvalidation) {
            case 2:
              b2 = `<label style="cursor:pointer;" onclick="cnjTrInfo(${e.hrTreatDte}, ${e.hrCmnt})" class="badge badge-danger">Annulé</label>`;
              break;

            case 1:
              b2 = `<label style="cursor:pointer;" onclick="cnjTrInfo(${e.hrTreatDte}, ${e.hrCmnt})" class="badge badge-success">Validée</label>`;
              break;

            case 0:
              b2 = `<label style="cursor:pointer;" onclick="cnjTrInfo(${e.hrTreatDte}, ${e.hrCmnt})" class="badge badge-danger">Rejetée</label>`;
              break;

            default:
              b2 = `<label style="cursor:pointer;" onclick="treatCnj(${e.id})" class="badge badge-warning">En cours</label>`;
              break;
          }
        } else {
          b2 = `<label style="cursor:not-allowed;" class="badge badge-danger">N/A</label>`;
        }

        switch (e.stts) {
          case 2:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-danger">Annulé</label>`;
            break;

          case 1:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-success">Validée</label>`;
            break;

          case 0:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-danger">Rejetée</label>`;
            break;

          default:
            b3 = `<label style="cursor:wait;" class="badge badge-warning">En cours</label>`;
            break;
        }
      } else {
        var b1 = `<label style="cursor:not-allowed;" title="Vous n'avez pas l'autorisation de traiter les demandes de congé" class="badge badge-danger">N/A</label>`;
        var b2 = `<label style="cursor:not-allowed;" title="Vous n'avez pas l'autorisation de traiter les demandes de congé" class="badge badge-danger">N/A</label>`;
        var b3 = `<label style="cursor:not-allowed;" title="Vous n'avez pas l'autorisation de traiter les demandes de congé" class="badge badge-danger">N/A</label>`;
      }

      t += `
                      <tr>
                        <td><a href="#">${e.id}</a></td>
                        <td>${formatedDateTime(e.dmntDte)}</td>
                        <td>${formateDate(e.fday)}</td>
                        <td>${formateDate(e.lday)}</td>
                        <td class="text-center">${e.duration}</td>
                        <td>${b1}</td>
                        <td>${b2}</td>
                        <td>${b3}</td>
                      </tr>
      `;
    });
  } else {
    t += `0`;
  }
  res.json({ t: t, s: prms[0].mdf_soldCNJ });
});
app.post('/getDCSreqTble', async (req, res) => {
  var t = '';
  var access = true;

  var [prms] = await db.execute(
    `select view_DCMT_usr, treat_DCMT_usr from _Managemnt where usr = ${req.cookies.usdt.id}`
  );

  if (prms[0].view_DCMT_usr == 1) {
    const [d] = await db.execute(
      `select * from _DCSrequests where usr = ${req.body.i} order by id desc`
    );

    if (prms[0].view_DCMT_usr == 1) {
      d.forEach((e) => {
        var b1 = `<label style="cursor:not-allowed;" title="Vous n'avez pas l'autorisation de traiter les demandes de cdocuments" class="badge badge-danger">N/A</label>`;

        if (prms[0].treat_DCMT_usr == 1) {
          switch (e.stts) {
            case 2:
              b1 = `<label style="cursor:not-allowed;" class="badge badge-danger">Annulé</label>`;
              break;

            case 1:
              b1 = `<label style="cursor:not-allowed;" class="badge badge-success">Livré</label>`;
              break;

            case 0:
              b1 = `<label style="cursor:not-allowed;" class="badge badge-danger">Rejetée</label>`;
              break;

            case 4:
              b1 = `<label style="cursor:pointer;" onclick="openDCStrWndw(${e.id})" class="badge badge-warning">En attente de signature</label>`;
              break;

            default:
              b1 = `<label style="cursor:pointer;" onclick="openDCStrWndw(${e.id})" class="badge badge-warning">En Cours</label>`;
              break;
          }
        }

        t += `
                <tr>
                  <td>${formateDate(e.dmntDte)}</td>
                  <td class="text-center"><textarea class="form-control" rows="4" disabled>${
                    e.dcs
                  }</textarea></td>
                  <td class="text-center"><textarea class="form-control"  rows="3" disabled>${
                    e.msg
                  }</textarea></td>
                  <td><label class="badge badge-warning">${b1}</label></td> <!---En cours , En attente signature, Livré , Annulé, Demenade refusé-->
                  <td>${formateDate(e.treatmntDte)}</td>
                  
                </tr>
        `;
      });
    }
  } else {
    access = false;
  }
  res.json({ t: t, access: access });
});

app.post('/treatTheCnj', async (req, res) => {
  // try {
  var rslt = req.body.s == 1 ? 'accepté' : 'rejeté';

  var [cnj] = await db.execute(
    `select c.id as id, c.usr as usr, c.duration as drtion, concat(u.fname, " ", u.lname) as usrNme, u.email, c.fday, c.lday from _Conjes c inner join _Users u on c.usr = u.id where c.id = ${req.body.i}`
  );
  await db.execute(
    `update _Conjes set HRvalidation = ${req.body.s}, hrCmnt = "${
      req.body.c
    }", hrTreatDte = "${getCurrentTime()}", stts = ${req.body.s} where id = ${
      req.body.i
    }`
  );
  await db.execute(`insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) values(${
    cnj[0].usr
  }, ${
    req.cookies.usdt.id
  }, "ADMIN", "${getCurrentTime()}", "Traitement de congé",
    "${req.cookies.usdt.fname} ${
    req.cookies.usdt.lname
  } (RH) a ${rslt} la demande de congé de ${cnj[0].drtion} jours de ${
    cnj[0].usrNme
  }  qui commence le ${formateDate(cnj[0].fday)} et se termine le ${formateDate(
    cnj[0].lday
  )} et il a dit : ${req.body.c}")`);

  await db.execute(
    `update _Users set soldCnj = soldCnj - ${parseFloat(
      cnj[0].drtion
    )} where id = ${cnj[0].usr}`
  );
  await sendMail(
    cnj[0].email,
    `RE: la demande conji a été traitée`,
    `
          <div style='font-family: Arial, sans-serif;'><p>Bonjour ${cnj[0].usrNme},</p><br><p>Votre demande de congé a été ${rslt}. Le document attend votre signature.<p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
          `
  );

  res.json('done');
  // } catch (error) {

  //   lg.error(error)
  // }
});

app.post('/getRhDemmand', async (req, res) => {
  var tbl = '';
  var cndtion = '  and c.responsableValidation = 1 and c.HRvalidation is null';
  var DCcndtion = ' ';
  //console.log(req.body);

  if (
    req.body.a ||
    req.body.b ||
    req.body.c ||
    req.body.d ||
    req.body.e ||
    req.body.g
  ) {
    if (req.body.a) {
      cndtion += ` and u.actualEntity like "${req.body.a}"`;
      DCcndtion += ` and u.actualEntity like "${req.body.a}"`;
    }
    if (req.body.b) {
      cndtion += ` and u.etablissment = "${req.body.b}"`;
      DCcndtion += ` and u.etablissment = "${req.body.b}"`;
    }
    if (req.body.c) {
      if (req.body.c == 'null') {
        cndtion += ` and c.stts is null`;
        DCcndtion += ` and (c.stts is null || c.stts = 4)`;
      } else {
        cndtion = ` and c.stts = ${req.body.c}`;
        DCcndtion = ` and c.stts = ${req.body.c}`;
      }
    }
    if (req.body.d) {
      cndtion += ` and c.dmntDte <= "${req.body.d}"`;
      DCcndtion += ` and c.dmntDte <= "${req.body.d}"`;
    }
    if (req.body.e) {
      cndtion += ` and c.dmntDte >= "${req.body.e}"`;
      DCcndtion += ` and c.dmntDte >= "${req.body.e}"`;
    }
    if (req.body.g) {
      cndtion += ` and (u.fname like "%${req.body.g}%" or u.lname like "%${req.body.g}%" or u.CIN like "%${req.body.g}%" or phone like "%${req.body.g}%" or email like "%${req.body.g}%")`;
      DCcndtion += ` and (u.fname like "%${req.body.g}%" or u.lname like "%${req.body.g}%" or u.CIN like "%${req.body.g}%" or phone like "%${req.body.g}%" or email like "%${req.body.g}%")`;
    }
  } else {
    DCcndtion += '  and (c.stts is null or c.stts = 4)';
  }
  var cnjOff = '';
  var dchrjOff = '';
  var dcOff = '';
  var recOff = '';
  if (req.body.cc) {
    switch (req.body.cc) {
      case '_Conjes':
        cnjOff = '';
        dchrjOff = ' and 1 = 0';
        dcOff = ' and 1 = 0';
        recOff = ' and 1 = 0';
        break;

      case '_Decharges':
        cnjOff = ' and 1 = 0';
        dchrjOff = '';
        dcOff = ' and 1 = 0';
        recOff = ' and 1 = 0';
        break;

      case '_DCSrequests':
        cnjOff = ' and 1 = 0';
        dchrjOff = ' and 1 = 0';
        dcOff = '';
        recOff = ' and 1 = 0';
        break;
    }
  }

  let cnjCount = 0;
  let dchrgCount = 0;
  let dcCount = 0;
  let allCount = 0;

  //console.log(
  // `select u.id as uid, concat(u.fname, " ", u.lname) as unme, e.nme as entity, u.jobeTitle, u.etablissment, c.id as dmndID, c.dmntDte, c.stts from _Conjes c inner join _Users u on c.usr = u.id left join _Entity e on u.actualEntity = e.id where u.id != 0 ${cndtion} ${cnjOff}`
  // );

  var [cnjs] = await db.execute(
    `select u.id as uid, concat(u.fname, " ", u.lname) as unme, e.nme as entity, u.jobeTitle, u.etablissment, c.id as dmndID, c.dmntDte, c.stts from _Conjes c inner join _Users u on c.usr = u.id left join _Entity e on u.actualEntity = e.id where u.id != 0 ${cndtion} ${cnjOff}`
  );
  cnjs.forEach((i) => {
    i.DmntTpe = 'Demande de Congé';
    i.tbl = '_Conjes';
    cnjCount++;
    allCount++;
  });
  var [dchrcg] = await db.execute(
    `select u.id as uid, concat(u.fname, " ", u.lname) as unme, e.nme as entity, u.jobeTitle, u.etablissment, c.id as dmndID, c.dmntDte, c.stts from _Decharges c inner join _Users u on c.usr = u.id left join _Entity e on u.actualEntity = e.id where u.id != 0 ${cndtion} ${dchrjOff}`
  );
  dchrcg.forEach((i) => {
    i.DmntTpe = 'Demande de Décharge';
    i.tbl = '_Decharges';
    allCount++;
    dchrgCount++;
  });
  var [dplcmnt] = await db.execute(
    `select u.id as uid, concat(u.fname, " ", u.lname) as unme, e.nme as entity, u.jobeTitle, u.etablissment, c.id as dmndID, c.dmntDte, c.stts from _deplacements c inner join _Users u on c.usr = u.id left join _Entity e on u.actualEntity = e.id where u.id != 0 ${cndtion} ${recOff}`
  );
  dplcmnt.forEach((i) => {
    i.DmntTpe = 'Demande de Déplacement';
    i.tbl = '_deplacements';
    allCount++;
  });
  var [dcmnts] = await db.execute(
    `select u.id as uid, concat(u.fname, " ", u.lname) as unme, e.nme as entity, u.jobeTitle, u.etablissment, c.id as dmndID, c.dmntDte, c.stts from _DCSrequests c inner join _Users u on c.usr = u.id left join _Entity e on u.actualEntity = e.id where u.id != 0 ${DCcndtion} ${dcOff}`
  );
  dcmnts.forEach((i) => {
    i.DmntTpe = 'Demande de Documents';
    i.tbl = '_DCSrequests';
    allCount++;
    dcCount++;
  });

  var [recups] = await db.execute(
    `select u.id as uid, concat(u.fname, " ", u.lname) as unme, e.nme as entity, u.jobeTitle, u.etablissment, c.id as dmndID, c.dmntDte, c.stts from _recups c inner join _Users u on c.usr = u.id left join _Entity e on u.actualEntity = e.id where u.id != 0 ${cndtion} ${recOff}`
  );
  recups.forEach((i) => {
    i.DmntTpe = 'Demande de récupération';
    i.tbl = '_recups';
    allCount++;
  });

  // var [cnjCount] = await db.execute(
  //   `select count(id) as c from _Conjes where responsableValidation = 1 and HRvalidation is null;`
  // );
  // var [dchrgCount] = await db.execute(
  //   `select count(id) as c from _Decharges where responsableValidation = 1 and HRvalidation is null;`
  // );
  // var [dcCount] = await db.execute(
  //   `select count(id) as c from _DCSrequests where stts is null or stts = 4;`
  // );
  // var allCount =
  //   parseInt(cnjCount[0].c) +
  //   parseInt(dchrgCount[0].c) +
  //   parseInt(dcCount[0].c);

  // var sttcs = {
  //   cnjCount: cnjCount[0].c,
  //   dchrgCount: dchrgCount[0].c,
  //   dcCount: dcCount[0].c,
  //   allCount: allCount,
  // };

  var sttcs = {
    cnjCount: cnjCount,
    dchrgCount: dchrgCount,
    dcCount: dcCount,
    allCount: allCount,
  };

  // //console.log(sttcs);

  var globLst = [].concat(cnjs, dchrcg, dplcmnt, dcmnts, recups);
  globLst.sort((a, b) => new Date(b.dmntDte) - new Date(a.dmntDte));
  var stts = (s) => {
    var h = '';
    switch (s) {
      case 0:
        h = 'Rejetée';
        break;
      case 1:
        h = 'Validé';

        break;

      case 2:
        h = 'Annulé';

        break;

      case 4:
        h = 'En attente de signature';

        break;

      default:
        h = 'En Cours';

        break;
    }
    return h;
  };

  globLst.forEach((e) => {
    var btn = '';
    if (
      stts(e.stts) == 'En Cours' ||
      stts(e.stts) == 'En attente de signature'
    ) {
      btn = `<button type="button" class="btn btn-success btn-rounded btn-icon" onclick="openTreatWndw(${e.dmndID}, '${e.tbl}')" > 
                    <i class="mdi mdi-pencil"></i> 
            </button>`;
    }
    tbl += `
        <tr>
          <td class="py-1"> <a href="/Service-Admin/Collaborateur?i=${
            e.uid
          }" >${e.unme}</a >
          </td>
          <td>${e.entity}</td>
          <td>${e.jobeTitle}</td>
          <td>${e.etablissment}</td>
          <td>${e.DmntTpe}</td>
          <td>${formateDate(e.dmntDte)}</td>
          <td>${stts(e.stts)}</td>
          <td class="text-center">
          ${btn}
          </td>
        </tr>
    
    `;
  });
  // //console.log(sttcs);

  res.json({ tbl: tbl, sttcs: sttcs });
});

app.post('/getTreatWindow', async (req, res) => {
  //
  //   const [Scnj] = await db.execute(
  //     `select soldCnj from _Users where id = ${id}`
  //   );

  var outpt = ``;

  switch (req.body.t) {
    case '_Conjes':
      var [cnjTr] = await db.execute(
        `select * from _Conjes where id = ${req.body.i}`
      );
      var [usrInfo] = await db.execute(
        `select * from _Users where id = (select usr from _Conjes where id = ${req.body.i})`
      );
      const [cnjs] = await db.execute(
        `select * from _Conjes where usr = ${usrInfo[0].id}`
      );
      var b3 = '';
      outpt = `
        <h4 class="card-title">
        Solde congés annuel payés :
        <span id="soldConge">${usrInfo[0].soldCnj}</span>
        </h4>
        <span id="soldConge" style="font-style:italic;font-weight: lighter;">Traitement de la demande de congé ${
          cnjTr[0].cnjType
        } (${cnjTr[0].duration} jours) de ${usrInfo[0].fname} ${
        usrInfo[0].lname
      } commençant le ${formateDate(
        cnjTr[0].fday
      )} et se terminant le ${formateDate(cnjTr[0].lday)} inclus.</span>
        <br>
        <br>
        <span style="text-decoration: underline;">Approuvez-vous cette demande ? </span>
        <input type="text" class="form-control" name="cnjTrComment" onInput="$('#cnjTrComment').css('border', '1px solid grey');" id="cnjTrComment" placeholder="Écrivez un commentaire pour que vous puissiez traiter cette demande...."/>
        &nbsp;&nbsp;&nbsp;<b><a href="#cnjTrComment" onclick="RHtreatCnj(1, ${
          req.body.i
        })">Oui</a></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b><a href="#cnjTrComment" onclick="RHtreatCnj(0, ${
        req.body.i
      })">Non</a></b>
        <br>
        <br>
         
        <h4 class="card-title">Liste des Congés</h4>
        <div style="width:100%; " >
        <table class="table table-striped scrollable-table" style="width:100%;overflow-y: scroll;height: 200px;display: block;">
        <thead>
          <tr>
            <th>Premier jour de congé</th>
            <th>Dernier jour de congé</th>
            <th>Nombre des jours</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody >`;
      cnjs.forEach((e) => {
        switch (e.stts) {
          case 2:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-danger">Annulé</label>`;
            break;

          case 1:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-success">Validée</label>`;
            break;

          case 0:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-danger">Rejetée</label>`;
            break;

          default:
            b3 = `<label style="cursor:wait;" class="badge badge-warning">En cours</label>`;
            break;
        }
        outpt += `<tr>
            
                      <td>${formateDate(e.fday)}</td>
                      <td>${formateDate(e.lday)}</td>
                      <td class="text-center">${e.duration}</td>
                      <td>${b3}</td>
                    </tr>`;
      });

      outpt += `</tbody>
      </table></div>`;

      break;

    case '_DCSrequests':
      // Yassine Baghdadi a demandé ces documents et il a commenté : ana bghit hado
      var [dt] = await db.execute(
        `select u.id, concat(u.fname, " ", u.lname) as usrNme, d.dcs, d.msg , d.stts from _DCSrequests d inner join _Users u on d.usr = u.id where d.id = ${req.body.i}`
      );
      var docs = String(dt[0].dcs).split(',');

      outpt = `
        <br>
        <h4 class="card-title">
        ${dt[0].usrNme} a demandé ${docs.length} documents et il a commenté :
        </h4> <span style="font-style:italic;font-weight: lighter;">" ${dt[0].msg} "</span>
        <br>
        <br>
        `;
      docs.forEach((e) => {
        // //console.log(e);

        let b = `<span style="text-decoration: underline;cursor: not-allowed;" title="Non disponible au téléchargement">${
          docs.indexOf(e) + 1
        } - ${e} .</span><br></br>`;

        if (
          [
            'Attestation de travail',
            'Attestation de salaire',
            'Domiciliation de salaire',
          ].includes(e.trim())
        ) {
          b = `<span style="text-decoration: underline;" ><a href="#dmndsTbl" onclick="downld(${
            dt[0].id
          }, '${e}')">${docs.indexOf(e) + 1} - ${e} .</a></span><br>`;
        }
        outpt += `${b}<br>`;
      });

      if (dt[0].stts == null) {
        outpt += `
        
        <hr>
        <span style="font-weight:bold;color:red;" >*</span> Si les documents sont en attente de signature, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;" onclick="RHtreatDCSreq(4, ${req.body.i})">"En attente de signature"</a>. S'ils sont prêts, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;" onclick="RHtreatDCSreq(1, ${req.body.i})">"Prêt à livrer"</a>. Sinon, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;"  onclick="RHtreatDCSreq(0, ${req.body.i})">"REFUSER"</a> si la demande est refusée.
        
        <br>
        <br>
         `;
      } else if (dt[0].stts == 4) {
        outpt += `
        
        <hr>
        <span style="font-weight:bold;color:red;" >*</span> S'ils sont prêts, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;" onclick="RHtreatDCSreq(1, ${req.body.i})">"Prêt à livrer"</a>. Sinon, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;"  onclick="RHtreatDCSreq(0, ${req.body.i})">"REFUSER"</a> si la demande est refusée.
        
        <br>
        <br>
         `;
      } else {
        outpt += `
        
        <hr>
        
        
        <br>
        <br>
         `;
      }

      break;

    case '_Decharges':
      var [usrInfo] = await db.execute(
        `select * from _Users where id = (select usr from _Decharges where id = ${req.body.i})`
      );
      var usrNme = `${usrInfo[0].fname} ${usrInfo[0].lname}`;
      const [dchrges] = await db.execute(
        `select * from _Decharges where usr = ${usrInfo[0].id}`
      );
      var [thisDchrge] = await db.execute(
        `select * from _Decharges where id = ${req.body.i}`
      );

      outpt = `
        <h4 class="card-title">
        ${usrNme} a demandé une décharge.
        </h4>
        <span style="font-style:italic;font-weight: lighter;">${usrNme} a demandé à quitter le travail (décharge) le ${formateDate(
        thisDchrge[0].leaveDate
      )} et à revenir le ${formateDate(thisDchrge[0].returnDate)}, pour un ${
        thisDchrge[0].reason
      }, et il a commenté : </span><br>" ${thisDchrge[0].msg} ".
        <br>
        <br>
        <span style="text-decoration: underline;">Approuvez-vous cette demande ? </span>
        <input type="text" class="form-control" name="DchrgTrComment" onInput="$('#DchrgTrComment').css('border', '1px solid grey');" id="DchrgTrComment" placeholder="Écrivez un commentaire pour que vous puissiez traiter cette demande...."/>
        &nbsp;&nbsp;&nbsp;<b><a href="#" onclick="treatTheDchrg(1, ${
          req.body.i
        })">Oui</a></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b><a href="#" onclick="treatTheDchrg(0, ${
        req.body.i
      })">Non</a></b>
        <br>
        <br>
         
        <h4 class="card-title">Liste des Décharge</h4>
        <div style="width:100%; " >
        <table class="table table-striped scrollable-table" style="width:100%;overflow-y: scroll;height: 200px;display: block;">
        <thead>
          <tr>
            <th>Raison de la décharger</th>
            <th>Date Sortie</th>
            <th>Date Reprise</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody >`;
      dchrges.forEach((e) => {
        switch (e.stts) {
          case 2:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-danger">Annulé</label>`;
            break;

          case 1:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-success">Validée</label>`;
            break;

          case 0:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-danger">Rejetée</label>`;
            break;

          default:
            b3 = `<label style="cursor:wait;" class="badge badge-warning">En attendant</label>`;
            break;
        }
        outpt += `<tr style="cursor:help;" title="${e.msg}">
                      <td><i class="fa-regular fa-message"></i>${e.reason}</td>
                      <td>${formateDate(e.leaveDate)}</td>
                      <td class="text-center">${formateDate(e.returnDate)}</td>
                      <td>${b3}</td>
                    </tr>`;
      });

      outpt += `</tbody>
      </table></div>`;
      break;

    case '_deplacements':
      var [usrInfo] = await db.execute(
        `select * from _Users where id = (select usr from _deplacements where id = ${req.body.i})`
      );
      var usrNme = `${usrInfo[0].fname} ${usrInfo[0].lname}`;
      const [dplcms] = await db.execute(
        `select * from _deplacements where usr = ${usrInfo[0].id}`
      );
      var [thisDplcmt] = await db.execute(
        `select * from _deplacements where id = ${req.body.i}`
      );

      outpt = `
        <h4 class="card-title">
        ${usrNme} a demandé un déplacement.
        </h4>
        <span style="font-style:italic;font-weight: lighter;">${usrNme} a demandé un déplacement le ${formateDate(
        thisDplcmt[0].leaveDate
      )} et à revenir le ${formateDate(thisDplcmt[0].returnDate)}, pour un ${
        thisDplcmt[0].reason
      }, et il a commenté : </span><br>" ${thisDplcmt[0].notes} ".
        <br>
        <br>
        <span style="text-decoration: underline;">Approuvez-vous cette demande ? </span>
        <input type="text" class="form-control" name="DplcmComment" onInput="$('#DplcmComment').css('border', '1px solid grey');" id="DplcmComment" placeholder="Écrivez un commentaire pour que vous puissiez traiter cette demande...."/>
        &nbsp;&nbsp;&nbsp;<b><a href="#" onclick="treatTheDplcm(1, ${
          req.body.i
        })">Oui</a></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b><a href="#" onclick="treatTheDplcm(0, ${
        req.body.i
      })">Non</a></b>
        <br>
        <br>
         
        <h4 class="card-title">Liste des déplacements</h4>
        <div style="width:100%; " >
        <table class="table table-striped scrollable-table" style="width:100%;overflow-y: scroll;height: 200px;display: block;">
        <thead>
          <tr>
            <th>Raison</th>
            <th>Délegué à </th>
            <th>Date Sortie</th>
            <th>Date Reprise</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody >`;
      dplcms.forEach((e) => {
        switch (e.stts) {
          case 2:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-danger">Annulé</label>`;
            break;

          case 1:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-success">Validée</label>`;
            break;

          case 0:
            b3 = `<label style="cursor:not-allowed;" class="badge badge-danger">Rejetée</label>`;
            break;

          default:
            b3 = `<label style="cursor:wait;" class="badge badge-warning">En attendant</label>`;
            break;
        }
        outpt += `<tr style="cursor:help;" title="NOTES : ${e.notes}">
                      <td><i class="fa-regular fa-message"></i>${e.reason}</td>
                      <td><i class="fa-regular fa-message"></i>${
                        e.delegation
                      }</td>
                      <td>${formateDate(e.leaveDate)}</td>
                      <td class="text-center">${formateDate(e.returnDate)}</td>
                      <td>${b3}</td>
                    </tr>`;
      });

      outpt += `</tbody>
      </table></div>`;

      break;

    case '_recups':
      var [dt] = await db.execute(
        `select u.id, concat(u.fname, " ", u.lname) as usrNme, d.msg, d.leaveDate, d.returnDate from _recups d inner join _Users u on d.usr = u.id where d.id = ${req.body.i}`
      );

      outpt = `
        <br>
        <h4 class="card-title">
        ${dt[0].usrNme} a demandé récupération à partir du ${formateDate(
        dt[0].leaveDate
      )} et retour le ${formateDate(dt[0].returnDate)} et il a commenté :
        </h4> <span style="font-style:italic;font-weight: lighter;">" ${
          dt[0].msg
        } "</span>
        <br>
        <br>
        `;

      outpt += `
        
        <hr>
        <span style="font-weight:bold;color:red;" >*</span> veuillez <a href="#" style="font-weight:bold;" onclick="RHtreatRCPreq(1, ${req.body.i})">ACCEPTER</a>  ou <a href="#" style="font-weight:bold;"  onclick="RHtreatRCPreq(0, ${req.body.i})">REFUSER</a> cette demande
        
        <br>
        <br>
         `;
      break;

    default:
      break;
  }

  res.json(outpt);
});

// app.post('/RHdownldDCSreq', async (req, res) => {
//   // try {
//   var [usr] = await db.execute(
//     `select * from _Users u inner join _Entity e on u.actualEntity = e.id where u.id = ${req.body.i}`
//   );

//   const date = new Date();
//   var docName = req.body.d;

//   const docFilePath = path.join(
//     __dirname,
//     `../frntEnd/rcs/docs/${usr[0].nme}/${docName.trim()}.docx`
//   );

//   const finalDocPath = path.join(
//     __dirname,
//     `../frntEnd/rcs/docs/temp/${docName.trim()}-${usr[0].fname}-${
//       usr[0].lname
//     }.docx`
//   );
//   const fileNmeToUsr = `${docName.trim()}-${usr[0].fname}-${usr[0].lname}.docx`;

//   const content = fs.readFileSync(docFilePath, 'binary');

//   const zip = new PizZip(content);

//   const doc = new Docxtemplater(zip);
//   var integraDTE = new Date(usr[0].integrationDate);
//   var newDt = {};

//   newDt.w3 = `${usr[0].fname} ${usr[0].lname}`;
//   newDt.w33 = `${usr[0].fname} ${usr[0].lname}`;
//   newDt.w1 = `${usr[0].nme}`;
//   newDt.w6 = `${usr[0].nme}`;
//   newDt.w2 = `${usr[0].address}`;
//   newDt.w4 = `${usr[0].adress}`; // user address
//   newDt.w5 = `${usr[0].CIN}`;
//   newDt.w7 = `${usr[0].jobeTitle}`;
//   newDt.w8 = `${new Intl.DateTimeFormat('fr-FR', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     timeZone: 'Africa/Casablanca',
//   }).format(integraDTE)}`;
//   newDt.dte = `Casablanca , le ${new Intl.DateTimeFormat('fr-FR', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//     timeZone: 'Africa/Casablanca',
//   }).format(date)}`;
//   newDt.w99 = `${usr[0].salaire}`;
//   newDt.w88 = `${usr[0].RIB}`;
//   newDt.w77 = `${usr[0].bankName}`;
//   newDt.w66 = `${usr[0].bankAgence}`;

//   // switch (req.body.d) {
//   //   case 'Attestation de travail':
//   //       newDt.w3 = `${usr[0].fname} ${usr[0].lname}`;
//   //       newDt.w33 = `${usr[0].fname} ${usr[0].lname}`;
//   //       newDt.w1 = `${usr[0].nme}`;
//   //       newDt.w6 = `${usr[0].nme}`;
//   //       newDt.w2 = `${usr[0].address}`;
//   //       newDt.w4 = `${usr[0].adress}`; // user address
//   //       newDt.w5 = `${usr[0].CIN}`;
//   //       newDt.w7 = `${usr[0].jobeTitle}`;
//   //       newDt.w8 = `${new Intl.DateTimeFormat('fr-FR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Casablanca', }).format(integraDTE)}`;
//   //       newDt.dte = `Casablanca , le ${new Intl.DateTimeFormat('fr-FR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Casablanca', }).format(date)}`;
//   //       newDt.w99 = `${usr[0].salaire}`

//   //     break;

//   //   case 'Attestation de salaire':

//   //     newDt.w3 = `${usr[0].fname} ${usr[0].lname}`;
//   //     newDt.w33 = `${usr[0].fname} ${usr[0].lname}`;
//   //     newDt.w1 = `${usr[0].nme}`;
//   //     newDt.w6 = `${usr[0].nme}`;
//   //     newDt.w2 = `${usr[0].address}`;
//   //     newDt.w4 = `${usr[0].adress}`; // user address
//   //     newDt.w5 = `${usr[0].CIN}`;
//   //     newDt.w7 = `${usr[0].jobeTitle}`;
//   //     newDt.w8 = `${new Intl.DateTimeFormat('fr-FR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Casablanca', }).format(integraDTE)}`;
//   //     newDt.dte = `Casablanca , le ${new Intl.DateTimeFormat('fr-FR', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Casablanca', }).format(date)}`;

//   //     break;

//   //   case 'Domiciliation de salaire':

//   //     break;

//   // }

//   doc.setData(newDt);

//   try {
//     doc.render();
//   } catch (error) {
//     console.error('Error rendering document:', error);
//     res.status(500).send('Error processing document');
//     return;
//   }

//   const buf = doc.getZip().generate({ type: 'nodebuffer' });

//   fs.writeFileSync(finalDocPath, buf);

//   res.setHeader(
//     'Content-Disposition',
//     `attachment; filename="${fileNmeToUsr}"`
//   );
//   res.download(finalDocPath, (err) => {
//     //console.log('File path:', finalDocPath);
//     //console.log('File exists:', fs.existsSync(finalDocPath));
//     if (err) {
//       console.error(err);
//     }

//     fs.unlinkSync(finalDocPath);
//   });
//   // } catch (error) {
//   //   lg.error(error);
//   // }
// });

app.post('/RHdownldDCSreq', async (req, res) => {
  //console.log(req.body);

  // try {
  // Use parameterized query to prevent SQL injection
  const [usr] = await db.execute(
    `SELECT * FROM _Users u INNER JOIN _Entity e ON u.actualEntity = e.id WHERE u.id = ?`,
    [req.body.i]
  );

  if (!usr.length) {
    return res.status(404).send('User  not found');
  }

  const date = new Date();
  const docName = req.body.d.trim();

  const docFilePath = path.join(
    __dirname,
    `../frntEnd/rcs/docs/${usr[0].nme}/${docName}.docx`
  );

  const finalDocPath = path.join(
    __dirname,
    `../frntEnd/rcs/docs/temp/${docName}-${usr[0].fname}-${usr[0].lname}.docx`
  );

  const fileNmeToUsr = `${docName}-${usr[0].fname}-${usr[0].lname}.docx`;

  // Check if the document file exists
  if (!fs.existsSync(docFilePath)) {
    return res.status(404).send('Document template not found');
  }

  const content = fs.readFileSync(docFilePath, 'binary');
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip);
  const integraDTE = new Date(usr[0].integrationDate);
  const newDt = {
    w3: `${usr[0].fname} ${usr[0].lname}`,
    w33: `${usr[0].fname} ${usr[0].lname}`,
    w1: `${usr[0].nme}`,
    w6: `${usr[0].nme}`,
    w2: `${usr[0].address}`,
    w4: `${usr[0].adress}`, // user address
    w5: `${usr[0].CIN}`,
    w7: `${usr[0].jobeTitle}`,
    w8: `${new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Casablanca',
    }).format(integraDTE)}`,
    dte: `Casablanca , le ${new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Casablanca',
    }).format(date)}`,
    w99: `${usr[0].salaire}`,
    w88: `${usr[0].RIB}`,
    w77: `${usr[0].bankName}`,
    w66: `${usr[0].bankAgence}`,
  };

  doc.setData(newDt);

  try {
    doc.render();
  } catch (error) {
    console.error('Error rendering document:', error);
    return res.status(500).send('Error processing document');
  }

  const buf = doc.getZip().generate({ type: 'nodebuffer' });
  fs.writeFileSync(finalDocPath, buf);

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${fileNmeToUsr}"`
  );

  // Download the file and handle cleanup
  res.download(finalDocPath, (err) => {
    if (err) {
      console.error('Error during file download:', err);
    }
    // Cleanup: Delete the temporary file after download
    fs.unlink(finalDocPath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting temporary file:', unlinkErr);
      }
    });
  });
  // } catch (error) {
  //   console.error('Unexpected error:', error);
  //   res.status(500).send('Internal server error');
  // }
});

app.post('/openDCStrWndw', async (req, res) => {
  // var outpt = '';
  // var [dt] = await db.execute(
  //   `select u.id, concat(u.fname, " ", u.lname) as usrNme, d.dcs, d.msg from _DCSrequests d inner join _Users u on d.usr = u.id where d.id = ${req.body.i}`
  // );
  // var docs = String(dt[0].dcs).split(',');

  // outpt = `
  //       <br>
  //       <h4 class="card-title">
  //       ${dt[0].usrNme} a demandé ${docs.length} documents et il a commenté :
  //       </h4> <span style="font-style:italic;font-weight: lighter;">" ${dt[0].msg} "</span>
  //       <br>
  //       <br>
  //       `;
  // docs.forEach((e) => {
  //   outpt += `<span style="text-decoration: underline;" ><a href="#"  onclick="downld(${
  //     dt[0].id
  //   }, '${e}')">${docs.indexOf(e) + 1} - ${e}</a> .</span><br>`;
  // });

  // outpt += `

  //       <hr>
  //       <span style="font-weight:bold;color:red;" >*</span> Si les documents sont en attente de signature, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;" onclick="RHtreatDCSreq(4, ${req.body.i})">"En attente de signature"</a>. S'ils sont prêts, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;" onclick="RHtreatDCSreq(1, ${req.body.i})">"Prêt à livrer"</a>. Sinon, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;"  onclick="RHtreatDCSreq(0, ${req.body.i})">"REFUSER"</a> si la demande est refusée.

  //       <br>
  //       <br>
  //        `;

  var [dt] = await db.execute(
    `select u.id, concat(u.fname, " ", u.lname) as usrNme, d.dcs, d.msg , d.stts from _DCSrequests d inner join _Users u on d.usr = u.id where d.id = ${req.body.i}`
  );
  var docs = String(dt[0].dcs).split(',');

  outpt = `
    <br>
    <h4 class="card-title">
    ${dt[0].usrNme} a demandé ${docs.length} documents et il a commenté :
    </h4> <span style="font-style:italic;font-weight: lighter;">" ${dt[0].msg} "</span>
    <br>
    <br>
    `;
  docs.forEach((e) => {
    let b = `<span style="text-decoration: underline;cursor: not-allowed;" title="Non disponible au téléchargement">${
      docs.indexOf(e) + 1
    } - ${e} .</span><br></br>`;

    if (
      [
        'Attestation de travail',
        'Attestation de salaire',
        'Domiciliation de salaire',
      ].includes(e)
    ) {
      b = `<span style="text-decoration: underline;" ><a href="#dmndsTbl" onclick="downld(${
        dt[0].id
      }, '${e}')">${docs.indexOf(e) + 1} - ${e} .</a></span><br>`;
    }
    outpt += `${b}<br>`;
  });

  if (dt[0].stts == null) {
    outpt += `
    
    <hr>
    <span style="font-weight:bold;color:red;" >*</span> Si les documents sont en attente de signature, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;" onclick="RHtreatDCSreq(4, ${req.body.i})">"En attente de signature"</a>. S'ils sont prêts, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;" onclick="RHtreatDCSreq(1, ${req.body.i})">"Prêt à livrer"</a>. Sinon, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;"  onclick="RHtreatDCSreq(0, ${req.body.i})">"REFUSER"</a> si la demande est refusée.
    
    <br>
    <br>
     `;
  } else if (dt[0].stts == 4) {
    outpt += `
    
    <hr>
    <span style="font-weight:bold;color:red;" >*</span> S'ils sont prêts, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;" onclick="RHtreatDCSreq(1, ${req.body.i})">"Prêt à livrer"</a>. Sinon, cliquez sur <a href="#" style="font-weight:bold;text-transform:uppercase;"  onclick="RHtreatDCSreq(0, ${req.body.i})">"REFUSER"</a> si la demande est refusée.
    
    <br>
    <br>
     `;
  } else {
    outpt += `
    
    <hr>
    
    
    <br>
    <br>
     `;
  }

  res.json(outpt);
});

app.post('/RHtreatDCSreq', async (req, res) => {
  //todo to be continued ......

  var [usr] = await db.execute(
    `select u.id, u.email, concat(u.fname, " ", u.lname) as usnme from _DCSrequests d inner join _Users u on d.usr = u.id where d.id = ${req.body.i}`
  );

  var ss = req.body.s ? 'livré' : 'refusé';
  switch (req.body.s) {
    case 1:
      ss = 'livré';
      break;
    case 4:
      ss = 'En attente de signature';
      break;

    case 0:
      ss = 'refusé';
      break;
  }

  await db.execute(
    `update _DCSrequests set stts = ${req.body.s}, treatedBy = ${
      req.cookies.usdt.id
    }, treatmntDte = "${getCurrentTime()}" where id = ${req.body.i}`
  );
  await db.execute(`insert into _Histories(usr, alfa3il, sbjct, actionDteTme, ttle, details) values(${
    usr[0].id
  }, ${
    req.cookies.usdt.id
  }, "ADMIN", "${getCurrentTime()}", "Traitement de document", 
  "${req.cookies.usdt.fname} ${
    req.cookies.usdt.lname
  } a traité la demande de documents de l'utilisateur ${
    usr[0].usnme
  } et l'a marqué comme ${ss}")`);

  if (req.body.s == 1) {
    await sendMail(
      usr[0].email,
      `RE: Documents prêts à être récupérés`,
      `
      <div style='font-family: Arial, sans-serif;'><p>Bonjour ${usr[0].usnme},</p><br><p>Les documents demandés sont prêts. Vous pouvez les récupérer auprès du département RH.<p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
      `
    );
  } else if (req.body.s == 0) {
    await sendMail(
      usr[0].email,
      `RE: Rejet de la demande de documents`,
      `
      <div style='font-family: Arial, sans-serif;'><p>Bonjour ${usr[0].usnme},</p><br><p>Nous regrettons de vous informer que votre demande de documents a été rejetée.<p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
      `
    );
  }
  res.json('done');
});

app.post('/treatTheDchrg', async (req, res) => {
  try {
    var rslt = req.body.s ? 'accepté' : 'rejeté';
    var [dchrge] = await db.execute(
      `select c.id as id, c.usr as usr, concat(u.fname, " ", u.lname) as usrNme, u.email, c.leaveDate, c.returnDate from _Decharges c inner join _Users u on c.usr = u.id where c.id = ${req.body.i}`
    );
    await db.execute(
      `update _Decharges set HRvalidation = ${req.body.s}, hrCmnt = "${
        req.body.c
      }", hrTreatDte = "${getCurrentTime()}", stts = ${req.body.s} where id = ${
        req.body.i
      }`
    );

    await db.execute(`insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) values(${
      dchrge[0].usr
    }, ${
      req.cookies.usdt.id
    }, "ADMIN", "${getCurrentTime()}", "Traitement de congé", 
    "${req.cookies.usdt.fname} ${
      req.cookies.usdt.lname
    } (RH) a ${rslt} la demande de décharge de ${
      dchrge[0].usrNme
    }  partir à ${formateDate(
      dchrge[0].leaveDate
    )} et est revenu à ${formateDate(dchrge[0].returnDate)} et il a dit : ${
      req.body.c
    }")`);

    if (req.body.s == 1) {
      await sendMail(
        dchrge[0].email,
        `RE: la demande décharge a été traitée`,
        `
        <div style='font-family: Arial, sans-serif;'><p>Bonjour ${dchrge[0].usrNme},</p><br><p>Votre demande de décharge a été acceptée. Le document attend votre signature.<p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
        `
      );
    } else if (req.body.s == 0) {
      await sendMail(
        dchrge[0].email,
        `RE: la demande décharge a été traitée`,
        `
        <div style='font-family: Arial, sans-serif;'><p>Bonjour ${dchrge[0].usrNme},</p><br><p>Votre demande de décharge a été refusée par les ressources humaines.<p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
        `
      );
    }

    res.json('done');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/RHtreatRCPreq', async (req, res) => {
  try {
    var rslt = req.body.s ? 'accepté' : 'rejeté';
    var [dchrge] = await db.execute(
      `select c.id as id, c.usr as usr, concat(u.fname, " ", u.lname) as usrNme, u.email, c.leaveDate, c.returnDate from _recups c inner join _Users u on c.usr = u.id where c.id = ${req.body.i}`
    );
    await db.execute(
      `update _recups set HRvalidation = ${
        req.body.s
      }, hrTreatDte = "${getCurrentTime()}", stts = ${req.body.s} where id = ${
        req.body.i
      }`
    );

    await db.execute(`insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) values(${
      dchrge[0].usr
    }, ${
      req.cookies.usdt.id
    }, "ADMIN", "${getCurrentTime()}", "Traitement de récupération", 
    "${req.cookies.usdt.fname} ${
      req.cookies.usdt.lname
    } (RH) a ${rslt} la demande de récupération de ${
      dchrge[0].usrNme
    }  partir à ${formateDate(
      dchrge[0].leaveDate
    )} et est revenu à ${formateDate(dchrge[0].returnDate)}.")`);

    if (req.body.s == 1) {
      await sendMail(
        dchrge[0].email,
        `RE: la demande récupération a été traitée`,
        `
        <div style='font-family: Arial, sans-serif;'><p>Bonjour ${dchrge[0].usrNme},</p><br><p>Votre demande de récupération a été acceptée. Le document attend votre signature.<p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
        `
      );
    } else if (req.body.s == 0) {
      await sendMail(
        dchrge[0].email,
        `RE: la demande récupération a été traitée`,
        `
        <div style='font-family: Arial, sans-serif;'><p>Bonjour ${dchrge[0].usrNme},</p><br><p>Votre demande de récupération a été refusée par les ressources humaines.<p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
        `
      );
    }

    res.json('done');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/treatTheDplcm', async (req, res) => {
  try {
    var rslt = req.body.s ? 'accepté' : 'rejeté';
    var [dplc] = await db.execute(
      `select c.id as id, c.usr as usr, concat(u.fname, " ", u.lname) as usrNme, u.email, c.leaveDate, c.returnDate from _deplacements c inner join _Users u on c.usr = u.id where c.id = ${req.body.i}`
    );
    await db.execute(
      `update _deplacements set HRvalidation = ${req.body.s}, hrCmnt = "${
        req.body.c
      }", hrTreatDte = "${getCurrentTime()}", stts = ${req.body.s} where id = ${
        req.body.i
      }`
    );

    await db.execute(`insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) values(${
      dplc[0].usr
    }, ${
      req.cookies.usdt.id
    }, "ADMIN", "${getCurrentTime()}", "Traitement de déplacement", 
    "${req.cookies.usdt.fname} ${
      req.cookies.usdt.lname
    } (RH) a ${rslt} la demande de déplacement de ${
      dplc[0].usrNme
    }  partir à ${formateDate(dplc[0].leaveDate)} et est revenu à ${formateDate(
      dplc[0].returnDate
    )} et il a dit : ${req.body.c}")`);

    if (req.body.s == 1) {
      await sendMail(
        dplc[0].email,
        `RE: la demande déplacement a été traitée`,
        `
        <div style='font-family: Arial, sans-serif;'><p>Bonjour ${dplc[0].usrNme},</p><br><p>Votre demande de déplacement a été acceptée. Le document attend votre signature.<p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
        `
      );
    } else if (req.body.s == 0) {
      await sendMail(
        dplc[0].email,
        `RE: la demande déplacement a été traitée`,
        `
        <div style='font-family: Arial, sans-serif;'><p>Bonjour ${dplc[0].usrNme},</p><br><p>Votre demande de déplacement a été refusée par les ressources humaines.<p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
        `
      );
    }

    res.json('done');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/getDchrgeTble', async (req, res) => {
  var t = '';
  var access = true;

  var [prms] = await db.execute(
    `select view_DCHRJ_usr, treat_DCHRJ_usr from _Managemnt where usr = ${req.cookies.usdt.id}`
  );

  if (prms[0].view_DCHRJ_usr == 1) {
    const [d] = await db.execute(
      `select * from _Decharges where usr = ${req.body.i}`
    );

    d.forEach((e) => {
      var b1 = `<label style="cursor:not-allowed;" title="Vous n'avez pas l'autorisation de traiter les demandes de Décharge" class="badge badge-danger">Annulé</label>`;
      var b2 = `<label style="cursor:not-allowed;" title="Vous n'avez pas l'autorisation de traiter les demandes de Décharge" class="badge badge-danger">Annulé</label>`;

      if (prms[0].treat_DCHRJ_usr == 1) {
        switch (e.responsableValidation) {
          case 2:
            b1 = `<label style="cursor:not-allowed;" class="badge badge-danger">Annulé</label>`;
            break;

          case 1:
            b1 = `<label style="cursor:not-allowed;" class="badge badge-success">Livré</label>`;
            break;

          case 0:
            b1 = `<label style="cursor:not-allowed;" class="badge badge-danger">Rejetée</label>`;
            break;

          default:
            // b1 = `<label style="cursor:pointer;" onclick="openDCStrWndw(${e.id})" class="badge badge-warning">En attendant</label>`;
            b1 = `<label style="cursor:pointer;"  class="badge badge-warning">En attendant</label>`;
            break;
        }
        switch (e.stts) {
          case 1:
            b2 = '<label class="badge badge-success" >Validée</label> ';

            break;

          case 0:
            b2 = ' <label class="badge badge-danger" >Rejetté</label> ';
            break;

          case 2:
            b2 = ' <label class="badge badge-danger" >Annulée</label> ';
            break;

          default:
            b2 = ' <label class="badge badge-warning" >En attendant</label> ';
            break;
        }
      }

      t += `
      <tr>
        <td>${formateDate(e.dmntDte)}</td>
        <td class="text-center"><textarea class="form-control" rows="4" disabled>${
          e.leaveDate
        }</textarea></td>
        <td class="text-center"><textarea class="form-control"  rows="3" disabled>${
          e.returnDate
        }</textarea></td>
        <td><label class="badge badge-warning">${b1}</label></td> <!---En cours , En attente signature, Livré , Annulé, Demenade refusé-->
        <td>${b2}</td>
      </tr>
      `;
    });

    //console.log(t);
  } else {
    access = false;
  }

  res.json({ t: t, access: access });
});

app.post('/getDplcmTble', async (req, res) => {
  var t = '';
  var access = true;

  var [prms] = await db.execute(
    `select view_DPLCM_usr, treat_DPLCM_usr from _Managemnt where usr = ${req.cookies.usdt.id}`
  );

  if (prms[0].view_DPLCM_usr == 1) {
    const [d] = await db.execute(
      `select * from _deplacements where usr = ${req.body.i}`
    );

    d.forEach((e) => {
      var b1 = `<label style="cursor:not-allowed;" title="Vous n'avez pas l'autorisation de traiter les demandes de Déplacements" class="badge badge-danger">Annulé</label>`;
      var b2 = `<label style="cursor:not-allowed;" title="Vous n'avez pas l'autorisation de traiter les demandes de Déplacements" class="badge badge-danger">Annulé</label>`;

      if (prms[0].treat_DPLCM_usr == 1) {
        switch (e.responsableValidation) {
          case 2:
            b1 = `<label style="cursor:not-allowed;" class="badge badge-danger">Annulé</label>`;
            break;

          case 1:
            b1 = `<label style="cursor:not-allowed;" class="badge badge-success">Validée</label>`;
            break;

          case 0:
            b1 = `<label style="cursor:not-allowed;" class="badge badge-danger">Rejetée</label>`;
            break;

          default:
            // b1 = `<label style="cursor:pointer;" onclick="openDCStrWndw(${e.id})" class="badge badge-warning">En attendant</label>`;
            b1 = `<label style="cursor:pointer;"  class="badge badge-warning">En attendant</label>`;
            break;
        }
        switch (e.stts) {
          case 1:
            b2 = '<label class="badge badge-success" >Validée</label> ';

            break;

          case 0:
            b2 = ' <label class="badge badge-danger" >Rejetté</label> ';
            break;

          case 2:
            b2 = ' <label class="badge badge-danger" >Annulée</label> ';
            break;

          default:
            b2 = ' <label class="badge badge-warning" >En attendant</label> ';
            break;
        }
      }

      t += `
            
  
              <tr>
                <td>${formateDate(e.dmntDte).split(' ')[0]}</td>
                <td class="text-center">${formateDate(e.leaveDate)}</td>
                <td class="text-center">${formateDate(e.returnDate)}</td>
                <td class="text-center">${e.delegation}</td>
                <td>${b1}</td> <!---En cours , En attente signature, Livré , Annulé, Demenade refusé-->
                <td>${b2}</td>
                
              </tr>
      `;
    });
  } else {
    access = false;
  }

  res.json({ t: t, access: access });
});

app.get('/checkCntrcts', async (req, res) => {
  let i = req.query.i;

  var cntrs = await db.execute(
    `select tpe from _Contracts where usr = ${i} and stts = "EN POSTE" order by id desc LIMIT 1;`
  );

  res.json(cntrs[0].length);
});

app.post('/sveNewCntrct', async (req, res) => {
  var lastCntr = await db.execute(
    `select id, tpe from _Contracts where usr = ${req.body.i} order by id desc LIMIT 1;`
  );

  if (lastCntr[0].length > 0) {
    //console.log(`there is a contract with id ${lastCntr[0][0].id}`);
    //console.log(typeof req.body.clsed);

    if (req.body.clsed == 'true') {
      //console.log(`the last contract should be closed`);

      await db.execute(
        `update _Users set soldCnj = 0, lastTransferDate = "${req.body.startDte}" where id = ${req.body.i};`
      );
      //console.log(`soldCnj has been set to 0`);
      //console.log(
      //   ` **** UPDATE _Contracts SET endDte = "${req.body.ClsdDate}", stts = "${req.body.closeReason}", closeReason = "${req.body.closeReason}" WHERE id = "${lastCntr[0][0].id}"`
      // );

      await db.execute(
        `UPDATE _Contracts SET endDte = "${req.body.ClsdDate}", stts = "${req.body.closeReason}", closeReason = "${req.body.closeReason}" WHERE id = "${lastCntr[0][0].id}"`
      );
      //console.log(
      // `the last cntr changed stts to ${req.body.closeReason} and endDte to ${req.body.ClsdDate}`
      // );
    } else {
      await db.execute(`UPDATE _Contracts SET stts = ? WHERE id = ?`, [
        req.body.s,
        lastCntr[0][0].id,
      ]);
      // //console.log(
      //   `the last cntrct didnt closed and its stts changed to ${req.body.s}`
      // );
    }
  } else {
    await db.execute(
      `update _Users set activeStatus = 1,  firstIntegrationDate = "${req.body.startDte}" where id = ${req.body.i};`
    );
    //console.log(
    `there is no old cntr so first the first intergration date of the user saved as ${req.body.startDte}`;
    // );
  }

  await db.execute(
    `UPDATE _Users SET
                        integrationDate = ?, actualEntity = ?, etablissment = ?, jobeTitle = ?, contractTpe = ?, department = ? WHERE id = ?`,
    [
      req.body.startDte,
      req.body.ent,
      req.body.e,
      req.body.pst,
      req.body.cntrtpe,
      req.body.d,
      req.body.i,
    ]
  );
  //console.log(
  //   `the user info has been updated to match the new contract details `
  // );

  await db.execute(
    `INSERT INTO _Contracts
    (usr, tpe, stts, etablissement, entty, dteIntgr, dteOps, endDte, byUsr, pst)
    VALUES (?, ?, "EN POSTE", ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.body.i,
      req.body.cntrtpe,
      req.body.e,
      req.body.ent,
      req.body.startDte,
      getCurrentTime(),
      req.body.endDte || null,
      req.cookies.usdt.id,
      req.body.pst,
    ]
  );
  //console.log(`the new contract saved `);

  var entt = await db.execute(
    `select nme from _Entity where id = ${req.body.ent}`
  );

  let txt = `Une nouvelle Contrat a été créée par ${req.cookies.usdt.fname} ${req.cookies.usdt.lname} en tant que ${req.body.pst}, à compter du ${req.body.startDte}, au sein de l’établissement ${req.body.e}, et rattachée à l’entité ${entt[0][0].nme}.`;

  await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details )
          values(
            ${req.body.i}, ${
    req.cookies.usdt.id
  }, "ADMIN", "${getCurrentTime()}", "Changement de contrat", "${txt}."
          )`);

  res.json('done');
});

app.post('/cutCntr', async (req, res) => {
  var lastCntr = await db.execute(
    `select id from _Contracts where usr = ${req.body.i} order by id desc LIMIT 1;`
  );

  await db.execute(
    `update _Contracts set stts = "${
      req.body.m
    }", dteOps = "${getCurrentTime()}", endDte = "${req.body.d}", byUsr = "${
      req.cookies.usdt.id
    }", closeReason = "${req.body.m}" where id = ${lastCntr[0][0].id}`
  );

  await db.execute(
    `update _Users set login = "0", 
                        etablissment = null, 
                        activeStatus = "0", 
                        leaveDate = "${req.body.d}", 
                        contractTpe = null, 
                        department = null,
                        integrationDate = null
                        where id = ${req.body.i}`
  );
  await db.execute(
    `insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) values(
                            ${req.body.i}, ${
      req.cookies.usdt.id
    }, "ADMIN", "${getCurrentTime()}", "Changement de contrat", "Le contrat ${
      lastCntr[0][0].id
    } a été coupé avec effet au ${req.body.d}, par ${req.cookies.usdt.fname} ${
      req.cookies.usdt.lname
    }."
    )`
  );
  res.json('done');
});

app.get('/getCntrDetails', async (req, res) => {
  let i = req.query.i;

  var [cntrs] = await db.execute(`select * from _Contracts where id = ${i};`);

  res.json(cntrs[0]);
});

app.post('/edtCntr', async (req, res) => {
  var endDte = req.body.endDte ? `"${req.body.endDte}"` : null;

  await db.execute(`update _Contracts set
                      stts = "${req.body.stts}" ,
                      etablissement = "${req.body.etb}",
                      entty = "${req.body.entt}",
                      tpe = "${req.body.tpe}",
                      dteIntgr = "${req.body.intgrDte}",
                      endDte = ${endDte},
                      pst = "${req.body.pst}"
                      where id = ${req.body.i}
    `);

  var [usr] = await db.execute(
    `select usr from _Contracts where id = ${req.body.i};`
  );

  await db.execute(`update _Users set etablissment = "${req.body.etb}",
                                      actualEntity = "${req.body.entt}",
                                      contractTpe = "${req.body.tpe}",
                                      jobeTitle = "${req.body.pst}" ,
                                      department = "${req.body.dprt}"
                                      where id = ${usr[0].usr}
                                      `);

  var entt = await db.execute(
    `select nme from _Entity where id = ${req.body.entt}`
  );
  let txt = `Le Contrat ${req.body.i} a été mis à jour par ${req.cookies.usdt.fname} ${req.cookies.usdt.lname} en tant que ${req.body.pst}, à compter du ${req.body.intgrDte}, au sein de l’établissement ${req.body.etb}, et rattachée à l’entité ${entt[0][0].nme}.`;

  await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details )
            values(
              ${usr[0].usr}, ${
    req.cookies.usdt.id
  }, "ADMIN", "${getCurrentTime()}", "Changement de contrat", "${txt}."
            )`);

  res.json('done');
});

app.get('/newCmnt', async (req, res) => {
  var [oldC] = await db.execute(
    `select cmnt from _Users where id = ${req.query.a}`
  );

  await db.execute(
    `update _Users set cmnt = "${oldC[0].cmnt ? oldC[0].cmnt : ''}* ${
      req.query.t
    }.\n" where id = ${req.query.a};`
  );
  await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                    values(
                      ${req.query.a}, ${
    req.cookies.usdt.id
  }, "ADMIN", "${getCurrentTime()}", "Ajout de commentaire", "${
    req.cookies.usdt.fname
  } ${req.cookies.usdt.lname} ajoute un nouveau commentaire :\n
  ${req.query.t}."
                    )`);
  res.json('Done');
});

app.use(function (req, res) {
  res.redirect(301, '/Service-Admin');
  // res.json({
  //   error: {
  //     'name':'Error',
  //     'status':404,
  //     'message':'Invalid Request',
  //     'statusCode':404,
  //   },
  //    message: 'wrong url'
  // });
});

module.exports = app;
