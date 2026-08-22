# -*- coding: utf-8 -*-
"""Calculator page content, part 2."""

CALCULATORS_B = [
{
  "slug": "flooring",
  "calc_id": "flooring",
  "script": "flooring.js",
  "short": "Flooring",
  "icon": "▤",
  "card": "Boxes of laminate, vinyl plank or hardwood, with the right waste factor for your lay pattern.",
  "title": "Flooring Calculator — How Many Boxes Do You Need",
  "h1": "Flooring calculator",
  "description": "Work out how many boxes of laminate, vinyl plank or hardwood a room needs, with waste allowances for straight, diagonal and herringbone layouts.",
  "intro": [
    "Flooring is sold by the box, and boxes are the only unit that matters. Knowing you need 211 square feet is useless if the boxes come in twenty-square-foot lots &mdash; what you need to know is eleven.",
    "The other thing that matters, and that almost nobody accounts for on the first attempt, is that the waste factor depends on how you are laying the planks. A herringbone floor throws away twice as much material as a straight lay in the same room.",
  ],
  "sections": [
    {
      "h2": "How the maths works",
      "html": """
<div class="formula">area = length &times; width (+ closets and bays)<br>
with waste = area &times; (1 + waste %)<br>
boxes = with waste &divide; coverage per box, <em>rounded up</em></div>
<p>A 16 ft &times; 12 ft room is 192&nbsp;ft&sup2;. A straight lay adds 10%, giving 211&nbsp;ft&sup2;. At 20&nbsp;ft&sup2; per box that is 10.6 boxes &mdash; so eleven, and you finish with about 28&nbsp;ft&sup2; spare.</p>
<p>That spare is not waste. It is your repair stock, and you should keep it.</p>
"""
    },
    {
      "h2": "Waste allowance by lay pattern",
      "html": """
<table>
  <thead><tr><th>Pattern</th><th class="num">Waste</th><th>Why</th></tr></thead>
  <tbody>
    <tr><td>Straight, plain rectangular room</td><td class="num">10%</td><td>End cuts start the next row</td></tr>
    <tr><td>Straight, complex room</td><td class="num">15%</td><td>Every doorway and jog creates an unusable offcut</td></tr>
    <tr><td>Diagonal (45&deg;)</td><td class="num">15%</td><td>Every plank meets the wall at an angle</td></tr>
    <tr><td>Herringbone or chevron</td><td class="num">20%</td><td>Short pieces, and the pattern dictates the cut</td></tr>
    <tr><td>Wide plank over 7 in</td><td class="num">+5%</td><td>Less scope to reuse offcuts</td></tr>
  </tbody>
</table>
<p>If your room has more than about three doorways, a bay, or a staircase landing, take the next allowance up. The waste factor is not really about the planks &mdash; it is about how many cuts leave you with a piece too short to start a row.</p>
"""
    },
    {
      "h2": "Buy it all at once, and check the lot number",
      "html": """
<p>This is the single most expensive mistake in flooring, and it is entirely avoidable.</p>
<p>Flooring is manufactured in batches, and colour shifts between them. Laminate and LVP print in runs; engineered hardwood is stained in lots. Two boxes with the same SKU from different production runs can be visibly different under a window, and the difference often does not show until the floor is down and the light changes.</p>
<p>So: order the whole job in one purchase, check that every box carries the same lot or batch code, and open and mix planks from several boxes as you lay so any small variation is distributed rather than concentrated in one area. Then keep a full spare box. Product lines are discontinued constantly, and a single damaged plank in three years is the difference between a twenty-minute repair and a new floor.</p>
"""
    },
    {
      "h2": "What is not in the box",
      "html": """
<ul>
  <li><strong>Underlayment</strong> &mdash; unless the plank has it pre-attached. Sold by the roll, typically 100&nbsp;ft&sup2;.</li>
  <li><strong>Transition strips</strong> at every doorway and where the floor meets a different surface.</li>
  <li><strong>Quarter round or base shoe</strong> to cover the expansion gap around the perimeter.</li>
  <li><strong>Moisture barrier</strong> over concrete subfloors, which most manufacturers require for the warranty to hold.</li>
  <li><strong>Adhesive</strong> for glue-down products.</li>
</ul>
<p>Leave the expansion gap the manufacturer specifies &mdash; usually a quarter inch around every wall. Floating floors move with humidity, and a floor butted tight to the wall will buckle in its first humid summer.</p>
"""
    },
  ],
  "faq": [
    ("How much extra flooring should I buy?",
     "Ten percent over the measured area for a straight lay in a simple rectangular room, 15% for a diagonal layout or a room with several doorways, and 20% for herringbone. Then round up to whole boxes, and keep the remainder."),
    ("Can I return unopened boxes?",
     "Usually yes, but check before you buy — many suppliers charge a restocking fee and some special orders are final. It is worth asking, because it lets you order generously without risk."),
    ("Do I need underlayment?",
     "For floating floors, almost always: it handles minor subfloor irregularities, cushions the click joints and cuts noise. Skip it only if your plank has underlayment already attached, and never skip the moisture barrier over concrete."),
    ("How do I work out flooring for stairs?",
     "Stairs are priced by the tread, not by area. Count treads and risers and price stair nosing separately — it is a specific profile and it is expensive relative to plain plank."),
    ("What if my room is not rectangular?",
     "Break it into rectangles, calculate the main one here, and add the others through the extra area field. Measure each rectangle at its widest point rather than averaging."),
  ],
  "related": ["tile", "paint", "drywall"],
},
{
  "slug": "tile",
  "calc_id": "tile",
  "script": "tile.js",
  "short": "Tile & grout",
  "icon": "▩",
  "card": "Tile counts that account for the grout joint, plus a grout quantity derived from tile size and depth.",
  "title": "Tile Calculator — Tile Count and Grout Quantity",
  "h1": "Tile &amp; grout calculator",
  "description": "Count tiles for a floor or wall including the grout joint, and estimate how much grout the job needs based on tile size, joint width and tile thickness.",
  "intro": [
    "The grout joint is not a rounding error. A 12&nbsp;&times;&nbsp;24 tile with a quarter-inch joint occupies noticeably more wall than the same tile laid tight, and over a large area that is the difference between ordering enough and coming up a box short.",
    "This calculator works from the repeating cell &mdash; one tile plus one joint &mdash; rather than the bare tile face, and derives grout from the volume that cell leaves empty rather than from a generic coverage chart.",
  ],
  "sections": [
    {
      "h2": "How the maths works",
      "html": """
<p>Each tile really occupies a rectangle one joint wider and one joint taller than itself, because it shares half a joint with each neighbour:</p>
<div class="formula">cell area = (tile width + joint) &times; (tile height + joint)<br>
tiles = area &divide; cell area, &times; (1 + waste %)</div>
<p>For a 100&nbsp;ft&sup2; floor in 12&nbsp;&times;&nbsp;24 in tile with a 1/8&nbsp;in joint: the cell is 12.125 &times; 24.125 in = 2.03&nbsp;ft&sup2;, so you need 49.2 tiles bare, and 55 with a 10% allowance.</p>
<p>Grout comes from the same cell. Whatever the cell is that the tile does not cover, to the depth of the tile, is grout:</p>
<div class="formula">grout fraction = (cell area &minus; tile face area) &divide; cell area<br>
grout volume = area &times; grout fraction &times; tile thickness</div>
<p>This is why large-format tile uses so little grout and mosaic uses so much. It has nothing to do with the floor area and everything to do with how much joint per square foot the tile size creates.</p>
"""
    },
    {
      "h2": "Choosing the joint width",
      "html": """
<table>
  <thead><tr><th>Tile type</th><th class="num">Typical joint</th></tr></thead>
  <tbody>
    <tr><td>Rectified porcelain, large format</td><td class="num">1/16&ndash;1/8 in (2&ndash;3 mm)</td></tr>
    <tr><td>Standard pressed ceramic</td><td class="num">1/8&ndash;3/16 in (3&ndash;5 mm)</td></tr>
    <tr><td>Handmade or rustic tile</td><td class="num">1/4 in (6 mm) or more</td></tr>
    <tr><td>Natural stone</td><td class="num">1/16&ndash;1/8 in (2&ndash;3 mm)</td></tr>
    <tr><td>Mosaic sheets</td><td class="num">Set by the sheet</td></tr>
  </tbody>
</table>
<p>Only rectified tile &mdash; mechanically cut to an exact size after firing &mdash; can hold a very tight joint. Pressed tile varies enough in size that a 1/16&nbsp;in joint leaves you no room to absorb the difference, and the lines will wander visibly.</p>
"""
    },
    {
      "h2": "Waste, and why it is higher than you think",
      "html": """
<p>Ten percent covers a straightforward floor in a rectangular room. Increase it for:</p>
<ul>
  <li><strong>Diagonal layouts</strong> &mdash; 15%, because every perimeter tile is cut on an angle and the offcut is rarely reusable.</li>
  <li><strong>Small rooms with many cuts</strong> &mdash; a bathroom floor around a toilet, vanity and door threshold can hit 20% on a tiny area.</li>
  <li><strong>Large-format tile</strong> &mdash; a bad cut wastes four square feet, not one.</li>
  <li><strong>Patterned tile with a directional design</strong> &mdash; you cannot rotate an offcut to use it.</li>
</ul>
<p>And keep a box back. Tile is discontinued faster than almost any other finish material.</p>
"""
    },
    {
      "h2": "About the grout figure",
      "html": """
<p>The grout estimate is geometrically correct for the numbers you enter, but real jobs use more. Tile backs are not flat, joints end up slightly wider than planned in places, and some grout is always lost to mixing and cleanup. Treat the number as a floor rather than a target, and buy at least one bag over.</p>
<p>Grout weight assumes a cementitious product at roughly 1,600&nbsp;kg/m&sup3;. Epoxy grout is denser and is sold by the kit rather than by weight, so use the kit coverage chart for that instead.</p>
<p>Thinset is not calculated here at all, because coverage depends almost entirely on trowel notch size &mdash; a 1/4&nbsp;in square notch and a 1/2&nbsp;in notch differ by more than double. Read the bag.</p>
"""
    },
  ],
  "faq": [
    ("How many 12 × 24 tiles are in 100 square feet?",
     "With a 1/8 in grout joint, each tile occupies 2.03 ft², so 100 ft² needs 49.2 tiles — call it 50 bare, or 55 with a 10% waste allowance. Without any joint the bare figure would be 50, which shows how little difference a thin joint makes on a large tile."),
    ("How much grout do I need?",
     "It depends far more on tile size than floor size. A 100 ft² floor in 12 × 24 tile with 1/8 in joints needs only about 5 lb of grout; the same floor in 4 × 4 mosaic needs several times that, because there is vastly more joint per square foot."),
    ("What waste percentage for a diagonal tile layout?",
     "Fifteen percent, and 20% if the room is small or has a lot of obstacles. Every tile meeting a wall at 45° is cut, and the triangular offcut usually cannot be used anywhere else."),
    ("Do I need to seal grout?",
     "Cementitious grout is porous and should be sealed in wet areas and on floors. Epoxy grout does not need sealing. Sealing is a separate product and is not included in these quantities."),
    ("Should I buy tile by the box or loose?",
     "By the box, and all in one order with matching batch codes. Enter your tiles-per-box figure above and the calculator will convert the count for you."),
  ],
  "related": ["flooring", "drywall", "paint"],
},
]
