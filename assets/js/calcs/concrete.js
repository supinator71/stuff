/* Concrete slab & footing calculator.
 * All internal maths is SI (metres, cubic metres); display converts at the end. */
(function (root, factory) {
  var def = factory();
  if (typeof module === 'object' && module.exports) module.exports = def;
  else root.Calc.register(def);
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return {
    id: 'concrete',
    title: 'Concrete slab & footing calculator',

    fields: [
      { key: 'length', type: 'length', label: 'Length', value: '20', hint: 'Accepts 20, 20.5 or 20′ 6″' },
      { key: 'width', type: 'length', label: 'Width', value: '10' },
      { key: 'thickness', type: 'smallLength', label: 'Thickness', value: { imperial: '4', metric: '10' },
        hint: '4 in is typical for a patio; 5–6 in for a driveway' },
      { key: 'count', type: 'number', label: 'How many identical pours', value: '1', unit: '×' },
      { key: 'waste', type: 'percent', label: 'Waste allowance', value: '10',
        hint: 'Covers spillage, uneven subgrade and over-excavation' },
      { key: 'bag', type: 'select', label: 'If bagging it, bag size',
        options: {
          imperial: [
            { value: '0.016990', label: '80 lb bag (0.60 ft³)' },
            { value: '0.012743', label: '60 lb bag (0.45 ft³)' },
            { value: '0.008495', label: '40 lb bag (0.30 ft³)' }
          ],
          metric: [
            { value: '0.0125', label: '25 kg bag (12.5 L)' },
            { value: '0.0100', label: '20 kg bag (10 L)' }
          ]
        } },
      { key: 'price', type: 'money', label: { imperial: 'Ready-mix price per cubic yard', metric: 'Ready-mix price per cubic metre' },
        optional: true, per: '$', hint: 'Optional — leave blank to skip costing' }
    ],

    compute: function (v, ctx) {
      var U = ctx.U;
      var f = ctx.fmt;

      var count = v.count > 0 ? v.count : 1;
      var net = v.length * v.width * v.thickness * count;      // m³
      var gross = net * (1 + (v.waste || 0) / 100);

      var bagYield = parseFloat(v.bag);
      var bags = bagYield > 0 ? Math.ceil(gross / bagYield) : 0;

      var rows = [];
      var headline;

      if (ctx.imperial) {
        var yd3 = U.m3ToYd3(gross);
        headline = { value: f.n(yd3, 2), unit: 'cubic yards', label: 'Order this much ready-mix, waste allowance included' };
        rows.push({ cells: ['Net volume', f.n(U.m3ToYd3(net), 2) + ' yd³'], sub: f.n(U.m3ToFt3(net), 1) + ' ft³' });
        rows.push({ cells: ['With ' + f.n(v.waste, 0) + '% waste', f.n(yd3, 2) + ' yd³'], sub: f.n(U.m3ToFt3(gross), 1) + ' ft³' });
        rows.push({ cells: ['Rounded for ordering', f.n(Math.ceil(yd3 * 4) / 4, 2) + ' yd³'], sub: 'Most plants sell in quarter-yard steps' });
      } else {
        headline = { value: f.n(gross, 2), unit: 'cubic metres', label: 'Order this much ready-mix, waste allowance included' };
        rows.push({ cells: ['Net volume', f.n(net, 3) + ' m³'] });
        rows.push({ cells: ['With ' + f.n(v.waste, 0) + '% waste', f.n(gross, 3) + ' m³'] });
        rows.push({ cells: ['Rounded for ordering', f.n(Math.ceil(gross * 10) / 10, 1) + ' m³'], sub: 'Plants usually sell in 0.1 m³ steps' });
      }

      rows.push({ cells: ['Bags instead of ready-mix', f.n(bags, 0) + ' bags'], sub: 'Only sensible for small pours' });

      var tables = [{ caption: 'Volume', cols: ['Item', 'Quantity'], rows: rows }];

      if (v.price > 0) {
        var billable = ctx.imperial ? Math.ceil(U.m3ToYd3(gross) * 4) / 4 : Math.ceil(gross * 10) / 10;
        var unitName = ctx.imperial ? 'yd³' : 'm³';
        tables.push({
          caption: 'Estimated cost',
          cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Ready-mix concrete', f.n(billable, 2) + ' ' + unitName, f.money(billable * v.price)] }],
          foot: ['Materials total', '', f.money(billable * v.price)]
        });
      }

      var notes = [
        'Volume only — reinforcement, formwork, gravel base and pump or delivery fees are extra.',
        'Ready-mix suppliers usually charge a short-load fee below about 1 yd³ (0.75 m³). Compare that against bag prices before ordering.',
        'Running short mid-pour leaves a cold joint you cannot undo. If the number lands near a boundary, order the next increment up.'
      ];
      if (bags > 40 && bagYield > 0) {
        notes.unshift('That is ' + f.n(bags, 0) + ' bags to mix by hand. Past roughly 40 bags, ready-mix is normally cheaper and far faster.');
      }

      return { headline: headline, tables: tables, notes: notes };
    }
  };
}));
