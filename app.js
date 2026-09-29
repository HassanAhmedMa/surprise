/**
 * Happy Birthday & Romantic Date Interactive Experience
 * Built with 60fps animations, mobile-first responsiveness, and pure Web APIs
 */

import { NOTIFICATION_CONFIG } from './config.js';

// Pre-bundled venue images to guarantee 100% production asset resolution
import cioImg from './assets/places/cio_trattoria.jpg';
import primosImg from './assets/places/primos_pizza.jpg';
import treeTrunkImg from './assets/places/tree_trunk.jpg';
import secondCupImg from './assets/places/second_cup.jpg';
import armadaImg from './assets/places/armada_cafe.jpg';
import cilantroImg from './assets/places/cilantro_cafe.jpg';

const venueImages = {
  cio: cioImg,
  primos: primosImg,
  treetrunk: treeTrunkImg,
  secondcup: secondCupImg,
  armada: armadaImg,
  cilantro: cilantroImg
};

// ========================================================
// STATE MANAGEMENT
// ========================================================
const appState = {
  currentStep: 1,
  selectedDateTime: null,
  selectedDateTimeFormatted: "Tonight at 8:00 PM",
  loveAnswer: "Officially Confirmed",
  selectedPlace: {
    id: "cio",
    name: "CIO x Trattoria Italiana",
    type: "Dinner",
    area: "Heliopolis",
    img: cioImg
  },
  audioPlaying: false
};

// ========================================================
// LIGHTWEIGHT AUDIO ENGINE (Synthesizer via Web Audio API)
// 100% offline, guaranteed zero missing file issues
// ========================================================
class RomanticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.loopTimer = null;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init prevented:', e);
    }
  }

  playPopSound() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  playChimeSound() {
    try {
      this.init();
      if (!this.ctx) return;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        
        const startTime = this.ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    } catch (e) {
      // Audio policy
    }
  }

  playSuccessChord() {
    try {
      this.init();
      if (!this.ctx) return;
      const chord = [440, 554.37, 659.25, 880]; // A major
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        
        const startTime = this.ctx.currentTime + idx * 0.05;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.95);
      });
    } catch (e) {
      // Audio policy
    }
  }

  toggleMusicLoop(buttonEl) {
    this.init();
    if (this.isPlaying) {
      this.stopMusicLoop(buttonEl);
    } else {
      this.startMusicLoop(buttonEl);
    }
  }

  startMusicLoop(buttonEl) {
    this.isPlaying = true;
    if (buttonEl) buttonEl.classList.add('playing');
    
    // Romantic pentatonic chord progression
    const progression = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G6
    ];

    let chordIdx = 0;
    const playNext = () => {
      if (!this.isPlaying) return;
      try {
        if (this.ctx) {
          const chord = progression[chordIdx % progression.length];
          chord.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const start = this.ctx.currentTime + (i * 0.18);
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(0.08, start);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.6);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(start);
            osc.stop(start + 1.7);
          });
        }
      } catch (e) {
        // Safe fallback
      }
      chordIdx++;
      this.loopTimer = setTimeout(playNext, 1800);
    };

    playNext();
  }

  stopMusicLoop(buttonEl) {
    this.isPlaying = false;
    if (this.loopTimer) clearTimeout(this.loopTimer);
    if (buttonEl) buttonEl.classList.remove('playing');
  }
}

const audio = new RomanticAudioEngine();

// ========================================================
// ZERO-DEPENDENCY CANVAS CONFETTI ENGINE
// Works 100% offline with zero external network requests
// ========================================================
class ParticleConfetti {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  burst(originX, originY, count = 60, options = {}) {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    const ox = originX !== undefined ? originX : this.width / 2;
    const oy = originY !== undefined ? originY : this.height / 2;
    const colors = options.colors || ['#E11D48', '#FDA4AF', '#F59E0B', '#FDE68A', '#38BDF8', '#C084FC'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.particles.push({
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (options.upward ? 4 : 1),
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 1,
        decay: Math.random() * 0.015 + 0.01,
        isHeart: false
      });
    }

    if (!this.animId) {
      this.render();
    }
  }

  render() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;
      p.opacity = Math.max(0, p.life);

