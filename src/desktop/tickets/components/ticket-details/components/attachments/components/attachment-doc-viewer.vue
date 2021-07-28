<template>
<div>
<modal
    name="doc"
    transition="nice-modal-fade"
    classes="doc-modal"
    :min-width="100"
    :min-height="100"
    :adaptive="true"
    :scrollable="true"
    :reset="true"
    width="100%"
    height="auto"
    @closed="$modal.hide('doc'); $emit('close');"
    >
    <div class="doc-viewer card ">
        <div class="padding-15 field" >
            <sh-icon  @click.native="close_modal" :name="'ticket-detail-close'" class="is-pointer is-14x14 mr-5 ml-5 is-pulled-right" />
        </div>
        <div class="is-relative is-flex is-center justify-center align-center">
            <div class="has-text-centered doc-loader" v-if="!is_loaded">
            <i class="fas fa-circle-notch fa-spin fa-2x"></i>
            </div>
            <iframe target="_parent" v-show="is_loaded"
            id="doc-viewer"
            name="doc-viewer"
            :src="link"
            frameborder="0"
            class="docviewer"
            @load="loaded"
            allowfullscreen
            ></iframe>
        </div>
    </div>
</modal>
</div>
</template>
<script>
export default {
  data() {
    return {
      is_loaded: false,
      iframe: null
    };
  },
  props: ['link'],
  mounted(){
    this.$modal.hide('doc');
    this.$modal.show('doc');
        this.iframe = setInterval(()=>this.reload_iframe(),3000);
  },
  destroyed(){
      clearInterval(this.iframe);
  },
  methods: {
    reload_iframe(){
        if(!this.is_loaded){
            document.querySelector('#doc-viewer').src= this.link;
        }
        else{
            clearInterval(this.iframe);
        }
    },
    loaded(){
        this.is_loaded = true;
    },
    close_modal() {
        this.$modal.hide('doc');
        this.$emit('close');
    }
  }
};
</script>
<style lang="scss">
.doc-modal .card{
// z-index:99999;
background-color: #d1d1d1 !important;
}
.doc-loader{
    position: absolute;
    top: 45vh;
    transform: translateX(-50%);
    
}
.doc-viewer {
    width: auto;
    min-height: 100vh;
}
.docviewer {
width: 100vw;
min-height: 95vh;

}
</style>

