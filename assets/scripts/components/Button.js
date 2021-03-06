cc.Class({
  extends: cc.Component,

  properties: {
    sence_name: {
      default: "",
      displayName: "跳转的场景名称",
    },
  },

  onLoad() {
    let _this = this;
    //定义音频管理器组件
    let audio_manage = cc.find("manage/audio_manage");
    if (audio_manage) {
      audio_manage = audio_manage.getComponent("audio_manage");
    }

    //记录原始缩放，不然会丢失，连续按的情况下
    let initscale = _this.node.scale;
    //定义按下回调
    let onTouchDown = function (e) {
      //节点缓存动画 runAction已经弃用 执行缩放动画
      cc.tween(_this.node)
        .to(0.1, { scale: initscale * 0.9 })
        .start();
      //播放按钮音效
      if (audio_manage) audio_manage.playButtonEffect();
      //禁止传递
      e.stopPropagation();
    };
    //定义松开回调
    let onTouchUp = function (e) {
      cc.tween(_this.node).to(0.1, { scale: initscale }).start();
      //如果有跳转场景
      if (_this.sence_name) {
        _this._loadSence(_this.sence_name);
      }
      //禁止传递
      e.stopPropagation();
    };
    this.node.on("touchstart", onTouchDown, this.node);
    this.node.on("touchend", onTouchUp, this.node);
    this.node.on("touchcancel", onTouchUp, this.node);
  },

  start() {},

  update() {},

  /**
   * 跳转到指定名称的场景
   * @param {场景名称} sence_name
   */
  _loadSence(sence_name) {
    cc.director.loadScene(sence_name);
  },
});
