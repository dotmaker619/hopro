<template>
  <div class="email">
    <div class="columns">
      <div class="column is-5 flexEnd" style="padding-top: 0px;">
        <input class="input text-muted" type="text" placeholder="Placeholder text here" />
      </div>
    </div>
  </div>
</template>

<script>
  export default {};
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
  .title {
    border-bottom: 1px dashed #5b607e;
    opacity: 1;
    width: 300px;
  }
  #input {
    border: 0px;
    box-shadow: none;
    padding: 2px;
  }
  .column {
    padding: 20px;
  }
  .text {
    position: absolute;
    margin-left: 20px;
    display: inline;
  }
  img {
    width: 24px;
    height: 24px;
  }
</style>
