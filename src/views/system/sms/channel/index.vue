<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="短信签名" prop="signature">
        <el-input
          v-model="queryParams.signature"
          placeholder="请输入短信签名"
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
          v-hasPermi="['system:channel:add']"
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
          v-hasPermi="['system:channel:edit']"
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
          v-hasPermi="['system:channel:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:channel:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="channelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="签名编号" align="center" prop="id" />
      <el-table-column label="短信签名" align="center" prop="signature" />
      <el-table-column label="渠道来源" align="center" prop="code" />
      <el-table-column label="启用状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
<!--      <el-table-column label=" API 账号" align="center" prop="apiKey" />-->
<!--      <el-table-column label="API 秘钥" align="center" prop="apiSecret" />-->
<!--      <el-table-column label="回调地址" align="center" prop="callbackUrl" />-->
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:channel:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:channel:remove']"
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

    <!-- 添加或修改短信渠道对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="短信签名" prop="signature">
          <el-input v-model="form.signature" placeholder="请输入短信签名" />
        </el-form-item>
        <el-form-item label="渠道来源" prop="code">
          <el-select v-model="form.code" placeholder="请输入渠道编码">
            <el-option
              v-for="item in channel"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
<!--        <el-form-item label="渠道编码" prop="code">-->
<!--          <el-input v-model="form.code" placeholder="请输入渠道编码" />-->
<!--        </el-form-item>-->
        <el-form-item label="开启状态">
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >{{dict.label}}</el-radio>
        </el-radio-group>
      </el-form-item>
<!--        <el-form-item label=" API 账号" prop="apiKey">-->
<!--          <el-input v-model="form.apiKey" placeholder="请输入 API 的账号" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="API 秘钥" prop="apiSecret">-->
<!--          <el-input v-model="form.apiSecret" placeholder="请输入API 的秘钥" />-->
<!--        </el-form-item>-->
<!--        <el-form-item label="回调地址" prop="callbackUrl">-->
<!--          <el-input v-model="form.callbackUrl" placeholder="请输入短信发送回调 URL" />-->
<!--        </el-form-item>-->
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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
import { listChannel, getChannel, delChannel, addChannel, updateChannel, getDatas} from "@/api/system/sms/channel";

export default {
  name: "Channel",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      channel:[],
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
      // 短信渠道表格数据
      channelList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        signature: null,
        code: null,
        status: null,
        apiKey: null,
        apiSecret: null,
        callbackUrl: null,
        creator: null,
        updater: null,
        deleted: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        signature: [
          { required: true, message: "短信签名不能为空", trigger: "blur" }
        ],
        code: [
          { required: true, message: "渠道编码不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "开启状态不能为空", trigger: "blur" }
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
    this.channelDatas()
  },
  methods: {
    //下拉选择
    channelDatas(){
      getDatas().then(res=>{
        this.channel = res.data
      })
    },
    /** 查询短信渠道列表 */
    getList() {
      this.loading = true;
      listChannel(this.queryParams).then(response => {
        this.channelList = response.rows;
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
        signature: null,
        code: null,
        status: 0,
        remark: null,
        apiKey: null,
        apiSecret: null,
        callbackUrl: null,
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
      this.title = "添加短信渠道";


    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getChannel(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改短信渠道";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateChannel(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addChannel(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除短信渠道编号为"' + ids + '"的数据项？').then(function() {
        return delChannel(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/channel/export', {
        ...this.queryParams
      }, `channel_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
