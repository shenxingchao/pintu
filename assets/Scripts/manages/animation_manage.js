cc.Class({
    extends: cc.Component,
    properties: {
      bird_fly_animation: {
        default: null,
        type: cc.Animation,
        tooltip: '小鸟飞翔动画',
      },
    },
  
    /**
     * 播放小鸟飞翔动画动画
     */
    playBirdFlyAnim: function () {
      this.bird_fly_animation.play('bird_fly')
    },
  
    onLoad() {},
  
    start() {},
  
    update() {},
  })
  