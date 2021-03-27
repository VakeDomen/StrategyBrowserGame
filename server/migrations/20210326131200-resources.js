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
  const columns = [                      'tag',   'display_name', 'resource_type', 'equippable', 'attack',  'defense',  'speed',  'carry', 'weight', 'food', 'wood',  'stone', 'ore', 'build'];
  db.insert('resources', columns, [     'food',           'Food',           'RAW',            0,        0,          0,        0,        0,        1,      0,      0,        0,      0,      0], inserted);
  db.insert('resources', columns, [     'wood',           'Wood',           'RAW',            0,        0,          0,        0,        0,        3,      0,      0,        0,      0,      0], inserted);
  db.insert('resources', columns, [    'stone',          'Stone',           'RAW',            0,        0,          0,        0,        0,        5,      0,      0,        0,      0,      0], inserted);
  db.insert('resources', columns, [      'ore',            'Ore',           'RAW',            0,        0,          0,        0,        0,        5,      0,      0,        0,      0,      0], inserted);
  
  db.insert('resources', columns, [     'cart',           'Cart',     'TRANSPORT',            1,        0,          0,       -4,      100,       30,      0,    150,       10,     20,      0], inserted);
  db.insert('resources', columns, [    'horse',          'Horse',     'TRANSPORT',            1,        0,          0,       10,       10,       20,      0,      0,        0,      0,      0], inserted);
  
  db.insert('resources', columns, [ 'armor_T1',     'Mail armor',         'ARMOR',            1,        0,          1,       -1,        0,        3,      0,      0,        0,     15,      0], inserted);
  db.insert('resources', columns, [ 'armor_T2',    'Scale armor',         'ARMOR',            1,        0,          2,       -2,       -5,        5,      0,      0,        0,     25,      0], inserted);
  db.insert('resources', columns, [ 'armor_T3',    'Plate armor',         'ARMOR',            1,        0,          4,       -4,      -10,        7,      0,      0,        0,     40,      0], inserted);
  
  db.insert('resources', columns, [   'bow_T1',      'Crude bow',     'WEAPON_2H',            1,        1,          0,       -1,        0,        3,      0,     10,        0,      0,      0], inserted);
  db.insert('resources', columns, [   'bow_T2',    'Recurve bow',     'WEAPON_2H',            1,        2,          0,       -1,        0,        3,      0,     20,        0,      5,      0], inserted);
  db.insert('resources', columns, [   'bow_T3',        'Longbow',     'WEAPON_2H',            1,        3,          0,        0,        0,        3,      0,     30,        0,     10,      0], inserted);
  
  db.insert('resources', columns, [ 'sword_T1',     'Shortsword',     'WEAPON_1H',            1,        2,          1,       -1,        0,        3,      0,      0,        0,     10,      0], inserted);
  db.insert('resources', columns, [ 'sword_T2',      'Longsword',     'WEAPON_1H',            1,        3,          1,       -1,        0,        3,      0,      0,        0,     20,      0], inserted);
  db.insert('resources', columns, [ 'sword_T3',     'Zweihander',     'WEAPON_2H',            1,        7,          1,        0,        0,        3,      0,      0,        0,     30,      0], inserted);
  
  db.insert('resources', columns, [  'pike_T1',           'Pike',     'WEAPON_1H',            1,        2,          0,        0,        0,        2,      0,     10,        0,      0,      0], inserted);
  db.insert('resources', columns, [  'pike_T2',        'Halberd',     'WEAPON_1H',            1,        3,          0,        0,        0,        2,      0,     20,        0,     10,      0], inserted);
  db.insert('resources', columns, [  'pike_T3',        'Poleaxe',     'WEAPON_2H',            1,        8,          0,        0,        0,        3,      0,     30,        0,     20,      0], inserted);
  
  db.insert('resources', columns, ['shield_T1',        'Buckler',      'OFF_HAND',            1,        0,          1,       -1,        0,        3,      0,     10,        0,      0,      0], inserted);
  db.insert('resources', columns, ['shield_T2',    'Kite shield',      'OFF_HAND',            1,        0,          2,       -1,        0,        3,      0,     20,        0,     10,      0], inserted);
  db.insert('resources', columns, ['shield_T3',   'Tower shield',      'OFF_HAND',            1,        0,          3,       -2,        0,        3,      0,     30,        0,     15,      0], inserted);
  
  db.insert('resources', columns, [ 'tools_T1',    'Basic tools',          'TOOL',            1,        0,          0,        0,        0,        1,      0,      5,        0,      0,      1], inserted);
  db.insert('resources', columns, [ 'tools_T2', 'Advanced tools',          'TOOL',            1,        0,          0,        0,        0,        1,      0,     15,        0,      5,      2], inserted);
  db.insert('resources', columns, [ 'tools_T3',  'Artisan tools',          'TOOL',            1,        0,          0,        0,        0,        1,      0,     25,        0,     10,      3], inserted);
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
