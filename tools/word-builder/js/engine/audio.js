/**
 * @file audio.js
 * @description Central audio manager for sound effects and UI audio cues using Web Audio API synthesis.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const sound = {
  // Simple UI click sound
  playClick() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Audio playClick error:", e);
    }
  },

  // Building open whoosh / chime
  playBuildingOpen() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.22);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn("Audio playBuildingOpen error:", e);
    }
  },

  // Soft wind whoosh sound for cloud screen transitions
  playCloudWhoosh() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const duration = 0.6;

      // Create white noise buffer for a natural wind/cloud whoosh
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter sweeps from low to mid and back down
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.exponentialRampToValueAtTime(750, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(160, now + duration);
      filter.Q.setValueAtTime(2.5, now);

      // Volume envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } catch (e) {
      console.warn("Audio playCloudWhoosh error:", e);
    }
  },

  // Locked building vibration with Left -> Right -> Left stereo swing
  playLocked() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.35; // Matches the 0.35s slot shake animation

      // Main sound tone (Medium pitch buzz: 185 Hz)
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(185, now);

      // Rapid vibration wave (32 Hz) for a controller buzz feel
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(32, now);
      vibratoGain.gain.setValueAtTime(45, now);
      vibrato.connect(osc.frequency);

      // Volume controller
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      masterGain.gain.setValueAtTime(0.18, now + duration - 0.08);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Stereo Panner: Moves sound Left -> Right -> Left -> Center
      if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(-0.85, now); // Start Left
        panner.pan.linearRampToValueAtTime(0.85, now + 0.14); // Swing Right
        panner.pan.linearRampToValueAtTime(-0.85, now + 0.26); // Swing Left
        panner.pan.linearRampToValueAtTime(0.0, now + duration); // Back to Center

        osc.connect(masterGain);
        masterGain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(masterGain);
        masterGain.connect(ctx.destination);
      }

      vibrato.start(now);
      osc.start(now);

      vibrato.stop(now + duration);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Audio playLocked error:", e);
    }
  },

  // Cheerful multi-note harmonic chime for floor completions
  playSuccess() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Arpeggiated C major chord: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const frequencies = [523.25, 659.25, 783.99, 1046.5];
      frequencies.forEach((freq, index) => {
        const noteTime = now + index * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.14, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.28);
      });
    } catch (e) {
      console.warn("Audio playSuccess error:", e);
    }
  },
};
