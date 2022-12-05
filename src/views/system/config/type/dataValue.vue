<template>
  <div class="app-container">
    <el-tabs type="border-card" @tab-click="cardhandleClick">
      <el-tab-pane :label="item.name"   v-for="(item) in configData" :key='item.id' >
        <div>
          <el-tabs v-model="activeName"  @tab-click="handleClick" >
            <el-tab-pane lazy :name='items.name'  :label="items.name" v-for="items in item.children" :key='items.id' >
              <form-create v-if="rules.length!=0"  :rule="rules" @submit="onSubmit"  class="formBox" ref="fc" handleIcon="false"></form-create>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {listDataValue,allData,submitConfig} from "@/api/system/config/dataValue";
import formCreate from '@form-create/element-ui'
export default {
  name: "DataValue",
  components: { formCreate: formCreate.$form()},
  data() {
    return {
      configData:[],
      ids:'',
      rules:[],
      index:0,
      activeName:'',
      queryParams: {
        typeId: null,
        defaultValue:null
      },
    };
  },
  created(){
    this.getList()
  },
  methods: {
    cardhandleClick(tab){
      this.index = Number( tab.paneName );
      this.ids = this.configData[this.index].children[0].id;
      this.activeName = this.configData[this.index].children[0].name;
      this.allData();
    },
    handleClick(tab){
      this.index = Number( tab.paneName );
      this.ids = this.configData[this.index].children[Number(tab.index)].id;
      this.activeName = this.configData[this.index].children[Number(tab.index)].name;
      this.allData();
    },
    /** 查询配置分类列表 */
    getList() {
      listDataValue().then(response => {
        this.configData = response.data;
        this.index = 0
        this.ids = response.data[0].children[0].id
        this.activeName = response.data[0].children[0].name
        this.allData();
      });
    },
    allData(){
      this.queryParams.typeId = this.ids;
      console.log("请求参数："+this.ids)
      allData(this.queryParams).then(response => {
        this.rules = response.data;
      });
    },
    handleClick(tab){
      this.ids = this.configData[this.index].children[Number(tab.index)].id;
      this.activeName = this.configData[this.index].children[Number(tab.index)].name;
      this.allData();
    },
    /** 提交按钮 */
    onSubmit(e){
      this.queryParams.defaultValue = JSON.stringify(e);
      submitConfig(this.queryParams).then(response=>{
        this.$modal.msgSuccess("保存成功");
      })
    },
  }
};
</script>
