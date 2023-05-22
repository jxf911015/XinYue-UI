<template>
  <div class="Modal">
    <el-row class="colLeft">
      <el-col :xl="6" :lg="6" :md="6" :sm="6" :xs="24" class="colLeft">
        <div class="Nav">
          <div class="input">
            <el-input
              enter-button
              placeholder="请输入分类名称"
              v-model="uploadName.keyword"
              style="width: 90%"
              class="input"
              clearable
              @input="changePage"
            />
          </div>
          <div class="trees-coadd">
            <div class="scollhide">
              <div class="trees">
                <el-tree
                  :data="treeData"
                  :expand-on-click-node="false"
                  :render-content="renderContent"
                  node-key="id"
                  @node-click='appendBtn'
                  :load-data="loadData"
                  :props="defaultProps"
                  class="treeBox"
                  ref="tree"
                ></el-tree>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xl="18" :lg="18" :md="18" :sm="18" :xs="24" class="colLeft">
        <div class="conter">
          <div class="bnt acea-row row-middle">
            <el-col :span="24">
              <el-button
                type="primary"
                :disabled="checkPicList.length === 0"
                @click="checkPics"
                class="mr10"
                v-if="isShow !== 0 && type != 'exhibition'"
                size="small"
                >使用选中图片</el-button
              >
              <el-upload
                action="#"
                class="mr10 mb10"
                ref="upload"
                :http-request="requestUpload"
                :before-upload="beforeUpload"
                multiple
                :show-file-list="false"
                style="margin-top: 1px; display: inline-block;height:40px;line-height:40px"
              >
                <el-button type="primary" size="small">上传图片</el-button>
              </el-upload>
              <el-button
                v-if="type == 'exhibition'"
                v-hasPermi="['Picture','add']"
                type="success" size="small"
                @click.stop="appendBut"
                class="mr10">添加分类
              </el-button>
              <el-button
                type="error"
                class="mr10 "
                size="small"
                v-if="type == 'exhibition'"
                :disabled="checkPicList.length === 0"
                v-hasPermi="['Picture','remove']"
                @click.stop="deletePicture()"
                >删除图片</el-button
              >
              </el-col>
                <el-col :span="12">
                  <div class="mb10">
                    <el-input size="small" class="mr10" v-model="queryParams.names" placeholder="请输入内容" style="width:250px" ></el-input>
                    <el-button @click="getFileList();queryParams.pageNum=1"  size="small" slot="append" type="primary"  icon="el-icon-search"></el-button>
                  </div>
                </el-col>
                <el-col :span="12" height='42'>
                   <el-link :underline="false" type="primary"> 当前选中分类：{{currentTree ? currentTree.name : ''}}</el-link>
                </el-col>
          </div>
          <div class="pictrueList acea-row">
            <el-row :gutter="24" class="conter">
              <div v-show="isShowPic" class="imagesNo">
                <el-icon type="ios-images" size="60" color="#dbdbdb" />
                <span class="imagesNo_sp">图片库为空</span>
              </div>
              <div class="acea-row mb10"
               style="display: flex;align-items: center;  flex-wrap: wrap;">
                <div
                  class="pictrueList_pic mr10 mb10"
                  v-for="(item, index) in pictrueList"
                  :key="item.id"
                  @mouseenter="enterMouse(item)"
                  @mouseleave="enterMouse(item)"
                >
                  <p class="number" v-if="item.num > 0">
                    <el-badge :value="item.num" type="danger" >
                      <a href="#" class="demo-badge"></a>
                    </el-badge>
                  </p>
                  <img
                    :class="item.isSelect ? 'on' : ''"
                    :src="item.imageUrl"
                    @click.stop="changImage(item, index, pictrueList)"
                  />
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;"
                    @mouseenter="enterLeave(item)"
                    @mouseleave="enterLeave(item)"
                  >
                    <p style="width: 80%" v-if="!item.isEdit">
                      {{ item.name }}
                    </p>
                    <el-input
                      size="small"
                      style="width: 80%"
                      type="text"
                      v-model="item.name"
                      v-else
                      @on-blur="bindTxt(item)"
                    />
                  </div>
                  <div
                    class="nameStyle"
                    v-show="item.realName && item.real_name"
                  >
                    {{ item.real_name }}
                  </div>
                </div>
              </div>
            </el-row>
          </div>
          <div class="footer acea-row row-right">
           <pagination
              v-show="total>0"
              :total="total"
              :page.sync="queryParams.pageNum"
              :limit.sync="queryParams.pageSize"
               @pagination="getFileList"
            />
          </div>
        </div>
      </el-col>
    </el-row>
     <el-dialog
        :visible.sync="modalPic"
        width="424px"
        :close-on-click-modal='false'
        scrollable
        footer-hide
        closable
        :title="title"
        :mask-closable="false"
        :z-index="10"
      >
        <el-form :model="form" ref="formsa" :rules="rules" label-width="100px">
          <el-form-item label="相册名称" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="上级分类 ">
           <el-cascader
              v-model="form.parentId"
              :options="treeData"
              :props="{...defaultProps,checkStrictly: true}"
             ></el-cascader>
             <el-link :underline="false" class="ml100">默认不选择是一级</el-link>
          </el-form-item>
          <el-form-item label="相册标识" prop="extra">
            <el-input v-model="form.extra"  />
          </el-form-item>
