<template>
  <div class="date">
    <div class="columns">
      <div class="column is-4">
        <h4>Maximum File Size</h4>
      </div>
      <div class="column is-3">
        <div class="select">
          <select>
            <!-- <option v-for="(downAmount, index) in this.downAmounts" :value="index" :key="downAmount.id" >{{downAmount}}</option> -->
            <option>10 MB</option>
            <option>20 MB</option>

          </select>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-4">
        <h4>Allow file types</h4>
      </div>
      <div class="column is-3" style="padding:10px">
        <div class="columns" >
          <div class="column is-6">
            <input type="radio" id="all" name="radio" value="" @click="selAll(1)">
            <label for="male">  All</label><br>
          </div>
          <div class="column is-12">
            <input type="radio" id="custom" name="radio" value="" @click="selAll(0)">
            <label for="male">  Custom</label><br>
          </div>
        </div>
      </div>
    </div>
    <div class="columns" >
      <div class="column is-4">
        
      </div>
      <div class="column is-3" style="border-top: 1px dashed #5B607E;">
        <div id="allChk" class="columns">
          <div class="column is-10" style="padding:0px">
            <div class="check">
              <input type="checkbox" id="ch1" name="" value=""  >
              <label for="">  Document</label><br>
            </div>
            <div class="check">
              <input type="checkbox" id="ch2" name="" value=""  >
              <label for="">  Spreadsheet</label><br>
            </div>
            <div class="check">
              <input type="checkbox" id="ch3" name="" value=""  >
              <label for="">  Preadsheet</label><br>
            </div>
          </div>
          <div class="column is-7" style="padding:0px">
            <div class="check">
              <input type="checkbox" id="ch4" name="" value=""  >
              <label for="">  Image</label><br>
            </div>
            <div class="check">
              <input type="checkbox" id="ch5" name="" value=""  >
              <label for="">  Audio</label><br>
            </div>
            <div class="check">
              <input type="checkbox" id="ch6" name="" value=""  >
              <label for="">  Video</label><br>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script>
  export default {
    data() {
      return {
      
      };
    },
    props: ['titles', 'downAmounts'],
    computed: {

    },
    methods: {
      selAll(flag){
        if(flag){
          document.getElementById('ch1').checked = true;
          document.getElementById('ch2').checked = true;
          document.getElementById('ch3').checked = true;
          document.getElementById('ch4').checked = true;
          document.getElementById('ch5').checked = true;
          document.getElementById('ch6').checked = true;

          document.getElementById('ch1').disabled = true;
          document.getElementById('ch2').disabled = true;
          document.getElementById('ch3').disabled = true;
          document.getElementById('ch4').disabled = true;
          document.getElementById('ch5').disabled = true;
          document.getElementById('ch6').disabled = true;

          
        }
        else{
          document.getElementById('ch1').disabled = false;
          document.getElementById('ch2').disabled = false;
          document.getElementById('ch3').disabled = false;
          document.getElementById('ch4').disabled = false;
          document.getElementById('ch5').disabled = false;
          document.getElementById('ch6').disabled = false;
        }
        
      }
     
    },
  };
</script>

<style scoped>
  .title{
    border-bottom: 1px dashed #5B607E;
    opacity: 0.7;
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
  .check{
    margin-bottom: 20px;
  }
</style>
