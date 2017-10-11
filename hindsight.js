/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';

function testEq(name, actual, expected) {
  if (actual === expected) { return; }
  throw new Error(['Test "' + name + '":', actual, '!==', expected].join(' '));
}

// Feature creep: Determine the validity of the next value by comparison.

function muchGreater(next, prev) { return next > (prev * 2); }

testEq("Same comparison for whole chain", 23,
  ( ?| muchGreater
    : 5
    : 10
    : 23
    : 42
    : 9001
  )
  );

function divides(next, prev) { return ((prev % next) === 0); }

testEq("Custom comparisons for each expression", 6,
  (undefined
    ?|.if(muchGreater)  23
    ?|.if(muchGreater)  42
    ?|.if(divides)      6
    ?|.if(muchGreater)  9001
  )
  );





console.log('+OK test passed');
