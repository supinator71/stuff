/* Measure Twice — unit conversion, input parsing and number formatting.
 * Loaded in the browser and required directly by the Node math tests, so it
 * must not touch the DOM. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MTUnits = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var M_PER_FT = 0.3048;
  var M_PER_IN = 0.0254;
  var M3_PER_YD3 = 0.764554857984;   // exactly 27 ft³
  var L_PER_GAL = 3.785411784;       // US liquid gallon
  var KG_PER_LB = 0.45359237;

  var U = {
    M_PER_FT: M_PER_FT,
    M_PER_IN: M_PER_IN,
    M3_PER_YD3: M3_PER_YD3,
    L_PER_GAL: L_PER_GAL,
    KG_PER_LB: KG_PER_LB,

    ftToM: function (ft) { return ft * M_PER_FT; },
    inToM: function (v) { return v * M_PER_IN; },
    mToFt: function (m) { return m / M_PER_FT; },
    mToIn: function (m) { return m / M_PER_IN; },

    m2ToFt2: function (m2) { return m2 / (M_PER_FT * M_PER_FT); },
    ft2ToM2: function (ft2) { return ft2 * M_PER_FT * M_PER_FT; },

    m3ToFt3: function (m3) { return m3 / (M_PER_FT * M_PER_FT * M_PER_FT); },
    m3ToYd3: function (m3) { return m3 / M3_PER_YD3; },
    ft3ToM3: function (ft3) { return ft3 * M_PER_FT * M_PER_FT * M_PER_FT; },

    lToGal: function (l) { return l / L_PER_GAL; },
    galToL: function (gal) { return gal * L_PER_GAL; },

    kgToLb: function (kg) { return kg / KG_PER_LB; },
    lbToKg: function (lb) { return lb * KG_PER_LB; },
    kgToUsTon: function (kg) { return kg / KG_PER_LB / 2000; },
    kgToTonne: function (kg) { return kg / 1000; }
  };

  /* Trades people write "12'6", "12 ft 6 in", "12-6" and "12.5" and mean the
     same thing. Accepting all of them is the difference between a tool used on
     site and one abandoned at the first mistyped dimension.
     `size` is 'big' (feet / metres) or 'small' (inches / centimetres).
     Always returns metres, or NaN. */
  function parseLength(raw, system, size) {
    if (raw === null || raw === undefined) return NaN;
    var s = String(raw).trim().toLowerCase();
    if (!s) return NaN;
    s = s.replace(/[′’]/g, "'").replace(/[″”]/g, '"');

    if (system === 'metric') {
      var mm = s.match(/^([\d.]+)\s*mm$/);
      if (mm) return parseFloat(mm[1]) / 1000;
      var cm = s.match(/^([\d.]+)\s*cm$/);
      if (cm) return parseFloat(cm[1]) / 100;
      var mtr = s.match(/^([\d.]+)\s*m$/);
      if (mtr) return parseFloat(mtr[1]);
      var plain = parseFloat(s);
      if (!isFinite(plain) || /[^\d.\s]/.test(s)) return NaN;
      return size === 'small' ? plain / 100 : plain;
    }

    var fi = s.match(/^(-?[\d.]+)\s*(?:'|ft|feet|foot)\s*(-?[\d.]+)?\s*(?:"|in|inch|inches)?$/);
    if (fi) {
      var feet = parseFloat(fi[1]);
      if (!isFinite(feet)) return NaN;
      var inches = fi[2] ? parseFloat(fi[2]) : 0;
      return feet * M_PER_FT + (isFinite(inches) ? inches : 0) * M_PER_IN;
    }
    var inchOnly = s.match(/^(-?[\d.]+)\s*(?:"|in|inch|inches)$/);
    if (inchOnly) return parseFloat(inchOnly[1]) * M_PER_IN;

    var dashed = s.match(/^(-?\d+)\s*-\s*([\d.]+)$/);
    if (dashed) return parseInt(dashed[1], 10) * M_PER_FT + parseFloat(dashed[2]) * M_PER_IN;

    if (/[^\d.\s]/.test(s)) return NaN;
    var num = parseFloat(s);
    if (!isFinite(num)) return NaN;
    return size === 'small' ? num * M_PER_IN : num * M_PER_FT;
  }

  function parseNumber(raw) {
    if (raw === null || raw === undefined) return NaN;
    var s = String(raw).trim().replace(/[,$\s]/g, '');
    if (!s) return NaN;
    var num = parseFloat(s);
    return isFinite(num) ? num : NaN;
  }

  function round(value, dp) {
    var f = Math.pow(10, dp === undefined ? 2 : dp);
    return Math.round(value * f) / f;
  }

  function n(value, dp) {
    if (!isFinite(value)) return '—';
    var places = dp === undefined ? 2 : dp;
    return round(value, places).toLocaleString('en-US', {
      minimumFractionDigits: 0, maximumFractionDigits: places
    });
  }

  function money(value, symbol) {
    if (!isFinite(value)) return '—';
    return (symbol || '$') + Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  /* Render a length back in the reader's own units, feet-and-inches included. */
  function len(metres, system, size) {
    if (system === 'metric') {
      return size === 'small' ? n(metres * 100, 1) + ' cm' : n(metres, 2) + ' m';
    }
    if (size === 'small') return n(metres / M_PER_IN, 2) + ' in';
    var totalFt = metres / M_PER_FT;
    var feet = Math.floor(totalFt);
    var inches = round((totalFt - feet) * 12, 1);
    if (inches >= 12) { feet += 1; inches = 0; }
    return feet + "' " + inches + '"';
  }

  return {
    U: U,
    fmt: { n: n, money: money, round: round, len: len },
    parseLength: parseLength,
    parseNumber: parseNumber
  };
}));
