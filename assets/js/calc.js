/* Measure Twice — shared calculator engine.
 *
 * A calculator supplies a field list and a pure compute() function; this file
 * handles rendering, unit switching, feet-and-inches parsing, validation,
 * shareable URLs, copy and print. compute() never touches the DOM, so the
 * arithmetic can be unit-tested in Node (see tests/math.test.js). */
(function (global) {
  'use strict';

  /* Units, parsing and formatting live in units.js so the Node math tests can
     require them without a DOM. */
  var MT = global.MTUnits;
  var U = MT.U;
  var fmt = MT.fmt;
  var parseLength = MT.parseLength;
  var parseNumber = MT.parseNumber;
  var round = fmt.round;
  var M_PER_FT = U.M_PER_FT;
  var M_PER_IN = U.M_PER_IN;

  /* ---------- registry ---------- */

  var registry = {};

  function register(def) {
    registry[def.id] = def;
    return def;
  }

  /* ---------- preferences ---------- */

  var PREF_KEY = 'measuretwice.units';

  function readUnits() {
    try {
      var stored = global.localStorage.getItem(PREF_KEY);
      if (stored === 'metric' || stored === 'imperial') return stored;
    } catch (err) { /* storage blocked; fall through to the default */ }
    return 'imperial';
  }

  function writeUnits(system) {
    try { global.localStorage.setItem(PREF_KEY, system); } catch (err) { /* not fatal */ }
  }

  /* ---------- rendering ---------- */

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === 'text') node.textContent = attrs[key];
      else if (key === 'html') node.innerHTML = attrs[key];
      else if (attrs[key] !== null && attrs[key] !== undefined && attrs[key] !== false) {
        node.setAttribute(key, attrs[key]);
      }
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  /* Several field properties differ between unit systems. Any of them may be
     given as a plain value or as { imperial: …, metric: … }. */
  function pick(value, system) {
    if (value && typeof value === 'object' && !Array.isArray(value) &&
        ('imperial' in value || 'metric' in value)) {
      return system === 'metric' ? value.metric : value.imperial;
    }
    return value;
  }

  function labelFor(field, system) { return pick(field.label, system); }
  function hintFor(field, system) { return pick(field.hint, system); }
  function optionsFor(field, system) { return pick(field.options, system) || []; }

  function unitTagFor(field, system) {
    if (field.type === 'length') return system === 'metric' ? 'm' : 'ft';
    if (field.type === 'smallLength') return system === 'metric' ? 'cm' : 'in';
    if (field.type === 'percent') return '%';
    if (field.type === 'money') return pick(field.per, system) || '';
    return pick(field.unit, system) || '';
  }

  function mount(id, host) {
    var def = registry[id];
    if (!def) throw new Error('No calculator registered as "' + id + '"');

    var system = readUnits();
    var inputs = {};
    var state = {};

    var head = el('div', { 'class': 'calc__head' }, [
      el('h2', { text: def.title })
    ]);

    var toggle = el('div', { 'class': 'unit-toggle', role: 'group', 'aria-label': 'Unit system' });
    var btnImp = el('button', { type: 'button', text: 'Feet / inches' });
    var btnMet = el('button', { type: 'button', text: 'Metric' });
    toggle.appendChild(btnImp);
    toggle.appendChild(btnMet);
    head.appendChild(toggle);

    var body = el('div', { 'class': 'calc__body' });
    var results = el('div', { 'class': 'results', id: 'results', 'aria-live': 'polite', hidden: 'hidden' });

    var form = el('form', { 'class': 'calc__form', novalidate: 'novalidate' });
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    /* --- build the fields --- */
    var groups = {};
    (def.fields || []).forEach(function (field) {
      var groupName = field.group || 'main';
      if (!groups[groupName]) {
        groups[groupName] = el('div', { 'class': 'field-grid' });
        if (groupName !== 'main') {
          form.appendChild(el('h3', { text: groupName, style: 'font-size:.95rem;margin:.4rem 0 0' }));
        }
        form.appendChild(groups[groupName]);
      }
      groups[groupName].appendChild(buildField(field));
    });

    function buildField(field) {
      var fid = 'f-' + field.key;

      if (field.type === 'radio') {
        var set = el('fieldset', { 'class': 'field-set' }, [el('legend', { id: fid + '-legend', text: labelFor(field, system) })]);
        var seg = el('div', { 'class': 'seg' });
        optionsFor(field, system).forEach(function (opt, i) {
          var input = el('input', {
            type: 'radio', name: fid, value: opt.value,
            checked: (state[field.key] === undefined ? i === 0 : state[field.key] === opt.value) ? 'checked' : null
          });
          input.addEventListener('change', recompute);
          seg.appendChild(el('label', {}, [input, document.createTextNode(' ' + opt.label)]));
        });
        set.appendChild(seg);
        if (field.hint) set.appendChild(el('p', { 'class': 'hint', text: hintFor(field, system) }));
        inputs[field.key] = { kind: 'radio', name: fid, field: field };
        return set;
      }

      var wrapper = el('div', { 'class': 'field' });
      wrapper.appendChild(el('label', { 'for': fid, text: labelFor(field, system) }));

      var control;
      if (field.type === 'select') {
        control = el('select', { id: fid });
        optionsFor(field, system).forEach(function (opt) {
          control.appendChild(el('option', { value: opt.value, text: opt.label }));
        });
        if (pick(field.value, system) !== undefined) control.value = pick(field.value, system);
        wrapper.appendChild(control);
      } else {
        var tag = unitTagFor(field, system);
        control = el('input', {
          type: 'text',
          id: fid,
          inputmode: field.type === 'length' || field.type === 'smallLength' ? 'text' : 'decimal',
          autocomplete: 'off',
          placeholder: pick(field.placeholder, system) || '',
          value: pick(field.value, system) !== undefined ? pick(field.value, system) : ''
        });
        var iw = el('div', { 'class': 'input-wrap' }, [control]);
        if (tag) iw.appendChild(el('span', { 'class': 'unit-tag', 'aria-hidden': 'true', text: tag }));
        wrapper.appendChild(iw);
      }

      control.addEventListener('input', recompute);
      control.addEventListener('change', recompute);

      if (field.hint) wrapper.appendChild(el('p', { 'class': 'hint', id: fid + '-hint', text: hintFor(field, system) }));
      wrapper.appendChild(el('p', { 'class': 'err', id: fid + '-err', role: 'alert' }));

      inputs[field.key] = { kind: 'input', node: control, field: field, wrapper: wrapper };
      return wrapper;
    }

    /* --- actions --- */
    var copyBtn = el('button', { type: 'button', 'class': 'btn btn--ghost btn--sm', text: 'Copy results' });
    var printBtn = el('button', { type: 'button', 'class': 'btn btn--ghost btn--sm', text: 'Print' });
    var resetBtn = el('button', { type: 'button', 'class': 'btn btn--ghost btn--sm', text: 'Reset' });
    var actions = el('div', { 'class': 'calc__actions' }, [copyBtn, printBtn, resetBtn]);

    body.appendChild(form);
    body.appendChild(actions);

    var shell = el('section', { 'class': 'calc' }, [head, body, results]);
    host.appendChild(shell);

    /* --- reading values --- */

    function readField(key) {
      var entry = inputs[key];
      var field = entry.field;

      if (entry.kind === 'radio') {
        var checked = form.querySelector('input[name="' + entry.name + '"]:checked');
        return checked ? checked.value : optionsFor(field, system)[0].value;
      }

      var raw = entry.node.value;

      if (field.type === 'select') return raw;
      if (field.type === 'length') return parseLength(raw, system, 'big');
      if (field.type === 'smallLength') return parseLength(raw, system, 'small');
      return parseNumber(raw);
    }

    function setError(key, message) {
      var entry = inputs[key];
      if (!entry || entry.kind === 'radio') return;
      var errNode = document.getElementById('f-' + key + '-err');
      if (errNode) errNode.textContent = message || '';
      entry.node.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function collect() {
      var values = {};
      var missing = 0;
      var invalid = 0;

      (def.fields || []).forEach(function (field) {
        var value = readField(field.key);
        values[field.key] = value;

        if (field.type === 'select' || field.type === 'radio') return;

        var blank = inputs[field.key].node.value.trim() === '';
        if (blank) {
          setError(field.key, '');
          if (!field.optional) missing++;
          if (field.type === 'percent' || field.type === 'money' || field.optional) values[field.key] = 0;
          return;
        }
        if (!isFinite(value)) {
          setError(field.key, 'Enter a number');
          invalid++;
          return;
        }
        if (value < 0) {
          setError(field.key, 'Must be zero or more');
          invalid++;
          return;
        }
        if (value === 0 && !field.optional && field.type !== 'percent') {
          setError(field.key, 'Must be more than zero');
          invalid++;
          return;
        }
        setError(field.key, '');
      });

      return { values: values, ready: missing === 0 && invalid === 0 };
    }

    /* --- results --- */

    var lastOutput = null;

    function renderResults(out) {
      results.innerHTML = '';

      if (out.headline) {
        results.appendChild(el('div', { 'class': 'headline' }, [
          el('span', { 'class': 'num', text: out.headline.value }),
          el('span', { 'class': 'unit', text: out.headline.unit || '' }),
          el('span', { 'class': 'what', text: out.headline.label || '' })
        ]));
      }

      (out.tables || []).forEach(function (table) {
        var thead = el('thead', {}, [
          el('tr', {}, (table.cols || ['Item', 'Quantity']).map(function (col, i) {
            return el('th', { 'class': i === 0 ? '' : 'num', scope: 'col', text: col });
          }))
        ]);

        var tbody = el('tbody', {}, (table.rows || []).map(function (row) {
          var cells = row.cells.map(function (cell, i) {
            var td = el('td', { 'class': i === 0 ? '' : 'num' });
            td.appendChild(document.createTextNode(cell));
            if (i === 0 && row.sub) td.appendChild(el('span', { 'class': 'sub', text: row.sub }));
            return td;
          });
          return el('tr', {}, cells);
        }));

        var parts = [el('caption', { text: table.caption || '' }), thead, tbody];
        if (table.foot) {
          parts.push(el('tfoot', {}, [
            el('tr', {}, table.foot.map(function (cell, i) {
              return el('td', { 'class': i === 0 ? '' : 'num', text: cell });
            }))
          ]));
        }
        results.appendChild(el('div', { 'class': 'table-scroll' }, [el('table', { 'class': 'res-table' }, parts)]));
      });

      if (out.notes && out.notes.length) {
        results.appendChild(el('ul', { 'class': 'notes' }, out.notes.map(function (note) {
          return el('li', { text: note });
        })));
      }

      results.hidden = false;
    }

    function asText(out) {
      var lines = [def.title, new Array(def.title.length + 1).join('='), ''];
      if (out.headline) {
        lines.push(out.headline.label + ': ' + out.headline.value + ' ' + (out.headline.unit || ''), '');
      }
      (out.tables || []).forEach(function (table) {
        if (table.caption) lines.push(table.caption);
        (table.rows || []).forEach(function (row) {
          lines.push('  ' + row.cells.join('  |  '));
        });
        if (table.foot) lines.push('  ' + table.foot.join('  |  '));
        lines.push('');
      });
      (out.notes || []).forEach(function (note) { lines.push('* ' + note); });
      lines.push('', 'Calculated with Measure Twice — ' + global.location.href);
      return lines.join('\n');
    }

    function syncUrl(values) {
      if (!global.history || !global.history.replaceState) return;
      var params = new URLSearchParams();
      params.set('u', system === 'metric' ? 'm' : 'i');
      Object.keys(inputs).forEach(function (key) {
        var entry = inputs[key];
        var raw = entry.kind === 'radio' ? String(values[key]) : entry.node.value;
        if (raw !== '' && raw !== null && raw !== undefined) params.set(key, raw);
      });
      global.history.replaceState(null, '', global.location.pathname + '?' + params.toString());
    }

    function recompute() {
      var read = collect();
      if (!read.ready) {
        results.hidden = true;
        lastOutput = null;
        return;
      }
      var ctx = {
        system: system,
        imperial: system !== 'metric',
        fmt: fmt,
        U: U
      };
      var out;
      try {
        out = def.compute(read.values, ctx);
      } catch (err) {
        results.hidden = true;
        lastOutput = null;
        return;
      }
      lastOutput = out;
      renderResults(out);
      syncUrl(read.values);
    }

    /* --- unit switching --- */

    function relabelUnits() {
      (def.fields || []).forEach(function (field) {
        var entry = inputs[field.key];
        if (!entry) return;

        if (entry.kind === 'radio') {
          var legend = form.querySelector('#f-' + field.key + '-legend');
          if (legend) legend.textContent = labelFor(field, system);
          return;
        }

        var labelNode = entry.wrapper.querySelector('label');
        if (labelNode) labelNode.textContent = labelFor(field, system);

        var hintNode = entry.wrapper.querySelector('.hint');
        if (hintNode && field.hint) hintNode.textContent = hintFor(field, system);

        var tag = entry.wrapper.querySelector('.unit-tag');
        if (tag) tag.textContent = unitTagFor(field, system);

        /* Selects whose options differ per system are rebuilt, keeping the
           chosen position so a switch does not silently change the answer. */
        if (field.type === 'select' && field.options &&
            !Array.isArray(field.options)) {
          var index = entry.node.selectedIndex;
          entry.node.innerHTML = '';
          optionsFor(field, system).forEach(function (opt) {
            entry.node.appendChild(el('option', { value: opt.value, text: opt.label }));
          });
          entry.node.selectedIndex = Math.min(Math.max(index, 0), entry.node.options.length - 1);
        }
      });
      btnImp.setAttribute('aria-pressed', String(system !== 'metric'));
      btnMet.setAttribute('aria-pressed', String(system === 'metric'));
    }

    /* Switching units converts what is already typed rather than throwing it
       away — retyping every dimension is how you lose a user. */
    function switchTo(next) {
      if (next === system) return;
      (def.fields || []).forEach(function (field) {
        var conv = field.convert;
        if (conv && field.type !== 'length' && field.type !== 'smallLength') {
          var numEntry = inputs[field.key];
          var current = parseNumber(numEntry.node.value);
          if (isFinite(current)) {
            var moved = next === 'metric' ? conv.toMetric(current) : conv.toImperial(current);
            numEntry.node.value = String(round(moved, 3));
          }
          return;
        }
        if (field.type !== 'length' && field.type !== 'smallLength') return;
        var entry = inputs[field.key];
        var raw = entry.node.value.trim();
        if (!raw) return;
        var size = field.type === 'smallLength' ? 'small' : 'big';
        var metres = parseLength(raw, system, size);
        if (!isFinite(metres)) return;
        var converted;
        if (next === 'metric') {
          converted = size === 'small' ? metres * 100 : metres;
        } else {
          converted = size === 'small' ? metres / M_PER_IN : metres / M_PER_FT;
        }
        entry.node.value = String(round(converted, size === 'small' ? 2 : 3));
      });
      system = next;
      writeUnits(system);
      relabelUnits();
      recompute();
    }

    btnImp.addEventListener('click', function () { switchTo('imperial'); });
    btnMet.addEventListener('click', function () { switchTo('metric'); });

    /* --- restore from the URL so results are shareable --- */
    (function restore() {
      var params = new URLSearchParams(global.location.search);
      if (params.get('u') === 'm') system = 'metric';
      if (params.get('u') === 'i') system = 'imperial';
      Object.keys(inputs).forEach(function (key) {
        if (!params.has(key)) return;
        var entry = inputs[key];
        var value = params.get(key);
        if (entry.kind === 'radio') {
          var radio = form.querySelector('input[name="' + entry.name + '"][value="' + CSS.escape(value) + '"]');
          if (radio) radio.checked = true;
        } else {
          entry.node.value = value;
        }
      });
    })();

    copyBtn.addEventListener('click', function () {
      if (!lastOutput) return;
      var text = asText(lastOutput);
      var done = function () {
        copyBtn.textContent = 'Copied';
        global.setTimeout(function () { copyBtn.textContent = 'Copy results'; }, 1600);
      };
      if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
        global.navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });

    function fallbackCopy(text, done) {
      var area = el('textarea', { style: 'position:fixed;opacity:0' });
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); done(); } catch (err) { /* clipboard unavailable */ }
      area.remove();
    }

    printBtn.addEventListener('click', function () { global.print(); });

    resetBtn.addEventListener('click', function () {
      (def.fields || []).forEach(function (field) {
        var entry = inputs[field.key];
        if (entry.kind === 'radio') {
          var first = form.querySelector('input[name="' + entry.name + '"]');
          if (first) first.checked = true;
        } else {
          var reset = pick(field.value, system);
          entry.node.value = reset !== undefined ? reset : '';
        }
        setError(field.key, '');
      });
      recompute();
    });

    relabelUnits();
    recompute();
    return { recompute: recompute };
  }

  function autoMount() {
    var host = document.querySelector('[data-calc]');
    if (!host) return;
    mount(host.getAttribute('data-calc'), host);
  }

  global.Calc = {
    register: register,
    mount: mount,
    U: U,
    fmt: fmt,
    parseLength: parseLength,
    parseNumber: parseNumber,
    registry: registry
  };

  /* Deferred scripts execute at readyState 'interactive', before
     DOMContentLoaded — and before the per-calculator files that run after this
     one. Waiting for the event is what guarantees every definition has
     registered by the time we mount. */
  if (document.readyState === 'complete') {
    autoMount();
  } else {
    document.addEventListener('DOMContentLoaded', autoMount);
  }
})(window);
