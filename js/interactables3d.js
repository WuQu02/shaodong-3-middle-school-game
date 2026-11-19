/* 三中风云 — 环境中的可交互生灵与器物 */
(function () {
  'use strict';
  if (!window.THREE || !window.ThreeWorld) return;
  const THREE = window.THREE;
  const T = window.ThreeWorld.prototype;

  function addShadow(self, g, sx, sz) {
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), new THREE.MeshBasicMaterial({ map: self.tex.shadow, transparent: true, opacity: .55, depthWrite: false, color: 0x000000 }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = .008; sh.renderOrder = 2; g.add(sh); return sh;
  }

  T._makeRabbit = function () {
    const g = new THREE.Group();
    const fur = this._std(0xf0f3ef, { roughness: .88 });
    const pink = this._basic(0xe9a3ad);
    this._mesh(g, new THREE.SphereGeometry(.23, 14, 10), fur, 0, .26, 0, 1.1, .9, 1.25);
    this._mesh(g, new THREE.SphereGeometry(.16, 12, 10), fur, .1, .52, .03, 1, .95, .95);
    this._mesh(g, new THREE.CapsuleGeometry(.04, .22, 4, 6), fur, .04, .76, .02, 1, 1, .8, 0, 0, -.14);
    this._mesh(g, new THREE.CapsuleGeometry(.04, .22, 4, 6), fur, .16, .76, .02, 1, 1, .8, 0, 0, .14);
    this._mesh(g, new THREE.SphereGeometry(.028, 8, 6), this._basic(0x182a34), .04, .56, .17);
    this._mesh(g, new THREE.SphereGeometry(.028, 8, 6), this._basic(0x182a34), .17, .56, .17);
    this._mesh(g, new THREE.SphereGeometry(.02, 6, 5), pink, .11, .51, .18);
    this._mesh(g, new THREE.SphereGeometry(.07, 8, 6), fur, -.2, .3, -.12);
    addShadow(this, g, .7, .3);
    g.scale.setScalar(1.15);
    return { group: g, kind: 'rabbit' };
  };

  T._makeCat = function () {
    const g = new THREE.Group();
    const fur = this._std(0x30363a, { roughness: .9 });
    const dark = this._std(0x171b1e, { roughness: .9 });
    this._mesh(g, new THREE.SphereGeometry(.25, 14, 10), fur, 0, .3, 0, 1.5, .7, .9);
    this._mesh(g, new THREE.SphereGeometry(.19, 12, 10), fur, .18, .55, .04, 1, .9, 1);
    this._mesh(g, new THREE.ConeGeometry(.09, .22, 4), dark, .07, .74, .02, 1, 1, .8, 0, 0, -.2);
    this._mesh(g, new THREE.ConeGeometry(.09, .22, 4), dark, .28, .74, .02, 1, 1, .8, 0, 0, .2);
    this._mesh(g, new THREE.SphereGeometry(.035, 8, 6), this._basic(0xbff27b), .12, .57, .2);
    this._mesh(g, new THREE.SphereGeometry(.035, 8, 6), this._basic(0xbff27b), .25, .57, .2);
    const tail = new THREE.Group(); tail.position.set(-.35, .28, 0); g.add(tail);
    this._mesh(tail, new THREE.CapsuleGeometry(.05, .4, 4, 6), fur, -.15, .16, 0, 1, 1, 1, 0, 0, -.8);
    addShadow(this, g, .9, .4);
    g.scale.setScalar(1.1);
    return { group: g, kind: 'cat', tail };
  };

  T._makeLantern = function () {
    const g = new THREE.Group();
    const stone = this._std(0x3c4a4c, { roughness: 1, flat: true });
    const warm = this._std(0xffcf8c, { roughness: .5, emissive: 0xff9e52, ei: .8 });
    this._mesh(g, new THREE.CylinderGeometry(.2, .28, .65, 6), stone, 0, .32, 0);
    this._mesh(g, new THREE.BoxGeometry(.5, .55, .5), stone, 0, .9, 0);
    this._mesh(g, new THREE.BoxGeometry(.3, .33, .31), warm, 0, .9, .02);
    this._mesh(g, new THREE.ConeGeometry(.44, .28, 4), stone, 0, 1.28, 0, 1, 1, 1, 0, Math.PI / 4, 0);
    const glow = this._sprite(g, this.tex.glowGold, 0xffb66e, 0, .9, .2, 1.4, 1.4, .18, true);
    addShadow(this, g, 1.2, .5);
    return { group: g, kind: 'lantern', glow, warm };
  };

  T._makeKoi = function () {
    const g = new THREE.Group();
    const water = this._basic(0x88dfee, { transparent: true, opacity: .2, depthWrite: false, side: THREE.DoubleSide });
    this._mesh(g, new THREE.CircleGeometry(.75, 22), water, 0, .012, 0, 1.2, 1, .5, -Math.PI / 2, 0, 0);
    const fish = new THREE.Group(); fish.position.y = .06; g.add(fish);
    const orange = this._std(0xf18b4e, { roughness: .55, emissive: 0x6d2c13, ei: .1 });
    this._mesh(fish, new THREE.SphereGeometry(.14, 12, 8), orange, 0, .03, 0, 1.6, .55, .8);
    this._mesh(fish, new THREE.ConeGeometry(.1, .18, 4), orange, -.24, .03, 0, 1, 1, .5, 0, 0, 1.3);
    this._mesh(fish, new THREE.SphereGeometry(.018, 6, 5), this._basic(0x18232a), .16, .06, .07);
    addShadow(this, g, .8, .35);
    return { group: g, kind: 'koi', fish };
  };

  T._makeChime = function () {
    const g = new THREE.Group();
    const wood = this._std(0x4a382a, { roughness: 1 });
    this._mesh(g, new THREE.CylinderGeometry(.04, .06, 1.4, 5), wood, -.34, .7, 0);
    this._mesh(g, new THREE.CylinderGeometry(.04, .06, 1.4, 5), wood, .34, .7, 0);
    this._mesh(g, new THREE.BoxGeometry(.9, .06, .08), wood, 0, 1.38, 0);
    const chime = new THREE.Group(); chime.position.y = 1.35; g.add(chime);
    const metal = this._std(0xb9c4c4, { roughness: .35, metalness: .45 });
    for (let i = 0; i < 4; i++) this._mesh(chime, new THREE.CylinderGeometry(.03, .045, .45 + i * .1, 6), metal, -.25 + i * .17, -.32 - i * .05, 0);
    addShadow(this, g, .9, .5);
    return { group: g, kind: 'chime', chime };
  };

  T._makeCrane = function () {
    const g = new THREE.Group();
    const paper = this._std(0xf1eee3, { roughness: .85 });
    this._mesh(g, new THREE.ConeGeometry(.14, .5, 4), paper, 0, .45, 0, 1, 1, .8, .4, 0, 0);
    this._mesh(g, new THREE.ConeGeometry(.08, .3, 4), paper, .28, .58, 0, 1, 1, .7, 0, 0, -1.2);
    this._mesh(g, new THREE.ConeGeometry(.18, .4, 4), paper, -.1, .45, .06, 1, 1, .1, 0, 0, 1.2);
    this._mesh(g, new THREE.ConeGeometry(.18, .4, 4), paper, -.1, .45, -.06, 1, 1, .1, 0, 0, -1.2);
    this._mesh(g, new THREE.SphereGeometry(.024, 6, 5), this._basic(0x2e2a26), .4, .66, .04);
    addShadow(this, g, .55, .25);
    return { group: g, kind: 'crane' };
  };

  T._makeIncense = function () {
    const g = new THREE.Group();
    const bronze = this._std(0x6e5338, { roughness: .55, metalness: .35 });
    this._mesh(g, new THREE.CylinderGeometry(.3, .2, .3, 10), bronze, 0, .16, 0);
    this._mesh(g, new THREE.CylinderGeometry(.34, .34, .06, 10), bronze, 0, .32, 0);
    for (let i = 0; i < 3; i++) this._mesh(g, new THREE.CylinderGeometry(.012, .012, .45, 5), this._std(0x513b29), -.08 + i * .08, .55, 0);
    const smoke = this._sprite(g, this.tex.snow, 0xd7d2c2, 0, 1.1, .05, .9, 1.7, .1, false);
    addShadow(this, g, .8, .4);
    return { group: g, kind: 'incense', smoke };
  };

  T._makeBell = function () {
    const g = new THREE.Group();
    const wood = this._std(0x443124, { roughness: 1 });
    const bronze = this._std(0x7c6139, { roughness: .45, metalness: .55, flat: true });
    this._mesh(g, new THREE.CylinderGeometry(.09, .12, 2.5, 6), wood, -.62, 1.25, 0);
    this._mesh(g, new THREE.CylinderGeometry(.09, .12, 2.5, 6), wood, .62, 1.25, 0);
    this._mesh(g, new THREE.BoxGeometry(1.5, .12, .16), wood, 0, 2.5, 0);
    const bell = new THREE.Group(); bell.position.y = 2.46; g.add(bell);
    this._mesh(bell, new THREE.CylinderGeometry(.22, .45, .7, 10), bronze, 0, -.4, 0);
    this._mesh(bell, new THREE.CylinderGeometry(.04, .04, .32, 6), this._std(0x57452e), 0, -.02, 0);
    addShadow(this, g, 1.2, .5);
    return { group: g, kind: 'bell', bell };
  };

  T._makeSwordsman = function () {
    const g = new THREE.Group();
    const robe = this._std(0x20272e, { roughness: .9, flat: true });
    const robe2 = this._std(0x39434b, { roughness: .9, flat: true });
    const skin = this._std(0xd6b7a6, { roughness: .62 });
    const hair = this._std(0x0d1117, { roughness: .55 });
    const hat = this._std(0x3e3428, { roughness: 1, flat: true });
    const steel = this._std(0x9b9c96, { roughness: .35, metalness: .4, flat: true });
    this._mesh(g, new THREE.CylinderGeometry(.3, .52, 1.55, 8), robe, 0, .85, 0);
    this._mesh(g, new THREE.CylinderGeometry(.32, .47, .32, 8), robe2, 0, 1.68, 0);
    this._mesh(g, new THREE.SphereGeometry(.22, 16, 12), skin, 0, 1.95, .02, .9, 1.04, .9);
    this._mesh(g, new THREE.SphereGeometry(.24, 14, 10), hair, 0, 2.04, -.09, .95, .86, .95);
    this._mesh(g, new THREE.ConeGeometry(.24, 1.0, 5), hair, 0, 1.45, -.24, 1, 1, .7);
    // 斗笠
    this._mesh(g, new THREE.ConeGeometry(.72, .3, 14), hat, 0, 2.34, 0);
    this._mesh(g, new THREE.CylinderGeometry(.6, .7, .055, 14), hat, 0, 2.18, 0);
    // 眉眼（帽檐下的阴影）
    this._mesh(g, new THREE.BoxGeometry(.24, .018, .012), this._basic(0x271c1b), 0, 1.99, .21);
    this._mesh(g, new THREE.BoxGeometry(.08, .008, .012), this._basic(0x8d5b51), 0, 1.78, .21);
    // 臂
    this._mesh(g, new THREE.CapsuleGeometry(.095, .5, 5, 8), robe2, -.34, 1.38, .02);
    this._mesh(g, new THREE.CapsuleGeometry(.095, .5, 5, 8), robe2, .34, 1.38, .02);
    this._mesh(g, new THREE.SphereGeometry(.08, 8, 6), skin, -.34, 1.07, .03);
    // 背后长剑
    this._mesh(g, new THREE.BoxGeometry(.055, 1.8, .05), steel, -.12, 1.18, -.36, 1, 1, 1, 0, 0, .2);
    this._mesh(g, new THREE.CylinderGeometry(.04, .045, .35, 6), robe2, -.3, .55, -.38, 1, 1, 1, 0, 0, .2);
    this._mesh(g, new THREE.TorusGeometry(.23, .018, 5, 14), this._basic(0xc8e9e7, { transparent: true, opacity: .45 }), -.12, 1.18, -.37, 1, 1.75, 1, 0, 0, .2);
    addShadow(this, g, 1.35, .62);
    return { group: g, kind: 'swordsman' };
  };

  T._makeSchoolBell = function () {
    const g = new THREE.Group();
    const wood = this._std(0x4b3626, { roughness: 1, flat: true });
    const brass = this._std(0x9c7b42, { roughness: .35, metalness: .55, flat: true });
    this._mesh(g, new THREE.CylinderGeometry(.06, .08, 1.7, 6), wood, 0, .85, 0);
    this._mesh(g, new THREE.BoxGeometry(.8, .07, .08), wood, .3, 1.68, 0);
    const bell = new THREE.Group(); bell.position.set(.56, 1.62, 0); g.add(bell);
    this._mesh(bell, new THREE.ConeGeometry(.18, .35, 12, 1, true), brass, 0, -.16, 0);
    this._mesh(bell, new THREE.SphereGeometry(.04, 6, 5), brass, 0, -.36, 0);
    this._mesh(bell, new THREE.CylinderGeometry(.015, .015, .3, 4), this._std(0x3a2b1e), 0, -.02, 0);
    this._sprite(g, this.tex.glowGold, 0xffd68c, .56, 1.4, .1, .9, .9, .08, true);
    addShadow(this, g, .8, .35);
    return { group: g, kind: 'schoolbell', bell };
  };

  T._makeSign = function () {
    const g = new THREE.Group();
    const wood = this._std(0x4b3626, { roughness: 1, flat: true });
    const paper = this._std(0xd6c8a7, { roughness: .9 });
    this._mesh(g, new THREE.CylinderGeometry(.055, .07, 1.3, 5), wood, -.36, .65, 0);
    this._mesh(g, new THREE.CylinderGeometry(.055, .07, 1.3, 5), wood, .36, .65, 0);
    this._mesh(g, new THREE.BoxGeometry(1.05, .62, .08), paper, 0, 1.12, 0);
    this._mesh(g, new THREE.BoxGeometry(1.12, .07, .11), wood, 0, 1.46, 0);
    this._mesh(g, new THREE.BoxGeometry(1.12, .07, .11), wood, 0, .78, 0);
    // 红色告示笔迹
    for (let i = 0; i < 4; i++) this._mesh(g, new THREE.BoxGeometry(.5, .022, .012), this._basic(0x7e2a26, { transparent: true, opacity: .7 }), -.05, 1.3 - i * .12, .05);
    this._mesh(g, new THREE.CylinderGeometry(.09, .09, .02, 12), this._basic(0x9c2e29), .38, 1.1, .05, 1, 1, 1, Math.PI / 2, 0, 0);
    addShadow(this, g, 1.2, .5);
    return { group: g, kind: 'sign' };
  };

  T._makeSquirrel = function () {
    const g = new THREE.Group();
    const fur = this._std(0xb66b35, { roughness: .82, flat: true });
    const fur2 = this._std(0xd99252, { roughness: .82, flat: true });
    const belly = this._std(0xe3c49b, { roughness: .86 });
    const dark = this._basic(0x1a1714);
    const acorn = this._std(0x6b4b2c, { roughness: .8 });
    // 大尾巴
    const tail = new THREE.Group(); tail.position.set(-.28, .3, -.1); g.add(tail);
    this._mesh(tail, new THREE.SphereGeometry(.3, 12, 10), fur2, -.12, .18, 0, .85, 1.6, .65, 0, 0, -.45);
    this._mesh(tail, new THREE.SphereGeometry(.22, 10, 8), fur2, -.26, .5, 0, .75, 1.2, .55, 0, 0, -.7);
    this._mesh(tail, new THREE.SphereGeometry(.15, 8, 6), belly, -.32, .75, .02, .7, .9, .5, 0, 0, -.8);
    // 身体
    this._mesh(g, new THREE.SphereGeometry(.2, 14, 10), fur, 0, .3, 0, .9, 1.25, .8);
    this._mesh(g, new THREE.SphereGeometry(.15, 12, 8), belly, .02, .29, .12, .8, 1.1, .35);
    // 头
    this._mesh(g, new THREE.SphereGeometry(.17, 14, 10), fur, .03, .58, .02, 1, .95, .95);
    this._mesh(g, new THREE.ConeGeometry(.07, .18, 4), fur2, -.02, .73, 0, 1, 1, .7, 0, 0, -.2);
    this._mesh(g, new THREE.ConeGeometry(.07, .18, 4), fur2, .1, .73, 0, 1, 1, .7, 0, 0, .2);
    this._mesh(g, new THREE.SphereGeometry(.026, 6, 5), dark, -.04, .6, .16);
    this._mesh(g, new THREE.SphereGeometry(.026, 6, 5), dark, .1, .6, .16);
    this._mesh(g, new THREE.SphereGeometry(.018, 6, 5), this._basic(0x3a2018), .03, .53, .17);
    // 手里的松果
    const ac = new THREE.Group(); ac.position.set(.18, .35, .17); g.add(ac);
    this._mesh(ac, new THREE.SphereGeometry(.075, 8, 6), acorn, 0, 0, 0, .8, 1.1, .8);
    this._mesh(ac, new THREE.ConeGeometry(.06, .08, 6), dark, 0, .08, 0);
    // 无敌小光环
    const halo = this._mesh(g, new THREE.TorusGeometry(.28, .012, 4, 20), this._basic(0xffdd93, { transparent: true, opacity: .38, additive: true }), 0, .96, 0, 1, .35, 1, Math.PI / 2, 0, 0);
    this._sprite(g, this.tex.glowGold, 0xffd78c, 0, .35, -.1, 1.0, .7, .08, true);
    addShadow(this, g, .6, .3);
    return { group: g, kind: 'squirrel', tail, halo };
  };

  T._makeNpc = function (it) {
    const g = new THREE.Group();
    const data = (it.npc && it.npc.data) || {};
    const sid = data.id || '';
    const isStudent = !!(it.npc && it.npc.isStudent);
    const kits = {
      dormkeeper: { cloth: 0x2b3550, band: 0xb23a32, keys: true },
      canteen: { cloth: 0xd9d6cc, apron: 0xe8e4d8, hat: 0xe8e4d8 },
      doctor: { cloth: 0xe8ecec, coat: true, badge: 0xc94a4a },
      chemistry: { cloth: 0xe8ecec, coat: true, badge: 0x3f7bbf, goggles: true },
      headteacher: { cloth: 0x232830, suit: true, glasses: true },
      art: { cloth: 0x5c4a3a, apron: 0x6b5642, paint: true },
      librarian: { cloth: 0x6d6250, glasses: true, book: true },
      kite: { cloth: 0x3b4a6a, scarf: 0xd9a33a, kite: true }
    };
    const kit = kits[sid] || null;
    const tones = [0x2c4b6e, 0x35526f, 0x27415c];
    const uniform = this._std(kit ? kit.cloth : tones[Math.abs(Math.floor((it.x || 0) / 100)) % tones.length], { roughness: .9, flat: true });
    const white = this._std(0xe4e6df, { roughness: .85, flat: true });
    const skin = this._std(0xd8b18f, { roughness: .75 });
    const dark = this._std(0x1c242b, { roughness: 1 });
    const hair = this._std(0x171a1d, { roughness: .9 });
    // 校服裤与鞋
    this._mesh(g, new THREE.CapsuleGeometry(.065, .38, 4, 6), dark, -.09, .36, 0);
    this._mesh(g, new THREE.CapsuleGeometry(.065, .38, 4, 6), dark, .09, .36, 0);
    this._mesh(g, new THREE.BoxGeometry(.13, .08, .22), dark, -.09, .05, .04);
    this._mesh(g, new THREE.BoxGeometry(.13, .08, .22), dark, .09, .05, .04);
    // 校服 / 白大褂 / 外套
    this._mesh(g, new THREE.BoxGeometry(.38, .5, .22), uniform, 0, .92, 0);
    this._mesh(g, new THREE.BoxGeometry(.4, .1, .23), white, 0, 1.13, 0);
    this._mesh(g, new THREE.PlaneGeometry(.12, .16), white, 0, 1.04, .115, 1, 1, 1, 0, 0, Math.PI / 4);
    this._mesh(g, new THREE.CapsuleGeometry(.055, .38, 4, 6), uniform, -.235, .92, 0);
    this._mesh(g, new THREE.CapsuleGeometry(.055, .38, 4, 6), uniform, .235, .92, 0);
    this._mesh(g, new THREE.SphereGeometry(.055, 8, 6), skin, -.235, .69, 0);
    this._mesh(g, new THREE.SphereGeometry(.055, 8, 6), skin, .235, .69, 0);
    // 头与头发
    this._mesh(g, new THREE.CylinderGeometry(.05, .05, .08, 6), skin, 0, 1.2, 0);
    this._mesh(g, new THREE.SphereGeometry(.155, 14, 10), skin, 0, 1.34, 0, .92, 1.05, .92);
    this._mesh(g, new THREE.SphereGeometry(.16, 12, 8), hair, 0, 1.4, -.02, .98, .8, 1);
    this._mesh(g, new THREE.SphereGeometry(.018, 6, 5), dark, -.055, 1.35, .135);
    this._mesh(g, new THREE.SphereGeometry(.018, 6, 5), dark, .055, 1.35, .135);
    if (kit) {
      if (kit.coat) {
        this._mesh(g, new THREE.BoxGeometry(.36, .46, .04), white, 0, .9, .12);
        this._mesh(g, new THREE.BoxGeometry(.02, .38, .05), dark, 0, .92, .145);
        if (kit.badge) this._mesh(g, new THREE.BoxGeometry(.06, .04, .012), this._basic(kit.badge), .11, 1.02, .145);
      }
      if (kit.suit) {
        this._mesh(g, new THREE.BoxGeometry(.34, .44, .03), dark, 0, .92, .13);
        this._mesh(g, new THREE.PlaneGeometry(.06, .2), this._std(0x7a2a2a, { roughness: .8 }), 0, .98, .15);
      }
      if (kit.apron) {
        this._mesh(g, new THREE.BoxGeometry(.3, .4, .03), this._std(kit.apron, { roughness: .9, flat: true }), 0, .82, .13);
        this._mesh(g, new THREE.BoxGeometry(.02, .3, .035), white, 0, 1.06, .14);
      }
      if (kit.band) {
        this._mesh(g, new THREE.BoxGeometry(.07, .07, .14), this._basic(kit.band), -.245, .98, .02);
      }
      if (kit.hat) {
        this._mesh(g, new THREE.CylinderGeometry(.16, .17, .12, 10), this._std(kit.hat, { roughness: .95 }), 0, 1.53, 0);
        this._mesh(g, new THREE.CylinderGeometry(.2, .2, .03, 10), this._std(kit.hat, { roughness: .95 }), 0, 1.47, 0);
      }
      if (kit.glasses) {
        for (const x of [-.06, .06]) this._mesh(g, new THREE.BoxGeometry(.07, .03, .012), this._basic(0x1a2228), x, 1.37, .145);
        this._mesh(g, new THREE.BoxGeometry(.035, .012, .012), this._basic(0x1a2228), 0, 1.37, .145);
      }
      if (kit.goggles) {
        this._mesh(g, new THREE.BoxGeometry(.24, .06, .03), this._basic(0x8fd8e8, { transparent: true, opacity: .55 }), 0, 1.47, .13);
      }
      if (kit.scarf) {
        this._mesh(g, new THREE.BoxGeometry(.3, .07, .25), this._std(kit.scarf, { roughness: .9 }), 0, 1.17, 0);
        this._mesh(g, new THREE.BoxGeometry(.07, .28, .04), this._std(kit.scarf, { roughness: .9 }), .12, 1.02, .12);
      }
      if (kit.book) {
        this._mesh(g, new THREE.BoxGeometry(.2, .05, .14), this._std(0x72502f, { roughness: .9 }), .27, .74, .05);
        this._mesh(g, new THREE.BoxGeometry(.18, .035, .12), white, .27, .78, .05);
      }
      if (kit.paint) {
        const colors = [0xc94a4a, 0x3f7bbf, 0xd9a33a];
        for (let i = 0; i < 3; i++) this._mesh(g, new THREE.BoxGeometry(.035, .035, .01), this._basic(colors[i]), -.08 + i * .08, .84 - i * .04, .152);
      }
      if (kit.kite) {
        const kite = this._mesh(g, new THREE.PlaneGeometry(.22, .3), this._basic(0xd9a33a, { side: THREE.DoubleSide }), .18, 1.15, -.2, 1, 1, 1, 0, 0, Math.PI / 4);
        this._mesh(g, new THREE.BoxGeometry(.01, .3, .01), dark, .18, .98, -.2);
      }
      if (kit.keys) {
        this._mesh(g, new THREE.BoxGeometry(.05, .12, .04), this._std(0x8a7a4a, { roughness: .4, metalness: .3 }), -.24, .72, .06);
      }
    }
    // 校牌（学生）或工作牌
    this._mesh(g, new THREE.BoxGeometry(.06, .04, .012), this._basic(isStudent ? 0xb43a32 : 0x3f7bbf), .12, .99, .12);
    addShadow(this, g, .8, .4);
    g.scale.setScalar(1.05);
    return { group: g, kind: 'npc' };
  };

  T._makeZoneMarker = function () {
    const g = new THREE.Group();
    const wood = this._std(0x3a2d24, { roughness: 1, flat: true });
    const board = this._std(0x2a3b42, { roughness: .9, flat: true });
    const glowMat = this._basic(0x9fe8ff, { transparent: true, opacity: .06, depthWrite: false, side: THREE.DoubleSide });
    this._mesh(g, new THREE.CylinderGeometry(.04, .055, 1.7, 6), wood, 0, .85, 0);
    this._mesh(g, new THREE.BoxGeometry(.9, .5, .06), board, 0, 1.55, 0);
    this._mesh(g, new THREE.BoxGeometry(.96, .06, .08), wood, 0, 1.82, 0);
    const glow = this._sprite(g, this.tex.glowCyan, 0x9fe8ff, 0, 1.55, .1, 1.7, 1.15, .15, true);
    const ring = this._mesh(g, new THREE.RingGeometry(.52, .59, 24), glowMat, 0, .02, 0, 1, 1, 1, -Math.PI / 2, 0, 0);
    addShadow(this, g, .9, .45);
    return { group: g, kind: 'zone', glow, ring };
  };

  T._makeNoticeBoard = function () {
    const g = new THREE.Group();
    const wood = this._std(0x4a382a, { roughness: 1, flat: true });
    const board = this._std(0x25343a, { roughness: .9, flat: true });
    const red = this._std(0x8e2a25, { roughness: .9, flat: true });
    const paper = this._basic(0xe6e2d2, { side: THREE.DoubleSide });
    for (const x of [-.52, .52]) this._mesh(g, new THREE.CylinderGeometry(.045, .06, 1.75, 6), wood, x, .88, 0);
    this._mesh(g, new THREE.BoxGeometry(1.2, .72, .07), board, 0, 1.28, 0);
    this._mesh(g, new THREE.BoxGeometry(1.24, .12, .08), red, 0, 1.7, 0);
    for (let i = 0; i < 4; i++) {
      this._mesh(g, new THREE.PlaneGeometry(.22, .28), paper, -.42 + (i % 2) * .5, 1.36 - Math.floor(i / 2) * .36, .045, 1, 1, 1, 0, 0, (i % 2 ? -.04 : .05));
    }
    addShadow(this, g, 1.4, .45);
    return { group: g, kind: 'journal' };
  };

  T._makeInteractable = function (it) {
    const f = { rabbit: '_makeRabbit', cat: '_makeCat', lantern: '_makeLantern', koi: '_makeKoi', chime: '_makeChime', crane: '_makeCrane', incense: '_makeIncense', bell: '_makeBell', swordsman: '_makeSwordsman', sign: '_makeSign', schoolbell: '_makeSchoolBell', squirrel: '_makeSquirrel', npc: '_makeNpc', zone: '_makeZoneMarker', journal: '_makeNoticeBoard' }[it.kind];
    if (!f || !this[f]) return null;
    const m = this[f]();
    m.model = it;
    m.baseX = it.x;
    this.actorGroup.add(m.group);
    return m;
  };

  T.updateInteractables3D = function (game) {
    if (!this.interactModels) this.interactModels = new Map();
    if (this.interStage !== game.level.id) {
      for (const m of this.interactModels.values()) this.actorGroup.remove(m.group);
      this.interactModels.clear();
      this.interStage = game.level.id;
    }
    for (const it of game.interactables || []) {
      let m = this.interactModels.get(it.id);
      if (!m) {
        m = this._makeInteractable(it);
        if (!m) continue;
        this.interactModels.set(it.id, m);
      }
      const x = it.x / 100, z = it.z || 0, y = (850 - (it.y === undefined ? 850 : it.y)) / 100;
      const t = this.lastTime + (it.x * .01);
      let bob = 0;
      if (m.kind === 'rabbit') bob = Math.abs(Math.sin(t * 2.2)) * .06;
      if (m.kind === 'crane') bob = Math.sin(t * 2.6) * .08;
      if (m.kind === 'koi') m.fish.position.x = Math.sin(t * 1.3) * .25;
      if (m.kind === 'cat' && m.tail) m.tail.rotation.z = Math.sin(t * 1.7) * .12;
      if (m.kind === 'chime' && m.chime) m.chime.rotation.z = Math.sin(t * 1.4) * .06;
      if (m.kind === 'bell' && m.bell) m.bell.rotation.z = Math.sin(t * .8) * .03;
      if (m.kind === 'incense' && m.smoke) m.smoke.material.opacity = .08 + Math.sin(t) * .02;
      if (m.kind === 'npc') bob = Math.sin(t * 1.6) * .015;
      if (m.kind === 'zone' && m.glow) m.glow.material.opacity = .11 + Math.sin(t * 1.8) * .035;
      if (m.kind === 'zone' && m.ring) m.ring.rotation.z = t * .35;
      if (it.used) {
        const age = game.time - (it.interactAt || 0);
        if (m.kind === 'rabbit' && age < 2) bob += Math.abs(Math.sin(age * 15)) * .35;
        if (m.kind === 'cat' && m.tail) m.tail.rotation.z += Math.sin(age * 9) * .25 * Math.max(0, 1 - age / 2);
        if (m.kind === 'lantern' && m.glow) m.glow.material.opacity = Math.min(.42, .2 + Math.sin(age * 2) * .06);
        if (m.kind === 'chime' && m.chime && age < 2) m.chime.rotation.z += Math.sin(age * 14) * .3 * (1 - age / 2);
        if (m.kind === 'bell' && m.bell && age < 3) m.bell.rotation.z += Math.sin(age * 7) * .18 * (1 - age / 3);
        if (m.kind === 'crane' && age < 4) { bob += Math.min(3, age * 1.2); m.group.rotation.y += .08; }
        if (m.kind === 'koi' && age < 2) bob += Math.sin(age * 6) * .08;
        if (m.kind === 'schoolbell' && m.bell && age < 3) m.bell.rotation.z += Math.sin(age * 12) * .3 * (1 - age / 3);
        if (m.kind === 'swordsman' && age < 4) m.group.rotation.z = Math.sin(age * 2.2) * .035 * (1 - age / 4);
      }
      m.group.position.set(x, y + bob, z);
    }
  };
})();
