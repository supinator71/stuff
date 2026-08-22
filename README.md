# Measure Twice

Material and cost calculators for trades and DIY. Eight working calculators, two
guides, and the pages AdSense expects to see — as plain HTML, CSS and JavaScript
with **no build step, no framework and no dependencies**. The repository is the
website.

```
index.html              hub listing every calculator
calculators/*.html      8 calculator pages, each with its own guide content
guides/*.html           cross-cutting articles + index
about.html contact.html privacy.html terms.html 404.html
assets/css/main.css     design system
assets/js/units.js      conversion, feet-and-inches parsing, formatting
assets/js/calc.js       form rendering, validation, unit switching, share URLs
assets/js/calcs/*.js    one pure compute() per calculator
assets/js/ads.js        AdSense wiring (inert until you add your publisher ID)
tests/math.test.js      124 arithmetic checks, no browser needed
tests/browser.test.js   end-to-end: every page, every calculator
ads.txt                 authorised sellers — needs your publisher ID
```

---

## Why this niche

Picked from research, not vibes. Three findings drove it:

**1. High-RPM niches are unwinnable for a new site.** Insurance, legal and finance
genuinely pay the most — [reported RPMs of $15–80](https://adstimate.com/blog/highest-paying-adsense-niches.html)
against [legal search CPC of $6.75 vs. a $2.96 cross-industry average](https://www.wordstream.com/blog/2026-google-ads-benchmarks).
They are also YMYL categories where Google applies its harshest quality bar, and
they are owned by billion-dollar incumbents. High RPM times zero traffic is zero.

**2. Informational content is being actively displaced.** Seer Interactive's
analysis of 5.47M queries found AI Overviews cut organic CTR by
[61% on informational queries](https://neilpatel.com/marketing-stats/ai-overview-expansion-organic-ctr-decline/);
question-format queries trigger an AI Overview
[85.9% of the time](https://www.omnibound.ai/blog/google-ai-overviews-statistics).
Transactional and interactive content is comparatively protected. A plain blog is
close to the worst thing to launch right now.

**3. Mass-produced content gets deindexed.** Google has issued manual actions for
"scaled content abuse" [since June 2025](https://www.digitalapplied.com/blog/scaled-content-abuse-google-march-update-ai-pages-decimated) —
one monitored set saw 837 of 49,345 sites removed from the index outright.

**But pure tool sites get rejected by AdSense** as
[thin content](https://dev.to/bdubs/i-applied-for-adsense-and-got-rejected-for-low-value-content-hog) —
"an input box and a wall of ads" does not pass review.

So: **interactive tools plus substantial written content per tool, in a
high-CPC but non-YMYL vertical.** Home services runs at **$5.10 CPC** — second
only to legal among the industries checked, nearly double the cross-industry
average — and is not YMYL, so the quality bar is far more forgiving than finance.
Advertisers are Home Depot, Lowe's, Angi, Thumbtack and contractor lead-gen, all
bidding on someone who is mid-project.

Every calculator page carries 550–750 words of original, specific guidance
alongside the tool. That is what makes it approvable and what makes it rank.

---

## Run it locally

```bash
python3 -m http.server 8899   # then open http://localhost:8899
```

## Deploy

No build command; publish directory is the repo root.

| Host | Notes |
| --- | --- |
| **Netlify** | Connect the repo. `netlify.toml` sets headers and the 404 page. |
| **Cloudflare Pages** | Connect the repo, leave the build command empty. |
| **Vercel** | Import as a static project. |
| **GitHub Pages** | Works, but no custom headers. |

Use a real custom domain, not a `*.netlify.app` subdomain — AdSense will not
approve a site on a free hosting subdomain.

---

## Turning on AdSense

Everything is wired; it needs your IDs.

1. **Add the site** in AdSense → Sites, and complete verification.
2. **Create ad units** — one per slot name. The slots in the HTML are
   `home-top`, `home-mid`, `calc-below`, `calc-rail` and `article-mid`.
3. **Fill in `assets/js/ads.js`**: set `publisherId` to your
   `ca-pub-…` value and paste each unit ID into `CONFIG.slots`.
   Until `publisherId` is set, nothing is requested from Google and every slot
   renders a sized placeholder.
4. **Fix `ads.txt`** — replace `pub-0000000000000000` with your publisher ID.
   AdSense will keep warning you until this is right, and some buyers will not
   bid without it.
5. **EEA / UK / Swiss traffic needs a Google-certified CMP.** This is not
   optional and it is not a nice-to-have: serving ads to those users without a
   certified consent banner breaches the AdSense terms and can suspend the
   account. Google's own "Privacy & messaging" tool inside AdSense is certified
   and is the easiest route.
6. **Update `privacy.html`** to match what you actually enabled. The AdSense
   cookie disclosure is already drafted there; fill in the bracketed fields.

Two placement rules worth keeping: never put a unit where a mis-tap becomes a
click (the slots here sit below the results and in the sidebar, never beside the
calculator's buttons), and keep the reserved slot heights — unreserved ad space
causes layout shift, which costs you both ranking and revenue.

## Before you apply

Review generally wants a site that looks like a going concern:

- [ ] Real custom domain, live and indexed
- [ ] `about.html` rewritten with a **real person or company** and genuine
      background — placeholder text here is a common rejection reason
- [ ] `contact.html` pointing at a monitored address
- [ ] Privacy and terms completed, bracketed fields filled
- [ ] `YOUR-DOMAIN.example` replaced in `robots.txt`, `sitemap.xml`,
      `contact.html` and `BASE_URL` in the page generator
- [ ] Sitemap submitted in Search Console, pages indexed
- [ ] Some organic traffic arriving

Site age matters more than people expect —
[3–6 months of history](https://dev.to/bdubs/i-applied-for-adsense-and-got-rejected-for-low-value-content-hog)
is a common threshold, and plenty of sites are approved on the second or third
attempt with no changes. Since you already have an AdSense account, you are
adding a site rather than opening an account, which is a lower bar — but each
new site is still reviewed.

---

## Realistic expectations

Worth saying plainly: **this is an asset, not an income stream yet.** Seventeen
pages on a new domain will earn approximately nothing for months. The site is
the cheap part; traffic is the whole game.

Home services CPC is strong, but AdSense pays you a share of *display* inventory,
which is well below search CPC. At mid-tier RPMs, meaningful revenue needs tens
of thousands of monthly sessions.

What actually moves it, roughly in order:

1. **Rank for `[material] calculator` queries.** They are transactional, they
   convert to a page view rather than an AI Overview answer, and they recur
   forever. This is the entire strategy.
2. **Add calculators.** Each one is a new keyword cluster on the same domain
   authority. Roofing, fence, paver, insulation, stair stringer, board-foot,
   sod, retaining wall, and rebar are all high-volume and all fit the engine.
3. **Earn links from the guides, not the tools.** Nobody links to a calculator
   from an article; they link to a reference. The waste-factors guide is built
   to be that reference.
4. **Get listed where trades actually are** — contractor forums, subreddits,
   trade-school resource pages. One instructor linking it recurs every year.
5. **Keep Core Web Vitals green.** No framework and reserved ad slots is most of
   that battle already won; do not undo it by bolting on heavy scripts.

Seasonality is real: concrete, mulch, gravel and decking all peak in spring.

---

## Adding a calculator

1. Create `assets/js/calcs/your-calc.js` following the existing UMD pattern.
   `compute(values, ctx)` must be **pure** — no DOM — so the Node tests can
   exercise it. Lengths arrive in **metres**; return display strings.

   ```js
   compute: function (v, ctx) {
     // ctx.imperial, ctx.U (conversions), ctx.fmt (n / money / len / round)
     return {
       headline: { value: '…', unit: '…', label: '…' },
       tables: [{ caption, cols, rows: [{ cells: [], sub }], foot }],
       notes: ['…']
     };
   }
   ```

   Field types: `length`, `smallLength`, `number`, `percent`, `money`, `select`,
   `radio`. Any of `label`, `hint`, `unit`, `value` and `options` may be given as
   `{ imperial, metric }`. Numeric fields can declare `convert: {toMetric,
   toImperial}` so switching units converts what is typed instead of clearing it.
   Select values should carry the SI figure directly (sheet area in m², bag yield
   in m³) so `compute` needs no lookup table.

2. Add the page. For a single calculator it is usually quickest to copy an
   existing page in `calculators/` and edit it — the HTML is committed and
   hand-editable, and nothing at runtime depends on how it was produced.
   Alternatively add your copy to `tools/content_*.py` and run
   `python3 tools/build.py`, which regenerates every page (see `tools/README.md`
   — note it overwrites hand edits).

3. Add it to the home page grid, the related-calculator rails, and `sitemap.xml`.

4. Write the maths test **first**, with a figure you worked out on paper.

## Testing

```bash
node tests/math.test.js       # 124 arithmetic checks, no browser

npm install --no-save playwright && npx playwright install chromium
python3 -m http.server 8899
node tests/browser.test.js    # every page, every calculator, mobile, links
```

`math.test.js` checks each calculator against hand-worked values and verifies
imperial and metric agree for the same job. `browser.test.js` checks unique
titles and canonicals, that every calculator produces a result from its defaults,
feet-and-inches parsing, the unit toggle converting rather than clearing, input
validation, shareable URLs, ad slots reserving space without calling Google, no
horizontal overflow at 390px, and that no internal link is broken.

Both exit non-zero on failure.

---

## Accuracy

The geometry is exact and tested. Several figures are trade rules of thumb —
joint compound coverage, screws per sheet, aggregate bulk density, grout density.
Each is stated on the page that uses it, with the assumption shown, so a reader
can substitute their supplier's number. If you change one, update the guide text
and the test in the same commit.

Do not let the calculators drift into structural advice. Joist spans, footing
depths and load-bearing thickness are code items, and the pages deliberately
point at the local building authority rather than answering.

## Placeholders to replace

Set `BASE_URL` in `tools/build.py` to your real domain and run
`python3 tools/build.py` — that fixes every canonical, `og:url`, the sitemap and
robots.txt in one go. Then by hand: `pub-0000000000000000` in `ads.txt`,
`publisherId` in `assets/js/ads.js`, the `hello@YOUR-DOMAIN.example` address in
`contact.html`, and the `[DATE]` / `[YOUR NAME]` / `[YOUR EMAIL]` fields in
`about.html`, `contact.html`, `privacy.html` and `terms.html`.

## Also in this repo

`brightburst-arcade/` — an earlier kid-safe games site, self-contained and
deployable on its own. See its own README.
