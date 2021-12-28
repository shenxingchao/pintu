cc.Class({
  extends: cc.Component,

  properties: {},

  //构造函数
  ctor() {},

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    let _this = this;
    //循环加载关卡封面图
    let cover_list = [];

    // 加载 CustomTypeOnePassCover 目录下所有 SpriteFrame，并且获取它们的路径
    new Promise((resolve, reject) => {
      cc.resources.loadDir(
        "CustomTypeOnePassCover",
        cc.SpriteFrame,
        function (err, assets) {
          resolve(assets);
        }
      );
    }).then((res) => {
      cover_list = res;
      // 加载 Prefab
      cc.resources.load("prefab/pass", function (err, prefab) {
        for (let i = 0; i < cover_list.length; i++) {
          let newNode = cc.instantiate(prefab);
          //设置预制节点的封面
          newNode.getChildByName("Sprite").getComponent(cc.Sprite).spriteFrame =
            cover_list[i];
          //添加预制节点的按钮点击事件 点击关卡封面图 跳转到游戏场景并传参关卡序号 游戏场景通过
          //读取这个序号的Json数据，动态加载对应的资源和关卡数据

          //添加预制节点
          cc.find("Canvas/ScrollView/view/content").addChild(newNode);
        }
      });
    });
  },

  start() {},

  // update (dt) {},

  /**
   * 返回上一场景
   */
  backScene() {
    cc.director.loadScene("PlayType");
  },
});
