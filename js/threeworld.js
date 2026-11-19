/* 三中风云 — 低多边形 3D 水墨舞台 */
(function () {
  'use strict';
  if (!window.THREE) { window.ThreeWorld = null; return; }

  const THREE = window.THREE;
  const TAU = Math.PI * 2;
  const PX = 100;
  const GY = 850;
  const toX = (x) => x / PX;
  const toY = (y) => (GY - y) / PX;

  function makeCircleTexture(inner, outer, size) {
    size = size || 128;
    const c = document.createElement('canvas'); c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, inner);
    g.addColorStop(.32, inner);
    g.addColorStop(.72, outer);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function makeCrescentTexture(color, glow) {
    const w = 256, h = 160;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = glow || 'rgba(140,245,255,.22)'; ctx.lineWidth = 30; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(w * .44, h * .52, 76, -1.2, 1.2); ctx.stroke();
    ctx.strokeStyle = color || '#c8fcff'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(w * .44, h * .52, 78, -1.18, 1.18); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.96)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(w * .44, h * .52, 84, -1.08, 1.1); ctx.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function makeShadowTexture() {
    const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.5, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }
  function makeWhaleTexture() {
    const w = 256, h = 160, c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(115,220,255,.32)';
    ctx.beginPath(); ctx.ellipse(120, 84, 74, 35, -.08, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(185, 76); ctx.quadraticCurveTo(226, 32, 242, 70); ctx.quadraticCurveTo(220, 85, 244, 116); ctx.quadraticCurveTo(204, 98, 184, 96); ctx.closePath(); ctx.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makePetalTexture() {
    const s = 64, c = document.createElement('canvas'); c.width = c.height = s;
    const ctx = c.getContext('2d');
    ctx.save(); ctx.translate(s / 2, s / 2); ctx.rotate(.5);
    const g = ctx.createLinearGradient(-10, -20, 12, 22);
    g.addColorStop(0, 'rgba(255,246,235,1)'); g.addColorStop(.45, 'rgba(255,180,178,.95)'); g.addColorStop(1, 'rgba(197,55,57,.7)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 22, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,235,218,.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.stroke();
    ctx.restore();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeBoardTexture(w, h, bg, lines, border) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    if (border) { ctx.strokeStyle = border; ctx.lineWidth = Math.max(4, w * .012); ctx.strokeRect(5, 5, w - 10, h - 10); }
    ctx.textAlign = 'center';
    lines.forEach(L => {
      ctx.font = `${L.weight || 400} ${L.size}px "STKaiti","KaiTi","Microsoft YaHei",serif`;
      ctx.fillStyle = L.color || 'rgba(245,240,220,.82)';
      ctx.fillText(L.text, w * .5, L.y);
    });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function makeBadgeTexture() {
    const n = 128, c = document.createElement('canvas'); c.width = c.height = n;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#b63b34'; ctx.beginPath(); ctx.arc(64, 64, 58, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,214,.72)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(64, 64, 53, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#f7f0df'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 55px "STKaiti","KaiTi",serif'; ctx.fillText('三中', 64, 68);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const PALETTES = {
    title: { sky: 0x07131e, fog: 0x102a3b, ground: 0xb8ccd1, path: 0xdce8e8, mount: 0x1a3545, snow: 0xe8f1ef, key: 0xfff2da, rim: 0x67e8ff, moon: 0xeaf4ed, moonGlow: 0xb8eef2 },
    snow:  { sky: 0x071521, fog: 0x102b3b, ground: 0xaec2c7, path: 0xdce7e7, mount: 0x173443, snow: 0xe8f1ef, key: 0xfff1d8, rim: 0x6fe9ff, moon: 0xeaf4ed, moonGlow: 0xb8eef2 },
    bamboo:{ sky: 0x04141a, fog: 0x0a2a2c, ground: 0x1f3932, path: 0x2f4b3d, mount: 0x0c262b, snow: 0x9fc7b6, key: 0xffe6c6, rim: 0x5ce1cb, moon: 0xd9efe7, moonGlow: 0x87d8c8 },
    temple:{ sky: 0x140908, fog: 0x2d1512, ground: 0x3a2823, path: 0x493128, mount: 0x1e0e0d, snow: 0xbe7a57, key: 0xffc48e, rim: 0xff7252, moon: 0xf0c192, moonGlow: 0xd88355 },
    boss:  { sky: 0x080407, fog: 0x1c0b10, ground: 0x1e1818, path: 0x2b2322, mount: 0x110a0d, snow: 0x8d4a42, key: 0xffd2b1, rim: 0xff5747, moon: 0xff715d, moonGlow: 0xc9302d }
  };

  class ThreeWorld {
    constructor(game) {
      this.game = game;
      this.canvas = document.getElementById('world3d');
      this.failed = false;
      try {
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.18;
        this.renderer.setClearColor(0x07131e, 1);
      } catch (e) {
        console.warn('3D 渲染初始化失败，回退到 2D。', e);
        this.failed = true;
        return;
      }
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, 16 / 9, .1, 180);
      this.scene.background = new THREE.Color(0x07131e);
      this.scene.fog = new THREE.Fog(0x102b3b, 20, 58);
      this.skyUniforms = {
        top: { value: new THREE.Color(0x07131e) },
        horizon: { value: new THREE.Color(0x4f6f7e) },
        bottom: { value: new THREE.Color(0x0a1218) }
      };
      const skyMat = new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        vertexShader: 'varying vec3 vW; void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }',
        fragmentShader: 'varying vec3 vW; uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; void main(){ float h = clamp((vW.y + 5.0) / 26.0, 0.0, 1.0); vec3 c = mix(bottom, horizon, smoothstep(0.0,0.34,h)); c = mix(c, top, smoothstep(0.34,1.0,h)); gl_FragColor = vec4(c,1.0); }',
        side: THREE.BackSide, depthWrite: false, fog: false
      });
      this.skyMesh = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 20), skyMat);
      this.skyMesh.renderOrder = -20;
      this.scene.add(this.skyMesh);
      this.envGroup = new THREE.Group();
      this.actorGroup = new THREE.Group();
      this.dynamicGroup = new THREE.Group();
      this.omenGroup = new THREE.Group();
      this.scene.add(this.envGroup, this.actorGroup, this.dynamicGroup, this.omenGroup);
      this.omenEvent = null;
      this.omenTimer = 22;
      this.omenIndex = 0;
      this.envClock = 0;
      this.weatherBoost = 1;
      this.currentCamX = 10;
      this.stageKey = null;
      this.mode = null;
      this.theme = 'snow';
      this.playerModel = null;
      this.titleBoss = null;
      this.bossModel = null;
      this.enemyModels = new Map();
      this.secretModels = new Map();
      this.projectileModels = new Map();
      this.hazardModels = new Map();
      this.lastDt = .016;
      this.lastTime = performance.now() / 1000;
      this.orbit = { yaw: 0, pitch: 0, dragging: false, lastX: 0, lastY: 0 };
      this._bindOrbit();
      this.ensureMaterials();
      this.setupLights();
      this.resize();
      this.setVisible(false);
      this._initPostFX();
    }

    _bindOrbit() {
      window.addEventListener('contextmenu', (e) => {
        if (this.game && this.game.state === 'playing' && this.visible) e.preventDefault();
      });
      window.addEventListener('pointerdown', (e) => {
        if (e.button !== 2 || !this.game || this.game.state !== 'playing' || !this.visible) return;
        if (e.target && e.target.closest && e.target.closest('button,input,.screen,.dialogue')) return;
        this.orbit.dragging = true;
        this.orbit.lastX = e.clientX;
        this.orbit.lastY = e.clientY;
      });
      window.addEventListener('pointermove', (e) => {
        if (!this.orbit.dragging) return;
        const dx = e.clientX - this.orbit.lastX;
        const dy = e.clientY - this.orbit.lastY;
        this.orbit.lastX = e.clientX; this.orbit.lastY = e.clientY;
        this.orbit.yaw -= dx * .006;
        this.orbit.pitch = U.clamp(this.orbit.pitch + dy * .004, -.35, 1.2);
      });
      const end = () => { this.orbit.dragging = false; };
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    }

    ensureMaterials() {
      this.tex = {
        glowCyan: makeCircleTexture('rgba(196,252,255,1)', 'rgba(67,208,238,.45)'),
        glowBlue: makeCircleTexture('rgba(190,220,255,1)', 'rgba(80,120,255,.4)'),
        glowRed: makeCircleTexture('rgba(255,210,180,1)', 'rgba(255,77,58,.42)'),
        glowGold: makeCircleTexture('rgba(255,248,218,1)', 'rgba(255,190,95,.4)'),
        snow: makeCircleTexture('rgba(245,252,255,.95)', 'rgba(204,237,245,.15)', 64),
        shadow: makeShadowTexture(),
        crescentCyan: makeCrescentTexture('#d8fdff', 'rgba(90,227,249,.40)'),
        crescentRed: makeCrescentTexture('#ffd2b7', 'rgba(255,74,54,.36)'),
        whale: makeWhaleTexture(),
        petal: makePetalTexture(),
        schoolSign: makeBoardTexture(512, 190, '#18303c', [{ text: '邵 东 三 中', size: 62, weight: 700, y: 80, color: '#f2e6c8' }, { text: '求真 · 扬善 · 尚美', size: 27, y: 133, color: 'rgba(232,220,185,.65)' }, { text: '读 论 山', size: 21, y: 166, color: 'rgba(100,229,255,.55)' }], 'rgba(232,196,122,.65)'),
        streetSign: makeBoardTexture(512, 104, '#1a2930', [{ text: '读论山 · 星火路', size: 38, y: 64, color: 'rgba(232,236,220,.85)' }], 'rgba(232,196,122,.5)'),
        schoolBoard: makeBoardTexture(1024, 512, '#243a32', [{ text: '距高考  100  天', size: 66, weight: 700, y: 140, color: 'rgba(239,237,210,.8)' }, { text: '逸夫楼 · 高三（?）班', size: 36, y: 225, color: 'rgba(239,237,210,.5)' }, { text: '求真 · 扬善 · 尚美', size: 26, y: 285, color: 'rgba(232,220,185,.52)' }, { text: '苦干 · 苦教 · 苦学', size: 22, y: 323, color: 'rgba(232,220,185,.3)' }, { text: '别为我做傻事。', size: 46, y: 405, color: 'rgba(240,210,192,.65)' }, { text: '—— 未寄出的信', size: 28, y: 465, color: 'rgba(239,237,210,.35)' }], 'rgba(128,100,71,.6)'),
        schoolBadge: makeBadgeTexture(),
        librarySign: makeBoardTexture(512, 160, '#5b2320', [{ text: '特 立 图 书 馆', size: 64, weight: 700, y: 80, color: '#f4dca6' }, { text: '1956 · 求真 扬善 尚美', size: 22, y: 126, color: 'rgba(240,214,160,.55)' }], 'rgba(232,196,122,.7)'),
        classBoard: makeBoardTexture(1024, 420, '#203a30', [{ text: '少年当有凌云志', size: 64, weight: 700, y: 110, color: '#f2e7c4' }, { text: '万里长空竞风流', size: 64, weight: 700, y: 210, color: '#f2e7c4' }, { text: '2025 秋季 · 开学第一课', size: 30, y: 310, color: 'rgba(240,230,200,.6)' }, { text: '高三（14）班', size: 26, y: 360, color: 'rgba(240,230,200,.4)' }], 'rgba(232,196,122,.6)'),
        classScreen: makeBoardTexture(512, 288, '#123a52', [{ text: '2025 年秋季学期', size: 36, y: 80, color: '#bfeaff' }, { text: '开学第一课', size: 54, weight: 700, y: 152, color: '#e8fbff' }, { text: '警示教育 · 算力安全', size: 26, y: 218, color: 'rgba(190,240,255,.7)' }], 'rgba(100,229,255,.6)'),
        classSlogan: makeBoardTexture(1024, 180, '#9e2a24', [{ text: '弘扬抗战精神 · 强国复兴有我', size: 46, weight: 700, y: 92, color: '#ffe9c4' }], 'rgba(255,220,160,.4)'),
        teachingSign: makeBoardTexture(512, 170, '#22343c', [{ text: '逸 夫 楼', size: 66, weight: 700, y: 78, color: '#f0e6cc' }, { text: '高三年级 · 求真 扬善 尚美', size: 24, y: 128, color: 'rgba(232,220,185,.62)' }], 'rgba(232,196,122,.6)'),
        dormSign: makeBoardTexture(512, 170, '#243a42', [{ text: '学 生 公 寓', size: 60, weight: 700, y: 78, color: '#eaf2ee' }, { text: '女左男右 · 22:10 熄灯', size: 23, y: 128, color: 'rgba(190,230,235,.6)' }], 'rgba(100,229,255,.45)'),
        canteenSign: makeBoardTexture(512, 170, '#4a2a1c', [{ text: '三 中 食 堂', size: 62, weight: 700, y: 78, color: '#ffe6b8' }, { text: '热食补给 · 请自觉排队', size: 23, y: 128, color: 'rgba(255,214,160,.62)' }], 'rgba(255,190,95,.55)'),
        mailSign: makeBoardTexture(512, 170, '#25333a', [{ text: '收 发 室', size: 58, weight: 700, y: 78, color: '#eef2e8' }, { text: '信件 · 包裹 · 失物招领', size: 22, y: 128, color: 'rgba(220,226,210,.55)' }], 'rgba(232,196,122,.5)'),
        sportsBanner: makeBoardTexture(1024, 170, '#7d2a24', [{ text: '发展体育运动 · 增强人民体质', size: 46, weight: 700, y: 90, color: '#ffe9c4' }], 'rgba(255,220,160,.4)'),
        sloganBanner: makeBoardTexture(768, 220, '#9e2a24', [{ text: '今日我以三中为荣', size: 44, weight: 700, y: 82, color: '#ffe9c4' }, { text: '明日三中以我为荣', size: 44, weight: 700, y: 152, color: '#ffe9c4' }], 'rgba(255,220,160,.4)')
      };
      this.matCache = new Map();
    }

    _std(color, opts) {
      opts = opts || {};
      return new THREE.MeshStandardMaterial({
        color: color,
        roughness: opts.roughness === undefined ? .72 : opts.roughness,
        metalness: opts.metalness === undefined ? 0 : opts.metalness,
        flatShading: !!opts.flat,
        emissive: opts.emissive === undefined ? 0x000000 : opts.emissive,
        emissiveIntensity: opts.ei === undefined ? 1 : opts.ei,
        transparent: !!opts.transparent,
        opacity: opts.opacity === undefined ? 1 : opts.opacity,
        side: opts.side || THREE.FrontSide,
        depthWrite: opts.depthWrite === undefined ? true : opts.depthWrite,
        fog: opts.fog === undefined ? true : opts.fog
      });
    }
    _basic(color, opts) {
      opts = opts || {};
      return new THREE.MeshBasicMaterial({
        color: color,
        transparent: !!opts.transparent,
        opacity: opts.opacity === undefined ? 1 : opts.opacity,
        side: opts.side || THREE.FrontSide,
        depthWrite: opts.depthWrite === undefined ? true : opts.depthWrite,
        blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        fog: opts.fog === undefined ? true : opts.fog
      });
    }
    _mesh(parent, geo, material, x, y, z, sx, sy, sz, rx, ry, rz) {
      const m = new THREE.Mesh(geo, material);
      m.position.set(x || 0, y || 0, z || 0);
      m.scale.set(sx === undefined ? 1 : sx, sy === undefined ? 1 : sy, sz === undefined ? 1 : sz);
      m.rotation.set(rx || 0, ry || 0, rz || 0);
      m.castShadow = false; m.receiveShadow = false;
      if (parent) parent.add(m);
      return m;
    }
    _sprite(parent, texture, color, x, y, z, sx, sy, opacity, additive) {
      const sm = new THREE.SpriteMaterial({ map: texture, color: color || 0xffffff, transparent: true, opacity: opacity === undefined ? 1 : opacity, depthWrite: false, blending: additive === false ? THREE.NormalBlending : THREE.AdditiveBlending, fog: false });
      const s = new THREE.Sprite(sm);
      s.position.set(x || 0, y || 0, z || 0);
      s.scale.set(sx || 1, sy || 1, 1);
      if (parent) parent.add(s);
      return s;
    }
    _shadow(parent, sx, sz, opacity) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(sx || 2, sz || 1), new THREE.MeshBasicMaterial({ map: this.tex.shadow, transparent: true, opacity: opacity === undefined ? .7 : opacity, depthWrite: false, color: 0x000000 }));
      m.rotation.x = -Math.PI / 2;
      m.position.y = .012;
      m.renderOrder = 2;
      if (parent) parent.add(m);
      return m;
    }

    setupLights() {
      this.hemi = new THREE.HemisphereLight(0xbfeaff, 0x1a2428, 1.3);
      this.key = new THREE.DirectionalLight(0xfff0d8, 2.2);
      this.key.position.set(-8, 16, 11);
      this.rim = new THREE.DirectionalLight(0x67e7ff, 1.1);
      this.rim.position.set(9, 8, -8);
      this.ambient = new THREE.AmbientLight(0x8aa7b4, .35);
      this.scene.add(this.hemi, this.key, this.rim, this.ambient);
    }

    resize() {
      if (this.failed) return;
      const g = this.game;
      const s = Math.min(window.devicePixelRatio || 1, 2);
      const pr = Math.min((window.devicePixelRatio || 1) * (g.renderScale || 1), 2.2);
      this.renderer.setPixelRatio(pr);
      this.renderer.setSize(1920, 1080, false);
      this.canvas.style.width = (1920 * (g.renderScale || 1)) + 'px';
      this.canvas.style.height = (1080 * (g.renderScale || 1)) + 'px';
      this.canvas.style.left = (g.offsetX || 0) + 'px';
      this.canvas.style.top = (g.offsetY || 0) + 'px';
      this.camera.aspect = 16 / 9;
      this.camera.updateProjectionMatrix();
      if (this.composer) { this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(1920, 1080); if (this.colorGradePass) this.colorGradePass.uniforms.resolution.value.set(1920, 1080); }
    }
    _initPostFX() {
      if (!window.ThreePost) return;
      try {
        const P = window.ThreePost;
        this.composer = new P.EffectComposer(this.renderer);
        this.renderPass = new P.RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        this.bloom = new P.UnrealBloomPass(new THREE.Vector2(1920, 1080), .55, .45, .86);
        this.composer.addPass(this.bloom);
        const gradeShader = {
          uniforms: { tDiffuse: { value: null }, resolution: { value: new THREE.Vector2(1920, 1080) } },
          vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
          fragmentShader: `
            uniform sampler2D tDiffuse; uniform vec2 resolution; varying vec2 vUv;
            float luma(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
            void main(){
              vec4 c = texture2D(tDiffuse, vUv);
              vec2 px = 1.0 / resolution;
              float l = luma(c.rgb);
              float lx = luma(texture2D(tDiffuse, vUv + vec2(px.x,0.0)).rgb) - luma(texture2D(tDiffuse, vUv - vec2(px.x,0.0)).rgb);
              float ly = luma(texture2D(tDiffuse, vUv + vec2(0.0,px.y)).rgb) - luma(texture2D(tDiffuse, vUv - vec2(0.0,px.y)).rgb);
              float edge = smoothstep(.055, .22, length(vec2(lx,ly)));
              vec3 col = c.rgb;
              float lum = luma(col);
              col = mix(vec3(lum), col, .92);
              col *= vec3(.91, 1.0, 1.065);
              col += vec3(-.012, .006, .018);
              col = mix(col, vec3(.012,.020,.028), edge * .58);
              gl_FragColor = vec4(col, c.a);
            }`
        };
        this.colorGradePass = new P.ShaderPass(gradeShader);
        this.composer.addPass(this.colorGradePass);
        this.composer.addPass(new P.ShaderPass(P.GammaCorrectionShader));
        this.composer.setPixelRatio(this.renderer.getPixelRatio());
        this.composer.setSize(1920, 1080);
      } catch (e) { console.warn('后处理关闭', e); this.composer = null; }
    }

    _renderFrame() {
      if (this.composer) this.composer.render();
      else this.renderer.render(this.scene, this.camera);
    }

    setVisible(v) {
      if (this.failed) return;
      this.canvas.style.visibility = v ? 'visible' : 'hidden';
      this.visible = v;
    }
    project(x, y, z) {
      if (this.failed) return { x: 960, y: 540, visible: false };
      const v = new THREE.Vector3(toX(x), toY(y), z || 0);
      v.project(this.camera);
      return { x: (v.x * .5 + .5) * 1920, y: (-v.y * .5 + .5) * 1080, visible: v.z > -1 && v.z < 1 };
    }

    _clearGroup(g) {
      while (g.children.length) {
        const c = g.children.pop();
        c.traverse && c.traverse(o => {
          if (o.isMesh || o.isPoints || o.isSprite) {
            if (o.geometry && o.geometry.dispose) o.geometry.dispose();
            if (o.material) {
              if (Array.isArray(o.material)) o.material.forEach(m => m.dispose && m.dispose());
              else if (o.material.dispose) o.material.dispose();
            }
          }
        });
      }
    }

    buildStage(theme, width, opts) {
      if (this.failed) return;
      opts = opts || {};
      const key = opts.title ? 'title' : (theme + ':' + width);
      if (this.stageKey === key) return;
      this.stageKey = key;
      this.theme = opts.title ? 'title' : theme;
      this.mode = opts.title ? 'title' : 'game';
      this.width = width;
      this._clearGroup(this.envGroup);
      this._clearGroup(this.dynamicGroup);
      this._clearGroup(this.omenGroup);
      this.omenEvent = null;
      this.omenTimer = 22;
      this.omenIndex = 0;
      this.envClock = 0;
      this.weatherBoost = 1;
      this.projectileModels.clear();
      this.hazardModels.clear();
      this.clearEnemies();
      this.clearBoss();
      for (const sm of this.secretModels.values()) this.actorGroup.remove(sm.group);
      this.secretModels.clear();
      if (this.interactModels) {
        for (const im of this.interactModels.values()) this.actorGroup.remove(im.group);
        this.interactModels.clear();
      }
      this.interStage = null;
      if (this.titleBoss) {
        this.actorGroup.remove(this.titleBoss.group);
        this.actorGroup.remove(this.titleBoss.shadow);
        this.titleBoss = null;
      }
      const p = PALETTES[theme] || PALETTES.snow;
      this.pal = p;
      this.scene.background = new THREE.Color(p.sky);
      this.scene.fog = new THREE.Fog(p.fog, opts.title ? 17 : 21, opts.title ? 60 : 66);
      this.skyUniforms.top.value.setHex(p.sky);
      this.skyUniforms.horizon.value.setHex(p.fog).lerp(new THREE.Color(0xffffff), theme === 'boss' ? .08 : .16);
      this.skyUniforms.bottom.value.setHex(p.ground).multiplyScalar(.28);
      this.hemi.color = new THREE.Color(p.sky).lerp(new THREE.Color(0xffffff), .45);
      this.hemi.groundColor = new THREE.Color(p.ground).lerp(new THREE.Color(0x0a1116), .6);
      this.key.color = new THREE.Color(p.key);
      this.rim.color = new THREE.Color(p.rim);
      this.key.intensity = this.theme === 'boss' ? 1.8 : 2.2;
      this.rim.intensity = this.theme === 'boss' ? 1.3 : 1.1;

      const w = width / PX;
      this.widthU = w;
      this.ground = this._mesh(this.envGroup, new THREE.PlaneGeometry(w + 36, 36), this._std(p.ground, { roughness: .94 }), w / 2, -.035, 0, 1, 1, 1, -Math.PI / 2, 0, 0);
      this._buildRoad(p, w, theme);

      this._buildMountains(p, w, theme);
      this._buildStars(p, w, theme);
      this._buildMoon(p, theme);
      this._buildSkyWhale(p);
      if (theme === 'bamboo') this._buildBamboo(p, w);
      else if (theme === 'temple') this._buildTemple(p, w);
      else if (theme === 'boss') this._buildBossStage(p, w);
      else this._buildSnow(p, w, opts.title);

      this._buildEdgeStones(p, w, theme);
      this._buildLanterns(p, w, theme);
      this._buildMist(p, w, theme);
      this._buildBarriers();
      this._buildWeather(theme);
      if (!this.playerModel) this._buildPlayer();
      this.playerModel.group.visible = true;
      if (opts.title) this._buildTitleBoss();
      else {
        if (this.playerShadow) this.playerShadow.visible = true;
        this._ensureActorScene();
      }
      this.camera.position.set(10, 4.7, 13.7);
      this.camera.lookAt(10, 1.9, 0);
    }

    _buildRoad(p, w, theme) {
      const g = new THREE.Group();
      this.envGroup.add(g);
      const roadW = 7.2;
      const dark = this._std(theme === 'snow' || theme === 'title' ? 0x56686c : theme === 'bamboo' ? 0x152b28 : theme === 'temple' ? 0x2a1815 : 0x151012, { roughness: 1, flat: true });
      const base = this._mesh(g, new THREE.BoxGeometry(w + 22, .18, roadW + .35), dark, w / 2, -.09, .3);
      const slabColors = theme === 'snow' || theme === 'title'
        ? [0x9fb1b5, 0x8fa5aa, 0xb7c7c9, 0x768e95]
        : theme === 'bamboo'
          ? [0x2a443d, 0x315148, 0x1e3732, 0x3b5a4e]
          : theme === 'temple'
            ? [0x4a2e28, 0x573a31, 0x3b241f, 0x633f35]
            : [0x242021, 0x2c2626, 0x1b1819, 0x33282a];
      const slabMats = slabColors.map(c => this._std(c, { roughness: .96, flat: true }));
      const rows = [-2.25, 0, 2.25];
      for (let x = -2; x < w + 4; x += 1.35) {
        for (let ri = 0; ri < rows.length; ri++) {
          const ww = 1.18 + U.hash(x * 2.1 + ri) * .5;
          const z = rows[ri] + (U.hash(x * 3.7 + ri) - .5) * .18;
          const mat = slabMats[Math.floor(U.hash(x * 1.7 + ri * 2.2) * slabMats.length) % slabMats.length];
          this._mesh(g, new THREE.BoxGeometry(ww, .012, 2.05 + U.hash(x + ri) * .12), mat, x + U.hash(x * 4.3 + ri) * .25, .004, z, 1, 1, 1, 0, U.rand(-.025, .025), 0);
        }
      }
      // 路基边缘
      const curb = this._std(theme === 'snow' || theme === 'title' ? 0x6e858b : theme === 'temple' ? 0x241411 : 0x162523, { roughness: 1, flat: true });
      this._mesh(g, new THREE.BoxGeometry(w + 22, .18, .28), curb, w / 2, .01, -3.72);
      this._mesh(g, new THREE.BoxGeometry(w + 22, .18, .28), curb, w / 2, .01, 4.32);
      // 路缘石与路标
      for (let x = 0; x < w; x += 6.5) {
        this._mesh(g, new THREE.BoxGeometry(.28, .22, .34), curb, x, .10, -3.72);
        this._mesh(g, new THREE.BoxGeometry(.28, .22, .34), curb, x + 2.1, .10, 4.32);
      }
      if (theme === 'snow' || theme === 'title') {
        const snow = this._std(0xe0ecec, { roughness: 1 });
        for (let i = 0; i < Math.ceil(w * 1.4); i++) {
          const x = U.hash(i * 4.2) * w;
          const z = (i % 2 ? -1 : 1) * (3.3 + U.hash(i + 4) * .55);
          this._mesh(g, new THREE.SphereGeometry(1, 8, 6), snow, x, .035, z, U.rand(.2, .9), U.rand(.025, .06), U.rand(.16, .5));
        }
      } else if (theme === 'bamboo') {
        const wet = this._basic(0x86d8c7, { transparent: true, opacity: .09, depthWrite: false, side: THREE.DoubleSide });
        for (let i = 0; i < Math.ceil(w * .6); i++) this._mesh(g, new THREE.CircleGeometry(U.rand(.25, .8), 12), wet, U.hash(i * 3.1) * w, .014, -2.3 + U.hash(i * 8.3) * 4.6, 1, 1, .5, -Math.PI / 2, 0, 0);
      } else if (theme === 'temple' || theme === 'boss') {
        const seam = this._basic(theme === 'boss' ? 0xff5949 : 0xff9b62, { transparent: true, opacity: .18, additive: true });
        for (let i = 0; i < Math.ceil(w * 1.2); i++) {
          const x = U.hash(i * 5.3) * w, z = -3 + U.hash(i * 7.7) * 6.8;
          this._mesh(g, new THREE.PlaneGeometry(.035, U.rand(.4, 1.4)), seam, x, .012, z, 1, 1, 1, -Math.PI / 2, U.rand(0, 3), 0);
        }
      }
      this.roadGroup = g;
    }

    _buildMountains(p, w, theme) {
      const layers = [
        { z: -42, count: 13, h: 12, r: 8, color: p.mount, op: 1 },
        { z: -30, count: 11, h: 8, r: 6, color: p.mount, op: .95 },
        { z: -20, count: 9, h: 5.5, r: 4, color: new THREE.Color(p.mount).lerp(new THREE.Color(p.fog), .25).getHex(), op: .9 }
      ];
      layers.forEach((L, li) => {
        const mat = this._std(L.color, { flat: true, roughness: 1, opacity: L.op, transparent: L.op < 1 });
        for (let i = 0; i < L.count; i++) {
          const x = (i + .3) * (w + 18) / L.count - 6 + U.hash(i * 4.2 + li * 9) * 4;
          const h = L.h * (.6 + U.hash(i * 8.1 + li) * .6);
          const r = L.r * (.7 + U.hash(i * 5.7 + li) * .45);
          const g = new THREE.Group();
          g.position.set(x, -0.2, L.z - U.hash(i * 3.3 + li) * 5);
          this._mesh(g, new THREE.ConeGeometry(r, h, 5), mat, 0, h / 2, 0, 1, 1, 1, 0, U.hash(i + li) * 3, 0);
          if (theme === 'snow' || theme === 'title') {
            const cap = this._std(0xdceceb, { flat: true, roughness: 1 });
            this._mesh(g, new THREE.ConeGeometry(r * .43, h * .28, 5), cap, 0, h * .86, 0, 1, 1, 1, 0, U.hash(i + 2) * 3, 0);
          }
          this.envGroup.add(g);
        }
      });
      // 远山淡雾面
      const mistMat = new THREE.MeshBasicMaterial({ color: p.fog, transparent: true, opacity: .15, depthWrite: false, side: THREE.DoubleSide, fog: false });
      this._mesh(this.envGroup, new THREE.PlaneGeometry(w + 60, 9), mistMat, w / 2, 3.0, -46, 1, 1, 1, 0, 0, 0);
    }

    _buildStars(p, w, theme) {
      const count = 420;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = U.hash(i * 3.7) * (w + 60) - 20;
        pos[i * 3 + 1] = 6 + U.hash(i * 7.9) * 20;
        pos[i * 3 + 2] = -48 - U.hash(i * 2.3) * 18;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0xd7f7ff, size: .055, transparent: true, opacity: theme === 'temple' ? .25 : .55, depthWrite: false, map: this.tex.snow, blending: THREE.AdditiveBlending, fog: false, sizeAttenuation: true });
      this.envGroup.add(new THREE.Points(geo, mat));
    }

    _buildMoon(p, theme) {
      const g = new THREE.Group();
      g.position.set(0, 8.2, -38);
      const mat = new THREE.MeshBasicMaterial({ color: p.moon, transparent: true, opacity: .86, fog: false, side: THREE.DoubleSide });
      this._mesh(g, new THREE.CircleGeometry(2.2, 48), mat, 0, 0, 0, 1, 1, 1, 0, 0, 0);
      this._sprite(g, this.tex.glowCyan, p.moonGlow, 0, 0, -0.1, 13, 13, .2, true);
      this._sprite(g, this.tex.glowCyan, p.moonGlow, 0, 0, -0.12, 6, 6, .25, true);
      this.moonGroup = g;
      this.envGroup.add(g);
    }

    _buildSkyWhale(p) {
      const g = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color: 0x62d8ef, transparent: true, opacity: .12, depthWrite: false, fog: false, side: THREE.DoubleSide });
      this._mesh(g, new THREE.SphereGeometry(1, 18, 12), mat, 0, 0, 0, 2.6, .7, .8, 0, 0, -.02);
      this._mesh(g, new THREE.ConeGeometry(.42, 1.6, 4), mat, 2.55, -.12, 0, 1, 1, .8, 0, 0, -1.35);
      this._mesh(g, new THREE.ConeGeometry(.28, .9, 4), mat, -1.7, -.35, .3, 1, 1, 1, 0, 0, 2.8);
      const eye = new THREE.MeshBasicMaterial({ color: 0xc9fbff, transparent: true, opacity: .4, fog: false });
      this._mesh(g, new THREE.SphereGeometry(.08, 8, 6), eye, -1.65, .23, .52);
      g.scale.set(2.0, 2.0, 2.0);
      g.position.set(12, 9.1, -32);
      g.rotation.y = -.12;
      this.skyWhale = g;
      this.envGroup.add(g);
    }

    _buildSnow(p, w, title) {
      const snowMat = this._std(p.snow, { flat: false, roughness: .92 });
      const pineGreen = this._std(0x142c32, { flat: true, roughness: 1 });
      const snowCap = this._std(0xddebea, { flat: true, roughness: 1 });
      const trunk = this._std(0x2b211c, { flat: true, roughness: 1 });
      const addPine = (x, z, s) => {
        const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
        this._mesh(g, new THREE.CylinderGeometry(.08, .14, 1.2, 6), trunk, 0, .6, 0);
        for (let i = 0; i < 4; i++) {
          const y = .9 + i * .6, r = 1.25 - i * .24;
          this._mesh(g, new THREE.ConeGeometry(r, 1.1, 6), pineGreen, 0, y, 0);
          this._mesh(g, new THREE.ConeGeometry(r * .8, .2, 6), snowCap, 0, y + .42, 0);
        }
        this.envGroup.add(g);
      };
      for (let i = 0; i < Math.ceil(w / 7) + 3; i++) {
        const x = i * 7 + U.hash(i * 3.1) * 4 - 2;
        addPine(x, -6 - U.hash(i) * 4, .7 + U.hash(i + 1) * .7);
      }
      // 雪堆
      for (let i = 0; i < Math.ceil(w * 1.4); i++) {
        const x = U.hash(i * 5.1 + 4) * w;
        const z = -7 + U.hash(i * 8.2) * 16;
        if (Math.abs(z) < 2.2) continue;
        this._mesh(this.envGroup, new THREE.SphereGeometry(1, 10, 6), snowMat, x, -.1, z, U.rand(.4, 1.8), U.rand(.06, .22), U.rand(.35, 1.5));
      }
      // 校门两侧的东塘 / 西塘
      const pondWater = this._basic(0x5fb6c4, { transparent: true, opacity: .34, depthWrite: false });
      const pondRim = this._std(0x7d8b8d, { flat: true, roughness: 1 });
      for (const fx of [.13, .87]) {
        const px = w * fx;
        this._mesh(this.envGroup, new THREE.CircleGeometry(2.1, 24), pondWater, px, .015, 6.6, 1, 1, .5, -Math.PI / 2, 0, 0);
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2;
          this._mesh(this.envGroup, new THREE.BoxGeometry(.5, .22, .26), pondRim, px + Math.sin(a) * 2.3, .11, 6.6 + Math.cos(a) * 1.2, 1, 1, 1, 0, a, 0);
        }
      }
      // 校友景观石
      const stoneMat = this._std(0xb9b3a2, { flat: true, roughness: 1 });
      for (const [fx, z] of [[.23, 5.1], [.77, 5.1]]) {
        this._mesh(this.envGroup, new THREE.BoxGeometry(1.5, .85, .55), stoneMat, w * fx, .42, z, 1, 1, 1, 0, .18, .05);
      }
      // 村舍
      for (let i = 0; i < Math.ceil(w / 11); i++) {
        const g = new THREE.Group();
        g.position.set(i * 11 + 3, 0, -10.5 - U.hash(i) * 2);
        const houseMat = this._std(0x11232b, { flat: true, roughness: 1 });
        const roofMat = this._std(0x1c3138, { flat: true, roughness: 1 });
        this._mesh(g, new THREE.BoxGeometry(1.5, .8, 1.1), houseMat, 0, .4, 0);
        this._mesh(g, new THREE.ConeGeometry(1.05, .5, 4), roofMat, 0, .98, 0, 1, 1, .75, 0, Math.PI / 4, 0);
        for (let k = 0; k < 2; k++) this._mesh(g, new THREE.BoxGeometry(.12, .16, .02), this._basic(0xffbd70), -.32 + k * .65, .42, .56);
        this.envGroup.add(g);
      }
      if (!title) {
        this._buildSchoolGate(p);
        this._buildBasketballHoop(p);
        this._buildPlaza();
        this._buildLibraryGate(new THREE.Vector3(w * .74, 0, -4.6));
        this._buildTrack(new THREE.Vector3(w * .52, 0, -12), 1.05);
        // 完整校园：生活区与教学区的低多边形立面
        this._buildMailroom(new THREE.Vector3(2.4, 0, 4.2));
        this._buildDormitory(new THREE.Vector3(w * .13, 0, -14.5));
        this._buildCanteen(new THREE.Vector3(w * .27, 0, -14));
        this._buildTeachingBlock(new THREE.Vector3(w * .365, 0, -16.5));
        this._buildGrandstand(new THREE.Vector3(w * .52, 0, -19.8));
      }
      // 冰晶
      const ice = this._basic(0x9ff2ff, { transparent: true, opacity: .25, additive: true });
      for (let i = 0; i < Math.ceil(w / 8); i++) {
        const x = U.hash(i * 4.6 + 1) * w, z = -5 - U.hash(i * 7.7) * 5;
        this._mesh(this.envGroup, new THREE.ConeGeometry(.2, 1.4, 4), ice, x, .7, z, 1, 1, 1, 0, 0, U.rand(-.2, .2));
      }
    }

    _buildSchoolGate(p) {
      const x = 6.2, z = 0;
      const g = new THREE.Group(); g.position.set(x, 0, z); this.envGroup.add(g);
      const stone = this._std(0x263a42, { roughness: .95, flat: true });
      const trim = this._std(0xb83437, { roughness: .6, flat: true });
      const white = this._std(0xe8e1cf, { roughness: .7 });
      for (const side of [-1, 1]) {
        this._mesh(g, new THREE.BoxGeometry(.52, 4.0, .52), stone, 0, 2.0, side * 4.1);
        this._mesh(g, new THREE.BoxGeometry(.72, .16, .72), white, 0, .08, side * 4.1);
        this._mesh(g, new THREE.BoxGeometry(.66, .12, .66), trim, 0, 4.04, side * 4.1);
        this._mesh(g, new THREE.BoxGeometry(.06, .62, .06), trim, 0, 2.45, side * 4.1 + (side > 0 ? -.28 : .28));
      }
      this._mesh(g, new THREE.BoxGeometry(.3, .28, 8.2), stone, 0, 4.12, 0);
      for (let i = -3; i <= 3; i++) this._mesh(g, new THREE.BoxGeometry(.035, .48, .06), stone, 0, 3.86, i * .48);
      // 校牌
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.0), new THREE.MeshBasicMaterial({ map: this.tex.schoolSign, transparent: false, side: THREE.DoubleSide }));
      sign.position.set(0, 4.72, .02); g.add(sign);
      const street = new THREE.Mesh(new THREE.PlaneGeometry(2.1, .42), new THREE.MeshBasicMaterial({ map: this.tex.streetSign, side: THREE.DoubleSide }));
      street.position.set(0, 3.27, .28); g.add(street);
      // 时钟与铃
      const clock = new THREE.Group(); clock.position.set(0, 5.35, 0); g.add(clock);
      this._mesh(clock, new THREE.CylinderGeometry(.34, .34, .08, 24), white, 0, 0, 0, 1, 1, 1, Math.PI / 2, 0, 0);
      this._mesh(clock, new THREE.BoxGeometry(.02, .22, .02), this._std(0x1a2428), 0, .08, .055);
      this._mesh(clock, new THREE.BoxGeometry(.15, .018, .02), this._std(0x1a2428), .05, -.02, .055);
      const bell = new THREE.Group(); bell.position.set(1.7, 3.52, 0); g.add(bell);
      this._mesh(bell, new THREE.ConeGeometry(.22, .36, 10, 1, true), this._std(0x7d6842, { metalness: .4, roughness: .4, side: THREE.DoubleSide }), 0, 0, 0);
      this._sprite(g, this.tex.glowGold, 0xffc77f, 1.7, 3.0, .1, 1.6, 1.6, .1, true);
      // 两侧矮墙
      for (const side of [-1, 1]) {
        this._mesh(g, new THREE.BoxGeometry(.18, .9, 1.5), stone, 0, .45, side * 5.2);
        this._mesh(g, new THREE.BoxGeometry(.18, .9, 1.5), stone, 0, .45, side * 6.9);
      }
    }

    _buildBasketballHoop(p) {
      const g = new THREE.Group(); g.position.set(15.5, 0, -5.4); this.envGroup.add(g);
      const metal = this._std(0x3c4a4c, { roughness: .5, metalness: .35 });
      const board = this._std(0xd6d4c4, { roughness: .8 });
      this._mesh(g, new THREE.CylinderGeometry(.06, .08, 3.6, 8), metal, 0, 1.8, 0);
      this._mesh(g, new THREE.BoxGeometry(.08, .1, .8), metal, 0, 3.15, .38);
      this._mesh(g, new THREE.BoxGeometry(.08, .95, 1.35), board, 0, 3.8, .3);
      this._mesh(g, new THREE.TorusGeometry(.35, .025, 6, 16), this._std(0xa74b38, { metalness: .3, roughness: .5 }), 0, 3.35, .93, 1, 1, 1, Math.PI / 2, 0, 0);
      ctx: for (let i = 0; i < 8; i++) {
        const a = i / 8 * TAU;
        this._mesh(g, new THREE.CylinderGeometry(.006, .006, .42, 4), this._basic(0xd7e4df, { transparent: true, opacity: .42 }), Math.cos(a) * .3, 3.12, .93 + Math.sin(a) * .3, 1, 1, 1, 0, 0, Math.cos(a) * .18);
      }
      this._mesh(g, new THREE.SphereGeometry(.18, 12, 8), this._std(0xb96b42, { roughness: .8 }), .55, .18, .55);
    }

    _buildClassroomProps(p, w) {
      const x = w * .44;
      const g = new THREE.Group(); g.position.set(x, 0, -7.0); this.envGroup.add(g);
      const frame = this._std(0x2a1b15, { roughness: 1, flat: true });
      this._mesh(g, new THREE.BoxGeometry(8.2, 4.4, .22), frame, 0, 2.6, 0);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 3.8), new THREE.MeshBasicMaterial({ map: this.tex.schoolBoard, side: THREE.DoubleSide }));
      board.position.set(0, 2.62, .13); g.add(board);
      this._mesh(g, new THREE.BoxGeometry(8.7, .22, .32), frame, 0, 4.9, .02);
      // 课桌
      for (let i = 0; i < 3; i++) {
        const dg = new THREE.Group(); dg.position.set(-3.2 + i * 3.2, 0, 3.2); g.add(dg);
        this._mesh(dg, new THREE.BoxGeometry(1.8, .12, .8), this._std(0x4b392b, { roughness: 1, flat: true }), 0, .75, 0);
        for (const sx of [-.7, .7]) for (const sz of [-.28, .28]) this._mesh(dg, new THREE.CylinderGeometry(.035, .045, .72, 5), this._std(0x2a2018), sx, .36, sz);
        this._mesh(dg, new THREE.BoxGeometry(.4, .03, .28), this._std(0xe8dfc5), .1, .83, .05, 1, 1, 1, 0, -.15, 0);
      }
      // 粉笔
      this._mesh(g, new THREE.BoxGeometry(1.6, .04, .18), this._std(0x7c756b), 0, .95, 1.1);
      this._sprite(g, this.tex.glowGold, 0xffb36b, 2.8, 2.0, .2, 2.2, 2.2, .06, true);
    }

    _buildBamboo(p, w) {
      const stalkMat = this._std(0x22483d, { flat: true, roughness: 1 });
      const leafMat = this._std(0x2e6a52, { flat: true, roughness: 1 });
      const stemMat = this._std(0x112a26, { flat: true, roughness: 1 });
      const count = Math.ceil(w * 3.2);
      for (let i = 0; i < count; i++) {
        const x = U.hash(i * 3.9 + 2) * (w + 8) - 4;
        const z = -10 + U.hash(i * 7.1 + 5) * 16;
        if (Math.abs(z) < 1.8) continue;
        const h = 4 + U.hash(i * 5.2) * 5;
        const g = new THREE.Group(); g.position.set(x, 0, z);
        const stem = this._mesh(g, new THREE.CylinderGeometry(.055, .075, h, 6), stalkMat, 0, h / 2, 0);
        stem.rotation.z = U.rand(-.08, .08);
        for (let k = 0; k < 4; k++) {
          const y = h * (.38 + k * .16);
          const dir = k % 2 ? 1 : -1;
          this._mesh(g, new THREE.ConeGeometry(.28, .8, 4), leafMat, dir * .25, y, 0, 1, .16, 1, 0, 0, dir * 1.2);
        }
        if (i % 4 === 0) this._mesh(g, new THREE.CylinderGeometry(.02, .035, 1.2, 5), stemMat, .3, h * .4, .3, 1, 1, 1, 0, 0, -.8);
        this.envGroup.add(g);
      }
      // 湿润地面反光
      const water = this._basic(0x76cfc2, { transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide });
      for (let i = 0; i < Math.ceil(w * .7); i++) this._mesh(this.envGroup, new THREE.CircleGeometry(U.rand(.4, 1.2), 18), water, U.hash(i * 3.8) * w, .012, -2 + U.hash(i * 7.2) * 6, 1, 1, .4, -Math.PI / 2, 0, 0);
      // 远处古祠
      this._addPagoda(new THREE.Vector3(w * .55, 0, -14), .7, this._std(0x0b1c1c, { flat: true, roughness: 1 }));
      // 兰蕙亭：红柱黄瓦，上下两层六角亭
      this._addPavilion(new THREE.Vector3(w * .31, 0, -7.2), .95);
      // 石灯
      const stone = this._std(0x3a4d49, { flat: true, roughness: 1 });
      for (let i = 0; i < Math.ceil(w / 12); i++) {
        const x = i * 12 + 2;
        this._mesh(this.envGroup, new THREE.BoxGeometry(.38, 1.2, .38), stone, x, .6, 4.2);
        this._mesh(this.envGroup, new THREE.BoxGeometry(.65, .12, .65), stone, x, 1.2, 4.2);
        this._mesh(this.envGroup, new THREE.BoxGeometry(.24, .24, .02), this._basic(0x7fd8c7), x, 1.02, 4.02);
      }
    }

    _addPavilion(pos, scale) {
      const g = new THREE.Group(); g.position.copy(pos); g.scale.setScalar(scale);
      const red = this._std(0xa33a2f, { flat: true, roughness: .9 });
      const redDark = this._std(0x6d201b, { flat: true, roughness: 1 });
      const gold = this._std(0xd7a84a, { flat: true, roughness: .8 });
      const jade = this._std(0x2f5a45, { flat: true, roughness: 1 });
      // 台基
      this._mesh(g, new THREE.CylinderGeometry(2.6, 2.9, .35, 6), jade, 0, .18, 0);
      // 六根红柱
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        this._mesh(g, new THREE.CylinderGeometry(.11, .13, 2.15, 6), red, Math.sin(a) * 2.05, 1.42, Math.cos(a) * 2.05);
      }
      // 一层栏杆
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        this._mesh(g, new THREE.BoxGeometry(.9, .09, .09), redDark, Math.sin(a) * 2.2, 1.02, Math.cos(a) * 2.2, 1, 1, 1, 0, a, 0);
      }
      // 两层六角顶
      this._mesh(g, new THREE.ConeGeometry(2.85, .8, 6), gold, 0, 2.9, 0, 1, 1, 1, 0, Math.PI / 6, 0);
      this._mesh(g, new THREE.CylinderGeometry(2.3, 2.45, .28, 6), redDark, 0, 3.3, 0, 1, 1, 1, 0, Math.PI / 6, 0);
      this._mesh(g, new THREE.ConeGeometry(2.05, .68, 6), gold, 0, 3.72, 0, 1, 1, 1, 0, Math.PI / 6, 0);
      this._mesh(g, new THREE.CylinderGeometry(.05, .08, .55, 6), gold, 0, 4.3, 0);
      g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
      this.envGroup.add(g);
    }
    _addHorseStatue(pos, scale) {
      const g = new THREE.Group(); g.position.copy(pos); g.scale.setScalar(scale);
      const white = this._std(0xe9eef0, { flat: true, roughness: .85 });
      const stone = this._std(0x8a8f8c, { flat: true, roughness: 1 });
      this._mesh(g, new THREE.BoxGeometry(2.6, .5, 1.2), stone, 0, .25, 0);
      // 马身、四肢、颈与头
      this._mesh(g, new THREE.BoxGeometry(1.55, .7, .62), white, 0, 1.42, 0);
      this._mesh(g, new THREE.CylinderGeometry(.09, .12, 1.1, 6), white, -.55, .9, -.18, 1, 1, 1, 0, 0, -.12);
      this._mesh(g, new THREE.CylinderGeometry(.09, .12, 1.1, 6), white, .55, .9, -.18, 1, 1, 1, 0, 0, .12);
      this._mesh(g, new THREE.CylinderGeometry(.08, .11, 1.05, 6), white, -.62, .92, .2, 1, 1, 1, .1, 0, -.3);
      this._mesh(g, new THREE.CylinderGeometry(.08, .11, 1.05, 6), white, .68, .96, .22, 1, 1, 1, -.05, 0, .42);
      this._mesh(g, new THREE.CylinderGeometry(.17, .24, .95, 6), white, .72, 1.9, -.05, 1, 1, 1, 0, 0, -.55);
      this._mesh(g, new THREE.BoxGeometry(.55, .28, .28), white, 1.0, 2.28, -.05, 1, 1, 1, 0, -.2, -.25);
      this._mesh(g, new THREE.BoxGeometry(.08, .5, .34), white, .55, 1.85, -.05);
      // 底座刻字牌
      this._mesh(g, new THREE.BoxGeometry(.9, .38, .06), this._basic(0xd9c58a, { transparent: true, opacity: .7 }), 0, .55, .63);
      g.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
      this.envGroup.add(g);
    }
    _buildPlaza() {
      const stone = this._std(0x7d8b8d, { flat: true, roughness: 1 });
      // 半月广场：校门前的两层弧形石阶
      for (const [r, y] of [[2.4, .03], [3.1, .02]]) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + .38, 40, 1, Math.PI * .05, Math.PI * .9), stone);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(6.2, y, 1.2);
        this.envGroup.add(ring);
      }
      // 旗杆与红旗
      const pole = this._mesh(this.envGroup, new THREE.CylinderGeometry(.035, .05, 5.2, 8), this._std(0xd8d8d0, { metalness: .3, roughness: .4 }), 3.3, 2.6, -2.4);
      const flag = this._mesh(this.envGroup, new THREE.PlaneGeometry(1.25, .78), this._basic(0xb23030, { side: THREE.DoubleSide }), 3.95, 4.65, -2.4);
      flag.rotation.y = -.12;
    }
    _buildLibraryGate(pos) {
      const g = new THREE.Group(); g.position.copy(pos); this.envGroup.add(g);
      const red = this._std(0x7d2a24, { flat: true, roughness: .9 });
      const dark = this._std(0x2a1714, { flat: true, roughness: 1 });
      const gold = this._std(0xc79a4a, { flat: true, roughness: .8 });
      this._mesh(g, new THREE.BoxGeometry(4.4, .3, 1.8), dark, 0, .15, 0);
      for (const x of [-1.7, 1.7]) {
        for (const z of [-.55, .55]) this._mesh(g, new THREE.CylinderGeometry(.13, .15, 3.2, 8), red, x, 1.8, z);
      }
      this._mesh(g, new THREE.BoxGeometry(4.2, .34, 1.5), red, 0, 3.42, 0);
      this._mesh(g, new THREE.BoxGeometry(4.6, .16, 1.8), dark, 0, 3.62, 0);
      this._mesh(g, new THREE.ConeGeometry(2.9, .62, 4), dark, 0, 3.98, 0, 1, 1, .75, 0, Math.PI / 4, 0);
      this._mesh(g, new THREE.ConeGeometry(2.2, .45, 4), dark, 0, 4.38, 0, 1, 1, .75, 0, Math.PI / 4, 0);
      for (const x of [-1.9, 1.9]) this._mesh(g, new THREE.BoxGeometry(.12, .9, .12), gold, x, 2.9, .6);
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .8), new THREE.MeshBasicMaterial({ map: this.tex.librarySign, side: THREE.DoubleSide }));
      plaque.position.set(0, 3.36, .56); g.add(plaque);
      this._sprite(g, this.tex.glowGold, 0xffce8a, 0, 3.1, .8, 2.8, 1.5, .12, true);
    }
    _buildTrack(pos, scale) {
      const g = new THREE.Group(); g.position.copy(pos); g.scale.setScalar(scale); this.envGroup.add(g);
      const track = this._basic(0x9e3a34, { transparent: true, opacity: .55, side: THREE.DoubleSide });
      const field = this._basic(0x2c5236, { transparent: true, opacity: .35, side: THREE.DoubleSide });
      const lane = this._basic(0xe7e4d2, { transparent: true, opacity: .35, side: THREE.DoubleSide });
      this._mesh(g, new THREE.RingGeometry(4.2, 6.4, 56), track, 0, .02, 0, 1, 1, 1, -Math.PI / 2, 0, 0);
      this._mesh(g, new THREE.CircleGeometry(4.18, 48), field, 0, .015, 0, 1, 1, 1, -Math.PI / 2, 0, 0);
      for (const r of [4.7, 5.15, 5.6]) this._mesh(g, new THREE.RingGeometry(r, r + .05, 56), lane, 0, .025, 0, 1, 1, 1, -Math.PI / 2, 0, 0);
    }

    _buildTeachingBlock(pos) {
      const g = new THREE.Group(); g.position.copy(pos); this.envGroup.add(g);
      g.scale.setScalar(.62);
      const wall = this._std(0x4d646d, { flat: true, roughness: .92 });
      const trim = this._std(0xcfd2c4, { flat: true, roughness: .9 });
      const dark = this._std(0x17252b, { flat: true, roughness: 1 });
      const glass = this._basic(0x8fd0e4, { transparent: true, opacity: .38 });
      const lit = this._basic(0xffd58a, { transparent: true, opacity: .68 });
      this._mesh(g, new THREE.BoxGeometry(10.2, .3, 4.4), dark, 0, .15, 0);
      this._mesh(g, new THREE.BoxGeometry(9.6, 5.8, 3.6), wall, 0, 3.1, 0);
      this._mesh(g, new THREE.BoxGeometry(10, .26, 4), trim, 0, 6.12, 0);
      for (let f = 0; f < 3; f++) {
        const y = 1.65 + f * 1.55;
        for (let i = 0; i < 6; i++) {
          const x = -3.85 + i * 1.54;
          this._mesh(g, new THREE.PlaneGeometry(.92, .78), (i + f) % 3 === 0 ? lit : glass, x, y, 1.81);
          this._mesh(g, new THREE.BoxGeometry(1.02, .06, .06), trim, x, y - .43, 1.83);
        }
      }
      // 门厅、雨棚与柱
      this._mesh(g, new THREE.BoxGeometry(2.5, 2.2, .16), dark, 0, 1.1, 1.82);
      this._mesh(g, new THREE.PlaneGeometry(2.1, 1.8), this._basic(0x9fd8e8, { transparent: true, opacity: .3 }), 0, 1.15, 1.91);
      this._mesh(g, new THREE.BoxGeometry(3.4, .16, 1.1), trim, 0, 2.36, 2.3);
      for (const x of [-1.35, 1.35]) this._mesh(g, new THREE.CylinderGeometry(.06, .06, 2.3, 6), trim, x, 1.15, 2.6);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.5), new THREE.MeshBasicMaterial({ map: this.tex.teachingSign, side: THREE.DoubleSide }));
      sign.position.set(0, 5.55, 1.86); g.add(sign);
      this._sprite(g, this.tex.glowCyan, 0x9fe8ff, 0, 5.5, 1.96, 5.2, 1.9, .1, true);
      for (const x of [-1.6, 1.6]) {
        this._mesh(g, new THREE.BoxGeometry(.18, .28, .14), lit, x, 2.56, 1.9);
        this._sprite(g, this.tex.glowGold, 0xffd58a, x, 2.56, 2.04, 1.2, 1.2, .14, true);
      }
    }

    _buildDormitory(pos) {
      const g = new THREE.Group(); g.position.copy(pos); this.envGroup.add(g);
      g.scale.setScalar(.62);
      const wall = this._std(0x596b70, { flat: true, roughness: .95 });
      const trim = this._std(0xd7d6c8, { flat: true, roughness: .9 });
      const dark = this._std(0x18262c, { flat: true, roughness: 1 });
      const glass = this._basic(0x8fc8dc, { transparent: true, opacity: .36 });
      const lit = this._basic(0xffcf86, { transparent: true, opacity: .62 });
      this._mesh(g, new THREE.BoxGeometry(8, .3, 4), dark, 0, .15, 0);
      this._mesh(g, new THREE.BoxGeometry(7.6, 5.2, 3.4), wall, 0, 2.7, 0);
      this._mesh(g, new THREE.BoxGeometry(8, .24, 3.8), trim, 0, 5.34, 0);
      // 两层阳台、栏杆与晾晒
      const cloths = [0xe4e2d6, 0x2f5f86, 0xa33a34, 0xd9d2b6, 0x3b6d5a];
      for (let f = 0; f < 2; f++) {
        const y = 2.3 + f * 1.55;
        this._mesh(g, new THREE.BoxGeometry(7.9, .1, .95), trim, 0, y, 2.08);
        this._mesh(g, new THREE.BoxGeometry(7.9, .05, .05), trim, 0, y + .58, 2.52);
        for (let i = 0; i < 9; i++) this._mesh(g, new THREE.BoxGeometry(.04, .58, .04), trim, -3.8 + i * .95, y + .29, 2.52);
        for (let i = 0; i < 5; i++) {
          const x = -2.9 + i * 1.45;
          this._mesh(g, new THREE.PlaneGeometry(.9, .72), (i + f) % 2 ? lit : glass, x, y + .55, 1.72);
          if ((i + f) % 2 === 0) {
            this._mesh(g, new THREE.PlaneGeometry(.5, .62), this._basic(cloths[(i + f) % cloths.length], { side: THREE.DoubleSide }), x + .3, y + .36, 2.35);
          }
        }
      }
      // 空调外机
      for (const [x, y] of [[-2.6, 3.55], [1.4, 2.0], [3.1, 5.0]]) {
        this._mesh(g, new THREE.BoxGeometry(.5, .36, .3), trim, x, y, 1.9);
      }
      // 门与牌匾
      this._mesh(g, new THREE.BoxGeometry(1.8, 2.0, .14), dark, 0, 1.0, 1.76);
      this._mesh(g, new THREE.BoxGeometry(2.2, .12, .8), trim, 0, 2.1, 1.95);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 1.26), new THREE.MeshBasicMaterial({ map: this.tex.dormSign, side: THREE.DoubleSide }));
      sign.position.set(0, 4.85, 1.72); g.add(sign);
      this._sprite(g, this.tex.glowCyan, 0x9fd8e8, 0, 4.8, 1.84, 4.4, 1.6, .08, true);
    }

    _buildCanteen(pos) {
      const g = new THREE.Group(); g.position.copy(pos); this.envGroup.add(g);
      g.scale.setScalar(.62);
      const wall = this._std(0x5a5148, { flat: true, roughness: .95 });
      const roofMat = this._std(0x2b3134, { flat: true, roughness: 1 });
      const trim = this._std(0xd6c8ac, { flat: true, roughness: .9 });
      const glass = this._basic(0xffd08a, { transparent: true, opacity: .55 });
      this._mesh(g, new THREE.BoxGeometry(8.6, 3.0, 4.2), wall, 0, 1.5, 0);
      this._mesh(g, new THREE.BoxGeometry(9, .26, 4.6), roofMat, 0, 3.12, 0);
      // 大窗
      for (let i = 0; i < 6; i++) {
        const x = -3.15 + i * 1.26;
        this._mesh(g, new THREE.PlaneGeometry(1.0, 1.25), glass, x, 1.75, 2.11);
        this._mesh(g, new THREE.BoxGeometry(1.1, .07, .06), trim, x, 2.42, 2.13);
      }
      // 雨棚与立柱
      this._mesh(g, new THREE.BoxGeometry(6.8, .12, 1.9), trim, 0, 2.52, 2.9);
      for (const x of [-3.1, 3.1]) this._mesh(g, new THREE.CylinderGeometry(.07, .07, 2.5, 6), trim, x, 1.25, 3.7);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 1.3), new THREE.MeshBasicMaterial({ map: this.tex.canteenSign, side: THREE.DoubleSide }));
      sign.position.set(0, 2.86, 2.13); g.add(sign);
      this._sprite(g, this.tex.glowGold, 0xffc070, 0, 2.8, 2.24, 4.4, 1.7, .1, true);
      // 烟囱与蒸汽
      this._mesh(g, new THREE.CylinderGeometry(.3, .34, 1.6, 8), roofMat, 3.2, 3.9, -1.1);
      for (let i = 0; i < 4; i++) {
        this._sprite(g, this.tex.glowGold, 0xffe0b0, 3.2 + Math.sin(i * 2.1) * .5, 5.0 + i * .55, -1.1, 2.4 + i * .5, 2.4 + i * .5, .08 - i * .012, true);
      }
      // 门口保温桶
      this._mesh(g, new THREE.CylinderGeometry(.34, .3, .8, 10), trim, 2.3, .4, 3.0);
      this._mesh(g, new THREE.CylinderGeometry(.36, .36, .08, 10), roofMat, 2.3, .84, 3.0);
    }

    _buildGrandstand(pos) {
      const g = new THREE.Group(); g.position.copy(pos); this.envGroup.add(g);
      g.scale.setScalar(.9);
      const concrete = this._std(0x5d6668, { flat: true, roughness: 1 });
      const dark = this._std(0x232d31, { flat: true, roughness: 1 });
      const seatMats = [this._std(0x2f5f86, { flat: true }), this._std(0x8a3230, { flat: true }), this._std(0xd3c9a8, { flat: true })];
      for (let i = 0; i < 5; i++) {
        const y = .3 + i * .42, z = -i * .85;
        this._mesh(g, new THREE.BoxGeometry(7.6, .42, .85), concrete, 0, y, z);
        for (let k = 0; k < 6; k++) {
          this._mesh(g, new THREE.BoxGeometry(.56, .1, .34), seatMats[(i + k) % 3], -3.0 + k * 1.2, y + .26, z + .1);
        }
      }
      this._mesh(g, new THREE.BoxGeometry(7.6, 2.6, .3), dark, 0, 1.7, -4.35);
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 1.0), new THREE.MeshBasicMaterial({ map: this.tex.sportsBanner, side: THREE.DoubleSide }));
      banner.position.set(0, 2.5, -4.18); g.add(banner);
      for (const x of [-3.5, 3.5]) this._mesh(g, new THREE.BoxGeometry(.12, 1.2, .12), dark, x, 3.2, -4.35);
      this._mesh(g, new THREE.BoxGeometry(7.6, .1, 2.2), dark, 0, 3.8, -4.1, 1, 1, 1, -.12, 0, 0);
    }

    _buildMailroom(pos) {
      const g = new THREE.Group(); g.position.copy(pos); this.envGroup.add(g);
      g.scale.setScalar(.9);
      const wall = this._std(0x4a5b60, { flat: true, roughness: .95 });
      const trim = this._std(0xd9d4c2, { flat: true, roughness: .9 });
      const dark = this._std(0x1b262a, { flat: true, roughness: 1 });
      const lit = this._basic(0xffd894, { transparent: true, opacity: .62 });
      this._mesh(g, new THREE.BoxGeometry(3.4, 2.2, 2.6), wall, 0, 1.1, 0);
      this._mesh(g, new THREE.BoxGeometry(3.8, .18, 3.0), trim, 0, 2.24, 0);
      this._mesh(g, new THREE.PlaneGeometry(1.5, .75), lit, -.65, 1.45, 1.32);
      this._mesh(g, new THREE.BoxGeometry(1.0, 1.7, .1), dark, .85, .85, 1.31);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.5, .83), new THREE.MeshBasicMaterial({ map: this.tex.mailSign, side: THREE.DoubleSide }));
      sign.position.set(0, 2.0, 1.33); g.add(sign);
      this._mesh(g, new THREE.BoxGeometry(.7, .5, .35), trim, -1.2, .25, 1.6);
      this._sprite(g, this.tex.glowGold, 0xffd894, -.65, 1.45, 1.45, 1.6, 1.0, .1, true);
    }
    _buildStatues(pos) {
      const white = this._std(0xdfe3e2, { flat: true, roughness: .85 });
      const stone = this._std(0x6e6e68, { flat: true, roughness: 1 });
      for (let i = 0; i < 3; i++) {
        const g = new THREE.Group(); g.position.set(pos.x + i * 1.55, 0, pos.z); this.envGroup.add(g);
        this._mesh(g, new THREE.BoxGeometry(1.05, 1.05, 1.05), stone, 0, .52, 0);
        this._mesh(g, new THREE.BoxGeometry(1.15, .12, 1.15), stone, 0, 1.08, 0);
        this._mesh(g, new THREE.BoxGeometry(.72, .32, .42), white, 0, 1.3, 0);
        this._mesh(g, new THREE.SphereGeometry(.22, 10, 8), white, 0, 1.72, 0);
      }
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.3, .95), new THREE.MeshBasicMaterial({ map: this.tex.sloganBanner, side: THREE.DoubleSide }));
      banner.position.set(pos.x + 1.55, 2.2, pos.z - .9); this.envGroup.add(banner);
    }
    _buildClassroom(pos) {
      const g = new THREE.Group(); g.position.copy(pos); this.envGroup.add(g);
      const wall = this._std(0xdfe0d6, { flat: true, roughness: .95 });
      const wainscot = this._std(0x5f7d6a, { flat: true, roughness: 1 });
      const floor = this._std(0x9aa39c, { flat: true, roughness: 1 });
      const dark = this._std(0x1f2724, { flat: true, roughness: 1 });
      const blue = this._std(0x27374a, { flat: true, roughness: .9 });
      const white = this._std(0xe9ece8, { flat: true, roughness: .9 });
      const skin = this._std(0xd8b18f, { flat: true, roughness: .9 });
      const red = this._basic(0xb92c2c, { side: THREE.DoubleSide });
      const curtain = this._std(0x2c5c74, { flat: true, roughness: 1 });
      // 地面与后墙
      this._mesh(g, new THREE.PlaneGeometry(11, 4.6), floor, 0, .01, -1.3, 1, 1, 1, -Math.PI / 2, 0, 0);
      this._mesh(g, new THREE.PlaneGeometry(11, 4.1), wall, 0, 2.05, -3.45);
      this._mesh(g, new THREE.PlaneGeometry(11, 1.15), wainscot, 0, .58, -3.43);
      // 黑板、横幅、屏幕、国旗
      this._mesh(g, new THREE.BoxGeometry(5.3, 2.0, .08), this._std(0x6d5536, { flat: true, roughness: .8 }), 0, 2.2, -3.4);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.75), new THREE.MeshBasicMaterial({ map: this.tex.classBoard, side: THREE.DoubleSide }));
      board.position.set(0, 2.2, -3.34); g.add(board);
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.3), new THREE.MeshBasicMaterial({ map: this.tex.classSlogan, side: THREE.DoubleSide, transparent: true }));
      banner.position.set(0, 3.58, -3.38); g.add(banner);
      this._mesh(g, new THREE.BoxGeometry(2.55, 1.5, .08), dark, 3.25, 2.25, -3.4);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.3), new THREE.MeshBasicMaterial({ map: this.tex.classScreen, side: THREE.DoubleSide }));
      screen.position.set(3.25, 2.25, -3.34); g.add(screen);
      this._sprite(g, this.tex.glowCyan, 0x8feaff, 3.25, 2.25, -3.2, 3.2, 2.1, .12, true);
      // 国旗
      this._mesh(g, new THREE.CylinderGeometry(.025, .035, 1.5, 6), this._std(0xd8d8d0), -4.5, 3.2, -3.3);
      this._mesh(g, new THREE.PlaneGeometry(1.05, .68), red, -3.96, 3.5, -3.3);
      // 窗帘与窗
      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          this._mesh(g, new THREE.BoxGeometry(.14, 3.2, .1), curtain, side * (4.9 + i * .16), 1.9, -3.25, 1, 1, 1, 0, 0, side * .05);
        }
        this._mesh(g, new THREE.PlaneGeometry(1.25, 1.15), this._basic(0xa8d8e8, { transparent: true, opacity: .38, side: THREE.DoubleSide }), side * 4.5, 2.45, -3.38);
        for (let i = 0; i < 4; i++) this._mesh(g, new THREE.BoxGeometry(.035, 1.15, .035), white, side * (4.2 + i * .22), 2.45, -3.33);
      }
      // 荧光灯
      for (const x of [-3.1, 0, 3.1]) {
        this._mesh(g, new THREE.BoxGeometry(1.7, .08, .22), this._basic(0xf4ffe6, { transparent: true, opacity: .9 }), x, 3.72, -1.3);
        this._sprite(g, this.tex.glowCyan, 0xdfffe8, x, 3.66, -1.25, 2.4, .7, .08, true);
      }
      // 课桌、书堆、学生
      const deskMat = this._std(0x8d6b45, { flat: true, roughness: .85 });
      const bookMats = [this._std(0x2e5a8a, { flat: true }), this._std(0x9e2a24, { flat: true }), this._std(0xd8d2bc, { flat: true })];
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          const x = -3.2 + col * 2.05;
          const z = -2.55 + row * 1.12;
          this._mesh(g, new THREE.BoxGeometry(.95, .07, .55), deskMat, x, .78, z);
          for (const sx of [-.4, .4]) for (const sz of [-.2, .2]) this._mesh(g, new THREE.BoxGeometry(.05, .78, .05), dark, x + sx, .39, z + sz);
          for (let b = 0; b < 3; b++) this._mesh(g, new THREE.BoxGeometry(.34, .05, .26), bookMats[(row + col + b) % 3], x + .1, .84 + b * .055, z + .02);
          if ((row === 0 && (col === 0 || col === 2)) || (row === 1 && col === 1)) {
            // 蓝白校服的学生
            this._mesh(g, new THREE.BoxGeometry(.38, .52, .28), blue, x, 1.12, z + .05);
            this._mesh(g, new THREE.BoxGeometry(.4, .12, .3), white, x, 1.36, z + .05);
            this._mesh(g, new THREE.SphereGeometry(.15, 8, 6), skin, x, 1.62, z + .05);
            this._mesh(g, new THREE.CylinderGeometry(.012, .012, .5, 4), white, x + .28, 1.35, z + .05);
            this._mesh(g, new THREE.PlaneGeometry(.3, .2), red, x + .3, 1.62, z + .05);
          }
        }
      }
      // 讲台与老师
      this._mesh(g, new THREE.BoxGeometry(1.4, .85, .65), deskMat, 2.9, .43, -2.8);
      this._mesh(g, new THREE.BoxGeometry(1.4, .06, .7), white, 2.9, .88, -2.8);
      this._mesh(g, new THREE.BoxGeometry(.4, .56, .3), dark, 2.4, 1.14, -2.6);
      this._mesh(g, new THREE.SphereGeometry(.15, 8, 6), skin, 2.4, 1.62, -2.6);
      this._mesh(g, new THREE.BoxGeometry(.3, .05, .22), white, 2.4, 1.18, -2.4);
    }
    _addPagoda(pos, scale, mat) {
      const g = new THREE.Group(); g.position.copy(pos); g.scale.setScalar(scale);
      this._mesh(g, new THREE.BoxGeometry(4, .5, 4), mat, 0, .25, 0);
      for (let i = 0; i < 3; i++) {
        this._mesh(g, new THREE.ConeGeometry(2.6 - i * .5, .65, 4), mat, 0, 1 + i * 1.3, 0, 1, 1, 1, 0, Math.PI / 4, 0);
        this._mesh(g, new THREE.BoxGeometry(2.8 - i * .45, 1.1, 2.8 - i * .45), mat, 0, .72 + i * 1.35, 0);
      }
      this.envGroup.add(g);
    }

    _buildTemple(p, w) {
      // 科学楼前的奔马雕塑
      this._addHorseStatue(new THREE.Vector3(4.5, 0, -5.2), .6);
      // 名人园与励志横幅
      this._buildStatues(new THREE.Vector3(w * .34, 0, -4.2));
      // 高三教室：蓝白校服、黑板横幅、多媒体屏幕与成摞教辅
      this._buildClassroom(new THREE.Vector3(w * .58, 0, -7.2));
      const stone = this._std(0x3b2923, { flat: true, roughness: 1 });
      const dark = this._std(0x1a100e, { flat: true, roughness: 1 });
      const red = this._std(0x6c2421, { flat: true, roughness: 1 });
      const gold = this._basic(0xffa45c, { transparent: true, opacity: .8, additive: true });
      for (let i = 0; i < Math.ceil(w / 10); i++) {
        const x = i * 10 + 3.5;
        const g = new THREE.Group(); g.position.set(x, 0, -8 - U.hash(i) * 4);
        this._mesh(g, new THREE.BoxGeometry(.94, 3.8, .94), stone, 0, 1.9, 0);
        this._mesh(g, new THREE.BoxGeometry(1.25, .24, 1.25), dark, 0, 3.82, 0);
        this._mesh(g, new THREE.ConeGeometry(1.1, .5, 4), dark, 0, 4.15, 0, 1, 1, 1, 0, Math.PI / 4, 0);
        this._mesh(g, new THREE.BoxGeometry(.06, 2.1, .06), gold, .25, 1.8, .5);
        this.envGroup.add(g);
      }
      this._addPagoda(new THREE.Vector3(w * .72, 0, -14), 1.1, dark);
      this._buildClassroomProps(p, w);
      this._addPagoda(new THREE.Vector3(w * .18, 0, -16), .8, dark);
      // 香炉
      for (let i = 0; i < Math.ceil(w / 15); i++) {
        const x = i * 15 + 6;
        const g = new THREE.Group(); g.position.set(x, 0, 3.7);
        this._mesh(g, new THREE.CylinderGeometry(.55, .4, .45, 10), red, 0, .25, 0);
        this._mesh(g, new THREE.CylinderGeometry(.08, .08, .9, 6), stone, -.3, .7, 0);
        this._mesh(g, new THREE.CylinderGeometry(.08, .08, .9, 6), stone, .3, .7, 0);
        this._sprite(g, this.tex.glowGold, 0xffa35c, 0, .75, 0, 1.3, 1.3, .22, true);
        this.envGroup.add(g);
      }
      // 焦黑断梁
      for (let i = 0; i < Math.ceil(w / 9); i++) {
        const x = U.hash(i * 5.1) * w;
        this._mesh(this.envGroup, new THREE.BoxGeometry(U.rand(2, 5), .18, .25), dark, x, .09, U.rand(-6, 5), 1, 1, 1, 0, U.rand(-.5, .5), U.rand(-.15, .15));
      }
    }

    _buildBossStage(p, w) {
      const stone = this._std(0x171317, { flat: true, roughness: 1 });
      const dark = this._std(0x0b090c, { flat: true, roughness: 1 });
      const red = this._basic(0xa83932, { transparent: true, opacity: .62 });
      for (let i = 0; i < Math.ceil(w / 9); i++) {
        const x = i * 9 + 2.5;
        const g = new THREE.Group(); g.position.set(x, 0, -7.5 - U.hash(i) * 2);
        this._mesh(g, new THREE.BoxGeometry(1.25, 4.8, 1.25), stone, 0, 2.4, 0);
        this._mesh(g, new THREE.BoxGeometry(1.7, .3, 1.7), dark, 0, 4.85, 0);
        this._mesh(g, new THREE.ConeGeometry(1.35, .65, 4), dark, 0, 5.25, 0, 1, 1, 1, 0, Math.PI / 4, 0);
        this._mesh(g, new THREE.BoxGeometry(.07, 2.5, .07), red, .28, 2.6, .66);
        this.envGroup.add(g);
      }
      // 断门
      this._mesh(this.envGroup, new THREE.BoxGeometry(1.4, 7.5, 1.4), dark, w * .42, 3.75, -5.5);
      this._mesh(this.envGroup, new THREE.BoxGeometry(1.4, 7.5, 1.4), dark, w * .58, 3.75, -5.5);
      this._mesh(this.envGroup, new THREE.BoxGeometry(5.5, .55, 1.6), dark, w * .5, 7.2, -5.5);
      // 浮石
      for (let i = 0; i < 12; i++) {
        const x = U.hash(i * 4.3) * w, y = 2 + U.hash(i * 7.1) * 4, z = -9 - U.hash(i * 2.4) * 3;
        const m = this._mesh(this.envGroup, new THREE.DodecahedronGeometry(.5 + U.hash(i) * .7, 0), stone, x, y, z, 1, .55, .7, U.rand(0, 3), U.rand(0, 3), 0);
        m.userData.float = { base: y, phase: U.hash(i) * 6 };
        if (!this.floatRocks) this.floatRocks = [];
        this.floatRocks.push(m);
      }
      // 铁链
      const chainMat = this._std(0x262125, { flat: true, roughness: .8, metalness: .2 });
      for (let i = 0; i < Math.ceil(w / 8); i++) {
        const x = i * 8 + 4;
        for (let k = 0; k < 8; k++) this._mesh(this.envGroup, new THREE.TorusGeometry(.12, .025, 5, 8), chainMat, x + Math.sin(k) * .08, 6 - k * .28, -6 + Math.cos(k) * .1, 1, 1.2, 1, Math.PI / 2, 0, .1);
      }
      // 地裂
      const crack = this._basic(0xff5b4c, { transparent: true, opacity: .35, additive: true });
      for (let i = 0; i < Math.ceil(w * .8); i++) {
        const x = U.hash(i * 3.2) * w, z = -5 + U.hash(i * 8.8) * 10;
        this._mesh(this.envGroup, new THREE.PlaneGeometry(.06 + U.hash(i) * .12, 1.2 + U.hash(i + 2) * 2.3), crack, x, .012, z, 1, 1, 1, -Math.PI / 2, U.rand(0, 3), 0);
      }
    }

    _buildEdgeStones(p, w, theme) {
      const color = theme === 'snow' || theme === 'title' ? 0x54686d : theme === 'temple' || theme === 'boss' ? 0x2b1e1b : 0x1b3732;
      const mat = this._std(color, { flat: true, roughness: 1 });
      for (let i = 0; i < Math.ceil(w * 1.7); i++) {
        const x = U.hash(i * 4.2) * w;
        const z = (i % 2 ? 1 : -1) * (2.2 + U.hash(i * 7.4) * 8);
        if (Math.abs(z) < 2) continue;
        this._mesh(this.envGroup, new THREE.DodecahedronGeometry(.1 + U.hash(i) * .22, 0), mat, x, .05, z, 1, .4, 1, U.rand(0, 3), U.rand(0, 3), 0);
      }
    }

    _buildLanterns(p, w, theme) {
      const warm = theme === 'temple' || theme === 'boss';
      const count = Math.ceil(w / 14) + 1;
      for (let i = 0; i < count; i++) {
        const x = 3.5 + i * 14;
        const z = i % 2 ? 3.8 : -4.6;
        const g = new THREE.Group(); g.position.set(x, 0, z);
        this._mesh(g, new THREE.CylinderGeometry(.03, .03, 1.2, 6), this._std(0x35271d), 0, 1.0, 0);
        const body = this._mesh(g, new THREE.CylinderGeometry(.2, .16, .5, 8), this._basic(warm ? 0xffa55f : 0xffc27b), 0, .66, 0);
        this._mesh(g, new THREE.CylinderGeometry(.23, .23, .05, 8), this._std(0x3d2a1e), 0, .92, 0);
        this._mesh(g, new THREE.CylinderGeometry(.17, .17, .04, 8), this._std(0x3d2a1e), 0, .39, 0);
        this._sprite(g, this.tex.glowGold, warm ? 0xff8d54 : 0xffc578, 0, .68, .1, 1.3, 1.3, .22, true);
        this.envGroup.add(g);
      }
    }

    _buildMist(p, w, theme) {
      const color = theme === 'boss' ? 0x6f3a38 : theme === 'temple' ? 0x8b6352 : 0xb7d4d8;
      for (let i = 0; i < 9; i++) {
        const x = U.hash(i * 4.4 + 1) * w;
        const z = -10 + U.hash(i * 7.1) * 7;
        const s = this._sprite(this.envGroup, this.tex.snow, color, x, 1.1 + U.hash(i) * 1.2, z, 9 + U.hash(i + 4) * 8, 2.2 + U.hash(i + 2) * 2.2, .035, false);
        s.material.blending = THREE.NormalBlending;
      }
    }

    _buildBarriers() {
      const matL = new THREE.MeshBasicMaterial({ color: 0xff705e, transparent: true, opacity: .16, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      const geo = new THREE.PlaneGeometry(16, 5.2);
      this.barrierL = new THREE.Mesh(geo, matL);
      this.barrierR = new THREE.Mesh(geo, matL.clone());
      this.barrierL.rotation.y = Math.PI / 2;
      this.barrierR.rotation.y = Math.PI / 2;
      this.barrierL.visible = this.barrierR.visible = false;
      this.envGroup.add(this.barrierL, this.barrierR);
    }

    _buildWeather(theme) {
      if (this.weather) { this.scene.remove(this.weather.points); this.weather = null; }
      const reduced = this.game.settings && this.game.settings.reducedMotion;
      const count = theme === 'bamboo' ? (reduced ? 260 : 620) : (reduced ? 300 : 760);
      const pos = new Float32Array(count * 3);
      const data = [];
      for (let i = 0; i < count; i++) {
        const x = U.rand(-12, 12), y = U.rand(0, 12), z = U.rand(-7, 8);
        pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
        data.push({ speed: theme === 'bamboo' ? U.rand(4, 7) : theme === 'temple' || theme === 'boss' ? U.rand(-1.5, -.4) : U.rand(.45, 1.1), wind: theme === 'snow' || theme === 'title' ? U.rand(.35, .9) : U.rand(-.2, .2), phase: U.rand(0, 6) });
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      let color = 0xe4f7fb, size = .045, opacity = .8, blend = THREE.AdditiveBlending;
      if (theme === 'bamboo') { color = 0xa9e5df; size = .035; opacity = .65; }
      if (theme === 'temple' || theme === 'boss') { color = 0xff9c68; size = .045; opacity = .8; }
      const mat = new THREE.PointsMaterial({ color, size, map: this.tex.snow, transparent: true, opacity, depthWrite: false, blending: blend, sizeAttenuation: true, fog: false });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      this.scene.add(points);
      this.weather = { points, data, theme, time: theme === 'bamboo' ? 4 : 1 };
    }

    _updateWeather(dt, cameraX) {
      if (!this.weather) return;
      const { points, data, theme } = this.weather;
      points.position.x = cameraX;
      const boost = this.weatherBoost || 1;
      const arr = points.geometry.attributes.position.array;
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        arr[i * 3 + 1] -= d.speed * dt * boost;
        arr[i * 3] += d.wind * dt * (0.6 + boost * .55) + Math.sin(this.lastTime * .8 + d.phase) * .0015;
        if (theme === 'temple' || theme === 'boss') {
          if (arr[i * 3 + 1] > 12) { arr[i * 3 + 1] = 0; arr[i * 3] = U.rand(-12, 12); }
        } else if (arr[i * 3 + 1] < 0) {
          arr[i * 3 + 1] = 12; arr[i * 3] = U.rand(-12, 12); arr[i * 3 + 2] = U.rand(-7, 8);
        }
        if (arr[i * 3] > 13) arr[i * 3] = -13;
        if (arr[i * 3] < -13) arr[i * 3] = 13;
      }
      points.geometry.attributes.position.needsUpdate = true;
    }

    _updateSky(dt, cameraX) {
      if (this.skyMesh) this.skyMesh.position.x = cameraX;
      if (this.moonGroup) this.moonGroup.position.x = cameraX + 4.4;
      if (this.skyWhale) {
        this.skyWhale.position.x = cameraX + Math.sin(this.lastTime * .08) * 5 + 1;
        this.skyWhale.position.y = 9.0 + Math.sin(this.lastTime * .23) * .3;
        this.skyWhale.rotation.y = -.12 + Math.sin(this.lastTime * .16) * .08;
      }
      if (this.floatRocks) for (const m of this.floatRocks) {
        m.position.y = m.userData.float.base + Math.sin(this.lastTime * .8 + m.userData.float.phase) * .18;
      }
      if (this.barrierL && this.game.arenaLock && this.game.bounds) {
        this.barrierL.visible = this.barrierR.visible = true;
        this.barrierL.position.set(toX(this.game.bounds.left + 16), 2.6, 0);
        this.barrierR.position.set(toX(this.game.bounds.right - 16), 2.6, 0);
      } else if (this.barrierL) this.barrierL.visible = this.barrierR.visible = false;
    }

    /* ==================== 角色 ==================== */
    _buildPlayer() {
      const g = new THREE.Group();
      const body = new THREE.Group();
      g.add(body);
      const skin = this._std(0xf6dfce, { roughness: .58 });
      const hair = this._std(0x244ba6, { roughness: .55 });
      const hair2 = this._std(0x4f7dff, { roughness: .55 });
      const hairTip = this._std(0x7cefff, { roughness: .5, emissive: 0x2e8ca0, ei: .18 });
      const white = this._std(0xf3f4ec, { roughness: .68 });
      const white2 = this._std(0xd8e9ed, { roughness: .68 });
      const navy = this._std(0x163a67, { roughness: .58 });
      const blue = this._std(0x4e7bff, { roughness: .48, emissive: 0x1d4fd0, ei: .14 });
      const gold = this._std(0xe9c87d, { roughness: .55, metalness: .18 });
      const cyan = this._basic(0x8ef7ff, { transparent: true, opacity: .95 });
      const dark = this._basic(0x0a1824);
      const mats = [skin, hair, hair2, hairTip, white, white2, navy, blue, gold];
      // legs
      const legGeo = new THREE.CapsuleGeometry(.075, .22, 6, 10);
      const bootGeo = new THREE.SphereGeometry(.12, 12, 8);
      const legL = new THREE.Group(); legL.position.set(-.14, .54, 0); body.add(legL);
      const legR = new THREE.Group(); legR.position.set(.14, .54, 0); body.add(legR);
      for (const [lg, side] of [[legL, -1], [legR, 1]]) {
        this._mesh(lg, legGeo, white2, 0, -.14, 0, 1, 1, 1);
        this._mesh(lg, bootGeo, navy, 0, -.31, .035, .75, .48, 1.05);
        this._mesh(lg, new THREE.TorusGeometry(.095, .018, 5, 12), blue, 0, -.2, 0, 1, 1, 1, Math.PI / 2, 0, 0);
      }
      // 蓝色连衣裙 + 白色女仆围裙
      const skirt = this._mesh(body, new THREE.CylinderGeometry(.24, .49, .38, 18), blue, 0, .62, 0, 1, 1, .82);
      this._mesh(body, new THREE.CylinderGeometry(.26, .5, .045, 18), white, 0, .44, 0, 1, 1, .825);
      this._mesh(body, new THREE.CylinderGeometry(.25, .48, .025, 18), cyan, 0, .435, .01, 1, 1, .83);
      const torso = this._mesh(body, new THREE.CapsuleGeometry(.235, .3, 8, 14), blue, 0, .93, 0, 1, 1, .82);
      // 围裙主体与荷叶边
      this._mesh(body, new THREE.SphereGeometry(.255, 14, 12), white, 0, .73, .2, .9, 1.08, .23);
      this._mesh(body, new THREE.BoxGeometry(.28, .28, .035), white, 0, .97, .23, 1, 1, 1, -.08, 0, 0);
      for (let i = 0; i < 7; i++) {
        const x = (i - 3) * .075;
        this._mesh(body, new THREE.SphereGeometry(.052, 8, 6), white, x, .475 + Math.abs(x) * .12, .29, 1, .55, .65);
      }
      // 围裙肩带
      this._mesh(body, new THREE.BoxGeometry(.055, .38, .035), white, -.155, 1.03, .22, 1, 1, 1, -.1, 0, -.06);
      this._mesh(body, new THREE.BoxGeometry(.055, .38, .035), white, .155, 1.03, .22, 1, 1, 1, -.1, 0, .06);
      // 白色蕾丝领
      this._mesh(body, new THREE.TorusGeometry(.225, .05, 7, 20), white, 0, 1.14, 0, 1, 1, .85, Math.PI / 2, 0, 0);
      // 蓝色领结
      const bow = new THREE.Group(); bow.position.set(0, 1.1, .27); body.add(bow);
      this._mesh(bow, new THREE.ConeGeometry(.09, .21, 4), blue, -.09, 0, 0, 1, 1, .45, 0, 0, -1.4);
      this._mesh(bow, new THREE.ConeGeometry(.09, .21, 4), blue, .09, 0, 0, 1, 1, .45, 0, 0, 1.4);
      this._mesh(bow, new THREE.SphereGeometry(.05, 8, 6), white, 0, 0, .01, 1, 1, .6);
      this._mesh(body, new THREE.TorusGeometry(.235, .016, 5, 18), cyan, 0, .79, 0, 1, 1, .82, Math.PI / 2, 0, 0);
      // 围裙小鲸徽记
      const emblem = new THREE.Group(); emblem.position.set(0, .875, .272); body.add(emblem);
      this._mesh(emblem, new THREE.SphereGeometry(.065, 10, 8), blue, 0, 0, 0, 1.3, .62, .3);
      this._mesh(emblem, new THREE.ConeGeometry(.03, .09, 4), blue, .082, -.005, 0, 1, 1, .7, 0, 0, -1.1);
      // 后摆鲸尾
      const tailFin = new THREE.Group(); tailFin.position.set(0, .6, -.34); body.add(tailFin);
      this._mesh(tailFin, new THREE.ConeGeometry(.2, .45, 4), blue, -.14, 0, 0, 1, .72, .38, 0, 0, -1.15);
      this._mesh(tailFin, new THREE.ConeGeometry(.2, .45, 4), blue, .14, 0, 0, 1, .72, .38, 0, 0, 1.15);
      this._mesh(tailFin, new THREE.SphereGeometry(.13, 10, 8), white, 0, -.04, -.02, 1.2, .4, .4);
      // arms
      const armL = new THREE.Group(); armL.position.set(-.29, 1.14, 0); body.add(armL);
      const armR = new THREE.Group(); armR.position.set(.29, 1.14, 0); body.add(armR);
      for (const [arm, side] of [[armL, -1], [armR, 1]]) {
        this._mesh(arm, new THREE.SphereGeometry(.13, 12, 8), white, 0, -.03, 0, 1, .85, 1);
        this._mesh(arm, new THREE.CapsuleGeometry(.06, .21, 5, 8), skin, 0, -.27, 0, 1, 1, 1);
        this._mesh(arm, new THREE.SphereGeometry(.065, 6, 5), skin, 0, -.43, 0);
        this._mesh(arm, new THREE.TorusGeometry(.08, .016, 4, 10), blue, 0, -.16, 0, 1, 1, 1, Math.PI / 2, 0, 0);
      }
      // 三中校服臂章
      this._mesh(armL, new THREE.CylinderGeometry(.076, .076, .085, 10), this._std(0xb33a34, { roughness: .7 }), 0, -.15, 0);
      this._mesh(armL, new THREE.BoxGeometry(.09, .026, .015), white, 0, -.15, .074);
      // 围裙校徽
      const badge = this._mesh(body, new THREE.CircleGeometry(.055, 20), this._basic(0xffffff, { transparent: true, opacity: 0 }), .19, .78, .31);
      badge.material.map = this.tex.schoolBadge; badge.material.needsUpdate = true; badge.material.transparent = true; badge.material.opacity = 1;
      // head
      const head = new THREE.Group(); head.position.set(0, 1.59, 0); body.add(head);
      this._mesh(head, new THREE.SphereGeometry(.4, 24, 18), skin, 0, 0, 0, 1, 1.02, .9);
      // 长发后层
      this._mesh(head, new THREE.SphereGeometry(.42, 18, 14), hair, 0, -.06, -.14, 1.12, 1.12, 1.0);
      const backHair = new THREE.Group(); backHair.position.set(0, -.1, -.2); head.add(backHair);
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * .12;
        this._mesh(backHair, new THREE.CapsuleGeometry(.075, .45 + Math.abs(i - 2) * .05, 5, 8), i % 2 ? hair2 : hair, x, -.42, -.04 + Math.abs(i - 2) * .015, .95, 1.0, .62, 0, 0, (i - 2) * .1);
        this._mesh(backHair, new THREE.SphereGeometry(.08, 8, 6), hairTip, x * 1.2, -.88, -.02, .9, 1.5, .55);
      }
      // hair cap
      this._mesh(head, new THREE.SphereGeometry(.425, 24, 16, 0, TAU, 0, Math.PI * .57), hair2, 0, .025, -.01, 1.08, 1.04, .92);
      // bangs
      const bangGeo = new THREE.SphereGeometry(.14, 10, 8);
      this._mesh(head, bangGeo, hair2, -.21, .22, .32, 1, 1.35, .55, 0, 0, -.25);
      this._mesh(head, bangGeo, hair2, .02, .27, .35, 1.02, 1.25, .55, 0, 0, .1);
      this._mesh(head, bangGeo, hair, .23, .2, .31, .95, 1.2, .55, 0, 0, .25);
      // 长侧发
      for (const side of [-1, 1]) {
        this._mesh(head, new THREE.SphereGeometry(.105, 10, 8), hair2, side * .35, -.1, .18, .75, 2.2, .85, 0, 0, side * .1);
        this._mesh(head, new THREE.CapsuleGeometry(.07, .5, 5, 8), hair, side * .37, -.48, .1, .9, 1, .7, 0, 0, side * .06);
        this._mesh(head, new THREE.SphereGeometry(.07, 8, 6), hairTip, side * .38, -.8, .1, .85, 1.4, .6);
      }
      // 鲸鳍耳 + 白色女仆发带
      const tails = [];
      for (const side of [-1, 1]) {
        const fin = new THREE.Group(); fin.position.set(side * .36, .08, -.04); head.add(fin);
        this._mesh(fin, new THREE.ConeGeometry(.2, .68, 4), blue, side * .2, .02, 0, 1, 1, .32, 0, 0, side * -1.08);
        this._mesh(fin, new THREE.ConeGeometry(.1, .5, 4), hairTip, side * .2, .02, .03, 1, 1, .24, 0, 0, side * -1.08);
        for (let k = 0; k < 3; k++) {
          this._mesh(fin, new THREE.BoxGeometry(.018, .28 - k * .05, .015), this._basic(0xb8fbff, { transparent: true, opacity: .6 }), side * (.16 + k * .05), .02 + k * .02, .02, 1, 1, 1, 0, 0, side * -1.08);
        }
        tails.push({ group: fin, side });
      }
      const bandMat = white;
      this._mesh(head, new THREE.TorusGeometry(.42, .04, 6, 30), bandMat, 0, .16, 0, 1, 1, .95, Math.PI / 2, 0, 0);
      for (let i = 0; i < 9; i++) {
        const a = -1.55 + i * (3.1 / 8);
        this._mesh(head, new THREE.SphereGeometry(.055, 8, 6), white, Math.sin(a) * .41, .19, Math.cos(a) * .41 + .02, 1, .75, .8);
      }
      const bowTop = new THREE.Group(); bowTop.position.set(-.28, .3, .06); head.add(bowTop);
      this._mesh(bowTop, new THREE.ConeGeometry(.09, .18, 4), white, -.06, 0, 0, 1, 1, .5, 0, 0, -1.3);
      this._mesh(bowTop, new THREE.ConeGeometry(.09, .18, 4), white, .06, 0, 0, 1, 1, .5, 0, 0, 1.3);
      this._mesh(bowTop, new THREE.SphereGeometry(.045, 8, 6), blue, 0, 0, .02);
      // ahoge
      const ahoge = new THREE.Group(); ahoge.position.set(.02, .39, .02); head.add(ahoge);
      this._mesh(ahoge, new THREE.CylinderGeometry(.012, .028, .26, 6), hair2, .04, .1, 0, 1, 1, 1, 0, 0, -.35);
      this._mesh(ahoge, new THREE.SphereGeometry(.045, 8, 6), hairTip, .1, .22, 0);
      // whale hairpin
      const pin = new THREE.Group(); pin.position.set(-.3, .34, .12); pin.rotation.z = -.2; head.add(pin);
      this._mesh(pin, new THREE.SphereGeometry(.07, 10, 8), cyan, 0, 0, 0, 1.25, .55, .5);
      this._mesh(pin, new THREE.ConeGeometry(.04, .11, 4), cyan, -.09, -.01, 0, 1, 1, .7, 0, 0, 1.45);
      // face
      const face = new THREE.Group(); face.position.set(0, .02, .355); head.add(face);
      const eyeOuterMat = this._basic(0x0a1a32), irisMat = this._basic(0x55dfff), pupilMat = this._basic(0x081827), hiMat = this._basic(0xffffff);
      const eyes = [];
      for (const side of [-1, 1]) {
        const eye = new THREE.Group(); eye.position.set(side * .155, .04, 0); face.add(eye);
        const outer = this._mesh(eye, new THREE.CircleGeometry(.105, 20), eyeOuterMat, 0, 0, 0, 1, 1.22, 1);
        const iris = this._mesh(eye, new THREE.CircleGeometry(.078, 18), irisMat, 0, .006, .002, 1, 1.18, 1);
        const pupil = this._mesh(eye, new THREE.CircleGeometry(.034, 12), pupilMat, 0, .008, .004, 1, 1.3, 1);
        const hi = this._mesh(eye, new THREE.CircleGeometry(.025, 10), hiMat, -.026, .038, .006, 1, 1, 1);
        const hi2 = this._mesh(eye, new THREE.CircleGeometry(.011, 8), hiMat, .03, -.028, .006, 1, 1, 1);
        eyes.push(eye);
      }
      // 困困的半睑
      const lidMat = this._basic(0xf5ddcb);
      const lashMat = this._basic(0x173158);
      for (const side of [-1, 1]) {
        this._mesh(face, new THREE.CircleGeometry(.109, 20), lidMat, side * .155, .104, .006, 1, .36, 1);
        this._mesh(face, new THREE.BoxGeometry(.17, .012, .008), lashMat, side * .155, .063, .007, 1, 1, 1, 0, 0, side * .06);
      }
      // brows
      const browMat = this._basic(0x18345e);
      for (const side of [-1, 1]) {
        const b = this._mesh(face, new THREE.BoxGeometry(.105, .015, .008), browMat, side * .155, .198, .002, 1, 1, 1, 0, 0, side * .12);
      }
      // 小小的张嘴与鲸牙
      this._mesh(face, new THREE.CircleGeometry(.036, 14), this._basic(0x8c3a48), 0, -.137, .003, 1, 1.08, 1);
      this._mesh(face, new THREE.CircleGeometry(.022, 10), this._basic(0xe9828e), 0, -.151, .006, 1.2, .65, 1);
      this._mesh(face, new THREE.ConeGeometry(.012, .038, 3), this._basic(0xfffdf3), .025, -.124, .009, 1, 1, .8, 0, 0, Math.PI);
      // blush
      const blush = this._basic(0xf18f9b, { transparent: true, opacity: .42 });
      this._mesh(face, new THREE.CircleGeometry(.058, 14), blush, -.255, -.08, .002, 1, .46, 1);
      this._mesh(face, new THREE.CircleGeometry(.058, 14), blush, .255, -.08, .002, 1, .46, 1);
      this._mesh(face, new THREE.BoxGeometry(.016, .006, .006), this._basic(0xf0a0ab), -.235, -.08, .004, 1, 1, 1, 0, 0, -.4);
      this._mesh(face, new THREE.BoxGeometry(.016, .006, .006), this._basic(0xf0a0ab), .275, -.08, .004, 1, 1, 1, 0, 0, .4);
      // 小鲸伙伴
      const pet = new THREE.Group(); pet.position.set(1.02, 1.42, .42); body.add(pet);
      const petBody = this._mesh(pet, new THREE.SphereGeometry(.18, 14, 10), this._std(0x4d7bff, { roughness: .45, emissive: 0x173d9e, ei: .22 }), 0, 0, 0, 1.3, .6, 1.4);
      this._mesh(pet, new THREE.SphereGeometry(.12, 10, 8), this._std(0xc8edff, { roughness: .5, emissive: 0x22556b, ei: .1 }), 0, -.035, .06, 1.05, .36, 1.2);
      this._mesh(pet, new THREE.ConeGeometry(.075, .25, 4), this._std(0x5a8dff), -.25, 0, 0, 1, 1, 1, 0, 0, 1.2);
      this._mesh(pet, new THREE.ConeGeometry(.075, .25, 4), this._std(0x5a8dff), .25, 0, 0, 1, 1, 1, 0, 0, -1.2);
      this._mesh(pet, new THREE.SphereGeometry(.022, 8, 6), this._basic(0x081827), -.1, .02, .16);
      this._mesh(pet, new THREE.SphereGeometry(.022, 8, 6), this._basic(0x081827), .1, .02, .16);
      this._sprite(pet, this.tex.glowBlue, 0x6d9aff, 0, 0, -.1, 1.0, .55, .22, true);
      // sword
      const sword = new THREE.Group(); sword.position.set(0, -.43, .02); armR.add(sword);
      const grip = this._mesh(sword, new THREE.CylinderGeometry(.028, .033, .28, 8), navy, 0, -.08, 0);
      this._mesh(sword, new THREE.BoxGeometry(.13, .035, .08), gold, 0, .065, 0);
      const bladeMat = this._std(0xbff7ff, { roughness: .25, metalness: .15, emissive: 0x3bbcd8, ei: .6 });
      this._mesh(sword, new THREE.BoxGeometry(.075, .82, .035), bladeMat, 0, .49, 0);
      this._mesh(sword, new THREE.ConeGeometry(.037, .15, 4), bladeMat, 0, .975, 0, 1, 1, .7);
      this._mesh(sword, new THREE.BoxGeometry(.022, .78, .038), this._basic(0xeaffff, { transparent: true, opacity: .8 }), .015, .48, .021);
      // slash arc
      const slash = new THREE.Mesh(new THREE.RingGeometry(.58, 1.18, 40, 1, -.2, Math.PI * 1.25), new THREE.MeshBasicMaterial({ color: 0xaaf8ff, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      slash.position.set(0, 1.02, .46);
      slash.visible = false;
      g.add(slash);
      // aura
      const aura = this._sprite(g, this.tex.glowCyan, 0x8bf4ff, 0, 1.05, .1, 2.5, 2.5, .08, true);
      // shadow
      g.scale.setScalar(1.12);
      pet.scale.setScalar(.82);
      const shadow = this._shadow(this.actorGroup, 1.55, .8, .75);
      this.actorGroup.add(g);
      this.playerModel = { group: g, body, head, face, eyes, tails, ahoge, armL, armR, legL, legR, sword, slash, pet, aura, mats, bladeMat, shadow, blink: 0 };
    }

    _buildTitleBoss() {
      const b = this._buildBossObject(1, true);
      b.group.position.set(15.9, 0, -1.6);
      b.group.scale.setScalar(.92);
      b.group.rotation.y = -.25;
      b.mats.forEach(m => { if (m.color) m.color.multiplyScalar(.62); });
      b.shadow.position.set(15.9, .012, -1.6);
      this.actorGroup.add(b.group);
      this.titleBoss = b;
    }

    _buildBoss() {
      const b = this._buildBossObject(1, false);
      this.bossModel = b;
      this.actorGroup.add(b.group);
      this.actorGroup.add(b.shadow);
    }

    _buildBossObject(phase, title) {
      const g = new THREE.Group();
      const mats = [];
      const black = this._std(0x151318, { roughness: .85, flat: true }); mats.push(black);
      const black2 = this._std(0x22191b, { roughness: .9, flat: true }); mats.push(black2);
      const armor = this._std(0x2c262c, { roughness: .6, metalness: .15, flat: true }); mats.push(armor);
      const red = this._std(0x7c2424, { roughness: .65, emissive: 0x3a0a08, ei: .25 }); mats.push(red);
      const skin = this._std(0xe2c5b5, { roughness: .58 }); mats.push(skin);
      const hair = this._std(0x0a0910, { roughness: .4 }); mats.push(hair);
      const hair2 = this._std(0x171522, { roughness: .45 }); mats.push(hair2);
      const steel = this._std(0x9b9a98, { roughness: .42, metalness: .45, flat: true }); mats.push(steel);
      const goldTrim = this._std(0xb99358, { roughness: .4, metalness: .35 }); mats.push(goldTrim);
      const eye = this._basic(0xff6552);
      // legs
      this._mesh(g, new THREE.CapsuleGeometry(.145, 1.18, 6, 8), black, -.25, 1.08, 0, 1, 1, 1);
      this._mesh(g, new THREE.CapsuleGeometry(.145, 1.18, 6, 8), black, .25, 1.08, 0, 1, 1, 1);
      this._mesh(g, new THREE.BoxGeometry(.34, .15, .62), armor, -.25, .12, .15);
      this._mesh(g, new THREE.BoxGeometry(.34, .15, .62), armor, .25, .12, .15);
      this._mesh(g, new THREE.BoxGeometry(.36, .04, .64), red, -.25, .18, .15);
      this._mesh(g, new THREE.BoxGeometry(.36, .04, .64), red, .25, .18, .15);
      // body / long coat
      const body = new THREE.Group(); body.position.y = 0; g.add(body);
      this._mesh(body, new THREE.CylinderGeometry(.37, .64, 1.5, 8), black, 0, 1.82, 0, 1, 1, .82);
      this._mesh(body, new THREE.CylinderGeometry(.4, .51, .36, 8), black2, 0, 2.5, 0, 1, 1, .86);
      // armor plates
      this._mesh(body, new THREE.BoxGeometry(.54, .7, .12), armor, 0, 2.25, .37, 1, 1, 1, -.06, 0, 0);
      this._mesh(body, new THREE.BoxGeometry(.7, .09, .14), goldTrim, 0, 2.52, .36, 1, 1, 1, -.03, 0, 0);
      this._mesh(body, new THREE.BoxGeometry(.055, .48, .04), red, 0, 2.16, .45);
      this._mesh(body, new THREE.BoxGeometry(.5, .04, .04), red, 0, 1.94, .44);
      // shoulders
      this._mesh(body, new THREE.SphereGeometry(.32, 10, 8), armor, -.48, 2.5, 0, 1.1, .58, 1);
      this._mesh(body, new THREE.SphereGeometry(.32, 10, 8), armor, .48, 2.5, 0, 1.1, .58, 1);
      this._mesh(body, new THREE.ConeGeometry(.12, .35, 4), goldTrim, -.63, 2.58, 0, 1, 1, .8, 0, 0, -.7);
      this._mesh(body, new THREE.ConeGeometry(.12, .35, 4), goldTrim, .63, 2.58, 0, 1, 1, .8, 0, 0, .7);
      // high collar
      this._mesh(body, new THREE.CylinderGeometry(.28, .38, .5, 8, 1, true), black2, 0, 2.71, -.06, 1, 1, .85);
      // head
      const head = new THREE.Group(); head.position.set(0, 2.96, .02); body.add(head);
      this._mesh(head, new THREE.SphereGeometry(.3, 24, 18), skin, 0, 0, .03, .92, 1.02, .9);
      // long black hair (back + sides)
      this._mesh(head, new THREE.SphereGeometry(.32, 18, 14), hair, 0, .075, -.1, 1.0, .92, .98);
      for (let i = 0; i < 5; i++) {
        const x = (i - 2) * .13;
        this._mesh(head, new THREE.CapsuleGeometry(.07, .8 + U.hash(i + 2) * .35, 5, 8), i % 2 ? hair2 : hair, x, -.55, -.1 - Math.abs(i - 2) * .02, .95, 1, .65, 0, 0, (i - 2) * .08);
      }
      // swept bangs
      this._mesh(head, new THREE.ConeGeometry(.13, .5, 4), hair2, -.19, .18, .21, .85, 1, .55, .25, 0, -.9);
      this._mesh(head, new THREE.ConeGeometry(.1, .4, 4), hair2, .04, .23, .25, .8, 1, .5, .2, 0, .35);
      this._mesh(head, new THREE.ConeGeometry(.1, .42, 4), hair, .22, .16, .2, .8, 1, .5, .2, 0, 1.0);
      // 红发带
      this._mesh(head, new THREE.TorusGeometry(.29, .025, 5, 16), red, 0, .13, -.02, 1, .85, 1, Math.PI / 2, 0, 0);
      this._mesh(head, new THREE.ConeGeometry(.05, .48, 4), red, -.26, -.2, -.18, 1, 1, .45, 0, 0, .25);
      // face
      const face = new THREE.Group(); face.position.z = .29; head.add(face);
      // eyes: one burning red, one dark
      this._mesh(face, new THREE.CircleGeometry(.052, 14), this._basic(0x1a1114), .105, -.02, 0, 1.55, .72, 1);
      this._mesh(face, new THREE.CircleGeometry(.034, 12), eye, .105, -.02, .004, 1.4, .7, 1);
      this._mesh(face, new THREE.CircleGeometry(.045, 12), this._basic(0x1b1318), -.105, -.02, 0, 1.55, .7, 1);
      this._mesh(face, new THREE.CircleGeometry(.018, 8), this._basic(0x5c3d3e), -.105, -.02, .004, 1.3, .7, 1);
      this._mesh(face, new THREE.BoxGeometry(.17, .014, .01), this._basic(0x25171a), -.105, .075, .002, 1, 1, 1, 0, 0, -.12);
      this._mesh(face, new THREE.BoxGeometry(.15, .012, .01), this._basic(0x25171a), .1, .07, .002, 1, 1, 1, 0, 0, .14);
      // mouth / scar / nose
      this._mesh(face, new THREE.BoxGeometry(.128, .012, .01), this._basic(0x7c4f4c), 0, -.16, .002, 1, 1, 1, 0, 0, .03);
      this._mesh(face, new THREE.BoxGeometry(.01, .15, .008), this._basic(0x9b5f58), .2, -.04, .005, 1, 1, 1, 0, 0, .25);
      this._mesh(face, new THREE.BoxGeometry(.028, .012, .01), this._basic(0xc08d7d), .005, -.09, .004, 1, 1, 1, 0, 0, 0);
      this._sprite(head, this.tex.glowRed, 0xff5a48, .105, -.02, .34, .32, .18, .25, true);
      // horns (phase 2)
      const horns = new THREE.Group(); head.add(horns);
      this._mesh(horns, new THREE.ConeGeometry(.1, .48, 5), this._std(0x9b3329, { emissive: 0x3f0b07, ei: .4 }), -.25, .25, -.02, 1, 1, 1, 0, 0, -.5);
      this._mesh(horns, new THREE.ConeGeometry(.1, .48, 5), this._std(0x9b3329, { emissive: 0x3f0b07, ei: .4 }), .25, .25, -.02, 1, 1, 1, 0, 0, .5);
      horns.visible = false;
      // arms
      const armR = new THREE.Group(); armR.position.set(.6, 2.36, 0); body.add(armR);
      const armL = new THREE.Group(); armL.position.set(-.6, 2.36, 0); body.add(armL);
      this._mesh(armR, new THREE.CapsuleGeometry(.13, .65, 6, 8), black, 0, -.34, 0, 1, 1, 1);
      this._mesh(armL, new THREE.CapsuleGeometry(.13, .65, 6, 8), black, 0, -.34, 0, 1, 1, 1);
      this._mesh(armR, new THREE.SphereGeometry(.13, 8, 6), skin, 0, -.73, 0);
      // sword
      const sword = new THREE.Group(); sword.position.set(0, -.71, .02); armR.add(sword);
      this._mesh(sword, new THREE.CylinderGeometry(.055, .07, .55, 6), black2, 0, -.1, 0);
      this._mesh(sword, new THREE.BoxGeometry(.2, .08, .12), red, 0, .18, 0);
      const blade = new THREE.Group(); blade.position.y = 1.35; sword.add(blade);
      this._mesh(blade, new THREE.BoxGeometry(.2, 2.2, .06), steel, 0, .78, 0);
      this._mesh(blade, new THREE.ConeGeometry(.1, .55, 3), steel, 0, 2.12, 0, 1, 1, .7);
      this._mesh(blade, new THREE.BoxGeometry(.025, 2.1, .065), this._basic(0xff5949, { transparent: true, opacity: .6 }), .075, .8, .008);
      // cape
      const cape = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.2, 8, 1, true), this._std(0x0a090d, { roughness: 1, side: THREE.DoubleSide }));
      cape.position.set(0, 1.85, -.46); cape.rotation.x = .08; body.add(cape);
      // aura
      const aura = this._sprite(body, this.tex.glowRed, 0xff6d55, 0, 1.9, -.2, 4.4, 4.4, .08, true);
      const swordGlow = this._sprite(blade, this.tex.glowRed, 0xff6b55, 0, 1.0, .05, 1.1, 3.4, .16, true);
      const shadow = this._shadow(this.actorGroup, 2.3, 1.2, .8);
      return { group: g, body, head, face, horns, armL, armR, sword, blade, cape, aura, shadow, mats, eye, phase, title };
    }

    _buildEnemyModel(e) {
      const g = new THREE.Group();
      const mats = [];
      const std = (c, o) => { const m = this._std(c, o); mats.push(m); return m; };
      const basic = (c, o) => this._basic(c, o);
      let size = e.size / 100;
      let shadow = this._shadow(this.actorGroup, size * 1.2, size * .55, .7);
      const data = { group: g, mats, size, shadow, type: e.type };
      if (e.type === 'inkling') {
        const s = e.size / 100;
        const blob = this._mesh(g, new THREE.DodecahedronGeometry(s * .58, 0), std(0x0b2028, { flat: true, roughness: .9 }), 0, s * .72, 0, 1, .92, 1);
        this._mesh(g, new THREE.ConeGeometry(s * .15, s * .5, 4), std(0x223d46, { flat: true }), -s * .45, s * .95, 0, 1, 1, 1, 0, 0, .7);
        this._mesh(g, new THREE.ConeGeometry(s * .15, s * .5, 4), std(0x223d46, { flat: true }), s * .45, s * .95, 0, 1, 1, 1, 0, 0, -.7);
        const mask = this._mesh(g, new THREE.SphereGeometry(s * .32, 14, 10), std(0xd8d5c7, { roughness: .8 }), 0, s * .72, s * .38, 1.2, .85, .3);
        this._mesh(g, new THREE.CircleGeometry(s * .05, 10), basic(0x1a343d), -s * .11, s * .76, s * .48, 1, .75, 1);
        this._mesh(g, new THREE.CircleGeometry(s * .05, 10), basic(0x1a343d), s * .12, s * .76, s * .48, 1, .75, 1);
        this._mesh(g, new THREE.TorusGeometry(s * .1, .006, 4, 10, Math.PI), basic(0x394044), 0, s * .62, s * .49, 1, .55, 1);
        this._mesh(g, new THREE.TorusGeometry(s * .14, .012, 4, 12), std(0x1a2f36), 0, s * .72, s * .43, 1, .75, 1, 0, 0, 0);
        data.bob = .12;
      } else if (e.type === 'paper') {
        const s = e.size / 100;
        const robe = this._mesh(g, new THREE.ConeGeometry(s * .45, s * .8, 8), std(0xc2bcae, { flat: true, roughness: .9 }), 0, s * .55, 0);
        const head = this._mesh(g, new THREE.SphereGeometry(s * .18, 12, 10), std(0xe9dfc9), 0, s * 1.05, 0, 1, .92, 1);
        this._mesh(g, new THREE.ConeGeometry(s * .52, s * .32, 8), std(0x8c3c34, { flat: true }), 0, s * 1.22, 0);
        this._mesh(g, new THREE.PlaneGeometry(s * .16, s * .45), std(0xe8dcb8), 0, s * .62, s * .34, 1, 1, 1, 0, 0, .08);
        this._mesh(g, new THREE.CircleGeometry(s * .025, 8), basic(0x243438), -s * .065, s * 1.08, s * .17);
        this._mesh(g, new THREE.CircleGeometry(s * .025, 8), basic(0x243438), s * .065, s * 1.08, s * .17);
        data.bob = .18;
      } else if (e.type === 'shield') {
        const s = e.size / 100;
        this._mesh(g, new THREE.CapsuleGeometry(s * .34, s * .55, 6, 10), std(0x2a2c2b, { flat: true }), 0, s * .72, 0, 1, 1, .9);
        this._mesh(g, new THREE.SphereGeometry(s * .25, 10, 8), std(0x74633f, { flat: true, metalness: .2 }), 0, s * 1.18, 0, 1, .7, 1);
        this._mesh(g, new THREE.CylinderGeometry(s * .38, s * .38, s * .08, 18), std(0x5d4a32, { metalness: .25, flat: true }), s * .34, s * .72, s * .2, 1, 1, 1, Math.PI / 2, 0, 0);
        this._mesh(g, new THREE.TorusGeometry(s * .32, s * .045, 5, 20), std(0xa58451, { metalness: .35 }), s * .34, s * .72, s * .21, 1, 1, 1, 0, 0, 0);
        this._mesh(g, new THREE.BoxGeometry(s * .35, s * .07, .04), std(0x1a2020), 0, s * 1.23, s * .19);
        this._mesh(g, new THREE.CircleGeometry(s * .028, 8), basic(0xffb15e), -s * .09, s * 1.22, s * .23);
        data.bob = .02;
      } else if (e.type === 'fox') {
        const s = e.size / 100;
        this._mesh(g, new THREE.SphereGeometry(s * .42, 16, 10), std(0x0c2027, { flat: true }), 0, s * .42, 0, 1.35, .62, .8);
        this._mesh(g, new THREE.SphereGeometry(s * .28, 12, 8), std(0x0c2027, { flat: true }), s * .55, s * .55, .1, 1, .9, .9);
        this._mesh(g, new THREE.ConeGeometry(s * .12, s * .35, 4), std(0x0c2027), s * .68, s * .87, .1, 1, 1, 1, 0, 0, -.1);
        this._mesh(g, new THREE.ConeGeometry(s * .12, s * .35, 4), std(0x0c2027), s * .45, s * .87, .1, 1, 1, 1, 0, 0, .2);
        this._mesh(g, new THREE.ConeGeometry(s * .1, s * .75, 4), std(0x17343a, { flat: true }), -.55, s * .45, 0, 1, 1, .6, 0, 0, 1.1);
        this._mesh(g, new THREE.ConeGeometry(s * .08, s * .55, 4), std(0x17343a, { flat: true }), -.5, s * .35, -.2, 1, 1, .5, 0, 0, 1.1);
        this._mesh(g, new THREE.CircleGeometry(s * .028, 8), basic(0xff6863), s * .68, s * .58, .195);
        data.bob = .03;
      } else if (e.type === 'crow') {
        const s = e.size / 100;
        this._mesh(g, new THREE.SphereGeometry(s * .38, 12, 8), std(0x11171d, { flat: true }), 0, s * 1.7, 0, 1, .72, .8);
        this._mesh(g, new THREE.ConeGeometry(s * .1, s * .35, 4), std(0x6c5636), s * .33, s * 1.7, .1, 1, 1, 1, 0, 0, -1.4);
        this._mesh(g, new THREE.CircleGeometry(s * .035, 8), basic(0xff6552), s * .19, s * 1.77, .16);
        const wingL = this._mesh(g, new THREE.BoxGeometry(s * .7, s * .08, s * .3), std(0x1b2229, { flat: true }), -.42, s * 1.75, 0, 1, 1, 1, 0, 0, .3);
        const wingR = this._mesh(g, new THREE.BoxGeometry(s * .7, s * .08, s * .3), std(0x1b2229, { flat: true }), .42, s * 1.75, 0, 1, 1, 1, 0, 0, -.3);
        data.wings = [wingL, wingR];
        data.bob = .25; data.fly = true;
      } else if (e.type === 'scholar') {
        const s = e.size / 100;
        this._mesh(g, new THREE.CapsuleGeometry(s * .09, s * .47, 5, 8), std(0x202934, { flat: true }), -.18, s * .42, 0);
        this._mesh(g, new THREE.CapsuleGeometry(s * .09, s * .47, 5, 8), std(0x202934, { flat: true }), .18, s * .42, 0);
        this._mesh(g, new THREE.CapsuleGeometry(s * .28, s * .48, 6, 12), std(0xdde3e1, { roughness: .8 }), 0, s * 1.04, 0, 1, 1, .78);
        this._mesh(g, new THREE.ConeGeometry(s * .14, s * .5, 4), std(0x3f4c57, { flat: true }), -.11, s * 1.2, .22, 1, 1, .5, 0, 0, .25);
        this._mesh(g, new THREE.SphereGeometry(s * .24, 16, 12), std(0xe0bca9, { roughness: .6 }), 0, s * 1.58, .02, .94, 1.05, .9);
        this._mesh(g, new THREE.SphereGeometry(s * .25, 14, 10), std(0x17151a, { roughness: .6 }), 0, s * 1.69, -.06, 1.02, .72, .9);
        // 厚底眼镜
        for (const side of [-1, 1]) {
          this._mesh(g, new THREE.TorusGeometry(s * .085, s * .018, 5, 16), std(0x12171d, { metalness: .2 }), side * s * .1, s * 1.59, .23, 1, .72, 1);
          this._mesh(g, new THREE.CircleGeometry(s * .07, 12), basic(0xb9e2e8, { transparent: true, opacity: .32 }), side * s * .1, s * 1.59, .245, 1, .7, 1);
        }
        this._mesh(g, new THREE.BoxGeometry(s * .07, .012, .012), basic(0x15191e), 0, s * 1.6, .25);
        this._mesh(g, new THREE.BoxGeometry(s * .2, .014, .012), basic(0x4c3130), 0, s * 1.42, .235);
        // 发光的五年高考三年模拟
        const book = this._mesh(g, new THREE.BoxGeometry(s * .38, s * .48, s * .07), std(0xe7dcc0, { emissive: 0x4e7380, ei: .25 }), s * .42, s * 1.02, .28, 1, 1, 1, 0, 0, -.12);
        this._mesh(book, new THREE.BoxGeometry(s * .26, s * .06, s * .012), basic(0x316c8b), 0, s * .08, .05);
        this._sprite(g, this.tex.glowCyan, 0x9defff, s * .42, s * 1.02, .35, 1.1, 1.1, .1, true);
        // 悬浮粉笔
        for (let i = 0; i < 3; i++) this._mesh(g, new THREE.CylinderGeometry(s * .025, s * .025, s * .18, 5), std(0xf2f0df), -.42 + i * .18, s * 1.5 + i * .1, -.12, 1, 1, 1, .4, 0, .3);
        data.bob = .02;
      } else if (e.type === 'athlete') {
        const s = e.size / 100;
        this._mesh(g, new THREE.CapsuleGeometry(s * .16, s * .52, 6, 8), std(0x1c2328, { flat: true }), -.23, s * .5, 0);
        this._mesh(g, new THREE.CapsuleGeometry(s * .16, s * .52, 6, 8), std(0x1c2328, { flat: true }), .23, s * .5, 0);
        this._mesh(g, new THREE.CapsuleGeometry(s * .42, s * .55, 7, 12), std(0xd9624f, { roughness: .8 }), 0, s * 1.13, 0, 1, 1, .82);
        this._mesh(g, new THREE.SphereGeometry(s * .2, 12, 9), std(0xd0a58f, { roughness: .65 }), -.52, s * 1.28, 0, 1, .8, 1);
        this._mesh(g, new THREE.SphereGeometry(s * .2, 12, 9), std(0xd0a58f, { roughness: .65 }), .52, s * 1.28, 0, 1, .8, 1);
        this._mesh(g, new THREE.SphereGeometry(s * .22, 14, 10), std(0xd7ad95), 0, s * 1.7, .04, .95, 1, .9);
        this._mesh(g, new THREE.SphereGeometry(s * .22, 12, 9), std(0x17171a, { flat: true }), 0, s * 1.8, -.04, 1, .65, .9);
        this._mesh(g, new THREE.BoxGeometry(s * .46, s * .06, .04), std(0xf0e7dc), 0, s * 1.68, .2);
        this._mesh(g, new THREE.CircleGeometry(s * .026, 8), basic(0xffe1aa), -.08, s * 1.71, .205);
        this._mesh(g, new THREE.CircleGeometry(s * .026, 8), basic(0xffe1aa), .08, s * 1.71, .205);
        // 实心球
        this._mesh(g, new THREE.SphereGeometry(s * .24, 14, 10), std(0x33383d, { roughness: .45, metalness: .25 }), -.58, s * .78, .25);
        // 护腕
        this._mesh(g, new THREE.TorusGeometry(s * .15, s * .03, 5, 12), std(0x3b6480, { roughness: .5 }), -.52, s * 1.13, 0, 1, 1, 1, Math.PI / 2, 0, 0);
        data.bob = .015;
      } else {
        const s = e.size / 100;
        const variant = e.variant || 'sword';
        const c1 = variant === 'snow' ? 0x173644 : variant === 'paper' ? 0x8e826b : 0x1b1720;
        const c2 = variant === 'snow' ? 0x317283 : variant === 'paper' ? 0xd4c7aa : 0x572228;
        this._mesh(g, new THREE.ConeGeometry(s * .4, s * 1.05, 7), std(c1, { flat: true }), 0, s * .58, 0);
        this._mesh(g, new THREE.CylinderGeometry(s * .1, s * .45, s * .5, 8), std(c2, { flat: true, transparent: true, opacity: .55 }), 0, s * .7, .04);
        this._mesh(g, new THREE.SphereGeometry(s * .19, 12, 10), variant === 'paper' ? std(0xe6ddc8) : std(0xc9d6d6), 0, s * 1.24, 0, 1, .95, 1);
        if (variant === 'paper') {
          this._mesh(g, new THREE.ConeGeometry(s * .25, s * .22, 7), std(0x6f2b24, { flat: true }), 0, s * 1.47, 0);
          this._mesh(g, new THREE.PlaneGeometry(s * .18, s * .6), std(0xdfd3b5), 0, s * .7, s * .38);
        } else {
          for (let i = 0; i < 5; i++) {
            this._mesh(g, new THREE.ConeGeometry(s * .1, s * .3, 4), std(0x0e1a21, { flat: true }), -.28 + i * .14, s * 1.36, -.05, 1, 1, 1, 0, 0, U.rand(-.4, .4));
          }
          this._mesh(g, new THREE.CircleGeometry(s * .035, 8), basic(0xff725a), s * .07, s * 1.24, s * .18);
          this._mesh(g, new THREE.CircleGeometry(s * .032, 8), basic(0x1c2b2f), -s * .07, s * 1.24, s * .18);
        }
        // shoulders / weapon
        this._mesh(g, new THREE.SphereGeometry(s * .2, 10, 8), std(c1, { flat: true }), -.35, s * 1.02, 0, 1, .65, 1);
        this._mesh(g, new THREE.SphereGeometry(s * .2, 10, 8), std(c1, { flat: true }), .35, s * 1.02, 0, 1, .65, 1);
        if (variant === 'sword') {
          this._mesh(g, new THREE.BoxGeometry(s * .06, s * .8, .04), std(0xb5b5ae, { metalness: .3 }), .42, s * .82, .18, 1, 1, 1, 0, 0, -.3);
        }
        data.bob = .02;
      }
      const contact = shadow;
      const baseScale = e.isElite ? 1.2 : 1.42;
      g.scale.setScalar(baseScale);
      const model = { ...data, group: g, shadow: contact, type: e.type, variant: e.variant, baseScale };
      this.actorGroup.add(g);
      return model;
    }

    clearEnemies() {
      for (const m of this.enemyModels.values()) {
        this.actorGroup.remove(m.group);
        this.actorGroup.remove(m.shadow);
      }
      this.enemyModels.clear();
    }
    clearBoss() {
      if (this.bossModel) {
        this.actorGroup.remove(this.bossModel.group);
        this.actorGroup.remove(this.bossModel.shadow);
        this.bossModel = null;
      }
    }
    _ensureActorScene() {
      if (this.playerModel && !this.playerModel.group.parent) this.actorGroup.add(this.playerModel.group);
      if (this.playerModel && !this.playerModel.shadow.parent) this.actorGroup.add(this.playerModel.shadow);
    }

    _tint(mats, color, amount) {
      for (const m of mats) {
        if (!m) continue;
        if (!m.userData.baseEmissive) m.userData.baseEmissive = m.emissive ? m.emissive.clone() : new THREE.Color(0);
        if (amount > 0 && m.emissive) {
          m.emissive.copy(m.userData.baseEmissive).lerp(new THREE.Color(color), amount);
          m.emissiveIntensity = Math.max(m.userData.baseEI || 1, amount * 1.4);
        } else if (m.emissive) {
          m.emissive.copy(m.userData.baseEmissive);
          if (m.userData.baseEI !== undefined) m.emissiveIntensity = m.userData.baseEI;
        }
      }
    }

    /* ==================== 同步 & 渲染 ==================== */
    renderTitle(time, reduced) {
      if (this.failed) return;
      this.setVisible(true);
      this.lastTime = time;
      this.buildStage('title', 3000, { title: true });
      this._updateWeather(.016, 10);
      this._updateSky(.016, 10);
      this.currentCamX = 10;
      this.updateEnvironment(.016, this.game, 'title');
      const fake = {
        x: 1140, y: 850, vx: 0, facing: 1, state: 'idle', stateT: time % 3, animTime: time,
        onGround: true, blinkOffset: 1.2, hurtFlash: 0, attackIndex: 0, hp: 1, maxHp: 1, focus: 0
      };
      this.updatePlayer(fake, time);
      if (this.titleBoss) this.updateBoss(this.titleBoss, { x: 1750, y: 850, phase: 1, state: 'idle', stateT: time, facing: -1, hurtFlash: 0, dead: false, deathT: 0, pattern: null, patternT: 0 }, time);
      this.camera.position.set(10.0 + Math.sin(time * .03) * .1, 4.45, 12.4);
      this.camera.lookAt(10.0, 1.95, 0);
      this._renderFrame();
    }

    renderWorld(game, shakeX, shakeY) {
      if (this.failed) return;
      const now = performance.now() / 1000;
      const dt = Math.min(.05, Math.max(.001, now - this.lastTime));
      this.lastTime = now; this.lastDelta = dt;
      const level = game.level;
      if (!level) { this.setVisible(false); return; }
      this.setVisible(true);
      this.buildStage(level.theme, level.width, {});
      const camX = (game.camera.x || 960) / PX;
      const camZ = (game.camera.z !== undefined ? game.camera.z : (game.player ? game.player.z : 0)) / PX;
      const dist = 12.2;
      const yaw = this.orbit ? this.orbit.yaw : 0;
      const pitch = this.orbit ? this.orbit.pitch : 0;
      this.camera.position.set(camX + Math.sin(yaw) * dist + (shakeX || 0) / 120, Math.max(1.35, 4.45 + pitch + (shakeY || 0) / 110), camZ + Math.cos(yaw) * dist);
      this.camera.lookAt(camX, 1.95, camZ);
      this.currentCamX = camX;
      this._updateSky(dt, camX);
      this._updateWeather(dt, camX);
      this.updateEnvironment(dt, game, level.theme);
      this.updatePlayer(game.player, game.time);
      this.updateBossModel(game, now);
      this.updateEnemies(game, now);
      this.updateProjectiles(game);
      this.updateHazards(game);
      this.updateSecrets(game);
      if (this.updateInteractables3D) this.updateInteractables3D(game);
      this._renderFrame();
    }

    _closestTarget(p, game) {
      let best = null, bd = 700;
      if (game.boss && !game.boss.dead) { const d = Math.hypot(game.boss.x - p.x, (game.boss.z || 0) - p.z); if (d < bd) { bd = d; best = game.boss; } }
      for (const e of game.enemies) { if (e.dead) continue; const d = Math.hypot(e.x - p.x, (e.z || 0) - p.z); if (d < bd) { bd = d; best = e; } }
      return best;
    }

    updatePlayer(p, t) {
      if (!p || !this.playerModel) return;
      const m = this.playerModel;
      const g = m.group;
      g.position.set(toX(p.x), toY(p.y), (p.z || 0) / PX);
      let targetYaw = this.orbit ? this.orbit.yaw : .08;
      const near = this._closestTarget ? this._closestTarget(p, this.game) : null;
      if (p.state === 'attack' || p.state === 'skill' || p.state === 'deflect') {
        if (near) targetYaw = Math.atan2(near.x - p.x, (near.z || 0) - p.z);
      } else if (Math.hypot(p.vx || 0, p.vz || 0) > 35) {
        targetYaw = Math.atan2(p.vx, p.vz);
      }
      if (m.faceYaw === undefined) m.faceYaw = targetYaw;
      let diff = Math.atan2(Math.sin(targetYaw - m.faceYaw), Math.cos(targetYaw - m.faceYaw));
      m.faceYaw += diff * Math.min(1, 10 * (this.lastDelta || .016));
      g.rotation.y = m.faceYaw;
      if (m.slash) m.slash.rotation.y = -m.faceYaw;
      const st = p.state || 'idle';
      const run = (st === 'run' || (Math.abs(p.vx) > 50 && p.onGround && !['attack', 'dodge', 'skill', 'hurt', 'ultimate', 'dead'].includes(st)));
      const anim = p.animTime || t;
      const bob = Math.sin(t * 2.2) * .012 + (run ? Math.abs(Math.sin(anim * 12)) * .035 : 0);
      m.body.position.y = bob;
      m.head.rotation.z = Math.sin(t * 1.3) * .025;
      m.head.rotation.x = st === 'hurt' ? -.12 : 0;
      m.legL.rotation.x = run ? Math.sin(anim * 12) * .55 : (st === 'jump' || st === 'fall' ? -.25 : 0);
      m.legR.rotation.x = run ? -Math.sin(anim * 12) * .55 : (st === 'jump' || st === 'fall' ? .25 : 0);
      m.armL.rotation.z = -.12 + (run ? Math.sin(anim * 12) * .28 : Math.sin(t * 1.7) * .05);
      m.armR.rotation.z = .12 - (run ? Math.sin(anim * 12) * .28 : Math.sin(t * 1.7) * .05);
      m.armR.rotation.x = -.15;
      m.sword.rotation.x = -.16;
      m.sword.rotation.z = .35;
      m.tails.forEach((tail, i) => {
        tail.group.rotation.z = tail.side * (.18 + Math.sin(t * 2.1 + i) * .08);
        tail.group.rotation.x = Math.sin(t * 1.7 + i) * .07;
      });
      m.ahoge.rotation.z = Math.sin(t * 2.6) * .18;
      const blink = ((t + (p.blinkOffset || 0) * .31) % 4.5) < .12;
      m.eyes.forEach(e => e.scale.y = blink ? .12 : 1);
      m.pet.position.set(1.04 + Math.sin(t * 1.3) * .08, 1.42 + Math.sin(t * 2.4) * .055, .42 + Math.cos(t * 1.1) * .03);
      m.pet.rotation.z = Math.sin(t * 2.1) * .08;
      m.pet.rotation.y = Math.sin(t * .9) * .2;
      m.aura.material.opacity = .06 + (p.focus >= 100 ? .07 : 0);
      m.aura.scale.setScalar(2.5 + Math.sin(t * 2) * .1);
      // jump shadow
      const jump = Math.max(0, (850 - p.y) / 100);
      m.shadow.position.set(toX(p.x), .012, (p.z || 0) / PX);
      m.shadow.scale.setScalar(Math.max(.35, 1 - jump * .2));
      // sword / attack
      let attackActive = false, attackProgress = 0;
      if (st === 'attack') {
        const dur = [.32, .34, .5][Math.min(2, p.attackIndex)] || .34;
        attackProgress = U.clamp((p.stateT || 0) / dur, 0, 1);
        const wind = .2;
        const swing = U.easeOutCubic(U.clamp((attackProgress - wind) / (.55 - wind), 0, 1));
        m.armR.rotation.z = .55 - swing * 2.3;
        m.armR.rotation.x = -.4 + Math.sin(attackProgress * Math.PI) * .5;
        m.sword.rotation.z = -.8 + swing * 2.2;
        m.sword.rotation.x = -.3;
        attackActive = attackProgress > .12 && attackProgress < .8;
        m.slash.rotation.z = -1.8 + swing * 3.2;
        m.slash.material.opacity = attackActive ? .8 * Math.sin(U.clamp((attackProgress - .1) / .7, 0, 1) * Math.PI) : 0;
        m.slash.visible = attackActive;
        m.body.rotation.z = -.08 - swing * .08;
      } else if (st === 'skill') {
        m.armR.rotation.z = -.9; m.armL.rotation.z = .9;
        m.sword.rotation.z = -.15;
        m.body.rotation.z = 0;
        m.slash.visible = false;
      } else if (st === 'dodge') {
        m.body.rotation.z = -.28;
        m.body.position.x = -.08;
      } else if (st === 'hurt') {
        m.body.rotation.z = .12;
        m.group.position.x += Math.sin(t * 90) * .018;
      } else if (st === 'ultimate') {
        m.body.rotation.z = 0;
        m.group.position.y += .04 + Math.sin(t * 3) * .02;
        m.armR.rotation.z = -1.7;
        m.sword.rotation.z = .1;
        m.aura.material.opacity = .18;
        m.aura.scale.setScalar(3.5);
      } else if (st === 'victory') {
        m.armR.rotation.z = -2.0;
        m.sword.rotation.z = .1;
        m.body.rotation.z = 0;
      } else {
        m.body.rotation.z = 0;
        m.body.position.x = 0;
        m.slash.visible = false;
      }
      if (st !== 'attack') { m.body.rotation.z = st === 'dodge' ? -.28 : 0; m.slash.visible = false; }
      if (st === 'hurt') m.body.rotation.z = .12;
      // tint
      this._tint(m.mats, 0xff6d63, p.hurtFlash > 0 ? Math.min(.7, p.hurtFlash * 4) : 0);
      m.group.visible = true;
    }

    updateBossModel(game, t) {
      if (!this.bossModel) {
        if (game.boss) this._buildBoss();
      }
      const b = game.boss;
      if (!b || !this.bossModel) {
        if (this.bossModel) { this.bossModel.group.visible = false; this.bossModel.shadow.visible = false; }
        return;
      }
      const m = this.bossModel;
      m.group.visible = !(b.dead && b.deathT > 2.8);
      m.group.position.set(toX(b.x), toY(b.y), (b.z || 0) / PX);
      m.group.rotation.y = .08;
      m.head.rotation.z = Math.sin(t * 1.2) * .02;
      m.body.position.y = Math.sin(t * 1.5) * .02;
      m.horns.visible = (b.phase || 1) >= 2;
      m.armR.rotation.x = -.15;
      m.armL.rotation.z = .15;
      m.sword.rotation.z = -.42;
      m.sword.rotation.x = -.1;
      m.cape.rotation.x = .08 + Math.sin(t * 1.4) * .04;
      if (b.state === 'windup') {
        m.armR.rotation.z = -.75;
        m.sword.rotation.z = -.9;
        m.aura.material.opacity = .14;
      } else if (b.state === 'attack' || b.state === 'dash') {
        const k = Math.min(1, (b.stateT || 0) / .25);
        m.armR.rotation.z = -.75 + k * 2.1;
        m.sword.rotation.z = +.75;
        m.body.rotation.z = -.09;
      } else if (b.state === 'stagger') {
        m.body.rotation.z = .12;
      } else if (b.state === 'transition') {
        m.group.position.y += .12 + Math.sin(t * 2) * .03;
        m.aura.material.opacity = .22;
      } else if (b.state === 'dead') {
        m.group.position.y -= Math.min(1.2, (b.deathT || 0) * .35);
        m.body.rotation.z = -.2;
      }
      if (b.state !== 'transition' && b.state !== 'dead') m.aura.material.opacity = .08 + (b.phase === 2 ? .07 : b.phase === 3 ? .12 : 0);
      m.aura.scale.setScalar(4.4 + Math.sin(t * 2.2) * .2);
      const deadFade = b.dead ? U.clamp(1 - (b.deathT || 0) / 2.7, 0, 1) : 1;
      m.group.traverse(o => {
        if (o.isMesh && o.material && o.material.transparent === false) { o.material.transparent = true; }
        if (o.isMesh && o.material) o.material.opacity = deadFade;
        if (o.isSprite && o.material) o.material.opacity = (o === m.aura ? (b.phase === 2 ? .15 : b.phase === 3 ? .2 : .08) : .16) * deadFade;
      });
      this._tint(m.mats, 0xff7562, b.hurtFlash > 0 ? Math.min(.55, b.hurtFlash * 4) : 0);
      m.shadow.position.set(toX(b.x), .012, 0);
      m.shadow.visible = !b.dead;
    }

    updateEnemies(game, t) {
      const seen = new Set();
      for (const e of game.enemies) {
        if (e.dead && e.deathT > 1.2) continue;
        seen.add(e.id);
        let m = this.enemyModels.get(e.id);
        if (!m) { m = this._buildEnemyModel(e); this.enemyModels.set(e.id, m); }
        const g = m.group;
        g.position.set(toX(e.x), toY(e.y), (e.z || 0) / PX);
        g.rotation.y = Math.atan2((game.player ? game.player.x - e.x : 1), (game.player ? (game.player.z || 0) - (e.z || 0) : 0)) * .35;
        const dead = e.dead;
        let bob = Math.sin(t * 2.2 + (e.seed || 0)) * (m.bob || .04);
        if (m.fly) bob += Math.sin(t * 3 + (e.seed || 0)) * .12;
        g.position.y += bob;
        if (dead) {
          const k = U.clamp(e.deathT / 1.2, 0, 1);
          g.position.y += k * .3;
          g.scale.setScalar(Math.max(.02, (m.baseScale || 1.42) * (1 - k)));
          g.rotation.z = k * .8;
        } else g.scale.setScalar(m.baseScale || 1.42);
        if (e.state === 'windup') {
          g.position.x += Math.sin(t * 35) * .012;
          g.rotation.y += Math.sin(t * 10) * .04;
        }
        if (e.type === 'crow' && m.wings) {
          m.wings[0].rotation.z = .3 + Math.sin(t * 11) * .6;
          m.wings[1].rotation.z = -.3 - Math.sin(t * 11) * .6;
        }
        if (m.wings) { /* handled */ }
        this._tint(m.mats, 0xff8d7e, e.hurtFlash > 0 ? Math.min(.6, e.hurtFlash * 4) : 0);
        m.shadow.position.set(toX(e.x), .012, 0);
        m.shadow.visible = !dead;
        for (const child of g.children) if (child.isSprite && !dead) child.material.opacity = (child.material.opacity || .2) * .98;
      }
      for (const [id, m] of this.enemyModels) {
        if (!seen.has(id)) {
          this.actorGroup.remove(m.group); this.actorGroup.remove(m.shadow);
          this.enemyModels.delete(id);
        }
      }
    }

    updateProjectiles(game) {
      const seen = new Set();
      for (const p of game.projectiles) {
        if (p.dead) continue;
        seen.add(p);
        let m = this.projectileModels.get(p);
        if (!m) {
          const isPlayer = p.owner === 'player';
          const tex = p.kind === 'playerWave' ? this.tex.crescentCyan : p.kind === 'bossWave' ? this.tex.crescentRed : isPlayer ? this.tex.glowCyan : p.kind === 'bossOrb' ? this.tex.glowRed : this.tex.glowCyan;
          const color = isPlayer ? 0x9af5ff : p.kind === 'bossOrb' ? 0xff7257 : 0xffb08c;
          const s = this._sprite(this.dynamicGroup, tex, color, 0, 0, .4, .9, .55, .9, true);
          if (p.kind === 'enemyBolt' || p.kind === 'bossOrb') s.scale.set(0.4, 0.4, 1);
          m = s;
          this.projectileModels.set(p, m);
        }
        m.position.set(toX(p.x), toY(p.y), (p.z || 0) / PX + .35);
        m.material.opacity = .9;
      }
      for (const [p, m] of this.projectileModels) {
        if (!seen.has(p) || p.dead) {
          this.dynamicGroup.remove(m);
          this.projectileModels.delete(p);
        }
      }
    }

    updateHazards(game) {
      const seen = new Set();
      for (const h of game.hazards) {
        if (h.dead) continue;
        seen.add(h);
        let m = this.hazardModels.get(h);
        if (!m) {
          const g = new THREE.Group();
          const ringMat = new THREE.MeshBasicMaterial({ color: h.kind === 'fire' ? 0xff7c59 : 0xffca8e, transparent: true, opacity: .2, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
          const ring = this._mesh(g, new THREE.RingGeometry(.38, 1, 32), ringMat, 0, .02, 0, 1, 1, 1, -Math.PI / 2, 0, 0);
          const flameMat = this._std(h.kind === 'fire' ? 0xff653f : 0xffb36e, { emissive: 0xff3c22, ei: .7, transparent: true, opacity: .65, flat: true });
          const flames = [];
          if (h.kind === 'fire') {
            for (let i = 0; i < 6; i++) flames.push(this._mesh(g, new THREE.ConeGeometry(.16, .8, 4), flameMat, U.rand(-.7, .7), .4, U.rand(-.25, .25), 1, 1, 1, 0, 0, U.rand(-.2, .2)));
          } else {
            for (let i = 0; i < 3; i++) flames.push(this._mesh(g, new THREE.ConeGeometry(.12, 1.2, 4), flameMat, (i - 1) * .28, .6, 0, 1, 1, 1, 0, 0, U.rand(-.1, .1)));
          }
          flames.forEach(f => f.visible = false);
          this.dynamicGroup.add(g);
          m = { group: g, ring, flames, ringMat, flameMat };
          this.hazardModels.set(h, m);
        }
        m.group.position.set(toX(h.x), 0, (h.z || 0) / PX);
        const width = (h.w / 100) * 1.15;
        m.ring.scale.set(width, width * (.55 + (h.h / 100) * 2), 1);
        const active = h.timer > h.delay;
        m.ring.material.opacity = active ? .32 : (.12 + U.clamp(h.timer / h.delay, 0, 1) * .18);
        m.flames.forEach((f, i) => { f.visible = active; f.scale.y = .7 + Math.sin(this.lastTime * 5 + i) * .2; });
      }
      for (const [h, m] of this.hazardModels) {
        if (!seen.has(h) || h.dead) { this.dynamicGroup.remove(m.group); this.hazardModels.delete(h); }
      }
    }

    updateBoss(model, b, t) {
      // title boss animation only
      model.group.position.y = 0;
      model.head.rotation.z = Math.sin(t * 1.2) * .02;
      model.cape.rotation.x = .08 + Math.sin(t * 1.4) * .04;
      model.sword.rotation.z = -.42;
      model.aura.material.opacity = .06;
    }

    /* ==================== 场景标题 ==================== */
    buildTitle() { this.buildStage('title', 3000, { title: true }); }
  }

  window.ThreeWorld = ThreeWorld;
  window.ThreeHelpers = { toX, toY, PALETTES };
})();
