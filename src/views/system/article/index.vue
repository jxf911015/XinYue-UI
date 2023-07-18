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

      <el-form-item label="发布形式" prop="form">
        <el-select v-model="queryParams.form" placeholder="请选择发布形式" clearable size="small">
          <el-option
            v-for="dict in dict.type.sys_article_from"
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
      <el-table-column label="摘要" align="center" prop="abstracts" />
      <el-table-column label="图文封面" align="center" prop="imgUrl" >
        <template slot-scope="scope">
          <el-image :src="scope.row.images" style="width: 100px; height: 60px">
            <div slot="placeholder" class="image-slot">
              加载中<span class="dot">...</span>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="所属区域" align="center" prop="region" />
      <el-table-column label="分类" align="center" prop="classId" />
<!--      <el-table-column label="详情" align="center" prop="content" />-->
<!--      <el-table-column label="类型" align="center" prop="types">-->
<!--        <template slot-scope="scope">-->
<!--          <dict-tag :options="dict.type.sys_article_type" :value="scope.row.types"/>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="标签" align="center" prop="label" />-->
      <el-table-column label="关键字" align="center" prop="keyword" />
<!--      <el-table-column label="发布形式" align="center"  prop="form">-->
<!--        <template slot-scope="scope">-->
<!--          <dict-tag :options="dict.type.sys_article_from" :value="scope.row.form"/>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="是否置顶" align="center" prop="isTop">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_article_yes_no" :value="scope.row.isTop"/>
        </template>
      </el-table-column>
      <el-table-column label="允许评论" align="center" prop="isComment">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_article_yes_no" :value="scope.row.isComment"/>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="examine">
        <template slot-scope="scope">
          <span v-if="scope.row.examine == 0">
            <dict-tag :options="dict.type.sys_article_examine" :value="scope.row.examine" style="color: #67C23A"/>
          </span>
          <span v-else>
            <dict-tag :options="dict.type.sys_article_examine" :value="scope.row.examine" style="color: #F56C6C"/>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="上线状态" align="center" prop="status">
        <template slot-scope="scope">
           <span v-if="scope.row.examine == 0 ">
             <dict-tag :options="dict.type.sys_article_status" :value="scope.row.status"/>
           </span>
          <span v-else>
            无
          </span>
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="170px">
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
          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:user:resetPwd', 'system:user:edit']">
                <span class="el-dropdown-link">
                  <i class="el-icon-d-arrow-right el-icon--right"></i>更多
                </span>
            <el-dropdown-menu slot="dropdown">
              <span v-if="scope.row.examine != 0 ">
                <el-dropdown-item command="approve" icon="el-icon-circle-check">审核</el-dropdown-item>
              </span>
              <span v-if="scope.row.examine == 0 ">
                <el-dropdown-item command="topping" icon="el-icon-key">置顶</el-dropdown-item>
              </span>
              <span v-if="scope.row.examine == 0 ">
                <span v-if="scope.row.status == 0 ">
                  <el-dropdown-item  command="downward" icon="el-icon-circle-check">下架</el-dropdown-item>
                </span>
                <span v-else>
                  <el-dropdown-item  command="upward" icon="el-icon-circle-check">上架</el-dropdown-item>
                </span>
              </span>

            </el-dropdown-menu>
          </el-dropdown>
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

    <!-- 添加或修改文章管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="60%" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属区域" prop="region" >
          <el-select v-model="form.region" clearable placeholder="请选择区域" label-width="80px">
            <el-option
              v-for="item in articleTitleList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            onclick="this.resetClinck()">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="风格" prop="contentStyle" v-if=" form.region != 8">
          <el-select v-model="queryParams.contentStyle" placeholder="请选择风格" clearable size="small">
            <el-option
              v-for="dict in dict.type.sys_style"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容语言" prop="luaguage"
                      v-if="queryParams.contentStyle == 4"
        >
          <el-select v-model="queryParams.luaguage" placeholder="请选择内容语言" clearable size="small" label-width="80px">
            <el-option
              v-for="dict in dict.type.sys_language"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"

            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="classId" >
          <treeselect
            v-model="form.classId"
            :options="articleClassList"
            :normalizer="normalizer"
            placeholder="选择分类" />
        </el-form-item>

        <el-form-item label="内容名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入内容名称" />
        </el-form-item>
        <el-form-item label="内容摘要" prop="abstracts"
          v-if="queryParams.contentStyle == 4 "
        >
          <el-input v-model="form.abstracts"type="textarea" placeholder="请输入内容摘要" />
        </el-form-item>
        <el-form-item label="图文封面">
          <image-upload v-model="form.images" />
        </el-form-item>
        <el-form-item label="文件视频"
                      v-if="queryParams.contentStyle != 4
                      & queryParams.contentStyle != 1
                      & form.region != 8
        ">
          <image-upload v-model="form.images" />
        </el-form-item>
        <el-form-item label="详情"
          v-if="queryParams.contentStyle == 4 & form.region == 8"
        >
          <editor v-model="form.content" :min-height="300"/>
        </el-form-item>
