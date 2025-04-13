const { Server } = require('socket.io');
const express = require('express');
const { createServer } = require('node:http');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
// const WebSocket = require("ws");
const url = require('url');
const querystring = require('querystring');
const http = require('http');
const socketIo = require('socket.io');

require('dotenv').config();
const moment = require('moment-timezone');

const Swal = require('sweetalert2');
const requestIp = require('request-ip');
const { db } = require('./DB_cnx');
const { lg } = require('./lg');

const app = express();
const server = createServer(app);
const multer = require('multer');
// const fileUpload = require("express-fileupload");
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function getCurrentTime() {
  return moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss');
}
const io = new Server(server);

const connectedSockets = {};
io.use((socket, next) => {
  const req = {
    headers: socket.handshake.headers,
  };

  cookieParser()(req, {}, () => {
    const userId = req.cookies?.usdt?.id;
    const tkn = req.cookies?.jwtToken;

    if (userId) {
      socket.userId = userId;
      socket.tkn = tkn;
      // console.log('User ID from cookie:', userId);
    } else {
      // console.log('No userId cookie found.');
    }
    next();
  });
});
var wfmConnectedCounter = 0;
io.on('connection', (socket) => {
  // console.log(`a user connected ${socket.id}`);
  // console.log(` the connected user is :  ${socket.userId}`);
  connectedSockets[socket.userId] = socket.id;

  try {
    setInterval(async () => {
      const [ntf] = await db.execute(
        'SELECT * FROM _Notifications WHERE rd = 0 and usr = ?',
        [socket.userId]
      );
      // console.log(ntf.length);

      if (ntf.length > 0) {
        var htntf = `<p class='mb-0 font-weight-normal float-left dropdown-header'>Notifications</p><span id="ntfsNmbr" hidden>${ntf.length}</span>`;

        ntf.forEach(async (e) => {
          if (e.notified == 0) {
            await io.to(connectedSockets[socket.userId]).emit('NewNotf', e.msg);
            await db.execute(
              `update _Notifications set notified = 1 where id = ${e.id}`
            );
          }
          var j = '';
          if (e.rd == 0) {
            j = `style='color:green; font-weight:bold;'`;
          }
          htntf += `<a class='dropdown-item preview-item' onclick='ntfClck(${
            e.id
          }, &quot;${String(
            e.link
          )}&quot;)'> <div class='preview-item-content'> <h6 class='preview-subject font-weight-normal' ${j}>${
            e.ttle
          }</h6> <p class='font-weight-light small-text mb-0 text-muted'>${
            e.msg
          }</p> </div> </a>`;
        });

        if (ntf.length == 0) {
          htntf += `<br><br><h6 class='preview-subject font-weight-normal' style='margin-left:20px;margin-bottom:20px;color:red; font-style:italic;' >Vous n'avez pas de Nouvelles Notifications</h6>`;
        }
        io.to(connectedSockets[socket.userId]).emit('allNtfs', htntf);
      }

      var [wfmWrkDysCounter] = await db.execute(
        `select count(id) as c from _WorkinDy where usr != 0 and lgout is null`
      );

      // console.log(`${wfmWrkDysCounter[0].c} , ${wfmConnectedCounter}`);

      if (wfmWrkDysCounter[0].c != wfmConnectedCounter) {
        console.log('UpdateWFMtbl');
        wfmConnectedCounter = wfmWrkDysCounter[0].c;
        io.emit('UpdateWFMtbl', 'update');
      }
    }, 500);
  } catch (error) {
    console.error('Error monitoring notifications:', error);
  }

  // setInterval(async () => {
  //   var tt = socket.tkn;
  //   console.log(tt);

  //   if (tt) {
  //     console.log(
  //       `select id from _Users where tkn = "${tt.split('.').at(-1)}" and id = ${
  //         socket.userId
  //       }`
  //     );

  //     var stillConnected = await db.execute(
  //       `select id from _Users where tkn = "${tt.split('.').at(-1)}" and id = ${
  //         socket.userId
  //       }`
  //     );

  //     console.log(stillConnected);

  //     if (stillConnected[0].length == 0) {
  //       // console.log('User disconnected');
  //       io.to(connectedSockets[socket.userId]).emit('byeZine', true);
  //       delete connectedSockets[socket.userId];
  //       // return;
  //     }
  //   }
  // }, 5000);

  setInterval(() => {
    const date = new Date();

    var tme = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Africa/Casablanca',
    }).format(date);

    socket.emit('currecntTime', { t: tme, t2: getCurrentTime() });
  }, 1000);

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.id);
    delete connectedSockets[socket.userId];
  });
});

