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
    db.createTable.bind(db, 'events', events),
    db.createTable.bind(db, 'tile_types', tile_type),
    db.createTable.bind(db, 'army_inventory', army_inventory),
    db.createTable.bind(db, 'resources', resources),
    db.createTable.bind(db, 'base_types', base_type),
    db.createTable.bind(db, 'bases', bases),
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
    db.dropTable.bind(db, 'events'),
    db.dropTable.bind(db, 'tile_types'),
    db.dropTable.bind(db, 'army_inventory'),
    db.dropTable.bind(db, 'resources'),
    db.dropTable.bind(db, 'base_types'),
    db.dropTable.bind(db, 'bases'),
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
    favorable_terrain_level: {
      type: 'int',
    },
    orientation: {
      type: 'int',
    },
    base: {
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
    horse: {
      type: 'boolean',
      defaultValue: 0,
    },
    cart: {
      type: 'boolean',
      defaultValue: 0,
    },
    ARMOR: {
      type: 'int',
      defaultValue: 0,
    },
    WEAPON_2H: {
      type: 'int',
      defaultValue: 0,
    },
    WEAPON_1H: {
      type: 'int',
      defaultValue: 0,
    },
    OFF_HAND: {
      type: 'int',
      defaultValue: 0,
    },
    TOOL: {
      type: 'int',
      defaultValue: 0,
    },
  },
  ifNotExists: true
}

const events = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false,
    },
    game_id: {
      type: 'string',
    },
    player_id: {
      type: 'string',
    },
    event_type: {
      type: 'string',
    },
    trigger_time: {
      type: 'bigint',
      length: 20
    },
    body: {
      type: 'string',
    },
    handled: {
      type: 'boolean',
    }
  },
  ifNotExists: true
}

const tile_type = {
  columns: {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: false,
    },
    tag: {
      type: 'string',
    },
    speed: {
      type: 'int',
    },
    food: {
      type: 'int',
    },
    wood: {
      type: 'int',
    },
    stone: {
      type: 'int',
    },
    ore: {
      type: 'int',
    },
    defense: {
      type: 'int',
    }
  },
  ifNotExists: true
}

const army_inventory = {
  columns: {
    id: {
      type: 'string',
      primaryKey: true,
      autoIncrement: false,
    },
    player_id: {
      type: 'string',
    },
    army_id: {
      type: 'string',
    },
    food: {
      type: 'int',
      defaultValue: 0,
    },
    wood: {
      type: 'int',
      defaultValue: 0,
    },
    stone: {
      type: 'int',
      defaultValue: 0,
    },
    ore: {
      type: 'int',
      defaultValue: 0,
    },
    cart: {
      type: 'int',
      defaultValue: 0,
    },
    horse: {
      type: 'int',
      defaultValue: 0,
    },
    bow_T1: {
      type: 'int',
      defaultValue: 0,
    },
    bow_T2: {
      type: 'int',
      defaultValue: 0,
    },
    bow_T3: {
      type: 'int',
      defaultValue: 0,
    },
    armor_T1: {
      type: 'int',
      defaultValue: 0,
    },
    armor_T2: {
      type: 'int',
      defaultValue: 0,
    },
    armor_T3: {
      type: 'int',
      defaultValue: 0,
    },
    sword_T1: {
      type: 'int',
      defaultValue: 0,
    },
    sword_T2: {
      type: 'int',
      defaultValue: 0,
    },
    sword_T3: {
      type: 'int',
      defaultValue: 0,
    },
    pike_T1: {
      type: 'int',
      defaultValue: 0,
    },
    pike_T2: {
      type: 'int',
      defaultValue: 0,
    },
    pike_T3: {
      type: 'int',
      defaultValue: 0,
    },
    shield_T1: {
      type: 'int',
      defaultValue: 0,
    },
    shield_T2: {
      type: 'int',
      defaultValue: 0,
    },
    shield_T3: {
      type: 'int',
      defaultValue: 0,
    },
    tools_T1: {
      type: 'int',
      defaultValue: 0,
    },
    tools_T2: {
      type: 'int',
      defaultValue: 0,
    },
    tools_T3: {
      type: 'int',
      defaultValue: 0,
    },
  },
  ifNotExists: true
}

const resources = {
  columns: {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
    },
    tag: {
      type: 'string',
    },
    display_name: {
      type: 'string',
    },
    resource_type: {
      type: 'string',
    },
    equippable: {
      type: 'boolean',
    },
    attack: {
      type: 'int',
    },
    defense: {
      type: 'int',
    },
    speed: {
      type: 'int',
    },
    carry: {
      type: 'int',
    },
    weight: {
      type: 'int',
    },
    food: {
      type: 'int',
    },
    wood: {
      type: 'int',
    },
    stone: {
      type: 'int',
    },
    ore: {
      type: 'int',
    },
    build: {
      type: 'int',
    },
  },
  ifNotExists: true
}



const base_type = {
  columns: {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: false,
    },
    tag: {
      type: 'string',
    },
    display_name: {
      type: 'string',
    },
    build: {
      type: 'int',
      defaultValue: 0,
    },
    wood: {
      type: 'int',
      defaultValue: 0,
    },
    stone: {
      type: 'int',
      defaultValue: 0,
    },
    ore: {
      type: 'int',
      defaultValue: 0,
    },
    speed: {
      type: 'int',
      defaultValue: 0,
    },
    defense: {
      type: 'int',
      defaultValue: 0,
    },
    harvestable: {
      type: 'boolean',
      defaultValue: 0,
    },
    vision: {
      type: 'int',
      defaultValue: 2,
    }
  },
  ifNotExists: true
}

const bases = {
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
    base_type: {
      type: 'string',
    },
  },
  ifNotExists: true
}