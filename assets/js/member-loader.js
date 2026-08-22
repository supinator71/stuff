/* Loads a member-only game, but only after the membership check passes.
   Non-members are redirected to the membership page and the game script is
   never fetched. Kept in its own file so pages need no inline <script>,
   which lets the site ship a strict Content-Security-Policy. */
(function (global) {
  'use strict';

  var tag = document.querySelector('script[data-member-game]');
  if (!tag) return;

  var slug = tag.getAttribute('data-member-game');
  if (!global.Membership || !global.Membership.guard()) return;

  var script = document.createElement('script');
  script.src = '../assets/js/games/' + slug + '.js';
  document.body.appendChild(script);
})(window);
