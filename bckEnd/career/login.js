const express = require('express');
const app = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendMail } = require('./mls');
const session = require('express-session');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { lg } = require('./lg');
const { db } = require('./DB_cnx');

// app.use((req, res, next) => {
//   jwt.verify(
//     req.cookies.jwtCndTkn,
//     String(process.env.sessionSecret),
//     (err, decoded) => {
//       if (err) {
//         res.redirect(`/Career/login?next=${req.originalUrl}`);
//       } else {
//         next();
//       }
//     }
//   );
// });

app.use(bodyParser.json());
app.use(passport.initialize());
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

app.use(
  express.static(path.join(__dirname, '../../frntEnd/career'), { index: false })
);
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: String(process.env.sessionSecret),
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM _carreerCondidats WHERE id = ?',
        [payload.id]
      );

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
    req.cookies.jwtCndTkn,
    String(process.env.sessionSecret),
    (err, decoded) => {
      if (!err) {
        res.redirect('/Career/Profile');
      }
    }
  );

  res.sendFile(
    path.join(__dirname, '../../frntEnd/career', 'SignUP-Login.html')
  );
});

var removeSpces = (s) => {
  return s ? String(s).replace(/\s+/g, ' ').trim() : 'null';
};
app.post('/signup', upload.single('cv'), async (req, res) => {
  var [exists] = await db.execute(
    `select email from _carreerCondidats where email = ? or phone = ?`,
    [req.body.ml, req.body.ph]
  );

  if (exists.length > 0) {
    return res.status(400).json({ message: 'Ce compte existe déjà' });
  }

  const fileDT = req.file.buffer;
  const psw = [...Array(9)]
    .map(() =>
      'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@&()-=_+[]{}|:<>'.charAt(
        Math.floor(Math.random() * 69)
      )
    )
    .join('');

  const pswH = (await bcrypt.hash(psw, 10)).toString();

  const fileExtension = path.extname(req.file.originalname).split('.')[1];

  // await db.execute(`INSERT INTO pdf_files (pdf_data) VALUES ('${pdfData.toString('base64')}')`);

  var uid = crypto
    .createHash('md5')
    .update(
      `${req.body.fn}${req.body.ln}YassineBaghdadi.com${req.body.ml}${req.body.ph}`
    )
    .digest('hex');
  // await db.execute(
  //   `insert into _carreerCondidats (uniqID, pswrd, fname, lname, email, phone, cv, cvEXT) values("${uid}", "${pswH}", "${req.body.fn}", "${req.body.ln}", "${req.body.ml}", "${req.body.ph}", "${fileDT}", "${fileExtension}")`
  // );

  await db.execute(
    `INSERT INTO _carreerCondidats (uniqID, pswrd, fname, lname, email, phone, cv, cvEXT) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uid,
      pswH,
      req.body.fn,
      req.body.ln,
      req.body.ml,
      req.body.ph,
      fileDT,
      fileExtension,
    ]
  );

  sendMail(
    removeSpces(req.body.ml),
    'XCDMMaroc : Création de votre profil',
    `<div style='font-family: Arial, sans-serif;'><p>Cher(e) ${req.body.fn} ${req.body.ln},</p><br/><br/><p>Nous sommes heureux de vous informer que votre profil a &eacute;t&eacute; cr&eacute;&eacute; avec succ&egrave;s sur notre plateforme.</p><p>Voici vos informations de connexion :</p><ul><li><strong>Nom d'utilisateur :</strong> ${req.body.ml}</li><li><strong>Mot de passe :</strong> ${psw}</li></ul><p> Si vous avez des questions ou des probl&egrave;mes, n'h&eacute;sitez pas &agrave; nous contacter.</p><br/><p>Acc&eacute;dez &agrave; l'ERP en cliquant <a href='https://career.xcdmmaroc.com/Contact/'>ici</a>.</p><p style='font-style: italic;'><br/>Cordialement,<br />XCDM ERP (Team IT)</p></div>`
  );
  res.json('done');
});

// app.get("/getCV/:i", async (req, res) => {
//   var [cv] = await db.execute(
//     `select cv from _carreerCondidats where id = ${req.params.i}`
//   );
//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", `attachment; filename=downloaded.pdf`);
//   res.send(cv[0].cv);
// });

app.post('/login', async (req, res) => {
  const username = req.body.l1;
  const password = req.body.l2;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM _carreerCondidats WHERE email = ?',
      [username]
    );

    if (!rows.length) {
      return res.json(false);
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.pswrd);

    if (!isPasswordValid) {
      return res.json(false);
    }

    const expiresIn = 8 * 60 * 60;
    res.cookie(
      'cndDt',
      { id: user.id, fname: user.fname, lname: user.lname, email: user.email },
      {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      }
    );

    const token = jwt.sign(
      { id: user.id, email: user.email },
      String(process.env.sessionSecret),
      { expiresIn: expiresIn }
    );
    console.log(`${user.fname} ${user.lname} logged in `);

    await db.execute('UPDATE _carreerCondidats SET tkn = ? WHERE id = ?', [
      token.split('.')[2],
      user.id,
    ]);

    res.cookie('jwtCndTkn', token, {
      httpOnly: true,
    });
    // console.log(token);

    res.json('DONE');
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

app.get('/checkLg', async (req, res) => {
  jwt.verify(
    req.cookies.jwtCndTkn,
    String(process.env.sessionSecret),
    (err, decoded) => {
      if (!err) {
        res.json(`${req.cookies.cndDt.fname} ${req.cookies.cndDt.lname}`);
      } else {
        res.json(0);
      }
    }
  );
});

app.get('/reset', async (req, res) => {
  const [u] = await db.execute(
    `select id, email, concat(fname, " ", lname) as nme from _carreerCondidats where email = ?`,
    [req.query.x]
  );
  if (u.length) {
    const psw = [...Array(9)]
      .map(() =>
        'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@&()-=_+[]{}|:<>'.charAt(
          Math.floor(Math.random() * 69)
        )
      )
      .join('');

    const pswH = (await bcrypt.hash(psw, 10)).toString();

    await db.execute('UPDATE _carreerCondidats SET pswrd = ? WHERE id = ?', [
      pswH,
      u[0].id,
    ]);

    sendMail(
      u[0].email,
      'Reset Password',
      `<p>Bonjour ${u[0].nme},<br><br>Nous vous informons que votre mot de passe a été réinitialisé avec succès.<br>Voici votre nouveau mot de passe : <strong>${psw}</strong><br><br>Si vous n'êtes pas à l'origine de cette réinitialisation, veuillez nous contacter immédiatement.</p>
`
    );
    res.json({ message: 'done' });
  } else {
    res.json({ message: 'Email not found' });
  }
});

module.exports = app;