      if (p.opacity <= 0 || p.y > this.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;

      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.render());
    } else {
      this.animId = null;
    }
  }
}

const panelConfetti = new ParticleConfetti('countdown-confetti-canvas');
const fullConfetti = new ParticleConfetti('fullscreen-confetti-canvas');

// ========================================================
// HIGH-IMPACT DOM FLOATING HEARTS & CONFETTI (GUARANTEED VISIBLE)
// ========================================================
function triggerShowerOfHearts(e) {
  const container = document.getElementById('floating-hearts-layer');
  if (!container) return;
  audio.playChimeSound();

  let startX = window.innerWidth / 2;
  let startY = window.innerHeight - 80;

  if (e && e.currentTarget) {
    const rect = e.currentTarget.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top;
  }

  const heartColors = ['#E11D48', '#BE123C', '#F43F5E', '#FB7185', '#FDA4AF'];

  for (let i = 0; i < 35; i++) {
    const heart = document.createElement('div');
    heart.className = 'dom-floating-heart';

    const size = Math.floor(Math.random() * 20 + 20); // 20px to 40px
    const color = heartColors[Math.floor(Math.random() * heartColors.length)];
    const delay = (Math.random() * 0.5).toFixed(2);
    const duration = (Math.random() * 1.2 + 2.5).toFixed(2); // 2.5s to 3.7s

    // Trajectory drift variables
    const dx1 = Math.floor((Math.random() - 0.5) * 160);
    const dx2 = Math.floor((Math.random() - 0.5) * 280);
    const dx3 = Math.floor((Math.random() - 0.5) * 380);
    const r1 = `${Math.floor((Math.random() - 0.5) * 40)}deg`;
    const r2 = `${Math.floor((Math.random() - 0.5) * 80)}deg`;
    const r3 = `${Math.floor((Math.random() - 0.5) * 120)}deg`;

    heart.style.left = `${startX + (Math.random() - 0.5) * 100}px`;
    heart.style.top = `${startY}px`;
    heart.style.setProperty('--dx1', `${dx1}px`);
    heart.style.setProperty('--dx2', `${dx2}px`);
    heart.style.setProperty('--dx3', `${dx3}px`);
    heart.style.setProperty('--r1', r1);
    heart.style.setProperty('--r2', r2);
    heart.style.setProperty('--r3', r3);
    heart.style.animationDelay = `${delay}s`;
    heart.style.animationDuration = `${duration}s`;

    heart.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="filter: drop-shadow(0 4px 10px rgba(225,29,72,0.35));">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;

    container.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, (parseFloat(duration) + parseFloat(delay) + 0.3) * 1000);
  }
}

function triggerBurstConfetti(e) {
  const container = document.getElementById('floating-hearts-layer');
  audio.playSuccessChord();

  let startX = window.innerWidth / 2;
  let startY = window.innerHeight - 80;

  if (e && e.currentTarget) {
    const rect = e.currentTarget.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  }

  // Also trigger canvas confetti
  try {
    fullConfetti.burst(startX, startY, 70, { upward: true });
  } catch (err) {}

  if (!container) return;

  const colors = ['#E11D48', '#D97706', '#2563EB', '#059669', '#7C3AED', '#EC4899', '#F59E0B'];

  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'dom-confetti-piece';

    const width = Math.floor(Math.random() * 8 + 7);
    const height = Math.floor(Math.random() * 12 + 10);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 260 + 60;
    const vx = Math.cos(angle) * distance;
    const vy = Math.sin(angle) * distance - 80;
    const vr = (Math.random() - 0.5) * 720;
    const duration = (Math.random() * 0.8 + 1.8).toFixed(2);

    piece.style.width = `${width}px`;
    piece.style.height = `${height}px`;
    piece.style.backgroundColor = color;
    piece.style.borderRadius = Math.random() > 0.4 ? '2px' : '50%';
    piece.style.left = `${startX}px`;
    piece.style.top = `${startY}px`;
    piece.style.setProperty('--vx', `${vx}px`);
    piece.style.setProperty('--vy', `${vy}px`);
    piece.style.setProperty('--vr', `${vr}deg`);
    piece.style.animationDuration = `${duration}s`;

    container.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, (parseFloat(duration) + 0.3) * 1000);
  }
}

