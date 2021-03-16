'use strict';

const async = require("async");

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  async.series([
    db.createTable.bind(db, 'users', users),
    db.createTable.bind(db, 'players', players),
    db.createTable.bind(db, 'games', games),
  ], callback);
};

exports.down = function(db, callback) {
  async.series([
    db.dropTable.bind(db, 'users'),
    db.dropTable.bind(db, 'games'),
    db.dropTable.bind(db, 'players'),
  ], callback);
};

exports._meta = {
  "version": 1
};

const users = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
  ifNotExists: true
};

const games = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false
    },
    name: {
      type: 'string',
    },
    started: {
      type: 'datetime'
    },
    host: {
      type: 'string',
    },
    running: {
      type: 'boolean',
    },
    seed: {
      type: 'string',
    },
    map_radius: {
      type: 'int',
    }
  },
  ifNotExists: true
};

const players = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false,
    },
    user_id: {
      type: 'string',
    },
    game_id: {
      type: 'string',
    },
    defeated: {
      type: 'boolean'
    },
    defeated_at: {
      type: 'datetime'
    }
  },
  ifNotExists: true
}

const tiles = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false,
    },
    x: {
      type: 'int',
    },
    y: {
      type: 'int',
    },
    tpye: {
      type: 'int',
    },
    orientation: {
      type: 'int',
    },
    building: {
      type: 'string',
    }
  },
  ifNotExists: true
}
