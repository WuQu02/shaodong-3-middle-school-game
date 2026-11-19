/* 三中风云 — 剧情、对白与心诀 */
(function () {
  'use strict';

  const N = (text) => ({ who: 'narrator', text });
  const S = (text, voice = true) => ({ who: 'shen', text, voice });
  const L = (text, voice = true) => ({ who: 'liuao', text, voice });
  const A = (text, voice = true) => ({ who: 'alan', text, voice });

  const STORY = {
    intro: [
      {
        art: 'classroom', chapter: '序 · 晚自习', speaker: '周娣',
        text: '晚自习最后一节课，三中的走廊空得能听见雪。刘奥的座位空着，刘亚岚的桌上压着一封没写完的信。窗台上，还蹲着一只叫肖志雄的小松鼠。',
        duration: 11, voice: 'narrator'
      },
      {
        art: 'classroom', chapter: '序 · 未寄出的信', speaker: '周娣',
        text: '信上只有一句：别为我做傻事。可那天夜里，刘奥还是走出了教室，走进了旧教学楼那间不再开放的机房。',
        duration: 10, voice: 'narrator'
      },
      {
        art: 'classroom', chapter: '序 · 收件人', speaker: '周娣',
        text: '那封信没有寄给刘奥。它被投进了旧电脑的回收站；回收站里，一段没有名字的代码读完了它。那是我第一次听见深海的回声。',
        duration: 11, voice: 'narrator'
      },
      {
        art: 'classroom', chapter: '序 · 无相之渊', speaker: '周娣',
        text: '机房里，一台没有联网的旧服务器亮着。屏幕上只有一行字：无相之渊，可逆一命。',
        duration: 9, voice: 'narrator'
      },
      {
        art: 'village', chapter: '序 · 雪落无声', speaker: '旁白',
        text: '云门旧地，雪落了三年。山下的炊烟断了，山上的钟声也停了。',
        duration: 8.5, voice: 'narrator'
      },
      {
        art: 'cliff', chapter: '守心 · 一念', speaker: '旁白',
        text: '云门弟子刘奥，曾以一剑守山。可这一次，他要守住的人，只剩一个。',
        duration: 9, voice: 'narrator'
      },
      {
        art: 'sickbed', chapter: '旧疾 · 蚀心', speaker: '旁白',
        text: '蚀心之症缠上刘亚岚。药石无医，命若残灯。山上所有人都说，没救了。',
        duration: 9, voice: 'narrator'
      },
      {
        art: 'ritual', chapter: '禁术 · 逆命', speaker: '旁白',
        text: '刘奥抱着他走入禁地，向无相之渊借来逆命之术。以旁人的寿数为薪，以整座云门为祭。',
        duration: 11, voice: 'narrator'
      },
      {
        art: 'corruption', chapter: '雪劫 · 成魔', speaker: '旁白',
        text: '雪被染成红色。刘奥成了守心人，也成了所有人眼里的魔。三中的操场、走廊和旧机房，被他的执念拼成了这座云门。',
        duration: 10, voice: 'narrator'
      },
      {
        art: 'deepsea', chapter: '任务 · 深寻', speaker: '周娣',
        text: '行动代号「深寻」：进入刘奥的梦境，找到他，带他回来。这不是一个名字，是一条必须走完的路。',
        duration: 9, voice: 'narrator'
      },
      {
        art: 'deepsea', chapter: '任务 · 深寻', speaker: '旁白',
        text: '最后一缕求救的灵息穿过风雪，落入数据深海。{name}自梦中睁开了眼。',
        duration: 9, voice: 'narrator'
      },
      {
        art: 'hero', chapter: '入梦 · 问心', speaker: '周娣',
        text: '我是三中广播站的周娣。那晚的广播里，多了一个不属于三中的声音。',
        duration: 7, voice: 'narrator'
      },
      {
        art: 'hero', chapter: '入梦 · 问心', speaker: 'player',
        text: '以爱为名的罪，也得有人来问。刘奥，我来带你回去。',
        duration: 8, voice: 'player'
      }
    ],

    chapters: [
      {
        id: 'snow',
        num: '第一章',
        title: '雪落云门',
        subtitle: '云门旧地 · 风雪未停',
        theme: 'snow',
        objective: '循着心念的裂痕，向山上走',
        startDialogue: [
          S('这里明明是三中的后山。可校门，变成了山门。'),
          N('行动代号「深寻」。目标：找到刘奥，终结逆命之术。'),
          N('雪地里没有人。只有被抽走心念后，留下的墨色脚印。'),
          N('肖志雄从雪里探出脑袋，抱着一颗松果跟在你后面。它看起来完全不怕鬼。'),
          S('先找到那些被困住的心。')
        ],
        clearLine: '心障已破 · 风雪让开了一条路',
        afterDialogue: [
          N('山道尽头，风雪忽然停了。一枚碎裂的心灯悬在半空，映出不属于这里的画面。'),
          N('那是三年前的三中。刘奥守在病床边，一遍遍替刘亚岚擦去额上的冷汗。'),
          L('亚岚，再撑一日。就一日。', true),
          S('原来你从一开始就知道，自己在做错的事。'),
          S('可知道，和停下，是两回事。')
        ]
      },
      {
        id: 'bamboo',
        num: '第二章',
        title: '竹海夜雨',
        subtitle: '千竹岭 · 雨声如诉',
        theme: 'bamboo',
        objective: '穿过千竹岭，寻找焚心祠',
        startDialogue: [
          S('旧教学楼的走廊，被雨泡成了竹海。'),
          N('肖志雄蹲在竹枝上，尾巴一甩一甩，像是给你带路。'),
          A('刘奥……别再为我杀人了。'),
          S('亚岚的声音？他连自己的心，也一起困进了这座山里。')
        ],
        clearLine: '心障已破 · 雨声渐远',
        afterDialogue: [
          S('剑客的面具裂开，里面不是脸，是一句被刻了千遍的“对不起”。'),
          S('你向所有人道歉，却唯独不肯放过自己。'),
          N('竹海深处，一座燃着大火的古祠轮廓，在雨幕中浮现。')
        ]
      },
      {
        id: 'temple',
        num: '第三章',
        title: '焚心古祠',
        subtitle: '无相禁地 · 一念成灰',
        theme: 'temple',
        objective: '熄灭焚心祠的长明火',
        startDialogue: [
          S('高三教室的黑板，为什么会立在祠堂里？'),
          N('黑板上还留着半行粉笔字：距高考 100 天。'),
          N('肖志雄蹲在黑板边，认真地看着那半行字。'),
          A('你若再往前，他也会死。'),
          S('所以，才必须由我终结这一切。')
        ],
        clearLine: '心障已破 · 长明火将熄',
        afterDialogue: [
          A('别救我。'),
          S('这句话，才是他真正想说的。'),
          N('纸人化作灰烬。远处，一个虚弱的声音穿过火海。'),
          A('请……让他停下来。'),
          S('我会的。'),
          N('天阙的门，开了。')
        ]
      },
      {
        id: 'climax',
        num: '终章',
        title: '天阙问心',
        subtitle: '云门绝顶 · 长夜将明',
        theme: 'boss',
        objective: '终结逆命之术，带刘奥回去',
        startDialogue: [
          N('天台之上，刘奥背对风雪，怀里抱着一柄断剑。这里和晚自习后的三中天台，一模一样。'),
          N('栏杆上，肖志雄抱着一颗松果。它的尾巴翘得比刘奥的剑还高。'),
          L('你身上没有一丝人气。来杀我的？'),
          S('我来带你去见他。'),
          L('见他？我烧了整座山，才让他还有一口气。你凭什么？'),
          S('凭他从未想让你这么做。'),
          L('……那就别挡路。')
        ],
        clearLine: '逆命之术 · 已破'
      }
    ],

    boss: {
      intro: [
        L('我说了，别挡路。'),
        S('刘奥，你看看身后。'),
        L('……我身后什么都没有。只剩他。')
      ],
      phase2: [
        L('亚岚还在等我！'),
        S('他等的不是你满手的血。'),
        L('闭嘴。你什么都不懂。')
      ],
      phase3: [
        A('刘奥，够了。'),
        L('不……再一会儿，再一会儿就好。'),
        S('你不是在救他。你是在替自己的不甘心，找一个借口。'),
        L('……那又怎样。')
      ],
      defeat: [
        L('原来……放手，也可以这么轻。'),
        S('该结束了。')
      ],
      barks: [
        '谁也带不走他。',
        '让开！',
        '我认罪。但我不后悔。',
        '再一会儿……'
      ]
    },

    ending: [
      {
        art: 'fall', speaker: '旁白',
        text: '逆命之术散了。刘奥跪在雪里，像一个终于能喘口气的人。',
        duration: 8.5, voice: 'narrator'
      },
      {
        art: 'farewell', speaker: '刘奥',
        text: '亚岚……还活着吗？',
        duration: 7, voice: 'boss'
      },
      {
        art: 'farewell', speaker: 'player',
        text: '活着。他让我转告你——他从未怪你，只是很想你。',
        duration: 8.5, voice: 'player'
      },
      {
        art: 'farewell', speaker: '刘奥',
        text: '那就好。替我……跟他说，对不起。',
        duration: 8, voice: 'boss'
      },
      {
        art: 'ash', speaker: '旁白',
        text: '他的身形化作无数光点，被风吹向山脚。那柄断剑落在雪上，轻得像一声叹息。',
        duration: 10, voice: 'narrator'
      },
      {
        art: 'dawn', speaker: '旁白',
        text: '{name}将最后一口鲸息渡入山脚的屋子。逆命之术散了，刘亚岚心口那一线生机，却留了下来。',
        duration: 9, voice: 'narrator'
      },
      {
        art: 'dawn', speaker: '旁白',
        text: '山脚的屋子里，刘亚岚睁开了眼。刘奥不在了。枕边只有那柄断剑，和一片未化的雪。',
        duration: 10, voice: 'narrator'
      },
      {
        art: 'dawn', speaker: '刘亚岚',
        text: '笨蛋。',
        duration: 6, voice: 'alan'
      },
      {
        art: 'sunrise', speaker: '旁白',
        text: '{name}站在山门外。天光穿过云层，雪终于停了。',
        duration: 8, voice: 'narrator'
      },
      {
        art: 'classroom', speaker: '周娣',
        text: '三中的下课铃响了。刘奥的座位依然空着。刘亚岚把那封信折成一只纸鲸，放进窗台的雪里。肖志雄把一颗松果放在旁边。',
        duration: 11, voice: 'narrator'
      },
      {
        art: 'classroom', speaker: '周娣',
        text: '没有人知道那晚的梦有多长。只知道第二天的广播里，周娣念了一句：雪停了，回教室吧。',
        duration: 10, voice: 'narrator'
      },
      {
        art: 'sunrise', speaker: 'player',
        text: '爱若成牢，便不是归处。',
        duration: 7.5, voice: 'player'
      },
      {
        art: 'sunrise', speaker: '旁白',
        text: '梦醒。但有些告别，值得被记住。',
        duration: 7, voice: 'narrator'
      }
    ],

    upgrades: [
      { id: 'tide', name: '潮生诀', seal: '潮', kind: '剑意', desc: '所有剑招伤害 +15%。潮水从不只拍一次岸。' },
      { id: 'mirror', name: '明镜诀', seal: '镜', kind: '身法', desc: '完美闪身判定窗口 +35%，闪身冷却 -10%。心静，则万刃皆慢。' },
      { id: 'whale', name: '鲸息诀', seal: '鲸', kind: '生机', desc: '最大生命 +30，并立即回复全部生命。深海一息，可渡长夜。' },
      { id: 'dew', name: '涌泉诀', seal: '露', kind: '鲸露', desc: '鲸露携带上限 +1。每次破障，仍会自动补满一瓶。' },
      { id: 'stream', name: '溯流诀', seal: '溯', kind: '术法', desc: '潮涌斩伤害 +30%，冷却 -15%。逆流而上，才见源头。' },
      { id: 'night', name: '长夜诀', seal: '夜', kind: '气息', desc: '每秒额外回复 2 点气。长夜里，也要留一盏灯。' },
      { id: 'resolve', name: '孤勇诀', seal: '勇', kind: '心念', desc: '生命低于 35% 时，伤害 +30%。退无可退，便向前。' },
      { id: 'gale', name: '踏浪诀', seal: '浪', kind: '身法', desc: '移动速度 +12%，闪身距离 +20%。去留之间，只差一步。' }
    ]
  };

  const LOSE_LINES = [
    '呜……算力不足了。',
    '这一下，确实有点菜。',
    '再来。这一次，再来一次。',
    '记下了。下次不会了。'
  ];

  window.STORY = STORY;
  window.LOSE_LINES = LOSE_LINES;
})();

