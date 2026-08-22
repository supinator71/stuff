/* Measure Twice — end-to-end browser test.
 *
 *   npm install --no-save playwright && npx playwright install chromium
 *   python3 -m http.server 8899        # from the project root
 *   node tests/browser.test.js
 *
 * BASE_URL tests a deployed copy; CHROME_PATH uses a browser you already have. */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8899';
const LAUNCH = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};

const CALCULATORS = ['concrete', 'paint', 'flooring', 'tile', 'drywall', 'mulch', 'gravel', 'deck'];
const PAGES = ['/index.html', '/about.html', '/contact.html', '/privacy.html', '/terms.html',
               '/404.html', '/guides/index.html', '/guides/waste-factors.html',
               '/guides/concrete-slab-cost.html'];

const problems = [];
const notes = [];

function watch(page, label) {
  page.on('pageerror', e => problems.push(`[${label}] pageerror: ${e.message}`));
  page.on('console', m => {
    if (m.type() === 'error') problems.push(`[${label}] console: ${m.text()}`);
  });
  page.on('requestfailed', r => {
    const why = r.failure()?.errorText || '';
    if (why.includes('ERR_ABORTED')) return;   // navigation cut a pending asset short
    problems.push(`[${label}] request failed: ${r.url()} — ${why}`);
  });
}

