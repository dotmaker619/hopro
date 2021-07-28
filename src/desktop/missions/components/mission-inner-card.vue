<template>
  <div
    class="mission-inner-card"
    :class="[ $route.name === 'mission-list'? 'mt-30' : 'mission-inner-card__card-shadow']"
  >
    <div class="mission-inner-card__row" style="border-bottom: 1px solid #d0d2da">
      <div style="width: 25%">Name</div>
      <div style="width: 15%">Mission Type</div>
      <div style="width: 20%">Modified On</div>
      <div style="width: 15%">Status</div>
      <div style="width: 15%">Project</div>
      <div style="width: 10%"></div>
    </div>
    <div v-for="(mission, i) in missions" :key="i" class="mission-inner-card__row">
      <div style="width: 25%; font-weight: 600; text-transform: uppercase">{{mission.name}}</div>
      <div style="width: 15%; text-transform: capitalize">{{mission.missionType.name}}</div>
      <div style="width: 20%">{{mission.lastModified | prettyDate}}</div>
      <div style="width: 15%; text-transform: capitalize; display: flex; align-items: center">
        <img v-if="mission.status === 'pending'" src="@/assets/icons/pending.svg" class="mr-10" />
        {{mission.status}}
      </div>
      <div style="width: 15%;text-transform: capitalize">
        <router-link
          v-if="mission.projectUID && groupUid"
          :to="{ 
                name:'project-details', 
                params: { 
                  group_id: groupUid,
                  id: mission.projectUID
                  }}"
          tag="span"
        >
          <div
            style="cursor: pointer; width: 9rem; height: 4rem; border: 1.5px solid $primary; border-radius: 6px; color: $primary; font-size: 1.6rem; display: flex; align-items: center; justify-content: space-around"
          >View</div>
        </router-link>
        <span v-else @click="create_project(mission)">
          <div
            style="cursor: pointer; width: 9rem; height: 4rem; border: 1.5px solid $primary; border-radius: 6px; color: $primary; font-size: 1.6rem; display: flex; align-items: center; justify-content: space-around"
          >Create</div>
        </span>
      </div>
      <div style="width: 10%; display: flex; justify-content: space-evenly">
        <img
          @click="delete_mission(mission)"
          src="@/assets/icons/delete.svg"
          style="cursor: pointer"
        />
        <img
          @click="duplicate_mission(mission)"
          src="@/assets/icons/duplicate.svg"
          style="cursor: pointer"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { missionService } from "@/desktop/shared/services/";
export default {
  props: ["missions", "groupUid", "missionGroupUid"],
  methods: {
    async create_project(mission) {
      let result = await missionService
        .create_project({
          id: mission.uid,
          mission_group_id: this.missionGroupUid,
          body: {
            name: mission.name
          }
        })
        .catch(err => this.handleErrors(err));

      if (result) {
        let projectUid = result.data.uid;

        missionService
          .patch({
            id: this.missionGroupUid,
            attribute: `mission/${mission.uid}`,
            body: {
              uid: mission.uid,
              projectUid: projectUid,
              organization: this.$store.state.current_organization.uid
            }
          })
          .then(res => {
            this.$toast.show(
              "Successfully created project and linked with mission",
              "",
              this.$store.state.izitoast_options.appSuccess
            );
            this.$router.push({
              name: "project-details",
              params: {
                group_id: this.groupUid,
                id: projectUid
              }
            });
          })
          .catch(err => this.handleErrors(err));
      }
    },
    async delete_mission(mission) {
      let result = await missionService
        .patch({
          id: this.missionGroupUid,
          attribute: `mission/${mission.uid}`,
          body: {
            active: false
          }
        })
        .catch(err => this.handleErrors(err));
      if (result) {
        this.$buefy.toast.open({
          type: "is-danger",
          message: "Deleted successfully!"
        });
        this.$eventHub.$emit("refresh-mission-list");
      }
    },
    async duplicate_mission(mission) {
      let result = await missionService
        .post({
          id: this.missionGroupUid,
          attribute: `mission/${mission.uid}`
        })
        .catch(err => this.handleErrors(err));
      if (result) {
        this.$buefy.toast.open({
          type: "is-success",
          message: "Duplicated successfully!"
        });
        this.$eventHub.$emit("refresh-mission-list");
      }
    }
  }
};
</script>

<style lang="scss">
.mission-inner-card {
  border-radius: 10px;
  background-color: #ffffff;
  padding: 0 3rem;

  &__card-shadow {
    box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
  }

  &__row {
    color: #171e48;
    font-size: 1.6rem;
    font-weight: 500;
    width: 100%;
    padding: 2rem 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>