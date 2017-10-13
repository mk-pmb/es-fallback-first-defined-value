/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';

var test = require('./test/lib_test.js');

function alwaysAccept() { return true; }
function neverAccept() { return false; }

test.eq("Acceptable first value (default)",
  (5
    ?| 23
    ?| 42
  ),
  5);

test.eq("Acceptable first value (alwaysAccept)",
  ( ?| alwaysAccept
    : 5
    : 23
    : 42
  ),
  5);

test.eq("Acceptable first value (neverAccept)", false,
  ( ?| neverAccept
    : 5
    : null
    : true
    : false
    // ^-- not accepted either, but it's the last value.
    //    works as with (undefined || false).
  )
  );








test.done();
