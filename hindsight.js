/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';

var test = require('./test/lib_test.js');

// Feature creep: Determine the validity of the next value by comparison.

function muchGreater(next, prev) { return next > (prev * 2); }

test.eq("Same comparison for whole chain", 23,
  ( ?| muchGreater
    : 5
    : 10
    : 23
    : 42
    : 9001
  )
  );

function divides(next, prev) { return ((prev % next) === 0); }

test.eq("Custom comparisons for each expression", 6,
  (undefined
    ?|: muchGreater   23
    ?|: muchGreater   42
    ?|: divides       6
    ?|: muchGreater   9001
  )
  );





test.done();