// ========================================================
// ASSET PRELOADER (Instant photo display, zero scroll delay)
// Preloads & decodes all 14 gallery photos + places during countdown
// ========================================================
function preloadAllGalleryAssets() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    const src = img.currentSrc || img.src || img.getAttribute('src');
    if (src) {
      const loader = new Image();
      loader.src = src;
      if (typeof loader.decode === 'function') {
        loader.decode().catch(() => {});
      }
    }
  });

  // Also pre-cache each frame's inner image
  document.querySelectorAll('.premium-frame').forEach(frame => {
    const inner = frame.querySelector('.frame-photo');
    const targetSrc = inner ? (inner.currentSrc || inner.src) : frame.getAttribute('data-img');
    if (targetSrc) {
      const l = new Image();
      l.src = targetSrc;
      if (typeof l.decode === 'function') {
        l.decode().catch(() => {});
      }
    }
  });
}

// ========================================================
// STAGE 0: COUNTDOWN SCREEN (5 Seconds with growing pulse & confetti)
// ========================================================
function startCountdown() {
  // Immediately start preloading and GPU decoding all images in parallel
  preloadAllGalleryAssets();

  const screen = document.getElementById('countdown-screen');
  const numberEl = document.getElementById('countdown-number');
  const ringFill = document.getElementById('countdown-ring-fill');
  const panel = document.querySelector('.countdown-panel');

  const totalSeconds = 5;
  let remaining = totalSeconds;
  const circumference = 2 * Math.PI * 70; // r=70 -> ~439.82

  ringFill.style.strokeDasharray = circumference;
  ringFill.style.strokeDashoffset = 0;

  const updatePulse = (sec) => {
    panel.classList.remove('pulse-step-5', 'pulse-step-4', 'pulse-step-3', 'pulse-step-2', 'pulse-step-1', 'pulse-step-0');
    panel.classList.add(`pulse-step-${sec}`);
    
    // Sparkle burst around panel
    if (sec <= 3) {
      panelConfetti.burst(panel.offsetWidth / 2, panel.offsetHeight / 2, (4 - sec) * 15, {
        colors: ['#F43F5E', '#FDA4AF', '#F59E0B', '#FEF08A']
      });
    }
  };

  updatePulse(5);

  const countdownInterval = setInterval(() => {
    remaining--;
    
    if (remaining >= 0) {
      numberEl.textContent = remaining;
      const offset = circumference * (1 - remaining / totalSeconds);
      ringFill.style.strokeDashoffset = offset;
      updatePulse(remaining);
      
      numberEl.style.transform = 'scale(1.25)';
      setTimeout(() => {
        numberEl.style.transform = 'scale(1)';
      }, 180);
    }

    if (remaining === 0) {
      clearInterval(countdownInterval);
      
      panelConfetti.burst(panel.offsetWidth / 2, panel.offsetHeight / 2, 80, {
        colors: ['#E11D48', '#FF6B8B', '#F59E0B', '#10B981', '#38BDF8', '#FDE68A']
      });
      
      audio.playChimeSound();

      setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
          screen.style.display = 'none';
          showFormContainer();
        }, 800);
      }, 900);
    }
  }, 1000);
}

// Reveal centered single form card
function showFormContainer() {
  const formContainer = document.getElementById('form-container');
  formContainer.classList.remove('hidden');
  goToStep(1);
}

// Progress Steps indicator & card switching
function goToStep(stepNumber) {
  appState.currentStep = stepNumber;

  document.querySelectorAll('.step-dot').forEach((dot, idx) => {
    const dotStep = idx + 1;
    dot.classList.remove('active', 'completed');
    if (dotStep === stepNumber) {
      dot.classList.add('active');
    } else if (dotStep < stepNumber) {
      dot.classList.add('completed');
    }
  });

  document.querySelectorAll('.step-card').forEach((card) => {
    card.classList.remove('active');
  });

  const targetCard = document.getElementById(`step-${stepNumber}-card`);
  if (targetCard) {
    targetCard.classList.add('active');
  }
}

