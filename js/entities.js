/* 三中风云 — 角色、敌人、Boss 与战斗实体 */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const GROUND = 850;

  const ENEMY_TYPES = {
    inkling: { hp: 95, size: 78, speed: 168, damage: 12, range: 112, windup: .52, active: .17, recover: .62, name: '墨傀' },
    paper:   { hp: 75, size: 80, speed: 112, damage: 10, range: 500, windup: .72, active: .12, recover: .82, name: '纸傀', ranged: true },
    shield:  { hp: 230, size: 100, speed: 76, damage: 20, range: 125, windup: .82, active: .22, recover: .92, name: '铜甲武卒', armor: true },
    fox:     { hp: 125, size: 72, speed: 300, damage: 14, range: 145, windup: .42, active: .18, recover: .52, name: '影狐' },
    crow:    { hp: 85, size: 62, speed: 185, damage: 12, range: 300, windup: .55, active: .2, recover: .7, name: '机关鸦', flying: true },
    scholar: { hp: 300, size: 88, speed: 150, damage: 14, range: 480, windup: .7, active: .12, recover: .7, name: '眼镜学霸', ranged: true },
    athlete: { hp: 460, size: 108, speed: 125, damage: 24, range: 148, windup: .82, active: .2, recover: .9, name: '体育生·佐藤', armor: true },
    elite:   { hp: 760, size: 150, speed: 145, damage: 22, range: 175, windup: .72, active: .2, recover: .8, name: '心障', isElite: true }
  };

  const ELITE_NAMES = {
    snow: '灯影 · 雪傀',
    sword: '无面剑客',
    paper: '执念 · 纸岚'
  };

  class Player {
    constructor(game, x, y) {
      this.game = game;
      const m = game.mods || {};
      this.x = x; this.y = y; this.z = 0; this.vx = 0; this.vy = 0; this.vz = 0;
      this.facing = 1;
      this.onGround = true;
      this.maxHp = 160 + (m.maxHp || 0);
      this.hp = this.maxHp;
      this.maxQi = 100; this.qi = 100;
      this.focus = 0;
      this.maxFlasks = 3 + (m.flasks || 0); this.flasks = this.maxFlasks;
      this.speed = 430 * (m.moveSpeed || 1);
      this.speedBuff = 1;
      this.state = 'idle'; this.stateT = 0; this.animTime = 0;
      this.attackIndex = 0; this.attackQueued = false; this.attackHits = new Set();
      this.jumpBuffer = 0; this.coyote = 0; this.jumps = 0;
      this.dashCd = 0; this.dashMaxCd = 1.0 * (m.dashCd || 1); this.dashDist = 1.0 * (m.dashDist || 1);
      this.skillCd = 0; this.skillMaxCd = 4.6 * (m.skillCd || 1);
      this.invuln = 0; this.perfectWindow = 0; this.perfectUsed = false;
      this.maxPosture = 100; this.posture = 100; this.deflectCd = 0; this.deflectWindow = 0; this.deflectSuccess = false;
      this.staggered = 0; this.dashVZ = 0; this.aimYaw = 0;
      this.hurtFlash = 0; this.hpFlash = 0;
      this.blinkOffset = Math.random() * 4;
      this.afterimages = [];
      this.dead = false; this.deathT = 0;
      this.ultBurstDone = false;
      this.trailT = 0;
      this.lastHurtBy = '';
      this.damageDealt = 0;
      this.perfectCount = 0;
      this.flaskUsed = 0;
    }

    setState(s) { this.state = s; this.stateT = 0; }

    addFocus(v) { this.focus = U.clamp(this.focus + v, 0, 100); }

    update(dt, game) {
      this.animTime += dt;
      this.stateT += dt;
      this.invuln = Math.max(0, this.invuln - dt);
      this.hurtFlash = Math.max(0, this.hurtFlash - dt);
      this.hpFlash = Math.max(0, this.hpFlash - dt * 2);
      this.dashCd = Math.max(0, this.dashCd - dt);
      this.skillCd = Math.max(0, this.skillCd - dt);
      this.perfectWindow = Math.max(0, this.perfectWindow - dt);
      this.deflectCd = Math.max(0, this.deflectCd - dt);
      this.deflectWindow = Math.max(0, this.deflectWindow - dt);
      this.staggered = Math.max(0, this.staggered - dt);
      if (this.state !== 'hurt' && this.state !== 'ultimate') this.posture = Math.min(this.maxPosture, this.posture + 7 * dt);
      this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
      this.coyote = Math.max(0, this.coyote - dt);
      this.qi = Math.min(this.maxQi, this.qi + (2.5 + (game.mods.qiRegen || 0)) * dt);

      for (let i = this.afterimages.length - 1; i >= 0; i--) {
        this.afterimages[i].life -= dt;
        if (this.afterimages[i].life <= 0) this.afterimages.splice(i, 1);
      }

      if (this.dead) { this.deathT += dt; return; }

      const input = game.input;
      if (this.onGround) this.coyote = .1;
      if (input.justPressed('jump')) this.jumpBuffer = .14;

      // 状态计时 / 转换
      if (this.state === 'hurt' && this.stateT > .34) this.setState('idle');
      if (this.state === 'deflect' && this.stateT > .34) this.setState('idle');
      if (this.state === 'staggered' && this.stateT > .9) this.setState('idle');
      if (this.state === 'heal' && this.stateT > .6) this.setState('idle');
      if (this.state === 'dodge' && this.stateT > .25) this.setState('idle');
      if (this.state === 'skill' && this.stateT > .66) this.setState('idle');
      if (this.state === 'ultimate' && this.stateT > 2.2) this.setState('idle');
      if (this.state === 'attack') this._updateAttack(game);
      if (this.state === 'ultimate') this._updateUltimate(game);

      const canAct = !['hurt', 'ultimate', 'dead', 'staggered'].includes(this.state);
      if (canAct) {
        // 闪身可打断大部分动作
        if (input.justPressed('dodge') && this.dashCd <= 0 && this.state !== 'dodge') this._startDash(game);
        else if (input.justPressed('deflect') && this.deflectCd <= 0 && this.state !== 'dodge' && this.state !== 'skill') this._startDeflect(game);
        else if (input.justPressed('heal') && this.flasks > 0 && this.hp < this.maxHp && this.state !== 'dodge') this._heal(game);
        else if (input.justPressed('ultimate') && this.focus >= 100) this._startUltimate(game);
        else if (input.justPressed('skill') && this.qi >= 25 && this.skillCd <= 0 && this.state !== 'dodge' && this.state !== 'skill') this._startSkill(game);
        else if (input.justPressed('attack')) this._tryAttack(game);
      }

      // 全向移动：WASD 相对镜头方向
      const yaw = (game.three && game.three.orbit) ? game.three.orbit.yaw : 0;
      const fwd = (input.isDown('forward') ? 1 : 0) - (input.isDown('back') ? 1 : 0);
      const strafe = (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0);
      let dirX = -Math.sin(yaw) * fwd + Math.cos(yaw) * strafe;
      let dirZ = -Math.cos(yaw) * fwd - Math.sin(yaw) * strafe;
      const dLen = Math.hypot(dirX, dirZ) || 1;
      dirX /= dLen; dirZ /= dLen;
      const canMove = !['attack', 'dodge', 'hurt', 'ultimate', 'dead', 'deflect', 'staggered'].includes(this.state);
      if (canMove) {
        const accel = this.onGround ? 22 : 11;
        const moveScale = this.state === 'skill' ? .32 : this.state === 'heal' ? .35 : 1;
        const inv = game.inputInvert ? -1 : 1;
        const targetX = (fwd || strafe ? dirX : 0) * this.speed * this.speedBuff * moveScale * inv;
        const targetZ = (fwd || strafe ? dirZ : 0) * this.speed * this.speedBuff * moveScale * inv;
        this.vx = U.damp(this.vx, targetX, accel, dt);
        this.vz = U.damp(this.vz, targetZ, accel, dt);
        if (strafe || fwd) {
          this.facing = dirX >= 0 ? 1 : -1;
          this.lastDirX = dirX; this.lastDirZ = dirZ;
        }
      } else if (this.state === 'dodge') {
        this.vx = this.dashVX || this.facing * 1400 * this.dashDist;
        this.vz = this.dashVZ || 0;
        if (Math.random() < .55) this.afterimages.push({ x: this.x, y: this.y, z: this.z, life: .2, facing: this.facing, state: 'dodge', stateT: .1, attackIndex: 0, animTime: this.animTime, focus: 0, hurtFlash: 0, onGround: true, vx: 0 });
      } else if (this.state === 'attack') {
        this.vx = U.damp(this.vx, 0, 13, dt);
        this.vz = U.damp(this.vz, 0, 13, dt);
      } else if (this.state === 'hurt') {
        this.vx = U.damp(this.vx, 0, 8, dt);
        this.vz = U.damp(this.vz, 0, 8, dt);
      } else {
        this.vx = U.damp(this.vx, 0, 10, dt);
        this.vz = U.damp(this.vz, 0, 10, dt);
      }

      // 跳跃
      if (this.jumpBuffer > 0 && this.state !== 'hurt' && this.state !== 'ultimate' && this.state !== 'dodge') {
        if (this.onGround || this.coyote > 0) {
          this.vy = -1120; this.onGround = false; this.jumps = 1; this.jumpBuffer = 0;
          game.audio.sfx('jump');
          game.spawnBurst(this.x, this.y, '#8beaf4', 7, 120, { size: 2, life: .4, gravity: 400 });
        } else if (this.jumps < 2) {
          this.vy = -1000; this.jumps = 2; this.jumpBuffer = 0;
          game.audio.sfx('jump');
          for (let i = 0; i < 9; i++) game.spawnParticle(this.x + U.rand(-24, 24), this.y - 10, U.rand(-100, 100), U.rand(40, 160), U.rand(.25, .5), 2, '#86eafa', 0, true);
        }
      }
      if (!input.isDown('jump') && this.vy < -360 && !this.onGround) this.vy += 2400 * dt;

      // 重力
      if (!this.onGround || this.vy < 0) {
        this.vy += 2900 * dt;
        this.y += this.vy * dt;
      } else {
        this.vy = 0;
      }
      this.x += this.vx * dt;
      this.z += this.vz * dt;

      // 落地
      const floor = GROUND;
      if (this.y >= floor) {
        if (!this.onGround && this.vy > 500) {
          game.spawnBurst(this.x, floor, 'rgba(213,232,234,.6)', 8, 170, { size: 2.4, life: .4, gravity: 300 });
        }
        this.y = floor; this.vy = 0;
        if (!this.onGround) this.jumps = 0;
        this.onGround = true;
      } else this.onGround = false;

      if (this.onGround && Math.abs(this.vx) > 260 && this.state !== 'attack' && this.state !== 'dodge' && this.state !== 'hurt') {
        this.trailT += dt;
        if (this.trailT > .07) {
          this.trailT = 0;
          game.spawnParticle(this.x - this.facing * 20, this.y - 4, -this.facing * U.rand(20, 75), U.rand(-30, 20), U.rand(.28, .55), U.rand(2, 4.5), 'rgba(199,224,226,.42)', 120, false);
        }
      }

      const left = game.bounds ? game.bounds.left : 10;
      const right = game.bounds ? game.bounds.right : (game.worldWidth || 99999) - 10;
      this.x = U.clamp(this.x, left + 34, right - 34);
      const zb = game.zBounds || { min: -280, max: 280 };
      this.z = U.clamp(this.z, zb.min, zb.max);
      if (this.state === 'idle' || this.state === 'run') {
        this.setState((Math.abs(this.vx) > 25 || Math.abs(this.vz) > 25) ? 'run' : 'idle');
      }
    }

    _tryAttack(game) {
      if (this.state === 'attack') {
        const dur = [.32, .34, .5][Math.min(2, this.attackIndex)] || .34;
        if (this.stateT > .09 && this.attackIndex < 2) this.attackQueued = true;
      } else if (!['hurt', 'dodge', 'skill', 'ultimate', 'heal'].includes(this.state)) {
        this._startAttack(game, 0);
      }
    }

    _startAttack(game, index) {
      this.attackIndex = index;
      this.attackHits = new Set();
      this.attackQueued = false;
      this.setState('attack');
      this.vx = this.facing * (index === 2 ? 230 : 140);
      game.audio.sfx(index === 2 ? 'slashHeavy' : 'slash');
    }

    _updateAttack(game) {
      const dur = [.32, .34, .5][Math.min(2, this.attackIndex)] || .34;
      const pr = this.stateT / dur;
      const activeStart = this.attackIndex === 2 ? .16 : .1;
      const activeEnd = this.attackIndex === 2 ? .38 : .23;
      if (this.stateT > activeStart && this.stateT < activeEnd) {
        const range = this.attackIndex === 2 ? 245 : 195;
        const base = [31, 37, 57][Math.min(2, this.attackIndex)];
        const dmg = base * game.mods.damage * (this.hp / this.maxHp < .35 ? (game.mods.lowHp || 1) : 1);
        if (game.boss && !game.boss.dead) {
          const dx = game.boss.x - this.x, dz = (game.boss.z || 0) - this.z;
          if (Math.hypot(dx, dz) < range + 60 && !this.attackHits.has('boss')) {
            this.attackHits.add('boss');
            game.boss.takeDamage(dmg, this, game);
            game.onPlayerDealtDamage(game.boss, dmg, this, this.attackIndex === 2);
          }
        }
        for (const e of game.enemies) {
          if (e.dead) continue;
          if (this.attackHits.has(e.id)) continue;
          const dx = e.x - this.x, dz = (e.z || 0) - this.z;
          if (Math.hypot(dx, dz) < range) {
            this.attackHits.add(e.id);
            e.takeDamage(dmg, this, game);
            game.onPlayerDealtDamage(e, dmg, this, this.attackIndex === 2);
          }
        }
      }
      if (this.stateT >= dur) {
        if (this.attackQueued && this.attackIndex < 2) {
          this._startAttack(game, this.attackIndex + 1);
        } else {
          this.setState('idle');
          this.attackQueued = false;
        }
      }
    }

    _startDash(game) {
      this.setState('dodge');
      this.dashCd = this.dashMaxCd;
      this.invuln = .3;
      this.perfectWindow = .2 * (game.mods.perfectWindow || 1);
      this.perfectUsed = false;
      const yaw = (game.three && game.three.orbit) ? game.three.orbit.yaw : 0;
      let dx = this.vx, dz = this.vz;
      if (Math.hypot(dx, dz) < 20) { dx = -Math.sin(yaw); dz = -Math.cos(yaw); }
      const l = Math.hypot(dx, dz) || 1;
      this.dashVX = dx / l * 1400 * this.dashDist;
      this.dashVZ = dz / l * 1400 * this.dashDist;
      this.vx = this.dashVX; this.vz = this.dashVZ; this.vy = 0;
      this.afterimages.push({ x: this.x, y: this.y, z: this.z, life: .24, facing: this.facing, state: 'dodge', stateT: .1, attackIndex: 0, animTime: this.animTime, focus: 0, hurtFlash: 0, onGround: true, vx: 0 });
      game.audio.sfx('dash');
      game.spawnBurst(this.x, this.y - 70, '#7ce9f5', 10, 190, { size: 2.5, life: .35, gravity: 0 });
    }

    _startDeflect(game) {
      this.setState('deflect');
      this.deflectCd = .85;
      this.deflectWindow = .24 * (game.mods.deflectWindow || 1);
      this.deflectSuccess = false;
      this.vx = 0; this.vz = 0;
      game.audio.sfx('warn');
      game.addShake(2);
      for (let i = 0; i < 8; i++) game.spawnParticle(this.x + U.rand(-20, 20), this.y - U.rand(30, 150), U.rand(-45, 45), U.rand(-70, 20), .35, 2, '#bfefff', 0, true);
    }

    _nearestTarget(game) {
      let best = null, bd = 1e9;
      if (game.boss && !game.boss.dead) {
        const d = Math.hypot(game.boss.x - this.x, (game.boss.z || 0) - this.z);
        if (d < bd) { bd = d; best = game.boss; }
      }
      for (const e of game.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - this.x, (e.z || 0) - this.z);
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    }

    _startSkill(game) {
      this.setState('skill');
      this.qi -= 25;
      this.skillCd = this.skillMaxCd;
      this.vx = 0;
      game.audio.sfx('skill');
      const target = this._nearestTarget(game);
      let ax = target ? target.x - this.x : this.facing * 400;
      let az = target ? (target.z || 0) - this.z : 0;
      if (!target) {
        const yaw = (game.three && game.three.orbit) ? game.three.orbit.yaw : 0;
        ax = -Math.sin(yaw) * 400; az = -Math.cos(yaw) * 400;
      }
      const al = Math.hypot(ax, az) || 1; ax /= al; az /= al;
      this.aimYaw = Math.atan2(ax, az);
      for (let i = 0; i < 3; i++) {
        const sp = 980 + i * 30;
        game.projectiles.push(new Projectile(game, {
          x: this.x + ax * 42,
          y: this.y - 78 - i * 25,
          z: this.z + az * 42,
          vx: ax * sp, vy: (i - 1) * 35, vz: az * sp,
          r: 34, damage: 39 * game.mods.damage * (game.mods.skillDamage || 1),
          kind: 'playerWave', owner: 'player', life: .85, pierce: 3,
          angle: this.facing > 0 ? 0 : Math.PI
        }));
      }
      game.addShake(5);
    }

    _heal(game) {
      this.flasks--;
      this.flaskUsed++;
      this.hp = Math.min(this.maxHp, this.hp + 62);
      this.setState('heal');
      this.invuln = Math.max(this.invuln, .3);
      game.audio.sfx('heal');
      game.addText(this.x, this.y - 220, '+62', '#9ff7ff', 27);
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * TAU;
        game.spawnParticle(this.x + Math.cos(a) * U.rand(8, 45), this.y - U.rand(40, 150), Math.cos(a) * 70, -U.rand(30, 110), U.rand(.5, 1.1), U.rand(2, 5), '#8ff3ff', 0, true);
      }
    }

    _startUltimate(game) {
      this.setState('ultimate');
      this.focus = 0;
      this.ultBurstDone = false;
      this.invuln = 2.3;
      this.vx = 0;
      game.audio.sfx('gong');
      game.onUltimateStart();
    }

    _updateUltimate(game) {
      if (!this.ultBurstDone && this.stateT > .82) {
        this.ultBurstDone = true;
        game.ultimateBurst(this);
      }
    }

    hitBy(damage, sourceX, game, sourceName, sourceEntity) {
      if (this.dead) return false;
      if (this.state === 'dodge' && this.perfectWindow > 0 && !this.perfectUsed) {
        this.perfectUsed = true;
        this.perfectWindow = 0;
        this.invuln = .45;
        this.addFocus(24);
        this.qi = Math.min(this.maxQi, this.qi + 28);
        this.perfectCount++;
        game.onPerfectDodge(this, sourceX);
        return false;
      }
      if (this.state === 'deflect' && this.deflectWindow > 0 && !this.deflectSuccess) {
        this.deflectSuccess = true;
        this.deflectWindow = 0;
        this.invuln = .36;
        this.posture = Math.min(this.maxPosture, this.posture + 22);
        this.addFocus(12);
        this.qi = Math.min(this.maxQi, this.qi + 16 + (game.mods.deflectQi || 0));
        game.onDeflect(this, sourceEntity, sourceX);
        return false;
      }
      if (this.invuln > 0) return false;
      if (game.campusLayer) damage = game.campusLayer.mitigatePhysical(damage, game, sourceX);
      const dmg = Math.max(1, Math.round(damage));
      this.hp -= dmg;
      this.posture = Math.max(0, this.posture - dmg * .55);
      this.hpFlash = .4;
      this.hurtFlash = .16;
      this.invuln = .68;
      this.lastHurtBy = sourceName || '';
      this.setState(this.posture <= 0 ? 'staggered' : 'hurt');
      if (this.posture <= 0) {
        this.staggered = 1.1;
        this.posture = 38;
        this.invuln = Math.max(this.invuln, .9);
        game.addText(this.x, this.y - 230, '气竭', '#ffd47e', 25, { bold: true });
      }
      this.vx = U.sign(this.x - sourceX) * 330;
      this.vz = (this.z - (sourceEntity && sourceEntity.z !== undefined ? sourceEntity.z : 0)) * .8;
      this.vy = -190;
      this.onGround = false;
      game.onPlayerHurt(dmg, sourceName);
      game.addText(this.x, this.y - 210, '-' + dmg, '#ff9086', 24);
      if (this.hp <= 0) {
        this.hp = 0;
        this.die(game);
      }
      return true;
    }

    die(game) {
      if (this.dead) return;
      this.dead = true;
      this.state = 'dead';
      this.stateT = 0;
      this.deathT = 0;
      this.vx = 0;
      game.audio.stopVoice();
      game.audio.sfx('lose');
      game.onPlayerDeath();
    }

    draw(ctx, t) {
      for (const a of this.afterimages) {
        ctx.save(); ctx.globalAlpha = Math.max(0, a.life / .24) * .34;
        Art.drawPlayer(ctx, { ...a, stateT: a.stateT, attackIndex: 0, animTime: a.animTime, focus: 0, hurtFlash: 0, onGround: true, vx: 0, state: 'dodge' }, t, { ghost: true });
        ctx.restore();
      }
      Art.drawPlayer(ctx, this, t);
      // 完美闪身余韵
      if (this.perfectWindow > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        Art.glow(ctx, this.x, this.y - 95, 75, '#b7f9ff', .12);
        ctx.restore();
      }
    }
  }

  class Enemy {
    constructor(game, type, x, opts) {
      opts = opts || {};
      const cfg = ENEMY_TYPES[type] || ENEMY_TYPES.inkling;
      this.game = game;
      this.id = 'e' + (++Enemy.uid);
      this.type = type;
      this.cfg = cfg;
      this.name = opts.name || cfg.name;
      this.variant = opts.variant || 'sword';
      this.isElite = !!cfg.isElite;
      this.size = cfg.size;
      this.x = x; this.y = opts.y !== undefined ? opts.y : GROUND; this.z = opts.z !== undefined ? opts.z : U.rand(-180, 180);
      this.baseY = this.y;
      this.vx = 0; this.vy = 0; this.vz = 0;
      this.facing = -1;
      this.state = 'idle'; this.stateT = 0;
      this.hp = cfg.hp * (opts.hpScale || 1);
      this.maxHp = this.hp;
      this.maxPosture = cfg.isElite ? 150 : (cfg.armor ? 120 : 80);
      this.posture = this.maxPosture;
      this.staggered = 0; this.executable = false;
      this.damage = cfg.damage * (opts.dmgScale || 1);
      this.speed = cfg.speed * (opts.speedScale || 1);
      this.range = cfg.range;
      this.spawnT = .45;
      this.attackCd = U.rand(.7, 1.5);
      this.hurtFlash = 0; this.hitstun = 0;
      this.dead = false; this.deathT = 0;
      this.hasHit = false;
      this.attackDone = false;
      this.seed = Math.random() * 20;
      this.pattern = null; this.patternT = 0; this.pFlags = {};
      this.elitePhase = 1;
    }

    hitbox() {
      const w = this.isElite ? 125 : (this.type === 'shield' ? 95 : 82);
      const h = this.isElite ? 330 : (this.type === 'crow' ? 130 : (this.type === 'paper' ? 200 : 150));
      const top = this.type === 'crow' ? this.y - 250 : this.y - h;
      return { x: this.x - w / 2, y: top, w, h };
    }

    update(dt, game) {
      if (this.dead) { this.deathT += dt; return; }
      if (this.corrupted === false) {
        this.state = 'idle'; this.stateT += dt;
        this.vx = U.damp(this.vx || 0, 0, 8, dt); this.vz = U.damp(this.vz || 0, 0, 8, dt);
        this.hurtFlash = Math.max(0, this.hurtFlash - dt);
        return;
      }
      this.hurtFlash = Math.max(0, this.hurtFlash - dt);
      this.hitstun = Math.max(0, this.hitstun - dt);
      this.attackCd = Math.max(0, this.attackCd - dt);
      this.stateT += dt;
      if (this.spawnT > 0) { this.spawnT -= dt; return; }
      if (this.staggered > 0) {
        this.staggered = Math.max(0, this.staggered - dt);
        this.state = 'stagger'; this.executable = true;
        this.vx = U.damp(this.vx, 0, 8, dt); this.vz = U.damp(this.vz, 0, 8, dt);
        if (this.staggered <= 0) { this.posture = this.maxPosture * .5; this.executable = false; this.state = 'chase'; }
        return;
      }
      if (this.hitstun > 0) {
        this.x += this.vx * dt;
        this.vx = U.damp(this.vx, 0, 8, dt);
        this.y = this.baseY + Math.sin(game.time * 2 + this.seed) * (this.cfg.flying ? 4 : 0);
        return;
      }

      const p = game.player;
      const dx = p.x - this.x, dz = (p.z || 0) - this.z;
      const dist = Math.hypot(dx, dz);
      this.facing = dx >= 0 ? 1 : -1;

      if (this.type === 'scholar') { this.updateScholar(dt, game, p); this._constrain(game); return; }
      if (this.type === 'athlete') { this.updateAthlete(dt, game, p); this._constrain(game); return; }
      if (this.isElite) { this.updateElite(dt, game, p); this._constrain(game); return; }

      if (this.state === 'windup') {
        if (this.stateT >= this.cfg.windup) {
          this.state = 'attack'; this.stateT = 0; this.hasHit = false;
          this._onAttackStart(game, p);
        }
        return;
      }
      if (this.state === 'attack') {
        if (this.stateT < this.cfg.active) this._onAttackActive(dt, game, p);
        if (this.stateT >= this.cfg.active) { this.state = 'recover'; this.stateT = 0; }
        return;
      }
      if (this.state === 'recover') {
        if (this.stateT >= this.cfg.recover) { this.state = 'chase'; this.stateT = 0; this.attackCd = Math.max(this.attackCd, .35); }
        return;
      }

      // 追击
      if (this.cfg.ranged) {
        const desired = this.type === 'paper' ? 420 : 300;
        const nx = dx / (dist || 1), nz = dz / (dist || 1);
        if (dist < desired - 60) { this.vx = U.damp(this.vx, -nx * this.speed, 6, dt); this.vz = U.damp(this.vz, -nz * this.speed, 6, dt); }
        else if (dist > desired + 80) { this.vx = U.damp(this.vx, nx * this.speed, 6, dt); this.vz = U.damp(this.vz, nz * this.speed, 6, dt); }
        else { this.vx = U.damp(this.vx, 0, 8, dt); this.vz = U.damp(this.vz, 0, 8, dt); }
        this.x += this.vx * dt; this.z += this.vz * dt;
        this.y = this.baseY + Math.sin(game.time * 2.2 + this.seed) * (this.cfg.flying ? 14 : 5);
        if (this.attackCd <= 0 && dist < 760) { this.state = 'windup'; this.stateT = 0; this.attackCd = U.rand(1.5, 2.4); }
      } else {
        const nx = dx / (dist || 1), nz = dz / (dist || 1);
        if (dist > this.cfg.range * .78) { this.vx = U.damp(this.vx, nx * this.speed, 9, dt); this.vz = U.damp(this.vz, nz * this.speed, 9, dt); }
        else { this.vx = U.damp(this.vx, 0, 11, dt); this.vz = U.damp(this.vz, 0, 11, dt); }
        this.x += this.vx * dt; this.z += this.vz * dt;
        if (this.cfg.flying) this.y = this.baseY + Math.sin(game.time * 3 + this.seed) * 18;
        else this.y = this.baseY;
        if (this.attackCd <= 0 && dist < this.cfg.range) { this.state = 'windup'; this.stateT = 0; this.attackCd = U.rand(1.05, 1.7); }
      }
      this._constrain(game);
    }

    _onAttackStart(game, p) {
      if (this.type === 'paper') {
        const dx = p.x - this.x, dz = (p.z || 0) - this.z, hd = Math.hypot(dx, dz) || 1;
        const vx = dx / hd * 430, vz = dz / hd * 430;
        game.projectiles.push(new Projectile(game, {
          x: this.x, y: this.y - 95, z: this.z, vx, vy: (p.y - 100 - this.y) * .35, vz,
          r: 11, damage: this.damage, kind: 'enemyBolt', owner: 'enemy', life: 2.4
        }));
        game.audio.sfx('bossCast');
      } else if (this.type === 'crow') {
        const dx = p.x - this.x;
        this.cfg._diveVx = U.sign(dx) * 650;
      }
    }

    _onAttackActive(dt, game, p) {
      if (this.hasHit) return;
      if (this.type === 'paper') return;
      if (this.type === 'crow') {
        this.x += (this.cfg._diveVx || 0) * dt;
        this.y = U.damp(this.y, GROUND - 90, 12, dt);
        if (Math.hypot(p.x - this.x, (p.z || 0) - this.z) < 60 && Math.abs(p.y - this.y) < 190) {
          if (p.hitBy(this.damage, this.x, game, this.cfg.name, this)) this.hasHit = true;
        }
        return;
      }
      const reach = this.type === 'shield' ? 155 : 125;
      if (Math.hypot(p.x - this.x, (p.z || 0) - this.z) < reach && Math.abs(p.y - this.y) < 210) {
        if (p.hitBy(this.damage, this.x, game, this.cfg.name, this)) this.hasHit = true;
      }
    }

    updateScholar(dt, game, p) {
      const dx = p.x - this.x, dz = (p.z || 0) - this.z;
      const dist = Math.hypot(dx, dz);
      this.facing = dx >= 0 ? 1 : -1;
      if (this.state === 'windup') {
        if (this.stateT >= this.cfg.windup) {
          this.state = 'attack'; this.stateT = 0;
          if (this.pattern === 'formula') {
            const px = p.x + (p.vx || 0) * .35, pz = (p.z || 0) + (p.vz || 0) * .35;
            game.hazards.push(new Hazard(game, { x: px, y: GROUND, z: pz, w: 130, h: 34, kind: 'spike', delay: .75, life: 1.5, damage: 16 * game.damageScale, seed: Math.random() * 10 }));
            game.addText(this.x, this.y - 150, '解：x = ?', '#c7f6ff', 21, { life: 1.4 });
            game.audio.sfx('warn');
          } else {
            for (let i = -1; i <= 1; i++) {
              const tx = p.x + (p.vx || 0) * .28 + i * 44;
              const tz = (p.z || 0) + (p.vz || 0) * .28;
              const ddx = tx - this.x, ddz = tz - this.z;
              const d = Math.hypot(ddx, ddz) || 1;
              game.projectiles.push(new Projectile(game, {
                x: this.x, y: this.y - 120, z: this.z, vx: ddx / d * 480, vy: (p.y - 110 - this.y) * .2, vz: ddz / d * 480,
                r: 8, damage: 10 * game.damageScale, kind: 'chalk', owner: 'enemy', life: 2.2
              }));
            }
            game.audio.sfx('bossCast');
          }
        }
        return;
      }
      if (this.state === 'attack') {
        if (this.stateT >= .28) { this.state = 'recover'; this.stateT = 0; }
        return;
      }
      if (this.state === 'recover') {
        if (this.stateT >= this.cfg.recover) { this.state = 'chase'; this.stateT = 0; this.attackCd = U.rand(1.1, 1.7); }
        return;
      }
      // kite
      const nx = dx / (dist || 1), nz = dz / (dist || 1);
      if (dist < 300) { this.vx = U.damp(this.vx, -nx * this.speed, 5, dt); this.vz = U.damp(this.vz, -nz * this.speed, 5, dt); }
      else if (dist > 460) { this.vx = U.damp(this.vx, nx * this.speed, 5, dt); this.vz = U.damp(this.vz, nz * this.speed, 5, dt); }
      else { this.vx = U.damp(this.vx, 0, 8, dt); this.vz = U.damp(this.vz, 0, 8, dt); }
      this.x += this.vx * dt; this.z += this.vz * dt;
      if (dist < 145 && this.attackCd > .2) {
        const away = dx >= 0 ? -1 : 1;
        this.x += away * 160; this.z += U.rand(-70, 70);
        game.spawnBurst(this.x, this.y - 80, '#c8eaff', 16, 200, { size: 2.5, life: .5, gravity: 0 });
      }
      if (this.attackCd <= 0) {
        this.pattern = Math.random() < .36 ? 'formula' : 'chalk';
        this.state = 'windup'; this.stateT = 0; this.attackCd = U.rand(1.35, 2.2);
      }
    }

    updateAthlete(dt, game, p) {
      const dx = p.x - this.x, dz = (p.z || 0) - this.z;
      const dist = Math.hypot(dx, dz);
      this.faceClock = (this.faceClock || 0) + dt;
      if (this.faceClock > .55) { this.facing = dx >= 0 ? 1 : -1; this.faceClock = 0; }
      if (this.state === 'windup') {
        if (this.stateT >= this.cfg.windup) { this.state = 'attack'; this.stateT = 0; this.hasHit = false; }
        return;
      }
      if (this.state === 'attack') {
        if (this.stateT < this.cfg.active && !this.hasHit) {
          if (dist < 175 && Math.abs(p.y - this.y) < 220) {
            if (p.hitBy(this.damage * game.damageScale, this.x, game, this.name, this)) this.hasHit = true;
          }
        }
        if (this.stateT >= this.cfg.active) { this.state = 'recover'; this.stateT = 0; }
        return;
      }
      if (this.state === 'recover') {
        if (this.stateT >= this.cfg.recover) { this.state = 'chase'; this.stateT = 0; this.attackCd = U.rand(.55, 1); }
        return;
      }
      const nx = dx / (dist || 1), nz = dz / (dist || 1);
      if (dist > 135) { this.vx = U.damp(this.vx, nx * this.speed, 5, dt); this.vz = U.damp(this.vz, nz * this.speed, 5, dt); }
      else { this.vx = U.damp(this.vx, 0, 8, dt); this.vz = U.damp(this.vz, 0, 8, dt); }
      this.x += this.vx * dt; this.z += this.vz * dt;
      if (this.attackCd <= 0) { this.state = 'windup'; this.stateT = 0; this.attackCd = U.rand(.8, 1.3); }
    }

    updateElite(dt, game, p) {
      const dx = p.x - this.x;
      const dist = Math.abs(dx);
      if (this.state === 'spawn') {
        if (this.stateT > .8) { this.state = 'chase'; this.stateT = 0; }
        return;
      }
      if (this.state === 'windup') {
        if (this.stateT >= .7) {
          this.state = 'attack'; this.stateT = 0; this.hasHit = false;
          this._eliteAttack(game, p);
        }
        return;
      }
      if (this.state === 'attack') {
        if (this.stateT < .28 && !this.hasHit) this._eliteMelee(game, p);
        if (this.stateT >= .55) { this.state = 'recover'; this.stateT = 0; }
        return;
      }
      if (this.state === 'recover') {
        if (this.stateT >= .8) { this.state = 'chase'; this.stateT = 0; this.attackCd = U.rand(.6, 1.1); }
        return;
      }
      if (this.state === 'dash') {
        this.x += this.facing * 940 * dt;
        if (!this.hasHit && this.stateT < .32) {
          const box = { x: this.x - 80, y: this.y - 220, w: 160, h: 220 };
          const pbox = { x: p.x - 28, y: p.y - 168, w: 56, h: 168 };
          if (U.overlap(box, pbox) && p.hitBy(this.damage * 1.15, this.x, game, this.name, this)) this.hasHit = true;
        }
        if (this.stateT > .45) { this.state = 'recover'; this.stateT = 0; }
        return;
      }
      if (this.attackCd <= 0 && dist < 560) {
        this.state = 'windup'; this.stateT = 0;
        this.attackCd = U.rand(1.4, 2.2);
        this.pattern = this.variant === 'sword' && Math.random() < .45 ? 'dash' :
          this.variant === 'paper' && Math.random() < .5 ? 'summon' : 'bolt';
        return;
      }
      if (dist > 170) this.vx = U.damp(this.vx, this.facing * this.speed, 5, dt);
      else this.vx = U.damp(this.vx, 0, 8, dt);
      this.x += this.vx * dt;
    }

    _eliteAttack(game, p) {
      this.hasHit = false;
      if (this.pattern === 'dash') {
        this.state = 'dash'; this.stateT = 0; this.hasHit = false;
        this.facing = p.x >= this.x ? 1 : -1;
        game.audio.sfx('dash');
        game.addShake(3);
      } else if (this.pattern === 'summon') {
        if (game.enemies.filter(e => !e.dead).length < 6) {
          game.spawnEnemy('paper', this.x - 120, { hpScale: game.stageIndex * .15 + .8, dmgScale: game.damageScale });
          game.spawnEnemy('paper', this.x + 130, { hpScale: game.stageIndex * .15 + .8, dmgScale: game.damageScale });
        }
        for (let i = -2; i <= 2; i++) {
          const a = Math.atan2((p.y - 110) - this.y, p.x - this.x) + i * .17;
          game.projectiles.push(new Projectile(game, {
            x: this.x, y: this.y - 115, vx: Math.cos(a) * 480, vy: Math.sin(a) * 480,
            r: 12, damage: this.damage * .85, kind: 'bossOrb', owner: 'enemy', life: 2.5
          }));
        }
        game.audio.sfx('bossCast');
      } else {
        for (let i = -1; i <= 1; i++) {
          const a = Math.atan2((p.y - 105) - this.y, p.x - this.x) + i * .12;
          game.projectiles.push(new Projectile(game, {
            x: this.x, y: this.y - 120, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520,
            r: 11, damage: this.damage * .8, kind: 'enemyBolt', owner: 'enemy', life: 2.3
          }));
        }
        game.audio.sfx('bossCast');
      }
    }

    _eliteMelee(game, p) {
      const box = { x: this.facing > 0 ? this.x + 30 : this.x - 195, y: this.y - 250, w: 190, h: 250 };
      const pbox = { x: p.x - 28, y: p.y - 168, w: 56, h: 168 };
      if (U.overlap(box, pbox) && p.hitBy(this.damage, this.x, game, this.name, this)) this.hasHit = true;
    }

    _constrain(game) {
      const left = game.bounds ? game.bounds.left : 20;
      const right = game.bounds ? game.bounds.right : (game.worldWidth || 99999) - 20;
      this.x = U.clamp(this.x, left + 40, right - 40);
      const zb = game.zBounds || { min: -280, max: 280 };
      this.z = U.clamp(this.z, zb.min, zb.max);
    }

    takeDamage(amount, source, game) {
      if (this.dead) return;
      let dmg = amount;
      let blocked = false;
      if (this.type === 'athlete') {
        const front = (source.x - this.x) * this.facing > 0;
        if (front) { dmg *= .12; blocked = true; }
      }
      if (this.type === 'shield' && !this.isElite) {
        const front = (source.x - this.x) * this.facing > 0;
        if (front) { dmg *= .32; blocked = true; }
      }
      dmg = Math.max(1, Math.round(dmg));
      if (game.campusLayer && game.campusLayer.handleEnemyDamage(this, dmg, source, game, blocked)) return;
      this.hp -= dmg;
      this.hurtFlash = .16;
      this.posture = Math.max(0, this.posture - (this.isElite ? 5 : 8));
      if (!this.isElite && this.type !== 'shield') this.hitstun = .16;
      this.vx = U.sign(this.x - source.x) * (this.isElite ? 15 : 170);
      this.vz = U.sign(this.z - (source.z || 0)) * (this.isElite ? 8 : 80);
      game.spawnBurst(this.x, this.y - (this.isElite ? 160 : 80), blocked ? '#e8c47a' : '#b8fbff', blocked ? 5 : 8, 180, { size: 2.6, life: .35, gravity: 300 });
      if (blocked) game.addText(this.x, this.y - 130, '格挡', '#e8c47a', 16);
      if (this.hp <= 0) { this.die(game); return; }
      if (this.posture <= 0) { this.staggered = 1.8; this.executable = true; this.state = 'stagger'; game.addText(this.x, this.y - 160, '气竭', '#ffd47e', 24, { bold: true }); game.audio.sfx('gong'); game.addShake(5); }
    }

    die(game) {
      if (this.dead) return;
      this.dead = true; this.hp = 0; this.deathT = 0; this.state = 'dead';
      game.audio.sfx(this.isElite ? 'bossDown' : 'enemyDown');
      game.spawnBurst(this.x, this.y - (this.isElite ? 150 : 80), this.isElite ? '#ffb580' : '#8eeef7', this.isElite ? 45 : 20, this.isElite ? 360 : 240, { size: this.isElite ? 4 : 2.6, life: .8, gravity: 350 });
      game.addShake(this.isElite ? 14 : 3);
      game.onEnemyKilled(this);
      if (this.isElite) game.onEliteKilled(this);
    }

    draw(ctx, t) {
      if (this.spawnT > 0) {
        ctx.save(); ctx.globalAlpha = 1 - this.spawnT / .45;
        Art.drawEnemy(ctx, { ...this, spawnT: 0, hitstun: 0 }, t);
        ctx.restore();
        return;
      }
      Art.drawEnemy(ctx, this, t);
    }

    drawTelegraph(ctx, t) {
      if (this.dead) return;
      if (this.state === 'windup') {
        const prog = Math.min(1, this.stateT / this.cfg.windup);
        ctx.save();
        if (this.cfg.ranged) {
          const p = this.game.player;
          const a = Math.atan2((p.y - 100) - (this.y - 90), p.x - this.x);
          ctx.strokeStyle = `rgba(255,107,87,${.12 + prog * .28})`;
          ctx.lineWidth = 1.3; ctx.setLineDash([9, 10]);
          ctx.beginPath(); ctx.moveTo(this.x, this.y - 90); ctx.lineTo(this.x + Math.cos(a) * 700, this.y - 90 + Math.sin(a) * 700); ctx.stroke();
          ctx.setLineDash([]);
          Art.glow(ctx, this.x, this.y - 90, 54, '#ff765f', .05 + prog * .12);
        } else {
          const reach = this.isElite ? 200 : 135;
          ctx.strokeStyle = `rgba(255,104,85,${.12 + prog * .26})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(this.x + this.facing * reach * .35, this.y - 12, reach * .8, 24, 0, 0, TAU); ctx.stroke();
          Art.glow(ctx, this.x + this.facing * 55, this.y - 70, 62, '#ff735e', .04 + prog * .1);
        }
        ctx.restore();
      }
      if (this.state === 'attack' && this.type !== 'paper') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const reach = this.isElite ? 190 : (this.type === 'shield' ? 150 : 135);
        const a0 = this.facing > 0 ? -.9 : Math.PI + .9;
        const a1 = this.facing > 0 ? .9 : Math.PI - .9;
        ctx.strokeStyle = this.isElite ? 'rgba(255,158,106,.6)' : 'rgba(255,122,95,.48)';
        ctx.lineWidth = this.isElite ? 12 : 7;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(this.x, this.y - 85, reach, a0, a1, this.facing < 0); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,230,197,.6)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(this.x, this.y - 85, reach + 6, a0, a1, this.facing < 0); ctx.stroke();
        ctx.restore();
      }
      if (this.isElite && this.state === 'dash') {
        ctx.save(); ctx.globalAlpha = .4;
        for (let i = 0; i < 4; i++) Art.drawEnemy(ctx, { ...this, x: this.x - this.facing * i * 24, state: 'dash', dead: false, deathT: 0, hurtFlash: 0 }, t - i * .03);
        ctx.restore();
      }
    }
  }
  Enemy.uid = 0;

  class Boss {
    constructor(game, x) {
      this.game = game;
      this.maxHp = 12000;
      this.hp = this.maxHp;
      this.x = x; this.y = GROUND;
      this.vx = 0; this.facing = -1;
      this.phase = 1;
      this.state = 'idle'; this.stateT = 0;
      this.pattern = null; this.patternT = 0; this.pFlags = {};
      this.attackCd = 1.4;
      this.invuln = 0; this.hurtFlash = 0; this.poise = 0;
      this.z = 0; this.maxPosture = 220; this.posture = 220; this.executable = false;
      this.dead = false; this.deathT = 0;
      this.phaseTriggered = 0;
      this.nextBark = 12;
      this.name = '刘奥';
      this.title = '守心人';
      this.intro = true;
    }

    hitbox() {
      return { x: this.x - 82, y: this.y - 345, w: 164, h: 345 };
    }

    update(dt, game) {
      if (this.dead) { this.deathT += dt; return; }
      this.hurtFlash = Math.max(0, this.hurtFlash - dt);
      if (this.invuln > 0) this.invuln -= dt;
      this.stateT += dt;
      this.patternT += dt;
      const p = game.player;
      this.facing = p.x >= this.x ? 1 : -1;

      if (this.phase === 1 && this.hp <= this.maxHp * .66 && this.phaseTriggered < 2) {
        this.phaseTriggered = 2; game.triggerBossPhase(2); return;
      }
      if (this.phase === 2 && this.hp <= this.maxHp * .33 && this.phaseTriggered < 3) {
        this.phaseTriggered = 3; game.triggerBossPhase(3); return;
      }
      if (this.state === 'transition' || this.state === 'intro') {
        if (this.state === 'transition' && this.stateT > 1.4) { this.state = 'idle'; this.stateT = 0; this.invuln = 1; }
        return;
      }
      if (this.state === 'stagger') {
        this.executable = true;
        if (this.stateT > 1.5) { this.state = 'idle'; this.stateT = 0; this.attackCd = .5; this.posture = this.maxPosture * .5; this.executable = false; }
        return;
      }
      if (this.state === 'dead') return;

      if (this.pattern) { this._updatePattern(dt, game, p); return; }

      this.attackCd -= dt;
      const dist = Math.abs(p.x - this.x);
      if (dist > 330) {
        this.vx = U.damp(this.vx, this.facing * 95, 3, dt);
        this.x += this.vx * dt;
      } else {
        this.vx = U.damp(this.vx, 0, 5, dt);
      }
      this.x = U.clamp(this.x, game.bounds.left + 120, game.bounds.right - 120);
      if (this.attackCd <= 0) this._choosePattern(p, game);
      this.nextBark -= dt;
      if (this.nextBark <= 0) {
        this.nextBark = U.rand(15, 24);
        game.bark('刘奥', U.choice(STORY.boss.barks), 'boss');
      }
    }

    _choosePattern(p, game) {
      const phase = this.phase;
      let pool;
      if (phase === 1) pool = ['slashWave', 'dashSlash', 'impale', 'summon', 'slashWave'];
      else if (phase === 2) pool = ['slashWave', 'dashSlash', 'impale', 'flameRain', 'teleportCombo', 'summon'];
      else pool = ['annihilation', 'flameRain', 'teleportCombo', 'dashSlash', 'slashWave', 'annihilation'];
      if (Math.abs(p.x - this.x) < 230 && phase < 3) pool = pool.concat(['dashSlash']);
      this.pattern = U.choice(pool);
      this.patternT = 0; this.pFlags = {};
      this.state = 'windup'; this.stateT = 0;
      game.audio.sfx('bossCast');
      if (this.pattern === 'annihilation') game.bark('刘奥', '都别想带走他。', 'boss');
      if (this.pattern === 'teleportCombo') {
        game.spawnBurst(this.x, this.y - 170, '#ff4f43', 26, 300, { size: 3, life: .7, gravity: 0, additive: true });
      }
    }

    _updatePattern(dt, game, p) {
      const t = this.patternT;
      const flags = this.pFlags;
      const dir = this.facing;
      const phase = this.phase;
      switch (this.pattern) {
        case 'slashWave': {
          if (t < .68) { this.state = 'windup'; this.stateT = t; }
          else if (t < .72 && !flags.waves) {
            flags.waves = true; this.state = 'attack'; this.stateT = 0;
            const dmg = (phase === 1 ? 19 : 22) * game.damageScale;
            for (let i = 0; i < 3; i++) {
              game.projectiles.push(new Projectile(game, {
                x: this.x + dir * 76, y: this.y - 66 - i * 62,
                vx: dir * (phase === 3 ? 760 : 640), vy: 0, r: 36,
                damage: dmg, kind: 'bossWave', owner: 'enemy', life: 2.6, dir
              }));
            }
            game.audio.sfx('wave');
            game.addShake(4);
          }
          if (t > 1.55) this._endPattern(1.5);
          break;
        }
        case 'dashSlash': {
          if (t < .62) {
            this.state = 'windup'; this.stateT = t;
            if (!flags.line) { flags.line = true; game.audio.sfx('warn'); }
          } else if (t < .68) {
            this.state = 'dash'; this.stateT = 0;
            if (!flags.dash) {
              flags.dash = true; this.vx = dir * 1250; game.addShake(7); game.audio.sfx('dash');
            }
          } else if (t < 1.05) {
            this.state = 'dash'; this.stateT = t - .68;
            this.x += dir * 1200 * dt;
            if (!flags.hit) {
              const box = { x: this.x - 90, y: this.y - 300, w: 180, h: 300 };
              if (U.overlap(box, { x: p.x - 28, y: p.y - 168, w: 56, h: 168 })) {
                if (p.hitBy(24 * game.damageScale, this.x, game, '刘奥 · 断岳', this)) flags.hit = true;
              }
            }
            this.x = U.clamp(this.x, game.bounds.left + 100, game.bounds.right - 100);
          } else {
            this.state = 'recover'; this.stateT = 0;
            if (t > 1.55) this._endPattern(1.5);
          }
          break;
        }
        case 'impale': {
          if (t < .78) { this.state = 'windup'; this.stateT = t; }
          else if (!flags.spikes) {
            flags.spikes = true; this.state = 'attack'; this.stateT = 0;
            for (let i = -1; i <= 1; i++) {
              const hx = U.clamp(p.x + i * 90, game.bounds.left + 60, game.bounds.right - 60);
              game.hazards.push(new Hazard(game, { x: hx, y: GROUND, w: 120, h: 34, kind: 'spike', delay: .55, life: 1.35, damage: 21 * game.damageScale, seed: Math.random() * 10 }));
            }
            game.audio.sfx('warn');
          }
          if (t > 1.9) this._endPattern(1.6);
          break;
        }
        case 'summon': {
          if (t < .7) { this.state = 'windup'; this.stateT = t; }
          else if (!flags.summoned) {
            flags.summoned = true; this.state = 'attack'; this.stateT = 0;
            if (game.enemies.filter(e => !e.dead).length < 5) {
              game.spawnEnemy('inkling', this.x - 170, { hpScale: .9 + phase * .15, dmgScale: game.damageScale });
              game.spawnEnemy('paper', this.x - 310, { hpScale: .9 + phase * .15, dmgScale: game.damageScale });
            }
            game.audio.sfx('bossCast');
          }
          if (t > 1.4) this._endPattern(1.4);
          break;
        }
        case 'flameRain': {
          if (t < .6) { this.state = 'windup'; this.stateT = t; }
          else if (!flags.rain) {
            flags.rain = true; this.state = 'attack'; this.stateT = 0;
            const count = phase === 3 ? 7 : 5;
            for (let i = 0; i < count; i++) {
              const hx = U.clamp(p.x + U.rand(-480, 480), game.bounds.left + 80, game.bounds.right - 80);
              game.hazards.push(new Hazard(game, { x: hx, y: GROUND, w: U.rand(110, 170), h: 30, kind: 'fire', delay: 1.05 + i * .08, life: 1.9, damage: 20 * game.damageScale, seed: Math.random() * 10 }));
            }
            game.audio.sfx('fire');
            game.addShake(5);
          }
          if (t > 2.4) this._endPattern(1.8);
          break;
        }
        case 'teleportCombo': {
          if (t < .5) { this.state = 'windup'; this.stateT = t; }
          else if (!flags.tp) {
            flags.tp = true;
            game.spawnBurst(this.x, this.y - 180, '#ff4f43', 30, 300, { size: 3, life: .6, additive: true });
            const behind = p.x + (p.facing || 1) * -170;
            this.x = U.clamp(behind, game.bounds.left + 120, game.bounds.right - 120);
            this.facing = p.x >= this.x ? 1 : -1;
            this.state = 'attack'; this.stateT = 0;
            game.audio.sfx('bossCast');
          } else if (t > .65 && t < 1.0 && !flags.slash) {
            flags.slash = true;
            this.state = 'attack'; this.stateT = 0;
            const box = { x: this.x - 130, y: this.y - 300, w: 260, h: 300 };
            if (U.overlap(box, { x: p.x - 28, y: p.y - 168, w: 56, h: 168 })) p.hitBy(25 * game.damageScale, this.x, game, '刘奥 · 影断', this);
            for (let i = 0; i < 3; i++) {
              game.projectiles.push(new Projectile(game, {
                x: this.x + this.facing * 60, y: this.y - 80 - i * 45,
                vx: this.facing * 820, vy: 0, r: 30, damage: 16 * game.damageScale,
                kind: 'bossWave', owner: 'enemy', life: 2, dir: this.facing
              }));
            }
            game.audio.sfx('slashHeavy'); game.addShake(6);
          }
          if (t > 1.65) this._endPattern(1.5);
          break;
        }
        case 'annihilation': {
          if (t < 1.3) {
            this.state = 'windup'; this.stateT = t;
            if (!flags.charge) { flags.charge = true; game.bark('刘奥', '这一剑，为亚岚。', 'boss'); game.audio.sfx('bossCast'); }
            if (Math.random() < .4) game.spawnParticle(this.x + U.rand(-110, 110), this.y - U.rand(50, 330), U.rand(-30, 30), -U.rand(40, 150), U.rand(.3, .8), U.rand(2, 4), '#ff7a5e', 0, true);
          } else if (!flags.burst) {
            flags.burst = true; this.state = 'attack'; this.stateT = 0;
            game.addShake(18); game.flashScreen('#ff5f4c', .22);
            game.audio.sfx('slashHeavy');
            for (let i = 0; i < 4; i++) {
              game.projectiles.push(new Projectile(game, {
                x: this.x + this.facing * 70, y: this.y - 55 - i * 58,
                vx: this.facing * (870 + i * 40), vy: 0, r: 42,
                damage: 23 * game.damageScale, kind: 'bossWave', owner: 'enemy', life: 2.3, dir: this.facing
              }));
            }
            for (let i = 0; i < 4; i++) {
              const hx = game.bounds.left + 150 + i * ((game.bounds.right - game.bounds.left - 300) / 3);
              game.hazards.push(new Hazard(game, { x: hx, y: GROUND, w: 105, h: 34, kind: 'fire', delay: .75 + i * .18, life: 1.8, damage: 20 * game.damageScale, seed: Math.random() * 10 }));
            }
          }
          if (t > 2.7) this._endPattern(2.1);
          break;
        }
      }
    }

    _endPattern(cd) {
      this.pattern = null; this.patternT = 0; this.pFlags = {};
      this.state = 'recover'; this.stateT = 0;
      this.attackCd = cd * (this.phase === 3 ? .72 : this.phase === 2 ? .86 : 1);
    }

    takeDamage(amount, source, game) {
      if (this.dead || this.invuln > 0 || this.state === 'transition') return;
      const dmg = Math.max(1, Math.round(amount));
      if (game.campusLayer && game.campusLayer.handleBossDamage(this, dmg, source, game)) return;
      this.hp -= dmg;
      this.hurtFlash = .14;
      this.posture = Math.max(0, this.posture - dmg * .06);
      this.poise += dmg;
      if (this.poise > 780) {
        this.poise = 0;
        this.state = 'stagger'; this.stateT = 0;
        this.pattern = null; this.pFlags = {};
        game.addText(this.x, this.y - 370, '破势', '#ffe0a0', 28);
        game.audio.sfx('gong');
        game.addShake(8);
      }
      game.spawnBurst(this.x + U.rand(-40, 40), this.y - U.rand(80, 300), '#b8fbff', 7, 170, { size: 2.5, life: .35, gravity: 300 });
      if (this.posture <= 0 && this.state !== 'stagger') {
        this.state = 'stagger'; this.stateT = 0; this.executable = true;
        game.addText(this.x, this.y - 360, '气竭', '#ffd47e', 30, { bold: true }); game.audio.sfx('gong'); game.addShake(8);
      }
      if (this.hp <= 0) { this.hp = 0; this.die(game); }
    }

    die(game) {
      if (this.dead) return;
      this.dead = true; this.state = 'dead'; this.stateT = 0; this.deathT = 0;
      game.audio.sfx('bossDown');
      game.addShake(20);
      game.spawnBurst(this.x, this.y - 190, '#ffb27d', 80, 500, { size: 4.5, life: 1.4, gravity: 260 });
      game.onBossDefeated();
    }

    draw(ctx, t) {
      Art.drawBoss(ctx, this, t);
    }

    drawTelegraph(ctx, t) {
      if (this.dead) return;
      if (this.state === 'windup' || (this.pattern && this.patternT < .7)) {
        const p = this.game.player;
        const prog = this.pattern ? Math.min(1, this.patternT / .7) : 1;
        ctx.save();
        ctx.strokeStyle = `rgba(255,91,72,${.10 + prog * .22})`;
        ctx.lineWidth = 1.4; ctx.setLineDash([8, 10]);
        if (this.pattern === 'impale' || this.pattern === 'flameRain' || this.pattern === 'annihilation') {
          const w = this.pattern === 'flameRain' ? 520 : 300;
          ctx.beginPath(); ctx.ellipse(this.x, this.y - 10, w, 30, 0, 0, TAU); ctx.stroke();
        } else {
          const a = Math.atan2((p.y - 100) - (this.y - 160), p.x - this.x);
          ctx.beginPath(); ctx.moveTo(this.x, this.y - 160); ctx.lineTo(this.x + Math.cos(a) * 800, this.y - 160 + Math.sin(a) * 800); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }
      if (this.state === 'attack') {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const a0 = this.facing > 0 ? -1.05 : Math.PI + 1.05;
        const a1 = this.facing > 0 ? 1.05 : Math.PI - 1.05;
        ctx.strokeStyle = 'rgba(255,104,75,.28)'; ctx.lineWidth = 26; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(this.x, this.y - 140, 210, a0, a1, this.facing < 0); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,214,174,.58)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(this.x, this.y - 140, 216, a0, a1, this.facing < 0); ctx.stroke();
        ctx.restore();
      }
      if (this.state === 'dash') {
        ctx.save(); ctx.globalAlpha = .28;
        for (let i = 1; i <= 3; i++) Art.drawBoss(ctx, { ...this, x: this.x - this.facing * i * 32, state: 'dash', dead: false, deathT: 0, hurtFlash: 0 }, t - i * .04);
        ctx.restore();
      }
    }
  }

  class Projectile {
    constructor(game, opts) {
      Object.assign(this, {
        game, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: 10, damage: 10, kind: 'enemyBolt',
        owner: 'enemy', life: 2, pierce: 0, angle: 0, dir: 1, gravity: 0
      }, opts);
      this.dead = false;
      this.hits = new Set();
      this.t = 0;
    }
    update(dt, game) {
      if (this.dead) return;
      this.t += dt; this.life -= dt;
      this.x += this.vx * dt; this.y += this.vy * dt; this.z += (this.vz || 0) * dt;
      if (this.gravity) this.vy += this.gravity * dt;
      if (this.life <= 0 || this.x < -200 || this.x > (game.worldWidth || 99999) + 200 || this.y < -300 || this.y > 1200) { this.dead = true; return; }
      if (this.owner === 'player') {
        if (game.boss && !game.boss.dead && !this.hits.has('boss')) {
          const bb = game.boss.hitbox();
          if (U.circleRect(this.x, this.y, this.r, bb) && Math.abs(this.z - (game.boss.z || 0)) < 100) {
            this.hits.add('boss');
            game.boss.takeDamage(this.damage, { x: this.x }, game);
            game.onPlayerDealtDamage(game.boss, this.damage, { x: this.x - 200 }, false);
            if (this.pierce-- <= 0) this.dead = true;
          }
        }
        for (const e of game.enemies) {
          if (e.dead || this.hits.has(e.id)) continue;
          if (U.circleRect(this.x, this.y, this.r, e.hitbox()) && Math.abs(this.z - (e.z || 0)) < 90) {
            this.hits.add(e.id);
            e.takeDamage(this.damage, { x: this.x - Math.sign(this.vx) * 50 }, game);
            game.onPlayerDealtDamage(e, this.damage, { x: this.x - Math.sign(this.vx) * 50 }, false);
            if (this.pierce-- <= 0) { this.dead = true; break; }
          }
        }
      } else {
        const p = game.player;
        if (!p.dead && U.circleRect(this.x, this.y, this.r, { x: p.x - 28, y: p.y - 168, w: 56, h: 168 }) && Math.abs(this.z - p.z) < 70) {
          if (p.hitBy(this.damage, this.x - Math.sign(this.vx) * 40, game, '刘奥 · 残焰', this)) {
            this.dead = true;
            game.spawnBurst(this.x, this.y, '#ff9678', 8, 170, { size: 2, life: .3, gravity: 250 });
          }
        }
      }
    }
    draw(ctx, t) { Art.drawProjectile(ctx, this, t); }
  }

  class Hazard {
    constructor(game, opts) {
      Object.assign(this, { x: 0, y: GROUND, z: 0, w: 120, h: 30, kind: 'fire', delay: .8, life: 1.6, damage: 20, seed: 1 }, opts);
      this.timer = 0; this.dead = false; this.hit = false; this.game = game;
    }
    update(dt, game) {
      if (this.dead) return;
      this.timer += dt;
      if (this.timer > this.life) { this.dead = true; return; }
      if (this.timer > this.delay && !this.hit) {
        const p = game.player;
        if (!p.dead && Math.abs((p.z || 0) - this.z) < 110 && U.circleRect(p.x, p.y - 25, 36, { x: this.x - this.w / 2, y: this.y - 70, w: this.w, h: 90 })) {
          if (p.hitBy(this.damage, this.x, game, this.kind === 'fire' ? '刘奥 · 焚心' : '刘奥 · 断岳')) this.hit = true;
        }
      }
    }
    draw(ctx, t) { Art.drawHazard(ctx, this, t); }
  }

  class Particle {
    constructor(x, y, vx, vy, life, size, color, gravity, additive) {
      this.x = x; this.y = y; this.vx = vx; this.vy = vy;
      this.life = life; this.maxLife = life; this.size = size;
      this.color = color; this.gravity = gravity || 0;
      this.additive = !!additive; this.dead = false;
      this.rot = Math.random() * TAU; this.rotV = U.rand(-4, 4);
      this.drag = .96;
    }
    update(dt) {
      this.life -= dt;
      if (this.life <= 0) { this.dead = true; return; }
      this.vy += this.gravity * dt;
      this.vx *= Math.pow(this.drag, dt * 60);
      this.vy *= Math.pow(.997, dt * 60);
      this.x += this.vx * dt; this.y += this.vy * dt;
      this.rot += this.rotV * dt;
    }
    draw(ctx) {
      const a = U.clamp(this.life / this.maxLife, 0, 1);
      if (this.additive) ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a;
      ctx.fillStyle = this.color;
      if (this.gravity === 0 && this.life > .5) {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size * (.55 + a * .8), 0, TAU); ctx.fill();
      } else {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot);
        ctx.fillRect(-this.size * .5, -this.size * .5, this.size, this.size * (this.size > 3 ? 1.6 : .8));
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (this.additive) ctx.globalCompositeOperation = 'source-over';
    }
  }

  class FloatingText {
    constructor(x, y, text, color, size, opts) {
      this.x = x; this.y = y; this.text = text; this.color = color || '#fff';
      this.size = size || 22; this.life = (opts && opts.life) || .9;
      this.maxLife = this.life; this.vy = (opts && opts.vy) || -80;
      this.vx = (opts && opts.vx) || U.rand(-15, 15);
      this.dead = false;
      this.bold = opts && opts.bold;
    }
    update(dt) {
      this.life -= dt; if (this.life <= 0) this.dead = true;
      this.x += this.vx * dt; this.y += this.vy * dt; this.vy += 90 * dt;
      this.vx *= .98;
    }
    draw(ctx) {
      const a = U.clamp(this.life / this.maxLife * 1.7, 0, 1);
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = `${this.bold ? '700 ' : ''}${this.size}px "STKaiti","KaiTi",serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = this.color;
      ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 8;
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  window.Player = Player;
  window.Enemy = Enemy;
  window.Boss = Boss;
  window.Projectile = Projectile;
  window.Hazard = Hazard;
  window.Particle = Particle;
  window.FloatingText = FloatingText;
  window.ENEMY_TYPES = ENEMY_TYPES;
  window.ELITE_NAMES = ELITE_NAMES;
  window.GAME_GROUND = GROUND;
})();
