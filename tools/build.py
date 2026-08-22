#!/usr/bin/env python3
"""One-off generator for the Measure Twice static site.

Emits plain HTML files that are then committed and hand-editable — there is no
build step in the deployed site. Run from the project root."""

import html
import json
import os
import pathlib

SITE = "Measure Twice"
TAGLINE = "Material and cost calculators for trades and DIY"
# Replace with the real host before launch; see README.
BASE_URL = "https://YOUR-DOMAIN.example"

ROOT = pathlib.Path(".")


def esc(text):
    return html.escape(text, quote=True)


def logo_svg():
    return (
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<rect x="1.5" y="7" width="21" height="10" rx="1.5" fill="#e2611a" stroke="#14171a" '
        'stroke-width="1.6"/>'
        '<path d="M6 7v3.2M9 7v4.6M12 7v3.2M15 7v4.6M18 7v3.2" stroke="#14171a" '
        'stroke-width="1.5" stroke-linecap="round"/></svg>'
    )


def nav(depth, current):
    """depth is how many directories deep the page sits."""
    up = "../" * depth
    items = [
        ("Calculators", up + "index.html#calculators", "calculators"),
        ("Guides", up + "guides/index.html", "guides"),
        ("About", up + "about.html", "about"),
    ]
    links = []
    for label, href, key in items:
        mark = ' aria-current="page"' if key == current else ""
        links.append(f'<a href="{href}"{mark}>{label}</a>')
    return "\n        ".join(links)


def header(depth, current):
    up = "../" * depth
    return f"""  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="{up}index.html">
        {logo_svg()}
        <span>Measure <b>Twice</b></span>
      </a>
      <nav class="site-nav" aria-label="Main">
        {nav(depth, current)}
      </nav>
    </div>
  </header>"""


def footer(depth, calculators):
    up = "../" * depth
    calc_links = "\n".join(
        f'          <li><a href="{up}calculators/{c["slug"]}.html">{esc(c["short"])}</a></li>'
        for c in calculators[:5]
    )
    return f"""  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <h4>{SITE}</h4>
          <p>{TAGLINE}. Free, no sign-up, works on a phone with one bar of signal.</p>
        </div>
        <div>
          <h4>Popular calculators</h4>
          <ul>
{calc_links}
            <li><a href="{up}index.html#calculators">See all</a></li>
          </ul>
        </div>
        <div>
          <h4>Site</h4>
          <ul>
            <li><a href="{up}guides/index.html">Guides</a></li>
            <li><a href="{up}about.html">About &amp; method</a></li>
            <li><a href="{up}contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><a href="{up}privacy.html">Privacy &amp; cookies</a></li>
            <li><a href="{up}terms.html">Terms of use</a></li>
          </ul>
        </div>
      </div>
      <p class="footer-note">
        &copy; <span id="year">2026</span> {SITE}. Estimates are for planning only —
        always confirm quantities against your own measurements, the product data sheet
        and your local building code before ordering or building.
      </p>
    </div>
  </footer>"""


def page(*, path, title, description, body, depth, current, scripts=(), jsonld=(), noindex=False):
    up = "../" * depth
    canonical = f"{BASE_URL}/{path}".replace("/index.html", "/")
    script_tags = "\n".join(
        f'  <script src="{up}assets/js/{s}" defer></script>' for s in
        ("units.js", "calc.js") + tuple(scripts) + ("ads.js", "site.js")
    )
    ld = "\n".join(
        f'  <script type="application/ld+json">{json.dumps(block, separators=(",", ":"))}</script>'
        for block in jsonld
    )
    robots = '\n  <meta name="robots" content="noindex,follow">' if noindex else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}">{robots}
  <link rel="canonical" href="{canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{esc(title)}">
  <meta property="og:description" content="{esc(description)}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:site_name" content="{SITE}">
  <meta name="twitter:card" content="summary">
  <meta name="theme-color" content="#e2611a">
  <link rel="icon" href="{up}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="{up}assets/css/main.css">
{script_tags}
{ld}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
{header(depth, current)}

  <main id="main">
{body}
  </main>