// ========================================================
// STAGE 1: DATE QUESTION ("Yes" / Shrinking "No")
// ========================================================
function initStep1() {
  const btnYes = document.getElementById('btn-date-yes');
  const btnNo = document.getElementById('btn-date-no');
  const titleEl = document.getElementById('date-question-title');
  const hintEl = document.getElementById('date-no-hint');

  let noClicks = 0;
  const noMessages = [
    "Will you go on a date with me? Please?",
    "I promise an unforgettable evening and the finest food.",
    "Look at the other option, it is waiting just for you.",
    "You know there is only one true choice."
  ];

  const noHints = [
    "Notice how this button is getting smaller?",
    "Almost completely gone now.",
    "Only one button left to press."
  ];

  btnNo.addEventListener('click', () => {
    noClicks++;
    audio.playPopSound();

    const msgIdx = Math.min(noClicks - 1, noMessages.length - 1);
    titleEl.textContent = noMessages[msgIdx];

    if (noClicks <= noHints.length) {
      hintEl.textContent = noHints[noClicks - 1];
    }

    const scales = [0.72, 0.48, 0.25, 0];
    const currentScale = scales[Math.min(noClicks - 1, scales.length - 1)];

    if (currentScale > 0) {
      btnNo.style.transform = `scale(${currentScale})`;
    } else {
      btnNo.style.transform = `scale(0)`;
      btnNo.style.opacity = '0';
      setTimeout(() => {
        btnNo.style.display = 'none';
        hintEl.textContent = "The 'No' button is gone. Only Yes remains.";
      }, 300);
    }

    const yesScale = 1 + (noClicks * 0.08);
    btnYes.style.transform = `scale(${yesScale})`;
  });

  btnYes.addEventListener('click', () => {
    audio.playSuccessChord();
    fullConfetti.burst(window.innerWidth / 2, window.innerHeight / 2, 70);
    
    setTimeout(() => {
      goToStep(2);
    }, 600);
  });
}

// ========================================================
// STAGE 2: CALENDAR & TIME PICKER (Future Only)
// ========================================================
function initStep2() {
  const inputEl = document.getElementById('date-picker-input');
  const errorMsg = document.getElementById('datetime-error-msg');
  const submitBtn = document.getElementById('btn-submit-datetime');
  const presetChips = document.querySelectorAll('.preset-chip');

  const now = new Date();
  now.setMinutes(now.getMinutes() + 15);
  
  const formatForInput = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  inputEl.min = formatForInput(now);

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  defaultDate.setHours(20, 0, 0, 0);
  inputEl.value = formatForInput(defaultDate);

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      errorMsg.classList.add('hidden');

      const preset = chip.getAttribute('data-preset');
      const target = new Date();

      if (preset === 'tonight') {
        target.setHours(20, 0, 0, 0);
        if (target <= new Date()) {
          target.setDate(target.getDate() + 1);
        }
      } else if (preset === 'tomorrow') {
        target.setDate(target.getDate() + 1);
        target.setHours(19, 30, 0, 0);
      } else if (preset === 'friday') {
        const day = target.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        target.setDate(target.getDate() + diff);
        target.setHours(20, 0, 0, 0);
      } else if (preset === 'saturday') {
        const day = target.getDay();
        const diff = (6 - day + 7) % 7 || 7;
        target.setDate(target.getDate() + diff);
        target.setHours(18, 30, 0, 0);
      }

      inputEl.value = formatForInput(target);
      audio.playPopSound();
    });
  });

  submitBtn.addEventListener('click', () => {
    const val = inputEl.value;
    if (!val) {
      errorMsg.textContent = "Please choose a date and time for our date.";
      errorMsg.classList.remove('hidden');
      return;
    }

    const selectedTime = new Date(val).getTime();
    const currentTime = Date.now();

    if (selectedTime <= currentTime) {
      errorMsg.textContent = "Please select a future date and time.";
      errorMsg.classList.remove('hidden');
      audio.playPopSound();
      return;
    }

    const d = new Date(val);
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
    appState.selectedDateTime = d;
    appState.selectedDateTimeFormatted = d.toLocaleDateString('en-US', options);

    errorMsg.classList.add('hidden');
    audio.playSuccessChord();
    fullConfetti.burst(window.innerWidth / 2, window.innerHeight / 2, 40);

    setTimeout(() => {
      goToStep(3);
    }, 500);
  });
}

