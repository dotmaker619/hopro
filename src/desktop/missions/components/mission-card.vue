<template>
  <div class="mission-card">
    <div class="columns is-vcentered">
      <div class="column is-narrow is-pointer" @click="active = !active">
        <div style="min-width: 15px">
          <i v-if="active" class="fas fa-chevron-up" style="color: $primary" />
          <i v-else class="fas fa-chevron-right" />
        </div>
      </div>
      <div class="column">
        <router-link :to="{ name: 'mission-details', params: { id: missionGroup.uid } }" class="has-text-dark">
          <info-block
            :info="{
              'name': missionGroup.name,
              'bottom': missionGroup.totalMissions + ' Missions',
              type: 'projectManagement',
            }"
            :hideImage="true"
          ></info-block>
        </router-link>
      </div>
      <div class="column">
        <p class="sh-text-normal-14 has-text-grey mb-5">Group</p>
        <primary-tag v-if="group.name" :type="'group'" :tags="[{ name: group.name, uid: group.uid }]" />
        <p v-else class="sh-text-normal-14 has-text-grey has-opacity-7">*Not found</p>
      </div>
      <div class="column is-3">
        <router-link :to="{ name: 'user-details', params: { id: owner.uid } }">
          <info-block
            v-if="owner.first_name"
            :info="{
              'name': `${owner.first_name} ${owner.last_name}`,
              'top': 'Created by',
              'image': owner.display_picture,
              type: 'projectManagement',
            }"
          ></info-block>
          <info-block
            v-else-if="owner && owner.email"
            :unknown="true"
            :info="{
              'name': owner.email.includes('@sensehawk') ? 'Sensehawk' : 'Unknown',
              'top': 'Created by',
              'image': owner.display_picture,
              'type': 'projectManagement',
            }"
          ></info-block>
        </router-link>
      </div>
      <div class="column">
        <p class="sh-text-normal-14 has-text-grey mb-10">Status</p>
        <div v-if="missionGroup.totalMissions" class="mission-card__status">
          <div class="mission-card__status__rejected" :style="{ width: rejectedStatusWidth + '%' }"></div>
          <div class="mission-card__status__pending" :style="{ width: pendingStatusWidth + '%' }"></div>
          <div class="mission-card__status__inprogress" :style="{ width: inprogressStatusWidth + '%' }"></div>
          <div class="mission-card__status__completed" :style="{ width: completedStatusWidth + '%' }"></div>
          <div class="mission-card__status__reflied" :style="{ width: refliedStatusWidth + '%' }"></div>
        </div>
        <p v-else>*No missions</p>
      </div>
      <div class="column">
        <p class="sh-text-normal-14 has-text-grey">Users</p>
        <user-tag :users="users" :howManyToShow="2" />
      </div>
      <div class="column is-narrow is-pointer">
        <div class="sh-list__item--icon">
          <sh-dropdown :triggerIsIcon="true">
            <div slot="content">
              <p @click="$emit('edit', missionGroup)">
                <sh-icon :name="'edit'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                Edit mission
              </p>
              <p @click="duplicate_mission_group">
                <sh-icon :name="'duplicate'" class="is-24x24 mr-10"></sh-icon>
                Duplicate mission
              </p>
              <p @click="showDeleteModal = true">
                <sh-icon :name="'delete'" :file="'helper_sprite'" class="is-24x24 mr-10"></sh-icon>
                Delete mission
              </p>
            </div>
          </sh-dropdown>
        </div>
      </div>
    </div>
    <mission-inner-card v-if="active" :missions="missionGroup.missions" :groupUid="missionGroup.groupUid" :missionGroupUid="missionGroup.uid" />
    <delete-modal
      v-if="showDeleteModal"
      :resourceId="missionGroup.uid"
      :resourceName="missionGroup.name"
      :resourceType="'mission'"
      :resourceService="missionService"
      @closed="showDeleteModal = false"
    />
  </div>
</template>

<script>
  import InfoBlock from "@/desktop/shared/components/info-block";
  import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
  import UserTag from "@/desktop/shared/components/tags/user-tag";
  import MissionInnerCard from "./mission-inner-card";
  import shDropdown from "@/desktop/shared/components/sh-dropdown";
  import { missionService } from "@/desktop/shared/services/";

  export default {
    props: ["missionGroup", "group", "owner", "users"],
    components: {
      InfoBlock,
      PrimaryTag,
      UserTag,
      MissionInnerCard,
      shDropdown,
    },
    data() {
      return {
        active: false,
        showDeleteModal: false,
        missionService: missionService,
      };
    },
    computed: {
      rejectedStatusWidth() {
        return (this.missionGroup.rejected / this.missionGroup.totalMissions) * 100;
      },
      pendingStatusWidth() {
        return (this.missionGroup.pending / this.missionGroup.totalMissions) * 100;
      },
      inprogressStatusWidth() {
        return (this.missionGroup.inprogress / this.missionGroup.totalMissions) * 100;
      },
      completedStatusWidth() {
        return (this.missionGroup.completed / this.missionGroup.totalMissions) * 100;
      },
      refliedStatusWidth() {
        return (this.missionGroup.reflied / this.missionGroup.totalMissions) * 100;
      },
    },
    methods: {
      async duplicate_mission_group() {
        let result = await missionService.post({ id: this.missionGroup.uid }).catch((err) => this.handleErrors(err));
        if (result) {
          this.show_success("Mission group duplicated.");
          this.$eventHub.$emit("refresh-mission-list");
        }
      },
    },
  };
</script>

<style lang="scss">
  .mission-card {
    &__status {
      width: 100%;
      height: 0.7rem;
      display: flex;
      padding-right: 2rem;
      &__rejected {
        background-color: #de6f91;
        border-radius: 10px;
      }
      &__pending {
        background-color: #f2a878;
        border-radius: 10px;
      }
      &__inprogress {
        background-color: #fffd82;
        border-radius: 10px;
      }
      &__completed {
        background-color: #64d0e3;
        border-radius: 10px;
      }
      &__reflied {
        background-color: #8398fd;
        border-radius: 10px;
      }
    }
  }
  .is-pointer {
    cursor: pointer;
  }
</style>
