<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="渠道编码" prop="channelCode">
        <el-input
          v-model="queryParams.channelCode"
          placeholder="请输入短信渠道编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模板编码" prop="templateCode">
        <el-input
          v-model="queryParams.templateCode"
          placeholder="请输入模板编码"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="短信类型" prop="templateType">
        <el-select v-model="queryParams.templateType" placeholder="请选择短信类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.sys_sms_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发送状态" prop="sendStatus">
        <el-select v-model="queryParams.sendStatus" placeholder="请选择发送状态" clearable size="small">
          <el-option
            v-for="dict in dict.type.sys_common_status"
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
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          icon="el-icon-plus"-->
<!--          size="mini"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['system:smsLog:add']"-->
<!--        >新增</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          icon="el-icon-edit"-->
<!--          size="mini"-->
<!--          :disabled="single"-->
<!--          @click="handleUpdate"-->
<!--          v-hasPermi="['system:smsLog:edit']"-->
<!--        >修改</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="danger"-->
<!--          plain-->
<!--          icon="el-icon-delete"-->
<!--          size="mini"-->
<!--          :disabled="multiple"-->
<!--          @click="handleDelete"-->
<!--          v-hasPermi="['system:smsLog:remove']"-->
<!--        >删除</el-button>-->
<!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:smsLog:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="smsLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="短信渠道编码" align="center" prop="channelCode" />
      <el-table-column label="模板编码" align="center" prop="templateCode" />
      <el-table-column label="短信类型" align="center" prop="templateType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_sms_type" :value="scope.row.templateType"/>
        </template>
      </el-table-column>
      <el-table-column label="短信内容" align="center" prop="templateContent" />
      <el-table-column label="短信参数" align="center" prop="templateParams" />
      <el-table-column label="手机号" align="center" prop="mobile" />
      <el-table-column label="用户编号" align="center" prop="userId" />
      <el-table-column label="用户类型" align="center" prop="userType" />
      <el-table-column label="发送状态" align="center" prop="sendStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_common_status" :value="scope.row.sendStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" align="center" prop="sendTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.sendTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="接收状态" align="center" prop="receiveStatus" />
      <el-table-column label="接收时间" align="center" prop="receiveTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.receiveTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
<!--        <template slot-scope="scope">-->
<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-edit"-->
<!--            @click="handleUpdate(scope.row)"-->
<!--            v-hasPermi="['system:smsLog:edit']"-->
<!--          >修改</el-button>-->
<!--          <el-button-->
<!--            size="mini"-->
<!--            type="text"-->
<!--            icon="el-icon-delete"-->
<!--            @click="handleDelete(scope.row)"-->
<!--            v-hasPermi="['system:smsLog:remove']"-->
<!--          >删除</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改短信日志对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="短信渠道编号" prop="channelId">
          <el-input v-model="form.channelId" placeholder="请输入短信渠道编号" />
        </el-form-item>
        <el-form-item label="短信渠道编码" prop="channelCode">
          <el-input v-model="form.channelCode" placeholder="请输入短信渠道编码" />
        </el-form-item>
        <el-form-item label="模板编号" prop="templateId">
          <el-input v-model="form.templateId" placeholder="请输入模板编号" />
        </el-form-item>
        <el-form-item label="模板编码" prop="templateCode">
          <el-input v-model="form.templateCode" placeholder="请输入模板编码" />
        </el-form-item>
        <el-form-item label="短信类型" prop="templateType">
          <el-select v-model="form.templateType" placeholder="请选择短信类型">
            <el-option
              v-for="dict in dict.type.sys_sms_type"
              :key="dict.value"
              :label="dict.label"
:value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="短信内容">
          <editor v-model="form.templateContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="短信参数" prop="templateParams">
          <el-input v-model="form.templateParams" placeholder="请输入短信参数" />
        </el-form-item>
        <el-form-item label="短信 API 的模板编号" prop="apiTemplateId">
          <el-input v-model="form.apiTemplateId" placeholder="请输入短信 API 的模板编号" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="用户编号" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户编号" />
        </el-form-item>
        <el-form-item label="发送状态">
          <el-radio-group v-model="form.sendStatus">
            <el-radio
              v-for="dict in dict.type.sys_common_status"
              :key="dict.value"
