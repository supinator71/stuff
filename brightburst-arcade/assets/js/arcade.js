/* Brightburst Arcade — shared game engine.
   No dependencies. Handles progress, sound, the start/end overlay and the HUD
   so each game only has to worry about being a game. */
(function (global) {
  'use strict';

  var STORE_KEY = 'brightburst.v1';

  /* ---------- storage (never throws: private mode / disabled cookies) ---------- */

  function readStore() {
    try {
      return JSON.parse(global.localStorage.getItem(STORE_KEY) || '{}') || {};
    } catch (err) {
      return {};
    }
  }

  function writeStore(data) {
    try {
      global.localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (err) {
      /* Storage unavailable — the site still works, progress just won't persist. */
    }
  }

  var store = {
    get: function (key, fallback) {
      var data = readStore();
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : fallback;
    },
    set: function (key, value) {
      var data = readStore();
      data[key] = value;
      writeStore(data);
      return value;
    }
  };

  /* ---------- progress ---------- */

  var progress = {
    bests: function () { return store.get('bests', {}) || {}; },

    best: function (gameId) { return progress.bests()[gameId] || 0; },

    stars: function () { return store.get('stars', 0) || 0; },

    plays: function () { return store.get('plays', 0) || 0; },

    gamesPlayed: function () { return Object.keys(progress.bests()).length; },

    /* Returns { best: n, isBest: bool, starsEarned: n } */
    record: function (gameId, score) {
      var bests = progress.bests();
      var previous = bests[gameId] || 0;
      var isBest = score > previous;
      if (isBest) {
        bests[gameId] = score;
        store.set('bests', bests);
      }
      store.set('plays', progress.plays() + 1);

      var earned = Math.max(1, Math.round(score / 10));
      store.set('stars', progress.stars() + earned);

      return { best: Math.max(previous, score), isBest: isBest, starsEarned: earned };
    },

    reset: function () {
      writeStore({ member: store.get('member', false) });
    }
  };

  /* ---------- sound (WebAudio blips, muted state persisted) ---------- */

  var audioCtx = null;

  var sound = {
    get enabled() { return store.get('sound', true) !== false; },

    set enabled(value) { store.set('sound', !!value); },

    toggle: function () {
      sound.enabled = !sound.enabled;
      return sound.enabled;
    },

    ctx: function () {
      if (!sound.enabled) return null;
      if (!audioCtx) {
        var Ctor = global.AudioContext || global.webkitAudioContext;
        if (!Ctor) return null;
        try { audioCtx = new Ctor(); } catch (err) { return null; }
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    },

    tone: function (freq, duration, type, delay, volume) {
      var ctx = sound.ctx();
      if (!ctx) return;
      var start = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume || 0.18, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    },

    good: function () {
      sound.tone(660, 0.12, 'triangle', 0);
      sound.tone(880, 0.16, 'triangle', 0.09);
    },
    bad: function () {
      sound.tone(200, 0.22, 'sawtooth', 0, 0.12);
    },
    blip: function () {
      sound.tone(520, 0.07, 'square', 0, 0.1);
    },
    win: function () {
      [523, 659, 784, 1047].forEach(function (freq, i) {
        sound.tone(freq, 0.2, 'triangle', i * 0.11);
      });
    },
    lose: function () {
      [392, 330, 262].forEach(function (freq, i) {
        sound.tone(freq, 0.26, 'sine', i * 0.14, 0.14);
      });
    }
  };

  /* ---------- little helpers ---------- */

  function rand(max) { return Math.floor(Math.random() * max); }

  function pick(list) { return list[rand(list.length)]; }

  function shuffle(list) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = rand(i + 1);
      var tmp = out[i]; out[i] = out[j]; out[j] = tmp;
    }
    return out;
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  var CONFETTI_COLORS = ['#ffc93c', '#ff6b6b', '#4ecdc4', '#a66cff', '#7bd389', '#ff8fd0'];

  function confetti(container, count) {
    if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var host = container || document.body;
    var total = count || 40;
    for (var i = 0; i < total; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = rand(100) + '%';
      piece.style.background = pick(CONFETTI_COLORS);
      piece.style.setProperty('--dur', (1400 + rand(900)) + 'ms');
      piece.style.animationDelay = rand(400) + 'ms';
      host.appendChild(piece);
      (function (node) {
        global.setTimeout(function () { node.remove(); }, 2800);
      })(piece);
    }
  }

  function toast(host, text, isBad) {
    var el = document.createElement('div');
    el.className = 'toast' + (isBad ? ' toast--bad' : '');
    el.textContent = text;
    host.appendChild(el);
    global.setTimeout(function () { el.remove(); }, 950);
  }

  /* ---------- the game shell ---------- */

  /**
   * config = {
   *   id, name, emoji, howTo: [string],
   *   playLabel, start: function(api) -> optional cleanup function
   * }
   */
  function game(config) {
    var stage = document.getElementById('stage');
    var overlay = document.getElementById('overlay');
    var scoreEl = document.getElementById('hud-score');
    var extraEl = document.getElementById('hud-extra');
    var soundBtn = document.getElementById('sound-toggle');
    var cleanup = null;
    var running = false;

    function paintSoundBtn() {
      var on = sound.enabled;
      soundBtn.textContent = on ? '🔊' : '🔇';
      soundBtn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
      soundBtn.setAttribute('aria-pressed', String(on));
    }

    if (soundBtn) {
      paintSoundBtn();
      soundBtn.addEventListener('click', function () {
        sound.toggle();
        paintSoundBtn();
        if (sound.enabled) sound.blip();
      });
    }

    var api = {
      stage: stage,
      sound: sound,
      setScore: function (value) {
        if (scoreEl) scoreEl.textContent = '⭐ ' + value;
      },
      setStat: function (text) {
        if (!extraEl) return;
        extraEl.textContent = text || '';
        extraEl.hidden = !text;
      },
      toast: function (text, isBad) { toast(stage, text, isBad); },
      confetti: function (count) { confetti(stage, count); },
      end: function (result) { showEnd(result || {}); }
    };

    function clearStage() {
      if (typeof cleanup === 'function') {
        try { cleanup(); } catch (err) { /* a broken cleanup must not trap the player */ }
      }
      cleanup = null;
      stage.innerHTML = '';
    }

    function showStart() {
      running = false;
      clearStage();
      api.setScore(0);
      api.setStat('');

      var best = progress.best(config.id);
      var steps = (config.howTo || []).map(function (line) {
        return '<li>' + line + '</li>';
      }).join('');

      overlay.innerHTML =
        '<div class="overlay-card">' +
          '<div class="big-emoji" aria-hidden="true">' + config.emoji + '</div>' +
          '<h2>' + config.name + '</h2>' +
          '<div class="how-to"><strong>How to play</strong><ul>' + steps + '</ul></div>' +
          (best ? '<p class="overlay-best">Your best: ' + best + '</p>' : '') +
          '<div class="overlay-actions">' +
            '<button class="btn btn--big btn--lime" data-action="play">▶ Play</button>' +
            '<a class="btn btn--ghost" href="../index.html">Back to arcade</a>' +
          '</div>' +
        '</div>';
      overlay.hidden = false;
      var playBtn = overlay.querySelector('[data-action="play"]');
      playBtn.focus();
      playBtn.addEventListener('click', begin);
    }

    function begin() {
      overlay.hidden = true;
      overlay.innerHTML = '';
      clearStage();
      api.setScore(0);
      running = true;
      sound.blip();
      cleanup = config.start(api) || null;
    }

    function showEnd(result) {
      if (!running) return;
      running = false;
      clearStage();

      var score = Math.max(0, Math.round(result.score || 0));
      var outcome = progress.record(config.id, score);
      var won = result.won !== false && score > 0;

      if (outcome.isBest && score > 0) {
        sound.win();
        confetti(stage, 55);
      } else if (won) {
        sound.win();
      } else {
        sound.lose();
      }

      overlay.innerHTML =
        '<div class="overlay-card">' +
          '<div class="big-emoji" aria-hidden="true">' + (outcome.isBest && score > 0 ? '🏆' : (won ? '🎉' : '💪')) + '</div>' +
          '<h2>' + (outcome.isBest && score > 0 ? 'New high score!' : (result.title || 'Nice try!')) + '</h2>' +
          (result.message ? '<p>' + result.message + '</p>' : '') +
          '<div class="overlay-score">' + score + '</div>' +
          '<p class="overlay-best">Best: ' + outcome.best + ' &nbsp;·&nbsp; +' + outcome.starsEarned + ' ⭐ earned</p>' +
          '<div class="overlay-actions">' +
            '<button class="btn btn--big btn--lime" data-action="again">↻ Play again</button>' +
            '<a class="btn btn--ghost" href="../index.html">More games</a>' +
          '</div>' +
        '</div>';
      overlay.hidden = false;
      var againBtn = overlay.querySelector('[data-action="again"]');
      againBtn.focus();
      againBtn.addEventListener('click', begin);
    }

    /* Leaving the page mid-game should still tear down timers/listeners. */
    global.addEventListener('pagehide', function () {
      if (typeof cleanup === 'function') cleanup();
    });

    showStart();
    return api;
  }

  global.Arcade = {
    store: store,
    progress: progress,
    sound: sound,
    game: game,
    confetti: confetti,
    toast: toast,
    rand: rand,
    pick: pick,
    shuffle: shuffle,
    clamp: clamp
  };
})(window);
