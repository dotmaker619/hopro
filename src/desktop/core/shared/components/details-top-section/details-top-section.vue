<template>
  <div class="pin" :class="{ 'pin-padding': $route.name.includes('-vault') }" v-if="details">
      
      <path-breadcrumb :details="details" :page="page"></path-breadcrumb>
      <!-- <div class="pin-text is-pointer" @click.stop="page && page!=='project'?$router.push({ name: page + '-list' }):$router.go(-1)" v-tooltip="details.name.length > 30 ? details.name : null">
        <i class="fas fa-chevron-left mr-10"></i>
        {{ $route.path||details.name }}
      </div> -->

      <div class="pinned-resource" v-if="$route.name == page+'-tickets' || $route.name == page+'-vault'">
        <div class="pinned-resource-buttons">
          <div @click="access('tickets')?$router.push({ name: page + '-tickets' }):no_access_popup('tickets')" 
          class="resource-view mr-10" 
          :class="{ 'is-button ': $route.name == page+'-tickets' }">
            <span class="is-flex is-vcenter">
              <svg viewBox="0 0 100 100" class="image is-21x21 mr-10" >
                <use xlink:href="@/assets/icons/sprite.svg#tickets-small-active" v-if="$route.name == page+'-tickets'" />
                <use xlink:href="@/assets/icons/sprite.svg#tickets-small" v-else />
              </svg>
              <span :class="[$route.name == page+'-tickets' ? 'has-text-light' : 'has-text-grey-light']">Tickets</span>
            </span>
          </div>

          <div
            class="resource-view"
            @click="access('vault')?$router.push({ name: page + '-vault' }):no_access_popup('vault');"
            :class="{ 'is-button': $route.name == page+'-vault' }"
          >
            <span class="is-flex is-vcenter">
              <svg viewBox="0 0 100 100" class="image is-21x21 mr-10" >
                <use xlink:href="@/assets/icons/sprite.svg#vault-small-active" v-if="$route.name == page+'-vault'" />
                <use xlink:href="@/assets/icons/sprite.svg#vault-small" v-else />
              </svg>
              <span :class="[$route.name == page+'-vault' ? 'has-text-light' : 'has-text-grey-light']">Vault</span>
            </span>
          </div>
        </div>
      </div>

      <div class="pin-icon is-flex">

        <div v-if="page"  class="is-pointer"  
        @click="toggle_ebs">
          <img src="@/assets/icons/applications-inactive.svg" v-if="view_type == 'resource'" alt />
          <img src="@/assets/icons/applications-active.svg" v-else alt />
        </div>

        <img v-if="page" class="ml-10 mr-10" style="height:20px" src="@/assets/icons/seperate.svg" alt />
        
        <span class="is-pointer mr-10">
          <svg viewBox="0 0 100 100" class="image is-24x24 mr-10" @click="$emit('show_pin_modal')">
            <use xlink:href="@/assets/icons/sprite.svg#pinned-active" v-if="isPinned" />
            <use xlink:href="@/assets/icons/sprite.svg#pinned"  v-else />
          </svg>
        </span>

      </div>
    </div>
</template>

<script>
import PathBreadcrumb from "@/desktop/core/shared/components/details-top-section/components/path-breadcrumb";
export default {
    props: ['details','view_type','page'],
    data(){
        return {

        }
    },
    components: {
      PathBreadcrumb
    },
    methods: {
        toggle_ebs(){
            if(this.view_type=='resource'){
                if(this.access('tickets')){
                  this.$emit('toggle_view_type');
                  this.$router.push({name: this.page+'-tickets'});
                }else if(this.access('vault')){
                  this.$emit('toggle_view_type');
                  this.$router.push({name: this.page+'-vault'});
                }else {
                    this.no_access_popup('vault');
                }
            }else {
                this.$emit('toggle_view_type');
                this.$router.push({name: this.page+'-details'});
            }
        }
    }
}
</script>

<style lang="scss">
  .is-borderless {
    border: none !important;
  }

  .is-21x21 {
    height: 2.1rem;
    width: 2.1rem;
  }
  .pinned-resource {
    &-buttons {
      width: 212px;
      height: 40px;
      border-radius: 6px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.16);
      background-color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem;
      font-family: Barlow-SemiBold;
      font-size: 14px;
      font-weight: 600;
      font-stretch: normal;
      font-style: normal;
      line-height: 17px;
      letter-spacing: normal;
      text-align: left;
    }
  }

  .resource-view {
    width: 12rem;
    height: 3rem;
    border-radius: 4px;
    padding: 0.5rem;
    font-weight: 500;
    text-align: center;
    cursor: pointer;
    &.is-button {
      background-color: $primary;
      color: white;
    }
  }
</style>