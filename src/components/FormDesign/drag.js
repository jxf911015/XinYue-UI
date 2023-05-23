import $ from 'jquery'
//拖拽
let drag = {
  class_name: '', // 允许放置的容器
  _x: 0, // 节点x坐标
  _y: 0, // 节点y坐标
  _left: 0, // 光标与节点坐标的距离
  _top: 0, // 光标与节点坐标的距离
  old_elm: undefined, // 拖拽原节点
  tmp_elm: undefined, // 跟随光标移动的临时节点
  start_time: undefined,
  column_number: 3,
  avg_width: 0,
  transformX: 0,
  transformY: 0,
  nextTX: 0,
  nextTY: 0,
  lastBarX: 0,
  lastBarY: 0,
  // 初始化
  init: function (className) {
    let self = this;
    // 允许拖拽节点的父容器的classname(可按照需要，修改为id或其他)
    self.class_name = className;
    //默认每列宽度
    self.avg_width = parseFloat($('.' + self.class_name).width() / 3).toFixed(0);
    console.log('avg_width:' + self.avg_width);
    // 监听鼠标按下事件，动态绑定要拖拽的节点（因为节点可能是动态添加的）
    $(document).delegate(".sense-control", "mousedown", function (event) {
      event.stopPropagation();// 阻止冒泡
      if (event.button == 0) {
        // 获取到拖拽的原节点对象
        self.old_elm = $(this);
        let start_time_interval = null;
        // 监听鼠标放开
        $(document).delegate("body", "mouseup", function (event) {
          // 执行拖拽结束后的操作
          self.mouseup(event);
          // clear start_time_interval
          if (start_time_interval) {
            clearInterval(start_time_interval);
          }
          return false;
        });

        self.start_time = new Date().getTime();
        start_time_interval = window.setInterval(function () {
          var end_time = new Date().getTime();
          if (end_time - self.start_time >= 200) {
            // 监听鼠标移动
            $(document).delegate("body", "mousemove", function (event) {
              self.mousemove(event)
              return false;
            });
            // clear start_time_interval
            clearInterval(start_time_interval);

            // 执行开始拖拽的操作
            self.mousedown(event);
          }
        }, 100);

      }
      return false;
    });
  },
  // 按下鼠标 执行的操作
  mousedown: function (event) {

    let self = this;

    // 1.克隆临时节点，跟随鼠标进行移动
    self.tmp_elm = $(self.old_elm);

    let e = event || window.event;

    // 2.计算 节点 和 光标 的坐标
    self._x = e.pageX;
    self._y = e.pageY;

    self._left = e.pageX - self._x;
    self._top = e.pageY - self._y;

    self.transformX = parseInt($(self.tmp_elm).css('transform').replace(/[^0-9\-,]/g, '').split(',')[4]);
    self.transformY = parseInt($(self.tmp_elm).css('transform').replace(/[^0-9\-,]/g, '').split(',')[5]);

    // 3.修改克隆节点的坐标，实现跟随鼠标进行移动的效果
    $(self.tmp_elm).css({
      'transform': 'translate(' + self.transformX + 'px,' + self.transformY + 'px)',
      'zIndex': 9999
    });
    $(self.tmp_elm).addClass('sense-control-drag');
  },

  // 移动鼠标 执行的操作
  mousemove: function (event) {
    let self = this;
    // 2.计算坐标
    var e = event || window.event;
    var x = e.pageX - self._x;
    var y = e.pageY - self._y;
    var maxL = $('.' + self.class_name).outerWidth() - $(self.old_elm).outerWidth();
    // 不允许超出浏览器范围
    x = (x + self.transformX) < 0 ? -self.transformX : x;
    y = (y + self.transformY) < 0 ? -self.transformY : y;
    // 3.修改克隆节点的坐标
    let tx = (parseInt(x) + parseInt(self.transformX)) < 0 ? 0 : (parseInt(x) + parseInt(self.transformX));
    let ty = (y + self.transformY) < 0 ? 0 : (y + self.transformY);

    if (tx > maxL) {
      tx = maxL;
    }
    let editor = $('.' + self.class_name);
    // 判断当前容器是否允许放置节点
    $.each(editor, function (index, value) {
      // 获取容器的坐标范围 (区域)
      let box_x = $(value).offset().left; // 容器左上角x坐标
      let box_y = $(value).offset().top; // 容器左上角y坐标
      let box_width = $(value).outerWidth(); // 容器宽
      let box_height = $(value).outerHeight();// 容器高

      self.nextTx = self._left;
      let roundNum = Math.round(tx / self.avg_width);
      self.nextTx = roundNum * self.avg_width;
      self.nextTy = self.getNextTransformY(self.nextTx, ty);
      if ($('.demo-bar').length == 0) {
        let demoBar = $('<div class="demo-bar" style="height:6px;border-radius: 4px;background:#01AAED;"></div>');
        demoBar.css('width', self.avg_width * self.tmp_elm.attr('field_column'));
        demoBar.css('transform', 'translate(' + self.nextTx + 'px, ' + self.nextTy + 'px)');
        editor.append(demoBar);
      } else {
        let demoBar = $('.demo-bar');
        demoBar.css('transform', 'translate(' + self.nextTx + 'px, ' + self.nextTy + 'px)');
      }
      $(self.tmp_elm).css({
        'transform': 'translate(' + tx + 'px,' + ty + 'px)'
      });

      self.resize();
    });
  },
  /**获取当前列的Y轴*/
  getNextTransformY(currentTx, dragTy) {
    let self = this;
    let nextY = 0;
    let minY = 0;
    let maxY = 0;
    let grid = self.getGridCache();
    let columnIndex = currentTx / self.avg_width;
    let arr = grid[columnIndex];
    for (let i in arr) {
      let obj = arr[i];
      if (obj.id != self.tmp_elm.attr('id')) {
        let tx = obj.tx;
        if (currentTx == tx) {
          let ty = obj.ty;
          let height = obj.height;
          let heightY = parseInt(ty) + parseInt(height);
          if (minY > ty) {
            minY = ty;
          }
          if (maxY < heightY) {
            maxY = heightY;
          }
          if (dragTy > ty && dragTy <= heightY) {
            nextY = heightY;
            return nextY;
          }
        }
      }
    }
    if (dragTy <= minY) {
      return minY;
    } else if (dragTy >= maxY) {
      return maxY;
    }
    return nextY;
  },
  // 放开鼠标 执行的操作
  mouseup: function (event) {
    let self = this;
    let bar = $('.demo-bar');
    self.tmp_elm.css({'transform': 'translate(' + self.nextTx + 'px,' + self.nextTy + 'px)', 'zIndex': 1});
    $('.sense-control').css({'transition-duration': ''});
    $(self.tmp_elm).removeClass('sense-control-drag');
    bar.remove();
    $(document).undelegate("body", "mousemove");
    $(document).undelegate("body", "mouseup");
  },
  resize: function (newObj) {
    let editorHeight = 0;
    let self = this;
    let barTy = 0;
    let barTx = 0;
    let id = undefined;
    let grid = self.getGridCache();
    let currentHeight = 0;

    if (newObj == undefined) {
      barTy = self.getTransformY($('.demo-bar'));
      barTx = self.getTransformX($('.demo-bar'));
      id = self.tmp_elm.attr('id');
      if (self.lastBarX == barTx && self.lastBarY == barTy) {
        return;
      }
      self.lastBarX = barTx;
      self.lastBarY = barTy;
    } else {
      id = newObj.attr('id');
    }

    for (let key in grid) {
      let arr = grid[key];
      for (let i = 0; i < arr.length; i++) {
        let obj = arr[i];
        if (obj.id == id) {
          if (!obj.virtual) {
            obj.tx = barTx;
          }
          obj.ty = barTy;
          if (i != 0) {
            let temp = arr[0];
            arr[0] = obj;
            arr[i] = temp;
          }
        }
      }
    }
    //进行元素排序
    for (let key in grid) {
      let arr = grid[key];
      for (let i = 0; i < arr.length - 1; i++) {
        // 内层循环,控制比较的次数，并且判断两个数的大小
        for (let j = 0; j < arr.length - 1 - i; j++) {
          // 如果前面的数大，放到后面(当然是从小到大的冒泡排序)
          if (arr[j].ty > arr[j + 1].ty) {
            let temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
          }
        }
      }
    }

    //重新排版
    let mrow = {};
    for (let key in grid) {
      let arr = grid[key];
      for (let i = 0; i <= arr.length - 1; i++) {
        let obj = arr[i];
        let newTy = 0;
        if (arr.length > 0) {
          if (i == 0) {
            if (obj.id != id) {
              arr[i].ty = newTy;
            }
          } else {
            if (obj.id != id) {
              newTy = parseInt(arr[i - 1].ty) + parseInt(arr[i - 1].height);
              arr[i].ty = newTy;
            }
          }
        } else if (arr.length == 1) {
          if (obj.id != id) {
            arr[i].ty = newTy;
          }
        }
        //多行取最大
        if (!mrow[obj.id]) {
          mrow[obj.id] = newTy;
        } else {
          if (newTy > mrow[obj.id]) {
            mrow[obj.id] = newTy;
          }
        }
      }
    }
    for (let key in grid) {
      let arr = grid[key];
      for (let i = 0; i <= arr.length - 1; i++) {
        let obj = arr[i];
        if (obj.id != id && mrow[obj.id] && obj.ty != mrow[obj.id]) {
          obj.ty = mrow[obj.id];
          for (let j = i + 1; j < arr.length; j++) {
            arr[j].ty = parseInt(arr[j].ty) + parseInt(arr[i].height);
          }
          break;
        }
      }
    }
    //重新排版
    for (let key in grid) {
      let arr = grid[key];
      for (let i = 0; i <= arr.length - 1; i++) {
        let obj = arr[i];
        if (!obj.virtual) {
          let dom = $('.sense-control').filter('[id=' + obj.id + ']');
          dom.css({'transform': 'translate(' + obj.tx + 'px,' + obj.ty + 'px)'});
        }

        let currentHeight = parseInt(obj.ty) + parseInt(obj.height);
        if (editorHeight < currentHeight) {
          editorHeight = currentHeight;
        }
      }
    }
    //编辑框高度
    $('.' + self.class_name).height(editorHeight);
  },
  /**获取X轴*/
  getTransformX(element) {
    return parseInt(element.css('transform').replace(/[^0-9\-,]/g, '').split(',')[4]);
  },
  /**获取Y轴*/
  getTransformY(element) {
    return parseInt(element.css('transform').replace(/[^0-9\-,]/g, '').split(',')[5]);
  },
  /**初始化表格缓存*/
  getGridCache() {
    let self = this;
    let grid = [];
    $('.sense-control').each(function (index, element) {
      let obj = $(this);
      let id = obj.attr('id');
      let tx = 0;
      let ty = 0;
      if ($('.demo-bar').length != 0 && self.tmp_elm.attr('id') == id) {
        tx = self.getTransformX($('.demo-bar'));
        ty = self.getTransformY($('.demo-bar'));
      } else {
        tx = self.getTransformX(obj);
        ty = self.getTransformY(obj);
      }
      let height = obj.outerHeight();
      let column = obj.attr('field_column');
      let name = obj.attr('field_name');
      let columnIndex = tx / self.avg_width;
      if (!grid[columnIndex]) {
        grid[columnIndex] = [];
      }
      let cell = {};
      cell.id = id;
      cell.tx = tx;
      cell.ty = ty;
      cell.height = height;
      cell.column = column;
      cell.name = name;
      cell.columnIndex = columnIndex + 1;
      cell.virtual = false;
      grid[columnIndex].push(cell);
      //解析多行元素
      if (column > 1) {
        for (let i = 1; i < column; i++) {
          if (!grid[columnIndex + i]) {
            grid[columnIndex + i] = [];
          }
          cell = {};
          cell.id = id;
          cell.tx = self.avg_width * (columnIndex + i);
          cell.ty = ty;
          cell.height = height;
          cell.column = column;
          cell.name = name;
          cell.columnIndex = columnIndex + i + 1;
          cell.virtual = true;
          grid[columnIndex + i].push(cell);
        }
      }
    })
    //排序行
    let rows = {};
    for (let key in grid) {
      let arr = grid[key];
      for (let i = 0; i < arr.length - 1; i++) {
        // 内层循环,控制比较的次数，并且判断两个数的大小
        for (let j = 0; j < arr.length - 1 - i; j++) {
          // 白话解释：如果前面的数大，放到后面(当然是从小到大的冒泡排序)
          if (arr[j].ty > arr[j + 1].ty) {
            let temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
          }
        }
      }
    }
    return grid;
  }

};

export default drag;
