const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.url = dbConfig.url

db.user = require("./user.model");
db.role = require("./role.model");
db.otp = require("./otp.model");

db.ROLES = ["client", "admin"];

module.exports = db;