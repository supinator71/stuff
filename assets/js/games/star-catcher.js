/* Star Catcher — slide the basket, catch the stars, dodge the bombs. */
(function (global) {
  'use strict';

  var A = global.Arcade;
  var W = 640;
  var H = 480;
  var BASKET_W = 96;
  var BASKET_H = 34;
  var START_LIVES = 3;

  var KINDS = [
    { emoji: '⭐', points: 10, weight: 62, bomb: false },
    { emoji: '🌈', points: 30, weight: 10, bomb: false },
    { emoji: '🍭', points: 15, weight: 14, bomb: false },
    { emoji: '💣', points: 0,  weight: 14, bomb: true  }
  ];

  function rollKind() {
    var total = KINDS.reduce(function (sum, k) { return sum + k.weight; }, 0);
    var roll = Math.random() * total;
    for (var i = 0; i < KINDS.length; i++) {
      roll -= KINDS[i].weight;
      if (roll <= 0) return KINDS[i];
    }
    return KINDS[0];
  }

  A.game({
    id: 'star-catcher',
    name: 'Star Catcher',
    emoji: '🌟',
    howTo: [
      'Move the basket with the arrow keys, or drag with your finger or mouse.',
      'Catch ⭐ 🌈 🍭 for points — rainbows are worth the most.',
      'Dodge the 💣 bombs. Three bombs and the round is over.',
      'It gets faster the longer you last!'
    ],
    start: function (api) {
      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Star Catcher play area');
      canvas.tabIndex = 0;
      api.stage.appendChild(canvas);
      canvas.focus();

      var ctx = canvas.getContext('2d');
      var basketX = W / 2;
      var targetX = null;      // pointer target, null when using the keyboard
      var keyLeft = false;
      var keyRight = false;
      var items = [];
      var score = 0;
      var lives = START_LIVES;
      var elapsed = 0;
      var spawnTimer = 0;
      var over = false;
      var rafId = null;
      var lastTime = null;

      function paintHud() {
        api.setScore(score);
        api.setStat('❤️'.repeat(Math.max(0, lives)) || '💔');
      }

      /* ---------- input ---------- */

      function onKeyDown(event) {
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') { keyLeft = true; targetX = null; event.preventDefault(); }
        if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') { keyRight = true; targetX = null; event.preventDefault(); }
      }
      function onKeyUp(event) {
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') keyLeft = false;
        if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') keyRight = false;
      }
      function pointerTo(event) {
        var rect = canvas.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width) * W;
      }
      function onPointerMove(event) {
        if (event.pointerType === 'mouse' && event.buttons === 0 && !hovering) return;
        pointerTo(event);
        event.preventDefault();
      }
      var hovering = false;
      function onPointerEnter() { hovering = true; }
      function onPointerLeave() { hovering = false; }

      global.addEventListener('keydown', onKeyDown);
      global.addEventListener('keyup', onKeyUp);
      canvas.addEventListener('pointerdown', pointerTo);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerenter', onPointerEnter);
      canvas.addEventListener('pointerleave', onPointerLeave);

      /* ---------- simulation ---------- */

      function spawn() {
        var kind = rollKind();
        items.push({
          x: 34 + Math.random() * (W - 68),
          y: -30,
          speed: 120 + Math.random() * 70 + elapsed * 7,
          kind: kind,
          wobble: Math.random() * Math.PI * 2
        });
      }

      function step(dt) {
        elapsed += dt;

        var speed = 470 * dt;
        if (keyLeft) basketX -= speed;
        if (keyRight) basketX += speed;
        if (targetX !== null) basketX += (targetX - basketX) * Math.min(1, dt * 14);
        basketX = A.clamp(basketX, BASKET_W / 2, W - BASKET_W / 2);

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          spawn();
          spawnTimer = Math.max(0.28, 0.95 - elapsed * 0.022);
        }

        var basketTop = H - BASKET_H - 12;

        for (var i = items.length - 1; i >= 0; i--) {
          var item = items[i];
          item.y += item.speed * dt;
          item.wobble += dt * 3;

          var caught = item.y > basketTop - 6 &&
                       item.y < H - 8 &&
                       Math.abs(item.x - basketX) < BASKET_W / 2 + 12;

          if (caught) {
            items.splice(i, 1);
            if (item.kind.bomb) {
              lives--;
              api.sound.bad();
              api.toast('Boom!', true);
              if (lives <= 0) return finish();
            } else {
              score += item.kind.points;
              api.sound.good();
              if (item.kind.points >= 30) api.toast('+' + item.kind.points);
            }
            paintHud();
          } else if (item.y > H + 40) {
            items.splice(i, 1);
            /* Letting a bomb fall past is fine — only missed treats sting a little. */
          }
        }
      }

      function draw() {
        /* sky */
        var sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#bfe9ff');
        sky.addColorStop(1, '#fff5d6');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        /* rolling hills */
        ctx.fillStyle = '#7bd389';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.quadraticCurveTo(W * 0.25, H - 90, W * 0.5, H - 40);
        ctx.quadraticCurveTo(W * 0.78, H - 5, W, H - 70);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();

        /* falling items */
        ctx.font = '34px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        items.forEach(function (item) {
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(Math.sin(item.wobble) * 0.25);
          ctx.fillText(item.kind.emoji, 0, 0);
          ctx.restore();
        });

        /* basket */
        var bx = basketX - BASKET_W / 2;
        var by = H - BASKET_H - 12;
        ctx.fillStyle = '#c1783c';
        ctx.strokeStyle = '#24243a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, BASKET_W, BASKET_H, 10)
                      : ctx.rect(bx, by, BASKET_W, BASKET_H);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#8a5324';
        for (var s = 1; s < 4; s++) {
          ctx.fillRect(bx + (BASKET_W / 4) * s - 2, by + 4, 4, BASKET_H - 8);
        }
      }

      function finish() {
        if (over) return;
        over = true;
        api.end({
          score: score,
          title: 'Basket full!',
          message: 'You lasted ' + Math.round(elapsed) + ' seconds.'
        });
      }

      function loop(time) {
        if (over) return;
        if (lastTime === null) lastTime = time;
        var dt = Math.min(0.05, (time - lastTime) / 1000);
        lastTime = time;
        step(dt);
        if (over) return;
        draw();
        rafId = global.requestAnimationFrame(loop);
      }

      paintHud();
      draw();
      rafId = global.requestAnimationFrame(loop);

      return function () {
        over = true;
        if (rafId) global.cancelAnimationFrame(rafId);
        global.removeEventListener('keydown', onKeyDown);
        global.removeEventListener('keyup', onKeyUp);
      };
    }
  });
})(window);
