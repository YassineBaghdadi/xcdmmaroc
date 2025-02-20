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
const { lg } = require('./lg');
app.use((req, res, next) => {
  jwt.verify(
    req.cookies.jwtToken,
    String(process.env.sessionSecret),
    (err, decoded) => {
      if (err) {
        res.redirect('/login');
      } else {
        next();
      }
    }
  );
});

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

app.get('/', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select it as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'IT-Management.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.get('/getDeprts', async (req, res) => {
  try {
    const [dd] = await db.execute(`select id, nme from _Departments`);
    var dprts = `<option value="">Sélectionner un département</option>`;
    dd.forEach((e) => {
      dprts += `<option value="${e.id}">${e.nme}</option>`;
    });

    var [usrs] = await db.execute(
      `select id, concat(lname , ' ', fname) as nme from _Users`
    );
    var op = `<option value="">Sélectionner un Utilisateur</option>`;
    usrs.forEach((e) => {
      op += `<option value="${e.id}">${e.nme}</option>`;
    });

    res.json({ d: dprts, u: op });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/getSrvc', async (req, res) => {
  try {
    const [srvcs] = await db.execute(
      `select id, nme from _Services where id not in (select srvc from _T_service where dprt = ${req.body.d} )`
    );

    const [t_srvcs] = await db.execute(
      `select s.id, s.nme from _T_service ts right join _Services s on ts.srvc = s.id where dprt = ${req.body.d} `
    );
    var t1 = '';
    srvcs.forEach((e) => {
      t1 += `<tr>
                <td class="pl-0">
                  <label class="form-check-label">
                    <input value="${e.id}" class="checkbox srvcs" type="checkbox"> ${e.nme}
                  </label>
                </td>
                <td>
                  <a href="" >
                    <i class="remove ti-close"></i>
                  </a>
                </td>
              </tr>
              `;
    });
    var t2 = '';
    t_srvcs.forEach((e) => {
      t2 += `
      <tr>
        <td class="pl-0">
        <label class="form-check-label">
        <input class="checkbox attrSrv" value="${e.id}" type="checkbox"> ${e.nme}</label></td>
      </tr>
    `;
    });

    res.json({ a: t1, b: t2 });
  } catch (error) {
    lg.error(error);
  }
});

app.post('/attrSrvc', async (req, res) => {
  try {
    var ss = req.body.s;
    ss.forEach(async (e) => {
      // console.log(
      //   `insert into _T_service (dprt, srvc) values (${req.body.d}, ${e})`
      // );
      await db.execute(
        `insert into _T_service (dprt, srvc) values (${req.body.d}, ${e})`
      );
    });

    res.json('DONE');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/rmvAttrSrvBtn', async (req, res) => {
  try {
    var ss = req.body.s;
    ss.forEach((e) => {
      db.execute(
        `delete from _T_service where dprt = ${req.body.d} and srvc = ${e}`
      );
    });

    res.json('DONE');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/addDprt', async (req, res) => {
  try {
    await db.execute(`insert into _Departments (nme) value ("${req.body.d}")`);

    res.json('DONE');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/addSrvc', async (req, res) => {
  try {
    await db.execute(`insert into _Services (nme) value ("${req.body.d}")`);

    res.json('DONE');
  } catch (error) {
    lg.error(error);
  }
});

app.get('/addPermition', async (req, res) => {
  if (req.query.u) {
    await db.execute(
      `update _Managemnt set ${req.query.i} = ${req.query.c} where usr = ${req.query.u}`
    );
  }
  res.json('DONE');
});

app.get('/getPermitions', async (req, res) => {
  var userId = req.query.i;
  const [rows] = await db.execute('SELECT * FROM _Managemnt WHERE usr = ?', [
    userId,
  ]);

  if (rows.length === 0) {
    console.log(`No data found for user ${userId}`);
    return [];
  }

  const userData = rows[0];
  const columnsWithOne = [];

  for (const columnName in userData) {
    if (
      userData.hasOwnProperty(columnName) &&
      userData[columnName] === 1 &&
      columnName !== 'usr' &&
      columnName !== 'id'
    ) {
      columnsWithOne.push(columnName);
    }
  }
  // console.log(columnsWithOne);

  res.json(columnsWithOne);
});

app.use(function (req, res) {
  res.redirect(301, '/IT-Management');
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
