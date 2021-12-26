cc.Class({
  extends: cc.Component,

  properties: {},

  onLoad() {
    let _this = this;
    //定义音频管理器组件
    let audioMng = cc.find("PreloadManage/AudioManage");
    // cc.find("LoginManage/AudioManage") ||
    // cc.find("MenuManage/AudioManage") ||
    // cc.find("GameManage/AudioManage");
    if (audioMng) {
      audioMng = audioMng.getComponent("AudioManage");
    }

    //记录原始缩放，不然会丢失，连续按的情况下
    let initscale = _this.node.scale;
    //定义按下回调
    let onTouchDown = function () {
      //节点缓存动画 runAction已经弃用 执行缩放动画
      cc.tween(_this.node)
        .to(0.1, { scale: initscale * 0.9 })
        .start();
      //播放按钮音效
      if (audioMng) audioMng.playButtonEffect();
    };
    //定义松开回调
    let onTouchUp = function () {
      cc.tween(_this.node).to(0.1, { scale: initscale }).start();
    };
    this.node.on("touchstart", onTouchDown, this.node);
    this.node.on("touchend", onTouchUp, this.node);
    this.node.on("touchcancel", onTouchUp, this.node);
  },

  start() {},

  update() {},
});