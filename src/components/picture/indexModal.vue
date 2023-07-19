<template>
    <!-- 添加或修改分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="900px" append-to-body>
      <modal ref="modal"/>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import modal from './index.vue'

export default {
  name: "Picture",
  components: { Treeselect, modal },
  props:{
    type:{
      type:String,
      default: 'pub'
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      isShowPic: false,
      // 总条数
      total: 0,
      // 图片库表格数据
      pictureList: [],
      // 弹出层标题
      title: "",
      // 分类树选项
      categoryOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 分类名称
      name: undefined,
      localImg: "",
      checkPicList: [],
      // 表单参数
      form: {},
      image:{},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 8,
        classId: undefined
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        extra: [
          { required: true, message: "标识不能为空", trigger: "blur" }
        ],
      },
    };
  },
  watch: {
    // 根据名称筛选部门树
    name(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
  },

  methods: {
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    show() {
      this.open = true;
    },
    /** 提交按钮 */
    submitForm() {
      console.log(this.form);
      this.show =false
      this.$emit('handelSelect', [1,2,3])
    },
  }
};
</script>

<style scoped lang="scss">

.conters {
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
}
.custom-tree-node {
  margin-top: 10px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  color: #4386c6;
}
.custom-tree-node-label {
  display: block;
  width: 125px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.el-ic {
  //display: none;
  i,
  span {
    //padding: 0 14px;
    font-size: 18px;
    font-weight: 600;
  }
  .svg-icon {
    color: #4386c6;
  }
}
.el-tree-node__content {
  height: 38px;
}
.el-tree-node__expand-icon {
  //color: #428bca;
  /*padding: 10px 10px 0px 10px !important;*/
}
.el-tree-node__content:hover .el-ic {
  color: #428bca !important;
  display: inline-block;
}
.el-tree-node__content:hover {
  font-weight: bold;
}

.gridPic {
  margin-top: 15px;
  margin-right: 15px;
  margin-bottom: 10px;
  width: 130px;
  height: 130px;
  position: relative;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .num_badge {
    position: absolute;
    top: 6px;
    right: 6px;
    display: inline-block;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    background: #1890FF;
    font-size: 14px;
    text-align: center;
    color: #fff;
    line-height: 20px;
  }
}

.pictrueList {

  width: 100%;
  el-image {
    width: 100%;
    border: 2px solid #fff;
  }
  .on {
    border: 2px solid #1890FF;
  }

}
.el-image {
  width: 130px;
  height: 130px;
  cursor: pointer;
  display: block;
}
.imagesNo {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin: 65px 0;
  .imagesNo_sp {
    font-size: 13px;
    color: #dbdbdb;
    line-height: 3;
  }
}
</style>
