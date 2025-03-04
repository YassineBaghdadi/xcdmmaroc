const express = require('express');
const app = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.json());
app.use(cookieParser());
const path = require('path');
const jwt = require('jsonwebtoken');
const Swal = require('sweetalert2');
const moment = require('moment-timezone');

const { sendMail } = require('./mls');

const { db } = require('./DB_cnx');
const { lg } = require('./lg');

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
  res.sendFile(path.join(__dirname, '../frntEnd', 'TO-DO-Liste.html'));
});

app.get('/getTasks', async (req, res) => {
  // var  [tsks] = await db.execute(`select * from _Tasks where usr = ${req.cookies.usdt.id} `);
  var [tsks] = await db.execute(
    `select t.id, t.nme, t.tpe, t.treated, t.usr, tc.byUsr, concat(u.fname, " ", u.lname) as busr from _Tasks t left join _taskCntrbt tc on tc.tsk = t.id left join _Users u on tc.byUsr = u.id where t.usr = ${req.cookies.usdt.id} or tc.usr = ${req.cookies.usdt.id}`
  );
  var tble = '';

  tsks.forEach((e) => {
    var clss = `task" onclick="openTreatWndw(${e.id})"`;
    var h = '';
    if (e.treated) {
      h = `style="cursor: not-allowed"`;
      clss = 'cmplt';
    }

    if (e.tpe) {
      tble += `
      <li class="" style="padding: 0%;" >
        <button ${h} class="form-check form-check-flat ${clss}" >
          <span> ${e.nme}</span>
          
        </button>
      </li>
      `;
    } else {
      tble += `<li >
                <div class="" >
                  <span class="meeting-title" style="text-align: center;">${
                    e.nme
                  }</span><span style="font-size: xx-small;">${
        e.busr ? `(Attribué à vous par ${e.busr})` : ''
      }</span>
                  <br> 
                  <div class="meeting-toolbar">
                    <button class="meeting-btn" onclick="openAssignWindow(${
                      e.id
                    }, '${
        e.nme
      }')"><i class="mdi mdi-account-multiple-plus"></i></i></button>
                    <button class="meeting-btn"><i class="mdi mdi-note-plus"></i></button>
                    <button class="meeting-btn"><i class="mdi mdi-timetable"></i></button>
                    <button class="meeting-btn"><i class="mdi mdi-step-forward-2"></i></button>
                    <button class="meeting-btn"><i class="mdi mdi-history"></i> </button>
                    <select style="width:3cm;" class="form-control btn btn-google meeting-btn-new meeting-btn" id="Users" name="Users">
                      <option>New</option>
                      <option>En cours</option>
                    </select>
                  </div>
                </div>
              </li>`;
    }
  });
  res.json({ t: tble });
});
var formateDate = (d) => {
  if (d) {
    return d.getHours() != 0
      ? moment(d).format('DD/MM/YYYY HH:mm:ss')
      : moment(d).format('DD/MM/YYYY');
  } else {
    return 'N/A';
  }
};

app.post('/assignUsersToTask', async (req, res) => {
  var users = req.body.u;

  var values = [];

  var [cntrbs] = await db.execute(
    `select usr from _taskCntrbt where tsk = ${req.body.i}`
  );

  const cc = cntrbs.map((e) => e.usr);
  console.log(cc);

  users.forEach((e) => {
    console.log(cc.includes(e));

    if (!cc.includes(+e)) {
      values.push(
        `(${req.cookies.usdt.id}, ${e}, "${getCurrentTime()}", ${req.body.i})`
      );
    }
  });

  if (values.length > 0) {
    await db.execute(
      `insert into _taskCntrbt(byUsr, usr, opDte, tsk) values ${values.join(
        ', '
      )}`
    );
  }

  res.json('done');
});

