const express = require('express');
const app = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(cookieParser());
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');

const { db } = require('./DB_cnx');
const { lg } = require('./lg');
const { sendMail } = require('./mls');
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
function getCurrentTime() {
  return moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss');
}
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frntEnd', 'Profile.html'));
});
var formateDate = (d) => {
  if (d) {
    // console.log(typeof d);
    var isDate = d instanceof Date;
    if (!isDate) {
      var d = new Date(d);
    }
    return d.getHours() != 0
      ? moment(d).format('YYYY-MM-DD HH:mm:ss')
      : moment(d).format('YYYY-MM-DD');
  } else {
    return 'N/A';
  }
};

app.get('/getUsDt', async (req, res) => {
  try {
    const [r] =
      await db.execute(`select id, fname, lname, bd, CIN, famlyStts, childrenNmber, city, zip, 
    adress, phone, phone2, email, actualEntity, department, jobeTitle, integrationDate, contractTpe, 
    usrNme, pic, soldCnj, picExt from _Users where id = ${req.cookies.usdt.id}`);

    const [cnjsHstr] = await db.execute(
      `select * from _Histories where usr = ${req.cookies.usdt.id}`
    );

    const [onGoing] = await db.execute(
      `select count(id) as c from _Conjes where usr = ${req.cookies.usdt.id} and stts is null`
    );

    // var cnjTaken = 0;
    const [cnjs] = await db.execute(
      `select * from _Conjes where usr = ${req.cookies.usdt.id}`
    );
    var cnjsHtml = '';
    cnjs.forEach((c) => {
      var v1 = '<label class="badge badge-warning">En cours</label>';
      var v2 = '<label class="badge badge-warning">En cours</label>';
      var v3 = '<label class="badge badge-warning">En cours</label>';
      var cnclBtn = '';

      switch (c.responsableValidation) {
        case 0:
          v1 = '<label class="badge badge-danger">Refusé</label>';
          break;

        case 1:
          v1 = '<label class="badge badge-success">Validé</label>';
          break;

        case 2:
          v1 = '<label class="badge badge-danger">Annulé</label>';
          break;
      }

      switch (c.HRvalidation) {
        case 0:
          v2 = '<label class="badge badge-danger">Refusé</label>';
          break;

        case 1:
          v2 = '<label class="badge badge-success">Validé</label>';
          break;

        case 2:
          v2 = '<label class="badge badge-danger">Annulé</label>';
          break;

        default:
          v2 = '<label class="badge badge-warning">En cours</label>';
          break;
      }

      switch (c.stts) {
        case 0:
          v3 = '<label class="badge badge-danger">Refusé</label>';
          cnclBtn = 'hidden';
          break;

        case 1:
          v3 = '<label class="badge badge-success">Validé</label>';
          // cnjTaken++;
          break;

        case 2:
          v3 = '<label class="badge badge-danger">Annulé</label>';
          cnclBtn = 'hidden';
          break;

        default:
          v3 = '<label class="badge badge-warning">En cours</label>';
          break;
      }
      var fday = new Date(c.fday);
      var today = new Date();
      if (fday <= today) {
        cnclBtn = 'hidden';
      }

      cnjsHtml += `
      <tr>
      <td><a href="#">${c.id}</a></td>
      <td>${String(formateDate(c.dmntDte)).split(' ')[0]}</td>
      <td>${formateDate(c.fday)}</td>
      <td>${formateDate(c.lday)}</td>
      <td>${c.duration}</td>
      <td>${v1}</td>
      <td>${v2}</td>
      <td>${v3}</td>
      <td>
        <button type="button" class="btn btn-inverse-danger btn-icon" hidden onclick="cancelCnj('${
          c.id
        }')">
          <i class="ti-close"></i>
        </button>
      </td>
      </tr>
        `;
    });

    var start = new Date(r[0].integrationDate);
    var end = new Date();
    var years = end.getFullYear() - start.getFullYear();
    var months = end.getMonth() - start.getMonth();

    if (end.getDate() < start.getDate()) {
      months--;
    }

    var totalMonths = years * 12 + months;
    // var soldCnj = totalMonths * 1.5 - cnjTaken;
    var soldCnj = r[0].soldCnj;

    var [ent] = await db.execute(
      `select nme from _Entity where id = ${r[0].actualEntity}`
    );

    if (ent[0]) {
      r[0].actualEntity = ent[0].nme;
    }

    if (r[0]) {
      res.json({
        data: r[0],
        cnj: cnjsHtml,
        cnjH: cnjsHstr,
        Scnj: soldCnj,
        onGoing: onGoing[0].c,
      });
    } else {
      res.status(404).json({ error: 'Cookie not found' });
    }
  } catch (error) {
    lg.error(error);
  }
});

