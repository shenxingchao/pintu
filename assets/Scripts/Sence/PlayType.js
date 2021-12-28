cc.Class({
  extends: cc.Component,

  properties: {},

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start() {
    //新版写法
    cc.tween(this.node.getChildByName("Title"))
      .repeatForever(cc.tween().to(1, { scale: 1 }).to(1, { scale: 1.2 }))
      .start();
  },

  // update (dt) {},
});