<!--          <el-form-item label="备注">-->
<!--            <el-input v-model="form.remark" show-word-limit maxlength="30" type="textarea"/>-->
<!--          </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataScope">确 定</el-button>
        <el-button @click="modalPic = false,reset()">取 消</el-button>
      </div>
     </el-dialog>
  </div>
</template>

<script>
import {createCategory, removeCategory, getCategoryList, updateCategory, delCategoryByid} from "@/api/system/category";
import {getAlbumList, delPicture, addPicture, uploadPicture} from "@/api/system/picture";
import store from '@/store'
export default {
  name: "uploadPictures",
  props: {
    isChoice: {
      type: Number,
      default: 1,
    },
    gridBtn: {
      type: Object,
      default: null,
    },
    gridPic: {
      type: Object,
      default: null,
    },
    isShow: {
      type: Number,
      default: 1,
    },
    type:{
      type:String,
      default:''
    }
  },
  data() {
    return {
      queryParams:{
        pageNum:1,
        pageSize:20,
        name:''
      },
      form:{
        name:'',
        parentId:0,
        extra:'',
        type:1,
      },
      defaultProps: {
        children: "children",
        label: "name",
        value:'id'
      },
      spinShow: false,
      modalPic: false,
      treeData: [],
      treeData2: [],
      pictrueList: [],
      uploadData: {}, // 上传参数
      checkPicList: [],
      uploadName: {
        keyword: "",
      },
      FromData: null,
      treeId: 0,
      isJudge: false,
      buttonProps: {
        type: "default",
        size: "small",
      },
      fileData: {
        pid: 0,
        pageNum: 1,
        pageSize: 20,
      },
      total: 0,
      pids: 0,
      list: [],
      modalTitleSs: "",
      isShowPic: false,
      ids: [], // 选中附件的id集合
      // 表单校验
      rules: {
        name: [
          { required: true, message: "相册名称不能为空", trigger: "blur" }
        ],
        extra: [
          { required: true, message: "相册标识不能为空", trigger: "blur" }
        ],
      },
      title:'添加图片分类',
      currentTree:{}
    };
  },
  mounted() {
    this.resetForm("formsa");
    this.getCategory()
  },
  methods: {
    submitDataScope(){
      this.$refs["formsa"].validate(valid => {
        if(valid){
          let form = {...this.form}
          form.parentId =Array.isArray(form.parentId) ?  form.parentId[form.parentId.length-1]: form.parentId
          form.type=1
          if(form.id){
            updateCategory(form).then(res=>{
              this.$modal.msgSuccess("保存成功");
              this.modalPic = false;
              this.getCategory()
              this.reset()
            })
          }else{
            createCategory(form).then(res=>{
              console.log("res:"+res)
              this.$modal.msgSuccess("保存成功");
              this.modalPic = false;
              this.getCategory()
              this.reset()
            })
          }
        }
      })
    },
    // 表单重置
    reset() {
      this.form = {
        name:'',
        parentId:0,
        extra:'',
      };
      this.resetForm("formsa");
    },
    enterMouse(item) {
      item.realName = !item.realName;
    },
    enterLeave(item) {
      item.isShowEdit = !item.isShowEdit;
    },
    // 树状图
// <span>
//                  {route.meta.add ? (
//                    <el-button className='mr5' type="text" on-click={(e) => this.append(data, e)}>
//                      <i className="el-icon-circle-plus-outline"></i>
//                    </el-button>
//                  ) : (``)}
//   {route.meta.edit ? (
//     <el-button className='mr5' type="text" on-click={(e) => this.editPic(data, e)}>
//       <i className="el-icon-edit"></i>
//     </el-button>
//   ) : (``)}
//   {route.meta.remove ? (
//     <el-button className='mr5' type="text" on-click={(e) => this.remove(data, e)}>
//       <i className="el-icon-delete" size='20'></i>
//     </el-button>
//   ) : (``)}
//               </span>
    renderContent(h, { root, node, data }) {
      const  permission_routes= store.getters.permission_routes
      const route = this.find(permission_routes,'Picture')
      console.log(route)
         return (
          <span class="custom-tree-node">
            <span>{node.label}</span>
            { this.type == 'exhibition' ? (
               <span >

                  <el-button class='mr5' type="text" on-click={ (e) => this.append(data,e) }>
                    <i class="el-icon-circle-plus-outline"></i>
                  </el-button>
                 <el-button class='mr5' type="text" on-click={ (e) => this.editPic(data,e) }>
                  <i class="el-icon-edit"></i>
                 </el-button>
                 {data.id != 1 ? (
                   <el-button class='mr5' type="text" on-click={ (e) => this.remove(data,e) }>
                    <i class="el-icon-delete" size='20'></i>
                   </el-button>
                 ) : (``)}
              </span>
            ):(``)}
          </span>);

    },
    find(arr, name) {
      if (arr == null) return null;
      for (let obj of arr) {
          if (obj.name == name) {
              return obj;
          }
          let ret = this.find(obj.children, name);
          if (ret) return ret;
      }
      return null;
    },
    // 下拉树
    handleCheckChange(root, node, data, e) {
      this.list = [];
      // this.pids = 0;
      let value = data.id;
      let title = data.title;
      this.list.push({
        value,
        title,
      });
      if (this.ids.length) {
        this.pids = value;
        this.getMove();
      } else {
        this.$Message.warning("请先选择图片");
      }
      let selected = this.$refs.reference.$el.querySelectorAll(
        ".ivu-tree-title-selected"
      );
      for (let i = 0; i < selected.length; i++) {
        selected[i].className = "ivu-tree-title";
      }
      e.path[0].className = "ivu-tree-title  ivu-tree-title-selected"; // 当前点击的元素
    },
    // 移动分类
    // getMove() {
    //   let data = {
    //     pid: this.pids,
    //     images: this.ids.toString(),
    //   };
    //   moveApi(data)
    //     .then(async (res) => {
    //       this.$Message.success(res.msg);
    //       this.getFileList();
    //       this.pids = 0;
    //       this.checkPicList = [];
    //       this.ids = [];
    //     })
    //     .catch((res) => {
    //       this.$Message.error(res.msg);
    //     });
    // },
    //删除分类按钮操作
    deletePicture() {
      let ids = this.ids.toString()
      this.$modal.confirm('是否确认删除id为"' + ids + '"的图片？').then(function() {
        return delPicture(ids);
      }).then(response => {
        console.log(response.msg)
        this.getFileList();
        this.$modal.msgSuccess(response.msg);
      }).catch(() => {
      });
    },
    // 鼠标移入 移出
    onMouseOver(root, node, data) {
      event.preventDefault();
      data.flag = !data.flag;
      if (data.flag2) {
        data.flag2 = false;
      }
    },
    onClick(root, node, data, e) {
      e.preventDefault();
      data.flag2 = !data.flag2;
    },
    // 点击树
    appendBtn(root) {
      this.currentTree = root
      this.treeId = root.id
      this.queryParams={
        pageNum:1,
        pageSize:20,
      }
      this.getFileList()
    },
    // 点击添加
    append(data,e) {
      e.preventDefault();
      this.treeId = data.id || 0;
      this.title='添加图片分类'
      this.form.parentId = data.id
      this.modalPic = true;
    },
    appendBut(){
       this.treeId =  0;
       this.form.parentId = 0
       this.modalPic = true;
    },
    // 删除分类
    remove(data,e) {
      this.$confirm('此操作将永久删除该目录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          delCategoryByid({id:data.id}).then(res=>{
            this.getCategory()
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          })

        }).catch(() => {

        });
    },
    // 编辑树表单
    editPic(data,e) {
      e.preventDefault();
      console.log(data)
      detAlbumDetails({id:data.id}).then(res=>{
        console.log(res)
      })
      this.treeId = data.id;
      this.form = {...data}
      this.title='修改图片分类'
      this.form.parentId = data.pid
      this.modalPic = true;
    },
    // 搜索分类
    changePage() {
      this.getCategory("search");
    },
    // 分类列表树
    getCategory(type) {
      this.queryParams.name = this.uploadName.keyword;

       getCategoryList(this.queryParams).then(res=>{
        this.treeData = res.data
        this.currentTree = res.data[0]
        this.treeId = this.currentTree.id
        this.getFileList()
      })
    },
    loadData(item, callback) {
      getCategoryListApi({
        pid: item.id,
      })
        .then(async (res) => {
          const data = res.data.list;
          callback(data);
        })
        .catch((res) => {});
    },
    addFlag(treedata) {
      treedata.map((item) => {
        this.$set(item, "flag", false);
        this.$set(item, "flag2", false);
        item.children && this.addFlag(item.children);
      });
    },
    // 文件列表
    getFileList() {
      this.checkPicList = [];
      this.queryParams.name=this.queryParams.names
      getAlbumList({classId:this.treeId,...this.queryParams}).then(res=>{
        this.pictrueList = res.rows
        this.total = res.total
        if(this.pictrueList.length == 0){
          this.isShowPic = true;
        }else{
          this.isShowPic = false;
        }
      })
    },
    // 上传限制
    beforeUpload(file){
      //请求接口 检验文件格式与大小 此处暂时前台计算
      var testmsg = file.name.substring(file.name.lastIndexOf('.')+1)
      const extension1 = testmsg === 'jpeg'
      const extension2 = testmsg === 'jpg'
      const extension3 = testmsg === 'gif'
      const extension4 = testmsg === 'png'
      const isLt2M = file.size / 1024 / 1024 < 20
      if(!extension1 && !extension2 && !extension3 && !extension4) {
        this.$message({
          message: 'jpeg/jpg/gif/png格式!',
          type: 'warning'
        });
      }
      if(!isLt2M) {
        this.$message({
          message: '上传文件大小不能超过 20MB!',
          type: 'warning'
        });
      }
      return extension1 && isLt2M || extension2 && isLt2M || extension3 && isLt2M || extension4 && isLt2M
    },
    // 上传行为
    requestUpload(param) {
      let file = param.file
      let formData = new FormData();
      formData.append("file", file);
      formData.append("path", "");
      uploadPicture(formData).then(response => {
        let form1Data = new FormData();
        form1Data.append("name", response.fileName);
        form1Data.append("classId",  this.treeId);
        form1Data.append("imageUrl",  response.url);
        addPicture(form1Data).then(response => {
          this.$message({
            message: '图片上传成功',
            type: 'success'
          });
          this.getFileList();
        });
      });
    },
    // 关闭
    cancel() {
      this.$emit("changeCancel");
    },
    // 选中图片
    changImage(item, index, row) {
      let activeIndex = 0;
      if (!item.isSelect) {
        item.isSelect = true;
        this.checkPicList.push(item);
      } else {
        item.isSelect = false;
        this.checkPicList.map((el, index) => {
          if (el.id == item.id) {
            activeIndex = index;
          }
        });
        this.checkPicList.splice(activeIndex, 1);
      }
      this.ids = [];
      this.checkPicList.map((item, i) => {
        this.ids.push(item.id);
      });
      this.pictrueList.map((el, i) => {
        if (el.isSelect) {
          this.checkPicList.filter((el2, j) => {
            if (el.id == el2.id) {
              el.num = j + 1;
            }
          });
        } else {
          el.num = 0;
        }
      });
    },
    // 点击使用选中图片
    checkPics() {
      if(this.checkPicList.length>this.isChoice){
         return this.msgError(`最多只能选${this.isChoice}张图片`);
      }
        this.$emit("getPicD", this.checkPicList);
    },
    editName(item) {
      let it = item.real_name.split(".");
      let it1 = it[1] == undefined ? [] : it[1];
      let len = it[0].length + it1.length;
      item.editName =
        len < 10
          ? item.real_name
          : item.real_name.substr(0, 2) + "..." + item.real_name.substr(-5, 5);
    },
    // 修改图片文字上传
    bindTxt(item) {
      if (item.real_name == "") {
        this.$Message.error("请填写内容");
      }
      fileUpdateApi(item.att_id, {
        real_name: item.real_name,
      })
        .then((res) => {
          this.editName(item);
          item.isEdit = false;
          this.$Message.success(res.msg);
        })
        .catch((error) => {
          this.$Message.error(error.msg);
        });
    },
  },
};
// lang="stylus"
</script>

