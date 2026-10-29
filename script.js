// ============================================================
// RIDER KICK COMBO BIRTHDAY WEBSITE
// For: Muhammad Zidane Ramadhan · 31 Oktober 2003
// ============================================================

// ---------- BIRTHDAY DATA ----------
const BIRTHDAY = {
  name: 'Muhammad Zidane Ramadhan',
  birthDate: new Date(2003, 9, 31), // month is 0-indexed → 9 = October
};

// ---------- CONFIG ----------
const COMBO_TIME = 10; // seconds
const ATTACK_ORDER = ['kick', 'punch', 'final'];

// ---------- ELEMENT REFERENCES ----------
const screens = {
  henshin: document.getElementById('henshinScreen'),
  combo: document.getElementById('comboScreen'),
  card: document.getElementById('cardScreen'),
  celebration: document.getElementById('celebrationScreen'),
};

const henshinBtn = document.getElementById('henshinBtn');
const hero = document.getElementById('hero');
const attackButtons = document.querySelectorAll('.attack-btn');
const timerFill = document.getElementById('timerFill');
const timerText = document.getElementById('timerText');
const comboStatus = document.getElementById('comboStatus');
const impactLayer = document.getElementById('impactLayer');
const riderCard = document.getElementById('riderCard');
const perfectBadge = document.getElementById('perfectBadge');
const replayBtn = document.getElementById('replayBtn');

// Gallery lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const galleryItems = document.querySelectorAll('.gallery-item');

// Audio
const sfx = {
  henshin: document.getElementById('sfxHenshin'),
  kick: document.getElementById('sfxKick'),
  punch: document.getElementById('sfxPunch'),
  final: document.getElementById('sfxFinal'),
  explosion: document.getElementById('sfxExplosion'),
};

// ============================================================
// AGE CALCULATION
// ============================================================
function calculateAge(birthDate, now = new Date()) {
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function updateAgeDisplay() {
  const now = new Date();
  const age = calculateAge(BIRTHDAY.birthDate, now);

  const ageEl = document.getElementById('ageNum');
  const ageEl2 = document.getElementById('ageNum2');
  const yearEl = document.getElementById('currentYear');

  if (ageEl) ageEl.textContent = age;
  if (ageEl2) ageEl2.textContent = age;
  if (yearEl) yearEl.textContent = now.getFullYear();
}

// ============================================================
// UTILITIES
// ============================================================
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  window.scrollTo(0, 0);
}

function playSound(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    const p = audioEl.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* silent fail */ }
}

function triggerFlash(className, duration = 900) {
  const flash = document.createElement('div');
  flash.className = className;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), duration);
}

function spawnImpact(emoji, x, y) {
  const el = document.createElement('div');
  el.className = 'impact';
  el.textContent = emoji;
  el.style.left = (x - 60) + 'px';
  el.style.top = (y - 60) + 'px';
  impactLayer.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function shakeScreen(target) {
  target.classList.add('shake');
  setTimeout(() => target.classList.remove('shake'), 400);
}

// ============================================================
// SCREEN 1 — HENSHIN
// ============================================================
henshinBtn.addEventListener('click', () => {
  playSound(sfx.henshin);
  triggerFlash('henshin-flash', 800);

  setTimeout(() => {
    showScreen('combo');
    startCombo();
  }, 500);
});

// ============================================================
// SCREEN 2 — RIDER KICK COMBO
// ============================================================
let comboState = {
  active: false,
  startTime: 0,
  currentStep: 0,
  timerInterval: null,
  timeLeft: COMBO_TIME,
  success: false,
  elapsed: 0,
  finishTime: null,
};

function startCombo() {
  comboState = {
    active: true,
    startTime: performance.now(),
    currentStep: 0,
    timerInterval: null,
    timeLeft: COMBO_TIME,
    success: false,
    elapsed: 0,
    finishTime: null,
  };

  comboStatus.textContent = '';
  comboStatus.style.color = 'var(--accent-2)';
  timerFill.style.width = '100%';
  timerFill.classList.remove('danger');
  timerText.textContent = `⏱️ ${COMBO_TIME.toFixed(1)}s`;

  attackButtons.forEach((btn, i) => {
    btn.disabled = i !== 0;
    btn.classList.remove('used');
  });

  comboState.timerInterval = setInterval(tickTimer, 100);
}

function tickTimer() {
  if (!comboState.active) return;

  const elapsed = (performance.now() - comboState.startTime) / 1000;
  comboState.elapsed = elapsed;
  const remaining = Math.max(0, COMBO_TIME - elapsed);
  comboState.timeLeft = remaining;

  const pct = (remaining / COMBO_TIME) * 100;
  timerFill.style.width = pct + '%';
  timerText.textContent = `⏱️ ${remaining.toFixed(1)}s`;

  if (remaining <= 3) timerFill.classList.add('danger');

  if (remaining <= 0) endCombo(false);
}

function endCombo(success) {
  comboState.active = false;
  comboState.success = success;
  clearInterval(comboState.timerInterval);

  if (success) {
    comboState.finishTime = comboState.elapsed;

    comboStatus.textContent = comboState.elapsed <= 10
      ? `🏆 PERFECT FINISH! (${comboState.elapsed.toFixed(2)}s)`
      : `✅ Combo selesai! (${comboState.elapsed.toFixed(2)}s)`;
    comboStatus.style.color = 'var(--accent-2)';

    shakeScreen(document.getElementById('comboScreen'));
    playSound(sfx.explosion);
    spawnImpact('💥', window.innerWidth / 2, window.innerHeight / 2);

    setTimeout(() => showScreen('card'), 1400);
  } else {
    comboStatus.textContent = '⏰ Waktu habis! Coba lagi...';
    comboStatus.style.color = '#ff5555';

    setTimeout(() => {
      attackButtons.forEach((btn, i) => {
        btn.disabled = i !== 0;
        btn.classList.remove('used');
      });
      comboState.currentStep = 0;
      startCombo();
    }, 1800);
  }
}

attackButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!comboState.active) return;

    const attack = btn.dataset.attack;
    const expected = ATTACK_ORDER[comboState.currentStep];

    if (attack !== expected) {
      shakeScreen(document.getElementById('comboScreen'));
      comboStatus.textContent = '❌ Urutan salah!';
      comboStatus.style.color = '#ff5555';
      return;
    }

    comboStatus.textContent = '';
    btn.disabled = true;
    btn.classList.add('used');

    performAttack(attack);
    comboState.currentStep++;

    if (comboState.currentStep < ATTACK_ORDER.length) {
      attackButtons[comboState.currentStep].disabled = false;
    } else {
      endCombo(true);
    }
  });
});

