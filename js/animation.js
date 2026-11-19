/* 三中风云 — 玩家 AnimationMixer 状态机 */
(function () {
  'use strict';
  if (!window.THREE || !window.ThreeWorld) return;
  const THREE = window.THREE;
  const T = window.ThreeWorld.prototype;

  function setup(m) {
    if (!m || !m.group || m.mixer) return;
    m.body.name = 'body'; m.head.name = 'head';
    m.armL.name = 'armL'; m.armR.name = 'armR';
    m.legL.name = 'legL'; m.legR.name = 'legR';
    m.sword.name = 'sword';

    const N = (name, times, values) => new THREE.NumberKeyframeTrack(name, times, values);
    const idle = new THREE.AnimationClip('idle', 2, [
      N('body.position[y]', [0, 1, 2], [0, .018, 0]),
      N('head.rotation[z]', [0, 1, 2], [-.012, .025, -.012]),
      N('head.rotation[x]', [0, 1, 2], [0, .018, 0]),
      N('armL.rotation[z]', [0, 1, 2], [-.12, -.07, -.12]),
      N('armR.rotation[z]', [0, 1, 2], [.12, .17, .12]),
      N('armL.rotation[x]', [0, 1, 2], [0, -.05, 0]),
      N('armR.rotation[x]', [0, 1, 2], [-.16, -.12, -.16])
    ]);
    const run = new THREE.AnimationClip('run', .6, [
      N('body.position[y]', [0, .15, .3, .45, .6], [0, .035, 0, .035, 0]),
      N('head.rotation[z]', [0, .3, .6], [.02, -.02, .02]),
      N('legL.rotation[x]', [0, .15, .3, .45, .6], [0, .6, 0, -.6, 0]),
      N('legR.rotation[x]', [0, .15, .3, .45, .6], [0, -.6, 0, .6, 0]),
      N('armL.rotation[x]', [0, .15, .3, .45, .6], [0, -.42, 0, .42, 0]),
      N('armR.rotation[x]', [0, .15, .3, .45, .6], [0, .42, 0, -.42, 0]),
      N('armL.rotation[z]', [0, .3, .6], [-.2, -.05, -.2]),
      N('armR.rotation[z]', [0, .3, .6], [.2, .05, .2])
    ]);
    const attack = new THREE.AnimationClip('attack', .5, [
      N('body.rotation[z]', [0, .12, .3, .5], [0, -.09, .08, 0]),
      N('body.position[x]', [0, .12, .3, .5], [0, .06, .1, 0]),
      N('armR.rotation[z]', [0, .12, .3, .5], [.55, -.85, -2.35, .55]),
      N('armR.rotation[x]', [0, .12, .3, .5], [-.15, -.5, .35, -.15]),
      N('sword.rotation[z]', [0, .12, .3, .5], [.35, -.4, .9, .35]),
      N('legL.rotation[x]', [0, .3, .5], [0, -.18, 0]),
      N('legR.rotation[x]', [0, .3, .5], [0, .18, 0])
    ]);
    const dodge = new THREE.AnimationClip('dodge', .35, [
      N('body.rotation[z]', [0, .14, .35], [0, -.34, 0]),
      N('body.position[x]', [0, .14, .35], [0, -.1, 0]),
      N('legL.rotation[x]', [0, .35], [-.3, 0]),
      N('legR.rotation[x]', [0, .35], [.3, 0])
    ]);
    const deflect = new THREE.AnimationClip('deflect', .4, [
      N('body.rotation[z]', [0, .1, .4], [0, .1, 0]),
      N('armR.rotation[z]', [0, .08, .4], [.2, -1.6, .2]),
      N('armR.rotation[x]', [0, .2, .4], [-.2, .35, -.2]),
      N('sword.rotation[z]', [0, .08, .4], [.2, 1.35, .2])
    ]);
    const loops = { idle: THREE.LoopRepeat, run: THREE.LoopRepeat, attack: THREE.LoopOnce, dodge: THREE.LoopOnce, deflect: THREE.LoopOnce };
    m.mixer = new THREE.AnimationMixer(m.group);
    m.actions = {};
    for (const clip of [idle, run, attack, dodge, deflect]) {
      const a = m.mixer.clipAction(clip);
      a.setLoop(loops[clip.name], (clip.name === 'idle' || clip.name === 'run') ? Infinity : 1);
      a.clampWhenFinished = !(clip.name === 'idle' || clip.name === 'run');
      m.actions[clip.name] = a;
    }
    m.animName = 'idle'; m.actionKey = 'idle'; m.actions.idle.play();
  }

  function play(m, name, attackIndex, dt) {
    if (!m || !m.mixer) return;
    const key = name + (name === 'attack' ? attackIndex : '');
    if (m.actionKey !== key) {
      const prev = m.actions[m.animName];
      const next = m.actions[name];
      if (prev && prev !== next) prev.fadeOut(.12);
      if (next) next.reset().setEffectiveWeight(1).fadeIn(.12).play();
      m.animName = name; m.actionKey = key;
    }
    m.mixer.update(dt);
  }

  const origBuild = T._buildPlayer;
  T._buildPlayer = function () {
    const r = origBuild.apply(this, arguments);
    setup(this.playerModel);
    return r;
  };

  const origUpdate = T.updatePlayer;
  T.updatePlayer = function (p, t) {
    origUpdate.apply(this, arguments);
    if (!p || !this.playerModel) return;
    const m = this.playerModel;
    const st = p.state || 'idle';
    const moving = Math.hypot(p.vx || 0, p.vz || 0) > 35 || st === 'run';
    const name = st === 'dodge' ? 'dodge' : st === 'deflect' ? 'deflect' : st === 'attack' ? 'attack' : moving ? 'run' : 'idle';
    play(m, name, p.attackIndex || 0, this.lastDelta || .016);
  };

  window.PlayerAnimation = { setup, play };
})();