{FOOTER_PLACEHOLDER}
</body>
</html>
"""


FOOTER_PLACEHOLDER = "@@FOOTER@@"


def write(path, contents, depth, calculators):
    out = ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(contents.replace(FOOTER_PLACEHOLDER, footer(depth, calculators)))
    return path


# --------------------------------------------------------------------------
# calculator pages
# --------------------------------------------------------------------------

def faq_html(pairs):
    items = []
    for question, answer in pairs:
        items.append(
            f'      <details class="faq">\n'
            f'        <summary>{esc(question)}</summary>\n'
            f'        <div><p>{esc(answer)}</p></div>\n'
            f'      </details>'
        )
    return "\n".join(items)


def faq_jsonld(pairs):
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in pairs
        ],
    }


def breadcrumb_jsonld(trail):
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name, "item": f"{BASE_URL}/{href}"}
            for i, (name, href) in enumerate(trail)
        ],
    }


def rail(calculators, current_slug, related_slugs, depth):
    up = "../" * depth
    by_slug = {c["slug"]: c for c in calculators}
    picks = [by_slug[s] for s in related_slugs if s in by_slug]
    links = "\n".join(
        f'          <li><a href="{up}calculators/{c["slug"]}.html">{esc(c["short"])} calculator</a></li>'
        for c in picks
    )
    return f"""      <aside class="rail">
        <div class="rail-card">
          <h3>Related calculators</h3>
          <ul>
{links}
            <li><a href="{up}index.html#calculators">All calculators</a></li>
          </ul>
        </div>
        <div class="ad ad--rail" data-slot="calc-rail" data-format="rectangle"></div>
      </aside>"""


def calculator_page(calc, calculators):
    intro = "\n".join(f"        <p>{p}</p>" for p in calc["intro"])
    sections = "\n".join(
        f'        <h2>{esc(s["h2"])}</h2>\n{s["html"].strip()}' for s in calc["sections"]
    )
    trail = [("Calculators", "index.html#calculators"),
             (calc["short"], f'calculators/{calc["slug"]}.html')]

    body = f"""    <div class="page">
      <div class="wrap page-layout">
        <div>
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><a href="../index.html">Calculators</a></li>
              <li>{esc(calc["short"])}</li>
            </ol>
          </nav>

          <h1>{calc["h1"]}</h1>

          <div data-calc="{calc["calc_id"]}"></div>

          <div class="ad ad--leaderboard" data-slot="calc-below"></div>

          <div class="prose">
{intro}
{sections}

        <h2>Questions people ask</h2>
{faq_html(calc["faq"])}
          </div>

          <div class="callout">
            <strong>Check before you order</strong>
            <p>These figures are for planning. Measure the job yourself, confirm quantities
            against the product data sheet, and check anything structural against your local
            building code before you buy materials or start building.</p>
          </div>
        </div>

