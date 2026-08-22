/* Typing Tornado — type the falling words before they hit the ground. */
(function (global) {
  'use strict';

  var A = global.Arcade;

  var EASY = ['cat', 'dog', 'sun', 'hat', 'bug', 'red', 'map', 'fox', 'cup', 'bee', 'pig', 'jam'];
  var MID  = ['apple', 'tiger', 'cloud', 'river', 'happy', 'green', 'lemon', 'robot', 'grass', 'plane', 'sandy', 'chair'];
  var HARD = ['dolphin', 'rainbow', 'pumpkin', 'crayons', 'jellyfish', 'butterfly', 'adventure', 'telescope', 'kangaroo', 'blueberry'];

  var START_LIVES = 3;

  A.game({
    id: 'typing-tornado',
    name: 'Typing Tornado',
    emoji: '⌨️',
    howTo: [
      'Words drift down from the clouds.',
      'Type a word and it pops the moment you finish it.',
      'Longer words are worth more points.',
      'Let three words reach the ground and the storm wins.'
    ],
    start: function (api) {
      var field = document.createElement('div');
      field.className = 'tt-field';

      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'tt-input';
      input.setAttribute('aria-label', 'Type the falling words here');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('spellcheck', 'false');
      input.placeholder = 'type here…';

      var holder = document.createElement('div');
      holder.style.textAlign = 'center';
      holder.style.width = '100%';
      holder.appendChild(field);
      holder.appendChild(input);
      api.stage.appendChild(holder);
      input.focus();

      var words = [];
      var score = 0;
      var lives = START_LIVES;
      var typed = 0;
      var elapsed = 0;
      var spawnTimer = 0.4;
      var over = false;
      var rafId = null;
      var lastTime = null;

      function paintHud() {
        api.setScore(score);
        api.setStat('❤️'.repeat(Math.max(0, lives)) || '💔');
      }

      function wordList() {
        if (elapsed < 25) return typed < 4 ? EASY : EASY.concat(MID);
        if (elapsed < 55) return MID.concat(EASY);
        return HARD.concat(MID);
      }

      function spawn() {
        var text = A.pick(wordList());
        var el = document.createElement('div');
        el.className = 'tt-word';
        el.textContent = text;
        el.style.top = '-40px';
        el.style.left = (12 + Math.random() * 76) + '%';
        field.appendChild(el);
        words.push({
          el: el,
          text: text,
          y: -40,
          speed: 26 + Math.random() * 14 + elapsed * 0.55
        });
      }

      function renderMatches() {
        var value = input.value.trim().toLowerCase();
        words.forEach(function (word) {
          if (value && word.text.indexOf(value) === 0) {
            word.el.innerHTML = '<span class="hit"></span>';
            word.el.firstChild.textContent = word.text.slice(0, value.length);
            word.el.appendChild(document.createTextNode(word.text.slice(value.length)));
          } else if (word.el.firstChild && word.el.firstChild.nodeType !== 3) {
            word.el.textContent = word.text;
          }
        });
      }

      function popWord(index) {
        var word = words[index];
        words.splice(index, 1);
        word.el.remove();
        typed++;
        var points = 10 + word.text.length * 2;
        score += points;
        api.sound.good();
        api.toast('+' + points);
        paintHud();
      }

      function onInput() {
        var value = input.value.trim().toLowerCase();
        if (!value) { renderMatches(); return; }

        for (var i = 0; i < words.length; i++) {
          if (words[i].text === value) {
            popWord(i);
            input.value = '';
            renderMatches();
            return;
          }
        }
        renderMatches();
      }

      input.addEventListener('input', onInput);
      /* Space or Enter clears a wrong guess rather than jamming the player. */
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          input.value = '';
          renderMatches();
        }
      });
      field.addEventListener('pointerdown', function () { input.focus(); });

      function step(dt) {
        elapsed += dt;
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          spawn();
          spawnTimer = Math.max(0.75, 2.3 - elapsed * 0.022);
        }

        var floor = field.clientHeight - 34;
        for (var i = words.length - 1; i >= 0; i--) {
          var word = words[i];
          word.y += word.speed * dt;
          word.el.style.top = word.y + 'px';

          if (word.y >= floor) {
            words.splice(i, 1);
            word.el.remove();
            lives--;
            api.sound.bad();
            api.toast('Missed “' + word.text + '”', true);
            paintHud();
            if (lives <= 0) { finish(); return; }
          }
        }
      }

      function finish() {
        if (over) return;
        over = true;
        api.end({
          score: score,
          title: 'Storm over!',
          message: 'You typed ' + typed + ' word' + (typed === 1 ? '' : 's') + '.'
        });
      }

      function loop(time) {
        if (over) return;
        if (lastTime === null) lastTime = time;
        var dt = Math.min(0.05, (time - lastTime) / 1000);
        lastTime = time;
        step(dt);
        if (over) return;
        rafId = global.requestAnimationFrame(loop);
      }

      paintHud();
      rafId = global.requestAnimationFrame(loop);

      return function () {
        over = true;
        if (rafId) global.cancelAnimationFrame(rafId);
      };
    }
  });
})(window);
