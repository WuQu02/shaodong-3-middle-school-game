/* 三中风云 — 基础工具 */
(function () {
  'use strict';

  const U = {
    clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
    lerp(a, b, t) { return a + (b - a) * t; },
    damp(a, b, lambda, dt) { return U.lerp(a, b, 1 - Math.exp(-lambda * dt)); },
    approach(v, target, step) {
      if (v < target) return Math.min(v + step, target);
      return Math.max(v - step, target);
    },
    easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); },
    easeInCubic(t) { return t * t * t; },
    easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); },
    easeInOutCubic(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    easeOutBack(t) { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    pingPong(t, len) { const m = t % (len * 2); return m < len ? m : len * 2 - m; },
    rand(a, b) { return a + Math.random() * (b - a); },
    randInt(a, b) { return Math.floor(U.rand(a, b + 1)); },
    choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); },
    dist2(x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; return dx * dx + dy * dy; },
    overlap(a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    },
    circleRect(cx, cy, r, rect) {
      const nx = U.clamp(cx, rect.x, rect.x + rect.w);
      const ny = U.clamp(cy, rect.y, rect.y + rect.h);
      return U.dist2(cx, cy, nx, ny) <= r * r;
    },
    sign(v) { return v < 0 ? -1 : v > 0 ? 1 : 0; },
    formatTime(sec) {
      sec = Math.max(0, Math.floor(sec));
      const m = Math.floor(sec / 60), s = sec % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    },
    fmtNum(n) { return String(Math.round(n)); },
    rgba(hex, a) {
      const h = hex.replace('#', '');
      const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    },
    hash(n) {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    },
    noise1(x) {
      const i = Math.floor(x), f = x - i;
      return U.lerp(U.hash(i), U.hash(i + 1), f * f * (3 - 2 * f));
    },
    fbm(x) {
      return U.noise1(x) * .55 + U.noise1(x * 2.17 + 11) * .28 + U.noise1(x * 4.31 + 37) * .17;
    },
    storageGet(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch (e) { return fallback; }
    },
    storageSet(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
    storageDel(key) { try { localStorage.removeItem(key); } catch (e) {} },
    now() { return performance.now() / 1000; },
    isTouch() { return ('ontouchstart' in window) || navigator.maxTouchPoints > 0; },
    mkCanvas(w, h) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      return c;
    },
    drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
      const chars = Array.from(text);
      let line = '', yy = y;
      for (let i = 0; i < chars.length; i++) {
        const test = line + chars[i];
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, x, yy);
          line = chars[i]; yy += lineHeight;
        } else line = test;
      }
      if (line) ctx.fillText(line, x, yy);
      return yy;
    }
  };

  window.U = U;
})();
