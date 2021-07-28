<template>
  <div>
    <div class="columns list-card is-flex align-center" v-if="item">
      <div class="column is-4">
        <router-link :to="{ name: 'therm-viewer', params: { id: item.uid } }" @click.native="append_recently_accessed_resource('therm', item.uid)">
          <info-block
            :hideImage="true"
            :info="{
              name: item.name,
              name_class: 'is-semiBold-16-600-19 has-text-theme-black card-list-title',
              bottom: 'Thermal Scanning',
              bottom_class: ' is-regular-14-500-17 has-text-theme-grey has-opacity-7',
              type: 'projectManagement',
            }"
            :truncate_value="50"
          />
        </router-link>
      </div>
      <div class="column is-3" v-if="$route.name != 'dashboard'">
        <div class="is-flex is-vcenter">
          <user-avatar :user="item.users.owner" :pxsize="30" :custom_class="'tiny-user-avatar'" class="mr-5"></user-avatar>
          <p
            class="ml-5 is-medium-14-500-17 has-text-weight-semibold has-text-lightgrey is-capitalized"
            v-if="item.users && item.users.owner"
            v-username="item.users.owner"
          ></p>
        </div>
      </div>
      <div class="column is-4">
        <div class="columns">
          <div class="column is-4">
            <h1 class="is-medium-16-500-19 has-text-theme-black mt-5 affected">
              {{ ((item.metrics.modules.affected * (item.moduleWattPeak || 300)) / 1000).toFixed(1) }}KW
            </h1>
          </div>
          <div class="column is-5">
            <h1 class="is-medium-16-500-19 has-text-theme-black mt-5 capacity">
              {{ (item.metrics.modules.total * ((item.moduleWattPeak || 300) / 1000000)).toFixed(1) }}MW
            </h1>
          </div>
          <div class="column is-3">
            <h1 class="is-medium-16-500-19 has-text-theme-black mt-5">
              {{ (item.metrics.issues && total_issues(item.metrics.issues)) || "0" }}
            </h1>
          </div>
        </div>
      </div>
      <div class="column is-1 sh-list__item--icon is-flex is-end">
        <router-link :to="{ name: 'therm-view-details', params: { id: item.uid } }" class="is-pointer ml-30">
          <sh-icon :name="'group-right-arrow'" class="is-15x15"></sh-icon>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
  import InfoBlock from "@/desktop/shared/components/info-block";

  export default {
    props: ["item"],
    components: {
      InfoBlock,
    },
    methods: {
      total_issues(issues) {
        return _.sum(Object.values({ ...issues, table: 0 }));
      },
    },
  };
</script>

<style lang="scss">
  .list-card {
    &:hover {
      .card-list-title {
        color: $primary !important;
      }
      .affected {
        color: $therm-affected !important;
      }
      .capacity {
        color: $therm-capacity !important;
      }
    }
  }
</style>
