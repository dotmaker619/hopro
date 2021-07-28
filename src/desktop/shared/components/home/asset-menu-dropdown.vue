<template>
  <div class="asset-menu-dropdown" v-click-outside="()=>active=false">
    <div class="sh-dropdown">
      <div class="sh-dropdown-selection mt-10 px-5 py-5 is-pointer" @click="active=!active">
        <sh-icon :name="'3dots-menu'" class="is-16x16 is-pointer"></sh-icon>
      </div>
      <ul class="sh-dropdown-content is-action" v-if="active" @click.stop>
        <router-link :to="{name: 'asset-details', params:{id:asset.uid}}">
          <li class="sh-dropdown-content__item">
            <sh-icon
              :name="'watchers'"
              :file="'tickets_sprite'"
              class="is-24x24 sh-dropdown-content__item--icon"
            ></sh-icon>
            <span
              class="sh-dropdown-content__item--text is-medium-16-500-19 has-text-theme-black"
            >View Details</span>
          </li>
        </router-link>
        <li class="sh-dropdown-content__item" @click.stop="$emit('open_modal',asset)">
          <!-- <svg viewBox="0 0 100 100" class="image is-24x24 sh-dropdown-content__item--icon">
            <use xlink:href="@/assets/icons/app-icon.svg" />
          </svg>-->
          <img style="margin-left: 2px;" src="@/assets/icons/app-icon.svg" alt />
          <span
            style="margin-left: 1.4rem;"
            class="sh-dropdown-content__item--text is-medium-16-500-19 has-text-theme-black"
          >View Applications</span>
        </li>
        <li class="sh-dropdown-content__item" @click.stop="$emit('asset_form',asset)">
          <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
          <span
            class="sh-dropdown-content__item--text is-medium-16-500-19 has-text-theme-black"
          >Edit Asset</span>
        </li>
        <li class="sh-dropdown-content__item" @click.stop="$emit('transfer_ownership',asset)">
          <sh-icon :name="'transfer'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
          <span
            class="sh-dropdown-content__item--text is-medium-16-500-19 has-text-theme-black"
          >Transfer Ownership</span>
        </li>
        <li class="sh-dropdown-content__item" @click.stop="$emit('delete_asset',asset)">
          <sh-icon :name="'delete'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
          <span
            class="sh-dropdown-content__item--text is-medium-16-500-19 has-text-theme-black"
          >Delete Asset</span>
        </li>
        <hr />
        <li class="asset-disable">
          <span
            class="sh-dropdown-content__item--text is-medium-16-500-19 has-text-theme-black"
          >Asset Disable</span>
          <label class="switch is-pulled-right" :class="{'disable-switch':!user_has_access}">
            <input
              type="checkbox"
              :disabled="!user_has_access"
              v-model="is_disable"
              @change="$emit('disable_asset',{is_disable:is_disable,id:asset.uid});active=false"
            />
            <div :class="[!user_has_access? 'fade-switch':'active-switch']"></div>
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import store from "@/store/";
export default {
  props: ["asset"],
  data() {
    return {
      active: false,
      is_disable: !this.asset.public
    };
  },
  computed: {
    ...mapGetters(["is_owner", "is_manager", "is_internal_user"]),
    user_has_access() {
      let current_user = store.state.claims.user_id;
      if (
        current_user == this.is_owner ||
        this.is_manager ||
        this.is_internal_user ||
        this.asset.owner.uid
      ) {
        return true;
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.asset-menu-dropdown {
  .sh-dropdown-content {
    width: 23rem;
    box-shadow: 10px 20px 50px 0 rgba(23, 30, 72, 0.2);
    border: solid 1px rgba(23, 30, 72, 0.15);
    right: -1rem;
    top: 2.3rem;
    padding: 1rem 0;
    border-radius: 1rem;
    &__item {
      padding: 1.2rem 2.5rem;
    }
  }
  .sh-dropdown-content__item--text {
    padding: 0.3rem 0rem;
    span {
      white-space: nowrap;
      line-height: 50px;
    }
  }

  .is-24x24 {
    height: 2.4rem;
    width: 2.4rem;
  }

  .asset-disable {
    margin: 1rem 3rem;
  }
  .switch input {
    position: absolute;
    opacity: 0;
  }

  /**
 * 1. Adjust this to size
 */
  .disable-switch {
    opacity: 0.6;
    border-color: grey;
  }

  .switch {
    margin-top: 3px;
    display: inline-block;
    font-size: 20px; /* 1 */
    height: 1em;
    width: 1.9em;
    border: 2px solid $primary;
    border-radius: 2em;
  }

  .switch div {
    height: 17px;
    width: 17px;
    border-radius: 1em;
    box-shadow: 0 0em 0em rgba(0, 0, 0, 0.3);
    -webkit-transition: all 300ms;
    -moz-transition: all 300ms;
    transition: all 300ms;
  }

  .switch input:checked + div {
    -webkit-transform: translate3d(100%, 0, 0);
    -moz-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}
.fade-switch {
  background: grey;
}
.active-switch {
  background: $primary;
}
</style>