<!--        <el-form-item label="标签" prop="label">-->
<!--          <el-input v-model="form.label" placeholder="请输入标签" />-->
<!--        </el-form-item>-->
        <el-form-item label="关键字" prop="keyword"
           v-if="queryParams.contentStyle == 4 & form.region != 8"
        >
          <el-input v-model="form.keyword" placeholder="请输入关键字" />
        </el-form-item>
        <el-form-item label="类型" prop="types"
           v-if="queryParams.contentStyle == 4 & form.region != 8"
        >
          <el-radio-group v-model="form.types">
            <el-radio
              v-for="dict in dict.type.sys_article_type"
              :key="dict.value"
              :label="parseInt(dict.value)"
              >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原文链接" prop="textlink" v-if="form.types == 1 & form.region != 8">
          <el-input v-model="form.textlink" placeholder="请输入原文链接" />
        </el-form-item>
<!--        <el-form-item label="允许转载" prop="grants">-->
<!--          <el-radio-group v-model="form.grants">-->
<!--            <el-radio-->
<!--              v-for="dict in dict.type.sys_article_yes_no"-->
<!--              :key="dict.value"-->
<!--              :label="dict.value"-->
<!--            >{{dict.label}}</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->

<!--        <el-form-item label="发布形式">-->
<!--          <el-radio-group v-model="form.form">-->
<!--            <el-radio-->
<!--              v-for="dict in dict.type.sys_article_from"-->
<!--              :key="dict.value"-->
<!--              :label="parseInt(dict.value)"-->
<!--            >{{dict.label}}</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="文章状态">-->
<!--          <el-radio-group v-model="form.status">-->
<!--            <el-radio-->
<!--              v-for="dict in dict.type.sys_show_hide"-->
<!--              :key="dict.value"-->
<!--              :label="parseInt(dict.value)"-->
<!--            >{{dict.label}}</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
        <el-form-item label="是否置顶"
           v-if="queryParams.contentStyle == 4 & form.region != 8"
        >
          <el-radio-group v-model="form.isTop">
            <el-radio
              v-for="dict in dict.type.sys_article_yes_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="允许评论"
          v-if="queryParams.contentStyle == 4 & form.region != 8"
        >
          <el-radio-group v-model="form.isComment">
            <el-radio
              v-for="dict in dict.type.sys_article_yes_no"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
<!--        <el-form-item label="备注" prop="remark">-->
<!--          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />-->
<!--        </el-form-item>-->
        <el-form-item label="排序" prop="sort"
                      v-if="form.region != 8">
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
import {listArticle, getArticle, delArticle, addArticle, updateArticle, listTree,
  listCategory,upwards,toppings,downwards} from "@/api/system/article";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {resetUserPwd} from "@/api/system/user";

