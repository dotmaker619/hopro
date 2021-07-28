<template>
  <div class="form-builder--preview">
    <form-title></form-title>
    <div class="preview">
      <div class="section">
        <p class="fontStyle2 space">Section 1 of 1</p>
        <p class="fontStyle1 space">Tickets Section</p>
        <p class="fontStyle3">Sed ut perspiciatis unde omnis iste natus error sit voluptatem</p>
      </div>
      <div class="section">
        <p class="fontStyle1 space">Text Field Title</p>
        <input type="text" class="input text-muted fontStyle2" style="width:50%" value="Enter Text" disabled>
      </div>
      <div class="section">
        <p class="fontStyle1 space">Rich Text Field</p>
        <textarea class="input text-muted fontStyle2" style="height: 100px" disabled></textarea>
      </div>
      <div class="section">
        <p class="fontStyle1 space">Checkbox Field Title</p>
        <div class="center space" v-for="(item, index) in checkbox" :key="index">
          <input type="checkbox" disabled><label for="checkbox" style="margin-left:5px;" class="fontStyle2">{{item}}</label>
        </div>
        <div class="center">
          <i data-v-e5f75c3a="" class="fas fa-plus mr-5"></i>
          <p class="fontStyle2">Add New</p>
        </div>    
      </div>
      <div class="section">
          <p class="fontStyle1 space">Dropdown Text Field</p>
          <div class="select" >
            <select name="" id="" style="padding-right:150px;" class="fontStyle2" disabled >
              <option value="" v-for="(item, index) in dropdown" :key="index" >{{item}}</option>
            </select>
          </div>
      </div>
      <div class="section">
        <p class="fontStyle1 space">Radio Field Title</p>
        <div class="center space" v-for="(item, index) in radio" :key="index" >
          <input type="radio" name="radio" disabled><label for="radio" style="margin-left:5px;" class="fontStyle2 ">{{item}}</label>
        </div>
        <div class="center">
          <i data-v-e5f75c3a="" class="fas fa-plus mr-5"></i>
          <p class="fontStyle2">Add New</p>
        </div>    
      </div>

      <div class="section">
        <p class="fontStyle1 space">Date Field Title</p>
        <p class="fontStyle4 space">Subtitle</p>
        <div class="center">
          <div class="input-box" style=" margin-right: 10px;">
              <input class="input text-muted datepicker dropdown fontStyle2" style="padding-left:30px;" type="text" value="DD/MM/YYYY" disabled />
              <span class="unit"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <g id="date" transform="translate(24668 23706)">
              <rect id="Rectangle_978" data-name="Rectangle 978" width="24" height="24" transform="translate(-24668 -23706)" fill="#fff" opacity="0"/>
              <path id="Path_2499" data-name="Path 2499" stroke="#fff" d="M12.636,3.524V2.762a.728.728,0,1,1,1.455,0v.762h.727A2.236,2.236,0,0,1,17,5.81v7.619A4.471,4.471,0,0,1,12.636,18H5.364A4.471,4.471,0,0,1,1,13.429V5.81A2.236,2.236,0,0,1,3.182,3.524H4.636V2.762a.728.728,0,1,1,1.455,0v.762ZM2.455,8.1H15.545V5.81a.745.745,0,0,0-.727-.762h-.727a.728.728,0,1,1-1.455,0H6.091a.728.728,0,1,1-1.455,0H3.182a.745.745,0,0,0-.727.762Zm0,1.524v3.81a2.981,2.981,0,0,0,2.909,3.048h7.273a2.981,2.981,0,0,0,2.909-3.048V9.619Z" fill="#171e48" transform="translate(-24665 -23703.5)" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.5" fill-rule="evenodd"/>
              </g>
              </svg></span>
          </div>
          <div class="input-box">
            <input class="input text-muted fontStyle2" type="text" value="HH:MM" style="padding-left:30px;" disabled >
            <span class="unit"><i class="far fa-clock timeline-icons has-text-orange"></i></span>
          </div>
        </div>
      </div>
      <div class="section">
        <p class="fontStyle1 space">Email Field Title</p>
        <input type="email" class="input text-muted fontStyle2" style="width:42%" value="sample@email.com" disabled>
      </div>
      <div class="section">
        <p class="fontStyle1 space">Money Field Title</p>
        <div class="input-box">
          <input class="input text-muted fontStyle2" style="padding-left:15px;" type="text" placeholder="" value="" disabled/>
          <span class="unit" id="unit">₹</span>
        </div>
      </div>
      <div class="section">
        <p class="fontStyle1 space">Phone Number Field Title</p>
        <div class="center1" style="width:42%">  
            <div class="select">
              <select style="border-radius: 4px 0px 0px 4px;" class="fontStyle2" disabled>
                <option>+91</option>
              </select>
            </div>
            <input class="input text-muted fontStyle2" type="text" value="99789456321" style="border-radius: 0px 4px 4px 0px; border-left: none;" disabled>
        </div>
      </div>
      <div class="section">
        <p class="fontStyle1 space">Website Field Title</p>
        <input type="text" class="input text-muted fontStyle2" style="width:42%" value="www.sample.com" disabled>
      </div>

      <div class="section">
        <p class="fontStyle1 space">File Upload Field Title</p>
        <div class="fileUpload">
          <div class="uploadIcon">
            <sh-icon :file="'forms-sprite'" :name="`fields-attachment`" class="image is-30x30 mr-10" style="margin-right:0px;"></sh-icon>
          </div>
          <p style="font-size:22px; font-weight:bold; color: #171E48;">Drag & Drop File here</p>
          <p class="fontStyle3">you can upload a file max. file size is 10mb</p>
          <a href="" style="text-decoration:underline; color: #2585D3; font-size:13px">Browse</a>
        </div>
      </div>
    </div> 

    <button class="submitForm">Submit Form</button>   
  </div>