(async () => {
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  watch(page, 'main');

  const go = async path => {
    const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    if (!res.ok()) problems.push(`${path}: HTTP ${res.status()}`);
  };

  /* ---- 1. every page loads, has a unique title, canonical and description ---- */
  const titles = new Map();
  for (const path of [...PAGES, ...CALCULATORS.map(c => `/calculators/${c}.html`)]) {
    await go(path);
    const meta = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      h1: document.querySelectorAll('h1').length
    }));
    if (!meta.title) problems.push(`${path}: no title`);
    if (!meta.desc) problems.push(`${path}: no meta description`);
    if (!meta.canonical) problems.push(`${path}: no canonical`);
    if (meta.h1 !== 1) problems.push(`${path}: ${meta.h1} <h1> elements, expected exactly 1`);
    if (titles.has(meta.title)) problems.push(`${path}: title duplicates ${titles.get(meta.title)}`);
    titles.set(meta.title, path);
  }
  notes.push(`${titles.size} pages load with unique titles, descriptions and canonicals`);

  /* ---- 2. every calculator renders and produces a result from its defaults ---- */
  for (const slug of CALCULATORS) {
    await go(`/calculators/${slug}.html`);
    await page.waitForSelector('.calc__body input', { timeout: 5000 });

    const shown = await page.isVisible('#results .headline .num');
    if (!shown) { problems.push(`${slug}: no result from the default values`); continue; }

    const value = await page.textContent('#results .headline .num');
    const numeric = parseFloat(value.replace(/,/g, ''));
    if (!isFinite(numeric) || numeric <= 0) {
      problems.push(`${slug}: headline is "${value}"`);
      continue;
    }
    notes.push(`${slug}: defaults → ${value} ${await page.textContent('#results .headline .unit')}`);
  }

  /* ---- 3. feet-and-inches input parses ---- */
  await go('/calculators/concrete.html');
  await page.fill('#f-length', "20'6\"");
  await page.waitForTimeout(150);
  const withInches = parseFloat((await page.textContent('#results .headline .num')).replace(/,/g, ''));
  await page.fill('#f-length', '20');
  await page.waitForTimeout(150);
  const plain = parseFloat((await page.textContent('#results .headline .num')).replace(/,/g, ''));
  if (!(withInches > plain)) problems.push(`feet-inches: 20'6" (${withInches}) should exceed 20 (${plain})`);
  else notes.push(`feet-and-inches parsed: 20 ft → ${plain} yd³, 20'6" → ${withInches} yd³`);

  /* ---- 4. metric toggle converts rather than clearing, and agrees ---- */
  await go('/calculators/concrete.html');
  const imperialYd = parseFloat((await page.textContent('#results .headline .num')).replace(/,/g, ''));
  await page.click('.unit-toggle button:nth-child(2)');
  await page.waitForTimeout(200);
  const lengthAfter = await page.inputValue('#f-length');
  if (Math.abs(parseFloat(lengthAfter) - 6.096) > 0.01) {
    problems.push(`unit toggle: 20 ft became "${lengthAfter}", expected ~6.096 m`);
  }
  const metricM3 = parseFloat((await page.textContent('#results .headline .num')).replace(/,/g, ''));
  const metricAsYd = metricM3 / 0.764554857984;
  if (Math.abs(metricAsYd - imperialYd) > 0.02) {
    problems.push(`unit toggle: ${imperialYd} yd³ became ${metricM3} m³ = ${metricAsYd.toFixed(3)} yd³`);
  } else {
    notes.push(`metric toggle agrees: ${imperialYd} yd³ = ${metricM3} m³`);
  }

  /* the preference must persist to the next calculator */
  await go('/calculators/paint.html');
  const pressed = await page.getAttribute('.unit-toggle button:nth-child(2)', 'aria-pressed');
  if (pressed !== 'true') problems.push('unit preference did not persist across pages');
  else notes.push('unit preference persists across pages');
  await page.click('.unit-toggle button:nth-child(1)');   // back to imperial for later checks

  /* ---- 5. validation: bad input suppresses results rather than showing NaN ---- */
  await go('/calculators/flooring.html');
  await page.fill('#f-length', 'abc');
  await page.waitForTimeout(150);
  if (await page.isVisible('#results .headline')) problems.push('validation: "abc" still produced a result');
  const err = await page.textContent('#f-length-err');
  if (!err.trim()) problems.push('validation: no error message shown for "abc"');
  await page.fill('#f-length', '16');
  await page.waitForTimeout(150);
  if (!(await page.isVisible('#results .headline'))) problems.push('validation: results did not recover after a fix');
  else notes.push('invalid input is caught and recovers');

  /* ---- 6. results are shareable through the URL ---- */
  await go('/calculators/mulch.html');
  await page.fill('#f-length', '42');
  await page.waitForTimeout(200);
  const shareUrl = page.url();
  if (!/[?&]length=42/.test(shareUrl)) problems.push(`share URL missing the input: ${shareUrl}`);
  await page.goto(shareUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(200);
  if ((await page.inputValue('#f-length')) !== '42') problems.push('share URL did not restore the input');
  else notes.push('inputs round-trip through the URL');

  /* ---- 7. cost fields are optional ---- */
  await go('/calculators/gravel.html');
  const before = await page.isVisible('#results .headline');
  await page.fill('#f-price', '32');
  await page.waitForTimeout(200);
  const costText = await page.textContent('#results');
  if (!before) problems.push('gravel: no result before entering a price');
  if (!/\$/.test(costText)) problems.push('gravel: entering a price produced no cost line');
  else notes.push('optional price fields add a cost table');

  /* ---- 8. ad slots reserve space and stay unfilled without a publisher ID ---- */
  await go('/index.html');
  const ads = await page.evaluate(() => {
    const slots = [...document.querySelectorAll('.ad[data-slot]')];
    return {
      count: slots.length,
      labelled: slots.every(s => s.querySelector('.ad__label')),
      placeholders: slots.every(s => s.querySelector('.ad__placeholder')),
      reserved: slots.every(s => s.getBoundingClientRect().height > 80),
      external: [...document.scripts].some(s => /googlesyndication/.test(s.src))
    };
  });
  if (!ads.count) problems.push('no ad slots found on the home page');
  if (!ads.labelled) problems.push('an ad slot is missing its "Advertisement" label');
  if (!ads.placeholders) problems.push('an ad slot rendered nothing');
  if (!ads.reserved) problems.push('an ad slot has no reserved height — this will cause layout shift');
  if (ads.external) problems.push('AdSense script loaded despite no publisher ID being set');
  else notes.push(`${ads.count} ad slots: labelled, space reserved, no external request`);

  /* ---- 9. no horizontal overflow at phone width ---- */
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const small = await phone.newPage();
  watch(small, 'mobile');
  for (const path of ['/index.html', '/calculators/concrete.html', '/guides/waste-factors.html']) {
    await small.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    const overflow = await small.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) problems.push(`${path}: ${overflow}px horizontal overflow at 390px wide`);
  }
  notes.push('no horizontal overflow at 390px on home, calculator or guide');

  /* ---- 10. internal links all resolve ---- */
  await go('/index.html');
  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map(a => a.href)
      .filter(h => h.startsWith(location.origin)));
  const checked = new Set();
  for (const href of links) {
    const clean = href.split('#')[0];
    if (checked.has(clean)) continue;
    checked.add(clean);
    const res = await page.request.get(clean);
    if (!res.ok()) problems.push(`broken link from home page: ${clean} → HTTP ${res.status()}`);
  }
  notes.push(`${checked.size} internal links from the home page resolve`);

  await browser.close();

  console.log('\n=== PASSED ===');
  notes.forEach(n => console.log('  ✓ ' + n));
  if (problems.length) {
    console.log(`\n=== ${problems.length} PROBLEMS ===`);
    problems.forEach(p => console.log('  ✗ ' + p));
    process.exit(1);
  }
  console.log('\nAll browser checks passed.\n');
})();