{rail(calculators, calc["slug"], calc["related"], 1)}
      </div>
    </div>"""

    app_ld = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": calc["h1"].replace("&amp;", "&"),
        "url": f'{BASE_URL}/calculators/{calc["slug"]}.html',
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "description": calc["description"],
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
    }

    return page(
        path=f'calculators/{calc["slug"]}.html',
        title=calc["title"],
        description=calc["description"],
        body=body,
        depth=1,
        current="calculators",
        scripts=(f'calcs/{calc["script"]}',),
        jsonld=(app_ld, breadcrumb_jsonld(trail), faq_jsonld(calc["faq"])),
    )


# --------------------------------------------------------------------------
# home
# --------------------------------------------------------------------------

def home_page(calculators, guides):
    cards = "\n".join(f"""        <li>
          <a class="tool-card" href="calculators/{c["slug"]}.html">
            <span class="tool-card__icon" aria-hidden="true">{c["icon"]}</span>
            <h3>{esc(c["short"])} calculator</h3>
            <p>{esc(c["card"])}</p>
          </a>
        </li>""" for c in calculators)

    guide_items = "\n".join(
        f'          <li><a href="guides/{g["slug"]}.html">{esc(g["h1"])}</a> — {esc(g["blurb"])}</li>'
        for g in guides
    )

    body = f"""    <section class="hero">
      <div class="wrap">
        <span class="kicker">Free · No sign-up</span>
        <h1>Work out exactly how much material the job needs</h1>
        <p class="lede">Eight calculators for the questions that come up on every build:
        how much concrete, how many boxes, how many sheets, how many tons. They take
        feet-and-inches the way you actually write them, show their working, and switch
        to metric in one tap.</p>
        <p><a class="btn" href="#calculators">Pick a calculator</a></p>
      </div>
    </section>

    <section class="section" id="calculators">
      <div class="wrap">
        <h2>Calculators</h2>
        <ul class="tool-grid">
{cards}
        </ul>

        <div class="ad ad--leaderboard" data-slot="home-top"></div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="cols-3">
          <div>
            <h3>Feet and inches, written normally</h3>
            <p class="muted">Type <code>12'6"</code>, <code>12 ft 6 in</code>, <code>12-6</code>
            or <code>12.5</code>. All four work. Switching to metric converts what you have
            already typed rather than clearing it.</p>
          </div>
          <div>
            <h3>The working is shown</h3>
            <p class="muted">Every calculator explains the formula it used and states its
            assumptions, so you can check the number rather than trust it. Where a figure is
            a trade rule of thumb, it says so.</p>
          </div>
          <div>
            <h3>Costs, if you want them</h3>
            <p class="muted">Enter your own local prices and the results include a materials
            total. Leave the price fields blank and you just get quantities.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap wrap--narrow">
        <h2>Guides</h2>
        <ul>
{guide_items}
        </ul>
        <div class="ad ad--rect" data-slot="home-mid" data-format="rectangle"></div>
      </div>
    </section>"""

    org_ld = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE,
        "url": BASE_URL + "/",
        "description": TAGLINE,
    }

    return page(
        path="index.html",
        title=f"{SITE} — Material Calculators for Trades and DIY",
        description="Free material and cost calculators for concrete, paint, flooring, tile, drywall, mulch, gravel and decking. Feet-and-inches input, metric toggle, no sign-up.",
        body=body,
        depth=0,
        current="calculators",
        jsonld=(org_ld,),
    )


# --------------------------------------------------------------------------
# guides
# --------------------------------------------------------------------------

GUIDES = [
{
  "slug": "waste-factors",
  "h1": "Waste factors: how much extra material to buy",
  "blurb": "why 10% is the default, and the jobs where it is nowhere near enough",
  "title": "Waste Factors Explained — How Much Extra Material to Buy",
  "description": "Why every material estimate needs a waste allowance, what percentage to use for concrete, tile, flooring, drywall and decking, and the jobs where 10% is far too little.",
  "body": """
<p>Every material estimate on this site adds a waste allowance, and every one of them
defaults to somewhere around 10%. It is worth understanding what that number is actually
paying for, because it is not a safety margin and it is not padding. It is a prediction,
and on some jobs it is badly wrong.</p>

<h2>Waste is not spillage</h2>

<p>The intuitive picture of waste is material you drop, spill or ruin. In practice that is
a small part of it. The bulk of waste is <strong>geometry</strong>: material that had to be
cut off and cannot be used anywhere else.</p>

<p>Lay a floor across a room and every row ends in a cut. If that offcut is long enough to
start the next row, your waste is close to zero. If it is four inches long, it is rubbish.
Whether you get one or the other depends on the relationship between the room width and the
plank length, which is why two rooms of identical area can have very different waste.</p>

<p>This is also why waste is expressed as a percentage but does not really scale like one.
A tiny bathroom floor can hit 25% waste because almost every tile is cut. A large open
warehouse floor might come in under 5%.</p>

<h2>The defaults, and where they come from</h2>

<table>
  <thead><tr><th>Material</th><th class="num">Default</th><th>Main driver</th></tr></thead>
  <tbody>
    <tr><td>Concrete</td><td class="num">10%</td><td>Uneven subgrade and over-excavation</td></tr>
    <tr><td>Concrete in dug footings</td><td class="num">15%</td><td>Rough trench walls</td></tr>
    <tr><td>Flooring, straight lay</td><td class="num">10%</td><td>End cuts</td></tr>
    <tr><td>Flooring, diagonal</td><td class="num">15%</td><td>Angled perimeter cuts</td></tr>
    <tr><td>Flooring, herringbone</td><td class="num">20%</td><td>Pattern dictates every cut</td></tr>
    <tr><td>Tile, rectangular room</td><td class="num">10%</td><td>Perimeter cuts</td></tr>
    <tr><td>Tile, diagonal or small room</td><td class="num">15&ndash;20%</td><td>Cut ratio rises sharply</td></tr>
    <tr><td>Drywall</td><td class="num">10%</td><td>Openings and off-module walls</td></tr>
    <tr><td>Decking</td><td class="num">10%</td><td>Board length versus deck length</td></tr>
    <tr><td>Aggregate</td><td class="num">20% compaction</td><td>Not waste — volume loss</td></tr>
  </tbody>