app.post('/getTaskCntrbs', async (req, res) => {
  var tbl = '';
  var [dt] = await db.execute(
    `select concat(uu.fname, " ", uu.lname) as byUsr, concat(u.fname, " ", u.lname) as usnme, opDte from _taskCntrbt t inner join _Users u on t.usr = u.id inner join _Users uu on t.byUsr = uu.id where t.tsk = ${req.body.i} order by t.id desc`
  );
  dt.forEach((e) => {
    tbl += `
      <tr>
        <td class="font-weight-bold">${e.byUsr}</td>
        <td>${e.opDte}</td>
        <td>${e.usnme} </td>
        
      </tr>
    `;

    // <td><textarea class="form-control" name="NoteHisto" id="NoteHisto" rows="5" disabled>Karim BOURIR, Yassine BAGHDADI, Mounir SAHLAOUI</textarea> </td>
  });
  res.json({ tbl: tbl });
});

app.get('/getAllUsers', async (req, res) => {
  var opts = '';
  var [usrs] = await db.execute(
    `select id, concat(fname, " ", lname) as nme from _Users where id != ${req.cookies.usdt.id}`
  );
  await usrs.forEach((e) => {
    opts += `<option value="${e.id}">${e.nme}</option>`;
  });

  res.json(opts);
});

