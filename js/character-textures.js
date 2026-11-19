/* 本地角色贴图加载器（沙盒模式）
 * 文件位于 images/，默认被 .gitignore 忽略，不会上传。
 * 有贴图就用贴图；缺失/加载失败时返回 false，由原绘制逻辑兜底。
 */
(function () {
  'use strict';
  const FILES = {
    player: 'images/player.png',
    squirrel: 'images/npc-squirrel.png',
    'npc-security': 'images/npc-security.png',
    'npc-luoruoyu': 'images/npc-luoruoyu.png',
    'npc-zhoudi': 'images/npc-zhoudi.png',
    'npc-liliyan': 'images/npc-liliyan.png',
    'npc-shenzhiwei': 'images/npc-shenzhiwei.png',
    'npc-wenqixin': 'images/npc-wenqixin.png',
    'npc-director': 'images/npc-director.png',
    'npc-dormkeeper': 'images/npc-dormkeeper.png',
    'npc-qinxiangnuan': 'images/npc-qinxiangnuan.png',
    'npc-canteen': 'images/npc-canteen.png',
    'npc-songtaotao': 'images/npc-songtaotao.png',
    'npc-zhengchongfeng': 'images/npc-zhengchongfeng.png',
    'npc-sumelody': 'images/npc-sumelody.png',
    'npc-librarian': 'images/npc-librarian.png',
    'npc-konghuaigu': 'images/npc-konghuaigu.png'
  };
  const cache = {};
  const failed = {};

  function load(key, src) {
    const img = new Image();
    img.onload = () => {
      const sheet = img.width >= img.height * 1.2 && img.width % 4 === 0;
      cache[key] = {
        img, sheet,
        cols: sheet ? 4 : 1,
        rows: sheet ? 2 : 1,
        fw: sheet ? img.width / 4 : img.width,
        fh: sheet ? img.height / 2 : img.height
      };
    };
    img.onerror = () => { failed[key] = true; };
    img.src = src;
  }

  function loadAll() {
    for (const key of Object.keys(FILES)) if (!cache[key] && !failed[key]) load(key, FILES[key]);
  }

  function get(key) { return cache[key] || null; }

  function draw(ctx, key, x, gy, scale, facing, walking, phase) {
    const t = cache[key];
    if (!t) return false;
    const h = 158 * (scale || 1);
    const w = h * (t.fw / t.fh);
    let sx = 0, sy = 0;
    if (t.sheet) {
      const col = walking ? Math.floor((phase || 0) / (Math.PI / 2)) % 4 : Math.floor(performance.now() / 420) % 4;
      const row = walking ? 1 : 0;
      sx = col * t.fw; sy = row * t.fh;
    }
    ctx.save();
    ctx.translate(x, gy);
    // 脚下阴影
    ctx.fillStyle = 'rgba(3,10,14,.26)';
    ctx.beginPath(); ctx.ellipse(0, 1, w * .22, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.scale(facing || 1, 1);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(t.img, sx, sy, t.fw, t.fh, -w / 2, -h, w, h);
    ctx.restore();
    return true;
  }

  window.CharacterTextures = { loadAll, get, draw, files: FILES };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAll);
  else loadAll();
})();
