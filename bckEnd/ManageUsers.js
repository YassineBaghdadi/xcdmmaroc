const express = require("express");
const app = express.Router();
// const { isAuth } = require('./checkAuth');
const { db } = require("./DB_cnx");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const bcrypt = require("bcryptjs");
const { lg } = require("./lg");
// router.use(isAuth);

app.post("/new", async (req, res) => {
  try {
    const { usrname, pswrd, fname, lname } = req.body;

    const hashedPassword = await bcrypt.hash(pswrd, 10);
    await db.execute(`insert into _Users(fname, lname, usrNme, pwd) values(

            "${fname}", "${lname}", "${usrname}", "${hashedPassword}"
    
        )`);

    res.status(200).json({ message: "The User Saved ." });
  } catch (error) {
    log.error(error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

module.exports = app;
