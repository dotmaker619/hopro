<template>
  <div>
    <map-component @show_details="show_details"></map-component>
    <div class="map-details is-relative" v-if="popup_details" v-click-outside="() => (popup_details = null)">
      <div class="popup-card">
        <div class="popup-card__content">
          <router-link :to="{ name: 'asset-details', params: { id: popup_details.uid } }" v-tooltip="{ content: `Go to asset` }">
            <p class="title is-inline sh-text-normal-18 has-text-info is-capitalized">{{ popup_details.name }}</p>
          </router-link>
          <p class="subtitle">{{ popup_details.description || "*No description" }}</p>
          <div class="users columns">
            <div class="column right_border is-one-third">
              <span class="sh-text-normal-12 has-text-grey no-whitespace-wrap">Created by</span>
              <div
                v-tooltip="{ content: `${$store.getters.state_users[popup_details.owner.uid].first_name} ${$store.getters.state_users[popup_details.owner.uid].last_name}` , html: false }"
                v-if="$store.getters.state_users[popup_details.owner.uid]"
                class="mr-5"
              >
                <div class="user-picture" v-if="$store.getters.state_users[popup_details.owner.uid].display_picture">
                  <img class="is-rounded" :src="$store.getters.state_users[popup_details.owner.uid].display_picture" />
                </div>
                <div
                  class="user-picture user-picture__icon is-semiBold-16-600-19"
                  v-else
                  :style="
                    `background-color: ${hashed_color(
                      $store.getters.state_users[popup_details.owner.uid].first_name
                        ? $store.getters.state_users[popup_details.owner.uid].first_name + ' ' + $store.getters.state_users[popup_details.owner.uid].last_name
                        : $store.getters.state_users[popup_details.owner.uid].email,
                      'userManagement'
                    )}`
                  "
                >
                  {{
                    $store.getters.state_users[popup_details.owner.uid].first_name
                      ? $store.getters.state_users[popup_details.owner.uid].first_name.charAt(0)
                      : $store.getters.state_users[popup_details.owner.uid].email.charAt(0)
                  }}
                </div>
              </div>
            </div>
            <div class="column">
              <span class="sh-text-normal-12 has-text-grey no-whitespace-wrap">Users</span>
              <user-tag :users="popup_details.users || []" :howManyToShow="2"></user-tag>
              <div></div>
            </div>
          </div>
          <span class="sh-text-normal-12 has-text-grey no-whitespace-wrap">Teams</span>
          <primary-tag :tags="popup_details.labels" toShowCount="2" type="team" :no_wrap="false"></primary-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import MapComponent from "@/desktop/shared/components/dashboard/map-component";
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    mixins: [HashColor],
    components: {
      UserTag,
      PrimaryTag,
      MapComponent,
    },
    data() {
      return {
        popup_details: null,
        show_popup: false,
      };
    },
    methods: {
      async show_details(asset) {
        this.popup_details = JSON.parse(asset);
        this.show_popup = true;
      },
    },
  };
</script>

<style lang="scss" scoped>
  // asset map
  .user-picture {
    height: 4rem;
    width: 4rem;
    overflow: hidden;
    border-radius: 50%;

    &__icon {
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      text-transform: capitalize;
    }
  }
  .right_border {
    border-right: 1px solid #ddd;
  }

  .container {
    margin-top: 1rem;
    .map-container {
      .searchbar {
        width: 38.2rem;
        height: 4rem;
        right: 20%;
      }

      .filter {
        width: 4rem;
        height: 4rem;
        border-radius: 4px;
        right: 10%;
        background-color: $white;
      }

      .map-filter {
        position: absolute;
        top: 1.5rem;
        box-shadow: 0 3px 5px 0 rgba(23, 30, 72, 0.05);
        border: none;
      }
    }
  }
  .Image-5 {
    height: 100%;
    border-radius: 1rem;
    object-fit: cover;
  }

  .popup-card {
    background: $white;
    z-index: 10;
    height: max-content;
    width: 30rem;
    position: absolute;
    border-radius: 0.5rem;
    box-shadow: 1px 1px 5px 2px #ddd;
    padding: 2rem;
    right: 2rem;
    top: 2rem;
  }
  .c-tag {
    width: 7.7rem;
    height: 2.8rem;
    border-radius: 1.4rem;
    background-color: #e8ebfa;
    margin-right: 4px;
    p {
      opacity: 0.9;
      // font-family: Barlow;
      font-size: 1.4rem;
      font-weight: 500;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.21;
      letter-spacing: normal;
      text-align: center;
      color: #171e48;
      margin-top: 4px;
    }
  }
</style>
