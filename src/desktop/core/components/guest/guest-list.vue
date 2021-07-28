<template>
  <div class="list-card" v-if="guests && guests.length">
    <list-header></list-header>
    <div class="sh-list" v-for="item in guests" :key="item.uid">
      <div class="sh-list__item">
        <div class="columns is-mobile">
          <div class="column is-8">
            <main-details-media
              :info="{
                  name: item.name,
                  name_class: 'is-medium-16-500-19 has-primary-text',
                  type: 'userManagement'
                }"
            ></main-details-media>
          </div>
          <div class="column is-2">
            <p class="is-medium-16-500-19 mt-5">{{item.user_counts}}</p>
          </div>
          <div class="column is-2 is-flex is-center">
              <b-switch
                v-model="item.active"
                @input="toggleOrganizationStatus(item)"
                type="is-success"
              >
              {{item.active ? 'Active' : 'Inactive'}}
              </b-switch>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { organizationService } from "@/desktop/shared/services/";
import MainDetailsMedia from "@/desktop/shared/components/main-details-media";
import ListHeader from "@/desktop/core/components/guest/components/guest-list-header.vue";

export default {
  components: {
    MainDetailsMedia,
    ListHeader
  },
  data() {
    return {
      guests: [],
      loading: false,
    };
  },
  created() {
    this.getData();
  },

  methods: {
    async getData() {
      this.loading = true;
      let result = await organizationService.get_guest_organizations().catch(err=>{
        this.loading = false;
      });
      this.guests = result.data.results;
      this.loading = false;
    },

    async toggleOrganizationStatus(guest) {
      this.loading = true;
      let {data} = await organizationService.update_guest_organization_details(
        {
          uid: guest.uid,
          body: { active: guest.active },
        }
      ).catch(err=>{
        this.loading = false;
      });
      this.$toast.show(
        "Guest organization status changed succesfully!",
        "",
        this.$store.state.izitoast_options.appSuccess
      );
      this.loading = false;
    },
  },
};
</script>
