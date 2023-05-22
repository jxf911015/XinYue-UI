<template>
  <div style="padding:30px;">
    <el-row :gutter="20">
      <el-col v-loading="loading" :span="10">
        <el-tree
          ref="tree"
          class="tree-scroll"
          node-key="id"
          :data="treeData"
          :props="defaultProps"
          show-checkbox
          :default-expanded-keys="expanded"
          @node-drop="handleDrop"
          @node-click="handleNodeClick"
        >
          <span slot-scope="{node, data}" class="custom-tree-node action">
            <span>
              {{ data.name }} 
              <template v-if="data.program == 1"> (地产)</template>
              <template v-if="data.program == 2"> (商城)</template>
              <template v-if="data.program == 3"> (聚能屏)</template>
            </span>
            <span class="active">
              <el-button
                type="text"
                size="mini"
                @click.stop="handleAppend(data)"
              >
                新增
              </el-button>
              <el-button
                type="text"
                size="mini"
                @click.stop="remove(data.id)"
              >
                删除
              </el-button>
            </span>
          </span>
        </el-tree>
        <div style="padding:20px; 0">
          <el-button size="mini" @click="NewClass">新增一级分类</el-button>
        </div>
      </el-col>
      <el-col :span="14">
        <el-card

          class="box-card"
          shadow="never"
        >
          <!--v-if="auth.add || auth.set"-->
          <div slot="header">
            <span>{{ textMap[formStatus] }}</span>

            <el-button
              v-if="formStatus === 'create' "
              size="mini"
              :loading="formLoading"

              style="float: right;margin-right: 10px;"
              class="el-icon-ali-add"
              @click="AddList"
            >添加</el-button>
            <el-button
              v-else-if="formStatus === 'update' "
              size="mini"
              :loading="formLoading"
              icon="el-icon-edit"
              style="float: right; margin-right: 10px;"
              @click="update"
            >编辑</el-button>

          </div>
          <el-form
            ref="form"
            :model="form"
            :rules="rules"
            label-width="80px"
          >
            <el-form-item
              label="上级分类"
              prop="pid"
            >
              <el-cascader
                v-model="form.pid"
                placeholder="不选择表示顶层分类"
                :options="treeData"
                :props="cascaderProps"
                :change-on-select="true"
                style="width:100%;"
                clearable
                filterable
              />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="名称"
                  prop="name"
                >
                  <el-input
                    v-model="form.name"
                    placeholder="请输入商品分类名称"
                    :clearable="true"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12" style="display:flex">
                <el-form-item label="分类Icon" prop="img_id" >
                  <UploadsBox type='img_id' width='100'  :isChoice='1' :dialogImageUrl='imgs.img_id' @beforeUpload='beforeUpload' @handleRemove='handleRemove'></UploadsBox>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                  <el-form-item label="项目" prop="program">
                    <!-- :disabled="formStatus == ''" -->
                      <el-radio-group v-model="form.program" :disabled="isProgram">
                          <el-radio :label="1">房产</el-radio>
                          <el-radio :label="2">商城</el-radio>
                          <el-radio :label="3">聚能屏</el-radio>
                      </el-radio-group>
                  </el-form-item> 
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="前端路由" prop="applet_url">
                  <el-input v-model="form.applet_url"   placeholder="请输入前端路由"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
            <el-col :span="12">
                <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="form.status">
                       <el-radio :label="1">显示</el-radio>
                       <el-radio :label="0">隐藏</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="排序"
                  prop="sort"
                >
                  <el-input-number
                    v-model="form.sort"
                    :min="0"
                    :max="255"
                    style="width: 240px;"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>

          </el-form>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>
<script>
// import { getCategory, addCategory, setCategory, updateCategory, deleteCategory } from '@/api/shop/category'
import { 
  getCategoryAllList,
    createCategory,
    updateCategory,
    delCategory,
    } from "@/api/rentHouse/category";
