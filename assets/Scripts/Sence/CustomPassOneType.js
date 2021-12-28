cc.Class({
  extends: cc.Component,

  properties: {},

  //构造函数
  ctor() {
    this._null_node = null;
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    let _this = this;
    //添加常驻节点 记录当前玩的关卡 用于场景传数据
    _this._null_node = new cc.Node();
    cc.game.addPersistRootNode(_this._null_node);
    //初始化玩家关卡属性
    _this._null_node.pass_index = null;

    //循环加载关卡封面图
    let cover_list = [];
    // 加载 CustomTypeOnePassCover 目录下所有 SpriteFrame，并且获取它们的路径
    new Promise((resolve, reject) => {
      cc.resources.loadDir(
        "CustomPassOneTypeCover",
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
          let cover_item_perfab = cc.instantiate(prefab);
          //设置预制节点的封面
          cover_item_perfab
            .getChildByName("Sprite")
            .getComponent(cc.Sprite).spriteFrame = cover_list[i];
          //添加预制节点的按钮点击事件 点击关卡封面图 跳转到游戏场景并用常驻节点记录关卡序号
          //游戏场景读取这个序号的Json数据，动态加载对应的资源和关卡数据
          cover_item_perfab.on(
            "touchstart",
            (event) => {
              _this._loadScene(event, i);
            },
            _this,
            true
          );
          //添加预制节点
          cc.find("Canvas/ScrollView/view/content").addChild(cover_item_perfab);
        }
      });
    });
  },

  start() {},

  // update (dt) {},

  /**
   * @private
   * 跳转到关卡详情(游戏场景)
   */
  _loadScene(event, index) {
    this._null_node.pass_index = index;
    cc.director.loadScene("OneType");
  },
});
