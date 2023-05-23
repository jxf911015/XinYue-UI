
<template>
  <div class="app-container">
    <el-form :inline="true" label-width="68px" ref="queryForm" size="small" class="mb8" :model="queryParams">

      <el-form-item label="标题" prop="title">
        <el-input v-model="queryParams.title" placeholder="请输入文章标题" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>



    </el-form>

  </div>
</template>

<script>
import {
  listLayoutModule,
  getLayoutModule,
  delLayoutModule,
  addLayoutModule,
  updateLayoutModule,
  exportLayoutModule,
} from "@/api/layout/layoutModule";
import {
  pexisHeightToLayoutHeight,
  layoutHeightToPexisHeight,
} from "@/utils/util";
import { randomUUID } from "@/utils/util.js";

export default {
  name: "LayoutModule",
  components: {
  },
  data() {
    return {
      dialogLoading: false,
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
      // 总条数
      total: 0,
      // 表格数据
      dataList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      //是否数据字典
      commonYesNoOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sn: undefined,
        title: undefined,
        status: undefined,
      },
      // 表单参数
      form: {
        status: "2",
        isDefault: "0",
        icon: 'component'
      },
      // 扩展属性
      extra: {},
      // 表单校验
      rules: {
        title: [
          {
            required: true,
            // message: this.$t("Information.news.visibleDeptNull"),
            trigger: "blur",
          },
        ],
        width: [
          {
            required: true,
            // message: this.$t("Information.news.visibleDeptNull"),
            trigger: "blur",
          },
        ],
        height: [
          {
            required: true,
            // message: this.$t("Information.news.visibleDeptNull"),
            trigger: "blur",
          },
        ],
        // icon: [
        //   {
        //     required: true,
        //     // message: this.$t("Information.news.visibleDeptNull"),
        //     trigger: ['blur', 'change'],
        //   },
        // ],
        component: [
          {
            required: true,
            // message: this.$t("Information.news.visibleDeptNull"),
            trigger: "change",
          },
        ],
      },
      // 是否显示组件属性
      isShowComponent: false,
      //图片地址
      imageUrl: undefined,
      //高度
      height: undefined,
      componentOptions: [
        {
          label: this.$t("layout_module.HomeSwiper"),
          value: "/index/HomeSwiper.vue",
          imgSrc: require("@/assets/images/home/component/Component17.png"),
        },
        {
          label: this.$t("layout_module.HomeNews"),
          value: "/index/HomeNews.vue",
          imgSrc: require("@/assets/images/home/component/Component1.png"),
        },
        {
          label: this.$t("layout_module.HomeEvents"),
          value: "/index/HomeEvents.vue",
          imgSrc: require("@/assets/images/home/component/Component3.png"),
        },
        {
          label: this.$t("layout_module.HomeDownload"),
          value: "/index/HomeDownload.vue",
          imgSrc: require("@/assets/images/home/component/Component7.png"),
        },
        {
          label: this.$t("layout_module.HomeLinks"),
          value: "/index/HomeLinks.vue",
          imgSrc: require("@/assets/images/home/component/Component2.png"),
        },
        {
          label: this.$t("layout_module.HomeNotice"),
          value: "/index/HomeNotice.vue",
          imgSrc: require("@/assets/images/home/component/Component4.png"),
        },
        {
          label: this.$t("layout_module.Advertising"),
          value: "/index/Advertising.vue",
          imgSrc: require("@/assets/images/home/component/Component5.png"),
        },
        {
          label: this.$t("layout_module.Display"),
          value: "/index/Display.vue",
          imgSrc: require("@/assets/images/home/component/Component6.png"),
        },
        {
          label: this.$t("layout_module.DeptTreeChart"),
          value: "/index/DeptTreeChart.vue",
          imgSrc: require("@/assets/images/home/component/Component15.png"),
        },
        {
          label: this.$t("layout_module.ContentPlate"),
          value: "/index/ContentPlate.vue",
          imgSrc: require("@/assets/images/home/component/Component16.png"),
        },
        {
          label: this.$t("layout_module.HomeDocs"),
          value: "/index/HomeDocs.vue",
          imgSrc: require("@/assets/images/home/component/Component10.png"),
        },
        {
          label: this.$t("layout_module.Liaison"),
          value: "/index/Liaison.vue",
          imgSrc: require("@/assets/images/home/component/Component12.png"),
        },
        {
          label: this.$t("layout_module.HomeCall"),
          value: "/index/HomeCall.vue",
          imgSrc: require("@/assets/images/home/component/Component11.png"),
        },
        {
          label: this.$t("layout_module.Question"),
          value: "/index/Question.vue",
          imgSrc: require("@/assets/images/home/component/Component13.png"),
        },
        {
          label: this.$t("layout_module.HomeSolution"),
          value: "/index/HomeSolution.vue",
          imgSrc: require("@/assets/images/home/component/Component8.png"),
        },
        {
          label: this.$t("layout_module.VI"),
          value: "/index/VI.vue",
          imgSrc: require("@/assets/images/home/component/Component14.png"),
        },
        {
          label: this.$t("layout_module.SystemHandbook"),
          value: "/index/SystemHandbook.vue",
          imgSrc: require("@/assets/images/home/component/Component9.png"),
        },
        {
          label: this.$t("layout_module.HomeApplication"),
          value: "/index/HomeApplication.vue",
          imgSrc: require("@/assets/images/home/component/Component18.png"),
        },
        {
          label: this.$t("layout_module.PictureDisplay"),
          value: "/index/PictureDisplay.vue",
          imgSrc: require("@/assets/images/home/component/Component20.png"),
        },
      ],
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
    this.getDicts("common_yes_no").then((response) => {
      this.commonYesNoOptions = response.data;
    });
  },
  methods: {
    /** 查询组件列表 */
    getList() {
      this.loading = true;
      listLayoutModule(this.queryParams).then((response) => {
        debugger
        this.dataList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 选择图标
    selected(name) {
      this.form.icon = name;
      this.$forceUpdate();
    },
    //高度转换像素
    layoutHeightFormat(row, column) {
      return layoutHeightToPexisHeight(row.height);
    },
    // 组件状态字典翻译
    statusFormat(row, column) {
      return this.$t(this.selectDictLabel(this.statusOptions, row.status))
    },
    //默认状态字典翻译
    isDefaultFormat(row, column) {
      return this.$t(this.selectDictLabel(this.commonYesNoOptions, row.isDefault))
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        status: "0",
        isDefault: "0",
        icon: 'component'
      };
      this.extra = {};
      this.isShowComponent = false;
      this.height = undefined;
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.form.sn = randomUUID(10);
      this.title = "添加组件";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getLayoutModule(id).then((response) => {
        this.form = response.data;
        this.height = layoutHeightToPexisHeight(this.form.height);
        if (this.form.extra) {
          this.extra = JSON.parse(this.form.extra);
        }
        this.open = true;
        this.title = this.$t("common.edit");
        this.$nextTick(function () {
          this.loadComponent();
        });
      });
    },
    /**加载组件*/
    loadComponent() {
      try {

        console.log("form", this.form);
        this.$options.components[this.form.sn] =
          require("@/views/components/layout" + this.form.component).default;
        this.setDefaultInfo(this.form.component);
        this.isShowComponent = true;
      } catch (e) {
        this.isShowComponent = false;
        this.$message.error(e);
      }
    },
    setDefaultInfo(key) {
      console.log("setDefaultInfo", key);
      const fileArr = new Map([
        [
          "/index/HomeSwiper.vue",
          () => {
            this.form.width = 24;
            this.height = 243;
          },
        ], // 首页图组件
        [
          "/index/HomeNews.vue",
          () => {
            this.form.width = 12;
            this.height = 390;
          },
        ], // 新闻组件
        [
          "/index/HomeEvents.vue",
          () => {
            this.form.width = 12;
            this.height = 243;
          },
        ], // 活动组件
        [
          "/index/HomeDownload.vue",
          () => {
            this.form.width = 24;
            this.height = 186;
          },
        ], // 下载组件
        [
          "/index/HomeLinks.vue",
          () => {
            this.form.width = 12;
            this.height = 390;
          },
        ], // 链接组件
        [
          "/index/HomeNotice.vue",
          () => {
            this.form.width = 12;
            this.height = 243;
          },
        ], // 公告通知组件
        [
          "/index/Advertising.vue",
          () => {
            this.form.width = 12;
            this.height = 107;
          },
        ], // 广告组件
        [
          "/index/Display.vue",
          () => {
            this.form.width = 8;
            this.height = 252;
          },
        ], // 宣传组件
        [
          "/index/PictureDisplay.vue",
          () => {
            this.form.width = 8;
            this.height = 252;
          },
        ], // 图片展示组件
        [
          "/index/DeptTreeChart.vue",
          () => {
            this.form.width = 24;
            this.height = 392;
          },
        ], // 组织结构组件
        [
          "/index/ContentPlate.vue",
          () => {
            this.form.width = 8;
            this.height = 232;
          },
        ], // 展示组件
        [
          "/index/HomeDocs.vue",
          () => {
            this.form.width = 17;
            this.height = 232;
          },
        ], // 文档组件
        [
          "/index/Liaison.vue",
          () => {
            this.form.width = 12;
            this.height = 243;
          },
        ], // 联络人组件
        [
          "/index/HomeCall.vue",
          () => {
            this.form.width = 7;
            this.height = 232;
          },
        ], // 电话组件
        [
          "/index/Question.vue",
          () => {
            this.form.width = 12;
            this.height = 256;
          },
        ], // Q&A组件
        [
          "/index/HomeSolution.vue",
          () => {
            this.form.width = 12;
            this.height = 256;
          },
        ], // 方案组件
        [
          "/index/VI.vue",
          () => {
            this.form.width = 24;
            this.height = 246;
          },
        ], // VI组件
        [
          "/index/SystemHandbook.vue",
          () => {
            this.form.width = 24;
            this.height = 182;
          },
        ], // 手册组件
        [
          "/index/HomeApplication.vue",
          () => {
            this.form.width = 10;
            this.height = 232;
          },
        ], // 应用组件
        [
          "default",
          () => {
            this.form.width = 12;
            this.height = 243;
          },
        ],
      ]);
      if (fileArr.get(key)) {
        fileArr.get(key).call(this);
      } else {
        fileArr.get("default").call(this);
      }
    },
    /**重载组件*/
    reloadComponent(val) {
      console.log(val);
      if (this.form.sn) {
        const loading = this.$loading({
          lock: true,
          text: "Loading",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        this.loadComponent();
        loading.close();
      } else {
        this.msgWarning(
          this.$t("layout_module.sn") + this.$t("common.required")
        );
      }
    },
    /** 提交按钮 */
    submitForm: function () {
      this.form.extra = JSON.stringify(this.extra);
      this.form.height = pexisHeightToLayoutHeight(this.height);
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.dialogLoading = true;
          if (this.form.id != undefined) {
            updateLayoutModule(this.form)
              .then((response) => {
                if (response.code == 200) {
                  this.msgSuccess(response.msg);
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              })
              .finally(() => {
                this.dialogLoading = false;
              });
          } else {
            addLayoutModule(this.form)
              .then((response) => {
                if (response.code == 200) {
                  this.msgSuccess(response.msg);
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              })
              .finally(() => {
                this.dialogLoading = false;
              });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(
        this.$t("common.confirm.tip") + "?",
        this.$t("common.warn"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          type: "warning",
        }
      )
        .then(function () {
          return delLayoutModule(ids);
        })
        .then((response) => {
          if (response.code == 200) {
            this.getList();
            this.msgSuccess(this.$t("common.deleteSuccess"));
          } else {
            this.msgError(response.msg);
          }
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm(
        this.$t("common.confirm.tip") + "?",
        this.$t("common.warn"),
        {
          confirmButtonText: this.$t("common.confirm"),
          cancelButtonText: this.$t("common.cancel"),
          type: "warning",
        }
      )
        .then(function () {
          return exportLayoutModule(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
    },
    handleAvatarSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      let self = this;
      let reader = new FileReader();
      reader.readAsDataURL(file.file);
      reader.onload = function (e) {
        let imgBase64 = e.target.result.split(",")[1];
        self.$set(self.form, "icon", "data:image/png;base64," + imgBase64);
      };
    },
  },
};
</script>
<style type="scope" lang="scss">
.required {
  color: #ff4949;
  margin-right: 0.25rem;
}

.extra {
  .el-form-item {
    margin-bottom: 10px !important;
  }

  .td_content {
    padding-right: 10px;
    max-height: 30vh;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
      height: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c4c8cf;
      border: 1px solid #c4c8cf;
    }
  }
}

.el-input-number {
  width: 100%;

  .el-input__inner {
    text-align: left;
  }
}

.component-li {
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 100px;
  padding-bottom: 10px;

  .component_label {
    display: block;
    text-align: left;
  }

  .img-box {
    height: 70px;
    width: 200px;
  }

  .component_img {
    height: 100%;
    max-width: 200px;
  }
}
</style>
>