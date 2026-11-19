/* 三中风云 — 程序化水墨美术 */
(function () {
  'use strict';

  const Art = {};
  const FONT = '"STKaiti","KaiTi","Kaiti SC","Songti SC",serif';
  const TAU = Math.PI * 2;

  const PALETTES = {
    title: {
      sky: ['#050d15', '#0b2231', '#284958'], moon: '#e8f3ee', mist: '#a7c9cd',
      ranges: ['#1b3340', '#142a37', '#0d1f2b'], ground: ['#d3e0e2', '#8da3aa', '#293d47'],
      accent: '#64e5ff', warm: '#e8bd7d', weather: 'snow'
    },
    snow: {
      sky: ['#06121e', '#102f42', '#496a74'], moon: '#eef6ef', mist: '#aacbd0',
      ranges: ['#2b4551', '#1d3644', '#112633'], ground: ['#cfdde0', '#7d959e', '#243842'],
      accent: '#7ce6ff', warm: '#e4b56f', weather: 'snow'
    },
    bamboo: {
      sky: ['#040f17', '#0a2430', '#21464a'], moon: '#dceee8', mist: '#87b5ae',
      ranges: ['#16333a', '#10292f', '#081b22'], ground: ['#334d47', '#1b312e', '#081613'],
      accent: '#67ddce', warm: '#e5b56d', weather: 'rain'
    },
    temple: {
      sky: ['#0e0808', '#271112', '#593023'], moon: '#f0c79d', mist: '#9f6e59',
      ranges: ['#2e1d1b', '#211311', '#140909'], ground: ['#4a332d', '#2a1c19', '#100b0a'],
      accent: '#ff9a64', warm: '#ffb96e', weather: 'ember'
    },
    boss: {
      sky: ['#03060c', '#120b13', '#44151a'], moon: '#ff745e', mist: '#8f5960',
      ranges: ['#211820', '#171018', '#0a070c'], ground: ['#2e2726', '#191617', '#070606'],
      accent: '#ff6758', warm: '#e08c56', weather: 'ember'
    }
  };

  function pal(theme) { return PALETTES[theme] || PALETTES.snow; }
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function ellipse(ctx, x, y, rx, ry, rot) {
    ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot || 0, 0, TAU);
  }
  function glow(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, U.rgba(color, alpha));
    g.addColorStop(.48, U.rgba(color, alpha * .38));
    g.addColorStop(1, U.rgba(color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  function limb(ctx, x1, y1, x2, y2, width, color, cap) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = cap || 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function inkBlob(ctx, cx, cy, rx, ry, color, seed, spikes) {
    ctx.beginPath();
    const n = spikes || 18;
    for (let i = 0; i <= n; i++) {
      const a = i / n * TAU;
      const k = .76 + U.hash(seed + i * 3.7) * .35;
      const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }

  /* ---------- 背景 ---------- */
  function stars(ctx, theme, t, alpha) {
    if (theme === 'temple') return;
    for (let i = 0; i < 52; i++) {
      const x = U.hash(i * 4.11) * 1920;
      const y = U.hash(i * 7.23) * 460;
      const tw = .25 + .75 * Math.pow(Math.max(0, Math.sin(t * (.4 + U.hash(i) * .7) + i)), 4);
      ctx.fillStyle = U.rgba('#d9f2ff', alpha * tw * (.4 + U.hash(i + 8) * .6));
      ctx.fillRect(x, y, U.hash(i + 2) > .8 ? 2 : 1, U.hash(i + 2) > .8 ? 2 : 1);
    }
  }

  function clouds(ctx, theme, t, camX, y, scale, alpha) {
    const p = pal(theme);
    const off = (-camX * .018 + t * 5) % 2300;
    ctx.save();
    ctx.translate(off, 0);
    for (let k = -1; k < 2; k++) {
      for (let i = 0; i < 5; i++) {
        const bx = k * 2200 + i * 490 + U.hash(i + k * 3) * 120;
        const by = y + Math.sin(i * 2.1 + k) * 35;
        const g = ctx.createLinearGradient(bx - 300, by, bx + 380, by + 30);
        g.addColorStop(0, U.rgba(p.mist, 0));
        g.addColorStop(.38, U.rgba(p.mist, alpha));
        g.addColorStop(.72, U.rgba(p.mist, alpha * .7));
        g.addColorStop(1, U.rgba(p.mist, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(bx, by, 300 * scale, 20 * scale, -.02, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function mountain(ctx, theme, t, camX, opt) {
    const p = pal(theme);
    const offset = -camX * opt.par + t * (opt.drift || 0);
    const baseY = opt.base, height = opt.height, seed = opt.seed;
    const color = p.ranges[opt.layer] || p.ranges[0];
    const top = [], bottom = [];
    for (let x = -260; x <= 2180; x += 24) {
      const wx = x + offset;
      let ridge = 0;
      for (let k = 0; k < 4; k++) {
        const px = seed * 900 + k * 613.7;
        const hh = height * (.3 + U.hash(seed * 12 + k * 4.3) * .7);
        const ww = 270 + U.hash(seed * 9 + k * 7.1) * 420;
        const d = (wx - px) / ww;
        ridge += hh * Math.exp(-d * d * 1.35);
      }
      ridge += height * .08 * U.fbm(wx / 390 + seed * 9);
      const y = baseY - Math.max(20, ridge);
      top.push([x, y]); bottom.push([x, baseY + 110]);
    }
    const g = ctx.createLinearGradient(0, baseY - height, 0, baseY + 90);
    g.addColorStop(0, U.rgba(color, .93));
    g.addColorStop(.55, U.rgba(color, .78));
    g.addColorStop(1, U.rgba(p.sky[1], .18));
    ctx.beginPath();
    ctx.moveTo(-260, 1120);
    top.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(2180, 1120); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();

    // 山脊淡墨
    ctx.beginPath();
    top.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.strokeStyle = U.rgba('#eff8f2', .035 + (3 - opt.layer) * .018);
    ctx.lineWidth = 1.2; ctx.stroke();

    // 雪顶
    if (theme === 'snow' || theme === 'title') {
      ctx.save(); ctx.globalCompositeOperation = 'screen';
      for (let i = 4; i < top.length - 4; i += 2) {
        const [x, y] = top[i];
        if (y < baseY - height * .55) {
          ctx.fillStyle = U.rgba('#e8f1ee', .045);
          ctx.beginPath(); ctx.ellipse(x, y + 17, 34, 10, 0, 0, TAU); ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  function moon(ctx, theme, x, y, r, t) {
    const p = pal(theme);
    if (theme === 'bamboo') { ctx.globalAlpha = .75; }
    glow(ctx, x, y, r * 3.6, p.moon, .12);
    glow(ctx, x, y, r * 1.8, p.moon, .08);
    const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
    g.addColorStop(0, '#fbfcf3');
    g.addColorStop(.72, p.moon);
    g.addColorStop(1, theme === 'boss' ? '#b23231' : '#b8cbc7');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.globalAlpha = .09;
    ctx.fillStyle = '#394b4d';
    for (let i = 0; i < 7; i++) {
      ellipse(ctx, x + (U.hash(i * 3.1) - .5) * r * 1.2, y + (U.hash(i * 8.2) - .5) * r * 1.1, r * (.04 + U.hash(i) * .1), r * (.03 + U.hash(i + 4) * .08), 0); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function bambooLayer(ctx, t, camX, par, yBase, alpha, scale, seed) {
    ctx.save();
    const off = -(camX * par) % 1600;
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < 14; i++) {
        const h1 = U.hash(i + seed) * 520 + 380;
        const x = k * 1600 + i * 123 + U.hash(i * 4 + seed) * 80 + off;
        const sway = Math.sin(t * .6 + i * 1.7 + seed) * 8;
        ctx.strokeStyle = U.rgba('#87b7a1', alpha * (.35 + U.hash(i + 4) * .4));
        ctx.lineWidth = (2 + U.hash(i + 8) * 3) * scale;
        ctx.beginPath();
        ctx.moveTo(x, yBase);
        ctx.quadraticCurveTo(x + sway * .2, yBase - h1 * .5, x + sway, yBase - h1);
        ctx.stroke();
        for (let s = 1; s < 6; s++) {
          const yy = yBase - h1 * s / 6;
          ctx.strokeStyle = U.rgba('#8dbba7', alpha * .22);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x + sway * .3, yy); ctx.lineTo(x + sway * .3 + 4, yy - 1); ctx.stroke();
        }
        // 叶
        for (let l = 0; l < 5; l++) {
          const ly = yBase - h1 * (.26 + l * .11);
          const dir = l % 2 ? 1 : -1;
          ctx.strokeStyle = U.rgba('#6ea08c', alpha * .25);
          ctx.lineWidth = 1.1 * scale;
          ctx.beginPath();
          ctx.moveTo(x + sway * .3 + 2, ly);
          ctx.quadraticCurveTo(x + dir * 24, ly - 4, x + dir * 48, ly - 14);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function pine(ctx, x, y, h, alpha, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color; ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2, h * .018);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-h * .03, -h * .45, h * .015, -h); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const yy = -h * (.3 + i * .13);
      const w = h * (.26 - i * .034);
      const xx = h * .015 * (i / 5);
      ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, h * .012);
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(xx, yy + k * 3);
        ctx.quadraticCurveTo(xx + (k - 1) * w * .5, yy - h * .04, xx + (k - 1) * w, yy - h * .015);
        ctx.stroke();
      }
      ctx.fillStyle = U.rgba('#dce9e6', alpha * .26);
      ctx.beginPath(); ctx.ellipse(xx - w * .2, yy - h * .016, w * .42, 2.2, -.08, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(xx + w * .24, yy - h * .004, w * .35, 1.8, .06, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function village(ctx, theme, t, camX) {
    ctx.save();
    const off = -(camX * .15) % 2100;
    for (let rep = -1; rep < 2; rep++) {
      for (let i = 0; i < 5; i++) {
        const x = rep * 2100 + 330 + i * 340 + U.hash(i * 4.2) * 90 + off;
        const y = 675 + U.hash(i) * 18;
        const w = 100 + U.hash(i + 2) * 90, h = 54 + U.hash(i + 3) * 22;
        ctx.fillStyle = U.rgba('#0e2029', .78);
        ctx.fillRect(x, y, w, h);
        ctx.beginPath();
        ctx.moveTo(x - 16, y); ctx.lineTo(x + w * .5, y - 34); ctx.lineTo(x + w + 16, y); ctx.closePath();
        ctx.fillStyle = U.rgba('#112731', .86); ctx.fill();
        ctx.fillStyle = U.rgba('#e4b56f', .28);
        for (let wd = 0; wd < 3; wd++) {
          if (U.hash(i + wd * 2.3) > .36) ctx.fillRect(x + 16 + wd * 28, y + 20 + (wd % 2) * 14, 7, 9);
        }
        glow(ctx, x + w * .55, y + 20, 70, '#e6ad63', .035);
      }
    }
    ctx.restore();
  }

  function templeSilhouette(ctx, x, y, scale, color, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = color; ctx.globalAlpha = alpha;
    ctx.fillRect(-52, -10, 104, 120);
    for (let i = 0; i < 3; i++) {
      const yy = -18 - i * 72, ww = 100 - i * 14;
      ctx.beginPath();
      ctx.moveTo(-ww, yy); ctx.quadraticCurveTo(-ww * .6, yy - 10, -ww * .34, yy - 34);
      ctx.lineTo(0, yy - 48); ctx.lineTo(ww * .34, yy - 34);
      ctx.quadraticCurveTo(ww * .6, yy - 10, ww, yy); ctx.closePath(); ctx.fill();
      ctx.fillRect(-ww * .62, yy, ww * 1.24, 8);
    }
    ctx.fillStyle = 'rgba(255,126,80,.16)';
    for (let i = 0; i < 8; i++) ctx.fillRect(-38 + (i % 4) * 25, 24 + Math.floor(i / 4) * 34, 8, 16);
    ctx.restore();
  }

  function backgroundBase(ctx, theme, t, camX, heavy) {
    const p = pal(theme);
    const sky = ctx.createLinearGradient(0, 0, 0, 900);
    sky.addColorStop(0, p.sky[0]); sky.addColorStop(.55, p.sky[1]); sky.addColorStop(1, p.sky[2]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1920, 1080);
    stars(ctx, theme, t, theme === 'boss' ? .28 : .5);

    if (theme === 'boss') {
      moon(ctx, theme, 1330 - camX * .008, 200, 116, t);
      const flash = Math.pow(Math.max(0, Math.sin(t * .37 + 1.8)), 24);
      if (flash > .2) { ctx.fillStyle = `rgba(195,219,231,${flash * .09})`; ctx.fillRect(0, 0, 1920, 760); }
    } else if (theme === 'temple') {
      moon(ctx, theme, 1490 - camX * .012, 160, 78, t);
      glow(ctx, 500, 760, 700, '#ff7d49', .11);
      glow(ctx, 1500, 810, 500, '#ff9155', .08);
    } else {
      moon(ctx, theme, 1460 - camX * .012, 180, theme === 'bamboo' ? 54 : 76, t);
    }

    clouds(ctx, theme, t, camX, 340, 1.2, theme === 'boss' ? .10 : .13);
    clouds(ctx, theme, t * .6, camX, 515, .9, .09);

    mountain(ctx, theme, t, camX, { base: 720, height: 400, seed: 1.4, layer: 0, par: .018, drift: .02 });
    mountain(ctx, theme, t, camX, { base: 755, height: 315, seed: 5.7, layer: 1, par: .043, drift: .01 });
    if (theme === 'bamboo') {
      bambooLayer(ctx, t, camX, .08, 830, .32, .8, 8);
    }
    mountain(ctx, theme, t, camX, { base: 805, height: 250, seed: 9.1, layer: 2, par: .082 });

    // 雾带
    const mist = ctx.createLinearGradient(0, 520, 0, 760);
    mist.addColorStop(0, U.rgba(p.mist, 0));
    mist.addColorStop(.45, U.rgba(p.mist, .075));
    mist.addColorStop(1, U.rgba(p.mist, 0));
    ctx.fillStyle = mist; ctx.fillRect(0, 500, 1920, 280);

    if (theme === 'snow' || theme === 'title') {
      const off = -(camX * .16) % 2200;
      for (let k = -1; k < 2; k++) {
        for (let i = 0; i < 7; i++) {
          const x = k * 2200 + 180 + i * 330 + off;
          pine(ctx, x, 765 + U.hash(i + 2) * 20, 230 + U.hash(i) * 130, .34, U.rgba('#233e46', .8));
        }
      }
      village(ctx, theme, t, camX);
      bambooLayer(ctx, t, camX, .11, 832, .12, .65, 2);
    } else if (theme === 'bamboo') {
      bambooLayer(ctx, t, camX, .16, 838, .4, 1, 3);
      bambooLayer(ctx, t, camX, .26, 848, .56, 1.25, 5);
      const off = -(camX * .12) % 2600;
      templeSilhouette(ctx, 350 + off, 610, .85, '#0a1d20', .7);
      if (off > 1200) templeSilhouette(ctx, 350 + off - 2600, 610, .85, '#0a1d20', .7);
    } else if (theme === 'temple') {
      const off = -(camX * .1) % 2400;
      templeSilhouette(ctx, 1500 + off, 635, 1.4, '#160d0b', .82);
      templeSilhouette(ctx, 430 + off, 690, .83, '#190d0b', .74);
      if (off > 900) templeSilhouette(ctx, 430 + off - 2400, 690, .83, '#190d0b', .74);
      // 远火
      for (let i = 0; i < 7; i++) {
        const x = 250 + U.hash(i * 2.7) * 1500;
        glow(ctx, x, 690 + U.hash(i + 3) * 80, 65, '#ff8a43', .06 + .03 * Math.sin(t * 1.7 + i));
      }
    } else if (theme === 'boss') {
      // 天阙残门
      const off = -(camX * .12);
      ctx.save(); ctx.globalAlpha = .8;
      for (let side = 0; side < 2; side++) {
        const x = (side ? 1660 : 260) + off % 2600;
        ctx.fillStyle = '#08070b';
        ctx.fillRect(x - 55, 180, 110, 650);
        ctx.beginPath(); ctx.moveTo(x - 80, 190); ctx.lineTo(x, 90); ctx.lineTo(x + 80, 190); ctx.closePath(); ctx.fill();
        ctx.fillStyle = U.rgba('#ff5148', .16);
        for (let i = 0; i < 4; i++) ctx.fillRect(x - 35, 260 + i * 120, 4, 53);
      }
      ctx.strokeStyle = 'rgba(8,7,10,.85)'; ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const x1 = 290 + i * 310 + off * .3 % 1500;
        ctx.beginPath(); ctx.moveTo(x1, 230); ctx.quadraticCurveTo(x1 + 40, 430, x1 + 15, 680); ctx.stroke();
      }
      ctx.restore();
      for (let i = 0; i < 5; i++) {
        const x = 180 + U.hash(i * 3.7) * 1500, y = 480 + U.hash(i + 8) * 160;
        ctx.fillStyle = U.rgba('#19141a', .7);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 22, y + 50); ctx.lineTo(x + 8, y + 76); ctx.lineTo(x - 20, y + 26); ctx.closePath(); ctx.fill();
      }
    }

    // 斜风雪痕
    if (theme === 'snow' || theme === 'title' || theme === 'boss') {
      ctx.save();
      ctx.strokeStyle = U.rgba('#dff5f8', theme === 'boss' ? .035 : .055);
      ctx.lineWidth = 1;
      for (let i = 0; i < 26; i++) {
        const x = (i * 97 + (-camX * .3) % 1920 + t * 24) % 2100 - 90;
        const y = (i * 173 + t * 36) % 900;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 34, y + 14); ctx.stroke();
      }
      ctx.restore();
    }
    if (theme === 'bamboo') {
      ctx.fillStyle = 'rgba(3,11,14,.16)'; ctx.fillRect(0, 0, 1920, 1080);
    }
    if (theme === 'boss') {
      const v = ctx.createRadialGradient(960, 540, 250, 960, 540, 980);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,2,3,.55)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, 1920, 1080);
    }
  }

  /* ---------- 地面与场景 ---------- */
  function drawGround(ctx, theme, width, groundY, t, cameraX) {
    const p = pal(theme);
    const start = -300, end = width + 300;
    const g = ctx.createLinearGradient(0, groundY, 0, 1080);
    if (theme === 'snow' || theme === 'title') {
      g.addColorStop(0, '#cbdadd'); g.addColorStop(.1, '#aabcc0'); g.addColorStop(.5, '#617780'); g.addColorStop(1, '#1b2f39');
    } else if (theme === 'bamboo') {
      g.addColorStop(0, '#3f5b50'); g.addColorStop(.25, '#253d37'); g.addColorStop(1, '#081310');
    } else if (theme === 'temple') {
      g.addColorStop(0, '#4d3930'); g.addColorStop(.25, '#2b1e1a'); g.addColorStop(1, '#0b0706');
    } else {
      g.addColorStop(0, '#37302f'); g.addColorStop(.3, '#1d1a1b'); g.addColorStop(1, '#060506');
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(start, 1080);
    for (let x = start; x <= end; x += 34) {
      const yy = groundY + Math.sin(x * .013 + 1.2) * 4 + Math.sin(x * .003) * 7;
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(end, 1080); ctx.closePath(); ctx.fill();

    // 雪面 / 水光 / 裂纹
    if (theme === 'snow' || theme === 'title') {
      ctx.fillStyle = 'rgba(230,241,241,.65)';
      ctx.beginPath();
      ctx.moveTo(start, groundY - 4);
      for (let x = start; x <= end; x += 28) ctx.lineTo(x, groundY + Math.sin(x * .013 + 1.2) * 4 + Math.sin(x * .003) * 7 - 3);
      ctx.lineTo(end, groundY + 55); ctx.lineTo(start, groundY + 55); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(37,65,76,.25)'; ctx.lineWidth = 1;
      for (let i = 0; i < 70; i++) {
        const x = U.hash(i * 3.7) * width;
        const y = groundY + 18 + U.hash(i + 3) * 190;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30 + U.hash(i + 7) * 90, y + 8); ctx.stroke();
      }
      // 雪堆
      for (let i = 0; i < 14; i++) {
        const x = U.hash(i * 8.1) * width;
        ctx.fillStyle = 'rgba(225,238,238,.22)';
        ellipse(ctx, x, groundY + 8, 55 + U.hash(i) * 60, 10 + U.hash(i + 3) * 7, 0); ctx.fill();
      }
    } else if (theme === 'bamboo') {
      ctx.fillStyle = 'rgba(98,167,148,.07)';
      for (let i = 0; i < 24; i++) {
        const x = U.hash(i * 4.9) * width;
        ctx.beginPath(); ctx.ellipse(x, groundY + 50 + U.hash(i) * 160, 70 + U.hash(i + 2) * 100, 6, 0, 0, TAU); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(195,220,203,.13)'; ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const x = U.hash(i * 8.4) * width + 80, y = groundY + 62 + U.hash(i) * 140;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 45, y - 22, x + 105, y + 2); ctx.stroke();
      }
    } else if (theme === 'temple') {
      ctx.strokeStyle = 'rgba(214,104,66,.16)'; ctx.lineWidth = 2;
      for (let i = 0; i < 28; i++) {
        const x = U.hash(i * 4.2) * width + 30, y = groundY + 18 + U.hash(i + 9) * 170;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y + 10); ctx.lineTo(x + 70, y + 3); ctx.stroke();
      }
      for (let i = 0; i < 8; i++) glow(ctx, 120 + i * 610, groundY + 35, 80, '#ff7a3d', .055);
      ctx.strokeStyle = 'rgba(10,6,5,.7)'; ctx.lineWidth = 1;
      for (let x = start; x < end; x += 180) {
        ctx.beginPath(); ctx.moveTo(x, groundY + 12); ctx.lineTo(x - 14, 1080); ctx.stroke();
      }
    } else {
      ctx.strokeStyle = 'rgba(255,89,73,.13)'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 40; i++) {
        const x = U.hash(i * 3.9) * width + 10, y = groundY + 22 + U.hash(i + 3) * 210;
        const len = 18 + U.hash(i + 5) * 70;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len * .6, y + 12); ctx.lineTo(x + len, y + 4); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(228,224,210,.07)'; ctx.lineWidth = 1;
      for (let x = start; x < end; x += 220) {
        ctx.beginPath(); ctx.moveTo(x, groundY + 10); ctx.lineTo(x - 26, 1080); ctx.stroke();
      }
    }

    // 地面与背景交界
    ctx.strokeStyle = U.rgba(p.accent, .13); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = start; x <= end; x += 34) {
      const y = groundY + Math.sin(x * .013 + 1.2) * 4 + Math.sin(x * .003) * 7;
      if (x === start) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function lantern(ctx, x, y, scale, t, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.strokeStyle = 'rgba(31,26,22,.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, -34); ctx.stroke();
    glow(ctx, 0, 5, 72, color || '#ffb461', .2 + Math.sin(t * 2.1 + x) * .03);
    const g = ctx.createLinearGradient(-22, -34, 22, 40);
    g.addColorStop(0, '#d56d43'); g.addColorStop(.5, '#ffcd83'); g.addColorStop(1, '#a13f32');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-19, -33); ctx.quadraticCurveTo(0, -47, 19, -33); ctx.lineTo(16, 24); ctx.quadraticCurveTo(0, 37, -16, 24); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(96,40,27,.6)'; ctx.lineWidth = 1;
    for (let i = -12; i <= 12; i += 8) { ctx.beginPath(); ctx.moveTo(i, -38); ctx.lineTo(i * .7, 31); ctx.stroke(); }
    ctx.fillStyle = '#3e2b1d'; ctx.fillRect(-20, -40, 40, 7); ctx.fillRect(-17, 28, 34, 6);
    ctx.strokeStyle = 'rgba(255,196,120,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 35); ctx.lineTo(0, 51); ctx.stroke();
    ctx.restore();
  }

  function drawScenery(ctx, theme, width, groundY, t, cameraX) {
    ctx.save();
    if (theme === 'snow' || theme === 'title') {
      for (let i = 0; i < Math.ceil(width / 950); i++) {
        const x = 520 + i * 950;
        pine(ctx, x, groundY + 4, 270, .8, 'rgba(15,34,41,.9)');
      }
      for (let i = 0; i < Math.ceil(width / 1600); i++) lantern(ctx, 1050 + i * 1600, groundY - 110, .55, t, '#e8ad6a');
      // 石灯
      for (let i = 0; i < Math.ceil(width / 1300); i++) {
        const x = 260 + i * 1300;
        ctx.fillStyle = 'rgba(43,58,62,.9)';
        ctx.fillRect(x - 17, groundY - 80, 34, 80);
        ctx.fillRect(x - 30, groundY - 88, 60, 9);
        ctx.fillStyle = 'rgba(235,190,120,.3)';
        ctx.fillRect(x - 8, groundY - 74, 16, 22);
        glow(ctx, x, groundY - 64, 35, '#ffcc8a', .08);
      }
    } else if (theme === 'bamboo') {
      for (let i = 0; i < Math.ceil(width / 500); i++) {
        const x = 250 + i * 520 + U.hash(i * 2.2) * 60;
        for (let k = 0; k < 4; k++) {
          const bx = x + (k - 1.5) * 26;
          ctx.strokeStyle = 'rgba(20,56,48,.9)'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(bx + (k % 2) * 4, groundY + 3); ctx.quadraticCurveTo(bx - 12, groundY - 240, bx + 15, groundY - 500); ctx.stroke();
          ctx.strokeStyle = 'rgba(84,133,110,.25)'; ctx.lineWidth = 1;
          for (let s = 0; s < 6; s++) {
            const yy = groundY - 70 - s * 68;
            ctx.beginPath(); ctx.moveTo(bx - 4, yy); ctx.lineTo(bx + 8, yy - 2); ctx.stroke();
          }
        }
      }
      for (let i = 0; i < Math.ceil(width / 1300); i++) lantern(ctx, 680 + i * 1300, groundY - 150, .7, t, '#b9c890');
      // 石阶
      for (let i = 0; i < Math.ceil(width / 700); i++) {
        const x = 530 + i * 700;
        ctx.fillStyle = 'rgba(17,34,30,.7)';
        ctx.fillRect(x, groundY + 20, 150, 12);
        ctx.fillRect(x + 20, groundY + 38, 110, 10);
      }
    } else if (theme === 'temple') {
      for (let i = 0; i < Math.ceil(width / 760); i++) {
        const x = 410 + i * 760;
        ctx.fillStyle = 'rgba(23,13,11,.95)';
        ctx.fillRect(x - 27, groundY - 370, 54, 370);
        ctx.fillStyle = 'rgba(54,27,21,.8)';
        ctx.fillRect(x - 39, groundY - 380, 78, 17);
        // 裂
        ctx.strokeStyle = 'rgba(255,105,52,.35)'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x - 5, groundY - 340); ctx.lineTo(x + 9, groundY - 260); ctx.lineTo(x - 8, groundY - 190); ctx.stroke();
        // 幡
        const sw = Math.sin(t * 1.2 + i) * 8;
        ctx.fillStyle = 'rgba(115,31,27,.75)';
        ctx.beginPath(); ctx.moveTo(x + 18, groundY - 355); ctx.quadraticCurveTo(x + 60, groundY - 310 + sw, x + 50, groundY - 230); ctx.lineTo(x + 25, groundY - 240); ctx.closePath(); ctx.fill();
        glow(ctx, x, groundY - 380, 38, '#ff9a60', .08);
      }
      for (let i = 0; i < Math.ceil(width / 900); i++) lantern(ctx, 770 + i * 900, groundY - 160, .85, t, '#ff955c');
    } else {
      for (let i = 0; i < Math.ceil(width / 1100); i++) {
        const x = 530 + i * 1100;
        ctx.fillStyle = 'rgba(8,7,9,.94)';
        ctx.fillRect(x - 36, groundY - 450, 72, 450);
        ctx.fillStyle = 'rgba(48,34,37,.6)';
        ctx.fillRect(x - 52, groundY - 460, 104, 24);
        ctx.strokeStyle = 'rgba(255,80,68,.22)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x + 8, groundY - 420); ctx.lineTo(x - 4, groundY - 280); ctx.lineTo(x + 11, groundY - 190); ctx.stroke();
        // 铁链
        ctx.strokeStyle = 'rgba(46,37,38,.9)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x + 20, groundY - 300); ctx.quadraticCurveTo(x + 80, groundY - 220, x + 55, groundY - 30); ctx.stroke();
      }
      for (let i = 0; i < Math.ceil(width / 900); i++) lantern(ctx, 690 + i * 900, groundY - 175, .75, t, '#ff6d4d');
    }
    // 地面倒影式微光
    const lg = ctx.createLinearGradient(0, groundY + 40, 0, groundY + 180);
    lg.addColorStop(0, U.rgba(pal(theme).accent, .04)); lg.addColorStop(1, U.rgba(pal(theme).accent, 0));
    ctx.fillStyle = lg; ctx.fillRect(cameraX - 100, groundY + 40, 2120, 140);
    ctx.restore();
  }

  /* ---------- 角色 ---------- */
  function playerPose(p, t) {
    const st = p.state;
    const stateT = p.stateT || 0;
    let bob = Math.sin(t * 2.2 + .4) * 1.6, lean = 0, px = 0, py = 0;
    let legA = .08, legB = -.08, armA = .15, armB = -.1;
    let sword = .62, headTilt = -.02;
    const moving = Math.abs(p.vx) > 40 && p.onGround;
    if (st === 'run' || (moving && !['attack', 'dodge', 'skill', 'hurt', 'ultimate'].includes(st))) {
      const phase = p.animTime * 12;
      bob = Math.abs(Math.sin(phase)) * 4 - 1;
      lean = .075;
      legA = Math.sin(phase) * .62;
      legB = -Math.sin(phase) * .62;
      armA = -Math.sin(phase) * .5;
      armB = Math.sin(phase) * .38;
      sword = .48 + Math.sin(phase) * .1;
    }
    if (!p.onGround) {
      const rising = p.vy < 0;
      bob = rising ? -4 : 2;
      legA = rising ? -.5 : .22;
      legB = rising ? .34 : -.18;
      armA = rising ? -.7 : -.4;
      armB = rising ? .5 : .3;
      sword = .16;
      lean = rising ? -.04 : .06;
    }
    if (st === 'attack') {
      const dur = [.32, .34, .5][Math.min(2, p.attackIndex)] || .34;
      const pr = U.clamp(stateT / dur, 0, 1);
      const wind = .2;
      if (p.attackIndex === 2) {
        sword = -2.4 + U.easeInOutCubic(pr) * 6.2;
        px = Math.sin(pr * Math.PI) * 18;
        lean = .16;
      } else {
        const sw = U.easeOutCubic(U.clamp((pr - wind) / (.55 - wind), 0, 1));
        sword = -1.9 + sw * 2.55 + (p.attackIndex ? .1 : 0);
        px = sw * 18;
        lean = .13;
        armB = -.7;
      }
    } else if (st === 'skill') {
      const pr = U.clamp(stateT / .62, 0, 1);
      sword = -.14;
      px = -U.pingPong(pr * 2, 1) * 3;
      lean = .06;
      armA = -1.25; armB = -1.1;
      bob = -3 + Math.sin(pr * Math.PI) * -6;
    } else if (st === 'dodge') {
      lean = .32; px = 12; py = 5; sword = .4;
      legA = -.64; legB = .55; armA = -.6;
    } else if (st === 'heal') {
      const pr = U.clamp(stateT / .62, 0, 1);
      sword = 1.3; armB = -1.5 - Math.sin(pr * Math.PI) * .25; bob = -1;
    } else if (st === 'hurt') {
      lean = -.16; px = -6; sword = .95; headTilt = .1;
      legA = .28; legB = -.24;
    } else if (st === 'ultimate') {
      const pr = U.clamp(stateT / 2.1, 0, 1);
      py = -Math.sin(pr * Math.PI) * 32;
      sword = -1.42 - Math.sin(pr * Math.PI) * .18;
      armB = -1.45; armA = -1.2;
      lean = -.02;
    } else if (st === 'victory') {
      sword = -.25; bob = Math.sin(t * 2) * 1.5; lean = -.02;
    } else if (st === 'dead') {
      lean = -.5; py = 26; sword = 1.35;
    }
    return { bob, lean, px, py, legA, legB, armA, armB, sword, headTilt };
  }

  function drawSword(ctx, handX, handY, angle, scale, glowAmt, color) {
    ctx.save(); ctx.translate(handX, handY); ctx.rotate(angle); ctx.scale(scale, scale);
    if (glowAmt) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = U.rgba(color || '#8defff', .18 * glowAmt); ctx.lineWidth = 17; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(36, 0); ctx.lineTo(142, 0); ctx.stroke();
      ctx.restore();
    }
    // 柄
    ctx.fillStyle = '#1f2930'; rr(ctx, -18, -5, 48, 10, 4); ctx.fill();
    ctx.fillStyle = '#c5a35f'; rr(ctx, 20, -8, 12, 16, 3); ctx.fill();
    ctx.fillStyle = '#0e1a20'; rr(ctx, 28, -3, 12, 6, 2); ctx.fill();
    // 刃
    const g = ctx.createLinearGradient(40, 0, 150, 0);
    g.addColorStop(0, '#c6f8ff'); g.addColorStop(.4, '#e9ffff'); g.addColorStop(.8, '#74dff2'); g.addColorStop(1, '#1d85a5');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(40, -6); ctx.lineTo(136, -4); ctx.lineTo(154, 0); ctx.lineTo(136, 4); ctx.lineTo(40, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(47, -2); ctx.lineTo(136, -1); ctx.stroke();
    // 水纹
    ctx.strokeStyle = U.rgba('#7eeeff', .7); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(53, 2); ctx.quadraticCurveTo(80, -2, 108, 2); ctx.stroke();
    ctx.restore();
  }

  function drawFaceShen(ctx, t, blink, mood) {
    // 头发后层
    const hg = ctx.createLinearGradient(-44, -190, 35, -115);
    hg.addColorStop(0, '#17345d'); hg.addColorStop(.55, '#2d6f9e'); hg.addColorStop(1, '#55c7df');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(5, -157, 47, Math.PI * .92, Math.PI * 2.04);
    ctx.quadraticCurveTo(54, -126, 38, -104);
    ctx.quadraticCurveTo(10, -118, -25, -108);
    ctx.quadraticCurveTo(-54, -122, -43, -156);
    ctx.closePath(); ctx.fill();
    // 脸
    const fg = ctx.createRadialGradient(16, -158, 5, 4, -155, 48);
    fg.addColorStop(0, '#fff0df'); fg.addColorStop(.6, '#f4d8c7'); fg.addColorStop(1, '#dcae9e');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(-31, -176); ctx.quadraticCurveTo(-34, -132, -5, -113);
    ctx.quadraticCurveTo(32, -105, 39, -144);
    ctx.quadraticCurveTo(43, -178, 8, -197);
    ctx.quadraticCurveTo(-21, -198, -31, -176);
    ctx.closePath(); ctx.fill();
    // 刘海
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.moveTo(-40, -170); ctx.quadraticCurveTo(-25, -209, 15, -202);
    ctx.quadraticCurveTo(53, -196, 43, -151);
    ctx.lineTo(33, -175); ctx.lineTo(24, -153); ctx.lineTo(12, -182); ctx.lineTo(1, -157);
    ctx.lineTo(-10, -184); ctx.lineTo(-23, -161); ctx.lineTo(-29, -181); ctx.closePath(); ctx.fill();
    // 侧发
    ctx.fillStyle = '#24547d';
    ctx.beginPath(); ctx.moveTo(-39, -169); ctx.quadraticCurveTo(-55, -140, -35, -110); ctx.quadraticCurveTo(-25, -132, -27, -170); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(40, -167); ctx.quadraticCurveTo(50, -135, 31, -109); ctx.quadraticCurveTo(27, -138, 29, -173); ctx.closePath(); ctx.fill();
    // 眼睛
    const blinkK = blink < .12 ? Math.max(.06, Math.abs(blink - .06) / .06) : 1;
    function eye(x, y, size) {
      ctx.save(); ctx.translate(x, y); ctx.scale(1, blinkK);
      ctx.fillStyle = '#10263b'; ctx.beginPath(); ctx.ellipse(0, 0, size, size * 1.25, 0, 0, TAU); ctx.fill();
      const eg = ctx.createLinearGradient(0, -size, 0, size);
      eg.addColorStop(0, '#0d6b93'); eg.addColorStop(.5, '#7ff2ff'); eg.addColorStop(1, '#d4fbff');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(0, size * .15, size * .63, size * .86, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#061620'; ctx.beginPath(); ctx.ellipse(0, size * .12, size * .26, size * .56, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.beginPath(); ctx.arc(-size * .24, -size * .3, size * .21, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(size * .25, size * .36, size * .09, 0, TAU); ctx.fill();
      // 上睫
      ctx.strokeStyle = '#12263a'; ctx.lineWidth = size * .24; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-size * 1.04, -size * .6); ctx.quadraticCurveTo(0, -size * 1.3, size * 1.04, -size * .58); ctx.stroke();
      ctx.restore();
    }
    eye(5, -156, 8.2);
    eye(26, -155, 8.6);
    // 眉
    ctx.strokeStyle = 'rgba(33,61,86,.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, -172); ctx.quadraticCurveTo(5, -175, 12, -172); ctx.stroke();
    if (mood !== 'closed') {
      // 鼻嘴
      ctx.strokeStyle = 'rgba(156,91,84,.45)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(17, -146); ctx.quadraticCurveTo(19, -142, 16, -140); ctx.stroke();
      ctx.strokeStyle = 'rgba(169,83,82,.65)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(12, -129); ctx.quadraticCurveTo(19, -124, 26, -129); ctx.stroke();
    }
    // 腮红
    ctx.fillStyle = 'rgba(232,121,126,.14)';
    ellipse(ctx, 32, -139, 10, 4, -.15); ctx.fill();
    ellipse(ctx, -5, -137, 8, 3.5, .1); ctx.fill();
    // 发饰：鲸
    ctx.save(); ctx.translate(-27, -189); ctx.rotate(-.3);
    ctx.fillStyle = '#83f3ff';
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-19, -5); ctx.lineTo(-17, 3); ctx.lineTo(-24, 8); ctx.lineTo(-11, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0b3d54'; ctx.beginPath(); ctx.arc(5, -1, 1.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(190,247,255,.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, 14, -.8, .8); ctx.stroke();
    ctx.restore();
    // 发丝高光
    ctx.strokeStyle = 'rgba(170,244,255,.35)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-24, -190); ctx.quadraticCurveTo(-4, -204, 22, -197); ctx.stroke();
  }

  function drawPlayer(ctx, p, t, opts) {
    const ghost = opts && opts.ghost;
    const pose = playerPose(p, t);
    ctx.save();
    ctx.translate(p.x + pose.px, p.y + pose.py);
    if (ghost) { ctx.globalAlpha *= .28; }
    // 影子
    if (!ghost) {
      ctx.fillStyle = 'rgba(0,0,0,.34)';
      ctx.beginPath(); ctx.ellipse(0, 3, 45, 10, 0, 0, TAU); ctx.fill();
    }
    ctx.scale(p.facing || 1, 1);
    ctx.rotate(pose.lean);
    const blinkPhase = (t + (p.blinkOffset || 0)) % 4.35;
    const blink = blinkPhase < .13 ? blinkPhase : 1;
    const mood = p.state === 'hurt' ? 'hurt' : 'normal';

    // 气场
    if (p.state === 'ultimate' || p.focus >= 100) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, -95, 95, '#64e5ff', p.state === 'ultimate' ? .24 : .08);
      ctx.restore();
    }

    // 后发 / 双马尾
    const wave = Math.sin(t * 3.1) * 5 + (p.state === 'dodge' ? 12 : 0);
    const hairGrad = ctx.createLinearGradient(-65, -170, -12, -35);
    hairGrad.addColorStop(0, '#173a68'); hairGrad.addColorStop(.5, '#2778a8'); hairGrad.addColorStop(1, '#5fd0e5');
    ctx.strokeStyle = hairGrad; ctx.lineCap = 'round';
    ctx.lineWidth = 17;
    ctx.beginPath(); ctx.moveTo(-29, -177); ctx.bezierCurveTo(-69 - wave, -158, -63 - wave, -87, -47 - wave * .6, -44); ctx.stroke();
    ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(24, -182); ctx.bezierCurveTo(46 + wave, -150, 38 + wave, -91, 17 + wave * .3, -48); ctx.stroke();
    ctx.strokeStyle = 'rgba(127,239,255,.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-26, -176); ctx.bezierCurveTo(-58 - wave, -154, -54 - wave, -102, -45 - wave * .5, -57); ctx.stroke();
    // 发带
    ctx.strokeStyle = '#9ff7ff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-42 - wave * .3, -95); ctx.lineTo(-33, -88); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-31 - wave * .2, -142); ctx.lineTo(-21, -137); ctx.stroke();

    // 腿
    const hipY = -55;
    const legSwing = pose.legA;
    const legSwing2 = pose.legB;
    ctx.lineCap = 'round';
    function leg(a, side, front) {
      const fx = side * 10 + Math.sin(a) * 27;
      const fy = Math.abs(Math.cos(a)) * 1;
      ctx.strokeStyle = front ? '#f0e6d8' : '#d9cfc3'; ctx.lineWidth = front ? 15 : 13;
      ctx.beginPath(); ctx.moveTo(side * 9, hipY); ctx.lineTo(fx, -20 + fy); ctx.stroke();
      // 短靴
      ctx.strokeStyle = '#1a4163'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.moveTo(fx, -30); ctx.lineTo(fx + (front ? 3 : -1), -8); ctx.stroke();
      ctx.strokeStyle = '#7de9f6'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(fx - 6, -28); ctx.lineTo(fx + 6, -28); ctx.stroke();
      ctx.fillStyle = '#132f48'; ellipse(ctx, fx + 4, -4, 13, 6, 0); ctx.fill();
    }
    leg(legSwing2, -1, false);
    leg(legSwing, 1, true);

    // 后手 / 衣袖
    const shoulderY = -108;
    function arm(swing, side, front, hand) {
      const ex = side * 27 + Math.sin(swing) * 30;
      const ey = shoulderY + 25 + Math.cos(swing) * 17;
      const hx = ex + side * 8 + Math.sin(swing) * 12;
      const hy = ey + 23;
      ctx.strokeStyle = front ? '#f4ebdd' : '#d8d0c4'; ctx.lineWidth = front ? 15 : 13;
      ctx.beginPath(); ctx.moveTo(side * 18, shoulderY); ctx.quadraticCurveTo(ex, ey, hx, hy); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,205,223,.66)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(side * 20, shoulderY + 3); ctx.quadraticCurveTo(ex, ey + 2, hx, hy); ctx.stroke();
      ctx.fillStyle = '#f2d5c5'; ctx.beginPath(); ctx.arc(hx, hy, 7, 0, TAU); ctx.fill();
      return { x: hx, y: hy };
    }
    arm(pose.armA, -1, false);

    // 裙摆
    const skirtG = ctx.createLinearGradient(0, -100, 0, -30);
    skirtG.addColorStop(0, '#eef3ed'); skirtG.addColorStop(.55, '#c7e2e6'); skirtG.addColorStop(1, '#235670');
    ctx.fillStyle = skirtG;
    ctx.beginPath();
    ctx.moveTo(-26, -77);
    ctx.quadraticCurveTo(-48, -54, -43, -29);
    ctx.quadraticCurveTo(-25, -22, -7, -31);
    ctx.quadraticCurveTo(10, -21, 34, -30);
    ctx.quadraticCurveTo(46, -56, 26, -77);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(105,230,244,.7)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-38, -39); ctx.quadraticCurveTo(0, -49, 38, -39); ctx.stroke();
    // 裙纹
    ctx.strokeStyle = 'rgba(38,104,132,.45)'; ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 9, -75); ctx.quadraticCurveTo(i * 13, -50, i * 11, -32); ctx.stroke();
    }

    // 身体
    const bodyG = ctx.createLinearGradient(-25, -125, 25, -62);
    bodyG.addColorStop(0, '#f5f1e7'); bodyG.addColorStop(.5, '#dfe9e5'); bodyG.addColorStop(1, '#9ec4cf');
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.moveTo(-25, -120); ctx.quadraticCurveTo(-37, -86, -27, -68);
    ctx.quadraticCurveTo(0, -58, 28, -68); ctx.quadraticCurveTo(37, -91, 24, -120);
    ctx.quadraticCurveTo(0, -130, -25, -120); ctx.closePath(); ctx.fill();
    // 深蓝衣襟
    ctx.fillStyle = '#183a57';
    ctx.beginPath();
    ctx.moveTo(-17, -120); ctx.quadraticCurveTo(4, -110, 23, -121);
    ctx.lineTo(18, -103); ctx.quadraticCurveTo(3, -94, -14, -103); ctx.closePath(); ctx.fill();
    // 腰带
    ctx.fillStyle = '#e8c47a';
    ctx.fillRect(-26, -83, 51, 6);
    ctx.fillStyle = '#173a50'; ctx.fillRect(-10, -84, 20, 8);
    ctx.strokeStyle = '#83eefd'; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(-25, -92); ctx.quadraticCurveTo(0, -88, 26, -92); ctx.stroke();
    // 胸前发光纹
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, 8, -102, 16, '#6fe9ff', .28);
    ctx.strokeStyle = 'rgba(164,247,255,.8)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(3, -112); ctx.quadraticCurveTo(15, -102, 8, -91); ctx.stroke();
    ctx.restore();

    // 前手
    const hand = arm(pose.armB, 1, true);
    // 剑
    drawSword(ctx, hand.x + 4, hand.y, pose.sword, 1, p.state === 'attack' || p.state === 'skill' || p.state === 'ultimate' ? 1 : .25);

    // 头部
    ctx.save();
    ctx.translate(0, pose.bob);
    ctx.rotate(pose.headTilt);
    drawFaceShen(ctx, t, blink, mood);
    // 鲸影发尾光
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, -45, -44, 20, '#68e4f8', .1);
    ctx.restore();
    ctx.restore();

    // 攻击弧光
    if (p.state === 'attack') {
      const dur = [.32, .34, .5][Math.min(2, p.attackIndex)] || .34;
      const pr = U.clamp(p.stateT / dur, 0, 1);
      const active = p.attackIndex === 2 ? pr > .12 && pr < .84 : pr > .14 && pr < .76;
      if (active) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.scale(1, 1);
        const aa = p.attackIndex === 2 ? -.8 + pr * 6.2 : -2.2 + pr * 3.4;
        const rad = p.attackIndex === 2 ? 125 : 112;
        const spread = p.attackIndex === 2 ? 1.4 : 1.18;
        const fade = Math.sin(U.clamp((pr - .12) / .64, 0, 1) * Math.PI);
        // 大范围残光
        ctx.strokeStyle = `rgba(92,222,246,${.18 * fade})`; ctx.lineWidth = 34; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(28, -96, rad + 10, aa - spread, aa + spread * .62); ctx.stroke();
        // 主刃光
        ctx.strokeStyle = `rgba(204,251,255,${.82 * fade})`; ctx.lineWidth = p.attackIndex === 2 ? 12 : 8;
        ctx.beginPath(); ctx.arc(28, -96, rad, aa - spread, aa + spread * .58); ctx.stroke();
        // 第二道水纹
        ctx.strokeStyle = `rgba(90,228,255,${.55 * fade})`; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(28, -96, rad + 17, aa - spread * .9, aa + spread * .48); ctx.stroke();
        // 刃尖星芒
        const tipA = aa + spread * .58;
        const tx = 28 + Math.cos(tipA) * rad, ty = -96 + Math.sin(tipA) * rad;
        glow(ctx, tx, ty, 26, '#a9f8ff', .2 * fade);
        ctx.fillStyle = `rgba(240,255,255,${.8 * fade})`;
        ctx.beginPath(); ctx.arc(tx, ty, 3.2, 0, TAU); ctx.fill();
        for (let i = 0; i < 4; i++) {
          const a2 = aa - spread * .4 + i * spread * .3;
          ctx.strokeStyle = `rgba(162,242,255,${.28 * fade})`; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(28, -96, rad - 22 - i * 8, a2, a2 + .22); ctx.stroke();
        }
        ctx.restore();
      }
    }
    if (p.state === 'skill') {
      const pr = U.clamp(p.stateT / .62, 0, 1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = U.rgba('#80efff', .28 * (1 - pr) * (i === 0 ? 1 : .6));
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(28, -98, 30 + pr * 70 + i * 14, 53 + pr * 95 + i * 20, .1, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    }
    if (p.state === 'heal') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const a = t * 1.8 + i * 1.3;
        ctx.fillStyle = 'rgba(140,250,255,.5)';
        ctx.beginPath(); ctx.arc(Math.cos(a) * (24 + i * 4), -95 + Math.sin(a) * 34, 2.2, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    if (p.state === 'ultimate') {
      const pr = U.clamp(p.stateT / 2.1, 0, 1);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, -105, 150, '#67e7ff', .14);
      ctx.strokeStyle = `rgba(125,238,255,${.35 * (1 - Math.abs(pr - .5) * 1.4)})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.ellipse(0, -90, 90 + i * 24 + pr * 150, 34 + i * 9 + pr * 50, t * .2 + i, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    }
    // 受击闪光
    if (p.hurtFlash > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(.6, p.hurtFlash * 2);
      ctx.fillStyle = '#ff8f86'; ellipse(ctx, 0, -95, 45, 93, 0); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }

  function drawBoss(ctx, b, t) {
    const phase = b.phase || 1;
    const stateT = b.stateT || 0;
    const deathFade = b.dead ? U.clamp(1 - (b.deathT || 0) / 2.6, 0, 1) : 1;
    let rise = 0, lean = 0, arm = 0, sword = .45, bob = Math.sin(t * 1.6) * 3;
    if (b.state === 'windup') { sword = -1.7 + Math.min(1, stateT / .55) * .4; arm = -.8; lean = -.03; }
    if (b.state === 'attack') { sword = U.lerp(-1.4, 1.55, U.easeOutCubic(Math.min(1, stateT / .24))); lean = .22; arm = .8; }
    if (b.state === 'stagger') { lean = -.15; sword = 1.3; bob = 6; }
    if (b.state === 'transition') { rise = -Math.sin(Math.min(1, stateT / 1.6) * Math.PI) * 38; sword = -1.2; arm = -1; }
    if (b.state === 'dead') { lean = -.3; bob = 14; sword = 1.6; }
    if (b.state === 'dash') { lean = .45; sword = .1; }
    ctx.save();
    ctx.globalAlpha = deathFade;
    ctx.translate(b.x, b.y + rise + bob);
    ctx.scale(b.facing || -1, 1);
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,.44)';
    ctx.beginPath(); ctx.ellipse(0, 4, 80, 17, 0, 0, TAU); ctx.fill();
    ctx.rotate(lean);
    if (b.dead) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, -170, 250, '#ffd9a0', .16 * (1 - deathFade));
      ctx.restore();
    }

    // 魔气
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const aura = phase === 1 ? '#d94a42' : phase === 2 ? '#ff573e' : '#ffd79e';
    glow(ctx, 0, -170, 210, aura, .09 + Math.sin(t * 2) * .015);
    for (let i = 0; i < 3; i++) {
      const a = t * .35 + i * 2.1;
      ctx.strokeStyle = U.rgba(aura, .07);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -135, 95 + i * 18, a, a + 1.2); ctx.stroke();
    }
    ctx.restore();

    // 披风
    const capeW = Math.sin(t * 1.7) * 13;
    const capeG = ctx.createLinearGradient(0, -260, 0, -15);
    capeG.addColorStop(0, '#151219'); capeG.addColorStop(.5, '#251419'); capeG.addColorStop(1, '#0a080b');
    ctx.fillStyle = capeG;
    ctx.beginPath();
    ctx.moveTo(-43, -245);
    ctx.bezierCurveTo(-108, -205, -123 + capeW, -72, -82 + capeW, -10);
    ctx.quadraticCurveTo(-38, -26, -12, -36);
    ctx.lineTo(-34, -225); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(177,45,41,.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-50, -228); ctx.bezierCurveTo(-97, -170, -91 + capeW, -78, -71 + capeW, -24); ctx.stroke();

    // 腿
    limb(ctx, -20, -102, -28, -45, 30, '#10151c');
    limb(ctx, -28, -45, -40, -5, 26, '#0b1015');
    limb(ctx, 20, -102, 28, -45, 30, '#151b22');
    limb(ctx, 28, -45, 42, -4, 26, '#0c1117');
    // 靴甲
    ctx.fillStyle = '#292b30';
    for (const side of [-1, 1]) {
      const fx = side > 0 ? 44 : -40;
      ctx.beginPath(); ctx.moveTo(fx - 23, -24); ctx.lineTo(fx + 23, -24); ctx.lineTo(fx + 18, 0); ctx.lineTo(fx - 16, 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7a2b2b'; ctx.fillRect(fx - 16, -10, 30, 3); ctx.fillStyle = '#292b30';
    }
    // 甲裙
    ctx.fillStyle = '#19171c';
    ctx.beginPath(); ctx.moveTo(-38, -135); ctx.lineTo(36, -135); ctx.lineTo(49, -75); ctx.lineTo(20, -55); ctx.lineTo(-25, -58); ctx.lineTo(-48, -78); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(155,51,45,.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-44, -104); ctx.lineTo(40, -108); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -75); ctx.lineTo(33, -79); ctx.stroke();
    // 身体
    const bg = ctx.createLinearGradient(-50, -260, 50, -110);
    bg.addColorStop(0, '#20242c'); bg.addColorStop(.4, '#2b2024'); bg.addColorStop(1, '#111016');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(-46, -242); ctx.quadraticCurveTo(-70, -186, -43, -128);
    ctx.quadraticCurveTo(0, -105, 45, -128);
    ctx.quadraticCurveTo(68, -184, 43, -242);
    ctx.quadraticCurveTo(0, -267, -46, -242); ctx.closePath(); ctx.fill();
    // 胸甲与红纹
    ctx.fillStyle = '#16151a';
    ctx.beginPath(); ctx.moveTo(-34, -238); ctx.quadraticCurveTo(0, -255, 31, -237); ctx.lineTo(24, -180); ctx.quadraticCurveTo(0, -160, -27, -180); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = U.rgba(aura, .55); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, -235); ctx.lineTo(-7, -211); ctx.lineTo(8, -194); ctx.lineTo(-4, -172); ctx.stroke();
    ctx.strokeStyle = U.rgba(aura, .26);
    ctx.beginPath(); ctx.moveTo(-31, -212); ctx.lineTo(-10, -202); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(31, -212); ctx.lineTo(10, -202); ctx.stroke();
    ctx.restore();
    // 肩甲
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#1d1b20';
      ctx.beginPath(); ctx.ellipse(side * 47, -238, 28, 24, side * .25, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(160,56,48,.45)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(side * 47, -238, 19, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#31171a'; ctx.beginPath(); ctx.arc(side * 47, -238, 5, 0, TAU); ctx.fill();
    }
    // 高领
    ctx.fillStyle = '#0b0b10';
    ctx.beginPath(); ctx.moveTo(-31, -255); ctx.quadraticCurveTo(0, -278, 30, -255); ctx.lineTo(23, -237); ctx.quadraticCurveTo(0, -250, -23, -237); ctx.closePath(); ctx.fill();

    // 头
    const hy = -282;
    ctx.fillStyle = '#d9b09e';
    ctx.beginPath(); ctx.ellipse(0, hy, 34, 40, 0, 0, TAU); ctx.fill();
    // 颈
    ctx.fillStyle = '#b98d7f'; ctx.fillRect(-12, hy + 30, 24, 22);
    // 发
    ctx.fillStyle = '#0c0b10';
    ctx.beginPath();
    ctx.moveTo(-37, -270); ctx.quadraticCurveTo(-37, -329, 0, -328);
    ctx.quadraticCurveTo(37, -329, 38, -268);
    ctx.lineTo(25, -286); ctx.lineTo(19, -268); ctx.lineTo(11, -293); ctx.lineTo(1, -267); ctx.lineTo(-8, -295); ctx.lineTo(-18, -270); ctx.lineTo(-26, -289); ctx.closePath(); ctx.fill();
    // 发丝
    ctx.strokeStyle = 'rgba(89,83,92,.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-17, -315); ctx.lineTo(-27, -280); ctx.stroke();
    // 眉眼
    ctx.strokeStyle = '#171016'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-21, -287); ctx.lineTo(-5, -290); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, -290); ctx.lineTo(24, -286); ctx.stroke();
    ctx.fillStyle = '#160e12';
    ctx.beginPath(); ctx.ellipse(-12, -279, 4.2, 3, 0, 0, TAU); ctx.fill();
    // 右眼燃红
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, 16, -279, 16, '#ff4e40', .55);
    ctx.fillStyle = phase === 3 ? '#ffd9a0' : '#ff5a4a';
    ctx.beginPath(); ctx.ellipse(16, -279, 4.4, 3.2, 0, 0, TAU); ctx.fill();
    ctx.restore();
    // 疤 / 嘴
    ctx.strokeStyle = 'rgba(92,52,48,.7)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(22, -286); ctx.lineTo(28, -271); ctx.stroke();
    ctx.strokeStyle = '#8b5c58'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-7, -259); ctx.lineTo(10, -260); ctx.stroke();
    // 发间赤角（二阶段）
    if (phase >= 2) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,85,60,.5)';
      ctx.beginPath(); ctx.moveTo(-27, -318); ctx.quadraticCurveTo(-48, -350, -35, -361); ctx.quadraticCurveTo(-22, -342, -15, -321); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(24, -318); ctx.quadraticCurveTo(45, -348, 34, -360); ctx.quadraticCurveTo(22, -340, 13, -320); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // 手臂 / 巨刃
    const handX = 32 + Math.sin(arm) * 28, handY = -188 + Math.cos(arm) * 20;
    limb(ctx, 30, -230, handX, handY, 24, '#1d1b20');
    ctx.fillStyle = '#d9b09e'; ctx.beginPath(); ctx.arc(handX, handY, 10, 0, TAU); ctx.fill();
    drawBossBlade(ctx, handX, handY, sword, phase);
    // 受击 / 阶段光
    if (b.hurtFlash > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(.6, b.hurtFlash * 2.4);
      ctx.fillStyle = '#ffb3a8'; ellipse(ctx, 0, -170, 64, 145, 0); ctx.fill(); ctx.restore();
    }
    if (phase === 3) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,221,173,.32)'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        const a = t * .5 + i * 1.4;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * 30, -250 + Math.sin(a) * 35); ctx.lineTo(Math.cos(a) * 76, -250 + Math.sin(a) * 96); ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function drawBossBlade(ctx, x, y, angle, phase) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(1.35, 1.35);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = phase >= 2 ? 'rgba(255,73,53,.24)' : 'rgba(212,62,55,.16)';
    ctx.lineWidth = 20; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(35, 0); ctx.lineTo(175, 0); ctx.stroke();
    ctx.restore();
    // 柄
    ctx.fillStyle = '#171317'; rr(ctx, -35, -7, 72, 14, 4); ctx.fill();
    ctx.strokeStyle = '#5f2725'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-30 + i * 12, -7); ctx.lineTo(-25 + i * 12, 7); ctx.stroke(); }
    ctx.fillStyle = '#5b2924'; rr(ctx, 24, -16, 18, 32, 3); ctx.fill();
    ctx.fillStyle = '#2a1c1b'; ctx.beginPath(); ctx.arc(32, 0, 5, 0, TAU); ctx.fill();
    // 断刃
    const g = ctx.createLinearGradient(40, 0, 190, 0);
    g.addColorStop(0, '#4c4d54'); g.addColorStop(.45, '#a8a29a'); g.addColorStop(1, '#58565b');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(42, -13); ctx.lineTo(130, -10); ctx.lineTo(170, -2); ctx.lineTo(145, 3); ctx.lineTo(172, 8);
    ctx.lineTo(118, 12); ctx.lineTo(42, 13); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = phase >= 2 ? 'rgba(255,94,67,.7)' : 'rgba(160,50,44,.5)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(50, -4); ctx.lineTo(150, 1); ctx.stroke();
    ctx.fillStyle = 'rgba(20,13,15,.55)';
    ctx.beginPath(); ctx.moveTo(115, -10); ctx.lineTo(130, -2); ctx.lineTo(118, 9); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  /* ---------- 敌人 ---------- */
  function drawEnemy(ctx, e, t) {
    if (e.dead && e.deathT > .6) return;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.scale(e.facing || 1, 1);
    if (e.dead) { ctx.globalAlpha = Math.max(0, 1 - e.deathT * 1.6); ctx.translate(0, e.deathT * 25); }
    const wob = Math.sin(t * 4 + (e.seed || 0)) * 3;
    const wind = e.state === 'windup';
    const atk = e.state === 'attack';
    // 影子
    if (!e.flying) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 2, e.size * .56, e.size * .12, 0, 0, TAU); ctx.fill(); }
    if (e.hurtFlash > 0) ctx.globalAlpha *= .75;

    if (e.type === 'inkling') {
      const s = e.size || 78;
      ctx.save(); ctx.translate(0, -s * .55 + wob);
      inkBlob(ctx, 0, 0, s * .62, s * .5, '#0c2028', (e.seed || 1) * 3, 14);
      // 墨触须
      ctx.strokeStyle = 'rgba(11,34,42,.7)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        const a = Math.PI * .65 + i * .38;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * .45, Math.sin(a) * s * .28);
        ctx.quadraticCurveTo(Math.cos(a) * s * .72, Math.sin(a) * s * .55, Math.cos(a) * s * .76, Math.sin(a) * s * .48 + Math.sin(t * 3 + i) * 6);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(76,139,149,.18)'; ctx.beginPath(); ctx.ellipse(-8, -12, s * .32, s * .18, -.3, 0, TAU); ctx.fill();
      // 角
      ctx.fillStyle = '#24363d';
      ctx.beginPath(); ctx.moveTo(-s * .26, -s * .12); ctx.quadraticCurveTo(-s * .42, -s * .42, -s * .16, -s * .34); ctx.quadraticCurveTo(-s * .12, -s * .22, -s * .12, -s * .16); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * .26, -s * .12); ctx.quadraticCurveTo(s * .44, -s * .4, s * .18, -s * .34); ctx.quadraticCurveTo(s * .14, -s * .22, s * .12, -s * .16); ctx.closePath(); ctx.fill();
      // 面具
      ctx.fillStyle = '#d8d5c7';
      ctx.beginPath();
      ctx.moveTo(-s * .29, -s * .2); ctx.quadraticCurveTo(0, -s * .36, s * .3, -s * .2);
      ctx.quadraticCurveTo(s * .4, -s * .02, s * .2, s * .18); ctx.quadraticCurveTo(0, s * .3, -s * .22, s * .16);
      ctx.quadraticCurveTo(-s * .4, -s * .02, -s * .29, -s * .2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(43,72,76,.55)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-s * .22, -s * .08); ctx.lineTo(-s * .04, -s * .02); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s * .22, -s * .08); ctx.lineTo(s * .04, -s * .02); ctx.stroke();
      // 眼
      ctx.fillStyle = wind || atk ? '#ff6758' : '#173940';
      ctx.beginPath(); ctx.ellipse(-s * .095, -s * .05, s * .042, s * .025, -.22, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s * .105, -s * .04, s * .046, s * .027, .2, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,232,.65)';
      ctx.beginPath(); ctx.arc(-s * .085, -s * .06, 1.3, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(s * .118, -s * .05, 1.3, 0, TAU); ctx.fill();
      // 裂口笑
      ctx.strokeStyle = 'rgba(36,43,44,.7)'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-s * .12, s * .08); ctx.lineTo(-s * .04, s * .12); ctx.lineTo(s * .02, s * .08);
      ctx.lineTo(s * .08, s * .12); ctx.lineTo(s * .14, s * .07); ctx.stroke();
      // 爪
      ctx.strokeStyle = '#182b34'; ctx.lineWidth = 3.4;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(s * .3, s * .2); ctx.lineTo(s * .58, s * .42 + i * 5); ctx.stroke();
      }
      if (atk || wind) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, s * .7, wind ? '#ff7664' : '#64e5ff', .15); ctx.restore();
      }
      ctx.restore();
    } else if (e.type === 'paper') {
      const s = e.size || 62;
      ctx.save(); ctx.translate(0, -s * 1.6 + wob * 1.7);
      // 纸伞帽
      ctx.fillStyle = '#8f3d35';
      ctx.beginPath(); ctx.moveTo(-s * .65, -s * .2); ctx.quadraticCurveTo(0, -s * .95, s * .65, -s * .2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(227,185,123,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-s * .6, -s * .18); ctx.lineTo(s * .6, -s * .18); ctx.stroke();
      // 袍
      const pg = ctx.createLinearGradient(0, -s * .25, 0, s * .9);
      pg.addColorStop(0, '#b9b3a3'); pg.addColorStop(1, '#5e625e');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.moveTo(-s * .3, -s * .25); ctx.lineTo(s * .28, -s * .25); ctx.lineTo(s * .52, s * .75); ctx.lineTo(0, s * .95); ctx.lineTo(-s * .48, s * .72); ctx.closePath(); ctx.fill();
      // 符
      ctx.fillStyle = '#e6d6a7'; ctx.fillRect(-s * .09, -s * .05, s * .2, s * .48);
      ctx.strokeStyle = 'rgba(143,45,37,.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, s * .02); ctx.lineTo(-s * .02, s * .18); ctx.lineTo(s * .05, s * .3); ctx.stroke();
      // 无脸
      ctx.fillStyle = '#e4dcc8'; ctx.beginPath(); ctx.arc(0, -s * .4, s * .2, 0, TAU); ctx.fill();
      ctx.fillStyle = wind ? '#ff6758' : '#20343a'; ctx.beginPath(); ctx.arc(-4, -s * .42, 2.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(7, -s * .41, 2.4, 0, TAU); ctx.fill();
      if (atk) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, -s * .4, s * .5, '#64e5ff', .2); ctx.restore();
      }
      ctx.restore();
    } else if (e.type === 'shield') {
      const s = e.size || 80;
      ctx.save(); ctx.translate(0, -s * .55);
      // 铜甲
      ctx.fillStyle = '#2a2c2b';
      ctx.beginPath(); ctx.moveTo(-s * .37, -s * .12); ctx.lineTo(-s * .25, -s * .3); ctx.lineTo(s * .24, -s * .3); ctx.lineTo(s * .39, -s * .08); ctx.lineTo(s * .26, s * .45); ctx.lineTo(-s * .24, s * .46); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6a5837';
      for (let i = 0; i < 3; i++) { ctx.fillRect(-s * .28, -s * .2 + i * 9, s * .54, 3); }
      // 头盔
      ctx.fillStyle = '#7c6c45'; ctx.beginPath(); ctx.arc(0, -s * .39, s * .2, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#171e20'; ctx.fillRect(-s * .15, -s * .4, s * .3, 6);
      ctx.fillStyle = '#ffbd64'; ctx.beginPath(); ctx.arc(-4, -s * .37, 2, 0, TAU); ctx.fill();
      // 盾
      ctx.save(); ctx.translate(s * .24, s * .02); ctx.rotate(-.1);
      ctx.fillStyle = '#4c4031'; ctx.beginPath(); ctx.ellipse(0, 0, s * .34, s * .42, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#a38755'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, s * .34, s * .42, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#6d3b29'; ctx.beginPath(); ctx.arc(0, 0, s * .12, 0, TAU); ctx.fill();
      ctx.restore();
      if (wind || atk) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 0, 0, s * .7, wind ? '#ff6e5e' : '#d9b56d', .12); ctx.restore();
      }
      ctx.restore();
    } else if (e.type === 'fox') {
      const s = e.size || 58;
      ctx.save(); ctx.translate(0, -s * .5 + wob * .6);
      // 尾
      ctx.strokeStyle = 'rgba(48,103,111,.6)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(-s * .3, 0); ctx.quadraticCurveTo(-s * .8, -s * .2, -s * .9 + Math.sin(t * 3 + i) * 7, -s * .6); ctx.stroke();
      }
      // 身
      ctx.fillStyle = '#0b1d25';
      ctx.beginPath(); ctx.ellipse(0, 0, s * .56, s * .3, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * .3, -s * .1); ctx.lineTo(s * .75, -s * .3); ctx.lineTo(s * .58, s * .05); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(s * .05, -s * .22); ctx.lineTo(s * .15, -s * .55); ctx.lineTo(s * .27, -s * .22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = wind ? '#ff6157' : '#68eaf8';
      ctx.beginPath(); ctx.ellipse(s * .58, -s * .2, 2.8, 1.7, 0, 0, TAU); ctx.fill();
      ctx.restore();
    } else if (e.type === 'crow') {
      const s = e.size || 52;
      const flap = Math.sin(t * 8 + (e.seed || 0)) * .5;
      ctx.save(); ctx.translate(0, -130 + wob);
      // 翅
      ctx.fillStyle = '#22252c';
      for (const side of [-1, 1]) {
        ctx.save(); ctx.scale(side, 1); ctx.rotate(-.2 + flap * side);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * .7, -s * .55, s * .95, -s * .1); ctx.quadraticCurveTo(s * .45, s * .15, 0, s * .1); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#0c1116'; ctx.beginPath(); ctx.ellipse(0, 0, s * .3, s * .2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#705634'; ctx.beginPath(); ctx.moveTo(s * .22, -s * .04); ctx.lineTo(s * .5, 0); ctx.lineTo(s * .22, s * .07); ctx.fill();
      ctx.fillStyle = '#ff6957'; ctx.beginPath(); ctx.arc(s * .13, -s * .05, 2, 0, TAU); ctx.fill();
      ctx.restore();
    } else if (e.type === 'elite') {
      drawElite(ctx, e, t, wind, atk, wob);
    }

    if (e.hurtFlash > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(.65, e.hurtFlash * 2.4);
      ctx.fillStyle = '#ffb0a4'; ctx.beginPath(); ctx.ellipse(0, -e.size * .65, e.size * .55, e.size * .8, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    ctx.restore();

    // 血条
    if (!e.dead && e.hp < e.maxHp && !e.isElite) {
      const w = 58, h = 4, yy = e.y - e.size * 1.9 - 14;
      ctx.fillStyle = 'rgba(3,8,10,.7)'; ctx.fillRect(e.x - w / 2, yy, w, h);
      ctx.fillStyle = e.hp / e.maxHp > .4 ? '#6dd9c8' : '#dc6b5a';
      ctx.fillRect(e.x - w / 2, yy, w * (e.hp / e.maxHp), h);
    }
  }

  function drawElite(ctx, e, t, wind, atk, wob) {
    const s = e.size || 130;
    const variant = e.variant || 'sword';
    ctx.save(); ctx.translate(0, -s * .03 + wob);
    // 脚下光环
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = variant === 'snow' ? 'rgba(116,230,255,.2)' : variant === 'paper' ? 'rgba(238,207,151,.2)' : 'rgba(255,95,75,.17)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 0, s * .7, 16, 0, 0, TAU); ctx.stroke();
    ctx.restore();
    // 袍
    const c1 = variant === 'snow' ? '#173644' : variant === 'paper' ? '#8e826b' : '#1b1720';
    const c2 = variant === 'snow' ? '#2f7283' : variant === 'paper' ? '#d3c6a9' : '#4b1f24';
    const g = ctx.createLinearGradient(0, -s * 2.2, 0, 0);
    g.addColorStop(0, c1); g.addColorStop(1, '#080b0d');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-s * .3, -s * 1.55); ctx.quadraticCurveTo(-s * .7, -s * .7, -s * .62, 0); ctx.quadraticCurveTo(0, s * .12, s * .6, 0); ctx.quadraticCurveTo(s * .72, -s * .8, s * .31, -s * 1.55); ctx.quadraticCurveTo(0, -s * 1.72, -s * .3, -s * 1.55); ctx.closePath(); ctx.fill();
    // 内衬
    ctx.fillStyle = c2; ctx.globalAlpha *= .75;
    ctx.beginPath(); ctx.moveTo(-s * .15, -s * 1.45); ctx.lineTo(s * .16, -s * 1.45); ctx.lineTo(s * .33, -s * .2); ctx.lineTo(0, s * .03); ctx.lineTo(-s * .3, -s * .2); ctx.closePath(); ctx.fill();
    ctx.globalAlpha /= .75;
    // 腰带
    ctx.fillStyle = variant === 'paper' ? '#6f2b24' : '#48232a'; ctx.fillRect(-s * .34, -s * .72, s * .68, s * .09);
    // 肩与长袖
    for (const side of [-1, 1]) {
      ctx.fillStyle = variant === 'snow' ? '#26505e' : variant === 'paper' ? '#b3a487' : '#2b222b';
      ctx.beginPath(); ctx.ellipse(side * s * .32, -s * 1.42, s * .19, s * .14, side * .2, 0, TAU); ctx.fill();
      // 冰刺 / 纸符 / 铁刺
      if (variant === 'snow') {
        ctx.fillStyle = 'rgba(162,239,252,.48)';
        for (let k = 0; k < 3; k++) {
          ctx.beginPath();
          ctx.moveTo(side * s * (.28 + k * .04), -s * 1.48);
          ctx.lineTo(side * s * (.28 + k * .06), -s * (1.64 + k * .06));
          ctx.lineTo(side * s * (.36 + k * .04), -s * 1.48);
          ctx.closePath(); ctx.fill();
        }
      } else if (variant === 'paper') {
        ctx.fillStyle = 'rgba(232,219,190,.7)';
        ctx.beginPath(); ctx.moveTo(side * s * .38, -s * 1.46); ctx.lineTo(side * s * .54, -s * 1.35); ctx.lineTo(side * s * .41, -s * 1.24); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = '#522029';
        ctx.beginPath(); ctx.moveTo(side * s * .35, -s * 1.48); ctx.lineTo(side * s * .52, -s * 1.37); ctx.lineTo(side * s * .37, -s * 1.25); ctx.closePath(); ctx.fill();
      }
      // 宽袖
      const sleeveC = variant === 'snow' ? 'rgba(34,87,101,.8)' : variant === 'paper' ? 'rgba(162,146,112,.82)' : 'rgba(38,25,32,.9)';
      ctx.fillStyle = sleeveC;
      ctx.beginPath();
      ctx.moveTo(side * s * .20, -s * 1.37);
      ctx.quadraticCurveTo(side * s * .44, -s * 1.05, side * s * .39, -s * .62);
      ctx.lineTo(side * s * .19, -s * .68);
      ctx.quadraticCurveTo(side * s * .27, -s * 1.02, side * s * .10, -s * 1.28);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = variant === 'paper' ? 'rgba(110,43,36,.4)' : 'rgba(172,222,228,.12)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(side * s * .3, -s * 1.22); ctx.lineTo(side * s * .34, -s * .74); ctx.stroke();
      // 手
      ctx.fillStyle = variant === 'snow' ? '#cfe7e8' : variant === 'paper' ? '#d9cfb7' : '#c7a092';
      ctx.beginPath(); ctx.arc(side * s * .36, -s * .63, s * .045, 0, TAU); ctx.fill();
    }
    // 头
    const hy = -s * 1.72;
    if (variant === 'paper') {
      ctx.fillStyle = '#e6ddc8'; ctx.beginPath(); ctx.arc(0, hy, s * .14, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(138,45,36,.62)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-s * .06, hy - s * .02); ctx.lineTo(s * .05, hy - s * .02); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-s * .03, hy + s * .07); ctx.quadraticCurveTo(0, hy + s * .09, s * .03, hy + s * .07); ctx.stroke();
      // 纸折痕
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = 'rgba(128,112,87,.35)'; ctx.beginPath(); ctx.moveTo(-s * .2, hy - s * .1 + i * 7); ctx.lineTo(s * .2, hy - s * .08 + i * 7); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(69,35,30,.6)'; ctx.beginPath(); ctx.arc(-s * .04, hy - s * .015, 1.8, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(s * .05, hy - s * .01, 1.8, 0, TAU); ctx.fill();
    } else {
      ctx.fillStyle = variant === 'snow' ? '#d6e0de' : '#cba99c';
      ctx.beginPath(); ctx.arc(0, hy, s * .145, 0, TAU); ctx.fill();
      // 面具
      if (variant === 'snow') {
        ctx.fillStyle = '#a8c9cf'; ctx.beginPath(); ctx.ellipse(4, hy, s * .145, s * .12, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#13333d'; ctx.beginPath(); ctx.ellipse(0, hy - 2, 3, 1.8, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(s * .08, hy - 2, 3, 1.8, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(21,52,62,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-s * .06, hy + s * .05); ctx.lineTo(s * .11, hy + s * .05); ctx.stroke();
      } else {
        ctx.fillStyle = '#171116'; ctx.beginPath(); ctx.arc(0, hy, s * .147, Math.PI * 1.1, Math.PI * 1.95); ctx.fill();
        ctx.fillStyle = '#ff6757'; ctx.beginPath(); ctx.arc(s * .05, hy - 1, 2.2, 0, TAU); ctx.fill();
      }
    }
    // 头顶长影 / 符纸环
    ctx.fillStyle = variant === 'paper' ? 'rgba(72,65,53,.5)' : 'rgba(5,14,18,.55)';
    ctx.beginPath();
    ctx.moveTo(-s * .25, hy - s * .08);
    ctx.quadraticCurveTo(-s * .38, hy - s * .36, 0, hy - s * .43);
    ctx.quadraticCurveTo(s * .38, hy - s * .36, s * .25, hy - s * .08);
    ctx.quadraticCurveTo(s * .14, hy - s * .21, 0, hy - s * .19);
    ctx.quadraticCurveTo(-s * .14, hy - s * .21, -s * .25, hy - s * .08);
    ctx.closePath(); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const a = t * .53 + i * 1.57;
      const rx = Math.cos(a) * s * .44, ry = -s * 1.1 + Math.sin(a) * s * .1;
      ctx.fillStyle = variant === 'snow' ? 'rgba(132,233,249,.32)' : variant === 'paper' ? 'rgba(237,209,154,.25)' : 'rgba(255,92,74,.22)';
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(a);
      ctx.fillRect(-s * .025, -s * .01, s * .05, s * .02);
      ctx.restore();
    }
    ctx.restore();
    // 武器
    if (variant === 'snow') {
      // 灯
      ctx.strokeStyle = '#5b7b80'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s * .28, -s * 1.25); ctx.lineTo(s * .55, -s * .75); ctx.stroke();
      lantern(ctx, s * .57, -s * .54, .5, t, '#8ce9ff');
    } else if (variant === 'paper') {
      // 纸幡
      ctx.strokeStyle = '#8f8067'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s * .3, -s * 1.3); ctx.lineTo(s * .55, 0); ctx.stroke();
      ctx.fillStyle = 'rgba(225,213,185,.75)';
      ctx.beginPath(); ctx.moveTo(s * .55, -s * 1.1); ctx.lineTo(s * .92, -s * .95 + Math.sin(t * 2) * 5); ctx.lineTo(s * .68, -s * .48); ctx.lineTo(s * .54, -s * .62); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(130,47,37,.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(s * .65, -s * .92); ctx.lineTo(s * .71, -s * .68); ctx.stroke();
    } else {
      // 长刀
      ctx.save(); ctx.translate(s * .34, -s * 1.1); ctx.rotate(wind ? -2.1 : atk ? .9 : -.2);
      ctx.fillStyle = '#21171b'; ctx.fillRect(-12, -4, 50, 8);
      const bg = ctx.createLinearGradient(40, 0, 160, 0);
      bg.addColorStop(0, '#b34d43'); bg.addColorStop(1, '#eae5da');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.moveTo(38, -5); ctx.lineTo(150, -2); ctx.lineTo(165, 1); ctx.lineTo(150, 4); ctx.lineTo(38, 5); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    if (wind || atk) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, -s, s * .8, wind ? '#ff6b58' : '#7be9ff', .11);
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- 投射物 / 危险区 ---------- */
  function drawProjectile(ctx, p, t) {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.kind === 'playerWave') {
      ctx.rotate(p.angle || 0);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(-40, 0, 40, 0);
      g.addColorStop(0, 'rgba(73,205,238,0)'); g.addColorStop(.45, 'rgba(155,250,255,.8)'); g.addColorStop(1, 'rgba(237,255,255,.15)');
      ctx.strokeStyle = g; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 45, -1.05, 1.05); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 47, -.95, .95); ctx.stroke();
      ctx.restore(); return;
    }
    if (p.kind === 'enemyBolt' || p.kind === 'bossOrb') {
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, 0, p.r * 4, p.kind === 'bossOrb' ? '#ff5848' : '#8ae8f4', .16);
      ctx.fillStyle = p.kind === 'bossOrb' ? '#ff8b71' : '#9af4ff';
      ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-p.r * .2, -p.r * .25, p.r * .35, 0, TAU); ctx.fill();
      ctx.restore(); return;
    }
    if (p.kind === 'bossWave') {
      ctx.scale(p.dir || 1, 1);
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, 0, 55, '#ff4e42', .18);
      ctx.strokeStyle = 'rgba(255,99,79,.65)'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 42, -.9, .9); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,214,177,.65)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 34, -.9, .9); ctx.stroke();
      ctx.restore(); return;
    }
    if (p.kind === 'spike') {
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, 0, 50, '#ff6b4b', .15);
      ctx.fillStyle = 'rgba(255,96,72,.55)';
      ctx.beginPath(); ctx.moveTo(-18, 25); ctx.lineTo(0, -62); ctx.lineTo(20, 25); ctx.closePath(); ctx.fill();
      ctx.restore(); return;
    }
    ctx.restore();
  }

  function drawHazard(ctx, h, t) {
    ctx.save(); ctx.translate(h.x, h.y);
    const active = h.timer > h.delay;
    if (!active) {
      const p = Math.min(1, h.timer / h.delay);
      ctx.globalAlpha = .35 + Math.sin(t * 9) * .08;
      ctx.strokeStyle = h.kind === 'fire' ? '#ff7553' : '#ffd093';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath(); ctx.ellipse(0, 0, h.w / 2, h.h / 2, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = h.kind === 'fire' ? 'rgba(255,97,64,.13)' : 'rgba(255,213,152,.08)';
      ctx.beginPath(); ctx.ellipse(0, 0, h.w / 2 * p, h.h / 2 * p, 0, 0, TAU); ctx.fill();
    } else {
      const a = Math.min(1, (h.timer - h.delay) / .2) * Math.min(1, (h.life - h.timer) / .2 + .2);
      ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 0, -30, h.w * .7, h.kind === 'fire' ? '#ff5c41' : '#ffc077', .18 * a);
      if (h.kind === 'fire') {
        for (let i = 0; i < 8; i++) {
          const xx = (U.hash(i + h.seed) - .5) * h.w * .8;
          const hh = 55 + U.hash(i + 3) * 85;
          ctx.fillStyle = `rgba(255,${110 + i * 9},${52 + i * 5},${.22 * a})`;
          ctx.beginPath(); ctx.moveTo(xx - 16, 0); ctx.quadraticCurveTo(xx - 7, -hh * .55, xx + Math.sin(t * 5 + i) * 8, -hh); ctx.quadraticCurveTo(xx + 18, -hh * .4, xx + 15, 0); ctx.closePath(); ctx.fill();
        }
      } else {
        ctx.fillStyle = `rgba(255,197,128,${.24 * a})`;
        ctx.beginPath(); ctx.ellipse(0, -20, h.w * .3, 40, 0, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  /* ---------- 头像 ---------- */
  function drawPortrait(canvas, who, opts) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * .5, h * .36, 4, w * .5, h * .5, w * .7);
    if (who === 'liuao') { g.addColorStop(0, '#3b1b1c'); g.addColorStop(1, '#11100f'); }
    else if (who === 'alan') { g.addColorStop(0, '#2c3531'); g.addColorStop(1, '#111716'); }
    else if (who === 'narrator' || who === 'echo') { g.addColorStop(0, '#17242a'); g.addColorStop(1, '#080e11'); }
    else { g.addColorStop(0, '#1a3b4a'); g.addColorStop(1, '#081117'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // 光晕
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, w * .5, h * .4, w * .45, who === 'liuao' ? '#ff5848' : who === 'alan' ? '#e8cf9e' : '#64e5ff', .06);
    ctx.restore();
    ctx.save();
    ctx.translate(w / 2, h * .9);
    ctx.scale(w / 210, w / 210);
    if (who === 'liuao') {
      // 半身像
      ctx.fillStyle = '#d2af9f'; ctx.beginPath(); ctx.ellipse(0, -105, 38, 44, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0d0d12';
      ctx.beginPath(); ctx.moveTo(-42, -96); ctx.quadraticCurveTo(-44, -166, 0, -166); ctx.quadraticCurveTo(45, -167, 43, -92); ctx.lineTo(27, -124); ctx.lineTo(17, -96); ctx.lineTo(6, -129); ctx.lineTo(-5, -95); ctx.lineTo(-18, -128); ctx.lineTo(-27, -96); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#171820'; ctx.beginPath(); ctx.moveTo(-64, 10); ctx.lineTo(-47, -63); ctx.quadraticCurveTo(0, -98, 50, -62); ctx.lineTo(67, 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b84b43'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-9, -58); ctx.lineTo(7, -22); ctx.lineTo(-1, 6); ctx.stroke();
      ctx.fillStyle = '#150f14'; ctx.beginPath(); ctx.ellipse(-14, -111, 4, 3, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 15, -111, 13, '#ff5a4a', .5); ctx.fillStyle = '#ff6555'; ctx.beginPath(); ctx.ellipse(15, -111, 4, 3, 0, 0, TAU); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(96,50,44,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-11, -88); ctx.lineTo(12, -89); ctx.stroke();
    } else if (who === 'alan') {
      ctx.fillStyle = '#ead8bd'; ctx.beginPath(); ctx.ellipse(0, -106, 36, 42, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#d9d5c2'; ctx.beginPath(); ctx.moveTo(-45, -92); ctx.quadraticCurveTo(-48, -168, 0, -170); ctx.quadraticCurveTo(48, -168, 46, -91); ctx.lineTo(32, -127); ctx.lineTo(21, -99); ctx.lineTo(8, -131); ctx.lineTo(-3, -99); ctx.lineTo(-17, -130); ctx.lineTo(-27, -98); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f2eee1'; ctx.beginPath(); ctx.moveTo(-58, 10); ctx.lineTo(-42, -65); ctx.quadraticCurveTo(0, -96, 44, -64); ctx.lineTo(60, 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#403f3b'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-20, -112); ctx.quadraticCurveTo(-13, -115, -6, -112); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7, -112); ctx.quadraticCurveTo(14, -115, 20, -112); ctx.stroke();
      ctx.fillStyle = '#5a5149'; ctx.beginPath(); ctx.arc(-13, -107, 2.2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(13, -107, 2.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(139,91,78,.6)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-5, -91); ctx.quadraticCurveTo(0, -88, 6, -91); ctx.stroke();
      // 纸/魂
      ctx.globalAlpha = .15; ctx.fillStyle = '#fff';
      for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc((U.hash(i) - .5) * 150, (U.hash(i + 2) - .5) * 160, 1.4, 0, TAU); ctx.fill(); }
    } else if (who === 'narrator') {
      // 说书人 · 周娣
      const robe = ctx.createLinearGradient(-70, -30, 70, 20);
      robe.addColorStop(0, '#203b43'); robe.addColorStop(.55, '#315961'); robe.addColorStop(1, '#14282f');
      ctx.fillStyle = robe;
      ctx.beginPath(); ctx.moveTo(-72, 12); ctx.quadraticCurveTo(-60, -63, -24, -82);
      ctx.quadraticCurveTo(5, -99, 35, -80); ctx.quadraticCurveTo(68, -57, 75, 12); ctx.closePath(); ctx.fill();
      // 长发
      const hg = ctx.createLinearGradient(-50, -170, 50, 10);
      hg.addColorStop(0, '#111a23'); hg.addColorStop(.55, '#223844'); hg.addColorStop(1, '#0a1218');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.ellipse(4, -112, 50, 55, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-47, -124); ctx.quadraticCurveTo(-75, -45, -58, 12); ctx.lineTo(-27, 3); ctx.quadraticCurveTo(-45, -60, -27, -131); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(45, -127); ctx.quadraticCurveTo(72, -50, 56, 12); ctx.lineTo(22, 2); ctx.quadraticCurveTo(42, -60, 25, -133); ctx.closePath(); ctx.fill();
      // 脸
      const fg = ctx.createRadialGradient(16, -127, 5, 3, -117, 46);
      fg.addColorStop(0, '#f7e5d3'); fg.addColorStop(.65, '#ead3c1'); fg.addColorStop(1, '#cba994');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.moveTo(-33, -130); ctx.quadraticCurveTo(-31, -91, -7, -77);
      ctx.quadraticCurveTo(27, -65, 37, -102); ctx.quadraticCurveTo(44, -138, 8, -160);
      ctx.quadraticCurveTo(-22, -159, -33, -130); ctx.closePath(); ctx.fill();
      // 侧发
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.moveTo(-37, -145); ctx.quadraticCurveTo(-53, -105, -38, -68); ctx.quadraticCurveTo(-29, -105, -24, -147); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(38, -143); ctx.quadraticCurveTo(48, -102, 32, -72); ctx.quadraticCurveTo(28, -108, 28, -146); ctx.closePath(); ctx.fill();
      // 眉眼
      ctx.strokeStyle = '#1b2730'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-24, -137); ctx.quadraticCurveTo(-16, -141, -7, -137); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(9, -137); ctx.quadraticCurveTo(18, -141, 25, -137); ctx.stroke();
      for (const ex of [-14, 18]) {
        ctx.fillStyle = '#fbf0e2'; ctx.beginPath(); ctx.ellipse(ex, -124, 10, 6, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#142630'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(ex, -124, 10, 6, 0, 0, TAU); ctx.stroke();
        ctx.fillStyle = '#21333b'; ctx.beginPath(); ctx.ellipse(ex, -124, 4.3, 5.2, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#071217'; ctx.beginPath(); ctx.ellipse(ex, -124, 2.1, 4, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(ex - 1.6, -126, 1.3, 0, TAU); ctx.fill();
      }
      // 红唇 / 朱砂
      ctx.fillStyle = 'rgba(158,66,62,.8)'; ctx.beginPath(); ctx.ellipse(2, -91, 5.3, 2.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(165,45,40,.7)'; ctx.beginPath(); ctx.arc(2, -154, 2.2, 0, TAU); ctx.fill();
      // 领口 / 金线
      ctx.strokeStyle = 'rgba(220,190,130,.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-29, -72); ctx.quadraticCurveTo(2, -53, 32, -73); ctx.stroke();
      ctx.fillStyle = '#182c32'; ctx.beginPath(); ctx.moveTo(-13, -75); ctx.lineTo(5, -48); ctx.lineTo(23, -75); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(110,229,255,.28)'; ctx.beginPath(); ctx.moveTo(-24, -63); ctx.lineTo(1, -43); ctx.lineTo(29, -65); ctx.stroke();
      // 折扇
      ctx.save(); ctx.translate(44, -22); ctx.rotate(.28);
      ctx.fillStyle = 'rgba(226,216,190,.9)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 38, -2.2, -.35); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(76,55,44,.65)'; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const a = -2.1 + i * .33; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 36, Math.sin(a) * 36); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(32,55,61,.7)'; ctx.beginPath(); ctx.arc(0, 0, 37, -2.15, -.4); ctx.stroke();
      ctx.fillStyle = '#5b2b2a'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
      ctx.restore();
      // 发簪
      ctx.strokeStyle = '#c6a266'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-39, -150); ctx.lineTo(-62, -137); ctx.stroke();
      ctx.fillStyle = '#8eefff'; ctx.beginPath(); ctx.arc(-63, -136, 4, 0, TAU); ctx.fill();
    } else if (who === 'echo') {
      ctx.restore();
      ctx.save(); ctx.translate(w / 2, h / 2);
      ctx.strokeStyle = 'rgba(126,208,220,.32)'; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, 26 + i * 12, -.4 + i, 2.2 + i); ctx.stroke(); }
      ctx.fillStyle = 'rgba(126,208,220,.4)'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
    } else {
      // 主角头肩
      ctx.fillStyle = '#f1d6c5'; ctx.beginPath(); ctx.ellipse(3, -108, 47, 50, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#205582';
      ctx.beginPath(); ctx.arc(3, -117, 55, Math.PI * .85, Math.PI * 2.15); ctx.quadraticCurveTo(61, -80, 40, -57); ctx.quadraticCurveTo(8, -78, -44, -62); ctx.quadraticCurveTo(-60, -92, -51, -116); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#eaf2ed';
      ctx.beginPath(); ctx.moveTo(-57, 12); ctx.lineTo(-42, -63); ctx.quadraticCurveTo(2, -94, 49, -62); ctx.lineTo(63, 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#193d5a'; ctx.beginPath(); ctx.moveTo(-43, -58); ctx.quadraticCurveTo(4, -83, 50, -58); ctx.lineTo(39, -39); ctx.quadraticCurveTo(0, -55, -35, -39); ctx.closePath(); ctx.fill();
      // 白色女仆围裙
      ctx.fillStyle = '#f8f5eb';
      ctx.beginPath(); ctx.moveTo(-22, -59); ctx.quadraticCurveTo(2, -82, 27, -59); ctx.lineTo(38, 12); ctx.lineTo(-38, 12); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-30 + i * 10, 9, 4.4, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#2f5cbb'; ctx.beginPath(); ctx.ellipse(1, -59, 14, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#8df4ff'; ctx.beginPath(); ctx.ellipse(1, -61, 5.5, 3, 0, 0, TAU); ctx.fill();
      // 刘海
      ctx.fillStyle = '#205582';
      ctx.beginPath(); ctx.moveTo(-48, -123); ctx.quadraticCurveTo(-25, -175, 18, -164); ctx.quadraticCurveTo(55, -155, 48, -104); ctx.lineTo(34, -136); ctx.lineTo(23, -107); ctx.lineTo(10, -140); ctx.lineTo(-2, -108); ctx.lineTo(-16, -142); ctx.lineTo(-29, -111); ctx.closePath(); ctx.fill();
      // 鲸鳍耳
      for (const side of [-1, 1]) {
        ctx.save(); ctx.translate(side * 48, -121); ctx.scale(side, 1);
        const fg = ctx.createLinearGradient(0, -42, 40, 18);
        fg.addColorStop(0, '#76efff'); fg.addColorStop(.5, '#3c86e5'); fg.addColorStop(1, '#203d95');
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(27, -34, 49, -23); ctx.quadraticCurveTo(39, -3, 31, 19); ctx.quadraticCurveTo(14, 13, 0, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(198,252,255,.62)'; ctx.lineWidth = 1.25;
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(8 + k * 6, -4); ctx.lineTo(24 + k * 5, -18 + k * 3); ctx.stroke(); }
        ctx.restore();
      }
      // 白色女仆发带
      ctx.fillStyle = '#f6f2e8';
      ctx.beginPath(); ctx.moveTo(-44, -145); ctx.quadraticCurveTo(0, -174, 45, -145); ctx.lineTo(37, -133); ctx.quadraticCurveTo(0, -157, -36, -133); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 8; i++) {
        const a = -1.4 + i * .4;
        ctx.beginPath(); ctx.arc(Math.sin(a) * 40, -146 - Math.cos(a) * 19, 3.1, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = '#315bc0'; ctx.beginPath(); ctx.ellipse(-35, -154, 8, 4, -.4, 0, TAU); ctx.fill();
      // 眼
      for (const [ex, ey, sz] of [[-13, -109, 8], [17, -108, 8.4]]) {
        ctx.fillStyle = '#10263b'; ctx.beginPath(); ctx.ellipse(ex, ey, sz, sz * 1.2, 0, 0, TAU); ctx.fill();
        const eg = ctx.createLinearGradient(ex, ey - 8, ex, ey + 8); eg.addColorStop(0, '#0f85a3'); eg.addColorStop(1, '#b8f9ff');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.ellipse(ex, ey + 1, sz * .58, sz * .84, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#061620'; ctx.beginPath(); ctx.ellipse(ex, ey + 1, sz * .24, sz * .55, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex - sz * .24, ey - sz * .3, sz * .2, 0, TAU); ctx.fill();
        // 半睑
        ctx.fillStyle = '#f1d6c5'; ctx.beginPath(); ctx.ellipse(ex, ey - sz * .82, sz * 1.05, sz * .4, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#19345a'; ctx.lineWidth = 1.05;
        ctx.beginPath(); ctx.moveTo(ex - sz * .9, ey - sz * .72); ctx.quadraticCurveTo(ex, ey - sz * .5, ex + sz * .9, ey - sz * .72); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(32,61,86,.55)'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(-20, -124); ctx.quadraticCurveTo(-13, -127, -6, -124); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -123); ctx.quadraticCurveTo(17, -126, 23, -123); ctx.stroke();
      ctx.fillStyle = '#833a47'; ctx.beginPath(); ctx.ellipse(7, -86, 4.2, 4.8, .04, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e4828b'; ctx.beginPath(); ctx.ellipse(7, -84, 2.2, 2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fffdf3'; ctx.beginPath(); ctx.moveTo(9, -90); ctx.lineTo(12, -85); ctx.lineTo(8, -85); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(238,124,134,.38)'; ctx.beginPath(); ctx.ellipse(31, -97, 9, 4, -.1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-19, -97, 8, 3.5, .1, 0, TAU); ctx.fill();
      // 鲸发卡
      ctx.save(); ctx.translate(-37, -148); ctx.rotate(-.3);
      ctx.fillStyle = '#84f2ff'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-16, -4); ctx.lineTo(-13, 3); ctx.lineTo(-19, 7); ctx.lineTo(-8, 4); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    // 内描边
    const ring = ctx.createRadialGradient(w / 2, h / 2, w * .3, w / 2, h / 2, w * .53);
    ring.addColorStop(0, 'rgba(0,0,0,0)'); ring.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = ring; ctx.fillRect(0, 0, w, h);
  }

  /* ---------- 过场插画 ---------- */
  function cinematicBase(ctx, theme, t, opts) {
    const p = pal(theme);
    const sky = ctx.createLinearGradient(0, 0, 0, 1080);
    sky.addColorStop(0, p.sky[0]); sky.addColorStop(.58, p.sky[1]); sky.addColorStop(1, p.sky[2]);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1920, 1080);
    stars(ctx, theme, t, .45);
    moon(ctx, theme, 1450, 205, theme === 'boss' ? 120 : 82, t);
    clouds(ctx, theme, t, t * 12, 380, 1.7, .11);
    mountain(ctx, theme, t, t * 5, { base: 760, height: 470, seed: 3.4, layer: 0, par: .006 });
    mountain(ctx, theme, t, t * 8, { base: 825, height: 330, seed: 7.1, layer: 1, par: .01 });
    const mist = ctx.createLinearGradient(0, 560, 0, 840);
    mist.addColorStop(0, U.rgba(p.mist, 0)); mist.addColorStop(.5, U.rgba(p.mist, .07)); mist.addColorStop(1, U.rgba(p.mist, 0));
    ctx.fillStyle = mist; ctx.fillRect(0, 520, 1920, 320);
  }

  function cinematicFigure(ctx, x, y, scale, color, opts) {
    opts = opts || {};
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = color;
    // 简化人物剪影
    ctx.beginPath(); ctx.arc(0, -145, 21, 0, TAU); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-23, -123); ctx.quadraticCurveTo(-36, -65, -19, -8); ctx.lineTo(-8, 0);
    ctx.lineTo(0, -52); ctx.lineTo(8, 0); ctx.lineTo(20, -8);
    ctx.quadraticCurveTo(34, -68, 22, -123); ctx.closePath(); ctx.fill();
    if (opts.cloak) {
      ctx.beginPath(); ctx.moveTo(-21, -120); ctx.quadraticCurveTo(-80, -40, -65, 2); ctx.lineTo(-35, -35); ctx.closePath(); ctx.fill();
    }
    if (opts.sword) {
      ctx.strokeStyle = color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(19, -65); ctx.lineTo(70, -8); ctx.stroke();
    }
    ctx.restore();
  }

  const cinFigure = cinematicFigure;

  function drawCinematic(ctx, id, t, total, opts) {
    const fade = Math.min(1, t / .9, Math.max(0, (total - t) / .9));
    ctx.save();
    ctx.globalAlpha = .25 + fade * .75;
    if (id === 'classroom') {
      // 邵东三中 · 晚自习
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#151b20'); bg.addColorStop(.55, '#29333a'); bg.addColorStop(1, '#0d1216');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      // 窗外的雪
      const win = ctx.createLinearGradient(100, 180, 640, 620);
      win.addColorStop(0, '#7d9eb5'); win.addColorStop(.55, '#476779'); win.addColorStop(1, '#1c303b');
      ctx.fillStyle = win; ctx.fillRect(110, 160, 540, 480);
      ctx.fillStyle = '#d7e9e9';
      for (let i = 0; i < 80; i++) {
        const x = 110 + U.hash(i * 4.1) * 540, y = 160 + ((U.hash(i * 7.7) * 480 + t * 18) % 480);
        ctx.globalAlpha = .18 + U.hash(i) * .4; ctx.beginPath(); ctx.arc(x, y, .8 + U.hash(i + 2) * 2, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // 窗框
      ctx.strokeStyle = '#0b1114'; ctx.lineWidth = 14;
      ctx.strokeRect(110, 160, 540, 480);
      ctx.beginPath(); ctx.moveTo(380, 160); ctx.lineTo(380, 640); ctx.moveTo(110, 400); ctx.lineTo(650, 400); ctx.stroke();
      // 窗台上的肖志雄
      ctx.save(); ctx.translate(585, 610);
      ctx.fillStyle = '#c0793f';
      ctx.beginPath(); ctx.ellipse(0, 0, 13, 18, -.15, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -19, 9, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-2, -27); ctx.lineTo(-7, -36); ctx.lineTo(2, -29); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -27); ctx.lineTo(14, -35); ctx.lineTo(12, -26); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7c4a29';
      ctx.beginPath(); ctx.ellipse(-11, -2, 8, 18, -.4, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(-17, -20, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1b1612';
      ctx.beginPath(); ctx.arc(0, -20, 1.4, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(7, -20, 1.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6b4b2c'; ctx.beginPath(); ctx.arc(11, -8, 3, 0, TAU); ctx.fill();
      ctx.restore();
      // 黑板
      ctx.fillStyle = '#2b3e37'; ctx.fillRect(790, 210, 850, 380);
      ctx.strokeStyle = '#806447'; ctx.lineWidth = 16; ctx.strokeRect(790, 210, 850, 380);
      ctx.strokeStyle = 'rgba(213,220,195,.55)'; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(850 + i * 30, 295); ctx.lineTo(1100 + i * 30, 295); ctx.stroke(); }
      ctx.font = '700 54px "STKaiti","KaiTi",serif'; ctx.fillStyle = 'rgba(235,233,206,.75)'; ctx.fillText('距高考  100  天', 1000, 285);
      ctx.font = '34px "STKaiti","KaiTi",serif'; ctx.fillStyle = 'rgba(238,229,203,.48)'; ctx.fillText('逸夫楼 · 高三（?）班', 1120, 350); ctx.font = '24px "STKaiti","KaiTi",serif'; ctx.fillStyle = 'rgba(238,229,203,.32)'; ctx.fillText('求真 · 扬善 · 尚美    苦干 · 苦教 · 苦学', 1160, 380);
      ctx.font = '38px "STKaiti","KaiTi",serif'; ctx.fillStyle = 'rgba(240,219,199,.62)'; ctx.fillText('别为我做傻事。', 1210, 430);
      ctx.strokeStyle = 'rgba(238,229,203,.22)'; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(850, 480 + i * 18); ctx.lineTo(1300 - i * 40, 480 + i * 18); ctx.stroke(); }
      // 时钟
      ctx.fillStyle = '#d6d2c5'; ctx.beginPath(); ctx.arc(1750, 300, 54, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#1b252a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(1750, 300, 54, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#28353a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(1750, 300); ctx.lineTo(1750, 266); ctx.moveTo(1750, 300); ctx.lineTo(1776, 312); ctx.stroke();
      // 课桌
      for (let row = 0; row < 3; row++) {
        const y = 710 + row * 105, scale = 1 + row * .18;
        for (let col = 0; col < 5; col++) {
          const x = 160 + col * 330 + row * 35;
          ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
          ctx.fillStyle = '#3d3228'; ctx.fillRect(-85, -10, 170, 16);
          ctx.fillStyle = '#241d18'; ctx.fillRect(-68, 6, 12, 110); ctx.fillRect(56, 6, 12, 110);
          ctx.strokeStyle = 'rgba(183,172,145,.25)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-80, -26); ctx.lineTo(80, -26); ctx.stroke();
          ctx.restore();
        }
      }
      // 前景的桌与信
      ctx.fillStyle = 'rgba(10,14,16,.55)'; ctx.beginPath(); ctx.moveTo(0, 1080); ctx.lineTo(0, 860); ctx.lineTo(650, 820); ctx.lineTo(760, 1080); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(400, 885); ctx.rotate(-.08);
      ctx.fillStyle = '#e8dfc5'; ctx.fillRect(-70, -40, 140, 80);
      ctx.strokeStyle = 'rgba(147,118,83,.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-45, -16); ctx.lineTo(45, -16); ctx.moveTo(-45, 2); ctx.lineTo(25, 2); ctx.stroke();
      ctx.fillStyle = 'rgba(140,53,48,.55)'; ctx.beginPath(); ctx.arc(52, 25, 9, 0, TAU); ctx.fill();
      ctx.restore();
      // 走廊回声的暖光
      const glowGrad = ctx.createRadialGradient(900, 560, 30, 900, 560, 640);
      glowGrad.addColorStop(0, 'rgba(255,200,135,.08)'); glowGrad.addColorStop(1, 'rgba(255,200,135,0)');
      ctx.fillStyle = glowGrad; ctx.fillRect(0, 0, 1920, 1080);
      const vig = ctx.createRadialGradient(960, 540, 300, 960, 540, 1120);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.56)'); ctx.fillStyle = vig; ctx.fillRect(0, 0, 1920, 1080);
    } else if (id === 'village') {
      cinematicBase(ctx, 'snow', t);
      // 村庄
      const base = 840;
      ctx.fillStyle = '#0b1b23';
      for (let i = 0; i < 7; i++) {
        const x = 220 + i * 230, w = 120 + U.hash(i) * 75, h = 70 + U.hash(i + 3) * 45;
        ctx.fillRect(x, base - h * .35, w, h);
        ctx.beginPath(); ctx.moveTo(x - 20, base - h * .35); ctx.lineTo(x + w / 2, base - h * .35 - 55); ctx.lineTo(x + w + 20, base - h * .35); ctx.closePath(); ctx.fill();
      }
      // 路
      ctx.fillStyle = 'rgba(220,232,231,.16)';
      ctx.beginPath(); ctx.moveTo(0, 1080); ctx.lineTo(760, 815); ctx.lineTo(1060, 815); ctx.lineTo(1920, 1080); ctx.closePath(); ctx.fill();
      // 灯
      lantern(ctx, 1440, 760, 1.1, t, '#e7a65f');
      // 雪
      for (let i = 0; i < 140; i++) {
        const x = (U.hash(i * 3.1) * 1920 + t * (12 + U.hash(i) * 20)) % 1920;
        const y = (U.hash(i * 7.7) * 900 + t * (20 + U.hash(i + 2) * 28)) % 980;
        ctx.fillStyle = `rgba(236,246,244,${.08 + U.hash(i + 4) * .32})`;
        ctx.beginPath(); ctx.arc(x, y, .8 + U.hash(i + 9) * 2, 0, TAU); ctx.fill();
      }
    } else if (id === 'cliff') {
      cinematicBase(ctx, 'snow', t);
      // 崖
      ctx.fillStyle = '#08131a';
      ctx.beginPath(); ctx.moveTo(0, 800); ctx.lineTo(480, 790); ctx.lineTo(680, 840); ctx.lineTo(900, 910); ctx.lineTo(760, 1080); ctx.lineTo(0, 1080); ctx.closePath(); ctx.fill();
      cinFigure(ctx, 600, 790, 1.1, '#071017', { sword: true, cloak: true });
      // 刘亚岚
      ctx.fillStyle = '#d8d6c8'; ctx.beginPath(); ctx.arc(660, 783, 12, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b8b6aa'; ctx.beginPath(); ctx.moveTo(648, 797); ctx.quadraticCurveTo(640, 846, 656, 880); ctx.lineTo(682, 880); ctx.quadraticCurveTo(694, 835, 672, 797); ctx.closePath(); ctx.fill();
      // 灯
      glow(ctx, 715, 790, 45, '#e8b16a', .22);
      ctx.fillStyle = '#e8b16a'; ctx.beginPath(); ctx.arc(715, 790, 4, 0, TAU); ctx.fill();
      // 衣角
      ctx.strokeStyle = 'rgba(15,20,22,.7)'; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(586, 760 + i * 8); ctx.quadraticCurveTo(540 + Math.sin(t + i) * 12, 790, 500, 780 + i * 10); ctx.stroke(); }
      for (let i = 0; i < 100; i++) {
        const x = (U.hash(i * 4.1) * 1920 + t * 22) % 1920, y = (U.hash(i * 2.9) * 900 + t * 35) % 980;
        ctx.fillStyle = `rgba(232,244,243,${.08 + U.hash(i) * .25})`; ctx.beginPath(); ctx.arc(x, y, 1 + U.hash(i + 4) * 1.5, 0, TAU); ctx.fill();
      }
    } else if (id === 'sickbed') {
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#0a0d10'); bg.addColorStop(1, '#17110e');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      // 窗
      ctx.fillStyle = 'rgba(37,61,70,.55)'; ctx.fillRect(1130, 210, 450, 390);
      ctx.strokeStyle = 'rgba(7,12,14,.95)'; ctx.lineWidth = 9;
      ctx.strokeRect(1130, 210, 450, 390);
      for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(1130 + i * 112, 210); ctx.lineTo(1130 + i * 112, 600); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(1130, 405); ctx.lineTo(1580, 405); ctx.stroke();
      // 床
      ctx.fillStyle = '#241b17'; ctx.fillRect(380, 690, 760, 210);
      ctx.fillStyle = '#4e453b'; ctx.fillRect(380, 680, 760, 26);
      ctx.fillStyle = '#b7ab97'; ctx.beginPath(); ctx.ellipse(780, 676, 250, 33, 0, 0, TAU); ctx.fill();
      // 亚岚
      ctx.fillStyle = '#d9c7ad'; ctx.beginPath(); ctx.arc(730, 632, 35, 0, TAU); ctx.fill();
      ctx.fillStyle = '#d5d2c5'; ctx.beginPath(); ctx.moveTo(650, 670); ctx.quadraticCurveTo(700, 620, 800, 660); ctx.lineTo(860, 690); ctx.lineTo(650, 690); ctx.closePath(); ctx.fill();
      // 刘奥
      cinFigure(ctx, 1060, 860, 1.15, '#080c10', { cloak: true });
      // 烛
      glow(ctx, 355, 585, 160, '#e4a25b', .2);
      ctx.fillStyle = '#e6b36e'; ctx.fillRect(343, 610, 4, 45); ctx.beginPath(); ctx.ellipse(345, 602, 4, 9, 0, 0, TAU); ctx.fill();
      // 雪
      for (let i = 0; i < 80; i++) {
        const x = 1130 + U.hash(i * 3.2) * 450, y = 220 + ((U.hash(i * 5.1) * 390 + t * 30) % 380);
        ctx.fillStyle = 'rgba(222,240,241,.4)'; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, TAU); ctx.fill();
      }
      const vig = ctx.createRadialGradient(960, 540, 180, 960, 540, 1000);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = vig; ctx.fillRect(0, 0, 1920, 1080);
    } else if (id === 'ritual') {
      const bg = ctx.createRadialGradient(950, 580, 90, 950, 580, 1050);
      bg.addColorStop(0, '#2a1112'); bg.addColorStop(.45, '#110a0d'); bg.addColorStop(1, '#030407');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      // 祭坛
      ctx.save(); ctx.translate(960, 800);
      const rg = ctx.createRadialGradient(0, 0, 40, 0, 0, 420);
      rg.addColorStop(0, 'rgba(255,105,80,.25)'); rg.addColorStop(.55, 'rgba(255,64,50,.08)'); rg.addColorStop(1, 'rgba(255,60,45,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(0, 0, 480, 160, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,105,80,.3)'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 150 + i * 95, 45 + i * 29, 0, 0, TAU); ctx.stroke(); }
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * TAU + t * .03;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * 80, Math.sin(a) * 24); ctx.lineTo(Math.cos(a) * 390, Math.sin(a) * 120); ctx.strokeStyle = 'rgba(255,105,80,.16)'; ctx.stroke();
      }
      ctx.restore();
      // 抱人剪影
      cinFigure(ctx, 900, 810, 1.8, '#07070a', { cloak: true });
      ctx.save(); ctx.translate(900, 810); ctx.scale(1.6, 1.6);
      ctx.fillStyle = 'rgba(213,205,187,.7)'; ctx.beginPath(); ctx.ellipse(28, -93, 19, 30, -.8, 0, TAU); ctx.fill();
      ctx.restore();
      // 影
      ctx.save(); ctx.globalAlpha = .16; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(960, 390, 190, 250, 0, 0, TAU); ctx.fill(); ctx.restore();
      // 裂缝
      ctx.strokeStyle = 'rgba(255,80,55,.3)'; ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) {
        const x = U.hash(i * 3.8) * 1920, y = U.hash(i + 2) * 700;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (U.hash(i + 4) - .5) * 120, y + 100); ctx.lineTo(x + (U.hash(i + 7) - .5) * 200, y + 210); ctx.stroke();
      }
      for (let i = 0; i < 80; i++) {
        const x = (U.hash(i * 8.1) * 1920 + Math.sin(t + i) * 20), y = 900 - ((t * (20 + U.hash(i) * 35) + U.hash(i + 2) * 900) % 900);
        ctx.fillStyle = `rgba(255,112,70,${.1 + U.hash(i + 4) * .3})`; ctx.beginPath(); ctx.arc(x, y, 1 + U.hash(i + 6) * 2, 0, TAU); ctx.fill();
      }
    } else if (id === 'corruption') {
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#1a090b'); bg.addColorStop(.55, '#3c1113'); bg.addColorStop(1, '#0a0607');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      moon(ctx, 'boss', 1390, 230, 105, t);
      mountain(ctx, 'boss', t, 0, { base: 800, height: 500, seed: 4.1, layer: 0, par: .005 });
      // 触须
      ctx.strokeStyle = 'rgba(7,4,7,.8)'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.moveTo(200 + i * 280, 1080); ctx.bezierCurveTo(300 + i * 250 + Math.sin(t + i) * 30, 700, 500 + i * 200, 620, 430 + i * 250, 430); ctx.stroke();
      }
      // 村
      ctx.fillStyle = '#090508'; for (let i = 0; i < 6; i++) { const x = 270 + i * 230; ctx.fillRect(x, 760, 130, 90); ctx.beginPath(); ctx.moveTo(x - 20, 760); ctx.lineTo(x + 65, 700); ctx.lineTo(x + 150, 760); ctx.closePath(); ctx.fill(); }
      // 人影
      cinFigure(ctx, 980, 850, 1.8, '#050306', { sword: true, cloak: true });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(ctx, 1010, 800, 110, '#ff4a40', .12);
      ctx.restore();
      for (let i = 0; i < 100; i++) {
        const x = U.hash(i * 3.3) * 1920, y = 900 - ((t * (22 + U.hash(i) * 35) + U.hash(i + 2) * 900) % 900);
        ctx.fillStyle = `rgba(255,102,70,${.06 + U.hash(i + 3) * .25})`; ctx.beginPath(); ctx.arc(x, y, 1 + U.hash(i + 1) * 1.7, 0, TAU); ctx.fill();
      }
      const vig = ctx.createRadialGradient(960, 500, 190, 960, 540, 1030);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.65)'); ctx.fillStyle = vig; ctx.fillRect(0, 0, 1920, 1080);
    } else if (id === 'deepsea') {
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#03111e'); bg.addColorStop(.42, '#082a3c'); bg.addColorStop(1, '#02080e');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      // 光柱
      for (let i = 0; i < 7; i++) {
        const x = 300 + i * 230 + Math.sin(t * .2 + i) * 50;
        const lg = ctx.createLinearGradient(x, 0, x - 230, 1080);
        lg.addColorStop(0, 'rgba(101,222,242,.10)'); lg.addColorStop(1, 'rgba(56,154,180,0)');
        ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x - 35, 0); ctx.lineTo(x + 55, 0); ctx.lineTo(x - 150, 1080); ctx.lineTo(x - 320, 1080); ctx.closePath(); ctx.fill();
      }
      // 鲸
      ctx.save(); ctx.translate(960 + Math.sin(t * .14) * 70, 480);
      ctx.fillStyle = 'rgba(34,93,117,.38)';
      ctx.beginPath(); ctx.ellipse(0, 0, 430, 140, -.06, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(400, -10); ctx.quadraticCurveTo(520, -120, 570, -30); ctx.quadraticCurveTo(525, 0, 560, 80); ctx.quadraticCurveTo(490, 35, 390, 40); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(134,230,244,.08)'; ctx.beginPath(); ctx.ellipse(-80, -55, 220, 35, -.05, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(205,250,255,.5)'; ctx.beginPath(); ctx.arc(-210, 10, 5, 0, TAU); ctx.fill();
      ctx.restore();
      // 粒子
      for (let i = 0; i < 130; i++) {
        const x = (U.hash(i * 4.1) * 1920 + Math.sin(t * .3 + i) * 35) % 1920;
        const y = (U.hash(i * 7.9) * 1080 - t * (8 + U.hash(i) * 16)) % 1080;
        ctx.fillStyle = `rgba(136,237,250,${.06 + U.hash(i + 3) * .26})`;
        ctx.beginPath(); ctx.arc(x, (y + 1080) % 1080, .8 + U.hash(i + 5) * 2.3, 0, TAU); ctx.fill();
      }
      glow(ctx, 960, 440, 360, '#66e8fa', .06);
    } else if (id === 'hero') {
      cinematicBase(ctx, 'snow', t);
      // 山门
      ctx.fillStyle = '#071117';
      ctx.fillRect(400, 410, 80, 450); ctx.fillRect(1450, 410, 80, 450);
      ctx.fillRect(330, 380, 220, 35); ctx.fillRect(1370, 380, 220, 35);
      // 主角背影
      ctx.save(); ctx.translate(960, 890); ctx.scale(1.5, 1.5);
      // 发
      ctx.fillStyle = '#183e60';
      ctx.beginPath(); ctx.arc(0, -150, 47, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-44, -154); ctx.quadraticCurveTo(-65, -60, -42, -5); ctx.lineTo(-17, -14); ctx.quadraticCurveTo(-28, -80, -20, -150); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(43, -154); ctx.quadraticCurveTo(68, -60, 43, -5); ctx.lineTo(17, -14); ctx.quadraticCurveTo(29, -80, 20, -150); ctx.closePath(); ctx.fill();
      // 身
      ctx.fillStyle = '#dfe9e4'; ctx.beginPath(); ctx.moveTo(-30, -120); ctx.quadraticCurveTo(-42, -60, -28, 0); ctx.lineTo(30, 0); ctx.quadraticCurveTo(42, -60, 30, -120); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#173a56'; ctx.beginPath(); ctx.moveTo(-27, -121); ctx.quadraticCurveTo(0, -140, 27, -121); ctx.lineTo(17, -93); ctx.quadraticCurveTo(0, -83, -17, -93); ctx.closePath(); ctx.fill();
      // 剑
      ctx.strokeStyle = 'rgba(153,244,255,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(26, -105); ctx.lineTo(85, -10); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 130; i++) {
        const x = (U.hash(i * 4.7) * 1920 + t * 15) % 1920, y = (U.hash(i * 8.3) * 900 + t * 25) % 980;
        ctx.fillStyle = `rgba(232,245,244,${.06 + U.hash(i + 3) * .26})`; ctx.beginPath(); ctx.arc(x, y, 1 + U.hash(i + 2) * 1.6, 0, TAU); ctx.fill();
      }
    } else if (id === 'fall') {
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#13232e'); bg.addColorStop(.48, '#50666c'); bg.addColorStop(.73, '#b8a88f'); bg.addColorStop(1, '#263238');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      // 破晓前的一线天光
      glow(ctx, 1220, 520, 680, '#f3d7a7', .15);
      // 远山
      mountain(ctx, 'snow', t, 0, { base: 790, height: 390, seed: 4.4, layer: 1 });
      mountain(ctx, 'snow', t, 0, { base: 845, height: 265, seed: 7.8, layer: 2 });
      const fog = ctx.createLinearGradient(0, 610, 0, 900);
      fog.addColorStop(0, 'rgba(232,239,232,0)'); fog.addColorStop(.5, 'rgba(232,239,232,.09)'); fog.addColorStop(1, 'rgba(232,239,232,0)');
      ctx.fillStyle = fog; ctx.fillRect(0, 600, 1920, 320);
      // 雪坡
      ctx.fillStyle = 'rgba(226,234,231,.33)';
      ctx.beginPath(); ctx.moveTo(0, 900); ctx.quadraticCurveTo(720, 805, 1920, 900); ctx.lineTo(1920, 1080); ctx.lineTo(0, 1080); ctx.closePath(); ctx.fill();
      // 主角站在远处
      ctx.save(); ctx.translate(590, 902); ctx.scale(1.35, 1.35);
      ctx.fillStyle = '#163b56';
      ctx.beginPath(); ctx.arc(0, -156, 42, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-36, -155); ctx.quadraticCurveTo(-62, -70, -42, -12); ctx.lineTo(-18, -20); ctx.quadraticCurveTo(-27, -88, -18, -150); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(35, -155); ctx.quadraticCurveTo(64, -70, 42, -12); ctx.lineTo(18, -20); ctx.quadraticCurveTo(27, -88, 19, -150); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dfe8e3'; ctx.beginPath(); ctx.moveTo(-28, -120); ctx.quadraticCurveTo(-38, -55, -24, 0); ctx.lineTo(25, 0); ctx.quadraticCurveTo(38, -56, 28, -120); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#183c58'; ctx.beginPath(); ctx.moveTo(-25, -120); ctx.quadraticCurveTo(0, -139, 25, -120); ctx.lineTo(15, -92); ctx.quadraticCurveTo(0, -83, -15, -92); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(140,240,252,.55)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(23, -103); ctx.lineTo(74, -10); ctx.stroke();
      ctx.restore();
      // 跪着的刘奥
      ctx.save(); ctx.translate(1010, 902); ctx.scale(1.72, 1.72);
      ctx.fillStyle = 'rgba(7,7,10,.94)';
      // 身体前倾
      ctx.beginPath();
      ctx.moveTo(-26, -78); ctx.quadraticCurveTo(-58, -54, -63, -5); ctx.quadraticCurveTo(-30, 12, 0, 4);
      ctx.quadraticCurveTo(32, 14, 62, -2); ctx.quadraticCurveTo(54, -56, 26, -78); ctx.closePath(); ctx.fill();
      // 头
      ctx.beginPath(); ctx.arc(-6, -102, 28, 0, TAU); ctx.fill();
      // 发
      ctx.beginPath(); ctx.arc(-8, -110, 30, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-35, -111); ctx.lineTo(-49, -96); ctx.lineTo(-30, -91); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(20, -111); ctx.lineTo(35, -93); ctx.lineTo(14, -88); ctx.closePath(); ctx.fill();
      // 侧脸光
      ctx.fillStyle = 'rgba(224,188,167,.8)';
      ctx.beginPath(); ctx.arc(7, -101, 12, -1.1, 1.2); ctx.fill();
      // 手臂撑地
      ctx.strokeStyle = 'rgba(7,7,10,.95)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(22, -55); ctx.quadraticCurveTo(53, -32, 70, -3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-22, -53); ctx.quadraticCurveTo(-45, -27, -52, -1); ctx.stroke();
      // 飘散的光
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 20; i++) {
        const a = t * .5 + i * 1.7;
        ctx.fillStyle = `rgba(255,220,171,${.12 + U.hash(i) * .22})`;
        ctx.beginPath(); ctx.arc(-20 + Math.cos(a) * (18 + i * 2), -80 + Math.sin(a) * (14 + i), 1.4, 0, TAU); ctx.fill();
      }
      ctx.restore();
      ctx.restore();
      // 断剑
      ctx.save(); ctx.translate(1200, 882); ctx.rotate(.16); ctx.strokeStyle = '#d2cdbd'; ctx.lineWidth = 4.4; ctx.beginPath(); ctx.moveTo(-95, 7); ctx.lineTo(150, -4); ctx.stroke(); ctx.strokeStyle = '#6c5c49'; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(-112, 8); ctx.lineTo(-65, 5); ctx.stroke(); ctx.restore();
      // 红围巾
      ctx.fillStyle = 'rgba(132,43,40,.55)';
      ctx.beginPath(); ctx.moveTo(960, 900); ctx.quadraticCurveTo(1040, 918, 1105, 900); ctx.quadraticCurveTo(1125, 914, 1180, 944); ctx.lineTo(1070, 930); ctx.quadraticCurveTo(1010, 940, 950, 920); ctx.closePath(); ctx.fill();
      // 金色光点
      for (let i = 0; i < 190; i++) {
        const x = 720 + (U.hash(i * 3.7) - .5) * 760 + Math.sin(t + i) * 55 * U.hash(i);
        const y = 860 - (t * (18 + U.hash(i) * 50) + U.hash(i + 2) * 560) % 620;
        ctx.fillStyle = `rgba(255,213,166,${.08 + U.hash(i + 4) * .42})`; ctx.beginPath(); ctx.arc(x, y, .8 + U.hash(i + 5) * 2.3, 0, TAU); ctx.fill();
      }
      // 雪
      for (let i = 0; i < 60; i++) {
        const x = (U.hash(i * 4.9) * 1920 + t * 14) % 1920, y = (U.hash(i * 8.1) * 900 + t * 24) % 980;
        ctx.fillStyle = 'rgba(239,246,243,.22)'; ctx.beginPath(); ctx.arc(x, y, 1 + U.hash(i) * 2, 0, TAU); ctx.fill();
      }
      const vig = ctx.createRadialGradient(960, 540, 220, 960, 540, 1020);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = vig; ctx.fillRect(0, 0, 1920, 1080);
    } else if (id === 'farewell') {
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#14222b'); bg.addColorStop(.6, '#405252'); bg.addColorStop(1, '#9b8f7d');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      // 远山
      mountain(ctx, 'snow', t, 0, { base: 720, height: 300, seed: 8.3, layer: 2 });
      glow(ctx, 1230, 300, 420, '#f2d3a2', .15);
      // 刘奥跪坐
      ctx.save(); ctx.translate(780, 900); ctx.scale(2.2, 2.2);
      ctx.fillStyle = 'rgba(10,9,12,.94)';
      ctx.beginPath(); ctx.arc(0, -122, 27, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-26, -104); ctx.quadraticCurveTo(-56, -45, -50, 0); ctx.lineTo(52, 0); ctx.quadraticCurveTo(57, -45, 27, -104); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d0ae9d'; ctx.beginPath(); ctx.arc(0, -125, 17, -.4, 3.3); ctx.fill();
      ctx.fillStyle = '#0c0b10'; ctx.beginPath(); ctx.arc(0, -134, 20, Math.PI, 0); ctx.fill();
      ctx.restore();
      // 亚岚幻影
      ctx.save(); ctx.translate(1160, 750); ctx.scale(2.3, 2.3); ctx.globalAlpha = .6;
      ctx.fillStyle = 'rgba(228,222,203,.55)';
      ctx.beginPath(); ctx.arc(0, -110, 27, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-31, -88); ctx.quadraticCurveTo(-44, -22, -40, 62); ctx.lineTo(38, 62); ctx.quadraticCurveTo(44, -22, 31, -88); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(245,241,227,.35)';
      ctx.beginPath(); ctx.arc(0, -109, 20, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(67,65,60,.8)';
      ctx.beginPath(); ctx.arc(-7, -114, 2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(7, -114, 2, 0, TAU); ctx.fill();
      ctx.restore();
      // 光
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ctx, 1160, 660, 210, '#f0d9b3', .12); ctx.restore();
      for (let i = 0; i < 120; i++) {
        const x = (U.hash(i * 3.4) * 1920 + Math.sin(t + i) * 20), y = (U.hash(i * 7.4) * 1080 - t * 12) % 1080;
        ctx.fillStyle = `rgba(247,226,189,${.05 + U.hash(i) * .25})`; ctx.beginPath(); ctx.arc(x, (y + 1080) % 1080, .8 + U.hash(i + 2) * 2, 0, TAU); ctx.fill();
      }
    } else if (id === 'ash') {
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#16242c'); bg.addColorStop(.6, '#4e5e5d'); bg.addColorStop(1, '#a6a094');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      mountain(ctx, 'snow', t, 0, { base: 760, height: 360, seed: 6.6, layer: 2 });
      // 雪坡
      ctx.fillStyle = 'rgba(218,229,228,.24)'; ctx.beginPath(); ctx.moveTo(0, 900); ctx.quadraticCurveTo(700, 790, 1920, 930); ctx.lineTo(1920, 1080); ctx.lineTo(0, 1080); ctx.closePath(); ctx.fill();
      // 断剑
      ctx.save(); ctx.translate(900, 880); ctx.rotate(.18);
      ctx.strokeStyle = '#c9c6b9'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-100, 8); ctx.lineTo(110, -5); ctx.stroke();
      ctx.strokeStyle = '#5f5548'; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(-115, 9); ctx.lineTo(-70, 5); ctx.stroke();
      ctx.strokeStyle = '#9f8c67'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-60, 4); ctx.lineTo(-42, 2); ctx.stroke();
      ctx.restore();
      // 衣
      ctx.save(); ctx.globalAlpha = .45; ctx.fillStyle = '#141016';
      ctx.beginPath(); ctx.moveTo(680, 930); ctx.quadraticCurveTo(760, 830, 840, 900); ctx.quadraticCurveTo(780, 990, 660, 1000); ctx.closePath(); ctx.fill(); ctx.restore();
      for (let i = 0; i < 220; i++) {
        const x = (U.hash(i * 2.3) * 1920 + Math.sin(t * .3 + i) * 60);
        const y = 1040 - ((U.hash(i * 6.1) * 900 + t * (15 + U.hash(i) * 45)) % 900);
        ctx.fillStyle = `rgba(248,236,204,${.08 + U.hash(i + 3) * .4})`; ctx.beginPath(); ctx.arc(x, y, .8 + U.hash(i + 1) * 2.5, 0, TAU); ctx.fill();
      }
    } else if (id === 'dawn') {
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#1b1512'); bg.addColorStop(.5, '#45322a'); bg.addColorStop(1, '#15100e');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      // 窗光
      const wg = ctx.createLinearGradient(960, 0, 960, 1080);
      wg.addColorStop(0, 'rgba(255,221,163,.16)'); wg.addColorStop(1, 'rgba(255,196,128,0)');
      ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(980, 0); ctx.lineTo(1500, 0); ctx.lineTo(1250, 1080); ctx.lineTo(500, 1080); ctx.closePath(); ctx.fill();
      // 床
      ctx.fillStyle = '#2c211b'; ctx.fillRect(410, 720, 880, 180);
      ctx.fillStyle = '#6d5c49'; ctx.fillRect(410, 704, 880, 24);
      ctx.fillStyle = '#c2b394'; ctx.beginPath(); ctx.ellipse(780, 697, 250, 34, 0, 0, TAU); ctx.fill();
      // 亚岚坐起
      ctx.save(); ctx.translate(780, 690); ctx.scale(1.35, 1.35);
      ctx.fillStyle = '#e8d3b8'; ctx.beginPath(); ctx.arc(0, -82, 32, 0, TAU); ctx.fill();
      ctx.fillStyle = '#d9d5c5'; ctx.beginPath(); ctx.arc(0, -90, 35, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#efeade'; ctx.beginPath(); ctx.moveTo(-40, -60); ctx.quadraticCurveTo(-58, 30, -60, 90); ctx.lineTo(62, 90); ctx.quadraticCurveTo(56, 20, 39, -60); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#45403a'; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(-17, -88); ctx.quadraticCurveTo(-10, -91, -4, -88); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(7, -88); ctx.quadraticCurveTo(13, -91, 19, -88); ctx.stroke();
      ctx.fillStyle = '#5c5248'; ctx.beginPath(); ctx.arc(-10, -84, 2.2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(13, -84, 2.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(146,97,82,.65)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-5, -68); ctx.quadraticCurveTo(0, -65, 6, -68); ctx.stroke();
      ctx.restore();
      // 床边断剑
      ctx.save(); ctx.translate(1040, 710); ctx.rotate(.12); ctx.strokeStyle = '#b9b4a7'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(130, 6); ctx.stroke(); ctx.restore();
      // 光尘
      for (let i = 0; i < 100; i++) {
        const x = 620 + U.hash(i * 4.2) * 700, y = 200 + U.hash(i * 7.3) * 600 + Math.sin(t * .4 + i) * 20;
        ctx.fillStyle = `rgba(255,226,173,${.05 + U.hash(i + 2) * .25})`; ctx.beginPath(); ctx.arc(x, y, 1 + U.hash(i + 3) * 2, 0, TAU); ctx.fill();
      }
      const vig = ctx.createRadialGradient(960, 520, 250, 960, 540, 1000);
      vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.7)'); ctx.fillStyle = vig; ctx.fillRect(0, 0, 1920, 1080);
    } else if (id === 'sunrise') {
      const bg = ctx.createLinearGradient(0, 0, 0, 1080);
      bg.addColorStop(0, '#1a3040'); bg.addColorStop(.44, '#6b7777'); bg.addColorStop(.7, '#c7a67e'); bg.addColorStop(1, '#2e3a3c');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1920, 1080);
      // 日
      glow(ctx, 1320, 400, 500, '#f4d39c', .25);
      ctx.fillStyle = 'rgba(255,228,178,.7)'; ctx.beginPath(); ctx.arc(1320, 400, 72, 0, TAU); ctx.fill();
      // 云海
      for (let i = 0; i < 5; i++) {
        const y = 520 + i * 70;
        const cg = ctx.createLinearGradient(0, y, 0, y + 60);
        cg.addColorStop(0, 'rgba(243,231,209,0)'); cg.addColorStop(.5, `rgba(243,231,209,${.16 - i * .025})`); cg.addColorStop(1, 'rgba(243,231,209,0)');
        ctx.fillStyle = cg; ctx.fillRect(0, y, 1920, 60);
      }
      mountain(ctx, 'snow', t, 0, { base: 720, height: 300, seed: 1.8, layer: 2 });
      // 山门（置于画面两侧，形成取景框）
      ctx.fillStyle = 'rgba(18,22,23,.85)';
      ctx.fillRect(360, 410, 42, 440); ctx.fillRect(1520, 410, 42, 440);
      ctx.fillRect(310, 388, 180, 22); ctx.fillRect(1430, 388, 182, 22);
      // 主角背影
      ctx.save(); ctx.translate(690, 865); ctx.scale(1.35, 1.35);
      ctx.fillStyle = '#1b3f58'; ctx.beginPath(); ctx.arc(0, -148, 45, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-42, -152); ctx.quadraticCurveTo(-64, -60, -43, -6); ctx.lineTo(-18, -15); ctx.quadraticCurveTo(-27, -82, -19, -148); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(42, -152); ctx.quadraticCurveTo(67, -60, 43, -6); ctx.lineTo(18, -15); ctx.quadraticCurveTo(28, -82, 19, -148); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dfe9e4'; ctx.beginPath(); ctx.moveTo(-30, -116); ctx.quadraticCurveTo(-42, -58, -28, 0); ctx.lineTo(28, 0); ctx.quadraticCurveTo(41, -58, 30, -116); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#173a56'; ctx.beginPath(); ctx.moveTo(-26, -117); ctx.quadraticCurveTo(0, -136, 26, -117); ctx.lineTo(16, -90); ctx.quadraticCurveTo(0, -81, -16, -90); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(150,243,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(25, -100); ctx.lineTo(78, -8); ctx.stroke();
      ctx.restore();
      // 雪融
      for (let i = 0; i < 100; i++) {
        const x = (U.hash(i * 3.1) * 1920 + t * 12) % 1920, y = (U.hash(i * 7.7) * 900 + t * 20) % 980;
        ctx.fillStyle = `rgba(245,238,222,${.04 + U.hash(i + 2) * .18})`; ctx.beginPath(); ctx.arc(x, y, 1 + U.hash(i + 4) * 1.8, 0, TAU); ctx.fill();
      }
    }
    // 整体做旧 / 颗粒 + 晕影
    const vig = ctx.createRadialGradient(960, 540, 330, 960, 540, 1120);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.46)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, 1920, 1080);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(235,240,232,${.01 + U.hash(i * 5.3) * .025})`;
      const x = U.hash(i * 3.7) * 1920, y = U.hash(i * 7.4) * 1080;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    ctx.restore();
  }

  /* ---------- 标题场景 ---------- */
  function drawTitleScene(ctx, t, reduced) {
    backgroundBase(ctx, 'title', t, 300 + Math.sin(t * .04) * 80, true);
    // 地面
    ctx.save(); ctx.translate(-100, 0);
    drawGround(ctx, 'title', 2200, 850, t, 0);
    drawScenery(ctx, 'title', 2200, 850, t, 0);
    ctx.restore();
    // 远处的刘奥剪影
    ctx.save(); ctx.globalAlpha = .32; ctx.translate(1590, 840); ctx.scale(1.02, 1.02);
    ctx.fillStyle = '#07090d';
    ctx.beginPath(); ctx.arc(0, -280, 33, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-44, -244); ctx.quadraticCurveTo(-85, -140, -62, -10); ctx.lineTo(-12, -30); ctx.lineTo(0, -130); ctx.lineTo(14, -30); ctx.lineTo(66, -12); ctx.quadraticCurveTo(87, -150, 45, -244); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#07090d'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(42, -180); ctx.lineTo(128, -60); ctx.stroke();
    ctx.restore();
    // 主角背影/侧身
    const fake = {
      x: 1135, y: 852, vx: 0, onGround: true, state: 'idle', stateT: 0,
      facing: 1, attackIndex: 0, animTime: 0, focus: 0, hurtFlash: 0
    };
    ctx.save();
    ctx.translate(1135, 852); ctx.scale(1.45, 1.45); ctx.translate(-1135, -852);
    Art.drawPlayer(ctx, fake, t);
    ctx.restore();
    // 头顶点光
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(ctx, 1135, 590, 180, '#7fe7f4', .035);
    ctx.restore();
    // 落雪
    if (!reduced) {
      for (let i = 0; i < 130; i++) {
        const x = (U.hash(i * 3.2) * 1920 + t * (8 + U.hash(i) * 16)) % 1920;
        const y = (U.hash(i * 7.1) * 980 + t * (15 + U.hash(i + 2) * 25)) % 980;
        ctx.fillStyle = `rgba(226,241,242,${.05 + U.hash(i + 4) * .24})`;
        ctx.beginPath(); ctx.arc(x, y, .8 + U.hash(i + 1) * 2, 0, TAU); ctx.fill();
      }
    }
    // 左侧水墨渐变
    const lg = ctx.createLinearGradient(0, 0, 1050, 0);
    lg.addColorStop(0, 'rgba(3,8,12,.82)'); lg.addColorStop(.55, 'rgba(3,8,12,.18)'); lg.addColorStop(1, 'rgba(3,8,12,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, 1100, 1080);
    const vig = ctx.createRadialGradient(960, 500, 400, 960, 540, 1200);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.6)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, 1920, 1080);
  }

  /* ---------- 场景物件 ---------- */
  function drawBarrier(ctx, x, y, height, t, side) {
    ctx.save(); ctx.translate(x, y);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, 0, 0, -height);
    g.addColorStop(0, 'rgba(255,94,74,.42)'); g.addColorStop(.5, 'rgba(255,156,105,.09)'); g.addColorStop(1, 'rgba(255,94,74,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-8, -height, 16, height);
    for (let i = 0; i < 8; i++) {
      const yy = -((t * 70 + i * 87) % height);
      ctx.strokeStyle = `rgba(255,127,91,${.14 + U.hash(i) * .18})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, yy, 20 + Math.sin(t * 2 + i) * 7, 5, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }

  function drawCheckpoint(ctx, x, y, t, active) {
    ctx.save(); ctx.translate(x, y);
    glow(ctx, 0, -60, 100, active ? '#7de9f2' : '#e4b56f', .1);
    ctx.strokeStyle = active ? 'rgba(124,232,247,.55)' : 'rgba(228,181,111,.4)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -120); ctx.stroke();
    ctx.fillStyle = active ? 'rgba(124,232,247,.1)' : 'rgba(228,181,111,.08)';
    ctx.beginPath(); ctx.ellipse(0, -40, 20, 40, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = active ? '#9cf4ff' : '#e8c47a'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, -60, 7, t, t + 4.8); ctx.stroke();
    ctx.restore();
  }

  function drawPickup(ctx, x, y, t, kind) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 2.3) * 5);
    glow(ctx, 0, 0, 55, kind === 'lore' ? '#e8c47a' : '#78ecf7', .17);
    ctx.rotate(t * .4);
    ctx.strokeStyle = kind === 'lore' ? '#e8c47a' : '#78ecf7'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(16, 0); ctx.lineTo(0, 16); ctx.lineTo(-16, 0); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  Art.PALETTES = PALETTES;
  Art.drawBackground = backgroundBase;
  Art.drawGround = drawGround;
  Art.drawScenery = drawScenery;
  Art.drawPlayer = drawPlayer;
  Art.drawBoss = drawBoss;
  Art.drawEnemy = drawEnemy;
  Art.drawProjectile = drawProjectile;
  Art.drawHazard = drawHazard;
  Art.drawPortrait = drawPortrait;
  Art.drawCinematic = drawCinematic;
  Art.drawTitleScene = drawTitleScene;
  Art.drawBarrier = drawBarrier;
  Art.drawCheckpoint = drawCheckpoint;
  Art.drawPickup = drawPickup;
  Art.drawSword = drawSword;
  Art.moon = moon;
  Art.glow = glow;
  Art.rr = rr;
  Art.ellipse = ellipse;
  Art.inkBlob = inkBlob;
  Art.lantern = lantern;
  Art.cinematicFigure = cinematicFigure;
  window.Art = Art;
})();