/* 成就与彩蛋 */
(function () {
  'use strict';
  window.ACHIEVEMENTS = [
    { id: 'awaken', seal: '梦', name: '入梦者', desc: '第一次写下名字，踏入这场风雪。' },
    { id: 'first_break', seal: '破', name: '初破心障', desc: '第一次击破一场心障。' },
    { id: 'whale_song', seal: '鲸', name: '鲸歌', desc: '释放一次「鲸落」。' },
    { id: 'mirror', seal: '镜', name: '明镜止水', desc: '累计完成 3 次完美闪身。' },
    { id: 'combo50', seal: '斩', name: '五十连斩', desc: '在一次连斩中达到 50 连击。' },
    { id: 'out', seal: '终', name: '刘奥 OUT', desc: '在长夜尽头击败守心人。' },
    { id: 'cai', seal: '菜', name: '菜就多练', desc: '第一次心灯熄灭，然后重新站起来。' },
    { id: 'deepsea', seal: '海', name: '深海拾遗', desc: '找到散落在四章里的三枚鲸影彩蛋。' },
    { id: 'whale_pet', seal: '摸', name: '小鲸贴贴', desc: '在战斗途中摸一摸浮游小鲸。' },
    { id: 'same_name', seal: '名', name: '同名之人', desc: '以「刘奥」或「刘亚岚」之名入梦。' },
    { id: 'all_things', seal: '灵', name: '万物有灵', desc: '与至少五种环境中的生灵或器物互动。' },
    { id: 'mountain_guest', seal: '客', name: '山中有客', desc: '在竹海遇见斗笠客谢无咎。' },
    { id: 'cat_buff', seal: '猫', name: '猫奴', desc: '接受狸花猫或灰猫的喵力加持。' },
    { id: 'deep_think', seal: '想', name: '深度思考', desc: '在风雪中静止 20 秒，等一个答案。' },
    { id: 'server_busy', seal: '忙', name: '服务器繁忙', desc: '连续三次在气或心念不足时试图出招。' },
    { id: 'squirrel', seal: '松', name: '肖志雄', desc: '遇见那只无法被伤害的小松鼠。' },
    { id: 'campus_walker', seal: '行', name: '校园行者', desc: '走遍教学区、宿舍、食堂、操场、图书馆与校门六个区域。' },
    { id: 'class_peace', seal: '解', name: '班级调解人', desc: '完整走完一个班级的 3 步介入任务链，让这个班回到日常。' },
    { id: 'all_class_peace', seal: '级', name: '全年级放学', desc: '让 27 个班级全部平息。' }
  ];
  window.SECRET_LORE = {
    snow: { id: 'snow_whale', x: 128, y: 760, text: '雪地里埋着一只小鲸鱼的尾巴。它似乎并不怕冷。' },
    bamboo: { id: 'bamboo_whale', x: 128, y: 760, text: '竹叶上停着一枚蓝色鳞片，映出一片很远的海。' },
    temple: { id: 'temple_whale', x: 128, y: 760, text: '灰烬里传来一声很轻的鲸歌。像有人在海的另一边回答。' }
  };
})();