<style scoped  lang="stylus" >
/deep/ .el-input__inner{
  border-color:#DCDFE6 !important;
}
/deep/ .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
/deep/ .el-upload.el-upload--text{
    height: 0;
    width: 100px;
    line-height:0;
}
/deep/ .el-badge__content.is-fixed{
  top: 12px;
  right: 30px;
}
.nameStyle {
  position: absolute;
  white-space: nowrap;
  z-index: 9;
  background: #eee;
  height: 20px;
  line-height: 20px;
  color: #555;
  border: 1px solid #ebebeb;
  padding: 0 5px;
  left: 56px;
  bottom: -18px;
}

.iconbianji1 {
  font-size: 13px;
}

/deep/.ivu-badge-count {
  margin-top: 18px !important;
  margin-right: 19px !important;
}

/deep/ivu-tree-title-selected:hover {
  color: unset;
  background-color: unset;
}

/deep/.ivu-tree-title {
  padding: 0;
  // width: 200px;
  width: 100%;
}

/deep/.ivu-span {
  padding: 0;
  display: flex !important;
  justify-content: space-between;
}

/deep/.ivu-tree ul li {
  margin: 0;
}

/deep/.ivu-tree-arrow {
  width: 17px;
  color: #626262;
}

/deep/.ivu-span:hover {
  background: #F5F5F5;
  color: rgba(0, 0, 0, 0.4) !important;
}

