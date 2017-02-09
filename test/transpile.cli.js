/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';
var fs = require('fs'), transpile = require('./transpile.js'),
  srcFn = process.argv[2];
fs.readFile((srcFn || process.stdin.fd), 'UTF-8', function (err, code) {
  if (err) { throw err; }
  process.stdout.write(transpile(code));
});
