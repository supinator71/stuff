/* Renders the "More games" strip at the bottom of a game page.
   Keeping a next game one tap away is the single biggest lever on session
   length, which is what both ad revenue and membership conversion follow. */
(function (global) {
  'use strict';

  var A = global.Arcade;

  var GAMES = [
    { slug: 'counting-carnival', name: 'Counting Carnival', emoji: '🎈', art: 'art--coral',  ages: '5–9',  member: false, blurb: 'Pop the balloon with the right answer.' },
    { slug: 'memory-match',      name: 'Memory Match',      emoji: '🐼', art: 'art--grape',  ages: '4–10', member: false, blurb: 'Find every animal pair.' },
    { slug: 'star-catcher',      name: 'Star Catcher',      emoji: '🌟', art: 'art--sky',    ages: '5–10', member: false, blurb: 'Catch the stars, dodge the bombs.' },
    { slug: 'typing-tornado',    name: 'Typing Tornado',    emoji: '⌨️', art: 'art--sun',    ages: '6–10', member: true,  blurb: 'Type the words before they land.' },
    { slug: 'color-splash',      name: 'Color Splash',      emoji: '🎨', art: 'art--bubble', ages: '4–10', member: true,  blurb: 'Brushes, stickers and a save button.' }
  ];

  function currentSlug() {
    var tag = document.querySelector('script[data-current]');
    return tag ? tag.getAttribute('data-current') : '';
  }

  function render() {
    var list = document.getElementById('more-games');
    if (!list) return;

    var here = currentSlug();
    var isMember = global.Membership && global.Membership.isMember();

    GAMES.filter(function (game) { return game.slug !== here; }).forEach(function (game) {
      var best = A ? A.progress.best(game.slug) : 0;
      var li = document.createElement('li');
      li.innerHTML =
        '<a class="game-card" href="' + game.slug + '.html" data-game="' + game.slug + '"' +
            (game.member ? ' data-member="true"' : '') + '>' +
          (game.member && !isMember ? '<span class="lock-badge" aria-hidden="true">🔒</span>' : '') +
          '<div class="game-card__art ' + game.art + '" aria-hidden="true">' + game.emoji + '</div>' +
          '<div class="game-card__body">' +
            '<h3>' + game.name + '</h3>' +
            '<p>' + game.blurb + '</p>' +
            '<div class="game-card__meta">' +
              '<span class="tag ' + (game.member ? 'tag--member">Member' : 'tag--free">Free') + '</span>' +
              '<span class="tag">Ages ' + game.ages + '</span>' +
              '<span class="game-card__best">' + (best ? 'Best ' + best : '') + '</span>' +
            '</div>' +
          '</div>' +
        '</a>';

      if (game.member && !isMember) {
        li.querySelector('a').addEventListener('click', function (event) {
          event.preventDefault();
          global.Membership.openGate(function () {
            global.location.href = '../parents.html#join';
          });
        });
      }

      list.appendChild(li);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})(window);
