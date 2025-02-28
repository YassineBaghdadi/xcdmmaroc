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

const { db } = require('./DB_cnx');
const { lg } = require('./lg');

app.use((req, res, next) => {
  jwt.verify(
    req.cookies.jwtCndTkn,
    String(process.env.sessionSecret),
    (err, decoded) => {
      if (err) {
        console.log('redirect to login page');

        res.redirect(`/login?next=${req.originalUrl}`);
      } else {
        next();
      }
    }
  );
});

app.use(
  express.static(path.join(__dirname, '../../frntEnd/career'), { index: false })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frntEnd/career', 'Profil.html'));
});

app.get('/info', async (req, res) => {
  try {
    var [info] = await db.execute(
      `select uniqID, pswrd, civilite, fname, lname, prflTtle, bd, nationality, familystatus, email, phone, linkedIn, address, zip, city, disponibility, actualFonction, 
      actualPost, actualSector, desiredSector, actualRegion, actualSalaire, desiredFonction, expYrs, desiredRegion, desiredSalaire, formation, etudLevel 
      from _carreerCondidats where id = ${req.cookies.cndDt.id}`
    );

    var [langs] = await db.execute(
      `select * from _carreerCondidatsLangs where cndidat = ${req.cookies.cndDt.id}`
    );
    // console.log(langs);

    var [skills] = await db.execute(
      `select * from _carreerCondidatsSkills where cndidat = ${req.cookies.cndDt.id}`
    );

    res.json({ info: info[0], langs: langs, skls: skills });
  } catch (error) {
    console.log(error);
    lg.error(error);
  }
});

app.post('/removeLang', async (req, res) => {
  await db.execute(
    `delete from _carreerCondidatsLangs where id = ${req.body.i}`
  );
  res.json('done');
});

app.post('/removeSKL', async (req, res) => {
  await db.execute(
    `delete from _carreerCondidatsSkills where id = ${req.body.i}`
  );
  res.json('done');
});

app.post('/addLang', async (req, res) => {
  var [old] = await db.execute(
    `select count(id) as c from _carreerCondidatsLangs where nme = "${req.body.n}"`
  );
  if (old[0].c) {
    return res.json(1);
  }
  await db.execute(
    `insert into _carreerCondidatsLangs (nme, lvl, cndidat, addedBy, addedDte) values("${req.body.n}", "${req.body.l}", ${req.cookies.cndDt.id}, "${req.cookies.cndDt.fname} ${req.cookies.cndDt.lname}", NOW())`
  );
  res.json('done');
});

app.post('/addSKL', async (req, res) => {
  await db.execute(
    `insert into _carreerCondidatsSkills (nme, cndidat) values("${req.body.n}", ${req.cookies.cndDt.id})`
  );
  res.json('done');
});

app.get('/getCV', async (req, res) => {
  const fileId = req.cookies.cndDt.id;

  try {
    const [rows] = await db.execute(
      'SELECT cv, cvEXT FROM _carreerCondidats WHERE id = ?',
      [fileId]
    );

    if (rows.length === 0) {
      return res.status(404).send('File not found');
    }

    const fileData = rows[0].cv;
    const fileExtension = rows[0].cvEXT;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="cv de ${req.cookies.cndDt.fname} ${req.cookies.cndDt.lname}.${fileExtension}"`
    );

    res.end(fileData, 'binary');
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).send('An error occurred while fetching the file');
  }
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

app.post('/uploadCV', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const fileData = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname).split('.')[1];

    await db.execute(
      'update _carreerCondidats set cv = ?, cvEXT = ? where id = ?',
      [fileData, fileExtension, req.cookies.cndDt.id]
    );

    res.send('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('An error occurred while uploading the file');
  }
});

app.post('/update', async (req, res) => {
  await db.execute(`update _carreerCondidats set
      civilite = "${req.body.civilite}",
      fname = "${req.body.firstName}",
      lname = "${req.body.lastName}",
      bd = "${req.body.birthDate}",
      nationality = "${req.body.nationality}",
      familystatus = "${req.body.maritalStatus}",
      phone = "${req.body.phone}",
      email = "${req.body.email}",
      linkedIn = "${req.body.linkedin}",
      address = "${req.body.address}",
      zip = "${req.body.zip}",
      city = "${req.body.city}",
      disponibility = "${req.body.availability}",
      actualFonction = "${req.body.functions}",
      desiredFonction = "${req.body.desiredFunctions}",
      prflTtle = "${req.body.title}",
      expYrs = "${req.body.experienceYears}",
      actualSector = "${req.body.sector}",
      desiredSector = "${req.body.desiredSector}",
      actualRegion = "${req.body.regionA}",
      desiredRegion = "${req.body.regionS}",
      actualSalaire = "${req.body.salaryA}",
      desiredSalaire = "${req.body.salaryS}",
      etudLevel = "${req.body.educationLevel}",
      formation = "${req.body.formation}"
      where id = ${req.cookies.cndDt.id}

    `);

  res.json(`updated`);
});

app.post('/changePic', upload.single('pc'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const fileData = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname).split('.')[1];

    await db.execute(
      'update _carreerCondidats set pic = ?, picEXT = ? where id = ?',
      [fileData, fileExtension, req.cookies.cndDt.id]
    );

    res.send('File uploaded successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('An error occurred while uploading the file');
  }
});

app.get('/getPrflPic', async (req, res) => {
  const fileId = req.params.id;

  try {
    const [rows] = await db.execute(
      'SELECT pic, picEXT FROM _carreerCondidats WHERE id = ?',
      [req.cookies.cndDt.id]
    );

    if (rows.length === 0) {
      return res.status(404).send('Image not found');
    }

    const imageData = rows[0].pic;
    const imageExtension = rows[0].picEXT;

    // Set the correct content type for the image
    res.setHeader('Content-Type', `image/${imageExtension}`);
    res.end(imageData, 'binary');
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('An error occurred while fetching the image');
  }
});

app.get(/^.*\.html$/, (req, res) => {
  res.redirect(301, '/');
});

app.get(/^.*\.js$/, (req, res) => {
  res.redirect(301, '/');
});

module.exports = app;
