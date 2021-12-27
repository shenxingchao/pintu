cc.Class({
  extends: cc.Component,

  properties: {},

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start() {
    //新版写法
    cc.tween(this.node.getChildByName("Title"))
      .repeatForever(cc.tween().to(1, { scale: 1.8 }).to(1, { scale: 2.2 }))
      .start();
  },

  // update (dt) {},

  /**
   * 加载游戏场景
   * @type 游戏类型 1拼图游戏{number}
   */
  loadScene(event, customEventData) {
    if (customEventData == 1) {
      cc.director.loadScene("CustomPassOneType");
    }
  },
});
