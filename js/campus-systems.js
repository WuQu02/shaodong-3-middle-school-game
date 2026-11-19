/* 三中风云 — 校园异化系统层
 * 包含：战斗净化 / 理智 / 道具 / 伙伴 / 伪装 / 算力之眼 / 谣言 / 校园日历 / 2.5D 照片角色
 * 依赖 campus-data.js 提供的 window.CAMPUS_DATA；缺失时使用内置最小数据，不会中断游戏。
 */
(function () {
  'use strict';

  const DATA = window.CAMPUS_DATA || {
    meta: { school: '邵东市第三中学', startDate: '2025-09-01', examDate: '2026-06-07', className: '高2314班' },
    periods: [
      { id: 'morning', name: '早自习', start: '07:00', end: '07:40' },
      { id: 'class1', name: '上午课程', start: '08:00', end: '12:00' },
      { id: 'noon', name: '午休', start: '12:00', end: '14:00' },
      { id: 'class2', name: '下午课程', start: '14:30', end: '17:30' },
      { id: 'dusk', name: '课外活动', start: '17:30', end: '18:30' },
      { id: 'night', name: '晚自习', start: '18:30', end: '21:40' },
      { id: 'lightsout', name: '熄灯', start: '22:10', end: '06:30' }
    ],
    calendar: [], factions: [], aiGirls: [], survivors: [], classes: [], class2314: [],
    rumors: [], events: [], recipes: []
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ===== 27 班行为树事件 ===== */
  const CLASS_EVENT_TEMPLATES = {
    study: { title: '内卷风暴', desc: '两个实验班在走廊里比起了刷题速度，空气里全是咖啡味。', pollution: 16, san: -4, disguise: -3, spawn: 'scholar', faction: 'study' },
    sports: { title: '球场冲突', desc: '篮球场上一次犯规升级成推搡，围观的人越来越多。', pollution: 20, san: -5, disguise: -2, spawn: 'athlete', faction: 'sports' },
    art: { title: '艺术节排练', desc: '汉服社和合唱团在兰蕙亭边排练，围观的同学难得笑出了声。', pollution: -6, san: 6, disguise: 2, spawn: null, faction: 'dream' },
    gossip: { title: '匿名表白墙', desc: '匿名墙上出现了一条指名道姓的帖子，转发正在加速。', pollution: 14, san: -8, disguise: -2, spawn: null, faction: 'ghost' },
    blackout: { title: '晚自习停电', desc: '整栋教学楼突然一黑，走廊尽头传来不属于任何人的低语。', pollution: 24, san: -6, disguise: -4, spawn: 'inkling', faction: 'chaos' },
    exam: { title: '月考放榜', desc: '成绩单贴上了后墙。有人欢呼，有人把卷子揉成了一团。', pollution: 10, san: -3, disguise: 1, spawn: null, faction: 'study' },
    teacher: { title: '班主任暴走', desc: '粉笔灰像雪一样落下来。班主任的镜片后面，是一双发红的眼睛。', pollution: 30, san: -8, disguise: -6, spawn: 'elite', faction: 'teaching' }
  };
  // 27 个班级的专属事件：由本班班主任/班长/学习委员触发，替换通用模板。
  const CLASS_SIGNATURE_EVENTS = {
    '2301': { title: '倒计时墙', text: '李严厉在走廊挂出新的倒计时牌，红字比昨天多了一划。王第一把错题本抱得更紧，赵清北的笔一直没停。', pollution: 14, san: -5, disguise: -2, spawn: 'scholar', faction: 'study' },
    '2302': { title: '第二名的空位', text: '孙探花发现自己的座位被挪到窗边，桌洞里多了一张写着名次的纸条。周折桂把竞赛卷翻到最后一页，谁也没说话。', pollution: 13, san: -4, disguise: -1, spawn: 'scholar', faction: 'study' },
    '2303': { title: '半场哨声', text: '郑冲锋在球场上把哨子吹得发颤，何传炬的接力棒掉在地上。围观的人分成两拨，谁也不肯先退。', pollution: 18, san: -5, disguise: -2, spawn: 'athlete', faction: 'sports' },
    '2304': { title: '走廊诗会', text: '苏听澜把一首写到一半的诗贴在墙上，林落笔在旁边补了最后一句。罗知秋站在人群外，替他们把被风吹起的纸角压住。', pollution: 7, san: 4, disguise: 1, spawn: null, faction: 'dream' },
    '2305': { title: '第六节课的迟到', text: '黄守时又迟到了，唐慢半跟着他慢半拍进教室，蒋自明在最后一排打了个哈欠。整排人像被抽掉了时间。', pollution: 10, san: -3, disguise: -1, spawn: 'inkling', faction: 'ghost' },
    '2306': { title: '熄灯后的应援', text: '许星野把灯牌藏进外套，方应援在楼梯口放起应援曲。邓慕云没收了两块，第三块还在闪。', pollution: 12, san: -4, disguise: -2, spawn: 'inkling', faction: 'chaos' },
    '2307': { title: '传不完的纸条', text: '贺无言的纸条传到温书宁手里时已经写满两面。彭静堂没有抬头，只把窗户关得更紧。', pollution: 9, san: -4, disguise: -1, spawn: 'paper', faction: 'ghost' },
    '2308': { title: '机器人夜跑', text: '程创的机器人从实验室跑出来，在走廊里绕圈。鲁码追着它跑，何开源蹲在地上改代码，屏幕的蓝光照亮半条走廊。', pollution: 8, san: -2, disguise: -1, spawn: 'scholar', faction: 'chaos' },
    '2309': { title: '加练到熄灯', text: '石建军把全队留在操场加练，高跃跑到最后一圈时吐了。秦疾风还想再来一组，看台上已经没人了。', pollution: 16, san: -5, disguise: -2, spawn: 'athlete', faction: 'sports' },
    '2310': { title: '画布上的第二层影子', text: '叶绘真把画架搬到走廊，江染发现每幅画的影子都朝不同的方向。文墨说别改，这样才像真的。', pollution: 10, san: -4, disguise: 0, spawn: 'inkling', faction: 'dream' },
    '2311': { title: '直角检查', text: '韩守则带着尺子量课桌间距，陆正步把校服领口扣到最上面。严立本站在门口，像一尊不会眨眼的雕塑。', pollution: 12, san: -3, disguise: 2, spawn: 'scholar', faction: 'teaching' },
    '2312': { title: '广播站加更', text: '邵晓播在课间把一条没核实的消息念了两遍，钟灵通在走廊里被人围住。邹传声坐在广播站，耳机一直没摘。', pollution: 15, san: -5, disguise: -2, spawn: 'inkling', faction: 'ghost' },
    '2313': { title: '走廊里的失真', text: '魏逆把音箱搬到楼梯口，白噪负责按播放键。雷鸣靠在栏杆上笑，整栋楼的灯跟着节拍闪。', pollution: 14, san: -4, disguise: -3, spawn: 'inkling', faction: 'chaos' },
    '2314': { title: '高2314的暗号', text: '周帝在门口咳了一声，沈知微立刻把卷子翻面。罗若愚朝你摇头，示意后门有人。全班像一个人一样安静下来。', pollution: 6, san: 2, disguise: 1, spawn: null, faction: 'ghost' },
    '2315': { title: '走廊里的复读机', text: '宋滔滔拉着你讲了十分钟，卢巧嘴在隔壁又讲了一遍。唐乐言笑得停不下来，你的脑子开始嗡嗡响。', pollution: 9, san: -3, disguise: -1, spawn: 'inkling', faction: 'chaos' },
    '2316': { title: '理性观测记录', text: '沈观测把你的反应记在本子上，方数据给出三条解释，顾维理说都不够精确。你忽然觉得走廊很冷。', pollution: 10, san: -6, disguise: 0, spawn: 'scholar', faction: 'chaos' },
    '2317': { title: '走廊异闻录', text: '楚天选声称走廊尽头有第二扇门，叶设定立刻补完了世界观。龙傲川已经站在门前，摆好了起手式。', pollution: 11, san: -3, disguise: -1, spawn: 'paper', faction: 'chaos' },
    '2318': { title: '花坛里的新芽', text: '谷满仓发现花坛里长出一排不该在这个季节出现的苗。苗青禾蹲下去看，田厚生把铲子握得很紧。', pollution: 8, san: -2, disguise: 0, spawn: 'inkling', faction: 'teaching' },
    '2319': { title: '第三节课的梦', text: '夏无梦趴在桌上说听见了铃声，程数羊数到第四百只。周安眠把窗帘拉上，教室暗得像深夜。', pollution: 12, san: -6, disguise: -1, spawn: 'paper', faction: 'ghost' },
    '2320': { title: '全班的情绪', text: '陈相扶一皱眉，白同心就跟着难过；秦向暖想安慰，整组人一起红了眼睛。温暖有时候也会太重。', pollution: 7, san: -3, disguise: 1, spawn: 'inkling', faction: 'dream' },
    '2321': { title: '塔罗翻面', text: '简塔罗在走廊摆开牌阵，卜知远说今天会有人缺席。袁卜翻开最后一张牌，牌面是你自己的背影。', pollution: 9, san: -5, disguise: -1, spawn: 'paper', faction: 'ghost' },
    '2322': { title: '躺平结界', text: '李随缘把校服盖在头上，张且过说再睡五分钟，吴所求已经五分钟没有动。走廊的钟也慢了半拍。', pollution: 10, san: 2, disguise: -1, spawn: 'inkling', faction: 'chaos' },
    '2323': { title: '走廊里的节拍', text: '苏旋律敲着栏杆，石节奏用笔打拍子，郑闻鼓把整条走廊带成了一个巨大的鼓面。', pollution: 11, san: -3, disguise: -1, spawn: 'athlete', faction: 'dream' },
    '2324': { title: '双语广播', text: '于四海在广播里把通知念成英文，唐语希又翻回中文时漏了一句。蒋博雅皱眉，走廊里的学生开始各说各的。', pollution: 9, san: -3, disguise: -1, spawn: 'scholar', faction: 'study' },
    '2325': { title: '自己做的手', text: '钱实验的机械手从课桌下伸出来，华创新说只是演示。焦启明想关掉它，开关却不在手上。', pollution: 13, san: -4, disguise: -2, spawn: 'scholar', faction: 'chaos' },
    '2326': { title: '旧曲重弹', text: '陆听琴在空教室弹起一首很旧的曲子，苏挽月跟着哼，孔怀古发现谱纸上的字和校史里的一页一模一样。', pollution: 8, san: -4, disguise: 0, spawn: 'paper', faction: 'dream' },
    '2327': { title: '新班的第一次点名', text: '江汇点到最后一个人时停顿了。文启新问怎么了，罗万象说名单上多了一个名字。', pollution: 10, san: -4, disguise: -1, spawn: 'inkling', faction: 'teaching' }
  };
  const CLASS_QUIZ = [
    { q: '邵东三中的校训是？', options: ['求真 · 扬善 · 尚美', '厚德载物 · 自强不息', '博学 · 审问 · 慎思'], answer: 0 },
    { q: '邵东三中建校于哪一年？', options: ['1956', '1949', '1978'], answer: 0 },
    { q: '“三苦精神”指的是？', options: ['苦干 · 苦教 · 苦学', '苦读 · 苦练 · 苦思', '苦学 · 苦教 · 苦管'], answer: 0 },
    { q: '带电粒子在匀强电场中（初速度为零）做？', options: ['匀加速直线运动', '匀速圆周运动', '简谐运动'], answer: 0 },
    { q: '函数 f(x) = x² 的导数是？', options: ['2x', 'x', 'x² / 2'], answer: 0 },
    { q: '“先天下之忧而忧”出自？', options: ['《岳阳楼记》', '《醉翁亭记》', '《出师表》'], answer: 0 },
    { q: '兰蕙亭位于校园的？', options: ['名人园旁', '操场中央', '校门外'], answer: 0 },
    { q: '学校图书馆的名字是？', options: ['特立图书馆', '逸夫图书馆', '兰蕙图书馆'], answer: 0 },
    { q: '宿舍区“女左男右”指的是？', options: ['西侧女生、东侧男生', '东侧女生、西侧男生', '随机分配'], answer: 0 },
    { q: '高考通常在每年的？', options: ['6 月 7 日', '6 月 1 日', '7 月 7 日'], answer: 0 },
    { q: '邵东三中的大门朝向？', options: ['南', '北', '东'], answer: 0 },
    { q: '三中大道位于校园的？', options: ['北侧', '南侧', '东侧'], answer: 0 }
  ];
  const DORM_QUIZ = [
    { q: '邵东三中的校训是？', options: ['求真 · 扬善 · 尚美', '厚德载物 · 自强不息', '博学 · 审问 · 慎思'], answer: 0 },
    { q: '学校建校于哪一年？', options: ['1956', '1949', '1978'], answer: 0 },
    { q: '“三苦精神”指的是？', options: ['苦干 · 苦教 · 苦学', '苦读 · 苦练 · 苦思', '苦学 · 苦教 · 苦管'], answer: 0 },
    { q: '宿舍熄灯时间是？', options: ['22:10', '21:40', '23:00'], answer: 0 },
    { q: '早自习从几点开始？', options: ['7:00', '6:30', '7:30'], answer: 0 },
    { q: '学校图书馆的名字是？', options: ['特立图书馆', '逸夫图书馆', '兰蕙图书馆'], answer: 0 },
    { q: '兰蕙亭位于校园的？', options: ['名人园旁', '操场中央', '校门外'], answer: 0 },
    { q: '校门外的主干道叫？', options: ['三中大道', '棠下桥路', '星火路'], answer: 0 },
    { q: '体育节通常在每年的？', options: ['10 月', '3 月', '12 月'], answer: 0 },
    { q: '高考通常在每年的？', options: ['6 月 7 日', '6 月 1 日', '7 月 7 日'], answer: 0 }
  ];

  /* ================= 道具与装备定义 ================= */
  const CONSUMABLES = {
    rice: { name: '未受污染的白米饭', desc: '恢复 30 点理智，清除幻觉。', icon: '饭' },
    chalk: { name: '物理老师的粉笔', desc: '在脚下画出净化法阵，6 秒内每秒回复 5 点理智。', icon: '粉' },
    radio: { name: '老式收音机', desc: '开启后探测附近高侵蚀敌人 30 秒，但会暴露位置。', icon: '播' },
    thermos: { name: '教导主任的保温杯', desc: '摔碎后使 5 米内异化体罚站 3 秒。', icon: '杯' },
    leftover: { name: '午夜食堂的剩菜', desc: '恢复 50 HP，永久降低 10 点理智上限。', icon: '菜' },
    sedative: { name: '精神镇静剂', desc: '20 秒内免疫精神攻击。', icon: '静' },
    sanPack: { name: '净化饭团', desc: '立即恢复 45 点理智。', icon: '团' },
    evidence: { name: '证据', desc: '辟谣所需的监控录像与证言。', icon: '证' }
  };
  const SPECIAL_ITEMS = {
    spoon: { name: '不锈钢汤勺', slot: 'weapon', rarity: 2, desc: '初始武器。攻击削减侵蚀度。', affixes: [{ key: 'damage', label: '剑伤', value: .03, pct: true }] },
    headphones: { name: '降噪耳机', slot: 'head', rarity: 2, desc: '精神伤害 -50%。', affixes: [] },
    bookShield: { name: '加厚课本盾', slot: 'head', rarity: 2, desc: '抵挡 55% 物理伤害，耐久 3 次。', affixes: [], durability: 3 },
    paddedUniform: { name: '防刺校服外套', slot: 'armor', rarity: 2, desc: '物理伤害 -20%，精神伤害 +5%。', affixes: [] },
    purifySpoon: { name: '净化之勺', slot: 'weapon', rarity: 3, desc: '侵蚀伤害 +25%，命中时回复 2 点理智。', affixes: [{ key: 'damage', label: '剑伤', value: .06, pct: true }] },
    tacticalComm: { name: '战术通讯器', slot: 'head', rarity: 3, desc: '精神伤害 -40%，并持续探测高侵蚀敌人。', affixes: [] }
  };
  const INPUT_LABELS = { spoon: '不锈钢汤勺', headphones: '降噪耳机', exam: '期末试卷护符' };
  const RECIPE_OUT = {
    purifySpoon: { type: 'equip', id: 'purifySpoon' },
    tacticalComm: { type: 'equip', id: 'tacticalComm' },
    riceBall: { type: 'consumable', id: 'sanPack', amount: 2 },
    antiRumorKit: { type: 'consumable', id: 'evidence', amount: 3 }
  };

  function normalizeRpg(rpg) {
    if (!rpg || typeof rpg !== 'object') return rpg;
    rpg.sanMax = clamp(Math.floor(Number(rpg.sanMax) || 100), 30, 140);
    rpg.san = clamp(Number(rpg.san), 0, rpg.sanMax);
    if (!Number.isFinite(rpg.san)) rpg.san = rpg.sanMax;
    rpg.disguise = clamp(Number(rpg.disguise), 0, 100);
    if (!Number.isFinite(rpg.disguise)) rpg.disguise = 100;
    rpg.consumables = Object.assign({ rice: 0, chalk: 0, radio: 0, thermos: 0, leftover: 0, sedative: 0, sanPack: 0, evidence: 0 }, rpg.consumables || {});
    for (const k of Object.keys(rpg.consumables)) rpg.consumables[k] = Math.max(0, Math.floor(Number(rpg.consumables[k]) || 0));
    const ids = (DATA.aiGirls && DATA.aiGirls.length) ? DATA.aiGirls.map(a => a.id) : ['deepseek', 'grok', 'claude'];
    rpg.companions = rpg.companions && typeof rpg.companions === 'object' ? rpg.companions : {};
    for (const id of ids) {
      const c = rpg.companions[id] || {};
      rpg.companions[id] = {
        affinity: clamp(Math.floor(Number(c.affinity) || 60), 0, 100),
        active: !!c.active,
        infected: !!c.infected,
        restUntil: Math.max(0, Number(c.restUntil) || 0)
      };
    }
    // 旧存档只有三位时，保留其余已存在的记录，不清空。
    for (const id of Object.keys(rpg.companions)) if (!ids.includes(id)) delete rpg.companions[id];
    if (!Object.values(rpg.companions).some(c => c.active) && !rpg.companions.deepseek.restUntil) rpg.companions.deepseek.active = true;
    rpg.factions = Object.assign({ deepsea: 0, chaos: 0, dream: 0, ghost: 0, teaching: 0, sports: 0, study: 0 }, rpg.factions || {});
    rpg.clock = Math.max(0, Number.isFinite(Number(rpg.clock)) ? Number(rpg.clock) : 7 * 60);
    rpg.calendarDay = Math.max(0, Math.floor(Number(rpg.calendarDay) || 0));
    rpg.rank = clamp(Math.floor(Number(rpg.rank) || 42), 1, 50);
    const rawPollution = rpg.classPollution && typeof rpg.classPollution === 'object' ? rpg.classPollution : {};
    rpg.classPollution = {};
    for (const c of DATA.classes || []) {
      rpg.classPollution[c.id] = clamp(Math.floor(Number(rawPollution[c.id]) || 0), 0, 100);
    }
    rpg.classLog = rpg.classLog && typeof rpg.classLog === 'object' ? rpg.classLog : {};
    rpg.classQuests = rpg.classQuests && typeof rpg.classQuests === 'object' ? rpg.classQuests : {};
    for (const c of DATA.classes || []) {
      const q = rpg.classQuests[c.id] || {};
      rpg.classQuests[c.id] = {
        step: clamp(Math.floor(Number(q.step) || 0), 0, 3),
        done: !!q.done,
        last: String(q.last || '')
      };
    }
    rpg.miniDone = rpg.miniDone && typeof rpg.miniDone === 'object' ? rpg.miniDone : {};
    rpg.zoneDone = rpg.zoneDone && typeof rpg.zoneDone === 'object' ? rpg.zoneDone : {};
    rpg.zoneVisited = rpg.zoneVisited && typeof rpg.zoneVisited === 'object' ? rpg.zoneVisited : {};
    rpg.zoneLog = Array.isArray(rpg.zoneLog) ? rpg.zoneLog.slice(0, 6) : [];
    rpg.zoneHint = rpg.zoneHint !== undefined ? !!rpg.zoneHint : false;
    rpg.classHintShown = !!rpg.classHintShown;
    rpg.npcDone = rpg.npcDone && typeof rpg.npcDone === 'object' ? rpg.npcDone : {};
    rpg.rumorsDone = rpg.rumorsDone && typeof rpg.rumorsDone === 'object' ? rpg.rumorsDone : {};
    rpg.abandonedAI = Array.isArray(rpg.abandonedAI) ? rpg.abandonedAI.slice(0, 3) : [];
    rpg.starterKit = !!rpg.starterKit;
    return rpg;
  }

  /* ================= 真实时间线 / 作息 ================= */
  class RealTimeSyncSystem {
    constructor(layer) { this.layer = layer; }
    get rpg() { return this.layer.game.rpg; }
    totalMinutes() { const r = this.rpg; return Number(r && r.clock) || 7 * 60; }
    startMs() { return new Date((DATA.meta.startDate || '2025-09-01') + 'T00:00:00'); }
    dateObj() { const d = new Date(this.startMs().getTime() + Math.floor(this.totalMinutes() / 1440) * 86400000); return d; }
    dateISO() {
      const d = this.dateObj();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    clockText() {
      const m = Math.floor(this.totalMinutes() % 1440);
      return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    }
    hours() { return (this.totalMinutes() % 1440) / 60; }
    period() {
      const h = this.hours();
      const list = DATA.periods || [];
      for (const p of list) {
        const [sh, sm] = (p.start || '00:00').split(':').map(Number);
        const [eh, em] = (p.end || '23:59').split(':').map(Number);
        const s = sh * 60 + sm, e = eh * 60 + em;
        const cur = h * 60;
        if (s <= e ? (cur >= s && cur < e) : (cur >= s || cur < e)) return p;
      }
      return list[0] || { id: 'day', name: '白天' };
    }
    examDays() {
      const exam = new Date((DATA.meta.examDate || '2026-06-07') + 'T00:00:00');
      const now = this.dateObj();
      return Math.max(0, Math.ceil((exam - now) / 86400000));
    }
    update(dt, game) {
      const r = this.rpg;
      if (!r) return;
      r.clock = (r.clock || 7 * 60) + dt; // 1 秒 = 1 分钟
      this.syncDay(game);
    }
    // 区域行动、学习与休息会显式跳过一段时间。
    advance(minutes, game) {
      const r = this.rpg;
      if (!r || !Number.isFinite(minutes) || minutes <= 0) return;
      r.clock = (r.clock || 0) + minutes;
      this.syncDay(game);
    }
    syncDay(game) {
      const r = this.rpg;
      if (!r) return;
      const day = Math.floor(r.clock / 1440);
      if (day === r.calendarDay) return;
      r.calendarDay = day;
      this.onNewDay(game);
    }
    onNewDay(game) {
      const r = this.rpg;
      if (r) {
        r.zoneDone = {};
        if (!r.zoneVisited) r.zoneVisited = {};
      }
      if (r && r.classPollution) {
        for (const id of Object.keys(r.classPollution)) r.classPollution[id] = Math.max(0, r.classPollution[id] - 5);
        game.showToast('新的一天 · 各班级污染缓慢消退', '');
      }
      for (const it of game.interactables || []) if (it.kind === 'minigame') it.used = false;
      const iso = this.dateISO();
      const ev = (DATA.calendar || []).find(e => e.date === iso);
      if (!ev) return;
      game.showToast(`校园日历 · ${ev.name}`, 'gold');
      game.bark('校园广播', ev.desc || ev.name, null);
      if (/月考|期中|期末|模拟/.test(ev.name)) {
        const r = this.rpg;
        r.rank = clamp(Math.round(46 - r.level * 2 - Math.min(12, (r.kills || 0) / 6)), 1, 50);
        game.showToast(`年级排名公布 · 第 ${r.rank} 名`, 'gold');
        this.layer.factions.modify('study', r.rank <= 15 ? 2 : -1, game);
      }
      const effect = String(ev.effect || '');
      const re = /(disguise|san|hp|xp)([+-])(\d+)/g;
      let m;
      while ((m = re.exec(effect))) {
        const v = (m[2] === '-' ? -1 : 1) * Number(m[3]);
        if (m[1] === 'disguise') this.layer.disguise.modify(v, game, '日历事件');
        if (m[1] === 'san') this.layer.combat.healSan(v, game);
        if (m[1] === 'hp' && game.player) game.player.hp = clamp(game.player.hp + v, 1, game.player.maxHp);
        if (m[1] === 'xp') game.gainXp(v);
      }
    }
  }

  /* ================= 派系好感 ================= */
  class FactionRelation {
    constructor(layer) { this.layer = layer; }
    get rpg() { return this.layer.game.rpg; }
    get(id) { return (this.rpg && this.rpg.factions[id]) || 0; }
    modify(id, delta, game) {
      const r = this.rpg;
      if (!r) return;
      const before = r.factions[id] || 0;
      r.factions[id] = clamp((r.factions[id] || 0) + delta, -100, 100);
      if (game && delta) game.showToast(`派系好感 · ${this.label(id)} ${delta > 0 ? '+' : ''}${delta}`, delta > 0 ? 'gold' : 'red');
      if (game && game.applyGrowthStats && before < 10 && r.factions[id] >= 10) game.applyGrowthStats(true);
    }
    label(id) {
      const f = (DATA.factions || []).find(x => x.id === id);
      return f ? f.name : id;
    }
    bonus() {
      const r = this.rpg;
      const f = (r && r.factions) || {};
      return {
        damage: (f.deepsea || 0) >= 10 ? 1.05 : 1,
        maxHp: (f.sports || 0) >= 10 ? 10 : 0,
        sanRegen: (f.teaching || 0) >= 10 ? .3 : 0,
        xp: (f.study || 0) >= 10 ? 1.1 : 1,
        disguise: (f.teaching || 0) >= 10 ? .1 : 0,
        mentalResist: (f.chaos || 0) >= 10 ? .95 : 1,
        moveSpeed: (f.dream || 0) >= 10 ? 1.03 : 1,
        dashCd: (f.ghost || 0) >= 10 ? .95 : 1
      };
    }
  }

  /* ================= 道具 / 合成 ================= */
  class InventorySystem {
    constructor(layer) { this.layer = layer; }
    get rpg() { return this.layer.game.rpg; }
    count(id) { return (this.rpg && this.rpg.consumables[id]) || 0; }
    add(id, n) {
      const r = this.rpg;
      if (!r) return;
      r.consumables[id] = Math.max(0, (r.consumables[id] || 0) + (n || 1));
    }
    use(id, game) {
      const r = this.rpg;
      if (!r || !CONSUMABLES[id]) return false;
      if ((r.consumables[id] || 0) <= 0) { game.showToast(`没有${CONSUMABLES[id].name}`, 'red'); return false; }
      r.consumables[id]--;
      const combat = this.layer.combat;
      switch (id) {
        case 'rice':
          combat.healSan(30, game);
          combat.endHallucination(game, true);
          game.showToast('吃下白米饭，杂音退了一些。', 'gold');
          break;
        case 'chalk':
          combat.addCircle(game.player.x, game.time + 6);
          game.showToast('粉笔在地面画出一圈净化法阵。', 'gold');
          break;
        case 'radio':
          combat.radioUntil = game.time + 30;
          game.showToast('收音机沙沙作响 · 正在探测高侵蚀区（会吸引注意）', 'gold');
          this.layer.disguise.modify(-3, game, '开启收音机');
          for (const e of game.enemies || []) {
            if (e.dead || !e.corrupted) continue;
            if (Math.abs(e.x - game.player.x) < 700) { e.attackCd = 0; e.state = 'chase'; e.stateT = 0; }
          }
          break;
        case 'thermos':
          this.layer.combat.stunAround(game, 450, 3);
          game.showToast('保温杯碎裂 · 威严气场扩散', 'gold');
          break;
        case 'leftover':
          if (game.player) game.player.hp = Math.min(game.player.maxHp, game.player.hp + 50);
          r.sanMax = Math.max(30, r.sanMax - 10);
          r.san = Math.min(r.san, r.sanMax);
          game.showToast('剩菜下肚 · HP +50，理智上限 -10', 'red');
          break;
        case 'sedative':
          combat.sedativeUntil = game.time + 20;
          game.showToast('精神镇静剂 · 20 秒内免疫精神攻击', 'gold');
          break;
        case 'sanPack':
          combat.healSan(45, game);
          game.showToast('净化饭团 · 理智 +45', 'gold');
          break;
        case 'evidence':
          game.showToast('证据要带到广播站或谣言节点使用。', '');
          r.consumables[id]++;
          return false;
      }
      game.audio.sfx('life');
      game.saveGame(false);
      this.layer.renderInventoryIfOpen();
      return true;
    }
    // 合成材料既可能来自消耗品，也可能来自已穿戴/行囊中的特殊装备。
    owned(id, rpg) {
      const r = rpg || this.rpg;
      if (!r) return 0;
      let n = (r.consumables && r.consumables[id]) || 0;
      const eq = r.equipped || {};
      const bag = r.bag || [];
      if (id === 'spoon') n += (eq.weapon && eq.weapon.special === 'spoon' ? 1 : 0) + bag.filter(it => it.special === 'spoon').length;
      if (id === 'headphones') n += (eq.head && eq.head.special === 'headphones' ? 1 : 0) + bag.filter(it => it.special === 'headphones').length;
      if (id === 'exam') n += (eq.charm && eq.charm.base === 'exam' ? 1 : 0) + bag.filter(it => it.base === 'exam').length;
      return n;
    }
    consume(id, n, game) {
      const r = this.rpg;
      if (!r) return;
      let left = n || 1;
      const take = Math.min(left, r.consumables[id] || 0);
      if (take > 0) { r.consumables[id] -= take; left -= take; }
      if (left <= 0) return;
      const slots = ['weapon', 'head', 'armor', 'charm'];
      for (const slot of slots) {
        const it = r.equipped[slot];
        if (!it) continue;
        const match = id === 'spoon' ? it.special === 'spoon' : id === 'headphones' ? it.special === 'headphones' : id === 'exam' ? it.base === 'exam' : false;
        if (match) { r.equipped[slot] = null; left--; if (left <= 0) break; }
      }
      if (left > 0) {
        for (let i = r.bag.length - 1; i >= 0 && left > 0; i--) {
          const it = r.bag[i];
          const match = id === 'spoon' ? it.special === 'spoon' : id === 'headphones' ? it.special === 'headphones' : id === 'exam' ? it.base === 'exam' : false;
          if (match) { r.bag.splice(i, 1); left--; }
        }
      }
      if (game && game.applyGrowthStats) game.applyGrowthStats(true);
    }
    canCraft(recipe) {
      const r = this.rpg;
      if (!r || !recipe || !recipe.inputs) return false;
      return Object.keys(recipe.inputs).every(k => this.owned(k) >= recipe.inputs[k]);
    }
    craft(id, game) {
      const recipe = (DATA.recipes || []).find(x => x.id === id);
      if (!recipe) return false;
      if (!this.canCraft(recipe)) { game.audio.sfx('warn'); game.showToast('材料不足。', 'red'); return false; }
      for (const k of Object.keys(recipe.inputs)) this.consume(k, recipe.inputs[k], game);
      const out = RECIPE_OUT[recipe.id];
      if (out && out.type === 'equip') {
        const item = this.layer.makeSpecial(out.id);
        this.layer.game.addEquipment(item);
        // 若该槽位为空，合成后直接穿戴，避免刚合成完手里没武器。
        const r = this.rpg;
        if (r && item.slot && !r.equipped[item.slot]) {
          const idx = r.bag.findIndex(it => it.uid === item.uid);
          if (idx >= 0) { r.bag.splice(idx, 1); r.equipped[item.slot] = item; if (game.applyGrowthStats) game.applyGrowthStats(true); }
        }
        game.showToast(`合成成功 · ${item.name}${r && r.equipped[item.slot] === item ? '（已穿戴）' : '（B 穿戴）'}`, 'gold');
      } else if (out && out.type === 'consumable') {
        this.add(out.id, out.amount || 1);
        game.showToast(`合成成功 · ${CONSUMABLES[out.id].name} ×${out.amount || 1}`, 'gold');
      }
      game.audio.sfx('checkpoint');
      game.saveGame(false);
      this.layer.renderInventoryIfOpen();
      return true;
    }
    renderItems(container, game) {
      if (!container) return;
      const r = this.rpg;
      if (!r) return;
      const cards = Object.keys(CONSUMABLES).filter(id => id !== 'evidence').map(id => {
        const n = r.consumables[id] || 0;
        return `<div class="consumable ${n ? '' : 'empty'}">
          <div class="consumable-icon">${CONSUMABLES[id].icon}</div>
          <div class="consumable-body"><b>${CONSUMABLES[id].name}<em>×${n}</em></b><p>${CONSUMABLES[id].desc}</p></div>
          <button data-action="useItem" data-item="${id}" ${n ? '' : 'disabled'}>使用</button>
        </div>`;
      }).join('');
      const ev = `<div class="consumable evidence"><div class="consumable-icon">证</div><div class="consumable-body"><b>证据<em>×${r.consumables.evidence || 0}</em></b><p>在谣言节点或广播站消耗，用于公开辟谣。</p></div></div>`;
      container.innerHTML = cards + ev;
    }
    renderRecipes(container, game) {
      if (!container) return;
      container.innerHTML = (DATA.recipes || []).map(rec => {
        const inputs = Object.keys(rec.inputs || {}).map(k => {
          const need = rec.inputs[k];
          const have = this.owned(k);
          return `<span class="${have >= need ? 'ok' : 'lack'}">${CONSUMABLES[k] ? CONSUMABLES[k].name : (INPUT_LABELS[k] || k)} ${have}/${need}</span>`;
        }).join(' · ');
        const out = RECIPE_OUT[rec.id];
        const outName = out && out.type === 'equip' && SPECIAL_ITEMS[out.id] ? SPECIAL_ITEMS[out.id].name : (out && CONSUMABLES[out.id] ? CONSUMABLES[out.id].name : rec.name);
        return `<div class="recipe ${this.canCraft(rec) ? 'ready' : ''}">
          <div><b>${rec.name}</b><p>${rec.desc}</p><small>${inputs}</small></div>
          <button data-action="craftItem" data-recipe="${rec.id}" ${this.canCraft(rec) ? '' : 'disabled'}>合成 ${outName}</button>
        </div>`;
      }).join('');
    }
  }

  /* ================= 战斗：侵蚀 / 净化 / 理智 ================= */
  class CombatSystem {
    constructor(layer) {
      this.layer = layer;
      this.mentalTimer = 6;
      this.hiddenTimer = 14;
      this.fx = { noise: 0, aberration: 0, whisper: 0, physical: 0 };
      this.circles = [];
      this.radioUntil = 0;
      this.sedativeUntil = 0;
      this.hallucination = null;
      this.lastMentalAt = 0;
      this.lastInfectCheck = 0;
    }
    rpg() { return this.layer.game.rpg; }
    ensureEnemy(e) {
      if (!e || e.corruption !== undefined) return;
      const g = this.layer.game;
      const isBoss = e === g.boss;
      const base = isBoss ? 680 : e.isElite ? 360 : (e.type === 'athlete' || e.type === 'scholar' ? 240 : 115);
      e.maxCorruption = Math.round(base * (1 + g.chapter * .22));
      e.corruption = e.maxCorruption;
      e.corrupted = true;
      e.purifiedUntil = 0;
      e.purifyCount = 0;
    }
    ensureAll(game) {
      for (const e of game.enemies || []) this.ensureEnemy(e);
      if (game.boss) this.ensureEnemy(game.boss);
    }
    corruptionMultiplier() {
      let m = 1 + this.layer.companions.mods().corruption;
      const weapon = this.rpg() && this.rpg().equipped.weapon;
      if (weapon && weapon.special === 'purifySpoon') m += .25;
      return m;
    }
    handleEnemyDamage(enemy, dmg, source, game, blocked) {
      if (!enemy || enemy.dead) return false;
      this.ensureEnemy(enemy);
      if (!enemy.corrupted) {
        if (game.time - (enemy._purifiedHintAt || 0) > 2.5) {
          enemy._purifiedHintAt = game.time;
          game.addText(enemy.x, enemy.y - 180, '已净化 · 暂时无害', '#a8ffd9', 16, { life: .8 });
        }
        return true;
      }
      const amount = Math.max(1, dmg) * this.corruptionMultiplier() * (blocked ? .45 : 1) * (enemy.defenseBreakUntil > game.time ? 1.5 : 1);
      enemy.corruption = Math.max(0, enemy.corruption - amount);
      enemy.hurtFlash = .16;
      if (!enemy.isElite && enemy.type !== 'shield') enemy.hitstun = .16;
      enemy.vx = Math.sign(enemy.x - source.x) * (enemy.isElite ? 15 : 140);
      enemy.vz = Math.sign((enemy.z || 0) - (source.z || 0)) * (enemy.isElite ? 8 : 60);
      enemy.posture = Math.max(0, (enemy.posture || 0) - 6);
      if (enemy.posture <= 0 && !enemy.staggered) {
        enemy.staggered = 1.8; enemy.executable = true; enemy.state = 'stagger';
        game.addText(enemy.x, enemy.y - 190, '气竭 · F 净化', '#ffd47e', 22, { bold: true });
        game.audio.sfx('gong');
      }
      game.spawnBurst(enemy.x, enemy.y - (enemy.isElite ? 160 : 80), '#c86bff', 7, 160, { size: 2.4, life: .4, gravity: 120, additive: true });
      game.addText(enemy.x, enemy.y - 200, `-${Math.round(amount)} 侵蚀`, '#e0a6ff', 18, { life: .8 });
      const cmods = this.layer.companions.mods();
      if (cmods.stunChance > 0 && Math.random() < cmods.stunChance && !enemy.isElite) {
        enemy.hitstun = Math.max(enemy.hitstun || 0, 1.2);
        game.addText(enemy.x, enemy.y - 220, '符咒封印', '#f2c66d', 20, { bold: true, life: 1 });
      }
      this.fx.aberration = Math.max(this.fx.aberration, .18);
      if (this.rpg() && this.rpg().equipped.weapon && this.rpg().equipped.weapon.special === 'purifySpoon') this.healSan(2, game, true);
      if (enemy.corruption <= 0) this.purify(enemy, game);
      return true;
    }
    handleBossDamage(boss, dmg, source, game) {
      if (!boss || boss.dead) return false;
      this.ensureEnemy(boss);
      if (!boss.corrupted) return true;
      const amount = Math.max(1, dmg) * this.corruptionMultiplier();
      boss.corruption = Math.max(0, boss.corruption - amount);
      boss.hurtFlash = .14;
      boss.poise = (boss.poise || 0) + dmg;
      const ratio = boss.corruption / (boss.maxCorruption || 1);
      const nextPhase = ratio > .66 ? 1 : ratio > .33 ? 2 : 3;
      if (nextPhase > (boss.phase || 1)) {
        boss.phase = nextPhase;
        game.addText(boss.x, boss.y - 380, nextPhase === 2 ? '二阶段 · 焚心' : '三阶段 · 归心', '#ffd47e', 28, { bold: true, life: 1.4 });
        game.flashScreen(nextPhase === 2 ? '#ffb27d' : '#bffaff', .3);
        game.addShake(14);
        game.audio.sfx('gong');
      }
      game.spawnBurst(boss.x + (Math.random() - .5) * 80, boss.y - 120 - Math.random() * 180, '#c86bff', 8, 180, { size: 2.6, life: .4, gravity: 120, additive: true });
      game.addText(boss.x, boss.y - 330, `-${Math.round(amount)} 侵蚀`, '#e0a6ff', 22, { bold: true, life: .9 });
      if (boss.corruption <= 0) {
        game.addText(boss.x, boss.y - 360, '心障消解', '#bffaff', 42, { bold: true, life: 1.6 });
        game.flashScreen('#d9fbff', .5);
        boss.die(game);
      }
      return true;
    }
    purify(enemy, game) {
      if (!enemy) return;
      enemy.corruption = 0;
      enemy.corrupted = false;
      enemy.purifiedUntil = game.time + 10;
      enemy.purifyCount = (enemy.purifyCount || 0) + 1;
      enemy.encounterCleared = true;
      enemy.state = 'idle';
      enemy.stateT = 0;
      enemy.staggered = 0;
      enemy.executable = false;
      enemy.hp = enemy.maxHp;
      game.addText(enemy.x, enemy.y - 230, '净化', '#a8ffd9', 34, { bold: true, life: 1.4 });
      game.spawnBurst(enemy.x, enemy.y - 120, '#d7ffef', 40, 320, { size: 3, life: 1, gravity: 30, additive: true });
      game.flashScreen('#e8fff6', .18);
      game.audio.sfx('checkpoint');
      game.audio.speak('谢谢你……快跑，它们又要来了。', 'narrator');
      game.showToast('已净化 · 10 秒清醒', 'gold');
      if (Math.random() < .7) this.layer.inventory.add('rice', 1);
      if (Math.random() < .35) this.layer.inventory.add('chalk', 1);
      if (enemy.classId && this.rpg() && this.rpg().classPollution) {
        const before = this.rpg().classPollution[enemy.classId] || 0;
        const after = Math.max(0, before - 35);
        this.rpg().classPollution[enemy.classId] = after;
        const cls = (DATA.classes || []).find(c => c.id === enemy.classId);
        if (cls) {
          game.showToast(`${cls.name} 的污染 -35（${before} → ${after}）`, 'gold');
          if (after === 0 && before > 0) game.addText(enemy.x, enemy.y - 280, `${cls.name} · 恢复清醒`, '#a8ffd9', 22, { bold: true, life: 1.4 });
          if (this.layer.classes) this.layer.classes.onPurified(enemy.classId, before, after, game);
        }
      }
      game.stats.enemies++;
      if (game.rpg) game.rpg.kills++;
      game.gainXp(enemy.isElite ? 45 : 18);
      if (game.maybeDropEquipment) game.maybeDropEquipment(enemy);
      this.layer.factions.modify('deepsea', 1, game);
      if (enemy.isElite && game.onEliteKilled) game.onEliteKilled(enemy);
    }
    reCorrupt(enemy, game) {
      enemy.corrupted = true;
      enemy.corruption = Math.round((enemy.maxCorruption || 60) * .7);
      enemy.purifiedUntil = 0;
      enemy.state = 'chase';
      enemy.stateT = 0;
      game.addText(enemy.x, enemy.y - 210, '再次异化', '#ff8fa0', 20, { bold: true, life: 1 });
      game.spawnBurst(enemy.x, enemy.y - 120, '#7b2340', 18, 220, { size: 3, life: .8, gravity: 60 });
    }
    execute(target, game) {
      if (!target || target.corruption === undefined) return false;
      this.ensureEnemy(target);
      if (!target.corrupted) {
        game.showToast('它已净化，不必再补一刀。', '');
        return true;
      }
      target.corruption = 0;
      this.purify(target, game);
      game.addText(target.x, target.y - 190, '处决 · 净化', '#ffe1a3', 30, { bold: true, life: 1.2 });
      game.addShake(12);
      game.hitstop = Math.max(game.hitstop || 0, .12);
      return true;
    }
    healSan(n, game, silent) {
      const r = this.rpg();
      if (!r || !n) return;
      const before = r.san;
      r.san = clamp(r.san + n, 0, r.sanMax);
      if (!silent && r.san !== before && game) game.addText(game.player.x, game.player.y - 240, `理智 +${Math.round(r.san - before)}`, '#9ff7d0', 18, { life: .8 });
    }
    drainSan(n, game) {
      const r = this.rpg();
      if (!r) return;
      r.san = clamp(r.san - n, 0, r.sanMax);
      if (r.san <= 0) this.startHallucination(game);
    }
    addCircle(x, until) { this.circles.push({ x, until }); }
    stunAround(game, radius, seconds) {
      for (const e of game.enemies || []) {
        if (e.dead || !e.corrupted) continue;
        if (Math.abs(e.x - game.player.x) <= radius) {
          e.hitstun = Math.max(e.hitstun || 0, seconds);
          e.state = 'hitstun';
          e.defenseBreakUntil = game.time + seconds;
          game.addText(e.x, e.y - 190, '罚站 · 防御 -50%', '#ffd47e', 26, { bold: true, life: 1 });
        }
      }
    }
    startHallucination(game) {
      const r = this.rpg();
      if (!r || this.hallucination) return;
      this.hallucination = { until: game.time + 5 };
      game.inputInvert = true;
      game.showToast('理智崩溃 · 幻觉 / 操作反向 5 秒', 'red');
      game.audio.sfx('warn');
      game.flashScreen('#4b0f1d', .4);
      game.addShake(12);
    }
    endHallucination(game, silent) {
      if (!this.hallucination) return;
      const r = this.rpg();
      this.hallucination = null;
      game.inputInvert = false;
      if (!silent && game.player && !game.player.dead) {
        const dmg = Math.round(game.player.maxHp * .2);
        game.player.hp = Math.max(1, game.player.hp - dmg);
        r.san = Math.min(r.sanMax, 30);
        game.showToast(`幻觉散去 · 反噬 ${dmg} 点生命`, 'red');
        game.addText(game.player.x, game.player.y - 240, `-${dmg}`, '#ff9086', 26);
      }
      if (silent) r.san = Math.max(r.san, 10);
    }
    playerMentalHit(amount, sourceName, game) {
      const r = this.rpg();
      if (!r) return;
      let mult = 1;
      const eq = r.equipped || {};
      if (eq.head && eq.head.special === 'headphones') mult *= .5;
      if (eq.head && eq.head.special === 'tacticalComm') mult *= .6;
      mult *= this.layer.companions.mods().mentalResist;
      mult *= this.layer.factions.bonus().mentalResist;
      if (eq.armor && eq.armor.special === 'paddedUniform') mult *= 1.05;
      if (game.time < this.sedativeUntil) mult = 0;
      const dmg = Math.max(0, Math.round(amount * mult));
      if (!dmg) { game.addText(game.player.x, game.player.y - 220, '精神屏障', '#bffaff', 18, { life: .7 }); return; }
      r.san = Math.max(0, r.san - dmg);
      this.fx.noise = Math.max(this.fx.noise, .55);
      this.fx.aberration = Math.max(this.fx.aberration, .5);
      game.addShake(4);
      game.addText(game.player.x, game.player.y - 245, `理智 -${dmg}`, '#ffb3c7', 20, { bold: true, life: .9 });
      if (r.san <= 0) this.startHallucination(game);
      this.layer.companions.rollInfection(game);
      this.lastMentalAt = game.time;
    }
    mitigatePhysical(damage, game, sourceX) {
      const r = this.rpg();
      if (!r) return damage;
      this.fx.physical = Math.max(this.fx.physical, .5);
      let dmg = damage;
      const eq = r.equipped || {};
      if (eq.armor && eq.armor.special === 'paddedUniform') dmg *= .8;
      // 课本盾只挡正面 90 度
      const p = game && game.player;
      const front = sourceX === undefined || !p || (sourceX - p.x) * p.facing > 0;
      if (front && eq.head && eq.head.special === 'bookShield' && (eq.head.durability || 0) > 0) {
        eq.head.durability--;
        dmg *= .45;
        if (eq.head.durability <= 0) {
          game.showToast('加厚课本盾碎了。', 'red');
          r.equipped.head = null;
          game.saveGame(false);
        } else game.showToast(`课本盾格挡 · 耐久 ${eq.head.durability}`, '');
      }
      return dmg;
    }
    update(dt, game) {
      this.ensureAll(game);
      const r = this.rpg();
      if (!r) return;
      // 净化后的清醒 / 再次异化
      for (const e of game.enemies || []) {
        if (e.dead || e.corruption === undefined) continue;
        if (!e.corrupted && game.time > (e.purifiedUntil || 0)) this.reCorrupt(e, game);
      }
      if (game.boss && !game.boss.dead && game.boss.corruption === undefined) this.ensureEnemy(game.boss);
      // 理智自然回复与派系被动
      if (game.player && !game.player.dead) {
        let regen = .35 + this.layer.companions.mods().sanRegen + this.layer.factions.bonus().sanRegen;
        this.healSan(regen * dt, game, true);
        for (const c of this.circles) {
          if (game.time < c.until && Math.abs(game.player.x - c.x) < 170) {
            this.healSan(5 * dt, game, true);
            this.fx.noise = Math.max(0, this.fx.noise - dt * 2);
            this.fx.aberration = Math.max(0, this.fx.aberration - dt * 2);
            if (Math.random() < dt * 6) game.spawnParticle(c.x + (Math.random() - .5) * 260, game.player.y - 20, (Math.random() - .5) * 30, -40, .5, 2, '#bfffe8', 0, true);
          }
        }
        this.circles = this.circles.filter(c => game.time < c.until);
      }
      // 精神攻击
      this.mentalTimer -= dt;
      if (this.mentalTimer <= 0 && game.player && !game.player.dead) {
        this.mentalTimer = 9 + Math.random() * 7;
        let target = null, best = 760;
        for (const e of game.enemies) {
          if (e.dead || !e.corrupted) continue;
          const d = Math.abs(e.x - game.player.x);
          if (d < best) { best = d; target = e; }
        }
        if (target) {
          const dmg = 6 + game.chapter * 2.5 + (target.isElite ? 5 : 0);
          game.addText(target.x, target.y - 230, '精神尖啸', '#ff9bd0', 22, { bold: true, life: 1 });
          game.spawnBurst(target.x, target.y - 150, '#c86bff', 18, 240, { size: 3, life: .6, gravity: 0, additive: true });
          game.audio.sfx('warn');
          this.playerMentalHit(dmg, target.name, game);
        }
      }
      // 高智商隐匿者：不开眼时，学霸用公式布局、体育生用“意外碰撞”下手
      this.hiddenTimer -= dt;
      if (this.hiddenTimer <= 0 && game.player && !game.player.dead && !this.layer.vision.active) {
        this.hiddenTimer = 16 + Math.random() * 12;
        let target = null, best = 560;
        for (const e of game.enemies) {
          if (e.dead || !e.corrupted || (e.type !== 'scholar' && e.type !== 'athlete')) continue;
          const d = Math.abs(e.x - game.player.x);
          if (d < best) { best = d; target = e; }
        }
        if (target) {
          if (target.type === 'scholar') {
            game.addText(target.x, target.y - 210, '推演公式', '#c9b6ff', 20, { bold: true, life: 1.1 });
            game.showToast('学霸的试卷上，公式正在扭曲成你看不懂的代码。', 'red');
            this.playerMentalHit(5 + game.chapter * 2, target.name, game);
          } else {
            game.addText(target.x, target.y - 190, '一次“意外”的碰撞', '#ffb08a', 18, { life: 1 });
            game.showToast('体育生擦肩而过，像一次被计算好的意外。', 'red');
            game.player.hitBy(8 + game.chapter * 3, target.x, game, target.name, target);
          }
        }
      }
      // 幻觉结束
      if (this.hallucination && game.time >= this.hallucination.until) this.endHallucination(game, false);
      // 收音机探测
      if (game.time < this.radioUntil && game.player) {
        let nearest = null, best = 1e9;
        for (const e of game.enemies) {
          if (e.dead || !e.corrupted) continue;
          const d = Math.abs(e.x - game.player.x);
          if (d < best) { best = d; nearest = e; }
        }
        if (nearest && Math.random() < dt * .8) {
          const dir = nearest.x > game.player.x ? '右前方' : '左前方';
          game.showToast(`收音机：${dir}约 ${Math.round(best / 100)} 米有高侵蚀反应`, 'gold');
        }
      }
      this.fx.noise = Math.max(0, this.fx.noise - dt * 1.4);
      this.fx.aberration = Math.max(0, this.fx.aberration - dt * 1.2);
      this.fx.physical = Math.max(0, this.fx.physical - dt * 1.6);
    }
    draw(ctx, game) {
      const project = (x, y) => this.layer.project(x, y);
      // 净化法阵
      for (const c of this.circles) {
        const p = project(c.x, game.player ? game.player.y : 850);
        if (!p.visible) continue;
        const a = clamp((c.until - game.time) / 6, 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(168,255,217,${.25 + a * .35})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, 95, 24, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(p.x, p.y, 70, 17, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      // 物理受击的红边
      if (this.fx.physical > .02) {
        ctx.save();
        const a = this.fx.physical;
        const g = ctx.createRadialGradient(960, 540, 330, 960, 540, 1100);
        g.addColorStop(0, 'rgba(150,20,24,0)');
        g.addColorStop(1, `rgba(150,20,24,${a * .55})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.restore();
      }
      // 精神污染噪点 / 色差
      const noise = this.fx.noise;
      if (noise > .02) {
        ctx.save();
        ctx.globalAlpha = noise * .5;
        for (let i = 0; i < 70; i++) {
          const x = Math.random() * 1920, y = Math.random() * 1080;
          ctx.fillStyle = Math.random() < .5 ? '#ff7fae' : '#9ff7ff';
          ctx.fillRect(x, y, Math.random() * 26 + 4, 2);
        }
        ctx.globalAlpha = noise * .18;
        ctx.fillStyle = '#ff4b93'; ctx.fillRect(-6, 0, 1920, 1080);
        ctx.fillStyle = '#4bfff0'; ctx.fillRect(6, 0, 1920, 1080);
        ctx.restore();
      }
      // 幻觉扭曲
      if (this.hallucination) {
        ctx.save();
        const t = game.time;
        for (let i = 0; i < 5; i++) {
          const y = (t * 120 + i * 230) % 1080;
          ctx.globalAlpha = .12;
          ctx.drawImage(game.canvas, 0, y, game.canvas.width, 30, 0, y - 8, 1920, 30);
        }
        ctx.globalAlpha = .22; ctx.fillStyle = '#1a0310'; ctx.fillRect(0, 0, 1920, 1080);
        // 不存在的敌人
        for (let i = 0; i < 3; i++) {
          const x = ((t * 60 + i * 610) % 1920);
          const y = 760 + Math.sin(t * 1.7 + i) * 16;
          ctx.globalAlpha = .28;
          ctx.fillStyle = '#050208';
          ctx.beginPath(); ctx.ellipse(x, y - 70, 26, 78, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(x, y - 150, 17, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = .8 + Math.sin(t * 9 + i) * .2;
          ctx.fillStyle = '#ff2b4e';
          ctx.beginPath(); ctx.arc(x - 6, y - 153, 2.2, 0, Math.PI * 2); ctx.arc(x + 6, y - 153, 2.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      // 敌我侵蚀光环
      for (const e of game.enemies || []) {
        if (e.dead || e.corruption === undefined) continue;
        const p = project(e.x, e.y - 4);
        if (!p.visible) continue;
        if (e.corrupted) {
          if (this.layer.vision.active) {
            const a = .12 + Math.sin(game.time * 3 + (e.seed || 0)) * .05;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const grad = ctx.createRadialGradient(p.x, p.y - 60, 5, p.x, p.y - 60, e.isElite ? 130 : 80);
            grad.addColorStop(0, `rgba(120,20,160,${a})`);
            grad.addColorStop(1, 'rgba(40,0,60,0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.ellipse(p.x, p.y - 60, e.isElite ? 140 : 90, e.isElite ? 170 : 110, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          } else {
            // 未开眼时只露出一点红眼的余光
            ctx.save();
            ctx.globalAlpha = .28 + Math.sin(game.time * 6 + (e.seed || 0)) * .12;
            ctx.fillStyle = '#ff3355';
            ctx.beginPath(); ctx.arc(p.x - 5, p.y - (e.size ? e.size * 1.2 : 110), 1.8, 0, Math.PI * 2); ctx.arc(p.x + 5, p.y - (e.size ? e.size * 1.2 : 110), 1.8, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
          }
        } else {
          ctx.save();
          ctx.globalAlpha = .25;
          ctx.strokeStyle = '#a8ffd9'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(p.x, p.y, 46, 12, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  /* ================= AI 娘伙伴 ================= */
  const COMPANION_STYLE = {
    deepseek: { hair: '#3f7bff', cloth: '#dff4ff', accent: '#8fe8ff', short: '深海' },
    qwen: { hair: '#2a1714', cloth: '#8f2a34', accent: '#f2c66d', short: '千问' },
    doubao: { hair: '#ff8fb1', cloth: '#ffe6c9', accent: '#ff9f5a', short: '豆包' },
    grok: { hair: '#2b2333', cloth: '#1b1622', accent: '#ff5fa2', short: '格罗克' },
    claude: { hair: '#c98b62', cloth: '#f4efe4', accent: '#e8c47a', short: '克劳德' },
    gemini: { hair: '#e8e8f2', cloth: '#cfcfe4', accent: '#b8a6ff', short: '双子' },
    midjourney: { hair: '#ff5f9e', cloth: '#2a1638', accent: '#6ff0ff', short: '梦境' },
    stablediffusion: { hair: '#6b4a3a', cloth: '#efe6d8', accent: '#ff9f6a', short: '绘世' },
    sora: { hair: '#2a2a2a', cloth: '#3a3a48', accent: '#ffd47e', short: '影织' },
    copilot: { hair: '#3a5a8a', cloth: '#2a3a4a', accent: '#7ac8ff', short: '副驾' },
    cursor: { hair: '#111118', cloth: '#1a1a22', accent: '#7cf0c0', short: '光标' },
    perplexity: { hair: '#6a5a4a', cloth: '#2a2a2a', accent: '#ff7fae', short: '迷踪' }
  };
  const COMPANION_ABILITY = {
    deepseek: '物理净化：侵蚀伤害 +20%',
    qwen: '符咒封印：命中 8% 概率罚站 1.2 秒',
    doubao: '算力豆包：每秒回复 1 点 SAN',
    grok: '精神防御：精神伤害 -30%',
    claude: '理智恢复：每秒 +2 SAN',
    gemini: '光暗交替：侵蚀伤害 +10%',
    midjourney: '环境改造：移动速度 +6%',
    stablediffusion: '诱饵幻影：闪身冷却 -10%',
    sora: '战局回放：子弹时间延长 0.3 秒',
    copilot: '轨迹预判：完美闪身窗口 +15%',
    cursor: '空间穿行：闪身距离 +12%',
    perplexity: '弱点标记：安全时伪装恢复 +0.25/s'
  };
  class CompanionSystem {
    constructor(layer) { this.layer = layer; }
    get rpg() { return this.layer.game.rpg; }
    entry(id) { return this.rpg && this.rpg.companions ? this.rpg.companions[id] : null; }
    isActive(id) { const c = this.entry(id); return !!(c && c.active && !c.infected && c.restUntil <= this.layer.game.time); }
    isInfected(id) { const c = this.entry(id); return !!(c && c.infected); }
    setActive(id, game) {
      const r = this.rpg;
      if (!r || !r.companions[id]) return;
      const c = r.companions[id];
      if (c.infected) { game.showToast('她正在被思维病毒感染，先净化。', 'red'); return; }
      if (c.restUntil > game.time) { game.showToast('她正在系统重启，暂时无法战斗。', 'red'); return; }
      const was = c.active;
      if (!was) {
        const activeCount = Object.keys(r.companions).filter(k => r.companions[k].active && !r.companions[k].infected).length;
        if (activeCount >= 3) { game.showToast('最多 3 位 AI 娘同行，先让一位休息。', 'red'); game.audio.sfx('warn'); return; }
      }
      c.active = !was;
      game.audio.sfx('ui');
      if (game.applyGrowthStats) game.applyGrowthStats(true);
      game.saveGame(false);
      this.layer.renderCompanions();
      game.showToast(c.active ? `${this.name(id)} 已同行` : `${this.name(id)} 已休息`, 'gold');
    }
    name(id) {
      const d = (DATA.aiGirls || []).find(x => x.id === id);
      return d ? d.name : id;
    }
    ability(id) { return COMPANION_ABILITY[id] || '未知能力'; }
    // 全队被动汇总，供战斗与属性计算读取。
    mods() {
      const m = {
        corruption: 0, mentalResist: 1, sanRegen: 0, moveSpeed: 1, dashCd: 1, dashDist: 1,
        perfectWindow: 1, slowPlus: 0, skillDamage: 1, skillCd: 1, ultDamage: 1,
        disguiseRegen: 0, stunChance: 0
      };
      const r = this.rpg;
      if (!r || !r.companions) return m;
      for (const id of Object.keys(r.companions)) {
        if (!this.isActive(id)) continue;
        switch (id) {
          case 'deepseek': m.corruption += .20; break;
          case 'qwen': m.corruption += .10; m.stunChance += .08; break;
          case 'doubao': m.sanRegen += 1; break;
          case 'grok': m.mentalResist *= .7; break;
          case 'claude': m.sanRegen += 2; break;
          case 'gemini': m.corruption += .10; break;
          case 'midjourney': m.moveSpeed *= 1.06; break;
          case 'stablediffusion': m.dashCd *= .9; break;
          case 'sora': m.slowPlus += .3; break;
          case 'copilot': m.perfectWindow *= 1.15; break;
          case 'cursor': m.dashDist *= 1.12; break;
          case 'perplexity': m.disguiseRegen += .25; break;
        }
      }
      return m;
    }
    infect(id, game) {
      const c = this.entry(id);
      if (!c || c.infected) return;
      c.infected = true;
      c.active = false;
      c.affinity = Math.max(0, c.affinity - 15);
      game.showToast(`${this.name(id)} 被思维病毒感染了！`, 'red');
      game.flashScreen('#7b1240', .35);
      game.addShake(8);
      game.audio.sfx('warn');
      game.audio.speak('加入我们……获得永生。', 'narrator');
      this.layer.factions.modify('chaos', 1, game);
      if (game.applyGrowthStats) game.applyGrowthStats(true);
      game.saveGame(false);
    }
    rollInfection(game) {
      const r = this.rpg;
      if (!r) return;
      if (game.time - (this._lastRoll || 0) < 12) return;
      this._lastRoll = game.time;
      for (const id of Object.keys(r.companions)) {
        const c = r.companions[id];
        if (!c.active || c.infected) continue;
        // Claude 的安全协议会降低感染概率
        const safe = this.isActive('claude') && !this.isInfected('claude');
        if (Math.random() < (safe ? .025 : .05)) this.infect(id, game);
      }
    }
    abandon(id, game) {
      const c = this.entry(id);
      const r = this.rpg;
      if (!c || !c.infected) return;
      c.infected = false;
      c.active = false;
      c.affinity = 0;
      if (r.abandonedAI && !r.abandonedAI.includes(id)) r.abandonedAI.push(id);
      game.showToast(`你放弃了 ${this.name(id)}。她会在后续关卡以「堕落AI」出现。`, 'red');
      game.audio.sfx('warn');
      this.layer.factions.modify('chaos', 3, game);
      if (game.spawnEnemy && game.player) {
        const e = game.spawnEnemy('elite', game.player.x + 420, { name: this.name(id) + '·堕落AI', hpScale: .7, dmgScale: .95 });
        if (e) { this.layer.combat.ensureEnemy(e); e.maxCorruption = Math.round((e.maxCorruption || 300) * 1.4); e.corruption = e.maxCorruption; }
      }
      if (game.applyGrowthStats) game.applyGrowthStats(true);
      game.saveGame(false);
      this.layer.renderCompanions();
    }
    purify(id, game) {
      const c = this.entry(id);
      if (!c || !c.infected) return;
      const r = this.rpg;
      let used = '';
      if ((r.consumables.rice || 0) > 0) { r.consumables.rice--; used = '白米饭'; }
      else if ((r.consumables.chalk || 0) > 0) { r.consumables.chalk--; used = '粉笔法阵'; }
      else { game.showToast('需要白米饭或粉笔才能净化。', 'red'); game.audio.sfx('warn'); return; }
      c.infected = false;
      c.restUntil = game.time + 300;
      c.affinity = Math.max(0, c.affinity - 10);
      game.showToast(`用${used}净化了 ${this.name(id)} · 系统重启 5 分钟`, 'gold');
      game.flashScreen('#dffcff', .2);
      this.layer.factions.modify('deepsea', 1, game);
      if (game.applyGrowthStats) game.applyGrowthStats(true);
      game.saveGame(false);
      this.layer.renderCompanions();
    }
    update(dt, game) {
      const r = this.rpg;
      if (!r) return;
      const infected = Object.keys(r.companions).filter(id => r.companions[id].infected);
      for (const id of infected) {
        const c = r.companions[id];
        if (game.player && !game.player.dead) {
          this.layer.combat.drainSan(.7 * dt, game);
          if (Math.random() < dt * .12) game.addText(game.player.x, game.player.y - 230, '加入我们……', '#ff7fae', 18, { life: 1 });
        }
      }
      // 系统重启结束
      let restChanged = false;
      for (const id of Object.keys(r.companions)) {
        const c = r.companions[id];
        if (c.restUntil > 0 && c.restUntil <= game.time) { c.restUntil = 0; restChanged = true; }
      }
      if (restChanged && game.applyGrowthStats) game.applyGrowthStats(true);
      // 感染者通过“数据交换”传播病毒
      if (infected.length && game.time - (this._lastSpread || 0) > 18) {
        this._lastSpread = game.time;
        const healthy = Object.keys(r.companions).filter(id => r.companions[id].active && !r.companions[id].infected);
        if (healthy.length && Math.random() < .25) {
          const victim = healthy[Math.floor(Math.random() * healthy.length)];
          game.addText(game.player.x, game.player.y - 250, '数据交换……', '#ff5f8a', 20, { life: 1.2 });
          this.infect(victim, game);
        }
      }
    }
    draw(ctx, game) {
      const r = this.rpg;
      if (!r || !game.player) return;
      const project = (x, y) => this.layer.project(x, y);
      const active = Object.keys(r.companions).filter(id => r.companions[id].active && !r.companions[id].infected && r.companions[id].restUntil <= game.time);
      const offsets = [-105, 105, -175];
      active.forEach((id, i) => {
        const style = COMPANION_STYLE[id] || COMPANION_STYLE.deepseek;
        const offset = offsets[i % offsets.length];
        const bob = Math.sin(game.time * 2.2 + i) * 3;
        const p = project(game.player.x + offset, game.player.y);
        if (!p.visible) return;
        const x = p.x, y = p.y + bob;
        ctx.save();
        // 脚下光圈
        ctx.strokeStyle = style.accent; ctx.globalAlpha = .35; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(x, y + 2, 26, 7, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
        // 简易 Q 版立绘
        ctx.fillStyle = style.cloth;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 13, y - 58, 26, 50, 8) : ctx.rect(x - 13, y - 58, 26, 50); ctx.fill();
        ctx.fillStyle = '#f3d6c3';
        ctx.beginPath(); ctx.arc(x, y - 72, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = style.hair;
        ctx.beginPath(); ctx.arc(x, y - 78, 16, Math.PI, Math.PI * 2); ctx.fill();
        ctx.fillRect(x - 16, y - 78, 6, 24);
        ctx.fillRect(x + 10, y - 78, 6, 24);
        ctx.fillStyle = '#2a2a33';
        ctx.beginPath(); ctx.arc(x - 5, y - 71, 1.8, 0, Math.PI * 2); ctx.arc(x + 5, y - 71, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = style.accent;
        ctx.font = '600 9px "STKaiti","KaiTi",serif';
        ctx.textAlign = 'center';
        ctx.fillText(style.short, x, y - 100);
        ctx.restore();
      });
      // 感染者
      let infectedIndex = 0;
      for (const id of Object.keys(r.companions)) {
        const c = r.companions[id];
        if (!c.infected) continue;
        const style = COMPANION_STYLE[id] || COMPANION_STYLE.deepseek;
        const p = project(game.player.x + (infectedIndex % 2 === 0 ? -130 : 130), game.player.y);
        infectedIndex++;
        if (!p.visible) continue;
        ctx.save();
        ctx.globalAlpha = .9;
        ctx.fillStyle = '#1a0710';
        ctx.beginPath(); ctx.arc(p.x, p.y - 72, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff2b5e';
        ctx.beginPath(); ctx.arc(p.x - 5, p.y - 74, 2.4, 0, Math.PI * 2); ctx.arc(p.x + 5, p.y - 74, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff7fae';
        ctx.font = '600 10px "STKaiti","KaiTi",serif'; ctx.textAlign = 'center';
        ctx.fillText('感染 · ' + style.short, p.x, p.y - 100);
        ctx.restore();
      }
    }
  }

  /* ================= 伪装度 ================= */
  class DisguiseSystem {
    constructor(layer) { this.layer = layer; this.lastPanic = -999; }
    get rpg() { return this.layer.game.rpg; }
    value() { return this.rpg ? this.rpg.disguise : 100; }
    modify(delta, game, reason) {
      const r = this.rpg;
      if (!r || !delta) return;
      const before = r.disguise;
      r.disguise = clamp(r.disguise + delta, 0, 100);
      if (game && ((before > 60 && r.disguise <= 60) || (before > 30 && r.disguise <= 30))) {
        game.showToast(`伪装度下降 · ${Math.round(r.disguise)}%${reason ? '（' + reason + '）' : ''}`, 'red');
      }
      if (r.disguise <= 0) this.panic(game);
    }
    panic(game) {
      const r = this.rpg;
      if (!r || !game || game.time - this.lastPanic < 20) return;
      this.lastPanic = game.time;
      r.disguise = 35;
      game.showToast('伪装败露 · 风纪委员正在围捕你！', 'red');
      game.flashScreen('#ff3040', .35);
      game.addShake(14);
      game.audio.sfx('warn');
      this.layer.factions.modify('teaching', -5, game);
      const has = (game.enemies || []).filter(e => !e.dead).length;
      if (has < 9 && game.spawnEnemy) {
        for (let i = 0; i < 3; i++) {
          const e = game.spawnEnemy('inkling', game.player.x + (i - 1) * 160, { name: '风纪委员', dmgScale: .85, hpScale: .8 });
          if (e) this.layer.combat.ensureEnemy(e);
        }
      }
      game.saveGame(false);
    }
    update(dt, game) {
      const r = this.rpg;
      if (!r || !game.player) return;
      if (this.layer.vision.active) this.modify(-1.2 * dt, game, '算力之眼');
      if (this.layer.combat.hallucination) this.modify(-1.6 * dt, game, '幻觉');
      let nearby = false;
      for (const e of game.enemies || []) if (!e.dead && Math.abs(e.x - game.player.x) < 620) { nearby = true; break; }
      const p = this.layer.calendar.period();
      const cm = this.layer.companions.mods();
      const classPeriod = p.id === 'morning' || p.id === 'class1' || p.id === 'class2' || p.id === 'night';
      if (!nearby && (classPeriod || p.id === 'noon')) {
        this.modify((.45 + cm.disguiseRegen + this.layer.factions.bonus().disguise) * dt, game, '正常作息');
      }
      if (nearby && classPeriod && !this.layer.vision.active) {
        this.modify(-.22 * dt, game, '上课时间动手');
      }
    }
  }

  /* ================= 算力之眼 ================= */
  class HiddenPollutionSystem {
    constructor(layer) { this.layer = layer; this.active = false; }
    toggle(game) {
      this.active = !this.active;
      game.audio.sfx(this.active ? 'ui' : 'uiBack');
      game.showToast(this.active ? '算力之眼 · 已开启（伪装度持续下降）' : '算力之眼 · 已关闭', this.active ? 'gold' : '');
      if (this.active) this.layer.disguise.modify(-5, game, '开眼');
    }
    update(dt, game) { /* 视觉层无额外逻辑 */ }
    draw(ctx, game) {
      if (!this.active) return;
      const project = (x, y) => this.layer.project(x, y);
      ctx.save();
      ctx.globalAlpha = .05;
      ctx.fillStyle = '#66f0ff'; ctx.fillRect(0, 0, 1920, 1080);
      ctx.globalAlpha = .10;
      ctx.strokeStyle = '#8ff7ff'; ctx.lineWidth = 1;
      for (let y = 0; y < 1080; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1920, y); ctx.stroke(); }
      ctx.globalAlpha = .22;
      ctx.font = '11px monospace'; ctx.fillStyle = '#9ff7ff'; ctx.textAlign = 'left';
      for (let i = 0; i < 22; i++) {
        const x = (i * 97 + game.time * 20) % 1920;
        const y = (i * 53 + Math.sin(game.time + i) * 20) % 1080;
        ctx.fillText((Math.random() < .5 ? '01' : '侵蚀') + (i % 7), x, y);
      }
      ctx.restore();
      // 高亮异化体
      for (const e of game.enemies || []) {
        if (e.dead) continue;
        const p = project(e.x, e.y);
        if (!p.visible) continue;
        const ratio = e.maxCorruption ? clamp(e.corruption / e.maxCorruption, 0, 1) : 1;
        ctx.save();
        ctx.strokeStyle = e.corrupted ? '#ff5f8a' : '#a8ffd9';
        ctx.lineWidth = 1.6;
        const w = e.isElite ? 110 : 58, h = e.isElite ? 200 : 120;
        ctx.strokeRect(p.x - w / 2, p.y - h, w, h);
        ctx.fillStyle = '#ff9fbd'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`侵蚀 ${Math.round(ratio * 100)}%`, p.x, p.y - h - 8);
        ctx.restore();
      }
      // 谣言节点
      for (const r of this.layer.narrative.rumors) {
        if (r.done) continue;
        const p = project(r.x, game.player ? game.player.y : 850);
        if (!p.visible) continue;
        ctx.save();
        ctx.strokeStyle = '#ffd47e'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(p.x, p.y - 4, 10 + Math.sin(game.time * 3) * 2, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffe6ad'; ctx.font = '10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('谣言', p.x, p.y - 20);
        ctx.restore();
      }
    }
  }

  /* ================= 谣言 / 动态叙事 ================= */
  class DynamicNarrativeSystem {
    constructor(layer) { this.layer = layer; this.rumors = []; this.whisperAt = 0; }
    get rpg() { return this.layer.game.rpg; }
    prepareChapter(game) {
      this.rumors = [];
      const list = DATA.rumors || [];
      if (!list.length) return;
      const start = (game.chapter * 2) % list.length;
      for (let i = 0; i < 2; i++) {
        const d = list[(start + i) % list.length];
        if (!d || (this.rpg && this.rpg.rumorsDone[d.id])) continue;
        this.rumors.push({
          id: d.id, text: d.text, node: d.node, san: d.san || -2, evidence: d.evidence || '',
          x: game.level.width * (i === 0 ? .28 : .68) + U.rand(-120, 120),
          done: false, data: d
        });
      }
    }
    update(dt, game) {
      if (!game.player) return;
      let near = null, best = 240;
      for (const r of this.rumors) {
        if (r.done) continue;
        const d = Math.abs(game.player.x - r.x);
        if (d < best) { best = d; near = r; }
      }
      if (near) {
        this.layer.combat.drainSan(1.2 * dt, game);
        if (game.time - this.whisperAt > 8) {
          this.whisperAt = game.time;
          game.showToast(`窃窃私语：${near.text}`, 'red');
          game.audio.sfx('warn');
        }
      }
    }
    resolve(rumor, game) {
      const r = this.rpg;
      if (!r || rumor.done) return;
      rumor.done = true;
      const hasProof = (r.consumables.evidence || 0) > 0;
      if (hasProof) {
        r.consumables.evidence--;
        r.rumorsDone[rumor.id] = true;
        this.layer.combat.healSan(20, game);
        this.layer.disguise.modify(3, game, '公开辟谣');
        this.layer.factions.modify('teaching', 2, game);
        game.showToast('证据确凿 · 谣言被澄清，理智 +20', 'gold');
        game.showDialogue([
          { who: 'narrator', name: '广播站', text: '经查证，相关传言不实。请同学们不传谣、不信谣。' },
          { who: 'narrator', name: '回响', text: '走廊里的窃窃私语，像退潮一样散去了。' }
        ]);
      } else {
        r.rumorsDone[rumor.id] = true;
        this.layer.combat.drainSan(10, game);
        game.showToast('没有证据 · 谣言反而传得更凶，理智 -10', 'red');
        game.showDialogue([
          { who: 'narrator', name: '窃窃私语', text: '「他连证据都拿不出来……」' },
          { who: 'narrator', name: '回响', text: '你决定不再解释。有些声音，只能靠时间盖过去。' }
        ]);
      }
      game.saveGame(false);
    }
  }

  /* ================= 校园生态 / 随机事件 ================= */
  class GlobalEcosystemManager {
    constructor(layer) { this.layer = layer; this.timer = 55; this.history = []; this.darkUntil = 0; }
    update(dt, game) {
      this.timer -= dt;
      if (this.timer > 0) return;
      this.timer = 75 + Math.random() * 55;
      const events = DATA.events || [];
      if (!events.length) return;
      const ev = events[Math.floor(Math.random() * events.length)];
      if (this.history.slice(-2).includes(ev.id)) return;
      this.history.push(ev.id);
      this.trigger(ev, game);
    }
    classIncident(game) {
      if (this.layer.classes) this.layer.classes.act(game);
    }
    trigger(ev, game) {
      const name = ev.name || '校园事件';
      game.bark('校园广播', `${name} · ${ev.desc || ''}`, null);
      const text = `${name} · ${ev.desc || ''}`;
      game.showToast(text.slice(0, 60), 'gold');
      if (/巡视|主任/.test(name)) {
        this.layer.disguise.modify(-12, game, '主任巡视');
      } else if (/停电|晚自习/.test(name)) {
        this.darkUntil = game.time + 5;
        this.layer.combat.drainSan(4, game);
        game.audio.sfx('warn');
      } else if (/冲突|食堂/.test(name)) {
        if ((game.enemies || []).filter(e => !e.dead).length < 8 && game.spawnEnemy && game.player) {
          const e = game.spawnEnemy('inkling', game.player.x + U.rand(-500, 500), { name: '异化同学' });
          if (e) this.layer.combat.ensureEnemy(e);
        }
      } else if (/广播|表扬/.test(name)) {
        this.layer.combat.healSan(8, game);
        this.layer.disguise.modify(2, game, '广播表扬');
      } else {
        this.layer.combat.drainSan(3, game);
      }
      game.saveGame(false);
    }
    draw(ctx, game) {
      if (game.time < this.darkUntil) {
        const flicker = Math.random() < .08 ? .4 : .78;
        ctx.save();
        ctx.fillStyle = `rgba(2,3,8,${flicker})`;
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.restore();
      }
    }
  }

  /* ================= 27 班行为树 ================= */
  // 逐班行为树：同一污染状态下，不同班风会做出不同的事。
  const CLASS_ACTS = {
    study: {
      calm: ['早读', '刷题', '错题本', '排名表'],
      rumor: ['分数线传闻', '补习班风声', '走廊对答案'],
      unrest: ['熬夜刷题', '排名争执', '押题卷失踪'],
      critical: ['班主任暴走', '全班加练', '分数异化']
    },
    sports: {
      calm: ['晨跑', '半场', '接力训练', '看台闲聊'],
      rumor: ['比赛名单', '主力受伤传闻', '裁判旧账'],
      unrest: ['球场推搡', '加练到熄灯', '班级对抗'],
      critical: ['全员异化', '哨声失控', '看台暴动']
    },
    art: {
      calm: ['练声', '素描', '排练', '抄谱'],
      rumor: ['匿名情诗', '画里多出的人', '排练室怪声'],
      unrest: ['情绪回声', '集体失眠', '画布渗色'],
      critical: ['色彩失真', '合唱失控', '画中人走出']
    },
    social: {
      calm: ['八卦角', '应援口号', '拼桌聊天', '传纸条'],
      rumor: ['匿名表白墙', '走廊热搜', '站姐跟拍'],
      unrest: ['群体起哄', '谣言扩散', '围堵当事人'],
      critical: ['语言过载', '全班复读', '广播异化']
    },
    quiet: {
      calm: ['看书', '写纸条', '做题', '看窗外'],
      rumor: ['低语走廊', '校史缺页', '水房梦话'],
      unrest: ['集体沉默', '纸条失控', '影子错位'],
      critical: ['低语具象化', '沉默结界', '声音被夺走']
    },
    idle: {
      calm: ['趴桌', '看云', '慢半拍', '传零食'],
      rumor: ['躺平宣言', '作业失踪', '时间变慢'],
      unrest: ['集体迟到', '课堂停摆', '钟表倒退'],
      critical: ['时间停滞', '全班入梦', '走廊循环']
    },
    ordinary: {
      calm: ['早读', '值日', '打球', '聊天'],
      rumor: ['窃窃私语', '匿名墙', '小道消息'],
      unrest: ['走廊冲突', '集体起哄', '课堂失控'],
      critical: ['班主任暴走', '群体异化', '秩序崩解']
    }
  };

  class ClassEcosystem {
    constructor(layer) { this.layer = layer; this.timer = 48; this.lastId = null; }
    get rpg() { return this.layer.game.rpg; }
    stateOf(poll) {
      if (poll >= 75) return 'critical';
      if (poll >= 45) return 'unrest';
      if (poll >= 20) return 'rumor';
      return 'calm';
    }
    treeFor(poll, cls) {
      const state = this.stateOf(poll);
      const labels = { calm: '平静', rumor: '流言', unrest: '躁动', critical: '临界' };
      return { state, label: labels[state], acts: cls ? this.actsFor(cls, state) : CLASS_ACTS.ordinary[state] };
    }
    actsFor(cls, state) {
      const v = `${cls.type || ''} ${cls.vibe || ''} ${cls.pollution || ''}`;
      let key = 'ordinary';
      if (/体育|球场|热血|运动|接力|体能/.test(v)) key = 'sports';
      else if (/艺术|文艺|汉服|国风|音乐|绘画|古典|浪漫|色彩/.test(v)) key = 'art';
      else if (/实验|清北|内卷|竞争|高压|焦虑|失眠|竞赛|留学|英语/.test(v)) key = 'study';
      else if (/追星|潮流|饭圈|社交|话痨|八卦|消息|团结|互助|温暖|热闹/.test(v)) key = 'social';
      else if (/沉默|内向|理性|疏离|技术|编程|冷静|神秘|玄学|塔罗/.test(v)) key = 'quiet';
      else if (/懒散|摸鱼|躺平|低欲望|幽默/.test(v)) key = 'idle';
      const acts = CLASS_ACTS[key] || CLASS_ACTS.ordinary;
      return acts[state] || acts.calm;
    }
    templateFor(cls, state) {
      const vibe = String((cls.vibe || '') + (cls.pollution || ''));
      if (state === 'critical') return Math.random() < .7 ? CLASS_EVENT_TEMPLATES.teacher : CLASS_EVENT_TEMPLATES.blackout;
      if (state === 'unrest') {
        if (/体育|篮球|运动/.test(vibe)) return CLASS_EVENT_TEMPLATES.sports;
        return Math.random() < .5 ? CLASS_EVENT_TEMPLATES.blackout : CLASS_EVENT_TEMPLATES.sports;
      }
      if (state === 'rumor') {
        if (/八卦|社交|传闻/.test(vibe)) return CLASS_EVENT_TEMPLATES.gossip;
        return Math.random() < .65 ? CLASS_EVENT_TEMPLATES.gossip : CLASS_EVENT_TEMPLATES.exam;
      }
      if (/艺术|文艺|汉服|音乐/.test(vibe)) return CLASS_EVENT_TEMPLATES.art;
      if (/体育|篮球|运动/.test(vibe)) return Math.random() < .5 ? CLASS_EVENT_TEMPLATES.art : CLASS_EVENT_TEMPLATES.sports;
      return Math.random() < .55 ? CLASS_EVENT_TEMPLATES.art : CLASS_EVENT_TEMPLATES.exam;
    }
    update(dt, game) {
      this.timer -= dt;
      if (this.timer > 0) return;
      this.timer = 48 + Math.random() * 32;
      this.act(game);
    }
    act(game) {
      const r = this.rpg;
      const all = DATA.classes || [];
      if (!r || !all.length || !game.player) return;
      if (game.arenaLock || (game.boss && !game.boss.dead)) return;
      // 已完成任务链的班级回到日常，不再随机触发异化事件。
      const stable = all.filter(c => !(r.classQuests && r.classQuests[c.id] && r.classQuests[c.id].done));
      const list = stable.length ? stable : all;
      let cls = list[Math.floor(Math.random() * list.length)];
      if (list.length > 1) {
        let guard = 0;
        while (cls.id === this.lastId && guard++ < 4) cls = list[Math.floor(Math.random() * list.length)];
      }
      this.lastId = cls.id;
      const before = r.classPollution[cls.id] || 0;
      const tree = this.treeFor(before, cls);
      // 七成概率触发本班专属事件，其余使用通用班风模板。
      const sig = CLASS_SIGNATURE_EVENTS[cls.id];
      const useSig = !!(sig && Math.random() < .7);
      const tpl = useSig ? sig : this.templateFor(cls, tree.state);
      const after = clamp(before + tpl.pollution, 0, 100);
      r.classPollution[cls.id] = after;
      this.log(cls.id, `${tpl.title} · 污染 ${before} → ${after}`, tree.state, game);
      if (before < 45 && after >= 45 && !r.classHintShown) {
        r.classHintShown = true;
        game.showToast('班级进入躁动 · 按 Q 打开班级介入', 'gold');
      }
      if (tpl.san > 0) this.layer.combat.healSan(tpl.san, game, true);
      else if (tpl.san < 0) this.layer.combat.drainSan(-tpl.san, game);
      this.layer.disguise.modify(tpl.disguise || 0, game, cls.name + ' · ' + tpl.title);
      if (tpl.faction) this.layer.factions.modify(tpl.faction, tpl.san > 0 ? 1 : 0, game);
      game.bark('年级动态', `${cls.name} · ${tpl.title}`, null);
      game.showToast(`${cls.name} · ${tpl.title}（污染 ${before} → ${after}）`, tpl.pollution > 0 ? 'red' : 'gold');
      if (tpl.spawn && game.spawnEnemy && (!useSig || after >= 45) && (game.enemies || []).filter(e => !e.dead).length < 10) {
        const type = tpl.spawn;
        const opts = { name: cls.name + '·' + (type === 'elite' ? '班主任' : '异化同学') };
        if (type === 'elite') { opts.hpScale = .62; opts.dmgScale = .9; }
        const e = game.spawnEnemy(type, game.player.x + (Math.random() < .5 ? -1 : 1) * (380 + Math.random() * 260), opts);
        if (e) { e.classId = cls.id; this.layer.combat.ensureEnemy(e); }
      }
      game.saveGame(false);
    }
    log(classId, text, state, game) {
      const r = this.rpg;
      if (!r) return;
      if (!r.classLog) r.classLog = {};
      const prev = r.classLog[classId] && Array.isArray(r.classLog[classId].history) ? r.classLog[classId].history : [];
      r.classLog[classId] = { text, state, at: game ? game.time : 0, history: prev.concat(text).slice(-5) };
    }
    onPurified(classId, before, after, game) {
      const cls = (DATA.classes || []).find(c => c.id === classId);
      if (!cls) return;
      const state = this.stateOf(after);
      this.log(classId, `异化同学被净化 · 污染 ${before} → ${after}`, state, game);
      if (after === 0 && before > 0) {
        game.showToast(`${cls.name} 恢复清醒 · 全班污染清零`, 'gold');
        if (game.gainXp) game.gainXp(40);
        this.layer.factions.modify('deepsea', 2, game);
      } else if (before >= 75 && after < 75) {
        game.showToast(`${cls.name} 从临界状态回落`, 'gold');
      }
    }
  }

  /* ================= 随堂测验 / 查寝问答 ================= */
  class QuizSystem {
    constructor(layer) { this.layer = layer; this.questions = []; this.index = 0; this.score = 0; this.onDone = null; this.kind = 'class'; }
    start(kind, game, onDone) {
      this.kind = kind;
      this.onDone = onDone;
      this.score = 0;
      this.index = 0;
      const bank = kind === 'dorm' ? DORM_QUIZ : CLASS_QUIZ;
      this.questions = U.shuffle(bank).slice(0, 3).map(q => ({
        q: q.q,
        options: U.shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer })))
      }));
      this.ask(game);
    }
    speaker() { return this.kind === 'dorm' ? '宿管阿姨 · 查寝问答' : '随堂测验 · 高三课堂'; }
    ask(game) {
      if (this.index >= this.questions.length) { this.finish(game); return; }
      const q = this.questions[this.index];
      game.showChoice(this.speaker(), `第 ${this.index + 1} / ${this.questions.length} 题 · ${q.q}`,
        q.options.map(o => ({ text: o.text, value: o.correct ? 'correct' : 'wrong' })),
        value => {
          const ok = value === 'correct';
          if (ok) this.score++;
          game.showToast(ok ? U.choice(['答对了。', '这题稳稳的。', '老师点了点头。']) : U.choice(['答错了。', '再想想。', '粉笔头飞过来了。']), ok ? 'gold' : 'red');
          this.index++;
          if (this.index >= this.questions.length) this.finish(game);
          else this.ask(game);
        });
    }
    finish(game) {
      const score = this.score;
      const lines = score >= 3
        ? [{ who: 'narrator', name: this.speaker(), text: '全对。这一小段校园秩序，暂时站到了你这边。' }]
        : score === 2
          ? [{ who: 'narrator', name: this.speaker(), text: '答对两题，勉强过关。下次别在走廊上分心。' }]
          : [{ who: 'narrator', name: this.speaker(), text: '错得有点多。粉笔灰落下来的时候，没人替你挡。' }];
      game.showDialogue(lines, () => {
        const cb = this.onDone;
        this.onDone = null;
        if (cb) cb(score);
      });
    }
  }

  class MinigameSystem {
    constructor(layer) { this.layer = layer; }
    start(it, game) {
      const kind = it.minigame;
      const period = this.layer.calendar.period();
      const r = this.layer.rpg;
      const date = this.layer.calendar.dateISO();
      const key = `${it.id}:${date}`;
      if (kind === 'class' && !['morning', 'class1', 'class2', 'night'].includes(period.id)) {
        game.showDialogue([{ who: 'narrator', name: '教室', text: `现在是${period.name}，教室里没有人。等上课时间再来。` }]);
        return;
      }
      if (kind === 'dorm' && ['class1', 'class2'].includes(period.id)) {
        game.showDialogue([{ who: 'narrator', name: '宿舍楼', text: `现在是${period.name}，宿管阿姨正在教学区查岗。午休或放学后再来。` }]);
        return;
      }
      if (r.miniDone && r.miniDone[key]) {
        it.used = true;
        game.showDialogue([{ who: 'narrator', name: kind === 'dorm' ? '宿管阿姨' : '老师', text: '今天已经考过一次了。明天再来。' }]);
        return;
      }
      it.used = true;
      game.audio.sfx('ui');
      this.layer.quiz.start(kind, game, score => this.reward(kind, score, key, game));
    }
    reward(kind, score, key, game) {
      const r = this.layer.rpg;
      if (r.miniDone) r.miniDone[key] = true;
      const combat = this.layer.combat, disguise = this.layer.disguise;
      if (kind === 'dorm') {
        if (score >= 2) {
          game.player.hp = game.player.maxHp;
          game.player.flasks = game.player.maxFlasks;
          combat.healSan(score >= 3 ? 15 : 8, game);
          disguise.modify(8, game, '查寝通过 · 安全屋');
          this.layer.factions.modify('teaching', 2, game);
          game.showToast(score >= 3 ? '查寝全对 · 安全屋休息，状态回满' : '查寝通过 · 状态回满', 'gold');
        } else {
          combat.drainSan(5, game);
          disguise.modify(-3, game, '查寝没过');
          this.layer.factions.modify('teaching', -1, game);
          game.showToast('查寝没过 · 阿姨让你回去重背校规', 'red');
        }
      } else {
        if (score >= 3) {
          game.gainXp(60);
          combat.healSan(10, game);
          disguise.modify(5, game, '随堂测验满分');
          this.layer.factions.modify('study', 3, game);
          game.showToast('随堂测验满分 · 经验 +60，理智 +10，伪装 +5', 'gold');
        } else if (score === 2) {
          game.gainXp(30);
          disguise.modify(2, game, '随堂测验过关');
          this.layer.factions.modify('study', 1, game);
          game.showToast('随堂测验过关 · 经验 +30，伪装 +2', '');
        } else {
          combat.drainSan(5, game);
          disguise.modify(-4, game, '随堂测验失利');
          this.layer.factions.modify('study', -1, game);
          game.showToast('随堂测验失利 · 理智 -5，伪装 -4', 'red');
        }
      }
      game.saveGame(false);
    }
  }

  /* ================= 可进入的校园区域 ================= */
  const CAMPUS_ZONES = [
    {
      id: 'teaching', name: '教学区 · 逸夫楼', short: '教学区', glyph: '楼',
      accent: '#6fd6ff', survivorZone: '教学区', match: null,
      desc: '走廊很长，白灯一盏接一盏。每个班的后门都开着一道缝，缝里漏出粉笔灰和压低的声音。',
      actions: [
        { id: 'attend', name: '认真听课', hint: '上午 / 下午 / 晚自习 · 40 分钟', minutes: 40, periods: ['morning', 'class1', 'class2', 'night'], effect: { xp: 25, san: -2, disguise: 4, faction: ['teaching', 1], pollution: 1 }, text: '你把黑板上的公式抄进错题本，粉笔灰落在袖口，像一层薄雪。' },
        { id: 'nap', name: '趴桌补觉', hint: '午休 / 晚自习 / 熄灯 · 30 分钟', minutes: 30, periods: ['noon', 'night', 'lightsout'], effect: { san: 18, hpPct: .12, disguise: -1 }, text: '胳膊垫在卷子上，铃声和电流声一起退远。醒来时，桌角多了一行不是你的字。' },
        { id: 'patrol', name: '走廊巡视', hint: '任意时段 · 15 分钟', minutes: 15, periods: null, effect: { san: -3, disguise: -1, faction: ['ghost', 1] }, outcomes: [
          { chance: .4, title: '走廊巡视 · 捡到证物', text: '你在消防栓后面摸到一只旧手机，里面存着一段走廊监控。', effect: { evidence: 1, san: -2, disguise: -1, faction: ['ghost', 1] } },
          { chance: .35, title: '走廊巡视 · 无人的教室', text: '某间教室的灯还亮着，黑板上写着明天的日期。你关掉灯，什么也没带走。', effect: { san: -3, disguise: 1 } },
          { chance: .25, title: '走廊巡视 · 风纪委员', text: '袖标在拐角一闪。你低头混进人流，校牌被冷汗浸透。', effect: { san: -4, disguise: -4, faction: ['teaching', 1] } }
        ] },
        { id: 'leave', name: '递交请假条', hint: '课外活动 / 晚自习 · 每天一次', minutes: 20, periods: ['dusk', 'night'], once: true, effect: { disguise: 6, san: -2, faction: ['teaching', 2] }, text: '班主任看了很久，才在假条上签字。“天亮前把班里的人带回来。”' }
      ]
    },
    {
      id: 'dorm', name: '生活区 · 学生公寓', short: '宿舍区', glyph: '寝',
      accent: '#ffb27d', survivorZone: '生活区 · 宿舍', match: /懒散|摸鱼|内向|文艺|追星|沉默/,
      desc: '铁架床、晾衣绳和永远关不严的窗。熄灯后，整栋楼都在替别人做梦。',
      actions: [
        { id: 'rest', name: '躺下睡一会儿', hint: '午休 / 熄灯 · 45 分钟', minutes: 45, periods: ['noon', 'lightsout', 'night'], effect: { san: 24, hpPct: .15, disguise: 1 }, text: '被子有洗衣粉和旧木头的味道。你睡得很沉，没有梦见黑板上多出来的那一行字。' },
        { id: 'roommate', name: '室友夜谈', hint: '晚自习 / 熄灯 · 30 分钟', minutes: 30, periods: ['night', 'lightsout'], effect: { san: 10, faction: ['ghost', 1], bond: 2, pollution: 1 }, text: '上铺翻了个身，小声说：“你最近晚上别一个人去水房。”你们都没再说话。' },
        { id: 'laundry', name: '洗校服', hint: '任意时段 · 20 分钟', minutes: 20, periods: null, effect: { disguise: 3, san: 2 }, text: '蓝白校服泡在盆里，水慢慢变浑。晾衣绳上，另一件同款外套在无风里轻轻摆。' },
        { id: 'dormQuiz', name: '应对查寝', hint: '宿管阿姨的问答 · 免费', minutes: 10, periods: ['noon', 'dusk', 'night', 'lightsout'], quiz: 'dorm', text: '宿管阿姨把手电筒往门框上一磕：“校牌、床位、今晚去了哪，答。”' }
      ]
    },
    {
      id: 'canteen', name: '生活区 · 食堂', short: '食堂', glyph: '食',
      accent: '#f2c66d', survivorZone: '生活区 · 食堂', match: /幽默|追星|热血|懒散|球场/,
      desc: '蒸汽从窗口涌出来，勺子敲着不锈钢盆。排队的队伍比走廊更像一条完整的神经。',
      actions: [
        { id: 'queue', name: '排队打饭', hint: '午休 / 课外活动 · 25 分钟', minutes: 25, periods: ['noon', 'dusk'], effect: { rice: 1, hp: 25, san: 4 }, text: '轮到你时，食堂大叔多扣了半勺：“高三的，别光吃米，吃点绿的。”' },
        { id: 'kitchen', name: '进后厨帮工', hint: '午休 / 课外活动 · 每天一次', minutes: 35, periods: ['noon', 'dusk'], once: true, effect: { faction: ['sports', 2], rice: 1, disguise: 2, pollution: 1 }, text: '你搬了三筐土豆，围裙上全是水。大叔塞给你一盒饭：“手稳的人，心也稳。”' },
        { id: 'table', name: '和高一拼桌', hint: '午休 · 20 分钟', minutes: 20, periods: ['noon'], effect: { san: 8, faction: ['dream', 1], bond: 1 }, text: '几个高一学生把卷子摊在餐桌上，问你导数怎么求。你讲着讲着，自己也松了一点。' },
        { id: 'leftovers', name: '收走剩菜', hint: '晚自习后 / 熄灯 · 15 分钟', minutes: 15, periods: ['night', 'lightsout'], effect: { leftover: 1, san: -6, disguise: -2 }, text: '你从收餐车最底层摸出还温着的饭盒。走廊尽头有人看着你，但你没回头。' }
      ]
    },
    {
      id: 'playground', name: '运动区 · 400 米操场', short: '操场', glyph: '跑',
      accent: '#8fd8a8', survivorZone: '运动区', match: /体育|球场|热血|运动|接力/,
      desc: '红色跑道围着草地，旗杆的影子每天挪一格。风把远处的口号吹得断断续续。',
      actions: [
        { id: 'run', name: '绕跑道跑圈', hint: '早自习 / 课外活动 · 30 分钟', minutes: 30, periods: ['morning', 'dusk'], effect: { xp: 15, hpPct: .1, faction: ['sports', 2], pollution: 2 }, text: '跑到第四圈，呼吸盖过了脑子里的杂音。跑道边有人在数你的步频。' },
        { id: 'ball', name: '打半场篮球', hint: '课外活动 · 40 分钟', minutes: 40, periods: ['dusk'], outcomes: [
          { chance: .55, title: '半场 · 赢了', text: '最后一球擦板入网。队友拍你的肩，操场上的低语被欢呼压了下去。', effect: { xp: 45, san: 6, faction: ['sports', 3], pollution: 2 } },
          { chance: .45, title: '半场 · 输了', text: '你在篮下被撞倒，膝盖蹭破一层皮。有人伸手拉你，也有人已经走开。', effect: { san: -6, hp: -18, faction: ['sports', 1] } }
        ] },
        { id: 'grandstand', name: '看台发呆', hint: '任意时段 · 20 分钟', minutes: 20, periods: null, effect: { san: 12, disguise: 2 }, text: '你坐在看台最高一排，看旗绳一下一下敲着铁杆。什么也没想，这很难得。' },
        { id: 'training', name: '体育节训练', hint: '课外活动 · 每天一次', minutes: 40, periods: ['dusk'], once: true, effect: { xp: 35, faction: ['sports', 3], pollution: 3, san: -3 }, text: '接力棒在手里换了几次。教练吹哨时，跑道尽头那团黑影也跟着往后退了一步。' }
      ]
    },
    {
      id: 'library', name: '南门 · 特立图书馆', short: '图书馆', glyph: '书',
      accent: '#c7a6ff', survivorZone: '图书馆', match: /实验班|书卷|内向|沉默|内卷|清北/,
      desc: '红门楼里没有风。书页翻动的声音很轻，闭架书库的门牌却积着一层新灰。',
      actions: [
        { id: 'study', name: '在自习室刷题', hint: '任意上课时段 · 45 分钟', minutes: 45, periods: ['morning', 'class1', 'noon', 'class2', 'dusk', 'night'], effect: { xp: 30, disguise: 3, faction: ['study', 2], san: 2, pollution: 2 }, text: '你借了一本很旧的真题集。做到第三页，发现上一任借阅者和你错在同一道题上。' },
        { id: 'archive', name: '查旧校史', hint: '任意时段 · 每天一次', minutes: 30, periods: null, once: true, outcomes: [
          { chance: .7, title: '旧校史 · 夹页', text: '校史里夹着一张折叠的走廊平面图，红笔圈出的位置今晚刚好没人。', effect: { evidence: 1, san: -3, faction: ['study', 1] } },
          { chance: .3, title: '旧校史 · 空白页', text: '你想查的那一页被整齐地撕掉了，剩下的纸边很新。', effect: { san: -3 } }
        ] },
        { id: 'closed', name: '进入闭架书库', hint: '课外活动 / 晚自习 · 30 分钟', minutes: 30, periods: ['dusk', 'night'], effect: { evidence: 2, san: -10, disguise: -2, faction: ['ghost', 1] }, text: '书架之间没有灯。你摸到两盒录像带，标签上写着高2314班。身后有书页自己翻动。' },
        { id: 'notes', name: '整理错题本', hint: '上午 / 下午 / 晚自习 · 30 分钟', minutes: 30, periods: ['class1', 'class2', 'night'], effect: { xp: 20, faction: ['study', 1], san: -2 }, text: '你把做错的题抄成一页，字迹一笔一画。窗外的走廊终于安静了一会儿。' }
      ]
    },
    {
      id: 'gate', name: '南门 · 半月广场', short: '校门', glyph: '门',
      accent: '#ff9fbd', survivorZone: '校门', match: /实验班|内向|沉默/,
      desc: '半月广场的砖缝里长着草。旗杆、东西双塘和校门外的三中大道，把校园和外面隔开。',
      actions: [
        { id: 'mail', name: '去收发室取信', hint: '早自习 / 午休 / 课外活动 · 每天一次', minutes: 15, periods: ['morning', 'noon', 'dusk'], once: true, outcomes: [
          { chance: .5, title: '收发室 · 一封信', text: '没有寄件人。信封里只有半张信纸：“别为我做傻事。”字迹被水洇开过。', effect: { san: 5, evidence: 1 } },
          { chance: .5, title: '收发室 · 一叠通知', text: '教务处的新通知压在最上面，落款日期比今天晚一天。', effect: { san: 2 } }
        ] },
        { id: 'lookout', name: '在门口望风', hint: '任意时段 · 10 分钟', minutes: 10, periods: null, effect: { disguise: 5, san: -2 }, text: '你记住了保安换岗的时间，也记住了哪盏监控在整点时闪一下。' },
        { id: 'inspection', name: '迎主任巡视', hint: '任意时段 · 每天一次', minutes: 20, periods: null, once: true, outcomes: [
          { chance: .6, title: '主任巡视 · 通过', text: '教导主任盯着你的校牌看了三秒，最终只说了句：“高三了，别在门口晃。”', effect: { disguise: 6, faction: ['teaching', 1] } },
          { chance: .4, title: '主任巡视 · 被记住', text: '“你，几班的？”他掏出小本子。你报了班级，心跳声盖过广场的风。', effect: { disguise: -10, san: -4 } }
        ] },
        { id: 'stroll', name: '绕双塘散步', hint: '课外活动 / 晚自习 · 20 分钟', minutes: 20, periods: ['dusk', 'night'], effect: { san: 10, bond: 1 }, text: '塘面映着教学楼的白灯。你绕了两圈，把没说出口的话在心里又过了一遍。' }
      ]
    }
  ];

  const ZONE_EVENTS = {
    teaching: {
      title: '走廊尽头的粉笔字',
      text: '墙上多了一行字：“高2314班，别回头。”粉笔灰还是湿的，写字的班级里却没有灯。',
      options: [
        { text: '用袖子擦掉（伪装 +4）', effect: { disguise: 4 }, reply: '字被擦成一片白雾。你听见某个教室里，有人轻轻合上了门。' },
        { text: '抄进本子（证据 +1，理智 -4）', effect: { evidence: 1, san: -4, faction: ['ghost', 1] }, reply: '你抄下那行字。笔尖划过纸面时，走廊的灯同时暗了一格。' }
      ]
    },
    dorm: {
      title: '水房的梦话',
      text: '水房没开灯，最里面的隔间传来含混的梦话：“床底下……还有一个人。”',
      options: [
        { text: '敲门问一句（理智 -5，派系 +1）', effect: { san: -5, faction: ['ghost', 1] }, reply: '门后安静了很久，才有人说：“你也是高三的？几班的？”' },
        { text: '装作没听见离开（伪装 +3）', effect: { disguise: 3 }, reply: '你退出去，把水房的门轻轻带上。门内又响起翻身的声音。' }
      ]
    },
    canteen: {
      title: '插队的人',
      text: '窗口前有人插队，队伍里响起低声的抱怨。那个背影穿着和你同款的蓝白校服，脚却没有影子。',
      options: [
        { text: '上前制止（理智 -4，体育 +2）', effect: { san: -4, faction: ['sports', 2], disguise: 2 }, reply: '你拍了拍他的肩。他回头，脸是模糊的，队伍却重新排好了。' },
        { text: '把自己的位置让给低年级（理智 +5）', effect: { san: 5, faction: ['teaching', 1], disguise: 1 }, reply: '几个高一孩子连声道谢。你端着空餐盘站到最后，心里反而踏实。' }
      ]
    },
    playground: {
      title: '跑道上的影子',
      text: '一个穿校服的人在跑道内圈逆着方向跑，速度不快，却怎么也追不上。',
      options: [
        { text: '跟着跑一圈（理智 +4，经验 +10）', effect: { san: 4, xp: 10 }, reply: '你跑完一圈，影子不见了。风里有句很轻的“谢谢”。' },
        { text: '在看台上观察（证据 +1）', effect: { evidence: 1, san: -3 }, reply: '你记下他经过的每一处路灯。每次经过，灯都会短暂地暗下去。' }
      ]
    },
    library: {
      title: '还书箱里的校牌',
      text: '还书箱底躺着一张校牌，照片被刮花了，姓名栏却清晰地写着“刘奥”。',
      options: [
        { text: '交到失物招领（伪装 +4）', effect: { disguise: 4, faction: ['teaching', 1] }, reply: '值班老师登记时顿了一下：“这个学生……不是已经……”她没有说完。' },
        { text: '收进口袋（理智 -4，线索 +1）', effect: { san: -4, evidence: 1 }, reply: '校牌贴在胸前，像一块冰。你感觉有人从书架另一侧看着你。' }
      ]
    },
    gate: {
      title: '校门外的敲门声',
      text: '放学时间，校门外有人隔着铁栅栏敲了三下。保安室里没有人应声。',
      options: [
        { text: '过去看看（理智 -6，证据 +1）', effect: { san: -6, evidence: 1 }, reply: '栅栏外只有一个纸袋，里面是半块橡皮和一张写着“别找了”的纸条。' },
        { text: '退回广场（伪装 +3）', effect: { disguise: 3 }, reply: '你转身往回走。敲门声停了，像从来没发生过。' }
      ]
    }
  };

  class CampusZoneSystem {
    constructor(layer) {
      this.layer = layer;
      this.zone = 'teaching';
      this.pending = null;
      this.result = null;
      const saved = layer.game && layer.game.rpg && Array.isArray(layer.game.rpg.zoneLog) ? layer.game.rpg.zoneLog : [];
      this.recent = saved.slice(0, 6);
      this._lastEvent = -999;
    }
    get game() { return this.layer.game; }
    get rpg() { return this.layer.game.rpg; }
    def(id) { return CAMPUS_ZONES.find(z => z.id === id) || CAMPUS_ZONES[0]; }
    current() { return this.def(this.zone); }
    zoneClasses(zone) {
      const list = DATA.classes || [];
      if (!zone.match) return list;
      const hit = list.filter(c => zone.match.test(`${c.type || ''} ${c.vibe || ''} ${c.pollution || ''}`));
      return hit.length ? hit : list.slice(0, 8);
    }
    pollution(zone) {
      const r = this.rpg;
      const list = this.zoneClasses(zone);
      if (!r || !list.length) return 0;
      const sum = list.reduce((n, c) => n + ((r.classPollution && r.classPollution[c.id]) || 0), 0);
      return Math.round(sum / list.length);
    }
    survivorEntry(index) {
      const list = DATA.survivors || [];
      return list[index] || null;
    }
    presentSurvivors(zone) {
      const period = this.layer.calendar.period();
      return (DATA.survivors || []).map((s, i) => ({ s, i })).filter(({ s }) => String(s.zone || '').startsWith(zone.survivorZone)).map(({ s, i }) => {
        const schedId = SURVIVOR_PERIODS[i] || 'dusk';
        const sched = (DATA.periods || []).find(p => p.id === schedId);
        return { name: s.name, task: s.task, here: schedId === period.id, sched: sched ? sched.name : '不定' };
      });
    }
    activeCompanions() {
      const r = this.rpg;
      if (!r || !r.companions) return [];
      return Object.keys(r.companions).filter(id => this.layer.companions.isActive(id)).map(id => ({ id, name: this.layer.companions.name(id) }));
    }
    onceKey(zone, action) { return `${this.layer.calendar.dateISO()}|${zone.id}|${action.id}`; }
    blockedReason(action, zone) {
      const r = this.rpg;
      const period = this.layer.calendar.period();
      if (action.periods && !action.periods.includes(period.id)) return `现在是${period.name}`;
      if (action.quiz) {
        const key = `quiz:${action.quiz}:${this.layer.calendar.dateISO()}`;
        if (r.miniDone && r.miniDone[key]) return '今天已经答过';
      }
      if (action.once && r.zoneDone && r.zoneDone[this.onceKey(zone, action)]) return '今天已完成';
      return '';
    }
    select(id) {
      if (this.game.state !== 'zones') return;
      this.zone = this.def(id).id;
      this.pending = null;
      this.markVisited(this.zone);
      this.game.audio.sfx('ui');
      this.render();
    }
    markVisited(id) {
      const r = this.rpg;
      if (!r) return;
      r.zoneVisited = r.zoneVisited || {};
      r.zoneVisited[id] = (r.zoneVisited[id] || 0) + 1;
      const count = CAMPUS_ZONES.filter(z => r.zoneVisited[z.id]).length;
      if (count >= CAMPUS_ZONES.length && this.game.unlockAchievement) this.game.unlockAchievement('campus_walker');
    }
    act(actId) {
      const g = this.game, r = this.rpg;
      if (!g || g.state !== 'zones' || !r) return;
      if (this.pending) { g.showToast('先处理眼前这件事。', 'red'); return; }
      const zone = this.current();
      const action = (zone.actions || []).find(a => a.id === actId);
      if (!action) return;
      const blocked = this.blockedReason(action, zone);
      if (blocked) { g.showToast(blocked + '，现在做不了这件事。', 'red'); g.audio.sfx('warn'); return; }
      if (action.quiz) { this.startQuiz(action, zone); return; }
      const outcome = this.roll(action);
      const effect = outcome.effect || action.effect;
      const lines = this.applyEffect(effect, g);
      const team = this.activeCompanions();
      if (team.length && effect && effect.xp) {
        const bonus = Math.min(3, team.length) * 4;
        g.gainXp(bonus);
        lines.push(`同行加成 · 经验 +${bonus}`);
      }
      if (action.once) r.zoneDone[this.onceKey(zone, action)] = true;
      this.layer.calendar.advance(action.minutes || 0, g);
      this.result = { title: outcome.title || action.name, text: outcome.text || action.text || '', lines, time: this.layer.calendar.clockText() };
      this.pushLog(`${zone.short} · ${action.name}`);
      this.result.lines = this.result.lines.concat(this.ambientRisk(zone));
      this.maybeEvent(zone);
      g.audio.sfx('life');
      g.saveGame(false);
      this.render();
    }
    roll(action) {
      if (!action.outcomes || !action.outcomes.length) return { effect: action.effect, title: action.name, text: action.text };
      let rnd = Math.random(), acc = 0;
      for (const o of action.outcomes) {
        acc += typeof o.chance === 'number' ? o.chance : 1;
        if (rnd <= acc) return o;
      }
      return action.outcomes[action.outcomes.length - 1];
    }
    ambientRisk(zone) {
      const poll = this.pollution(zone);
      if (poll < 45 || Math.random() > .18) return [];
      this.layer.combat.drainSan(4, this.game);
      return [`区域污染 ${poll}% · 低语让理智 -4`];
    }
    applyEffect(effect, game) {
      const lines = [];
      const r = this.rpg;
      if (!effect || !r) return lines;
      if (effect.xp) { game.gainXp(Math.round(effect.xp)); lines.push(`经验 +${Math.round(effect.xp)}`); }
      if (effect.san > 0) { this.layer.combat.healSan(effect.san, game); lines.push(`理智 +${Math.round(effect.san)}`); }
      else if (effect.san < 0) { this.layer.combat.drainSan(-effect.san, game); lines.push(`理智 ${Math.round(effect.san)}`); }
      const p = game.player;
      if (p && effect.hp) { p.hp = clamp(p.hp + effect.hp, 1, p.maxHp); lines.push(`生命 ${effect.hp > 0 ? '+' : ''}${Math.round(effect.hp)}`); }
      if (p && effect.hpPct) { const v = Math.round(p.maxHp * effect.hpPct); p.hp = clamp(p.hp + v, 1, p.maxHp); lines.push(`生命 +${v}`); }
      if (effect.disguise) { this.layer.disguise.modify(effect.disguise, game, '校园区域'); lines.push(`伪装 ${effect.disguise > 0 ? '+' : ''}${effect.disguise}`); }
      for (const id of ['rice', 'chalk', 'evidence', 'leftover', 'radio', 'thermos', 'sedative']) {
        if (!effect[id]) continue;
        this.layer.inventory.add(id, effect[id]);
        const def = CONSUMABLES[id] || { name: id };
        lines.push(`获得 ${def.name} ×${effect[id]}`);
      }
      if (effect.faction) {
        this.layer.factions.modify(effect.faction[0], effect.faction[1], game);
        lines.push(`${this.layer.factions.label(effect.faction[0])} 好感 +${effect.faction[1]}`);
      }
      if (effect.pollution) {
        const text = this.cleanse(effect.pollution);
        if (text) lines.push(text);
      }
      if (effect.bond) {
        const name = this.bond(effect.bond);
        if (name) lines.push(`${name} 好感 +${effect.bond}`);
      }
      return lines;
    }
    cleanse(amount) {
      const r = this.rpg;
      const zone = this.current();
      const list = this.zoneClasses(zone)
        .slice()
        .sort((a, b) => ((r.classPollution[b.id] || 0) - (r.classPollution[a.id] || 0)))
        .slice(0, 3);
      let count = 0;
      for (const c of list) {
        const before = r.classPollution[c.id] || 0;
        if (before <= 0) continue;
        const after = Math.max(0, before - amount);
        r.classPollution[c.id] = after;
        this.layer.classes.log(c.id, `区域净化 · 污染 ${before} → ${after}`, this.layer.classes.stateOf(after), this.game);
        count++;
      }
      return count ? `区域净化 · ${count} 个班级污染 -${amount}` : '';
    }
    bond(amount) {
      const ids = this.activeCompanions();
      if (!ids.length || !this.rpg.companions) return '';
      const pick = ids[Math.floor(Math.random() * ids.length)];
      const entry = this.rpg.companions[pick.id];
      if (!entry) return '';
      entry.affinity = clamp((entry.affinity || 0) + amount, 0, 100);
      return pick.name;
    }
    startQuiz(action, zone) {
      const g = this.game;
      const key = `quiz:${action.quiz}:${this.layer.calendar.dateISO()}`;
      this.layer.closePanel('zones');
      this.layer.quiz.start(action.quiz, g, score => {
        this.layer.minigames.reward(action.quiz, score, key, g);
        this.layer.calendar.advance(action.minutes || 10, g);
        this.result = {
          title: action.name,
          text: action.quiz === 'dorm' ? '宿管阿姨把手电筒收回去，在登记本上打了个勾。' : '老师把卷子收走，顺手掸了掸讲台上的粉笔灰。',
          lines: [`答题得分 ${score} / 3`],
          time: this.layer.calendar.clockText()
        };
        this.pushLog(`${zone.short} · ${action.name}`);
        this.layer.openPanel('zones');
        if (g.state === 'zones') this.render();
      });
    }
    maybeEvent(zone) {
      const ev = ZONE_EVENTS[zone.id];
      if (!ev) return;
      if (this.game.time - this._lastEvent < 90) return;
      if (Math.random() > .24) return;
      this.pending = ev;
      this._lastEvent = this.game.time;
    }
    resolveEvent(value) {
      const g = this.game;
      if (!g || g.state !== 'zones' || !this.pending) return;
      const opt = this.pending.options[Number(value)];
      if (!opt) return;
      const title = this.pending.title;
      this.pending = null;
      const lines = this.applyEffect(opt.effect, g);
      this.result = { title, text: opt.reply || opt.text, lines, time: this.layer.calendar.clockText() };
      this.pushLog(`校园事件 · ${title}`);
      g.audio.sfx('ui');
      g.saveGame(false);
      this.render();
    }
    pushLog(text) {
      this.recent.unshift(`${this.layer.calendar.clockText()} · ${text}`);
      this.recent = this.recent.slice(0, 6);
      const r = this.rpg;
      if (r) r.zoneLog = this.recent.slice();
    }
    render() {
      const g = this.game, r = this.rpg;
      const el = g && g.el;
      if (!el || !el.zoneMap || !el.zoneDetail || !r) return;
      if (!this.recent.length && Array.isArray(r.zoneLog) && r.zoneLog.length) this.recent = r.zoneLog.slice(0, 6);
      const cal = this.layer.calendar;
      if (el.zoneClock) el.zoneClock.textContent = `${cal.clockText()} · ${cal.period().name}`;
      if (el.zoneSan) el.zoneSan.textContent = `理智 ${Math.round(r.san)} / ${r.sanMax} · 伪装 ${Math.round(r.disguise)}%`;
      if (el.zoneExamDays) el.zoneExamDays.textContent = cal.examDays();
      if (el.zoneMap) {
        el.zoneMap.innerHTML = CAMPUS_ZONES.map(z => {
          const poll = this.pollution(z);
          const people = this.presentSurvivors(z).filter(p => p.here);
          return `<button class="zone-node ${z.id === this.zone ? 'active' : ''}" data-action="zoneSelect" data-zone="${z.id}" style="--zc:${z.accent}">
            <span class="zn-glyph">${z.glyph}</span>
            <b>${z.short}</b>
            <small>${z.name.split(' · ')[1] || z.name}</small>
            <span class="class-pollution"><span>污染 ${poll}%</span><span class="pollution-track"><i style="width:${poll}%"></i></span></span>
            ${people.length ? `<span class="zone-here">${people.length} 人在场</span>` : ''}
          </button>`;
        }).join('');
      }
      const zone = this.current();
      const poll = this.pollution(zone);
      const period = cal.period();
      const people = this.presentSurvivors(zone);
      const team = this.activeCompanions();
      const actions = (zone.actions || []).map(a => {
        const blocked = this.blockedReason(a, zone);
        return `<button class="zone-act" data-action="zoneAct" data-act="${a.id}" ${blocked ? 'disabled title="' + blocked + '"' : ''} style="--zc:${zone.accent}">
          <b>${a.name}</b><span>${a.hint}${blocked ? ' · ' + blocked : ''}</span>
        </button>`;
      }).join('');
      const peopleLine = people.length
        ? people.map(p => `<b>${p.name}</b>${p.here ? '（在场）' : `（${p.sched}）`}`).join(' · ')
        : '这里暂时没有认识的人。';
      const linked = this.zoneClasses(zone);
      const linkedLine = linked.length
        ? linked.slice(0, 4).map(c => c.name).join('、') + (linked.length > 4 ? ` 等 ${linked.length} 个班` : '')
        : '暂无关联班级';
      let panel = '';
      if (this.pending) {
        const ev = this.pending;
        panel = `<div class="zone-event"><h4>${ev.title}</h4><p>${ev.text}</p><div class="zone-event-options">
          ${ev.options.map((o, i) => `<button data-action="zoneEvent" data-value="${i}">${o.text}</button>`).join('')}
        </div></div>`;
      } else if (this.result) {
        const res = this.result;
        panel = `<div class="zone-result"><b>${res.title}</b><p>${res.text}</p>
          ${res.lines && res.lines.length ? `<div class="zone-deltas">${res.lines.map(l => `<span>${l}</span>`).join('')}</div>` : ''}
          <p class="zone-result-time">${res.time}</p></div>`;
      }
      if (el.zoneDetail) {
        el.zoneDetail.innerHTML = `<div class="zone-head" style="--zc:${zone.accent}">
            <span class="zg">${zone.glyph}</span>
            <div><b>${zone.name}</b><p>${zone.desc}</p></div>
          </div>
          <div class="zone-meta">
            <span>时段 <b>${period.name}</b></span>
            <span>区域污染 <b>${poll}%</b></span>
            <span>同行 <b>${team.length ? team.map(t => t.name).join('、') : '无'}</b></span>
          </div>
          <p class="zone-people">这里的人：${peopleLine}</p>
          <p class="zone-people zone-linked">关联班级：${linkedLine}</p>
          <div class="zone-actions">${actions}</div>
          ${panel}`;
      }
      if (el.zoneLog) {
        el.zoneLog.innerHTML = this.recent.length ? this.recent.map(t => `<span>${t}</span>`).join('') : '<span>还没有在这里留下足迹。</span>';
      }
    }
  }

  /* ================= 班级专属任务链 ================= */
  const CLASS_QUEST_PROFILES = {
    study: {
      label: '内卷',
      step1: (cls, core) => ({ title: '听见排名之外的话', text: `${core[1].name}把笔帽按得咔咔响：“${core[1].line}”你没有接话，只把窗户推开一条缝。`, effect: { san: -2, disguise: 2, faction: ['study', 1], pollution: 3 }, minutes: 15 }),
      step2: (cls, core) => ({ title: `让${core[0].name}松一口气`, text: `你把月考排名表翻过去，和${core[0].name}一起把讲台整理干净。“${core[0].line}”他说完，自己先笑了。`, effect: { san: 3, disguise: 2, faction: ['teaching', 2], pollution: 10, xp: 20 }, minutes: 25 }),
      step3: (cls) => ({ title: '把灯关小一格', text: `你在晚自习最后十分钟关掉前排的两盏灯，让全班抬头看了一眼窗外。${cls.name}的呼吸终于不再整齐得像答题卡。`, effect: { san: 8, xp: 55, faction: ['study', 2], pollution: 25 }, minutes: 20 })
    },
    sports: {
      label: '热血',
      step1: (cls, core) => ({ title: '球场边的第一句话', text: `${core[2].name}把球塞到你怀里：“${core[2].line}”你运了两下球，听见看台上有人起哄。`, effect: { san: 2, faction: ['sports', 1], pollution: 3 }, minutes: 20 }),
      step2: (cls, core) => ({ title: '把火气带回球场', text: `${core[0].name}正在训人。你把冲突双方拉到中圈，让他们用一场三对三把话说完。“${core[0].line}”`, effect: { san: -2, hpPct: .08, faction: ['sports', 2], pollution: 12, xp: 20 }, minutes: 30 }),
      step3: (cls, core) => ({ title: '让全班跑完这一圈', text: `你带着${cls.name}绕跑道跑完最后一圈，没有人掉队。${core[1].name}在看台上把校旗展开，风把旗面吹得笔直。`, effect: { san: 6, xp: 50, faction: ['sports', 3], pollution: 25 }, minutes: 25 })
    },
    art: {
      label: '敏感',
      step1: (cls, core) => ({ title: '听一首没写完的歌', text: `${core[2].name}把耳机分你一只：“${core[2].line}”旋律很轻，走廊尽头的杂音退远了一点。`, effect: { san: 6, faction: ['dream', 1], pollution: 3 }, minutes: 15 }),
      step2: (cls, core) => ({ title: '把回声画出来', text: `${core[0].name}递给你一盒旧颜料。你们把走廊里听到的句子画在废卷子背面，颜色盖住了字。`, effect: { san: 4, disguise: 2, faction: ['dream', 2], pollution: 10 }, minutes: 25 }),
      step3: (cls, core) => ({ title: '让全班唱完最后一句', text: `艺术节彩排结束，${cls.name}在兰蕙亭边把最后一句合唱补齐。${core[1].name}说，这次没有跑调。`, effect: { san: 10, xp: 45, faction: ['dream', 3], pollution: 25 }, minutes: 25 })
    },
    fan: {
      label: '狂热',
      step1: (cls, core) => ({ title: '关掉一块应援灯牌', text: `${core[2].name}正举着灯牌：“${core[2].line}”你帮她把灯牌收进柜子，教室暗下来，反而看清了彼此的脸。`, effect: { san: -2, disguise: 2, faction: ['ghost', 1], pollution: 4 }, minutes: 15 }),
      step2: (cls, core) => ({ title: '把口号换成点名', text: `${core[0].name}同意在晚自习前点一次名。${core[1].name}站在讲台上，把每个人的名字都念得很慢。`, effect: { san: 3, faction: ['teaching', 2], pollution: 10, disguise: 2 }, minutes: 20 }),
      step3: (cls) => ({ title: '把镜头转向全班', text: `你替${cls.name}拍了一张没有滤镜的合照。照片里有人闭眼，有人做鬼脸，但没有人的脸是模糊的。`, effect: { san: 8, xp: 45, faction: ['ghost', 3], pollution: 22 }, minutes: 20 })
    },
    quiet: {
      label: '低语',
      step1: (cls, core) => ({ title: '递一张纸条', text: `你在${core[1].name}桌上放了一张纸条。她写完推回来：“${core[1].line}”`, effect: { san: 4, faction: ['ghost', 1], pollution: 3 }, minutes: 15 }),
      step2: (cls, core) => ({ title: '把校史那一页补回去', text: `${core[2].name}找出被换掉的校史页。你和${core[0].name}一起把它重新夹回档案，纸页终于不再自己翻动。`, effect: { san: -3, evidence: 1, faction: ['study', 1], pollution: 10 }, minutes: 25 }),
      step3: (cls) => ({ title: '让教室重新有声音', text: `你在${cls.name}的早读上起了个头。声音先是稀稀拉拉，后来整间教室都跟上了。`, effect: { san: 9, xp: 45, faction: ['teaching', 2], pollution: 24 }, minutes: 20 })
    },
    idle: {
      label: '摸鱼',
      step1: (cls, core) => ({ title: '陪他们慢半拍', text: `${core[1].name}打了个哈欠：“${core[1].line}”你在他旁边坐下，两个人一起看了会儿窗外的云。`, effect: { san: 7, faction: ['dream', 1], pollution: 2 }, minutes: 20 }),
      step2: (cls, core) => ({ title: '把迟到的人叫回来', text: `${core[0].name}又迟到了。你没有告状，只把早读要背的篇目抄了一份放在他桌上。`, effect: { san: 3, disguise: 2, faction: ['teaching', 1], pollution: 8 }, minutes: 20 }),
      step3: (cls, core) => ({ title: '一起把作业交上去', text: `${cls.name}第一次全员交齐作业。${core[2].name}说这不算奇迹，只是大家今天都没睡着。`, effect: { san: 6, xp: 50, faction: ['study', 2], pollution: 20 }, minutes: 20 })
    },
    ordinary: {
      label: '日常',
      step1: (cls, core) => ({ title: '和班长聊两句', text: `你在走廊拦住${core[1].name}：“${core[1].line}”他愣了一下，还是把班里最近的事说了。`, effect: { san: 2, faction: ['teaching', 1], pollution: 3 }, minutes: 15 }),
      step2: (cls, core) => ({ title: '帮班主任分担一点', text: `${core[0].name}的办公桌上堆着卷子。你抱走一半，听见他在身后轻轻说了声谢谢。`, effect: { san: 2, disguise: 3, faction: ['teaching', 2], pollution: 9 }, minutes: 25 }),
      step3: (cls) => ({ title: '把班级带回日常', text: `${cls.name}的晚自习重新有了翻卷子和咳嗽的声音，普通得让人安心。`, effect: { san: 7, xp: 45, faction: ['teaching', 2], pollution: 22 }, minutes: 20 })
    }
  };

  class ClassQuestSystem {
    constructor(layer) { this.layer = layer; }
    get game() { return this.layer.game; }
    get rpg() { return this.layer.game.rpg; }
    entry(id) {
      const r = this.rpg;
      if (!r) return { step: 0, done: false, last: '' };
      if (!r.classQuests) r.classQuests = {};
      const q = r.classQuests[id] || {};
      r.classQuests[id] = { step: clamp(Math.floor(Number(q.step) || 0), 0, 3), done: !!q.done, last: String(q.last || '') };
      return r.classQuests[id];
    }
    profile(cls) {
      const vibe = `${cls.type || ''} ${cls.vibe || ''} ${cls.pollution || ''}`;
      if (/体育|球场|热血|运动|接力/.test(vibe)) return CLASS_QUEST_PROFILES.sports;
      if (/艺术|文艺|汉服|音乐|敏感|诗/.test(vibe)) return CLASS_QUEST_PROFILES.art;
      if (/实验|清北|内卷|竞争|高压/.test(vibe)) return CLASS_QUEST_PROFILES.study;
      if (/追星|潮流|饭圈|社交|八卦/.test(vibe)) return CLASS_QUEST_PROFILES.fan;
      if (/沉默|内向|低语|书卷/.test(vibe)) return CLASS_QUEST_PROFILES.quiet;
      if (/懒散|摸鱼|幽默/.test(vibe)) return CLASS_QUEST_PROFILES.idle;
      return CLASS_QUEST_PROFILES.ordinary;
    }
    stepDef(cls, step) {
      const core = cls.core || [];
      const safe = [0, 1, 2].map(i => core[i] || { name: '同学', line: '先别急，慢慢来。' });
      const p = this.profile(cls);
      const fn = step === 0 ? p.step1 : step === 1 ? p.step2 : p.step3;
      return fn(cls, safe, p);
    }
    status(cls) {
      const q = this.entry(cls.id);
      const poll = (this.rpg.classPollution && this.rpg.classPollution[cls.id]) || 0;
      if (q.done) return { done: true, disabled: true, label: '已平息', poll };
      if (q.step === 2 && poll > 45) return { done: false, disabled: true, label: '先净化异化同学', poll, step: q.step };
      const disabled = q.step === 0 && poll < 15;
      const label = disabled ? '班级尚平静' : q.step === 0 ? '介入 · 第 1 步' : q.step === 1 ? '介入 · 第 2 步' : '收束 · 第 3 步';
      return { done: false, disabled, label, poll, step: q.step };
    }
    run(id) {
      const g = this.game, r = this.rpg;
      if (!g || g.state !== 'journal' || !r) return;
      const cls = (DATA.classes || []).find(c => c.id === id);
      if (!cls) return;
      const q = this.entry(id);
      const poll = r.classPollution[id] || 0;
      if (q.done) { g.showToast(`${cls.name} 已经恢复日常。`, ''); return; }
      if (q.step === 0 && poll < 15) { g.showToast(`${cls.name} 还没有乱到需要介入。`, ''); return; }
      if (q.step === 2 && poll > 45) { g.showToast(`${cls.name} 的污染还太高，先净化这个班的异化同学。`, 'red'); g.audio.sfx('warn'); return; }
      const def = this.stepDef(cls, q.step);
      const lines = [];
      const e = def.effect || {};
      if (e.xp) { g.gainXp(e.xp); lines.push(`经验 +${e.xp}`); }
      if (e.san > 0) { this.layer.combat.healSan(e.san, g); lines.push(`理智 +${e.san}`); }
      else if (e.san < 0) { this.layer.combat.drainSan(-e.san, g); lines.push(`理智 ${e.san}`); }
      if (e.hpPct && g.player) { const v = Math.round(g.player.maxHp * e.hpPct); g.player.hp = clamp(g.player.hp + v, 1, g.player.maxHp); lines.push(`生命 +${v}`); }
      if (e.disguise) { this.layer.disguise.modify(e.disguise, g, cls.name + ' · 班级介入'); lines.push(`伪装 ${e.disguise > 0 ? '+' : ''}${e.disguise}`); }
      if (e.evidence) { this.layer.inventory.add('evidence', e.evidence); lines.push(`证据 +${e.evidence}`); }
      if (e.faction) { this.layer.factions.modify(e.faction[0], e.faction[1], g); lines.push(`${this.layer.factions.label(e.faction[0])} 好感 +${e.faction[1]}`); }
      const isFinal = q.step === 2;
      if (e.pollution) {
        let after = Math.max(0, poll - e.pollution);
        if (isFinal) after = Math.min(after, 8);
        r.classPollution[id] = after;
        lines.push(`班级污染 ${poll} → ${after}`);
      }
      q.step = Math.min(3, q.step + 1);
      q.last = def.title;
      if (q.step >= 3) {
        q.done = true;
        if (g.unlockAchievement) {
          g.unlockAchievement('class_peace');
          const all = (DATA.classes || []).every(c => r.classQuests[c.id] && r.classQuests[c.id].done);
          if (all) g.unlockAchievement('all_class_peace');
        }
      }
      this.layer.classes.log(id, `${def.title} · ${lines.join(' / ')}`, this.layer.classes.stateOf(r.classPollution[id] || 0), g);
      this.layer.calendar.advance(def.minutes || 20, g);
      g.showToast(`${cls.name} · ${def.title}${q.done ? ' · 已平息' : `（${q.step}/3）`}`, q.done ? 'gold' : '');
      g.audio.sfx(q.done ? 'checkpoint' : 'life');
      g.saveGame(false);
      this.layer.renderJournal();
    }
  }

  /* ================= 2.5D 照片角色 ================= */
  class PhotoToCharacter {
    constructor(options) {
      options = options || {};
      this.url = options.url || '';
      this.name = options.name || '照片角色';
      this.faction = options.faction || 'student';
      this.x = options.x || 0;
      this.z = options.z || 0;
      this.y = options.y == null ? 850 : options.y;
      this.scale = options.scale || 1;
      this.tolerance = options.tolerance == null ? 46 : options.tolerance;
      this.canvas = null;
      this.texture = null;
      this.mesh = null;
      this.shadow = null;
      this.breath = Math.random() * 6;
      this.sway = 0;
      this.flash = 0;
      this.dissolve = 0;
      this.dead = false;
      this.ai = options.ai !== undefined ? !!options.ai : null;
      this.lastHit = 0;
      this.wander = Math.random() * 10;
    }
    static loadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('图片加载失败（可能是跨域限制）: ' + url));
        img.src = url;
      });
    }
    static fromFile(file, options) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }).then(img => PhotoToCharacter.fromImage(img, options));
    }
    static async fromURL(url, options) {
      const img = await PhotoToCharacter.loadImage(url);
      return PhotoToCharacter.fromImage(img, options);
    }
    static fromImage(img, options) {
      options = Object.assign({}, options || {});
      const c = document.createElement('canvas');
      const maxW = 420;
      const scale = Math.min(1, maxW / img.width);
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      let data;
      try { data = ctx.getImageData(0, 0, c.width, c.height); }
      catch (e) { throw new Error('图片跨域，无法读取像素。请使用同源图片或本地文件'); }
      PhotoToCharacter.removeBackground(data, c.width, c.height, options.tolerance == null ? 46 : options.tolerance);
      ctx.putImageData(data, 0, 0);
      const ch = new PhotoToCharacter(options);
      ch.canvas = c;
      if (!options.faction) ch.faction = PhotoToCharacter.detectFaction(data, c.width, c.height);
      if (ch.ai === null) ch.ai = ch.faction !== 'student';
      return ch;
    }
    // 角落取样 + 色度键去背景，并用 Sobel 边缘保护主体轮廓。
    static removeBackground(imageData, w, h, tolerance) {
      const d = imageData.data;
      const corners = [0, (w - 1) * 4, (w * (h - 1)) * 4, (w * h - 1) * 4];
      let br = 0, bg = 0, bb = 0;
      for (const i of corners) { br += d[i]; bg += d[i + 1]; bb += d[i + 2]; }
      br /= 4; bg /= 4; bb /= 4;
      const gray = new Float32Array(w * h);
      for (let i = 0, p = 0; i < d.length; i += 4, p++) gray[p] = d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114;
      const edge = new Uint8Array(w * h);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          const gx = -gray[i - w - 1] - 2 * gray[i - 1] - gray[i + w - 1] + gray[i - w + 1] + 2 * gray[i + 1] + gray[i + w + 1];
          const gy = -gray[i - w - 1] - 2 * gray[i - w] - gray[i - w + 1] + gray[i + w - 1] + 2 * gray[i + w] + gray[i + w + 1];
          edge[i] = Math.min(255, Math.hypot(gx, gy) / 4);
        }
      }
      const t2 = tolerance * tolerance * 3;
      for (let p = 0, i = 0; p < w * h; p++, i += 4) {
        const dr = d[i] - br, dg = d[i + 1] - bg, db = d[i + 2] - bb;
        const dist = dr * dr + dg * dg + db * db;
        const keepEdge = edge[p] > 34;
        if (dist < t2 && !keepEdge) d[i + 3] = 0;
        else if (dist < t2 * 1.6 && !keepEdge) d[i + 3] = Math.round(255 * (dist - t2) / (t2 * .6));
      }
    }
    static detectFaction(imageData, w, h) {
      const d = imageData.data;
      let red = 0, blue = 0, white = 0, total = 0;
      for (let p = 0, i = 0; p < w * h; p += 9, i += 36) {
        if (d[i + 3] < 40) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        total++;
        if (r > 150 && r > g * 1.45 && r > b * 1.35) red++;
        if (b > 130 && b > r * 1.15) blue++;
        if (r > 205 && g > 205 && b > 205) white++;
      }
      if (!total) return 'student';
      if (red / total > .18) return 'athlete';
      if (blue / total > .22) return 'student';
      if (white / total > .3) return 'scholar';
      return 'student';
    }
    attach(THREE, scene, camera) {
      this.THREE = THREE;
      const tex = new THREE.CanvasTexture(this.canvas);
      tex.needsUpdate = true;
      this.texture = tex;
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: tex },
          uFlash: { value: 0 },
          uDissolve: { value: 0 },
          uTime: { value: 0 }
        },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `uniform sampler2D map; uniform float uFlash; uniform float uDissolve; uniform float uTime; varying vec2 vUv;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
          void main(){
            vec4 tex = texture2D(map, vUv);
            if (tex.a < 0.03) discard;
            float n = hash(floor(vUv * vec2(90.0, 90.0)));
            if (n < uDissolve) discard;
            vec3 col = tex.rgb;
            float breathe = 0.97 + 0.03 * sin(uTime * 2.0 + vUv.y * 3.0);
            col = mix(col, vec3(1.0), uFlash);
            gl_FragColor = vec4(col, tex.a);
          }`,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      // 人物高度 2.4 个 Three 单位（约 240 像素），与现有角色比例一致。
      const h = 2.4 * this.scale;
      const w = h * (this.canvas.width / this.canvas.height);
      const geo = new THREE.PlaneGeometry(w, h);
      this.mesh = new THREE.Mesh(geo, mat);
      // 游戏世界 100 逻辑单位 = 1 个 Three 单位；地面在 y=850。
      const gx = (this.x || 0) / 100;
      const gz = (this.z || 0) / 100;
      const gy = (850 - (this.y || 850)) / 100;
      this.mesh.position.set(gx, gy + h / 2 + .02, gz);
      this.height = h;
      this.width = w;
      scene.add(this.mesh);
      const shadowGeo = new THREE.CircleGeometry(w * .3, 18);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28 });
      this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
      this.shadow.rotation.x = -Math.PI / 2;
      this.shadow.position.set(gx, gy + .01, gz);
      scene.add(this.shadow);
      this.camera = camera;
      return this;
    }
    update(dt, time, game) {
      if (!this.mesh) return;
      this.breath += dt;
      let moving = false;
      if (game && this.ai && game.state === 'playing' && game.player && game.level) {
        const px = game.player.x / 100, pz = (game.player.z || 0) / 100;
        const m = this.mesh.position;
        const dx = px - m.x, dz = pz - m.z;
        const dist = Math.hypot(dx, dz) || .001;
        if (this.faction === 'athlete') {
          if (dist > 1.25) {
            const sp = 1.35 * dt;
            m.x += dx / dist * sp;
            m.z += dz / dist * sp;
            moving = true;
          }
          if (dist < 1.4 && game.time - this.lastHit > 1.6 && game.player.hitBy) {
            this.lastHit = game.time;
            game.player.hitBy(5 + game.chapter * 2, m.x * 100, game, this.name, this);
            this.flash = .7;
          }
        } else if (this.faction === 'scholar') {
          if (dist > 7) { m.x += dx / dist * 1.05 * dt; m.z += dz / dist * 1.05 * dt; moving = true; }
          else if (dist < 4.5) { m.x -= dx / dist * .9 * dt; m.z -= dz / dist * .9 * dt; moving = true; }
          if (dist < 8.5 && game.time - this.lastHit > 7 && game.campusLayer) {
            this.lastHit = game.time;
            this.flash = .4;
            game.addText(m.x * 100, 850 - 120, '推演公式', '#c9b6ff', 16, { life: .9 });
            game.campusLayer.combat.playerMentalHit(4 + game.chapter, this.name, game);
          }
        } else {
          // 学生：在附近慢慢游荡
          m.x += Math.sin(time * .45 + this.wander) * .18 * dt;
          m.z += Math.cos(time * .33 + this.wander) * .12 * dt;
          moving = true;
        }
        // 限制在场景内
        const halfW = game.level.width / 100;
        m.x = Math.max(1.2, Math.min(halfW - 1.2, m.x));
        m.z = Math.max(-2.7, Math.min(2.7, m.z));
      }
      this.sway = Math.sin(this.breath * (moving ? 7 : 1.2)) * (moving ? .045 : .012);
      this.mesh.material.uniforms.uTime.value = time;
      this.mesh.material.uniforms.uFlash.value = this.flash;
      this.mesh.material.uniforms.uDissolve.value = this.dissolve;
      this.flash = Math.max(0, this.flash - dt * 3.2);
      if (this.camera) this.mesh.quaternion.copy(this.camera.quaternion);
      const s = 0.98 + Math.sin(this.breath * 1.8) * .02;
      this.mesh.scale.set(s, s, 1);
      this.mesh.rotation.z = this.sway;
      if (this.shadow) {
        this.shadow.position.x = this.mesh.position.x;
        this.shadow.position.z = this.mesh.position.z;
        this.shadow.scale.setScalar(0.85 + Math.abs(this.sway) * 2);
      }
    }
    hit(strength) {
      this.flash = 1;
      this.dissolve = Math.min(.8, (this.dissolve || 0) + (strength || .25));
      if (this.dissolve >= .8) this.remove();
    }
    remove() {
      this.dead = true;
      if (this.mesh && this.mesh.parent) this.mesh.parent.remove(this.mesh);
      if (this.shadow && this.shadow.parent) this.shadow.parent.remove(this.shadow);
    }
    dispose() {
      this.remove();
      if (this.texture) this.texture.dispose();
    }
  }

  class PhotoCharacterManager {
    constructor() { this.list = []; this.scene = null; this.camera = null; }
    attach(scene, camera, THREE, game) {
      this.scene = scene; this.camera = camera; this.THREE = THREE || window.THREE;
      if (game) this.game = game;
      for (const p of this.list) if (!p.mesh) p.attach(this.THREE, scene, camera);
    }
    async add(url, opts) {
      opts = Object.assign({}, opts || {}, { url });
      const ch = await PhotoToCharacter.fromURL(url, opts);
      if (this.scene) ch.attach(this.THREE, this.scene, this.camera);
      this.list.push(ch);
      return ch;
    }
    async addFile(file, opts) {
      const img = await PhotoToCharacter.fromFile(file, opts);
      if (this.scene) img.attach(this.THREE, this.scene, this.camera);
      this.list.push(img);
      return img;
    }
    async batch(urls, opts) {
      const out = [];
      for (const url of urls) {
        try { out.push(await this.add(url, opts)); }
        catch (e) { console.warn('照片角色导入失败', url, e); }
      }
      return out;
    }
    listInfo() { return this.list.map(p => ({ name: p.name, faction: p.faction, dead: p.dead })); }
    update(dt, time) { for (const p of this.list) if (!p.dead) p.update(dt, time, this.game); }
    clear() { for (const p of this.list) p.dispose(); this.list = []; }
  }

  /* ================= 总控层 ================= */
  const CHAPTER_NPCS = [[0, 3], [1, 5], [4, 2], [6, 7]];
  const SURVIVOR_PERIODS = ['night', 'noon', 'class1', 'morning', 'class2', 'dusk', 'night', 'dusk'];
  const CHAPTER_RUMOR = [[0, 1], [2, 3], [4, 5], [6, 7]];

  class CampusLayer {
    constructor(game) {
      this.game = game;
      this.calendar = new RealTimeSyncSystem(this);
      this.factions = new FactionRelation(this);
      this.inventory = new InventorySystem(this);
      this.combat = new CombatSystem(this);
      this.companions = new CompanionSystem(this);
      this.disguise = new DisguiseSystem(this);
      this.vision = new HiddenPollutionSystem(this);
      this.narrative = new DynamicNarrativeSystem(this);
      this.ecosystem = new GlobalEcosystemManager(this);
      this.classes = new ClassEcosystem(this);
      this.classQuests = new ClassQuestSystem(this);
      this.quiz = new QuizSystem(this);
      this.minigames = new MinigameSystem(this);
      this.zones = new CampusZoneSystem(this);
      this.photos = new PhotoCharacterManager();
      this.npcs = [];
      this._hudTick = 0;
      this._rumorPushed = [];
    }
    get rpg() { return this.game.rpg; }
    normalize() { if (this.game.rpg) normalizeRpg(this.game.rpg); }
    onNewRun() {
      normalizeRpg(this.game.rpg);
      const r = this.game.rpg;
      r.san = r.sanMax;
      r.disguise = 100;
      r.clock = 7 * 60;
      r.calendarDay = 0;
      r.consumables.rice = Math.max(1, r.consumables.rice || 0);
      r.consumables.chalk = Math.max(1, r.consumables.chalk || 0);
      this.giveStarterKit();
    }
    onContinue() {
      normalizeRpg(this.game.rpg);
      this.giveStarterKit();
    }
    giveStarterKit() {
      const r = this.game.rpg;
      if (!r) return;
      if (!r.equipped.weapon) r.equipped.weapon = this.makeSpecial('spoon');
      if (!r.equipped.head) r.equipped.head = this.makeSpecial('headphones');
      r.starterKit = true;
      this.game.mods = this.game.computeMods();
    }
    makeSpecial(id) {
      const def = SPECIAL_ITEMS[id];
      if (!def) return null;
      const r = this.game.rpg;
      return {
        uid: (r.uid = (r.uid || 1) + 1),
        base: id, name: def.name, slot: def.slot, rarity: def.rarity,
        special: id, affixes: (def.affixes || []).map(a => Object.assign({}, a)),
        level: 1, durability: def.durability || 0
      };
    }
    onChapterStart() {
      const game = this.game;
      if (!game || !game.level) return;
      this.normalize();
      this.combat.ensureAll(game);
      // 被抛弃的 AI 娘会在后续关卡以「堕落AI」精英怪回归
      const r = this.rpg;
      if (r && r.abandonedAI && r.abandonedAI.length && game.chapter > 0) {
        for (const id of r.abandonedAI) {
          const d = (DATA.aiGirls || []).find(x => x.id === id);
          const nm = d ? d.name : id;
          const e = game.spawnEnemy('elite', Math.min(game.level.width - 420, game.player.x + 620), { name: nm + '·堕落AI', hpScale: .8, dmgScale: 1 });
          if (e) { e._abandonedId = id; this.combat.ensureEnemy(e); e.maxCorruption = Math.round((e.maxCorruption || 300) * 1.35); e.corruption = e.maxCorruption; }
        }
        game.showToast('堕落AI 的怨念仍在校园里游荡……', 'red');
      }
      this.narrative.prepareChapter(game);
      this.pushNPCs(game);
      if (game.chapter === 0 && r && !r.zoneHint) {
        r.zoneHint = true;
        setTimeout(() => { if (game.state !== 'title') game.showToast('按 M 进入校园区域 · 走到建筑旁按 F 也可进入', 'gold'); }, 2600);
      }
      this.narrative.rumors.forEach(r => {
        if (!r.done) game.interactables.push({
          id: 'rumor_' + r.id, name: '谣言节点 · ' + (r.node || '走廊'),
          x: r.x, kind: 'rumor', rumor: r, used: false, interactAt: 0
        });
      });
      this._rumorPushed = this.narrative.rumors.slice();
      this.ecosystem.timer = Math.min(this.ecosystem.timer, 60);
    }
    pushNPCs(game) {
      this.npcs = [];
      const idx = CHAPTER_NPCS[game.chapter] || CHAPTER_NPCS[0];
      const list = DATA.survivors || [];
      idx.forEach((survivorIndex, i) => {
        const s = list[survivorIndex];
        if (!s) return;
        const x = game.level.width * (i === 0 ? .2 : .56);
        const npc = { id: s.id || ('survivor' + survivorIndex), data: s, index: survivorIndex, x };
        this.npcs.push(npc);
        game.interactables.push({
          id: 'npc_' + npc.id + '_' + game.chapter,
          name: s.name || '校园幸存者',
          x, kind: 'npc', npc, used: false, interactAt: 0
        });
      });
      // 随堂测验 / 查寝问答
      if (game.chapter <= 2) {
        game.interactables.push({
          id: 'classroom_' + game.chapter,
          name: '教室 · 随堂测验',
          x: game.level.width * .52,
          kind: 'minigame', minigame: 'class', used: false, interactAt: 0
        });
      }
      if (game.chapter === 0 || game.chapter === 2) {
        game.interactables.push({
          id: 'dorm_' + game.chapter,
          name: '宿舍楼 · 查寝问答',
          x: game.level.width * .86,
          kind: 'minigame', minigame: 'dorm', used: false, interactAt: 0
        });
      }
      // 校园区域的 3D 入口：走到对应建筑附近按 F 直接进入。
      const zoneEntries = game.chapter === 0
        ? [
            { zone: 'gate', name: '校门 · 收发室', fx: .02 },
            { zone: 'dorm', name: '学生公寓 · 入口', fx: .13 },
            { zone: 'canteen', name: '食堂 · 门口', fx: .27 },
            { zone: 'teaching', name: '逸夫楼 · 门厅', fx: .365 },
            { zone: 'playground', name: '操场 · 看台入口', fx: .60 },
            { zone: 'library', name: '特立图书馆 · 门厅', fx: .74 }
          ]
        : game.chapter === 2
          ? [{ zone: 'teaching', name: '旧教学楼 · 门厅', fx: .58 }]
          : [];
      for (const z of zoneEntries) {
        game.interactables.push({
          id: 'zone_' + z.zone + '_' + game.chapter,
          name: z.name, x: game.level.width * z.fx,
          kind: 'zone', zone: z.zone, used: false, interactAt: 0
        });
      }
      // 年级布告栏：把 27 班任务链带进关卡。
      game.interactables.push({
        id: 'bulletin_' + game.chapter,
        name: '年级布告栏 · 班级介入',
        x: game.level.width * .44,
        kind: 'journal', tab: 'classes', used: false, interactAt: 0
      });
      // 高2314班的日常同学：让 50 人名册在关卡里真的出现。
      const roster = DATA.class2314 || [];
      if (roster.length) {
        const picks = [3 + game.chapter * 2, 21 + game.chapter * 2, 41];
        picks.forEach((seat, i) => {
          const s = roster.find(x => x.seat === seat) || roster[(seat - 1) % roster.length];
          if (!s) return;
          const x = game.level.width * (i === 0 ? .36 : i === 1 ? .74 : .47);
          const npc = { id: 'student_' + (s.seat || seat), data: s, index: -1, isStudent: true, x };
          game.interactables.push({
            id: 'student_' + (s.seat || seat) + '_' + game.chapter,
            name: s.name, x, kind: 'npc', npc, used: false, interactAt: 0
          });
        });
      }
    }
    handleInteract(it) {
      if (!it) return false;
      if (it.kind === 'npc') { this.interactNPC(it); return true; }
      if (it.kind === 'rumor') { this.interactRumor(it); return true; }
      if (it.kind === 'minigame') { this.minigames.start(it, this.game); return true; }
      if (it.kind === 'zone') {
        this.zones.zone = it.zone;
        this.zones.pending = null;
        this.zones.result = null;
        this.openPanel('zones');
        return true;
      }
      if (it.kind === 'journal') {
        this.game.journalTab = it.tab || 'classes';
        this.openPanel('journal');
        return true;
      }
      return false;
    }
    interactNPC(it) {
      const game = this.game, r = this.game.rpg;
      const npc = it.npc || {};
      const s = npc.data || {};
      const done = !!(r.npcDone && r.npcDone[npc.id]);
      const reward = npc.index;
      if (npc.isStudent) {
        it.used = true;
        game.audio.sfx('life');
        if (done) {
          game.bark(s.name, s.line || '……', null);
          return;
        }
        game.showDialogue([
          { who: 'narrator', name: s.name, text: s.line || '……' },
          { who: 'narrator', name: '回响', text: `${s.tag || '同班同学'}。高三的日子，谁都在装作若无其事。` }
        ], () => {
          game.showChoice(s.name, '要和他/她多说两句吗？', [
            { text: '聊两句（理智 +4，伪装 +2）', value: 'talk' },
            { text: '点头离开', value: 'leave' }
          ], value => {
            if (value === 'talk') {
              r.npcDone[npc.id] = true;
              this.combat.healSan(4, game);
              this.disguise.modify(2, game, '和同学说了几句话');
              this.factions.modify('study', 1, game);
              game.showToast('和同学说了几句话，心里松了一点。', '');
            } else {
              it.used = false;
            }
            game.saveGame(false);
          });
        });
        return;
      }
      // 幸存者作息：不在自己的时段时只能匆匆说两句，不推进任务。
      const schedId = SURVIVOR_PERIODS[npc.index] || 'dusk';
      const curPeriod = this.calendar.period();
      if (curPeriod.id !== schedId) {
        const schedName = ((DATA.periods || []).find(p => p.id === schedId) || { name: '稍后' }).name;
        game.showDialogue([
          { who: 'narrator', name: s.name || '幸存者', text: `现在是${curPeriod.name}，我这边正忙。${schedName}再来找我吧。` },
          { who: 'narrator', name: s.name || '幸存者', text: s.line || '……' }
        ]);
        game.audio.sfx('ui');
        return;
      }
      if (done) {
        game.showDialogue([
          { who: 'narrator', name: s.name || '幸存者', text: s.line || '……' },
          { who: 'narrator', name: '回响', text: '她/他已经把知道的都告诉你了。' }
        ]);
        return;
      }
      it.used = true;
      game.audio.sfx('life');
      let question = '你要怎么做？';
      let options = [
        { text: '伸手帮忙', value: 'help' },
        { text: '先顾自己', value: 'leave' }
      ];
      if (reward === 0) {
        question = '查寝问答：邵东三中的校训是？';
        options = [
          { text: '求真 · 扬善 · 尚美', value: 'help' },
          { text: '苦干 · 苦教 · 苦学', value: 'half' },
          { text: '今日我以三中为荣', value: 'half' }
        ];
      } else if (reward === 1) {
        question = '食堂窗口前排起了长队，你会？';
        options = [
          { text: '帮低年级同学打饭', value: 'help' },
          { text: '叫大家一起排队', value: 'help' },
          { text: '先给自己打', value: 'half' }
        ];
      } else if (reward === 2) {
        question = '校医推来症状记录：哪一项最像算力污染？';
        options = [
          { text: '只有自己看得见黑板上的字在动', value: 'help' },
          { text: '喉咙痛、流鼻涕', value: 'half' },
          { text: '先量体温再说', value: 'half' }
        ];
      } else if (reward === 3) {
        question = '化学老师问：配平污染样本的第一步是？';
        options = [
          { text: '通风、戴降噪耳机，再配平方程式', value: 'help' },
          { text: '先闻气味判断成分', value: 'half' },
          { text: '用火烤干样本', value: 'leave' }
        ];
      } else if (reward === 4) {
        question = '班主任正在气头上，你会？';
        options = [
          { text: '主动认错并帮忙整理讲台', value: 'help' },
          { text: '查看年级班级介入（Q）', value: 'quests' },
          { text: '悄悄绕开', value: 'leave' }
        ];
      } else if (reward === 5) {
        question = '美术老师指着画：哪一处最不对劲？';
        options = [
          { text: '所有人物的影子与窗光方向相反', value: 'help' },
          { text: '整体色调偏冷', value: 'half' },
          { text: '画框上积了灰', value: 'half' }
        ];
      } else if (reward === 6) {
        question = '守书人问：校史里被撕掉的是哪一页？';
        options = [
          { text: '高2314班的那一页', value: 'help' },
          { text: '校训那一页', value: 'half' },
          { text: '操场竣工那一页', value: 'half' }
        ];
      } else if (reward === 7) {
        question = '风筝断线了，往哪个方向追？';
        options = [
          { text: '顺着读论山的风向', value: 'help' },
          { text: '逆着风跑', value: 'half' },
          { text: '往校门方向找', value: 'half' }
        ];
      }
      game.showDialogue([
        { who: 'narrator', name: s.name || '幸存者', text: s.line || '……' },
        { who: 'narrator', name: s.name || '幸存者', text: '任务：' + (s.task || '在这片走廊里活下去') + '。' }
      ], () => {
        game.showChoice(s.name, question, options, value => {
          if (value === 'help') {
            r.npcDone[npc.id] = true;
            this.giveNPCReward(reward, s, game);
            this.factions.modify('teaching', 2, game);
            this.disguise.modify(5, game, '遵守校园秩序');
          } else if (value === 'half') {
            r.npcDone[npc.id] = true;
            this.combat.healSan(6, game);
            this.disguise.modify(2, game, '帮了一点忙');
            this.factions.modify('teaching', 1, game);
            game.showToast('帮上了一点忙 · 理智 +6，伪装 +2', '');
          } else if (value === 'quests') {
            it.used = false;
            game.journalTab = 'classes';
            this.openPanel('journal');
            game.showToast('年级布告栏 · 选择要介入的班级', '');
          } else {
            it.used = false;
            this.factions.modify('teaching', -1, game);
            game.showToast('你没有插手这件事。', '');
          }
          game.saveGame(false);
        });
      });
    }
    giveNPCReward(index, s, game) {
      const inv = this.inventory, combat = this.combat, r = this.game.rpg;
      let text = '获得：';
      switch (index) {
        case 0:
          game.player.hp = game.player.maxHp;
          game.player.flasks = game.player.maxFlasks;
          combat.healSan(15, game);
          this.disguise.modify(10, game, '安全屋休息');
          text += '安全屋休息 · 状态回满，伪装度 +10';
          break;
        case 1:
          game.player.hp = Math.min(game.player.maxHp, game.player.hp + 35);
          combat.healSan(20, game);
          inv.add('rice', 1);
          text += '特制净化套餐 · HP +35，理智 +20，白米饭 ×1';
          break;
        case 2:
          inv.add('sedative', 1);
          text += '精神镇静剂 ×1';
          break;
        case 3:
          r.sanMax = Math.min(140, r.sanMax + 10);
          r.san = r.sanMax;
          text += '理智上限 +10';
          break;
        case 4:
          game.gainXp(80);
          text += '经验 +80';
          break;
        case 5:
          combat.healSan(10, game);
          inv.add('chalk', 1);
          text += '画作预知 · 理智 +10，粉笔 ×1';
          break;
        case 6:
          r.skillPoints += 1;
          text += '禁忌之书 · 技能点 +1';
          break;
        case 7:
          inv.add('evidence', 1);
          text += '风筝线轴 · 证据 ×1';
          break;
        default:
          inv.add('rice', 1);
          text += '白米饭 ×1';
      }
      if (index < 4 || index === 6) this.factions.modify('deepsea', 2, game);
      if (index === 1 || index === 5) this.factions.modify('dream', 2, game);
      if (index === 2 || index === 4) this.factions.modify('study', 2, game);
      if (index === 0 || index === 7) this.factions.modify('sports', 2, game);
      game.showToast(text, 'gold');
      game.saveGame(false);
      this.renderInventoryIfOpen();
    }
    interactRumor(it) {
      const game = this.game;
      it.used = true;
      this.narrative.resolve(it.rumor, game);
      game.saveGame(false);
    }
    update(dt) {
      const g = this.game;
      if (!g || !g.player) return;
      this.calendar.update(dt, g);
      this.combat.update(dt, g);
      this.companions.update(dt, g);
      this.disguise.update(dt, g);
      this.narrative.update(dt, g);
      this.ecosystem.update(dt, g);
      this.classes.update(dt, g);
      this.photos.update(dt, g.time);
      if (window.Photo2D && window.Photo2D !== this.photos) window.Photo2D.update(dt, g.time);
      // HUD 低频刷新
      this._hudTick += dt;
    }
    draw(ctx) {
      const g = this.game;
      if (!g || !g.player) return;
      this.combat.draw(ctx, g);
      this.vision.draw(ctx, g);
      this.companions.draw(ctx, g);
      this.ecosystem.draw(ctx, g);
      // 谣言节点提示
      for (const it of (g.interactables || [])) {
        if (it.kind !== 'rumor' || it.used) continue;
        const p = this.project(it.x, g.player.y);
        if (!p.visible) continue;
        const a = .25 + Math.sin(g.time * 3) * .1;
        ctx.save();
        ctx.globalAlpha = this.vision.active ? .8 : a;
        ctx.strokeStyle = '#ffd47e';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(p.x, p.y + 2, 26, 7, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffe6ad'; ctx.font = '10px "STKaiti","KaiTi",serif'; ctx.textAlign = 'center';
        ctx.fillText('窃窃私语 · F', p.x, p.y - 16);
        ctx.restore();
      }
    }
    project(x, y) {
      const g = this.game;
      if (g.three && !g.three.failed && typeof g.three.project === 'function') return g.three.project(x, y);
      return { x: x - g.camera.x + 960, y, visible: true };
    }
    updateHUD(inGame) {
      const g = this.game, r = this.rpg;
      if (!r || !g.el) return;
      if (!r.companions) return;
      g.el.sanFill && (g.el.sanFill.style.width = (r.san / r.sanMax * 100) + '%');
      g.el.sanText && (g.el.sanText.textContent = `${Math.round(r.san)} / ${r.sanMax}`);
      g.el.disguiseText && (g.el.disguiseText.textContent = `${Math.round(r.disguise)}%`);
      g.el.disguiseChip && g.el.disguiseChip.classList.toggle('danger', r.disguise <= 30);
      g.el.visionChip && g.el.visionChip.classList.toggle('on', this.vision.active);
      if (!this._lastHudAt || g.time - this._lastHudAt > .25) {
        this._lastHudAt = g.time;
        if (g.el.dateChip) g.el.dateChip.textContent = `${this.calendar.dateISO()} · ${this.calendar.period().name}`;
        if (g.el.journalChip) {
          const ready = (DATA.classes || []).filter(c => {
            const q = r.classQuests && r.classQuests[c.id];
            const poll = (r.classPollution && r.classPollution[c.id]) || 0;
            if (!q || q.done || poll < 15) return false;
            return !(q.step === 2 && poll > 45);
          }).length;
          g.el.journalChip.textContent = ready ? `Q · 班级介入 ${ready}` : 'Q · 三中档案';
          g.el.journalChip.classList.toggle('alert', ready > 0);
        }
        if (g.el.examDays) g.el.examDays.textContent = this.calendar.examDays();
        if (g.el.companionChips) {
          const ids = Object.keys(r.companions).filter(id => r.companions[id].active || r.companions[id].infected).slice(0, 4);
          g.el.companionChips.innerHTML = ids.map(id => {
            const c = r.companions[id];
            const style = COMPANION_STYLE[id] || COMPANION_STYLE.deepseek;
            const cls = c.infected ? 'infected' : (c.active && c.restUntil <= g.time ? 'active' : '');
            return `<span class="companion-chip ${cls}" style="--cc:${style.accent}">${style.short}${c.infected ? ' · 感染' : ''}</span>`;
          }).join('');
        }
        if (g.el.companionActive) g.el.companionActive.textContent = Object.keys(r.companions).filter(id => r.companions[id].active && !r.companions[id].infected && r.companions[id].restUntil <= g.time).length;
        if (g.el.journalExamDays) g.el.journalExamDays.textContent = this.calendar.examDays();
      }
    }
    handleEnemyDamage(enemy, dmg, source, game, blocked) {
      return this.combat.handleEnemyDamage(enemy, dmg, source, game, blocked);
    }
    handleBossDamage(boss, dmg, source, game) {
      return this.combat.handleBossDamage(boss, dmg, source, game);
    }
    execute(target, game) { return this.combat.execute(target, game); }
    mitigatePhysical(damage, game, sourceX) { return this.combat.mitigatePhysical(damage, game, sourceX); }
    onPlayerDeath(game) {
      this.combat.endHallucination(game, true);
      game.inputInvert = false;
      if (this.rpg) this.rpg.san = Math.max(20, Math.round(this.rpg.sanMax * .5));
    }
    openPanel(kind) {
      const g = this.game;
      if (!g || g.state !== 'playing') return;
      g.state = kind;
      g.input.reset();
      g.audio.sfx('ui');
      if (kind === 'companions') { g.el.companionScreen.classList.remove('hidden'); this.renderCompanions(); }
      if (kind === 'journal') { g.el.journalScreen.classList.remove('hidden'); this.renderJournal(); }
      if (kind === 'zones') {
        this.zones.markVisited(this.zones.zone);
        g.el.zoneScreen.classList.remove('hidden');
        this.zones.render();
      }
    }
    closePanel(kind) {
      const g = this.game;
      if (!g || g.state !== kind) return;
      if (kind === 'companions') g.el.companionScreen.classList.add('hidden');
      if (kind === 'journal') g.el.journalScreen.classList.add('hidden');
      if (kind === 'zones') g.el.zoneScreen.classList.add('hidden');
      g.state = 'playing';
      g.input.reset();
    }
    renderCompanions() {
      const g = this.game, r = this.rpg;
      const box = g.el && g.el.companionList;
      if (!box || !r) return;
      const ids = (DATA.aiGirls || []).map(a => a.id);
      box.innerHTML = ids.map(id => {
        const c = r.companions[id];
        if (!c) return '';
        const d = (DATA.aiGirls || []).find(x => x.id === id) || {};
        const style = COMPANION_STYLE[id] || COMPANION_STYLE.deepseek;
        const state = c.infected ? '<em class="bad">思维病毒感染</em>' : (c.restUntil > g.time ? '<em class="warn">系统重启中</em>' : (c.active ? '<em class="ok">同行中</em>' : '<em>待命</em>'));
        const faction = (DATA.factions || []).find(f => f.id === d.faction);
        return `<div class="companion-card ${c.infected ? 'infected' : ''}" style="--cc:${style.accent}">
          <div class="companion-portrait">${style.short}</div>
          <div class="companion-info"><b>${d.name || id}</b>${state}
            <p>${faction ? faction.name + ' · ' : ''}${d.outfit || ''}</p>
            <p class="ability">${this.companions.ability(id)}</p>
            <p class="affinity">好感 ${c.affinity} · ${c.infected ? '变异形态：' + (d.infectForm || '未知') : (d.line || '')}</p>
          </div>
          <div class="companion-actions">
            ${c.infected
              ? `<button data-action="purifyCompanion" data-id="${id}">净化</button><button class="abandon" data-action="abandonCompanion" data-id="${id}">抛弃</button>`
              : `<button data-action="toggleCompanion" data-id="${id}" ${c.restUntil > g.time ? 'disabled' : ''}>${c.active ? '休息' : '同行'}</button>`}
          </div>
        </div>`;
      }).join('');
    }
    renderPeriods() {
      const cur = this.calendar.period();
      const list = DATA.periods || [];
      if (!list.length) return '';
      return `<div class="period-strip">${list.map(p => `<span class="period ${p.id === cur.id ? 'current' : ''}"><b>${p.name}</b><em>${p.start} - ${p.end}</em></span>`).join('')}</div>
        <p class="period-note">当前：<b>${cur.name}</b>。上课时间在校园里动手会持续降低伪装度；正常作息则会缓慢恢复。</p>`;
    }
    renderSurvivorSchedules() {
      const list = DATA.survivors || [];
      if (!list.length) return '';
      const sched = SURVIVOR_PERIODS;
      const periodName = id => (DATA.periods || []).find(p => p.id === id) || { name: '不定' };
      return `<div class="schedule-head">幸存者作息</div><div class="schedule-list">${list.map((s, i) => {
        const p = periodName(sched[i] || 'dusk');
        return `<div class="schedule-row"><b>${s.name}</b><span>${p.name}</span><p>${s.zone || ''} · ${s.task || ''}</p></div>`;
      }).join('')}</div>`;
    }
    renderJournal() {
      const g = this.game, r = this.rpg;
      if (!g.el || !g.el.journalBody || !r) return;
      const tab = g.journalTab || 'calendar';
      const scrollTop = g.el.journalBody.scrollTop || 0;
      g.el.journalScreen.querySelectorAll('[data-action="journalTab"]').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
      let html = '';
      if (tab === 'calendar') {
        html = `<div class="journal-section"><h3>${DATA.meta.school || '邵东三中'} · ${DATA.meta.className || '高2314班'}</h3>
          <p>今天：<b>${this.calendar.dateISO()}</b> ${this.calendar.clockText()} · ${this.calendar.period().name}</p>
          <p>距离高考还有 <b>${this.calendar.examDays()}</b> 天。校训：${DATA.meta.motto || '求真 · 扬善 · 尚美'}</p>
          <p>最近一次年级排名：<b>第 ${r.rank} 名</b> / 50 人（成绩、形态与声望都会影响它）</p>
          <div class="campus-map">
            <div class="map-north">北 · 三中大道</div>
            <div class="map-row">
              <div><b>西 · 生活区</b><span>食堂 · 学生公寓 · 宿舍（女左男右）</span></div>
              <div><b>中 · 教学区</b><span>教学楼 · 篮球场 · 名人园 · 兰蕙亭 · 奔马雕塑</span></div>
              <div><b>东 · 运动区</b><span>400 米操场 · 足球场 · 集会方阵</span></div>
            </div>
            <div class="map-south">南 · 校门 · 半月广场 · 东西双塘 · 特立图书馆</div>
          </div>
          <p class="period-note">按 <b>M</b> 可以走进这些区域：上课、吃饭、回宿舍、跑圈、进图书馆或在校门口望风。</p>
          ${this.renderPeriods()}
          ${this.renderSurvivorSchedules()}
          <div class="journal-list">${(DATA.calendar || []).map(e => `<div class="journal-row"><span>${e.date}</span><b>${e.name}</b><p>${e.desc || ''}</p></div>`).join('')}</div></div>`;
      } else if (tab === 'classes') {
        const questStats = (DATA.classes || []).reduce((acc, c) => {
          const st = this.classQuests.status(c);
          if (st.done) acc.done++;
          else if (!st.disabled && st.poll >= 15) acc.ready++;
          return acc;
        }, { done: 0, ready: 0 });
        html = `<div class="journal-section"><h3>高三年级 · 27 个班级</h3><p>每个班级有独立的行为树：平静 → 流言 → 躁动 → 临界。污染会随校园事件上升；净化对应班级的异化同学可降低污染。班级乱起来后，也可以在卡片底部介入，走完 3 步专属任务链，让这个班重新回到日常。</p>
          <p class="class-overview">可介入 <b>${questStats.ready}</b> 班 · 已平息 <b>${questStats.done}</b> / ${(DATA.classes || []).length} 班</p>
          <div class="journal-grid">${(DATA.classes || []).map(c => {
          const poll = (r.classPollution && r.classPollution[c.id]) || 0;
          const tree = this.classes.treeFor(poll, c);
          const log = (r.classLog && r.classLog[c.id]) || null;
          const quest = this.classQuests.status(c);
          const qentry = this.classQuests.entry(c.id);
          return `<div class="journal-card"><b>${c.name}</b><em>${c.type || ''}</em><p>${c.vibe || ''}</p><small>${c.pollution || ''}</small>
            <span class="class-pollution"><span>污染 ${poll}%</span><span class="pollution-track"><i style="width:${poll}%"></i></span></span>
            <div class="class-state ${tree.state}">${tree.label} · ${tree.acts.join(' / ')}</div>
            ${log ? `<p class="class-log">最近：${log.text}</p>` : ''}
            <div class="class-quest">
              <div class="quest-track"><i style="width:${qentry.step / 3 * 100}%"></i></div>
              <span>${qentry.done ? '任务链已完成' : `介入 ${qentry.step} / 3${qentry.last ? ' · ' + qentry.last : ''}`}</span>
              <button data-action="classQuest" data-id="${c.id}" ${quest.disabled ? 'disabled' : ''}>${quest.label}</button>
            </div>
            <ul>${(c.core || []).map(p => `<li>${p.name} · ${p.role} · ${p.trait || ''}</li>`).join('')}</ul></div>`;
        }).join('')}</div></div>`;
      } else if (tab === 'roster') {
        html = `<div class="journal-section"><h3>高2314班 · 50 人</h3><div class="journal-roster">${(DATA.class2314 || []).map(s => `<div class="roster-row ${s.special ? 'special' : ''}"><span>${s.seat}</span><b>${s.name}</b><em>${s.role || ''}</em><p>${s.tag || ''} · ${s.relation || ''}</p></div>`).join('')}</div></div>`;
      } else if (tab === 'rumors') {
        html = `<div class="journal-section"><h3>谣言与证据</h3><p>证据：<b>${r.consumables.evidence || 0}</b> 份。靠近谣言节点按 F 辟谣。</p>${(DATA.rumors || []).map(x => `<div class="journal-row ${r.rumorsDone[x.id] ? 'done' : ''}"><b>${x.node}</b><p>${x.text}</p><small>${r.rumorsDone[x.id] ? '已澄清' : '待处理'} · 需要：${x.evidence || '证据'}</small></div>`).join('')}</div>`;
      } else if (tab === 'factions') {
        html = `<div class="journal-section"><h3>派系好感</h3><p>好感达到 10 会解锁被动：深海 +5% 伤害，混沌 -5% 精神伤害，造梦 +3% 移速，幽灵 -5% 闪身冷却；教学 +0.3 SAN/s 与伪装恢复，体育 +10 生命，学业 +10% 经验。</p><div class="journal-factions">${(DATA.factions || []).map(f => `<div class="faction-row"><b>${f.name}</b><span>${r.factions[f.id] || 0}</span><p>${f.desc || ''}</p></div>`).join('')}</div>
          <h3>AI 娘档案 · 12 位</h3><div class="journal-grid">${(DATA.aiGirls || []).map(a => `<div class="journal-card"><b>${a.name}</b><em>${(DATA.factions.find(f => f.id === a.faction) || {}).name || a.faction}</em><p>${a.outfit || ''}</p><small>${a.ability || ''} · 变异：${a.infectForm || ''}</small></div>`).join('')}</div></div>`;
      }
      g.el.journalBody.innerHTML = html;
      g.el.journalBody.scrollTop = scrollTop;
    }
    renderInventoryIfOpen() {
      const g = this.game;
      if (g && g.state === 'equipment' && g.switchEquipTab) g.switchEquipTab(g.equipTab || 'equip');
    }
    attachPhotoScene(scene, camera) {
      this.photos.attach(scene, camera, window.THREE, this.game);
      if (window.Photo2D && window.Photo2D !== this.photos) window.Photo2D.attach(scene, camera, window.THREE, this.game);
    }
  }

  window.CampusSystems = {
    createLayer(game) { return new CampusLayer(game); },
    normalizeRpg,
    CampusLayer,
    CombatSystem,
    InventorySystem,
    CompanionSystem,
    DisguiseSystem,
    HiddenPollutionSystem,
    DynamicNarrativeSystem,
    GlobalEcosystemManager,
    RealTimeSyncSystem,
    FactionRelation,
    CampusZoneSystem,
    ClassQuestSystem,
    PhotoToCharacter,
    PhotoCharacterManager,
    CONSUMABLES,
    SPECIAL_ITEMS
  };
  window.Photo2D = window.Photo2D || new PhotoCharacterManager();
})();