</table>

<h2>When 10% is not enough</h2>

<p>Raise the allowance, sometimes a lot, when any of these apply:</p>

<ul>
  <li><strong>The room is small.</strong> Waste is driven by perimeter, and small rooms have
  far more perimeter per square foot. A 5&nbsp;&times;&nbsp;8 bathroom is the worst case in
  most houses.</li>
  <li><strong>There are many obstacles.</strong> A toilet flange, a vanity, a door threshold
  and a heating vent in one small floor will each cost you a cut piece.</li>
  <li><strong>The material is directional.</strong> Wood grain, a printed pattern, a tile with
  a defined top edge &mdash; if you cannot rotate an offcut, you cannot reuse it.</li>
  <li><strong>The pieces are large.</strong> One bad cut in a 24&nbsp;&times;&nbsp;48 tile
  wastes eight square feet. In a 6&nbsp;&times;&nbsp;6 tile it wastes a quarter of one.</li>
  <li><strong>You are learning.</strong> An honest first-timer's allowance is 15&ndash;20% on
  anything that gets cut. There is no shame in it and it is cheaper than a second trip.</li>
</ul>

<h2>The asymmetry that should decide it</h2>

<p>Buying 10% too much material costs you 10% of the material price, and some of it comes
back as spares or a refund on unopened boxes.</p>

<p>Buying 5% too little costs you a second trip, a second delivery fee, a day of lost work,
and &mdash; on anything with a batch or dye lot &mdash; a real chance the replacement does
not match what you already installed. On concrete it costs you a cold joint you cannot
undo.</p>

<p>These two outcomes are not remotely equal, and the allowance should reflect that. When
you are genuinely unsure, round up.</p>

<h2>Keep the leftovers</h2>

<p>On anything manufactured in batches &mdash; tile, flooring, siding, worktops &mdash; the
spare material is worth more than what you paid for it, because in two years the product
line will be discontinued and there will be no way to buy a match. A single spare box turns
a future repair from a full replacement into an afternoon.</p>

<p>Label it with the room and the date, and put it somewhere dry.</p>
""",
},
{
  "slug": "concrete-slab-cost",
  "h1": "What a concrete slab actually costs",
  "blurb": "the line items beyond the concrete itself, and why quotes vary so much",
  "title": "Concrete Slab Cost — What Goes Into the Price",
  "description": "A breakdown of what a concrete slab costs beyond the concrete: base, formwork, reinforcement, delivery fees, pumping and labour, and why quotes for the same slab differ so widely.",
  "body": """
<p>The concrete is rarely the expensive part. On a typical residential slab the ready-mix is
somewhere between a quarter and a half of the total, and the rest is everything that has to
happen around it. This is why two quotes for the same patio can differ by a factor of two
and both be honest.</p>

<p>Work out your volume with the <a href="../calculators/concrete.html">concrete
calculator</a> first, then use this to understand the rest of the number.</p>

<h2>The line items</h2>

<table>
  <thead><tr><th>Item</th><th>What drives it</th></tr></thead>
  <tbody>
    <tr><td>Excavation and spoil removal</td><td>Depth, access, whether spoil can stay on site</td></tr>
    <tr><td>Compacted base</td><td>Usually 4&ndash;6 in of crusher run — see the <a href="../calculators/gravel.html">gravel calculator</a></td></tr>
    <tr><td>Formwork</td><td>Perimeter length, and whether any of it is curved</td></tr>
    <tr><td>Reinforcement</td><td>Mesh is cheap; rebar mats and chairs are not</td></tr>
    <tr><td>Vapour barrier</td><td>Required under anything heated or enclosed</td></tr>
    <tr><td>The concrete</td><td>Volume, mix strength, fibre or admixtures</td></tr>
    <tr><td>Delivery</td><td>Per load, plus a short-load fee under about 1 yd³</td></tr>
    <tr><td>Pumping</td><td>Only if the truck cannot reach — but then it is unavoidable</td></tr>
    <tr><td>Placing and finishing</td><td>Labour, and the finish you asked for</td></tr>
    <tr><td>Control joints</td><td>Cut within 24 hours or the slab cracks where it likes</td></tr>
    <tr><td>Curing</td><td>Blankets, compound or water for the first days</td></tr>
  </tbody>
