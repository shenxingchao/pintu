cc.Class({
  extends: cc.Component,

  properties: {
    title:{
      default:null,
      type:cc.Node,
      displayName:'标题',
    }
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start() {
    //新版写法
    cc.tween(this.title)
      .repeatForever(cc.tween().to(1, { scale: 1 }).to(1, { scale: 1.02 }))
      .start();
  },

  // update (dt) {},
});
