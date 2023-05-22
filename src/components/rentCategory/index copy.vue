<template>
  <div class="app-container home">
      <el-form :model="queryParams" ref="queryForm" :inline="true"  label-width="68px">
        <el-form-item label="分类名称" prop="name">
            <el-input
            v-model="queryParams.name"
            placeholder="请输入分类名称"
            clearable
            size="small"
            style="width: 200px"
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
            v-hasPermi="['RentCategory','add']"
          >新增</el-button>
        </el-col>
      </el-row>
      <el-table v-loading="loading" :data="dataList" >
          <el-table-column label="ID" prop="id" align="center"/>
          <el-table-column label="分类名称" prop="name"  align="center" />
          <el-table-column label="分类ICON"  width="100" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <cus-image v-if="scope.row.img" :src="scope.row.img" alt="" :preview-src-list="[scope.row.img]"  style="width: 70px; height: 70px"/>
            </template>
          </el-table-column>
          <el-table-column label="链接" prop="applet_url"   align="center"/>
          <el-table-column label="排序" prop="sort"   align="center"/>
          <el-table-column label="项目" prop="program" align="center" >
            <template slot-scope="scope">
              <el-button type="primary" plain v-if="scope.row.program == 1" size='mini'>房产</el-button>
              <el-button type="success" plain v-if="scope.row.program == 2" size='mini'>商城</el-button>
              <el-button type="info" plain v-if="scope.row.program == 3" size='mini'>聚能屏</el-button>
            </template>
          </el-table-column>
          <el-table-column label="类型" prop="status" align="center" >
            <template slot-scope="scope">
                  <el-button type="primary" size='mini' plain v-if="scope.row.status == 1">正常</el-button>
                  <el-button type="warning" size='mini' plain v-else>停用</el-button>
            </template>
          </el-table-column>
          <!-- <el-table-column label="添加时间" prop="created_at"  align="center"/> -->
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['Category','edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                v-if="scope.row.program == 1"
                @click="handleNext(scope.row)"
              >查看下一级</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['Category','remove']"
              >删除</el-button>
            </template>
          </el-table-column>
      </el-table>
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
      <!-- 添加或修改配置对话框 -->
      <div v-show="!pagesOpen">
        <el-dialog :title="title" :visible.sync="open"  width="680px"  :close-on-click-modal='false'>
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-row> 
              <el-col :span="12">
                <el-form-item label="分类名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入分类名" />
                </el-form-item>
              </el-col>
              <el-col :span="12" style="display:flex">
              <!-- required -->
                <!-- <div style="color:#ff4949;margin-right:4px;">*</div> -->
                <el-form-item label="分类Icon" prop="img_id" >
                  <UploadsBox type='img_id' width='100'  :isChoice='1' :dialogImageUrl='imgs.img_id' @beforeUpload='beforeUpload' @handleRemove='handleRemove'></UploadsBox>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                  <el-form-item label="项目" prop="program">
                      <el-radio-group v-model="form.program" >
                          <el-radio :label="1">房产</el-radio>
                          <el-radio :label="2">商城</el-radio>
                          <el-radio :label="3">聚能屏</el-radio>
                      </el-radio-group>
                  </el-form-item> 
              </el-col>
              <el-col :span="12">
                <el-form-item label="前端路由" prop="applet_url">
                  <el-input v-model="form.applet_url"   placeholder="请输入前端路由"/>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="显示排序" prop="sort">
                  <el-input-number style="width:100%" v-model="form.sort" controls-position="right" :min="1" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="form.status">
                       <el-radio :label="1">显示</el-radio>
                       <el-radio :label="0">隐藏</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="12">
                <el-form-item label="排序" prop="sort">
                  <el-input-number v-model="form.sort" controls-position="right" :min="0" />
                </el-form-item>
              </el-col> -->
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer"  >
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="open = false,reset()">取 消</el-button>
          </div>
        </el-dialog>
      </div>
      <el-dialog title="二级分类" :visible.sync="Nextopen"  width="1080px"  :close-on-click-modal='false'>
        <el-form :model="queryParamsNext" ref="queryForm" :inline="true"  label-width="68px">
            <el-form-item label="分类名称" prop="name">
                <el-input
                v-model="queryParamsNext.name"
                placeholder="请输入分类名称"
                clearable
                size="small"
                style="width: 200px"
                @keyup.enter.native="handleQuery"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQueryNext">搜索</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQueryNext">重置</el-button>
            </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
            <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                size="mini"
                @click="handleAdd('Next')"
                v-hasPermi="['rentCategory','add']"
            >新增</el-button>
            </el-col>
      </el-row>
      <el-table v-loading="loadingNext" :data="dataListNext" >
          <el-table-column label="ID" prop="id" align="center"/>
          <el-table-column label="分类名称" prop="name"  align="center" />
          <el-table-column label="分类ICON"  width="100" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <cus-image v-if="scope.row.img" :src="scope.row.img" alt="" :preview-src-list="[scope.row.img]"  style="width: 70px; height: 70px"/>
            </template>
          </el-table-column>
          <el-table-column label="链接" prop="applet_url"   align="center"/>
          <el-table-column label="排序" prop="sort"   align="center"/>
          <el-table-column label="类型" prop="status" align="center" >
            <template slot-scope="scope">
                  <el-button type="primary" size='mini' plain v-if="scope.row.status == 1">正常</el-button>
                  <el-button type="warning" size='mini' plain v-else>停用</el-button>
            </template>
          </el-table-column>
          <!-- <el-table-column label="添加时间" prop="created_at"  align="center"/> -->
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['rentCategory','edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['rentCategory','remove']"
              >删除</el-button>
            </template>
          </el-table-column>
      </el-table>
      <pagination
        v-show="totalNext>0"
        :total="totalNext"
        :page.sync="queryParamsNext.page"
        :limit.sync="queryParamsNext.pageSize"
        @pagination="getListNext"
      />
      </el-dialog>
  </div>
</template>

<script>
import { 
    getCategoryList,
    createCategory,
    updateCategory,
    delCategory,
    } from "@/api/rentHouse/category";
export default {
    data(){
      // 验证 上传图片
      var updateImgRules = (rule, value, callback)=>{
        console.log(rule,value)
          if(!this.form[rule.field]){
              if(rule.field == 'img_id'){
                callback(new Error('请上传icon'));
              }
          }else{
              callback();
          }
      };
      return{
          queryParams:{
              page:1,
              pageSize:10,
              name:'',
          },
          queryParamsNext:{
              page:1,
              pageSize:10,
              name:'',
              pid:'',
              
          },
          loading:false,
          dataList:[],
          total:0,
          title:'',
          open:false,
          form:{
            pid:0,
            name:'',
            status:1,
            img_id:'',
            applet_url:'',
            sort:50,
            program:1,
          },
          rules:{
            name:[
              { required: true, message: "分类名称不能为空", trigger: "blur" }
            ],
            // redirect:[
            //   { required: true, message: "路由不能为空", trigger: "blur" }
            // ],
            img_id:[
              // { required: true, message: "分类Icon不能为空", trigger: "change" },
              { validator: updateImgRules, trigger: 'blur'}
            ]
          },
          imgs:{
            img_id:[]
          },
          pagesDataList:[],
          pagesLoading:false,
          pagesOpen:false,
          pagesQueryParams:{
            keywords:''
          },
          Nextopen:false,
          loadingNext:false,
          dataListNext:[],
          totalNext:0,
      }
    },
    mounted(){
      this.getList()

    },
    methods:{
      // 查看下一级
      handleNext(row){
          this.Nextopen = true
          this.queryParamsNext.pid = row.id
          this.getListNext()
      },
      handleQueryNext(){
        this.queryParamsNext.page = 1
        this.getListNext()
      },
      resetQueryNext(){
        this.queryParamsNext={
              page:1,
              pageSize:10,
              name:'',
              pid:this.queryParamsNext.pid
        }
        this.getListNext()
      },
      getListNext(){
        this.loadingNext = true
        getCategoryList(this.queryParamsNext).then(res=>{
          this.dataListNext = res.data.list
          this.totalNext = res.data.total
          this.loadingNext = false
        })
      },
      reset(type){
        this.resetForm("form");
        this.form={
            pid:type ? this.queryParamsNext.pid : 0,
            name:'',
            status:1,
            img_id:'',
            applet_url:'',
            sort:50,
            program:1,
          }
          this.imgs={
            img_id:[]
          }
      },
      submitForm(){
        this.$refs["form"].validate(valid => {
            if(valid){
                console.log(this.form)
               this.form.pid = this.form.pid == '' ? 0 : this.form.pid
              if(this.form.id){
                updateCategory(this.form).then(res=>{
                  this.msgSuccess("修改成功");
                  this.open = false
                  if(this.form.pid){
                      this.getListNext()
                  }else{
                      this.getList();
                  }
                  
                })
              }else{
                createCategory(this.form).then(res=>{
                  this.msgSuccess("添加成功");
                  this.open = false
                   if(this.form.pid){
                      this.getListNext()
                  }else{
                      this.getList();
                  }
                })
              }
            }
        })
      },
      getList(){
        this.loading = true
        getCategoryList(this.queryParams).then(res=>{
          this.dataList = res.data.list
          this.total = res.data.total
          this.loading = false
        })
      },
      handleUpdate(row){
        this.reset()
        this.form = {...row}
        this.imgs={
            img_id:[{id:row.img_id,image_url:row.img}]
        }
        this.open = true
      },
      handleDelete(row){
        this.$confirm('是否确认删除名称"' + row.name + '"的数据项?', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(function() {
            return delCategory({id:row.id});
          }).then(() => {
            if(row.pid){
                this.getListNext()
            }else{
                this.getList();
            }
            this.msgSuccess("删除成功");
          })
      },
      handleQuery(){
        this.queryParams.page = 1
        this.getList()
      },
      resetQuery(){
        this.queryParams={
              page:1,
              pageSize:10,
              name:''
        }
        this.getList()
      },
      handleAdd(type){
        this.open = true
        this.title='添加分类'
        this.reset(type)
      },
      beforeUpload(data){
        this.imgs[data.type] = data.data
        this.form[data.type] = data.ids.toString()
      },
      handleRemove(data){
        this.imgs[data.type] =data.data
        this.form[data.type] = data.ids.toString()
      }
    }
}
</script>

<style>
  .custom-index{
    z-index: 2006;
  }
</style>