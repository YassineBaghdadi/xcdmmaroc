const mysql = require('mysql2/promise');
require('dotenv').config();

var db = mysql.createPool({
  host: process.env.DB_host,
  user: process.env.DB_user,
  password: process.env.DB_pass,
  database: process.env.DB_name,
});

if (!db) {
  window.location.href = `/ERROR`;
}

module.exports = {
  db,
};
