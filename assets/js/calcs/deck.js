/* Deck board calculator — boards, joists and fasteners for a rectangular deck.
 * Decking runs parallel to the deck length; joists run across it. */
(function (root, factory) {
  var def = factory();
  if (typeof module === 'object' && module.exports) module.exports = def;
  else root.Calc.register(def);
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  return {
    id: 'deck',
    title: 'Deck board calculator',

    fields: [
      { key: 'length', type: 'length', label: 'Deck length', value: '16',
        hint: 'The direction the boards run' },
      { key: 'width', type: 'length', label: 'Deck width', value: '12',
        hint: 'Measured across the boards' },
      { key: 'boardWidth', type: 'smallLength', label: 'Board width', value: { imperial: '5.5', metric: '14' },
        hint: { imperial: 'Actual width, not nominal. A 2×6 or 5/4×6 is 5.5 in.', metric: 'Actual width — commonly 14 cm' } },
      { key: 'gap', type: 'smallLength', label: 'Gap between boards', value: { imperial: '0.1875', metric: '0.5' },
        hint: { imperial: '3/16 in = 0.1875. Wet-treated lumber shrinks, so gap it tighter.', metric: '5 mm = 0.5 cm' } },
      { key: 'boardLength', type: 'length', label: 'Board length sold', value: { imperial: '16', metric: '4.8' } },
      { key: 'joistSpacing', type: 'select', label: 'Joist spacing',
        options: {
          imperial: [
            { value: '0.4064', label: '16 in on centre' },
            { value: '0.3048', label: '12 in on centre' },
            { value: '0.6096', label: '24 in on centre' }
          ],
          metric: [
            { value: '0.400', label: '400 mm centres' },
            { value: '0.300', label: '300 mm centres' },
            { value: '0.600', label: '600 mm centres' }
          ]
        },
        hint: 'Composite and diagonal layouts usually require 12 in / 300 mm' },
      { key: 'waste', type: 'percent', label: 'Waste allowance', value: '10' },
      { key: 'price', type: 'money', label: 'Price per board', optional: true, per: '$', hint: 'Optional' }
    ],

    compute: function (v, ctx) {
      var U = ctx.U;
      var f = ctx.fmt;

      var pitch = v.boardWidth + v.gap;
      var rows = pitch > 0 ? Math.ceil(v.width / pitch) : 0;
      var linealNet = rows * v.length;                                   // metres of board
      var lineal = linealNet * (1 + (v.waste || 0) / 100);

      var boards = v.boardLength > 0 ? Math.ceil(lineal / v.boardLength) : 0;
      var boardsNoJoins = v.boardLength > 0 ? rows * Math.ceil(v.length / v.boardLength) : 0;

      var spacing = parseFloat(v.joistSpacing);
      var joists = spacing > 0 ? Math.floor(v.length / spacing) + 1 : 0;
      var screws = rows * joists * 2;

      var linealText = ctx.imperial ? f.n(U.mToFt(lineal), 0) + ' lineal ft' : f.n(lineal, 1) + ' lineal m';
      var joistLenText = f.len(v.width, ctx.system, 'big');

      var deckRows = [
        { cells: ['Rows of decking', f.n(rows, 0)],
          sub: 'At ' + f.len(pitch, ctx.system, 'small') + ' per board plus gap' },
        { cells: ['Lineal board needed', linealText], sub: 'Includes ' + f.n(v.waste, 0) + '% waste' },
        { cells: ['Boards to buy', f.n(boards, 0)],
          sub: 'At ' + f.len(v.boardLength, ctx.system, 'big') + ' each, using the offcuts' },
        { cells: ['If you refuse to butt-join', f.n(boardsNoJoins, 0) + ' boards'],
          sub: 'One continuous board per row' }
      ];

      var frameRows = [
        { cells: ['Joists', f.n(joists, 0)], sub: 'Each ' + joistLenText + ' long' },
        { cells: ['Deck screws', f.n(screws, 0)], sub: 'Two per board at every joist crossing' }
      ];

      var tables = [
        { caption: 'Decking', cols: ['Item', 'Quantity'], rows: deckRows },
        { caption: 'Frame and fasteners', cols: ['Item', 'Quantity'], rows: frameRows }
      ];

      if (v.price > 0) {
        tables.push({
          caption: 'Estimated cost',
          cols: ['Item', 'Quantity', 'Cost'],
          rows: [{ cells: ['Deck boards', f.n(boards, 0) + ' boards', f.money(boards * v.price)] }],
          foot: ['Decking total', '', f.money(boards * v.price)]
        });
      }

      return {
        headline: { value: f.n(boards, 0), unit: boards === 1 ? 'board' : 'boards', label: 'Decking only — frame, posts and footings are separate' },
        tables: tables,
        notes: [
          'Beams, posts, footings, joist hangers and railing are not included. This covers the walking surface and the joists under it.',
          'Butt joints must land on a joist. Plan where they fall before you cut, or double up a joist to catch them.',
          'Kiln-dried treated lumber shrinks across its width as it dries — gap it tighter than you want it to end up.',
          'Check your local code for joist span and spacing before ordering. Composite decking in particular often needs closer centres than timber.'
        ]
      };
    }
  };
}));
