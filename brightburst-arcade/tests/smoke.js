/* End-to-end smoke test for Brightburst Arcade.
 *
 *   npm install --no-save playwright && npx playwright install chromium
 *   python3 -m http.server 8899        # in the project root, another terminal
 *   node tests/smoke.js
 *
 * Set BASE_URL to test a deployed copy, or CHROME_PATH to use a browser you
 * already have installed. Exits non-zero if anything fails. */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8899';
const LAUNCH = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const problems = [];
const notes = [];

async function newCtx(browser) {
  const ctx = await browser.newContext();
  await ctx.route('**fonts.g**', r => r.abort());
  return ctx;
}

function watch(page, label) {
  page.on('console', m => {
    // The sandbox has no outbound network, so the Google Fonts request always
    // fails here. That is an environment artifact, not a site defect.
    if (m.type() === 'error' && !m.text().includes('net::ERR_FAILED')) {
      problems.push(`[${label}] console error: ${m.text()}`);
    }
  });
  page.on('pageerror', e => problems.push(`[${label}] pageerror: ${e.message}`));
  page.on('requestfailed', r => {
    const url = r.url();
    const why = r.failure()?.errorText || '';
    // Google Fonts is unreachable in a sandbox, and ERR_ABORTED just means the
    // test navigated away before an asset finished — neither is a site defect.
    if (url.includes('fonts.g') || why.includes('ERR_ABORTED')) return;
    problems.push(`[${label}] request failed: ${url} — ${why}`);
  });
}

