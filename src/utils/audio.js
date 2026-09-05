// Web Audio API Sound Synthesizer & Audio Engine with Cross-Browser Autoplay Unlock

let audioCtx = null;
let isAudioUnlocked = false;

// Attempt to initialize and unlock AudioContext on user gesture
export function unlockAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        isAudioUnlocked = true;
      }).catch((err) => {
        console.warn('AudioContext resume deferred:', err);
      });
    } else {
      isAudioUnlocked = true;
    }
    return audioCtx;
  } catch (e) {
    console.warn('Audio unlock error:', e);
    return null;
  }
}

// Global auto-unlock on first user interaction
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
  const handleInteraction = () => {
    unlockAudio();
    unlockEvents.forEach(evt => window.removeEventListener(evt, handleInteraction));
  };
  unlockEvents.forEach(evt => window.addEventListener(evt, handleInteraction, { passive: true }));
}

/**
 * Play a clear, resonant two-tone attention chime for court expiration alerts
 */
export function playAlertSound(isSoundEnabled = true) {
  if (!isSoundEnabled) return;

  try {
    const ctx = unlockAudio();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- Chime Tone 1: 880 Hz (A5) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    gain1.gain.setValueAtTime(0.7, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.6);

    // --- Chime Tone 2: 1174.66 Hz (D6) with harmonic resonance ---
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle'; // Brighter harmonic texture
    osc2.frequency.setValueAtTime(1174.66, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.28);

    gain2.gain.setValueAtTime(0.8, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.18);
    osc2.stop(now + 0.9);

  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

/**
 * Play a short pleasant click/chime confirmation
 */
export function playConfirmationBeep() {
  try {
    const ctx = unlockAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    console.warn('Confirmation beep failed:', e);
  }
}
