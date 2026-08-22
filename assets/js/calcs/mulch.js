/* Mulch & topsoil calculator — volume, plus the bulk-versus-bags comparison
 * that is the whole reason to run the numbers before ordering. */
(function (root, factory) {
  var def = factory();
  if (typeof module === 'object' && module.exports) module.exports = def;
  else root.Calc.register(def);
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var FT2_PER_M2 = 10.763910416709722;

  return {
    id: 'mulch',
    title: 'Mulch & topsoil calculator',

    fields: [
      { key: 'length', type: 'length', label: 'Bed length', value: '30' },
      { key: 'width', type: 'length', label: 'Bed width', value: '6' },
      { key: 'extra', type: 'number', label: 'Extra bed area', value: '0', optional: true,
        unit: { imperial: 'ft²', metric: 'm²' },
        convert: { toMetric: function (v) { return v / FT2_PER_M2; }, toImperial: function (v) { return v * FT2_PER_M2; } } },
      { key: 'depth', type: 'smallLength', label: 'Depth', value: { imperial: '3', metric: '7.5' },
        hint: { imperial: '2–3 in for mulch, 4–6 in for new topsoil', metric: '5–7.5 cm for mulch, 10–15 cm for new topsoil' } },
      { key: 'bag', type: 'select', label: 'Bag size',
        options: {
          imperial: [
            { value: '0.056634', label: '2 ft³ bag (mulch)' },
            { value: '0.084951', label: '3 ft³ bag (mulch)' },
            { value: '0.021238', label: '0.75 ft³ bag (soil)' },
            { value: '0.028317', label: '1 ft³ bag (soil)' }
          ],
          metric: [
            { value: '0.050', label: '50 L bag' },
            { value: '0.040', label: '40 L bag' },
            { value: '0.025', label: '25 L bag' }
          ]
        } },
      { key: 'bagPrice', type: 'money', label: 'Price per bag', value: '4.50', optional: true, per: '$' },
      { key: 'bulkPrice', type: 'money', label: { imperial: 'Bulk price per cubic yard', metric: 'Bulk price per cubic metre' },
        value: '45', optional: true, per: '$', hint: 'Delivered price if you know it' }
    ],

    compute: function (v, ctx) {
      var U = ctx.U;
      var f = ctx.fmt;

      var extraM2 = ctx.imperial ? (v.extra || 0) / FT2_PER_M2 : (v.extra || 0);
      var area = v.length * v.width + extraM2;
      var volume = area * v.depth;                       // m³

      var bagVolume = parseFloat(v.bag);
      var bags = bagVolume > 0 ? Math.ceil(volume / bagVolume) : 0;

      var bulkUnits = ctx.imperial ? U.m3ToYd3(volume) : volume;
      var bulkUnitName = ctx.imperial ? 'yd³' : 'm³';
      var orderUnits = ctx.imperial ? Math.ceil(bulkUnits * 2) / 2 : Math.ceil(bulkUnits * 10) / 10;

      var rows = [
        { cells: ['Bed area', ctx.imperial ? f.n(U.m2ToFt2(area), 0) + ' ft²' : f.n(area, 1) + ' m²'] },
        { cells: ['Depth', f.len(v.depth, ctx.system, 'small')] },
        { cells: ['Volume', f.n(bulkUnits, 2) + ' ' + bulkUnitName],
          sub: ctx.imperial ? f.n(U.m3ToFt3(volume), 1) + ' ft³' : null },
        { cells: ['Or in bags', f.n(bags, 0) + ' bags'] }
      ];

      var tables = [{ caption: 'How much you need', cols: ['Item', 'Quantity'], rows: rows }];
      var notes = [];

      var bagTotal = v.bagPrice > 0 ? bags * v.bagPrice : 0;
      var bulkTotal = v.bulkPrice > 0 ? orderUnits * v.bulkPrice : 0;

      if (bagTotal > 0 && bulkTotal > 0) {
        var cheaper = bulkTotal < bagTotal ? 'bulk' : 'bags';
        var saving = Math.abs(bagTotal - bulkTotal);
        tables.push({
          caption: 'Bags or bulk?',
          cols: ['Option', 'Quantity', 'Cost'],
          rows: [
            { cells: ['Bagged', f.n(bags, 0) + ' bags', f.money(bagTotal)] },
            { cells: ['Bulk delivered', f.n(orderUnits, 2) + ' ' + bulkUnitName, f.money(bulkTotal)] }
          ],
          foot: [cheaper === 'bulk' ? 'Bulk is cheaper by' : 'Bags are cheaper by', '', f.money(saving)]
        });
        notes.push(cheaper === 'bulk'
          ? 'Bulk wins here by ' + f.money(saving) + ' — but check the delivery fee is included and that you have somewhere to tip it.'
          : 'Bags win here by ' + f.money(saving) + ', and you can carry them to the bed. Bulk usually overtakes bags somewhere around 2–3 cubic yards.');
      } else if (bagTotal > 0) {
        tables.push({ caption: 'Estimated cost', cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Bagged', f.n(bags, 0) + ' bags', f.money(bagTotal)] }],
          foot: ['Total', '', f.money(bagTotal)] });
      } else if (bulkTotal > 0) {
        tables.push({ caption: 'Estimated cost', cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Bulk delivered', f.n(orderUnits, 2) + ' ' + bulkUnitName, f.money(bulkTotal)] }],
          foot: ['Total', '', f.money(bulkTotal)] });
      }

      notes.push('Mulch settles. Order at the depth you want it to finish at, not the depth of the loose pile.');
      notes.push('Keep mulch clear of trunks and stems — piling it against bark holds moisture and rots the plant.');
      notes.push('A cubic yard covers about 108 ft² at 3 in deep, or 162 ft² at 2 in.');

      return {
        headline: {
          value: f.n(bulkUnits, 2),
          unit: ctx.imperial ? 'cubic yards' : 'cubic metres',
          label: 'Or ' + f.n(bags, 0) + ' bags at the size selected'
        },
        tables: tables,
        notes: notes
      };
    }
  };
}));