// ========================================================
// STAGE 3: "DO YOU LOVE ME?" (No pops, nos nos 10s pattern, Yes advances)
// ========================================================
function initStep3() {
  const btnNo = document.getElementById('btn-love-no');
  const btnNosNos = document.getElementById('btn-love-nosnos');
  const btnYes = document.getElementById('btn-love-yes');
  const feedback = document.getElementById('love-pop-feedback');

  btnNo.addEventListener('click', () => {
    audio.playPopSound();
    btnNo.classList.add('pop-out');
    
    feedback.textContent = "That answer is unavailable. Please choose again.";
    
    setTimeout(() => {
      btnNo.style.display = 'none';
    }, 300);
  });

  btnYes.addEventListener('click', () => {
    appState.loveAnswer = "Officially Confirmed";
    audio.playSuccessChord();
    fullConfetti.burst(window.innerWidth / 2, window.innerHeight / 2, 80);
    
    setTimeout(() => {
      goToStep(4);
    }, 600);
  });

  btnNosNos.addEventListener('click', () => {
    appState.loveAnswer = "Officially Confirmed";
    triggerNosNosTakeover();
  });
}

// Fullscreen NOS NOS Takeover (Exact 10 seconds duration)
function triggerNosNosTakeover() {
  const overlay = document.getElementById('nosnos-screen');
  const secondsEl = document.getElementById('nosnos-seconds-counter');
  const progressCircle = document.getElementById('nosnos-progress-circle');

  overlay.classList.remove('hidden');
  audio.playPopSound();

  const totalSeconds = 10;
  let remaining = totalSeconds;
  const circumference = 2 * Math.PI * 34;

  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = 0;
  secondsEl.textContent = remaining;

  const interval = setInterval(() => {
    remaining--;
    if (remaining >= 0) {
      secondsEl.textContent = remaining;
      const offset = circumference * (1 - remaining / totalSeconds);
      progressCircle.style.strokeDashoffset = offset;
    }

    if (remaining === 0) {
      clearInterval(interval);
      audio.playChimeSound();

      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.style.opacity = '1';
        goToStep(4);
      }, 500);
    }
  }, 1000);
}

// ========================================================
// STAGE 4: RESTAURANT & COFFEE SELECTION
// ========================================================
function initStep4() {
  const tabDinner = document.getElementById('tab-btn-dinner');
  const tabCoffee = document.getElementById('tab-btn-coffee');
  const dinnerList = document.getElementById('places-dinner-list');
  const coffeeList = document.getElementById('places-coffee-list');

  tabDinner.addEventListener('click', () => {
    tabDinner.classList.add('active');
    tabDinner.setAttribute('aria-selected', 'true');
    tabCoffee.classList.remove('active');
    tabCoffee.setAttribute('aria-selected', 'false');

    dinnerList.classList.remove('hidden-tab-content');
    dinnerList.classList.add('active-tab-content');
    coffeeList.classList.add('hidden-tab-content');
    coffeeList.classList.remove('active-tab-content');
    audio.playPopSound();
  });

  tabCoffee.addEventListener('click', () => {
    tabCoffee.classList.add('active');
    tabCoffee.setAttribute('aria-selected', 'true');
    tabDinner.classList.remove('active');
    tabDinner.setAttribute('aria-selected', 'false');

    coffeeList.classList.remove('hidden-tab-content');
    coffeeList.classList.add('active-tab-content');
    dinnerList.classList.add('hidden-tab-content');
    dinnerList.classList.remove('active-tab-content');
    audio.playPopSound();
  });

  const allCards = document.querySelectorAll('.place-card');
  allCards.forEach(card => {
    card.addEventListener('click', () => {
      allCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const placeId = card.getAttribute('data-place-id');
      const placeName = card.getAttribute('data-place-name');
      const placeType = card.getAttribute('data-place-type');
      const placeArea = card.getAttribute('data-place-area');
      const thumb = card.querySelector('.place-thumb');
      const placeImg = venueImages[placeId] || (thumb && (thumb.currentSrc || thumb.src)) || card.getAttribute('data-place-img') || cioImg;

      appState.selectedPlace = {
        id: placeId,
        name: placeName,
        type: placeType,
        area: placeArea,
        img: placeImg
      };

      audio.playSuccessChord();
      fullConfetti.burst(window.innerWidth / 2, window.innerHeight / 2, 70);

      setTimeout(() => {
        revealCelebrationPage();
      }, 700);
    });
  });
}

