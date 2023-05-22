<template>
    <div >
      <div class="avatar-uploader"  >
        <template v-if="dialogImageUrl.length !=0">
          <div class="el-upload-list el-upload-list--picture-card" style="height:100px" v-for='(item,index) in dialogImageUrl' :key='index'>
            <div class="el-upload-list__item is-ready"  :style="`width:${width}px;height:100px;margin-right:10px`">
              <img
                  class="el-upload-list__item-thumbnail"
                  :src="item.image_url" alt=""
                  :style="`width:${width}px;height:100px`"
              >
              <span class="el-upload-list__item-actions" >
                  <span
                  class="el-upload-list__item-preview"
                  @click="handlePictureCardPreview(item.image_url)">
                  <i class="el-icon-zoom-in"></i>
                  </span>
                  <span
                    v-if="!disabled"
                    class="el-upload-list__item-delete"
                    @click="handleRemove(item,index)"
                    >
                    <i class="el-icon-delete"></i>
                  </span>
              </span>
            </div>
          </div>
        </template>
        <template  v-if="!disabled">
          <div v-if="dialogImageUrl.length == 0 || dialogImageUrl.length<isChoice"
            :style="`width:${width}px;height:100px;margin:0;`"
            @click="modalPic = true"
            class="el-upload el-upload--picture-card">
            <i class="el-icon-plus"></i>
          </div>
        </template>
      </div>

    <el-dialog :visible.sync="dialogVisible" append-to-body>
        <img width="100%" :src="imageUrl"  alt="">
    </el-dialog>
    <el-dialog
        :visible.sync="modalPic"
        width="924px"
        scrollable
        footer-hide
        closable
        title="上传商品图"
        :mask-closable="false"
        :append-to-body="appendToBody"
        :z-index="appendToBody ? 100000 : 10">
      <uploadPictures
        :isChoice="isChoice"
        @getPic="getPic"
        @getPicD="getPicD"
        :gridBtn="gridBtn"
        :gridPic="gridPic"
        v-if="modalPic"
      ></uploadPictures>
    </el-dialog>
  </div>
</template>
<script>
  import { uploadAvatar } from "@/api/system/user";
  export default {
    props: {
      type:{
        type: String,
        default: "",
      },
      dialogImageUrl:{
        type: Array,
        default: [],
      },
      index:{
        type: Number,
        default: 0,
      },
      width:{
        type: String,
        default: "100",
      },
      isChoice:{
        type: Number,
        default: 1,
      },
      disabled:{
        type: Boolean,
        default: false,
      },
      appendToBody:{
        type: Boolean,
        default: false,
      }
    },
    data(){
      return{
        fileList:[],
        dialogVisible:false,
        data:{},
        modalPic:false,
        gridPic: {
          xl: 6,
          lg: 8,
          md: 12,
          sm: 12,
          xs: 12,
        },
        gridBtn: {
          xl: 4,
          lg: 8,
          md: 8,
          sm: 8,
          xs: 8,
        },
        imageUrl:""
      }
    },
    computed:{

    },
    mounted(){
       this.$nextTick(() => {
         if(this.$refs['dynamic']){
            this.$refs['dynamic'].$el.style.width=this.width+'px'
         }
      });

    },
    methods:{
      getPicD(e){
        let arr = []
        if(this.isChoice == 1){
          arr = e
        }else{
          if(this.dialogImageUrl.length + e.length > this.isChoice){
            return this.msgError(`最多只能选${this.isChoice}张图片`);
          }else{
            arr = this.dialogImageUrl.concat(e)
          }
        }

        this.modalPic = false
        this.$emit("beforeUpload", {data:arr,type:this.type,ids:this.getIds(arr)});
      },
      getIds(arr){
        let array=[]
         for(let i in arr){
           array.push(arr[i].id)
         }
         return array
      },
      getPic(){

      },
      handlePictureCardPreview(imageUrl){
        this.imageUrl = imageUrl
        this.dialogVisible = true;
      },
      handleRemove(items,indexs){
          let arr = this.dialogImageUrl.filter((item,index) => index !=indexs)
          this.$emit('handleRemove',{data:arr,type:this.type,ids:this.getIds(arr)})
      },
    }
  }
</script>
<style scoped>
.el-upload--picture-card{
  border: 1px dashed #13C3C7;
}
.el-upload--picture-card:hover {
  border-color: #13C3C7;
  color: #13C3C7;
}
.el-upload--picture-card{
  width: 100px;
  height: 100px;
  font-size: 16px !important;
}
.el-upload{
  width: 100%;
  height: 100px;
  line-height: 100px;
  font-size: 16px;
}
.el-upload-list--picture-card .el-upload-list__item{
  width: 100px;
  height: 100px;
  line-height: 100px;
  font-size: 16px;
}

 .el-upload-list--picture-card .el-upload-list__item-actions:hover {
  opacity: 1;
  font-size: 16px;
}

.el-upload-list--picture-card .el-upload-list__item-thumbnail{
  width: 100px;
  height: 100px;
  line-height: 100px;
  font-size: 16px;
}
.avatar{
  width: 100px;
  height: 100px;
}
</style>
