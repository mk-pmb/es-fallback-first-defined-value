/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';

function testEq(name, actual, expected) {
  if (actual === expected) { return; }
  throw new Error(['Test "' + name + '":', actual, '!==', expected].join(' '));
}

function alwaysAccept() { return true; }
function neverAccept() { return false; }

testEq("Acceptable first value (default)", 5,
  (5
    ?| 23
    ?| 42
  )
  );

testEq("Acceptable first value (alwaysAccept)", 5,
  ( ?| alwaysAccept
    : 5
    : 23
    : 42
  )
  );

testEq("Acceptable first value (neverAccept)", false,
  ( ?| neverAccept
    : 5
    : null
    : true
    : false
    // ^-- not accepted either, but it's the last value.
    //    works as with (undefined || false).
  )
  );








console.log('+OK test passed');
