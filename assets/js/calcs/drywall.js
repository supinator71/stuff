/* Drywall calculator — sheets, screws, joint compound and tape for a room. */
(function (root, factory) {
  var def = factory();
  if (typeof module === 'object' && module.exports) module.exports = def;
  else root.Calc.register(def);
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var SCREWS_PER_SHEET = 32;
  var SCREWS_PER_LB = 320;                 // 1-1/4 in coarse thread, near enough
  var COMPOUND_L_PER_M2 = 0.4074;          // 1 US gallon per 100 ft², a level-4 three-coat finish
  var TAPE_M_PER_M2 = 1.3123;              // 400 ft of tape per 1,000 ft² of board

  return {
    id: 'drywall',
    title: 'Drywall sheet calculator',

    fields: [
      { key: 'length', type: 'length', label: 'Room length', value: '14' },
      { key: 'width', type: 'length', label: 'Room width', value: '12' },
      { key: 'height', type: 'length', label: 'Wall height', value: { imperial: '8', metric: '2.4' } },
      { key: 'ceiling', type: 'radio', label: 'Boarding the ceiling?',
        options: [{ value: 'yes', label: 'Walls + ceiling' }, { value: 'no', label: 'Walls only' }] },
      { key: 'sheet', type: 'select', label: 'Sheet size',
        options: {
          imperial: [
            { value: '2.97289', label: '4 × 8 ft (32 ft²)' },
            { value: '3.71612', label: '4 × 10 ft (40 ft²)' },
            { value: '4.45934', label: '4 × 12 ft (48 ft²)' }
          ],
          metric: [
            { value: '2.88', label: '1200 × 2400 mm (2.88 m²)' },
            { value: '3.60', label: '1200 × 3000 mm (3.60 m²)' }
          ]
        } },
      { key: 'openings', type: 'number', label: 'Doors and windows to deduct', value: '0', optional: true, unit: '×',
        hint: 'Leave at 0 — most estimators board straight over openings and cut them out' },
      { key: 'waste', type: 'percent', label: 'Waste allowance', value: '10' },
      { key: 'price', type: 'money', label: 'Price per sheet', optional: true, per: '$', hint: 'Optional' }
    ],

    compute: function (v, ctx) {
      var U = ctx.U;
      var f = ctx.fmt;

      var wallArea = 2 * (v.length + v.width) * v.height;
      var ceilingArea = v.ceiling === 'yes' ? v.length * v.width : 0;
      var deduction = (v.openings || 0) * 1.95;
      var area = Math.max(0, wallArea + ceilingArea - deduction);

      var sheetArea = parseFloat(v.sheet);
      var sheets = sheetArea > 0 ? Math.ceil(area * (1 + (v.waste || 0) / 100) / sheetArea) : 0;

      var screws = sheets * SCREWS_PER_SHEET;
      var compoundL = area * COMPOUND_L_PER_M2;
      var tapeM = area * TAPE_M_PER_M2;

      var areaText = ctx.imperial ? f.n(U.m2ToFt2(area), 0) + ' ft²' : f.n(area, 1) + ' m²';

      var supplies = [
        { cells: ['Screws', f.n(screws, 0) + ' screws'],
          sub: 'About ' + f.n(screws / SCREWS_PER_LB, 1) + ' lb — buy a 5 lb box' },
        { cells: ['Joint compound',
          ctx.imperial ? f.n(U.lToGal(compoundL), 1) + ' gal' : f.n(compoundL, 1) + ' L'],
          sub: 'Taping plus two finish coats' },
        { cells: ['Joint tape',
          ctx.imperial ? f.n(U.mToFt(tapeM), 0) + ' ft' : f.n(tapeM, 0) + ' m'],
          sub: 'Standard rolls are 250 ft / 75 m' }
      ];

      var tables = [
        {
          caption: 'Board',
          cols: ['Item', 'Quantity'],
          rows: [
            { cells: ['Wall area', ctx.imperial ? f.n(U.m2ToFt2(wallArea), 0) + ' ft²' : f.n(wallArea, 1) + ' m²'] },
            { cells: ['Ceiling', ceilingArea ? (ctx.imperial ? f.n(U.m2ToFt2(ceilingArea), 0) + ' ft²' : f.n(ceilingArea, 1) + ' m²') : 'not included'] },
            { cells: ['Total to board', areaText] },
            { cells: ['Sheets needed', f.n(sheets, 0)], sub: 'Includes ' + f.n(v.waste, 0) + '% waste' }
          ]
        },
        { caption: 'Supplies', cols: ['Item', 'Quantity'], rows: supplies }
      ];

      if (v.price > 0) {
        tables.push({
          caption: 'Estimated cost',
          cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Drywall sheets', f.n(sheets, 0) + ' sheets', f.money(sheets * v.price)] }],
          foot: ['Board total', '', f.money(sheets * v.price)]
        });
      }

      return {
        headline: { value: f.n(sheets, 0), unit: sheets === 1 ? 'sheet' : 'sheets', label: 'Drywall needed, waste allowance included' },
        tables: tables,
        notes: [
          'Longer sheets mean fewer butt joints, and butt joints are the hardest thing to finish flat. Use 12 ft board if you can get it into the room.',
          'Ceilings want 5/8 in (15 mm) board on 24 in centres, or it sags between the joists.',
          'Compound and tape assume a standard level-4 finish. A level-5 skim over the whole surface roughly doubles the compound.',
          'Corner bead, screws for the ceiling and any moisture- or fire-rated board upgrades are priced separately.'
        ]
      };
    }
  };
}));
