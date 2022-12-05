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
            :data="categoryOptions" :props="defaultProps" :expand-on-click-node="false"
            :filter-node-method="filterNode" ref="tree" default-expand-all @node-click="handleNodeClick"
          />
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
              type="danger"
              plain
            >删除图片</el-button>
          </div>
        </div>

        <div class="pictrueList acea-row" v-loading="loadingPic">
          <div v-show="isShowPic" class="imagesNo">
            <i class="el-icon-picture" style="font-size: 60px; color: rgb(219, 219, 219)"/>
            <span class="imagesNo_sp">图片库为空</span>
          </div>
          <div class="conters scrollbarAll" :style="{ maxHeight: !pictureType ? '500px' : '700px' }">
            <div v-for="(item, index) in pictureList" :key="index" class="gridPic">
              <span class="num_badge" v-if="item.num > 0">{{item.num}}</span>
              <el-image
                style="object-fit: contain;"
                :src="item.imageUrl ? item.imageUrl : localImg"
                :class="item.isSelect ? 'on' : ''"
                @click="selectImage(item, index, pictureList)"
              />

            </div>
          </div>
        </div>


<!--        <div class="demo-image" style="display: flex;flex-flow: wrap">-->
<!--          <div class="block" v-for="(item, index) in pictureList" :key="index"  >-->
<!--            <span class="num_badge" v-if="item.num > 0">{{item.num}}</span>-->
<!--            <el-image-->
<!--              style="width: 130px; height: 130px;margin-top:15px;margin-left: 15px;border-width: 3px;"-->
<!--              :src="item.imageUrl ? item.imageUrl : localImg"-->
<!--              :class="item.isSelect ? 'on' : ''"-->
<!--              @click="selectImage(item, index, pictureList)"-->
<!--               >-->
<!--            </el-image>-->
<!--            <div style="text-align: center">-->
<!--              {{item.name}}-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

      </el-col>
    </el-row>
  </div>
</template>

<script>
import { listPicture, getPicture, delPicture, addPicture, updatePicture } from "@/api/system/picture";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/system/category";
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
        this.loading = false;
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

    // 选中图片
    selectImage(item, index, row) {
      let activeIndex = 0;
      if (!item.isSelect) {
        this.$set(item, "isSelect", true);
        this.checkPicList.push(item);
      } else {
        this.$set(item, "isSelect", !item.isSelect);
        this.checkPicList.map((el, index) => {
          if (el.attId == item.attId) {
            activeIndex = index;
          }
        });
        this.checkPicList.splice(activeIndex, 1);
      }
      this.ids = [];
      this.checkPicList.map((item, i) => {
        this.ids.push(item.attId);
      });

      this.pictureList.map((el, i) => {
        if (el.isSelect) {
          this.checkPicList.filter((el2, j) => {
            if (el.attId == el2.attId) {
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
<style lang="scss">
.pictrueList {
  /*padding-left: 15px;*/
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
}


</style>
