/* Measure Twice — AdSense integration.
 *
 * Fill in CONFIG.publisherId and the slot IDs from your AdSense dashboard and
 * ads go live. Until then every slot renders an inert placeholder at the exact
 * size the real unit will occupy, so the layout you test is the layout you ship
 * and nothing is requested from Google.
 *
 * Two things that are easy to get wrong and expensive to get wrong:
 *
 * 1. EEA / UK / Swiss traffic requires a Google-certified Consent Management
 *    Platform. Serving ads to those users without one breaches the AdSense
 *    terms and can suspend the account. See README.md.
 * 2. Never place a unit where a mis-tap becomes a click. Slots here sit below
 *    the results and in the sidebar, never beside the calculator's buttons. */
(function (global) {
  'use strict';

  var CONFIG = {
    /* From AdSense → Account → Settings. Looks like 'ca-pub-1234567890123456'. */
    publisherId: '',

    /* Map each data-slot name in the HTML to its AdSense ad unit ID. */
    slots: {
      'home-top': '',
      'home-mid': '',
      'calc-below': '',
      'calc-rail': '',
      'article-mid': ''
    },

    /* Leave true so slot sizes stay reserved and pages do not jump as ads load.
       Cumulative Layout Shift is both a ranking signal and a revenue killer. */
    reserveSpace: true
  };

  var LOADER = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  var loaderAdded = false;

  function enabled() {
    return /^ca-pub-\d{10,}$/.test(CONFIG.publisherId);
  }

  function addLoader() {
    if (loaderAdded) return;
    loaderAdded = true;
    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = LOADER + '?client=' + encodeURIComponent(CONFIG.publisherId);
    document.head.appendChild(script);
  }

  function placeholder(slot, name) {
    var box = document.createElement('div');
    box.className = 'ad__placeholder';
    box.textContent = 'Ad slot “' + name + '” — set your publisher ID in assets/js/ads.js';
    slot.appendChild(box);
  }

  function fill(slot, name) {
    var unitId = CONFIG.slots[name];
    if (!unitId) { placeholder(slot, name); return; }

    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', CONFIG.publisherId);
    ins.setAttribute('data-ad-slot', unitId);
    ins.setAttribute('data-ad-format', slot.getAttribute('data-format') || 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    slot.appendChild(ins);

    try {
      (global.adsbygoogle = global.adsbygoogle || []).push({});
    } catch (err) {
      /* An ad failing to fill must never take the calculator down with it. */
    }
  }

  function render() {
    var slots = document.querySelectorAll('.ad[data-slot]');
    if (!slots.length) return;

    var live = enabled();
    if (live) addLoader();

    Array.prototype.forEach.call(slots, function (slot) {
      var name = slot.getAttribute('data-slot');

      var label = document.createElement('span');
      label.className = 'ad__label';
      label.textContent = 'Advertisement';
      slot.appendChild(label);

      if (live) fill(slot, name);
      else placeholder(slot, name);
    });
  }

  global.Ads = { config: CONFIG, render: render, enabled: enabled };

  /* Deferred scripts execute at readyState 'interactive', before
     DOMContentLoaded — and before the per-calculator files that run after this
     one. Waiting for the event is what guarantees every definition has
     registered by the time we mount. */
  if (document.readyState === 'complete') {
    render();
  } else {
    document.addEventListener('DOMContentLoaded', render);
  }
})(window);
