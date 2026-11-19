/* 三中风云 — 章节与遭遇编排 */
(function () {
  'use strict';

  const S = (text, voice = true) => ({ who: 'shen', text, voice });
  const N = (text) => ({ who: 'narrator', text });

  const LEVELS = [
    {
      id: 'snow',
      chapter: 0,
      num: '第一章',
      name: '雪落云门',
      subtitle: '云门旧地 · 风雪未停',
      theme: 'snow',
      width: 5600,
      startX: 260,
      objective: '循着心念的裂痕，向山上走',
      tips: [
        { key: 'WASD', text: '全向移动 · 鼠标右键拖拽环绕视角', dur: 5.4 },
        { key: 'Space', text: '跳跃 · 可二段跳', dur: 4.2 },
        { key: 'J', text: '三段连斩', dur: 4.2 },
        { key: 'K', text: '潮涌斩 · 消耗气', dur: 4.3 },
        { key: 'Shift', text: '闪身 · 命中前一瞬触发 0.2 倍子弹时间', dur: 5.4 },
        { key: 'E', text: '卸势 · 红光时弹反近战与飞行物', dur: 5.2 },
        { key: 'R', text: '鲸露疗伤', dur: 4.2 },
        { key: 'F', text: '处决气竭敌人 · 与校园生灵与器物互动', dur: 5.2 },
        { key: 'U', text: '鲸落 · 心念满时释放', dur: 4.5 }
      ],
      encounters: [
        {
          label: '雪径 · 其之一',
          triggerX: 900,
          arena: [270, 2100],
          threshold: 1,
          barks: [['{name}', '心念结成了墨。', 'player']],
          spawns: [
            { type: 'inkling', dx: 360 }, { type: 'inkling', dx: 600 }
          ],
          waves: [
            [{ type: 'inkling', dx: 330 }, { type: 'inkling', dx: 570 }, { type: 'paper', dx: 730 }],
            [{ type: 'inkling', dx: 420 }, { type: 'inkling', dx: 760 }]
          ],
          hpScale: .74, dmgScale: .72,
          clearDialogue: [
            S('这些墨傀，是被抽空的人。'),
            S('刘奥，你究竟借走了多少人的明天？')
          ]
        },
        {
          label: '雪径 · 其之二',
          triggerX: 2670,
          arena: [2130, 3620],
          threshold: 1,
          barks: [['{name}', '风雪里，有东西在盯着我。', 'player']],
          spawns: [
            { type: 'inkling', dx: 300 }, { type: 'inkling', dx: 500 },
            { type: 'inkling', dx: 720 }, { type: 'paper', dx: 640, flying: false }
          ],
          waves: [
            [{ type: 'paper', dx: 320 }, { type: 'paper', dx: 660 }],
            [{ type: 'inkling', dx: 400 }, { type: 'inkling', dx: 780 }],
            [{ type: 'paper', dx: 480 }, { type: 'paper', dx: 810 }]
          ],
          hpScale: .84, dmgScale: .8,
          clearDialogue: [
            S('每一剑都在发抖。这里的心念，不全是恶。')
          ]
        },
        {
          label: '心障 · 灯影雪傀',
          triggerX: 4260,
          arena: [3690, 5550],
          elite: true,
          eliteVariant: 'snow',
          eliteName: '灯影 · 雪傀',
          spawns: [
            { type: 'elite', dx: 460, variant: 'snow', name: '灯影 · 雪傀' },
            { type: 'inkling', dx: 260 }, { type: 'inkling', dx: 730 }
          ],
          hpScale: .86, dmgScale: .86,
          clearDialogue: []
        }
      ]
    },
    {
      id: 'bamboo',
      chapter: 1,
      num: '第二章',
      name: '竹海夜雨',
      subtitle: '千竹岭 · 雨声如诉',
      theme: 'bamboo',
      width: 7400,
      startX: 260,
      objective: '穿过千竹岭，寻找焚心祠',
      encounters: [
        {
          label: '竹海 · 听雨',
          triggerX: 950,
          arena: [260, 2110],
          threshold: 1,
          spawns: [
            { type: 'paper', dx: 310 }, { type: 'paper', dx: 580 },
            { type: 'inkling', dx: 420 }, { type: 'inkling', dx: 690 }
          ],
          waves: [
            [{ type: 'inkling', dx: 320 }, { type: 'paper', dx: 680 }],
            [{ type: 'fox', dx: 520 }, { type: 'paper', dx: 760 }],
            [{ type: 'fox', dx: 440 }, { type: 'inkling', dx: 800 }]
          ],
          hpScale: .92, dmgScale: .88,
          clearDialogue: [
            S('竹林深处，有人在练剑。剑招很旧，像是在等谁回来。')
          ]
        },
        {
          label: '竹海 · 影狐',
          triggerX: 2790,
          arena: [2160, 3970],
          threshold: 1,
          spawns: [
            { type: 'fox', dx: 340 }, { type: 'fox', dx: 540 },
            { type: 'fox', dx: 740 }, { type: 'inkling', dx: 460 },
            { type: 'inkling', dx: 660 }
          ],
          waves: [
            [{ type: 'fox', dx: 380 }, { type: 'inkling', dx: 720 }],
            [{ type: 'inkling', dx: 480 }, { type: 'inkling', dx: 820 }],
            [{ type: 'shield', dx: 560 }, { type: 'fox', dx: 760 }]
          ],
          hpScale: .96, dmgScale: .92,
          clearDialogue: [
            S('执念也会生锈。')
          ]
        },
        {
          label: '竹海 · 铜甲',
          triggerX: 4580,
          arena: [4010, 5500],
          threshold: 1,
          spawns: [
            { type: 'shield', dx: 330 }, { type: 'shield', dx: 690 },
            { type: 'paper', dx: 460 }, { type: 'paper', dx: 820 },
            { type: 'crow', dx: 560 }, { type: 'scholar', dx: 900 }
          ],
          waves: [
            [{ type: 'shield', dx: 420 }, { type: 'paper', dx: 760 }],
            [{ type: 'crow', dx: 520 }, { type: 'fox', dx: 680 }],
            [{ type: 'shield', dx: 600 }, { type: 'paper', dx: 830 }]
          ],
          hpScale: 1.0, dmgScale: .98,
          clearDialogue: [
            S('这些纸傀，折的都是同一个人的名字。')
          ]
        },
        {
          label: '心障 · 无面剑客',
          triggerX: 6030,
          arena: [5560, 7350],
          elite: true,
          eliteVariant: 'sword',
          eliteName: '无面剑客',
          spawns: [
            { type: 'elite', dx: 430, variant: 'sword', name: '无面剑客', hpScale: 1.05 },
            { type: 'paper', dx: 230 }, { type: 'paper', dx: 720 }
          ],
          hpScale: 1.06, dmgScale: 1.0,
          clearDialogue: []
        }
      ]
    },
    {
      id: 'temple',
      chapter: 2,
      num: '第三章',
      name: '焚心古祠',
      subtitle: '无相禁地 · 一念成灰',
      theme: 'temple',
      width: 8200,
      startX: 280,
      objective: '熄灭焚心祠的长明火',
      encounters: [
        {
          label: '古祠 · 长明',
          triggerX: 1030,
          arena: [300, 2260],
          threshold: 1,
          spawns: [
            { type: 'shield', dx: 350 }, { type: 'shield', dx: 640 }, { type: 'shield', dx: 830 },
            { type: 'paper', dx: 470 }, { type: 'paper', dx: 720 }
          ],
          waves: [
            [{ type: 'shield', dx: 430 }, { type: 'paper', dx: 780 }],
            [{ type: 'paper', dx: 520 }, { type: 'shield', dx: 700 }],
            [{ type: 'shield', dx: 600 }, { type: 'paper', dx: 840 }]
          ],
          hpScale: 1.05, dmgScale: 1.0,
          clearDialogue: [
            S('焚心祠。火光里全是回忆。')
          ]
        },
        {
          label: '古祠 · 纸灰',
          triggerX: 3120,
          arena: [2320, 4310],
          threshold: 1,
          spawns: [
            { type: 'fox', dx: 330 }, { type: 'fox', dx: 510 }, { type: 'fox', dx: 760 },
            { type: 'crow', dx: 430 }, { type: 'crow', dx: 660 }, { type: 'athlete', dx: 900 }
          ],
          waves: [
            [{ type: 'fox', dx: 360 }, { type: 'fox', dx: 720 }],
            [{ type: 'crow', dx: 500 }, { type: 'crow', dx: 840 }],
            [{ type: 'fox', dx: 560 }, { type: 'crow', dx: 760 }]
          ],
          hpScale: 1.08, dmgScale: 1.04,
          clearDialogue: [
            S('越靠近山顶，心念越沉。')
          ]
        },
        {
          label: '古祠 · 残火',
          triggerX: 5100,
          arena: [4370, 6320],
          threshold: 1,
          spawns: [
            { type: 'shield', dx: 300 }, { type: 'shield', dx: 720 },
            { type: 'inkling', dx: 430 }, { type: 'inkling', dx: 600 }, { type: 'inkling', dx: 850 },
            { type: 'paper', dx: 510 }, { type: 'paper', dx: 780 }
          ],
          waves: [
            [{ type: 'inkling', dx: 380 }, { type: 'shield', dx: 760 }],
            [{ type: 'paper', dx: 500 }, { type: 'fox', dx: 820 }],
            [{ type: 'shield', dx: 600 }, { type: 'shield', dx: 860 }]
          ],
          hpScale: 1.1, dmgScale: 1.06,
          clearDialogue: [
            S('亚岚，你也在看着吗？')
          ]
        },
        {
          label: '心障 · 执念纸岚',
          triggerX: 6940,
          arena: [6380, 8150],
          elite: true,
          eliteVariant: 'paper',
          eliteName: '执念 · 纸岚',
          spawns: [
            { type: 'elite', dx: 430, variant: 'paper', name: '执念 · 纸岚', hpScale: 1.22 },
            { type: 'paper', dx: 230 }, { type: 'paper', dx: 720 },
            { type: 'fox', dx: 350 }, { type: 'fox', dx: 600 }
          ],
          hpScale: 1.15, dmgScale: 1.1,
          clearDialogue: []
        }
      ]
    },
    {
      id: 'climax',
      chapter: 3,
      num: '终章',
      name: '天阙问心',
      subtitle: '云门绝顶 · 长夜将明',
      theme: 'boss',
      width: 2600,
      startX: 260,
      objective: '终结逆命之术，带刘奥回去',
      bossFight: true,
      bossTriggerX: 820,
      bossArena: [60, 2540],
      bossX: 1750,
      bossHpScale: 1
    }
  ];

  const INTRO_CARD = {
    num: '序',
    name: '风雪入梦',
    sub: '一段被逆命之术改写的旧事'
  };

  window.LEVELS = LEVELS;
  window.INTRO_CARD = INTRO_CARD;
})();
