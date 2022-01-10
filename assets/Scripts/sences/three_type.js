cc.Class({
  extends: cc.Component,

  properties: {},

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    let _this = this;
    //定义音频管理器组件
    let audio_manage = cc.find("manage/audio_manage");
    if (audio_manage) {
      audio_manage = audio_manage.getComponent("audio_manage");
    }
    //开启
    cc.director.getPhysicsManager().enabled = true;
    //设置重力加速度 下降640世界单位/秒
    cc.director.getPhysicsManager().gravity = cc.v2(0, -640);
    //设置墙体的位置
  },

  start() {},

  update(dt) {},
});
