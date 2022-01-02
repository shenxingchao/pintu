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
    audio_manage: {
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
      audio_manage = audio_manage.getComponent("audio_manage");
    }

    //读取常驻节点属性关卡属性
    let pass_index = cc.director.getScene().getChildByName("pass_node")
      ? cc.director.getScene().getChildByName("pass_node").pass_index
      : 0;
    //加载这个关卡需要用到的资源
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

          //设置底图精灵贴图
          _this.game_background.getComponent(cc.Sprite).spriteFrame = res.find(
            (item) => item.name == "background"
          );
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
            //设置尺寸模式为原图模式  如果要设置尺寸需要设置为自定义尺寸
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
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
              let pos_source = node.parent.convertToWorldSpaceAR(node.position);
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
              } else {
                //播放叮音效
                if (audio_manage) {
                  audio_manage.playDingEffect();
                  if (_this.tool_bar_box.children.length == 0) {
                    //播放游戏结束，挑战成功音效
                    audio_manage.playGameSuccessEffect();
                  }
                }
              }
              _this.game_background.getChildByName("shadow" + i).active = false;
            };

            node.on("touchstart", onTouchDown, this);
            node.on("touchmove", onTouchMove, this);
            node.on("touchend", onTouchUp, this);
            node.on("touchcancel", onTouchUp, this);
          }
          //添加精灵到拖动工具条内部直到添加完或者拖动项为3
          _this._initSpriteItem();
        }
      );
    });
  },

  start() {},

  // update (dt) {},

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
        this._initSpriteItem();
      } else {
        return false;
      }
    }
  },
});
