cc.Class({
  extends: cc.Component,
  properties: {},
  onLoad() {
    //切换横竖屏
    this.updateCanvasSize();
    cc.view.setResizeCallback(() => {
      this.updateCanvasSize();
    });
  },

  // 自由切换横竖屏，动态设置设计分辨率和适配模式。
  updateCanvasSize() {
    //获取当前视窗宽高
    let w = cc.view.getFrameSize().width;
    let h = cc.view.getFrameSize().height;
    if (w > h) {
      //是横屏 旋转为竖屏
      cc.view.setOrientation(
        cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT)
      );
    } else {
      //是竖屏 不处理
    }
  },
});
