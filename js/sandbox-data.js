/* 三中风云 · 开放世界沙盒 — 静态数据
 * 全部内容为原创虚构；人物姓名取自项目既有名册。
 * 两件神物的答案写在 lore 中：刘奥生日 11 月 7 日；旧手机 0739-2721234。
 */
window.SANDBOX_DATA = {
  meta: {
    title: '邵东三中 · 开放世界',
    worldWidth: 12600,
    spawnX: 320,
    startTime: 17 * 60 + 42,
    boss: { name: '刘奥', birthday: '11月7日', phone: '0739-2721234' }
  },

  zones: [
    {
      id: 'gate', name: '校门 · 半月广场', short: '校门', x: 0, w: 1500,
      accent: '#8fe8ff', sky: ['#0b1b2a', '#37556a', '#d7e7ea'],
      desc: '雪落在“邵东三中”四个字上。旗杆、东西双塘和收发室都在原处，没有人催你进教室。'
    },
    {
      id: 'teaching', name: '教学区 · 逸夫楼', short: '教学区', x: 1500, w: 2200,
      accent: '#ffd58a', sky: ['#101c2a', '#4a5a6a', '#dbe5e6'],
      desc: '走廊的灯一盏接一盏，蓝窗帘后面是还没擦干净的黑板。红横幅在风里轻轻响。'
    },
    {
      id: 'admin', name: '行政楼 · 求真楼', short: '行政楼', x: 3700, w: 1400,
      accent: '#f2c66d', sky: ['#121a26', '#45535f', '#d5dfe0'],
      desc: '公告栏贴着月考排名和请假条模板。教导主任的保温杯放在窗台上，还冒着热气。'
    },
    {
      id: 'dorm', name: '生活区 · 学生公寓', short: '宿舍', x: 5100, w: 1700,
      accent: '#ffb27d', sky: ['#111a28', '#4d5364', '#d9dfe4'],
      desc: '阳台上晾着蓝白校服，风一吹，袖子就替谁招了招手。熄灯时间还早。'
    },
    {
      id: 'canteen', name: '生活区 · 三中食堂', short: '食堂', x: 6800, w: 1500,
      accent: '#ffc070', sky: ['#161b27', '#57515a', '#e6dcd2'],
      desc: '蒸汽从窗口涌出来，勺子敲着不锈钢盆。这里没有排队的强制任务，只有热饭。'
    },
    {
      id: 'playground', name: '运动区 · 400 米操场', short: '操场', x: 8300, w: 2400,
      accent: '#8fd8a8', sky: ['#10202b', '#4e6570', '#dce8e6'],
      desc: '红色跑道围着草地，旗杆的影子每天挪一格。看台最右边堆着一小堆没人扫的雪。'
    },
    {
      id: 'library', name: '南门 · 特立图书馆', short: '图书馆', x: 10700, w: 1900,
      accent: '#c7a6ff', sky: ['#141826', '#4d4b64', '#dedbe6'],
      desc: '红门楼里没有风。闭架书库的门虚掩着，书页翻动的声音比脚步更轻。'
    }
  ],

  npcs: [
    {
      id: 'security', name: '保安老周', role: '校门 · 门卫', zone: 'gate', x: 220,
      palette: { coat: '#26343d', trim: '#c7d2d4', hair: '#2a2a2a', skin: '#d9b394', accent: '#8fe8ff' },
      accessory: 'cap',
      line: '校牌带了吗？……没带也别急，先登记。今晚不上课，你可以随便走走。',
      after: '三中很大，别只盯着教室。操场、图书馆、宿舍，各有各的声音。',
      quest: { type: 'visit', title: '去行政楼看看', objective: '走到行政楼 · 求真楼', zone: 'admin', rewardMood: 8 },
      clue: '行政楼公告栏后面，总有人藏东西。'
    },
    {
      id: 'luoruoyu', name: '罗若愚', role: '高2314班 · 班长', zone: 'gate', x: 760,
      palette: { coat: '#2f5f8f', trim: '#eef1f4', hair: '#1d242c', skin: '#e0bd9e', accent: '#ffd58a' },
      accessory: 'scarf',
      line: '你来得正好。班里今天没人点名，大家都当自己放假了。',
      after: '刘奥的生日？11 月 7 日，第一次模考那天。他一个人在食堂吃了两碗面。',
      quest: { type: 'visit', title: '回教室看一眼', objective: '走到教学区 · 逸夫楼', zone: 'teaching', rewardMood: 10 },
      clue: '刘奥的生日：11 月 7 日，第一次模考那天。'
    },
    {
      id: 'zhoudi', name: '周帝', role: '高2314班 · 同桌', zone: 'gate', x: 1180,
      palette: { coat: '#3a4a6a', trim: '#d9dde2', hair: '#141a20', skin: '#d8b18f', accent: '#ff9fbd' },
      accessory: 'headphones',
      line: '别看我，我今天只是来学校蹭暖气的。沈知微知道的事比我多。',
      after: '沈知微在逸夫楼二楼。他的旧手机号，你得去问她。',
      quest: { type: 'talk', title: '去找沈知微', objective: '在教学区和沈知微谈谈', target: 'shenzhiwei', rewardMood: 8 },
      clue: '沈知微知道刘奥旧手机的号码。'
    },
    {
      id: 'liliyan', name: '李严厉', role: '高2301班 · 数学老师', zone: 'teaching', x: 1780,
      palette: { coat: '#2b2b33', trim: '#d8d5cb', hair: '#202020', skin: '#d9b394', accent: '#8fe8ff' },
      accessory: 'glasses',
      line: '不考试，不点名。你要是想坐一会儿，就把黑板上的题做完。',
      after: '答案不是最重要的。重要的是你愿不愿意自己再算一遍。',
      quest: { type: 'answer', title: '黑板上的最后一题', objective: '回答李老师的问题', question: '函数 f(x)=x² 的导数是？', options: ['2x', 'x²/2', 'x'], correct: 0, rewardMood: 10 },
      clue: '一排亮着灯的窗户后面，有一道没擦掉的题。'
    },
    {
      id: 'shenzhiwei', name: '沈知微', role: '高2314班 · 学习委员', zone: 'teaching', x: 2520,
      palette: { coat: '#6a7f9a', trim: '#eef0f2', hair: '#2a2328', skin: '#e2c0a4', accent: '#c7a6ff' },
      accessory: 'notebook',
      line: '你找号码？我只记得开头：0739。中间三个数是 272，后面的……苏旋律知道。',
      after: '号码这种东西，记在手机里会丢，写在纸上会被撕。记在歌里反而不会。',
      quest: { type: 'visit', title: '去图书馆查旧校史', objective: '走到特立图书馆', zone: 'library', rewardMood: 10 },
      clue: '刘奥旧手机：0739-272-????。后四位去问苏旋律。'
    },
    {
      id: 'wenqixin', name: '文启新', role: '高2327班 · 转学生', zone: 'admin', x: 3800,
      palette: { coat: '#4b6b5a', trim: '#e4e8e0', hair: '#2e211c', skin: '#dcb697', accent: '#8fd8a8' },
      accessory: 'backpack',
      line: '我刚转来，名单上多了一个名字。你能陪我去图书馆找孔怀古吗？',
      after: '孔怀古说，旧校史里夹着一页不该存在的名单。',
      quest: { type: 'talk', title: '找孔怀古问名单', objective: '去图书馆找孔怀古', target: 'konghuaigu', rewardMood: 8 },
      clue: '图书馆闭架书库的名单，和旧手机号码有关。'
    },
    {
      id: 'director', name: '教导主任', role: '行政楼 · 教务处', zone: 'admin', x: 4300,
      palette: { coat: '#22252b', trim: '#cfd2cd', hair: '#1a1a1a', skin: '#d3aa8b', accent: '#f2c66d' },
      accessory: 'glasses',
      line: '校牌、作息、校训。答得上来，今晚就当没看见你。',
      after: '求真、扬善、尚美。记住了，比背给我听更重要。',
      quest: { type: 'answer', title: '背一遍校训', objective: '回答教导主任的问题', question: '邵东三中的校训是？', options: ['求真 · 扬善 · 尚美', '厚德载物 · 自强不息', '苦干 · 苦教 · 苦学'], correct: 0, rewardMood: 10 },
      clue: '闭架书库最里面，有一本没有封面的校史。'
    },
    {
      id: 'dormkeeper', name: '宿管阿姨', role: '学生公寓 · 宿管', zone: 'dorm', x: 5250,
      palette: { coat: '#5a3f46', trim: '#e6ded8', hair: '#2b2020', skin: '#dcb697', accent: '#ffb27d' },
      accessory: 'armband',
      line: '校牌、床位、熄灯时间。答对了就让你在楼下坐一会儿。',
      after: '22:10 熄灯。记住了，别在操场上待太晚。',
      quest: { type: 'answer', title: '查寝三问', objective: '回答宿管阿姨的问题', question: '三中宿舍的熄灯时间是？', options: ['22:10', '21:40', '23:00'], correct: 0, rewardMood: 8 },
      clue: '操场看台最右边的雪堆下面，好像有东西。'
    },
    {
      id: 'qinxiangnuan', name: '秦向暖', role: '高2320班 · 生活委员', zone: 'dorm', x: 6020,
      palette: { coat: '#b06a5a', trim: '#f0e6de', hair: '#3a2420', skin: '#e2c0a4', accent: '#ffc070' },
      accessory: 'scarf',
      line: '食堂今晚有热汤。你要去的话，帮我看看大叔还在不在窗口。',
      after: '大叔在的。只要窗口还亮着，三中就不算真的放学。',
      quest: { type: 'visit', title: '去食堂看看窗口', objective: '走到三中食堂', zone: 'canteen', rewardMood: 8 },
      clue: '食堂蒸汽最浓的地方，藏着一点不属于食堂的光。'
    },
    {
      id: 'canteen', name: '食堂大叔', role: '食堂 · 后厨', zone: 'canteen', x: 6960,
      palette: { coat: '#d9d6cc', trim: '#f4f0e6', hair: '#2a2a2a', skin: '#d3aa8b', accent: '#ffc070' },
      accessory: 'apron',
      line: '手别抖，勺也别抖。今晚不考试，想吃多少说一声。',
      after: '刘奥那小子以前总来吃两碗面。11 月 7 日，他生日，也是模考。',
      quest: { type: 'answer', title: '食堂的规矩', objective: '回答食堂大叔的问题', question: '窗口前最该做的是？', options: ['自觉排队', '帮低年级打饭', '先给自己打'], correct: 0, rewardMood: 8 },
      clue: '刘奥的生日：11 月 7 日。生日那天他吃了两碗面。'
    },
    {
      id: 'songtaotao', name: '宋滔滔', role: '高2315班 · 话痨', zone: 'canteen', x: 7660,
      palette: { coat: '#8a5a3a', trim: '#e8ded0', hair: '#20242a', skin: '#e0bd9e', accent: '#ff9fbd' },
      accessory: 'headphones',
      line: '你知道刘奥生日吗？11 月 7 日！模考！两碗面！我跟他说的！',
      after: '苏旋律知道的更多。她给那串号码写过歌。',
      quest: { type: 'talk', title: '去操场找苏旋律', objective: '和操场上的苏旋律谈谈', target: 'sumelody', rewardMood: 8 },
      clue: '生日确定为 11 月 7 日。号码的后四位去问苏旋律。'
    },
    {
      id: 'zhengchongfeng', name: '郑冲锋', role: '高2303班 · 体育委员', zone: 'playground', x: 8500,
      palette: { coat: '#2f6b4f', trim: '#e8eee8', hair: '#1b201c', skin: '#d8b18f', accent: '#8fd8a8' },
      accessory: 'headband',
      line: '跑道一圈 400 米。跑不跑随你，没人吹哨。',
      after: '看台最右边那堆雪，别踩。下面有东西，我上次看见了。',
      quest: { type: 'answer', title: '跑道一圈多少米', objective: '回答郑冲锋的问题', question: '标准操场一圈是多少米？', options: ['400 米', '300 米', '800 米'], correct: 0, rewardMood: 8 },
      clue: '时之沙漏就在操场看台最右边的雪堆下。'
    },
    {
      id: 'sumelody', name: '苏旋律', role: '高2323班 · 音乐生', zone: 'playground', x: 9800,
      palette: { coat: '#6a4a7a', trim: '#efe8f2', hair: '#2a2030', skin: '#e2c0a4', accent: '#c7a6ff' },
      accessory: 'headphones',
      line: '那串号码我写成歌了。0739，272，1234。唱一遍就不会忘。',
      after: '1234 是尾号。前面是 0739-272。',
      quest: { type: 'visit', title: '去图书馆听旧唱片', objective: '走到特立图书馆', zone: 'library', rewardMood: 10 },
      clue: '完整号码：0739-2721234。'
    },
    {
      id: 'librarian', name: '守书人', role: '特立图书馆 · 闭架书库', zone: 'library', x: 11020,
      palette: { coat: '#6d6250', trim: '#e8e2d4', hair: '#2e2a24', skin: '#d9b394', accent: '#c7a6ff' },
      accessory: 'glasses',
      line: '书可以借，记忆不能。闭架书库最里面那本，没有封面。',
      after: '1956 年建校。校史第一页写着：求真、扬善、尚美。',
      quest: { type: 'answer', title: '校史第一页', objective: '回答守书人的问题', question: '邵东三中建校于哪一年？', options: ['1956', '1949', '1978'], correct: 0, rewardMood: 10 },
      clue: '无相之钥在闭架书库最里面，被一本没有封面的校史压着。'
    },
    {
      id: 'konghuaigu', name: '孔怀古', role: '高2326班 · 国风社', zone: 'library', x: 11600,
      palette: { coat: '#4a3a5a', trim: '#ece4d8', hair: '#171a20', skin: '#e0bd9e', accent: '#ffd58a' },
      accessory: 'longhair',
      line: '“先天下之忧而忧”的下一句，你还记得吗？',
      after: '“后天下之乐而乐。”号码的中间三个数，也是 272。',
      quest: { type: 'answer', title: '补全名句', objective: '回答孔怀古的问题', question: '“先天下之忧而忧”的下一句是？', options: ['后天下之乐而乐', '后天下之乐而悲', '先天下之乐而乐'], correct: 0, rewardMood: 10 },
      clue: '号码中间三位：272。'
    },
    {
      id: 'squirrel', name: '肖志雄', role: '三中 · 无敌小松鼠', zone: 'gate', x: 1010,
      palette: { coat: '#9a6a42', trim: '#e8d4b8', hair: '#5a3a24', skin: '#c99462', accent: '#ffd47e' },
      accessory: 'squirrel', special: true,
      line: '肖志雄抱着一颗松果，完全不怕你。你摸了摸它的头。',
      after: '肖志雄把松果往你手里推了推，又飞快地跑开了。'
    }
  ],

  artifacts: [
    {
      id: 'hourglass', name: '时之沙漏', short: '沙漏', zone: 'playground', x: 10580,
      rarity: '神物', accent: '#ffd47e',
      title: '看台最右边的雪堆',
      prompt: '雪堆下面有一圈很淡的金光。',
      riddle: '守心人刘奥的生日是哪一天？（月日，如 1107）',
      hint: '罗若愚和食堂大叔都提过：第一次模考那天，他吃了两碗面。',
      answers: ['1107', '117', '11月7日', '十一月七日', '11-07', '11.7'],
      effect: '移动速度随等级提升。',
      shardId: 'sand', shardName: '时之碎片'
    },
    {
      id: 'key', name: '无相之钥', short: '钥匙', zone: 'library', x: 10820,
      rarity: '神物', accent: '#c7a6ff',
      title: '闭架书库最里面',
      prompt: '一本没有封面的校史下面，压着冰凉的金属。',
      riddle: '刘奥旧手机的号码是？（区号与号码，如 0739-2721234）',
      hint: '沈知微记得 0739 和 272；苏旋律把尾号写成了歌：1234。',
      answers: ['07392721234', '0739-2721234', '0739272-1234', '0739 272 1234'],
      effect: '互动距离提升，并在地图上显示隐藏的光。',
      shardId: 'page', shardName: '无相残页'
    }
  ],

  shards: [
    { id: 'sand1', type: 'sand', zone: 'gate', x: 1300, name: '时之碎片', hint: '双塘边的雪里有一点暖光。' },
    { id: 'sand2', type: 'sand', zone: 'dorm', x: 6600, name: '时之碎片', hint: '晾衣绳下面，有什么在发亮。' },
    { id: 'sand3', type: 'sand', zone: 'canteen', x: 8200, name: '时之碎片', hint: '蒸汽最浓的角落里。' },
    { id: 'page1', type: 'page', zone: 'teaching', x: 3600, name: '无相残页', hint: '走廊尽头的消防栓后面。' },
    { id: 'page2', type: 'page', zone: 'admin', x: 4980, name: '无相残页', hint: '公告栏背面。' },
    { id: 'page3', type: 'page', zone: 'playground', x: 10400, name: '无相残页', hint: '看台最后一排的座位下。' }
  ],

  eggs: [
    { id: 'banner', zone: 'teaching', x: 2050, name: '红横幅', prompt: '横幅上写着：少年当有凌云志，万里长空竞风流。', achievement: 'banner' },
    { id: 'graffiti', zone: 'admin', x: 4620, name: '墙角的粉笔字', prompt: '墙角写着：刘奥 OUT。字迹很旧，像是三年前留下的。', achievement: 'graffiti' }
  ],

  achievements: [
    { id: 'enter', name: '初入三中', desc: '在校门口醒来，没有任务栏催你。', seal: '入' },
    { id: 'walker', name: '校园行者', desc: '走遍教学区、行政楼、宿舍、食堂、操场、图书馆。', seal: '行' },
    { id: 'talker', name: '第一次交谈', desc: '和三中的一个人说上话。', seal: '谈' },
    { id: 'social', name: '熟人社会', desc: '和 12 位不同的 NPC 交谈。', seal: '熟' },
    { id: 'answer', name: '答得上来', desc: '完成第一个回答类委托。', seal: '答' },
    { id: 'hourglass', name: '时之沙漏', desc: '解开看台雪堆下的生日谜题。', seal: '沙' },
    { id: 'key', name: '无相之钥', desc: '解开闭架书库的电话号码谜题。', seal: '钥' },
    { id: 'pair', name: '两件神物', desc: '同时持有沙漏与钥匙。', seal: '双' },
    { id: 'shards', name: '拾光者', desc: '找齐六枚时之碎片与无相残页。', seal: '拾' },
    { id: 'squirrel', name: '肖志雄', desc: '摸到那只无敌的小松鼠。', seal: '松' },
    { id: 'banner', name: '凌云志', desc: '读完逸夫楼外的红横幅。', seal: '志' },
    { id: 'graffiti', name: '刘奥 OUT', desc: '找到行政楼墙角的粉笔字。', seal: '终' }
  ]
};
