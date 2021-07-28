<template>
<!-- width 100% to move card within iframe -->
  <div id="ebs-modal" style="width:100%;">
    <div
      v-if="element" class="is-flex is-between align-center mt-10"
      id="ebs-buttons" 
      :style="{'top':$route.name.includes('therm')?'5.2rem':'6rem',
      'right':therm_details_open?'31.8rem':'6rem'}"
    >
      <p v-tooltip="'Tickets'"
        @click="
          is_active = 'tickets';
          active_view = 'tickets';
          $modal.show('ebs-modal');
        "
        class="ml-10 is-pointer pt-5"
        :class="{ 'is-info': active_view == 'tickets' }"
        ><img class="rotate-icon is-20x20" src="@/assets/icons/tickets/tickets-viewer.svg" alt /></p
      >
      <p v-tooltip="'Vault'"
        @click="
          is_active = 'vault';
          active_view = 'vault';
          $modal.show('ebs-modal');
        "
        class=" is-pointer  ebs-vault pt-5 pl-10 pr-5"
        :class="{ 'is-info': active_view == 'vault' }"
        ><img class="rotate-icon is-20x20" src="@/assets/icons/vault/vault-viewer.svg" alt /></p
      >
    </div>

    <!-- <modal
      :adaptive="true"
      name="ebs-modal"
      draggable=".dragger"
      :clickToClose="false"
      :classes="['ebs-modal','has-slimscroll']"
      :width="'347px'"
      :minWidth="347"
      :maxWidth="347"
      :minHeight="347"
      :height="height"
      :transition="''"
      @before-close="before_close($event)"
      @opened="on_open($event)"
      @closed="closed($event)"
      :max-height="700"
    > -->
      <!-- shiftX=".993" -->
      <!-- pivot-x="0.993" -->
      <!-- @resize="resize($event)" -->
      <!-- :resizable="true" -->
      <!-- @before-open="before_open($event)" -->
    <vue-resizable :class="{'is-vhidden':!is_active || !element}"
    :width="360" :max-width="360" :min-width="360" :active="[]" :top="top +'px'" :left="left + 'px'" :height="height + 'px'"
    :dragSelector="dragSelector" class="has-background-white ebs-modal"
    :min-height="347" :max-height="700" :fit-parent="true"
    @mount="on_mount" 
    @drag:end="eHandler">
      <div class="dragger pt-10" style="cursor:grab">
        <img class="margin-auto is-block" src="@/assets/icons/drag.svg" alt />
      </div>
      <div>
        <div  class="ebs-quick-list">
          <!-- <div class="pull-tab"></div> -->
          <div class="px-10 is-flex is-vcenter has-space-between" v-if="!info_tab.active">
            <div class="is-sh-dropdown" v-click-outside="() => (active = false)">
              <div class="is-pointer" @click="active = !active">
                <div class="is-selector" :class="[active ? 'is-open is-11-rem' : 'is-close ']">
                  <p class="is-flex">
                    <span class="is-semiBold-16-600-19 is-flex is-vcenter is-capitalized">{{ active_view }}</span>
                    <sh-icon :name="!active ? 'collapse' : 'expand'" class="is-16x16 ml-10"></sh-icon>
                  </p>
                </div>
              </div>

              <ul class="is-options-list is-11-rem" v-if="active">
                <li
                  class="item is-flex is-between pl-17"
                  v-for="option in ['tickets', 'vault']"
                  :key="option"
                  @click="
                    active_view = option;
                    active = false;
                  "
                >
                  <p class="item--text is-capitalized is-flex">
                    <span class="is-capitalised">{{ option }}</span>
                    <sh-icon v-if="active_view == option" :name="'checkmark'" class="is-12x12 ml-10" />
                  </p>
                </li>
              </ul>
            </div>
            
          </div>
          <div slot="top-right" class="is-pointer is-absolute mr-20" style="top:2.8rem;right:1rem">
            <p
              @click="
                $modal.hide('ebs-modal');
                is_active = null;
                active_view = '';$store.commit('vault/SET_INFO_TAB',{active:false});
              "
            >
              <sh-icon :name="'close'" class="is-12x12"></sh-icon>
            </p>
          </div>
          <div v-if="active_view === 'tickets'" class="ebs-quick-list__items has-slimscroll">
            <tickets v-if="element" :customclass="'is-relative'" :is_vertical_window="true" :element="element"></tickets>
          </div>
          <div v-else class="ebs-quick-list__items has-slimscroll">
            <vault v-if="element" :is_viewer_small="true" :element="element"></vault>
          </div>
        </div>
      </div>
    </vue-resizable>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  import VueResizable from 'vue-resizable'
  import vault from "@/desktop/vault/vault";
  import tickets from "@/desktop/tickets/components/tickets-list/tickets-list";
  import axios from "axios";

  export default {
    components: {
      tickets,
      vault,
      VueResizable
    },
    data() {
      return {
        dragSelector: ".dragger",
        isLoading: false,
        element: null,
        is_active: false,
        active: false,
        active_view: "tickets",
        top: localStorage.getItem('ebstop')||15,
        left: localStorage.getItem('ebsleft')||(window.innerWidth - 430),
        height: (window.innerHeight - 70),
        therm_details_open: false,
        elem: null,
        list_items: null,
      };
    },
    computed: {
    ...mapState("vault", [
        "info_tab",
      ]),
    },
    beforeDestroy() {
      this.$eventHub.$off("update_element_data", this.update_element_data);
      if (window.addEventListener) {
        window.removeEventListener("message", this.message_event_handler);
        window.removeEventListener("message", this.change_icons_position);
      } else {
        window.detachEvent("onmessage", this.message_event_handler);
        window.detachEvent("onmessage", this.change_icons_position);
      }
    },
    created() {
      // enable for testing
      // localStorage.removeItem("ebstop");
      //   localStorage.removeItem("ebsleft");
      //   localStorage.removeItem("ebsheight");

      if (this.$route.name == "ebs") {
        let el = JSON.parse(atob(this.$route.params.element));

        if (el && el.uid) {
          this.element = el;
        } else this.create_element(atob(this.$route.params.element));
      }

      this.$eventHub.$on("update_element_data", this.update_element_data);

      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

      eventer(messageEvent, this.message_event_handler);
      eventer(messageEvent, this.change_icons_position);
    },
    methods: {
      change_icons_position(e){
        console.log(e)
        if (_.isObject(e.data) && e.data.name === "change_icons_position") {
          this.therm_details_open = e.data.details_open;
        }
      },
      on_mount(data){
        console.log("open modal ,from local storage",this.top,this.left,this.height);
        this.elem = document.querySelector(".ebs-modal");
        this.list_items = document.querySelector(".ebs-quick-list__items");
        this.height = (window.innerHeight - 70);
        this.elem.style.height=this.height + 'px';
        this.set_list_height();
        this.elem.style.top = this.top + 'px';
        this.elem.style.left = this.left + 'px';
      },
      eHandler(data){
        // this.height = data.height;
        this.left = data.left;
        this.top = data.top;
        this.set_list_height();
        this.set_local_store(this.top,this.left,this.height)
      },
      set_local_store(top,left,height){
        console.log("setting top,left,height",top,left,height)
        localStorage.setItem("ebstop", top);
        localStorage.setItem("ebsleft", left);
        localStorage.setItem("ebsheight", height);
      },
      // on_open(e){
      //   console.log("open modal ,from local storage",this.top,this.left,this.height);
      //   this.elem = document.querySelector(".ebs-modal");
      //   this.elem.style.minHeight='347px';
      //   this.list_items = document.querySelector(".ebs-quick-list__items")
      //   this.set_list_height();

      //     if(localStorage.getItem("top") === null||localStorage.getItem("left") === null||localStorage.getItem("height") === null)
      //   {
      //     console.log("after open modal, no ls items ")
      //     this.elem.style.height='640px';
      //     this.list_items.style.height='600px';
      //     this.elem.style.top = '10px';
      //     this.elem.style.right = '10px';
      //     console.log("ebs styles applied",this.elem.style)
      //   }else {
      //     console.log("ls available setting ebs height and position")
      //     this.elem.style.height=this.height;
      //     this.list_items.style.height = this.height;
      //     this.set_list_height();
      //     this.elem.style.top=this.top;
      //     this.elem.style.left=this.left;
      //   }
      // },
      set_list_height(){
        // let h = this.height.slice(0,-2);
        this.list_items.style.height = (this.height-50) + 'px'
      },
      update_element_data (element) {
        this.element = element;
        this.element = Object.assign(this.element);
        this.$eventHub.$emit("get-other-tickets");
      },
      message_event_handler (e) {
        if ((e.data.name !== "show_ebs_data" && e.data.name !== "sidebar_toggle") || e.origin === window.origin) {
          return;
        }
        if (e.data.name == "show_ebs_data") {
          if (e.data.element) {
            this.create_element(e.data.element);
            if (this.is_active) {
              setTimeout(() => {
                this.$modal.show("ebs-modal");
              }, 100);
            }
          } else {
            this.element = null;
            this.$modal.hide("ebs-modal");
          }
        }
      },
      go_to_ebs() {
        this.$router.push({
          name: "ebs",
          params: { element: btoa(JSON.stringify(this.element)) },
        });
      },

      create_element(selected_feature) {
        if (selected_feature && selected_feature.properties.element && _.isObject(selected_feature.properties.element)) {
          let centroid = turf.centroid(selected_feature);
          if (centroid)
            centroid = {
              lng: centroid.geometry.coordinates[0],
              lat: centroid.geometry.coordinates[1],
            };

          this.element = {
            ...selected_feature.properties.element,
            active_tab: "tickets",
            name: selected_feature.properties.name,
            centroid,
          };
          this.element = Object.assign(this.element);
        } else {
          this.element = selected_feature;
        }
      },
    },
  };
