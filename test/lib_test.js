/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

require('usnam-pmb');

var eq = require('equal-pmb');

function test(n, f) { test.named(n, f); }
Object.assign(test, eq.named);
test.sideEffects = require('equal-pmb/util/side-effects.js');
test.random = require('equal-pmb/util/random.js')({
  onRand: function () { test.sideEffects.add('randomnessPoolCost'); },
});


test.fail = function (why) { throw new Error(why); };


test.done = function () {
  test.sideEffects.none();
  console.log('+OK test passed');
};






module.exports = test;
