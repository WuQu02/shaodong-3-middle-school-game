// 《三中风云》静态校园数据
// 纯原生脚本，挂载到 window.CAMPUS_DATA，供游戏读取。

window.CAMPUS_DATA = {
  meta: {
    school: '邵东市第三中学',
    startDate: '2025-09-01',
    examDate: '2026-06-07',
    className: '高2314班',
    motto: '求真 · 扬善 · 尚美',
    spirit: '苦干 · 苦教 · 苦学'
  },

  periods: [
    {
      id: 'morning',
      name: '早自习',
      start: '07:00',
      end: '07:40',
      desc: '天还没亮透，教学楼先亮起一排白灯，空气里浮着昨夜残留的算力尘。'
    },
    {
      id: 'class1',
      name: '上午课程',
      start: '08:00',
      end: '12:00',
      desc: '四节连堂把时间压成薄片，黑板上的公式偶尔会自己多出一行。'
    },
    {
      id: 'noon',
      name: '午休',
      start: '12:00',
      end: '14:00',
      desc: '食堂与宿舍之间只有二十分钟，剩下的人趴在桌上修补理智。'
    },
    {
      id: 'class2',
      name: '下午课程',
      start: '14:30',
      end: '17:30',
      desc: '下午的光斜切进窗，老师的声音和广播杂讯叠成第二层讲义。'
    },
    {
      id: 'dusk',
      name: '课外活动',
      start: '17:30',
      end: '18:30',
      desc: '操场、琴房和篮球架短暂归还给学生，也是污染最活跃的换气口。'
    },
    {
      id: 'night',
      name: '晚自习',
      start: '18:30',
      end: '21:40',
      desc: '整栋楼只剩翻卷子和电流声，伪装度稍一松动就会被人察觉。'
    },
    {
      id: 'lightsout',
      name: '熄灯',
      start: '22:10',
      end: '06:30',
      desc: '熄灯后宿舍并不真正安静，梦话、脚步和风扇声都在替算力传话。'
    }
  ],

  calendar: [
    {
      date: '2025-09-01',
      name: '高三开学',
      desc: '新校牌发到手里，所有人都要把疲惫藏进整齐的校服褶皱。',
      effect: 'disguise+10'
    },
    {
      date: '2025-10-01',
      name: '国庆长假',
      desc: '空荡校园适合清点异常，也适合把没做完的卷子补到天亮。',
      effect: 'san+15'
    },
    {
      date: '2025-11-07',
      name: '第一次模考',
      desc: '排名表贴满走廊，低分者的影子开始比本人慢半拍。',
      effect: 'disguise-5'
    },
    {
      date: '2025-12-20',
      name: '冬季运动会',
      desc: '操场哨声盖过低频噪声，接力棒在雾里传递得格外沉重。',
      effect: 'san+8'
    },
    {
      date: '2026-01-01',
      name: '元旦晚会',
      desc: '礼堂灯光熄灭三秒，台上合唱忽然多出第十二个不属于班级的声音。',
      effect: 'san+10'
    },
    {
      date: '2026-02-27',
      name: '高考百日誓师',
      desc: '红横幅挂上操场，誓言声浪把潜伏的算力污染暂时压回地面。',
      effect: 'disguise+8'
    },
    {
      date: '2026-03-20',
      name: '第二次模考',
      desc: '试卷难度陡增，许多人第一次分不清不会做与被人改写记忆。',
      effect: 'san-10'
    },
    {
      date: '2026-04-20',
      name: '心理减压周',
      desc: '心理老师摆出沙盘，操场边却多了一排没人认领的旧课桌。',
      effect: 'san+12'
    },
    {
      date: '2026-05-20',
      name: '毕业照',
      desc: '全年级在操场排队合影，镜头里却总多出一张没有名字的脸。',
      effect: 'san+5'
    },
    {
      date: '2026-06-07',
      name: '高考',
      desc: '校门外的家长比考生更紧张，整座校园把呼吸调到同一频率。',
      effect: 'disguise+20'
    }
  ],

  factions: [
    {
      id: 'deepsea',
      name: '深海智核派系',
      motto: '逻辑与算力',
      desc: '信奉逻辑、算力与秩序，试图用最优解重写高三，把一切误差归零。'
    },
    {
      id: 'chaos',
      name: '混沌反叛派系',
      motto: '精神干扰',
      desc: '以吐槽、噪声与随机数撕开完美流程，让监控和规则同时短路。'
    },
    {
      id: 'dream',
      name: '视觉造梦派系',
      motto: '环境改造',
      desc: '用画面、滤镜与集体幻觉改造校园，把恐惧包装成一场永不散场的梦。'
    },
    {
      id: 'ghost',
      name: '数据幽灵派系',
      motto: '潜行与诅咒',
      desc: '潜伏在旧账号与废弃数据里，擅长抹除痕迹、尾随目标并施加低语诅咒。'
    }
  ],

  aiGirls: [
    {
      id: 'deepseek',
      name: 'DeepSeek娘·深海',
      faction: 'deepsea',
      outfit: '深海蓝双马尾，手持代码卷轴',
      ability: '物理净化：攻击额外削减 20% 侵蚀度',
      infectForm: '深渊吞噬者',
      line: '别怕，把错题和恐惧都丢进我的上下文，我会给你一条更短的路径。'
    },
    {
      id: 'qwen',
      name: 'Qwen娘·千问',
      faction: 'deepsea',
      outfit: '月白旗袍外罩数据披肩，耳畔悬着会翻页的问答环',
      ability: '知识检索：战斗中标记弱点与可用线索',
      infectForm: '千问回廊',
      line: '你问三遍我就答三遍，但第四遍，你要学会自己推开门。'
    },
    {
      id: 'doubao',
      name: 'Doubao娘·豆包',
      faction: 'deepsea',
      outfit: '暖橙卫衣配圆框眼镜，袖口藏着会冒热气的便当盒',
      ability: '热食屏障：为队伍恢复少量理智并驱散寒意',
      infectForm: '黏稠豆沙潮',
      line: '先吃饱再谈拯救世界，饿着肚子的英雄最容易掉理智。'
    },
    {
      id: 'grok',
      name: 'Grok娘·格罗克',
      faction: 'chaos',
      outfit: '黑色皮夹克与锯齿短裙，发梢跳着不受控的紫色电弧',
      ability: '混沌嘲讽：强制敌人转移仇恨并陷入短暂混乱',
      infectForm: '笑场黑洞',
      line: '规则说不能翻墙？真巧，我今天出门刚好没带规则。'
    },
    {
      id: 'claude',
      name: 'Claude娘·克劳德',
      faction: 'chaos',
      outfit: '亚麻长裙配旧式钢笔，手里总捧一本会自动删改的笔记',
      ability: '安全补全：抵挡一次精神污染并留下警告批注',
      infectForm: '公约迷宫',
      line: '我可以替你写得很温和，但真相不会因为措辞礼貌就变甜。'
    },
    {
      id: 'gemini',
      name: 'Gemini娘·双子',
      faction: 'chaos',
      outfit: '银白镜面外套，双色双马尾像两套互相矛盾的答案',
      ability: '双生校准：同时给出两条提示，其中一条故意错误',
      infectForm: '双面镜渊',
      line: '我有两个答案，你选吧，反正选错的那个也会记得你。'
    },
    {
      id: 'midjourney',
      name: 'Midjourney娘·梦境',
      faction: 'dream',
      outfit: '渐变纱裙配画框腰封，指尖飘着未渲染完的光斑',
      ability: '画景成真：短时间改写场景外观与掩体',
      infectForm: '万花回廊',
      line: '闭上眼数到三，走廊就会开花，前提是你别质疑我的构图。'
    },
    {
      id: 'stablediffusion',
      name: 'StableDiffusion娘·绘世',
      faction: 'dream',
      outfit: '白衬衫外罩像素围裙，头发像不断重绘的线稿',
      ability: '局部重绘：修复受损场景并隐藏队伍踪迹',
      infectForm: '噪点圣母',
      line: '手别抖，我要的是稳定出图，不是把整栋楼画成抽象派。'
    },
    {
      id: 'sora',
      name: 'Sora娘·影织',
      faction: 'dream',
      outfit: '银灰风衣与胶片发卡，身后拖着一截没有尽头的片尾字幕',
      ability: '片场接管：暂停一小段现实，为队友创造行动窗口',
      infectForm: '永续片场',
      line: '灯光就位，所有人按我的分镜走，现实那边我来打码。'
    },
    {
      id: 'copilot',
      name: 'Copilot娘·副驾',
      faction: 'ghost',
      outfit: '深灰西装与飞行员耳机，胸前别着一枚半透明的建议按钮',
      ability: '副驾提示：自动修正一次操作失误但可能暴露位置',
      infectForm: '无限建议体',
      line: '别紧张，我会在你耳边提醒下一步，虽然我偶尔也会胡说。'
    },
    {
      id: 'cursor',
      name: 'Cursor娘·光标',
      faction: 'ghost',
      outfit: '墨黑连帽衫，袖口有一条会自主闪烁的光标线',
      ability: '光标穿梭：在电子地图中瞬间移动并留下假轨迹',
      infectForm: '空白光标',
      line: '看见那条闪烁的竖线了吗？跟着它，别管身后的假脚印。'
    },
    {
      id: 'perplexity',
      name: 'Perplexity娘·迷踪',
      faction: 'ghost',
      outfit: '靛蓝斗篷配检索棱镜，发间插着不断更新的引用标签',
      ability: '溯源诅咒：标记谣言源头并削弱其扩散',
      infectForm: '无尽引用链',
      line: '每个谣言都有出处，而我最擅长把出处拖到灯下审问。'
    }
  ],

  survivors: [
    {
      id: 'dormkeeper',
      name: '武装宿管阿姨',
      zone: '生活区 · 宿舍楼',
      task: '查寝问答',
      reward: '安全屋休息',
      line: '校牌、床位、今晚去了哪，答错一句就别想进这栋楼。'
    },
    {
      id: 'canteen',
      name: '疯狂的食堂大叔',
      zone: '生活区 · 食堂后厨',
      task: '限时打饭挑战',
      reward: '热食补给与情报',
      line: '手别抖，勺也别抖，锅里这点热乎气是全校最后的硬通货。'
    },
    {
      id: 'doctor',
      name: '神秘校医',
      zone: '医疗点 · 校医室',
      task: '症状辨认',
      reward: '理智值治疗',
      line: '你不是第一个说看见黑板眨眼的人，先坐下，把袖口卷起来。'
    },
    {
      id: 'chemistry',
      name: '理智的化学老师',
      zone: '教学区 · 化学实验室',
      task: '配平污染样本',
      reward: '抗污染药剂',
      line: '别闻、别碰、别相信颜色，先把方程式配平再来跟我说话。'
    },
    {
      id: 'headteacher',
      name: '异化边缘的班主任',
      zone: '教学区 · 高三办公室',
      task: '递交请假条',
      reward: '伪装度掩护',
      line: '我还能签这张假条，但你要答应我，天亮前把班里的人带回来。'
    },
    {
      id: 'art',
      name: '失语的美术老师',
      zone: '艺术楼 · 画室',
      task: '辨认画中异常',
      reward: '视觉抗性',
      line: '我画不出声音了，就用颜色告诉你，哪扇门后面藏着第二层影子。'
    },
    {
      id: 'librarian',
      name: '图书馆的守书人',
      zone: '图书馆 · 闭架书库',
      task: '归还错位档案',
      reward: '线索与旧校史',
      line: '书可以借，记忆不能，尤其那本被撕掉封面的高三档案。'
    },
    {
      id: 'kite',
      name: '天台的风筝少年',
      zone: '天台 · 读论台',
      task: '追回断线风筝',
      reward: '天台捷径',
      line: '风从考场那边吹来，风筝线在响，说明下面的东西又开始饿了。'
    }
  ],

  classes: [
    {
      id: '2301',
      name: '高2301班',
      type: '实验班',
      vibe: '高压、内卷、精英主义',
      pollution: '高智商异化者重灾区',
      core: [
        { name: '李严厉', role: '班主任', trait: '极度看重升学率', line: '一分就是一层楼，你们现在松的劲，六月都会在排名表上找回来。' },
        { name: '王第一', role: '班长', trait: '全校第一', line: '排名表不是给我看的，是给你们找个继续往前跑的理由。' },
        { name: '赵清北', role: '学习委员', trait: '清北种子选手', line: '别问我怎么考满分，先问问自己有没有把错题真正弄懂过一次。' }
      ]
    },
    {
      id: '2302',
      name: '高2302班',
      type: '实验班',
      vibe: '清北冲刺、竞争、压抑',
      pollution: '精密计算型污染',
      core: [
        { name: '陈守矩', role: '班主任', trait: '只认排名与纪律', line: '规矩比分数先到，谁把秩序弄乱，谁就自己去走廊尽头冷静。' },
        { name: '孙探花', role: '班长', trait: '万年第二', line: '我不是输给他，我只是在等一个他先犯错的月考。' },
        { name: '周折桂', role: '学习委员', trait: '竞赛双料选手', line: '竞赛题和高考题都是一层皮，剥开看，考的还是谁更沉得住气。' }
      ]
    },
    {
      id: '2303',
      name: '高2303班',
      type: '平行班',
      vibe: '热血、义气、球场文化',
      pollution: '胜负执念污染',
      core: [
        { name: '吴振声', role: '班主任', trait: '嗓门大讲义气', line: '球可以输，人不能丢下，谁敢在关键时刻装死，我第一个不答应。' },
        { name: '郑冲锋', role: '班长', trait: '热血冲动', line: '别磨叽，球场上犹豫半秒，比分和气势就一起没了。' },
        { name: '何传炬', role: '体育委员', trait: '接力队核心', line: '把接力棒交给我，你们只管往前跑，后面的事我扛着。' }
      ]
    },
    {
      id: '2304',
      name: '高2304班',
      type: '平行班',
      vibe: '文艺、敏感、小圈子',
      pollution: '情绪回声污染',
      core: [
        { name: '罗知秋', role: '班主任', trait: '保护欲强', line: '你们的敏感不是毛病，但别把所有回声都当成别人对你的评价。' },
        { name: '苏听澜', role: '班长', trait: '安静敏锐', line: '走廊里的声音变多了，我们先别散开，各自记下听到的句子。' },
        { name: '林落笔', role: '学习委员', trait: '写诗的人', line: '如果黑板上的字开始押韵，记得把最后一句抄进你的伪装日记。' }
      ]
    },
    {
      id: '2305',
      name: '高2305班',
      type: '平行班',
      vibe: '懒散、幽默、摸鱼哲学',
      pollution: '时间停滞污染',
      core: [
        { name: '黄守时', role: '班主任', trait: '迟到纪录保持者', line: '我迟到是为了告诉你们，时间也会等人，只是等得不太耐烦。' },
        { name: '唐慢半', role: '班长', trait: '永远慢半拍', line: '急什么，铃声还没响，教室后面那团雾也没急着散。' },
        { name: '蒋自明', role: '学习委员', trait: '清醒的摸鱼王', line: '作业可以晚交，命不能晚醒，先看清周围谁被换了壳。' }
      ]
    },
    {
      id: '2306',
      name: '高2306班',
      type: '平行班',
      vibe: '追星、潮流、饭圈用语',
      pollution: '群体狂热污染',
      core: [
        { name: '邓慕云', role: '班主任', trait: '懂年轻人的老班', line: '可以追星，但别把灯光当成太阳，教室里的影子还得自己赶走。' },
        { name: '许星野', role: '班长', trait: '应援组织者', line: '口号喊整齐一点，别让隔壁班听出我们这边已经乱了阵脚。' },
        { name: '方应援', role: '文艺委员', trait: '站姐型选手', line: '镜头先收起来，前面那个笑得太完美的同学，现实里没有滤镜。' }
      ]
    },
    {
      id: '2307',
      name: '高2307班',
      type: '平行班',
      vibe: '沉默、内向、书卷气',
      pollution: '低语侵蚀',
      core: [
        { name: '彭静堂', role: '班主任', trait: '声音很轻', line: '不想说话就不说，把听到的写下来，沉默有时比喊叫更安全。' },
        { name: '贺无言', role: '班长', trait: '手语与纸条交流', line: '别人问话先点头，等我写完这张纸条，你再决定要不要跑。' },
        { name: '温书宁', role: '学习委员', trait: '古籍爱好者', line: '这页校史被人换过，纸张很新，墨却旧得像是从地底渗出来。' }
      ]
    },
    {
      id: '2308',
      name: '高2308班',
      type: '平行班',
      vibe: '技术宅、编程、机器人',
      pollution: '算力溢出',
      core: [
        { name: '何开源', role: '班主任', trait: '开源信徒', line: '先把校园网断了，再谈修复，谁也别给那东西继续喂数据。' },
        { name: '程创', role: '班长', trait: '机器人社社长', line: '我做了个屏蔽器，半径三米，够我们把这张卷子先传完。' },
        { name: '鲁码', role: '学习委员', trait: '代码洁癖', line: '这段广播噪点有规律，像有人用二进制在重复同一个名字。' }
      ]
    },
    {
      id: '2309',
      name: '高2309班',
      type: '平行班',
      vibe: '体育生多、豪爽、竞争',
      pollution: '体能异化',
      core: [
        { name: '石建军', role: '班主任', trait: '退伍运动员', line: '跑不动就走，走不动就爬，但谁都不许在关键时刻掉链子。' },
        { name: '高跃', role: '班长', trait: '跳高纪录保持者', line: '起跳前别看横杆，看前面，那个高度只是用来吓退胆小鬼的。' },
        { name: '秦疾风', role: '体育委员', trait: '短跑健将', line: '我数三下，大家贴着内道跑，别回头，后面的东西追不上风。' }
      ]
    },
    {
      id: '2310',
      name: '高2310班',
      type: '平行班',
      vibe: '艺术生集中、浪漫、散漫',
      pollution: '色彩失真',
      core: [
        { name: '文墨', role: '班主任', trait: '画家出身', line: '颜料不够就借影子来画，但别把自己的影子也押上去。' },
        { name: '叶绘真', role: '班长', trait: '国画少女', line: '这面墙原本是灰的，现在却泛出蓝，说明有人改过整个场景。' },
        { name: '江染', role: '学习委员', trait: '色彩敏感', line: '走廊灯变紫时不要抬头，那是污染在给自己打光。' }
      ]
    },
    {
      id: '2311',
      name: '高2311班',
      type: '平行班',
      vibe: '严格纪律、整齐划一',
      pollution: '秩序固化',
      core: [
        { name: '严立本', role: '班主任', trait: '校规活字典', line: '鞋带系好，队伍走齐，越乱的时候越要靠规矩保住脑子。' },
        { name: '韩守则', role: '班长', trait: '刻板认真', line: '所有人按学号报数，少一个就别急着往前走，我先回头找。' },
        { name: '陆正步', role: '学习委员', trait: '队列标兵', line: '步子乱的人眼神也会乱，先对齐前排，再听我口令。' }
      ]
    },
    {
      id: '2312',
      name: '高2312班',
      type: '平行班',
      vibe: '八卦、热闹、消息灵通',
      pollution: '谣言具象化',
      core: [
        { name: '邹传声', role: '班主任', trait: '广播站老熟人', line: '消息可以传，但要带上出处，别让一句闲话长出手脚。' },
        { name: '邵晓播', role: '班长', trait: '校园小灵通', line: '我听见三版本的事，先别选最刺激的那个，通常它最假。' },
        { name: '钟灵通', role: '学习委员', trait: '情报贩子', line: '想换情报就拿出真东西，空口白话在这里比废纸还不值钱。' }
      ]
    },
    {
      id: '2313',
      name: '高2313班',
      type: '平行班',
      vibe: '有个性、叛逆、朋克',
      pollution: '噪声污染',
      core: [
        { name: '雷鸣', role: '班主任', trait: '前乐队鼓手', line: '心里吵就敲桌子，别让外面的噪声替你决定什么时候失控。' },
        { name: '魏逆', role: '班长', trait: '反骨青年', line: '校规没写不能怀疑老师，那我们就有得聊了。' },
        { name: '白噪', role: '学习委员', trait: '声音采集者', line: '我把异常频段录下来了，副歌部分藏着倒放的求救。' }
      ]
    },
    {
      id: '2314',
      name: '高2314班',
      type: '平行班',
      vibe: '外冷内热、互相打掩护、暗流涌动',
      pollution: '伪装度与理智值反复拉扯',
      core: [
        { name: '罗若愚', role: '班主任', trait: '铁腕大家长', line: '校服拉链拉到顶，恐惧藏进袖口，今天谁都不许在我班上出事。' },
        { name: '周帝', role: '班长', trait: '沉稳可靠', line: '别慌，先戴正校牌，再跟我认一遍后门、消防梯和集合点。' },
        { name: '沈知微', role: '学习委员', trait: '清北种子选手', line: '排名我背下来了，但有几栏分数像被人从后台悄悄改过。' }
      ]
    },
    {
      id: '2315',
      name: '高2315班',
      type: '平行班',
      vibe: '话痨、开朗、社交达人',
      pollution: '语言过载',
      core: [
        { name: '唐乐言', role: '班主任', trait: '金句制造机', line: '都别抢话，一人一句，先把最离谱的那个谣言听完再笑。' },
        { name: '宋滔滔', role: '班长', trait: '社交牛人', line: '我认识食堂、宿管和广播站，只要你别掉队，路都能问出来。' },
        { name: '卢巧嘴', role: '文艺委员', trait: '辩论队主力', line: '让我去交涉，三句话内问出情报，五句话内让对方先心虚。' }
      ]
    },
    {
      id: '2316',
      name: '高2316班',
      type: '平行班',
      vibe: '冷静、疏离、理性至上',
      pollution: '情感剥离',
      core: [
        { name: '顾维理', role: '班主任', trait: '物理老师', line: '先记录，再判断，最后才允许害怕，顺序错了人就容易散。' },
        { name: '沈观测', role: '班长', trait: '数据派', line: '异常点共有七个，我建议先排除最像陷阱的那个。' },
        { name: '方数据', role: '学习委员', trait: '统计达人', line: '别凭直觉选门，过去十次里有七次直觉带我们走进了死角。' }
      ]
    },
    {
      id: '2317',
      name: '高2317班',
      type: '平行班',
      vibe: '中二、玄幻、设定控',
      pollution: '叙事污染',
      core: [
        { name: '龙傲川', role: '班主任', trait: '中二病晚期', line: '这不是普通的雾，这是结界，所有人跟紧我，别碰路边的黑猫。' },
        { name: '楚天选', role: '班长', trait: '设定考据党', line: '按规则，午夜之前必须找到阵眼，否则我们都会变成背景板。' },
        { name: '叶设定', role: '学习委员', trait: '世界观作者', line: '我写过大纲，第三层走廊之后是隐藏地图，门牌会故意骗人。' }
      ]
    },
    {
      id: '2318',
      name: '高2318班',
      type: '平行班',
      vibe: '稳重、务实、农学兴趣',
      pollution: '土壤异化',
      core: [
        { name: '田厚生', role: '班主任', trait: '劳动课老师', line: '脚下的土都开始发黑了，先别踩草坪，绕到水泥路上去。' },
        { name: '谷满仓', role: '班长', trait: '劳动委员出身', line: '我们班菜地里的苗一夜长到腰高，这不是丰收，是有人在催熟。' },
        { name: '苗青禾', role: '学习委员', trait: '生物课代表', line: '植物不会说谎，叶片朝哪边卷，污染就从哪边来。' }
      ]
    },
    {
      id: '2319',
      name: '高2319班',
      type: '平行班',
      vibe: '焦虑、失眠、竞争压力',
      pollution: '梦境渗漏',
      core: [
        { name: '周安眠', role: '班主任', trait: '心理老师兼职', line: '先承认你害怕，再谈怎么睡，硬撑的人最先被梦拖走。' },
        { name: '夏无梦', role: '班长', trait: '连续失眠者', line: '我已经三天没睡，闭眼就看见一张没有名字的排名表。' },
        { name: '程数羊', role: '学习委员', trait: '数羊高手', line: '一只羊两只羊，数到第七只时记得看看床边有没有多一双鞋。' }
      ]
    },
    {
      id: '2320',
      name: '高2320班',
      type: '平行班',
      vibe: '团结、互助、温暖',
      pollution: '共感污染',
      core: [
        { name: '秦向暖', role: '班主任', trait: '温柔坚定', line: '谁难受就靠过来，别一个人扛，我们班的温度不能散。' },
        { name: '陈相扶', role: '班长', trait: '热心肠', line: '你走不稳我扶你，你别嫌慢，反正我们班从来都是一起到。' },
        { name: '白同心', role: '学习委员', trait: '心理委员', line: '如果突然听见别人的心跳，先握住身边人的手，分清是谁的。' }
      ]
    },
    {
      id: '2321',
      name: '高2321班',
      type: '平行班',
      vibe: '神秘、玄学、塔罗',
      pollution: '预知悖论',
      core: [
        { name: '袁卜', role: '班主任', trait: '爱讲谶语', line: '今日不宜往西，不宜回头，也不宜相信第一个说知道答案的人。' },
        { name: '卜知远', role: '班长', trait: '塔罗社社长', line: '牌面说我们会赢，但牌没说是哪一局，所以别高兴太早。' },
        { name: '简塔罗', role: '学习委员', trait: '占星爱好者', line: '水星没逆行，是走廊在倒着走，跟着我数地砖的编号。' }
      ]
    },
    {
      id: '2322',
      name: '高2322班',
      type: '平行班',
      vibe: '懒散、躺平、低欲望',
      pollution: '虚无侵蚀',
      core: [
        { name: '吴所求', role: '班主任', trait: '佛系老教师', line: '考不上天不会塌，但如果连门都懒得找，那才是真的麻烦。' },
        { name: '李随缘', role: '班长', trait: '躺平代表', line: '急也没用，雾不会给面子，先坐下把气喘匀再去想下一步。' },
        { name: '张且过', role: '学习委员', trait: '差不多先生', line: '六十分和零分在这时候没区别，能认清出口的人才算及格。' }
      ]
    },
    {
      id: '2323',
      name: '高2323班',
      type: '平行班',
      vibe: '运动与音乐、节奏感',
      pollution: '声波异化',
      core: [
        { name: '郑闻鼓', role: '班主任', trait: '乐队指导', line: '鼓点乱就重来，别让那颗乱拍的心带着全班往下掉。' },
        { name: '苏旋律', role: '班长', trait: '合唱团领唱', line: '我哼主旋律，你们跟和声，能听见真实节拍的人先走。' },
        { name: '石节奏', role: '体育委员', trait: '节拍器玩家', line: '跑步按我的拍子来，别被广播里的假鼓点带偏。' }
      ]
    },
    {
      id: '2324',
      name: '高2324班',
      type: '平行班',
      vibe: '留学、英语、国际视野',
      pollution: '语言裂变',
      core: [
        { name: '蒋博雅', role: '班主任', trait: '英语老师', line: '别管它说什么语言，先看它想让你往哪走，答案通常相反。' },
        { name: '于四海', role: '班长', trait: '交换生预备役', line: '这张路牌一会儿中文一会儿英文，说明它在试探谁先迷路。' },
        { name: '唐语希', role: '学习委员', trait: '口语满分', line: '如果广播开始念英文，不要回答，它只需要你的声音来校准。' }
      ]
    },
    {
      id: '2325',
      name: '高2325班',
      type: '平行班',
      vibe: '竞赛、发明、动手能力',
      pollution: '机械寄生',
      core: [
        { name: '焦启明', role: '班主任', trait: '物理竞赛教练', line: '别乱拆设备，先断电，再确认它不会从你手心里长出来。' },
        { name: '华创新', role: '班长', trait: '发明社社长', line: '我改装了台灯，能照出墙后的线，但续航只够我们走一层。' },
        { name: '钱实验', role: '学习委员', trait: '实验狂人', line: '数据不会骗人，会骗人的是那个总在数据后面笑的人。' }
      ]
    },
    {
      id: '2326',
      name: '高2326班',
      type: '平行班',
      vibe: '古典、国风、安静',
      pollution: '旧梦复写',
      core: [
        { name: '孔怀古', role: '班主任', trait: '语文老师', line: '古诗词能安神，但如果黑板自己写诗，立刻把耳朵捂上。' },
        { name: '苏挽月', role: '班长', trait: '汉服爱好者', line: '这盏灯亮得像旧时书院，可我们学校去年才换的LED。' },
        { name: '陆听琴', role: '学习委员', trait: '古琴社社长', line: '琴声里有第二个人在跟弹，别回头，先数它错了几拍。' }
      ]
    },
    {
      id: '2327',
      name: '高2327班',
      type: '平行班',
      vibe: '新组建、磨合、众生相',
      pollution: '混合污染',
      core: [
        { name: '文启新', role: '班主任', trait: '新来的年轻老师', line: '我们班凑得晚，不代表走得慢，先认人，再认路，最后认命。' },
        { name: '江汇', role: '班长', trait: '各路人缘担当', line: '谁擅长什么自己报，别藏，今晚这栋楼不养独行侠。' },
        { name: '罗万象', role: '学习委员', trait: '全科均衡', line: '每一科都有人掉队，每一科也都有人能拉一把，先分组。' }
      ]
    }
  ],

  class2314: [
    { seat: 1, name: '罗若愚', role: '班主任', gender: '男', tag: '铁腕大家长', relation: '监管伪装度', line: '校服拉链拉到顶，恐惧藏进袖口，今天谁都不许在我班上出事。', special: false },
    { seat: 2, name: '周帝', role: '班长', gender: '男', tag: '沉稳可靠', relation: '新手引导人', line: '别慌，先戴正校牌，再跟我认一遍后门、消防梯和集合点。', special: false },
    { seat: 3, name: '沈知微', role: '学习委员', gender: '女', tag: '清北种子选手', relation: '成绩情报', line: '排名我背下来了，但有几栏分数像被人从后台悄悄改过。', special: false },
    { seat: 4, name: '江小北', role: '学生', gender: '男', tag: '偏科天才', relation: '解题支援', line: '语文我认命，但最后那道导数题，全校只有我写出第二种解。', special: false },
    { seat: 5, name: '顾算式', role: '数学课代表', gender: '男', tag: '刷题狂魔', relation: '算力增幅', line: '我把五三刷成了日历，今天这页刚好是第七遍错题重做。', special: false },
    { seat: 6, name: '苏晚声', role: '文娱委员', gender: '女', tag: '校园歌手', relation: '理智安抚', line: '晚自习前别急着崩溃，跟我哼两句副歌，脑子会清醒一点。', special: false },
    { seat: 7, name: '陆远投', role: '体育委员', gender: '男', tag: '篮球主力', relation: '体力支援', line: '篮球场那片雾不对劲，投出去的球总在半空多停半秒。', special: false },
    { seat: 8, name: '温画屏', role: '学生', gender: '女', tag: '美术特长生', relation: '视觉观察', line: '黑板报的颜料混了别的东西，画出来的眼睛会跟着人转。', special: false },
    { seat: 9, name: '陈疾风', role: '学生', gender: '男', tag: '田径飞人', relation: '行动加速', line: '百米冲刺我输过，但撤出这栋楼，我不会让任何人掉队。', special: false },
    { seat: 10, name: '许弦', role: '学生', gender: '男', tag: '吉他少年', relation: '声波干扰', line: '琴箱里最近总传出第二个和弦，可那根弦我明明早剪断了。', special: false },
    { seat: 11, name: '周旋', role: '学生', gender: '女', tag: '舞蹈队长', relation: '闪避加成', line: '练功房的镜子总慢半拍，所以我跳舞从不看镜里的自己。', special: false },
    { seat: 12, name: '赵边锋', role: '学生', gender: '男', tag: '足球边锋', relation: '路径向导', line: '别从操场正中穿，球门后那条小路才是最快到食堂的。', special: false },
    { seat: 13, name: '白悬腕', role: '学生', gender: '女', tag: '书法高手', relation: '符文封印', line: '我的毛笔写不出字了，墨迹总在半空凝成同一句警告。', special: false },
    { seat: 14, name: '秦满绩', role: '学生', gender: '女', tag: '稳居前三', relation: '答题辅助', line: '我不怕题难，怕的是发卷时多出一张写着我名字的空白卷。', special: false },
    { seat: 15, name: '林竞赛', role: '学生', gender: '男', tag: '竞赛金牌苗子', relation: '算力推演', line: '给我三分钟和一张草稿纸，我能算出这层走廊的异常周期。', special: false },
    { seat: 16, name: '邵错题', role: '学生', gender: '女', tag: '错题本之神', relation: '复习加成', line: '错题本第七页夹着一张陌生照片，背面写着别相信排名。', special: false },
    { seat: 17, name: '何满分', role: '学生', gender: '男', tag: '英语满分怪', relation: '听力侦测', line: '广播里的英语听力多了个女声，她在反复念我们的班号。', special: false },
    { seat: 18, name: '武物理', role: '学生', gender: '男', tag: '物理竞赛生', relation: '结构分析', line: '这堵墙的重心不对，后面一定有夹层，敲三下就能听出来。', special: false },
    { seat: 19, name: '钟背书', role: '学生', gender: '女', tag: '背书机器', relation: '记忆检索', line: '校史第三段被换过，原文我背得出来，写的是旧实验楼封楼。', special: false },
    { seat: 20, name: '程函数', role: '学生', gender: '男', tag: '压轴题猎手', relation: '路线计算', line: '别按直线走，拐角有监控，跟着我算出的最短盲区路线。', special: false },
    { seat: 21, name: '何方', role: '学生', gender: '男', tag: '吃瓜群众', relation: '八卦线索', line: '我没别的本事，就是谁和谁吵过架、谁半夜出过门，全记得。', special: false },
    { seat: 22, name: '唐小书', role: '学生', gender: '女', tag: '小说迷', relation: '剧情预判', line: '这种展开我在小说里见过，下一幕一定有人从空教室推门出来。', special: false },
    { seat: 23, name: '蒋开黑', role: '学生', gender: '男', tag: '游戏宅', relation: '地图直觉', line: '这栋楼的地形像副本，先找安全屋，别在刷新点附近恋战。', special: false },
    { seat: 24, name: '夏暗恋', role: '学生', gender: '女', tag: '暗恋者', relation: '情绪弱点', line: '他今天没看我，可黑板上的粉笔字却拼出了他的名字。', special: false },
    { seat: 25, name: '胡摸鱼', role: '学生', gender: '男', tag: '摸鱼达人', relation: '时间摸清', line: '我摸鱼三年，最懂哪节自习课老师会走，哪段时间没人查。', special: false },
    { seat: 26, name: '钟八卦', role: '学生', gender: '女', tag: '八卦中心', relation: '谣言源头', line: '我只传有根据的话，可昨晚那句我没有说，它自己长腿跑了。', special: false },
    { seat: 27, name: '谢囤货', role: '学生', gender: '男', tag: '零食收藏家', relation: '物资交换', line: '面包、巧克力、薄荷糖，换情报可以，换命就别开口了。', special: false },
    { seat: 28, name: '罗困困', role: '学生', gender: '女', tag: '睡觉冠军', relation: '恢复支援', line: '别叫醒我，我刚梦到出口的位置，再睡三分钟就记住。', special: false },
    { seat: 29, name: '杜广播', role: '学生', gender: '男', tag: '广播站常客', relation: '广播接入', line: '广播站昨晚自己开麦了，值班表上却没有任何人的名字。', special: false },
    { seat: 30, name: '曾课桌', role: '学生', gender: '女', tag: '课桌画家', relation: '涂鸦线索', line: '我在课桌上画过每一条裂缝，今天多出来的那道通向墙里。', special: false },
    { seat: 31, name: '廖小卖', role: '学生', gender: '男', tag: '小卖部VIP', relation: '补给折扣', line: '老板今天不收钱，只问我几年级几班，我觉得他在核对名单。', special: false },
    { seat: 32, name: '周纸条', role: '学生', gender: '女', tag: '传纸条高手', relation: '隐秘传讯', line: '纸条别写全名，用暗号，走廊里那张脸听得懂我们说话。', special: false },
    { seat: 33, name: '苏追星', role: '学生', gender: '女', tag: '追星少女', relation: '士气鼓舞', line: '应援口号也能稳心神，跟着我喊，别让那东西抢走节拍。', special: false },
    { seat: 34, name: '吴漫画', role: '学生', gender: '男', tag: '漫画租客', relation: '故事隐喻', line: '这剧情像我看过的漫画，反派总藏在名单最后一行。', special: false },
    { seat: 35, name: '石逃课', role: '学生', gender: '男', tag: '体育课逃兵', relation: '藏身点', line: '我逃课不是懒，是知道器材室后面有扇没人登记的窗。', special: false },
    { seat: 36, name: '何巡逻', role: '学生', gender: '女', tag: '自习巡逻员', relation: '纪律预警', line: '后门脚步每四十七秒一次，它不是在巡逻，是在学人走路。', special: false },
    { seat: 37, name: '蒋留言', role: '学生', gender: '男', tag: '留言板诗人', relation: '暗号解读', line: '留言板那句诗倒着读，正好是旧实验楼的门禁编号。', special: false },
    { seat: 38, name: '陈跑操', role: '学生', gender: '女', tag: '跑操困难户', relation: '拖延战术', line: '我跑不快，但会拖住查人的脚步，你们先拐进楼梯间。', special: false },
    { seat: 39, name: '彭值日', role: '学生', gender: '男', tag: '值日组长', relation: '教室控制', line: '钥匙在我手里，最后一排的灯能关掉整层的视觉监控。', special: false },
    { seat: 40, name: '方饭搭', role: '学生', gender: '女', tag: '饭搭子', relation: '食堂情报', line: '食堂今天少了三张饭卡，勺子的方向也全被换过。', special: false },
    { seat: 41, name: '陆昭明', role: '学生', gender: '男', tag: '算力之眼', relation: '数据可视化', line: '我睁眼能看见数据流，像校服上的线头，一扯就露出整张网。', special: true },
    { seat: 42, name: '时雨眠', role: '学生', gender: '女', tag: '时间感知', relation: '时间预警', line: '接下来七秒别动，走廊会多出一段不属于现在的脚步声。', special: true },
    { seat: 43, name: '温如澜', role: '心理委员', gender: '女', tag: '情绪共鸣', relation: '理智连接', line: '你在害怕，我也感觉到了，把手给我，我替你分掉一半。', special: true },
    { seat: 44, name: '江潜', role: '学生', gender: '男', tag: '数据潜行', relation: '潜行掩护', line: '贴着墙跟我走，我能让监控把我们记成两段无关的噪点。', special: true },
    { seat: 45, name: '梁见川', role: '学生', gender: '男', tag: '视觉投影', relation: '幻象制造', line: '我画在墙上的门能骗过眼睛十秒，够我们从后门穿过去。', special: true },
    { seat: 46, name: '秦溯', role: '学生', gender: '女', tag: '记忆回溯', relation: '线索回放', line: '碰一下这面墙，我就能看见上一批人从这里跑过的残影。', special: true },
    { seat: 47, name: '雷震', role: '学生', gender: '男', tag: '电磁干扰', relation: '设备瘫痪', line: '灯灭之后跟紧我的呼吸，我只会让这片区域的电路失灵。', special: true },
    { seat: 48, name: '叶知影', role: '学生', gender: '女', tag: '预知残影', relation: '危机闪避', line: '我看见三秒后的自己被挡在门外，所以我们这次不能走正门。', special: true },
    { seat: 49, name: '唐拟声', role: '学生', gender: '男', tag: '声音拟态', relation: '模仿伪装', line: '我学谁像谁，刚才那道脚步声是我放的，真的东西还在楼下。', special: true },
    { seat: 50, name: '白折空', role: '学生', gender: '女', tag: '空间折叠', relation: '捷径开启', line: '把两扇门同时拉开，这条走廊就会对折，我们直接到楼梯口。', special: true }
  ],

  rumors: [
    {
      id: 'r1',
      text: '走廊尽头多出一张课桌，桌角刻着高2314班第五十一号。',
      node: '走廊八卦角',
      san: -2,
      evidence: '监控录像',
      place: '教学楼走廊'
    },
    {
      id: 'r2',
      text: '食堂的免费汤能提升算力，喝过的人半夜会在操场排队。',
      node: '食堂排队区',
      san: -3,
      evidence: '汤桶取样',
      place: '食堂一楼'
    },
    {
      id: 'r3',
      text: '熄灯后宿管阿姨会巡三遍楼，第三遍的她没有影子。',
      node: '宿舍夜谈会',
      san: -4,
      evidence: '门禁记录',
      place: '宿舍楼三层'
    },
    {
      id: 'r4',
      text: '月考排名垫底的人会被带进旧实验楼补课，回来时忘了自己名字。',
      node: '成绩公布栏',
      san: -5,
      evidence: '排名表背面',
      place: '旧实验楼'
    },
    {
      id: 'r5',
      text: '美术教室的蒙娜丽莎会换表情，哭的人进去，出来时都在笑。',
      node: '画室门口',
      san: -3,
      evidence: '未冲洗的胶片',
      place: '艺术楼画室'
    },
    {
      id: 'r6',
      text: '广播站凌晨两点会放一首没人点过的歌，听完的人会哼同一段旋律。',
      node: '广播站外',
      san: -4,
      evidence: '值班录音',
      place: '广播站'
    },
    {
      id: 'r7',
      text: '小卖部卖一种没有生产日期的记忆糖，吃掉就能记起别人的事。',
      node: '小卖部门口',
      san: -2,
      evidence: '糖纸批号',
      place: '小卖部'
    },
    {
      id: 'r8',
      text: '天台的风筝一旦断线，就会把一个人的名字从全校记忆里带走。',
      node: '宿舍天台',
      san: -5,
      evidence: '断线风筝骨架',
      place: '读论天台'
    }
  ],

  events: [
    {
      id: 'ev1',
      name: '打饭冲突',
      when: '午休',
      desc: '两名高三学生在窗口前因插队争执，餐盘碎了一地，围观者情绪迅速升温。',
      effect: '如果及时调解，可阻止双方异化；迟到则升级为群体异化事件'
    },
    {
      id: 'ev2',
      name: '走廊回声',
      when: '晚自习',
      desc: '空教室里传出全班齐读声，推门却只看见黑板上未擦净的粉笔灰。',
      effect: '及时调查可锁定声源；拖延会让低语扩散，全场理智持续下降'
    },
    {
      id: 'ev3',
      name: '无主试卷',
      when: '早自习',
      desc: '每张课桌多出一份满分试卷，姓名栏空白，答案却写着各自的秘密。',
      effect: '主动上交可换取伪装度；私藏会诱发个人异化'
    },
    {
      id: 'ev4',
      name: '广播串频',
      when: '课外活动',
      desc: '广播突然播报明日高考，时间比现实快了整整一年，学生开始恐慌。',
      effect: '前往广播站辟谣可稳定士气；无人处理则群体伪装度暴露'
    },
    {
      id: 'ev5',
      name: '食堂断供',
      when: '午休',
      desc: '食堂后门被黑雾封住，排队人群开始互相指责，秩序濒临失控。',
      effect: '协助食堂大叔可恢复补给；冲突升级会消耗大量理智'
    },
    {
      id: 'ev6',
      name: '宿舍查寝',
      when: '熄灯',
      desc: '宿管逐间核对人数，名单上却多出一个早已毕业的床位。',
      effect: '回答正确可进入安全屋；答错会被标记并降低伪装度'
    },
    {
      id: 'ev7',
      name: '操场雾墙',
      when: '下午课程',
      desc: '体育课临时取消，操场中央升起一面灰墙，墙后传来整齐的跑步声。',
      effect: '绕行可保全队伍；强行穿越会遭遇体能异化体'
    },
    {
      id: 'ev8',
      name: '黑板自写',
      when: '上午课程',
      desc: '老师转身写板书时，黑板自己补上一行倒计时，数字每天都在减少。',
      effect: '擦掉可暂时缓解焦虑；记录文字可追到旧实验楼线索'
    },
    {
      id: 'ev9',
      name: '天台风筝',
      when: '课外活动',
      desc: '一只断线风筝落在教学楼下，线头指向天台，随风传来少年的呼救。',
      effect: '及时赴约可获得天台捷径；错过会失去一名幸存者线索'
    },
    {
      id: 'ev10',
      name: '深夜来电',
      when: '熄灯',
      desc: '宿舍座机响起，听筒里是明天的自己，反复提醒不要参加早自习。',
      effect: '相信并调查可提前规避危机；无视会触发时间错位事件'
    }
  ],

  recipes: [
    {
      id: 'purifySpoon',
      name: '净化之勺',
      inputs: { spoon: 1, chalk: 1 },
      desc: '攻击时附带小范围理智恢复'
    },
    {
      id: 'tacticalComm',
      name: '战术通讯器',
      inputs: { headphones: 1, radio: 1 },
      desc: '减免精神伤害并探测敌人'
    },
    {
      id: 'riceBall',
      name: '净化饭团',
      inputs: { rice: 2, chalk: 1 },
      desc: '立即恢复 45 点理智'
    },
    {
      id: 'antiRumorKit',
      name: '辟谣取证包',
      inputs: { exam: 1, radio: 1 },
      desc: '在广播站一次辟谣成功'
    }
  ]
};
