cc.Class({
  extends: cc.Component,

  properties: {
    title: {
      default: null,
      type: cc.Node,
      displayName: "标题",
    },
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    let _this = this;
    //定义音频管理器组件
    let audio_manage = cc.find("manage/audio_manage");
    if (audio_manage) {
      _this.audio_manage = audio_manage.getComponent("audio_manage");
    }
    //播放bg
    _this.audio_manage.playPlayTypeBg();
  },

  start() {
    //新版写法
    cc.tween(this.title)
      .repeatForever(cc.tween().to(1, { scale: 1 }).to(1, { scale: 1.02 }))
      .start();
  },

  // update (dt) {},
});
