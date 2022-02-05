cc.Class({
  extends: cc.Component,

  properties: {
    loading_bar: {
      default: null,
      type: cc.Node,
      tooltip: "进度条节点",
    },
    percent: {
      default: 0,
      type: cc.Integer,
      tooltip: "进度条实际变化的宽度",
    },
    max: {
      default: 0,
      type: cc.Integer,
      tooltip: "进度条最大宽度",
    },
  },

  start() {
    //初始化进度条宽度
    this.loading_bar.width = this.percent;
  },

  update(dt) {
    //动态改变进度条宽度 300 为速度
    this.percent = parseInt(this.percent + dt * 300);
    if (this.percent < 0 || this.percent > this.max) {
      this.percent = this.max;
    }

    this.loading_bar.width = this.percent;
  },

  /**
   * 判断进度条动画是否播放完毕
   */
  isLoadFinished() {
    if (this.percent == this.max) {
      return true;
    } else {
      return false;
    }
  },
});
