<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            placeholder="请输入模块名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="data"
            show-checkbox
            node-key="id"
            @check-change="checkTree">
          </el-tree>
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <div class="sense-editor" :style="{background:'#F2F2F2'}">
          <!--          <div class="sense-control sense-control-drag" id="ID_5" style="width: 333px; height: 200px; transform: translate(38px, 75px); z-index: 9999;"><div class="sense-control-name">快捷链接</div></div>-->
          <!--          <div class="sense-control" id="a_1001"-->
          <!--               style="transform:translate(16px, 16px);width:378px;position:absolute;height:200px;">-->
          <!--            <div class="sense-control-name">A测试模块</div>-->
          <!--          </div>-->
          <!--          <div class="sense-control" id="b_1001"-->
          <!--               style="transform:translate(410px, 16px);width:378px;position:absolute;height:200px;">-->
          <!--            <div class="sense-control-name">B测试模块</div>-->
          <!--          </div>-->
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>

import drag from "@/components/FormDesign/drag";
import infoModule from '@/module/infoModule';
import $ from "jquery";

export default {
  name: "index.vue",
  computed: {
    senseEditorHeight: function () {
      return '590px';
    }
  },
  data() {
    return {
      data: [{
        id: 4,
        column: 2,
        label: '首页导航'
      },{
        id: 8,
        column: 3,
        label: '另类导航'
      }, {
        id: 1,
        label: '内容管理',
        disabled: true,
        children: [{
          id: 3,
          column: 1,
          label: '党建之窗'
        }, {
          id: 2,
          column: 1,
          label: '青年银行家'
        }]
      }, {
        id: 5,
        column: 1,
        label: '快捷链接'
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      dragObj: undefined,
    };
  },
  created() {
    this.$nextTick(() => {
      this.dragObj = drag;
      this.dragObj.init('sense-editor');
    });
  },
  methods: {
    checkTree(data, status, childrenStatus) {
      if (!data.children || data.children == 0) {
        let dom = undefined;
        if (status == true) {
          dom = infoModule.getDom(data.id, data.label, data.column, this.dragObj.avg_width, 200)
          $('.sense-editor').append(dom);
        } else {
          $('.sense-editor').filter('[id=' + data.id + ']').remove();
        }
        this.$nextTick(() => {
          this.dragObj.init('sense-editor');
          this.dragObj.resize(dom);
        });
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  background: #F2F2F2;
}

.app-container >>> .sense-control {
  position: absolute;
  padding: 8px;
}

.app-container >>> .sense-control-wrapper {
  height: 100%;
  widht: 100%;
  cursor: pointer;
  background: #FFFFFF;
  box-shadow: 0 4px 10px rgba(0, 0, 0, .1);
  border-radius: 4px;
}

.app-container >>> .sense-control-name {
  width: 100px;
  height: 50px;
  margin: 0 auto; /*水平居中*/
  position: relative; /*脱离文档流*/
  top: 45%; /*偏移*/
}

.app-container >>> .sense-control-drag {
  border: dashed 2px #FF5722;
}
</style>