app.post('/modifyInfo', async (req, res) => {
  try {
    const { addr, eml, tel, tel2 } = req.body;

    var dtls = ` L'agent ${req.cookies.usdt.fname} ${req.cookies.usdt.lname} a modifié les informations personnelles en changeant : `;

    const [r] = await db.execute(
      `update _Users set adress = "${addr}", email = "${eml}", phone ="${tel}", phone2 ="${tel2}"  where id = ${req.cookies.usdt.id} `
    );
    if (req.cookies.usdt.adress != addr) {
      dtls += `Adresse de ${req.cookies.usdt.adress} à ${addr}, `;
    }
    if (req.cookies.usdt.email != eml) {
      dtls += `E-mail Adresse de ${req.cookies.usdt.email} à ${eml}, `;
    }
    if (req.cookies.usdt.phone != tel) {
      dtls += `Numéro de téléphone de ${req.cookies.usdt.phone} à ${tel}, `;
    }
    if (req.cookies.usdt.phone2 != tel2) {
      dtls += `Numéro de téléphone portable de ${req.cookies.usdt.phone2} à ${tel2} `;
    }

    await db.execute(
      `insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) values(${
        req.cookies.usdt.id
      }, ${
        req.cookies.usdt.id
      }, "USER", "${getCurrentTime()}", "Modification Profil", "${dtls}." )`
    );

    res.json({ message: 'done' });
  } catch (error) {
    lg.error(error);
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/sveCnj', upload.single('prflCnjProofInput'), async (req, res) => {
  try {
    var fullName = `${req.cookies.usdt.fname} ${req.cookies.usdt.lname}`;
    let fileBuffer = null;
    let fileExtension = null;
    if (req.file) {
      fileBuffer = req.file.buffer;
      fileExtension = req.file.originalname.split('.').pop();
    }
    const { ctpe, sd, ed, cout } = req.body;

    var [c] = await db.execute(`SELECT * FROM _Conjes 
WHERE (stts NOT IN (0, 2) OR stts IS NULL) 
AND (
    (fday <= '${ed}' AND lday >= '${sd}') 
    OR (fday <= '${sd}' AND lday >= '${ed}') 
    OR (fday >= '${sd}' AND lday <= '${ed}')
) 
AND usr = ${req.cookies.usdt.id};`);

    if (c[0]) {
      res.json({ message: 'no' });
      return;
    }

    // var [crntCnj] = await db.execute(`select count(id) as cc from _Conjes where fday <= ${sd} <= lday`)
    // if (crntCnj[0].cc) {
    //   res.json({message:"no"})
    //   return;
    // }

    const currentDateTime = new Date().toLocaleString();

    var qry = `insert into _Conjes(usr, dmntDte, cnjType, fday, lday, duration, prfFile, fileExt) values
  (${req.cookies.usdt.id}, "${getCurrentTime()}", 
  "${ctpe.trim()}", "${sd}", "${ed}", "${cout}", "${fileBuffer}", "${fileExtension}");`;
    // console.log(qry);

    await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                    values(
                      ${req.cookies.usdt.id}, ${
      req.cookies.usdt.id
    }, "USER", "${getCurrentTime()}", "Demande de congé", "
L'agent ${fullName} a demandé ${cout} jours de ${ctpe.trim()}, du ${sd} au ${ed}."
                    )`);

    const [r] = await db.execute(qry);

    // const [dprtmnt] = await db.execute(
    //   `SELECT * FROM _Departments WHERE id = ${req.cookies.usdt.department}`
    // );
    // var [rsp] = await db.execute(
    //   `select u.email, u.id, concat(u.fname , " ", u.lname) as nme from _Users u where id = (select d.responsable from _Users u inner join _Departments d on u.department = d.id where u.id = ${req.cookies.usdt.id}); `
    // );

    var [rsp] = await db.execute(
      `select u.email, u.id, concat(u.fname , " ", u.lname) as nme from _Users u inner join _Departments d on d.responsable = u.id where d.id = ${req.cookies.usdt.department}; `
    );

    // console.log(req.cookies.usdt);

    if (req.cookies.usdt.id == rsp[0].id) {
      if (req.cookies.usdt.department == 100) {
        var [rsp] = await db.execute(
          `select u.email, u.id, concat(u.fname , " ", u.lname) as nme from _Users u inner join _Departments d on u.id = d.responsable where d.nme = '${process.env.PDGdepartmentName}';`
        );
      } else {
        var [rsp] = await db.execute(
          `select u.email, u.id, concat(u.fname , " ", u.lname) as nme from _Users u inner join _Departments d on d.responsable = u.id where d.id = 100; `
        );
      }
    }

    var [tskSve] = await db.execute(
      `insert into _Tasks (nme, usr, tpe, cnj) value("Traiter La demande de congé de ${fullName}", ${rsp[0].id}, "_Conjes", ${r.insertId})`
    );

    await db.execute(`insert into _Notifications (usr, ttle, msg, dtetme, link) value (
      ${
        rsp[0].id
      }, "Une nouvelle tâche vous a été attribuée", "Demande de congé de ${fullName}.",
      "${getCurrentTime()}",  "/TO-DO-Liste?t=${tskSve.insertId}"
    )`);
    await sendMail(
      rsp[0].email,
      `Demande de traitement : Congé de ${fullName}`,
      `
    <div style='font-family: Arial, sans-serif;'><p>Bonjour ${rsp[0].nme},</p><br><p>Vous êtes chargé de traiter la demande de congé de ${fullName}. Veuillez cliquer sur le lien suivant pour accéder à la tâche : <a href='/TO-DO-Liste?t=${tskSve.insertId}'>Lien</a> ou copiez le lien ci-dessous dans votre navigateur :<br></p><p>https://xcdmmaroc.com/ERP/TO-DO-Liste?t=${tskSve.insertId}</p><p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
    `
    );
    res.json({ message: 'DONE' });
  } catch (error) {
    lg.error(error);
  }
});

app.get('/getDCSrqstDt', async (req, res) => {
  try {
    const [DcsTbl] = await db.execute(
      `select * from _DCSrequests where usr = ${req.cookies.usdt.id}`
    );

    var c = '';

    var tblH = '';

    DcsTbl.forEach((e) => {
      var cnclB = '';
      switch (e.stts) {
        case 1:
          c = 'success';
          break;
        case 2:
          c = 'danger';
          break;
        case 0:
          c = 'danger';
          break;

        case 4:
          c = 'warning';
          break;

        default:
          c = 'warning';
          cnclB = `<button type="button" data-id="${e.id}" 
        class="btn btn-inverse-danger btn-icon" > 
        <i class="ti-close"></i> </button>`;
          break;
      }
      var stts = (s) => {
        var h = '';
        switch (s) {
          case 0:
            h = 'Rejetée';
            break;
          case 1:
            h = 'En Cours';

            break;

          case 2:
            h = 'Annulé';

            break;

          case 4:
            h = 'att de signature';
            break;

          default:
            h = 'En attente';

            break;
        }
        return h;
      };
      tblH += `
    <tr>
      <td>
        <a href="#">${e.id}</a>
      </td>
      <td>${formateDate(e.dmntDte)}</td>
      <td class="text-center"> <textarea class="form-control" name="Message" id="Message" rows="4" disabled >${
        e.dcs
      }</textarea></td>
      <td> <label class="badge badge-${c}">${stts(e.stts)}</label> </td>
      <!---En cours , En attente signature, Livré , Annulé, Demenade refusé-->
      <td>${formateDate(e.treatmntDte)}</td>
      <td> ${cnclB}</td>
    </tr>
    `;
    });

    res.json(tblH);
  } catch (error) {
    lg.error(error);
  }
});

app.post('/sveDCSrqst', async (req, res) => {
  try {
    await db.execute(
      `insert into _DCSrequests (usr, dcs, msg, dmntDte ) value( ${
        req.cookies.usdt.id
      }, "${req.body.dcs}", "${req.body.msg}","${getCurrentTime()}"
      )`
    );
    // handle the histories
    res.json({ message: 'DONE' });
  } catch (error) {
    lg.error(error);
    res.status(500).json({ message: 'server error' });
  }
});

app.post('/cnclDcsRqst', async (req, res) => {
  try {
    await db.execute(
      `update _DCSrequests set stts = "Annulé" where id = ${req.body.i}`
    );
    // handle the histories
    res.json({ message: 'DONE' });
  } catch (error) {
    lg.error(error);
    res.status(500).json({ message: 'server error' });
  }
});

app.get('/getDechargesTble', async (req, res) => {
  try {
    const [dt] = await db.execute(
      `select * from _Decharges where usr = ${req.cookies.usdt.id}`
    );
    var tbl = '';
    // devient encours aprés prmier clique si l'utilisateur clique une autre fois message pour confimer l'anulation de la demande d'annulation et le button devient de nouveau annuler ma demande
    dt.forEach((e) => {
      var b1;
      var b2;
      var b3;
      switch (e.stts) {
        case 1:
          b2 = '<label class="badge badge-success" >Validée</label> ';
          b3 = ` <button type="button" data-id="${e.id}" class="btn btn-inverse-danger" >Demander l'Annulation</button>`;
          break;

        case 0:
          b2 = ' <label class="badge badge-danger" >Rejetté</label> ';
          b3 = ``;
          break;

        case 2:
          b2 = ' <label class="badge badge-danger" >Annulée</label> ';
          b3 = ``;
          break;

        default:
          b2 = ' <label class="badge badge-warning" >En attendant</label> ';
          b3 = ` <button type="button" data-id="${e.id}" class="btn btn-inverse-danger" >Demander l'Annulation</button>`;
          break;
      }
      switch (e.responsableValidation) {
        case 1:
          b1 = '<label class="badge badge-success" >Validée</label> ';

          break;

        case 0:
          b1 = ' <label class="badge badge-danger" >Rejetté</label> ';

          break;

        case 2:
          b1 = ' <label class="badge badge-danger" >Annulée</label> ';

          break;

        default:
          b1 = ' <label class="badge badge-warning" >En attendant</label> ';

          break;
      }
      tbl += `
    <tr>
      <td><a href="#">${formateDate(e.dmntDte)}</a></td>
      <td>${formateDate(e.leaveDate)}</td>
      <td>${formateDate(e.returnDate)}</td>
      <td>  ${b1} </td>
      <td> ${b2} </td>
      <td> ${b3}
      </td>
    </tr>
    `;
    });

    res.json({ d: tbl });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/saveDchrge', async (req, res) => {
  const isPasswordValid = await bcrypt.compare(
    req.body.ps,
    req.cookies.usdt.pwd
  );

  try {
    if (isPasswordValid) {
      var fullName = `${req.cookies.usdt.fname} ${req.cookies.usdt.lname}`;
      var [rsp] = await db.execute(
        `select email, id, concat(fname , " ", lname) as nme from _Users where id = (select d.responsable from _Users u inner join _Departments d on u.id = d.responsable where d.id = ${req.cookies.usdt.department}); `
      );
      var [r] =
        await db.execute(`insert into _Decharges (usr, reason, dmntDte, leaveDate, returnDate, msg ) value( ${
          req.cookies.usdt.id
        }, "${req.body.rsn}", "${getCurrentTime()}","${req.body.d1}", "${
          req.body.d2
        }", "${req.body.msg}"
        )`);
      await db.execute(
        `insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) values(${
          req.cookies.usdt.id
        }, ${
          req.cookies.usdt.id
        }, "USER", "${getCurrentTime()}", "Demande de décharge", "${fullName} a demandé à quitter le travail le ${
          req.body.d1
        } et à revenir le ${req.body.d2}, pour un ${
          req.body.rsn
        }, et il a commenté : ${req.body.msg}" )`
      );

      var [tskSve] = await db.execute(
        `insert into _Tasks (nme, usr, tpe, dchrge) value("Traiter La demande de décharge de ${fullName}", ${rsp[0].id}, "_Decharges", ${r.insertId})`
      );

      await db.execute(`insert into _Notifications (usr, ttle, msg, dtetme, link) value (
        ${
          rsp[0].id
        }, "Une nouvelle tâche vous a été attribuée", "Demande de décharge de ${fullName}.",
        "${getCurrentTime()}",  "/TO-DO-Liste?t=${tskSve.insertId}"
      )`);
      await sendMail(
        rsp[0].email,
        `Demande de traitement : Décharge de ${fullName}`,
        `
      <div style='font-family: Arial, sans-serif;'><p>Bonjour ${rsp[0].nme},</p><br><p>Vous êtes chargé de traiter la demande de décharge de ${fullName}. Veuillez cliquer sur le lien suivant pour accéder à la tâche : <a href='/TO-DO-Liste?t=${tskSve.insertId}'>Lien</a> ou copiez le lien ci-dessous dans votre navigateur :<br></p><p>https://xcdmmaroc.com/ERP/TO-DO-Liste?t=${tskSve.insertId}</p><p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
      `
      );
      res.json({ message: 'DONE' });
    } else {
      res.json({ message: 'p' });
    }
  } catch (error) {
    lg.error(error);
    res.status(500).json({ message: 'server error' });
  }
});