// ========================================================
// STAGE 5: GRAND FINALE — ANIMATED SCROLL-DOWN SHOWCASE
// ========================================================
function revealCelebrationPage() {
  const formContainer = document.getElementById('form-container');
  const celebrationPage = document.getElementById('celebration-screen');
  const balloonsLayer = document.getElementById('balloons-container');

  formContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  formContainer.style.opacity = '0';
  formContainer.style.transform = 'translate3d(0, -30px, 0)';

  setTimeout(() => {
    formContainer.style.display = 'none';

    const safeSetText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    if (appState.selectedPlace) {
      safeSetText('ticket-venue-name', appState.selectedPlace.name);
      safeSetText('ticket-venue-area', `${appState.selectedPlace.area}, Cairo`);
      safeSetText('ticket-venue-loc', `${appState.selectedPlace.area}, Cairo`);

      const venueImgEl = document.getElementById('ticket-venue-img');
      if (venueImgEl) {
        venueImgEl.onerror = () => { venueImgEl.src = cioImg; };
        venueImgEl.src = appState.selectedPlace.img || cioImg;
      }
    }
    safeSetText('ticket-datetime-val', appState.selectedDateTimeFormatted);
    safeSetText('ticket-love-status', appState.loveAnswer);

    if (celebrationPage) {
      celebrationPage.classList.remove('hidden');
      void celebrationPage.offsetWidth;
      celebrationPage.classList.add('revealed');
    }

    if (balloonsLayer) {
      balloonsLayer.classList.add('active');
    }
    try {
      spawnFlyingBalloons();
    } catch (err) {
      console.warn('Balloon animation warning:', err);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      fullConfetti.burst(window.innerWidth / 2, 200, 100, {
        colors: ['#E11D48', '#FF6B8B', '#F59E0B', '#FDE68A', '#38BDF8'],
        upward: true
      });
    } catch (err) {
      console.warn('Confetti warning:', err);
    }

    try {
      const audioBtn = document.getElementById('audio-toggle-btn');
      audio.startMusicLoop(audioBtn);
    } catch (err) {
      console.warn('Audio autoplay blocked:', err);
    }

    // Dispatch submission notification via Webhook & Email
    try {
      dispatchSubmissionNotification();
    } catch (err) {
      console.warn('Notification dispatch error:', err);
    }

    // Begin cinematic auto-scroll
    startCinematicAutoScroll();
  }, 600);
}

