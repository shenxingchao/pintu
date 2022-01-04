cc.Class({
  extends: cc.Component,

  properties: {
    background: {
      default: null,
      type: cc.Node,
      displayName: "背景图",
    },
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    let _this = this;
    // 加载目录下所有 SpriteFrame，并且获取它们的路径
    new Promise((resolve, reject) => {
      cc.resources.loadDir(
        "texture/two_type",
        cc.SpriteFrame,
        function (err, assets) {
          resolve(assets);
        }
      );
    }).then((res) => {
      //根据name赋值给指定精灵数组的索引 不然打包后顺序错乱Bug
      let sprite_array = res;
      sprite_array.sort((a, b) => Number(a.name) - Number(b.name));
      // 加载 鸡蛋孵化动画 Prefab
      cc.resources.load("prefab/egg", function (err, prefab) {
        //添加当前点击事件 播放鸡蛋孵化动画播放完毕移除
        let egg_pool = new cc.NodePool();
        let initCount = 5;
        for (let i = 0; i < initCount; ++i) {
          //鸡蛋孵化动画预制
          let egg_perfab = cc.instantiate(prefab);
          egg_pool.put(egg_perfab); // 通过 put 接口放入对象池
        }
        _this.background.on(
          "touchstart",
          function (e) {
            let egg = null;
            if (egg_pool.size() > 0) {
              // 通过 size 接口判断对象池中是否有空闲的对象
              egg = egg_pool.get();
            } else {
              // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
              //鸡蛋孵化动画预制
              egg = cc.instantiate(prefab);
            }
            //鸡蛋孵化动画预制
            _this.background.addChild(egg);
            //设置坐标为点击的坐标
            egg.setPosition(egg.parent.convertToNodeSpaceAR(e.getLocation()));
            let AnimationSystem = egg.getComponent(cc.Animation);
            AnimationSystem.play();
            //播放完毕移除
            AnimationSystem.on(
              "finished",
              function () {
                //随机取一个
                let index = Math.floor(Math.random() * sprite_array.length);
                let chick_sprite_frame = sprite_array[index];
                //创建节点
                let chick = new cc.Node("chick");
                //添加精灵组件使之成为精灵
                let sprite = chick.addComponent(cc.Sprite);
                //设置精灵贴图
                sprite.spriteFrame = chick_sprite_frame;
                //设置为自定义尺寸
                sprite.sizeMode = cc.Sprite.SizeMode.RAW;
                //把egg位置赋值给小鸡
                chick.setPosition(egg.getPosition());
                chick.setParent(_this.background);
                //销毁蛋
                egg.destroy();
              },
              _this
            );
          },
          _this
        );
      });
    });
  },

  start() {},

  // update (dt) {},
});