app.get('/getDplcmTble', async (req, res) => {
  try {
    const [dt] = await db.execute(
      `select * from _deplacements where usr = ${req.cookies.usdt.id}`
    );
    var tbl = '';
    // devient encours aprés prmier clique si l'utilisateur clique une autre fois message pour confimer l'anulation de la demande d'annulation et le button devient de nouveau annuler ma demande
    dt.forEach((e) => {
      var b1;
      var b2;
      var b3;
      switch (e.stts) {
        case 1:
          b2 = '<label class="badge badge-success" >Validée</label> ';
          b3 = ` <button type="button" data-id="${e.id}" class="btn btn-inverse-danger" >Annuler</button>`;
          break;

        case 2:
          b2 = ' <label class="badge badge-danger" >Annulée</label> ';
          b3 = ``;
          break;

        case 0:
          b2 = ' <label class="badge badge-danger" >Annulée</label> ';
          b3 = ``;
          break;

        default:
          b2 = ' <label class="badge badge-warning" >En cours</label> ';
          b3 = ` <button type="button" data-id="${e.id}" class="btn btn-inverse-danger" >Annuler</button>`;
          break;
      }
      switch (e.responsableValidation) {
        case 1:
          b1 = '<label class="badge badge-success" >Validée</label> ';

          break;

        case 0:
          b1 = ' <label class="badge badge-danger" >Annulée</label> ';

          break;

        case 2:
          b1 = ' <label class="badge badge-danger" >Annulée</label> ';

          break;

        default:
          b1 = ' <label class="badge badge-warning" >En cours</label> ';

          break;
      }
      tbl += `
    

    <tr>
      <td><a href="${e.id}">${formateDate(e.dmntDte)}</a></td>
      <td>${formateDate(e.leaveDate)}</td>
      <td>${formateDate(e.returnDate)}</td>
      <td>${e.delegation}</td>
      <td> ${b1}</td>
      <td> ${b2} </td>
      <td> ${b3} </td>
    </tr>
    `;
    });

    res.json({ d: tbl });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/sveDplcmReq', async (req, res) => {
  const isPasswordValid = await bcrypt.compare(
    req.body.ps,
    req.cookies.usdt.pwd
  );

  // try {
  if (isPasswordValid) {
    var fullName = `${req.cookies.usdt.fname} ${req.cookies.usdt.lname}`;
    var [rsp] = await db.execute(
      `select email, id, concat(fname , " ", lname) as nme from _Users where id = (select d.responsable from _Users u inner join _Departments d on u.id = d.responsable where d.id = ${req.cookies.usdt.department}); `
    );

    // console.log(formateDate(`${req.body.d1}:00`));
    // console.log(formateDate(`${req.body.d2}:00`));

    // console.log(`insert into _deplacements (usr, dmntDte, reason, transport, leaveDate, returnDate, delegation, notes ) value( ${
    //   req.cookies.usdt.id
    // }, "${getCurrentTime()}", "${req.body.rsn}", "${
    //   req.body.trsp
    // }","${formateDate(`${req.body.d1}:00`)}", "${formateDate(
    //   `${req.body.d2}:00`
    // )}", "${req.body.dlg}", "${req.body.msg}"
    //     )`);

    var [r] = await db.execute(
      `insert into _deplacements (usr, dmntDte, reason, transport, leaveDate, returnDate, delegation, notes ) value( ${
        req.cookies.usdt.id
      }, "${getCurrentTime()}", "${req.body.rsn}", "${
        req.body.trsp
      }","${formateDate(`${req.body.d1}:00`)}", "${formateDate(
        `${req.body.d2}:00`
      )}", "${req.body.dlg}", "${req.body.msg}"
        )`
    );

    await db.execute(
      `insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) values(${
        req.cookies.usdt.id
      }, ${
        req.cookies.usdt.id
      }, "USER", "${getCurrentTime()}", "Demande de déplacement", "${fullName} a demandé déplacement le ${
        req.body.d1
      } et à revenir le ${req.body.d2}, pour un ${
        req.body.rsn
      }, et il a commenté : ${req.body.msg}" )`
    );

    var [tskSve] = await db.execute(
      `insert into _Tasks (nme, usr, tpe, dplcmnt) value("Traiter La demande de déplacement de ${fullName}", ${rsp[0].id}, "_deplacements", ${r.insertId})`
    );

    await db.execute(`insert into _Notifications (usr, ttle, msg, dtetme, link) value (
        ${
          rsp[0].id
        }, "Une nouvelle tâche vous a été attribuée", "Demande de déplacement de ${fullName}.",
        "${getCurrentTime()}",  "/TO-DO-Liste?t=${tskSve.insertId}"
      )`);
    await sendMail(
      rsp[0].email,
      `Demande de traitement : déplacement de ${fullName}`,
      `
      <div style='font-family: Arial, sans-serif;'><p>Bonjour ${rsp[0].nme},</p><br><p>Vous êtes chargé de traiter la demande de déplacement de ${fullName}. Veuillez cliquer sur le lien suivant pour accéder à la tâche : <a href='/TO-DO-Liste?t=${tskSve.insertId}'>Lien</a> ou copiez le lien ci-dessous dans votre navigateur :<br></p><p>https://xcdmmaroc.com/ERP/TO-DO-Liste?t=${tskSve.insertId}</p><p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
      `
    );

    res.json({ message: 'DONE' });
  } else {
    res.json({ message: 'p' });
  }
  // } catch (error) {
  //   lg.error(error);
  //   res.status(500).json({ message: "server error" });
  // }
});

app.get('/getRecupTble', async (req, res) => {
  try {
    const [dt] = await db.execute(
      `select * from _recups where usr = ${req.cookies.usdt.id}`
    );
    var tbl = '';
    // devient encours aprés prmier clique si l'utilisateur clique une autre fois message pour confimer l'anulation de la demande d'annulation et le button devient de nouveau annuler ma demande
    dt.forEach((e) => {
      var b;
      var b1;
      var b2;
      var b3;
      switch (e.stts) {
        case 1:
          b2 = '<label class="badge badge-success" >Validée</label> ';
          b3 = ` <button type="button" class="btn btn-inverse-danger btn-icon" > <i class="ti-close"></i> </button>`;
          break;

        case 2:
          b2 = ' <label class="badge badge-danger" >Annulée</label> ';
          b3 = ``;
          break;

        case 0:
          b2 = ' <label class="badge badge-danger" >Refusée</label> ';
          b3 = ``;
          break;

        default:
          b2 = ' <label class="badge badge-warning" >En cours</label> ';
          b3 = ` <button type="button" class="btn btn-inverse-danger btn-icon" > <i class="ti-close"></i> </button>`;
          break;
      }
      switch (e.responsableValidation) {
        case 1:
          b1 = '<label class="badge badge-success" >Validée</label> ';

          break;

        case 2:
          b1 = ' <label class="badge badge-danger" >Annulée</label> ';

          break;

        case 0:
          b1 = ' <label class="badge badge-danger" >Refusée</label> ';

          break;

        default:
          b1 = ' <label class="badge badge-warning" >En cours</label> ';
          break;
      }
      switch (e.HRvalidation) {
        case 1:
          b = '<label class="badge badge-success" >Validée</label> ';

          break;

        case 2:
          b = ' <label class="badge badge-danger" >Annulée</label> ';

          break;

        case 0:
          b = ' <label class="badge badge-danger" >Refusée</label> ';

          break;

        default:
          b = ' <label class="badge badge-warning" >En cours</label> ';
          break;
      }
      tbl += `
    
    

    <tr>
      <td><a href="${e.id}">${e.id}</a></td>
      <td>${formateDate(e.dmntDte)}</td>
      <td>${formateDate(e.leaveDate)}</td>
      <td>${formateDate(e.returnDate)}</td>
      
      <td>${b1} </td>
      <td> ${b} </td>
      <td>${b2} </td>
      <td>${b3} </td>
    </tr>
    `;
    });

    res.json({ d: tbl });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/sveRecupReq', async (req, res) => {
  // try {
  var fullName = `${req.cookies.usdt.fname} ${req.cookies.usdt.lname}`;
  var [rsp] = await db.execute(
    `select email, id, concat(fname , " ", lname) as nme from _Users where id = (select d.responsable from _Users u inner join _Departments d on u.department = d.id where u.id = ${req.cookies.usdt.id}); `
  );

  var [r] = await db.execute(
    `insert into _recups (usr, dmntDte, leaveDate, returnDate, msg ) value( ${
      req.cookies.usdt.id
    }, "${getCurrentTime()}","${req.body.d1}", "${req.body.d2}", "${req.body.m}"
      )`
  );

  await db.execute(
    `insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) values(${
      req.cookies.usdt.id
    }, ${
      req.cookies.usdt.id
    }, "USER", "${getCurrentTime()}", "Demande de récupération", "${fullName} a demandé des jours de récupération le ${
      req.body.d1
    } et à revenir le ${req.body.d2}, pour un ${
      req.body.rsn
    }, et il a commenté : ${req.body.msg}" )`
  );

  var [tskSve] = await db.execute(
    `insert into _Tasks (nme, usr, tpe, recup) value("Traiter La demande de récupération de ${fullName}", ${rsp[0].id}, "_recups", ${r.insertId})`
  );

  await db.execute(`insert into _Notifications (usr, ttle, msg, dtetme, link) value (
      ${
        rsp[0].id
      }, "Une nouvelle tâche vous a été attribuée", "Demande de récupération de ${fullName}.",
      "${getCurrentTime()}",  "/TO-DO-Liste?t=${tskSve.insertId}"
    )`);
  await sendMail(
    rsp[0].email,
    `Demande de traitement : Récupération de ${fullName}`,
    `
    <div style='font-family: Arial, sans-serif;'><p>Bonjour ${rsp[0].nme},</p><br><p>Vous êtes chargé de traiter la demande de récupération de ${fullName}. Veuillez cliquer sur le lien suivant pour accéder à la tâche : <a href='/TO-DO-Liste?t=${tskSve.insertId}'>Lien</a> ou copiez le lien ci-dessous dans votre navigateur :<br></p><p>https://xcdmmaroc.com/ERP/TO-DO-Liste?t=${tskSve.insertId}</p><p><br>Merci de vous en occuper dès que possible.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
    `
  );

  res.json({ message: 'DONE' });
  // } catch (error) {
  //   lg.error(error);
  //   res.status(500).json({ message: "server error" });
  // }
});

app.get('/getReclmTble', async (req, res) => {
  try {
    const [dt] = await db.execute(
      `select * from _reclamation where usr = ${req.cookies.usdt.id}`
    );
    var tbl = '';
    // devient encours aprés prmier clique si l'utilisateur clique une autre fois message pour confimer l'anulation de la demande d'annulation et le button devient de nouveau annuler ma demande
    dt.forEach((e) => {
      var b1;
      var b2;
      var b3;
      switch (e.stts) {
        case 'Traité':
          b1 = '<label class="badge badge-success" >Traité</label> ';
          b3 = ` `;
          b3 = ``;
          break;

        case 'En cours':
          b1 = ' <label class="badge badge-warning" >En cours</label> ';
          b2 = ` <button type="button" class="btn btn-warning btn-icon" > <i class="ti-pin"></i> </button>`;
          b3 = `<button type="button" class="btn btn-inverse-danger btn-icon" > <i class="ti-close"></i> </button>`;
          break;

        case 'Annulée':
          b1 = ' <label class="badge badge-danger" >Annulée</label> ';
          b2 = ``;
          b3 = ``;
          break;

        case 'Refusée':
          b1 = ' <label class="badge badge-danger" >Annulée</label> ';
          b2 = ``;
          b3 = ``;
          break;
      }

      tbl += `
    <tr>
      <td><a href="${e.id}">${e.id}</a></td>
      <td>${formateDate(e.dmndDteTme)}</td>
      <td>${e.ttle}</td>
      <td>${e.tpe}</td>
      <td> ${b1} </td>
      <!---New,Lu, Traité-->
      <td> ${b2} </td>
      <td> ${b3}</td>
    </tr>
    `;
    });

    res.json({ d: tbl });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/getReclmTble', async (req, res) => {
  var usr = req.cookies.usdt.id;
  if (req.body.tp == 'Réclamation Anonyme') {
    usr = 'null';
  }
  await db.execute(
    `insert into _reclamation 
    (usr, dmndDteTme, tpe, ttle, msg, stts) value( ${usr}, "${getCurrentTime()}",
    "${req.body.tp}", 
    "${req.body.tt}", "${req.body.ms}", "En cours")`
  );
  // handle the histories
  res.json({ message: 'DONE' });
  try {
  } catch (error) {
    lg.error(error);
    res.status(500).json({ message: 'server error' });
  }
});

app.post('/resetPawd', async (req, res) => {
  try {
    const pswH = (await bcrypt.hash(req.body.p, 10)).toString();
    await db.execute(`update _Users set pwd = ? where id = ?`, [
      pswH,
      req.cookies.usdt.id,
    ]);
    await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                        values( ${req.cookies.usdt.id}, ${
      req.cookies.usdt.id
    }, "USER", "${moment
      .tz('Africa/Casablanca')
      .format(
        'YYYY-MM-DD HH:mm:ss'
      )}", "Modification Profil", "Réinitialisation du mot de passe"
                        )`);

    // let txt = `<p>Bonjour ${req.cookies.usdt.fname}, <br><br>Votre mot de passe a été changé avec succès. <br><br>- Utilisateur : <strong>${req.cookies.usdt.usrNme}</strong><br>- Votre nouveau mot de passe est : <strong>${req.body.p}</strong></p>`;

    // await sendMail(
    //   req.cookies.usdt.email,
    //   `Réinitialisation du mot de passe`,
    //   txt
    // );

    res.json('DONE');
  } catch (error) {
    lg.error(error);
    res.status(500).json({ message: 'server error' });
  }
});

module.exports = app;
