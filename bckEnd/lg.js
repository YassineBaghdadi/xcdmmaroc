const path = require("path");
const winston = require("winston");

const { combine, timestamp, printf } = winston.format;
console.log(path.join(__dirname, "../../ERP.log"));
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});
const lg = winston.createLogger({
  level: "info",
  format: combine(timestamp(), customFormat),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "../../.ERP.log"),
    }),
    new winston.transports.Console(),
  ],
});

module.exports = {
  lg,
};