/deep/.ivu-tree-arrow i {
  vertical-align: bottom;
}

.Nav /deep/.ivu-icon-ios-arrow-forward:before {
  content: '\F341' !important;
  font-size: 20px;
}

/deep/.ivu-btn-icon-only.ivu-btn-small {
  padding: unset !important;
}

.selectTreeClass {
  background: #d5e8fc;
}

.treeBox {
  width: 100%;
  height: 100%;

  >>> .ivu-tree-title-selected, .ivu-tree-title-selected:hover {
    color: #2D8cF0 !important;
    background-color: #fff !important;
  }

  >>> .ivu-btn-icon-only {
    width: 20px !important;
    height: 20px !important;
  }

  >>> .ivu-tree-title:hover {
    color: #2D8cF0 !important;
    background-color: #fff !important;
  }
}

.pictrueList_pic {
  position: relative;
  width: 120px;
  cursor: pointer;

  img {
    width: 100%;
    height: 120px;
  }

  p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 20px;
    text-align: center;
  }

  .number {
    height: 33px;
  }

  .number {
    position: absolute;
    right: 0;
    margin:0;
    top: 0;
  }
}

.trees-coadd {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  .scollhide {
    overflow-x: hidden;
    overflow-y: scroll;
    padding: 10px 0 10px 0;
    box-sizing: border-box;

    .trees {
      width: 100%;
      height: 374px;
    }
  }

  .scollhide::-webkit-scrollbar {
    display: none;
  }
}

