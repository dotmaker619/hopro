<template>
  <div class="sidebar column has-slimscroll-xs is-paddingless" :class="{ 'is-thinner': shrink_sidebar || is_tablet }">
    <div class="sidebar--standard has-slimscroll" :class="{ 'is-thinner pt-50': shrink_sidebar || is_tablet }">
      <img src="@/assets/logos/sensehawk-logo.svg" alt class="is-marginless is-logo" v-if="!shrink_sidebar" />
      <div class="image is-32x32 margin-x-auto small-logo" v-else-if="shrink_sidebar || is_tablet">
        <img src="@/assets/logos/sensehawk-logo-small.svg" alt class="is-marginless" />
      </div>
      <img src="@/assets/logos/sensehawk-logo-small.svg" alt class="is-marginless is-logo--mobile" v-else />
      <div @click="navigate(nav)" v-for="nav in navigation_headers" :key="nav.header" class="sidebar__item is-pointer">
        <!-- :to="{ name: nav.to }" -->
        <p class="sidebar__item--image">
          <svg viewBox="0 0 100 100" class="icon">
            <use v-if="handle_routes(nav.header)" :xlink:href="`${icon + nav.sprite + '-active'}`" />
            <use v-else :xlink:href="`${icon + nav.sprite}`" />
          </svg>
        </p>
        <span
          :class="{ 'has-text-white': handle_routes(nav.header) }"
          class="sidebar__item--text is-medium-15-500-18"
          v-if="!shrink_sidebar && !is_tablet"
          >{{ nav.header }}</span
        >
      </div>
    </div>

    <div v-if="false" class="sidebar--pinned">
      <div class="level" @click="togglePinnedMenu = !togglePinnedMenu">
        <p class="is-pinned level-left">Pinned</p>
        <p class="is-pinned level-right">
          <i :class="{ 'is-hidden': togglePinnedMenu }" class="fas fa-angle-down"></i>
          <i :class="{ 'is-hidden': !togglePinnedMenu }" class="fas fa-angle-up"></i>
        </p>
      </div>
      <li v-for="(tab, i) in PINNED_TABS" :key="i" class="sidebar__item ml-20" :class="{ 'is-hidden': togglePinnedMenu }">
        <router-link :to="{ path: tab.path }" tag="span" class="sidebar__item--text is-medium-15-500-18" v-if="!shrink_sidebar && !is_tablet">{{
          tab.name
        }}</router-link>
        <div class="sidebar__item--editOptions">
          <img @click="unpin_tab(tab)" src="@/assets/icons/remove_pin.svg" class="is-pointer" />
        </div>
      </li>
    </div>
  </div>
</template>

