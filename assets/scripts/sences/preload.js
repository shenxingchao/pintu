cc.Class({
  extends: cc.Component,

  properties: {
    start_button: {
      default: null,
      type: cc.Node,
      tooptip: "开始按钮节点",
    },
    loading_bg: {
      default: null,
      type: cc.Node,
      tooltip: "进度条背景节点",
    },
  },

  onLoad() {
    let _this = this;
    //初始化预加载完成为false
    _this.play_type_preload_finished = false;
    //预加载PlayType场景资源
    cc.director.preloadScene(
      "play_type",
      (completedCount, totalCount) => {
        //获取加载进度
        // let progress = ((100 * completedCount) / totalCount).toFixed(2)
        // console.log(progress)
      },
      (error) => {
        if (error == null) {
          //加载完成且成功
          console.log(">>> PlayType scene loading complete");
          _this.play_type_preload_finished = true;
        }
      }
    );

    //播放小鸟飞行动画
    let animation_manage = cc
      .find("manage/animation_manage")
      .getComponent("animation_manage");
    animation_manage.playBirdFlyAnim();
  },

  start() {},

  update() {
    //判断开始按钮隐藏且预加载完成且加载动画播放完毕
    if (
      !this.start_button.active &&
      this.play_type_preload_finished &&
      this.loading_bg.getComponent("Loading").isLoadFinished()
    ) {
      //隐藏进度条
      this.loading_bg.active = false;
      //显示开始按钮
      this.start_button.active = true;
    }
  },
});
