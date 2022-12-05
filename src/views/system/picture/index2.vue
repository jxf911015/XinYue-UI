<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--分类数据-->
      <el-col :span="6" :xs="24">
        <div class="head-container">
          <el-input v-model="name" placeholder="请输入分类名称" clearable size="small"
            prefix-icon="el-icon-search" style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="categoryOptions"
            :props="defaultProps"
            :filter-node-method="filterNode"
            ref="tree"
            highlight-current
          >
            <div slot-scope="{ node, data }" class="custom-tree-node" @click.stop="handleNodeClick(data)">
              <div>
                <span class="custom-tree-node-label" :title="node.label">
                  {{ node.label }}
                </span>
<!--                <span v-if="data.label" style="font-size: 11px; color: #3889b1">（-->
<!--                  {{ data.label }}）-->
<!--                </span>-->
              </div>
              <span class="el-ic">
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <i class="el-icon-more"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
<!--                     v-hasPermi="['system:role:edit']-->
<!--                    v-if="checkPermi(['admin:category:save'])" -->
                    <el-dropdown-item  v-hasPermi="['system:category:add']" @click.native="onAdd(data.id)">
                      添加分类
                    </el-dropdown-item>
                    <el-dropdown-item  v-if="node.label !== '全部'" v-hasPermi="['system:category:edit']" @click.native="onEdit(data)">
                      编辑分类
                    </el-dropdown-item >
                    <el-dropdown-item v-if="node.label !== '全部'" v-hasPermi="['system:category:remove']" @click.native="handleDeleteCat(data)">
                      删除分类
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
            </div>
          </el-tree>

        </div>
      </el-col>
      <!--图片数据-->
      <el-col :span="18" :xs="24">
        <div class="conter mb15 relative">
          <div class="bnt">
            <el-button
              size="small"
              type="primary"
              plain
              @click="checkPics"
            >使用选中图片</el-button>
            <el-button
              size="small"
              type="primary"
              @click="upLoad()"
              plain
            >上传图片</el-button>
            <el-button
              size="small"
              type="danger"
              plain
            >删除图片</el-button>
          </div>
        </div>

        <div class="pictrueList acea-row" v-loading="loading">
          <div v-show="isShowPic" class="imagesNo">
            <i class="el-icon-picture" style="font-size: 60px; color: rgb(219, 219, 219)"/>
            <span class="imagesNo_sp">图片库为空</span>
          </div>
          <div class="conters">
            <div v-for="(item, index) in pictureList" :key="index" class="gridPic">
              <span class="num_badge" v-if="item.num > 0">{{item.num}}</span>
              <img
                :src="item.imageUrl ? item.imageUrl : localImg"
                :class="item.isSelect ? 'on' : ''"
                @click="selectImage(item, index, pictureList)"
              />
