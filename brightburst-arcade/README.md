# Brightburst Arcade

A colourful, kid-safe browser arcade — five original games, a membership tier, and
reserved ad space. Plain HTML, CSS and JavaScript: **no build step, no framework,
no dependencies**. The repository *is* the website.

```
index.html          the arcade hub
games/*.html        one page per game
parents.html        safety info, FAQ, membership plans
privacy.html        privacy policy (template — see "Before you launch")
terms.html          terms of use (template — see "Before you launch")
assets/css/         main.css (design system) + game.css (game shell)
assets/js/          arcade.js (engine), membership.js, ads.js, site.js, more-games.js
assets/js/games/    one file per game
tests/smoke.js      end-to-end browser test
netlify.toml        hosting config + security headers
```

## Run it locally

```bash
python3 -m http.server 8899
# open http://localhost:8899
```

Any static server works. Opening `index.html` straight off disk mostly works too,
but membership redirects behave better over HTTP.

## Deploy

No build command, publish directory is the repo root.

| Host | What to do |
| --- | --- |
| **Netlify** | Connect the repo. `netlify.toml` sets headers and the 404 page for you. |
| **Cloudflare Pages** | Connect the repo, leave the build command empty. |
| **Vercel** | Import as a static project. |
| **GitHub Pages** | Settings → Pages → deploy from branch. Security headers aren't configurable here. |

Costs nothing to host at small scale on any of them.

## The five games

| Game | Skill | Tier |
| --- | --- | --- |
| Counting Carnival | Mental arithmetic, difficulty auto-scales | Free |
| Memory Match | Working memory | Free |
| Star Catcher | Reaction time, tracking | Free |
| Typing Tornado | Touch typing | Member |
| Color Splash | Free drawing, saves a PNG | Member |

## How the money parts are wired

### Membership

`assets/js/membership.js` holds a single boolean in `localStorage`. Today the
plan buttons on `parents.html` call `Membership.activateDemo()`, which flips that
flag so you can see the member experience — **no card is charged**.

To turn on real payments:

1. Create the products in **Stripe** (or Paddle, Lemon Squeezy — Paddle and Lemon
   Squeezy act as merchant of record and handle sales tax/VAT for you, which is
   usually worth it for a small subscription business).
2. Point the plan buttons at your hosted checkout link instead of
   `activateDemo()`. Keep the parent gate in front of it.
3. **Verify entitlement on a server.** A `localStorage` boolean is trivially
   editable — fine as a convenience flag, useless as a paywall. If you only ever
   gate two game scripts, accept that a determined adult can unlock them; if the
   membership grows into something you need to protect, put the member game files
   behind a signed URL or an authenticated endpoint and check the subscription
   server-side.
4. Update `privacy.html` and `terms.html` to name your payment provider and state
   your refund policy.

### Advertising

`assets/js/ads.js` ships with `network: null`, so **nothing is requested from any
third party** and slots render inert placeholders. Slots live on the hub, below
each game, and on the parents page. Members never see them (`body.is-member`
hides them in CSS *and* the script skips filling them).

To connect a network, set `CONFIG.network` and fill in `fillFromNetwork()`. Before
you do, read the next section — this is the part people get wrong.

## Before you launch: the legal bit

**I am not a lawyer and this is not legal advice.** A site aimed at children is
one of the most regulated things you can put on the internet, and the rules bite
hardest on exactly the thing you want to do with it — make money. Budget for an
hour with a lawyer who knows children's privacy before you switch on ads or
payments. The short version of what you're walking into:

- **COPPA (US)** applies to sites directed at children under 13. Its definition of
  "personal information" includes persistent identifiers — cookies, device IDs,
  ad IDs. Serving *personalised* ads to a child-directed site without verifiable
  parental consent is the classic violation, and the FTC has issued nine-figure
  penalties for it. This build collects nothing and sets no cookies, which keeps
  you clear by default; an ad network is the thing that would change that.
- **Contextual, non-personalised ads only.** Most large networks support a
  child-directed / "tag for child-directed treatment" mode which disables
  behavioural targeting. It also pays noticeably less than personalised
  inventory — plan your numbers around that, not around general web CPMs.
- **Not every network will take you.** Some ad networks prohibit child-directed
  traffic outright. There are kid-specific ad networks that specialise in
  COPPA-compliant inventory; they usually want a minimum traffic level before
  they'll talk to you.
