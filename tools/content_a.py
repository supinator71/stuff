# -*- coding: utf-8 -*-
"""Calculator page content, part 1."""

CALCULATORS_A = [
{
  "slug": "concrete",
  "calc_id": "concrete",
  "script": "concrete.js",
  "short": "Concrete",
  "icon": "▦",
  "card": "Slabs and footings in cubic yards or metres, plus the bag count if you are mixing by hand.",
  "title": "Concrete Calculator — Slab, Footing and Bag Quantities",
  "h1": "Concrete calculator",
  "description": "Work out cubic yards or cubic metres of concrete for a slab or footing, how many 80 lb bags that is, and what the ready-mix will cost. Feet-and-inches input supported.",
  "intro": [
    "Concrete is the one material where guessing costs you twice. Order short and the truck leaves; the joint between what you poured and what arrives later is a cold joint, and it is a permanent weak line through the slab. Order long and you pay for concrete you have to find somewhere to dump.",
    "This calculator takes the dimensions of a rectangular pour, adds a waste allowance, and gives you the volume in the units your supplier actually sells in — rounded up to the quarter yard or tenth of a cubic metre that ends up on the ticket.",
  ],
  "sections": [
    {
      "h2": "How the maths works",
      "html": """
<p>Volume is the easy part. The whole calculation is length &times; width &times; thickness, with the thickness converted out of inches first:</p>
<div class="formula">cubic feet = length (ft) &times; width (ft) &times; thickness (in) &divide; 12<br>
cubic yards = cubic feet &divide; 27</div>
<p>A 20 ft &times; 10 ft patio at 4 inches thick works out at 20 &times; 10 &times; 0.333 = 66.7 cubic feet, or 2.47 cubic yards. Add 10% and you are ordering 2.75 &mdash; the next quarter-yard step up.</p>
<p>The division by 27 is where most hand calculations go wrong. There are 27 cubic feet in a cubic yard, not 9. Three feet in a yard, cubed.</p>
"""
    },
    {
      "h2": "Why the waste allowance is not padding",
      "html": """
<p>Ten percent sounds generous until you have poured a slab. It disappears into:</p>
<ul>
  <li><strong>Subgrade that is not flat.</strong> A dip of half an inch across a 200&nbsp;ft&sup2; slab is an extra 8&nbsp;ft&sup3; of concrete, and subgrades are never flat.</li>
  <li><strong>Over-excavated edges.</strong> The perimeter is always dug slightly wide, and concrete fills whatever is there.</li>
  <li><strong>Spillage and what sticks in the barrow.</strong> Real, and worse on a hot day.</li>
  <li><strong>Forms that bow.</strong> Wet concrete pushes hard. A form that flexes a quarter inch over 20 feet costs you another few cubic feet.</li>
</ul>
<p>Use 10% for a formed slab on a prepared base. Push to 15% for footings dug straight into soil, where the trench walls are rough and the volume is genuinely unpredictable.</p>
"""
    },
    {
      "h2": "Bags or ready-mix?",
      "html": """
<p>The break-even is lower than most people expect. A cubic yard is 45 &times; 80&nbsp;lb bags &mdash; roughly 3,600&nbsp;lb of material to carry, tip, and mix in batches, which is most of a day for one person with a mixer.</p>
<table>
  <thead><tr><th>Bag size</th><th class="num">Yield</th><th class="num">Bags per cubic yard</th></tr></thead>
  <tbody>
    <tr><td>80 lb</td><td class="num">0.60 ft&sup3;</td><td class="num">45</td></tr>
    <tr><td>60 lb</td><td class="num">0.45 ft&sup3;</td><td class="num">60</td></tr>
    <tr><td>40 lb</td><td class="num">0.30 ft&sup3;</td><td class="num">90</td></tr>
    <tr><td>25 kg</td><td class="num">12.5 L</td><td class="num">80 per m&sup3;</td></tr>
  </tbody>
</table>
<p>Under about a third of a yard, bags win outright. Between a third of a yard and a full yard it depends on the short-load fee your local plant charges &mdash; ask, because it is often $60&ndash;$150 and it changes the answer. Above one yard, ready-mix is almost always cheaper, and it is certainly better concrete: a truck gives you one consistent mix placed in one go, where 45 hand-mixed batches give you 45 slightly different ones.</p>
"""
    },
    {
      "h2": "How thick should it be?",
      "html": """
<table>
  <thead><tr><th>Application</th><th class="num">Typical thickness</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Garden path, shed base</td><td class="num">3&ndash;4 in</td><td>Foot traffic only</td></tr>
    <tr><td>Patio</td><td class="num">4 in</td><td>Over 4 in of compacted base</td></tr>
    <tr><td>Driveway, car only</td><td class="num">4&ndash;5 in</td><td>5 in if the subgrade is clay</td></tr>
    <tr><td>Driveway with heavy vehicles</td><td class="num">6 in</td><td>Reinforcement expected</td></tr>
    <tr><td>Garage floor</td><td class="num">4&ndash;6 in</td><td>Check local code</td></tr>
  </tbody>
</table>
<p>These are common practice, not code. Footing depth in particular is set by your local frost line and soil bearing capacity, and that is a question for your building department rather than a website.</p>
"""
    },
    {
      "h2": "What this calculator does not cover",
      "html": """
<p>Volume, and nothing else. Not included: rebar or mesh, formwork lumber, the compacted gravel base underneath, vapour barrier, expansion joint material, delivery, pump hire, or the short-load fee. On a small residential slab those items routinely add up to more than the concrete itself, so build them into your budget separately.</p>
"""
    },
  ],
  "faq": [
    ("How many 80 lb bags of concrete make a cubic yard?",
     "Forty-five. An 80 lb bag yields about 0.60 cubic feet and there are 27 cubic feet in a cubic yard. For 60 lb bags it is 60 bags, and for 40 lb bags it is 90."),
    ("How much concrete do I need for a 10 × 10 patio?",
     "At 4 inches thick, a 10 ft × 10 ft slab is 100 ft² × 0.333 ft = 33.3 cubic feet, which is 1.23 cubic yards. With a 10% waste allowance you would order 1.5 cubic yards, or mix roughly 56 × 80 lb bags."),
    ("Can I pour a slab in two sessions?",
     "Not without consequences. Concrete placed against concrete that has already begun to set forms a cold joint, which is weaker than the surrounding slab and is a likely crack line. If a slab genuinely has to be poured in stages, plan a proper construction joint with keyed or doweled reinforcement rather than simply stopping and restarting."),
    ("Does this include rebar?",
     "No. This calculates concrete volume only. Reinforcement is sized from the span, the load and your local code, and it needs to be worked out separately."),
    ("How long before I can walk on it?",
     "Usually 24 to 48 hours for foot traffic and around seven days before vehicles, though this varies with mix design and temperature. Concrete reaches most of its design strength at 28 days. Cold weather slows everything down substantially."),
  ],
  "related": ["gravel", "deck", "drywall"],
},
{
  "slug": "paint",
  "calc_id": "paint",
  "script": "paint.js",
  "short": "Paint",
  "icon": "◑",
  "card": "Gallons or litres for a room, with doors, windows, ceilings and coats accounted for.",
  "title": "Paint Calculator — How Much Paint for a Room",
  "h1": "Paint calculator",
  "description": "Calculate how many gallons or litres of paint a room needs, allowing for doors, windows, the ceiling and the number of coats. Adjustable spread rate.",
  "intro": [
    "Most paint calculators multiply your walls by a fixed number and call it done. That is where the two most common errors come from: they ignore openings, so you buy too much, and they assume one coat, so you buy too little. Those errors do not cancel out reliably.",
    "This one deducts doors and windows, multiplies by the number of coats you are actually applying, and lets you override the spread rate with whatever is printed on the tin you are buying.",
  ],
  "sections": [
    {
      "h2": "How the maths works",
      "html": """
<div class="formula">wall area = 2 &times; (length + width) &times; height<br>
paintable = wall area &minus; doors &minus; windows (+ ceiling if painting it)<br>
paint = paintable &times; coats &divide; spread rate</div>
<p>For a 14 ft &times; 12 ft room with 8 ft walls: the perimeter is 52 ft, so the walls are 416&nbsp;ft&sup2;. Take off one door at 21&nbsp;ft&sup2; and two windows at 15&nbsp;ft&sup2; each and you have 365&nbsp;ft&sup2; of paintable wall. Two coats is 730&nbsp;ft&sup2; of coverage, and at 350&nbsp;ft&sup2; per gallon that is 2.1 gallons.</p>
<p>Note what that means in practice: you buy three one-gallon cans, or a five-gallon pail if the per-gallon price is better. Paint is sold in whole containers, so the useful answer is always rounded up.</p>
"""
    },
    {
      "h2": "Spread rate is the number that actually matters",
      "html": """
<p>Everything else in the calculation is geometry and cannot really surprise you. Spread rate can, and it varies by more than a factor of two:</p>
<table>
  <thead><tr><th>Surface</th><th class="num">Realistic spread rate</th></tr></thead>
  <tbody>
    <tr><td>Primed, smooth drywall</td><td class="num">350&ndash;400 ft&sup2;/gal</td></tr>
    <tr><td>Previously painted, same colour</td><td class="num">400 ft&sup2;/gal</td></tr>
    <tr><td>Lightly textured wall</td><td class="num">300&ndash;350 ft&sup2;/gal</td></tr>
    <tr><td>Heavy texture, knockdown</td><td class="num">250&ndash;300 ft&sup2;/gal</td></tr>
    <tr><td>Bare drywall, no primer</td><td class="num">200&ndash;250 ft&sup2;/gal</td></tr>
    <tr><td>Rough masonry or block</td><td class="num">100&ndash;200 ft&sup2;/gal</td></tr>
  </tbody>
</table>
<p>The figure on the tin is measured under laboratory conditions on a flat, sealed, primed surface. It is not a lie, but it is an upper bound. If you are rolling a textured ceiling, take 20% off before you calculate.</p>
"""
    },
    {
      "h2": "When two coats is not two coats",
      "html": """
<p>Two coats is the honest default for a colour change on a primed wall. Budget for three when:</p>
<ul>
  <li>You are going from a dark colour to a light one. Red and deep blue in particular will ghost through two coats of white.</li>
  <li>You are using a strong, saturated colour. Deep reds and yellows have low-opacity pigments and genuinely need the extra coat.</li>
  <li>You are painting over patched drywall without priming the patches. The repairs will flash &mdash; show as dull spots &mdash; through two coats.</li>
</ul>
<p>A tinted primer is usually cheaper and faster than a third finish coat. If you are making a big colour change, ask the paint counter to tint the primer towards the topcoat.</p>
"""
    },
    {
      "h2": "What the deductions assume",
      "html": """
<p>Each door is counted as 21&nbsp;ft&sup2; (1.95&nbsp;m&sup2;), which is a standard 3&nbsp;ft &times; 7&nbsp;ft opening. Each window is counted as 15&nbsp;ft&sup2; (1.4&nbsp;m&sup2;). If your windows are unusually large &mdash; a patio slider, a picture window &mdash; count it as two or three windows rather than one.</p>
<p>Deducting openings is worth doing but do not agonise over it: getting it slightly wrong changes the answer by a fraction of a gallon. Getting the spread rate or the coat count wrong changes it by whole gallons.</p>
"""
    },
  ],
  "faq": [
    ("How much paint do I need for a 12 × 12 room?",
     "With 8 ft ceilings, a 12 ft × 12 ft room has 384 ft² of wall. Less one door and two windows, that is about 333 ft². Two coats at 350 ft² per gallon comes to 1.9 gallons — so two one-gallon cans, with very little to spare."),
    ("Do I need to include the ceiling?",
     "Only if you are painting it, and ceilings usually take a different product — a flat, higher-hide ceiling paint rather than a wall finish. Toggle the ceiling on to see the area, but price the ceiling paint separately."),
    ("Is one coat ever enough?",
     "Repainting the same colour on a sound, previously painted wall, yes. Any colour change, any bare or patched substrate, and any strong colour needs two as a minimum."),
    ("How much paint for trim and doors?",
     "Trim is bought by the quart, not calculated by area. As a rough guide, one quart covers the trim in an average bedroom, and a door takes about a quarter of a quart per side per coat."),
    ("Should I buy the exact amount?",
     "Buy slightly over and keep the remainder sealed. Touching up later with the same batch is invisible; touching up with a fresh can, even the same colour code, often is not."),
  ],
  "related": ["drywall", "flooring", "tile"],
},
]
