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

app.use(
  express.static(path.join(__dirname, '../frntEnd/Pblc'), { index: false })
);

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '../frntEnd/Pblc', 'index.html'));
});

app.get('/getName', async (req, res) => {
  const [nme] = await db.execute(
    `select concat(fname, " ", lname) as nme from _Users where id = ${req.cookies.usdt.id}`
  );
  res.send(nme[0].nme);
});

module.exports = app;
