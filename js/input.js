/* 三中风云 — 输入 */
(function () {
  'use strict';

  const MAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'forward', KeyW: 'forward',
    ArrowDown: 'back', KeyS: 'back',
    Space: 'jump',
    KeyJ: 'attack', KeyZ: 'attack',
    KeyK: 'skill', KeyX: 'skill',
    KeyL: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge', KeyC: 'dodge',
    KeyE: 'deflect',
    KeyR: 'heal',
    KeyF: 'interact',
    KeyU: 'ultimate', KeyV: 'ultimate',
    KeyT: 'growth',
    KeyB: 'bag',
    Tab: 'vision',
    KeyQ: 'journal',
    KeyG: 'companions',
    KeyM: 'zones',
    Escape: 'pause', KeyP: 'pause',
    Enter: 'confirm', NumpadEnter: 'confirm'
  };

  class Input {
    constructor() {
      this.down = new Set();
      this.pressed = new Set();
      this.released = new Set();
      this.virtual = new Set();
      this.touchJust = new Set();
      this.gamepad = null;
      this.padPrev = {};
      this._bind();
    }

    _bind() {
      window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        const action = MAP[e.code];
        if (!action) return;
        e.preventDefault();
        if (!e.repeat) {
          this.pressed.add(action);
          if (action === 'confirm') this.pressed.add('confirm-key');
          if (e.code === 'Space') this.pressed.add('confirm');
        }
        this.down.add(action);
      }, { passive: false });

      window.addEventListener('keyup', (e) => {
        const action = MAP[e.code];
        if (!action) return;
        e.preventDefault();
        this.down.delete(action);
        this.released.add(action);
      }, { passive: false });

      window.addEventListener('blur', () => {
        this.down.clear();
        this.virtual.clear();
      });

      document.querySelectorAll('[data-touch]').forEach(btn => {
        const key = btn.getAttribute('data-touch');
        const press = (e) => {
          e.preventDefault();
          btn.setPointerCapture && btn.setPointerCapture(e.pointerId);
          this.virtual.add(key);
          this.pressed.add(key);
          this.touchJust.add(key);
        };
        const release = (e) => {
          e.preventDefault();
          this.virtual.delete(key);
          this.released.add(key);
        };
        btn.addEventListener('pointerdown', press);
        btn.addEventListener('pointerup', release);
        btn.addEventListener('pointercancel', release);
        btn.addEventListener('pointerleave', (e) => { if (e.buttons) release(e); });
        btn.addEventListener('contextmenu', e => e.preventDefault());
      });
    }

    _pollGamepad() {
      if (!navigator.getGamepads) return;
      const pads = navigator.getGamepads();
      this.gamepad = null;
      for (const p of pads) { if (p && p.connected) { this.gamepad = p; break; } }
      if (!this.gamepad) return;
      const p = this.gamepad;
      const map = { 0: 'jump', 1: 'attack', 2: 'skill', 3: 'heal', 5: 'dodge', 7: 'ultimate', 9: 'pause' };
      for (const [idx, action] of Object.entries(map)) {
        const b = p.buttons[idx];
        if (!b) continue;
        const was = !!this.padPrev[idx];
        if (b.pressed && !was) { this.down.add(action); this.pressed.add(action); }
        if (!b.pressed && was) { this.down.delete(action); this.released.add(action); }
        this.padPrev[idx] = b.pressed;
      }
      const ax = p.axes[0] || 0;
      if (ax < -.35) this.down.add('left'); else this.down.delete('left');
      if (ax > .35) this.down.add('right'); else this.down.delete('right');
      if ((p.axes[1] || 0) > .7) this.down.add('down');
      else this.down.delete('down');
    }

    update() { this._pollGamepad(); }

    isDown(action) { return this.down.has(action) || this.virtual.has(action); }
    justPressed(action) { return this.pressed.has(action); }
    justReleased(action) { return this.released.has(action); }

    consume(action) { this.pressed.delete(action); this.touchJust.delete(action); }

    endFrame() {
      this.pressed.clear();
      this.released.clear();
      this.touchJust.clear();
    }

    reset() {
      this.down.clear();
      this.virtual.clear();
      this.pressed.clear();
      this.released.clear();
    }
  }

  window.Input = Input;
})();
