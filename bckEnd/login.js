const express = require('express');
const app = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const Jimp = require('jimp');
const cookieParser = require('cookie-parser');
const moment = require('moment-timezone');
const { db } = require('./DB_cnx');
const { lg } = require('./lg');
const mime = require('mime-types');
const fs = require('fs');

const path = require('path');
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(cookieParser());
const { sendMail } = require('./mls');
app.use(express.static(path.join(__dirname, '../frntEnd'), { index: false }));

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

var removeSpces = (s) => {
  return s ? String(s).replace(/\s+/g, ' ').trim() : 'null';
};

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: String(process.env.sessionSecret),
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const [rows] = await db.execute('SELECT * FROM _Users WHERE id = ?', [
        payload.id,
      ]);

      if (!rows[0]) {
        return done(null, false);
      }

      const user = rows[0];
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

app.use(passport.initialize());

app.get('/', (req, res) => {
  jwt.verify(
    req.cookies.jwtToken,
    String(process.env.sessionSecret),
    (err, decoded) => {
      if (!err) {
        res.redirect('/ERP');
      }
    }
  );

  res.sendFile(path.join(__dirname, '../frntEnd', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM _Users WHERE usrNme = ?', [
      username,
    ]);

    if (!rows[0]) {
      return res.json(false);
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.pwd);

    if (!isPasswordValid) {
      return res.json(false);
    }
    if (rows[0].login == 0) {
      return res.status(403).json(false);
    }
    const expiresIn = 60 * 60;
    res.cookie('usdt', user, {
      httpOnly: true,
    });

    const token = jwt.sign(
      { id: user.id, username: user.usrNme },
      String(process.env.sessionSecret),
      {
        expiresIn: expiresIn,
      }
    );
    lg.info(`${user.fname} ${user.lname} logged in`);
    await db.execute(
      `update _Users set tkn = "${token.split('.')[2]}" where id = ${user.id}`
    );
    res.cookie('jwtToken', token, {
      httpOnly: true,
    });
    // console.log(token);
    res.json({ token });
  } catch (error) {
    lg.error(error);
    console.error('Login Error:', error);
    res.status(500).json({ message: error });
  }
});

app.get('/frgtPss', async (req, res) => {
  try {
    if (req.query.x) {
      const [usrr] = await db.execute(
        'SELECT id,  concat(fname, " ", lname) as usNme, usrNme, fname , lname , email FROM _Users WHERE CIN = ?',
        [req.query.x]
      );

      if (!usrr[0]) {
        return res.status(403).json(false);
      }

      if (!usrr[0].email) {
        return res.status(403).json(false);
      }

      var usrNme = usrr[0].usrNme;

      if (!usrNme) {
        usrNme = `${removeSpces(usrr[0].fname)
          .split('')[0]
          .toLowerCase()}.${removeSpces(usrr[0].lname).toLowerCase()}`;
        await db.execute(
          `update _Users set usrNme = "${usrNme}" where id = ${usrr[0].id}`
        );
      }

      const psw = [...Array(12)]
        .map(() =>
          'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@&()-=_+[]{}|:<>'.charAt(
            Math.floor(Math.random() * 69)
          )
        )
        .join('');

      const pswH = (await bcrypt.hash(psw, 10)).toString();

      await db.execute(
        `update _Users set pwd = "${pswH}" where id = ${usrr[0].id}`
      );

      await db.execute(`insert into _Histories (usr ,alfa3il ,sbjct ,actionDteTme ,ttle ,details ) 
                      values( ${usrr[0].id}, ${usrr[0].id}, "USER", "${moment
        .tz('Africa/Casablanca')
        .format(
          'YYYY-MM-DD HH:mm:ss'
        )}", "Modification Profil", "Réinitialisation du mot de passe"
                      )`);

      let txt = `<p>Bonjour ${usrr[0].usNme}, <br><br>Votre mot de passe a été changé avec succès. <br><br>- Utilisateur : <strong>${usrNme}</strong><br>- Votre nouveau mot de passe est : <strong>${psw}</strong></p>`;

      await sendMail(usrr[0].email, `Réinitialisation du mot de passe`, txt);
    }

    res.json('done');
  } catch (error) {
    lg.error(error);
    console.error('Forgot Password Error:', error);
    // res.status(500).json({ message: error });
    res.json(false);
  }
});

app.get('/BD', async (req, res) => {
  if (req.headers['t'] == process.env.tkn) {
    try {
      const [BDs] = await db.execute(
        'SELECT id, fname, lname, email, etablissment, picExt FROM _Users WHERE MONTH(bd) = MONTH(CURDATE()) AND DAY(bd) = DAY(CURDATE()) and email is not null and etablissment in ("INTERNE");'
      );

      if (BDs.length > 0) {
        const emailPromises = BDs.map(async (e) => {
          if (e.email) {
            let attch = [];
            let bdPic =
              'https://i.pinimg.com/originals/64/5c/eb/645ceb588b46af3aa0faead5418cd3aa.gif';

            if (e.picExt) {
              const pcPth = path.join(
                __dirname,
                `../frntEnd/rcs/ProfilePics/${e.id}.${e.picExt}`
              );

              if (fs.existsSync(pcPth)) {
                const contentType = mime.lookup(pcPth);
                if (contentType) {
                  attch = [
                    {
                      filename: `${e.id}.${e.picExt}`,
                      content: fs.readFileSync(pcPth),
                      cid: `${e.id}.${e.picExt}`,
                      contentType: contentType,
                    },
                  ];
                  bdPic = `cid:${e.id}.${e.picExt}`;
                } else {
                  console.error(`Could not determine MIME type for: ${pcPth}`);
                  attch = [];
                }
              }
            }

            const [CCs] = await db.execute(
              `select email from _Users where etablissment = "${e.etablissment}" and email is not null and email != "${e.email}";`
            );
            let birthdayEmails = [
              `Wishing you a very happy birthday! We hope you have a wonderful day filled with joy and celebration 🍰🎁.`,
              `On this special day, we just wanted to take a moment to wish you a fantastic year ahead, filled with joy, success, and lots of cake! 🍰🎁.`,
              `We hope you have a fantastic day celebrating with loved ones and creating wonderful memories 🍰🎁.`,
              `Wishing you a happy birthday and a fantastic year ahead! We hope your day is filled with everything that brings you happiness 🍰🎁.`,
              `Happy Birthday! We hope you take some time to truly enjoy your special day and celebrate in style 🍰🎁.`,
            ];

            var ml =
              birthdayEmails[Math.floor(Math.random() * birthdayEmails.length)];

            const bdMail = `<html><head><meta charset='UTF-8'><title>Happy Birthday!</title></head><body style='font-family: Arial, sans-serif;'><div style='text-align: center;'><h2>🎈🎂 Happy Birthday, ${e.fname} ${e.lname}! 🎂🎈</h2><p>${ml}</p><br><img src='${bdPic}' alt='Happy Birthday' style='width: 260px; height: auto;'><br/><p>Best regards,<br/>XCDM ERP (IT Team)</p></div></body></html>`;

            await sendMail(
              e.email,
              'Happy Birthday!',
              bdMail,
              CCs.length > 0 ? CCs.map((obj) => obj.email) : null,
              attch
            );
          }
        });

        await Promise.all(emailPromises);
        res.json('');
      } else {
        res.json('no BD');
      }
    } catch (error) {
      console.error('Error processing birthday emails:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(403).json({ error: 'Unauthorized' });
  }
});

module.exports = app;
