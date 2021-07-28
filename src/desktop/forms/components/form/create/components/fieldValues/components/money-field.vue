<template>
  <div class="email">
  <div class="columns">
      <div class="column is-5">
        <div class="columns">
          <div class="column is-5" style="padding:0; margin-left:25px">
            <div class="input-box">
              <input class="input text-muted" style="padding-left:15px;border-radius: 4px 0px 0px 4px; border-right: none;" type="text" placeholder="" value=""/>
              <span class="unit" id="unit">₹</span>
            </div>
          </div>
          <div class="column is-5" style="padding:0">
            <div class="select" id="selUnit" @change="onChange($event)">
              <select style="border-radius: 0px 4px 4px 0px;">
                <option v-for="(unit, index) in this.units" :value="index" :key="unit.id" >{{unit}}</option>
              </select>
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
    props: ['titles', 'units'],
    computed: {

    },
    methods: {

      onChange(event){
        console.log("success", event.target.value);
        if(event.target.value==0)
          document.getElementById('unit').innerHTML = "₹";
        else{
          document.getElementById('unit').innerHTML = "$";
        }
      }
    },
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
  .input-box { 
    position: relative; 
  }
  .unit { 
    position: absolute; display: block; left: 5px; top: 5px; z-index: 9; 
  }
</style>