</template>

<script>
  import formTitle from "./components/form-title";
  import fieldValues from "./components/fieldValues/field-values";
  import { mapMutations, mapState, mapGetters, mapActions } from "vuex";

  export default {
    components: { formTitle },
    data() {
      return {
        checkbox:["checkbox1","checkbox2","checkbox3","checkbox4",],
        dropdown:["Option1","Option2","Option3","Option4",],
        radio:["Option1","Option2"],
      };
    },
    computed: {
     
    },
    methods: {
     
    },
  };
</script>

<style lang="scss" scoped>
  input {
    border-color: #171E4818!important;
  }
  select {
    border-color: #171E4818!important;
  }
  textarea {
    border-color: #171E4818!important;
  }
  .space {
    padding-bottom: 15px;
  }
  .submitForm {
    width: 150px;
    height: 50px;
    float: right;
    margin-top: 30px;
    margin-bottom: 40px;
    border-radius: 4px;
    background-color: #2585D3;
    color: #fff;
    opacity: 0.9;
    border: none;
    font-style: normal;
    font-family: "Barlow";
    
  }
  .fontStyle1 {
    font-size: 18px;
    color: #171E48;
    font-style: normal;
    font-weight: bold;
    font-family: "Barlow";
  }
  .fontStyle2 {
    font-size: 14px;
    color: #171E48;
    opacity: 0.8;
    font-style: normal;
    font-weight: bold;
    font-family: "Barlow";
  }
  .fontStyle3 {
    font-size: 13px;
    color: #171E48;
    opacity: 0.7;
    font-style: normal;
    font-family: "Barlow";
  }
  .fontStyle4 {
    font-size: 16px;
    color: #171E48;
    opacity: 0.7;
    font-style: normal;
    font-family: "Barlow";
  }
  .fontStyle4 {
    font-size: 16px;
    color: #171E48;
    opacity: 1;
    font-style: normal;
    font-family: "Barlow";
    font-weight: bold;
  }
  .form-builder--preview {
    width: 800px;
    margin: 30px auto;
  }
  .preview {
    box-sizing: border-box;
    background: white;
  }
  .center {
    display: flex; 
    align-items: center;
  }
  .center1 {
    display: flex; 
  }
  .input-box { 
    position: relative;
    width: 20%; 
  }
  .unit { 
    position: absolute; display: block; left: 5px; top: 5px; z-index: 9; 
  }
  .fileUpload {
    border: 1px dashed #000;
    border-radius: 5px;
    text-align: center;
    padding: 50px;
    background-color: #f4f7fc;
  }
  .uploadIcon {
    display: flex;
    justify-content: center;;
  }
</style>
