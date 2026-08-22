# -*- coding: utf-8 -*-
"""Calculator page content, part 4."""

CALCULATORS_D = [
{
  "slug": "gravel",
  "calc_id": "gravel",
  "script": "gravel.js",
  "short": "Gravel & base",
  "icon": "▚",
  "card": "Tons and cubic yards of aggregate, with a compaction allowance for sub-base work.",
  "title": "Gravel Calculator — Tons, Cubic Yards and Base Depth",
  "h1": "Gravel, sand &amp; base calculator",
  "description": "Convert a driveway or patio base into cubic yards and tons of gravel, crusher run, sand or river rock, including a compaction allowance.",
  "intro": [
    "Aggregate is ordered by volume and sold by weight, which is where the confusion starts. Ask for &ldquo;three yards of gravel&rdquo; and you will be quoted in tons, and the conversion between the two depends on what the material actually is.",
    "This calculator does both, applies a compaction allowance so the finished depth is the depth you asked for, and shows the density it used so you can sanity-check the number against your supplier's.",
  ],
  "sections": [
    {
      "h2": "How the maths works",
      "html": """
<div class="formula">finished volume = length &times; width &times; depth<br>
ordered volume = finished volume &times; (1 + compaction %)<br>
weight = ordered volume &times; bulk density</div>
<p>A 40&nbsp;ft &times; 10&nbsp;ft driveway base at 4&nbsp;in finished depth is 133&nbsp;ft&sup3;, or 4.94 cubic yards in place. Add 20% for compaction and you are ordering 5.93 cubic yards &mdash; about 8 US tons of crushed stone.</p>
<p>That 20% is not optional on base material. Crusher run delivered loose and then plate-compacted loses roughly a fifth of its volume. Order the finished depth and your base will end up an inch shallow.</p>
"""
    },
    {
      "h2": "Bulk density by material",
      "html": """
<table>
  <thead><tr><th>Material</th><th class="num">kg/m&sup3;</th><th class="num">US tons per yd&sup3;</th></tr></thead>
  <tbody>
    <tr><td>Crushed stone / gravel</td><td class="num">1,600</td><td class="num">1.35</td></tr>
    <tr><td>Crusher run / road base</td><td class="num">1,750</td><td class="num">1.48</td></tr>
    <tr><td>Pea gravel</td><td class="num">1,700</td><td class="num">1.43</td></tr>
    <tr><td>Sand</td><td class="num">1,600</td><td class="num">1.35</td></tr>
    <tr><td>River rock</td><td class="num">1,650</td><td class="num">1.39</td></tr>
    <tr><td>Topsoil</td><td class="num">1,300</td><td class="num">1.10</td></tr>
  </tbody>
</table>
<p>Treat these as central estimates with about &plusmn;10% of spread. Moisture content alone moves the number several percent &mdash; wet sand weighs meaningfully more than dry sand, and you pay for the water. Your local quarry will give you their actual figure if you ask, and it is worth asking on a big order.</p>
"""
    },
    {
      "h2": "How deep should the base be?",
      "html": """
<table>
  <thead><tr><th>Application</th><th class="num">Compacted base depth</th></tr></thead>
  <tbody>
    <tr><td>Paver patio, foot traffic</td><td class="num">4 in</td></tr>
    <tr><td>Paver driveway, cars</td><td class="num">8&ndash;12 in</td></tr>
    <tr><td>Gravel driveway, new build</td><td class="num">8&ndash;12 in in layers</td></tr>
    <tr><td>Gravel driveway, top dressing</td><td class="num">2&ndash;3 in</td></tr>
    <tr><td>Shed or slab base</td><td class="num">4&ndash;6 in</td></tr>
    <tr><td>Drainage trench</td><td class="num">Fill the trench</td></tr>
  </tbody>
</table>
<p>Anything over about 4&nbsp;inches should go down in layers &mdash; called lifts &mdash; of no more than 4&nbsp;inches, compacting each one before the next. A plate compactor simply cannot densify the bottom of a 10-inch pour, and an uncompacted layer down there will settle later and take your finished surface with it.</p>
<p>On clay or soft soil, a geotextile fabric under the base is cheap and stops the stone slowly migrating into the subgrade. It is the single best value item in the whole job.</p>
"""
    },
    {
      "h2": "Ordering and delivery",
      "html": """
<p>Delivery is usually the largest single line on a small aggregate order, and it is charged per trip rather than per ton. Two half-loads cost roughly twice what one full load costs, so it is worth rounding up to a sensible truck quantity if you have anywhere to store the surplus.</p>
<p>A standard tandem dump truck carries roughly 10&ndash;14 US tons. Below about 5 tons you may be better off with a smaller truck or a trailer, and above 14 you are into multiple trips. Ask for the delivered price rather than the yard price &mdash; the difference is often 30% or more.</p>
"""
    },
  ],
  "faq": [
    ("How many tons is a yard of gravel?",
     "About 1.35 US tons for standard crushed stone, and closer to 1.48 for crusher run because the fines pack the voids. Sand is around 1.35 and topsoil closer to 1.1. Moisture moves all of these by several percent."),
    ("How deep should a gravel driveway be?",
     "Eight to twelve inches of compacted base for a new driveway, built up in 4 inch lifts and compacted between each. If you are just refreshing the surface of an existing driveway, two to three inches of top dressing is normal."),
    ("What is crusher run?",
     "Crushed stone that still contains all its fines — the dust and small particles from crushing. Those fines fill the voids between the larger stones so it compacts into a hard, stable layer. Clean washed stone has the fines removed and stays loose, which is what you want for drainage but not for a base."),
    ("Do I need the compaction allowance?",
     "For any base material that will be plate-compacted, yes — 20% is a reasonable default. Set it to zero for loose decorative stone such as river rock or pea gravel that you are simply spreading."),
    ("Should I use landscape fabric under gravel?",
     "Under a driveway or patio base on soft or clay soil, a woven geotextile is well worth it — it stops the stone sinking into the subgrade over the years. Light landscape fabric under decorative gravel mainly slows weeds and is a different, thinner product."),
  ],
  "related": ["concrete", "mulch", "deck"],
},
{
  "slug": "deck",
  "calc_id": "deck",
  "script": "deck.js",
  "short": "Deck boards",
  "icon": "☰",
  "card": "Board count, lineal footage, joists and screws for a rectangular deck.",
  "title": "Deck Board Calculator — Boards, Joists and Screws",
  "h1": "Deck board calculator",
  "description": "Work out how many deck boards a rectangular deck needs, including the gap between boards, lineal footage, joist count and deck screws.",
  "intro": [
    "Deck boards are ordered in lineal feet but installed in rows, and the two are separated by a detail that trips up nearly every first-time estimate: the gap. A 5-1/2&nbsp;inch board with a 3/16&nbsp;inch gap does not cover 5-1/2&nbsp;inches of deck, and across a twelve-foot span that difference is most of an extra row.",
    "This calculates the rows from the real board pitch, converts to lineal footage and boards, and works out the joists and fasteners underneath.",
  ],
  "sections": [
    {
      "h2": "How the maths works",
      "html": """
<div class="formula">pitch = board width + gap<br>
rows = deck width &divide; pitch, <em>rounded up</em><br>
lineal = rows &times; deck length &times; (1 + waste %)<br>
boards = lineal &divide; board length, <em>rounded up</em></div>
<p>A 16&nbsp;ft &times; 12&nbsp;ft deck with 5-1/2&nbsp;in boards and a 3/16&nbsp;in gap has a pitch of 5.6875&nbsp;in. Twelve feet is 144&nbsp;in, so you need 26 rows. That is 26 &times; 16 = 416 lineal feet, 458 with 10% waste, and 29 boards at 16&nbsp;ft each.</p>
<p>The calculator also shows what happens if you refuse to butt-join anything and run one continuous board per row: 26 boards, less waste, but every board must be a full 16&nbsp;footer, which is more expensive per board and harder to source straight.</p>
"""
    },
    {
      "h2": "The gap, and why treated lumber changes it",
      "html": """
<p>Decking needs a gap for drainage and airflow. How much depends on what the board is doing next:</p>
<ul>
  <li><strong>Kiln-dried or dry lumber:</strong> gap it at 3/16&nbsp;in. It is already at moisture equilibrium and will not move much.</li>
  <li><strong>Wet-treated lumber</strong> &mdash; the heavy, dripping kind straight off the rack &mdash; shrinks across its width as it dries, sometimes by a quarter inch on a 5-1/2&nbsp;in board. Install these nearly touching, with just a nail shank as a spacer, and let the gap open up as they dry.</li>
  <li><strong>Composite:</strong> follow the manufacturer, always. Composite expands lengthwise with heat rather than shrinking across its width, and the end gaps matter more than the side gaps.</li>
</ul>
<p>Getting this backwards is the classic deck mistake. Gap wet lumber at 3/16&nbsp;in and you will end up with half-inch gaps a heel can catch in.</p>
"""
    },
    {
      "h2": "Joist spacing",
      "html": """
<table>
  <thead><tr><th>Decking</th><th class="num">Spacing</th></tr></thead>
  <tbody>
    <tr><td>Timber, laid perpendicular</td><td class="num">16 in / 400 mm</td></tr>
    <tr><td>Timber, laid diagonally</td><td class="num">12 in / 300 mm</td></tr>
    <tr><td>Most composite, perpendicular</td><td class="num">12&ndash;16 in — check the brand</td></tr>
    <tr><td>Composite, diagonal</td><td class="num">12 in / 300 mm</td></tr>
    <tr><td>Under a hot tub or heavy load</td><td class="num">Engineered — not a rule of thumb</td></tr>
  </tbody>
</table>
<p>Laying boards diagonally increases the unsupported span between joists by about 40%, which is why the spacing tightens. Composite in particular sags between joists that are too far apart, and it does not spring back.</p>
<p>Joist spacing and span are code items in every jurisdiction I know of. Check yours before ordering framing, because the span tables are not optional and an inspector will find it.</p>
"""
    },
    {
      "h2": "What is not included",
      "html": """
<p>This covers the walking surface and the joists directly under it. Not included: beams, posts, footings, joist hangers and connectors, ledger board and its flashing, stairs, railing, or the hardware for any of it.</p>
<p>On a typical deck those items are a large share of the total cost &mdash; railing alone is often a quarter of the material bill. Two details worth naming because they are the ones that fail: <strong>ledger flashing</strong>, which keeps water out of the rim joist and is the single most common cause of a deck collapsing away from a house, and <strong>the fasteners themselves</strong>, which must be rated for contact with modern treated lumber or they will corrode. Use hot-dip galvanised or stainless.</p>
"""
    },
  ],
  "faq": [
    ("How many boards do I need for a 12 × 16 deck?",
     "With 5-1/2 in boards and a 3/16 in gap, a 12 ft width needs 26 rows. At 16 ft long that is 416 lineal feet, or 29 boards of 16 ft once you add 10% waste. If you run one full-length board per row with no joins, it is 26 boards."),
    ("What gap should I leave between deck boards?",
     "About 3/16 in for dry or kiln-dried lumber. For wet-treated lumber, install them nearly touching and let the gap open as they dry — they shrink across the width. For composite, follow the manufacturer's figure exactly."),
    ("Should joists be 16 in or 12 in on centre?",
     "Sixteen inches is standard for timber decking laid perpendicular to the joists. Go to 12 in for diagonal layouts and for most composite decking, and check the decking manufacturer's requirement — many void the warranty at 16 in."),
    ("How many screws per deck board?",
     "Two at every joist crossing. A 16 ft board over joists at 16 in centres crosses 13 joists, so 26 screws per board. Use screws rated for treated lumber — hot-dip galvanised or stainless."),
    ("Which direction should deck boards run?",
     "Usually parallel to the longest side of the house, so the joists span the shorter direction. Enter that dimension as the deck length here — it is the direction the boards run."),
  ],
  "related": ["concrete", "gravel", "flooring"],
},
]
