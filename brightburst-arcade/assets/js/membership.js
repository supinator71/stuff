/* Brightburst Arcade — membership + parent gate.
   Membership state lives in localStorage on this device. When you wire up a real
   payment provider, replace `activateDemo()` with a call to your backend that
   verifies the subscription. See README.md → "Turning on payments". */
(function (global) {
  'use strict';

  var store = global.Arcade ? global.Arcade.store : {
    get: function (k, d) { return d; },
    set: function (k, v) { return v; }
  };

  function isMember() {
    return store.get('member', false) === true;
  }

  function setMember(value) {
    store.set('member', !!value);
    paint();
    return isMember();
  }

  function paint() {
    document.body.classList.toggle('is-member', isMember());
  }

  /* ---------- parent gate ----------
     A deliberate speed bump so a child can't reach payment or off-site pages
     alone. It is a gate, not real authentication — never put anything behind it
     that actually needs to be secure. */

  var gateEl = null;

  function buildGate() {
    if (gateEl) return gateEl;
    gateEl = document.createElement('div');
    gateEl.className = 'modal-backdrop';
    gateEl.hidden = true;
    gateEl.setAttribute('role', 'dialog');
    gateEl.setAttribute('aria-modal', 'true');
    gateEl.setAttribute('aria-labelledby', 'gate-title');
    gateEl.innerHTML =
      '<div class="modal">' +
        '<div style="font-size:2.5rem" aria-hidden="true">🧑‍🦰</div>' +
        '<h2 id="gate-title">Grown-ups only</h2>' +
        '<p>Ask a parent or carer to answer this to continue.</p>' +
        '<label for="gate-answer" id="gate-question" style="font-weight:700"></label>' +
        '<input type="text" id="gate-answer" inputmode="numeric" autocomplete="off" ' +
               'aria-describedby="gate-error">' +
        '<p class="modal-error" id="gate-error" role="alert"></p>' +
        '<div class="modal-actions">' +
          '<button class="btn btn--lime" data-gate="ok">Continue</button>' +
          '<button class="btn btn--ghost" data-gate="cancel">Go back</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(gateEl);
    return gateEl;
  }

  function openGate(onPass) {
    var el = buildGate();
    var a = 6 + Math.floor(Math.random() * 7);   // 6..12
    var b = 4 + Math.floor(Math.random() * 8);   // 4..11
    var expected = a * b;

    var question = el.querySelector('#gate-question');
    var input = el.querySelector('#gate-answer');
    var error = el.querySelector('#gate-error');
    var lastFocused = document.activeElement;

    question.textContent = 'What is ' + a + ' × ' + b + '?';
    input.value = '';
    error.textContent = '';
    el.hidden = false;
    input.focus();

    function close() {
      el.hidden = true;
      document.removeEventListener('keydown', onKey);
      el.removeEventListener('click', onClick);
      input.removeEventListener('keydown', onEnter);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function submit() {
      if (parseInt(input.value, 10) === expected) {
        close();
        onPass();
      } else {
        error.textContent = 'Not quite — try again.';
        input.value = '';
        input.focus();
      }
    }

    function onClick(event) {
      var action = event.target.getAttribute && event.target.getAttribute('data-gate');
      if (action === 'ok') submit();
      if (action === 'cancel' || event.target === el) close();
    }

    function onEnter(event) {
      if (event.key === 'Enter') { event.preventDefault(); submit(); }
    }

    function onKey(event) {
      if (event.key === 'Escape') close();
    }

    el.addEventListener('click', onClick);
    input.addEventListener('keydown', onEnter);
    document.addEventListener('keydown', onKey);
  }

  /* ---------- member-only content ---------- */

  /* Call at the top of a member-only game page. Sends non-members to the
     membership page instead of rendering the game. */
  function guard(returnPath) {
    if (isMember()) return true;
    var target = 'parents.html#join';
    var depth = returnPath === undefined ? '../' : returnPath;
    global.location.replace(depth + target);
    return false;
  }

  /* Placeholder for the real purchase flow. */
  function activateDemo() {
    setMember(true);
  }

  global.Membership = {
    isMember: isMember,
    setMember: setMember,
    openGate: openGate,
    guard: guard,
    activateDemo: activateDemo,
    paint: paint
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
})(window);
