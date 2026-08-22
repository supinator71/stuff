/* Memory Match — flip the cards, find every animal pair. */
(function (global) {
  'use strict';

  var A = global.Arcade;
  var ANIMALS = ['🦊', '🐼', '🐸', '🦉', '🐙', '🦁', '🐝', '🐬', '🦋', '🐰', '🦕', '🐳'];
  var PAIRS = 8;

  A.game({
    id: 'memory-match',
    name: 'Memory Match',
    emoji: '🐼',
    howTo: [
      'Flip two cards by tapping them.',
      'If the animals match, they stay face up.',
      'If not, they flip back — remember where they were!',
      'Fewer flips and less time means a bigger score.'
    ],
    start: function (api) {
      /* One draw of PAIRS animals, doubled — two separate draws would give two
         different sets and leave the board unsolvable. */
      var chosen = A.shuffle(ANIMALS).slice(0, PAIRS);
      var deck = A.shuffle(chosen.concat(chosen));
      var first = null;
      var busy = false;
      var moves = 0;
      var matched = 0;
      var seconds = 0;

      var board = document.createElement('div');
      board.className = 'mm-board';
      board.setAttribute('role', 'group');
      board.setAttribute('aria-label', 'Memory board');
      var columns = deck.length <= 12 ? 4 : 4;
      board.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';
      api.stage.appendChild(board);

      function updateStat() {
        api.setStat('🔄 ' + moves + ' · ⏱ ' + seconds + 's');
      }

      function scoreNow() {
        return Math.max(50, 1000 - (moves * 18) - (seconds * 4));
      }

      deck.forEach(function (animal, index) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'mm-card';
        card.textContent = animal;
        card.setAttribute('aria-label', 'Face-down card ' + (index + 1));
        card.dataset.animal = animal;
        card.addEventListener('click', function () { flip(card); });
        board.appendChild(card);
      });

      function flip(card) {
        if (busy || card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.setAttribute('aria-label', card.dataset.animal);
        api.sound.blip();

        if (!first) {
          first = card;
          return;
        }

        moves++;
        updateStat();

        if (first.dataset.animal === card.dataset.animal) {
          first.classList.add('matched');
          card.classList.add('matched');
          first = null;
          matched++;
          api.sound.good();
          api.setScore(scoreNow());
          api.toast('Pair!');

          if (matched === PAIRS) {
            api.confetti(50);
            global.setTimeout(function () {
              api.end({
                score: scoreNow(),
                title: 'All matched!',
                message: 'Cleared in ' + moves + ' flips and ' + seconds + ' seconds.'
              });
            }, 500);
          }
        } else {
          busy = true;
          var second = card;
          api.sound.bad();
          global.setTimeout(function () {
            [first, second].forEach(function (el) {
              el.classList.remove('flipped');
              el.setAttribute('aria-label', 'Face-down card');
            });
            first = null;
            busy = false;
          }, 750);
        }
      }

      var ticker = global.setInterval(function () {
        seconds++;
        updateStat();
      }, 1000);

      api.setScore(1000);
      updateStat();

      return function () { global.clearInterval(ticker); };
    }
  });
})(window);
