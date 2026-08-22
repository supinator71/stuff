/* Brightburst Arcade — ad slot manager.

   Ships with NO ad network attached. Nothing is requested from a third party
   until you set `network` below, which keeps the default build free of any
   external tracking.

   Rules this file enforces for you:
   - Members never see ad slots (CSS hides them; this script skips filling them).
   - Slots are always visibly labelled as advertising.
   - Requests are flagged non-personalised — required for child-directed
     inventory. Read README.md → "Turning on ads" before changing this. */
(function (global) {
  'use strict';

  var CONFIG = {
    /* null = show inert placeholders. Set to your network's id when you have a
       child-directed, non-personalised account approved. */
    network: null,

    /* Never flip this to false on a child-directed site. */
    nonPersonalized: true,

    /* Slots to leave empty even when a network is live. */
    disabledSlots: []
  };

  function isMember() {
    return global.Membership ? global.Membership.isMember() : false;
  }

  function placeholder(slot) {
    var name = slot.getAttribute('data-slot') || 'slot';
    var size = slot.getAttribute('data-size') || '';
    slot.innerHTML =
      '<span class="ad-slot__label">Advertisement</span>' +
      '<span>Ad space &ldquo;' + name + '&rdquo;' + (size ? ' · ' + size : '') + '</span>';
  }

  /* Replace the body of this function with your network's embed code.
     `slot` is the container element; `name` is its data-slot value. */
  function fillFromNetwork(slot, name) {
    /* Example shape (pseudo-code — check your provider's docs):
       window.myAdNetwork.render({
         container: slot,
         unit: name,
         childDirected: true,
         personalized: !CONFIG.nonPersonalized
       });
       slot.setAttribute('data-filled', 'true');
    */
    placeholder(slot);
  }

  function render() {
    if (isMember()) return;

    var slots = document.querySelectorAll('.ad-slot');
    Array.prototype.forEach.call(slots, function (slot) {
      var name = slot.getAttribute('data-slot') || 'slot';
      slot.setAttribute('role', 'complementary');
      slot.setAttribute('aria-label', 'Advertisement');

      if (!CONFIG.network || CONFIG.disabledSlots.indexOf(name) !== -1) {
        placeholder(slot);
      } else {
        fillFromNetwork(slot, name);
      }
    });
  }

  global.Ads = { config: CONFIG, render: render };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})(window);
