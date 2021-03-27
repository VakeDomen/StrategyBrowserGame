'use strict';

const async = require("async");

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  const columns = ['id',               'tag',          'speed','food','wood','stone','ore','defense'];
  db.insert('tile_types', columns, [1, 'Plains',            20,   100,     0,      0,    0,     0], inserted);
  db.insert('tile_types', columns, [2, 'Forest',           -10,    80,   100,      0,    0,    10], inserted);
  db.insert('tile_types', columns, [3, 'Stone hills',      -30,    60,    40,     50,   10,    20], inserted);
  db.insert('tile_types', columns, [4, 'Wasteland',         30,    20,     0,      0,    0,     0], inserted);
  db.insert('tile_types', columns, [5, 'Stone plains',      10,    30,     0,    100,    0,    15], inserted);
  db.insert('tile_types', columns, [6, 'Mountain',         -50,    30,     0,     60,   30,    30], inserted);
  db.insert('tile_types', columns, [7, 'High mountain',    -80,    20,     0,     30,   80,    50], inserted);
  return null;
};

exports.down = function(db, callback) {
  async.series([], callback);
};
exports._meta = {
  "version": 1
};

const inserted = function() {
  console.log('Inserted entry!');
}
