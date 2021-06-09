const settings = global.SETTING;
const mongoose = require('mongoose');

var dbSet = "mongodb://" + settings.waterDBUsername;
dbSet += ":" + settings.waterDBPassword;
dbSet += "@" + settings.waterDBHost;
dbSet += ":"+ settings.waterDBPort + "/" + settings.waterDBName;

// mongoose.Promise = global.Promise;
const db = mongoose.createConnection(dbSet, {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false});

db.on('error', console.error.bind(console, '数据库错误:'));

module.exports = db;