/*jslint indent: 2, maxlen: 80 */
/* -*- tab-width: 2 -*- */
/*global define: true, module: true, require: true */
((typeof define === 'function') && define.amd ? define : function (factory) {
  'use strict';
  var m = ((typeof module === 'object') && module), e = (m && m.exports);
  if (e) { m.exports = (factory(require, e, m) || m.exports); }
//})(function (require) {
})(function () {
  'use strict';

  var EX = function (code) { return EX.pseudoTranspile(code); };


  EX.shim = function stopAtFirstAcceptable___TRANSPILE_SHIM(chk, funcs) {
    chk = (chk || function (x) { return (x !== undefined); });
    var idx, val;
    for (idx = 1; idx < funcs.length; idx += 1) {
      val = funcs[idx]();
      if (chk(val)) { break; }
    }
    return val;
  };


  function errIncompat() { throw new Error('Incompatible platform'); }

  function unindentFuncDef(func) {
    func = String(func);
    func.replace(/\n +(?=\}$)/, function (ind) {
      func = func.replace(new RegExp(ind, 'g'), '\n');
    });
    return func;
  }

  function pseudoTranspile(code) {
    // Currently not caring about AST and real parsing techniques,
    // just a quick hack to run simple examples.
    var inLines = code.split(/\n/), outLines = [],
      shimDef = unindentFuncDef(EX.shim), shimName = EX.shim.name;

    if (!shimDef.match(/\n +return /)) { errIncompat(); }
    shimName = (shimName
      || (shimDef.match(/\w+_\w+/) || false)[0]
      || errIncompat());

    function gate(ln) { outLines.push(gate[gate.mode](ln)); }
    gate.mode = 'scan';

    function expr2func(ex) { return 'function () { return ' + ex + '; },'; }

    gate.scan = function (ln) {
      if (shimDef && ln.match(/^\w/)) {
        outLines.push(shimDef);
        shimDef = null;
      }
      var m = ln.match(/^(\s*)(\(\s*|)\?\|/);
      if (!m) { return ln; }
      ln = ln.slice(m[0].length);
      gate.mode = 'exprList';
      m.until = '^' + (m[1] && ('\\s{0,' + m[1].length + '}')) + '\\)';
      gate.exprList.until = new RegExp(m.until, '');
      if (m[2]) { return m[1] + shimName  + '(' + ln.trim() + ', ['; }
      m.prev = outLines.pop();
      outLines.push(m.prev.match(/^\s*/)[0] + shimName + '(null, [');
      outLines.push(m.prev.replace(/\(/, '  ') + ',');
      return m[1] + expr2func(ln.trim());
    };

    gate.exprList = function el(ln) {
      if (ln.match(el.until)) {
        gate.mode = 'scan';
        return ln.replace(/(\S)/, ']$1');
      }
      var m = ln.match(/^(\s+)(:|\?\|)\s+/);
      if (!m) { return ln; }
      return m[1] + expr2func(ln.slice(m[0].length));
    };

    inLines.forEach(gate);
    return outLines.join('\n');
  }








  return pseudoTranspile;
});