app.post('/getTreatWindow', async (req, res) => {
  var [t] = await db.execute(`select * from _Tasks where id = ${req.body.i}`);

  //
  //   const [Scnj] = await db.execute(
  //     `select soldCnj from _Users where id = ${id}`
  //   );

  var outpt = ``;
  var [cnjTr] = await db.execute(
    `select * from _Conjes where id = ${t[0].cnj}`
  );

  switch (t[0].tpe) {
    case '_Conjes':
      var [usrInfo] = await db.execute(
        `select * from _Users where id = (select usr from _Conjes where id = ${t[0].cnj})`
      );
      const [cnjs] = await db.execute(
        `select * from _Conjes where usr = ${usrInfo[0].id}`
      );

      outpt = `
        <h4 class="card-title">
        Solde congés annuel payés :
        <span id="soldConge">${usrInfo[0].soldCnj}</span>
        </h4>
        <span id="soldConge" style="font-style:italic;font-weight: lighter;">Traitement de la demande de congé de ${
          cnjTr[0].duration
        } jours de ${usrInfo[0].fname} ${
        usrInfo[0].lname
      } commençant le ${formateDate(
        cnjTr[0].fday
      )} et se terminant le ${formateDate(cnjTr[0].lday)} inclus.</span>
        <br>
        <br>
        <span style="text-decoration: underline;">Approuvez-vous cette demande ? </span>
        <input type="text" class="form-control" name="cnjTrComment" onInput="$('#cnjTrComment').css('border', '1px solid grey');" id="cnjTrComment" placeholder="Écrivez un commentaire pour que vous puissiez traiter cette demande...."/>
        &nbsp;&nbsp;&nbsp;<b><a href="#" onclick="treatTheCnj(1, ${
          req.body.i
        })">Oui</a></b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b><a href="#" onclick="treatTheCnj(0, ${
        req.body.i
      })">Non</a></b>
        <br>
        <br>
         
        <h4 class="card-title">Liste des Congés</h4>
        <div style="width:100%; " >
        <table class="table table-striped scrollable-table" style="width:100%;overflow-y: scroll;height: 200px;display: block;">
        <thead>
          <tr>
            <th>Type de congé</th>
            <th>Premier jour</th>
            <th>Dernier jour</th>
            <th>nbr jours</th>
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
            
                      <td>${e.cnjType}</td>
                      <td>${formateDate(e.fday)}</td>
                      <td>${formateDate(e.lday)}</td>
                      <td class="text-center">${e.duration}</td>
                      <td>${b3}</td>
                    </tr>`;
      });

      outpt += `</tbody>
      </table></div>`;

      break;

    case '_Decharges':
      var [usrInfo] = await db.execute(
        `select * from _Users where id = (select usr from _Decharges where id = ${t[0].dchrge})`
      );
      var usrNme = `${usrInfo[0].fname} ${usrInfo[0].lname}`;
      const [dchrges] = await db.execute(
        `select * from _Decharges where usr = ${usrInfo[0].id}`
      );
      var [thisDchrge] = await db.execute(
        `select * from _Decharges where id = ${t[0].dchrge}`
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
        `select * from _Users where id = (select usr from _deplacements where id = ${t[0].dplcmnt})`
      );
      var usrNme = `${usrInfo[0].fname} ${usrInfo[0].lname}`;
      var [dplcmnt] = await db.execute(
        `select * from _deplacements where usr = ${usrInfo[0].id}`
      );
      var [thisdplcmnt] = await db.execute(
        `select * from _deplacements where id = ${t[0].dplcmnt}`
      );

      outpt = `
        <h4 class="card-title">
        ${usrNme} a demandé une déplacement.
        </h4>
        <span style="font-style:italic;font-weight: lighter;">${usrNme} a demandé un déplacement le ${formateDate(
        thisdplcmnt[0].leaveDate
      )} et à revenir le ${formateDate(thisdplcmnt[0].returnDate)}, pour ${
        thisdplcmnt[0].reason
      }, et il a commenté : </span><br>" ${thisdplcmnt[0].notes} ".
        <br>
        <br>
        <span style="text-decoration: underline;">Approuvez-vous cette demande ? </span>
        <input type="text" class="form-control" name="DplcmTrComment" onInput="$('#DplcmTrComment').css('border', '1px solid grey');" id="DplcmTrComment" placeholder="Écrivez un commentaire pour que vous puissiez traiter cette demande...."/>
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
      dplcmnt.forEach((e) => {
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
      var [usrInfo] = await db.execute(
        `select * from _Users where id = (select usr from _recups where id = ${t[0].recup})`
      );
      var usrNme = `${usrInfo[0].fname} ${usrInfo[0].lname}`;
      var [rcp] = await db.execute(
        `select * from _recups where id = ${t[0].recup}`
      );

      outpt = `
        <br>
        <h4 class="card-title">
        ${usrNme} a demandé récupération à partir du ${formateDate(
        rcp[0].leaveDate
      )} et retour le ${formateDate(rcp[0].returnDate)} et il a commenté :
        </h4> <span style="font-style:italic;font-weight: lighter;">" ${
          rcp[0].msg
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

app.post('/treatTheCnj', async (req, res) => {
  try {
    var rslt = req.body.i ? 'accepté' : 'rejeté';
    var taskID = req.body.t;
    var [cnj] = await db.execute(
      `select c.id as id, c.usr as usr, c.duration as drtion, concat(u.fname, " ", u.lname) as usrNme, u.email, c.fday, c.lday from _Conjes c inner join _Tasks t on t.cnj = c.id inner join _Users u on c.usr = u.id where t.id = ${taskID}`
    );

    await db.execute(`update _Conjes set 
                              responsableValidation = ${req.body.i}, 
                              npls1Cmnt = "${req.body.c}", 
                              npls1TreatDte = "${getCurrentTime()}" 
                              where id = ${cnj[0].id}`);
    if (!req.body.i) {
      await db.execute(`update _Conjes set 
        stts = ${req.body.i}
        
        where id = ${cnj[0].id}`);
    }

    await db.execute(`update _Tasks set 
                              treated = 1, 
                              treatedDate = "${getCurrentTime()}" 
                              where id = ${taskID}`);

    await db.execute(
      `update _Notifications set rd = 1, notified = 1 where link like "/TO-DO-Liste?t=${taskID}"`
    );

    await db.execute(`insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) value(
                              ${cnj[0].usr}, ${req.cookies.usdt.id}, 
                              "ADMIN", 
                              "${getCurrentTime()}", 
                              "Traitement de congé",
                              "${req.cookies.usdt.fname} ${
      req.cookies.usdt.lname
    } (Responsable) a ${rslt} la demande de congé de ${
      cnj[0].drtion
    } jours de ${cnj[0].usrNme}  qui commence le ${formateDate(
      cnj[0].fday
    )} et se termine le ${formateDate(cnj[0].lday)} et il a dit : ${
      req.body.c
    }")`);

    if (!req.body.i) {
      await sendMail(
        cnj[0].email,
        `RE: la demande conji a été traitée`,
        `
                                  <div style='font-family: Arial, sans-serif;'><p>Bonjour ${cnj[0].usrNme},</p><br><p>Votre demande de congé a été refusée par votre responsable.<p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
                                  `
      );
    }

    var [rhRsp] = await db.execute(
      `select u.email, u.fname  from _Departments d inner join _Users u on d.responsable = u.id where d.nme = "Service RH"`
    );

    await sendMail(
      rhRsp[0].email,
      `RE: la demande conji a été traitée`,
      `
                                <div style='font-family: Arial, sans-serif;'><p>Bonjour ${rhRsp[0].fname},</p><br><p>Il y a une nouvelle demande de congé de ${cnj[0].usrNme} qui doit être traitée.<br>Pour accéder à toutes les demandes RH veuillez cliquer ou copier le lien : <a href="http://erp.xcdmmaroc.com/Service-Admin/Demandes-RH">http://erp.xcdmmaroc.com/Service-Admin/Demandes-RH</a><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
                                `
    );

    res.json('OK');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/treatTheDchrg', async (req, res) => {
  try {
    var rslt = req.body.i ? 'accepté' : 'rejeté';
    var taskID = req.body.t;
    var [cnj] = await db.execute(
      `select c.id as id, c.usr as usr, c.leaveDate, concat(u.fname, " ", u.lname) as usrNme, u.email, c.returnDate from _Decharges c inner join _Tasks t on t.dchrge = c.id inner join _Users u on c.usr = u.id where t.id = ${taskID}`
    );

    await db.execute(`update _Decharges set 
                              responsableValidation = ${req.body.i}, 
                              npls1Cmnt = "${req.body.c}", 
                              npls1TreatDte = "${getCurrentTime()}" 
                              where id = ${cnj[0].id}`);
    if (!req.body.i) {
      await db.execute(`update _Decharges set 
        stts = ${req.body.i}
        
        where id = ${cnj[0].id}`);
    }

    await db.execute(`update _Tasks set 
                              treated = 1, 
                              treatedDate = "${getCurrentTime()}" 
                              where id = ${taskID}`);

    await db.execute(`insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) value(
                              ${cnj[0].usr}, ${req.cookies.usdt.id}, 
                              "ADMIN", 
                              "${getCurrentTime()}", 
                              "Traitement de décharge",
                              "${req.cookies.usdt.fname} ${
      req.cookies.usdt.lname
    } (Responsable) a ${rslt} la demande de décharge de ${
      cnj[0].usrNme
    } qui commence le ${formateDate(
      cnj[0].leaveDate
    )} et se termine le ${formateDate(cnj[0].returnDate)} et il a dit : ${
      req.body.c
    }")`);

    if (!req.body.i) {
      await sendMail(
        cnj[0].email,
        `RE: la demande décharge a été traitée`,
        `
                                      <div style='font-family: Arial, sans-serif;'><p>Bonjour ${cnj[0].usrNme},</p><br><p>Votre demande de décharge a été refusée par votre responsable.<p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
                                      `
      );
    }

    res.json('OK');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/treatTheDplcm', async (req, res) => {
  // try {
  var rslt = req.body.i ? 'accepté' : 'rejeté';
  var taskID = req.body.t;
  var [dplc] = await db.execute(
    `select c.id as id, c.usr as usr, c.leaveDate, concat(u.fname, " ", u.lname) as usrNme, u.email, c.returnDate from _deplacements c inner join _Tasks t on t.dplcmnt = c.id inner join _Users u on c.usr = u.id where t.id = ${taskID}`
  );

  await db.execute(`update _deplacements set 
                              responsableValidation = ${req.body.i}, 
                              npls1Cmnt = "${req.body.c}", 
                              npls1TreatDte = "${getCurrentTime()}" 
                              where id = ${dplc[0].id}`);
  if (!req.body.i) {
    await db.execute(`update _deplacements set 
        stts = ${req.body.i}, 
        
        where id = ${dplc[0].id}`);
  }

  await db.execute(`update _Tasks set 
                              treated = 1, 
                              treatedDate = "${getCurrentTime()}" 
                              where id = ${taskID}`);

  await db.execute(`insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) value(
                              ${dplc[0].usr}, ${req.cookies.usdt.id}, 
                              "ADMIN", 
                              "${getCurrentTime()}", 
                              "Traitement de déplacement",
                              "${req.cookies.usdt.fname} ${
    req.cookies.usdt.lname
  } (Responsable) a ${rslt} la demande de déplacement de ${
    dplc[0].usrNme
  } qui commence le ${formateDate(
    dplc[0].leaveDate
  )} et se termine le ${formateDate(dplc[0].returnDate)} et il a dit : ${
    req.body.c
  }")`);

  if (!req.body.i) {
    await sendMail(
      dplc[0].email,
      `RE: la demande déplacement a été traitée`,
      `
                                      <div style='font-family: Arial, sans-serif;'><p>Bonjour ${dplc[0].usrNme},</p><br><p>Votre demande de déplacement a été refusée par votre responsable.<p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
                                      `
    );
  }

  res.json('OK');

  // } catch (error) {
  //   lg.error(error);
  // }
});

app.post('/RHtreatRCPreq', async (req, res) => {
  // try {

  var rslt = req.body.i ? 'accepté' : 'rejeté';
  var taskID = req.body.t;
  var [dplc] = await db.execute(
    `select c.id as id, c.usr as usr, c.leaveDate, concat(u.fname, " ", u.lname) as usrNme, u.email, c.returnDate from _recups c inner join _Tasks t on t.recup = c.id inner join _Users u on c.usr = u.id where t.id = ${taskID}`
  );

  await db.execute(`update _recups set 
                              responsableValidation = ${req.body.i}, 
                              npls1TreatDte = "${getCurrentTime()}" 
                              where id = ${dplc[0].id}`);

  if (!req.body.i) {
    await db.execute(`update _recups set 
        stts = ${req.body.i}
        
        where id = ${dplc[0].id}`);
  }

  await db.execute(`update _Tasks set 
                              treated = 1, 
                              treatedDate = "${getCurrentTime()}" 
                              where id = ${taskID}`);

  console.log(
    `update _Notifications set rd = 1, notified = 1 where link like "/TO-DO-Liste?t=${taskID}"`
  );

  await db.execute(
    `update _Notifications set rd = 1, notified = 1 where link like "/TO-DO-Liste?t=${taskID}"`
  );

  await db.execute(`insert into _Histories (usr, alfa3il, sbjct, actionDteTme, ttle, details) value(
                              ${dplc[0].usr}, ${req.cookies.usdt.id}, 
                              "ADMIN", 
                              "${getCurrentTime()}", 
                              "Traitement de récupération",
                              "${req.cookies.usdt.fname} ${
    req.cookies.usdt.lname
  } (Responsable) a ${rslt} la demande de récupération de ${
    dplc[0].usrNme
  } qui commence le ${formateDate(
    dplc[0].leaveDate
  )} et se termine le ${formateDate(dplc[0].returnDate)}.")`);

  if (!req.body.i) {
    await sendMail(
      dplc[0].email,
      `RE: la demande récupération a été traitée`,
      `
                                      <div style='font-family: Arial, sans-serif;'><p>Bonjour ${dplc[0].usrNme},</p><br><p>Votre demande de récupération a été refusée par votre responsable.<p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>
                                      `
    );
  }

  res.json('OK');

  // } catch (error) {
  //   lg.error(error);
  // }
});

app.post('/addNewTsk', async (req, res) => {
  await db.execute(
    `insert into _Tasks (nme, usr, createdBy, creationTime) value ("${
      req.body.t
    }", ${req.cookies.usdt.id}, ${req.cookies.usdt.id}, "${getCurrentTime()}")`
  );
  res.json('saved');
});

app.post('/getTskInfo', async (req, res) => {
  var [dt] = await db.execute(`select * from _Tasks where id = ${req.body.i}`);

  res.json(dt);
});

app.use(function (req, res) {
  res.redirect(301, '/ERP/TO-DO-Liste');
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
