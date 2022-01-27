cc.Class({
  extends: cc.Component,

  properties: {
    game_background: {
      default: null,
      type: cc.Node,
      displayName: "底图",
    },
    tool_bar_box: {
      default: null,
      type: cc.Node,
      displayName: "底部工具条",
    },
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    let _this = this;
    //定义音频管理器组件
    let audio_manage = cc.find("manage/audio_manage");
    if (audio_manage) {
      _this.audio_manage = audio_manage.getComponent("audio_manage");
    }
    _this.audio_manage.playGameBg();
    //全局音效播放队列
    _this.audio_queue = [];

    //读取常驻节点属性关卡属性
    let pass_index = cc.director.getScene().getChildByName("pass_node")
      ? cc.director.getScene().getChildByName("pass_node").pass_index
      : 0;
    //加载这个关卡需要用到的资源
    //加载气球资源
    cc.resources.loadDir(
      "texture/balloon",
      cc.SpriteFrame,
      function (err, assets) {
        _this.balloon_list = assets;
        //排序不然加载顺序有问题
        _this.balloon_list.sort((a, b) => Number(a.name) - Number(b.name));
      }
    );

    // 加载 气球 Prefab
    cc.resources.load("prefab/balloon", function (err, prefab) {
      _this.balloon_prefab = prefab;
    });

    // 加载目录下所有 SpriteFrame，并且获取它们的路径
    new Promise((resolve, reject) => {
      cc.resources.loadDir(
        "texture/one_type/pass" + pass_index,
        cc.SpriteFrame,
        function (err, assets) {
          resolve(assets);
        }
      );
    }).then((res) => {
      //加载Json
      let map_array = [];
      cc.resources.load(
        "texture/one_type/pass" + pass_index + "/map",
        cc.JsonAsset,
        function (err, asset) {
          map_array = asset.json;
          // 加载 星星粒子 Prefab
          cc.resources.load("prefab/star", function (err, prefab) {
            //星星粒子预制
            let start_perfab = cc.instantiate(prefab);
            //设置底图精灵贴图
            _this.game_background.getComponent(cc.Sprite).spriteFrame =
              res.find((item) => item.name == "background");
            //根据name赋值给指定精灵数组的索引 不然打包后顺序错乱Bug
            let sprite_array = [];
            res.forEach((item) => {
              if (item.name !== "background") {
                sprite_array[parseInt(item.name)] = item;
              }
            });

            //循环添加阴影图,并设置每个节点的索引序号
            for (let i = 0; i < map_array.length; i++) {
              //创建节点  名称为黑色阴影图加索引
              let node = new cc.Node("shadow" + i);
              //设置开始不可见
              node.active = false;
              //设置序号
              node.index = i;
              //设置位置属性
              node.setPosition(map_array[i].x, map_array[i].y);
              //设置缩放属性
              node.setScale(map_array[i].scale_x, map_array[i].scale_y);
              //添加精灵组件使之成为精灵
              let sprite = node.addComponent(cc.Sprite);
              //设置精灵贴图
              sprite.spriteFrame = sprite_array[i];
              //设置混合模式 这样就变成黑图了
              sprite.srcBlendFactor = cc.macro.BlendFactor.ZERO;
              //添加到父节点里面
              _this.game_background.addChild(node);
            }

            //获取底部工具条的宽度和高度 设置默认拖动项的宽高
            _this.tool_item_width = (_this.tool_bar_box.width - 2 * 10) / 3;
            _this.tool_item_height = _this.tool_item_width;
            //设置拖动项精灵
            _this.drag_items = [];
            for (let i = 0; i < map_array.length; i++) {
              //创建节点  名称为原图加索引
              let node = new cc.Node("source" + i);
              //添加精灵组件使之成为精灵
              let sprite = node.addComponent(cc.Sprite);
              //设置精灵贴图
              sprite.spriteFrame = sprite_array[i];
              //设置为自定义尺寸
              sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
              //获取原图大小
              const { width: origin_width, height: origin_height } =
                node.getContentSize();
              //假设宽高最多为250 自适应图片宽高
              if (sprite.width > sprite.height) {
                node.width = 250;
                node.height = (250 * origin_height) / origin_width;
              } else {
                node.width = (250 * origin_width) / origin_height;
                node.height = 250;
              }
              //添加到拖动精灵组
              _this.drag_items.push(node);
              //给每个节点添加拖动事件  拖动时显示对应阴影图

              //定义按下回调
              let node_pos = null;
              //阴影图
              let shadow_node = _this.game_background.getChildByName(
                "shadow" + i
              );
              //设置拖动成功标志
              _this.drag_on_flag = false;
              let onTouchDown = function (e) {
                //设置拖动成功标志
                _this.drag_on_flag = false;
                //拖动开始，记录初始位置
                node_pos = e.getLocation();
                //设置其父节点为根节点
                node.setParent(_this.node);
                //设置尺寸模式为原图模式
                sprite.sizeMode = cc.Sprite.SizeMode.RAW;
                //设置其大小为阴影图缩放大小
                node.setScale(shadow_node.scaleX, shadow_node.scaleY);
                //显示阴影图
                shadow_node.active = true;
                //设置初始x,y
                node.setPosition(
                  node.parent.convertToNodeSpaceAR(node_pos).x,
                  node.parent.convertToNodeSpaceAR(node_pos).y + 200
                );
              };

              //定义拖动回调
              let onTouchMove = function (e) {
                let delta = e.getDelta();
                node.x += delta.x;
                node.y += delta.y;
                //判断2个物体中心距离 都转换成世界坐标
                let pos_source = node.parent.convertToWorldSpaceAR(
                  node.position
                );
                let pos_shadow = shadow_node.parent.convertToWorldSpaceAR(
                  shadow_node.position
                );
                let distance = Math.sqrt(
                  Math.abs(
                    Math.pow(pos_source.y - pos_shadow.y, 2) +
                      Math.pow(pos_source.x - pos_shadow.x, 2)
                  )
                );
                //算错了这个距离
                if (distance < 20) {
                  //拖拽成功
                  _this.drag_on_flag = true;
                  //放置止到阴影位置
                  node.setParent(_this.game_background);
                  node.setPosition(shadow_node.position);
                  //生成拖动项
                  _this._initSpriteItem();
                } else {
                  _this.drag_on_flag = false;
                }
              };

              //定义松开回调
              let onTouchUp = function () {
                if (!_this.drag_on_flag) {
                  // 还原到原来的数组
                  node.setParent(_this.tool_bar_box);
                  node.setPosition(0, 0);
                  node.setScale(1, 1);
                  //设置为自定义尺寸
                  sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                  //获取原图大小
                  const { width: origin_width, height: origin_height } =
                    node.getContentSize();
                  //假设宽高最多为250 自适应图片宽高
                  if (sprite.width > sprite.height) {
                    node.width = 250;
                    node.height = (250 * origin_height) / origin_width;
                  } else {
                    node.width = (250 * origin_width) / origin_height;
                    node.height = 250;
                  }
                } else {
                  //播放叮音效
                  if (_this.audio_manage) {
                    _this.audio_manage.playDingEffect();
                    if (_this.tool_bar_box.children.length == 0) {
                      //停止背景音乐播放
                      _this.audio_manage._stopMusic();
                      //播放游戏结束，挑战成功音效
                      _this.audio_manage.playGameSuccessEffect();
                      setTimeout(() => {
                        //播放气球背景音乐
                        _this.audio_manage.playBalloobBg();
                        //气球升起来
                        _this.playBalloonTween();
                      }, 4200);
                    }
                  }
                  //播放粒子动画 设置层级防止挡住
                  start_perfab.setSiblingIndex(101);
                  start_perfab.x = node.x;
                  start_perfab.y = node.y;
                  start_perfab.setParent(_this.game_background);
                  //播放粒子
                  let ParticleSystem = start_perfab.getComponent(
                    cc.ParticleSystem
                  );
                  //重置粒子系统(播放粒子)
                  ParticleSystem.resetSystem();
                  //移除触摸监听 不能在放下来了
                  node.off("touchstart", onTouchDown, _this);
                  node.off("touchmove", onTouchMove, _this);
                  node.off("touchend", onTouchUp, _this);
                  node.off("touchcancel", onTouchUp, _this);
                }
                shadow_node.active = false;
              };

              node.on("touchstart", onTouchDown, _this);
              node.on("touchmove", onTouchMove, _this);
              node.on("touchend", onTouchUp, _this);
              node.on("touchcancel", onTouchUp, _this);
            }
            //添加精灵到拖动工具条内部直到添加完或者拖动项为3
            _this._initSpriteItem();
          });
        }
      );
    });
  },

  start() {},

  update(dt) {
    let _this = this;
    //气球爆炸音频队列处理
    if (_this.audio_queue.length > 0 && !_this.is_playing_effect) {
      _this.is_playing_effect = true;
      _this.audio_queue.shift();
      _this.audio_manage.playBalloonBoomEffect();
      setTimeout(() => {
        _this.is_playing_effect = false;
      }, 200);
    }
  },
  onDestroy() {
    let _this = this;
    //移除计时器
    clearInterval(_this.interval);
  },

  /**
   * 放置工具条内部的精灵
   */
  _initSpriteItem() {
    let _this = this;
    let children = _this.tool_bar_box.children;
    if (children.length < 3 && _this.drag_items.length > 0) {
      //随机取一个
      let index = Math.floor(Math.random() * _this.drag_items.length);
      let node = _this.drag_items[index];
      _this.drag_items.splice(index, 1);

      //添加到父节点里面
      _this.tool_bar_box.addChild(node);
      //递归生成
      if (children.length < 3 && _this.drag_items.length > 0) {
        _this._initSpriteItem();
      } else {
        return false;
      }
    }
  },

  /**
   * 播放气球升起动画
   */
  playBalloonTween() {
    let _this = this;
    //气球对象池
    let balloon_pool = new cc.NodePool();
    let initCount = 10;
    for (let i = 0; i < initCount; ++i) {
      let balloon_perfab = cc.instantiate(_this.balloon_prefab);
      balloon_pool.put(balloon_perfab); // 通过 put 接口放入对象池
    }

    //生成20个气球
    let balloon_number = 0;
    //屏幕宽高
    let screen_width = cc.view.getVisibleSize().width;
    let screen_height = cc.view.getVisibleSize().height;
    //计时器，每隔0.5秒生成气球
    _this.interval = setInterval(() => {
      //气球
      let balloon = null;
      let sprite = null;
      let index = 0;
      //随机位置
      let x = 0;
      let pos = null;
      if (balloon_pool.size() > 0) {
        // 通过 size 接口判断对象池中是否有空闲的对象
        balloon = balloon_pool.get();
        balloon.off("touchstart", onTouchDown, _this);
      } else {
        balloon = cc.instantiate(_this.balloon_prefab);
      }
      //气球按下事件
      let onTouchDown = function (e) {
        //播放戳破音效
        _this.audio_queue.push("balloon_boom");
        //回收
        balloon_pool.put(balloon);
      };

      //赋值贴图
      sprite = balloon.getComponent(cc.Sprite);
      //随机贴图
      index = Math.floor(Math.random() * _this.balloon_list.length);
      sprite.spriteFrame = _this.balloon_list[index];
      //防止到容器内容
      balloon.setParent(_this.node);
      //随机x位置
      x = Math.random() * screen_width;
      if (x < balloon.width / 2) {
        x = balloon.width / 2;
      } else if (x > screen_width - balloon.width / 2) {
        x = screen_width - balloon.width / 2;
      }
      pos = cc.v2(x, -balloon.height / 2);
      balloon.setPosition(balloon.parent.convertToNodeSpaceAR(pos));
      //tween动画
      cc.tween(balloon)
        .by(4, { position: cc.v2(0, screen_height + balloon.height) })
        .start();
      //戳破事件 直接回收到对象池
      balloon.on("touchstart", onTouchDown, _this);

      //生成20个气球
      if (balloon_number > 20) {
        setTimeout(() => {
          //移除计时器
          clearInterval(_this.interval);
          //清除对象池
          balloon_pool.clear();
        }, 4000);
      }
      balloon_number++;
    }, 500);
  },
});