- **UK Age Appropriate Design Code / GDPR-K** apply if you have UK or EU visitors,
  and add their own requirements around defaults, profiling and dark patterns.
- **The parent gate is a speed bump, not a control.** It stops a five-year-old
  wandering into checkout. It is not verifiable parental consent and won't
  satisfy any regulator that asks for consent.
- **Fill in the templates.** `privacy.html` and `terms.html` describe what this
  code actually does today and have `[YOUR NAME]`, `[YOUR EMAIL]` and `[DATE]`
  placeholders. Both must be updated the moment you add an ad network, analytics
  or payments — a privacy policy that describes a site you no longer run is worse
  than none.

## On "popular"

The code is the easy half. Nothing here generates traffic, and kids' content is a
crowded space dominated by a handful of very large sites. What actually moves the
needle, roughly in order:

1. **Parents and teachers are your distribution, not kids.** Kids don't search;
   the adult buying them screen time does. The parents page is written for that
   reader on purpose.
2. **Pick a narrower wedge than "kids' games".** "Free times-tables games for
   Year 3" is a search you can plausibly rank for. "Kids games" is not.
3. **Teacher communities compound.** One teacher putting the link on a class page
   is worth more than a hundred social impressions, and it recurs every year.
4. **Session length is the revenue lever.** Both ad impressions and membership
   conversion follow time on site — which is why every game page ends with a
   "More games" strip rather than a dead end.
5. **Be realistic about ad income.** Non-personalised kids' inventory at modest
   traffic is pocket money. The membership tier is the more plausible path to
   real revenue, which is why the two best games sit behind it.

## Adding a game

1. Write `assets/js/games/your-game.js`:

   ```js
   Arcade.game({
     id: 'your-game',            // storage key for the high score
     name: 'Your Game',
     emoji: '🎯',
     howTo: ['One line per instruction.'],
     start: function (api) {
       // api.stage      – the DOM node to build into (already empty)
       // api.setScore(n) – update the score in the HUD
       // api.setStat(s)  – the second HUD chip (lives, timer, …)
       // api.toast(t)    – a floating message; api.toast(t, true) for bad news
       // api.sound       – .good() .bad() .blip() .win() .lose()
       // api.confetti()  – celebrate
       // api.end({score, title, message})
       return function cleanup() { /* clear timers and listeners */ };
     }
   });
   ```

   Returning a cleanup function is not optional — the shell calls it on replay and
   on page exit, and a leaked `setInterval` or `requestAnimationFrame` will keep
   running underneath the next round.

2. Copy any file in `games/` as the page and point the last `<script>` at your new
   file. For a member-only game use
   `<script src="../assets/js/member-loader.js" data-member-game="your-game"></script>`.
3. Add a card to `index.html` and an entry to the `GAMES` array in
   `assets/js/more-games.js`.
4. Add the URL to `sitemap.xml`.

## Testing

```bash
npm install --no-save playwright && npx playwright install chromium
python3 -m http.server 8899          # in another terminal
node tests/smoke.js
```

Drives a real browser through every page and every game: the parent gate accepts
only correct answers, member games are unreachable by direct URL, each game
actually scores, ad slots vanish for members, and progress survives a reload.
Exits non-zero on failure. `BASE_URL` tests a deployed copy; `CHROME_PATH` uses a
browser you already have.

## Notes

- **Fonts** are the only external request (Google Fonts). To remove it entirely —
  worth doing for a children's site, and required if you want a zero-third-party
  claim — download Baloo 2 and Nunito, drop the `.woff2` files in `assets/fonts/`,
  replace the `<link>` tags with an `@font-face` block, and drop the font hosts
  from the CSP in `netlify.toml`.
- **Content-Security-Policy** in `netlify.toml` is strict because the site has no
  inline `<script>` anywhere. Connecting an ad network will require widening
  `script-src` and `connect-src` to its hosts. Add those hosts by name; don't
  reach for a wildcard.
- **Placeholders to replace before launch:** `YOUR-DOMAIN.example` in `robots.txt`
  and `sitemap.xml`, and the bracketed fields in `privacy.html` / `terms.html`.
- **Everything a child does stays on their device.** Scores, stars, sound
  preference and the member flag all live in one `localStorage` key,
  `brightburst.v1`. There is no server, no account and no telemetry.
