<template>
  <svg ref="ico" @click="$emit('click')" viewBox="0 0 100 100" class>
    <use :xlink:href="src + '#' + name" />
  </svg>
</template>

<script>
export default {
  props: ["name", "file"],
  computed: {
    src() {
      if(this.$route.meta.screen == "mobile"&&this.isSafari){
        this.safariFix(this.name);
      }
      return require(`@/mobile/assets/icons/${
        this.file ? this.file : "sprite"
      }.svg`);
    },
    isSafari(){
      let safari = navigator.userAgent.indexOf("Safari") > -1;
      let chrome = navigator.userAgent.indexOf('Chrome') > -1;
      return safari&&!chrome;
    }
  },
  methods:{
    safariFix(){
      new Promise((resolve,reject)=>{
        if(window.spriteCache&&window.spriteCache[this.file]){
          resolve(window.spriteCache[this.file]);
        }else{
    fetch(require(`@/mobile/assets/icons/${this.file ? this.file : "sprite"}.svg`)+ '#' + this.name)
    .then(response => response.text())
    .then(data => {
      window.spriteCache[this.file]=data;
      resolve(data);
      });
        }
      }).then(data => {
      const newEl = document.createElement("span");
      newEl.innerHTML = data;
      const symbol=newEl.querySelector('#' + this.name);
      this.$refs.ico.innerHTML="";
      while (symbol.firstChild) {
        this.$refs.ico.appendChild(symbol.firstChild);
      }
      this.$refs.ico.setAttribute("viewBox",symbol.getAttribute("viewBox"));
     }).catch(e=>{
       this.$refs.ico.setAttribute("viewBox","0 0 100 100");
     });
    },
  }
};
</script>
<style lang="scss">
.is-16x16 {
  height: 16px;
  width: 16px;
}
.is-13x13 {
  height: 13px;
  width: 13px;
}
</style>
