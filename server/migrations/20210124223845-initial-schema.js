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
    db.createTable.bind(db, 'tiles', tiles),
    db.createTable.bind(db, 'army', army),
    db.createTable.bind(db, 'battalion', battalion),
  ], callback);
};

exports.down = function(db, callback) {
  async.series([
    db.dropTable.bind(db, 'users'),
    db.dropTable.bind(db, 'games'),
    db.dropTable.bind(db, 'players'),
    db.dropTable.bind(db, 'tiles'),
    db.dropTable.bind(db, 'army'),
    db.dropTable.bind(db, 'battalion'),
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
    color: {
      type: 'int',
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
    game_id: {
      type: 'string',
    },
    x: {
      type: 'int',
    },
    y: {
      type: 'int',
    },
    tile_type: {
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


const army = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false,
    },
    player_id: {
      type: 'string',
    },
    x: {
      type: 'int',
    },
    y: {
      type: 'int',
    },
    name: {
      type: 'string',
    },
  },
  ifNotExists: true
}

const battalion = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false,
    },
    army_id: {
      type: 'string',
    },
    size: {
      type: 'int',
    },
  },
  ifNotExists: true
}