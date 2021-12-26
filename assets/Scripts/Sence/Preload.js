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
    //初始化按钮隐藏
    _this.StartButton.active = false;
    //初始化预加载完成为false
    //   _this.login_preload_finished = false
    //   _this.menu_preload_finished = false
    //预加载Login场景资源
    /*   cc.director.preloadScene(
        'Login',
        (completedCount, totalCount) => {
          //获取加载进度
          // let progress = ((100 * completedCount) / totalCount).toFixed(2)
          // console.log(progress)
        },
        (error) => {
          if (error == null) {
            //加载完成且成功
            console.log('>>> Login scene loading complete')
            _this.login_preload_finished = true
          }
        }
      )
      //预加载菜单场景
      cc.director.preloadScene(
        'Menu',
        (completedCount, totalCount) => {
          //获取加载进度
          // let progress = ((100 * completedCount) / totalCount).toFixed(2)
          // console.log(progress)
        },
        (error) => {
          if (error == null) {
            //加载完成且成功
            console.log('>>> Menu scene loading complete')
            _this.menu_preload_finished = true
          }
        }
      ) */

    //播放小鸟飞行动画
    _this.animMng = cc
      .find("PreloadManage/AnimationManage")
      .getComponent("AnimationManage");

    _this.animMng.playBirdFlyAnim();

    //克隆一个普通节点 这里克隆了3只鸟
    let targetNode = cc.find("Canvas/Bird");
    for (let i = 0, j = 80; i < 3; i++, j += 94) {
      let node = cc.instantiate(targetNode);
      _this.node.addChild(node);
      node.y = j;
      node.getComponent(cc.Animation).play("bird_fly");
    }
  },

  start() {
    //新版写法
    // cc.tween(this.title)
    //   .repeatForever(cc.tween().to(2, { scale: 1.1 }).to(2, { scale: 1 }))
    //   .start();
  },

  update() {
    //判断开始按钮隐藏且预加载完成且加载动画播放完毕
    if (
      !this.StartButton.active &&
      //   this.login_preload_finished &&
      //   this.menu_preload_finished &&
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
    // let token = localStorage.getItem("token");
    // if (token != null)
    //   //跳转到菜单场景
    //   cc.director.loadScene("Menu");
    // else cc.director.loadScene("Login");
  },
});
