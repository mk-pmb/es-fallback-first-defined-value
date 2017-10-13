/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';
require('usnam-pmb');
var fs = require('fs'), transpile = require('./transpile.js'),
  srcFn = process.argv[2];
fs.readFile((srcFn || process.stdin.fd), 'UTF-8', function (err, code) {
  if (err) { throw err; }
  var pile = transpile(code);
  (pile.warnings || []).forEach(function (w) { console.error('W:', w); });
  process.stdout.write(pile.code);
});