<script>
  import { mapState } from "vuex";

  export default {
    data() {
      return {
        togglePinnedMenu: true,
        icon: require("@/assets/icons/sprite.svg"),
        navigation_headers: [
          {
            header: "Home",
            to: "home",
            sprite: "#home",
            access_key: "",
          },
          {
            header: "Dashboard",
            to: "dashboard",
            sprite: "#core-sidebar",
            access_key: "core",
          },
          {
            header: "Terra",
            to: "terra-list",
            sprite: "#terra-sidebar",
            access_key: "terra",
          },
          {
            header: "Thermal",
            to: "therm-view-list",
            sprite: "#therm-sidebar",
            access_key: "therm",
          },
          // {
          //   header: "Missions",
          //   to: "mission-list",
          //   sprite: "#missions-sidebar"
          // },
          // {
          //   header: "Processing",
          //   to: "process-list",
          //   sprite: "#processing-sidebar"
          // },
          {
            header: "Tickets",
            to: "overview",
            sprite: "#tickets-sidebar",
            access_key: "tickets",
          },
          {
            header: "Vault",
            to: "vault",
            sprite: "#vault-sidebar",
            access_key: "vault",
          },
          {
            header: "Project Management",
            to: "asset-list",
            sprite: "#project-management",
            access_key: "",
          },
          {
            header: "Users",
            to: "user-list",
            sprite: "#user-management",
            access_key: "",
          },
        ],
      };
    },

    computed: {
      ...mapState(["PINNED_TABS", "claims", "current_organization"]),

      shrink_sidebar() {
        return (
          this.$route.name.includes("viewer") ||
          this.$route.path.includes("ticket-dashboard") ||
          this.$route.path.includes("vault-dashboard") ||this.$route.path.includes("forms")|| 
          ["vault", "vault-activities"].includes(this.$route.name)
        );
      },
      is_tablet() {
        if (window.screen.width < 770) {
          return true;
        } else {
          return false;
        }
      },
    },

    methods: {
      navigate(nav) {
        this.$store.commit("tickets/SET_SELECTED_ASSET", []);
        if (!nav.access_key) this.$router.push({ name: nav.to });
        else {
          if (this.access(nav.access_key)) this.$router.push({ name: nav.to });
          else this.no_access_popup(nav.access_key);
        }
      },
      async unpin_tab(tab) {
        let pinnedTabsRef = this.$store.state.firebase_database.ref(
          `/userProfile/${this.claims.user_id}/organizations/${this.current_organization.uid}/pinnedTabs`
        );
        await pinnedTabsRef
          .set(this.PINNED_TABS.filter((p) => p.path !== tab.path))
          .then(() => {
            this.$eventHub.$emit("refetch-pinned-tabs");
            this.$emit("closed");
          })
          .catch((err) => this.handleErrors(err));
      },
      handle_routes(nav) {
        if (nav == "Home") return this.$route.name == "home";
        if (nav == "Dashboard") return this.$route.name == "dashboard";
        if (nav == "Thermal") return this.$route.path.includes("therm");
        if (nav == "Missions") return this.$route.name == "mission-list";
        if (nav == "Processing") return this.$route.name == "process-list";
        if (nav == "Terra") return this.$route.path.includes("terra");
        if (nav == "Vault") return this.$route.path.includes("vault");
        if (nav == "Tickets") return this.$route.path.includes("ticket");

        if (nav == "Project Management") return this.$route.path.includes("project-management");

        if (nav == "Users") return this.$route.path.includes("user-management");
      },
    },
  };
</script>

<style lang="scss">
  .sidebar {
    // width: 22rem;
    height: 100vh;
    overflow-y: scroll;
    position: sticky;
    top: 0;
    background-color: $dark-background;

    &.is-thinner {
      width: 5rem;
      overflow-x: hidden;

      .sidebar__item {
        height: 6rem;
      }
    }
    .sidebar__item {
      height: 6rem;
    }

    @include for-size(tablet) {
      width: 5rem;
      overflow: hidden;
    }
    &--standard,
    &--pinned {
      background-color: $dark-background;
      width: 22rem;
      padding-right: 0;

      &.is-thinner {
        width: 5rem;
        overflow: hidden;
      }
    }

    .is-logo {
      margin: 1rem 0 1rem 2.2rem;
      width: 20rem;
      @include for-size(tablet) {
        display: none;
      }

      &--mobile {
        display: none;
        @include for-size(tablet) {
          display: block;
          height: 3rem;
          width: 100%;
        }
      }
    }

    &--standard {
      height: max-content;
    }
    &--pinned {
      height: -webkit-fill-available;

      @include for-size(tablet) {
        display: none;
      }
    }
    li {
      list-style: none;
    }
    &__item {
      display: flex;

      position: relative;
      &:not(:last-of-type) {
        border-bottom: 1px solid $divider-color;
      }

      &--text {
        margin: 2rem 0;
        width: 5.4rem;
        color: $grey-text;
        white-space: nowrap;
        @include for-size(tablet) {
          visibility: hidden;
        }
      }
      &--image {
        display: flex;
        margin: auto 2.2rem auto 1.4rem;
        .icon {
          justify-content: center;
          height: 2.4rem;
          width: 2.4rem;
        }
      }
      &--arrow {
        display: none;
        margin: 0;
        position: absolute;
        right: 0;
        top: 50%;
      }
      &--editOptions {
        position: relative;
        right: 0;
        margin: auto;

        img {
          margin: 0 1.2rem;
          display: none;
        }
      }
    }

    .is-pinned {
      width: 4.2rem;
      opacity: 0.5;

      font-size: 1.4rem;
      font-weight: 500;
      margin: 0 2.2rem 0 1.4rem;

      color: $white;
    }
  }

  .sidebar__item:hover {
    .sidebar__item--text is-medium-15-500-18 {
      color: $hover-white-text;

      cursor: pointer;
    }

    .sidebar__item--editOptions {
      img {
        display: inline;
        cursor: pointer;
      }
    }
  }
  .small-logo {
    margin-bottom: 3.6rem !important;
  }
</style>