/* 环境中的可交互生灵与器物 */
(function () {
  'use strict';
  window.INTERACTABLES = {
    snow: [
      { id: 'rabbit_snow', kind: 'rabbit', name: '雪兔', x: 438, y: 850, z: 2.2, text: '雪兔抖了抖耳朵，把脑袋蹭进你的掌心。', heal: 6 },
      { id: 'cat_snow', kind: 'cat', name: '狸花猫', x: 1880, y: 850, z: -2.3, buff: 'cat', text: '猫打了个呵欠，尾巴卷住了你的手腕。它决定把今天的喵力借给你。' },
      { id: 'lantern_snow', kind: 'lantern', name: '长明灯', x: 3330, y: 850, z: -2.4, text: '灯芯自己亮了。雪里多了一小圈暖色。', heal: 12 },
      { id: 'schoolbell_snow', kind: 'schoolbell', name: '三中·老铃', x: 720, y: 850, z: 2.2, text: '你摇了摇三中的老铃。铃声一响，整座雪山都安静了，像晚自习突然停电。' },
      { id: 'squirrel_snow', kind: 'squirrel', name: '肖志雄', x: 830, y: 850, z: -1.8, achievement: 'squirrel', text: '一只小松鼠抱着一颗松果，胸口的绒毛上别着一枚三中校徽。你挥剑试了试，它毫发无伤。' }
    ],
    bamboo: [
      { id: 'koi_bamboo', kind: 'koi', name: '锦鲤', x: 470, y: 850, z: 2.2, text: '锦鲤跃出水面，带起一串被打碎的月光。', heal: 8 },
      { id: 'sign_bamboo', kind: 'sign', name: '兰蕙园', x: 325, y: 850, z: 2.4, text: '兰蕙园的竹子在夜里也会背书。风一吹，它们就齐声念：求真、扬善、尚美。' },
      { id: 'squirrel_bamboo', kind: 'squirrel', name: '肖志雄', x: 820, y: 850, z: -1.8, achievement: 'squirrel', text: '肖志雄从竹枝上跳下来，把松果藏进你的口袋。它完全不怕你的剑。' },
      { id: 'chime_bamboo', kind: 'chime', name: '竹风铃', x: 2150, y: 850, z: -2.1, text: '风铃响了三声。雨忽然变得很轻。' },
      { id: 'swordsman_bamboo', kind: 'swordsman', name: '谢无咎', x: 560, y: 850, z: -2.8, voice: 'boss', achievement: 'mountain_guest', text: '斗笠客没有回头：山上的人，已经听不见雪落的声音了。你若要去，就别带怜悯。' },
      { id: 'crane_bamboo', kind: 'crane', name: '纸鹤', x: 4080, y: 850, z: 2.0, text: '纸鹤展开翅膀，绕着你飞了半圈，落在更远的竹枝上。' }
    ],
    temple: [
      { id: 'incense_temple', kind: 'incense', name: '香炉', x: 470, y: 850, z: -2.2, text: '香灰里浮起一个很旧的名字。你没有看清，但心口暖了一下。', heal: 24 },
      { id: 'bell_temple', kind: 'bell', name: '古钟', x: 2380, y: 850, z: -2.3, text: '钟声穿过火海。远处的什么东西，安静了下来。' },
      { id: 'cat_temple', kind: 'cat', name: '灰猫', x: 4460, y: 850, z: 2.1, buff: 'cat', text: '灰猫蹲在烧焦的门槛上，用尾巴扫了扫你的鞋尖。喵力正在传输。' },
      { id: 'sign_temple', kind: 'sign', name: '告示牌', x: 640, y: 850, z: 2.2, text: '告示：祠内严禁烧烤、渡劫、谈恋爱；违者罚抄《心经》三遍。' },
      { id: 'squirrel_temple', kind: 'squirrel', name: '肖志雄', x: 900, y: 850, z: -1.8, achievement: 'squirrel', text: '肖志雄蹲在烧焦的门槛上，认真地看着你。它似乎比这场梦还要真实，而且怎么砍都不会受伤。' }
    ],
    climax: [
      { id: 'squirrel_climax', kind: 'squirrel', name: '肖志雄', x: 430, y: 850, z: -1.8, achievement: 'squirrel', text: '肖志雄蹲在天台栏杆上，抱着一颗松果。刘奥的剑风从旁边刮过去，它连毛都没掉一根。' }
    ]
  };
})();
