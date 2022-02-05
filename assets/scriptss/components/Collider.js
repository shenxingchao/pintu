cc.Class({
  extends: cc.Component,

  properties: {},

  onLoad() {
    //必须开启开启，否则下面的回调不自动触发
    cc.director.getPhysicsManager().enabled = true;
  },

  start() {},

  update(dt) {},

  // 只在两个碰撞体开始接触时被调用一次
  onBeginContact: function (contact, selfCollider, otherCollider) {
    this.node.emit("onBeginContactEvent", contact, selfCollider, otherCollider);
  },

  // 只在两个碰撞体结束接触时被调用一次
  onEndContact: function (contact, selfCollider, otherCollider) {
    this.node.emit("onEndContactEvent", contact, selfCollider, otherCollider);
  },

  // 每次将要处理碰撞体接触逻辑时被调用
  onPreSolve: function (contact, selfCollider, otherCollider) {
    this.node.emit("onPreSolveEvent", contact, selfCollider, otherCollider);
  },

  // 每次处理完碰撞体接触逻辑时被调用
  onPostSolve: function (contact, selfCollider, otherCollider) {
    this.node.emit("onPostSolveEvent", contact, selfCollider, otherCollider);
  },
});
