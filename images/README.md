# 本地角色贴图（不会被提交）

这个目录用于放置**只在你自己电脑上使用**的角色贴图。`.gitignore` 会忽略除本说明以外的所有文件，因此这里的真人照片不会被提交到 GitHub，也不会出现在 GitHub Pages 上。

## 命名

```text
player.png          主角
enemy1.png          敌人 1
enemy2.png          敌人 2
enemy3.png          敌人 3
boss.png            Boss
npc-security.png    保安老周
npc-luoruoyu.png    罗若愚
npc-zhoudi.png      周帝
npc-liliyan.png     李严厉
npc-shenzhiwei.png  沈知微
npc-wenqixin.png    文启新
npc-director.png    教导主任
npc-dormkeeper.png  宿管阿姨
npc-qinxiangnuan.png 秦向暖
npc-canteen.png     食堂大叔
npc-songtaotao.png  宋滔滔
npc-zhengchongfeng.png 郑冲锋
npc-sumelody.png    苏旋律
npc-librarian.png   守书人
npc-konghuaigu.png  孔怀古
npc-squirrel.png    肖志雄
```

## 规格

- 透明背景 PNG。
- 推荐精灵表：**4 列 × 2 行**，每帧 `160 × 240`，整张 `640 × 480`。
- 第 1 行：待机 4 帧；第 2 行：行走 4 帧。
- 角色脚底对齐每帧底部中间。

## 生成方法

1. 用浏览器打开 `../tools/photo-crop.html`。
2. 选择教室照片，框选一个人物，选择目标角色，导出 PNG。
3. 把导出的文件按上面的名字放进本目录。
4. 刷新游戏，角色会自动使用贴图；没有贴图的角色继续使用原来的绘制，不会报错。

真人照片仅在本机浏览器中处理，不会上传。


## 头像（本地使用）

如果只有人物头像/半身照，不需要做成整身精灵表。将 220 × 220 的图片命名为：

```text
portrait-npc-security.png
portrait-npc-luoruoyu.png
portrait-npc-zhoudi.png
portrait-npc-liliyan.png
portrait-npc-shenzhiwei.png
portrait-npc-wenqixin.png
portrait-npc-director.png
portrait-npc-dormkeeper.png
portrait-npc-qinxiangnuan.png
portrait-npc-canteen.png
portrait-npc-songtaotao.png
portrait-npc-zhengchongfeng.png
portrait-npc-sumelody.png
portrait-npc-librarian.png
portrait-npc-konghuaigu.png
```

游戏会在 NPC 对话立绘中优先使用这些头像；没有头像时继续使用原来的绘制。