</script>

<style lang="scss">
.ebs-vault {
  // padding: 0.36rem;
  box-shadow: -1px 0px 2px 0px rgba(0, 0, 0, 0.06);
}
.pull-tab {
    height: 0px;
    width: 0px;
    border-top: 10px solid $primary;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    -webkit-transform: rotate(-45deg);
    position: absolute;
    bottom: -5px;
    right: -4px;
    pointer-events: none;
    z-index: 5;
}
#ebs-buttons {
  position: fixed;
  top: 5.9rem;
  right: 6rem;
  width: 7.2rem;
  height: 3.2rem;
  background: white;
  z-index: 0 !important;
  display: flex;
  border-radius: 0.3rem;
  .rotate-icon {
    transform: rotate(-90deg);
  }

  // flex-direction: column;
}
  #ebs-modal {
    .ebs-modal {border-radius: 0.5rem;z-index:30;}
    
  }
  .ebs-quick-list {
    padding:  0;
    border-radius: 4px;
    background: white;
    // height: 100vh;
    &__items {
      // height: calc(100% - 50px);
      width: 100%;
      padding-bottom:1rem;
      overflow-y: scroll;
      overflow-x: hidden;
    }
  }

  .rotate-180 {
    transform: rotate(180deg);
    transform-origin: center;
    margin-bottom: 1rem;
  }

  .is-11-rem {
    width: 11rem;
  }
</style>