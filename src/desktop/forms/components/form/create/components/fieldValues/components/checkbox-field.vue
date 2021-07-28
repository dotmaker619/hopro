<template>
  <div class="email">
    <div class="columns">
  </div>
  <div class="" v-for="(item, index) in items" :key="index">
      <div class="arrange" @mouseover="showIcon(item.id)" @mouseout="clearIcon">
        <div class="middlesub">
            <div style="width:18px"><svg data-v-7aa8ab39="" viewBox="0 0 100 100" class="image is-20x20 mr-10 handle"><use href="/img/sprite.3264dd95.svg#drag-move"></use></svg></div>
            <div class="subArrange">
                <input type="checkbox" style="margin-right:5px;">
                <p>Checkbox1</p>
            </div>
        </div>
        <img src="@/assets/icons/delete-group.svg" class="imgSize"  @click="delElement(item.id)"/>
      </div>
  </div>
  <div class=" ">
      <div class="arrange border">
        <div class="middlesub">
            <div style="width:18px"></div>
            <div class="subArrange1">
                <img src="@/assets/icons/add-feature-type.svg" class="imgSize" style="margin-right:5px;"/>
                <p style="cursor: pointer;" @click="addOption" >Add New Checkbox</p>
            </div>
        </div>
      </div>
  </div>
  </div>
</template>

<script>
  export default {
    data(){
        return {
            id: 0,
            items: [],
        };
    },
    methods: {
      addOption(){
          this.id++;
          this.items.push({tyep:"checkbox", icon: false, id: this.id});
          console.log(this.items);
      },
      showIcon(id){
        for(var i=0; i<this.items.length; i++){
          this.items[i].icon = false;
        }
        for(var i=0; i<this.items.length; i++){
          if(this.items[i].id == id){
            this.items[i].icon = true;
          }
        }
        
      },
      clearIcon(){
        for(var i=0; i<this.items.length; i++){
          this.items[i].icon = false;
        }
      },
      delElement(id){
        for(var i=0; i<this.items.length; i++){
          if(this.items[i].id == id){
            this.items.splice(i, 1);
          }
        }
        
      }
    },
  };
</script>

<style scoped>
 .add {
    cursor: pointer;
  }
  .border {
      border-top: 1px dashed #000;
  }
  .middlesub {
      display: flex;
      align-items: center;
  }
  .subArrange {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width:30%;
  }
  .subArrange1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10px;
      
  }
  .arrange {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 40%;
      margin-left: 10px;
      padding-bottom: 20px;
  }
  .imgSize {
      width: 10px!important;
      cursor: pointer;
  }
  .flexEnd {
      display: flex;
      align-items: flex-end;
  }
  .email {
    
    background: white;
    margin-left: 15px;
    box-sizing: border-box;
  }
  .title{
    border-bottom: 1px dashed #5B607E;
    opacity: 1;
    width: 300px;
  }
  #input{
    border: 0px;
    box-shadow: none;
    padding: 2px;
  }
  .column{
      padding: 20px;
  }
  .text{
    position: absolute;
    margin-left: 5px;
    display: inline;
  }
  img{
    width: 24px;
    height: 24px;
  }
</style>
