<template>
  <nav class="attachment-search">
    <p class="searchbar control has-icons-left">
      <input
        v-model="search_keyword"
        class="searchbar__input input"
        placeholder="Search "
        autocomplete="off"
      />
      <span class="icon is-large is-left">
        <sh-icon class="imageis-48x48" :name="'search'" ></sh-icon>
      </span>
    </p>
  </nav>
</template>

<script>
export default {
    data(){
        return {
            search_keyword: ''
        }
    },
    watch: {
        search_keyword: function(val){
            this.$emit('search_val',val)
        }
    }
}
</script>
<style lang="scss" >
.attachment-search .searchbar__input{
  @include for-size(tablet){
    box-shadow: none;
    border-radius: none;
    width: 100%;
  }
}
</style>