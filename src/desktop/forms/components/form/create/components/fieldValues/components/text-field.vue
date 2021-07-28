<template>
  <div class="email"> 
  <div class="columns">
      <div class="column is-5 flexEnd" style="padding-top: 0px;">
          <input class="input text-muted" type="text" placeholder="Placeholder text here" >
      </div>
      <div class="column is-3" style="padding-left:0px; padding-top: 0px;">
        <p style="font-size:12px">Max.Characters allowed</p>
          <input class="input text-muted" type="number" max="100" min="0" value="100" >
      </div>
  </div>
  </div>
</template>

<script>
  export default {
 
  };
</script>

<style scoped>
  .center {
    display: flex;
    align-items: center;
 
  }
  .flexEnd {
      display: flex;
      align-items: flex-end;
  }
  .email {
   
    box-sizing: border-box;
    background: white;
    margin-left: 15px;
    
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
    margin-left: 20px;
    display: inline;
  }
  img{
    width: 24px;
    height: 24px;
  }
</style>