</table>

<h2>The three that surprise people</h2>

<p><strong>The short-load fee.</strong> Ready-mix plants charge a penalty for anything under
roughly a cubic yard, commonly $60&ndash;$150, because they have committed a truck and a
driver either way. On a small pour this fee can exceed the cost of the concrete in it. It is
the single biggest reason small slabs have a bad cost-per-yard.</p>

<p><strong>Pumping.</strong> If a truck cannot back within chute reach of the pour, the
concrete has to be pumped or barrowed. A pump is a fixed cost that does not care how small
your slab is, and barrowing a yard of concrete is roughly twenty wheelbarrow loads of
extremely heavy material against a setting clock.</p>

<p><strong>Access generally.</strong> A back garden reached through a side gate changes
every line above it. Excavation is by hand, spoil goes out by barrow, materials come in the
same way. Quotes for identical slabs in the front and back of the same house are routinely
very different, and the difference is almost entirely access.</p>

<h2>Why quotes vary so much</h2>

<p>Beyond access, the honest reasons are:</p>

<ul>
  <li><strong>Mix strength.</strong> A higher-strength mix costs more per yard and it is not
  always obvious from the quote which one is priced.</li>
  <li><strong>Base depth.</strong> One contractor pricing 4&nbsp;in of compacted base and
  another pricing 8&nbsp;in are not quoting the same job, and the deeper one will last
  longer on clay.</li>
  <li><strong>Reinforcement.</strong> Mesh laid on the ground and walked flat does nothing.
  Rebar on chairs at mid-depth is real reinforcement and costs real money.</li>
  <li><strong>Finish.</strong> A broom finish is quick. Power-trowelled, exposed aggregate or
  stamped concrete are each substantially more labour.</li>
</ul>

<p>When you compare quotes, compare those four things explicitly. A cheap quote is usually
cheap for a reason you can find in that list.</p>

<h2>Questions worth asking</h2>

<ul>
  <li>What mix strength, and does it include fibre?</li>
  <li>How deep is the compacted base, and what material?</li>
  <li>Mesh or rebar, and how is it held at mid-depth?</li>
  <li>Is the short-load or delivery fee in your price?</li>
  <li>Can the truck reach, or is a pump needed?</li>
  <li>When are the control joints cut, and how are they spaced?</li>
  <li>How is it cured, and for how long?</li>
</ul>

