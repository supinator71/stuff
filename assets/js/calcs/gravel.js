/* Gravel, sand & base calculator — volume converted to the weight aggregate is
 * actually sold by, with a compaction allowance for sub-base work. */
(function (root, factory) {
  var def = factory();
  if (typeof module === 'object' && module.exports) module.exports = def;
  else root.Calc.register(def);
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return {
    id: 'gravel',
    title: 'Gravel, sand & base calculator',

    fields: [
      { key: 'length', type: 'length', label: 'Length', value: '40' },
      { key: 'width', type: 'length', label: 'Width', value: '10' },
      { key: 'depth', type: 'smallLength', label: 'Depth', value: { imperial: '4', metric: '10' },
        hint: { imperial: '4 in of base under a patio; 4–6 in for a gravel driveway',
                metric: '10 cm of base under a patio; 10–15 cm for a gravel driveway' } },
      { key: 'material', type: 'select', label: 'Material',
        options: [
          { value: '1600', label: 'Crushed stone / gravel' },
          { value: '1750', label: 'Crusher run / road base' },
          { value: '1700', label: 'Pea gravel' },
          { value: '1600', label: 'Sand' },
          { value: '1650', label: 'River rock' },
          { value: '1300', label: 'Topsoil' }
        ],
        hint: 'Sets the bulk density used to convert volume into weight' },
      { key: 'compaction', type: 'percent', label: 'Compaction allowance', value: '20',
        hint: 'Sub-base compacts roughly 20%. Use 0 for loose decorative stone.' },
      { key: 'price', type: 'money', label: { imperial: 'Price per US ton', metric: 'Price per tonne' },
        optional: true, per: '$', hint: 'Optional' }
    ],

    compute: function (v, ctx) {
      var U = ctx.U;
      var f = ctx.fmt;

      var finished = v.length * v.width * v.depth;                        // m³ in place
      var loose = finished * (1 + (v.compaction || 0) / 100);             // m³ to order
      var density = parseFloat(v.material);
      var kg = loose * density;

      var volUnits = ctx.imperial ? U.m3ToYd3(loose) : loose;
      var volName = ctx.imperial ? 'yd³' : 'm³';
      var weight = ctx.imperial ? U.kgToUsTon(kg) : U.kgToTonne(kg);
      var weightName = ctx.imperial ? 'US tons' : 'tonnes';

      var rows = [
        { cells: ['Area', ctx.imperial ? f.n(U.m2ToFt2(v.length * v.width), 0) + ' ft²' : f.n(v.length * v.width, 1) + ' m²'] },
        { cells: ['Depth in place', f.len(v.depth, ctx.system, 'small')] },
        { cells: ['Finished volume', f.n(ctx.imperial ? U.m3ToYd3(finished) : finished, 2) + ' ' + volName] },
        { cells: ['With ' + f.n(v.compaction, 0) + '% compaction', f.n(volUnits, 2) + ' ' + volName],
          sub: 'This is the amount to order' },
        { cells: ['Weight', f.n(weight, 2) + ' ' + weightName],
          sub: 'At ' + f.n(density, 0) + ' kg/m³ bulk density' }
      ];

      var tables = [{ caption: 'Quantity', cols: ['Item', 'Quantity'], rows: rows }];

      if (v.price > 0) {
        var billable = Math.ceil(weight * 10) / 10;
        tables.push({
          caption: 'Estimated cost',
          cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Aggregate', f.n(billable, 1) + ' ' + weightName, f.money(billable * v.price)] }],
          foot: ['Materials total', '', f.money(billable * v.price)]
        });
      }

      var notes = [
        'Aggregate is sold by weight but ordered by volume, and bulk density varies with moisture and stone size. Treat the weight as ±10%.',
        'Delivery is usually the biggest line item on a small order. Ask for the delivered price, not the yard price.',
        'A standard tandem dump truck carries roughly 10–14 tons. Two part loads cost far more than one full one.'
      ];
      if (v.compaction > 0) {
        notes.unshift('Compaction allowance included: you are ordering ' + f.n(volUnits, 2) + ' ' + volName +
          ' of loose material to finish at ' + f.n(ctx.imperial ? U.m3ToYd3(finished) : finished, 2) + ' ' + volName + ' compacted.');
      }

      return {
        headline: { value: f.n(weight, 2), unit: weightName, label: 'Order this much — ' + f.n(volUnits, 2) + ' ' + volName + ' loose' },
        tables: tables,
        notes: notes
      };
    }
  };
}));
