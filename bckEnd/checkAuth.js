const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

function isAuth(req, res, next) {
  // console.log('hhhhhhhhh');
  jwt.verify(
    req.cookies.jwtToken,
    String(process.env.sessionSecret),
    (err, decoded) => {
      if (err) {
        res.redirect(`/ERP/login?next:${next}`);
      } else {
        next();
      }
    }
  );
}

module.exports = { isAuth };
