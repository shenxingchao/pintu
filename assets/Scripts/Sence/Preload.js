cc.Class({
  extends: cc.Component,

  properties: {
    StartButton: {
      default: null,
      type: cc.Node,
      tooptip: "开始按钮节点",
    },
    LoadingBg: {
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
      "PlayType",
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
    _this.animMng = cc
      .find("PreloadManage/AnimationManage")
      .getComponent("AnimationManage");
    _this.animMng.playBirdFlyAnim();
  },

  start() {},

  update() {
    //判断开始按钮隐藏且预加载完成且加载动画播放完毕
    if (
      !this.StartButton.active &&
      this.play_type_preload_finished &&
      this.LoadingBg.getComponent("Loading").isLoadFinished()
    ) {
      //隐藏进度条
      this.LoadingBg.active = false;
      //显示开始按钮
      this.StartButton.active = true;
    }
  },

  /**
   * 加载游戏场景
   */
  loadScene() {
    cc.director.loadScene("PlayType");
  },
});