.treeSel >>>.ivu-select-dropdown-list {
  padding: 0 5px !important;
  box-sizing: border-box;
  width: 200px;
}

.imagesNo {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin: 65px 0;

  .imagesNo_sp {
    font-size: 13px;
    color: #dbdbdb;
    line-height: 3;
  }
}

.Modal {
  width: 100%;
  height: 100%;
  background: #fff !important;
}

.Nav {
  width: 100%;
  border-right: 1px solid #eee;
}

.colLeft {
  padding-right: 0 !important;
  height: 100%;
}

.conter {
  width: 100%;
  height: 100%;
  margin-left: 0 !important;
}

.conter .bnt {
  width: 100%;
  padding: 0 13px 10px 8px;
  box-sizing: border-box;
}

.conter .pictrueList {
  padding-left: 6px;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  // height: 300px;
}

.conter .pictrueList img {
  width: 100%;
  border: 2px solid #fff;
}

.conter .pictrueList img.on {
  border: 2px solid #5FB878;
}

.conter .footer {
  padding: 0 20px 10px 20px;
}

.demo-badge {
  width: 42px;
  height: 42px;
  background: transparent;
  border-radius: 6px;
  display: inline-block;
}

.bnt /deep/ .ivu-tree-children {
  padding: 5px 0;
}

.trees-coadd /deep/ .ivu-tree-children .ivu-tree-arrow {
  line-height: 25px;
}
</style>
