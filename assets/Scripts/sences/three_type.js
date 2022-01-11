import collider from "../components/collider";

cc.Class({
  extends: cc.Component,

  properties: {
    background: {
      default: null,
      type: cc.Node,
    },
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    let _this = this;
    //开始释放 到碰撞结束才生成新的预制体，期间不能有任何操作的标志
    _this.stop_opration_flag = false;
    //定义音频管理器组件
    let audio_manage = cc.find("manage/audio_manage");
    if (audio_manage) {
      _this.audio_manage = audio_manage.getComponent("audio_manage");
    }
    //播放bg
    _this.audio_manage.playThreeTypeBg();
    //开启
    cc.director.getPhysicsManager().enabled = true;
    //设置重力加速度 下降640世界单位/秒
    cc.director.getPhysicsManager().gravity = cc.v2(0, -1920);
    // 加载粒子
    cc.resources.load("prefab/fruit_boom", function (err, prefab) {
      //爆炸粒子预制
      _this.fruit_boom = cc.instantiate(prefab);
    });
    // 加载目录下所有 预制体，并且获取它们的路径
    new Promise((resolve, reject) => {
      cc.resources.loadDir("prefab/fruit", cc.Prefab, function (err, prefabs) {
        resolve(prefabs);
      });
    }).then((res) => {
      //根据name赋值给指定精灵数组的索引 不然打包后顺序错乱Bug
      _this.prefabs = res;
      _this.prefabs.sort((a, b) => Number(a.name) - Number(b.name));
      //默认生成一个预制体
      _this.generatePrefab();
      //注册canvas点击事件，点击时改变预制体位置并设置其动态运动
      _this.node.on(
        "touchstart",
        function (e) {
          let w_pos = e.getLocation();
          _this.changePrefabPosition(w_pos);
        },
        _this
      );
      _this.node.on(
        "touchmove",
        function (e) {
          let w_pos = e.getLocation();
          _this.changePrefabPosition(w_pos);
        },
        _this
      );
      _this.node.on(
        "touchend",
        function (e) {
          _this.changePrefabDynamic();
        },
        _this
      );
      _this.node.on(
        "touchcancel",
        function (e) {
          _this.changePrefabDynamic();
        },
        _this
      );
    });
  },

  start() {},

  update(dt) {},

  onDestroy() {
    let _this = this;
    //停止播放bg
    _this.audio_manage._stopMusic();
  },

  /**
   *  生成水果预制体
   */
  generatePrefab() {
    let _this = this;
    //单例模式
    if (_this.current_fruit_perfab) {
      return;
    }
    //从前面5个随机取一个 生成一个预制体
    let index = Math.floor(Math.random() * 4);
    _this.current_fruit_perfab = cc.instantiate(_this.prefabs[index]);
    //这里可以复制每个预制体的自定义属性
    //ToDo
    //获取起点区域
    let start_pos = cc.v2(
      cc.view.getVisibleSize().width / 2,
      cc.view.getVisibleSize().height -
        120 -
        _this.current_fruit_perfab.height / 2
    );
    //放置到顶部中心
    _this.background.addChild(_this.current_fruit_perfab);
    start_pos =
      _this.current_fruit_perfab.parent.convertToNodeSpaceAR(start_pos);
    _this.current_fruit_perfab.setPosition(start_pos);
    //可以进行操作
    _this.stop_opration_flag = false;
  },

  /**
   * 改变预制体起始位置
   * @param {cc.v2} w_pos 点击时世界坐标
   */
  changePrefabPosition(w_pos) {
    let _this = this;
    //不能操作
    if (_this.stop_opration_flag) {
      return;
    }
    let screen_width = cc.view.getVisibleSize().width;
    //获取原图大小
    const { width: origin_width } = _this.current_fruit_perfab.getContentSize();
    let scale_width = origin_width * _this.current_fruit_perfab.scale;
    //限制拖动范围
    if (w_pos.x + scale_width / 2 > screen_width) {
      w_pos.x = screen_width - scale_width / 2;
    }
    if (w_pos.x - scale_width / 2 < 0) {
      w_pos.x = scale_width / 2;
    }
    //转换成预制体坐标
    let l_pos = _this.current_fruit_perfab.parent.convertToNodeSpaceAR(w_pos);
    let start_pos = cc.v2(l_pos.x, _this.current_fruit_perfab.y);
    _this.current_fruit_perfab.setPosition(start_pos);
  },

  /**
   * 预制体开始释放
   */
  changePrefabDynamic() {
    let _this = this;
    //不能操作
    if (_this.stop_opration_flag) {
      return;
    }
    //开始释放 到碰撞结束才生成新的预制体，期间不能有任何操作
    _this.stop_opration_flag = true;

    let rigid_body = _this.current_fruit_perfab.getComponent(cc.RigidBody);
    rigid_body.type = cc.RigidBodyType.Dynamic;

    //是否已经生成标志
    let is_generate = false;
    //预制体碰撞检测
    _this.current_fruit_perfab.on(
      "onBeginContactEvent",
      (contact, selfCollider, otherCollider) => {
        //只播放一次碰撞声音 掉落第一次的声音
        if (!selfCollider.node.is_fall_off && !otherCollider.node.is_fall_off) {
          selfCollider.node.is_fall_off = true;
          _this.audio_manage.playCollideEffect();
        }
        //判断对象类型 类型一样的进行合并 播放合并粒子动画 删除2个对象 生成新的对象
        if (selfCollider.name == otherCollider.name) {
          //记录碰撞点世界坐标
          let world_manifold = contact.getWorldManifold();
          let collide_w_pos = world_manifold.points[0];
          if (
            !selfCollider.node.is_colliding &&
            !otherCollider.node.is_colliding
          ) {
            //只执行一次
            selfCollider.node.is_colliding = true;
            //生成一个大的放进去
            _this.generateBigPrefab(
              collide_w_pos,
              parseInt(selfCollider.name) + 1
            );
          }
          //播放爆炸音效
          _this.audio_manage.playCollideBoomEffect();
          //摧毁各自碰撞的2个预制体
          selfCollider.node.destroy();
          //播放粒子动画 设置层级防止挡住
          _this.fruit_boom.setSiblingIndex(101);
          _this.fruit_boom.setParent(_this.background);
          let start_pos =
            _this.fruit_boom.parent.convertToNodeSpaceAR(collide_w_pos);
          _this.fruit_boom.setPosition(start_pos);
          //播放粒子
          let ParticleSystem = _this.fruit_boom.getComponent(cc.ParticleSystem);
          //重置粒子系统(播放粒子)
          ParticleSystem.resetSystem();
        }
        if (!is_generate) {
          is_generate = true;
          //清除之前的预制体
          _this.current_fruit_perfab = null;
          //只生成一个新的预制体
          _this.generatePrefab();
        }
      }
    );
  },

  /**
   * 生成大的预制体 这里已经是递归了碰撞了
   * @param {cc.v2} collide_w_pos 碰撞点世界坐标
   * @param {int} index 生成索引
   * @returns
   */
  generateBigPrefab(collide_w_pos, index) {
    let _this = this;
    let fruit_perfab = cc.instantiate(_this.prefabs[index]);
    //这里可以复制每个预制体的自定义属性
    //ToDo
    //放置到碰撞位置
    _this.background.addChild(fruit_perfab);
    start_pos = fruit_perfab.parent.convertToNodeSpaceAR(collide_w_pos);
    fruit_perfab.setPosition(start_pos);

    //赋予物理属性
    let rigid_body = fruit_perfab.getComponent(cc.RigidBody);
    rigid_body.type = cc.RigidBodyType.Dynamic;

    //开启碰撞回调
    fruit_perfab.on(
      "onBeginContactEvent",
      (contact, selfCollider, otherCollider) => {
        //判断对象类型 类型一样的进行合并 播放合并粒子动画 删除2个对象 生成新的对象
        if (selfCollider.name == otherCollider.name) {
          //记录碰撞点世界坐标
          let world_manifold = contact.getWorldManifold();
          let collide_w_pos = world_manifold.points[0];
          if (
            !selfCollider.node.is_colliding &&
            !otherCollider.node.is_colliding
          ) {
            //只执行一次
            selfCollider.node.is_colliding = true;
            //生成一个大的放进去
            _this.generateBigPrefab(
              collide_w_pos,
              parseInt(selfCollider.name) + 1
            );
          }
          //摧毁各自碰撞的2个预制体
          selfCollider.node.destroy();
          //播放粒子动画 设置层级防止挡住
          _this.fruit_boom.setSiblingIndex(101);
          _this.fruit_boom.setParent(_this.background);
          let start_pos =
            _this.fruit_boom.parent.convertToNodeSpaceAR(collide_w_pos);
          _this.fruit_boom.setPosition(start_pos);
          //播放粒子
          let ParticleSystem = _this.fruit_boom.getComponent(cc.ParticleSystem);
          //重置粒子系统(播放粒子)
          ParticleSystem.resetSystem();
        }
      }
    );
  },
});