app.get('/nn', async (req, res) => {
  io.to(connectedSockets[req.query.i]).emit('NewNotf', 'hiiiiii');
  res.send('ok');
});

let ts = Date.now();
let date_ob = new Date(ts);
let mnth = date_ob.getMonth() + 1;
if (mnth < 10) {
  mnth = `0${mnth}`;
}

let dy = date_ob.getDate();
if (dy < 10) {
  dy = `0${dy}`;
}

const today = date_ob.getFullYear() + '-' + mnth + '-' + dy;

const loginRouter = require('./login');
app.use('/ERP/login', loginRouter);

app.use('/Career', require('./career'));

app.use('/ERP', require('./Home'));

const HomeRouter = require('./pblc');
app.use('/', HomeRouter);

const newsRouter = require('./news');
app.use('/ERP/FiL-Actualites', newsRouter);

const servAdm = require('./ServiceAdmin');
app.use('/ERP/Service-Admin', servAdm);

const rcrtOffrs = require('./Rcrtmt');
app.use('/ERP/Recrutement', rcrtOffrs);

const servfinance = require('./finance');
app.use('/ERP/Finance', servfinance);

const WFM = require('./WFM');
app.use('/ERP/WFM', WFM);

const it = require('./it');
app.use('/ERP/IT-Management', it);

const todo = require('./todo');
app.use('/ERP/TO-DO-Liste', todo);

const ManageUsers = require('./ManageUsers');
app.use('/ERP/Users', ManageUsers);

const Prfl = require('./prfl');
app.use('/ERP/Profile', Prfl);

const ntfs = require('./notifs');
app.use('/ERP/Notifications', ntfs);

const path = require('path');
const { log } = require('console');
const { sendMail } = require('./mls');
app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));
app.use(bodyParser.json());
// app.use(fileUpload());
app.use(passport.initialize());
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

app.use(cookieParser());

app.use(
  session({
    secret: String(process.env.sessionSecret),
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
    },
  })
);
var formateDate = (d) => {
  const dte = new Date(d);
  return `${dte.getFullYear()}-${(dte.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${dte.getDate().toString().padStart(2, '0')} `;
};

app.get(/^.*\.html$/, (req, res) => {
  res.redirect(301, '/ERP');
});

app.get(/^.*\.js$/, (req, res) => {
  res.redirect(301, '/ERP');
});
app.use(requestIp.mw());

app.post('/chckP', async (req, res) => {
  if (req.body.a && req.body.a != 'Profile') {
    var [auth] = await db.execute(
      `select count(s.id) as a from _Services s inner join _T_service ts on ts.srvc = s.id where ts.dprt = ${req.cookies.usdt.department} and s.pth like "${req.body.a}"`
    );

    if (auth[0].a == 0) {
      res.redirect(302, '/ERROR');
    } else {
      res.send('authorized');
    }
  } else {
    res.send('authorized');
  }
});

app.get('/checkIp', async (req, res) => {
  var theIP = req.cookies.ip;
  if (req.cookies.ip !== req.clientIp) {
    theIP = req.clientIp;
    await res.cookie('ip', req.clientIp, {
      httpOnly: true,
    });
  }

  res.json(theIP);
});

app.get('/getI', (req, res) => {
  res.json(req.cookies.usdt.id);
});

app.get('/getpc', async (req, res) => {
  var [e] = await db.execute(
    `select picExt from _Users where id = ${req.cookies.usdt.id}`
  );
  res.json(`./rcs/ProfilePics/${req.cookies.usdt.id}.${e[0].picExt}`);
});

app.get('/sendMail', async (req, res) => {
  await sendMail(
    'y.baghdadi@xcdmmaroc.com',
    `test`,
    `
    test mail 
    `
  );

  res.json('done');
});

