(function () {
  'use strict';

  // ===== ELEMENTS =====
  const closedScene = document.getElementById('closed-box-scene');
  const openScene = document.getElementById('open-box-scene');
  const closedBox = document.getElementById('closed-box');
  const bow = document.getElementById('bow');
  const hint = document.getElementById('click-hint');
  const ribbonV = closedBox.querySelector('.ribbon-v');
  const ribbonH = closedBox.querySelector('.ribbon-h');
  const boxLid = closedBox.querySelector('.box-lid');
  const boxBody = closedBox.querySelector('.box-body');
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  const heartsContainer = document.getElementById('hearts-container');

  // ===== COMPLIMENTS =====
  const compliments = [
    'so cute', 'so smart', 'so beautiful', 'so kind',
    'so gentle', 'so amazing', 'so sexy', 'so caring',
    'so loving', 'so patient', 'so ambitious', 'so healthy'
  ];

  // Shuffle helper
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  let currentFlipped = null;

  // ===== INIT =====
  function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    bow.classList.add('wiggle');
    bow.addEventListener('click', handleBowClick);
    bow.addEventListener('touchend', function (e) {
      e.preventDefault();
      handleBowClick();
    });
  }

  // ===== CANVAS RESIZE =====
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ===== BOW CLICK -> UNTIE SEQUENCE =====
  let activated = false;

  function handleBowClick() {
    if (activated) return;
    activated = true;

    // Hide hint
    hint.style.display = 'none';

    // Stop wiggle, start untie
    bow.classList.remove('wiggle');
    bow.classList.add('untying');

    // Slide ribbons away
    ribbonV.classList.add('slide-away-v');
    ribbonH.classList.add('slide-away-h');

    // After ribbons gone, shake the box
    setTimeout(function () {
      closedBox.classList.add('shaking');
    }, 1000);

    // Lid flies off + body burst
    setTimeout(function () {
      boxLid.classList.add('fly-off');
      boxBody.classList.add('burst');
      startConfetti();
    }, 1500);

    // Fade out closed scene, show open scene
    setTimeout(function () {
      closedScene.classList.remove('active');
      openScene.classList.add('active');
      buildHearts();
    }, 2800);

    // Stop confetti after a while
    setTimeout(function () {
      stopConfetti();
    }, 5500);
  }

  // ===== CONFETTI SYSTEM =====
  let confettiParticles = [];
  let confettiRunning = false;
  let confettiAnimFrame = null;

  const CONFETTI_COLORS = [
    '#b5245e', '#d44a80', '#f5b8cc', '#e8c547',
    '#ff6b8a', '#ff9eb5', '#ffd1dc', '#ff4571',
    '#e898b2', '#fff5f8'
  ];

  function createConfettiParticle(burst) {
    const w = canvas.width;
    const h = canvas.height;
    const isHeart = Math.random() < 0.35;

    return {
      x: burst ? w / 2 + (Math.random() - 0.5) * 80 : Math.random() * w,
      y: burst ? h / 2 - 40 : -20,
      vx: burst ? (Math.random() - 0.5) * 14 : (Math.random() - 0.5) * 3,
      vy: burst ? -Math.random() * 16 - 4 : Math.random() * 2 + 1,
      size: Math.random() * 8 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      gravity: 0.18,
      drag: 0.98,
      opacity: 1,
      isHeart: isHeart
    };
  }

  function startConfetti() {
    confettiRunning = true;
    confettiParticles = [];

    // Initial burst
    for (let i = 0; i < 120; i++) {
      confettiParticles.push(createConfettiParticle(true));
    }

    // Ongoing rain
    let rainInterval = setInterval(function () {
      if (!confettiRunning) { clearInterval(rainInterval); return; }
      for (let i = 0; i < 5; i++) {
        confettiParticles.push(createConfettiParticle(false));
      }
    }, 100);

    renderConfetti();
  }

  function stopConfetti() {
    confettiRunning = false;
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      if (p.y > canvas.height + 40) {
        confettiParticles.splice(i, 1);
        continue;
      }

      // Fade after stop
      if (!confettiRunning) {
        p.opacity -= 0.015;
        if (p.opacity <= 0) {
          confettiParticles.splice(i, 1);
          continue;
        }
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = p.opacity;

      if (p.isHeart) {
        drawHeart(ctx, 0, 0, p.size, p.color);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      }

      ctx.restore();
    }

    if (confettiParticles.length > 0) {
      confettiAnimFrame = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function drawHeart(ctx, x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const s = size * 0.6;
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y - s * 0.2, x - s, y - s * 0.2, x - s, y + s * 0.15);
    ctx.bezierCurveTo(x - s, y + s * 0.6, x, y + s * 0.9, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.9, x + s, y + s * 0.6, x + s, y + s * 0.15);
    ctx.bezierCurveTo(x + s, y - s * 0.2, x, y - s * 0.2, x, y + s * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // ===== BUILD HEART CARDS =====
  function buildHearts() {
    const shuffled = shuffle(compliments);
    const containerWidth = heartsContainer.offsetWidth || window.innerWidth;
    // We determine how many columns fit
    const isMobile = window.innerWidth < 420;
    const isTablet = window.innerWidth < 768;
    const heartW = isMobile ? 76 : (isTablet ? 90 : 110);
    const heartH = isMobile ? 70 : (isTablet ? 82 : 100);
    const pad = isMobile ? 8 : 14;

    // Calculate grid layout scattered but non-overlapping
    const cols = Math.floor((containerWidth - pad * 2) / (heartW + pad));
    const actualCols = Math.max(cols, 2);
    const rows = Math.ceil(shuffled.length / actualCols);
    const totalW = actualCols * (heartW + pad) - pad;
    const startX = (containerWidth - totalW) / 2;

    // Set container height
    heartsContainer.style.minHeight = (rows * (heartH + pad) + 40) + 'px';

    shuffled.forEach(function (text, i) {
      const col = i % actualCols;
      const row = Math.floor(i / actualCols);

      // Add slight randomness to position for scattered feel
      const jitterX = (Math.random() - 0.5) * pad * 1.5;
      const jitterY = (Math.random() - 0.5) * pad * 1.5;

      const x = startX + col * (heartW + pad) + jitterX;
      const y = 20 + row * (heartH + pad) + jitterY;

      const card = createHeartCard(text, x, y, i);
      heartsContainer.appendChild(card);
    });
  }

  function createHeartCard(text, x, y, index) {
    const card = document.createElement('div');
    card.className = 'heart-card entering';
    card.style.left = x + 'px';
    card.style.top = y + 'px';
    card.style.animationDelay = (index * 0.08 + 0.5) + 's';

    const heartSVG = '<svg class="heart-svg" viewBox="0 0 90 82" xmlns="http://www.w3.org/2000/svg">' +
      '<path class="heart-outline" d="M45 75 C45 75 10 55 10 28 C10 12 22 5 33 5 C39 5 44 8 45 12 C46 8 51 5 57 5 C68 5 80 12 80 28 C80 55 45 75 45 75Z"/>' +
      '</svg>';

    card.innerHTML =
      '<div class="heart-card-inner">' +
        '<div class="heart-face heart-front">' + heartSVG +
          '<span class="heart-question">?</span>' +
        '</div>' +
        '<div class="heart-face heart-back">' + heartSVG +
          '<span class="heart-text">' + text + '</span>' +
        '</div>' +
      '</div>';

    // Remove entering class after animation so float animation takes over
    card.addEventListener('animationend', function handler() {
      card.classList.remove('entering');
      card.removeEventListener('animationend', handler);
    });

    card.addEventListener('click', function () {
      handleHeartFlip(card);
    });

    card.addEventListener('touchend', function (e) {
      e.preventDefault();
      handleHeartFlip(card);
    });

    return card;
  }

  function handleHeartFlip(card) {
    if (currentFlipped === card) {
      // Tapping the same card flips it back
      card.classList.remove('flipped');
      currentFlipped = null;
      return;
    }

    // Flip back the currently flipped card
    if (currentFlipped) {
      currentFlipped.classList.remove('flipped');
    }

    // Flip the new card
    card.classList.add('flipped');
    currentFlipped = card;
  }

  // ===== START =====
  document.addEventListener('DOMContentLoaded', init);
})();
