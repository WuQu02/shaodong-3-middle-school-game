/* 三中风云 — 游戏主控 */
(function () {
  'use strict';

  const SAVE_KEY = 'sanzhongfengyun_save_v1';
  const SETTINGS_KEY = 'sanzhongfengyun_settings_v1';
  const ACH_KEY = 'sanzhongfengyun_achievements_v1';
  const GROUND = window.GAME_GROUND || 850;
  const DIALOGUE_NAMES = {
    shen: 'DeepSeek', liuao: '刘奥', alan: '刘亚岚', narrator: '周娣', echo: '回响', system: '心念'
  };
  const TAU = Math.PI * 2;
  const $ = (id) => document.getElementById(id);

  /* ===== 装备与武学数据 ===== */
  const RARITIES = [
    null,
    { id: 1, name: '凡品', cls: 'rarity-1' },
    { id: 2, name: '良品', cls: 'rarity-2' },
    { id: 3, name: '珍品', cls: 'rarity-3' },
    { id: 4, name: '传说', cls: 'rarity-4' }
  ];
  const EQUIP_SLOTS = { weapon: '剑器', head: '头饰', armor: '护身', charm: '佩饰' };
  const EQUIP_BASES = [
    { id: 'bamboo', slot: 'weapon', name: '竹枝剑' },
    { id: 'ruler', slot: 'weapon', name: '三角尺' },
    { id: 'chalk', slot: 'weapon', name: '粉笔刃' },
    { id: 'deskleg', slot: 'weapon', name: '课桌腿' },
    { id: 'uniform', slot: 'armor', name: '蓝白校服' },
    { id: 'winter', slot: 'armor', name: '冬季校服' },
    { id: 'jersey', slot: 'armor', name: '篮球背心' },
    { id: 'coat', slot: 'armor', name: '值班大衣' },
    { id: 'bell', slot: 'charm', name: '老校铃' },
    { id: 'pinecone', slot: 'charm', name: '松果' },
    { id: 'glasses', slot: 'charm', name: '教导主任的墨镜' },
    { id: 'exam', slot: 'charm', name: '期末试卷护符' },
    { id: 'catfur', slot: 'charm', name: '祥子的猫毛' }
  ];
  const AFFIXES = [
    { key: 'damage', label: '剑伤', min: .04, max: .10, pct: true },
    { key: 'maxHp', label: '生命', min: 10, max: 34, pct: false },
    { key: 'moveSpeed', label: '移速', min: .02, max: .06, pct: true },
    { key: 'qiRegen', label: 'Token 回复', min: .5, max: 1.8, pct: false },
    { key: 'dashCd', label: '闪身冷却', min: -.09, max: -.03, pct: true },
    { key: 'perfectWindow', label: '闪身判定', min: .06, max: .18, pct: true },
    { key: 'skillDamage', label: '潮涌伤害', min: .06, max: .16, pct: true },
    { key: 'skillCd', label: '潮涌冷却', min: -.10, max: -.03, pct: true },
    { key: 'ultDamage', label: '鲸落伤害', min: .06, max: .18, pct: true }
  ];
  const SKILL_TREE = [
    {
      id: 'deflect', name: '卸势流', motto: '以静制动 · 借力反震',
      nodes: [
        { id: 'deflect1', name: '静水', desc: '卸势窗口 +15%', cost: 1 },
        { id: 'deflect2', name: '反震', desc: '卸势削减架势 +18', cost: 1, req: 'deflect1' },
        { id: 'deflect3', name: '回澜', desc: '卸势成功回复 12 Token', cost: 1, req: 'deflect2' }
      ]
    },
    {
      id: 'dodge', name: '闪避流', motto: '踏雪无痕 · 残影留形',
      nodes: [
        { id: 'dodge1', name: '踏雪', desc: '闪身冷却 -10%', cost: 1 },
        { id: 'dodge2', name: '残影', desc: '完美闪身判定 +30%', cost: 1, req: 'dodge1' },
        { id: 'dodge3', name: '时缓', desc: '子弹时间延长 0.5 秒', cost: 1, req: 'dodge2' }
      ]
    },
    {
      id: 'art', name: '奇术流', motto: '潮生鲸落 · 心念回流',
      nodes: [
        { id: 'art1', name: '潮生', desc: '潮涌斩伤害 +20%', cost: 1 },
        { id: 'art2', name: '回流', desc: 'Token 回复 +1.5 / 秒', cost: 1, req: 'art1' },
        { id: 'art3', name: '鲸歌', desc: '鲸落伤害 +25%', cost: 1, req: 'art2' }
      ]
    }
  ];
  const BAG_LIMIT = 40;

  class Game {
    constructor() {
      this.canvas = $('game');
      this.ctx = this.canvas.getContext('2d');
      this.input = new Input();
      this.audio = new AudioEngine();
      this.el = {
        title: $('titleScreen'), continueBtn: $('continueBtn'),
        hud: $('hud'), hudPortrait: $('hudPortrait'), hudName: $('hudName'), hudChapter: $('hudChapter'),
        hpFill: $('hpFill'), hpText: $('hpText'), qiFill: $('qiFill'), postureFill: $('postureFill'),
        flaskCount: $('flaskCount'), focusText: $('focusText'), focusBadge: $('focusBadge'),
        stageLabel: $('stageLabel'), timerText: $('timerText'), objective: $('objective'),
        combo: $('comboDisplay'), comboNumber: $('comboNumber'), comboRank: $('comboRank'),
        bossBar: $('bossBar'), bossName: $('bossName'), bossTitle: $('bossTitle'),
        bossPhase: $('bossPhase'), bossFill: $('bossFill'),
        toast: $('toast'), chapterCard: $('chapterCard'), chapterCardNum: $('chapterCardNum'),
        interactPrompt: $('interactPrompt'), interactName: $('interactName'),
        omenToast: $('omenToast'), omenName: $('omenName'), omenSub: $('omenSub'),
        achToast: $('achievementToast'), achToastSeal: $('achToastSeal'), achToastName: $('achToastName'), achToastDesc: $('achToastDesc'),
        achScreen: $('achievementsScreen'), achList: $('achievementList'), achProgressText: $('achProgressText'), buffBadge: $('buffBadge'),
        levelText: $('levelText'), xpFill: $('xpFill'), xpText: $('xpText'), attrBadge: $('attrBadge'),
        growthScreen: $('growthScreen'), growthPoints: $('growthPoints'), growthLevel: $('growthLevel'),
        growthXp: $('growthXp'), growthKills: $('growthKills'), growthSkillPoints: $('growthSkillPoints'),
        growthSkillBranches: $('growthSkillBranches'), growthAttrPanel: $('growthAttrPanel'),
        equipScreen: $('equipmentScreen'), equipSlots: $('equipSlots'), equipBag: $('equipBag'),
        equipCount: $('equipCount'), equipHint: $('equipHint'),
        equipSlotsPanel: $('equipSlotsPanel'), equipItemsPanel: $('equipItemsPanel'),
        equipCraftPanel: $('equipCraftPanel'), itemList: $('itemList'), recipeList: $('recipeList'),
        sanFill: $('sanFill'), sanText: $('sanText'), disguiseChip: $('disguiseChip'), disguiseText: $('disguiseText'),
        dateChip: $('dateChip'), examDays: $('examDays'), visionChip: $('visionChip'), companionChips: $('companionChips'),
        companionScreen: $('companionScreen'), companionList: $('companionList'), companionActive: $('companionActive'),
        journalScreen: $('journalScreen'), journalBody: $('journalBody'), journalExamDays: $('journalExamDays'),
        zoneScreen: $('zoneScreen'), zoneMap: $('zoneMap'), zoneDetail: $('zoneDetail'),
        zoneClock: $('zoneClock'), zoneSan: $('zoneSan'), zoneExamDays: $('zoneExamDays'), zoneLog: $('zoneLog'),
        zoneChip: $('zoneChip'), journalChip: $('journalChip'),
        photoScreen: $('photoScreen'), photoFile: $('photoFile'), photoName: $('photoName'),
        photoFaction: $('photoFaction'), photoAI: $('photoAI'), photoStatus: $('photoStatus'),
        attrStr: $('attrStr'), attrAgi: $('attrAgi'), attrVit: $('attrVit'),
        chapterCardName: $('chapterCardName'), chapterCardSub: $('chapterCardSub'),
        tutorial: $('tutorial'), bark: $('subtitleBark'),
        dialogue: $('dialogue'), dialoguePortrait: $('dialoguePortrait'),
        dialogueName: $('dialogueName'), dialogueText: $('dialogueText'), dialogueChoices: $('dialogueChoices'),
        cinematic: $('cinematic'), cinemaChapter: $('cinemaChapter'), cinemaSkip: $('cinemaSkip'), cinemaPortrait: $('cinemaPortrait'),
        cinemaText: $('cinemaText'), cinemaSpeaker: $('cinemaSpeaker'), cinemaHint: $('cinemaHint'),
        pause: $('pauseScreen'), help: $('helpScreen'), settings: $('settingsScreen'),
        nameScreen: $('nameScreen'), playerNameInput: $('playerNameInput'),
        upgrade: $('upgradeScreen'), upgradeCards: $('upgradeCards'),
        death: $('deathScreen'), bigCai: $('bigCai'),
        victoryStamp: $('victoryStamp'), ending: $('endingScreen'), endingStats: $('endingStats'),
        touch: $('touchControls'),
        volMaster: $('volMaster'), volMusic: $('volMusic'), volSfx: $('volSfx'), volVoice: $('volVoice'),
        volMasterVal: $('volMasterVal'), volMusicVal: $('volMusicVal'),
        volSfxVal: $('volSfxVal'), volVoiceVal: $('volVoiceVal'),
        toggleShake: $('toggleShake'), toggleMotion: $('toggleMotion')
      };
      this.state = 'boot';
      this.time = 0;
      this.playTime = 0;
      this.last = 0;
      this.audioReady = false;
      this.level = null;
      this.chapter = 0;
      this.cleared = 0;
      this.upgrades = [];
      this._scholarSpoke = false; this._athleteSpoke = false;
      this.rpg = this.defaultRpg();
      this.lastDeathPenalty = 0;
      this.lastDeathItem = '';
      this.mods = this.computeMods();
      this.deaths = 0;
      this.stats = { enemies: 0, perfect: 0, maxCombo: 0, damage: 0 };
      this.campusLayer = window.CampusSystems ? window.CampusSystems.createLayer(this) : null;
      this.rpg = this.normalizeRpg(this.rpg);
      this.equipTab = 'equip';
      this.journalTab = 'calendar';
      this.inputInvert = false;
      this.completed = false;
      this.worldWidth = 1920;
      this.stageIndex = 0;
      this.damageScale = 1;
      this.camera = { x: 960, y: 0, z: 0 };
      this.shakePower = 0;
      this.hitstop = 0;
      this.slowTimer = 0;
      this.flash = null;
      this.ultFx = null;
      this.combo = 0;
      this.comboTimer = 0;
      this.bossTarget = null;
      this.pendingClear = null;
      this.pendingStartDialogue = false;
      this.chapterIntroTimer = 0;
      this.chapterIntroDone = true;
      this.arenaLock = false;
      this.bounds = { left: 0, right: 1920 };
      this.enemies = [];
      this.projectiles = [];
      this.hazards = [];
      this.particles = [];
      this.texts = [];
      this.encounterActive = false;
      this.encounterIndex = 0;
      this.currentEncounter = null;
      this.encounterWaves = [];
      this.waveIndex = 0;
      this.waveTimer = 0;
      this.boss = null;
      this.dialogueActive = false;
      this.choiceActive = false;
      this.dialogueTyping = false;
      this.dialogueQueue = [];
      this.dialogueIndex = 0;
      this.dialogueChars = 0;
      this.dialogueAdvanceRequested = false;
      this.dialogueReturn = 'playing';
      this.dialogueOnComplete = null;
      this.dialogueFull = '';
      this.cinemaScenes = [];
      this.cinemaIndex = 0;
      this.cinemaSceneT = 0;
      this.cinemaMode = null;
      this.tipTimers = [];
      this.tipsShown = false;
      this.toastTimer = null;
      this.barkTimer = null;
      this.deathTimer = 0;
      this.victoryTimer = 0;
      this.victoryStampShown = false;
      this.modalReturn = null;
      this.settings = this.loadSettings();
      this.playerName = this.settings.playerName || 'DeepSeek';
      this.namePromptOpen = false;
      this.achData = this.loadAchievements();
      this.achQueue = [];
      this.achShowing = false;
      this.achToastTimer = null;
      this.secrets = [];
      this.three = null;
      try {
        if (window.ThreeWorld) this.three = new ThreeWorld(this);
      } catch (e) {
        console.warn('3D 场景初始化失败，使用二维回退。', e);
        this.three = null;
      }
      this.bindUI();
      this.resize();
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state === 'playing') this.togglePause(true);
      });
      this.syncSettingsUI();
      this.showTitle();
      this.last = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    /* ================= 基础 ================= */
    bindUI() {
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) { e.preventDefault(); this.handleAction(btn.dataset.action, btn); return; }
        const up = e.target.closest('[data-upgrade]');
        if (up) { e.preventDefault(); this.chooseUpgrade(up.dataset.upgrade); }
      });
      this.el.dialogue.addEventListener('click', (e) => {
        e.preventDefault();
        this.dialogueAdvanceRequested = true;
      });
      this.el.cinematic.addEventListener('click', (e) => {
        if (e.target.closest('#cinemaSkip')) return;
        this.advanceCinematic();
      });
      this.el.cinemaSkip.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        this.skipCinematic();
      });
      const unlock = () => { this.ensureAudio(); this.audio.resume(); };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock);
      window.addEventListener('pointerdown', (e) => this.handlePetPointer(e), { passive: true });

      [['volMaster', 'master'], ['volMusic', 'music'], ['volSfx', 'sfx'], ['volVoice', 'voice']].forEach(([id, key]) => {
        const el = this.el[id];
        el.addEventListener('input', () => {
          this.settings[key] = Number(el.value);
          this.el[id + 'Val'].textContent = el.value;
          this.applyVolumes();
          this.saveSettings();
        });
      });
      this.el.toggleShake.addEventListener('change', () => {
        this.settings.shake = this.el.toggleShake.checked;
        this.saveSettings();
      });
      this.el.toggleMotion.addEventListener('change', () => {
        this.settings.reducedMotion = this.el.toggleMotion.checked;
        this.saveSettings();
      });
      this.el.playerNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); this.confirmPlayerName(); }
        else if (e.key === 'Escape') { e.preventDefault(); this.cancelNamePrompt(); }
      });
      if (U.isTouch()) this.el.touch.classList.remove('hidden');
    }

    handlePetPointer(e) {
      if (this.state !== 'playing' || !this.three || this.three.failed || !this.player) return;
      if (e.target && e.target.closest && e.target.closest('button,input,.screen,.dialogue,.cinematic')) return;
      const p = this.three.projectPet();
      if (!p || !p.visible) return;
      const sx = this.offsetX + p.x * this.renderScale;
      const sy = this.offsetY + p.y * this.renderScale;
      if (Math.hypot(e.clientX - sx, e.clientY - sy) < 110) this.petWhale();
    }

    handleAction(action, btn) {
      this.ensureAudio();
      const selfSfx = ['attrStr', 'attrAgi', 'attrVit', 'equipItem', 'unequipSlot', 'discardItem'].includes(action);
      if (!selfSfx) this.audio.sfx(action === 'title' || action === 'closeSettings' ? 'uiBack' : 'ui');
      switch (action) {
        case 'new': this.beginNewGamePrompt(); break;
        case 'achievements': this.openAchievements(); break;
        case 'closeAchievements': this.closeAchievements(); break;
        case 'continue': this.continueGame(); break;
        case 'confirmName': this.confirmPlayerName(); break;
        case 'cancelName': this.cancelNamePrompt(); break;
        case 'help': this.openHelp(); break;
        case 'settings': this.openSettings(); break;
        case 'closeHelp': this.closeHelp(); break;
        case 'closeSettings': this.closeSettings(); break;
        case 'resume': this.resumeGame(); break;
        case 'pause': this.togglePause(true); break;
        case 'title': this.returnToTitle(); break;
        case 'retry': this.retryStage(); break;
        case 'closeGrowth': this.closeGrowth(); break;
        case 'attrStr': this.allocateAttr('str'); break;
        case 'attrAgi': this.allocateAttr('agi'); break;
        case 'attrVit': this.allocateAttr('vit'); break;
        case 'growthTab': if (btn) this.switchGrowthTab(btn.dataset.tab || 'attr'); break;
        case 'learnSkill': if (btn) this.learnSkill(btn.dataset.skill); break;
        case 'closeEquipment': this.closeEquipment(); break;
        case 'equipItem': if (btn) this.equipItem(btn.dataset.uid); break;
        case 'unequipSlot': if (btn) this.unequipSlot(btn.dataset.slot); break;
        case 'discardItem': if (btn) this.discardItem(btn.dataset.uid); break;
        case 'equipTab': if (btn) this.switchEquipTab(btn.dataset.tab || 'equip'); break;
        case 'useItem': if (btn && this.campusLayer) this.campusLayer.inventory.use(btn.dataset.item, this); break;
        case 'craftItem': if (btn && this.campusLayer) this.campusLayer.inventory.craft(btn.dataset.recipe, this); break;
        case 'journalTab': if (btn) { this.journalTab = btn.dataset.tab || 'calendar'; if (this.campusLayer) this.campusLayer.renderJournal(); } break;
        case 'classQuest': if (btn && this.campusLayer) this.campusLayer.classQuests.run(btn.dataset.id); break;
        case 'closeJournal': if (this.campusLayer) this.campusLayer.closePanel('journal'); break;
        case 'closeCompanions': if (this.campusLayer) this.campusLayer.closePanel('companions'); break;
        case 'closeZones': if (this.campusLayer) this.campusLayer.closePanel('zones'); break;
        case 'photos': this.openPhotos(); break;
        case 'closePhotos': this.closePhotos(); break;
        case 'importPhoto': this.importPhoto(); break;
        case 'clearPhotos':
          if (this.campusLayer && this.campusLayer.photos) {
            this.campusLayer.photos.clear();
            if (this.el.photoStatus) this.el.photoStatus.textContent = '已清除本次导入的全部照片角色。';
            this.showToast('已清除照片角色', '');
          }
          break;
        case 'zoneSelect': if (btn && this.campusLayer) this.campusLayer.zones.select(btn.dataset.zone); break;
        case 'zoneAct': if (btn && this.campusLayer) this.campusLayer.zones.act(btn.dataset.act); break;
        case 'zoneEvent': if (btn && this.campusLayer) this.campusLayer.zones.resolveEvent(btn.dataset.value); break;
        case 'toggleCompanion': if (btn && this.campusLayer) { this.campusLayer.companions.setActive(btn.dataset.id, this); } break;
        case 'purifyCompanion': if (btn && this.campusLayer) this.campusLayer.companions.purify(btn.dataset.id, this); break;
        case 'abandonCompanion': if (btn && this.campusLayer) this.campusLayer.companions.abandon(btn.dataset.id, this); break;
      }
    }

    switchEquipTab(tab) {
      this.equipTab = tab || 'equip';
      const map = { equip: this.el.equipSlotsPanel, items: this.el.equipItemsPanel, craft: this.el.equipCraftPanel };
      for (const k of Object.keys(map)) if (map[k]) map[k].classList.toggle('hidden', k !== this.equipTab);
      if (this.el.equipScreen) {
        this.el.equipScreen.querySelectorAll('[data-action="equipTab"]').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === this.equipTab));
      }
      if (this.equipTab === 'equip') this.renderEquipment();
      if (this.equipTab === 'items' && this.campusLayer) this.campusLayer.inventory.renderItems(this.el.itemList, this);
      if (this.equipTab === 'craft' && this.campusLayer) this.campusLayer.inventory.renderRecipes(this.el.recipeList, this);
    }

    ensureAudio() {
      if (this.audioReady) return;
      this.audio.init();
      this.audioReady = true;
      this.applyVolumes();
      if (this.state === 'title') this.audio.startMusic('title');
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.dpr = dpr;
      this.vw = window.innerWidth; this.vh = window.innerHeight;
      this.canvas.width = Math.max(1, Math.round(this.vw * dpr));
      this.canvas.height = Math.max(1, Math.round(this.vh * dpr));
      this.canvas.style.width = this.vw + 'px';
      this.canvas.style.height = this.vh + 'px';
      this.renderScale = Math.min(this.vw / 1920, this.vh / 1080);
      this.offsetX = (this.vw - 1920 * this.renderScale) / 2;
      this.offsetY = (this.vh - 1080 * this.renderScale) / 2;
      document.documentElement.style.setProperty('--ui-scale', this.renderScale);
      if (this.three && !this.three.failed) this.three.resize();
    }

    loadSettings() {
      return Object.assign({
        master: 80, music: 55, sfx: 75, voice: 80, shake: true, reducedMotion: false, playerName: 'DeepSeek'
      }, U.storageGet(SETTINGS_KEY, {}));
    }
    saveSettings() { U.storageSet(SETTINGS_KEY, this.settings); }
    formatText(text) { return String(text == null ? '' : text).replace(/\{name\}/g, this.playerName || 'DeepSeek'); }

    loadAchievements() {
      const d = U.storageGet(ACH_KEY, {});
      return {
        unlocked: (d && d.unlocked) || {},
        perfect: (d && d.perfect) || 0,
        secrets: Array.isArray(d && d.secrets) ? d.secrets.slice() : [],
        interacted: Array.isArray(d && d.interacted) ? d.interacted.slice() : [],
        busy: (d && d.busy) || 0
      };
    }
    saveAchievements() { U.storageSet(ACH_KEY, this.achData); }

    unlockAchievement(id) {
      const a = (window.ACHIEVEMENTS || []).find(x => x.id === id);
      if (!a || this.achData.unlocked[id]) return;
      this.achData.unlocked[id] = true;
      this.saveAchievements();
      this.queueAchToast(a);
      this.renderAchievements();
    }

    queueAchToast(a) {
      this.achQueue.push(a);
      if (!this.achShowing) this.showNextAchToast();
    }
    showNextAchToast() {
      if (this.achShowing) return;
      const a = this.achQueue.shift();
      if (!a) return;
      this.achShowing = true;
      this.el.achToastSeal.textContent = a.seal;
      this.el.achToastName.textContent = a.name;
      this.el.achToastDesc.textContent = a.desc;
      this.el.achToast.classList.add('show');
      this.audio.sfx('life');
      clearTimeout(this.achToastTimer);
      this.achToastTimer = setTimeout(() => {
        this.el.achToast.classList.remove('show');
        setTimeout(() => { this.achShowing = false; this.showNextAchToast(); }, 450);
      }, 3300);
    }

    renderAchievements() {
      if (!this.el.achList) return;
      const list = window.ACHIEVEMENTS || [];
      const unlocked = this.achData.unlocked || {};
      const count = list.filter(a => unlocked[a.id]).length;
      this.el.achProgressText.textContent = `${count} / ${list.length}`;
      this.el.achList.innerHTML = '';
      for (const a of list) {
        const got = !!unlocked[a.id];
        const card = document.createElement('div');
        card.className = 'achievement-card' + (got ? '' : ' locked');
        const seal = document.createElement('div'); seal.className = 'seal'; seal.textContent = got ? a.seal : '？';
        const copy = document.createElement('div');
        const b = document.createElement('b'); b.textContent = got ? a.name : '未写入心录';
        const p = document.createElement('p'); p.textContent = got ? a.desc : '尚未写下。去风雪里找找看。';
        copy.append(b, p); card.append(seal, copy); this.el.achList.appendChild(card);
      }
    }

    openAchievements() {
      if (this.state === 'playing') this.togglePause(true);
      this.modalReturn = this.state === 'paused' ? 'pause' : 'title';
      this.el.pause.classList.add('hidden');
      this.el.help.classList.add('hidden');
      this.el.settings.classList.add('hidden');
      this.el.achScreen.classList.remove('hidden');
      this.renderAchievements();
      this.audio.sfx('ui');
    }
    closeAchievements() {
      this.el.achScreen.classList.add('hidden');
      if (this.modalReturn === 'pause') this.el.pause.classList.remove('hidden');
      this.modalReturn = null;
    }

    initSecrets() {
      this.secrets = [];
      if (!this.level) return;
      const s = (window.SECRET_LORE || {})[this.level.id];
      if (s && !this.achData.secrets.includes(s.id)) this.secrets.push({ ...s, collected: false });
    }
    collectSecret(s) {
      if (!s || s.collected) return;
      s.collected = true;
      if (!this.achData.secrets.includes(s.id)) this.achData.secrets.push(s.id);
      this.saveAchievements();
      this.audio.sfx('life');
      this.showToast(`彩蛋 · 鲸影 ${this.achData.secrets.length} / 3`, 'gold');
      this.bark('鲸影', s.text, null);
      this.addText(this.player.x, this.player.y - 210, '鲸影', '#bffaff', 28, { bold: true, life: 1.2 });
      this.spawnBurst(this.player.x, 760, '#a3f6ff', 26, 220, { size: 3, life: .8, gravity: 20, additive: true });
      if (this.achData.secrets.length >= 3) this.unlockAchievement('deepsea');
    }

    petWhale() {
      if (!this.player) return;
      this.unlockAchievement('whale_pet');
      this.audio.sfx('life');
      this.bark('小鲸', '小鲸开心地转了个圈，吐出一个蓝色的泡泡。', null);
      this.addText(this.player.x + 45, this.player.y - 190, '贴贴 ♡', '#9ff7ff', 23, { bold: true, life: 1.1 });
      for (let i = 0; i < 12; i++) {
        this.spawnParticle(this.player.x + 60 + U.rand(-30, 30), this.player.y - 150 + U.rand(-20, 20), U.rand(-40, 40), -U.rand(30, 100), U.rand(.5, 1), U.rand(2, 4), '#9ff7ff', 0, true);
      }
    }
    syncSettingsUI() {
      this.el.volMaster.value = this.settings.master; this.el.volMasterVal.textContent = this.settings.master;
      this.el.volMusic.value = this.settings.music; this.el.volMusicVal.textContent = this.settings.music;
      this.el.volSfx.value = this.settings.sfx; this.el.volSfxVal.textContent = this.settings.sfx;
      this.el.volVoice.value = this.settings.voice; this.el.volVoiceVal.textContent = this.settings.voice;
      this.el.toggleShake.checked = !!this.settings.shake;
      this.el.toggleMotion.checked = !!this.settings.reducedMotion;
    }
    applyVolumes() {
      this.audio.setVolumes({
        master: this.settings.master / 100,
        music: this.settings.music / 100,
        sfx: this.settings.sfx / 100,
        voice: this.settings.voice / 100
      });
    }

    /* ================= 循环 ================= */
    loop(now) {
      let dt = (now - this.last) / 1000;
      if (!isFinite(dt) || dt <= 0) dt = .016;
      dt = Math.min(dt, .05);
      this.last = now;
      this.time += dt;
      this.input.update();

      if (['playing', 'dialogue', 'dying', 'victory'].includes(this.state)) this.playTime += dt;

      try {
        if (this.state === 'playing') {
          if (this.input.justPressed('vision')) { if (this.campusLayer) this.campusLayer.vision.toggle(this); }
          else if (this.input.justPressed('growth')) this.openGrowth();
          else if (this.input.justPressed('bag')) this.openEquipment();
          else if (this.input.justPressed('journal')) { if (this.campusLayer) this.campusLayer.openPanel('journal'); }
          else if (this.input.justPressed('companions')) { if (this.campusLayer) this.campusLayer.openPanel('companions'); }
          else if (this.input.justPressed('zones')) { if (this.campusLayer) this.campusLayer.openPanel('zones'); }
          else if (this.input.justPressed('pause')) this.togglePause(true);
          else this.updateWorld(dt);
        } else if (this.state === 'paused') {
          if (this.input.justPressed('pause')) this.resumeGame();
        } else if (this.state === 'growth') {
          if (this.input.justPressed('growth') || this.input.justPressed('pause')) this.closeGrowth();
        } else if (this.state === 'equipment') {
          if (this.input.justPressed('bag') || this.input.justPressed('pause')) this.closeEquipment();
        } else if (this.state === 'journal') {
          if (this.input.justPressed('journal') || this.input.justPressed('pause')) this.campusLayer.closePanel('journal');
        } else if (this.state === 'companions') {
          if (this.input.justPressed('companions') || this.input.justPressed('pause')) this.campusLayer.closePanel('companions');
        } else if (this.state === 'zones') {
          if (this.input.justPressed('zones') || this.input.justPressed('pause')) this.campusLayer.closePanel('zones');
        } else if (this.state === 'photo') {
          if (this.input.justPressed('pause')) this.closePhotos();
        } else if (this.state === 'dialogue') {
          this.updateDialogue(dt);
        } else if (this.state === 'intro' || this.state === 'ending') {
          this.updateCinematic(dt);
        } else if (this.state === 'dying') {
          this.updateDying(dt);
        } else if (this.state === 'victory') {
          this.updateVictory(dt);
        } else if (this.state === 'title') {
          if (this.input.justPressed('confirm-key') && !this.namePromptOpen && this.el.help.classList.contains('hidden') && this.el.settings.classList.contains('hidden') && this.el.achScreen.classList.contains('hidden')) {
            this.beginNewGamePrompt();
          }
        }

        this.updateEffects(dt);
        this.updateHUD();
        this.audio.update();
        this.render();
      } catch (err) {
        console.error('梦境更新异常', err);
      }
      this.input.endFrame();
      requestAnimationFrame((t) => this.loop(t));
    }

    updateEffects(dt) {
      this.shakePower = Math.max(0, this.shakePower * Math.pow(.035, dt) - dt * .7);
      if (this.flash) { this.flash.life -= dt; if (this.flash.life <= 0) this.flash = null; }
      if (this.slowTimer > 0) this.slowTimer = Math.max(0, this.slowTimer - dt);
      if (this.hitstop > 0) this.hitstop = Math.max(0, this.hitstop - dt);
      if (this.ultFx) {
        this.ultFx.t += dt;
        if (!this.ultFx.active && this.player) {
          this.ultFx.x = this.player.x; this.ultFx.y = this.player.y - 100;
        }
        if (this.ultFx.t > 2.2) this.ultFx = null;
      }
    }

    addShake(v) {
      if (!this.settings.shake) return;
      this.shakePower = Math.min(30, this.shakePower + v);
    }
    flashScreen(color, dur) {
      this.flash = { color, life: dur, max: dur };
    }

    /* ================= 标题 / 开关 ================= */
    showTitle() {
      this.state = 'title';
      this.level = null;
      this.el.title.classList.remove('hidden');
      this.el.hud.classList.add('hidden');
      this.el.bossBar.classList.add('hidden');
      this.el.dialogue.classList.add('hidden');
      this.el.cinematic.classList.add('hidden');
      this.el.pause.classList.add('hidden');
      this.el.help.classList.add('hidden');
      this.el.settings.classList.add('hidden');
      this.el.nameScreen.classList.add('hidden');
      this.el.achScreen.classList.add('hidden');
      this.el.growthScreen.classList.add('hidden');
      this.el.equipScreen.classList.add('hidden');
      this.el.companionScreen.classList.add('hidden');
      this.el.journalScreen.classList.add('hidden');
      this.el.zoneScreen.classList.add('hidden');
      this.el.photoScreen.classList.add('hidden');
      this.el.achToast.classList.remove('show');
      this.el.omenToast.classList.remove('show');
      this.el.upgrade.classList.add('hidden');
      this.el.death.classList.add('hidden');
      this.el.victoryStamp.classList.add('hidden');
      this.el.ending.classList.add('hidden');
      this.namePromptOpen = false;
      this.el.chapterCard.classList.remove('show');
      this.el.tutorial.innerHTML = '';
      this.el.bark.classList.remove('show');
      this.el.toast.classList.remove('show');
      clearTimeout(this.toastTimer);
      clearTimeout(this.barkTimer);
      this.clearTipTimers();
      this.el.touch.classList.add('hidden');
      this.el.combo.classList.remove('active');
      this.el.bossBar.classList.add('hidden');
      const save = this.readSave();
      this.el.continueBtn.hidden = !save || save.completed;
      this.audio.stopVoice();
      if (this.audioReady) this.audio.startMusic('title');
    }

    beginNewGamePrompt() {
      this.ensureAudio();
      this.namePromptOpen = true;
      this.el.help.classList.add('hidden');
      this.el.settings.classList.add('hidden');
      this.el.pause.classList.add('hidden');
      this.el.nameScreen.classList.remove('hidden');
      this.el.playerNameInput.value = this.playerName || this.settings.playerName || 'DeepSeek';
      setTimeout(() => {
        if (!this.namePromptOpen) return;
        this.el.playerNameInput.focus();
        this.el.playerNameInput.select();
      }, 80);
    }

    cancelNamePrompt() {
      this.namePromptOpen = false;
      this.el.nameScreen.classList.add('hidden');
      this.input.reset();
    }

    confirmPlayerName() {
      if (!this.namePromptOpen) return;
      let name = (this.el.playerNameInput.value || '').replace(/[\r\n\t]/g, ' ').trim().replace(/\s+/g, ' ').slice(0, 10);
      if (!name) name = 'DeepSeek';
      this.playerName = name;
      this.settings.playerName = name;
      this.saveSettings();
      this.namePromptOpen = false;
      this.el.nameScreen.classList.add('hidden');
      this.startNewGame();
    }

    startNewGame() {
      this.ensureAudio();
      this.audio.stopVoice();
      this.clearTipTimers();
      this.playerName = this.playerName || this.settings.playerName || 'DeepSeek';
      this.chapter = 0;
      this.cleared = 0;
      this.upgrades = [];
      this._scholarSpoke = false; this._athleteSpoke = false;
      this.rpg = this.defaultRpg();
      this.lastDeathPenalty = 0;
      this.lastDeathItem = '';
      this.mods = this.computeMods();
      this.inputInvert = false;
      this.completed = false;
      this.deaths = 0;
      this.playTime = 0;
      this.stats = { enemies: 0, perfect: 0, maxCombo: 0, damage: 0 };
      this.tipsShown = false;
      if (this.campusLayer) this.campusLayer.onNewRun();
      this.mods = this.computeMods();
      this.level = null;
      this.boss = null;
      this.bossTarget = null;
      this.dialogueActive = false;
      U.storageDel(SAVE_KEY);
      this.el.title.classList.add('hidden');
      this.el.ending.classList.add('hidden');
      this.el.death.classList.add('hidden');
      this.el.upgrade.classList.add('hidden');
      this.el.pause.classList.add('hidden');
      this.el.help.classList.add('hidden');
      this.el.settings.classList.add('hidden');
      this.el.nameScreen.classList.add('hidden');
      this.el.achScreen.classList.add('hidden');
      this.el.dialogue.classList.add('hidden');
      this.el.victoryStamp.classList.add('hidden');
      this.el.bossBar.classList.add('hidden');
      this.el.hud.classList.add('hidden');
      this.el.tutorial.innerHTML = '';
      this.namePromptOpen = false;
      this.unlockAchievement('awaken');
      if (/刘奥|刘亚岚/.test(this.playerName)) this.unlockAchievement('same_name');
      this.startIntro();
    }

    startIntro() {
      this.state = 'intro';
      this.cinemaMode = 'intro';
      this.cinemaScenes = STORY.intro;
      this.cinemaIndex = 0;
      this.cinemaSceneT = 0;
      this.level = null;
      this.el.cinematic.classList.remove('hidden');
      this.el.cinemaSkip.innerHTML = '跳过序幕 <kbd>Esc</kbd>';
      this.el.hud.classList.add('hidden');
      this.el.touch.classList.add('hidden');
      this.audio.startMusic('intro');
      this.showCinemaScene();
    }

    continueGame() {
      this.ensureAudio();
      const save = this.readSave();
      if (!save || save.completed) { this.beginNewGamePrompt(); return; }
      this.playerName = save.playerName || this.settings.playerName || 'DeepSeek';
      this.settings.playerName = this.playerName;
      this.chapter = U.clamp(save.chapter || 0, 0, LEVELS.length - 1);
      this.cleared = save.cleared || 0;
      this.upgrades = Array.isArray(save.upgrades) ? save.upgrades : [];
      this.rpg = this.normalizeRpg(save.rpg);
      if (this.campusLayer) this.campusLayer.onContinue();
      this.lastDeathPenalty = 0;
      this.lastDeathItem = '';
      this.inputInvert = false;
      this.playTime = save.playTime || 0;
      this.deaths = save.deaths || 0;
      this.stats = Object.assign({ enemies: 0, perfect: 0, maxCombo: 0, damage: 0 }, save.stats || {});
      this.completed = false;
      this.tipsShown = true;
      this.el.title.classList.add('hidden');
      this.startChapter(this.chapter, this.cleared, { resume: true, noIntroDialogue: this.cleared > 0 });
    }

    returnToTitle() {
      this.audio.stopVoice();
      this.el.title.classList.remove('hidden');
      this.showTitle();
      this.input.reset();
    }

    /* ================= 存档 ================= */
    defaultRpg() {
      return {
        level: 1, xp: 0, xpNext: 100, attrPoints: 0, skillPoints: 0, str: 1, agi: 1, vit: 1, kills: 0,
        skills: {}, bag: [], equipped: { weapon: null, head: null, armor: null, charm: null }, uid: 1
      };
    }
    xpForLevel(level) {
      return Math.round(100 * Math.pow(1.32, Math.max(0, level - 1)));
    }
    normalizeItem(raw, forceSlot) {
      if (!raw || typeof raw !== 'object') return null;
      const slot = forceSlot || raw.slot;
      if (!EQUIP_SLOTS[slot]) return null;
      const rarity = U.clamp(Math.floor(Number(raw.rarity) || 1), 1, 4);
      const defs = {};
      for (const d of AFFIXES) defs[d.key] = d;
      const affixes = Array.isArray(raw.affixes) ? raw.affixes.filter(a => a && defs[a.key]).slice(0, 4).map(a => ({
        key: a.key,
        label: defs[a.key].label,
        value: Math.max(-.9, Number(a.value) || 0),
        pct: !!defs[a.key].pct
      })) : [];
      return {
        uid: Math.max(0, Math.floor(Number(raw.uid) || 0)),
        base: String(raw.base || 'custom').slice(0, 24),
        name: String(raw.name || '无名器物').slice(0, 40),
        slot,
        rarity,
        affixes,
        level: Math.max(1, Math.floor(Number(raw.level) || 1)),
        special: typeof raw.special === 'string' ? raw.special.slice(0, 24) : undefined,
        durability: Math.max(0, Math.floor(Number(raw.durability) || 0))
      };
    }
    normalizeRpg(raw) {
      const rpg = Object.assign(this.defaultRpg(), raw && typeof raw === 'object' ? raw : {});
      if (window.CampusSystems && window.CampusSystems.normalizeRpg) window.CampusSystems.normalizeRpg(rpg);
      rpg.level = Math.max(1, Math.floor(Number(rpg.level) || 1));
      rpg.xp = Math.max(0, Math.floor(Number(rpg.xp) || 0));
      rpg.attrPoints = Math.max(0, Math.floor(Number(rpg.attrPoints) || 0));
      rpg.skillPoints = Math.max(0, Math.floor(Number(rpg.skillPoints) || 0));
      rpg.str = Math.max(1, Math.floor(Number(rpg.str) || 1));
      rpg.agi = Math.max(1, Math.floor(Number(rpg.agi) || 1));
      rpg.vit = Math.max(1, Math.floor(Number(rpg.vit) || 1));
      rpg.kills = Math.max(0, Math.floor(Number(rpg.kills) || 0));
      rpg.xpNext = Math.max(1, Math.floor(Number(rpg.xpNext) || this.xpForLevel(rpg.level)));
      const known = new Set();
      for (const branch of SKILL_TREE) for (const node of branch.nodes) known.add(node.id);
      const rawSkills = rpg.skills && typeof rpg.skills === 'object' ? rpg.skills : {};
      rpg.skills = {};
      for (const id of known) if (rawSkills[id]) rpg.skills[id] = true;
      rpg.bag = Array.isArray(rpg.bag) ? rpg.bag.map(it => this.normalizeItem(it)).filter(Boolean).slice(0, BAG_LIMIT) : [];
      const eq = rpg.equipped && typeof rpg.equipped === 'object' ? rpg.equipped : {};
      rpg.equipped = {
        weapon: this.normalizeItem(eq.weapon, 'weapon'),
        head: this.normalizeItem(eq.head, 'head'),
        armor: this.normalizeItem(eq.armor, 'armor'),
        charm: this.normalizeItem(eq.charm, 'charm')
      };
      let maxUid = Math.max(0, Math.floor(Number(rpg.uid) || 0));
      const all = rpg.bag.concat(Object.values(rpg.equipped).filter(Boolean));
      for (const it of all) maxUid = Math.max(maxUid, it.uid || 0);
      for (const it of all) if (!it.uid) it.uid = ++maxUid;
      rpg.uid = maxUid + 1;
      return rpg;
    }
    readSave() {
      const s = U.storageGet(SAVE_KEY, null);
      if (!s || typeof s !== 'object') return null;
      // v1 旧存档没有成长数据，读取时原地迁移到 v2。
      if (s.v !== 2) s.v = 2;
      s.rpg = this.normalizeRpg(s.rpg);
      return s;
    }
    saveGame(completed) {
      if (!this.level) return;
      const save = {
        v: 2,
        chapter: this.chapter,
        cleared: this.cleared,
        upgrades: this.upgrades.slice(),
        playTime: this.playTime,
        deaths: this.deaths,
        stats: this.stats,
        playerName: this.playerName,
        rpg: this.normalizeRpg(this.rpg),
        quests: this.quests || {},
        completed: completed === undefined ? this.completed : completed,
        time: Date.now()
      };
      U.storageSet(SAVE_KEY, save);
      this.el.continueBtn.hidden = save.completed;
    }

    /* ================= 成长 ================= */
    gainXp(amount) {
      if (!this.rpg || !amount) return;
      const r = this.rpg;
      if (this.campusLayer && this.campusLayer.factions) amount = Math.round(amount * this.campusLayer.factions.bonus().xp);
      r.xp += amount;
      let levels = 0;
      while (r.xp >= r.xpNext) {
        r.xp -= r.xpNext;
        r.level++;
        r.attrPoints += 3;
        r.skillPoints += 1;
        levels++;
        r.xpNext = this.xpForLevel(r.level);
      }
      if (!levels) return;
      this.applyGrowthStats(true);
      this.flashScreen('#ffe3ad', .2);
      this.addShake(8);
      this.audio.sfx('checkpoint');
      if (this.player) {
        this.addText(this.player.x, this.player.y - 255, '境界提升', '#ffe1a3', 32, { bold: true, life: 1.3 });
        this.spawnBurst(this.player.x, this.player.y - 110, '#ffe3ad', 32, 260, { size: 3, life: .9, gravity: 40, additive: true });
      }
      this.showToast(`境界提升 · Lv.${r.level} · 属性点 +${levels * 3} · 技能点 +${levels}（T 加点）`, 'gold');
      this.saveGame(false);
    }

    applyGrowthStats(healDelta) {
      if (!this.player) return;
      const oldMax = this.player.maxHp;
      this.mods = this.computeMods();
      const p = this.player;
      p.maxHp = 160 + this.mods.maxHp;
      if (healDelta) p.hp = Math.min(p.maxHp, p.hp + Math.max(0, p.maxHp - oldMax));
      p.hp = Math.min(p.hp, p.maxHp);
      p.maxFlasks = 3 + (this.mods.flasks || 0);
      p.flasks = Math.min(p.flasks, p.maxFlasks);
      p.speed = 430 * (this.mods.moveSpeed || 1);
      p.dashMaxCd = 1.0 * (this.mods.dashCd || 1);
      p.dashDist = 1.0 * (this.mods.dashDist || 1);
      p.skillMaxCd = 4.6 * (this.mods.skillCd || 1);
    }

    openGrowth() {
      if (this.state !== 'playing' || !this.player) return;
      this.state = 'growth';
      this.audio.sfx('ui');
      this.audio.stopVoice();
      this.el.growthScreen.classList.remove('hidden');
      this.input.reset();
      this.renderGrowth();
    }

    closeGrowth() {
      if (this.state !== 'growth') return;
      this.el.growthScreen.classList.add('hidden');
      this.state = 'playing';
      this.input.reset();
    }

    allocateAttr(attr) {
      const r = this.rpg;
      if (!r || !['str', 'agi', 'vit'].includes(attr)) return;
      if (r.attrPoints <= 0) {
        this.audio.sfx('warn');
        this.showToast('没有可用属性点。升级后再来。', 'red');
        return;
      }
      r.attrPoints--;
      r[attr]++;
      this.audio.sfx('life');
      this.applyGrowthStats(true);
      this.renderGrowth();
      this.saveGame(false);
    }

    renderGrowth() {
      const r = this.rpg || this.defaultRpg();
      if (this.el.growthPoints) this.el.growthPoints.textContent = r.attrPoints;
      if (this.el.growthSkillPoints) this.el.growthSkillPoints.textContent = r.skillPoints;
      if (this.el.growthLevel) this.el.growthLevel.textContent = r.level;
      if (this.el.growthXp) this.el.growthXp.textContent = `${r.xp} / ${r.xpNext}`;
      if (this.el.growthKills) this.el.growthKills.textContent = r.kills;
      if (this.el.attrStr) this.el.attrStr.textContent = r.str;
      if (this.el.attrAgi) this.el.attrAgi.textContent = r.agi;
      if (this.el.attrVit) this.el.attrVit.textContent = r.vit;
      if (this.el.growthScreen) {
        this.el.growthScreen.querySelectorAll('[data-action="attrStr"],[data-action="attrAgi"],[data-action="attrVit"]').forEach(btn => {
          btn.disabled = r.attrPoints <= 0;
        });
      }
      this.renderSkills();
    }

    switchGrowthTab(tab) {
      if (!this.el.growthAttrPanel) return;
      const isSkill = tab === 'skill';
      this.el.growthAttrPanel.classList.toggle('hidden', isSkill);
      if (this.el.growthSkillBranches) this.el.growthSkillBranches.classList.toggle('hidden', !isSkill);
      if (this.el.growthScreen) {
        this.el.growthScreen.querySelectorAll('.growth-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.tab === tab);
        });
      }
      if (isSkill) this.renderSkills();
    }

    skillOwned(id) { return !!(this.rpg && this.rpg.skills && this.rpg.skills[id]); }

    renderSkills() {
      const box = this.el.growthSkillBranches;
      if (!box) return;
      const r = this.rpg || this.defaultRpg();
      box.innerHTML = SKILL_TREE.map(branch => {
        const nodes = branch.nodes.map(node => {
          const owned = !!r.skills[node.id];
          const reqOk = !node.req || !!r.skills[node.req];
          const locked = !owned && !reqOk;
          const canBuy = !owned && reqOk && r.skillPoints >= node.cost;
          const state = owned ? 'owned' : (locked ? 'locked' : '');
          const hint = owned ? '已参悟' : (locked ? `需先参悟「${(branch.nodes.find(n => n.id === node.req) || {}).name || ''}」` : `${node.cost} 技能点 · 点击参悟`);
          return `<button class="skill-node ${state}" ${owned || locked ? 'disabled' : ''} data-action="learnSkill" data-skill="${node.id}">
            <b>${node.name}</b><span>${node.desc}</span><em>${hint}</em>
          </button>`;
        }).join('');
        return `<div class="skill-branch"><div class="skill-branch-head"><b>${branch.name}</b><span>${branch.motto}</span></div><div class="skill-nodes">${nodes}</div></div>`;
      }).join('');
    }

    learnSkill(id) {
      const r = this.rpg;
      if (!r || this.state !== 'growth') return;
      let node = null, branch = null;
      for (const b of SKILL_TREE) for (const n of b.nodes) if (n.id === id) { node = n; branch = b; }
      if (!node || this.skillOwned(id)) return;
      if (node.req && !this.skillOwned(node.req)) {
        this.audio.sfx('warn');
        this.showToast('需先参悟前置武学。', 'red');
        return;
      }
      if (r.skillPoints < node.cost) {
        this.audio.sfx('warn');
        this.showToast('技能点不足，升级后再来。', 'red');
        return;
      }
      r.skillPoints -= node.cost;
      r.skills[id] = true;
      this.audio.sfx('checkpoint');
      this.applyGrowthStats(true);
      this.renderGrowth();
      this.saveGame(false);
      this.showToast(`参悟「${branch.name} · ${node.name}」`, 'gold');
    }

    /* ================= 装备 ================= */
    makeEquipment(rarity, level) {
      const r = this.rpg || this.defaultRpg();
      const tier = U.clamp(Math.floor(rarity) || 1, 1, 4);
      const base = U.choice(EQUIP_BASES);
      const keys = U.shuffle(AFFIXES).slice(0, tier);
      const lv = Math.max(1, Math.floor(level || 1));
      const affixes = keys.map(a => {
        const scale = a.pct ? 1 : 1 + (lv - 1) * .05;
        let v = (a.min + Math.random() * (a.max - a.min)) * scale;
        v = a.pct ? Math.round(v * 1000) / 1000 : Math.round(v);
        return { key: a.key, label: a.label, value: v, pct: a.pct };
      });
      return {
        uid: r.uid++,
        base: base.id,
        name: `${RARITIES[tier].name}·${base.name}`,
        slot: base.slot,
        rarity: tier,
        affixes,
        level: lv
      };
    }

    rollRarity(kind) {
      const v = Math.random();
      if (kind === 'boss') return v < .3 ? 4 : v < .8 ? 3 : 2;
      if (kind === 'elite') return v < .12 ? 4 : v < .48 ? 3 : v < .86 ? 2 : 1;
      return v < .02 ? 4 : v < .13 ? 3 : v < .46 ? 2 : 1;
    }

    maybeDropEquipment(enemy) {
      if (!enemy || !this.rpg) return;
      const isBoss = enemy === this.boss;
      const isElite = !!enemy.isElite;
      const chance = isBoss ? 1 : isElite ? 1 : .14;
      if (Math.random() > chance) return;
      const count = isBoss ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const kind = isBoss ? 'boss' : isElite ? 'elite' : 'normal';
        const item = this.makeEquipment(this.rollRarity(kind), this.rpg.level + this.chapter * 2);
        this.addEquipment(item);
      }
    }

    addEquipment(item) {
      const r = this.rpg;
      if (!r || !item) return;
      if (r.bag.length >= BAG_LIMIT) {
        this.showToast(`行囊已满，${item.name} 落在雪里`, 'red');
        return;
      }
      r.bag.push(item);
      this.audio.sfx('checkpoint');
      this.showToast(`拾得 ${item.name} · 按 B 查看`, 'gold');
      if (this.player) {
        this.addText(this.player.x, this.player.y - 255, item.name, item.rarity >= 3 ? '#f0c574' : '#bffaff', 20, { bold: item.rarity >= 4, life: 1.3 });
      }
      this.saveGame(false);
    }

    affixText(a) {
      if (!a) return '';
      const v = a.pct ? `${a.value > 0 ? '+' : ''}${Math.round(a.value * 100)}%` : `${a.value > 0 ? '+' : ''}${Math.round(a.value)}`;
      return `${v} ${a.label}`;
    }

    equipSummary(item) {
      return (item.affixes || []).map(a => this.affixText(a)).join(' · ');
    }

    equipItem(uid) {
      const r = this.rpg;
      if (!r || this.state !== 'equipment') return;
      const idx = r.bag.findIndex(it => it.uid === Number(uid));
      if (idx < 0) return;
      const item = r.bag[idx];
      const prev = r.equipped[item.slot];
      r.bag.splice(idx, 1);
      r.equipped[item.slot] = item;
      if (prev) r.bag.push(prev);
      this.audio.sfx('life');
      this.applyGrowthStats(true);
      this.renderEquipment();
      this.saveGame(false);
      this.showToast(`已装备 ${item.name}`, 'gold');
    }

    unequipSlot(slot) {
      const r = this.rpg;
      if (!r || this.state !== 'equipment' || !EQUIP_SLOTS[slot]) return;
      const item = r.equipped[slot];
      if (!item) return;
      if (r.bag.length >= BAG_LIMIT) {
        this.audio.sfx('warn');
        this.showToast('行囊已满，无法卸下。', 'red');
        return;
      }
      r.equipped[slot] = null;
      r.bag.push(item);
      this.audio.sfx('ui');
      this.applyGrowthStats(true);
      this.renderEquipment();
      this.saveGame(false);
      this.showToast(`已卸下 ${item.name}`, '');
    }

    discardItem(uid) {
      const r = this.rpg;
      if (!r || this.state !== 'equipment') return;
      const idx = r.bag.findIndex(it => it.uid === Number(uid));
      if (idx < 0) return;
      const [item] = r.bag.splice(idx, 1);
      this.audio.sfx('uiBack');
      this.renderEquipment();
      this.saveGame(false);
      this.showToast(`弃置 ${item.name}`, '');
    }

    openEquipment() {
      if (this.state !== 'playing' || !this.player) return;
      this.state = 'equipment';
      this.audio.sfx('ui');
      this.audio.stopVoice();
      this.el.equipScreen.classList.remove('hidden');
      this.input.reset();
      this.switchEquipTab('equip');
    }

    closeEquipment() {
      if (this.state !== 'equipment') return;
      this.el.equipScreen.classList.add('hidden');
      this.state = 'playing';
      this.input.reset();
    }

    renderEquipment() {
      if (!this.el.equipSlots || !this.el.equipBag) return;
      const r = this.rpg || this.defaultRpg();
      this.el.equipSlots.innerHTML = Object.keys(EQUIP_SLOTS).map(slot => {
        const item = r.equipped[slot];
        if (!item) {
          return `<div class="equip-slot"><span class="slot-name">${EQUIP_SLOTS[slot]}</span><div class="slot-item" style="opacity:.28">空</div></div>`;
        }
        const rarity = RARITIES[item.rarity] || RARITIES[1];
        return `<div class="equip-slot filled" data-action="unequipSlot" data-slot="${slot}">
          <span class="slot-name">${EQUIP_SLOTS[slot]} · 点击卸下</span>
          <div class="slot-item ${rarity.cls}">${item.name}</div>
          <div class="slot-affix">${this.equipSummary(item)}</div>
        </div>`;
      }).join('');
      if (this.el.equipCount) this.el.equipCount.textContent = r.bag.length;
      const sorted = r.bag.slice().sort((a, b) => (b.rarity - a.rarity) || a.slot.localeCompare(b.slot));
      if (!sorted.length) {
        this.el.equipBag.innerHTML = '<div class="equip-empty">行囊空空。击败精英与心障，或让挡路的敌人让开，会有器物落下。</div>';
        return;
      }
      this.el.equipBag.innerHTML = sorted.map(item => {
        const rarity = RARITIES[item.rarity] || RARITIES[1];
        const lines = (item.affixes || []).map(a => `<li>${this.affixText(a)}</li>`).join('');
        return `<div class="equip-item" data-action="equipItem" data-uid="${item.uid}" role="button" tabindex="0">
          <button class="discard" data-action="discardItem" data-uid="${item.uid}" title="弃置">弃</button>
          <b class="${rarity.cls}">${item.name}<span class="equip-slot-name">${EQUIP_SLOTS[item.slot]}</span></b>
          <ul>${lines}</ul>
        </div>`;
      }).join('');
    }

    /* ================= 章节 ================= */
    computeMods() {
      const m = {
        damage: 1, skillDamage: 1, dashCd: 1, perfectWindow: 1,
        maxHp: 0, flasks: 0, skillCd: 1, qiRegen: 0,
        lowHp: 1, moveSpeed: 1, dashDist: 1,
        deflectWindow: 1, deflectPosture: 0, deflectQi: 0, slowPlus: 0, ultDamage: 1
      };
      const r = this.rpg || this.defaultRpg();
      m.damage *= 1 + (r.level - 1) * .025 + (r.str - 1) * .035;
      m.maxHp += (r.level - 1) * 6 + (r.vit - 1) * 10;
      m.moveSpeed *= 1 + (r.agi - 1) * .012;
      m.qiRegen += (r.agi - 1) * .35;
      for (const item of Object.values(r.equipped || {})) {
        if (!item || !Array.isArray(item.affixes)) continue;
        for (const a of item.affixes) this.applyAffix(m, a);
      }
      const skills = r.skills || {};
      if (skills.deflect1) m.deflectWindow *= 1.15;
      if (skills.deflect2) m.deflectPosture += 18;
      if (skills.deflect3) m.deflectQi += 12;
      if (skills.dodge1) m.dashCd *= .9;
      if (skills.dodge2) m.perfectWindow *= 1.3;
      if (skills.dodge3) m.slowPlus += .5;
      if (skills.art1) m.skillDamage *= 1.2;
      if (skills.art2) m.qiRegen += 1.5;
      if (skills.art3) m.ultDamage *= 1.25;
      for (const id of this.upgrades) {
        switch (id) {
          case 'tide': m.damage *= 1.15; break;
          case 'mirror': m.perfectWindow *= 1.35; m.dashCd *= .9; break;
          case 'whale': m.maxHp += 30; break;
          case 'dew': m.flasks += 1; break;
          case 'stream': m.skillDamage *= 1.3; m.skillCd *= .85; break;
          case 'night': m.qiRegen += 2; break;
          case 'resolve': m.lowHp = 1.3; break;
          case 'gale': m.moveSpeed *= 1.12; m.dashDist *= 1.2; break;
        }
      }
      if (this.campusLayer && this.campusLayer.companions) {
        const cm = this.campusLayer.companions.mods();
        m.moveSpeed *= cm.moveSpeed || 1;
        m.dashCd *= cm.dashCd || 1;
        m.dashDist *= cm.dashDist || 1;
        m.perfectWindow *= cm.perfectWindow || 1;
        m.slowPlus += cm.slowPlus || 0;
        m.skillDamage *= cm.skillDamage || 1;
        m.skillCd *= cm.skillCd || 1;
        m.ultDamage *= cm.ultDamage || 1;
      }
      if (this.campusLayer && this.campusLayer.factions) {
        const fb = this.campusLayer.factions.bonus();
        m.damage *= fb.damage;
        m.maxHp += fb.maxHp;
        m.moveSpeed *= fb.moveSpeed;
        m.dashCd *= fb.dashCd;
      }
      return m;
    }

    applyAffix(m, a) {
      if (!a) return;
      const v = Number(a.value) || 0;
      switch (a.key) {
        case 'damage': m.damage *= 1 + v; break;
        case 'skillDamage': m.skillDamage *= 1 + v; break;
        case 'maxHp': m.maxHp += v; break;
        case 'moveSpeed': m.moveSpeed *= 1 + v; break;
        case 'qiRegen': m.qiRegen += v; break;
        case 'dashCd': m.dashCd *= 1 + v; break;
        case 'perfectWindow': m.perfectWindow *= 1 + v; break;
        case 'skillCd': m.skillCd *= 1 + v; break;
        case 'ultDamage': m.ultDamage *= 1 + v; break;
      }
    }

    startChapter(chapterIndex, cleared, opts) {
      opts = opts || {};
      this.chapter = U.clamp(chapterIndex, 0, LEVELS.length - 1);
      this.level = LEVELS[this.chapter];
      this.initSecrets();
      this.interactables = (window.INTERACTABLES && window.INTERACTABLES[this.level.id] ? window.INTERACTABLES[this.level.id] : []).map(o => ({ ...o, used: false, interactAt: 0 }));
      this.nearInteractable = null;
      this.idleTime = 0;
      this.thinkShown = false;
      this.catBuffUntil = 0;
      this.busyToastAt = 0;
      if (this.el.interactPrompt) this.el.interactPrompt.classList.remove('show');
      this.worldWidth = this.level.width;
      this.stageIndex = this.chapter;
      this.damageScale = 1.0;
      this.cleared = U.clamp(cleared || 0, 0, this.level.encounters ? this.level.encounters.length : 0);
      this.encounterIndex = this.cleared;
      this._scholarSpoke = false; this._athleteSpoke = false;
      this.mods = this.computeMods();
      this.enemies = [];
      this.projectiles = [];
      this.hazards = [];
      this.particles = [];
      this.texts = [];
      this.boss = null;
      this.bossTarget = null;
      this.encounterActive = false;
      this.currentEncounter = null;
      this.encounterWaves = [];
      this.waveIndex = 0;
      this.waveTimer = 0;
      this.pendingClear = null;
      this.pendingStartDialogue = this.cleared === 0 && !opts.noIntroDialogue;
      this.chapterIntroDone = false;
      this.chapterIntroTimer = opts.retry ? 1.4 : 2.6;
      this.arenaLock = false;
      this.bounds = { left: 0, right: this.level.width };
      this.combo = 0; this.comboTimer = 0;
      this.shakePower = 0; this.hitstop = 0; this.slowTimer = 0;
      this.flash = null; this.ultFx = null;
      this.deathTimer = 0; this.victoryTimer = 0; this.victoryStampShown = false;
      this.audio.stopVoice();
      this.clearTipTimers();

      let startX = this.level.startX;
      if (this.cleared > 0 && this.level.encounters && this.level.encounters[this.cleared - 1]) {
        startX = Math.min(this.level.width - 450, this.level.encounters[this.cleared - 1].arena[1] + 250);
      }
      this.player = new Player(this, startX, GROUND);
      this.camera.x = U.clamp(startX, 960, Math.max(960, this.level.width - 960));
      this.camera.y = 0; this.camera.z = 0;
      this.zBounds = { min: -280, max: 280 };

      this.el.title.classList.add('hidden');
      this.el.pause.classList.add('hidden');
      this.el.help.classList.add('hidden');
      this.el.settings.classList.add('hidden');
      this.el.nameScreen.classList.add('hidden');
      this.el.achScreen.classList.add('hidden');
      this.el.growthScreen.classList.add('hidden');
      this.el.equipScreen.classList.add('hidden');
      this.el.companionScreen.classList.add('hidden');
      this.el.journalScreen.classList.add('hidden');
      this.el.zoneScreen.classList.add('hidden');
      this.el.photoScreen.classList.add('hidden');
      this.el.achToast.classList.remove('show');
      this.el.omenToast.classList.remove('show');
      this.el.upgrade.classList.add('hidden');
      this.el.death.classList.add('hidden');
      this.el.victoryStamp.classList.add('hidden');
      this.el.ending.classList.add('hidden');
      this.el.dialogue.classList.add('hidden');
      this.el.cinematic.classList.add('hidden');
      this.el.hud.classList.remove('hidden');
      this.el.hudName.textContent = this.playerName;
      if (U.isTouch()) this.el.touch.classList.remove('hidden');
      this.el.bossBar.classList.add('hidden');
      this.el.chapterCardNum.textContent = this.level.num;
      this.el.chapterCardName.textContent = this.level.name;
      this.el.chapterCardSub.textContent = this.level.subtitle;
      this.el.chapterCard.classList.add('show');
      this.el.stageLabel.textContent = `${this.level.num} · ${this.level.name}`;
      this.el.hudChapter.textContent = this.level.num;
      this.objective = this.level.objective;
      this.state = 'playing';
      this.input.reset();
      this.audio.startMusic(this.level.theme === 'boss' ? 'boss' : this.level.theme);
      this.audio.bgmState = 'explore'; this.audio.lastExploreTheme = this.level.theme;
      this.audio.setIntensity(this.level.bossFight ? .38 : .22);
      if (this.campusLayer) {
        this.campusLayer.onChapterStart();
        if (this.three && !this.three.failed && this.three.scene) this.campusLayer.attachPhotoScene(this.three.scene, this.three.camera);
      }
      this.saveGame(false);
      this.updatePortrait();
      if (opts.resume && this.cleared > 0) this.showToast('心灯重燃 · 从上次破障处继续', 'gold');
      else if (opts.retry) this.showToast('风会等，雪也会等', '');
    }

    beginChapterContent() {
      this.el.chapterCard.classList.remove('show');
      if (this.level.encounters && this.cleared >= this.level.encounters.length) {
        this.openUpgrade();
        return;
      }
      this.audio.sfx('checkpoint');
      if (this.pendingStartDialogue) {
        const lines = STORY.chapters[this.chapter].startDialogue || [];
        this.showDialogue(lines, () => {
          if (this.chapter === 0 && this.cleared === 0) this.startTutorial();
          this.showToast(this.level.objective, '');
        });
      } else {
        if (this.chapter === 0 && this.cleared === 0) this.startTutorial();
        this.showToast(this.objective, '');
      }
    }

    /* ================= 更新：世界 ================= */
    updateWorld(dt) {
      if (!this.level || !this.player) return;
      if (this.campusLayer) this.campusLayer.update(dt);
      if (!this.chapterIntroDone) {
        this.chapterIntroTimer -= dt;
        this.updateParticles(dt);
        this.updateCamera(dt);
        if (this.chapterIntroTimer <= 0) {
          this.chapterIntroDone = true;
          this.beginChapterContent();
        }
        return;
      }

      this.worldTime = (this.worldTime || 0) + dt;
      const slow = this.slowTimer > 0 ? .2 : 1;
      const stop = this.hitstop > 0 ? .08 : 1;
      const worldDt = dt * slow * stop;
      const playerDt = dt * (this.hitstop > 0 ? .4 : 1);

      this.player.update(playerDt, this);
      if (this.state !== 'playing') return;
      this.player.speedBuff = this.time < (this.catBuffUntil || 0) ? 1.15 : 1;
      const idleNow = this.player.onGround && Math.abs(this.player.vx) < 18 && !['attack', 'skill', 'dodge', 'hurt', 'ultimate', 'heal'].includes(this.player.state);
      this.idleTime = idleNow ? (this.idleTime || 0) + dt : 0;
      if (this.idleTime > 20 && !this.thinkShown) {
        this.thinkShown = true;
        this.unlockAchievement('deep_think');
        this.bark(this.playerName, '正在深度思考……（算力占用 100%）', null);
        this.addText(this.player.x, this.player.y - 245, '……', '#bffaff', 25, { life: 1.4 });
      }
      if (this.input.justPressed('skill') && this.player.qi < 25) this.deepseekBusy('skill');
      if (this.input.justPressed('ultimate') && this.player.focus < 100) this.deepseekBusy('ultimate');
      if (this.secrets && this.secrets.length) {
        for (const s of this.secrets) {
          if (!s.collected && Math.abs(this.player.x - s.x) < 86) this.collectSecret(s);
        }
      }
      this.updateExecuteTarget();
      if (this.executeTarget && this.input.justPressed('interact')) this.executeFinisher(this.executeTarget);
      else this.updateInteractables();

      if (this.boss) {
        this.boss.update(worldDt, this);
        if (this.state !== 'playing') return;
      }
      for (const e of this.enemies) e.update(worldDt, this);
      if (this.state !== 'playing') return;
      this.enemies = this.enemies.filter(e => !e.dead || e.deathT < 1.4);
      for (const p of this.projectiles) p.update(worldDt, this);
      this.projectiles = this.projectiles.filter(p => !p.dead);
      for (const h of this.hazards) h.update(worldDt, this);
      this.hazards = this.hazards.filter(h => !h.dead);
      this.updateParticles(dt);
      this.updateCamera(dt);

      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) this.combo = 0;
      }
      if (this.pendingClear) {
        this.pendingClear.timer -= dt;
        if (this.pendingClear.timer <= 0) {
          const p = this.pendingClear;
          this.pendingClear = null;
          if (p.lines && p.lines.length) {
            this.showDialogue(p.lines, p.onDone);
          } else if (p.onDone) p.onDone();
        }
      }

      if (this.state !== 'playing') return;
      this.checkTriggers();
      this.checkEncounterClear(dt);
    }

    updateParticles(dt) {
      for (const p of this.particles) p.update(dt * (this.slowTimer > 0 ? .6 : 1));
      this.particles = this.particles.filter(p => !p.dead);
      for (const t of this.texts) t.update(dt);
      this.texts = this.texts.filter(t => !t.dead);
    }

    updateExecuteTarget() {
      this.executeTarget = null;
      if (!this.player) return;
      let best = null, bd = 185;
      const check = (t) => {
        if (!t || t.dead) return;
        if (!(t.staggered > 0 || t.state === 'stagger' || t.executable)) return;
        const d = Math.hypot(t.x - this.player.x, (t.z || 0) - this.player.z);
        if (d < bd) { bd = d; best = t; }
      };
      for (const e of this.enemies) check(e);
      if (this.boss) check(this.boss);
      this.executeTarget = best;
    }

    executeFinisher(target) {
      if (!target || !this.player) return;
      if (this.campusLayer && this.campusLayer.execute(target, this)) {
        this.executeTarget = null;
        this.player.setState('attack'); this.player.attackIndex = 2; this.player.stateT = 0; this.player.attackHits = new Set();
        this.audio.sfx('slashHeavy');
        this.addShake(10);
        return;
      }
      this.executeTarget = null;
      this.player.setState('attack'); this.player.attackIndex = 2; this.player.stateT = 0;
      this.player.attackHits = new Set();
      this.audio.sfx('slashHeavy'); this.audio.sfx('gong');
      this.hitstop = Math.max(this.hitstop, .16);
      this.addShake(14);
      this.flashScreen('#ffe3ad', .22);
      this.slowTimer = Math.max(this.slowTimer, .5);
      this.addText(target.x, target.y - 180, '处决', '#ffe1a3', 32, { bold: true, life: 1.2 });
      if (target === this.boss) {
        target.invuln = 0; target.takeDamage(target.maxHp * .22, this.player, this);
        target.state = 'idle'; target.stateT = 0; target.executable = false; target.posture = target.maxPosture * .5;
      } else {
        target.takeDamage(99999, this.player, this);
      }
      this.spawnBurst(target.x, target.y - 150, '#ffd699', 45, 360, { size: 4, life: 1, gravity: 260, additive: true });
      this.player.addFocus(20);
    }

    onDeflect(player, sourceEntity, sourceX) {
      this.audio.playSound('deflect');
      this.addShake(7);
      this.flashScreen('#bff7ff', .12);
      this.hitstop = Math.max(this.hitstop, .08);
      this.addText(player.x, player.y - 225, '卸势', '#bffaff', 28, { bold: true, life: .9 });
      this.spawnBurst(player.x, player.y - 100, '#c7fbff', 24, 330, { size: 3, life: .6, gravity: 0, additive: true });
      if (sourceEntity && sourceEntity.owner === 'enemy') {
        sourceEntity.owner = 'player';
        sourceEntity.vx *= -2; sourceEntity.vz = (sourceEntity.vz || 0) * -2;
        sourceEntity.vy = (sourceEntity.vy || 0) * -.4;
        sourceEntity.damage *= 1.7;
        sourceEntity.reflected = true;
        this.addText(sourceEntity.x, sourceEntity.y - 40, '弹反 ×2', '#9ff7ff', 22, { bold: true });
        return;
      }
      if (sourceEntity && sourceEntity.posture !== undefined) {
        sourceEntity.posture = Math.max(0, sourceEntity.posture - ((sourceEntity.isElite || sourceEntity === this.boss ? 40 : 55) + (this.mods.deflectPosture || 0)));
        if (sourceEntity.posture <= 0) {
          if (sourceEntity === this.boss) { sourceEntity.state = 'stagger'; sourceEntity.stateT = 0; sourceEntity.executable = true; }
          else { sourceEntity.staggered = 1.8; sourceEntity.executable = true; sourceEntity.state = 'stagger'; }
          this.addText(sourceEntity.x, sourceEntity.y - 220, '气竭', '#ffd27a', 28, { bold: true });
          this.audio.sfx('gong');
        }
      }
    }

    updateInteractables() {
      if (!this.interactables || !this.player) { this.nearInteractable = null; return; }
      let best = null, bestD = 142;
      for (const it of this.interactables) {
        if (it.used) continue;
        const d = Math.abs(this.player.x - it.x);
        if (d < bestD) { best = it; bestD = d; }
      }
      this.nearInteractable = best;
      if (best && this.input.justPressed('interact')) this.interactWith(best);
    }

    deepseekBusy(kind) {
      if (this.time - (this.busyToastAt || 0) < .55) return;
      this.busyToastAt = this.time;
      const lines = kind === 'ultimate'
        ? ['深度思考尚未完成，请勿催促。', '心念不足 · 建议再砍两刀。', '服务器繁忙，请稍后再试。']
        : ['气不足 · 正在排队请求算力。', '服务器繁忙，请稍后再试。', '这一招还在加载中……'];
      this.showToast(U.choice(lines), 'red');
      this.audio.sfx('warn');
      this.achData.busy = (this.achData.busy || 0) + 1;
      this.saveAchievements();
      if (this.achData.busy >= 3) this.unlockAchievement('server_busy');
    }

    interactWith(it) {
      if (!it || it.used) return;
      if (this.campusLayer && this.campusLayer.handleInteract(it)) {
        this.nearInteractable = null;
        return;
      }
      it.used = true;
      it.interactAt = this.time;
      this.nearInteractable = null;
      this.audio.playSound(it.kind === 'squirrel' ? 'squirrel' : 'life');
      this.bark(it.name, it.text, it.voice || null);
      if (it.achievement) this.unlockAchievement(it.achievement);
      if (it.buff === 'cat') {
        this.catBuffUntil = this.time + 20;
        this.unlockAchievement('cat_buff');
        this.showToast('喵力加持 · 移速 +15%（20 秒）', 'gold');
        this.audio.speak('喵～', 'player');
        this.addText(this.player.x, this.player.y - 220, '喵力加持', '#ffd98f', 24, { bold: true });
      }
      if (it.heal) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + it.heal);
        this.addText(this.player.x, this.player.y - 210, '+' + it.heal, '#a8f7d8', 22);
      }
      this.spawnBurst(this.player.x, this.player.y - 90, '#aef7ff', 20, 180, { size: 2.4, life: .7, gravity: 0, additive: true });
      if (!this.achData.interacted) this.achData.interacted = [];
      if (!this.achData.interacted.includes(it.id)) {
        this.achData.interacted.push(it.id);
        this.saveAchievements();
        if (this.achData.interacted.length >= 5) this.unlockAchievement('all_things');
      }
    }

    updateCamera(dt) {
      if (!this.player) return;
      let target = this.player.x + this.player.facing * 80;
      let targetZ = this.player.z || 0;
      if (this.boss && !this.boss.dead) { target = this.player.x * .58 + this.boss.x * .42; targetZ = (this.player.z || 0) * .58 + (this.boss.z || 0) * .42; }
      else if (this.bossTarget && !this.bossTarget.dead) { target = this.player.x * .8 + this.bossTarget.x * .2; targetZ = (this.player.z || 0) * .8 + (this.bossTarget.z || 0) * .2; }
      let minC = 960, maxC = Math.max(960, (this.level ? this.level.width : 1920) - 960);
      if (this.arenaLock && this.level) {
        let L, R;
        if (this.boss) { L = this.level.bossArena[0]; R = this.level.bossArena[1]; }
        else if (this.currentEncounter) { L = this.currentEncounter.arena[0]; R = this.currentEncounter.arena[1]; }
        if (L !== undefined) {
          if (R - L < 1920) { minC = maxC = (L + R) / 2; }
          else { minC = L + 960; maxC = R - 960; }
        }
      }
      target = U.clamp(target, minC, maxC);
      this.camera.x = U.damp(this.camera.x, target, 4.2, dt);
      this.camera.x = U.clamp(this.camera.x, minC, maxC);
      this.camera.z = U.damp(this.camera.z || 0, targetZ, 4.2, dt);
      this.camera.y = 0;
    }

    checkTriggers() {
      if (!this.level || !this.player) return;
      if (this.level.bossFight) {
        if (!this.boss && this.player.x > this.level.bossTriggerX) this.startBossFight();
        return;
      }
      const encs = this.level.encounters;
      if (!encs || this.encounterIndex >= encs.length || this.encounterActive || this.pendingClear) return;
      const enc = encs[this.encounterIndex];
      if (this.player.x > enc.triggerX) this.startEncounter(enc);
    }

    startEncounter(enc) {
      this.currentEncounter = enc;
      this.encounterActive = true;
      this.encounterWaves = [enc.spawns].concat(enc.waves || []);
      this.waveIndex = 0;
      this.waveTimer = 0;
      this.arenaLock = true;
      this.bounds = { left: enc.arena[0], right: enc.arena[1] };
      this.objective = enc.label;
      this.el.objective.textContent = enc.label;
      this.audio.sfx('warn');
      this.audio.switchBGM('combat', this.level.theme);
      this.showToast(enc.label, enc.elite ? 'red' : '');
      if (enc.barks) {
        for (const b of enc.barks) this.bark(b[0], b[1], b[2]);
      }
      this.spawnWave(enc.spawns, enc);
      const center = (enc.arena[0] + enc.arena[1]) / 2;
      this.camera.x = U.clamp((this.player.x + center) / 2, Math.min(960, enc.arena[0]), Math.max(960, enc.arena[1] - 960));
      this.addShake(5);
    }

    spawnWave(spawns, enc) {
      enc = enc || this.currentEncounter;
      for (let i = 0; i < spawns.length; i++) {
        const sp = spawns[i];
        const x = U.clamp(enc.triggerX + sp.dx, enc.arena[0] + 60, enc.arena[1] - 60);
        const opts = {
          hpScale: (enc.hpScale || 1) * (sp.hpScale || 1),
          dmgScale: enc.dmgScale || 1,
          variant: sp.variant,
          name: sp.name,
          y: GROUND
        };
        const e = new Enemy(this, sp.type, x, opts);
        if (sp.type === 'elite') {
          e.state = 'spawn';
          e.stateT = 0;
          this.bossTarget = e;
          this.showBossBar(e);
          e.maxHp = e.hp;
          this.el.bossName.textContent = e.name;
          this.el.bossTitle.textContent = '心障';
          this.el.bossPhase.textContent = '执念';
        }
        this.enemies.push(e);
        if (e.type === 'scholar' && !this._scholarSpoke) { this._scholarSpoke = true; this.bark('眼镜学霸', '这道题选 C。你闪避的路径，我已经算过了。', 'boss'); }
        if (e.type === 'athlete' && !this._athleteSpoke) { this._athleteSpoke = true; this.bark('体育生·佐藤', '正面来？你挺有勇气。', 'boss'); }
        for (let k = 0; k < 14; k++) {
          this.spawnParticle(x + U.rand(-30, 30), GROUND - U.rand(0, 150), U.rand(-80, 80), -U.rand(40, 180), U.rand(.4, .9), U.rand(2, 4), enc.elite ? '#ffb27a' : '#8deaf5', 100, true);
        }
      }
    }

    checkEncounterClear(dt) {
      if (!this.encounterActive || !this.currentEncounter) return;
      const enc = this.currentEncounter;
      if (this.waveTimer > 0) {
        this.waveTimer -= dt;
        if (this.waveTimer <= 0) {
          this.enemies = this.enemies.filter(e => !e.dead && !e.encounterCleared);
          this.spawnWave(this.encounterWaves[this.waveIndex], enc);
          this.showToast('余念又起 · 心障未散', 'red');
          this.audio.sfx('warn');
          this.addShake(5);
        }
        return;
      }
      if (!this.enemies.length) return;
      if (!this.enemies.every(e => e.dead || e.encounterCleared)) return;
      if (this.waveIndex < this.encounterWaves.length - 1) {
        this.waveIndex++;
        this.waveTimer = 1.15;
        this.showToast('余念又起 · 心障未散', 'red');
        this.audio.sfx('warn');
        return;
      }
      this.encounterActive = false;
      this.arenaLock = false;
      this.enemies = this.enemies.filter(e => !e.dead && !e.encounterCleared);
      this.bounds = { left: 0, right: this.level.width };
      this.cleared++;
      this.encounterIndex = this.cleared;
      this.unlockAchievement('first_break');
      this.currentEncounter = null;
      this.encounterWaves = [];
      this.waveIndex = 0;
      this.waveTimer = 0;
      this.bossTarget = null;
      this.el.bossBar.classList.add('hidden');
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * .16);
      this.player.flasks = Math.min(this.player.maxFlasks, this.player.flasks + 1);
      this.addShake(6);
      this.audio.sfx('checkpoint');
      this.audio.switchBGM('explore', this.level.theme);
      this.saveGame(false);
      this.showToast('心障已破 · 心灯续了一寸', 'gold');
      this.objective = this.cleared >= this.level.encounters.length ? '向山顶去' : '向山中去';
      this.el.objective.textContent = this.objective;
      const last = this.cleared >= this.level.encounters.length;
      this.pendingClear = {
        timer: last ? 1.6 : 1.0,
        lines: last ? (STORY.chapters[this.chapter].afterDialogue || []) : (enc.clearDialogue || []),
        onDone: last ? () => this.openUpgrade() : null
      };
    }

    startBossFight() {
      if (!this.level || !this.level.bossFight) return;
      this.arenaLock = true;
      this.bounds = { left: this.level.bossArena[0], right: this.level.bossArena[1] };
      this.boss = new Boss(this, this.level.bossX);
      this.boss.maxHp *= this.level.bossHpScale || 1;
      this.boss.hp = this.boss.maxHp;
      this.boss.state = 'intro';
      this.boss.invuln = 999;
      this.bossTarget = this.boss;
      this.showBossBar(this.boss);
      this.audio.setIntensity(.65);
      this.audio.sfx('gong');
      this.addShake(12);
      this.flashScreen('#ff5b4b', .25);
      this.camera.x = U.clamp((this.player.x + this.boss.x) / 2, 960, Math.max(960, this.level.width - 960));
      this.showDialogue(STORY.boss.intro, () => {
        if (!this.boss) return;
        this.boss.state = 'idle'; this.boss.stateT = 0; this.boss.invuln = 0; this.boss.attackCd = 1.2;
        this.audio.setIntensity(.75);
        this.bark('刘奥', '我认罪。但我不后悔。', 'boss');
        this.objective = '在长夜结束前，击败刘奥';
      });
    }

    triggerBossPhase(phase) {
      if (!this.boss || this.boss.dead) return;
      this.boss.phase = phase;
      this.boss.phaseTriggered = phase === 2 ? 2 : 3;
      this.boss.state = 'transition';
      this.boss.stateT = 0;
      this.boss.invuln = 999;
      this.boss.pattern = null;
      this.boss.pFlags = {};
      this.projectiles = [];
      this.hazards = [];
      this.slowTimer = .65;
      this.flashScreen(phase === 2 ? '#ff6d51' : '#ffd7a1', .32);
      this.addShake(18);
      this.audio.sfx('gong');
      this.audio.setIntensity(phase === 2 ? .88 : 1);
      const lines = phase === 2 ? STORY.boss.phase2 : STORY.boss.phase3;
      this.showDialogue(lines, () => {
        if (!this.boss) return;
        this.boss.state = 'idle'; this.boss.stateT = 0;
        this.boss.invuln = .9; this.boss.attackCd = 1.1;
      });
    }

    /* ================= 战斗反馈 ================= */
    spawnParticle(x, y, vx, vy, life, size, color, gravity, additive) {
      if (this.particles.length > 780) return;
      this.particles.push(new Particle(x, y, vx, vy, life, size, color, gravity, additive));
    }
    spawnBurst(x, y, color, count, speed, opts) {
      opts = opts || {};
      const n = this.settings.reducedMotion ? Math.ceil(count * .55) : count;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU;
        const sp = U.rand(speed * .18, speed);
        this.spawnParticle(x, y, Math.cos(a) * sp, Math.sin(a) * sp - (opts.up || 0), U.rand((opts.life || .5) * .5, opts.life || .5), U.rand(1, opts.size || 3), color, opts.gravity === undefined ? 300 : opts.gravity, opts.additive !== false);
      }
    }
    addText(x, y, text, color, size, opts) {
      this.texts.push(new FloatingText(x, y, text, color, size, opts));
    }
    onPlayerDealtDamage(target, damage, source, heavy) {
      this.combo++;
      if (this.combo >= 50) this.unlockAchievement('combo50');
      this.comboTimer = 2.7;
      this.stats.maxCombo = Math.max(this.stats.maxCombo, this.combo);
      this.maxCombo = Math.max(this.maxCombo || 0, this.combo);
      this.stats.damage += damage;
      this.hitstop = Math.max(this.hitstop, heavy ? .14 : .1);
      this.addShake(heavy ? 5.5 : 2.8);
      this.audio.sfx(heavy ? 'slashHeavy' : 'hit');
      const tx = target.x || source.x;
      const ty = (target.y || GROUND) - (target.isElite || target.phase ? 220 : 110);
      this.addText(tx + U.rand(-16, 16), ty, Math.round(damage), heavy ? '#ffe4aa' : '#c5fbff', heavy ? 28 : 21, { bold: true });
      this.player.addFocus(target.phase ? 1.45 : target.isElite ? 2.2 : 3.2);
      this.spawnBurst(tx, ty + 60, heavy ? '#ffe0a4' : '#9df4ff', heavy ? 16 : 8, heavy ? 300 : 210, { size: 2.6, life: .4, gravity: 340 });
    }
    onPlayerHurt(dmg, sourceName) {
      this.combo = 0; this.comboTimer = 0;
      this.addShake(11);
      this.flashScreen('#d94e46', .2);
      this.audio.sfx('hurt');
      this.spawnBurst(this.player.x, this.player.y - 100, '#ff8d83', 13, 240, { size: 3, life: .45, gravity: 300 });
      this.showToast(`受到 ${dmg} 点伤害`, 'red');
    }
    onPerfectDodge(player, sourceX) {
      this.stats.perfect++;
      this.achData.perfect = (this.achData.perfect || 0) + 1;
      this.saveAchievements();
      if (this.achData.perfect >= 3) this.unlockAchievement('mirror');
      this.slowTimer = 1.5 + (this.mods.slowPlus || 0);
      this.flashScreen('#8cefff', .16);
      this.addShake(5);
      this.audio.playSound('perfectDodge');
      this.addText(player.x, player.y - 235, '完美闪身', '#9bf7ff', 26, { bold: true, life: 1.1 });
      this.spawnBurst(player.x, player.y - 100, '#aef8ff', 22, 280, { size: 2.8, life: .6, gravity: 0, additive: true });
    }
    onEnemyKilled(enemy) {
      this.stats.enemies++;
      if (this.rpg) this.rpg.kills++;
      const xp = enemy.isElite ? 60 : (enemy.type === 'scholar' || enemy.type === 'athlete') ? 50 : 14 + this.chapter * 4;
      this.addText(enemy.x, enemy.y - 190, `+${xp} 经验`, '#9ff7ff', 18, { life: .85 });
      this.gainXp(xp);
      this.maybeDropEquipment(enemy);
      if (enemy.isElite) {
        this.addShake(15);
        this.audio.setIntensity(.45);
        this.flashScreen('#ffd39d', .25);
      }
    }
    onEliteKilled(enemy) {
      this.bossTarget = null;
      this.el.bossBar.classList.add('hidden');
      this.player.flasks = Math.min(this.player.maxFlasks, this.player.flasks + 1);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * .12);
      this.showToast('心障消散 · 鲸露 +1', 'gold');
    }
    onPlayerDeath() {
      this.state = 'dying';
      this.deathTimer = 0;
      this.unlockAchievement('cai');
      this.deaths++;
      this.slowTimer = 1.4;
      this.audio.stopMusic();
      this.audio.stopVoice();
      this.el.bossBar.classList.add('hidden');
      this.el.dialogue.classList.add('hidden');
      this.el.bark.classList.remove('show');
      this.el.toast.classList.remove('show');
      this.el.tutorial.innerHTML = '';
      this.dialogueActive = false;
      if (this.campusLayer) this.campusLayer.onPlayerDeath(this);
      // 死亡惩罚：当前经验流失 30%，并遗失一件未穿戴的器物；等级、属性与武学保留。
      const lost = Math.floor((this.rpg ? this.rpg.xp : 0) * .3);
      if (lost > 0) this.rpg.xp -= lost;
      this.lastDeathPenalty = lost;
      this.lastDeathItem = '';
      if (this.rpg && this.rpg.bag.length) {
        // 从最低稀有度的器物中随机遗失一件，避免一次死亡就失去最好的装备。
        const minRarity = Math.min(...this.rpg.bag.map(it => it.rarity || 1));
        const pool = this.rpg.bag.filter(it => (it.rarity || 1) === minRarity);
        const victim = U.choice(pool);
        this.rpg.bag.splice(this.rpg.bag.indexOf(victim), 1);
        this.lastDeathItem = victim ? victim.name : '';
      }
      this.saveGame(false);
    }
    onBossDefeated() {
      this.unlockAchievement('out');
      this.state = 'victory';
      this.victoryTimer = 0;
      this.victoryStampShown = false;
      this.slowTimer = 1.6;
      this.audio.stopVoice();
      this.audio.stopMusic();
      this.projectiles = [];
      this.hazards = [];
      this.boss.hurtFlash = 0;
      this.player.state = 'victory';
      this.player.stateT = 0;
      this.player.invuln = 999;
      this.player.vx = 0;
      this.bossTarget = null;
      this.el.bossBar.classList.add('hidden');
      this.el.hud.classList.add('hidden');
      this.el.bark.classList.remove('show');
      this.el.tutorial.innerHTML = '';
      this.el.toast.classList.remove('show');
      this.flashScreen('#f6f2df', .5);
      this.addShake(24);
      this.stats.enemies++;
      if (this.rpg) this.rpg.kills++;
      this.gainXp(220);
      this.maybeDropEquipment(this.boss);
      this.completed = true;
      this.saveGame(true);
      this.spawnBurst(this.boss.x, this.boss.y - 180, '#ffd9a4', 70, 420, { size: 4, life: 1.4, gravity: 200, additive: true });
    }

    /* ================= 死亡 / 胜利 ================= */
    updateDying(dt) {
      this.deathTimer += dt;
      this.boss && this.boss.dead && (this.boss.deathT += dt);
      for (const e of this.enemies) if (e.dead) e.deathT += dt;
      this.updateParticles(dt);
      this.updateCamera(dt);
      if (this.deathTimer > 1.05) {
        this.state = 'dead';
        this.el.hud.classList.add('hidden');
        this.el.touch.classList.add('hidden');
        this.el.death.classList.remove('hidden');
        this.audio.speak('菜！', 'player');
        const lines = window.LOSE_LINES || ['菜就多练。'];
        const copy = this.el.death.querySelector('.death-copy > p:not(.panel-eyebrow)');
        let penalty = this.lastDeathPenalty > 0 ? ` 心念流失：经验 -${this.lastDeathPenalty}。` : '';
        if (this.lastDeathItem) penalty += ` 行囊遗落：${this.lastDeathItem}。`;
        if (copy) copy.textContent = U.choice(lines) + ' 菜就多练，风会等，雪也会等。' + penalty;
      }
    }

    updateVictory(dt) {
      this.victoryTimer += dt;
      if (this.boss) this.boss.deathT += dt;
      this.updateParticles(dt);
      this.updateCamera(dt);
      if (!this.victoryStampShown && this.victoryTimer > 1.0) {
        this.victoryStampShown = true;
        this.el.victoryStamp.classList.remove('hidden');
        this.audio.sfx('victory');
        this.audio.speak('刘奥，OUT！', 'player');
        this.spawnBurst(this.boss ? this.boss.x : this.player.x, 580, '#ffcf91', 60, 360, { size: 4, life: 1.4, gravity: 100, additive: true });
      }
      if (this.victoryTimer > 4.5) this.startEnding();
    }

    retryStage() {
      this.el.death.classList.add('hidden');
      this.lastDeathPenalty = 0;
      this.lastDeathItem = '';
      this.state = 'playing';
      this.startChapter(this.chapter, this.cleared, { retry: true, noIntroDialogue: true });
    }

    /* ================= 对话 ================= */
    showDialogue(lines, onComplete) {
      if (!lines || !lines.length) { if (onComplete) onComplete(); return; }
      this.choiceActive = false;
      if (this.el.dialogueChoices) {
        this.el.dialogueChoices.classList.add('hidden');
        this.el.dialogueChoices.innerHTML = '';
      }
      this.dialogueReturn = this.state === 'dialogue' ? this.dialogueReturn : this.state;
      this.state = 'dialogue';
      this.dialogueActive = true;
      this.dialogueQueue = lines.slice();
      this.dialogueIndex = 0;
      this.dialogueOnComplete = onComplete || null;
      this.dialogueAdvanceRequested = false;
      this.el.dialogue.classList.remove('hidden');
      this.el.bark.classList.remove('show');
      this.displayDialogueLine();
    }

    showChoice(speaker, prompt, options, onPick) {
      this.dialogueReturn = this.state === 'dialogue' ? this.dialogueReturn : this.state;
      this.state = 'dialogue';
      this.dialogueActive = true;
      this.choiceActive = true;
      this.el.dialogue.classList.remove('hidden');
      this.el.bark.classList.remove('show');
      this.el.dialogueName.textContent = speaker || '心念';
      this.el.dialogueText.textContent = prompt;
      Art.drawPortrait(this.el.dialoguePortrait, 'narrator');
      const cont = this.el.dialogue.querySelector('.dialogue-continue');
      if (cont) cont.classList.add('hidden');
      const box = this.el.dialogueChoices;
      if (!box) return;
      box.classList.remove('hidden');
      box.innerHTML = '';
      (options || []).forEach(opt => {
        const b = document.createElement('button');
        b.textContent = opt.text;
        b.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.pickChoice(opt, onPick);
        });
        box.appendChild(b);
      });
    }

    pickChoice(opt, onPick) {
      this.choiceActive = false;
      if (this.el.dialogueChoices) {
        this.el.dialogueChoices.classList.add('hidden');
        this.el.dialogueChoices.innerHTML = '';
      }
      const cont = this.el.dialogue.querySelector('.dialogue-continue');
      if (cont) cont.classList.remove('hidden');
      if (opt && opt.next) {
        this.showChoice(opt.next.speaker || '心念', opt.next.prompt, opt.next.options, opt.next.onPick || onPick);
        return;
      }
      this.el.dialogue.classList.add('hidden');
      this.dialogueActive = false;
      const ret = this.dialogueReturn || 'playing';
      this.state = ret;
      this.dialogueReturn = 'playing';
      this.input.reset();
      if (onPick) onPick(opt ? opt.value : undefined, opt);
    }

    displayDialogueLine() {
      const line = this.dialogueQueue[this.dialogueIndex];
      if (!line) { this.finishDialogue(); return; }
      const who = line.who || 'narrator';
      const speaker = line.name || (who === 'shen' ? this.playerName : DIALOGUE_NAMES[who]) || '旁白';
      this.el.dialogueName.textContent = speaker;
      this.dialogueFull = this.formatText(line.text || '');
      this.el.dialogueText.textContent = '';
      this.dialogueChars = 0;
      this.dialogueTyping = true;
      this.dialogueAdvanceRequested = false;
      Art.drawPortrait(this.el.dialoguePortrait, who === 'narrator' || who === 'echo' ? 'narrator' : who);
      if (line.voice && who !== 'narrator') {
        this.audio.speak(this.dialogueFull, who);
      }
    }

    updateDialogue(dt) {
      if (this.choiceActive) return;
      const line = this.dialogueQueue[this.dialogueIndex];
      if (!line) { this.finishDialogue(); return; }
      if (this.dialogueTyping) {
        this.dialogueChars = Math.min(this.dialogueFull.length, this.dialogueChars + dt * 42);
        this.el.dialogueText.textContent = this.dialogueFull.slice(0, Math.floor(this.dialogueChars));
        if (this.dialogueChars >= this.dialogueFull.length) {
          this.dialogueTyping = false;
          this.el.dialogueText.textContent = this.dialogueFull;
        }
      }
      if (this.dialogueAdvanceRequested || this.input.justPressed('confirm') || this.input.justPressed('confirm-key')) {
        this.dialogueAdvanceRequested = false;
        if (this.dialogueTyping) {
          this.dialogueTyping = false;
          this.el.dialogueText.textContent = this.dialogueFull;
        } else {
          this.dialogueIndex++;
          if (this.dialogueIndex >= this.dialogueQueue.length) this.finishDialogue();
          else {
            this.audio.sfx('ui');
            this.displayDialogueLine();
          }
        }
      }
    }

    finishDialogue() {
      this.dialogueActive = false;
      this.choiceActive = false;
      if (this.el.dialogueChoices) {
        this.el.dialogueChoices.classList.add('hidden');
        this.el.dialogueChoices.innerHTML = '';
      }
      this.el.dialogue.classList.add('hidden');
      const cb = this.dialogueOnComplete;
      this.dialogueOnComplete = null;
      const ret = this.dialogueReturn;
      this.state = ret || 'playing';
      if (ret !== 'dialogue') this.dialogueReturn = 'playing';
      if (cb) cb();
    }

    showOmen(name, sub) {
      this.el.omenName.textContent = name;
      this.el.omenSub.textContent = sub || '';
      this.el.omenToast.classList.add('show');
      this.audio.sfx('gong');
      clearTimeout(this.omenTimer);
      this.omenTimer = setTimeout(() => this.el.omenToast.classList.remove('show'), 5200);
    }

    showToast(text, type) {
      if (!text) return;
      this.el.toast.textContent = text;
      this.el.toast.className = 'toast show' + (type ? ' ' + type : '');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.el.toast.classList.remove('show'); }, 2600);
    }

    bark(speaker, text, who) {
      const el = this.el.bark;
      const shownSpeaker = (speaker === 'player' || speaker === '{name}') ? this.playerName : speaker;
      const shownText = this.formatText(text);
      el.innerHTML = '';
      const b = document.createElement('b'); b.textContent = shownSpeaker; el.appendChild(b);
      const span = document.createElement('span'); span.textContent = shownText; el.appendChild(span);
      el.classList.add('show');
      clearTimeout(this.barkTimer);
      this.barkTimer = setTimeout(() => el.classList.remove('show'), 3600);
      if (who) this.audio.speak(shownText, who);
    }

    startTutorial() {
      if (this.tipsShown || !this.level || !this.level.tips) return;
      this.tipsShown = true;
      let delay = 800;
      for (const tip of this.level.tips) {
        const t1 = setTimeout(() => {
          if (!this.level) return;
          const chip = document.createElement('div');
          chip.className = 'tip-chip';
          const k = document.createElement('kbd'); k.textContent = tip.key; chip.appendChild(k);
          const em = document.createElement('em'); em.textContent = tip.text; chip.appendChild(em);
          this.el.tutorial.appendChild(chip);
          while (this.el.tutorial.children.length > 4) this.el.tutorial.removeChild(this.el.tutorial.firstChild);
          const t2 = setTimeout(() => {
            chip.style.opacity = '0';
            chip.style.transition = 'opacity .5s ease';
            const t3 = setTimeout(() => chip.remove(), 520);
            this.tipTimers.push(t3);
          }, tip.dur * 1000);
          this.tipTimers.push(t2);
        }, delay);
        this.tipTimers.push(t1);
        delay += 1900;
      }
    }
    clearTipTimers() {
      for (const t of this.tipTimers) clearTimeout(t);
      this.tipTimers = [];
      this.el.tutorial.innerHTML = '';
    }

    /* ================= 心诀 ================= */
    openUpgrade() {
      if (this.chapter >= LEVELS.length - 1) return;
      this.state = 'upgrade';
      this.audio.stopVoice();
      this.audio.sfx('checkpoint');
      this.el.hud.classList.add('hidden');
      this.el.bossBar.classList.add('hidden');
      this.el.dialogue.classList.add('hidden');
      const available = STORY.upgrades.filter(u => !this.upgrades.includes(u.id));
      const picks = U.shuffle(available).slice(0, Math.min(3, available.length));
      this.el.upgradeCards.innerHTML = '';
      picks.forEach(u => {
        const btn = document.createElement('button');
        btn.className = 'upgrade-card';
        btn.dataset.upgrade = u.id;
        btn.innerHTML = `<div class="seal">${u.seal}</div><span class="kind">${u.kind}</span><h3>${u.name}</h3><p>${u.desc}</p><span class="pick">参悟此诀 →</span>`;
        this.el.upgradeCards.appendChild(btn);
      });
      this.el.upgrade.classList.remove('hidden');
      if (this.audioReady) this.audio.startMusic('title');
    }

    chooseUpgrade(id) {
      if (this.state !== 'upgrade') return;
      if (!this.upgrades.includes(id)) this.upgrades.push(id);
      this.audio.sfx('checkpoint');
      this.el.upgrade.classList.add('hidden');
      const next = this.chapter + 1;
      this.cleared = 0;
      this.startChapter(next, 0, {});
    }

    /* ================= 过场 ================= */
    spawnEnemy(type, x, opts) {
      const e = new Enemy(this, type, x, opts || {});
      this.enemies.push(e);
      return e;
    }

    onUltimateStart() {
      this.unlockAchievement('whale_song');
      this.ultFx = { t: 0, active: false, x: this.player.x, y: this.player.y - 100 };
      this.slowTimer = Math.max(this.slowTimer, .35);
      this.flashScreen('#bff8ff', .12);
      this.addShake(7);
      this.spawnBurst(this.player.x, this.player.y - 90, '#9ff5ff', 28, 240, { size: 3.2, life: .8, gravity: 0, additive: true });
      this.addText(this.player.x, this.player.y - 250, '鲸落', '#bffaff', 36, { bold: true, life: 1.2 });
      this.audio.speak('鲸落。', 'player');
    }

    ultimateBurst(player) {
      if (!this.ultFx) this.ultFx = { t: 0, active: false, x: player.x, y: player.y - 100 };
      this.ultFx.active = true;
      this.ultFx.t = Math.max(.82, this.ultFx.t);
      const dmg = 320 * this.mods.damage * (this.mods.ultDamage || 1);
      for (const e of this.enemies.slice()) {
        if (e.dead) continue;
        e.takeDamage(dmg, { x: player.x, y: player.y }, this);
        this.addText(e.x, e.y - 130, Math.round(dmg), '#d9fdff', 27, { bold: true });
      }
      if (this.boss && !this.boss.dead) {
        this.boss.takeDamage(dmg, player, this);
        this.addText(this.boss.x, this.boss.y - 310, Math.round(dmg), '#ffe6b8', 34, { bold: true });
      }
      this.projectiles = this.projectiles.filter(p => p.owner === 'player');
      this.hazards = [];
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * .24);
      this.flashScreen('#d8feff', .3);
      this.addShake(22);
      this.audio.sfx('bossDown');
      this.audio.sfx('wave');
      for (let i = 0; i < 60; i++) {
        const a = Math.random() * TAU;
        this.spawnParticle(player.x + Math.cos(a) * U.rand(30, 220), player.y - U.rand(20, 260), Math.cos(a) * U.rand(60, 340), Math.sin(a) * U.rand(60, 220) - 80, U.rand(.5, 1.3), U.rand(2, 5), '#a5f5ff', 40, true);
      }
      if (this.state === 'playing') this.bark(this.playerName, '这一剑，为所有被夺走的明天。', 'player');
    }

    startEnding() {
      this.state = 'ending';
      this.cinemaMode = 'ending';
      this.cinemaScenes = STORY.ending;
      this.cinemaIndex = 0;
      this.cinemaSceneT = 0;
      this.el.victoryStamp.classList.add('hidden');
      this.el.hud.classList.add('hidden');
      this.el.touch.classList.add('hidden');
      this.el.cinematic.classList.remove('hidden');
      this.el.cinemaSkip.innerHTML = '跳至尾声 <kbd>Esc</kbd>';
      this.audio.stopVoice();
      this.audio.startMusic('ending');
      this.showCinemaScene();
    }

    showCinemaScene() {
      const scene = this.cinemaScenes[this.cinemaIndex];
      if (!scene) return;
      this.cinemaSceneT = 0;
      const speaker = scene.speaker === 'player' ? this.playerName : scene.speaker === '旁白' ? '周娣' : (scene.speaker || '');
      const text = this.formatText(scene.text || '');
      this.el.cinemaChapter.textContent = scene.chapter || (this.cinemaMode === 'ending' ? '尾声 · 雪停' : '');
      this.el.cinemaSpeaker.textContent = speaker;
      this.el.cinemaText.textContent = text;
      const portraitWho = (speaker === this.playerName || scene.speaker === 'player') ? 'shen' : speaker === '刘奥' ? 'liuao' : speaker === '刘亚岚' ? 'alan' : 'narrator';
      Art.drawPortrait(this.el.cinemaPortrait, portraitWho);
      this.el.cinemaHint.textContent = '点击 / 空格 继续';
      if (scene.voice) this.audio.speak(text, scene.voice);
    }

    updateCinematic(dt) {
      const scene = this.cinemaScenes[this.cinemaIndex];
      if (!scene) { this.finishCinematic(); return; }
      this.cinemaSceneT += dt;
      if (this.input.justPressed('pause')) { this.skipCinematic(); return; }
      if (this.input.justPressed('confirm') || this.input.justPressed('confirm-key')) { this.advanceCinematic(); return; }
      if (this.cinemaSceneT >= scene.duration) this.advanceCinematic();
    }

    advanceCinematic() {
      if (this.cinemaIndex >= this.cinemaScenes.length - 1) { this.finishCinematic(); return; }
      this.cinemaIndex++;
      this.audio.sfx('ui');
      this.showCinemaScene();
    }

    skipCinematic() {
      this.audio.sfx('uiBack');
      this.finishCinematic();
    }

    finishCinematic() {
      this.el.cinematic.classList.add('hidden');
      this.audio.stopVoice();
      if (this.cinemaMode === 'intro') {
        this.cinemaMode = null;
        this.startChapter(0, 0, {});
      } else {
        this.cinemaMode = null;
        this.showEndingScreen();
      }
    }

    showEndingScreen() {
      this.state = 'endingScreen';
      this.el.cinematic.classList.add('hidden');
      this.el.hud.classList.add('hidden');
      this.el.victoryStamp.classList.add('hidden');
      this.el.ending.classList.remove('hidden');
      const time = U.formatTime(this.playTime);
      this.el.endingStats.innerHTML = `
        <div class="ending-stat"><b>${time}</b><span>梦境时刻</span></div>
        <div class="ending-stat"><b>${this.stats.enemies}</b><span>心障破除</span></div>
        <div class="ending-stat"><b>${this.stats.perfect}</b><span>完美闪身</span></div>
        <div class="ending-stat"><b>${this.stats.maxCombo}</b><span>最高连斩</span></div>
        <div class="ending-stat"><b>${this.deaths}</b><span>心灯重燃</span></div>`;
      this.completed = true;
      this.saveGame(true);
    }

    /* ================= 模态 ================= */
    openHelp() {
      this.modalReturn = this.state === 'paused' ? 'pause' : 'title';
      this.el.pause.classList.add('hidden');
      this.el.settings.classList.add('hidden');
      this.el.achScreen.classList.add('hidden');
      this.el.help.classList.remove('hidden');
      this.audio.sfx('ui');
    }
    closeHelp() {
      this.el.help.classList.add('hidden');
      if (this.modalReturn === 'pause') this.el.pause.classList.remove('hidden');
      this.modalReturn = null;
    }
    openSettings() {
      this.modalReturn = this.state === 'paused' ? 'pause' : 'title';
      this.el.pause.classList.add('hidden');
      this.el.help.classList.add('hidden');
      this.el.achScreen.classList.add('hidden');
      this.el.settings.classList.remove('hidden');
      this.syncSettingsUI();
    }
    closeSettings() {
      this.el.settings.classList.add('hidden');
      if (this.modalReturn === 'pause') this.el.pause.classList.remove('hidden');
      this.modalReturn = null;
      this.saveSettings();
    }
    openPhotos() {
      if (!this.level || !this.player) { this.showToast('进入关卡后才能导入照片。', 'red'); return; }
      if (!this.campusLayer || !this.campusLayer.photos || !this.campusLayer.photos.scene) {
        this.showToast('当前画面没有可用的 3D 舞台。', 'red');
        return;
      }
      this.photoReturn = this.state === 'photo' ? this.photoReturn : this.state;
      this.state = 'photo';
      this.el.pause.classList.add('hidden');
      this.el.photoScreen.classList.remove('hidden');
      this.input.reset();
      this.audio.sfx('ui');
    }

    closePhotos() {
      if (this.state !== 'photo') return;
      this.el.photoScreen.classList.add('hidden');
      const back = this.photoReturn || 'playing';
      this.state = back;
      if (back === 'paused') this.el.pause.classList.remove('hidden');
      this.input.reset();
      this.audio.sfx('uiBack');
    }

    async importPhoto() {
      const file = this.el.photoFile && this.el.photoFile.files && this.el.photoFile.files[0];
      if (!file) { this.showToast('先选择一张本地照片。', 'red'); return; }
      if (!this.player || !this.campusLayer || !this.campusLayer.photos) return;
      if (file.size > 12 * 1024 * 1024) { this.showToast('照片太大，请选择 12MB 以内的图片。', 'red'); return; }
      const rawName = (this.el.photoName && this.el.photoName.value || '').trim();
      const name = (rawName || file.name.replace(/\.[^.]+$/, '') || '照片角色').slice(0, 12);
      const faction = (this.el.photoFaction && this.el.photoFaction.value) || 'student';
      const ai = !this.el.photoAI || !!this.el.photoAI.checked;
      if (this.el.photoStatus) this.el.photoStatus.textContent = '正在本地去背景并生成纸片人……';
      try {
        const ch = await this.campusLayer.photos.addFile(file, {
          name, faction, ai,
          x: Math.min(this.level.width - 260, this.player.x + 220),
          z: 0
        });
        const label = { student: '学生', athlete: '体育生', scholar: '学霸' }[faction] || faction;
        if (this.el.photoStatus) {
          this.el.photoStatus.textContent = `已导入：${ch.name} · ${label}${ai ? '（AI 已开启）' : '（立牌模式）'}。照片只在本次游玩中可见，刷新后消失。`;
        }
        this.showToast('照片角色已进入场景 · 仅在本地', 'gold');
        this.audio.sfx('checkpoint');
        if (this.el.photoFile) this.el.photoFile.value = '';
      } catch (err) {
        if (this.el.photoStatus) this.el.photoStatus.textContent = '导入失败：' + (err && err.message ? err.message : '无法读取照片');
        this.showToast('照片导入失败', 'red');
      }
    }

    togglePause(force) {
      if (this.state === 'playing' || (force && this.state === 'playing')) {
        this.state = 'paused';
        this.el.pause.classList.remove('hidden');
        this.audio.stopVoice();
        this.input.reset();
      } else if (this.state === 'paused' && !force) {
        this.resumeGame();
      }
    }
    resumeGame() {
      this.el.pause.classList.add('hidden');
      this.el.help.classList.add('hidden');
      this.el.settings.classList.add('hidden');
      this.el.achScreen.classList.add('hidden');
      this.state = 'playing';
      this.input.reset();
      this.audio.resume();
    }

    /* ================= HUD ================= */
    updatePortrait() {
      Art.drawPortrait(this.el.hudPortrait, 'shen');
    }

    showBossBar(target) {
      this.el.bossBar.classList.remove('hidden');
      if (target === this.boss) {
        this.el.bossName.textContent = '刘奥';
        this.el.bossTitle.textContent = '守心人';
        this.el.bossPhase.textContent = '一阶段';
      } else {
        this.el.bossName.textContent = target.name;
        this.el.bossTitle.textContent = '心障';
        this.el.bossPhase.textContent = '执念';
      }
    }

    updateHUD() {
      const inGame = this.level && ['playing', 'dialogue', 'paused', 'growth', 'equipment', 'journal', 'companions', 'zones', 'photo'].includes(this.state);
      this.el.hud.classList.toggle('hidden', !inGame);
      if (this.campusLayer) this.campusLayer.updateHUD(inGame);
      if (!inGame) {
        if (U.isTouch()) this.el.touch.classList.add('hidden');
        return;
      }
      if (U.isTouch() && ['playing', 'dialogue'].includes(this.state)) this.el.touch.classList.remove('hidden');
      else this.el.touch.classList.add('hidden');

      const p = this.player;
      if (p) {
        this.el.hudName.textContent = this.playerName;
        const hpP = U.clamp(p.hp / p.maxHp, 0, 1);
        this.el.hpFill.style.width = (hpP * 100) + '%';
        this.el.hpText.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
        this.el.qiFill.style.width = (U.clamp(p.qi / p.maxQi, 0, 1) * 100) + '%';
        if (this.el.postureFill) this.el.postureFill.style.width = (U.clamp(p.posture / p.maxPosture, 0, 1) * 100) + '%';
        this.el.flaskCount.textContent = p.flasks;
        this.el.focusText.textContent = Math.floor(p.focus) + '%';
        this.el.focusBadge.classList.toggle('ready', p.focus >= 100);
        if (this.el.buffBadge) this.el.buffBadge.hidden = !(this.time < (this.catBuffUntil || 0));
        const r = this.rpg;
        if (r) {
          if (this.el.levelText) this.el.levelText.textContent = r.level;
          if (this.el.xpFill) this.el.xpFill.style.width = (U.clamp(r.xp / r.xpNext, 0, 1) * 100) + '%';
          if (this.el.xpText) this.el.xpText.textContent = `${r.xp} / ${r.xpNext}`;
          if (this.el.attrBadge) {
            this.el.attrBadge.hidden = r.attrPoints <= 0;
            this.el.attrBadge.textContent = `属性点 ${r.attrPoints}`;
          }
        }
        this.el.hudChapter.textContent = this.level.num;
      }
      this.el.stageLabel.textContent = `${this.level.num} · ${this.level.name}`;
      this.el.timerText.textContent = U.formatTime(this.playTime);
      this.el.objective.textContent = this.objective || this.level.objective;

      const showCombo = this.combo >= 2 && this.comboTimer > 0;
      this.el.combo.classList.toggle('active', showCombo);
      if (showCombo) {
        this.el.comboNumber.textContent = this.combo;
        this.el.comboRank.textContent = this.combo >= 40 ? '天问' : this.combo >= 25 ? '断岳' : this.combo >= 14 ? '流风' : this.combo >= 7 ? '惊鸿' : '无痕';
      }

      const bt = this.bossTarget;
      if (bt && !bt.dead) {
        this.el.bossBar.classList.remove('hidden');
        const bossRatio = bt.corruption !== undefined ? bt.corruption / (bt.maxCorruption || 1) : bt.hp / bt.maxHp;
        this.el.bossFill.style.width = (U.clamp(bossRatio, 0, 1) * 100) + '%';
        if (bt === this.boss) {
          const ph = bt.phase || 1;
          this.el.bossPhase.textContent = ph === 1 ? '一阶段 · 守心' : ph === 2 ? '二阶段 · 焚心' : '三阶段 · 归心';
          this.el.bossName.textContent = '刘奥';
          this.el.bossTitle.textContent = '守心人';
        } else {
          this.el.bossName.textContent = bt.name;
          this.el.bossPhase.textContent = bt.hp < bt.maxHp * .4 ? '执念将散' : '心障';
          this.el.bossFill.style.width = (U.clamp(bt.corruption !== undefined ? bt.corruption / (bt.maxCorruption || 1) : bt.hp / bt.maxHp, 0, 1) * 100) + '%';
        }
      } else if (!bt) {
        this.el.bossBar.classList.add('hidden');
      }
      if (this.state === 'playing' && (this.executeTarget || this.nearInteractable)) {
        this.el.interactName.textContent = this.executeTarget ? '处决 · 气竭目标' : ('互动 · ' + this.nearInteractable.name);
        this.el.interactPrompt.classList.add('show');
      } else this.el.interactPrompt.classList.remove('show');
    }

    /* ================= 渲染 ================= */
    render() {
      const ctx = this.ctx;
      const s = this.renderScale * this.dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.setTransform(s, 0, 0, s, this.offsetX * this.dpr, this.offsetY * this.dpr);
      ctx.imageSmoothingEnabled = true;
      const has3D = !!(this.three && !this.three.failed);
      const use3D = has3D && (this.state === 'title' || (!!this.level && this.player && !['intro', 'ending', 'endingScreen'].includes(this.state)));
      if (has3D) this.three.setVisible(use3D);

      if (this.state === 'title') {
        if (has3D) {
          this.three.renderTitle(this.time, this.settings.reducedMotion);
          this.drawScreenVignette(ctx);
        } else {
          Art.drawTitleScene(ctx, this.time, this.settings.reducedMotion);
        }
      } else if (this.state === 'intro' || this.state === 'ending') {
        this.renderCinematic(ctx);
      } else if (this.state === 'endingScreen') {
        Art.drawCinematic(ctx, 'sunrise', 8.4, 12, {});
        this.drawScreenVignette(ctx);
      } else if (this.level && this.player) {
        this.renderWorld(ctx);
      } else {
        if (has3D) { this.three.renderTitle(this.time, this.settings.reducedMotion); this.drawScreenVignette(ctx); }
        else Art.drawTitleScene(ctx, this.time, this.settings.reducedMotion);
      }
      if (this.campusLayer && this.level && this.player && !['title', 'intro', 'ending', 'endingScreen'].includes(this.state)) {
        this.campusLayer.draw(ctx);
      }
      if (this.flash) {
        const a = U.clamp(this.flash.life / this.flash.max, 0, 1) * .38;
        ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = this.flash.color; ctx.fillRect(0, 0, 1920, 1080); ctx.restore();
      }
    }

    renderCinematic(ctx) {
      const scene = this.cinemaScenes[this.cinemaIndex];
      if (!scene) { Art.drawCinematic(ctx, 'sunrise', this.time, 12, {}); this.drawScreenVignette(ctx); return; }
      Art.drawCinematic(ctx, scene.art, this.cinemaSceneT, scene.duration, {});
      // 场景切入淡黑
      const fadeOut = U.clamp((scene.duration - this.cinemaSceneT) / .75, 0, 1);
      const fadeIn = U.clamp(this.cinemaSceneT / .65, 0, 1);
      const a = Math.max(0, Math.min(1 - fadeIn, 1 - fadeOut)) * .9;
      if (a > 0) { ctx.fillStyle = `rgba(2,5,8,${a})`; ctx.fillRect(0, 0, 1920, 1080); }
      this.drawScreenVignette(ctx);
    }

    renderWorld(ctx) {
      const shakeX = Math.sin(this.time * 137) * this.shakePower;
      const shakeY = Math.cos(this.time * 113) * this.shakePower * .6;
      if (this.three && !this.three.failed) {
        this.renderWorld3D(ctx, shakeX, shakeY);
        return;
      }
      const camX = this.camera.x;
      Art.drawBackground(ctx, this.level.theme, this.time, camX + shakeX * .25, true);

      ctx.save();
      ctx.translate(960 - camX + shakeX, shakeY);
      Art.drawGround(ctx, this.level.theme, this.level.width, GROUND, this.time, camX);
      Art.drawScenery(ctx, this.level.theme, this.level.width, GROUND, this.time, camX);

      if (this.arenaLock) {
        Art.drawBarrier(ctx, this.bounds.left + 16, GROUND, 550, this.time, -1);
        Art.drawBarrier(ctx, this.bounds.right - 16, GROUND, 550, this.time, 1);
      }

      // 预警
      for (const h of this.hazards) h.draw(ctx, this.time);
      for (const e of this.enemies) e.drawTelegraph(ctx, this.time);
      if (this.boss) this.boss.drawTelegraph(ctx, this.time);

      // 角色
      const drawables = this.enemies.slice();
      if (this.boss) drawables.push(this.boss);
      drawables.sort((a, b) => (a.y || 0) - (b.y || 0));
      for (const d of drawables) d.draw(ctx, this.time);
      this.player.draw(ctx, this.time);

      for (const p of this.projectiles) p.draw(ctx, this.time);
      for (const p of this.particles) p.draw(ctx);
      for (const t of this.texts) t.draw(ctx);
      ctx.restore();

      this.renderWeather(ctx, camX, shakeX);
      this.drawScreenVignette(ctx);
      this.drawDirectionHint(ctx, camX);
      this.renderUltimateFx(ctx);
      if (this.player.hp / this.player.maxHp < .3 && !this.player.dead) {
        const a = .12 + Math.sin(this.time * 4) * .05;
        const g = ctx.createRadialGradient(960, 540, 320, 960, 540, 1080);
        g.addColorStop(0, 'rgba(120,10,12,0)'); g.addColorStop(1, `rgba(120,10,12,${a})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
      }
      if (this.slowTimer > 0) {
        ctx.fillStyle = 'rgba(98,226,246,.035)'; ctx.fillRect(0, 0, 1920, 1080);
      }
      this.drawChapterMarker(ctx);
    }

    renderWorld3D(ctx, shakeX, shakeY) {
      ctx.clearRect(0, 0, 1920, 1080);
      this.three.renderWorld(this, shakeX, shakeY);
      this.draw3DOverlay(ctx, shakeX, shakeY);
    }

    draw3DOverlay(ctx, shakeX, shakeY) {
      const project = (x, y) => this.three.project(x, y);
      const time = this.time;
      // 危险区预警
      for (const h of this.hazards) {
        const s = project(h.x, h.y - 8, (h.z || 0) / 100);
        if (!s.visible) continue;
        const active = h.timer > h.delay;
        const prog = U.clamp(h.timer / h.delay, 0, 1);
        ctx.save();
        ctx.globalAlpha = active ? .3 : .16 + prog * .2;
        ctx.strokeStyle = h.kind === 'fire' ? '#ff7858' : '#ffd09a';
        ctx.lineWidth = 1.5;
        ctx.setLineDash(active ? [] : [5, 7]);
        ctx.beginPath(); ctx.ellipse(s.x, s.y + 3, Math.max(18, h.w * .62), Math.max(7, h.h * .32), 0, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = active ? .08 : .035;
        ctx.fillStyle = h.kind === 'fire' ? '#ff5439' : '#ffb97a';
        ctx.beginPath(); ctx.ellipse(s.x, s.y + 3, Math.max(18, h.w * .62), Math.max(7, h.h * .32), 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
      // 敌人预警 & 血条
      for (const e of this.enemies) {
        if (e.dead) continue;
        const p = project(e.x, e.y - 3, (e.z || 0) / 100);
        if (!p.visible) continue;
        if (e.state === 'windup') {
          const cfg = e.cfg || {};
          const prog = U.clamp((e.stateT || 0) / (cfg.windup || .6), 0, 1);
          ctx.save();
          ctx.globalAlpha = .16 + prog * .32;
          ctx.strokeStyle = '#ff705c'; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.ellipse(p.x, p.y + 5, (e.isElite ? 125 : 52) + prog * 20, 16 + prog * 5, 0, 0, TAU); ctx.stroke();
          if (e.cfg && e.cfg.ranged) {
            const pp = project(this.player.x, this.player.y - 100, (this.player.z || 0) / 100);
            ctx.globalAlpha = .08 + prog * .2;
            ctx.setLineDash([7, 9]);
            ctx.beginPath(); ctx.moveTo(p.x, p.y - 60); ctx.lineTo(pp.x, pp.y); ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.restore();
        }
        const ratio = e.corruption !== undefined ? U.clamp(e.corruption / (e.maxCorruption || 1), 0, 1) : U.clamp(e.hp / e.maxHp, 0, 1);
        if (ratio < 1 && !e.isElite) {
          const w = 56, x = p.x - w / 2, y = p.y - (e.size ? e.size * 1.55 : 100);
          ctx.fillStyle = 'rgba(2,8,10,.72)'; ctx.fillRect(x, y, w, 4);
          ctx.fillStyle = e.corruption !== undefined ? '#c86bff' : (ratio > .4 ? '#69d9c8' : '#e06c5c'); ctx.fillRect(x, y, w * ratio, 4);
          const pp = U.clamp((e.posture || 0) / (e.maxPosture || 80), 0, 1);
          ctx.fillStyle = 'rgba(2,8,10,.66)'; ctx.fillRect(x, y + 5, w, 3);
          ctx.fillStyle = '#e8c47a'; ctx.fillRect(x, y + 5, w * pp, 3);
          if (e.executable || e.staggered > 0) { ctx.fillStyle = '#ffe4a6'; ctx.font = '700 16px "STKaiti","KaiTi",serif'; ctx.textAlign = 'center'; ctx.fillText('气竭 · F 处决', p.x, y - 9); }
        }
      }
      // 心障 Boss 预警
      if (this.boss && !this.boss.dead) {
        const bp = project(this.boss.x, this.boss.y - 8, (this.boss.z || 0) / 100);
        if (bp.visible && (this.boss.state === 'windup' || this.boss.pattern || this.boss.executable)) {
          const prog = this.boss.pattern ? U.clamp((this.boss.patternT || 0) / .8, 0, 1) : 1;
          ctx.save();
          ctx.globalAlpha = .12 + prog * .22;
          ctx.strokeStyle = '#ff5b4b'; ctx.lineWidth = 2;
          const size = this.boss.pattern === 'flameRain' ? 190 : 125;
          ctx.beginPath(); ctx.ellipse(bp.x, bp.y + 8, size, 24, 0, 0, TAU); ctx.stroke();
          const pp = project(this.player.x, this.player.y - 100);
          ctx.globalAlpha = .08 + prog * .18;
          ctx.setLineDash([8, 10]);
          ctx.beginPath(); ctx.moveTo(bp.x, bp.y - 120); ctx.lineTo(pp.x, pp.y); ctx.stroke();
          ctx.setLineDash([]);
          if (this.boss.executable) { ctx.fillStyle = '#ffe4a6'; ctx.font = '700 19px "STKaiti","KaiTi",serif'; ctx.textAlign = 'center'; ctx.fillText('气竭 · F 处决', bp.x, bp.y - 300); }
          ctx.restore();
        }
      }
      // 3D 粒子投影到屏幕
      ctx.save();
      for (const p of this.particles) {
        const s = project(p.x, p.y);
        if (!s.visible) continue;
        const a = U.clamp(p.life / p.maxLife, 0, 1);
        ctx.globalAlpha = a;
        ctx.globalCompositeOperation = p.additive ? 'lighter' : 'source-over';
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, Math.max(1, p.size * .85), 0, TAU); ctx.fill();
      }
      ctx.restore();
      // 伤害数字 / 提示
      for (const t of this.texts) {
        const s = project(t.x, t.y);
        if (!s.visible) continue;
        const a = U.clamp(t.life / t.maxLife * 1.7, 0, 1);
        ctx.save(); ctx.globalAlpha = a;
        ctx.font = `${t.bold ? '700 ' : ''}${t.size}px "STKaiti","KaiTi",serif`;
        ctx.textAlign = 'center'; ctx.fillStyle = t.color;
        ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 8;
        ctx.fillText(t.text, s.x, s.y);
        ctx.restore();
      }
      this.drawDirectionHint(ctx, this.camera.x);
      this.renderUltimateFx(ctx);
      if (this.player && this.player.hp / this.player.maxHp < .3 && !this.player.dead) {
        const a = .12 + Math.sin(time * 4) * .05;
        const g = ctx.createRadialGradient(960, 540, 320, 960, 540, 1080);
        g.addColorStop(0, 'rgba(120,10,12,0)'); g.addColorStop(1, `rgba(120,10,12,${a})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080);
      }
      if (this.slowTimer > 0) {
        ctx.fillStyle = 'rgba(98,226,246,.045)'; ctx.fillRect(0, 0, 1920, 1080);
      }
      this.drawScreenVignette(ctx);
    }

    drawScreenVignette(ctx) {
      const v = ctx.createRadialGradient(960, 520, 420, 960, 540, 1220);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.65, 'rgba(0,0,0,.10)'); v.addColorStop(1, 'rgba(0,0,0,.62)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, 1920, 1080);
    }

    renderWeather(ctx, camX, shakeX) {
      const reduced = this.settings.reducedMotion;
      const theme = this.level.theme;
      const t = this.time;
      if (theme === 'snow' || theme === 'title') {
        const n = reduced ? 55 : 135;
        ctx.save();
        for (let i = 0; i < n; i++) {
          const h1 = U.hash(i * 3.7), h2 = U.hash(i * 8.9), h3 = U.hash(i * 2.3);
          const x = ((h1 * 2200 + t * (14 + h2 * 26) - camX * .08 + shakeX) % 2200 + 2200) % 2200 - 140;
          const y = (h2 * 1140 + t * (20 + h3 * 42)) % 1140;
          const r = .7 + h3 * 2.2;
          ctx.fillStyle = `rgba(227,244,246,${.05 + h1 * .22})`;
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
          ctx.strokeStyle = `rgba(227,244,246,${.02 + h1 * .08})`;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 9, y - 4); ctx.stroke();
        }
        ctx.restore();
      } else if (theme === 'bamboo') {
        const n = reduced ? 65 : 155;
        ctx.save();
        for (let i = 0; i < n; i++) {
          const h1 = U.hash(i * 4.3), h2 = U.hash(i * 7.2), h3 = U.hash(i * 2.8);
          const x = ((h1 * 2200 + t * (60 + h2 * 80) - camX * .16 + shakeX) % 2200 + 2200) % 2200 - 140;
          const y = (h2 * 1160 + t * (520 + h3 * 220)) % 1160;
          ctx.strokeStyle = `rgba(168,220,220,${.035 + h1 * .10})`;
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 13, y + 30); ctx.stroke();
        }
        ctx.restore();
      } else {
        const n = reduced ? 55 : 120;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < n; i++) {
          const h1 = U.hash(i * 5.7), h2 = U.hash(i * 3.1), h3 = U.hash(i * 9.2);
          const x = ((h1 * 2100 + Math.sin(t * .5 + i) * 45 - camX * .1) % 2100 + 2100) % 2100;
          const y = 1050 - ((h2 * 930 + t * (28 + h3 * 55)) % 960);
          ctx.fillStyle = theme === 'boss' ? `rgba(255,${90 + h3 * 70},60,${.05 + h1 * .26})` : `rgba(255,${140 + h3 * 60},75,${.04 + h1 * .24})`;
          ctx.beginPath(); ctx.arc(x, y, .7 + h3 * 2, 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
      // 上方暖霾
      if (theme === 'temple' || theme === 'boss') {
        const g = ctx.createLinearGradient(0, 0, 0, 520);
        g.addColorStop(0, theme === 'boss' ? 'rgba(90,10,12,.14)' : 'rgba(100,33,15,.10)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 520);
      }
    }

    drawDirectionHint(ctx, camX) {
      if (this.state !== 'playing' || this.encounterActive || this.boss || !this.level) return;
      if (this.level.bossFight && !this.boss) {
        if (this.player.x > this.level.width - 900) return;
      }
      const pulse = .5 + Math.sin(this.time * 2.2) * .18;
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = 'rgba(139,238,250,.55)'; ctx.lineWidth = 1.5;
      const x = 1760, y = 620;
      ctx.beginPath(); ctx.moveTo(x, y + 16); ctx.lineTo(x + 16, y); ctx.lineTo(x, y - 16); ctx.stroke();
      ctx.font = '15px "STKaiti","KaiTi",serif'; ctx.fillStyle = 'rgba(216,234,232,.6)';
      ctx.textAlign = 'right';
      ctx.fillText('向山中去', x - 18, y + 5);
      ctx.restore();
    }

    drawChapterMarker(ctx) {
      if (this.state === 'dialogue' || this.state === 'upgrade') return;
    }

    renderUltimateFx(ctx) {
      if (!this.ultFx) return;
      const t = this.ultFx.t;
      if (this.ultFx.active) {
        const k = U.clamp((t - .82) / 1.4, 0, 1);
        const a = Math.sin(k * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * .7;
        const wx = -400 + k * 2800;
        const wy = 500 - k * 170;
        const g = ctx.createLinearGradient(wx - 500, wy, wx + 500, wy);
        g.addColorStop(0, 'rgba(62,190,220,0)'); g.addColorStop(.35, 'rgba(83,220,242,.20)'); g.addColorStop(.7, 'rgba(193,251,255,.36)'); g.addColorStop(1, 'rgba(50,160,190,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(wx, wy, 520, 125, -.04, 0, TAU); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(wx + 420, wy - 8); ctx.quadraticCurveTo(wx + 590, wy - 140, wx + 650, wy - 20);
        ctx.quadraticCurveTo(wx + 600, wy + 15, wx + 650, wy + 100);
        ctx.quadraticCurveTo(wx + 540, wy + 40, wx + 400, wy + 60); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(235,255,255,.55)';
        ctx.beginPath(); ctx.arc(wx - 300, wy - 5, 6, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(137,242,255,.25)'; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.ellipse(wx - 120, wy + 30 + i * 20, 610 - i * 40, 30 + i * 12, -.03, 0, Math.PI); ctx.stroke();
        }
        ctx.font = '700 96px "STKaiti","KaiTi",serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(210,251,255,${a * .18})`;
        ctx.fillText('鲸 落', 960, 340);
        ctx.restore();
      } else {
        let px = 960, py = 500;
        if (this.player && this.three && !this.three.failed) {
          const p = this.three.project(this.player.x, this.player.y - 100);
          px = p.x; py = p.y;
        } else if (this.player) {
          px = this.player.x - this.camera.x + 960;
          py = this.player.y - 100;
        }
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const k = U.clamp(t / .82, 0, 1);
        ctx.strokeStyle = `rgba(126,238,255,${.35 * (1 - k) + .1})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath(); ctx.ellipse(px, py, 60 + k * 190 + i * 34, 26 + k * 120 + i * 16, this.time + i, 0, TAU); ctx.stroke();
        }
        ctx.restore();
      }
    }

    /* ================= 入口 ================= */
  }

  window.addEventListener('load', () => {
    window.__sanzhongGame = new Game();
  });
})();
