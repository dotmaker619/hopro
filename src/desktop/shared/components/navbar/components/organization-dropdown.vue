<template>
  <div class="org_dropdown" :class="`${active && organization_list.length!=1?(isMobile?'open-content-mobile':'open-content'):''}`">
    <div
      class="header"
      @click="!$store.state.is_offline ? (active = !active) : null"
    >
      <div class="is-flex is-vcenter">
        <div
          class="organization-icon is-semiBold-15-600-18 mr-10"
          :style="`background-color: ${
            current_organization.color && current_organization.properties.color
              ? current_organization.properties.color
              : hashed_color(current_organization.name, 'projectManagement')
          }`"
        >
          {{ current_organization.name.charAt(0).toUpperCase() }}
        </div>
        <p class="is-medium-14-500-17">
          {{ current_organization.name | truncate(isMobile ? 15 : 22) }}
        </p>
      </div>
      <sh-icon
        v-if="organization_list && organization_list.length >= 2"
        :name="active ? 'collapse' : 'expand'"
        class="is-16x16"
      ></sh-icon>
    </div>
    <div
      v-if="
        organization_list &&
        organization_list.length >= 2 &&
        active &&
        !$store.state.is_offline
      "
      :class="`${isMobile? 'org_dropdown--m-content': 'org_dropdown--content'}`"
      v-click-outside="() => (active = false)"
    >
      <div class="is-flex align-center py-10" :class="`${isMobile?'m-nav-search': 'nav-search'}`">
        <span class="mx-10 nav-search-image">
          <img src="@/assets/icons/nav-search.svg" alt srcset />
        </span>
        <span>
          <input
            v-focus
            autocomplete="off"
            id="searchOrg"
            class="search-org is-regular-14-00-17"
            type="text"
            v-model="searchOrganization"
            placeholder="Search Organization"
          />
        </span>
      </div>
      <div
        v-if="filteredOrg && filteredOrg.length"
        class="dropdown-height-20 has-slimscroll"
      >
        <p
          class="is-medium-14-500-17 org_dropdown--content__item has-word-break-all"
          v-for="(organization, i) in filteredOrg"
          :key="i"
          @click="change_organization(organization)"
        >
          <span
            class="organization-icon is-semiBold-15-600-18 mr-10"
            :style="`background-color: ${
              organization.color && organization.properties.color
                ? organization.properties.color
                : hashed_color(organization.name, 'projectManagement')
            }`"
            >{{ organization.name.charAt(0).toUpperCase() }}</span
          >
          {{ organization.name }}
        </p>
      </div>
      <div v-else class="padding-20 is-flex is-center has-opacity-6">
        No organization found
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import shDropdown from "@/desktop/shared/components/sh-dropdown.vue";
import { organizationService } from "@/desktop/shared/services/";
import AuthMixin from "@/auth/shared/auth.mixin";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

export default {
  mixins: [AuthMixin, HashColor],
  computed: {
    ...mapState(["current_organization", "claims", "organization_list"]),
    filteredOrg() {
      return this.organization_list.filter((org) => {
        return org.name
          .toLowerCase()
          .includes(this.searchOrganization.toLowerCase());
      });
    },
    organization_list: {
      get() {
        return this.$store.state.organization_list;
      },
      set(val) {
        this.$store.commit("SET_ORGANIZATION_LIST", val);
      },
    },
  },
  components: {
    shDropdown,
    PrimaryTag,
  },
  data() {
    return {
      searchOrganization: "",
      active: false,
    };
  },
  async created() {
    if (this.$store.getters.has_user_role) {
      try {
        if (!this.organization_list || !this.organization_list.length) {
          let results = await organizationService.getAll({
            query: "page_size=99999&page=1",
          });
          this.organization_list = results.results ? results.results : [];
          this.organization_list = _.sortBy(this.organization_list, function (
            o
          ) {
            return o.name;
          });
        }
        // this.organization_list = await this.sort_organizations_on_access_time(
        //   this.organization_list
        // );
      } catch (err) {
        this.handleErrors(err);
        console.log(err);
      }
    } else {
      this.organization_list = [
        this.$store.state.claims.user_organization,
        ...this.$store.state.claims.guest_organizations,
      ];
      this.organization_list = _.sortBy(this.organization_list, function (o) {
        return o.name;
      });
      // this.organization_list = await this.sort_organizations_on_access_time(
      //   this.organization_list
      // );
    }
  },
  methods: {
    ...mapMutations(["SET_CURRENT_ORGANIZATION"]),

    async change_organization(organization) {
      this.SET_CURRENT_ORGANIZATION(organization);
      if (this.$route.name !== "home") {
        await this.$router.push({ name: "home" });
      }
      this.$router.go();
    },
    async sort_organizations_on_access_time(organizations) {
      if (this.$store.state.firebase_database)
        await this.$store.state.firebase_database
          .ref(
            `/userProfile/${this.$store.state.claims.user_id}/organizationAccessTimestamp`
          )
          .once("value")
          .then((result) => {
            let access_time = result.val() || {};

            organizations = _.sortBy(
              organizations.map((o) => {
                return { ...o, accessTimestamp: access_time[o.uid] };
              }),
              (u) => -u.accessTimestamp
            );
          });
      return organizations;
    },
  },
};
</script>

<style lang="scss" scoped>
.organization-icon {
  width: 2.4rem;
  min-width: 2.4rem;
  height: 2.4rem;
  color: $white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header {
  display: flex;
  align-items: center;
}

.org_dropdown {
  margin-top: 2.4rem;
  height: 4.4rem;
  position: relative;
  z-index: 2;
  width: 260px;
  height: 44px;
  border-radius: 22px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  background-color: #f3f7fc;
  display: flex;
  align-items: center;
  @include for-size(smartphones) {
    width: 218px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: none;
    border: solid 0.6px rgba(141, 149, 170, 0.5);
  }
  .header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0 10px;
    cursor: pointer;
  }

  &--content {
    width: 26rem;
    border-radius: 0 0 2.2rem 2.2rem;
    background-color: #fff;
    overflow: hidden;
    position: absolute;
    box-shadow: 0 8px 10px 0 #cdcdcd;
    top: 4.4rem;
    @include for-size(smartphones) {
      top: 4.2rem;
      width: 218px;
      border-radius: 4px;
      border: solid 0.6px rgba(141, 149, 170, 0.5);
    }

    &__item {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 1.5rem;
      &:hover {
        background-color: red;
        background-color: #f3f7fc;
      }
    }
    .nav-search {
      input {
        border: none;
        box-shadow: none;
      }
    }
  }
  &--m-content {
    background-color: #fff;
    overflow: hidden;
    position: absolute;
    box-shadow: 0 8px 10px 0 #cdcdcd;
    top: 4.2rem;
    width: 218px;
    border-radius: 4px;
    border: solid 0.6px rgba(141, 149, 170, 0.5);
    &__item {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 1.5rem;
      &:hover {
        background-color: red;
        background-color: #f3f7fc;
      }
    }
    .nav-search {
      input {
        border: none;
        box-shadow: none;
      }
    }
  }
}
.open-content {
  border-radius: 2.2rem 2.2rem 0 0;
  background-color: #fff;
  box-shadow: 0 5px 12px 2px #cdcdcd;
}
.open-content-mobile {
  border-radius: 4px;
  background-color: #fff;
  box-shadow: none;
}
.dropdown-height-20 {
  max-height: 20rem;
  overflow: auto;
}
.nav-search {
  border-radius: 22px;
  border: solid 0.6px rgba(141, 149, 170, 0.5);
  height: 40px;
  margin: 1rem;
  &-image {
    height: 16px;
    width: 16px;
  }
}
.m-nav-search {
  border-radius: 0px;
  border: none;
  height: 40px;
  margin: 0rem;
  border-bottom: solid 0.6px rgba(141, 149, 170, 0.5);
  &-image {
    height: 16px;
    width: 16px;
  }
}
.search-org {
  height: 38px;
  border: 0;
  color: $primary-text !important;
}
input.search-org::placeholder {
  color: $primary-text;
  opacity: 0.5;
}
</style>
