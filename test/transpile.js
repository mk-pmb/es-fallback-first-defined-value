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


  EX.shim = function stopAtFirstAcceptable___TRANSPILE_SHIM(dfltChk, items) {
    function isDefined(x) { return (x !== undefined); }
    var idx, item, chk, val, prev;
    if (prev !== undefined) { throw new Error('very strange bug'); }
    for (idx = 0; idx < items.length; idx += 1) {
      item = items[idx];
      chk = null;
      if (item.ifExpr) { chk = item.ifExpr(); }
      if (chk === null) { chk = dfltChk; }
      if (chk === null) { chk = isDefined; }
      if (typeof chk !== 'function') {
        throw new TypeError('Validity decider expression must ' +
          'evaluate to either null or a function');
      }
      //if (item.ifExpr) { console.error({ ifExprFunc: chk.name }); }
      // calculate the value expression only if we can check it.
      val = item.calc();
      if (chk(val, prev)) { break; }
      prev = val;
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

  function rxm(s, r) {
    var m = r.exec(s);
    if (!m) { return false; }
    m.before = s.slice(0, m.index);
    m.after = s.slice(m.index + m[0].length);
    return m;
  }

  function indent(i, s) { return i + s.replace(/(\n+)/g, '$1' + i); }

  function pseudoTranspile(code) {
    // Currently not caring about AST and real parsing techniques,
    // just a quick hack to run simple examples.
    var inLines = code.split(/\n/), outLines = [],
      shimDef = unindentFuncDef(EX.shim), shimName = EX.shim.name;

    if (!shimDef.match(/\n +return /)) { errIncompat(); }
    shimName = (shimName
      || (shimDef.match(/\w+_\w+/) || false)[0]
      || errIncompat());

    function gate(ln, idx) {
      gate.lnum = idx + 1;
      outLines.push(gate[gate.mode](ln));
    }
    gate.mode = 'scan';

    function expr2func(ex) { return 'function () {\n  return ' + ex + ';\n}'; }

    function expr2container(ex, opt) {
      code = '{ calc: ' + expr2func(ex);
      opt = (opt || false);
      if (opt.ifExpr) { code += ', ifExpr: ' + expr2func(opt.ifExpr); }
      return code + ' },';
    }

    gate.logMatch = function (ln, m, hint) {
      var where = gate.mode + '@' + gate.lnum;
      if (hint) { where += ' ' + hint; }
      if (m) {
        m = Object.assign([], m);
        delete m.index;
        delete m.input;
        delete m.before;
        delete m.after;
      }
      console.error(where, [ln], m);
    };

    gate.scan = function (ln) {
      if (shimDef && ln.match(/^\w/)) {
        outLines.push(shimDef);
        shimDef = null;
      }
      var m = rxm(ln, /^(\s*)(\(\)? *|)\?\|/);
      if (!m) { return ln; }
      m.ind = m[1];
      m.paren = m[2];
      //if (gate.lnum === 67) { gate.logMatch(ln, m); }
      gate.mode = 'exprList';
      gate.exprList.until = new RegExp('^' +
        (m.ind && ('\\s{0,' + m.ind.length + '}')) +
        '\\)', '');
      if (m.paren) { return m.ind + shimName  + '(' + m.after.trim() + ', ['; }
      while ((m.prev || '').match(/^\s*($|\/{2})/)) {
        m.prev = outLines.pop();
      }
      m = rxm(m.prev, /^(\s*)(\w[\w\.= ]*|)\(/);
      m.ind = m[1];
      m.stmt = m[2];
      gate.exprList.hadStmt = !!m.stmt;
      outLines.push(m.ind + m.stmt + shimName + '(null, [');
      outLines.push(indent(m.ind + '  ', expr2container(m.after)));
      return gate.exprList(ln);
    };

    gate.exprList = function el(ln) {
      if (ln.match(el.until)) {
        gate.mode = 'scan';
        if (el.hadStmt) { ln = ln.replace(/^ {2}/, ''); }
        return ln.replace(/(\S)/, ']$1');
      }
      var m = rxm(ln, /^(\s+):\s*/);
      if (m) { return indent(m[1], expr2container(m.after)); }

      m = rxm(ln, /^(\s+)\?\|(?=\.([a-z]\w*)|)\s*/);
      if (m) {
        m.ind = m[1];
        m.prop = m[2];
        if (m.prop === 'if') {
          m.prop = rxm(m.after, /^\.if\(([ -'\*-~]+)\)\s*/);
          if (m.prop) {
            //gate.logMatch(ln, m.prop);
            m.ifExpr = m.prop[1];
            return indent(m.ind, expr2container(m.prop.after,
              { ifExpr: m.ifExpr }));
          }
        }
        return indent(m.ind, expr2container(m.after));
      }

      return ln;
    };

    inLines.forEach(gate);
    return outLines.join('\n');
  }








  return pseudoTranspile;
});
