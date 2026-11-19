/* 三中风云 — 全程序化音频与角色语音 */
(function () {
  'use strict';

  const THEMES = {
    title: {
      bpm: 56, root: 50, scale: [0, 2, 4, 7, 9, 12, 14], wind: .045, rain: 0, fire: 0,
      pluck: [0, null, 2, null, null, 4, null, 3, null, null, 5, null, 4, null, 2, null],
      pad: [[0, 2, 4], [0, 3, 5]], drum: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], bell: true
    },
    intro: {
      bpm: 52, root: 48, scale: [0, 2, 3, 7, 9, 12], wind: .06, rain: 0, fire: 0,
      pluck: [0, null, null, 2, null, 3, null, null, 4, null, null, 3, null, 2, null, null],
      pad: [[0, 2, 4], [0, 3, 4]], drum: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], bell: true
    },
    snow: {
      bpm: 64, root: 50, scale: [0, 2, 3, 5, 7, 10, 12], wind: .075, rain: 0, fire: 0,
      pluck: [0, null, 2, null, 4, null, 3, null, 2, null, null, 5, null, 4, null, 1],
      pad: [[0, 2, 4], [0, 3, 5]], drum: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0], bell: false
    },
    bamboo: {
      bpm: 78, root: 48, scale: [0, 2, 3, 5, 7, 9, 10], wind: .045, rain: .055, fire: 0,
      pluck: [0, null, 3, 2, null, 4, null, 2, null, 5, null, 4, 3, null, 2, null],
      pad: [[0, 2, 4], [1, 3, 5]], drum: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], bell: false
    },
    temple: {
      bpm: 86, root: 45, scale: [0, 1, 3, 5, 7, 8, 10], wind: .035, rain: 0, fire: .075,
      pluck: [0, null, null, 2, 3, null, 1, null, null, 4, null, 3, null, 2, null, 1],
      pad: [[0, 2, 4], [0, 1, 4]], drum: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0], bell: true
    },
    boss: {
      bpm: 108, root: 41, scale: [0, 1, 3, 5, 6, 8, 10], wind: .055, rain: 0, fire: .085,
      pluck: [0, null, 2, null, 3, 2, null, 4, null, 3, null, 5, 4, null, 2, 1],
      pad: [[0, 2, 4], [0, 2, 5]], drum: [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0], bell: false
    },
    ending: {
      bpm: 62, root: 52, scale: [0, 2, 4, 7, 9, 12], wind: .035, rain: 0, fire: 0,
      pluck: [0, null, 2, null, 4, null, 5, null, 4, null, 2, null, 1, null, 0, null],
      pad: [[0, 2, 4], [0, 2, 5]], drum: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], bell: true
    }
  };

  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.compressor = null;
      this.volumes = { master: .8, music: .55, sfx: .75, voice: .8 };
      this.themeName = 'title';
      this.theme = THEMES.title;
      this.playing = false;
      this.step = 0;
      this.nextStep = 0;
      this.lookahead = .16;
      this.intensity = 0;
      this.ambient = null;
      this.noiseBuffer = null;
      this._voices = [];
      this._lastVoiceAt = 0;
      this._lastBark = '';
      this._lastBarkAt = 0;
      this._loadVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.addEventListener('voiceschanged', () => this._loadVoices());
      }
    }

    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -18;
        this.compressor.knee.value = 22;
        this.compressor.ratio.value = 5;
        this.compressor.attack.value = .004;
        this.compressor.release.value = .22;
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain.connect(this.compressor);
        this.sfxGain.connect(this.compressor);
        this.compressor.connect(this.master);
        this.master.connect(this.ctx.destination);
        this.musicGain.gain.value = this.volumes.music * .82;
        this.sfxGain.gain.value = this.volumes.sfx;
        this.master.gain.value = this.volumes.master;
        this._buildAmbient();
        this.nextStep = this.ctx.currentTime + .1;
        if (this.playing) this._resumeTheme();
      } catch (e) {
        console.warn('音频初始化失败', e);
      }
    }

    _loadVoices() {
      if (!window.speechSynthesis) return;
      this._voices = window.speechSynthesis.getVoices() || [];
    }

    _pickVoice(lang) {
      const voices = this._voices.length ? this._voices : (window.speechSynthesis ? window.speechSynthesis.getVoices() : []);
      if (!voices || !voices.length) return null;
      return voices.find(v => v.lang === 'zh-CN' && /Xiaoxiao|Yunxi|Huihui|Ting|Chinese|Mandarin/i.test(v.name))
        || voices.find(v => /^zh/i.test(v.lang))
        || voices[0];
    }

    setVolumes(v) {
      Object.assign(this.volumes, v);
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(this.volumes.master, t, .04);
      this.musicGain.gain.setTargetAtTime(this.volumes.music * .82, t, .06);
      this.sfxGain.gain.setTargetAtTime(this.volumes.sfx, t, .04);
    }

    _noiseBuffer() {
      if (this.noiseBuffer) return this.noiseBuffer;
      const len = this.ctx.sampleRate * 3;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + .018 * white) / 1.018;
        data[i] = last * 3.2;
      }
      this.noiseBuffer = buf;
      return buf;
    }

    _buildAmbient() {
      if (!this.ctx) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this._noiseBuffer();
      src.loop = true;
      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass'; windFilter.frequency.value = 380; windFilter.Q.value = .6;
      const windGain = this.ctx.createGain(); windGain.gain.value = .04;
      src.connect(windFilter).connect(windGain).connect(this.musicGain);

      const rainSrc = this.ctx.createBufferSource();
      rainSrc.buffer = this._noiseBuffer();
      rainSrc.loop = true;
      const rainFilter = this.ctx.createBiquadFilter();
      rainFilter.type = 'highpass'; rainFilter.frequency.value = 1800;
      const rainGain = this.ctx.createGain(); rainGain.gain.value = 0;
      rainSrc.connect(rainFilter).connect(rainGain).connect(this.musicGain);

      const fireSrc = this.ctx.createBufferSource();
      fireSrc.buffer = this._noiseBuffer();
      fireSrc.loop = true;
      const fireFilter = this.ctx.createBiquadFilter();
      fireFilter.type = 'bandpass'; fireFilter.frequency.value = 900; fireFilter.Q.value = .5;
      const fireGain = this.ctx.createGain(); fireGain.gain.value = 0;
      fireSrc.connect(fireFilter).connect(fireGain).connect(this.musicGain);

      src.start(); rainSrc.start(); fireSrc.start();
      this.ambient = { windGain, rainGain, fireGain, windFilter, rainFilter, fireFilter };
    }

    startMusic(name) {
      this.themeName = THEMES[name] ? name : 'snow';
      this.theme = THEMES[this.themeName];
      this.playing = true;
      if (!this.ctx) return;
      this.nextStep = Math.max(this.nextStep, this.ctx.currentTime + .08);
      this._resumeTheme();
    }

    _resumeTheme() {
      const th = this.theme;
      if (!this.ctx || !this.ambient) return;
      const t = this.ctx.currentTime;
      this.ambient.windGain.gain.setTargetAtTime(th.wind, t, .8);
      this.ambient.rainGain.gain.setTargetAtTime(th.rain, t, .9);
      this.ambient.fireGain.gain.setTargetAtTime(th.fire, t, .9);
    }

    stopMusic() {
      this.playing = false;
      if (!this.ctx) return;
      this.ambient.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, .4);
      this.ambient.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, .4);
      this.ambient.fireGain.gain.setTargetAtTime(0, this.ctx.currentTime, .4);
    }

    setIntensity(v) { this.intensity = U.clamp(v, 0, 1); }

    playSound(type) { this.sfx(type); }

    switchBGM(state, exploreTheme) {
      if (state === this.bgmState) return;
      this.bgmState = state;
      if (state === 'combat') this.startMusic('boss');
      else this.startMusic(exploreTheme || this.lastExploreTheme || 'snow');
      if (exploreTheme) this.lastExploreTheme = exploreTheme;
    }

    update() {
      if (!this.ctx || !this.playing) return;
      const now = this.ctx.currentTime;
      const stepDur = 60 / this.theme.bpm / 4;
      if (this.nextStep < now) this.nextStep = now + .03;
      while (this.nextStep < now + this.lookahead) {
        this._scheduleStep(this.step, this.nextStep);
        this.step = (this.step + 1) % 32;
        this.nextStep += stepDur;
      }
    }

    _scheduleStep(step, time) {
      const th = this.theme;
      const i = step % 16;
      const bar = Math.floor(step / 16) % 2;

      if (i === 0) {
        const chord = th.pad[bar % th.pad.length];
        this._pad(chord, th.root, time, 3.8);
        if (this.themeName === 'boss' || this.themeName === 'temple') this._bass(th.root - 12, time, 3.1);
      }
      const pl = th.pluck[i];
      if (pl !== null && pl !== undefined) {
        if (Math.random() < (this.themeName === 'boss' ? .93 : .8)) {
          const deg = th.scale[pl % th.scale.length] + (pl >= th.scale.length ? 12 : 0);
          this._pluck(midi(th.root + 12 + deg), time + U.rand(0, .01), .055 + this.intensity * .02);
        }
      }
      const drum = th.drum[i];
      if (drum) {
        this._taiko(time, this.themeName === 'boss' ? .14 + this.intensity * .05 : .08);
      }
      if (th.bell && i === 0 && Math.random() < .55) this._bell(midi(th.root + 24 + U.choice([0, 4, 7])), time, .035);
    }

    _pluck(freq, time, gain) {
      if (!this.ctx) return;
      const o1 = this.ctx.createOscillator();
      const o2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();
      o1.type = 'triangle'; o1.frequency.value = freq;
      o2.type = 'sine'; o2.frequency.value = freq * 2.005;
      f.type = 'lowpass'; f.frequency.setValueAtTime(2600, time); f.frequency.exponentialRampToValueAtTime(700, time + .6);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(gain, time + .006);
      g.gain.exponentialRampToValueAtTime(.0001, time + U.rand(.8, 1.5));
      const g2 = this.ctx.createGain(); g2.gain.value = .28;
      o1.connect(f); o2.connect(g2).connect(f); f.connect(g).connect(this.musicGain);
      o1.start(time); o2.start(time); o1.stop(time + 1.6); o2.stop(time + 1.6);
    }

    _pad(chord, root, time, dur) {
      if (!this.ctx) return;
      const g = this.ctx.createGain();
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 420 + this.intensity * 450; f.Q.value = .8;
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(.018 + this.intensity * .012, time + .8);
      g.gain.setValueAtTime(.018 + this.intensity * .012, time + dur - .7);
      g.gain.linearRampToValueAtTime(0, time + dur);
      g.connect(f).connect(this.musicGain);
      chord.forEach((d, idx) => {
        for (let k = 0; k < 2; k++) {
          const o = this.ctx.createOscillator();
          o.type = k ? 'sine' : 'triangle';
          o.frequency.value = midi(root - 12 + d) * (k ? 2.002 : 1);
          o.detune.value = (k ? 4 : -3) + idx * 2;
          const og = this.ctx.createGain(); og.gain.value = k ? .35 : .8;
          o.connect(og).connect(g);
          o.start(time + idx * .04); o.stop(time + dur + .1);
        }
      });
    }

    _bass(note, time, dur) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = midi(note);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(.055, time + .05);
      g.gain.exponentialRampToValueAtTime(.001, time + dur);
      o.connect(g).connect(this.musicGain);
      o.start(time); o.stop(time + dur + .1);
    }

    _taiko(time, gain) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(110, time);
      o.frequency.exponentialRampToValueAtTime(43, time + .18);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(gain, time + .008);
      g.gain.exponentialRampToValueAtTime(.001, time + .38);
      o.connect(g).connect(this.musicGain);
      o.start(time); o.stop(time + .45);

      const src = this.ctx.createBufferSource(); src.buffer = this._noiseBuffer();
      const nf = this.ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 900;
      const ng = this.ctx.createGain(); ng.gain.setValueAtTime(gain * .45, time); ng.gain.exponentialRampToValueAtTime(.001, time + .13);
      src.connect(nf).connect(ng).connect(this.musicGain);
      src.start(time); src.stop(time + .15);
    }

    _bell(freq, time, gain) {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator(); const o2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      o2.type = 'sine'; o2.frequency.value = freq * 2.71;
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(gain, time + .01);
      g.gain.exponentialRampToValueAtTime(.0001, time + 2.4);
      o.connect(g); o2.connect(g); g.connect(this.musicGain);
      o.start(time); o2.start(time); o.stop(time + 2.5); o2.stop(time + 2.5);
    }

    _tone(opts) {
      if (!this.ctx) return;
      const { freq = 440, type = 'sine', dur = .2, gain = .08, slide = null, filter = null, delay = 0 } = opts;
      const t = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + .005);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      if (filter) {
        const f = this.ctx.createBiquadFilter(); f.type = filter.type || 'lowpass'; f.frequency.value = filter.freq || 1200; f.Q.value = filter.q || .8;
        o.connect(f).connect(g);
      } else o.connect(g);
      g.connect(this.sfxGain);
      o.start(t); o.stop(t + dur + .05);
    }

    _noise(dur, gain, type, freq, delay = 0, slide = null) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const src = this.ctx.createBufferSource(); src.buffer = this._noiseBuffer();
      const f = this.ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq || 1200, t);
      if (slide) f.frequency.exponentialRampToValueAtTime(slide, t + dur);
      f.Q.value = .75;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      src.connect(f).connect(g).connect(this.sfxGain);
      src.start(t); src.stop(t + dur + .02);
    }

    sfx(name) {
      if (!this.ctx) return;
      switch (name) {
        case 'ui':
          this._pluck(midi(74), this.ctx.currentTime, .035); break;
        case 'uiBack':
          this._pluck(midi(62), this.ctx.currentTime, .03); break;
        case 'jump':
          this._tone({ freq: 260, slide: 520, type: 'sine', dur: .14, gain: .05 }); break;
        case 'dash':
          this._noise(.23, .16, 'bandpass', 1700, 0, 420);
          this._tone({ freq: 460, slide: 130, type: 'sine', dur: .2, gain: .035 }); break;
        case 'slash':
          this._noise(.15, .13, 'highpass', 1400, 0, 4600);
          this._tone({ freq: 820, slide: 300, type: 'triangle', dur: .1, gain: .025 }); break;
        case 'slashHeavy':
          this._noise(.25, .17, 'bandpass', 1000, 0, 240);
          this._tone({ freq: 190, slide: 62, type: 'sine', dur: .22, gain: .09 }); break;
        case 'hit':
          this._tone({ freq: 140, slide: 50, type: 'sine', dur: .13, gain: .15 });
          this._noise(.08, .1, 'lowpass', 700); break;
        case 'hurt':
          this._tone({ freq: 110, slide: 58, type: 'sawtooth', dur: .25, gain: .08 });
          this._noise(.2, .09, 'bandpass', 420); break;
        case 'skill':
          this._tone({ freq: 620, type: 'sine', dur: .45, gain: .05 });
          this._tone({ freq: 930, type: 'sine', dur: .5, gain: .035, delay: .05 });
          this._noise(.4, .11, 'bandpass', 1100, 0, 300); break;
        case 'heal':
          [60, 64, 67, 72].forEach((n, i) => this._tone({ freq: midi(n), type: 'sine', dur: .8, gain: .05, delay: i * .075 })); break;
        case 'perfect':
          this._tone({ freq: 180, slide: 1400, type: 'sine', dur: .4, gain: .08 });
          this._tone({ freq: 1200, type: 'sine', dur: .8, gain: .035, delay: .05 });
          this._noise(.35, .09, 'highpass', 2500); break;
        case 'enemyDown':
          this._tone({ freq: 220, slide: 45, type: 'triangle', dur: .5, gain: .07 });
          this._noise(.4, .11, 'lowpass', 1800, 0, 120); break;
        case 'bossDown':
          this._tone({ freq: 90, slide: 28, type: 'sine', dur: 1.4, gain: .2 });
          this._noise(1.3, .16, 'lowpass', 1400, 0, 80); break;
        case 'wave':
          this._noise(.55, .13, 'bandpass', 800, 0, 2800);
          this._tone({ freq: 300, slide: 900, type: 'sine', dur: .5, gain: .045 }); break;
        case 'bossCast':
          this._tone({ freq: 60, slide: 38, type: 'sawtooth', dur: .9, gain: .07 });
          this._noise(.8, .12, 'lowpass', 500, 0, 130); break;
        case 'fire':
          this._noise(.7, .14, 'bandpass', 380, 0, 1600);
          this._tone({ freq: 100, slide: 50, type: 'sawtooth', dur: .5, gain: .05 }); break;
        case 'checkpoint':
          [0, 2, 4, 7].forEach((d, i) => this._tone({ freq: midi(62 + d), type: 'sine', dur: 1.2, gain: .035, delay: i * .12 })); break;
        case 'victory':
          [50, 55, 57, 62, 66].forEach((n, i) => this._tone({ freq: midi(n), type: 'triangle', dur: 1.9, gain: .055, delay: i * .1 }));
          this._taiko(this.ctx.currentTime + .35, .18); break;
        case 'lose':
          this._tone({ freq: 220, slide: 55, type: 'sawtooth', dur: 1.25, gain: .06 });
          this._tone({ freq: 110, slide: 40, type: 'square', dur: 1.1, gain: .02, delay: .15 });
          break;
        case 'gong':
          this._bell(midi(43), this.ctx.currentTime, .08); break;
        case 'life':
          this._tone({ freq: 500, slide: 850, type: 'sine', dur: .25, gain: .045 }); break;
        case 'warn':
          this._tone({ freq: 160, type: 'square', dur: .1, gain: .025 });
          this._tone({ freq: 160, type: 'square', dur: .1, gain: .025, delay: .16 }); break;
        case 'deflect':
          this._tone({ freq: 1900, slide: 640, type: 'sine', dur: .2, gain: .09 });
          this._tone({ freq: 94, slide: 52, type: 'sawtooth', dur: .26, gain: .075 });
          this._noise(.12, .11, 'highpass', 2600); break;
        case 'perfectDodge':
          this._tone({ freq: 1400, slide: 150, type: 'sine', dur: .55, gain: .06 });
          this._noise(.48, .08, 'bandpass', 2100, 0, 380);
          this._tone({ freq: 380, type: 'sine', dur: 1.1, gain: .025, delay: .12 }); break;
        case 'squirrel':
          [880, 1320, 1760].forEach((f, i) => this._tone({ freq: f, type: 'sine', dur: .12, gain: .035, delay: i * .06 })); break;
        case 'chalk':
          this._tone({ freq: 120, slide: 60, type: 'sine', dur: .12, gain: .08 });
          this._noise(.1, .08, 'lowpass', 500); break;
        case 'alert':
          for (let i = 0; i < 4; i++) this._tone({ freq: i % 2 ? 640 : 430, type: 'sawtooth', dur: .32, gain: .034, delay: i * .3, filter: { type: 'lowpass', freq: 1200 } }); break;
      }
    }

    speak(text, who, opts) {
      if (!text || this.volumes.voice <= 0.01 || this.volumes.master <= 0.01) return;
      if (!window.speechSynthesis) return;
      const now = performance.now() / 1000;
      if (text === this._lastBark && now - this._lastBarkAt < 7) return;
      this._lastBark = text; this._lastBarkAt = now;
      try {
        const u = new SpeechSynthesisUtterance(String(text).replace(/[“”]/g, ''));
        const voice = this._pickVoice('zh-CN');
        if (voice) u.voice = voice;
        u.lang = 'zh-CN';
        const cfg = {
          player: { rate: 1.06, pitch: 1.62, volume: .95 },
          boss: { rate: .82, pitch: .48, volume: 1 },
          alan: { rate: .92, pitch: .82, volume: .9 },
          narrator: { rate: .84, pitch: .9, volume: .88 },
          system: { rate: 1, pitch: 1.1, volume: .8 }
        }[who] || { rate: .92, pitch: 1, volume: .9 };
        u.rate = cfg.rate; u.pitch = cfg.pitch;
        u.volume = U.clamp(cfg.volume * this.volumes.voice * this.volumes.master, 0, 1);
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch (e) { /* 静默失败，字幕仍可阅读 */ }
    }

    stopVoice() {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    suspend() {
      if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }
  }

  window.AudioEngine = AudioEngine;
  window.THEMES = THEMES;
})();
