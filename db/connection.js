const monk = require('monk');
const db = monk('localhost/nodeAuth');

module.exports = db;

