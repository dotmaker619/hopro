<template>
  <div class="apps">
    <div class="tabs">
      <ul>
        <li :class="{'is-active': active_tab == 'terra'}" @click="active_tab = 'terra'">
          <a class="is-medium-18-500-22 has-text-theme-black">Terra</a>
        </li>
        <li :class="{'is-active': active_tab == 'therm'}" @click="active_tab = 'therm'">
          <a class="is-medium-18-500-22 has-text-theme-black">Thermal</a>
        </li>
      </ul>
    </div>
    <div class="app-details mt-20" v-if="active_tab == 'terra'">
      <keep-alive>
        <dashboard-terra></dashboard-terra>
      </keep-alive>
    </div>

    <div class="app-details" v-else>
      <keep-alive>
        <dashboard-therm></dashboard-therm>
      </keep-alive>
    </div>
  </div>
</template>
<script>
import InfoBlock from "@/desktop/shared/components/info-block";
import UserTag from "@/desktop/shared/components/tags/user-tag";
import DashboardTerra from "./components/dashboard-terra";
import DashboardTherm from "./components/dashboard-therm";

export default {
  data() {
    return {
      active_tab: "terra"
    };
  },

  components: {
    DashboardTerra,
    DashboardTherm
  }
};
</script>
<style lang="scss">
.tabs li.is-active a {
  color: #000;
  border-width: 3px;
  border-bottom-color: $primary;
  opacity: 1;
}
.tabs li a {
  color: #171e48;
  border-width: 3px;
  border-bottom-color: none;
  opacity: 0.4;
  padding: 1.5rem;
  &:hover {
    border-bottom-color: $primary;

    opacity: 1;
  }
}

.tabs a {
  border-width: 0;
  border-bottom-color: transparent;
}
.tabs ul {
  border-bottom-color: transparent;
}

.media-left {
  width: 4rem;
  height: 4rem;
}

.card {
  // width: 57.6rem;
  border-radius: 1rem;
  box-shadow: 0 1px 5px 0 rgba(23, 30, 72, 0.1);
  background-color: #ffffff;
  .more-menu {
    visibility: hidden;
    right: 1rem;
    position: absolute;
    top: 50%;
  }
  &:hover {
    .more-menu {
      visibility: visible;
      cursor: pointer;
    }
    .title {
      color: $primary;
    }
  }
}
.card-content {
  margin-bottom: 1rem;
  padding: 1rem;
}

.is-underlined {
  text-decoration: underline;
}

.user_group {
  border-radius: 50%;
  border: 2px solid white;

  &:nth-of-type(1) {
    z-index: 12;
  }

  &:nth-of-type(2) {
    z-index: 13;
    margin-left: -5px;
  }

  &:nth-of-type(3) {
    z-index: 13;
    margin-left: -1rem;
  }
}
</style>
