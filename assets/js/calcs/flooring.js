/* Flooring calculator — laminate, vinyl plank and hardwood sold by the box. */
(function (root, factory) {
  var def = factory();
  if (typeof module === 'object' && module.exports) module.exports = def;
  else root.Calc.register(def);
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var FT2_PER_M2 = 10.763910416709722;

  return {
    id: 'flooring',
    title: 'Flooring calculator',

    fields: [
      { key: 'length', type: 'length', label: 'Room length', value: '16' },
      { key: 'width', type: 'length', label: 'Room width', value: '12' },
      { key: 'extra', type: 'number', label: 'Extra area (closets, bays)', value: '0', optional: true,
        unit: { imperial: 'ft²', metric: 'm²' },
        convert: { toMetric: function (v) { return v / FT2_PER_M2; }, toImperial: function (v) { return v * FT2_PER_M2; } } },
      { key: 'pattern', type: 'radio', label: 'Lay pattern',
        options: [
          { value: '10', label: 'Straight (10%)' },
          { value: '15', label: 'Diagonal (15%)' },
          { value: '20', label: 'Herringbone (20%)' }
        ],
        hint: 'Sets the waste allowance. Add 5% more on a room with many jogs and doorways.' },
      { key: 'boxCoverage', type: 'number', label: 'Coverage per box',
        value: { imperial: '20', metric: '1.86' },
        unit: { imperial: 'ft²', metric: 'm²' },
        convert: { toMetric: function (v) { return v / FT2_PER_M2; }, toImperial: function (v) { return v * FT2_PER_M2; } },
        hint: 'Printed on the end of the box' },
      { key: 'price', type: 'money', label: 'Price per box', optional: true, per: '$', hint: 'Optional' }
    ],

    compute: function (v, ctx) {
      var U = ctx.U;
      var f = ctx.fmt;

      var extraM2 = ctx.imperial ? (v.extra || 0) / FT2_PER_M2 : (v.extra || 0);
      var area = v.length * v.width + extraM2;                 // m²
      var waste = parseFloat(v.pattern);
      var withWaste = area * (1 + waste / 100);

      var boxM2 = ctx.imperial ? v.boxCoverage / FT2_PER_M2 : v.boxCoverage;
      var boxes = boxM2 > 0 ? Math.ceil(withWaste / boxM2) : 0;
      var bought = boxes * boxM2;
      var leftover = bought - area;

      var unit = ctx.imperial ? 'ft²' : 'm²';
      var toDisplay = function (m2, dp) {
        return f.n(ctx.imperial ? U.m2ToFt2(m2) : m2, dp === undefined ? (ctx.imperial ? 0 : 2) : dp) + ' ' + unit;
      };

      var tables = [{
        caption: 'Coverage',
        cols: ['Item', 'Area'],
        rows: [
          { cells: ['Floor area', toDisplay(area)] },
          { cells: ['With ' + waste + '% cutting waste', toDisplay(withWaste)] },
          { cells: ['You will actually buy', toDisplay(bought)], sub: f.n(boxes, 0) + ' boxes' },
          { cells: ['Left over', toDisplay(leftover)], sub: 'Keep it — that is your repair stock' }
        ]
      }];

      if (v.price > 0) {
        tables.push({
          caption: 'Estimated cost',
          cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Flooring', f.n(boxes, 0) + ' boxes', f.money(boxes * v.price)] }],
          foot: ['Flooring total', '', f.money(boxes * v.price)]
        });
      }

      return {
        headline: { value: f.n(boxes, 0), unit: boxes === 1 ? 'box' : 'boxes', label: 'Buy this many boxes, cutting waste included' },
        tables: tables,
        notes: [
          'Underlayment, transition strips, trim and adhesive are not included.',
          'Buy every box in one go and check the batch or lot number matches — dye lots shift between production runs and a late top-up box can be visibly off.',
          'Keep at least one spare box after the job. Discontinued lines are the usual reason a small repair turns into a whole new floor.',
          'Measure at the widest point of each direction, then add the jogs separately rather than averaging them.'
        ]
      };
    }
  };
}));