var getDuration = (d) => {
  const endDate = new Date();
  var startDate = new Date(d);
  const diffInMs = Math.abs(endDate - startDate);

  const hours =
    Math.floor(diffInMs / (1000 * 60 * 60)).toString().length > 1
      ? Math.floor(diffInMs / (1000 * 60 * 60))
      : Math.floor(diffInMs / (1000 * 60 * 60))
          .toString()
          .padStart(2, '0');

  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((diffInMs % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

app.get('/ERROR', (req, res) => {
  res.sendFile(path.join(__dirname, '../frntEnd', 'err500.html'));
});

// app.post("/sendMail", function (req, res) {
//   sendMail("y.baghdadi@xcdmmaroc.com", "subject", req.body.e);
//   res.send("sent");
// });

app.get('/logout', async (req, res) => {
  // try {
  const [rr] = await db.execute(
    `select id, lgin from _WorkinDy where usr = ${req.cookies.usdt.id} and lgout is null`
  );

  if (rr[0]) {
    const [actvBr] = await db.execute(
      `select brk, started from _ActiveBreaks where usr = ${req.cookies.usdt.id}`
    );
    if (actvBr[0]) {
      await db.execute(
        `update _Breaks set fnsh = "${getCurrentTime()}", drtion = "${getDuration(
          actvBr[0].started
        )}" where id = ${actvBr[0].brk}`
      );
      await db.execute(
        `delete from _ActiveBreaks  where usr = ${req.cookies.usdt.id}`
      );
    }

    const [r] = await db.execute(
      `update _WorkinDy set lgout = "${getCurrentTime()}", ttlWrknTm = "${getDuration(
        rr[0].lgin
      )}" where id = ${rr[0].id}`
    );
  }
  await db.execute(
    `update _Users set tkn = null where id = ${req.cookies.usdt.id}`
  );

  res.cookie('jwtToken', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  res.cookie('usdt', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  // req.cookies = 'jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  // lg.info(`${req.cookies.usdt.id} logged out`);
  res.redirect('/ERP');
  // } catch (error) {
  //   lg.error(error);
  // }
});

app.get('/lock', async (req, res) => {
  try {
    res.cookie('jwtToken', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    res.cookie('usdt', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    res.redirect('/ERP');
  } catch (error) {
    lg.error(error);
  }
});

app.post('/modifyInfo', async (req, res) => {
  const { addr, eml, tel, tel2, psd, psd2 } = req.body;
  var pss = '';
  if (psd) {
    if (psd != psd2) {
      return res.status(401).json({ message: 'Error Passwords' });
    } else {
      pss = `, pwd = "${(await bcrypt.hash(psd2, 10)).toString()}" `;
    }
  }

  try {
    const [r] = await db.execute(
      `update _Users set adress = "${addr}", email = "${eml}", phone ="${tel}", phone2 ="${tel2}" ${pss} where id = ${req.cookies.usdt.id} `
    );
  } catch (error) {
    lg.error(error);
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../frntEnd/rcs/ProfilePics/'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/uploadPrflPic', upload.single('prflPc'), async (req, res) => {
  console.log('Received request:', req.headers);
  console.log('File details:', req.file);

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
  if (!['png', 'jpg', 'jpeg'].includes(ext)) {
    return res.status(400).send('Unsupported file type.');
  }

  // try {

  await db.execute(
    `update _Users set picExt = "${ext}" where id = ${req.cookies.usdt.id}`
  );
  const newFilePath = path.join(
    __dirname,
    '../frntEnd/rcs/ProfilePics/',
    `${req.cookies.usdt.id}.${ext}`
  );
  fs.rename(req.file.path, newFilePath, (err) => {
    if (err) {
      return res.status(500).send('Error moving file');
    }
  });

  res.status(200).json('File uploaded successfully.');
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).send("Error processing the file.");
  // }
});

app.get('/checkRemote', async (req, res) => {
  try {
    var IPs = process.env.sccmIP;
    if (
      IPs.split('/').includes(req.cookies.ip) ||
      ['::1', '127.0.0.1', '::ffff:127.0.0.1', 'localhost'].includes(
        req.cookies.ip
      )
    ) {
      res.status(200).json({ message: 'y' });
    } else {
      let ts = Date.now();
      let date_ob = new Date(ts);
      let date = date_ob.getDate();
      let month = date_ob.getMonth() + 1;
      let year = date_ob.getFullYear();
      var today = year + '-' + month + '-' + date;
      const [a] = await db.execute(
        `select * from _RemotlyWork where usr = ${req.cookies.usdt.id} and strtDay <= "${today}" and endDay >= "${today}" `
      );

      if (!a[0]) {
        res.status(401).json({ message: 'n' });
      } else {
        res.status(200).json({ message: 'y' });
      }
    }
  } catch (error) {
    lg.error(error);
  }
});

app.get('/gtev', async (req, res) => {
  const date = new Date();

  const nationalEvents = [
    { date: '01/01', event: "Jour de l'An" },
    { date: '11/01', event: "Jour du Manifeste de l'Indépendance" },
    { date: '01/05', event: 'Fête du Travail' },
    { date: '30/07', event: 'Anniversaire du Roi Mohammed VI' },
    { date: '14/08', event: 'Jour de la Révolution' },
    { date: '06/11', event: 'Jour de la Marche Verte' },
    { date: '18/11', event: "Jour de l'Indépendance" },
    { date: '20/08', event: 'Fête de la Révolution du Roi et du Peuple' },
    { date: '01/12', event: 'Jour de la Constitution' },
    { date: '07/10', event: 'Jour de la Réconciliation Nationale' },
    {
      date: '25/01',
      event: "Fête de l'Indépendance de la Ville de Casablanca",
    },
    {
      date: '02/03',
      event: 'Jour de la Déclaration de l’Indépendance du Maroc',
    },
    { date: '01/09', event: 'Jour de la Fondation de la Ville de Marrakech' },
    { date: '04/06', event: "Anniversaire de l'abolition de l'esclavage" },
    {
      date: '30/03',
      event: "Jour de la Fête de l'Anniversaire de l'Indépendance de l’Agadir",
    },
  ];
  const dayMonth = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });

  var [bds] = await db.execute(
    `select concat(fname, " ", lname) as usr, bd from _Users where bd like "%${
      dayMonth.split('/')[1]
    }-${dayMonth.split('/')[0]}%"`
  );

  const event = nationalEvents.find((event) => event.date === dayMonth);

  var evnt = '';

  if (event) {
    evnt = event.event;
  }
  var bb = [];

  if (bds[0]) {
    bds.forEach((e) => {
      bb.push(e.usr);
    });
    evnt += evnt
      ? ` et l'anniversaire de ${bb.join(' et ')}`
      : ` aujourd'hui c'est l'anniversaire de ${bb.join(' et ')}`;
  }

  res.json(evnt);
});

app.get('/getCurrentTime', async (req, res) => {
  // res.json({ t: getCurrentTime() });
  // res.json({ t: moment.tz("Africa/Casablanca") });
  const date = new Date();

  var tme = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Casablanca',
  }).format(date);

  res.json({ t: tme, t2: getCurrentTime() });
});

app.get('/getPic', async (req, res) => {
  try {
    const [pic] = await db.execute(
      `select pic from _Users where id - ${req.cookies.usdt.id}`
    );
    if (pic[0]) {
      const imageData = pic[0].pic;
      res.send(imageData);
    } else {
      res.status(404).send('Default Image not found');
    }
  } catch (error) {
    lg.error(error);
  }
});

app.get('/getAllDprtmnts', async (req, res) => {
  try {
    const [dd] = await db.execute(`select * from _Departments`);
    res.json(dd);
  } catch (error) {
    lg.error(error);
  }
});

app.get('/getUsrCnjTbl', async (req, res) => {
  try {
    var id = req.cookies.usdt.id;
    if (req.body.i) {
      id = req.body.i;
    }
    const [cnjs] = await db.execute(
      `select * from _Conjes where usr = ${id} order by id desc`
    );
    const [Scnj] = await db.execute(
      `select soldCnj from _Users where id = ${id}`
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
          cnclBtn = 'hidden';
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
        <button type="button" ${cnclBtn} class="btn btn-inverse-danger btn-icon" onclick="cancelCnj('${
        c.id
      }')">
          <i class="ti-close"></i>
        </button>
      </td>
      </tr>
        `;
    });

    res.json({ cnj: cnjsHtml, sc: Scnj[0].soldCnj, message: 'Done' });
  } catch (error) {
    lg.error(error);
  }
});

app.get('/getLnav', async (req, res) => {
  try {
    var html = '';
    // const [hh] = await db.execute(
    //   `select html from _Services s inner join _T_service ts on ts.srvc = s.id where dprt = ${req.cookies.usdt.department} and html is not null  order by s.id asc`
    // );

    const [hh] = await db.execute(
      `select html from _Services s where html is not null  order by s.id asc`
    );

    hh.forEach((e) => {
      html += e.html;
    });

    res.json(html);
  } catch (error) {
    lg.error(error);
  }
});

app.get('/getEnttiesList', async (req, res) => {
  var [entts] = await db.execute(`select * from _Entity`);
  var out = '<option value="" hidden>Tous</option>';
  entts.forEach((e) => {
    out += `<option value="${e.id}">${e.nme}</option>`;
  });
  res.json(out);
});
app.get('/getEtablsList', async (req, res) => {
  var [entts] = await db.execute(`select * from _Etablisment`);
  var out = '<option value="" hidden>Tous</option>';
  entts.forEach((e) => {
    out += `<option value="${e.id}">${e.nme}</option>`;
  });
  res.json(out);
});
app.get('/getDprtmList', async (req, res) => {
  var [entts] = await db.execute(`select * from _Departments`);
  var out = '<option value="" hidden>Tous</option>';
  entts.forEach((e) => {
    out += `<option value="${e.id}">${e.nme}</option>`;
  });
  res.json(out);
});

app.get('/fixUsersContracts', async (req, res) => {
  var [users] = await db.execute(`select * from _Users`);
  users.forEach(async (u) => {
    await db.execute(`insert into _Managemnt (usr)value(${u.id})`);
  });
  //   var [lastCntrcts] =
  //     await db.execute(`SELECT * FROM _Contracts c WHERE c.id = (SELECT MAX(id) FROM _Contracts WHERE usr = c.usr);
  // `);

  //   lastCntrcts.forEach(async (e) => {
  //     await db.execute(
  //       `UPDATE _Users SET actualEntity = ${e.entty}, integrationDate = "${moment(
  //         new Date(e.dteIntgr)
  //       ).format('YYYY-MM-DD')}", contractTpe = "${
  //         e.tpe
  //       }", activeStatus = 1 WHERE id = ${e.usr}`
  //     );
  //   });

  //   await db.execute(
  //     `UPDATE _Contracts c JOIN _Users u ON c.usr = u.id SET c.pst = u.jobeTitle, c.etablissement = u.etablissment`
  //   );

  //   var [frstCntrcts] =
  //     await db.execute(`SELECT * FROM _Contracts c WHERE c.id = (SELECT min(id) FROM _Contracts WHERE usr = c.usr);
  // `);

  //   frstCntrcts.forEach(async (e) => {
  //     await db.execute(
  //       `UPDATE _Users SET firstIntegrationDate = "${moment(
  //         new Date(e.dteIntgr)
  //       ).format('YYYY-MM-DD')}",  lastTransferDate = "${moment(
  //         new Date(e.dteIntgr)
  //       ).format('YYYY-MM-DD')}" WHERE id = ${e.usr}`
  //     );
  //   });

  //   var [lastEndedCntrcts] =
  //     await db.execute(`SELECT * FROM _Contracts c WHERE c.id = (SELECT max(id) FROM _Contracts WHERE usr = c.usr and endDte is not null);
  // `);

  //   lastEndedCntrcts.forEach(async (e) => {
  //     var [ll] = await db.execute(
  //       `SELECT * FROM _Contracts WHERE id = ${parseInt(e.id) + 1} and usr = ${
  //         e.usr
  //       }`
  //     );

  //     if (ll.length > 0) {
  //       await db.execute(
  //         `update _Users set lastTransferDate = "${moment(ll[0].dteIntgr).format(
  //           'YYYY/MM/DD'
  //         )}", leaveDate = null where id = ${e.usr}`
  //       );
  //     } else {
  //       await db.execute(
  //         `update _Users set lastTransferDate = "${moment(e.dteIntgr).format(
  //           'YYYY/MM/DD'
  //         )}", leaveDate = "${moment(e.endDte).format(
  //           'YYYY/MM/DD'
  //         )}" where id = ${e.usr}`
  //       );
  //     }
  //   });

  //   await db.execute(`update _Users set sex = "Monsieur" where sex = "M.";`);
  //   await db.execute(
  //     `update _Users set sex = "Madame" where sex = "Mlle" or sex ="Mme" or sex = "Mademoiselle" ;`
  //   );
  //   await db.execute(
  //     `update _Users set sex = "Mademoiselle" where sex = "Madame" and famlyStts ="Célibataire" ;`
  //   );

  res.json('done');
});

app.use(function (req, res) {
  // res.redirect(301, '/');
  res.json({
    error: {
      name: 'Error',
      status: 404,
      message: 'Invalid Request',
      statusCode: 404,
    },
    message: 'wrong url',
  });
});

server.listen(process.env.PRT);