var array
export default {
  data() {
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
    return {
      categoryTree: [], // 没有遍历过的分类
      treeData: [], // 分类列表
      defaultProps: {
        children: 'children',
        label: 'name',
        value: 'id'
      },
      cascaderProps: {
        children: 'children',
        label: 'name',
        value: 'id',
        checkStrictly: true
      },
      loading: true,
      expanded: [],
      formStatus: 'create',
      formLoading: false,
      textMap: {
        create: '新增分类',
        update: '编辑分类'
      },
      stateButton: {
        create: '确定',
        update: '修改'
      },
      auth: {
        add: false,
        del: false,
        set: false,
        enable: false,
        disable: false,
        move: false
      },
      form: {
        pid:0,
        name:'',
        status:1,
        img_id:'',
        applet_url:'',
        sort:50,
        program:1,
      },
      ids: '', // 编辑的时候 选中的id
      imgs:{
            img_id:[]
      },
      rules: {
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
      isProgram :false
    }
  },
  computed: {

  },
  watch: {
    [`form.pid`](val) {
      if (!val || val.length === 0) {
        this.formStatus = 'create'
        this.form = {
          pid:0,
          name:'',
          status:1,
          img_id:'',
          applet_url:'',
          sort:50,
          program:1,
        }
      }
    }
  },
  created() {
    this.categoryList()
  },
  methods: {
    // x新增一级分类
    NewClass() {
      this.formStatus = 'create'
      this.form = {
        pid:0,
        name:'',
        status:1,
        img_id:'',
        applet_url:'',
        sort:50,
        program:1,
      }
      this.imgs = {
          img_id:[]
      }
      this.isProgram = false
    },
    // 更新分类
    update() {
      if (!this.ids) {
        return
      }
      if (this.form.pid) {
        this.form.id = this.form.pid[this.form.pid.length - 1]
      } else {
        this.form.id = 0
      }
      updateCategory(this.form).then(res => {
        if (res.success) {
          this.$message({
            message: '编辑成功',
            type: 'success'
          })
          this.formStatus = 'create'
          this.form = {
            pid:0,
            name:'',
            status:1,
            img_id:'',
            applet_url:'',
            sort:50,
            program:1,
          }
          this.imgs = {
                  img_id:[]
              }
          this.categoryList()
        }
      })
    },
    // 删除分类
    remove(e) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delCategory({id:e}).then(res => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.categoryList()
          }
        })
      }).catch(() => {})
    },
    handleDrop(e) {

    },
    // 添加新增分类
    AddList() {
      if (this.form.pid) {
        this.form.pid = this.form.pid[this.form.pid.length - 1]
      } else {
        this.form.pid = 0
      }
      this.$refs['form'].validate((valid) => {
        if (valid) {
          createCategory(this.form).then(res => {
            console.log(res)
            if (res.success) {
              this.$message({
                message: '添加成功',
                type: 'success'
              })
              this.form = {
                pid:0,
                name:'',
                status:1,
                img_id:'',
                applet_url:'',
                sort:50,
                program:1,
              }
              this.imgs = {
                  img_id:[]
              }
              this.categoryList()
            } else {
              this.$message({
                message: '添加失败',
                type: 'error'
              })
            }
          })
        }
      })
    },
    // 点击树节点事件
    handleNodeClick(data) {
      this.isProgram = true
      this.formStatus = 'update'
      this.ids = data.id
      array = []
      this.form = {
        pid:data.pid,
        name:data.name,
        status:data.status,
        img_id:data.img_id,
        applet_url:data.applet_url,
        sort:data.sort,
        program:data.program,
      }
      this.imgs = {
          img_id:[{id:data.img_id,image_url:data.img}]
      }
    },
    // 获取分类列表
    categoryList() {
      getCategoryAllList().then(res => {
        this.treeData = this.getTreeData(res.data)
        this.loading = false
        this.categoryTree =  this.getFlatArr(res.data)
      })
    },
    getFlatArr(arr) {
      return arr.reduce((a, item) => {
          let flatArr = [...a, item];
        
        // 可以在此处限制各种需要的条件，在展示字段前加空格，——之类的，以及其它情况
        
          if (item.children) {
            flatArr = [...flatArr, ...this.getFlatArr(item.children)];
          }
          return flatArr;
      }, []);
    },
    // 追加分类
    handleAppend(key) {
      this.isProgram = true
      this.form = {
        pid:0,
        name:'',
        status:1,
        img_id:'',
        applet_url:'',
        sort:50,
        program:this.form.program,
      }
      this.imgs = {
        img_id:[]
      }
      array = []
      this.formStatus = 'create'
      const pid = this.getData(this.categoryTree, key.id) || [0]
      this.form.pid = pid
    },
    // 新增分类表单初始化
    handleCreate(status) {
      this.resetElements(status)
      if (this.$refs.tree.getCurrentKey()) {
        this.$refs.tree.setCurrentKey(null)
      }
    },
    // 重置元素
    resetElements(val = 'create') {
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })

      this.formStatus = val
      this.formLoading = false
    },
    getTreeData(data) {
      // 循环遍历json数据
      for (var i = 0; i < data.length; i++) {
        data[i].children = data[i].children == undefined ? [] : data[i].children
        if (data[i].children.length < 1) {
          // children若为空数组，则将children设为undefined
          data[i].children = undefined
        } else {
          // children若不为空数组，则继续 递归调用 本方法
          this.getTreeData(data[i].children)
        }
      }
      return data
    },

    getData(data, id) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].id == id) {
          array = [data[i].id].concat(array)
          this.getData(data, data[i].pid)
        }
      }
      return array
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
<style lang="scss" scoped>
  .custom-tree-node{
    width: 80%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tree-scroll {
    max-height: 640px;
    overflow: auto;
    padding-bottom: 1px;
  }
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
  .brother-showing i {
    width: 16px;
  }
  .active {
    display: none;
  }
  .action:hover .active{
    display: block;
  }
  .move-tree {
    color: #C0C4CC;
    cursor: move;
  }
  .status-tree {
    color:#C0C4CC;
    text-decoration: line-through
  }
  .box-card {
    border-radius: 0;
    border: 1px solid #e9e9e9;
  }
  .popover-image {
    text-align: center;
    line-height: 0;
  }
  .popover-image img {
    vertical-align: middle;
    cursor: pointer;
  }
  .el-image .el-image__error {
    line-height: 1.4;
  }

</style>