:label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发送时间" prop="sendTime">
          <el-date-picker clearable size="small"
            v-model="form.sendTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择发送时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="发送结果的编码" prop="sendCode">
          <el-input v-model="form.sendCode" placeholder="请输入发送结果的编码" />
        </el-form-item>
        <el-form-item label="发送结果的提示" prop="sendMsg">
          <el-input v-model="form.sendMsg" placeholder="请输入发送结果的提示" />
        </el-form-item>
        <el-form-item label="短信 API 发送结果的编码" prop="apiSendCode">
          <el-input v-model="form.apiSendCode" placeholder="请输入短信 API 发送结果的编码" />
        </el-form-item>
        <el-form-item label="短信 API 发送失败的提示" prop="apiSendMsg">
          <el-input v-model="form.apiSendMsg" placeholder="请输入短信 API 发送失败的提示" />
        </el-form-item>
        <el-form-item label="短信 API 发送返回的唯一请求 ID" prop="apiRequestId">
          <el-input v-model="form.apiRequestId" placeholder="请输入短信 API 发送返回的唯一请求 ID" />
        </el-form-item>
        <el-form-item label="短信 API 发送返回的序号" prop="apiSerialNo">
          <el-input v-model="form.apiSerialNo" placeholder="请输入短信 API 发送返回的序号" />
        </el-form-item>
        <el-form-item label="接收时间" prop="receiveTime">
          <el-date-picker clearable size="small"
            v-model="form.receiveTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择接收时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="API 接收结果的编码" prop="apiReceiveCode">
          <el-input v-model="form.apiReceiveCode" placeholder="请输入API 接收结果的编码" />
        </el-form-item>
        <el-form-item label="API 接收结果的说明" prop="apiReceiveMsg">
          <el-input v-model="form.apiReceiveMsg" placeholder="请输入API 接收结果的说明" />
        </el-form-item>
        <el-form-item label="创建者" prop="creator">
          <el-input v-model="form.creator" placeholder="请输入创建者" />
        </el-form-item>
        <el-form-item label="更新者" prop="updater">
          <el-input v-model="form.updater" placeholder="请输入更新者" />
        </el-form-item>
        <el-form-item label="是否删除" prop="deleted">
          <el-input v-model="form.deleted" placeholder="请输入是否删除" />
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
import { listSmsLog, getSmsLog, delSmsLog, addSmsLog, updateSmsLog } from "@/api/system/sms/smsLog";

export default {
  name: "SmsLog",
  dicts: ['sys_sms_type', 'sys_common_status'],
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
      // 短信日志表格数据
      smsLogList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        channelId: null,
        channelCode: null,
        templateId: null,
        templateCode: null,
        templateType: null,
        templateContent: null,
        templateParams: null,
        apiTemplateId: null,
        mobile: null,
        userId: null,
        userType: null,
        sendStatus: null,
        sendTime: null,
        sendCode: null,
        sendMsg: null,
        apiSendCode: null,
        apiSendMsg: null,
        apiRequestId: null,
        apiSerialNo: null,
        receiveStatus: null,
        receiveTime: null,
        apiReceiveCode: null,
        apiReceiveMsg: null,
        creator: null,
        updater: null,
        deleted: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        channelId: [
          { required: true, message: "短信渠道编号不能为空", trigger: "blur" }
        ],
        channelCode: [
          { required: true, message: "短信渠道编码不能为空", trigger: "blur" }
        ],
        templateId: [
          { required: true, message: "模板编号不能为空", trigger: "blur" }
        ],
        templateCode: [
          { required: true, message: "模板编码不能为空", trigger: "blur" }
        ],
        templateType: [
          { required: true, message: "短信类型不能为空", trigger: "change" }
        ],
        templateContent: [
          { required: true, message: "短信内容不能为空", trigger: "blur" }
        ],
        templateParams: [
          { required: true, message: "短信参数不能为空", trigger: "blur" }
        ],
        apiTemplateId: [
          { required: true, message: "短信 API 的模板编号不能为空", trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" }
        ],
        sendStatus: [
          { required: true, message: "发送状态不能为空", trigger: "blur" }
        ],
        receiveStatus: [
          { required: true, message: "接收状态不能为空", trigger: "blur" }
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
    /** 查询短信日志列表 */
    getList() {
      this.loading = true;
      listSmsLog(this.queryParams).then(response => {
        this.smsLogList = response.rows;
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
        channelId: null,
        channelCode: null,
        templateId: null,
        templateCode: null,
        templateType: null,
        templateContent: null,
        templateParams: null,
        apiTemplateId: null,
        mobile: null,
        userId: null,
        userType: null,
        sendStatus: 0,
        sendTime: null,
        sendCode: null,
        sendMsg: null,
        apiSendCode: null,
        apiSendMsg: null,
        apiRequestId: null,
        apiSerialNo: null,
        receiveStatus: 0,
        receiveTime: null,
        apiReceiveCode: null,
        apiReceiveMsg: null,
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
      this.title = "添加短信日志";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSmsLog(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改短信日志";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSmsLog(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addSmsLog(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除短信日志编号为"' + ids + '"的数据项？').then(function() {
        return delSmsLog(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/smsLog/export', {
        ...this.queryParams
      }, `smsLog_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
