/* Tile calculator — tile count and grout volume, allowing for the joint width.
 * Grout is derived from first principles rather than a rule of thumb: for a
 * repeating cell of (w+j) × (h+j), the grout is everything the tile does not
 * occupy, to the depth of the tile. */
(function (root, factory) {
  var def = factory();
  if (typeof module === 'object' && module.exports) module.exports = def;
  else root.Calc.register(def);
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var GROUT_DENSITY = 1600;   // kg/m³, typical cementitious grout

  return {
    id: 'tile',
    title: 'Tile & grout calculator',

    fields: [
      { key: 'length', type: 'length', label: 'Area length', value: '10' },
      { key: 'width', type: 'length', label: 'Area width', value: '8' },
      { key: 'tileW', type: 'smallLength', label: 'Tile width', value: { imperial: '12', metric: '30' } },
      { key: 'tileH', type: 'smallLength', label: 'Tile height', value: { imperial: '24', metric: '60' } },
      { key: 'joint', type: 'smallLength', label: 'Grout joint', value: { imperial: '0.125', metric: '0.3' },
        hint: { imperial: '1/8 in = 0.125. Rectified porcelain often goes to 1/16 in (0.0625).',
                metric: '3 mm = 0.3 cm. Rectified porcelain often goes to 2 mm.' } },
      { key: 'tileThk', type: 'smallLength', label: 'Tile thickness', value: { imperial: '0.375', metric: '1' },
        hint: 'Sets how deep the grout joint is' },
      { key: 'waste', type: 'percent', label: 'Waste allowance', value: '10',
        hint: 'Use 15% for a diagonal layout or a room full of cuts' },
      { key: 'perBox', type: 'number', label: 'Tiles per box', value: '0', optional: true, unit: '×',
        hint: 'Optional — leave 0 to count loose tiles' },
      { key: 'price', type: 'money', label: 'Price per tile', optional: true, per: '$', hint: 'Optional' }
    ],

    compute: function (v, ctx) {
      var U = ctx.U;
      var f = ctx.fmt;

      var area = v.length * v.width;                                  // m²
      var cell = (v.tileW + v.joint) * (v.tileH + v.joint);           // m² per tile including its joint
      var tileFace = v.tileW * v.tileH;

      var netTiles = cell > 0 ? area / cell : 0;
      var tiles = Math.ceil(netTiles * (1 + (v.waste || 0) / 100));

      /* Grout: the share of each cell that is not tile, to the tile's depth. */
      var groutFraction = cell > 0 ? (cell - tileFace) / cell : 0;
      var groutVolume = area * groutFraction * v.tileThk;             // m³
      var groutKg = groutVolume * GROUT_DENSITY;

      var boxes = v.perBox > 0 ? Math.ceil(tiles / v.perBox) : 0;

      var areaText = ctx.imperial ? f.n(U.m2ToFt2(area), 0) + ' ft²' : f.n(area, 2) + ' m²';
      var tileText = ctx.imperial
        ? f.n(U.mToIn(v.tileW), 2) + ' × ' + f.n(U.mToIn(v.tileH), 2) + ' in'
        : f.n(v.tileW * 100, 1) + ' × ' + f.n(v.tileH * 100, 1) + ' cm';

      var rows = [
        { cells: ['Area to tile', areaText] },
        { cells: ['Tile size', tileText], sub: 'Joint ' + f.len(v.joint, ctx.system, 'small') },
        { cells: ['Tiles to cover it', f.n(Math.ceil(netTiles), 0)] },
        { cells: ['With ' + f.n(v.waste, 0) + '% waste', f.n(tiles, 0)] }
      ];
      if (boxes > 0) {
        rows.push({ cells: ['Boxes', f.n(boxes, 0)], sub: f.n(boxes * v.perBox - tiles, 0) + ' spare tiles' });
      }

      var groutRow = ctx.imperial
        ? { cells: ['Grout needed', f.n(U.kgToLb(groutKg), 1) + ' lb'], sub: 'Dry mix, before water' }
        : { cells: ['Grout needed', f.n(groutKg, 1) + ' kg'], sub: 'Dry mix, before water' };

      var tables = [
        { caption: 'Tiles', cols: ['Item', 'Quantity'], rows: rows },
        { caption: 'Grout', cols: ['Item', 'Quantity'], rows: [groutRow] }
      ];

      if (v.price > 0) {
        tables.push({
          caption: 'Estimated cost',
          cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Tiles', f.n(tiles, 0) + ' tiles', f.money(tiles * v.price)] }],
          foot: ['Tile total', '', f.money(tiles * v.price)]
        });
      }

      return {
        headline: { value: f.n(tiles, 0), unit: tiles === 1 ? 'tile' : 'tiles', label: 'Including a ' + f.n(v.waste, 0) + '% waste allowance' },
        tables: tables,
        notes: [
          'Thinset or adhesive is not included — coverage depends entirely on trowel notch size, so check the bag.',
          'Grout is an estimate. Uneven tile backs, lippage and a wider-than-planned joint all push the real figure up; buying one bag over is cheap insurance.',
          'Order every box at once and check the shade or batch code. Tile colour drifts between production runs.',
          'Large-format tile over 15 in (380 mm) usually needs a levelling system and a flatter substrate than a standard floor.'
        ]
      };
    }
  };
}));
