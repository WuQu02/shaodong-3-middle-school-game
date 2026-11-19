/* 三中风云 — 天象：规律出现的稀有环境变化 */
(function () {
  'use strict';
  if (!window.THREE || !window.ThreeWorld) return;
  const THREE = window.THREE;
  const T = window.ThreeWorld.prototype;

  T.updateEnvironment = function (dt, game, theme) {
    this.envClock += dt;
    const breathe = Math.sin(this.envClock * .22) * .5 + .5;
    if (!this.omenEvent) {
      this.key.intensity = (this.theme === 'boss' ? 1.8 : 2.2) + breathe * .12;
      this.hemi.intensity = 1.3 + breathe * .04;
      this.weatherBoost = 1 + Math.pow(Math.max(0, Math.sin(this.envClock * .23)), 12) * .75;
      this.omenTimer -= dt;
      if (this.omenTimer <= 0) this._triggerOmen(this.theme, game);
    } else {
      this._updateOmen(dt, game);
    }
  };

  T._triggerOmen = function (theme, game) {
    this._clearGroup(this.omenGroup);
    let type = 'whales';
    if (theme === 'bamboo') type = 'fireflies';
    else if (theme === 'temple') type = 'petals';
    else if (theme === 'boss') type = 'eclipse';
    this.omenEvent = { type, t: 0, duration: 15 };
    if (type === 'whales') this._startWhales(game);
    else if (type === 'fireflies') this._startFireflies(game);
    else if (type === 'petals') this._startPetals(game);
    else this._startEclipse(game);
    this.omenIndex++;
  };

  T._makeSkyWhale = function (scale, color) {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .2, depthWrite: false, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    this._mesh(g, new THREE.SphereGeometry(1, 16, 10), mat, 0, 0, 0, 2.7, .68, .85);
    this._mesh(g, new THREE.ConeGeometry(.38, 1.5, 4), mat, 2.55, -.1, 0, 1, 1, .7, 0, 0, -1.3);
    this._mesh(g, new THREE.ConeGeometry(.25, .8, 4), mat, -1.6, -.32, .3, 1, 1, .8, 0, 0, 2.7);
    this._mesh(g, new THREE.SphereGeometry(.07, 8, 6), this._basic(0xd9fdff, { transparent: true, opacity: .42 }), -1.55, .22, .55);
    this._sprite(g, this.tex.glowCyan, color, 0, 0, -.2, 7, 7, .05, true);
    g.scale.setScalar(scale);
    return g;
  };

  T._startWhales = function (game) {
    const ev = this.omenEvent;
    ev.whales = [];
    const colors = [0x65dff5, 0x6f9dff, 0x9b72df, 0x4fc7dc];
    for (let i = 0; i < 4; i++) {
      const g = this._makeSkyWhale(.75 + i * .22, colors[i]);
      g.position.set(0, 7.5 + i * .85, -27 - i * 2.6);
      this.omenGroup.add(g);
      ev.whales.push({ g, offset: i * 8.7, y: 7.5 + i * .85, phase: i * 1.7, z: -27 - i * 2.6 });
    }
    ev.ribbons = [];
    for (let i = 0; i < 3; i++) {
      const s = this._sprite(this.omenGroup, this.tex.glowCyan, [0x6fe8ff, 0x7b8dff, 0xb270df][i], 0, 9 + i * .9, -30 - i, 18 + i * 4, 1.2 + i * .3, .055, true);
      ev.ribbons.push({ s, phase: i * 2.1 });
    }
    game.showOmen('鲸群过境', '难得一遇：深海的鲸群从云上经过，雪落得像一场很慢的潮汐。');
  };

  T._startFireflies = function (game) {
    const ev = this.omenEvent;
    const count = 520;
    const pos = new Float32Array(count * 3);
    ev.fire = [];
    for (let i = 0; i < count; i++) {
      const x = U.rand(-13, 13), y = U.rand(.3, 5.5), z = U.rand(-5, 7);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      ev.fire.push({ speed: U.rand(.08, .4), phase: U.rand(0, 6), sway: U.rand(.2, .8) });
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffdc86, size: .065, map: this.tex.glowGold, transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
    ev.points = new THREE.Points(geo, mat);
    ev.points.frustumCulled = false;
    this.omenGroup.add(ev.points);
    game.showOmen('萤火成河', '萤火从竹叶间升起，汇成一条逆流的星河。');
  };

  T._startPetals = function (game) {
    const ev = this.omenEvent;
    const count = 600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    ev.petals = [];
    const palette = [[1, .72, .68], [.93, .38, .36], [1, .86, .7]];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = U.rand(-13, 13); pos[i * 3 + 1] = U.rand(0, 12); pos[i * 3 + 2] = U.rand(-5, 8);
      const c = palette[i % 3];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      ev.petals.push({ speed: U.rand(1.1, 2.6), sway: U.rand(.2, .9), phase: U.rand(0, 6) });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ vertexColors: true, size: .12, map: this.tex.petal, transparent: true, opacity: .9, depthWrite: false, blending: THREE.NormalBlending, sizeAttenuation: true, fog: false });
    ev.points = new THREE.Points(geo, mat);
    ev.points.frustumCulled = false;
    this.omenGroup.add(ev.points);
    game.showOmen('彼岸花雨', '焚心祠下起红色的花雨，像迟到了很多年的春天。');
  };

  T._startEclipse = function (game) {
    const ev = this.omenEvent;
    const g = new THREE.Group(); g.position.set(0, 8.2, -37.8);
    this._mesh(g, new THREE.CircleGeometry(2.7, 48), new THREE.MeshBasicMaterial({ color: 0x160708, fog: false, side: THREE.DoubleSide }), 0, 0, 0);
    this._mesh(g, new THREE.RingGeometry(2.72, 3.0, 48), new THREE.MeshBasicMaterial({ color: 0xc43932, transparent: true, opacity: .55, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }), 0, 0, .01);
    this._sprite(g, this.tex.glowRed, 0xff4739, 0, 0, -.2, 14, 14, .18, true);
    this.omenGroup.add(g);
    ev.moon = g;
    const l = new THREE.PointLight(0xff3d30, 2.2, 36);
    l.position.set(0, 5.5, 7);
    this.omenGroup.add(l);
    ev.light = l;
    ev.flashes = [2.2, 5.6, 8.9, 12.2];
    ev.lastFlash = -1;
    ev.embers = [];
    const count = 260;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = U.rand(-13, 13); pos[i * 3 + 1] = U.rand(0, 7); pos[i * 3 + 2] = U.rand(-5, 7);
      ev.embers.push({ speed: U.rand(.4, 1), phase: U.rand(0, 6) });
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xff6b4e, size: .08, map: this.tex.glowRed, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
    ev.particles = new THREE.Points(geo, mat); ev.particles.frustumCulled = false;
    this.omenGroup.add(ev.particles);
    game.showOmen('血月蚀', '红月被阴影吞没，长夜屏住了呼吸。');
  };

  T._updateOmen = function (dt, game) {
    const ev = this.omenEvent;
    if (!ev) return;
    ev.t += dt;
    const t = ev.t;
    const fade = Math.min(1, t / 1.2, Math.max(0, (ev.duration - t) / 1.6));
    if (ev.type === 'whales') {
      const camX = this.currentCamX;
      for (const w of ev.whales || []) {
        const x = camX - 20 + ((t * 1.35 + w.offset) % 40);
        w.g.position.set(x, w.y + Math.sin(t * .55 + w.phase) * .3, w.z);
        w.g.rotation.z = Math.sin(t * .4 + w.phase) * .04;
        w.g.rotation.y = -.08;
        w.g.traverse(o => {
          if (o.isMesh) { o.material.transparent = true; o.material.opacity = .32 * fade; }
          if (o.isSprite) o.material.opacity = .09 * fade;
        });
      }
      for (const r of ev.ribbons || []) {
        r.s.position.x = camX + Math.sin(t * .3 + r.phase) * 2;
        r.s.position.y = 7.6 + Math.sin(t * .4 + r.phase) * .35;
        r.s.material.opacity = .07 * fade;
      }
      this.weatherBoost = 1.4;
      this.key.intensity = 2.35;
    } else if (ev.type === 'fireflies') {
      const arr = ev.points.geometry.attributes.position.array;
      for (let i = 0; i < ev.fire.length; i++) {
        const f = ev.fire[i];
        arr[i * 3 + 1] += f.speed * dt;
        arr[i * 3] += Math.sin(t * 1.2 + f.phase) * .002 * f.sway;
        if (arr[i * 3 + 1] > 5.7) arr[i * 3 + 1] = .25;
        if (arr[i * 3] > 13) arr[i * 3] = -13;
        if (arr[i * 3] < -13) arr[i * 3] = 13;
      }
      ev.points.geometry.attributes.position.needsUpdate = true;
      ev.points.position.x = this.currentCamX;
      ev.points.material.opacity = .85 * fade;
      this.hemi.intensity = 1.15;
    } else if (ev.type === 'petals') {
      const arr = ev.points.geometry.attributes.position.array;
      for (let i = 0; i < ev.petals.length; i++) {
        const p = ev.petals[i];
        arr[i * 3 + 1] -= p.speed * dt;
        arr[i * 3] += Math.sin(t + p.phase) * .004 * p.sway;
        if (arr[i * 3 + 1] < 0) { arr[i * 3 + 1] = 12; arr[i * 3] = U.rand(-13, 13); arr[i * 3 + 2] = U.rand(-5, 8); }
      }
      ev.points.geometry.attributes.position.needsUpdate = true;
      ev.points.position.x = this.currentCamX;
      ev.points.material.opacity = .85 * fade;
      this.key.intensity = 1.9 + Math.sin(t * 1.1) * .15;
    } else if (ev.type === 'eclipse') {
      const arr = ev.particles.geometry.attributes.position.array;
      for (let i = 0; i < ev.embers.length; i++) {
        const e = ev.embers[i];
        arr[i * 3 + 1] += e.speed * dt;
        arr[i * 3] += Math.sin(t * .8 + e.phase) * .004;
        if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = 0;
      }
      ev.particles.geometry.attributes.position.needsUpdate = true;
      ev.particles.position.x = this.currentCamX;
      ev.particles.material.opacity = .75 * fade;
      ev.moon.position.x = this.currentCamX + 4.4;
      ev.light.position.x = this.currentCamX + 4.4;
      this.key.intensity = .65;
      this.hemi.intensity = .65;
      this.skyUniforms.horizon.value.setHex(0x3a0d11);
      this.skyUniforms.bottom.value.setHex(0x140708);
      for (const ft of ev.flashes) {
        if (ev.lastFlash < ft && t >= ft) {
          ev.lastFlash = ft;
          game.flashScreen('#d6e4ef', .16);
          game.audio.sfx('warn');
        }
      }
      if (ev.moon) ev.moon.rotation.z += dt * .05;
    }
    if (t >= ev.duration) this._endOmen(game);
  };

  T._endOmen = function (game) {
    this._clearGroup(this.omenGroup);
    this.omenEvent = null;
    this.omenTimer = 72;
    this.weatherBoost = 1;
    this.key.intensity = this.theme === 'boss' ? 1.8 : 2.2;
    this.hemi.intensity = 1.3;
    const p = this.pal || { sky: 0x07131e, fog: 0x102b3b, ground: 0xaec3c8 };
    this.skyUniforms.top.value.setHex(p.sky);
    this.skyUniforms.horizon.value.setHex(p.fog).lerp(new THREE.Color(0xffffff), this.theme === 'boss' ? .08 : .16);
    this.skyUniforms.bottom.value.setHex(p.ground).multiplyScalar(.28);
  };
})();

