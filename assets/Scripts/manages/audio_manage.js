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
});
