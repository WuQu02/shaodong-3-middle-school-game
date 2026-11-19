/* 三中风云 · 邵东三中开放世界沙盒
 * 原创 2.5D 绘景 + Canvas 角色动画；无强制战斗、无区域加载。
 */
(function () {
  'use strict';
  const D = window.SANDBOX_DATA;
  if (!D) return;
  const $ = id => document.getElementById(id);
  const canvas = $('world');
  const ctx = canvas.getContext('2d');
  const mini = $('minimap');
  const mctx = mini.getContext('2d');
  const W = () => canvas.clientWidth || window.innerWidth;
  const H = () => canvas.clientHeight || window.innerHeight;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const zones = D.zones;
  const worldW = D.meta.worldWidth;
  const zoneIds = zones.map(z => z.id);
  const namedZones = zoneIds.filter(id => id !== 'gate');
  const SAVE = 'sd3_sandbox_v1';
  let dpr = 1;

  const state = {
    player: { x: D.meta.spawnX, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, walk: 0, stamina: 100 },
    camera: 0, zoneId: 'gate', visited: {}, talked: {}, quests: {}, relics: {}, shards: {},
    ach: {}, clues: [], time: D.meta.startTime, mood: 42,
    dialogue: null, panel: null, riddleRelic: null, dlgTimer: 0, dlgDone: true,
    audioOn: true, started: false, lastZoneBanner: ''
  };

  /* ---------- 存档 ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(SAVE);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return false;
      state.player.x = clamp(Number(s.x) || D.meta.spawnX, 60, worldW - 60);
      state.time = Number(s.time) || D.meta.startTime;
      state.mood = clamp(Number(s.mood) || 42, 0, 100);
      state.visited = s.visited || {};
      state.talked = s.talked || {};
      state.quests = s.quests || {};
      state.relics = s.relics || {};
      state.shards = s.shards || {};
      state.ach = s.ach || {};
      state.clues = Array.isArray(s.clues) ? s.clues.slice(-8) : [];
      state.audioOn = s.audioOn !== false;
      return true;
    } catch (e) { return false; }
  }
  function save() {
    try {
      localStorage.setItem(SAVE, JSON.stringify({
        x: Math.round(state.player.x), time: Math.round(state.time), mood: Math.round(state.mood),
        visited: state.visited, talked: state.talked, quests: state.quests,
        relics: state.relics, shards: state.shards, ach: state.ach,
        clues: state.clues.slice(-8), audioOn: state.audioOn
      }));
    } catch (e) { /* ignore */ }
  }

  /* ---------- 音效 ---------- */
  class AmbientAudio {
    constructor() { this.ctx = null; this.master = null; this.wind = null; this.zoneRoot = 0; this.stepAt = 0; this.nextNote = 0; }
    ensure() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = state.audioOn ? .5 : 0;
      this.master.connect(this.ctx.destination);
      this.startWind();
      this.nextNote = this.ctx.currentTime + .8;
    }
    setOn(on) { state.audioOn = on; if (this.master) this.master.gain.setTargetAtTime(on ? .5 : 0, this.ctx.currentTime, .15); }
    startWind() {
      const c = this.ctx, len = c.sampleRate * 2;
      const buffer = c.createBuffer(1, len, c.sampleRate);
      const d = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) { last = last * .98 + (Math.random() * 2 - 1) * .02; d[i] = last; }
      const src = c.createBufferSource(); src.buffer = buffer; src.loop = true;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 460;
      const g = c.createGain(); g.gain.value = .22;
      src.connect(lp); lp.connect(g); g.connect(this.master); src.start();
      this.wind = g;
    }
    zoneChanged(id) {
      this.zoneRoot = zones.findIndex(z => z.id === id) % 5;
    }
    update(dt, walking) {
      if (!this.ctx || !state.audioOn) return;
      const c = this.ctx;
      if (c.currentTime > this.nextNote) {
        const roots = [220, 246.94, 196, 174.61, 261.63];
        const root = roots[this.zoneRoot % roots.length];
        const scale = [1, 1.122, 1.25, 1.498, 1.682];
        const f = root * scale[Math.floor(Math.random() * scale.length)] / 2;
        this.note(f, .16, .012, 'sine');
        if (Math.random() < .4) this.note(f * 1.5, .1, .008, 'triangle');
        this.nextNote = c.currentTime + .9 + Math.random() * .9;
      }
      if (walking && c.currentTime > this.stepAt) {
        this.stepAt = c.currentTime + .34;
        this.noiseBurst(.045, 900, .018);
      }
    }
    note(freq, dur, vol, type) {
      const c = this.ctx, o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(vol, c.currentTime + .02);
      g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + dur);
      o.connect(g); g.connect(this.master); o.start(); o.stop(c.currentTime + dur + .02);
    }
    noiseBurst(dur, cutoff, vol) {
      const c = this.ctx, len = Math.floor(c.sampleRate * dur);
      const buffer = c.createBuffer(1, len, c.sampleRate);
      const d = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buffer;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
      const g = c.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(this.master); src.start();
    }
    blip(freq) { if (this.ctx) this.note(freq || 640, .08, .02, 'sine'); }
    chime() { if (!this.ctx) return; [523.25, 659.25, 783.99].forEach((f, i) => setTimeout(() => this.note(f, .5, .025, 'sine'), i * 90)); }
    step() { if (this.ctx && state.audioOn) this.noiseBurst(.04, 800, .015); }
  }
  const audio = new AmbientAudio();

  /* ---------- 输入 ---------- */
  const keys = {};
  const virtual = { left: false, right: false };
  let lastInteractAt = 0;

  function onKey(e, down) {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const k = e.code;
    const used = ['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space', 'KeyE', 'KeyM', 'KeyJ', 'KeyK', 'KeyH', 'Escape', 'Enter'];
    if (used.includes(k)) e.preventDefault();
    if (down && !state.started) { state.started = true; audio.ensure(); }
    keys[k] = down;
    if (!down) return;
    if (k === 'Escape') { closeTop(); return; }
    if (state.dialogue || state.riddleRelic) {
      if (k === 'Enter' && state.dialogue) { completeTyping(); }
      return;
    }
    if (state.panel) { if (k === 'Escape') closePanel(); return; }
    if (k === 'KeyM') openPanel('map');
    else if (k === 'KeyJ') openPanel('ach');
    else if (k === 'KeyK') openPanel('relic');
    else if (k === 'KeyH') openPanel('help');
    else if (k === 'KeyE') interact();
    else if (k === 'Space') jump();
  }
  window.addEventListener('keydown', e => onKey(e, true));
  window.addEventListener('keyup', e => onKey(e, false));

  document.querySelectorAll('[data-move]').forEach(btn => {
    const dir = btn.getAttribute('data-move');
    const on = e => { e.preventDefault(); virtual[dir] = true; if (!state.started) { state.started = true; audio.ensure(); } };
    const off = e => { e.preventDefault(); virtual[dir] = false; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('pointerleave', off);
  });
  document.querySelectorAll('[data-act]').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (!state.started) { state.started = true; audio.ensure(); }
      if (btn.getAttribute('data-act') === 'jump') jump(); else interact();
    });
  });

  function jump() {
    if (state.dialogue || state.riddleRelic || state.panel) return;
    const p = state.player;
    if (p.onGround) { p.vy = -610; p.onGround = false; audio.blip(420); }
  }

  function closeTop() {
    if (state.riddleRelic) { closeRiddle(); return; }
    if (state.dialogue) { closeDialogue(); return; }
    if (state.panel) closePanel();
  }

  /* ---------- 世界与角色绘制 ---------- */
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W() * dpr);
    canvas.height = Math.round(H() * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);

  function zoneAt(x) {
    let z = zones[0];
    for (const item of zones) if (x >= item.x) z = item;
    return z;
  }
  function groundY() { return H() * .73; }
  function sx(worldX) { return worldX - state.camera; }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r);
    else {
      const rr = Math.min(r, w / 2, h / 2);
      c.moveTo(x + rr, y); c.arcTo(x + w, y, x + w, y + h, rr); c.arcTo(x + w, y + h, x, y + h, rr);
      c.arcTo(x, y + h, x, y, rr); c.arcTo(x, y, x + w, y, rr); c.closePath();
    }
  }

  function nightAlpha() {
    const h = (state.time % 1440) / 60;
    if (h >= 6 && h < 17) return .08;
    if (h >= 17 && h < 19) return .24;
    return .4;
  }

  function drawSky(z) {
    const w = W(), h = H();
    const g = ctx.createLinearGradient(0, 0, 0, h * .82);
    g.addColorStop(0, z.sky[0]);
    g.addColorStop(.52, z.sky[1]);
    g.addColorStop(1, z.sky[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // 星与月
    const t = performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = .5;
    for (let i = 0; i < 46; i++) {
      const x = (i * 197.3 + 40) % w;
      const y = (i * 83.7 + 30) % (h * .48);
      const a = .25 + Math.abs(Math.sin(t * .4 + i)) * .45;
      ctx.fillStyle = `rgba(220,245,255,${a})`;
      ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
    }
    const mx = w * .79, my = h * .17;
    const moon = ctx.createRadialGradient(mx, my, 4, mx, my, 52);
    moon.addColorStop(0, 'rgba(240,250,255,.95)');
    moon.addColorStop(.3, 'rgba(205,235,245,.35)');
    moon.addColorStop(1, 'rgba(160,220,240,0)');
    ctx.fillStyle = moon;
    ctx.beginPath(); ctx.arc(mx, my, 52, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(235,248,255,.88)';
    ctx.beginPath(); ctx.arc(mx, my, 14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // 夜色
    ctx.fillStyle = `rgba(4, 12, 24, ${nightAlpha()})`;
    ctx.fillRect(0, 0, w, h);
  }

  function drawFar(z) {
    const w = W(), h = H(), gy = groundY();
    const t = performance.now() / 1000;
    // 远山
    for (let layer = 0; layer < 2; layer++) {
      const par = state.camera * (layer ? .16 : .08);
      ctx.beginPath();
      ctx.moveTo(-40, gy);
      for (let x = -40; x <= w + 40; x += 40) {
        const n = Math.sin((x + par) * .006 + layer * 2.4) * 26 + Math.sin((x + par) * .013 + layer) * 12;
        ctx.lineTo(x, gy - 150 - layer * 30 + n);
      }
      ctx.lineTo(w + 40, gy);
      ctx.closePath();
      ctx.fillStyle = layer ? 'rgba(27, 49, 62, .72)' : 'rgba(46, 72, 86, .5)';
      ctx.fill();
    }
    // 雪坡
    ctx.beginPath();
    ctx.moveTo(0, gy);
    for (let x = 0; x <= w; x += 30) ctx.lineTo(x, gy - 42 - Math.sin((x + state.camera * .35) * .012) * 10);
    ctx.lineTo(w, gy); ctx.closePath();
    ctx.fillStyle = 'rgba(214, 233, 236, .18)';
    ctx.fill();
    // 飘雾
    for (let i = 0; i < 5; i++) {
      const x = ((i * 280 - state.camera * .2 + t * 12) % (w + 400)) - 200;
      const grd = ctx.createRadialGradient(x, gy - 70 + i * 9, 10, x, gy - 70 + i * 9, 240);
      grd.addColorStop(0, 'rgba(210,235,242,.045)');
      grd.addColorStop(1, 'rgba(210,235,242,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(x - 240, gy - 310, 480, 480);
    }
  }

  function windowGlow(x, y, w, h, color) {
    const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 1, x + w / 2, y + h / 2, Math.max(w, h) * 1.7);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(255,210,140,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - w, y - h, w * 3, h * 3);
  }

  function drawBuilding(px, gy, width, height, floors, opts) {
    const x = sx(px);
    const body = ctx.createLinearGradient(0, gy - height, 0, gy);
    body.addColorStop(0, opts.top || '#273b48');
    body.addColorStop(1, opts.bottom || '#16232c');
    ctx.fillStyle = body;
    ctx.fillRect(x, gy - height, width, height);
    ctx.fillStyle = 'rgba(220,238,242,.09)';
    ctx.fillRect(x, gy - height, width, 3);
    const cols = opts.cols || Math.max(3, Math.floor(width / 42));
    const rows = floors || 3;
    const warm = opts.warm || 'rgba(255,214,150,.65)';
    const cool = 'rgba(143,232,255,.16)';
    for (let f = 0; f < rows; f++) {
      for (let c = 0; c < cols; c++) {
        const wx = x + 14 + c * ((width - 28) / cols);
        const wy = gy - height + 22 + f * ((height - 38) / rows);
        const on = (c * 3 + f * 5 + Math.floor(px)) % 7 < 3;
        ctx.fillStyle = on ? warm : cool;
        ctx.fillRect(wx, wy, Math.min(12, (width - 28) / cols - 6), 8);
        if (on) windowGlow(wx, wy, 12, 8, 'rgba(255,196,110,.10)');
      }
    }
    if (opts.sign) {
      const tw = Math.min(width * .5, 220);
      ctx.fillStyle = 'rgba(5,12,18,.55)';
      roundRect(ctx, x + width / 2 - tw / 2, gy - height + 8, tw, 24, 5); ctx.fill();
      ctx.fillStyle = 'rgba(242,226,190,.9)';
      ctx.font = '600 15px "Songti SC","STSong",serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.sign, x + width / 2, gy - height + 25);
    }
    if (opts.banner) {
      ctx.fillStyle = '#8f2a25';
      ctx.fillRect(x + width * .18, gy - height + 40, width * .64, 16);
      ctx.fillStyle = 'rgba(255,232,190,.9)';
      ctx.font = '600 10px "Songti SC","STSong",serif';
      ctx.textAlign = 'center';
      ctx.fillText(opts.banner, x + width / 2, gy - height + 52);
    }
  }

  function drawDistant(z) {
    const gy = groundY();
    const cam = state.camera * .42;
    const blocks = [
      [80, 120, 170], [460, 150, 210], [1050, 170, 150], [1700, 210, 190],
      [2700, 190, 160], [3900, 150, 205], [5200, 230, 175], [6500, 180, 150],
      [7400, 240, 195], [8900, 170, 145], [10100, 210, 180], [11300, 260, 210]
    ];
    for (const [wx, bh, bw] of blocks) {
      const x = wx - cam;
      if (x + bw < -20 || x > W() + 20) continue;
      ctx.fillStyle = 'rgba(16, 31, 41, .62)';
      ctx.fillRect(x, gy - bh, bw, bh);
      ctx.fillStyle = 'rgba(200, 228, 236, .08)';
      ctx.fillRect(x, gy - bh, bw, 2);
      for (let r = 0; r < Math.floor(bh / 34); r++) {
        for (let c = 0; c < Math.floor(bw / 26); c++) {
          if ((r * 3 + c * 5 + wx) % 7 > 4) continue;
          ctx.fillStyle = 'rgba(255, 206, 140, .2)';
          ctx.fillRect(x + 9 + c * 26, gy - bh + 14 + r * 34, 8, 6);
        }
      }
    }
    // 远景雪松
    for (let i = 0; i < 14; i++) {
      const x = (i * 233 + 90 - cam) % (W() + 300) - 150;
      drawPine(x, gy - 2, .32 + (i % 3) * .08);
    }
  }

  function drawProps(z) {
    const gy = groundY();
    // 路灯
    const lamps = {
      gate: [420, 980, 1400], teaching: [1620, 2300, 3000, 3560], admin: [3760, 4900],
      dorm: [5180, 6500], canteen: [6880, 8100], playground: [8420, 9300, 10300], library: [10720, 11800, 12400]
    }[z.id] || [];
    for (const wx of lamps) {
      const x = sx(wx);
      if (x < -60 || x > W() + 60) continue;
      ctx.strokeStyle = 'rgba(215,235,238,.32)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy - 112); ctx.stroke();
      ctx.fillStyle = 'rgba(255,232,190,.88)';
      ctx.beginPath(); ctx.arc(x, gy - 114, 4, 0, Math.PI * 2); ctx.fill();
      windowGlow(x - 16, gy - 130, 32, 26, 'rgba(255,220,160,.16)');
    }
    // 长椅
    const benches = { gate: [1080], teaching: [2100, 3300], admin: [4400], dorm: [5900], library: [11000, 12000] }[z.id] || [];
    for (const wx of benches) {
      const x = sx(wx);
      ctx.fillStyle = 'rgba(96, 70, 48, .8)';
      ctx.fillRect(x, gy - 22, 52, 6);
      ctx.fillRect(x + 3, gy - 34, 46, 6);
      ctx.fillStyle = 'rgba(40, 32, 26, .8)';
      ctx.fillRect(x + 5, gy - 18, 4, 18); ctx.fillRect(x + 43, gy - 18, 4, 18);
    }
    // 雪堆
    for (let i = 0; i < 7; i++) {
      const x = sx(90 + i * (z.w / 7) + 40);
      ctx.fillStyle = 'rgba(236, 248, 250, .12)';
      ctx.beginPath(); ctx.ellipse(x, gy + 2, 26 + (i % 3) * 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawScenery(z, t) {
    const gy = groundY(), w = W();
    if (z.id === 'gate') {
      // 校门
      const gx = sx(120);
      ctx.fillStyle = '#d8e3e2';
      for (const px of [gx, gx + 260]) {
        ctx.fillRect(px, gy - 150, 18, 150);
        ctx.beginPath(); ctx.arc(px + 9, gy - 156, 10, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#26343c';
      ctx.fillRect(gx - 8, gy - 132, 302, 24);
      ctx.fillStyle = 'rgba(242,226,190,.95)';
      ctx.font = '600 20px "Songti SC","STSong",serif';
      ctx.textAlign = 'center';
      ctx.fillText('邵 东 三 中', gx + 144, gy - 114);
      ctx.fillStyle = '#8f2a25';
      ctx.fillRect(gx + 26, gy - 100, 240, 18);
      ctx.fillStyle = '#ffe8c0';
      ctx.font = '600 9px "Songti SC",serif';
      ctx.fillText('求真 · 扬善 · 尚美', gx + 146, gy - 87);
      // 旗杆
      const fx = sx(690);
      ctx.strokeStyle = 'rgba(220,235,238,.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(fx, gy); ctx.lineTo(fx, gy - 220); ctx.stroke();
      ctx.fillStyle = 'rgba(180, 40, 36, .82)';
      ctx.beginPath(); ctx.moveTo(fx + 1, gy - 218); ctx.lineTo(fx + 54, gy - 205); ctx.lineTo(fx + 1, gy - 188); ctx.closePath(); ctx.fill();
      // 双塘
      for (const px of [480, 1150]) {
        const px2 = sx(px);
        ctx.fillStyle = 'rgba(120, 196, 212, .18)';
        ctx.beginPath(); ctx.ellipse(px2, gy - 4, 90, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(220,245,250,.16)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(px2, gy - 4, 90, 16, 0, 0, Math.PI * 2); ctx.stroke();
      }
      // 收发室
      drawBuilding(1330, gy, 120, 64, 1, { top: '#2c3a40', bottom: '#1a262c', cols: 2, sign: '收发室' });
    } else if (z.id === 'teaching') {
      drawBuilding(1580, gy, 1900, 210, 3, { top: '#40545e', bottom: '#1d2c34', cols: 15, sign: '逸 夫 楼', banner: '少年当有凌云志 · 万里长空竞风流' });
      // 走廊与蓝窗帘
      for (let i = 0; i < 10; i++) {
        const x = sx(1650 + i * 180);
        ctx.fillStyle = 'rgba(44,92,116,.62)';
        ctx.fillRect(x, gy - 120, 16, 82);
        ctx.fillStyle = 'rgba(220,240,245,.28)';
        ctx.fillRect(x + 18, gy - 120, 10, 82);
      }
      // 树与自行车
      for (let i = 0; i < 4; i++) {
        const x = sx(1700 + i * 430);
        drawPine(x, gy - 6, .7 + i * .08);
      }
      ctx.strokeStyle = 'rgba(200,225,230,.28)'; ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const x = sx(3300 + i * 20);
        ctx.beginPath(); ctx.arc(x, gy - 20, 9, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (z.id === 'admin') {
      drawBuilding(3780, gy, 1120, 180, 3, { top: '#4a3a34', bottom: '#241c1a', cols: 9, sign: '求 真 楼' });
      // 公告栏
      const bx = sx(4580);
      ctx.fillStyle = '#3a2b22'; ctx.fillRect(bx, gy - 96, 120, 70);
      ctx.fillStyle = '#26333a'; ctx.fillRect(bx + 6, gy - 90, 108, 58);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(235,238,230,.75)'; ctx.fillRect(bx + 14 + (i % 2) * 50, gy - 82 + Math.floor(i / 2) * 24, 38, 16); }
      // 时钟
      const cx = sx(4700);
      ctx.fillStyle = 'rgba(240,244,238,.8)';
      ctx.beginPath(); ctx.arc(cx, gy - 150, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#26343a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, gy - 150); ctx.lineTo(cx, gy - 158); ctx.moveTo(cx, gy - 150); ctx.lineTo(cx + 5, gy - 147); ctx.stroke();
    } else if (z.id === 'dorm') {
      drawBuilding(5200, gy, 1450, 260, 4, { top: '#4a5560', bottom: '#202a32', cols: 12, sign: '学 生 公 寓' });
      // 阳台、栏杆、晾晒
      for (let f = 0; f < 4; f++) {
        const y = gy - 210 + f * 52;
        ctx.fillStyle = 'rgba(215,214,200,.18)';
        ctx.fillRect(sx(5230), y + 30, 1390, 5);
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = 'rgba(215,214,200,.16)';
          ctx.fillRect(sx(5245 + i * 68), y + 35, 2, 13);
        }
        for (let i = 0; i < 6; i++) {
          const colors = ['rgba(228,226,214,.8)', 'rgba(47,95,134,.8)', 'rgba(163,58,52,.8)', 'rgba(59,109,90,.8)'];
          ctx.fillStyle = colors[(i + f) % 4];
          ctx.fillRect(sx(5300 + i * 220), y + 12, 24, 24);
        }
      }
      for (let i = 0; i < 5; i++) drawPine(sx(5150 + i * 330), gy - 6, .5);
    } else if (z.id === 'canteen') {
      drawBuilding(6900, gy, 1150, 120, 1, { top: '#5a5148', bottom: '#2b2220', cols: 10, sign: '三 中 食 堂' });
      // 雨棚
      ctx.fillStyle = 'rgba(214,200,172,.35)';
      ctx.fillRect(sx(6940), gy - 136, 1050, 10);
      ctx.fillStyle = 'rgba(255,190,100,.12)';
      ctx.fillRect(sx(7000), gy - 120, 900, 76);
      // 蒸汽
      ctx.save();
      for (let i = 0; i < 7; i++) {
        const x = sx(7040 + i * 140) + Math.sin(t * .7 + i) * 12;
        const y = gy - 150 - ((t * 18 + i * 27) % 80);
        ctx.fillStyle = `rgba(240,240,232,${.05 + (i % 3) * .02})`;
        ctx.beginPath(); ctx.arc(x, y, 16 + i % 4 * 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      // 保温桶
      for (const px of [7100, 7900]) {
        ctx.fillStyle = 'rgba(214,200,172,.65)';
        ctx.fillRect(sx(px), gy - 34, 24, 34);
        ctx.fillStyle = 'rgba(43,49,52,.8)';
        ctx.fillRect(sx(px), gy - 38, 24, 5);
      }
    } else if (z.id === 'playground') {
      // 看台
      const gx = sx(10250);
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(93,102,104,.75)' : 'rgba(70,80,84,.75)';
        ctx.fillRect(gx, gy - 20 - i * 14, 300, 14);
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = ['rgba(47,95,134,.8)', 'rgba(138,50,48,.8)', 'rgba(211,201,168,.7)'][(i + k) % 3];
          ctx.fillRect(gx + 14 + k * 46, gy - 26 - i * 14, 22, 6);
        }
      }
      // 球门与旗
      ctx.strokeStyle = 'rgba(235,242,240,.7)'; ctx.lineWidth = 2;
      const goal = sx(9050);
      ctx.strokeRect(goal, gy - 54, 70, 54);
      const fx = sx(8720);
      ctx.strokeStyle = 'rgba(220,235,238,.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(fx, gy); ctx.lineTo(fx, gy - 190); ctx.stroke();
      ctx.fillStyle = 'rgba(180,40,36,.82)';
      ctx.beginPath(); ctx.moveTo(fx + 1, gy - 188); ctx.lineTo(fx + 48, gy - 176); ctx.lineTo(fx + 1, gy - 162); ctx.closePath(); ctx.fill();
      // 灯柱
      for (const px of [8600, 10100]) {
        ctx.strokeStyle = 'rgba(220,235,238,.35)';
        ctx.beginPath(); ctx.moveTo(sx(px), gy); ctx.lineTo(sx(px), gy - 150); ctx.stroke();
        ctx.fillStyle = 'rgba(255,232,190,.85)';
        ctx.beginPath(); ctx.arc(sx(px), gy - 152, 4, 0, Math.PI * 2); ctx.fill();
        windowGlow(sx(px) - 12, gy - 166, 24, 20, 'rgba(255,220,160,.14)');
      }
    } else if (z.id === 'library') {
      // 红门楼
      const gx = sx(10740);
      ctx.fillStyle = '#7d2a24';
      ctx.fillRect(gx, gy - 150, 14, 150);
      ctx.fillRect(gx + 210, gy - 150, 14, 150);
      ctx.fillStyle = '#2a1714';
      ctx.fillRect(gx - 8, gy - 142, 240, 18);
      ctx.fillStyle = 'rgba(244,220,166,.92)';
      ctx.font = '600 16px "Songti SC",serif'; ctx.textAlign = 'center';
      ctx.fillText('特 立 图 书 馆', gx + 110, gy - 126);
      drawBuilding(10820, gy, 1480, 230, 3, { top: '#4a4048', bottom: '#241f26', cols: 11, sign: '1956 · 求真 扬善 尚美' });
      // 暖光与书架
      for (let i = 0; i < 6; i++) {
        const x = sx(10880 + i * 230);
        ctx.fillStyle = 'rgba(255,206,140,.12)';
        ctx.fillRect(x, gy - 150, 130, 118);
        ctx.fillStyle = 'rgba(255,206,140,.5)';
        ctx.fillRect(x + 8, gy - 146, 114, 4);
        for (let k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(220,210,190,.18)'; ctx.fillRect(x + 12 + k * 26, gy - 134, 18, 70); }
      }
      for (let i = 0; i < 4; i++) drawPine(sx(10780 + i * 470), gy - 6, .45);
    }
  }

  function drawPine(x, gy, s) {
    ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(24, 45, 48, .85)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, -46 - i * 22);
      ctx.lineTo(-22 + i * 4, -8 - i * 18);
      ctx.lineTo(22 - i * 4, -8 - i * 18);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = 'rgba(220,240,242,.28)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, -50 - i * 22);
      ctx.lineTo(-9 + i * 3, -34 - i * 18);
      ctx.lineTo(9 - i * 3, -34 - i * 18);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawGround(z) {
    const w = W(), gy = groundY(), h = H();
    const g = ctx.createLinearGradient(0, gy, 0, h);
    if (z.id === 'playground') {
      g.addColorStop(0, '#7d332f');
      g.addColorStop(.24, '#5d2a27');
      g.addColorStop(1, '#241a1a');
    } else if (z.id === 'library' || z.id === 'admin') {
      g.addColorStop(0, '#9aa3a2');
      g.addColorStop(.3, '#67716f');
      g.addColorStop(1, '#20282a');
    } else {
      g.addColorStop(0, '#dbe8e8');
      g.addColorStop(.18, '#b9cdd0');
      g.addColorStop(.55, '#7e959a');
      g.addColorStop(1, '#26363c');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, gy, w, h - gy);
    if (z.id === 'playground') {
      const cx = sx(9500), cy = gy + 20;
      ctx.save();
      ctx.fillStyle = 'rgba(158,58,52,.65)';
      ctx.beginPath(); ctx.ellipse(cx, cy, 820, 124, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(52,92,60,.55)';
      ctx.beginPath(); ctx.ellipse(cx, cy, 680, 92, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(231,228,210,.38)'; ctx.lineWidth = 1.5;
      for (const r of [700, 760, 820]) { ctx.beginPath(); ctx.ellipse(cx, cy, r, r * .151, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,255,255,.52)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, 40, 8, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    // 路面
    if (z.id !== 'playground') {
      ctx.fillStyle = 'rgba(40, 55, 62, .18)';
      ctx.fillRect(0, gy + 34, w, 42);
      ctx.strokeStyle = 'rgba(235,248,248,.12)'; ctx.lineWidth = 1;
      for (let x = -state.camera % 70; x < w; x += 70) {
        ctx.beginPath(); ctx.moveTo(x, gy + 36); ctx.lineTo(x + 22, gy + 74); ctx.stroke();
      }
    }
    // 雪面高光
    ctx.fillStyle = 'rgba(245,252,252,.2)';
    for (let i = 0; i < 26; i++) {
      const x = (i * 137 - state.camera * .7) % (w + 120) - 60;
      ctx.beginPath(); ctx.ellipse(x, gy + 8 + (i % 5) * 7, 34, 3, -.05, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawPerson(x, gy, scale, p, opts) {
    const t = performance.now() / 1000;
    const walking = !!opts.walking;
    const phase = opts.phase || 0;
    const bob = walking ? Math.abs(Math.sin(phase)) * 2.2 : Math.sin(t * 1.7 + (opts.seed || 0)) * 1.2;
    const swing = walking ? Math.sin(phase) * 12 : 0;
    const coat = p.coat || '#2f5f8f';
    const trim = p.trim || '#eef1f4';
    const hair = p.hair || '#1c232c';
    const skin = p.skin || '#e0bd9e';
    ctx.save();
    ctx.translate(x, gy - bob);
    ctx.scale(scale * (opts.facing || 1), scale);
    // 影子
    ctx.fillStyle = 'rgba(3, 10, 14, .28)';
    ctx.beginPath(); ctx.ellipse(0, 1, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
    // 腿
    ctx.strokeStyle = '#1b252d'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6, -44); ctx.lineTo(-7 + swing, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -44); ctx.lineTo(7 - swing, -2); ctx.stroke();
    ctx.fillStyle = '#11181e';
    ctx.fillRect(-13 + swing, -5, 13, 5); ctx.fillRect(1 - swing, -5, 13, 5);
    // 身体
    const grad = ctx.createLinearGradient(-18, -108, 18, -48);
    grad.addColorStop(0, coat);
    grad.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = grad;
    roundRect(ctx, -19, -104, 38, 62, 10); ctx.fill();
    // 校服白边 / 领口
    ctx.fillStyle = trim;
    ctx.fillRect(-19, -104, 38, 7);
    ctx.beginPath(); ctx.moveTo(-9, -107); ctx.lineTo(0, -95); ctx.lineTo(9, -107); ctx.closePath(); ctx.fill();
    // 拉链与校牌
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -95); ctx.lineTo(0, -48); ctx.stroke();
    ctx.fillStyle = '#b43a32'; ctx.fillRect(8, -88, 6, 4);
    // 手臂
    ctx.strokeStyle = coat; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(-18, -96); ctx.lineTo(-23 - swing * .6, -58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(18, -96); ctx.lineTo(23 + swing * .6, -58); ctx.stroke();
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(-23 - swing * .6, -56, 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(23 + swing * .6, -56, 3.6, 0, Math.PI * 2); ctx.fill();
    // 头
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(0, -119, 15, 0, Math.PI * 2); ctx.fill();
    // 头发
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(0, -123, 16, Math.PI * 1.05, Math.PI * 2.05); ctx.fill();
    ctx.fillRect(-16, -124, 7, 16);
    // 眼睛
    ctx.fillStyle = '#202a33';
    ctx.beginPath(); ctx.arc(-5, -118, 1.7, 0, Math.PI * 2); ctx.arc(5, -118, 1.7, 0, Math.PI * 2); ctx.fill();
    // 围巾
    if (opts.scarf !== false) {
      ctx.fillStyle = p.accent || '#c94b45';
      ctx.fillRect(-18, -106, 36, 5);
      ctx.beginPath(); ctx.moveTo(10, -102); ctx.lineTo(18, -82 + Math.sin(t * 2.4) * 3); ctx.lineTo(12, -80); ctx.lineTo(7, -101); ctx.closePath(); ctx.fill();
    }
    // 配件
    const acc = opts.accessory || '';
    if (acc === 'glasses') {
      ctx.strokeStyle = 'rgba(20,28,34,.85)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(-5, -118, 5, 0, Math.PI * 2); ctx.arc(5, -118, 5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -118); ctx.lineTo(0, -118); ctx.stroke();
    } else if (acc === 'cap') {
      ctx.fillStyle = '#232c32';
      ctx.beginPath(); ctx.arc(0, -126, 15, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillRect(-16, -126, 34, 4);
    } else if (acc === 'apron') {
      ctx.fillStyle = 'rgba(240,236,224,.9)';
      ctx.fillRect(-15, -88, 30, 40);
      ctx.fillStyle = 'rgba(240,236,224,.9)';
      ctx.fillRect(-14, -126, 28, 6);
      ctx.fillRect(-4, -136, 8, 12);
    } else if (acc === 'headphones') {
      ctx.strokeStyle = '#202a33'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -124, 18, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.fillStyle = '#202a33'; ctx.fillRect(-21, -122, 6, 9); ctx.fillRect(15, -122, 6, 9);
    } else if (acc === 'armband') {
      ctx.fillStyle = '#b23a32'; ctx.fillRect(-25, -86, 10, 4);
    } else if (acc === 'headband') {
      ctx.fillStyle = '#d9d2b6'; ctx.fillRect(-16, -130, 32, 5);
    } else if (acc === 'longhair') {
      ctx.fillStyle = hair;
      ctx.beginPath(); ctx.moveTo(-15, -124); ctx.quadraticCurveTo(-26, -100, -18, -78); ctx.lineTo(-8, -82); ctx.lineTo(-12, -118); ctx.closePath(); ctx.fill();
    } else if (acc === 'notebook') {
      ctx.fillStyle = '#e7e3d6'; ctx.fillRect(20, -68, 11, 15);
      ctx.fillStyle = '#8a5a3a'; ctx.fillRect(20, -68, 11, 2);
    } else if (acc === 'backpack') {
      ctx.fillStyle = '#3a4a3a'; roundRect(ctx, -27, -100, 12, 38, 4); ctx.fill();
    }
    ctx.restore();
  }

  function drawSquirrel(x, gy) {
    const t = performance.now() / 1000;
    ctx.save(); ctx.translate(x, gy);
    ctx.fillStyle = 'rgba(3,10,14,.24)';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(154,106,66,.95)';
    ctx.beginPath(); ctx.ellipse(0, -12, 10, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -22, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(196,148,98,.9)';
    ctx.beginPath(); ctx.ellipse(-8, -16, 4, 9, .5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(196,148,98,.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-8, -12); ctx.quadraticCurveTo(-28, -22 + Math.sin(t * 2) * 3, -20, -38); ctx.stroke();
    ctx.fillStyle = '#1a2228';
    ctx.beginPath(); ctx.arc(8, -23, 1.2, 0, Math.PI * 2); ctx.fill();
    // 松果
    ctx.fillStyle = '#7a4a2a';
    ctx.beginPath(); ctx.ellipse(11, -12, 3.2, 4.2, .2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawNPCs(z) {
    const gy = groundY();
    const near = nearestTarget();
    for (const n of D.npcs) {
      if (n.zone !== z.id) continue;
      const x = sx(n.x);
      if (x < -100 || x > W() + 100) continue;
      const isNear = near && near.type === 'npc' && near.obj.id === n.id;
      if (n.special) { drawSquirrel(x, gy - 2); }
      else {
        const facing = state.player.x >= n.x ? 1 : -1;
        drawPerson(x, gy - 2, .94, n.palette, {
          accessory: n.accessory, scarf: n.accessory === 'scarf',
          walking: false, seed: n.x * .01, facing
        });
      }
      // 名字
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '10px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillStyle = isNear ? 'rgba(235,248,250,.95)' : 'rgba(220,238,242,.48)';
      ctx.fillText(n.name, x, gy - 148);
      // 任务标记
      const q = state.quests[n.id];
      if (!n.special && !(q && q.status === 'done')) {
        ctx.fillStyle = q && q.status === 'active' ? '#8fe8ff' : '#f2d49a';
        ctx.font = '600 13px "Songti SC",serif';
        ctx.fillText(q && q.status === 'active' ? '?' : '!', x, gy - 162);
      }
      ctx.restore();
    }
  }

  function drawPlayer() {
    const p = state.player;
    const gy = groundY();
    const walking = Math.abs(p.vx) > 30 && p.onGround;
    if (p.onGround) {
      // 脚印
      if (walking && Math.random() < .18) {
        footprints.push({ x: p.x - p.facing * 8, y: gy + 2, life: 1.6 });
      }
      ctx.fillStyle = 'rgba(5,12,18,.28)';
      ctx.beginPath(); ctx.ellipse(sx(p.x), gy + 1, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    drawPerson(sx(p.x), gy - p.y, 1, {
      coat: '#2b4f78', trim: '#e9eef2', hair: '#1b222a', skin: '#e4c0a0', accent: '#c94b45'
    }, {
      accessory: 'backpack', walking, phase: p.walk, facing: p.facing, seed: 0
    });
    // 跳跃时的高度阴影
    if (!p.onGround) {
      ctx.fillStyle = 'rgba(5,12,18,.2)';
      ctx.beginPath(); ctx.ellipse(sx(p.x), gy + 1, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  const snow = [], footprints = [];
  for (let i = 0; i < 240; i++) snow.push({ x: Math.random(), y: Math.random(), s: .4 + Math.random() * 1.7, v: .3 + Math.random() * .7, w: Math.random() * 6 });

  function drawWeather(dt) {
    const w = W(), h = H();
    ctx.save();
    ctx.fillStyle = 'rgba(235,250,255,.65)';
    for (const f of snow) {
      f.y += dt * .035 * f.v;
      f.x += Math.sin(performance.now() * .0007 + f.w) * .0004;
      if (f.y > 1) { f.y = 0; f.x = Math.random(); }
      if (f.x > 1) f.x -= 1; if (f.x < 0) f.x += 1;
      ctx.globalAlpha = .22 + f.s * .2;
      ctx.beginPath(); ctx.arc(f.x * w, f.y * h, f.s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // 脚印消退
    for (let i = footprints.length - 1; i >= 0; i--) {
      const fp = footprints[i];
      fp.life -= dt;
      if (fp.life <= 0) { footprints.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(40,60,68,${fp.life * .14})`;
      ctx.beginPath(); ctx.ellipse(sx(fp.x), fp.y, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawLights(z) {
    const gy = groundY();
    // 灯柱/窗户光
    if (z.id === 'teaching' || z.id === 'library' || z.id === 'canteen') {
      const x = sx(state.player.x) + Math.sin(performance.now() * .0002) * 20;
      const g = ctx.createRadialGradient(x, gy - 120, 10, x, gy - 120, 260);
      g.addColorStop(0, 'rgba(255,214,150,.05)');
      g.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 300, gy - 420, 600, 460);
    }
  }

  /* ---------- 交互 ---------- */
  const RELIC_RADIUS = 68;
  function keyLevel() { return relicLevel('key'); }
  function hourglassLevel() { return relicLevel('hourglass'); }
  function shardCount(type) { return D.shards.filter(s => s.type === type && state.shards[s.id]).length; }
  function relicLevel(id) {
    if (!state.relics[id]) return 0;
    const type = id === 'hourglass' ? 'sand' : 'page';
    const n = shardCount(type);
    return 1 + (n >= 1 ? 1 : 0) + (n >= 3 ? 1 : 0);
  }
  function interactRadius() { return 118 + keyLevel() * 20; }

  function nearestTarget() {
    const px = state.player.x;
    let best = null, bd = Infinity;
    const consider = (type, obj, x, r) => {
      const d = Math.abs(px - x);
      if (d < r && d < bd) { bd = d; best = { type, obj, dist: d }; }
    };
    for (const n of D.npcs) if (n.zone === state.zoneId) consider('npc', n, n.x, interactRadius());
    for (const egg of D.eggs) if (egg.zone === state.zoneId) consider('egg', egg, egg.x, 96);
    for (const relic of D.artifacts) {
      if (state.relics[relic.id] || relic.zone !== state.zoneId) continue;
      consider('relic', relic, relic.x, RELIC_RADIUS + keyLevel() * 8);
    }
    for (const sh of D.shards) {
      if (state.shards[sh.id] || sh.zone !== state.zoneId) continue;
      consider('shard', sh, sh.x, 62);
    }
    return best;
  }

  function updatePrompt() {
    if (state.dialogue || state.riddleRelic || state.panel) { $('prompt').classList.add('hidden'); return; }
    const near = nearestTarget();
    if (!near) { $('prompt').classList.add('hidden'); return; }
    let text = '';
    if (near.type === 'npc') text = `与 ${near.obj.name} 交谈`;
    else if (near.type === 'relic') text = near.obj.prompt;
    else if (near.type === 'shard') text = `拾取 ${near.obj.name}`;
    else if (near.type === 'egg') text = `查看 ${near.obj.name}`;
    $('promptText').textContent = text;
    $('prompt').classList.remove('hidden');
  }

  function interact() {
    const now = performance.now();
    if (now - lastInteractAt < 180) return;
    lastInteractAt = now;
    if (state.dialogue || state.riddleRelic || state.panel) return;
    const near = nearestTarget();
    if (!near) { audio.blip(300); return; }
    if (near.type === 'npc') openNpc(near.obj);
    else if (near.type === 'relic') openRiddle(near.obj);
    else if (near.type === 'shard') collectShard(near.obj);
    else if (near.type === 'egg') inspectEgg(near.obj);
  }

  /* ---------- 对话 ---------- */
  function drawPortrait(npc) {
    const c = $('portrait'), g = c.getContext('2d');
    g.clearRect(0, 0, 220, 220);
    const grad = g.createRadialGradient(110, 78, 8, 110, 100, 120);
    grad.addColorStop(0, 'rgba(143,232,255,.14)');
    grad.addColorStop(1, 'rgba(5,15,22,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 220, 220);
    const pal = npc.palette || {};
    g.save(); g.translate(110, 214); g.scale(1.55, 1.55);
    g.fillStyle = 'rgba(3,10,14,.24)';
    g.beginPath(); g.ellipse(0, 1, 22, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = pal.coat || '#2f5f8f';
    roundRect(g, -19, -104, 38, 62, 10); g.fill();
    g.fillStyle = pal.trim || '#eef1f4'; g.fillRect(-19, -104, 38, 7);
    g.beginPath(); g.moveTo(-9, -107); g.lineTo(0, -95); g.lineTo(9, -107); g.closePath(); g.fill();
    g.fillStyle = pal.skin || '#e0bd9e';
    g.beginPath(); g.arc(0, -119, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = pal.hair || '#1c232c';
    g.beginPath(); g.arc(0, -123, 16, Math.PI * 1.05, Math.PI * 2.05); g.fill();
    g.fillRect(-16, -124, 7, 16);
    g.fillStyle = '#202a33';
    g.beginPath(); g.arc(-5, -118, 1.7, 0, Math.PI * 2); g.arc(5, -118, 1.7, 0, Math.PI * 2); g.fill();
    const acc = npc.accessory;
    if (acc === 'glasses') {
      g.strokeStyle = 'rgba(20,28,34,.85)'; g.lineWidth = 1.2;
      g.beginPath(); g.arc(-5, -118, 5, 0, Math.PI * 2); g.arc(5, -118, 5, 0, Math.PI * 2); g.stroke();
    } else if (acc === 'cap') {
      g.fillStyle = '#232c32'; g.beginPath(); g.arc(0, -126, 15, Math.PI, Math.PI * 2); g.fill(); g.fillRect(-16, -126, 34, 4);
    } else if (acc === 'headphones') {
      g.strokeStyle = '#202a33'; g.lineWidth = 3;
      g.beginPath(); g.arc(0, -124, 18, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
      g.fillStyle = '#202a33'; g.fillRect(-21, -122, 6, 9); g.fillRect(15, -122, 6, 9);
    } else if (acc === 'apron') {
      g.fillStyle = 'rgba(240,236,224,.9)'; g.fillRect(-15, -88, 30, 40); g.fillRect(-14, -126, 28, 6);
    } else if (acc === 'armband') {
      g.fillStyle = '#b23a32'; g.fillRect(-25, -86, 10, 4);
    } else if (acc === 'longhair') {
      g.fillStyle = pal.hair || '#1c232c';
      g.beginPath(); g.moveTo(-15, -124); g.quadraticCurveTo(-26, -100, -18, -78); g.lineTo(-8, -82); g.lineTo(-12, -118); g.closePath(); g.fill();
    }
    g.restore();
  }

  function showDialogue(npc, text, choices) {
    state.dialogue = { npc, full: text, shown: 0, choices: choices || [], done: false };
    state.dlgDone = false;
    $('dialogue').classList.remove('hidden');
    $('dlgName').textContent = npc.name;
    $('dlgRole').textContent = npc.role || '';
    $('dlgText').textContent = '';
    $('dlgChoices').innerHTML = '';
    drawPortrait(npc);
    audio.blip(520);
  }
  function completeTyping() {
    if (!state.dialogue) return;
    state.dialogue.shown = state.dialogue.full.length;
    $('dlgText').textContent = state.dialogue.full;
    renderChoices();
  }
  function renderChoices() {
    if (!state.dialogue) return;
    const box = $('dlgChoices');
    box.innerHTML = '';
    for (const ch of state.dialogue.choices) {
      const b = document.createElement('button');
      b.textContent = ch.text;
      b.onclick = () => { audio.blip(720); ch.action(); };
      box.appendChild(b);
    }
  }
  function closeDialogue() {
    state.dialogue = null;
    $('dialogue').classList.add('hidden');
    $('prompt').classList.add('hidden');
  }

  function openNpc(npc) {
    if (!state.talked[npc.id]) {
      state.talked[npc.id] = true;
      unlock('talker');
      if (Object.keys(state.talked).filter(id => id !== 'squirrel').length >= 12) unlock('social');
      save();
    }
    if (npc.special) {
      unlock('squirrel');
      audio.chime();
      showDialogue(npc, npc.line, [{ text: '摸摸它', action: () => { showDialogue(npc, npc.after, [{ text: '离开', action: closeDialogue }]); } }, { text: '离开', action: closeDialogue }]);
      return;
    }
    const qs = state.quests[npc.id];
    const choices = [];
    // 其他 NPC 的 talk 委托
    const pending = Object.keys(state.quests).map(id => ({ id, q: state.quests[id], giver: D.npcs.find(n => n.id === id) })).filter(x => x.q.status === 'active' && x.giver && x.giver.quest && x.giver.quest.type === 'talk' && x.giver.quest.target === npc.id);
    if (pending.length) {
      choices.push({
        text: `说明来意（${pending[0].giver.name}的委托）`,
        action: () => { closeDialogue(); completeQuest(pending[0].giver); }
      });
    }
    if (!qs) {
      const q = npc.quest;
      if (q) {
        choices.push({ text: `接下委托：${q.title}`, action: () => { closeDialogue(); acceptQuest(npc); } });
        choices.push({ text: '只是路过', action: closeDialogue });
      } else choices.push({ text: '离开', action: closeDialogue });
      showDialogue(npc, npc.line, choices);
    } else if (qs.status === 'active') {
      if (npc.quest.type === 'answer') {
        choices.push({ text: '再答一次', action: () => { closeDialogue(); askQuestion(npc); } });
      }
      choices.push({ text: '继续走走', action: closeDialogue });
      showDialogue(npc, `委托进行中：${npc.quest.objective}`, choices);
    } else {
      if (npc.clue) addClue(npc.clue);
      choices.push({ text: '离开', action: closeDialogue });
      showDialogue(npc, npc.after || npc.line, choices);
    }
  }

  function acceptQuest(npc) {
    const q = npc.quest;
    if (!q) return;
    state.quests[npc.id] = { status: 'active' };
    if (q.type === 'answer') { askQuestion(npc); save(); return; }
    toast(`委托已接取：${q.title}`, 'gold');
    audio.chime();
    if (q.type === 'visit') {
      const z = zones.find(x => x.id === q.zone);
      if (z) toast(`目标：${q.objective}`, '');
    }
    save();
  }

  function askQuestion(npc) {
    const q = npc.quest;
    const choices = q.options.map((opt, i) => ({
      text: opt,
      action: () => {
        if (i === q.correct) {
          closeDialogue();
          completeQuest(npc);
        } else {
          showDialogue(npc, '不对。再想想，答案就在你走过的校园里。', [
            { text: '再试一次', action: () => { closeDialogue(); setTimeout(() => askQuestion(npc), 120); } },
            { text: '先离开', action: closeDialogue }
          ]);
          audio.blip(240);
        }
      }
    }));
    choices.push({ text: '先不答', action: closeDialogue });
    showDialogue(npc, q.question, choices);
  }

  function completeQuest(npc) {
    if (!npc || !npc.quest) return;
    const q = npc.quest;
    state.quests[npc.id] = { status: 'done' };
    state.mood = clamp(state.mood + (q.rewardMood || 8), 0, 100);
    if (q.type === 'answer') unlock('answer');
    if (npc.clue) addClue(npc.clue);
    save();
    audio.chime();
    toast(`委托完成：${q.title} · 心情 +${q.rewardMood || 8}`, 'gold');
    const follow = npc.clue ? `${npc.after || ''}\n\n线索：${npc.clue}` : (npc.after || '');
    showDialogue(npc, follow, [{ text: '离开', action: closeDialogue }]);
  }

  function completeQuestById(giverId) {
    const giver = D.npcs.find(n => n.id === giverId);
    if (giver) completeQuest(giver);
  }

  function addClue(text) {
    if (!text || state.clues.includes(text)) return;
    state.clues.push(text);
    state.clues = state.clues.slice(-8);
    save();
  }

  /* ---------- 神物与碎片 ---------- */
  function openRiddle(relic) {
    state.riddleRelic = relic;
    $('riddle').classList.remove('hidden');
    $('riddleTitle').textContent = relic.name;
    $('riddleText').textContent = relic.prompt + '\n' + relic.riddle;
    $('riddleHint').textContent = '线索：' + relic.hint;
    $('riddleInput').value = '';
    setTimeout(() => $('riddleInput').focus(), 60);
    audio.blip(480);
  }
  function closeRiddle() {
    state.riddleRelic = null;
    $('riddle').classList.add('hidden');
  }
  function normalize(s) {
    return String(s || '').toLowerCase().replace(/[\s\-_.·,，。:：]/g, '').replace(/月/g, '').replace(/日/g, '').replace(/号/g, '');
  }
  function submitRiddle() {
    const relic = state.riddleRelic;
    if (!relic) return;
    const value = normalize($('riddleInput').value);
    if (!value) { $('riddleHint').textContent = '先写下答案。'; return; }
    const ok = relic.answers.some(a => normalize(a) === value);
    if (!ok) {
      $('riddleHint').textContent = '答案不对。' + relic.hint;
      audio.blip(220);
      $('riddle').animate([{ transform: 'translate(-50%,-50%) translateX(-6px)' }, { transform: 'translate(-50%,-50%) translateX(6px)' }, { transform: 'translate(-50%,-50%)' }], { duration: 220 });
      return;
    }
    state.relics[relic.id] = true;
    closeRiddle();
    unlock(relic.id);
    if (state.relics.hourglass && state.relics.key) unlock('pair');
    audio.chime();
    toast(`获得神物：${relic.name} · ${relic.effect}`, 'gold');
    save();
    if (relic.id === 'hourglass') state.mood = clamp(state.mood + 10, 0, 100);
  }
  function collectShard(sh) {
    state.shards[sh.id] = true;
    audio.chime();
    toast(`拾取 ${sh.name} · ${shardCount(sh.type)} / 3`, 'gold');
    const relicId = sh.type === 'sand' ? 'hourglass' : 'key';
    if (state.relics[relicId]) {
      const lv = relicLevel(relicId);
      toast(`${D.artifacts.find(r => r.id === relicId).name} 提升至 Lv.${lv}`, 'gold');
    }
    if (D.shards.every(s => state.shards[s.id])) unlock('shards');
    save();
  }
  function inspectEgg(egg) {
    if (egg.achievement) unlock(egg.achievement);
    audio.blip(600);
    showDialogue({ name: egg.name, role: '校园 · 角落', palette: {}, accessory: '' }, egg.prompt, [{ text: '离开', action: closeDialogue }]);
  }

  function toast(text, cls) {
    const box = $('toast');
    if (!box) return;
    const el = document.createElement('div');
    if (cls) el.className = cls;
    el.textContent = text;
    box.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(-6px)'; el.style.transition = '.4s'; }, 2600);
    setTimeout(() => el.remove(), 3100);
  }

  /* ---------- 成就 ---------- */
  function unlock(id) {
    if (state.ach[id]) return;
    const a = D.achievements.find(x => x.id === id);
    if (!a) return;
    state.ach[id] = true;
    $('achSeal').textContent = a.seal;
    $('achName').textContent = a.name;
    $('achDesc').textContent = a.desc;
    $('achToast').classList.remove('hidden');
    clearTimeout(unlock._timer);
    unlock._timer = setTimeout(() => $('achToast').classList.add('hidden'), 3600);
    save();
  }
  function checkZoneAchievements() {
    if (namedZones.every(id => state.visited[id])) unlock('walker');
  }

  /* ---------- 区域进入 ---------- */
  function enterZone(z) {
    state.zoneId = z.id;
    if (!state.visited[z.id]) {
      state.visited[z.id] = true;
      checkZoneAchievements();
      save();
    }
    // visit 委托
    for (const npc of D.npcs) {
      const q = state.quests[npc.id];
      if (q && q.status === 'active' && npc.quest && npc.quest.type === 'visit' && npc.quest.zone === z.id) {
        setTimeout(() => { if (state.quests[npc.id] && state.quests[npc.id].status === 'active') completeQuest(npc); }, 600);
      }
    }
    $('zoneNow').textContent = z.name;
    if (state.lastZoneBanner !== z.id) {
      state.lastZoneBanner = z.id;
      $('zoneBannerName').textContent = z.name;
      $('zoneBannerDesc').textContent = z.desc;
      $('zoneBanner').classList.add('show');
      clearTimeout(enterZone._t);
      enterZone._t = setTimeout(() => $('zoneBanner').classList.remove('show'), 3600);
      audio.zoneChanged(z.id);
      audio.blip(520);
    }
  }

  /* ---------- 面板 ---------- */
  function openPanel(kind) {
    if (state.dialogue || state.riddleRelic) return;
    state.panel = kind;
    $('panel').classList.remove('hidden');
    renderPanel();
    audio.blip(600);
  }
  function closePanel() {
    state.panel = null;
    $('panel').classList.add('hidden');
  }
  function renderPanel() {
    const kind = state.panel;
    const title = { map: '校园地图', ach: '心录 · 成就', relic: '神物 · 线索', help: '操作与说明' }[kind] || '三中';
    const eyebrow = { map: '六区连通 · 无需加载', ach: '足迹会留下来', relic: '容易到达 · 不容易发现', help: '没有强制任务' }[kind] || '';
    $('panelTitle').textContent = title;
    $('panelEyebrow').textContent = eyebrow;
    let html = '';
    if (kind === 'map') {
      html = `<div class="zone-list">${zones.map(z => {
        const qActive = Object.keys(state.quests).filter(id => { const q = state.quests[id]; const n = D.npcs.find(x => x.id === id); return q.status === 'active' && n && n.quest && n.quest.zone === z.id; }).length;
        return `<div class="zone-row ${state.visited[z.id] ? 'visited' : ''}"><i></i><b>${z.name}</b><p>${z.desc}</p><span>${state.visited[z.id] ? '已到访' : '未到访'}${qActive ? ' · 委托 ' + qActive : ''}</span></div>`;
      }).join('')}</div>
      <div class="clue-list"><span>当前位置：${zoneAt(state.player.x).name}</span><span>已走遍 ${namedZones.filter(id => state.visited[id]).length} / 6 个区域</span></div>`;
    } else if (kind === 'ach') {
      const got = D.achievements.filter(a => state.ach[a.id]).length;
      html = `<p class="muted">已解锁 ${got} / ${D.achievements.length}</p><div class="ach-grid">${D.achievements.map(a => `<div class="ach-card ${state.ach[a.id] ? '' : 'locked'}"><i>${state.ach[a.id] ? a.seal : '？'}</i><b>${state.ach[a.id] ? a.name : '未写下'}</b><p>${state.ach[a.id] ? a.desc : '还没有触发。'}</p></div>`).join('')}</div>`;
    } else if (kind === 'relic') {
      html = D.artifacts.map(r => {
        const owned = state.relics[r.id];
        const lv = owned ? relicLevel(r.id) : 0;
        const n = shardCount(r.shardId);
        return `<div class="relic-card"><h3>${r.name} ${owned ? '<span class="lv">Lv.' + lv + '</span>' : '<span class="lv">未获得</span>'}</h3>
          <p>${owned ? r.effect : '隐藏在校园里。' + r.hint}</p>
          <p class="lv">${r.shardName} ${n} / 3 · ${owned ? '等级随碎片提升' : '先找到它，再回答谜题'}</p></div>`;
      }).join('') + `<div class="clue-list">${state.clues.length ? state.clues.map(c => `<span>${c}</span>`).join('') : '<span>还没有收集到线索。和校园里的人聊聊。</span>'}</div>`;
    } else {
      html = `<div class="help-grid">
        <span><kbd>A</kbd><kbd>D</kbd> / 方向键 · 移动</span>
        <span><kbd>Shift</kbd> · 加速跑（消耗体力）</span>
        <span><kbd>Space</kbd> · 跳跃</span>
        <span><kbd>E</kbd> · 交谈 / 拾取 / 查看</span>
        <span><kbd>M</kbd> · 校园地图</span>
        <span><kbd>J</kbd> · 成就</span>
        <span><kbd>K</kbd> · 神物与线索</span>
        <span><kbd>Esc</kbd> · 关闭</span>
      </div><div class="clue-list"><span>没有任务栏，没有强制战斗。六个区域从左到右连通，走到哪里算哪里。</span><span>两件神物分别在操场看台最右边、图书馆闭架书库最里面。谜题答案藏在 NPC 的线索里。</span></div>`;
    }
    $('panelBody').innerHTML = html;
  }

  /* ---------- 小地图 ---------- */
  function drawMinimap() {
    const w = mini.width, h = mini.height;
    mctx.clearRect(0, 0, w, h);
    mctx.fillStyle = 'rgba(4, 12, 18, .42)';
    roundRect(mctx, 0, 0, w, h, 12); mctx.fill();
    zones.forEach((z, i) => {
      const x = z.x / worldW * w;
      const ww = z.w / worldW * w;
      mctx.fillStyle = state.visited[z.id] ? 'rgba(143,232,255,.34)' : 'rgba(210,238,248,.09)';
      mctx.fillRect(x + 2, 10, ww - 4, 34);
      mctx.strokeStyle = 'rgba(210,238,248,.12)';
      mctx.strokeRect(x + 2, 10, ww - 4, 34);
      mctx.fillStyle = 'rgba(235,246,248,.55)';
      mctx.font = '9px "PingFang SC",sans-serif'; mctx.textAlign = 'center';
      if (ww > 30) mctx.fillText(z.short, x + ww / 2, 31);
      if (z.id === state.zoneId) {
        mctx.fillStyle = 'rgba(143,232,255,.18)';
        mctx.fillRect(x + 2, 10, ww - 4, 34);
      }
    });
    // NPC 点
    if (keyLevel() >= 2) {
      for (const n of D.npcs) {
        if (n.special) continue;
        mctx.fillStyle = 'rgba(242,212,154,.6)';
        mctx.beginPath(); mctx.arc(n.x / worldW * w, 52, 1.6, 0, Math.PI * 2); mctx.fill();
      }
      for (const r of D.artifacts) {
        if (state.relics[r.id]) continue;
        mctx.fillStyle = 'rgba(199,166,255,.7)';
        mctx.beginPath(); mctx.arc(r.x / worldW * w, 60, 2, 0, Math.PI * 2); mctx.fill();
      }
    }
    // 玩家
    const px = state.player.x / worldW * w;
    mctx.fillStyle = '#fff';
    mctx.beginPath(); mctx.arc(px, 46, 3.2, 0, Math.PI * 2); mctx.fill();
    mctx.fillStyle = 'rgba(143,232,255,.9)';
    mctx.beginPath(); mctx.arc(px, 46, 5.4, 0, Math.PI * 2); mctx.strokeStyle = 'rgba(143,232,255,.9)'; mctx.lineWidth = 1; mctx.stroke();
  }

  /* ---------- 更新 ---------- */
  function update(dt) {
    const p = state.player;
    const canMove = !state.dialogue && !state.riddleRelic && !state.panel;
    const left = canMove && (keys.KeyA || keys.ArrowLeft || virtual.left);
    const right = canMove && (keys.KeyD || keys.ArrowRight || virtual.right);
    const sprint = canMove && (keys.ShiftLeft || keys.ShiftRight) && p.stamina > 1;
    const base = 245 * (1 + 0.08 * hourglassLevel());
    const target = (right ? 1 : 0) - (left ? 1 : 0);
    const speed = base * (sprint ? 1.65 : 1);
    p.vx = lerp(p.vx, target * speed, 1 - Math.pow(.001, dt));
    if (Math.abs(p.vx) < 2 && !target) p.vx = 0;
    if (target) p.facing = target > 0 ? 1 : -1;
    p.x = clamp(p.x + p.vx * dt, 40, worldW - 40);
    if (sprint && Math.abs(p.vx) > 40) p.stamina = clamp(p.stamina - dt * 17, 0, 100);
    else p.stamina = clamp(p.stamina + dt * 9, 0, 100);
    // 跳跃
    if (!p.onGround) p.vy += 1650 * dt;
    p.y -= p.vy * dt;
    if (p.y <= 0) { p.y = 0; p.vy = 0; p.onGround = true; }
    // 动画相位
    if (Math.abs(p.vx) > 30) p.walk += dt * (sprint ? 13 : 9);
    else p.walk += dt * 2;
    // 时间
    state.time += dt * .35;
    const z = zoneAt(p.x);
    if (z.id !== state.zoneId) enterZone(z);
    // 相机
    const targetCam = clamp(p.x - W() / 2, 0, Math.max(0, worldW - W()));
    state.camera = lerp(state.camera, targetCam, 1 - Math.pow(.0001, dt));
    // 对话打字
    if (state.dialogue) {
      const d = state.dialogue;
      if (d.shown < d.full.length) {
        d.shown = Math.min(d.full.length, d.shown + dt * 46);
        $('dlgText').textContent = d.full.slice(0, Math.floor(d.shown));
        if (d.shown >= d.full.length) renderChoices();
      }
    }
    audio.update(dt, Math.abs(p.vx) > 30 && p.onGround);
    // 自动存档
    update._save = (update._save || 0) + dt;
    if (update._save > 4) { update._save = 0; save(); }
    updateHUD();
    updatePrompt();
  }

  function updateHUD() {
    $('staminaBar').style.width = state.player.stamina + '%';
    $('moodBar').style.width = state.mood + '%';
    const mins = Math.floor(state.time % 1440);
    $('clockText').textContent = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  }

  function draw(dt) {
    const z = zoneAt(state.player.x);
    drawSky(z);
    drawFar(z);
    drawDistant(z);
    drawScenery(z, performance.now() / 1000);
    drawGround(z);
    drawProps(z);
    drawLights(z);
    drawNPCs(z);
    // 神物与碎片
    const t = performance.now() / 1000;
    for (const sh of D.shards) {
      if (state.shards[sh.id] || sh.zone !== z.id) continue;
      const d = Math.abs(state.player.x - sh.x);
      if (d > 240 && keyLevel() < 2) continue;
      const x = sx(sh.x), gy = groundY() - 6;
      const pulse = .5 + Math.sin(t * 3 + sh.x) * .3;
      const g = ctx.createRadialGradient(x, gy, 1, x, gy, 26);
      g.addColorStop(0, `rgba(255,230,170,${.5 * pulse})`);
      g.addColorStop(1, 'rgba(255,230,170,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, gy, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,240,200,${.6 + pulse * .3})`;
      ctx.beginPath(); ctx.moveTo(x, gy - 8); ctx.lineTo(x + 4, gy); ctx.lineTo(x, gy + 8); ctx.lineTo(x - 4, gy); ctx.closePath(); ctx.fill();
    }
    for (const r of D.artifacts) {
      if (state.relics[r.id] || r.zone !== z.id) continue;
      const d = Math.abs(state.player.x - r.x);
      if (d > 320 && keyLevel() < 2) continue;
      const x = sx(r.x), gy = groundY() - 8;
      const pulse = .5 + Math.sin(t * 2.2 + r.x) * .35;
      const g = ctx.createRadialGradient(x, gy, 2, x, gy, 46);
      g.addColorStop(0, `rgba(242,212,154,${.32 * pulse})`);
      g.addColorStop(1, 'rgba(242,212,154,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, gy, 46, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,240,200,${.35 + pulse * .25})`;
      ctx.beginPath(); ctx.arc(x, gy, 4, 0, Math.PI * 2); ctx.fill();
    }
    // 彩蛋
    for (const egg of D.eggs) {
      if (egg.zone !== z.id) continue;
      const x = sx(egg.x);
      if (x < -50 || x > W() + 50) continue;
      ctx.fillStyle = 'rgba(242,212,154,.25)';
      ctx.beginPath(); ctx.arc(x, groundY() - 36, 2.5 + Math.sin(t * 2) * .8, 0, Math.PI * 2); ctx.fill();
    }
    drawPlayer();
    drawWeather(dt);
    // 雪夜蓝调
    ctx.fillStyle = `rgba(8, 20, 34, ${nightAlpha() * .28})`;
    ctx.fillRect(0, 0, W(), H());
    drawMinimap();
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000 || .016);
    last = now;
    update(dt);
    draw(dt);
    requestAnimationFrame(loop);
  }

  /* ---------- 事件绑定 ---------- */
  $('welcomeClose').onclick = () => { $('welcome').classList.add('hidden'); state.started = true; audio.ensure(); save(); };
  $('dlgClose').onclick = closeDialogue;
  $('riddleClose').onclick = closeRiddle;
  $('riddleSubmit').onclick = submitRiddle;
  $('riddleInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitRiddle(); } });
  $('panelClose').onclick = closePanel;
  $('btnMap').onclick = () => openPanel('map');
  $('btnAch').onclick = () => openPanel('ach');
  $('btnRelic').onclick = () => openPanel('relic');
  $('btnAudio').onclick = () => {
    state.audioOn = !state.audioOn;
    audio.ensure(); audio.setOn(state.audioOn);
    $('btnAudio').classList.toggle('off', !state.audioOn);
    $('btnAudio').textContent = state.audioOn ? '声' : '静';
    save();
  };
  window.addEventListener('pointerdown', () => { if (!state.started) { state.started = true; audio.ensure(); } }, { once: false });
  window.addEventListener('blur', () => { keys.KeyA = keys.KeyD = keys.ArrowLeft = keys.ArrowRight = keys.ShiftLeft = keys.ShiftRight = false; });
  $('dialogue').addEventListener('click', e => { if (e.target.id === 'dlgText' || e.target.closest('.dlg-body')) { if (state.dialogue && state.dialogue.shown < state.dialogue.full.length) completeTyping(); } });

  /* ---------- 启动 ---------- */
  resize();
  const resumed = load();
  state.zoneId = zoneAt(state.player.x).id;
  state.camera = clamp(state.player.x - W() / 2, 0, Math.max(0, worldW - W()));
  $('btnAudio').classList.toggle('off', !state.audioOn);
  $('btnAudio').textContent = state.audioOn ? '声' : '静';
  // 头像
  (function drawAvatar() {
    const c = $('avatar'), g = c.getContext('2d');
    g.clearRect(0, 0, 128, 128);
    const bg = g.createRadialGradient(64, 42, 4, 64, 64, 70);
    bg.addColorStop(0, 'rgba(143,232,255,.16)'); bg.addColorStop(1, 'rgba(4,12,18,0)');
    g.fillStyle = bg; g.fillRect(0, 0, 128, 128);
    g.fillStyle = '#2b4f78'; roundRect(g, 38, 72, 52, 54, 12); g.fill();
    g.fillStyle = '#e9eef2'; g.fillRect(38, 72, 52, 8);
    g.fillStyle = '#e4c0a0'; g.beginPath(); g.arc(64, 50, 22, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1b222a'; g.beginPath(); g.arc(64, 45, 23, Math.PI * 1.03, Math.PI * 2.03); g.fill();
    g.fillRect(41, 45, 10, 22);
    g.fillStyle = '#202a33'; g.beginPath(); g.arc(57, 51, 2.4, 0, Math.PI * 2); g.arc(71, 51, 2.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c94b45'; g.fillRect(42, 76, 44, 6);
  })();
  if (resumed) toast('回到上次停留的地方', '');
  else unlock('enter');
  enterZone(zoneAt(state.player.x));
  state.lastZoneBanner = '';
  setTimeout(() => enterZone(zoneAt(state.player.x)), 30);
  window.__sandboxState = state;
  window.__sandbox = { state, interact, openPanel, collectShard, unlock, zoneAt, save };
  requestAnimationFrame(loop);
})();
