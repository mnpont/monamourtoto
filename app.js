(function () {
  'use strict';

  // ===== ELEMENTS =====
  var closedScene = document.getElementById('closed-scene');
  var openScene = document.getElementById('open-scene');
  var closedBox = document.getElementById('closed-box');
  var canvas = document.getElementById('confetti-canvas');
  var ctx = canvas.getContext('2d');
  var heartsContainer = document.getElementById('hearts-container');

  // ===== COMPLIMENTS =====
  var compliments = [
    'so cute', 'so smart', 'so beautiful', 'so kind',
    'so gentle', 'so amazing', 'so sexy', 'so caring',
    'so loving', 'so patient', 'so ambitious', 'so healthy'
  ];

  var currentFlipped = null;
  var activated = false;

  // ===== INIT =====
  function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    closedBox.addEventListener('click', handleBoxClick);
    closedBox.addEventListener('touchend', function (e) {
      e.preventDefault();
      handleBoxClick();
    });
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ===== BOX CLICK -> FULL ANIMATION SEQUENCE =====
  function handleBoxClick() {
    if (activated) return;
    activated = true;

    // 1. Untie bow + ribbons
    closedBox.classList.add('untying');

    // 2. Shake the box after ribbons gone
    setTimeout(function () {
      closedBox.classList.add('shaking');
    }, 900);

    // 3. Burst + confetti
    setTimeout(function () {
      closedBox.classList.add('bursting');
      startConfetti();
    }, 1400);

    // 4. Fade out closed box, transition to open scene
    setTimeout(function () {
      closedBox.classList.add('fading');
    }, 1900);

    setTimeout(function () {
      closedScene.classList.remove('active');
      openScene.classList.add('active');
      buildHearts();
    }, 2500);

    // 5. Stop confetti
    setTimeout(function () {
      stopConfetti();
    }, 5000);
  }

  // ===== CONFETTI =====
  var confettiParticles = [];
  var confettiRunning = false;

  var COLORS = [
    '#b5245e', '#d44a80', '#f5b8cc', '#e8c547',
    '#ff6b8a', '#ff9eb5', '#ffd1dc', '#ff4571'
  ];

  function makeParticle(burst) {
    var w = canvas.width;
    var h = canvas.height;
    var isHeart = Math.random() < 0.4;
    return {
      x: burst ? w / 2 + (Math.random() - 0.5) * 100 : Math.random() * w,
      y: burst ? h / 2 : -10,
      vx: burst ? (Math.random() - 0.5) * 16 : (Math.random() - 0.5) * 3,
      vy: burst ? -Math.random() * 18 - 5 : Math.random() * 2 + 1,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 12,
      g: 0.2,
      drag: 0.98,
      alpha: 1,
      heart: isHeart
    };
  }

  function startConfetti() {
    confettiRunning = true;
    confettiParticles = [];
    for (var i = 0; i < 140; i++) {
      confettiParticles.push(makeParticle(true));
    }
    var interval = setInterval(function () {
      if (!confettiRunning) { clearInterval(interval); return; }
      for (var j = 0; j < 4; j++) {
        confettiParticles.push(makeParticle(false));
      }
    }, 120);
    renderConfetti();
  }

  function stopConfetti() {
    confettiRunning = false;
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = confettiParticles.length - 1; i >= 0; i--) {
      var p = confettiParticles[i];
      p.vy += p.g;
      p.vx *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      if (p.y > canvas.height + 50) { confettiParticles.splice(i, 1); continue; }
      if (!confettiRunning) {
        p.alpha -= 0.018;
        if (p.alpha <= 0) { confettiParticles.splice(i, 1); continue; }
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = p.alpha;
      if (p.heart) {
        drawMiniHeart(ctx, 0, 0, p.size, p.color);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }
      ctx.restore();
    }
    if (confettiParticles.length > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function drawMiniHeart(c, x, y, size, color) {
    var s = size * 0.55;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(x, y + s * 0.3);
    c.bezierCurveTo(x, y - s * 0.25, x - s, y - s * 0.25, x - s, y + s * 0.15);
    c.bezierCurveTo(x - s, y + s * 0.6, x, y + s * 0.9, x, y + s);
    c.bezierCurveTo(x, y + s * 0.9, x + s, y + s * 0.6, x + s, y + s * 0.15);
    c.bezierCurveTo(x + s, y - s * 0.25, x, y - s * 0.25, x, y + s * 0.3);
    c.closePath();
    c.fill();
  }

  // ===== BUILD SCATTERED HEARTS =====
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildHearts() {
    var shuffled = shuffle(compliments);
    var W = window.innerWidth;
    var H = window.innerHeight;

    // Determine heart size based on screen
    var isMobile = W < 420;
    var isDesktop = W >= 768;
    var heartW = isMobile ? 64 : (isDesktop ? 100 : 80);
    var heartH = isMobile ? 59 : (isDesktop ? 92 : 74);

    // Define the center exclusion zone (where box/cards are)
    var cx = W / 2;
    var cy = H / 2;
    var exW = isDesktop ? 260 : (isMobile ? 170 : 210);
    var exH = isDesktop ? 320 : (isMobile ? 240 : 280);

    // Place hearts scattered around the page avoiding center
    var positions = computePositions(shuffled.length, W, H, heartW, heartH, cx, cy, exW, exH);

    shuffled.forEach(function (text, i) {
      var pos = positions[i];
      var card = createHeartCard(text, pos.x, pos.y);
      heartsContainer.appendChild(card);
      // Stagger entrance
      setTimeout(function () {
        card.classList.add('entered');
      }, 300 + i * 80);
    });
  }

  function computePositions(count, W, H, hw, hh, cx, cy, exW, exH) {
    var margin = 10;
    var positions = [];
    var maxAttempts = 200;

    for (var i = 0; i < count; i++) {
      var placed = false;
      for (var attempt = 0; attempt < maxAttempts; attempt++) {
        var x = margin + Math.random() * (W - hw - margin * 2);
        var y = margin + Math.random() * (H - hh - margin * 2);

        // Check not in center exclusion zone
        var hcx = x + hw / 2;
        var hcy = y + hh / 2;
        if (Math.abs(hcx - cx) < exW / 2 + hw / 2 && Math.abs(hcy - cy) < exH / 2 + hh / 2) {
          continue;
        }

        // Check no overlap with existing hearts
        var overlaps = false;
        for (var j = 0; j < positions.length; j++) {
          var p = positions[j];
          if (Math.abs(x - p.x) < hw + 4 && Math.abs(y - p.y) < hh + 4) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          positions.push({ x: x, y: y });
          placed = true;
          break;
        }
      }

      // Fallback: if couldn't place, try with smaller exclusion
      if (!placed) {
        positions.push({
          x: margin + Math.random() * (W - hw - margin * 2),
          y: margin + Math.random() * (H - hh - margin * 2)
        });
      }
    }

    return positions;
  }

  function createHeartCard(text, x, y) {
    var card = document.createElement('div');
    card.className = 'heart-card';
    card.style.left = x + 'px';
    card.style.top = y + 'px';

    // Random slight rotation for organic feel
    var rot = (Math.random() - 0.5) * 20;
    card.style.transform = 'rotate(' + rot + 'deg)';

    var heartSVG =
      '<svg class="heart-svg" viewBox="0 0 80 74" xmlns="http://www.w3.org/2000/svg">' +
        '<path class="heart-path" d="M40 68 C40 68 6 48 6 24 C6 10 18 3 29 3 C35 3 39 6 40 10 C41 6 45 3 51 3 C62 3 74 10 74 24 C74 48 40 68 40 68Z"/>' +
      '</svg>';

    card.innerHTML =
      '<div class="heart-card-inner">' +
        '<div class="heart-face heart-front">' + heartSVG + '</div>' +
        '<div class="heart-face heart-back">' + heartSVG +
          '<span class="heart-text">' + text + '</span>' +
        '</div>' +
      '</div>';

    card.addEventListener('click', function (e) {
      e.stopPropagation();
      flipHeart(card);
    });

    card.addEventListener('touchend', function (e) {
      e.preventDefault();
      e.stopPropagation();
      flipHeart(card);
    });

    return card;
  }

  function flipHeart(card) {
    if (currentFlipped === card) {
      card.classList.remove('flipped');
      currentFlipped = null;
      return;
    }
    if (currentFlipped) {
      currentFlipped.classList.remove('flipped');
    }
    card.classList.add('flipped');
    currentFlipped = card;
  }

  // ===== START =====
  document.addEventListener('DOMContentLoaded', init);
})();
