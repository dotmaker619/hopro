<template>
  <div class="email">
  <div class="columns">
      <div class="column is-5">
          <input class="input text-muted" type="email" placeholder="sample@email.com" >
      </div>
  </div>
  </div>
</template>

<script>
  export default {
  };
</script>

<style scoped>
  .email {
    box-sizing: border-box;
    margin-left: 15px;
    background: white;
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
