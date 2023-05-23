<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item :label="$t('subportal.sn')" prop="sn">
        <el-input
          v-model="queryParams.sn"
          :placeholder="$t('subportal.sn')"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('subportal.title')" prop="title">
        <el-input
          v-model="queryParams.title"
          :placeholder="$t('subportal.title')"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item :label="$t('common.status')" prop="status">
        <el-select
          v-model="queryParams.status"
          :placeholder="$t('common.status')"
          clearable
          size="small"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="$t(dict.dictLabel)"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >{{ $t("common.search") }}
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">{{
          $t("common.reset")
        }}</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['layout:subportal:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >{{ $t("common.add") }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['layout:subportal:edit']"
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >{{ $t("common.edit") }}
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['layout:subportal:delete']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >{{ $t("common.delete") }}
        </el-button>
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableData"
      size="mini"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />

      <el-table-column
        :label="$t('subportal.sn')"
        align="center"
        width="150"
        prop="sn"
      />
      <el-table-column
        :label="$t('subportal.title')"
        align="center"
        prop="title"
      >
        <template slot-scope="scope">
          {{ $t(scope.row.title) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('subportal.layoutVersion')"
        align="center"
        width="120"
        prop="layoutVersion"
      />
      <el-table-column
        :label="$t('subportal.deployVersion')"
        align="center"
        width="120"
        prop="deployVersion"
      />
      <el-table-column
        prop="status"
        :label="$t('common.status')"
        :formatter="statusFormat"
        width="110"
      ></el-table-column>
      <el-table-column
        :label="$t('common.createTime')"
        align="center"
        width="160"
      >
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{m}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('common.status')"
        align="center"
        width="210"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['layout:subportal:edit']"
            size="mini"
            type="text"
            @click="handleUpdate(scope.row)"
            >{{ $t("common.edit") }}
          </el-button>
          <el-button
            v-hasPermi="['layout:subportal:design']"
            size="mini"
            type="text"
            @click="handleNewLayout(scope.row)"
            >{{ $t("subportal.design") }}
          </el-button>
          <el-button
            v-hasPermi="['layout:subportal:delete']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row)"
            >{{ $t("common.delete") }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 添加或修改 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
      v-loading="dialogLoading"
      shadow="hover"
      element-loading-background="rgba(0, 0, 0, 0)"
      :close-on-click-modal="false"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('subportal.sn')" prop="sn">
          <el-input :disabled="editStatus" v-model.trim="form.sn" :placeholder="$t('subportal.sn')" />
        </el-form-item>
        <el-form-item :label="$t('subportal.title')" prop="title">
          <!-- <el-input
            v-model.trim="form.title"
            :placeholder="$t('subportal.title')"
          /> -->
          <langs-select
            v-model="form.title"
            :placeholder="$t('subportal.title')"
          />
        </el-form-item>
        <el-form-item
          v-show="false"
          :label="$t('subportal.theme')"
          prop="theme"
        >
          <el-select
            v-model="form.theme"
            filterable
            :placeholder="$t('subportal.theme')"
            style="width: 100%"
          >
            <el-option
              :label="$t('subportal.default')"
              value="default"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          v-show="false"
          :label="$t('subportal.status')"
          prop="status"
        >
          <el-select
            v-model="form.status"
            :placeholder="$t('subportal.status')"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="$t(dict.dictLabel)"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-show="false"
          :label="$t('subportal.scope')"
          prop="scope"
        >
          <treeselect
            v-model="form.scope"
            :options="deptOptions"
            :show-count="true"
            placeholder="请选择访问权限"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{
          $t("common.confirm")
        }}</el-button>
        <el-button @click="cancel">{{ $t("common.cancel") }}</el-button>
      </div>
    </el-dialog>

    <!--设计窗口-->
    <!-- <design ref="designInfo" :visible.sync="editInfovisible"></design> -->
  </div>
</template>

<script>
import { add, del, get, list, update } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { treeselect } from "@/api/system/dept";

import newDesign from "@/views/subportal/newDesign";
// import LangsSelect from "@/views/components/layout/index/component/LangsSelect.vue";

export default {
  name: "subportal",
  components: {
    newDesign,
    Treeselect,
    // LangsSelect
  },
  data() {
    return {
      dialogLoading: false,
      // 部门树选项
      deptOptions: undefined,
      editInfovisible: false,
      newEditInfovisible: false,
      // 菜单状态数据字典
      statusOptions: [],
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
      //表格数据
      tableData: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        isLikeQuery: true,
        pageNum: 1,
        pageSize: 10,
        sn: undefined,
        title: undefined,
        status: undefined,
      },
      // 表单参数
      form: {
        id: null,
        sn: null,
        title: null,
        logo: null,
        theme: "default",
        status: "0",
        scope: "0",
      },
      // 表单校验
      rules: {
        sn: [{ required: true, message: " ", trigger: "blur" }],
        title: [{ required: true, message: " ", trigger: "blur" }],
        status: [{ required: true, message: " ", trigger: "blur" }],
        theme: [{ required: true, message: " ", trigger: "blur" }],
        scope: [{ required: true, message: " ", trigger: "blur" }],
      },
      //文件名
      fileName: "",
      //文件对象
      files: "",
      //图片地址
      imageUrl: undefined,
      editStatus: false // false 新增 true 编辑
    };
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getDicts("sys_normal_disable").then((response) => {
      this.statusOptions = response.data;
    });
  },
  mounted() {
    let that = this;
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        list(that.queryParams).then((response) => {
          that.tableData = response.rows;
          that.total = response.total;
        });
      }
    });
  },
  methods: {
    // 菜单状态字典翻译
    statusFormat(row, column) {
      if (row.menuType == "F") {
        return "";
      }
      return this.$t(this.selectDictLabel(this.statusOptions, row.status))
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then((response) => {
        this.deptOptions = response.data;
      });
    },
    /** 查询公共快捷方式列表 */
    getList() {
      this.loading = true;
      list(this.queryParams).then((response) => {
        this.tableData = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        sn: null,
        title: null,
        logo: null,
        theme: "default",
        status: "0",
        scope: "0",
      };
      this.files = undefined;
      this.fileName = undefined;
      this.imageUrl = null;
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
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.editStatus = false
      this.title = this.$t("common.add");
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.editStatus = true
      const id = row.id || this.ids;
      get(id).then((response) => {
        let data = response.data;
        for (let key in this.form) {
          if (data[key]) {
            this.form[key] = data[key];
          }
        }
        if (this.form.logo !== null) {
          this.imageUrl = "data:image/png;base64," + this.form.logo;
        }
        this.form.scope = this.form.scope + "";
        this.form.status = this.form.status + "";
        this.form.scope = this.form.scope + "";
        this.open = true;
        this.title = this.$t("common.edit");
      });
    },
    // handleLayout(row) {
    //   this.editInfovisible = true;
    //   this.$nextTick(function () {
    //     this.$refs.designInfo.showDesign(row);
    //   });
    // },
    handleNewLayout(row) {
      window.open("/newDesign/" + row.id);
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let fileFormData = new FormData();
          if (this.files) {
            fileFormData.append("file", this.files, this.fileName);
          }
          for (let key in this.form) {
            if (this.form[key]) {
              fileFormData.append(key, this.form[key]);
            }
          }
          this.dialogLoading = true;
          if (this.form.id != null) {
            update(fileFormData)
              .then((response) => {
                if (response.code == 200) {
                  this.msgSuccess(this.$t("common.success"));
                  this.open = false;
                  this.getList();
                  this.reset();
                } else {
                  this.msgError(response.data.msg);
                }
              })
              .finally(() => {
                this.dialogLoading = false;
              });
          } else {
            add(fileFormData)
              .then((response) => {
                if (response.code == 200) {
                  this.msgSuccess(this.$t("common.success"));
                  this.open = false;
                  this.getList();
                  this.reset();
                } else {
                  this.msgError(response.data.msg);
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
          return del(ids);
        })
        .then((response) => {
          if (response.code == 200) {
            this.getList();
            this.msgSuccess(this.$t("common.success"));
          } else {
            this.msgError(response.msg);
          }
        });
    },
    handleSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file);
    },
    uploadSectionFile: function (param) {
      let file = param.file;
      if (file && file.size > 2 * 1024 * 1024) {
        this.msgWarning(this.$t("subportal.size2M"));
        return;
      }
      this.files = file;
      this.fileName = file.name;
      this.handleSuccess({}, file);
    },
  },
};
</script>