/* Brightburst Arcade — site chrome: progress strip, card locks, parent-gated links. */
(function (global) {
  'use strict';

  var Arcade = global.Arcade;
  var Membership = global.Membership;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function paintProgress() {
    if (!Arcade) return;
    var map = {
      'stat-stars': Arcade.progress.stars(),
      'stat-games': Arcade.progress.gamesPlayed(),
      'stat-plays': Arcade.progress.plays()
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  function paintBestScores() {
    if (!Arcade) return;
    var cards = document.querySelectorAll('[data-game]');
    Array.prototype.forEach.call(cards, function (card) {
      var slot = card.querySelector('.game-card__best');
      if (!slot) return;
      var best = Arcade.progress.best(card.getAttribute('data-game'));
      slot.textContent = best ? 'Best ' + best : '';
    });
  }

  /* Member-only cards: a non-member gets the parent gate, then the join page. */
  function wireLockedCards() {
    var locked = document.querySelectorAll('.game-card[data-member="true"]');
    Array.prototype.forEach.call(locked, function (card) {
      card.addEventListener('click', function (event) {
        if (Membership && Membership.isMember()) return;
        event.preventDefault();
        Membership.openGate(function () {
          global.location.href = 'parents.html#join';
        });
      });
    });
  }

  /* Any link marked data-parent-gate is held behind the gate. */
  function wireGatedLinks() {
    var links = document.querySelectorAll('[data-parent-gate]');
    Array.prototype.forEach.call(links, function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var href = link.getAttribute('href');
        Membership.openGate(function () { global.location.href = href; });
      });
    });
  }

  /* Membership page controls. */
  function wireMembershipControls() {
    var joinButtons = document.querySelectorAll('[data-action="join"]');
    Array.prototype.forEach.call(joinButtons, function (btn) {
      btn.addEventListener('click', function () {
        Membership.openGate(function () {
          /* Replace with your real checkout redirect. See README.md. */
          Membership.activateDemo();
          paintMemberState();
          global.alert('Demo membership switched on for this browser. Every game is unlocked and ad slots are hidden.');
        });
      });
    });

    var cancelBtn = document.querySelector('[data-action="cancel-membership"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function () {
        Membership.setMember(false);
        paintMemberState();
      });
    }

    var resetBtn = document.querySelector('[data-action="reset-progress"]');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!global.confirm('Erase all scores and stars saved in this browser?')) return;
        Arcade.progress.reset();
        paintProgress();
        paintBestScores();
        global.alert('Progress cleared.');
      });
    }
  }

  function paintMemberState() {
    var status = document.getElementById('member-status');
    if (!status) return;
    var member = Membership.isMember();
    status.textContent = member
      ? 'Membership is active in this browser.'
      : 'No membership on this browser — the three free games are still open.';
  }

  function stampYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  ready(function () {
    paintProgress();
    paintBestScores();
    wireLockedCards();
    wireGatedLinks();
    wireMembershipControls();
    paintMemberState();
    stampYear();
  });
})(window);
