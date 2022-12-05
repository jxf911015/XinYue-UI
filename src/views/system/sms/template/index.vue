<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入模板名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开启状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择开启状态" clearable size="small">
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
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
          v-hasPermi="['system:template:add']"
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
          v-hasPermi="['system:template:edit']"
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
          v-hasPermi="['system:template:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:template:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="templateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="短信签名" align="center" prop="type" />
      <el-table-column label="模板编码" align="center" prop="code" />
      <el-table-column label="模板名称" align="center" prop="name" />
      <el-table-column label="模板内容" align="center" prop="content" />
      <el-table-column label="参数数组" align="center" prop="paramsone" />
      <el-table-column label="API编号" align="center" prop="apiTemplateId" />
      <el-table-column label="渠道编号" align="center" prop="channelId" />
      <el-table-column label="渠道编码" align="center" prop="channelCode" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="开启状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:template:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:template:remove']"
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

    <!-- 添加或修改短信模板对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模板签名" prop="type">
          <el-input v-model="form.type" placeholder="请输入短信签名" />
        </el-form-item>
        <el-form-item label="模板编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入模板编码" />
        </el-form-item>
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板内容">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="参数数组" prop="paramsone">
          <el-input v-model="form.paramsone" placeholder="请输入参数数组" />
        </el-form-item>
        <el-form-item label="模板编号" prop="apiTemplateId">
          <el-input v-model="form.apiTemplateId" placeholder="请输入短信 API 的模板编号" />
        </el-form-item>
        <el-form-item label="渠道编号" prop="channelId">
          <el-input v-model="form.channelId" placeholder="请输入短信渠道编号" />
        </el-form-item>
        <el-form-item label="渠道编码" prop="channelCode">
          <el-input v-model="form.channelCode" placeholder="请输入短信渠道编码" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="开启状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
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
import { listTemplate, getTemplate, delTemplate, addTemplate, updateTemplate } from "@/api/system/sms/template";

export default {
  name: "Template",
  dicts: ['sys_normal_disable'],
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
      // 短信模板表格数据
      templateList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        type: null,
        status: null,
        code: null,
        name: null,
        content: null,
        paramsone: null,
        apiTemplateId: null,
        channelId: null,
        channelCode: null,
        creator: null,
        updater: null,
        deleted: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        type: [
          { required: true, message: "短信签名不能为空", trigger: "change" }
        ],
        status: [
          { required: true, message: "开启状态不能为空", trigger: "blur" }
        ],
        code: [
          { required: true, message: "模板编码不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "模板名称不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "模板内容不能为空", trigger: "blur" }
        ],
        paramsone: [
          { required: true, message: "参数数组不能为空", trigger: "blur" }
        ],
        apiTemplateId: [
          { required: true, message: "短信 API 的模板编号不能为空", trigger: "blur" }
        ],
        channelId: [
          { required: true, message: "短信渠道编号不能为空", trigger: "blur" }
        ],
        channelCode: [
          { required: true, message: "短信渠道编码不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        updateTime: [
          { required: true, message: "更新时间不能为空", trigger: "blur" }
        ],
        deleted: [
          { required: true, message: "是否删除不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询短信模板列表 */
    getList() {
      this.loading = true;
      listTemplate(this.queryParams).then(response => {
        this.templateList = response.rows;
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
        type: null,
        status: 0,
        code: null,
        name: null,
        content: null,
        paramsone: null,
        remark: null,
        apiTemplateId: null,
        channelId: null,
        channelCode: null,
        creator: null,
        createTime: null,
        updater: null,
        updateTime: null,
        deleted: null
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
      this.title = "添加短信模板";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTemplate(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改短信模板";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTemplate(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTemplate(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除短信模板编号为"' + ids + '"的数据项？').then(function() {
        return delTemplate(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/template/export', {
        ...this.queryParams
      }, `template_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