<p>A contractor who answers those clearly is telling you they have thought about the job.
One who cannot is quoting a number, not a slab.</p>
""",
},
]


def guide_page(guide, calculators):
    body = f"""    <div class="page">
      <div class="wrap page-layout">
        <div>
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><a href="../index.html">Home</a></li>
              <li><a href="index.html">Guides</a></li>
              <li>{esc(guide["h1"])}</li>
            </ol>
          </nav>
          <article class="prose">
            <h1>{esc(guide["h1"])}</h1>
{guide["body"].strip()}
          </article>
          <div class="ad ad--rect" data-slot="article-mid" data-format="rectangle"></div>
        </div>
{rail(calculators, None, [c["slug"] for c in calculators[:4]], 1)}
      </div>
    </div>"""

    article_ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": guide["h1"],
        "description": guide["description"],
        "url": f'{BASE_URL}/guides/{guide["slug"]}.html',
        "publisher": {"@type": "Organization", "name": SITE},
    }

    return page(
        path=f'guides/{guide["slug"]}.html',
        title=guide["title"],
        description=guide["description"],
        body=body,
        depth=1,
        current="guides",
        jsonld=(article_ld,
                breadcrumb_jsonld([("Guides", "guides/index.html"),
                                   (guide["h1"], f'guides/{guide["slug"]}.html')])),
    )


def guides_index(calculators):
    items = "\n".join(
        f'          <li><h3><a href="{g["slug"]}.html">{esc(g["h1"])}</a></h3>'
        f'<p class="muted">{esc(g["description"])}</p></li>'
        for g in GUIDES
    )
    body = f"""    <div class="page">
      <div class="wrap wrap--narrow prose">
        <h1>Guides</h1>
        <p>Background on the decisions the calculators cannot make for you.</p>
        <ul style="list-style:none;padding:0">
{items}
        </ul>
      </div>
    </div>"""
    return page(
        path="guides/index.html",
        title=f"Guides — {SITE}",
        description="Practical guides on waste factors, material costs and estimating for building projects.",
        body=body, depth=1, current="guides",
    )


# --------------------------------------------------------------------------
# static pages
# --------------------------------------------------------------------------

ABOUT_BODY = """    <div class="page">
      <div class="wrap wrap--narrow prose">
        <h1>About Measure Twice</h1>

        <p>Measure Twice is a set of material calculators for people ordering materials for
        a real job &mdash; trades, contractors and anyone doing the work themselves. Every
        calculator is free, needs no account, and works on a phone.</p>

        <div class="callout callout--info">
          <strong>Before you publish this site</strong>
          <p>Replace this section with a genuine description of who runs the site and what
          experience stands behind the figures. Google's quality guidelines and the AdSense
          review both weigh who is behind the content, and a real name with real background
          is one of the cheapest credibility wins available. Placeholder text here is a
          common reason for rejection.</p>
        </div>

        <h2>How the numbers are worked out</h2>

        <p>Every calculator does its arithmetic in SI units internally &mdash; metres, square
        metres, cubic metres, kilograms &mdash; and converts to feet, yards, gallons or tons
        only when displaying the answer. That means the imperial and metric results for the
        same job always agree, which is not true of tools that keep two separate sets of
        formulas.</p>

        <p>The geometry is exact. Where a figure is a trade rule of thumb rather than a
        derivation &mdash; joint compound coverage, screws per sheet, aggregate bulk density
        &mdash; the calculator says so on the page and shows the assumption it used, so you
        can substitute your own supplier's number.</p>

        <h2>What the figures are not</h2>

        <p>They are planning estimates. They cannot see your subgrade, your access, the
        state of your walls or your local building code. Three things in particular are
        always yours to confirm:</p>

        <ul>
          <li><strong>Structural sizing.</strong> Joist spans, footing depths, slab
          thickness under load and reinforcement are code items. Check them with your local
          building department.</li>
          <li><strong>Product data.</strong> Coverage rates, bag yields and spacing
          requirements vary by brand. The bag or the data sheet always wins over a
          website.</li>
          <li><strong>Your own measurements.</strong> Measure twice.</li>
        </ul>

        <h2>Corrections</h2>

        <p>If a calculator gives a figure you believe is wrong, please say so &mdash; include
        the numbers you entered and what you expected. Errors in this kind of tool cost
        people money, and they get fixed quickly.</p>

        <p><a class="btn btn--ghost" href="contact.html">Get in touch</a></p>
      </div>
    </div>"""

CONTACT_BODY = """    <div class="page">
      <div class="wrap wrap--narrow prose">
        <h1>Contact</h1>

        <p>Questions, corrections and requests for calculators that do not exist yet are all
        welcome.</p>

        <p><strong>Email:</strong> <a href="mailto:hello@YOUR-DOMAIN.example">hello@YOUR-DOMAIN.example</a></p>

        <div class="callout">
          <strong>Replace this before launch</strong>
          <p>Put a real, monitored address here. A working contact route is an AdSense
          eligibility requirement and one of the first things a reviewer checks. A contact
          page that goes nowhere is worse than none.</p>
        </div>

        <h2>Reporting a wrong figure</h2>

        <p>If a result looks wrong, the fastest way to get it fixed is to send:</p>
        <ul>
          <li>Which calculator, and the exact values you entered</li>
          <li>What it returned, and what you expected</li>
          <li>The unit system you were in</li>
        </ul>
        <p>Results pages carry their inputs in the address bar, so copying the URL captures
        all of that in one go.</p>
      </div>
    </div>"""

PRIVACY_BODY = """    <div class="page">
      <div class="wrap wrap--narrow prose">
        <h1>Privacy &amp; cookies</h1>
        <p class="muted">Last updated <strong>[DATE]</strong> &middot; Operated by
        <strong>[YOUR NAME OR COMPANY]</strong> &middot; Contact
        <strong>[YOUR EMAIL]</strong></p>

        <div class="callout">
          <strong>Template &mdash; complete before launch</strong>
          <p>This describes what the code in this repository does today. It is not legal
          advice. Fill in the bracketed fields, and update it the moment you enable
          advertising, analytics or anything else that sets a cookie. A privacy policy that
          does not match the site is an AdSense policy violation in itself.</p>
        </div>

        <h2>What the calculators collect</h2>

        <p>Nothing. The calculators run entirely in your browser. The dimensions you type are
        never sent to a server, because there is no server-side component &mdash; the whole
        site is static files.</p>

        <p>Two small things are stored locally on your own device: your preferred unit system,
        so the site opens in feet or metres as you left it, and the values you have typed,
        which are kept in the page address so a result can be bookmarked or shared. Both live
        on your device and are cleared with your browser data.</p>

        <h2>Advertising</h2>

        <p>This site is funded by advertising served through Google AdSense.</p>

        <ul>
          <li>Google and its partners use cookies and similar technologies to serve ads based
          on your prior visits to this and other websites.</li>
          <li>Google's use of advertising cookies enables it and its partners to serve ads
          based on your visit to this site and other sites on the internet.</li>
          <li>You can opt out of personalised advertising by visiting
          <a href="https://www.google.com/settings/ads" rel="nofollow noopener">Google Ads
          Settings</a>, or opt out of third-party vendors' use of cookies for personalised
          advertising at <a href="https://www.aboutads.info/choices/" rel="nofollow noopener">aboutads.info</a>.</li>
          <li>Third-party vendors, including Google, may use cookies to serve ads based on
          your prior visits to this website.</li>
        </ul>

        <p>If you are in the European Economic Area, the United Kingdom or Switzerland, a
        consent banner will ask before any advertising or measurement cookie is set, and you
        can change or withdraw that choice at any time.</p>

        <h2>Analytics</h2>

        <p>[State here whether you use analytics, and which product. If you have not added
        any, say so &mdash; it is a genuine selling point.]</p>

        <h2>Third parties</h2>

        <p>Serving this site involves your browser talking to:</p>
        <ul>
          <li><strong>The hosting provider</strong>, which will keep standard server logs
          including IP addresses for security and abuse prevention.</li>
          <li><strong>Google AdSense</strong>, as described above, once advertising is
          enabled.</li>
        </ul>

        <h2>Your choices</h2>

        <p>You can block cookies in your browser and every calculator will still work &mdash;
        you will simply lose the saved unit preference. Nothing on this site requires an
        account, an email address or any personal detail.</p>

        <h2>Children</h2>

        <p>This site is aimed at adults planning building work and is not directed at
        children under 13.</p>

        <h2>Changes</h2>

        <p>If this policy changes in a way that affects what is collected, the date at the
        top changes and the revised version is posted here before the change takes effect.</p>
      </div>
    </div>"""

TERMS_BODY = """    <div class="page">
      <div class="wrap wrap--narrow prose">
        <h1>Terms of use</h1>
        <p class="muted">Last updated <strong>[DATE]</strong> &middot; Operated by
        <strong>[YOUR NAME OR COMPANY]</strong> &middot; Contact
        <strong>[YOUR EMAIL]</strong></p>

        <div class="callout">
          <strong>Template &mdash; have this reviewed</strong>
          <p>Plain-language terms matching what this site does. Not legal advice. Fill in the
          bracketed fields and, given the disclaimer below is the important part, have a
          lawyer look at it before launch.</p>
        </div>

        <h2>Estimates, not specifications</h2>

        <p>Every figure this site produces is a planning estimate produced from the numbers
        you typed. It is not a specification, not an engineering calculation, and not a
        substitute for professional advice or your local building code.</p>

        <p>Quantities depend on site conditions, product specifications, workmanship and
        regulations that this site cannot see. Confirm every quantity against your own
        measurements and the manufacturer's data before ordering materials, and confirm
        anything structural &mdash; spans, footing depths, load-bearing thickness,
        reinforcement &mdash; with a qualified professional and your local building
        authority.</p>

        <h2>No warranty</h2>

        <p>The site is provided &ldquo;as is&rdquo; without warranties of any kind, to the
        fullest extent the law allows. To that same extent, the operator is not liable for
        loss arising from use of these calculators, including material ordered in the wrong
        quantity. Nothing here limits any right you have that cannot legally be limited,
        including consumer rights.</p>

        <h2>Using the site</h2>

        <p>Free to use for personal and commercial estimating. You may not scrape the site at
        volume, republish the calculators or content as your own, or attempt to disrupt the
        service.</p>

        <h2>Contact</h2>
        <p>Questions about these terms: <strong>[YOUR EMAIL]</strong>.</p>
      </div>
    </div>"""

NOTFOUND_BODY = """    <div class="page">
      <div class="wrap wrap--narrow prose">
        <h1>Page not found</h1>
        <p>That page does not exist. The calculators are all on the home page.</p>
        <p><a class="btn" href="/index.html">Go to the calculators</a></p>
      </div>
    </div>"""


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def main():
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from content_a import CALCULATORS_A
    from content_b import CALCULATORS_B
    from content_c import CALCULATORS_C
    from content_d import CALCULATORS_D

    calculators = CALCULATORS_A + CALCULATORS_B + CALCULATORS_C + CALCULATORS_D
    written = []

    written.append(write("index.html", home_page(calculators, GUIDES), 0, calculators))

    for calc in calculators:
        written.append(write(f'calculators/{calc["slug"]}.html',
                             calculator_page(calc, calculators), 1, calculators))

    written.append(write("guides/index.html", guides_index(calculators), 1, calculators))
    for guide in GUIDES:
        written.append(write(f'guides/{guide["slug"]}.html',
                             guide_page(guide, calculators), 1, calculators))

    statics = [
        ("about.html", "About & Method", "How Measure Twice works out its figures, what the estimates assume, and what you still need to check yourself.", ABOUT_BODY, "about", False),
        ("contact.html", "Contact", "Get in touch with corrections, questions or requests for new calculators.", CONTACT_BODY, "", False),
        ("privacy.html", "Privacy & Cookies", "What Measure Twice stores, how advertising cookies are used, and your choices.", PRIVACY_BODY, "", False),
        ("terms.html", "Terms of Use", "Terms for using the Measure Twice calculators, including the estimate disclaimer.", TERMS_BODY, "", False),
        ("404.html", "Page Not Found", "That page could not be found.", NOTFOUND_BODY, "", True),
    ]
    for path, title, desc, body, current, noindex in statics:
        written.append(write(path, page(path=path, title=f"{title} — {SITE}",
                                        description=desc, body=body, depth=0,
                                        current=current, noindex=noindex),
                             0, calculators))

    # sitemap + robots
    urls = ["index.html", "guides/index.html", "about.html", "contact.html",
            "privacy.html", "terms.html"]
    urls += [f'calculators/{c["slug"]}.html' for c in calculators]
    urls += [f'guides/{g["slug"]}.html' for g in GUIDES]

    def priority(u):
        if u == "index.html":
            return "1.0"
        if u.startswith("calculators/"):
            return "0.9"
        if u.startswith("guides/"):
            return "0.7"
        return "0.4"

    entries = "\n".join(
        f'  <url><loc>{BASE_URL}/{u.replace("index.html", "") if u.endswith("/index.html") or u == "index.html" else u}</loc>'
        f'<priority>{priority(u)}</priority></url>'
        for u in urls
    )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<!-- Replace YOUR-DOMAIN.example with the real host before submitting. -->\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + entries + "\n</urlset>\n")

    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\n\n"
        "# Replace YOUR-DOMAIN before launch.\n"
        f"Sitemap: {BASE_URL}/sitemap.xml\n")

    print(f"{len(written)} pages written:")
    for path in written:
        print("  " + path)
    print("  sitemap.xml\n  robots.txt")


if __name__ == "__main__":
    main()
