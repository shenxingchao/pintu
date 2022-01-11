cc.Class({
  extends: cc.Component,

  properties: {
    background: {
      default: null,
      type: cc.Node,
    },
    score: {
      default: null,
      type: cc.Label,
    },
    //工具栏  用于碰到工具栏游戏结束
    top_button: {
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
    //全局音效播放队列
    _this.audio_queue = [];
    //连击队列
    _this.hit_queue = [];
    //开启
    cc.director.getPhysicsManager().enabled = true;
    //设置重力加速度 下降640世界单位/秒
    cc.director.getPhysicsManager().gravity = cc.v2(0, -1920);
    // 加载粒子
    cc.resources.load("prefab/fruit_boom", function (err, prefab) {
      //爆炸粒子预制
      _this.fruit_boom = cc.instantiate(prefab);
    });
    // 加载连击数
    cc.resources.load("prefab/hit", function (err, prefab) {
      _this.hit = prefab;
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

    //游戏结束
    _this.top_button.on(
      "onBeginContactEvent",
      (contact, selfCollider, otherCollider) => {
        cc.director.loadScene("three_type");
      }
    );
  },

  start() {
    let _this = this;
    //初始化游戏数据
    _this.score.string = 0;
    _this.hit_number = 0;
    //配置游戏得分策略和爆炸颜色
    _this.options = [
      {
        score: 10,
        color: new cc.Color().fromHEX("#8844D0"),
      },
      {
        score: 20,
        color: new cc.Color().fromHEX("#FF772D"),
      },
      {
        score: 30,
        color: new cc.Color().fromHEX("#E93738"),
      },
      {
        score: 50,
        color: new cc.Color().fromHEX("#F33D49"),
      },
      {
        score: 100,
        color: new cc.Color().fromHEX("#AAE733"),
      },
      {
        score: 200,
        color: new cc.Color().fromHEX("#FEDA1C"),
      },
      {
        score: 300,
        color: new cc.Color().fromHEX("#FABE44"),
      },
      {
        score: 500,
        color: new cc.Color().fromHEX("#9548C6"),
      },
      {
        score: 1000,
        color: new cc.Color().fromHEX("#8EA931"),
      },
      {
        score: 2000,
        color: new cc.Color().fromHEX("#C7F121"),
      },
      {
        score: 3000,
        color: new cc.Color().fromHEX("#E9655D"),
      },
      {
        score: 5000,
        color: new cc.Color().fromHEX("#DABA2A"),
      },
      {
        score: 10000,
        color: new cc.Color().fromHEX("#FCEE30"),
      },
      {
        score: 20000,
        color: new cc.Color().fromHEX("#176301"),
      },
    ];
  },

  update(dt) {
    let _this = this;
    //音频队列处理
    if (_this.audio_queue.length > 0 && !_this.is_playing_effect) {
      _this.is_playing_effect = true;
      let audio_type = _this.audio_queue.shift();
      if (audio_type == "Collide") {
        _this.audio_manage.playCollideEffect();
      } else if (audio_type == "CollideBoom") {
        _this.audio_manage.playCollideBoomEffect();
      }
      setTimeout(() => {
        _this.is_playing_effect = false;
      }, 100);
    }
    //连击队列处理
    if (_this.hit_queue.length > 0 && !_this.is_hiting_effect) {
      _this.is_hiting_effect = true;
      _this.hit_queue.shift();
      _this.showHit();
      setTimeout(() => {
        _this.is_hiting_effect = false;
      }, 200);
    }
  },

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
    let index = Math.floor(Math.random() * 5);
    _this.current_fruit_perfab = cc.instantiate(_this.prefabs[index]);
    //这里可以复制每个预制体的自定义属性
    //ToDo
    //获取起点区域
    let start_pos = cc.v2(
      cc.view.getVisibleSize().width / 2,
      cc.view.getVisibleSize().height -
        150 -
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
    //只播放一次碰撞声音 掉落第一次的声音
    let is_fall_off = false;
    //预制体碰撞检测
    _this.current_fruit_perfab.on(
      "onBeginContactEvent",
      (contact, selfCollider, otherCollider) => {
        //只播放一次碰撞声音 掉落第一次的声音
        if (!is_fall_off) {
          is_fall_off = true;
          _this.audio_queue.push("Collide");
        }
        //判断对象类型 类型一样的进行合并 播放合并粒子动画 删除2个对象 生成新的对象
        let index = parseInt(selfCollider.name);

        if (selfCollider.name == otherCollider.name && index != 10) {
          //记录碰撞点世界坐标
          let world_manifold = contact.getWorldManifold();
          let collide_w_pos = world_manifold.points[0];

          if (
            !selfCollider.node.is_colliding &&
            !otherCollider.node.is_colliding
          ) {
            //只执行一次
            selfCollider.node.is_colliding = true;
            //延迟生成新的
            setTimeout(() => {
              //播放爆炸音效
              _this.audio_queue.push("CollideBoom");
              //播放粒子动画 设置层级防止挡住
              _this.fruit_boom.setSiblingIndex(101);
              _this.fruit_boom.setParent(_this.background);
              let start_pos =
                _this.fruit_boom.parent.convertToNodeSpaceAR(collide_w_pos);
              _this.fruit_boom.setPosition(start_pos);
              //播放粒子
              let ParticleSystem = _this.fruit_boom.getComponent(
                cc.ParticleSystem
              );
              ParticleSystem.startColor = _this.options[index].color;
              ParticleSystem.startColorVar = _this.options[index].color;
              //重置粒子系统(播放粒子)
              ParticleSystem.resetSystem();
              //生成一个大的放进去
              _this.generateBigPrefab(collide_w_pos, index + 1);
              //得分
              _this.changeScore(index);
              //显示连击数
              _this.hit_queue.push("hit");
            }, 50);
          }

          //摧毁各自碰撞的2个预制体
          selfCollider.node.destroy();
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
    let start_pos = fruit_perfab.parent.convertToNodeSpaceAR(collide_w_pos);
    fruit_perfab.setPosition(start_pos);

    //赋予物理属性
    let rigid_body = fruit_perfab.getComponent(cc.RigidBody);
    rigid_body.type = cc.RigidBodyType.Dynamic;

    //开启碰撞回调
    fruit_perfab.on(
      "onBeginContactEvent",
      (contact, selfCollider, otherCollider) => {
        //判断对象类型 类型一样的进行合并 播放合并粒子动画 删除2个对象 生成新的对象
        let index = parseInt(selfCollider.name);

        if (selfCollider.name == otherCollider.name && index != 10) {
          //记录碰撞点世界坐标
          let world_manifold = contact.getWorldManifold();
          let collide_w_pos = world_manifold.points[0];

          if (
            !selfCollider.node.is_colliding &&
            !otherCollider.node.is_colliding
          ) {
            //只执行一次
            selfCollider.node.is_colliding = true;
            //延迟生成新的
            setTimeout(() => {
              //播放爆炸音效
              _this.audio_queue.push("CollideBoom");
              //播放粒子动画 设置层级防止挡住
              _this.fruit_boom.setSiblingIndex(101);
              _this.fruit_boom.setParent(_this.background);
              let start_pos =
                _this.fruit_boom.parent.convertToNodeSpaceAR(collide_w_pos);
              _this.fruit_boom.setPosition(start_pos);
              //播放粒子
              let ParticleSystem = _this.fruit_boom.getComponent(
                cc.ParticleSystem
              );
              ParticleSystem.startColor = _this.options[index].color;
              //重置粒子系统(播放粒子)
              ParticleSystem.resetSystem();
              //生成一个大的放进去
              _this.generateBigPrefab(collide_w_pos, index + 1);
              //得分
              _this.changeScore(index);
              //显示连击数
              _this.hit_queue.push("hit");
            }, 50);
          }

          //摧毁各自碰撞的2个预制体
          selfCollider.node.destroy();
        }
      }
    );
  },

  /**
   * 得分
   * @param {int} index 得分类型
   */
  changeScore(index) {
    let _this = this;
    _this.score.string =
      parseInt(_this.score.string) + _this.options[index].score;
  },

  /**
   * 显示连击数
   */
  showHit() {
    let _this = this;
    let hit = cc.instantiate(_this.hit);
    //计数+1
    _this.hit_number += 1;
    //赋值
    hit
      .getChildByName("hit_label")
      .getChildByName("hit_number")
      .getComponent(cc.Label).string = _this.hit_number;
    hit.setParent(_this.node);
    hit.setPosition(cc.v2(0, -100));
    let t = cc.tween;
    cc.tween(hit)
      // 同时执行两个 cc.tween
      .parallel(
        t().by(1, { scale: -0.5 }),
        t().by(1, { position: cc.v2(0, 400) })
      )
      .start();

    //重置timer
    if (_this.hit_number_reset_timer) {
      clearTimeout(_this.hit_number_reset_timer);
    }

    //销毁
    setTimeout(() => {
      hit.destroy();
    }, 1500);

    //计数重置
    _this.hit_number_reset_timer = setTimeout(() => {
      _this.hit_number = 0;
    }, 3000);
  },
});
