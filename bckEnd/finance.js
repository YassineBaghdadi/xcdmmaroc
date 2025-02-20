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
const { lg } = require('./lg');
const multer = require('multer');
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));

const { db } = require('./DB_cnx');

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

const formattedTime = (d) => {
  return moment(d).format('DD-MM-YYYY HH:mm:ss');
};

app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));
app.use(
  express.static(path.join(__dirname, '../frntEnd/rcs/EnttLgs'), {
    index: false,
  })
);

app.get('/Finance-entite', async (req, res) => {
  var [checkPermsion] = await db.execute(
    `select ViewFinanceDchbrd as p from _Managemnt where usr = ${req.cookies.usdt.id}`
  );
  if (checkPermsion[0].p == 1) {
    res.sendFile(path.join(__dirname, '../frntEnd', 'Finance-entite.html'));
  } else {
    res.sendFile(path.join(__dirname, '../frntEnd', 'accessDenied.html'));
  }
});

app.get('/', (req, res) => {
  res.redirect(301, '/Finance/Finance-entite');
});

app.get('/getEntties', async (req, res) => {
  var [entts] = await db.execute(`select * from _Entity;`);
  var out = ``;
  entts.forEach((e) => {
    // todo show the pic from the database
    out += `
        <tr>
            <td><img src="./rcs/EnttLgs/${
              e.id
            }.png" alt="image" width="30px" height="30px"/></td>
            <td>${e.nme}</td>
            <td>${e.RC}</td>
            <td>${e.ICE}</td>
            <td>${e.capital}</td>
            <td>${e.formJrdq}</td>
            <td>${formattedTime(e.addedAt)}</td>
        </tr>
    `;
  });

  res.json(out);
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../frntEnd/rcs/EnttLgs/'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/sveNewEnttie', upload.single('logo'), async (req, res) => {
  var inp = req.body;
  // console.log(inp);

  try {
    var [ent] =
      await db.execute(`insert into _Entity(nme, address, RC, ICE, theIF, TP, formJrdq, capital, addedAt, createdBy) value(
      "${inp.nme}", "${inp.addr}", "${inp.rc}", "${inp.ice}", 
      "${inp.if}", "${inp.tp}", "${inp.formJ}", "${inp.cptl}", 
      "${moment.tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss')}", "${
        req.cookies.usdt.fname
      } ${req.cookies.usdt.lname}"
      )`);

    const newFilePath = path.join(
      __dirname,
      '../frntEnd/rcs/EnttLgs/',
      `${ent.insertId}.png`
    );
    fs.rename(req.file.path, newFilePath, (err) => {
      if (err) {
        return res.status(500).send('Error moving file');
      }
    });
    const folderPath = path.join(__dirname, `../frntEnd/rcs/docs/${inp.nme}`);

    fs.access(folderPath, fs.constants.F_OK, (err) => {
      if (err) {
        fs.mkdir(folderPath, { recursive: true }, (err) => {
          if (err) {
            return console.error('Error creating folder:', err);
          }
        });
      } else {
        console.log('Folder already exists at:', folderPath);
      }
    });

    res.json('done');
  } catch (error) {
    lg.error(error);
  }
});

app.use(function (req, res) {
  res.redirect(301, '/Finance');
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
