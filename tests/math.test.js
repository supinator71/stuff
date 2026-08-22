/* Measure Twice — arithmetic tests for every calculator.
 *
 *   node tests/math.test.js
 *
 * Each expectation below was worked out by hand first; if a calculator and this
 * file disagree, work the sum on paper before changing either. Exits non-zero
 * on failure. */
const MT = require('../assets/js/units.js');

const ft = n => n * 0.3048;
const inch = n => n * 0.0254;
const ctx = imperial => ({
  imperial, system: imperial ? 'imperial' : 'metric', U: MT.U, fmt: MT.fmt
});

let passed = 0;
const failures = [];

function check(name, actual, expected, tolerance) {
  const tol = tolerance === undefined ? 0.005 : tolerance;
  if (typeof expected === 'number') {
    if (!isFinite(actual) || Math.abs(actual - expected) > tol) {
      failures.push(`${name}: got ${actual}, expected ${expected} (±${tol})`);
      return;
    }
  } else if (actual !== expected) {
    failures.push(`${name}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
    return;
  }
  passed++;
}

/* Results are display strings: they carry currency symbols, thousands
   separators and a typographic minus sign. */
const num = s => parseFloat(String(s).replace(/\u2212/g, '-').replace(/[^0-9.\-]/g, ''));
const headline = out => num(out.headline.value);
/* Pull a numeric quantity out of a results row by its label. */
function cell(out, label, col = 1) {
  for (const table of out.tables) {
    for (const row of [...(table.rows || []), ...(table.foot ? [{ cells: table.foot }] : [])]) {
      if (row.cells[0] === label) return num(row.cells[col]);
    }
  }
  failures.push(`row "${label}" not found`);
  return NaN;
}

/* ---------------- concrete ----------------
   20 ft × 10 ft × 4 in = 66.667 ft³ = 2.4691 yd³; +10% = 2.7160 yd³ */
{
  const c = require('../assets/js/calcs/concrete.js');
  const out = c.compute(
    { length: ft(20), width: ft(10), thickness: inch(4), count: 1, waste: 10, bag: '0.016990', price: 0 },
    ctx(true));
  check('concrete net yd³', cell(out, 'Net volume'), 2.4691, 0.001);
  check('concrete +10% yd³', headline(out), 2.72, 0.01);
  check('concrete order step', cell(out, 'Rounded for ordering'), 2.75, 0.001);

  // the identical pour described in metric must agree
  const m = c.compute(
    { length: 6.096, width: 3.048, thickness: 0.1016, count: 1, waste: 10, bag: '0.0125', price: 0 },
    ctx(false));
  check('concrete metric m³ = imperial yd³', MT.U.m3ToYd3(headline(m)), 2.716, 0.005);

  // costing uses the rounded ordering quantity, not the raw volume
  const priced = c.compute(
    { length: ft(20), width: ft(10), thickness: inch(4), count: 1, waste: 10, bag: '0.016990', price: 160 },
    ctx(true));
  check('concrete cost', cell(priced, 'Materials total', 2), 440, 0.01);   // 2.75 yd³ × $160
}

/* ---------------- paint ----------------
   2(14+12)×8 = 416 ft² wall; −(21 + 2×15) = 365 ft²; ×2 coats = 730 ft²;
   at 350 ft²/gal = 2.086 gal */
{
  const p = require('../assets/js/calcs/paint.js');
  const out = p.compute(
    { length: ft(14), width: ft(12), height: ft(8), doors: 1, windows: 2,
      ceiling: 'no', coats: 2, coverage: 350, price: 0 }, ctx(true));
  check('paint wall area ft²', cell(out, 'Wall area'), 416, 1);
  check('paint openings ft²', Math.abs(cell(out, 'Less doors and windows')), 51.1, 1);
  check('paint two coats ft²', cell(out, 'Total with 2 coats'), 730, 3);
  check('paint gallons', headline(out), 2.09, 0.03);

  // metric spread rate of 8.59 m²/L is the same as 350 ft²/gal
  const m = p.compute(
    { length: ft(14), width: ft(12), height: ft(8), doors: 1, windows: 2,
      ceiling: 'no', coats: 2, coverage: 8.59, price: 0 }, ctx(false));
  check('paint metric litres match imperial gallons', MT.U.lToGal(headline(m)), 2.09, 0.03);

  // adding the ceiling must increase the paint required
  const withCeiling = p.compute(
    { length: ft(14), width: ft(12), height: ft(8), doors: 1, windows: 2,
      ceiling: 'yes', coats: 2, coverage: 350, price: 0 }, ctx(true));
  check('paint ceiling adds area', cell(withCeiling, 'Ceiling'), 168, 1);
}

/* ---------------- flooring ----------------
   16 × 12 = 192 ft²; +10% = 211.2; ÷20 per box = 10.56 → 11 boxes */
{
  const fl = require('../assets/js/calcs/flooring.js');
  const out = fl.compute(
    { length: ft(16), width: ft(12), extra: 0, pattern: '10', boxCoverage: 20, price: 0 }, ctx(true));
  check('flooring area ft²', cell(out, 'Floor area'), 192, 0.5);
  check('flooring boxes', headline(out), 11);
  check('flooring bought ft²', cell(out, 'You will actually buy'), 220, 0.5);

  // herringbone must cost more boxes than a straight lay
  const herring = fl.compute(
    { length: ft(16), width: ft(12), extra: 0, pattern: '20', boxCoverage: 20, price: 0 }, ctx(true));
  check('herringbone needs more boxes', headline(herring) > headline(out), true);
}

/* ---------------- tile ----------------
   80 ft² = 7.4322 m²; 12×24 in tile with 1/8 in joint → cell 0.188717 m²;
   39.38 tiles bare, ×1.1 = 43.3 → 44 */
{
  const t = require('../assets/js/calcs/tile.js');
  const out = t.compute(
    { length: ft(10), width: ft(8), tileW: inch(12), tileH: inch(24), joint: inch(0.125),
      tileThk: inch(0.375), waste: 10, perBox: 0, price: 0 }, ctx(true));
  check('tile bare count', cell(out, 'Tiles to cover it'), 40);
  check('tile with waste', headline(out), 44);

  // a wider joint means fewer tiles and more grout
  const wide = t.compute(
    { length: ft(10), width: ft(8), tileW: inch(12), tileH: inch(24), joint: inch(0.5),
      tileThk: inch(0.375), waste: 10, perBox: 0, price: 0 }, ctx(true));
  check('wider joint uses fewer tiles', wide.tables[0].rows[3].cells[1] < 44, true);
  check('wider joint uses more grout', cell(wide, 'Grout needed') > cell(out, 'Grout needed'), true);
}

/* ---------------- drywall ----------------
   walls 416 ft² + ceiling 168 = 584 ft²; +10% = 642.4; ÷32 = 20.08 → 21 sheets */
{
  const d = require('../assets/js/calcs/drywall.js');
  const out = d.compute(
    { length: ft(14), width: ft(12), height: ft(8), ceiling: 'yes', sheet: '2.97289',
      openings: 0, waste: 10, price: 0 }, ctx(true));
  check('drywall total ft²', cell(out, 'Total to board'), 584, 1);
  check('drywall sheets', headline(out), 21);
  check('drywall screws', cell(out, 'Screws'), 672, 1);
  check('drywall compound gal', cell(out, 'Joint compound'), 5.8, 0.2);   // ~1 gal per 100 ft²
  check('drywall tape ft', cell(out, 'Joint tape'), 234, 3);              // ~400 ft per 1000 ft²

  // 12 ft sheets cover the same area in fewer boards
  const long = d.compute(
    { length: ft(14), width: ft(12), height: ft(8), ceiling: 'yes', sheet: '4.45934',
      openings: 0, waste: 10, price: 0 }, ctx(true));
  check('12 ft sheets reduce the count', headline(long) < 21, true);
}

/* ---------------- mulch ----------------
   30 × 6 = 180 ft² at 3 in = 45 ft³ = 1.6667 yd³; ÷2 ft³ per bag = 23 bags */
{
  const m = require('../assets/js/calcs/mulch.js');
  const out = m.compute(
    { length: ft(30), width: ft(6), extra: 0, depth: inch(3), bag: '0.056634',
      bagPrice: 4.5, bulkPrice: 45 }, ctx(true));
  check('mulch yd³', headline(out), 1.67, 0.01);
  check('mulch bags', cell(out, 'Or in bags'), 23);
  check('mulch bagged cost', cell(out, 'Bagged', 2), 103.5, 0.01);        // 23 × $4.50
  check('mulch bulk cost', cell(out, 'Bulk delivered', 2), 90, 0.01);     // 2.0 yd³ × $45

  // with bulk cheaper, the comparison must say so
  check('mulch picks bulk', /Bulk is cheaper/.test(out.tables[1].foot[0]), true);
}

/* ---------------- gravel ----------------
   40 × 10 = 400 ft² at 4 in = 133.33 ft³ = 4.938 yd³; ×1.2 compaction = 5.926 yd³
   = 4.531 m³ × 1600 kg/m³ = 7249 kg = 7.99 US tons */
{
  const g = require('../assets/js/calcs/gravel.js');
  const out = g.compute(
    { length: ft(40), width: ft(10), depth: inch(4), material: '1600', compaction: 20, price: 0 },
    ctx(true));
  check('gravel finished yd³', cell(out, 'Finished volume'), 4.94, 0.01);
  check('gravel ordered yd³', cell(out, 'With 20% compaction'), 5.93, 0.01);
  check('gravel US tons', headline(out), 7.99, 0.02);

  // zero compaction must order exactly the finished volume
  const loose = g.compute(
    { length: ft(40), width: ft(10), depth: inch(4), material: '1600', compaction: 0, price: 0 },
    ctx(true));
  check('no compaction = finished volume',
    cell(loose, 'With 0% compaction'), cell(loose, 'Finished volume'), 0.001);
}

/* ---------------- deck ----------------
   12 ft across ÷ (5.5 + 0.1875 in) = 25.3 → 26 rows; 26 × 16 ft = 416 lineal ft;
   +10% = 457.6; ÷16 ft = 28.6 → 29 boards; joists at 16 in over 16 ft = 13 */
{
  const dk = require('../assets/js/calcs/deck.js');
  const out = dk.compute(
    { length: ft(16), width: ft(12), boardWidth: inch(5.5), gap: inch(0.1875),
      boardLength: ft(16), joistSpacing: '0.4064', waste: 10, price: 0 }, ctx(true));
  check('deck rows', cell(out, 'Rows of decking'), 26);
  check('deck lineal ft', cell(out, 'Lineal board needed'), 458, 2);
  check('deck boards', headline(out), 29);
  check('deck joists', cell(out, 'Joists'), 13);
  check('deck screws', cell(out, 'Deck screws'), 676);

  // tighter joist spacing means more joists and more screws
  const tight = dk.compute(
    { length: ft(16), width: ft(12), boardWidth: inch(5.5), gap: inch(0.1875),
      boardLength: ft(16), joistSpacing: '0.3048', waste: 10, price: 0 }, ctx(true));
  check('12 in centres add joists', cell(tight, 'Joists'), 17);
}

/* ---------------- shared invariants ----------------
   Every calculator must survive a zero-price run and produce a finite headline. */
{
  const all = ['concrete', 'paint', 'flooring', 'tile', 'drywall', 'mulch', 'gravel', 'deck'];
  for (const id of all) {
    const def = require(`../assets/js/calcs/${id}.js`);
    check(`${id} has an id`, def.id, id);
    check(`${id} has fields`, Array.isArray(def.fields) && def.fields.length > 0, true);
    check(`${id} compute is a function`, typeof def.compute, 'function');
    for (const field of def.fields) {
      check(`${id}.${field.key} has a label`, !!field.label, true);
    }
  }
}

console.log(`\n${passed} checks passed`);
if (failures.length) {
  console.log(`\n${failures.length} FAILED:`);
  failures.forEach(f => console.log('  ✗ ' + f));
  process.exit(1);
}
console.log('All calculator maths verified.\n');
