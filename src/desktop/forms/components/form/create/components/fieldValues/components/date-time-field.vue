<template>
      <div class="date">
        <div class="columns">
            <div class="column is-7">
              <div class="columns">
                <div class="column is-5" style="padding-right:0px;">
                    <div @click="al" class="input-box"> 
                      <input class="input text-muted datepicker dropdown" style="padding-left:30px; margin-bottom: 10px;border-radius: 4px 0px 0px 4px; border-right: none;" type="text" placeholder="DD/MM/YYYY" />
                      <input type="date" id="datepicker" hidden>
                      <span class="unit"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <g id="date" transform="translate(24668 23706)">
          <rect id="Rectangle_978" data-name="Rectangle 978" width="24" height="24" transform="translate(-24668 -23706)" fill="#fff" opacity="0"/>
          <path id="Path_2499" data-name="Path 2499" stroke="#fff" d="M12.636,3.524V2.762a.728.728,0,1,1,1.455,0v.762h.727A2.236,2.236,0,0,1,17,5.81v7.619A4.471,4.471,0,0,1,12.636,18H5.364A4.471,4.471,0,0,1,1,13.429V5.81A2.236,2.236,0,0,1,3.182,3.524H4.636V2.762a.728.728,0,1,1,1.455,0v.762ZM2.455,8.1H15.545V5.81a.745.745,0,0,0-.727-.762h-.727a.728.728,0,1,1-1.455,0H6.091a.728.728,0,1,1-1.455,0H3.182a.745.745,0,0,0-.727.762Zm0,1.524v3.81a2.981,2.981,0,0,0,2.909,3.048h7.273a2.981,2.981,0,0,0,2.909-3.048V9.619Z" fill="#171e48" transform="translate(-24665 -23703.5)" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.5" fill-rule="evenodd"/>
        </g>
      </svg></span>
                    </div>
                </div>
                <div class="column is-2" style="padding-left:0px;">
                  <div class="select">
                    <select style="border-radius: 0px 4px 4px 0px;" >       
                    </select>
                  </div>
                </div>
              </div>
              <div class="columns">
                <div class="column is-5" style="padding-right:0px;padding-top:0px">
                  <div class="input-box">
                    <input class="input text-muted " type="text" placeholder="HH:MM" style="padding-left:30px; border-radius: 4px 0px 0px 4px;border-right: none;" >
                    <span class="unit"><i class="far fa-clock timeline-icons has-text-orange"></i></span>
                  </div>
                </div>
                <div class="column is-2" style="padding-left:0px; padding-top:0px">
                  <div class="select">
                    <select style="border-radius: 0px 4px 4px 0px;">        
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
    // props: ['titles'],
    methods: {
      al(){
        // alert('success');
        console.log(document.getElementById('datepicker'));
        document.getElementById('datepicker').click;
      }
    },
  };
  
  
</script>

<style scoped>

    /* .date {
    width: 800px;
    height: 300px;
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
  .input-container {
  display: -ms-flexbox; /* IE10 */
  display: flex;
  width: 100%;
  margin-bottom: 15px;
}
.myInput {
  background-image: url('/assets/icons/container-icon.svg');
  background-position: 10px 12px;
  background-repeat: no-repeat;
  width: 100%;
  font-size: 16px;
  padding: 12px 20px 12px 40px;
  border: 1px solid #ddd;
  margin-bottom: 12px;
}
.input-box { 
    position: relative; 
  }
  .unit { 
    position: absolute; display: block; left: 5px; top: 5px; z-index: 9; 
  }
</style>
