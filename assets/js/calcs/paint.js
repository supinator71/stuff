/* Interior paint calculator — wall area less openings, times coats. */
(function (root, factory) {
  var def = factory();
  if (typeof module === 'object' && module.exports) module.exports = def;
  else root.Calc.register(def);
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var DOOR_M2 = 1.95;      // a 3 ft × 7 ft door
  var WINDOW_M2 = 1.4;     // a fairly typical 3 ft × 5 ft window
  var FT2_PER_M2 = 10.763910416709722;

  return {
    id: 'paint',
    title: 'Interior paint calculator',

    fields: [
      { key: 'length', type: 'length', label: 'Room length', value: '14' },
      { key: 'width', type: 'length', label: 'Room width', value: '12' },
      { key: 'height', type: 'length', label: 'Wall height', value: { imperial: '8', metric: '2.4' } },
      { key: 'doors', type: 'number', label: 'Doors', value: '1', unit: '×', optional: true,
        hint: 'Each counted as 21 ft² (1.95 m²)' },
      { key: 'windows', type: 'number', label: 'Windows', value: '2', unit: '×', optional: true,
        hint: 'Each counted as 15 ft² (1.4 m²)' },
      { key: 'ceiling', type: 'radio', label: 'Painting the ceiling too?',
        options: [{ value: 'no', label: 'Walls only' }, { value: 'yes', label: 'Walls + ceiling' }] },
      { key: 'coats', type: 'number', label: 'Coats', value: '2', unit: '×',
        hint: 'Two is standard. Allow three over a strong colour change.' },
      { key: 'coverage', type: 'number', label: 'Spread rate',
        value: { imperial: '350', metric: '8.6' },
        unit: { imperial: 'ft²/gal', metric: 'm²/L' },
        convert: { toMetric: function (v) { return v / FT2_PER_M2 / 3.785411784; },
                   toImperial: function (v) { return v * FT2_PER_M2 * 3.785411784; } },
        hint: 'Check the tin. 350 ft² per gallon is a fair average on primed drywall.' },
      { key: 'price', type: 'money', label: { imperial: 'Price per gallon', metric: 'Price per litre' },
        optional: true, per: '$', hint: 'Optional' }
    ],

    compute: function (v, ctx) {
      var U = ctx.U;
      var f = ctx.fmt;

      var perimeter = 2 * (v.length + v.width);
      var wallArea = perimeter * v.height;                       // m²
      var openings = (v.doors || 0) * DOOR_M2 + (v.windows || 0) * WINDOW_M2;
      var paintable = Math.max(0, wallArea - openings);
      var ceilingArea = v.ceiling === 'yes' ? v.length * v.width : 0;
      var totalSurface = paintable + ceilingArea;
      var coats = v.coats > 0 ? v.coats : 1;
      var toCover = totalSurface * coats;

      /* Spread rate is entered in whichever system is on screen; normalise to m²/L. */
      var coverageM2PerL = ctx.imperial ? (v.coverage / FT2_PER_M2) / 3.785411784 : v.coverage;
      var litres = coverageM2PerL > 0 ? toCover / coverageM2PerL : 0;

      var headline, rows, notes = [];

      if (ctx.imperial) {
        var gallons = U.lToGal(litres);
        headline = { value: f.n(gallons, 2), unit: 'gallons', label: 'Paint needed for ' + f.n(coats, 0) + ' coat' + (coats === 1 ? '' : 's') };
        rows = [
          { cells: ['Wall area', f.n(U.m2ToFt2(wallArea), 0) + ' ft²'], sub: f.n(U.mToFt(perimeter), 1) + ' ft perimeter × ' + f.n(U.mToFt(v.height), 1) + ' ft high' },
          { cells: ['Less doors and windows', '−' + f.n(U.m2ToFt2(openings), 0) + ' ft²'] },
          { cells: ['Ceiling', ceilingArea ? f.n(U.m2ToFt2(ceilingArea), 0) + ' ft²' : 'not included'] },
          { cells: ['Surface to paint', f.n(U.m2ToFt2(totalSurface), 0) + ' ft²'] },
          { cells: ['Total with ' + f.n(coats, 0) + ' coats', f.n(U.m2ToFt2(toCover), 0) + ' ft²'] }
        ];
        var cans = Math.ceil(gallons);
        if (gallons >= 5) {
          var pails = Math.floor(gallons / 5);
          var singles = Math.ceil(gallons - pails * 5);
          notes.push('Buy ' + cans + ' × 1-gallon cans, or ' + pails + ' × 5-gallon pail' +
            (pails === 1 ? '' : 's') + (singles ? ' plus ' + singles + ' × 1-gallon' : '') +
            ' — compare the per-gallon price.');
        } else {
          notes.push('Buy ' + cans + ' × 1-gallon can' + (cans === 1 ? '' : 's') + '.');
        }
      } else {
        headline = { value: f.n(litres, 2), unit: 'litres', label: 'Paint needed for ' + f.n(coats, 0) + ' coat' + (coats === 1 ? '' : 's') };
        rows = [
          { cells: ['Wall area', f.n(wallArea, 1) + ' m²'], sub: f.n(perimeter, 2) + ' m perimeter × ' + f.n(v.height, 2) + ' m high' },
          { cells: ['Less doors and windows', '−' + f.n(openings, 1) + ' m²'] },
          { cells: ['Ceiling', ceilingArea ? f.n(ceilingArea, 1) + ' m²' : 'not included'] },
          { cells: ['Surface to paint', f.n(totalSurface, 1) + ' m²'] },
          { cells: ['Total with ' + f.n(coats, 0) + ' coats', f.n(toCover, 1) + ' m²'] }
        ];
        notes.push('That is about ' + Math.ceil(litres / 2.5) + ' × 2.5 L tins, or ' + Math.ceil(litres / 5) + ' × 5 L.');
      }

      var tables = [{ caption: 'Surface area', cols: ['Item', 'Area'], rows: rows }];

      if (v.price > 0) {
        var qty = ctx.imperial ? Math.ceil(U.lToGal(litres)) : Math.ceil(litres);
        var unitName = ctx.imperial ? 'gallons' : 'litres';
        tables.push({
          caption: 'Estimated cost',
          cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Paint (rounded up to whole ' + unitName + ')', f.n(qty, 0) + ' ' + unitName, f.money(qty * v.price)] }],
          foot: ['Paint total', '', f.money(qty * v.price)]
        });
      }

      notes.push('Bare drywall, new plaster and any big colour change need a primer coat on top of this.');
      notes.push('Rough or textured surfaces drink noticeably more — drop the spread rate by 10–20% for those.');
      notes.push('Trim, doors and ceilings are usually a different product, so price them separately.');

      return { headline: headline, tables: tables, notes: notes };
    }
  };
}));