<!--              <div style="text-align: center;margin-top: 5px">-->
<!--                {{item.name}}-->
<!--              </div>-->
            </div>
          </div>
        </div>




        <pagination
          :page-sizes="[24]"
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

      </el-col>
    </el-row>


    <!-- 添加或修改分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
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
import {listPicture, getPicture, delPicture, addPicture, updatePicture, uploadPicture} from "@/api/system/picture";
import { getToken } from "@/utils/auth";
import {addCategory, delCategory, delCategoryByid, treeselect, updateCategory} from "@/api/system/category";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Picture",
  components: { Treeselect },
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
      isShowPic: false,
      // 总条数
      total: 0,
      // 图片库表格数据
      pictureList: [],
      // 弹出层标题
      title: "",
      // 分类树选项
      categoryOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 分类名称
      name: undefined,
      localImg: "",
      checkPicList: [],
      // 表单参数
      form: {},
      image:{},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 24,
        classId: undefined
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        extra: [
          { required: true, message: "标识不能为空", trigger: "blur" }
        ],
      },
    };
  },
  watch: {
    // 根据名称筛选部门树
    name(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList();
    this.getTreeselect();
  },

  methods: {
    /** 查询图片库列表 */
    getList() {
      this.loading = true;
      listPicture(this.queryParams).then(response => {
        this.pictureList = response.rows;
        this.total = response.total;
        if (this.pictureList.length) {
          this.isShowPic = false;
        } else {
          this.isShowPic = true;
        }
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 添加分类
    onAdd(id) {
      this.reset();
      this.form.parentId = id;//父id
      this.form.type = 1;//类型 1-图片库
      this.form.status = 0;//0-显示 1-隐藏
      this.form.sort = 999;//排序 默认999
      console.log(this.form);
      this.open = true;
      this.title = "添加分类";
    },
    // 编辑分类
    onEdit(data) {
      this.reset();
      console.log("extra:"+data.extra)
      this.form.id = data.id;//id
      this.form.name = data.label;//分类名称
      this.open = true;
      this.title = "编辑分类";
      console.log(data)
    },
    //删除分类按钮操作
    handleDeleteCat(data) {
      const id = data.id || this.id;
      this.$modal.confirm('是否确认删除分类名称为"' + data.label + '"的数据项？').then(function() {
        return delCategoryByid(id);
      }).then(response => {
        console.log(response.msg)
        this.getTreeselect();
        this.$modal.msgSuccess(response.msg);
      }).catch(() => {
      });
    },
    /** 提交按钮 */
    submitForm() {
      console.log(this.form);
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCategory(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getTreeselect();
            });
          } else {
            addCategory(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getTreeselect();
            });
          }
        }
      });
    },
    // 上传图片
    upLoad() {
      const _this = this;
      const fileType = ['png','jpg','jpeg']
      const inputFile = document.createElement("input")
      inputFile.type = "file"
      inputFile.style.display = "none"
      document.body.appendChild(inputFile)
      inputFile.click()
      let that = this
      inputFile.addEventListener("change",function() {
        const file = inputFile.files[0];
        var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
        if (!fileType.includes(testmsg)) {
          _this.$message.warning("上传的文件格式只能是,png,jpg,jpeg");
          document.body.removeChild(inputFile);
          return false;
        }
        const formData = new FormData();
        formData.append("file", file);
        console.log(formData.get("file").name)
        uploadPicture(formData).then(response => {
            var imageUrl = response.url
            console.log(imageUrl)
            //保存图片
            const imageData = new FormData();
            imageData.append("class_id", '11');
            imageData.append("name", 'file');
            imageData.append("imageUrl", imageUrl);
            that.uploadPictures(imageData);
        });
      })
    },
    //保存图片
    uploadPictures(imageData){
      addPicture(imageData).then(response => {
        this.$modal.msgSuccess("图片上传成功");
        this.open = false;
        this.getList();
      });
    },
    /** 查询分类下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.categoryOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.classId = data.id;
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    reset() {
      this.form = {
        id: null,
        parentId: null,
        path: null,
        name: null,
        type: null,
        url: null,
        extra: null,
        status: 0,
        sort: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    // 选中图片
    selectImage(item, index, row) {
      let activeIndex = 0;
      if (!item.isSelect) {
        this.$set(item, "isSelect", true);
        this.checkPicList.push(item);
      } else {
        this.$set(item, "isSelect", !item.isSelect);
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

      this.pictureList.map((el, i) => {
        if (el.isSelect) {
          this.checkPicList.filter((el2, j) => {
            if (el.id == el2.id) {
              el.num = j + 1;
              this.$nextTick(() => {
                this.pictureList;
              });
            }
          });
        } else {
          el.num = 0;
        }
      });
    },
// 点击使用选中图片
    checkPics() {
      // if (!this.checkPicList.length)
      //   return this.$message.warning("请先选择图片");
      // if (this.$route && this.$route.query.field === "dialog") {
      //   let str = "";
      //   for (let i = 0; i < this.checkPicList.length; i++) {
      //     str += '<img src="' + this.checkPicList[i].sattDir + '">';
      //   }
      //   /* eslint-disable */
      //   nowEditor.dialog.close(true);
      //   nowEditor.editor.setContent(str, true);
      // } else {
      //   if (this.isMore === "1" && this.checkPicList.length > 1) {
      //     return this.$message.warning("最多只能选一张图片");
      //   }
      //
      //   this.$emit("getImage", [...this.checkedMore, ...this.checkPicList]);
      // }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const userId = row.userId || this.ids;
      getUser(userId).then(response => {
        this.form = response.data;
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.form.postIds = response.postIds;
        this.form.roleIds = response.roleIds;
        this.open = true;
        this.title = "修改用户";
        this.form.password = "";
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$modal.confirm('是否确认删除用户编号为"' + userIds + '"的数据项？').then(function() {
        return delUser(userIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    }
  }
};
</script>

<style scoped lang="scss">

.conters {
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
}
.custom-tree-node {
  margin-top: 10px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  color: #4386c6;
}
.custom-tree-node-label {
  display: block;
  width: 125px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.el-ic {
  //display: none;
  i,
  span {
    //padding: 0 14px;
    font-size: 18px;
    font-weight: 600;
  }
  .svg-icon {
    color: #4386c6;
  }
}
.el-tree-node__content {
  height: 38px;
}
.el-tree-node__expand-icon {
  //color: #428bca;
  /*padding: 10px 10px 0px 10px !important;*/
}
.el-tree-node__content:hover .el-ic {
  color: #428bca !important;
  display: inline-block;
}
.el-tree-node__content:hover {
  font-weight: bold;
}
//.el-tree--highlight-current
//.el-tree-node.is-current
//> .el-tree-node__content
//:hover {
//  .el-tree-node__expand-icon.is-leaf {
//    color: transparent;
//    cursor: default;
//  }
//  /*background-color: #3998d9;*/
//  .custom-tree-node {
//    font-weight: bold;
//  }
//  .el-tree-node__expand-icon {
//    font-weight: bold;
//  }
//}
.gridPic {
  margin-top: 15px;
  margin-right: 15px;
  margin-bottom: 10px;
  width: 130px;
  height: 130px;
  position: relative;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .num_badge {
    position: absolute;
    top: 6px;
    right: 6px;
    display: inline-block;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    background: #1890FF;
    font-size: 14px;
    text-align: center;
    color: #fff;
    line-height: 20px;
  }
}

.pictrueList {

  width: 100%;
  el-image {
    width: 100%;
    border: 2px solid #fff;
  }
  .on {
    border: 2px solid #1890FF;
  }

}
.el-image {
  width: 130px;
  height: 130px;
  cursor: pointer;
  display: block;
}
.imagesNo {
  width: 100%;
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
</style>
