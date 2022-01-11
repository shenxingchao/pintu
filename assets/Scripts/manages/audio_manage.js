cc.Class({
  extends: cc.Component,
  properties: {
    button: {
      default: null,
      type: cc.AudioClip,
      tooltip: "按钮点击音效",
    },
    ding: {
      default: null,
      type: cc.AudioClip,
      tooltip: "成功音效",
    },
    game_success: {
      default: null,
      type: cc.AudioClip,
      tooltip: "游戏挑战成功音效",
    },
    egg: {
      default: null,
      type: cc.AudioClip,
      tooltip: "蛋壳破碎音效",
    },
    three_type_bg: {
      default: null,
      type: cc.AudioClip,
      tooltip: "游戏类型3合成大西瓜背景音乐",
    },
    collide: {
      default: null,
      type: cc.AudioClip,
      tooltip: "游戏类型3撞击音效",
    },
    collide_boom: {
      default: null,
      type: cc.AudioClip,
      tooltip: "游戏类型3爆炸声",
    },
  },

  onLoad() {},

  start() {},

  update() {},

  /**
   * 循环播放背景音乐私有方法
   */
  _playMusic: function (clip, bool = true) {
    cc.audioEngine.playMusic(clip, bool);
  },

  /**
   * 暂停背景音乐播放私有方法
   */
  _pauseMusic: function () {
    cc.audioEngine.pauseMusic();
  },

  /**
   * 恢复背景音乐播放私有方法
   */
  _resumeMusic: function () {
    cc.audioEngine.resumeMusic();
  },

  /**
   * 停止所有背景音乐播放私有方法
   */
  _stopMusic: function () {
    cc.audioEngine.stopAll();
  },

  /**
   * 播放音效私有方法
   */
  _playEft: function (clip, loop = false) {
    cc.audioEngine.playEffect(clip, loop);
  },

  //停止播放音效私有方法
  _stopEft: function (clip) {
    cc.audioEngine.stopEffect(clip);
  },

  /**
   * 播放按钮音效
   */
  playButtonEffect: function () {
    this._playEft(this.button);
  },

  /**
   * 播放叮音效
   */
  playDingEffect: function () {
    this._playEft(this.ding);
  },

  /**
   * 播放游戏挑战成功音效
   */
  playGameSuccessEffect: function () {
    this._playEft(this.game_success);
  },

  /**
   * 播放蛋壳破碎音效
   */
  playEggEffect: function () {
    this._playEft(this.egg);
  },

  /**
   * 播放游戏类型3背景音乐
   */
  playThreeTypeBg: function () {
    this._playMusic(this.three_type_bg);
  },

  /**
   * 播放游戏类型3碰撞音效
   */
  playCollideEffect: function () {
    this._playEft(this.collide);
  },

  /**
   * 播放游戏类型3爆炸音效
   */
  playCollideBoomEffect: function () {
    this._playEft(this.collide_boom);
  },
});
