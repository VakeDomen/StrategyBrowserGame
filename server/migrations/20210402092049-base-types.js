'use strict';

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
  const columns = ['id',               'tag',         'display_name',     'build','wood','stone', 'ore','speed', 'defense', 'harvestable', 'vision'];
  db.insert('base_types', columns, [1, 'town',        'Town',                5000,  2000,   2000,     0,     80,        40,             0,       3 ], inserted);
  db.insert('base_types', columns, [2, 'mil_outpost', 'Military outpost',    3000,  1300,   1000,   500,     50,        60,             0,       3 ], inserted);
  db.insert('base_types', columns, [3, 'res_outpost', 'Resource outpost',     200,   300,    300,     0,     30,        20,             1,       2 ], inserted);
  db.insert('base_types', columns, [4, 'tower',       'Watch tower',         1000,  1500,   1500,  1000,      0,         0,             0,       4 ], inserted);
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

