<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入标题名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          icon="el-icon-plus"-->
<!--          size="mini"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['system:categorytitle:add']"-->
<!--        >新增</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:categorytitle:edit']"
        >修改</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['system:categorytitle:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:categorytitle:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="categorytitleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="标题名称" align="center" prop="name" />
      <el-table-column label="内容描述" align="center" prop="comment" />
      <el-table-column label="主图" align="center" prop="imgUrl" >
        <template slot-scope="scope">
          <el-image :src="scope.row.imgUrl" style="width: 100px; height: 60px">
            <div slot="placeholder" class="image-slot">
              加载中<span class="dot">...</span>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="状态" align="center" prop="status" >
        <template slot-scope="scope">
          <el-switch
            v-model.lazy="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:categorytitle:edit']"
          >修改</el-button>
<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-delete"-->
<!--            @click="handleDelete(scope.row)"-->
<!--            v-hasPermi="['system:categorytitle:remove']"-->
<!--          >删除</el-button>-->
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改标题分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标题名称" />
        </el-form-item>
        <el-form-item label="内容描述" prop="comment">
          <el-input v-model="form.comment" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="图文封面">
          <image-upload v-model="form.imgUrl" limit="2" />
        </el-form-item>

<!--        <el-form-item label="图文封面" prop="imgId" >-->
<!--          <div class="upLoadPicBox" @click="modalPicTap('1')">-->
<!--            <div v-if="form.imgUrl" class="pictrue" >-->
<!--              <img width="120px" height="80px" :src="form.imgUrl">-->
<!--            </div>-->
<!--            <div v-else class="upLoad">-->
<!--              <image-upload v-model="form.imgId" limit="1"/>-->
<!--&lt;!&ndash;              <i  class="el-icon-camera cameraIconfont" style="font-size: 35px; font-weight: 500"/>&ndash;&gt;-->
<!--            </div>-->
<!--          </div>-->
<!--        </el-form-item>-->
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCategorytitle,
  getCategorytitle,
  delCategorytitle,
  addCategorytitle,
  updateCategorytitle,
  changeTabStatus
} from "@/api/system/categorytitle";
import {changeUserStatus} from "@/api/system/user";

export default {
  name: "Categorytitle",
  dicts: ['sys_yes_no','sys_normal_disable'],
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
      // 总条数
      total: 0,
      // 标题分类表格数据
      categorytitleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        imgId: null,
        status: null,
      },

      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "标题名称不能为空", trigger: "blur" }
        ],
        comment: [
          { required: true, message: "内容描述不能为空", trigger: "blur" }
        ],
        parentId: [
          { required: true, message: "父类id不能为空", trigger: "change" }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" }
        ],
        sort: [
          { required: true, message: "排序不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 点击
    modalPicTap(tit) {
      const _this = this
      // this.$modalUpload(function(img) {
      //   _this.pram.imageInput = img[0].sattDir
      // }, tit, 'content')
    },
    /** 查询标题分类列表 */
    getList() {
      this.loading = true;
      listCategorytitle(this.queryParams).then(response => {
        this.categorytitleList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 状态修改
    handleStatusChange(row) {
      console.log(";;;"+row.status)
      let text = row.status == "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.name + '"用户吗？').then(function() {
        return changeTabStatus(row.id, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
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
        name: null,
        comment: null,
        parentId: null,
        imgId: null,
        imgUrl: null,
        status: "0",
        delFlag: null,
        sort: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加标题分类";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getCategorytitle(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改标题分类";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCategorytitle(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCategorytitle(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除标题分类编号为"' + ids + '"的数据项？').then(function() {
        return delCategorytitle(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/categorytitle/export', {
        ...this.queryParams
      }, `categorytitle_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
