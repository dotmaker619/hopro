<template>
  <div class="email">
  <div class="columns">
      <div class="column is-5">
        <div class="columns">
             <div class="column is-5" style="padding:0;  margin-left:25px; width:25%">
            <div class="select">
              <select style="border-radius: 4px 0px 0px 4px;">
                <option>+91</option>
              </select>
            </div>
          </div>
          <div class="column is-5" style="padding:0;">
            <input class="input text-muted" type="text" placeholder="99789456321" style="border-radius: 0px 4px 4px 0px; border-left: none;" >
          </div>
        </div>
      </div>
  </div>
  </div>
</template>

<script>
  export default {
    props: ['titles'],
  };
</script>

<style scoped>
  /* .email {
    width: 800px;
    height: 160px;
    background: white;
    box-shadow: 0px 2px 4px #171e481a;
    margin-bottom: 25px;
  } */
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
