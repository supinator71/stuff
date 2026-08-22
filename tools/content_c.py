# -*- coding: utf-8 -*-
"""Calculator page content, part 3."""

CALCULATORS_C = [
{
  "slug": "drywall",
  "calc_id": "drywall",
  "script": "drywall.js",
  "short": "Drywall",
  "icon": "▭",
  "card": "Sheets, screws, joint compound and tape for a room, in your choice of board size.",
  "title": "Drywall Calculator — Sheets, Screws, Compound and Tape",
  "h1": "Drywall calculator",
  "description": "Work out how many drywall sheets a room needs in 4×8, 4×10 or 4×12, plus the screws, joint compound and tape to finish it.",
  "intro": [
    "Sheet count is straightforward arithmetic. What catches people out is everything else on the load: the screws, the compound, the tape, and the fact that choosing a longer board changes how much finishing work you have signed up for.",
    "This works out all four, and it treats board size as a decision rather than an afterthought &mdash; because it is the one choice on this page that affects how good the finished wall looks.",
  ],
  "sections": [
    {
      "h2": "How the maths works",
      "html": """
<div class="formula">wall area = 2 &times; (length + width) &times; height<br>
total = wall area + ceiling (if boarding it)<br>
sheets = total &times; (1 + waste %) &divide; area per sheet, <em>rounded up</em></div>
<p>A 14&nbsp;&times;&nbsp;12&nbsp;ft room with 8&nbsp;ft walls has 416&nbsp;ft&sup2; of wall. Add the 168&nbsp;ft&sup2; ceiling and you are boarding 584&nbsp;ft&sup2;. With 10% waste that is 642&nbsp;ft&sup2;, which at 32&nbsp;ft&sup2; per 4&nbsp;&times;&nbsp;8 sheet comes to 21 sheets.</p>
<p>Most estimators board straight over door and window openings and cut them out afterwards &mdash; it is faster, and it guarantees the joints do not land at a corner of the opening, which is exactly where cracks start. That is why the deduction field defaults to zero.</p>
"""
    },
    {
      "h2": "Sheet size is a finishing decision",
      "html": """
<table>
  <thead><tr><th>Sheet</th><th class="num">Area</th><th>Use when</th></tr></thead>
  <tbody>
    <tr><td>4 &times; 8 ft</td><td class="num">32 ft&sup2;</td><td>Tight access, stairwells, one person working alone</td></tr>
    <tr><td>4 &times; 10 ft</td><td class="num">40 ft&sup2;</td><td>Standard 8 ft wall hung horizontally with fewer joints</td></tr>
    <tr><td>4 &times; 12 ft</td><td class="num">48 ft&sup2;</td><td>Long walls — the fewest butt joints of any option</td></tr>
    <tr><td>1200 &times; 2400 mm</td><td class="num">2.88 m&sup2;</td><td>Metric standard</td></tr>
  </tbody>
</table>
<p>The reason to reach for 12&nbsp;ft board is butt joints. A butt joint &mdash; where two square-cut sheet ends meet &mdash; has no tapered edge, so the tape and compound sit proud of the surface and have to be feathered out over two feet or more to hide. Tapered edge joints, where the long edges meet, are designed to be filled and are far easier to finish flat.</p>
<p>Every 12&nbsp;ft sheet you use instead of an 8&nbsp;ft sheet is one fewer butt joint to fight. If the board will physically fit up the stairs and into the room, use the longer one.</p>
"""
    },
    {
      "h2": "Where the supply figures come from",
      "html": """
<ul>
  <li><strong>Screws:</strong> 32 per sheet, which is roughly 16&nbsp;in spacing in the field and 8&nbsp;in around the edges. That works out at about one pound of 1-1/4&nbsp;in coarse screws per 10 sheets.</li>
  <li><strong>Joint compound:</strong> one US gallon per 100&nbsp;ft&sup2; of board, which covers taping plus two finish coats to a standard level-4 finish. A level-5 skim over the entire surface roughly doubles it.</li>
  <li><strong>Tape:</strong> 400 linear feet per 1,000&nbsp;ft&sup2; of board. Standard paper tape rolls are 250&nbsp;ft or 500&nbsp;ft.</li>
</ul>
<p>These are trade rules of thumb, not physics. They hold up well on a normal room and less well on something with a lot of corners, where tape consumption climbs quickly. Buy the next size up on compound; it stores fine and running out mid-coat is genuinely painful.</p>
"""
    },
    {
      "h2": "Thickness and where it matters",
      "html": """
<p>Half-inch board is standard for walls. Ceilings are the exception: use 5/8&nbsp;in on ceilings, particularly where the framing is at 24&nbsp;in centres, because half-inch board sags between joists over time and the sag is permanent.</p>
<p>Moisture-resistant board belongs in bathrooms and laundries, and cement backer board &mdash; not drywall of any kind &mdash; belongs behind tile in a shower. Fire-rated type X board is required in specific assemblies such as garage-to-house walls; that is a code question, and your local building department is the authority, not a calculator.</p>
"""
    },
  ],
  "faq": [
    ("How many sheets of drywall for a 12 × 12 room?",
     "With 8 ft walls, that is 384 ft² of wall plus a 144 ft² ceiling, so 528 ft² total. With 10% waste and 4 × 8 sheets, you need 19 sheets. Using 4 × 12 sheets it drops to 13."),
    ("Should I use 1/2 in or 5/8 in drywall?",
     "Half inch for walls, 5/8 in for ceilings. Half-inch board on ceilings sags between joists, especially at 24 in centres, and once it sags it does not come back."),
    ("How much joint compound do I need?",
     "Roughly one gallon per 100 ft² of board for a standard three-coat, level-4 finish. A 4.5 gallon bucket covers about 450 ft². Double it if you are skim-coating the whole surface to level 5."),
    ("How many screws per sheet of drywall?",
     "About 32 for a wall sheet — 16 in spacing in the field, 8 in around the perimeter. Ceilings take more, closer to 40, because the board is fighting gravity."),
    ("Do I deduct doors and windows?",
     "Usually not. Most installers sheet straight over the opening and cut it out, which is faster and puts the joints somewhere sensible. Deduct only if you are working to a tight material budget and cutting each piece to fit."),
  ],
  "related": ["paint", "flooring", "concrete"],
},
{
  "slug": "mulch",
  "calc_id": "mulch",
  "script": "mulch.js",
  "short": "Mulch & topsoil",
  "icon": "▓",
  "card": "Cubic yards or bags for a bed, plus a straight bulk-versus-bagged cost comparison.",
  "title": "Mulch Calculator — Cubic Yards, Bags and Bulk Cost",
  "h1": "Mulch &amp; topsoil calculator",
  "description": "Calculate cubic yards or bags of mulch, topsoil or compost for a garden bed, and compare the cost of buying bagged against bulk delivery.",
  "intro": [
    "Mulch is the material where the bagged-versus-bulk decision costs the most and gets the least thought. Bags are convenient and, past a surprisingly small quantity, dramatically more expensive per cubic foot.",
    "This calculator gives you the volume, converts it to both bags and bulk yards, and &mdash; if you enter both prices &mdash; tells you which way round is actually cheaper for your job.",
  ],
  "sections": [
    {
      "h2": "How the maths works",
      "html": """
<div class="formula">cubic feet = area (ft&sup2;) &times; depth (in) &divide; 12<br>
cubic yards = cubic feet &divide; 27</div>
<p>A 30&nbsp;ft &times; 6&nbsp;ft bed at 3&nbsp;in deep is 180&nbsp;ft&sup2; &times; 0.25&nbsp;ft = 45&nbsp;ft&sup3;, which is 1.67 cubic yards, or 23 bags of the 2&nbsp;ft&sup3; size.</p>
<p>The useful shortcut to remember: <strong>one cubic yard covers 108&nbsp;ft&sup2; at 3&nbsp;inches deep.</strong> At 2&nbsp;in it covers 162&nbsp;ft&sup2;, and at 4&nbsp;in it covers 81&nbsp;ft&sup2;.</p>
"""
    },
    {
      "h2": "Bags or bulk",
      "html": """
<p>A cubic yard is 13.5 bags of the standard 2&nbsp;ft&sup3; size. At typical retail pricing that is often $55&ndash;$70 in bags against $35&ndash;$50 for the same volume delivered in bulk, and the gap widens with every yard.</p>
<p>The honest case for bags:</p>
<ul>
  <li>Under about one cubic yard, delivery fees swamp the saving.</li>
  <li>You have nowhere to tip a pile &mdash; no driveway, or a shared one you cannot block.</li>
  <li>You are working in stages over several weekends and do not want a pile sitting in the rain.</li>
  <li>You physically cannot barrow it. A yard of wet mulch is around 800&nbsp;lb.</li>
</ul>
<p>The case for bulk is simply money, and it is a strong case above two cubic yards. Enter both prices above and the calculator will do the comparison with your actual local numbers rather than these averages.</p>
"""
    },
    {
      "h2": "How deep",
      "html": """
<table>
  <thead><tr><th>Purpose</th><th class="num">Depth</th></tr></thead>
  <tbody>
    <tr><td>Refreshing existing mulch</td><td class="num">1&ndash;2 in</td></tr>
    <tr><td>New mulch for weed suppression</td><td class="num">3 in</td></tr>
    <tr><td>Heavy weed pressure</td><td class="num">4 in</td></tr>
    <tr><td>Topsoil over an existing lawn</td><td class="num">1/4&ndash;1/2 in</td></tr>
    <tr><td>New topsoil for planting beds</td><td class="num">4&ndash;6 in</td></tr>
    <tr><td>New lawn from seed</td><td class="num">4 in</td></tr>
  </tbody>
</table>
<p>Three inches is the sweet spot for mulch: enough to block light and hold moisture, not so much that water cannot reach the soil. Past four inches you start to cause problems rather than solve them &mdash; deep mulch sheds light rain before it soaks in, and it can go anaerobic underneath.</p>
"""
    },
    {
      "h2": "Two things that kill plants",
      "html": """
<p><strong>Mulch against the trunk.</strong> Piling mulch into a cone around a tree trunk &mdash; the &ldquo;mulch volcano&rdquo; &mdash; keeps bark permanently damp, invites rot and rodents, and encourages roots to grow up into the mulch instead of down into the soil. Pull mulch back several inches from any trunk or stem so the root flare is visible.</p>
<p><strong>Fresh wood chips dug into soil.</strong> On the surface they are fine. Mixed into the soil, decomposing wood ties up nitrogen as it breaks down and starves whatever you planted. Mulch goes on top; compost goes in.</p>
"""
    },
  ],
  "faq": [
    ("How many bags of mulch are in a cubic yard?",
     "13.5 bags of the standard 2 ft³ size, since a cubic yard is 27 cubic feet. For 3 ft³ bags it is 9, and for the smaller 1.5 ft³ bags it is 18."),
    ("How much area does a yard of mulch cover?",
     "108 square feet at 3 inches deep. At 2 inches it stretches to 162 ft², and at 4 inches it only covers 81 ft²."),
    ("How deep should mulch be?",
     "Three inches for a new application, one to two inches to top up an existing bed. More than four inches starts shedding light rain and can suffocate roots."),
    ("Is bulk mulch cheaper than bags?",
     "Almost always above two cubic yards, often by 30–40% before delivery. Below one yard the delivery fee usually wipes out the saving. Enter both prices above to check against your own local pricing."),
    ("When should I mulch?",
     "Mid to late spring, once the soil has warmed. Mulching too early over cold soil keeps it cold and delays growth. A second light application in autumn helps insulate roots over winter."),
  ],
  "related": ["gravel", "concrete", "deck"],
},
]