function performAttack(type) {
  const rect = hero.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  if (type === 'kick') {
    playSound(sfx.kick);
    hero.classList.add('kicking');
    spawnImpact('🦵', cx + 60, cy);
    setTimeout(() => hero.classList.remove('kicking'), 700);
  } else if (type === 'punch') {
    playSound(sfx.punch);
    hero.classList.add('punching');
    spawnImpact('👊', cx - 60, cy);
    setTimeout(() => hero.classList.remove('punching'), 600);
  } else if (type === 'final') {
    playSound(sfx.final);
    hero.classList.add('finaling');
    spawnImpact('💥', cx, cy);
    setTimeout(() => hero.classList.remove('finaling'), 1100);
    shakeScreen(document.getElementById('comboScreen'));
  }
}

// ============================================================
// SCREEN 3 — RIDER CARD
// ============================================================
riderCard.addEventListener('click', () => {
  playSound(sfx.explosion);
  triggerFlash('card-open-flash', 900);

  const finish = comboState.finishTime || 999;
  if (finish <= 10) {
    perfectBadge.textContent = `🏆 PERFECT FINISH — ${finish.toFixed(2)}s!`;
  } else {
    perfectBadge.textContent = `🎉 COMBO CLEAR — ${finish.toFixed(2)}s`;
  }

  setTimeout(() => {
    showScreen('celebration');
    updateAgeDisplay();
    buildStars();
    setTimeout(launchConfetti, 400);
  }, 500);
});

// ============================================================
// GALLERY LIGHTBOX — click to enlarge
// ============================================================
galleryItems.forEach((item) => {
  item.addEventListener('click', () => {
    const src = item.dataset.src || item.querySelector('img')?.src;
    if (!src) return;
    lightboxImg.src = src;
    lightbox.classList.add('active');
  });
});

function closeLightbox() {
  lightbox.classList.remove('active');
  lightboxImg.src = '';
}

lightboxClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeLightbox();
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('active')) {
    closeLightbox();
  }
});

// ============================================================
// SCREEN 4 — CELEBRATION
// ============================================================
function buildStars() {
  const container = document.getElementById('stars');
  container.innerHTML = '';
  for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    container.appendChild(star);
  }
}

function launchConfetti() {
  const colors = ['#ff2d2d', '#ffd700', '#00d4ff', '#ff6b00', '#ffffff', '#ff69b4'];
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    if (Math.random() > 0.5) confetti.style.borderRadius = '50%';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 6000);
  }
}

replayBtn.addEventListener('click', () => {
  showScreen('henshin');
});

// ---------- INIT ----------
window.addEventListener('load', () => {
  updateAgeDisplay();
});