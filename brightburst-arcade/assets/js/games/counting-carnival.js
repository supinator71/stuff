/* Counting Carnival — pop the balloon with the right answer before time runs out. */
(function (global) {
  'use strict';

  var A = global.Arcade;
  var ROUND_SECONDS = 60;
  var BALLOON_COLORS = ['var(--coral)', 'var(--sky)', 'var(--grape)', 'var(--bubble)'];

  /* Difficulty climbs with the number of correct answers so a 5-year-old and a
     9-year-old both get a fair first minute. */
  function makeQuestion(solved) {
    var stage = solved < 5 ? 0 : solved < 11 ? 1 : solved < 18 ? 2 : 3;
    var a, b, op;

    if (stage === 0) {
      a = 1 + A.rand(9); b = 1 + A.rand(9); op = '+';
    } else if (stage === 1) {
      a = 5 + A.rand(15); b = 1 + A.rand(a - 1); op = A.pick(['+', '−']);
    } else if (stage === 2) {
      a = 2 + A.rand(9); b = 2 + A.rand(9); op = '×';
    } else {
      op = A.pick(['+', '−', '×']);
      if (op === '×') { a = 3 + A.rand(10); b = 2 + A.rand(11); }
      else { a = 20 + A.rand(60); b = 1 + A.rand(op === '−' ? a - 1 : 40); }
    }

    var answer = op === '+' ? a + b : op === '−' ? a - b : a * b;
    return { text: a + ' ' + op + ' ' + b, answer: answer };
  }

  function makeChoices(answer) {
    var options = [answer];
    var guard = 0;
    while (options.length < 4 && guard++ < 60) {
      var spread = Math.max(3, Math.round(Math.abs(answer) * 0.25));
      var candidate = answer + (A.rand(2) ? 1 : -1) * (1 + A.rand(spread));
      if (candidate >= 0 && options.indexOf(candidate) === -1) options.push(candidate);
    }
    while (options.length < 4) options.push(answer + options.length);
    return A.shuffle(options);
  }

  A.game({
    id: 'counting-carnival',
    name: 'Counting Carnival',
    emoji: '🎈',
    howTo: [
      'A sum appears at the top of the tent.',
      'Tap or click the balloon holding the right answer.',
      'Right answers add time and points. Wrong ones cost you 3 seconds.',
      'How many can you pop in one minute?'
    ],
    start: function (api) {
      var score = 0;
      var solved = 0;
      var streak = 0;
      var timeLeft = ROUND_SECONDS;
      var locked = false;
      var current = null;

      var wrap = document.createElement('div');
      wrap.className = 'cc-wrap';
      wrap.innerHTML =
        '<div class="cc-timer-bar"><div class="cc-timer-fill" id="cc-fill" style="width:100%"></div></div>' +
        '<div class="cc-question" id="cc-question" aria-live="polite"></div>' +
        '<div class="cc-options" id="cc-options" role="group" aria-label="Answer choices"></div>';
      api.stage.appendChild(wrap);

      var fillEl = wrap.querySelector('#cc-fill');
      var questionEl = wrap.querySelector('#cc-question');
      var optionsEl = wrap.querySelector('#cc-options');

      function paintTimer() {
        fillEl.style.width = Math.max(0, (timeLeft / ROUND_SECONDS) * 100) + '%';
        fillEl.style.background = timeLeft <= 10 ? 'var(--coral)' : 'var(--lime)';
        api.setStat('⏱ ' + Math.ceil(timeLeft) + 's');
      }

      function nextQuestion() {
        locked = false;
        current = makeQuestion(solved);
        questionEl.textContent = current.text + ' = ?';
        optionsEl.innerHTML = '';

        makeChoices(current.answer).forEach(function (value, index) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'balloon';
          btn.textContent = value;
          btn.style.background = BALLOON_COLORS[index % BALLOON_COLORS.length];
          btn.addEventListener('click', function () { answer(btn, value); });
          optionsEl.appendChild(btn);
        });
      }

      function answer(btn, value) {
        if (locked) return;

        if (value === current.answer) {
          locked = true;
          solved++;
          streak++;
          var points = 10 + Math.min(20, (streak - 1) * 5);
          score += points;
          timeLeft = Math.min(ROUND_SECONDS, timeLeft + 1.5);
          api.setScore(score);
          api.sound.good();
          btn.classList.add('pop');
          api.toast(streak >= 3 ? 'Streak ×' + streak + '! +' + points : '+' + points);
          global.setTimeout(nextQuestion, 320);
        } else {
          streak = 0;
          timeLeft = Math.max(0, timeLeft - 3);
          api.sound.bad();
          btn.classList.add('wrong');
          btn.disabled = true;
          api.toast('−3s', true);
          global.setTimeout(function () { btn.classList.remove('wrong'); }, 400);
        }
      }

      var ticker = global.setInterval(function () {
        timeLeft -= 0.1;
        paintTimer();
        if (timeLeft <= 0) {
          global.clearInterval(ticker);
          api.end({
            score: score,
            title: 'Time!',
            message: 'You popped ' + solved + ' balloon' + (solved === 1 ? '' : 's') + '.'
          });
        }
      }, 100);

      paintTimer();
      nextQuestion();

      return function () { global.clearInterval(ticker); };
    }
  });
})(window);
