cc.Class({
  extends: cc.Component,

  properties: {
    LoadingBar: {
      default: null,
      type: cc.Node,
      tooltip: "进度条节点",
    },
    Percent: {
      default: 0,
      type: cc.Integer,
      tooltip: "进度条实际变化的宽度",
    },
    Max: {
      default: 0,
      type: cc.Integer,
      tooltip: "进度条最大宽度",
    },
  },

  start() {
    //初始化进度条宽度
    this.LoadingBar.width = this.Percent;
  },

  update(dt) {
    //动态改变进度条宽度 300 为速度
    this.Percent = parseInt(this.Percent + dt * 300);
    if (this.Percent < 0 || this.Percent > this.Max) {
      this.Percent = this.Max;
    }

    this.LoadingBar.width = this.Percent;
  },

  /**
   * 判断进度条动画是否播放完毕
   */
  isLoadFinished() {
    if (this.Percent == this.Max) {
      return true;
    } else {
      return false;
    }
  },
});
