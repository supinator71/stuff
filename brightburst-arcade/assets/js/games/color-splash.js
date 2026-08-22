/* Color Splash — a paint studio. No timer, no losing, just making things. */
(function (global) {
  'use strict';

  var A = global.Arcade;
  var W = 720;
  var H = 540;

  var COLORS = [
    '#ff6b6b', '#ff922b', '#ffc93c', '#7bd389',
    '#4ecdc4', '#4d96ff', '#a66cff', '#ff8fd0',
    '#8a5324', '#2b8a3e', '#1f3a93', '#24243a'
  ];
  var SIZES = [6, 16, 34];
  var STAMPS = ['⭐', '❤️', '🌸', '🦋', '🐟', '🌞'];

  A.game({
    id: 'color-splash',
    name: 'Color Splash',
    emoji: '🎨',
    howTo: [
      'Pick a colour and a brush size, then draw on the paper.',
      'Tap a sticker, then tap the paper to stamp it.',
      'The eraser takes paint back off; Clear starts a fresh page.',
      'Save Picture downloads your artwork.'
    ],
    start: function (api) {
      var layout = document.createElement('div');
      layout.className = 'cs-layout';

      var tools = document.createElement('div');
      tools.className = 'cs-tools';

      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      canvas.setAttribute('aria-label', 'Drawing paper');
      canvas.style.cursor = 'crosshair';

      layout.appendChild(tools);
      layout.appendChild(canvas);
      api.stage.appendChild(layout);

      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      var color = COLORS[0];
      var size = SIZES[1];
      var stamp = null;
      var erasing = false;
      var drawing = false;
      var strokes = 0;
      var last = null;

      function updateStat() {
        api.setStat('🖌 ' + strokes);
        api.setScore(strokes);
      }

      /* ---------- tool palette ---------- */

      var swatchWrap = document.createElement('div');
      swatchWrap.className = 'cs-swatches';
      swatchWrap.setAttribute('role', 'group');
      swatchWrap.setAttribute('aria-label', 'Colours');
      var swatchButtons = COLORS.map(function (value, index) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cs-swatch';
        btn.style.background = value;
        btn.setAttribute('aria-label', 'Colour ' + (index + 1));
        btn.setAttribute('aria-pressed', String(index === 0));
        btn.addEventListener('click', function () {
          color = value;
          erasing = false;
          stamp = null;
          paintTools();
          api.sound.blip();
        });
        swatchWrap.appendChild(btn);
        return btn;
      });

      var sizeWrap = document.createElement('div');
      sizeWrap.className = 'cs-sizes';
      sizeWrap.setAttribute('role', 'group');
      sizeWrap.setAttribute('aria-label', 'Brush size');
      var sizeButtons = SIZES.map(function (value, index) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cs-size';
        btn.setAttribute('aria-label', ['Small', 'Medium', 'Large'][index] + ' brush');
        btn.setAttribute('aria-pressed', String(value === size));
        var dot = document.createElement('i');
        var px = Math.max(8, Math.min(26, value));
        dot.style.width = px + 'px';
        dot.style.height = px + 'px';
        btn.appendChild(dot);
        btn.addEventListener('click', function () {
          size = value;
          paintTools();
          api.sound.blip();
        });
        sizeWrap.appendChild(btn);
        return btn;
      });

      var stampWrap = document.createElement('div');
      stampWrap.className = 'cs-swatches';
      stampWrap.style.gridTemplateColumns = 'repeat(3, 40px)';
      stampWrap.setAttribute('role', 'group');
      stampWrap.setAttribute('aria-label', 'Stickers');
      var stampButtons = STAMPS.map(function (value) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cs-swatch';
        btn.style.background = 'var(--cream)';
        btn.style.fontSize = '1.3rem';
        btn.textContent = value;
        btn.setAttribute('aria-label', 'Sticker ' + value);
        btn.setAttribute('aria-pressed', 'false');
        btn.addEventListener('click', function () {
          stamp = stamp === value ? null : value;
          erasing = false;
          paintTools();
          api.sound.blip();
        });
        stampWrap.appendChild(btn);
        return btn;
      });

      function toolButton(label, handler, variant) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn ' + (variant || 'btn--ghost');
        btn.style.minHeight = '46px';
        btn.style.fontSize = '.95rem';
        btn.textContent = label;
        btn.addEventListener('click', handler);
        return btn;
      }

      var eraserBtn = toolButton('🧽 Eraser', function () {
        erasing = !erasing;
        stamp = null;
        paintTools();
        api.sound.blip();
      });

      var clearBtn = toolButton('🗑 Clear', function () {
        if (!global.confirm('Clear the whole picture?')) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        strokes = 0;
        updateStat();
        api.sound.bad();
      });

      var saveBtn = toolButton('💾 Save picture', function () {
        var link = document.createElement('a');
        link.download = 'my-brightburst-picture.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        api.sound.good();
        api.toast('Saved!');
      }, 'btn--sky');

      var doneBtn = toolButton('✅ All done', function () {
        api.confetti(40);
        api.end({
          score: strokes,
          title: 'Masterpiece!',
          message: 'You made ' + strokes + ' brush stroke' + (strokes === 1 ? '' : 's') + '.'
        });
      }, 'btn--lime');

      [swatchWrap, sizeWrap, stampWrap, eraserBtn, clearBtn, saveBtn, doneBtn]
        .forEach(function (node) { tools.appendChild(node); });

      function paintTools() {
        swatchButtons.forEach(function (btn, i) {
          btn.setAttribute('aria-pressed', String(!erasing && !stamp && COLORS[i] === color));
        });
        sizeButtons.forEach(function (btn, i) {
          btn.setAttribute('aria-pressed', String(SIZES[i] === size));
        });
        stampButtons.forEach(function (btn, i) {
          btn.setAttribute('aria-pressed', String(STAMPS[i] === stamp));
        });
        eraserBtn.style.background = erasing ? 'var(--coral)' : 'var(--paper)';
        canvas.style.cursor = stamp ? 'copy' : 'crosshair';
      }

      /* ---------- drawing ---------- */

      function pointFrom(event) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: ((event.clientX - rect.left) / rect.width) * W,
          y: ((event.clientY - rect.top) / rect.height) * H
        };
      }

      function onDown(event) {
        var point = pointFrom(event);
        canvas.setPointerCapture(event.pointerId);

        if (stamp) {
          ctx.font = '52px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(stamp, point.x, point.y);
          strokes++;
          updateStat();
          api.sound.blip();
          return;
        }

        drawing = true;
        last = point;
        strokes++;
        updateStat();
        dot(point);
      }

      function dot(point) {
        ctx.fillStyle = erasing ? '#ffffff' : color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, (erasing ? size * 1.6 : size) / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      function onMove(event) {
        if (!drawing) return;
        var point = pointFrom(event);
        ctx.strokeStyle = erasing ? '#ffffff' : color;
        ctx.lineWidth = erasing ? size * 1.6 : size;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        last = point;
        event.preventDefault();
      }

      function onUp() { drawing = false; }

      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('pointerleave', onUp);

      paintTools();
      updateStat();

      return function () { drawing = false; };
    }
  });
})(window);
