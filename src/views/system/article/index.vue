<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入文章标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.sys_article_type"
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
          v-hasPermi="['system:article:add']"
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
          v-hasPermi="['system:article:edit']"
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
          v-hasPermi="['system:article:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:article:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="articleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="摘要" align="center" prop="abstract" />
      <el-table-column label="主图" align="center" prop="images" />
      <el-table-column label="详情" align="center" prop="content" />
      <el-table-column label="类型" align="center" prop="type">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_article_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="原文链接" align="center" prop="textlink" />
      <el-table-column label="允许评论 " align="center" prop="isComment">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_article_yes_no" :value="scope.row.isComment"/>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="examine" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:article:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:article:remove']"
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

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1200px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="文章摘要" prop="abstract" >
          <el-input v-model="form.abstract"  type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="文章封面" prop="images">
          <el-input v-model="form.images" placeholder="请输入图片链接" />
        </el-form-item>
        <el-form-item label="文章详情">
          <editor v-model="form.content" :min-height="350"/>
        </el-form-item>
        <el-form-item label="文章标签" prop="label">
          <el-input v-model="form.label" placeholder="请输入标签" />
        </el-form-item>
        <el-form-item label="文章类型">
          <el-radio-group v-model="form.type">
            <el-radio
              v-for="dict in dict.type.sys_article_type"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.textlink" placeholder="请填写原文链接" />
          <span><input type="checkbox" aria-hidden="false" class="" value=""></span>
          <span>原文允许转载或者本次转载已经获得原文作者授权</span>
          <p style="color: red;margin-top: 0px"> 注意：转载请确认原文允许转载，或者您已经获得原文作者授权。转载文章不能设置为VIP可见。 </p>
        </el-form-item>
        申请原创将启用 Creative Commons 版权模板，如果不是原创文章，请选择转载或翻译。 原创文章默认开启打赏
        注意：翻译请确认原文允许翻译，或者您已经获得原文作者授权翻译。翻译文章请尽量填写原文链接。
        <el-form-item label="关键字" prop="keywords">
          <el-input v-model="form.keywords" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="发布形式">
          <el-radio-group v-model="form.form">
            <el-radio
              v-for="dict in dict.type.sys_article_from"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="文章状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_show_hide"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-radio-group v-model="form.isTop">
            <el-radio
              v-for="dict in dict.type.sys_article_yes_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="允许评论 ">
          <el-radio-group v-model="form.isComment">
            <el-radio
              v-for="dict in dict.type.sys_article_yes_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="success" @click="submitForm">保存草稿</el-button>
        <el-button type="primary" @click="submitForm">发布文章</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listArticle, getArticle, delArticle, addArticle, updateArticle } from "@/api/system/article";

export default {
  name: "Article",
  dicts: ['sys_article_type', 'sys_article_yes_no', 'sys_show_hide', 'sys_article_from'],
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
      // 文章列表格数据
      articleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        type: null,
        grant: null,
        keywords: null,
        form: null,
        status: null,
        isTop: null,
        isComment: null,
        examine: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          { required: true, message: "文章标题不能为空", trigger: "blur" }
        ],
        type: [
          { required: true, message: "类型不能为空", trigger: "blur" }
        ],
        grant: [
          { required: true, message: "允许转载不能为空", trigger: "blur" }
        ],
        form: [
          { required: true, message: "发布形式不能为空", trigger: "blur" }
        ],
        isTop: [
          { required: true, message: "置顶不能为空", trigger: "blur" }
        ],
        isComment: [
          { required: true, message: "允许评论 不能为空", trigger: "blur" }
        ],
        examine: [
          { required: true, message: "审核状态不能为空", trigger: "change" }
        ],
        sort: [
          { required: true, message: "排序不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询文章列列表 */
    getList() {
      this.loading = true;
      listArticle(this.queryParams).then(response => {
        this.articleList = response.rows;
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
        title: null,
        abstract: null,
        imgId: null,
        images: null,
        content: null,
        label: null,
        type: 0,
        textlink: null,
        grant: 0,
        keywords: null,
        form: 0,
        status: "0",
        isTop: 0,
        isComment: 0,
        delFlag: null,
        examine: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        sort: null
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
      this.title = "发布文章";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getArticle(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改文章列";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateArticle(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addArticle(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除文章列编号为"' + ids + '"的数据项？').then(function() {
        return delArticle(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/article/export', {
        ...this.queryParams
      }, `article_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
<style>
.el-textarea__inner{
  height: 100px;
}
</style>