(async () => {
  const browser = await chromium.launch(LAUNCH);

  // ---------- 1. every page loads clean ----------
  const pages = ['/index.html', '/parents.html', '/privacy.html', '/terms.html', '/404.html',
                 '/games/counting-carnival.html', '/games/memory-match.html', '/games/star-catcher.html'];
  for (const path of pages) {
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    watch(page, path);
    const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    if (!res.ok()) problems.push(`[${path}] HTTP ${res.status()}`);
    await ctx.close();
  }
  notes.push(`loaded ${pages.length} pages`);

  // ---------- 2. hub: locked card sends a non-member to the parent gate ----------
  {
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    watch(page, 'hub-lock');
    await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.click('a[data-game="typing-tornado"]');
    await page.waitForSelector('#gate-title', { state: 'visible', timeout: 3000 });
    const gateText = await page.textContent('#gate-question');
    if (!/What is \d+ × \d+\?/.test(gateText)) problems.push(`gate question malformed: ${gateText}`);
    // wrong answer is rejected
    await page.fill('#gate-answer', '1');
    await page.click('[data-gate="ok"]');
    const err = await page.textContent('#gate-error');
    if (!err.trim()) problems.push('gate accepted a wrong answer silently');
    // correct answer passes through to the join page
    const [a, b] = gateText.match(/\d+/g).map(Number);
    await page.fill('#gate-answer', String(a * b));
    await page.click('[data-gate="ok"]');
    await page.waitForURL(/parents\.html#join/, { timeout: 8000, waitUntil: 'domcontentloaded' });
    notes.push('parent gate: rejects wrong answer, passes correct one');
    await ctx.close();
  }

  // ---------- 3. member game is unreachable by direct URL ----------
  {
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    watch(page, 'direct-member-url');
    await page.goto(BASE + '/games/color-splash.html', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/parents\.html/, { timeout: 8000, waitUntil: 'domcontentloaded' });
    notes.push('direct URL to a member game redirects non-members');
    await ctx.close();
  }

  // ---------- 4. Counting Carnival actually scores ----------
  {
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    watch(page, 'counting');
    await page.goto(BASE + '/games/counting-carnival.html', { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="play"]');
    await page.waitForSelector('#cc-question');

    for (let round = 0; round < 3; round++) {
      const q = await page.textContent('#cc-question');
      const m = q.match(/(\d+)\s*([+−×])\s*(\d+)/);
      if (!m) { problems.push(`counting: unparsable question "${q}"`); break; }
      const [, x, op, y] = m;
      const want = op === '+' ? +x + +y : op === '−' ? +x - +y : +x * +y;
      const balloons = await page.$$('.balloon');
      let clicked = false;
      for (const bal of balloons) {
        if ((await bal.textContent()).trim() === String(want)) { await bal.click(); clicked = true; break; }
      }
      if (!clicked) problems.push(`counting: correct answer ${want} not among the balloons for "${q}"`);
      await page.waitForTimeout(420);
    }
    const score = await page.textContent('#hud-score');
    if (!/⭐ [1-9]/.test(score)) problems.push(`counting: score did not rise (got "${score}")`);
    else notes.push(`counting carnival: 3 correct answers → ${score}`);
    await ctx.close();
  }

  // ---------- 5. Memory Match flips and matches ----------
  {
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    watch(page, 'memory');
    await page.goto(BASE + '/games/memory-match.html', { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="play"]');
    await page.waitForSelector('.mm-card');
    const count = await page.locator('.mm-card').count();
    if (count !== 16) problems.push(`memory: expected 16 cards, found ${count}`);

    // Reveal every card by reading the DOM, then click a known pair.
    const animals = await page.$$eval('.mm-card', els => els.map(e => e.dataset.animal));
    const tally = {};
    animals.forEach(a => { tally[a] = (tally[a] || 0) + 1; });
    const badCounts = Object.entries(tally).filter(([, n]) => n !== 2);
    if (badCounts.length) problems.push(`memory: deck is not 8 clean pairs — ${JSON.stringify(tally)}`);
    else notes.push('memory match: deck is exactly 8 pairs');
    const first = animals.indexOf(animals[0]);
    const second = animals.indexOf(animals[0], first + 1);
    await page.locator('.mm-card').nth(first).click();
    await page.locator('.mm-card').nth(second).click();
    await page.waitForTimeout(200);
    const matched = await page.locator('.mm-card.matched').count();
    if (matched !== 2) problems.push(`memory: matching pair did not stick (matched=${matched})`);
    else notes.push('memory match: pair matched and stayed face up');
    await ctx.close();
  }

  // ---------- 6. Star Catcher runs its loop ----------
  {
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    watch(page, 'star');
    await page.goto(BASE + '/games/star-catcher.html', { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="play"]');
    await page.waitForSelector('#stage canvas');
    await page.waitForTimeout(1500);
    const lives = await page.textContent('#hud-extra');
    if (!lives.includes('❤️')) problems.push(`star catcher: lives HUD missing (got "${lives}")`);
    const blank = await page.evaluate(() => {
      const c = document.querySelector('#stage canvas');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      for (let i = 0; i < d.length; i += 4000) if (d[i] !== 255 || d[i+1] !== 255 || d[i+2] !== 255) return false;
      return true;
    });
    if (blank) problems.push('star catcher: canvas is blank — nothing drew');
    else notes.push('star catcher: canvas rendering, lives HUD live');
    await ctx.close();
  }

  // ---------- 7. member unlock: gate → membership → both member games ----------
  {
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    watch(page, 'membership');
    page.on('dialog', d => d.accept());
    await page.goto(BASE + '/parents.html', { waitUntil: 'domcontentloaded' });
    await page.click('.plan--featured [data-action="join"]');
    const q = await page.textContent('#gate-question');
    const [a, b] = q.match(/\d+/g).map(Number);
    await page.fill('#gate-answer', String(a * b));
    await page.click('[data-gate="ok"]');
    await page.waitForTimeout(300);

    const isMember = await page.evaluate(() => window.Membership.isMember());
    if (!isMember) problems.push('membership: join flow did not set member state');
    const adsHidden = await page.evaluate(() => {
      const slot = document.querySelector('.ad-slot');
      return slot ? getComputedStyle(slot).display === 'none' : null;
    });
    if (adsHidden !== true) problems.push(`membership: ad slots still visible for a member (display check = ${adsHidden})`);
    else notes.push('membership: member state set, ad slots hidden');

    // Typing Tornado now loads and pops a word
    await page.goto(BASE + '/games/typing-tornado.html', { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="play"]');
    await page.waitForSelector('.tt-word', { timeout: 5000 });
    const word = (await page.textContent('.tt-word')).trim();
    await page.fill('.tt-input', word);
    await page.waitForTimeout(200);
    const ttScore = await page.textContent('#hud-score');
    if (!/⭐ [1-9]/.test(ttScore)) problems.push(`typing: typing "${word}" did not score (got "${ttScore}")`);
    else notes.push(`typing tornado: typed "${word}" → ${ttScore}`);

    // Color Splash draws
    await page.goto(BASE + '/games/color-splash.html', { waitUntil: 'domcontentloaded' });
    await page.click('[data-action="play"]');
    await page.waitForSelector('#stage canvas');
    // Element-relative hovering re-resolves the box after any scroll, which raw
    // viewport coordinates do not.
    const paper = page.locator('#stage canvas');
    await paper.hover({ position: { x: 60, y: 60 } });
    await page.mouse.down();
    await paper.hover({ position: { x: 220, y: 180 } });
    await paper.hover({ position: { x: 400, y: 300 } });
    await page.mouse.up();
    await page.waitForTimeout(150);
    const painted = await page.evaluate(() => {
      const c = document.querySelector('#stage canvas');
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i] !== 255 || d[i+1] !== 255 || d[i+2] !== 255) n++;
      return n;
    });
    if (painted < 500) {
      problems.push(`color splash: dragging painted only ${painted} pixels`);
      await page.screenshot({ path: 'color-splash-fail.png' });
    } else notes.push(`color splash: brush stroke painted ${painted} pixels`);
    await ctx.close();
  }

  // ---------- 8. progress persists across a reload ----------
  {
    const ctx = await newCtx(browser);
    const page = await ctx.newPage();
    watch(page, 'persist');
    await page.goto(BASE + '/games/memory-match.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.Arcade.progress.record('memory-match', 640));
    await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
    const best = await page.textContent('[data-game="memory-match"] .game-card__best');
    if (!best.includes('640')) problems.push(`persistence: hub did not show the saved best (got "${best}")`);
    const stars = await page.textContent('#stat-stars');
    if (stars === '0') problems.push('persistence: star total did not update');
    else notes.push(`persistence: hub shows "${best.trim()}", ${stars} stars`);
    await ctx.close();
  }

  await browser.close();

  console.log('\n=== PASSED ===');
  notes.forEach(n => console.log('  ✓ ' + n));
  if (problems.length) {
    console.log('\n=== PROBLEMS ===');
    problems.forEach(p => console.log('  ✗ ' + p));
    process.exit(1);
  }
  console.log('\nAll checks passed.');
})();