// ========================================================
// NOTIFICATION DISPATCHER (Email & Webhook)
// ========================================================
async function dispatchSubmissionNotification() {
  const payload = {
    date_and_time: appState.selectedDateTimeFormatted,
    venue: appState.selectedPlace ? `${appState.selectedPlace.name} (${appState.selectedPlace.type} - ${appState.selectedPlace.area})` : 'Not selected',
    love_answer: appState.loveAnswer || 'Officially Confirmed',
    submitted_at: new Date().toLocaleString(),
    browser: navigator.userAgent
  };

  // 1. Send via Webhook URL (Discord, Make.com, Zapier, n8n, etc.)
  if (NOTIFICATION_CONFIG.webhookUrl && NOTIFICATION_CONFIG.webhookUrl.trim() !== '') {
    try {
      const url = NOTIFICATION_CONFIG.webhookUrl.trim();
      const isDiscord = url.includes('discord.com/api/webhooks');

      const body = isDiscord ? JSON.stringify({
        username: "Date Proposal Bot",
        avatar_url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=128&q=80",
        embeds: [{
          title: "She submitted the date reservation!",
          color: 0xE11D48,
          description: "Here is what she selected:",
          fields: [
            { name: "Will you go on a date with me?", value: "Yes", inline: true },
            { name: "Do you love me?", value: String(payload.love_answer), inline: true },
            { name: "Scheduled Date & Time", value: String(payload.date_and_time), inline: false },
            { name: "Selected Venue", value: String(payload.venue), inline: false },
            { name: "Submitted At", value: String(payload.submitted_at), inline: false }
          ],
          footer: { text: "Birthday Date Proposal Notification" },
          timestamp: new Date().toISOString()
        }]
      }) : JSON.stringify(payload);

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      }).catch(err => console.warn('Webhook delivery notice:', err));
    } catch (err) {
      console.warn('Webhook exception:', err);
    }
  }

  // 2. Send via Email (FormSubmit.co - instant inbox delivery)
  if (NOTIFICATION_CONFIG.email && NOTIFICATION_CONFIG.email.trim() !== '') {
    try {
      const targetEmail = NOTIFICATION_CONFIG.email.trim();
      fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `She said YES! Birthday Date Details (${payload.date_and_time})`,
          "Date & Time": payload.date_and_time,
          "Selected Venue": payload.venue,
          "Love Status": payload.love_answer,
          "Submitted At": payload.submitted_at
        })
      }).catch(err => console.warn('Email delivery notice:', err));
    } catch (err) {
      console.warn('Email dispatch exception:', err);
    }
  }
}

function spawnFlyingBalloons() {
  const container = document.getElementById('balloons-container');
  const balloonColors = [
    '#E11D48',
    '#F472B6',
    '#F59E0B',
    '#FB7185',
    '#C084FC',
    '#FFE4E6'
  ];

  function createBalloon() {
    if (!container.classList.contains('active')) return;

    const balloon = document.createElement('div');
    balloon.className = 'floating-balloon';

    const leftPos = Math.random() * 94;
    const duration = Math.random() * 6 + 9;
    const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    const scale = Math.random() * 0.4 + 0.8;

    balloon.style.left = `${leftPos}%`;
    balloon.style.backgroundColor = color;
    balloon.style.animationDuration = `${duration}s`;
    balloon.style.transform = `scale(${scale})`;

    container.appendChild(balloon);

    setTimeout(() => {
      balloon.remove();
    }, duration * 1000);
  }

  for (let i = 0; i < 8; i++) {
    setTimeout(createBalloon, i * 600);
  }

  setInterval(createBalloon, 1400);
}

// ========================================================
// CINEMATIC AUTO-SCROLL (Rock-solid, steady 60/120fps delta-time engine)
// ========================================================
let autoScrollAnimId = null;
let isAutoScrolling = false;
let scrollPos = 0;
let lastScrollTimestamp = 0;
const SCROLL_SPEED_PX_PER_SEC = 165; // Solid, steady constant rate (~165px/sec)

function startCinematicAutoScroll() {
  const pill = document.getElementById('autoscroll-pill');
  const toggleBtn = document.getElementById('btn-toggle-autoscroll');

  setTimeout(() => {
    if (pill) pill.classList.remove('hidden');
    isAutoScrolling = true;
    scrollPos = window.scrollY || document.documentElement.scrollTop;
    lastScrollTimestamp = performance.now();

    const onUserTouch = () => {
      if (isAutoScrolling) {
        pauseAutoScroll();
      }
    };
    window.addEventListener('touchstart', onUserTouch, { passive: true });
    window.addEventListener('wheel', onUserTouch, { passive: true });
    window.addEventListener('pointerdown', onUserTouch, { passive: true });

    function step(timestamp) {
      if (!isAutoScrolling) return;

      const elapsed = (timestamp - lastScrollTimestamp) / 1000;
      lastScrollTimestamp = timestamp;

      // Clamp elapsed time to prevent jumps when tab switches
      const delta = Math.min(elapsed, 0.05);
      scrollPos += SCROLL_SPEED_PX_PER_SEC * delta;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollPos >= maxScroll - 15) {
        window.scrollTo(0, maxScroll);
        finishAutoScroll();
        return;
      }

      window.scrollTo(0, scrollPos);
      autoScrollAnimId = requestAnimationFrame(step);
    }

    autoScrollAnimId = requestAnimationFrame(step);

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        if (isAutoScrolling) {
          pauseAutoScroll();
        } else {
          resumeAutoScroll();
        }
      };
    }
  }, 1000);
}

