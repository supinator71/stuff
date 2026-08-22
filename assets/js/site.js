/* Measure Twice — site chrome. Deliberately tiny: everything that matters for
   SEO is already in the HTML. */
(function (global) {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    /* Mark the current page in the nav when the server did not. */
    var here = global.location.pathname.replace(/index\.html$/, '');
    Array.prototype.forEach.call(document.querySelectorAll('.site-nav a'), function (link) {
      var target = new URL(link.getAttribute('href'), global.location.href).pathname.replace(/index\.html$/, '');
      if (target === here && !link.hasAttribute('aria-current')) link.setAttribute('aria-current', 'page');
    });
  });
})(window);
