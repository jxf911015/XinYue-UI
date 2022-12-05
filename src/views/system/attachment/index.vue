<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="上传位置" prop="imageType">
        <el-select v-model="queryParams.imageType" placeholder="请选择上传位置" clearable size="small">
          <el-option
            v-for="dict in dict.type.image_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="附件类型" prop="attType">
        <el-select v-model="queryParams.attType" placeholder="请选择附件类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.attachment_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:attachment:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:attachment:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:attachment:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:attachment:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="attachmentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="路径" align="center" prop="attDir" />
      <el-table-column label="压缩路径" align="center" prop="sattDir" />
      <el-table-column label="附件大小" align="center" prop="attSize" />
      <el-table-column label="附件类型" align="center" prop="attType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.attachment_type" :value="scope.row.attType"/>
        </template>
      </el-table-column>
      <el-table-column label="分类ID" align="center" prop="pid" />
      <el-table-column label="上传位置" align="center" prop="imageType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.image_type" :value="scope.row.imageType"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:attachment:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:attachment:remove']"
          >删除</el-button>
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

    <!-- 添加或修改附件资源库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="路径" prop="attDir">
          <el-input v-model="form.attDir" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="压缩路径" prop="sattDir">
          <el-input v-model="form.sattDir" placeholder="请输入压缩路径" />
        </el-form-item>
        <el-form-item label="附件大小" prop="attSize">
          <el-input v-model="form.attSize" placeholder="请输入附件大小" />
        </el-form-item>
        <el-form-item label="附件类型" prop="attType">
          <el-select v-model="form.attType" placeholder="请选择附件类型">
            <el-option
              v-for="dict in dict.type.attachment_type"
              :key="dict.value"
              :label="dict.label"
:value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类ID" prop="pid">
          <el-input v-model="form.pid" placeholder="请输入分类ID" />
        </el-form-item>
        <el-form-item label="上传位置" prop="imageType">
          <el-select v-model="form.imageType" placeholder="请选择上传位置">
            <el-option
              v-for="dict in dict.type.image_type"
              :key="dict.value"
              :label="dict.label"
:value="parseInt(dict.value)"
            ></el-option>
          </el-select>
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
import { listAttachment, getAttachment, delAttachment, addAttachment, updateAttachment } from "@/api/system/attachment";

export default {
  name: "Attachment",
  dicts: ['image_type', 'attachment_type'],
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
      // 附件资源库表格数据
      attachmentList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        attType: null,
        imageType: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        attDir: [
          { required: true, message: "路径不能为空", trigger: "blur" }
        ],
        attSize: [
          { required: true, message: "附件大小不能为空", trigger: "blur" }
        ],
        attType: [
          { required: true, message: "附件类型不能为空", trigger: "change" }
        ],
        pid: [
          { required: true, message: "分类ID不能为空", trigger: "blur" }
        ],
        imageType: [
          { required: true, message: "上传位置不能为空", trigger: "change" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询附件资源库列表 */
    getList() {
      this.loading = true;
      listAttachment(this.queryParams).then(response => {
        this.attachmentList = response.rows;
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
        name: null,
        attDir: null,
        sattDir: null,
        attSize: null,
        attType: null,
        pid: null,
        imageType: null,
        createTime: null,
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
      this.title = "添加附件资源库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getAttachment(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改附件资源库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateAttachment(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addAttachment(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除附件资源库编号为"' + ids + '"的数据项？').then(function() {
        return delAttachment(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/attachment/export', {
        ...this.queryParams
      }, `attachment_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
