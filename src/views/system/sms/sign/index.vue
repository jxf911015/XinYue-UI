<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="签名名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入签名名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道名称" prop="channel">
        <el-input
          v-model="queryParams.channel"
          placeholder="请输入渠道名称"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:sign:add']"
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
          v-hasPermi="['system:sign:edit']"
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
          v-hasPermi="['system:sign:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:sign:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="signList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="签名名称" align="center" prop="name" />
<!--      <el-table-column label="渠道编号" align="center" prop="code" />-->
      <el-table-column label="渠道名称" align="center" prop="channel" />
      <el-table-column label="使用场景" align="center" prop="scene">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.template_type" :value="scope.row.scene"/>
        </template>
      </el-table-column>
      <el-table-column label="用途" align="center" prop="purpose">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sign_scene" :value="scope.row.purpose"/>
        </template>
      </el-table-column>
      <el-table-column label="签名来源" align="center" prop="source">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sign_source" :value="scope.row.source"/>
        </template>
      </el-table-column>
      <el-table-column label="网站域名" align="center" prop="website" />
      <el-table-column label="场景说明" align="center" prop="explains" />
<!--      <el-table-column label="是否三证合一" align="center" prop="isCertificates">-->
<!--        <template slot-scope="scope">-->
<!--          <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.isCertificates"/>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="证件图片" align="center" prop="imageone" width="100">-->
<!--        <template slot-scope="scope">-->
<!--          <image-preview :src="scope.row.imageone" :width="50" :height="50"/>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="委托授权书" align="center" prop="entrust" width="100">-->
<!--        <template slot-scope="scope">-->
<!--          <image-preview :src="scope.row.entrust" :width="50" :height="50"/>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="开启状态" align="center" prop="status">-->
<!--        <template slot-scope="scope">-->
<!--          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="审核状态" align="center" prop="examine" />
<!--      <el-table-column label="创建时间" align="center" prop="cerateTime" width="180">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ parseTime(scope.row.cerateTime, '{y}-{m}-{d}') }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:sign:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:sign:remove']"
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

    <!-- 添加或修改短信签名对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="签名名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入签名名称" />
        </el-form-item>
<!--        <el-form-item label="渠道编号" prop="code">-->
<!--          <el-input v-model="form.code" placeholder="请输入渠道编号" />-->
<!--        </el-form-item>-->
        <el-form-item label="渠道名称" prop="channel">
          <el-input v-model="form.channel" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="使用场景" prop="scene">
          <el-select v-model="form.scene" placeholder="请选择使用场景">
            <el-option
              v-for="dict in dict.type.template_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用途" prop="purpose">
          <el-select v-model="form.purpose" placeholder="请选择用途">
            <el-option
              v-for="dict in dict.type.sign_scene"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="签名来源" prop="source">
          <el-select v-model="form.source" placeholder="请选择签名来源">
            <el-option
              v-for="dict in dict.type.sign_source"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="网站域名" prop="website">
          <el-input v-model="form.website" placeholder="请输入网站域名" />
        </el-form-item>
        <el-form-item label="场景说明" prop="explains">
          <el-input v-model="form.explains" type="textarea" placeholder="请输入内容" />
        </el-form-item>
<!--        <el-form-item label="是否三证合一">-->
<!--          <el-radio-group v-model="form.isCertificates">-->
<!--            <el-radio-->
<!--              v-for="dict in dict.type.sys_yes_no"-->
<!--              :key="dict.value"-->
<!--              :label="parseInt(dict.value)"-->
<!--            >{{dict.label}}</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="证件图片">-->
<!--          <image-upload v-model="form.imageone"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="委托授权书">-->
<!--          <image-upload v-model="form.entrust"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="开启状态">-->
<!--          <el-radio-group v-model="form.status">-->
<!--            <el-radio-->
<!--              v-for="dict in dict.type.sys_normal_disable"-->
<!--              :key="dict.value"-->
<!--              :label="parseInt(dict.value)"-->
<!--            >{{dict.label}}</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSign, getSign, delSign, addSign, updateSign } from "@/api/system/sms/sign";

export default {
  name: "Sign",
  dicts: ['sign_source', 'template_type', 'sign_scene', 'sys_yes_no', 'sys_normal_disable'],
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
      // 短信签名表格数据
      signList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        channel: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: "签名名称不能为空", trigger: "blur" }
        ],
        scene: [
          { required: true, message: "使用场景不能为空", trigger: "change" }
        ],
        purpose: [
          { required: true, message: "用途不能为空", trigger: "change" }
        ],
        source: [
          { required: true, message: "签名来源不能为空", trigger: "change" }
        ],
        website: [
          { required: true, message: "网站域名不能为空", trigger: "blur" }
        ],
        examine: [
          { required: true, message: "审核状态不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询短信签名列表 */
    getList() {
      this.loading = true;
      listSign(this.queryParams).then(response => {
        this.signList = response.rows;
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
        code: null,
        name: null,
        channel: null,
        scene: null,
        purpose: null,
        source: null,
        website: null,
        explains: null,
        isCertificates: 0,
        imageone: null,
        entrust: null,
        status: 0,
        examine: null,
        cerateTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null
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
      this.title = "添加短信签名";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSign(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改短信签名";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSign(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSign(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除短信签名编号为"' + ids + '"的数据项？').then(function() {
        return delSign(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/sign/export', {
        ...this.queryParams
      }, `sign_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
