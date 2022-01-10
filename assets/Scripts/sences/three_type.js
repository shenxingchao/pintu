import collider from "../components/collider";

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

    // //测试碰撞事件 后面改成预制体之间的碰撞了
    // cc.find("Canvas/background/1").on(
    //   "onBeginContactEvent",
    //   (selfCollider, otherCollider) => {
    //     //判断对象类型 类型一样的进行合并 播放合并粒子动画 删除2个对象 生成新的对象
    //     console.log(123);
    //   }
    // );
  },

  start() {},

  update(dt) {},
});