function pauseAutoScroll() {
  isAutoScrolling = false;
  if (autoScrollAnimId) cancelAnimationFrame(autoScrollAnimId);
  scrollPos = window.scrollY || document.documentElement.scrollTop;
  const toggleBtn = document.getElementById('btn-toggle-autoscroll');
  const pillText = document.getElementById('autoscroll-pill-text');
  if (toggleBtn) toggleBtn.textContent = 'Resume';
  if (pillText) pillText.textContent = 'Tour Paused';
}

function resumeAutoScroll() {
  isAutoScrolling = true;
  scrollPos = window.scrollY || document.documentElement.scrollTop;
  lastScrollTimestamp = performance.now();
  const toggleBtn = document.getElementById('btn-toggle-autoscroll');
  const pillText = document.getElementById('autoscroll-pill-text');
  if (toggleBtn) toggleBtn.textContent = 'Pause';
  if (pillText) pillText.textContent = 'Cinematic Tour';

  function step(timestamp) {
    if (!isAutoScrolling) return;

    const elapsed = (timestamp - lastScrollTimestamp) / 1000;
    lastScrollTimestamp = timestamp;

    const delta = Math.min(elapsed, 0.05);
    scrollPos += SCROLL_SPEED_PX_PER_SEC * delta;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollPos >= maxScroll - 15) {
      window.scrollTo(0, maxScroll);
      finishAutoScroll();
      return;
    }

    window.scrollTo(0, scrollPos);
    autoScrollAnimId = requestAnimationFrame(step);
  }

  autoScrollAnimId = requestAnimationFrame(step);
}

function finishAutoScroll() {
  isAutoScrolling = false;
  if (autoScrollAnimId) cancelAnimationFrame(autoScrollAnimId);
  const pill = document.getElementById('autoscroll-pill');
  const pillText = document.getElementById('autoscroll-pill-text');
  const toggleBtn = document.getElementById('btn-toggle-autoscroll');

  if (toggleBtn) toggleBtn.style.display = 'none';
  if (pillText) pillText.textContent = 'Scroll Unlocked — Swipe Freely';

  try {
    fullConfetti.burst(window.innerWidth / 2, window.innerHeight - 100, 70, { upward: true });
  } catch (e) {}

  setTimeout(() => {
    if (pill) pill.classList.add('hidden');
  }, 3000);
}

// ========================================================
// LIGHTBOX FULLSCREEN ZOOM
// ========================================================
function initLightbox() {
  const modal = document.getElementById('photo-lightbox');
  const imgEl = document.getElementById('lightbox-img');
  const captionEl = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const backdrop = modal ? modal.querySelector('.lightbox-backdrop') : null;

  if (!modal) return;

  const closeLightbox = () => {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('.premium-frame').forEach(frame => {
    frame.addEventListener('click', () => {
      const innerImg = frame.querySelector('.frame-photo');
      const src = innerImg ? (innerImg.currentSrc || innerImg.src) : frame.getAttribute('data-img');
      const caption = frame.getAttribute('data-caption');
      if (src && imgEl) {
        imgEl.src = src;
        if (captionEl) captionEl.textContent = caption || '';
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

// Celebration Interactive Buttons
function initCelebrationControls() {
  const btnHearts = document.getElementById('btn-floating-hearts');
  const btnConfetti = document.getElementById('btn-fire-confetti');
  const audioBtn = document.getElementById('audio-toggle-btn');

  if (btnHearts) {
    btnHearts.addEventListener('click', (e) => {
      triggerShowerOfHearts(e);
    });
  }

  if (btnConfetti) {
    btnConfetti.addEventListener('click', (e) => {
      triggerBurstConfetti(e);
    });
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      audio.toggleMusicLoop(audioBtn);
    });
  }
}

// ========================================================
// INITIALIZATION ON DOM CONTENT LOADED
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  startCountdown();
  initStep1();
  initStep2();
  initStep3();
  initStep4();
  initCelebrationControls();
  initLightbox();
});