/* 鲸影彩蛋与触摸投影 */
(function () {
  'use strict';
  if (!window.THREE || !window.ThreeWorld) return;
  const THREE = window.THREE;
  const T = window.ThreeWorld.prototype;

  T.projectPet = function () {
    if (!this.playerModel) return null;
    this.scene.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    this.playerModel.pet.getWorldPosition(v);
    v.project(this.camera);
    return { x: (v.x * .5 + .5) * 1920, y: (-v.y * .5 + .5) * 1080, visible: v.z > -1 && v.z < 1 };
  };

  T.updateSecrets = function (game) {
    const seen = new Set();
    for (const s of game.secrets || []) {
      if (s.collected) continue;
      seen.add(s.id);
      let m = this.secretModels.get(s.id);
      if (!m) {
        const g = new THREE.Group();
        const blue = this._std(0x4f8cff, { roughness: .42, emissive: 0x2458c8, ei: .35, transparent: true, opacity: .9 });
        const white = this._std(0xe6f9ff, { roughness: .5, emissive: 0x337d96, ei: .2, transparent: true, opacity: .9 });
        this._mesh(g, new THREE.SphereGeometry(.24, 14, 10), blue, 0, 0, 0, 1.35, .62, 1.4);
        this._mesh(g, new THREE.SphereGeometry(.16, 10, 8), white, 0, -.04, .05, 1.1, .4, 1.25);
        this._mesh(g, new THREE.ConeGeometry(.09, .28, 4), blue, -.28, .04, 0, 1, 1, .5, 0, 0, 1.2);
        this._mesh(g, new THREE.ConeGeometry(.09, .28, 4), blue, .28, .04, 0, 1, 1, .5, 0, 0, -1.2);
        this._mesh(g, new THREE.SphereGeometry(.025, 8, 6), this._basic(0x061529), -.09, .04, .25);
        this._mesh(g, new THREE.SphereGeometry(.025, 8, 6), this._basic(0x061529), .09, .04, .25);
        this._sprite(g, this.tex.glowCyan, 0x8ef7ff, 0, 0, -.15, 2.2, 1.2, .25, true);
        this.actorGroup.add(g);
        m = { group: g };
        this.secretModels.set(s.id, m);
      }
      const bob = Math.sin(this.lastTime * 1.6 + s.x * .01) * .12;
      m.group.position.set(s.x / 100, (850 - s.y) / 100 + .3 + bob, .2);
      m.group.rotation.y = Math.sin(this.lastTime * .7) * .25;
      m.group.rotation.z = Math.sin(this.lastTime * 1.1) * .06;
    }
    for (const [id, m] of this.secretModels) {
      if (!seen.has(id)) {
        this.actorGroup.remove(m.group);
        this.secretModels.delete(id);
      }
    }
  };
})();
