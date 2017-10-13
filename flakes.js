/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: ? -*- */
'use strict';

// Suppose several clouds that can produce snowflakes,
// and a robot that shall pick a good one according to
// its user's rules. However, due to their individuality,
// different sets of rules must be applied for them,
// so we can't easily use just one decider function.

function cloud1() { return { icon: '\u2744',  color: 'snow' }; }
function cloud2() { return { icon: '\u2745',  color: 'white' }; }
function cloud3() { return { icon: '\u2746',  color: 'white' }; }
function cloud4() { return { icon: '*',       color: 'azure' }; }
function cloud5() { return { icon: '\u2744',  color: 'white' }; }
function cloud6() { return { icon: '\u2745',  color: 'oldlace' }; }
function cloud7() { return { icon: '\u2746',  color: 'ivory' }; }
function cloud8() { return { icon: '*',       color: 'snow' }; }
function cloud9() { return { icon: '*',       color: 'white' }; }

function pureWhite(sf) { return (sf.color === 'white'); }
function colorful(sf) { return (sf.color !== 'white'); }
function codepoint(sf) { return sf.icon.codePointAt(0); }
codepoint.ascii = function (sf) { return (codepoint(sf) < 128); };
codepoint.odd = function (sf) { return codepoint(sf) % 2; };
codepoint.even = function (sf) { return !codepoint.odd(sf); };
function dontBotherMe() { throw new Error('bothered'); }
function auroraBorealis() { throw new Error("I don't produce snow."); }

var test = require('./test/lib_test.js');

test.deepEq("First acceptable snowflake",
  //§pseudo-method-if
  (undefined        // <- redundant   // [1]
    ?|: pureWhite           cloud1()  // [2]
    ?|: colorful            cloud2()
    ?|: colorful            cloud3()
    ?|  undefined   // <- just to show you can mix them.
    ?|: (codepoint.odd)     cloud4()
    ?|: (codepoint.odd)     cloud5()
    ?|: (codepoint.even)    cloud6()
    ?|: ((Date.now() % 3) ? codepoint.odd : pureWhite)   cloud7()
    ?|: (codepoint.ascii)   cloud8()  // [3]
    ?|: dontBotherMe        cloud9()  // [4]
    ?|: colorful            auroraBorealis()
    ?|  { error: "Couldn't find any. :-(" }
  ),
  //§
  cloud8());

/*
  [1] An initial undefined is implied if ?|: ) is encountered with no
      previous expression.
  [2] `?|: ` must be followed immediately with a decider function
      expression (DFE), which can be either an identifier, or an
      expression in parens.
      The DFE determines whether the _next_ value in the chain
      is considered acceptable. The DFE must evaluate to either
      a function, or null = use default criteria.
      Any other result is a runtime Error because probably your
      lookup failed, e.g. codepoint.off instead of .odd.
  [3] This matches, so evaluation should stop here. Therefore, …
  [4] … this decider shouldn't be invoked.
*/

test.err("Evaluate DFE first", function () {
  return (
    ?|: (codepoint.evem)  cloud4()
    // ^-- Due to the typo, there's no way we could decide the
    //    result of cloud4() so don't waste CPU cycles on it.
    );
}, 'TypeError: Criterion must be either null or a function.');


test.err("… then the value, then decide", function () {
  return (
    ?|: dontBotherMe  [ test.sideEffects.args('arrayLiteral')('bother') ]
    // ^-- This time the DFE produces a valid function,
    //    so the array literal is evaluated (no problem yet)
    //    and then checked (which throws an Error).
    ?|  { error: 'dontBotherMe should have thrown' }
    );
}, 'Error: bothered');
test.sideEffects.had({ arrayLiteral: ['bother'] });


test.eq("Acceptable value at start of chain",
  (42
    // ^-- This matches, so the next DFE doesn't matter:
    ?|: (codepoint.evem)  cloud4()
    ?|: dontBotherMe      auroraBorealis()
  ),
  42);


function alwaysAccept() { return true; }
function neverAccept() { return false; }

test.eq("Winning without acceptance",
  ( ?|: neverAccept   0
    // Since the previous item was the implied "undefined",
    // the chain's current value becomes "0".
    // However, since it's not accepted, the chain continues:
    ?|: neverAccept   false
    // Now the chain's current is "false". It wasn't accepted either,
    // but it's the last value in the chain, so it wins as with
    // (undefined || 0 || false).
  ),
  false);


test.eq("Acceptable undefined",
  ( ?|: neverAccept   [ test.sideEffects.args('arrayLiteral')('undef') ]
    ?|: alwaysAccept  undefined
    ?|: dontBotherMe  auroraBorealis()
  ),
  undefined);
test.sideEffects.had({ arrayLiteral: ['undef'] });







test.done();
