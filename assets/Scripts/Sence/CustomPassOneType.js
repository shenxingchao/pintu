cc.Class({
  extends: cc.Component,

  properties: {},

  ctor() {
    this._pass_number = 8; //关卡数量 这个值 放在properties里不会刷新 需要注释掉才添加才会刷新，所以直接构造函数里
  },

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
        for (let i = 1; i < _this._pass_number; i++) {
          let newNode = cc.instantiate(prefab);
          //设置预制节点的封面
          newNode.getChildByName("Sprite").getComponent(cc.Sprite).spriteFrame =
            cover_list[i - 1];
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