export default {
  name: "Article",
  dicts: ['sys_article_yes_no', 'sys_show_hide', 'sys_article_from',
    'sys_article_type','sys_article_examine','sys_language','sys_article_status','sys_style'],
  components: { Treeselect },
  data() {
    return {

      options1: [{
        value: '1',
        label: '新闻中心'
      }, {
        value: '2',
        label: '学佛园地'
      }, {
        value: '3',
        label: '法会预约'
      }],
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
      // 文章管理表格数据
      articleList: [],
      //区域数据
      articleTitleList:[],
      //分类数据
      articleClassList:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 区域树选项
      categoryTitleOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        abstracts: null,
        content: null,
        form: null,
        status: null,
        isTop: null,
        examine: null,
        sort: null,
        region: null,
        classId: null,
        luaguage: null,
        contentStyle: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          { required: true, message: "文章标题不能为空", trigger: "blur" }
        ],
        // types: [
        //   { required: true, message: "类型不能为空", trigger: "blur" }
        // ],
        // grants: [
        //   { required: true, message: "原文是否允许转载/翻译不能为空", trigger: "blur" }
        // ],
        // form: [
        //   { required: true, message: "发布形式不能为空", trigger: "blur" }
        // ],
        isTop: [
          { required: true, message: "是否置顶不能为空", trigger: "blur" }
        ],
        isComment: [
          { required: true, message: "是否允许评论 0-允许 1-不允许不能为空", trigger: "blur" }
        ],
        // examine: [
        //   { required: true, message: "审核状态不能为空", trigger: "change" }
        // ],
        sort: [
          { required: true, message: "排序不能为空", trigger: "blur" }
        ],
        // region: [
        //   { required: true, message: "所属区域不能为空", trigger: "change" }
        // ],
        // classId: [
        //   { required: true, message: "所属分类不能为空", trigger: "change" }
        // ]
      }
    };
  },
  created() {
    this.getList();
    this.getListTree();
    this.getClassTree();
  },
  methods: {
    getListTree(){
      this.loading = true;
      listTree().then(response => {
        console.log(response.data)
        this.articleTitleList = response.data;
        this.loading = false;
      });
    },
    getClassTree(){
      // this.loading = true;
      listCategory().then(response => {
        this.articleClassList = this.handleTree(response.data, "id");
      });
    },
    // 更多操作触发
    handleCommand(command, row) {
      switch (command) {
        case "topping":
          this.topping(row);
          break;
        case "downward":
          this.downward(row);
          break;
        case "upward":
          this.upward(row);
          break;
        default:
          break;
      }
    },
    /** 置顶按钮操作 */
    topping(row) {
      console.log(row.title)
      this.$modal.confirm('您确定要将"' + row.title + '"置顶 ?').then(function() {
        return toppings(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("置顶成功");
      }).catch(() => {});
    },
    /** 下架按钮操作 */
    downward(row) {
      console.log(row.title)
      this.$modal.confirm('您确定要将"' + row.title + '"下架 ?').then(function() {
        return downwards(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("下架成功");
      }).catch(() => {});
    },
    /** 上架按钮操作 */
    upward(row) {
      console.log(row.title)
      this.$modal.confirm('您确定要将"' + row.title + '"上架 ?').then(function() {
        return upwards(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("上架成功");
      }).catch(() => {});
    },
    /** 查询文章管理列表 */
    getList() {
      this.loading = true;
      listArticle(this.queryParams).then(response => {
        this.articleList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 转换分类数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    resetClinck(){
      this.form = {
        contentStyle: null
      }
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        title: null,
        abstracts: null,
        imgId: null,
        images: null,
        content: null,
        label: null,
        types: null,
        textlink: null,
        grants: null,
        keyword: null,
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
        sort: null,
        region: null,
        classId: null,
        luaguage: null,
        contentStyle: null
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
      this.title = "添加文章管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getArticle(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改文章管理";
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
      this.$modal.confirm('是否确认删除文章管理编号为"' + ids + '"的数据项？').then(function() {
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
