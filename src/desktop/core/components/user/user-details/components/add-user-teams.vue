<template>
  <div class="add-team">
    <div class="add-team__header">
      <span class="add-team__header__title">Add Teams</span>
      <i @click="hide_modal" class="fa fa-times add-team__header__close" aria-hidden="true" />
    </div>
    <div v-if="!isLoading" class="add-team__content has-slimscroll">
      <div class="add-team__content__select">
        <img :src="require('@/assets/icons/form-search-icon.svg')" class="mr-10" />
        <input
          v-model="teamInput"
          class="add-team__content__select__text"
          type="text"
          placeholder="Search Team Name"
        />
      </div>
      <div class="add-team__content__heading">
        <div class="ml-50 mr-auto">Teams</div>
      </div>
      <div class="add-team__content__top" style="padding-top: 0.7rem">
        <div v-for="(team, i) in resourceTeams" :key="i" class="add-team__content__top__row">
          <i
            @click="remove_from_resource_team(i)"
            class="fa fa-times add-team__content__top__row__cancel"
          />
          <div class="add-team__content__top__row__main">
            <div class="image is-24x24 mr-10" v-if="team.properties && team.properties.icon">
              <img :src="team.properties.icon" class="image is-24x24 is-rounded" />
            </div>
            <div
              v-else
              class="add-team__content__top__row__main__icon"
              :style="`background-color: ${team.properties && team.properties.color ? team.properties.color : hashed_color(team.name, 'userManagement')}`"
            >{{team.name && team.name.charAt(0).toUpperCase()}}</div>
            <span class="add-team__content__top__row__main__name">{{team.name}}</span>
          </div>
        </div>
      </div>
      <div class="add-team__content__bottom">
        <div v-for="(team, i) in filteredAllTeams" :key="i" class="add-team__content__bottom__row">
          <div
            @click="select_team(team.uid)"
            class="add-team__content__bottom__row__checkbox"
            :class="{'add-team__content__bottom__row__checkbox--selected': selectedTeams[team.uid] }"
          >
            <i v-if="selectedTeams[team.uid]" class="fa fa-check" aria-hidden="true" />
          </div>
          <div class="add-team__content__bottom__row__main">
            <div class="image is-24x24 mr-10" v-if="team.properties && team.properties.icon">
              <img :src="team.properties.icon" class="image is-24x24 is-rounded" />
            </div>
            <div
              v-else
              class="add-team__content__bottom__row__main__icon"
              :style="`background-color: ${team.properties && team.properties.color ? team.properties.color : hashed_color(team.name, 'userManagement')}`"
            >{{team.name.charAt(0).toUpperCase()}}</div>
            <span class="add-team__content__bottom__row__main__name">{{team.name}}</span>
          </div>
        </div>
      </div>
      <div class="add-team__content__footer">
        <div @click="add_teams" class="add-team__content__footer__button">Add Teams</div>
      </div>
    </div>
    <single-list-skeleton v-else />
  </div>
</template>

<script>
import { userService, teamService } from "@/desktop/shared/services/";
import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";

export default {
  name: "add-user-teams",
  props: ["teams"],
  mixins: [HashColor],

  data() {
    return {
      teamInput: "",
      allTeams: null,
      resourceTeams: {},
      selectedTeams: {},
      isLoading: false
    };
  },

  computed: {
    filteredAllTeams() {
      if (this.allTeams) {
        let filteredTeams = this.allTeams.filter(
          f => !Object.keys(this.resourceTeams).includes(f.uid)
        );
        return filteredTeams.filter(f =>
          f.name.toLowerCase().startsWith(this.teamInput.toLowerCase())
        );
      }
      return this.allTeams;
    }
  },

  created() {
    this.get_teams();
    this.populate_resource_teams();
  },

  methods: {
    hide_modal() {
      this.$emit("close");
    },
    async get_teams() {
      this.isLoading = true;
      let result = await teamService
        .getAll({ query: `exclude_user=${this.$route.params.id}` })
        .catch(err => this.handleErrors(err));
      this.allTeams = result.results;
      this.isLoading = false;
    },
    remove_from_resource_team(uid) {
      delete this.resourceTeams[uid];
      this.resourceTeams = { ...this.resourceTeams };
    },
    select_team(teamUid) {
      if (this.selectedTeams[teamUid]) delete this.selectedTeams[teamUid];
      else this.selectedTeams[teamUid] = { uid: teamUid };
      this.selectedTeams = { ...this.selectedTeams };
    },
    add_teams() {
      userService
        .patch({
          id: this.$route.params.id,
          body: {
            labels: Object.values(this.selectedTeams).concat(
              Object.values(this.resourceTeams)
            )
          }
        })
        .then(res => {
          this.show_success(res.message);
          this.$eventHub.$emit("refresh-details");
          this.$eventHub.$emit("refresh-user-list");
          this.$emit("close");
        })
        .catch(err => this.handleErrors(err));
    },
    populate_resource_teams() {
      this.isLoading = true;
      for (let i = 0; i < this.teams.length; i++)
        this.resourceTeams[this.teams[i].uid] = this.teams[i];
      this.isLoading = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.add-team {
  height: 100%;
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.8rem 3rem;
    background-color: $white;
    color: #171e48;
    border-bottom: 2px solid rgb(234, 237, 243);
    &__title {
      font-size: 2rem;
      font-weight: 500;
    }
    &__close {
      font-size: 2rem;
      cursor: pointer;
    }
  }
  &__content {
    background-color: #f4f7fc;
    padding: 0 3rem 3rem 3rem;
    height: 85%;
    overflow: auto;
    position: relative;

    &__select {
      width: 100%;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(23, 30, 72, 0.1);
      padding-top: 1rem;
      position: sticky;
      top: 0;
      background-color: #f4f7fc;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      &__text {
        width: 100%;
        border: 0;
        color: #171e48;
        font-size: 1.6rem;
        line-height: 4rem;
        background-color: #f4f7fc;
        &:focus {
          outline: none;
        }
        &::placeholder {
          color: rgba(23, 30, 72, 0.4);
        }
      }
    }

    &__heading {
      display: grid;
      grid-template-columns: auto 10% 10%;
      margin-top: 2rem;
      color: #8d95aa;
      font-size: 1.4rem;
      justify-items: center;
    }

    &__top,
    &__bottom {
      padding: 2rem 0;
      border-bottom: 1px solid rgba(23, 30, 72, 0.1);
      &__row {
        display: grid;
        grid-template-columns: 10% auto 10% 10%;
        justify-items: center;
        align-items: center;
        padding: 1rem 0;
        &__main {
          display: flex;
          justify-self: flex-start;
          align-items: center;
          &__icon {
            width: 2.4rem;
            height: 2.4rem;
            line-height: 2.4rem;
            border-radius: 50%;
            // background-color: #ffa16c;
            color: $white;
            font-size: 1.2rem;
            font-weight: 600;
            text-align: center;
            margin-right: 1rem;
            user-select: none;
          }
          &__name {
            color: #171e48;
            font-size: 1.6rem;
            font-weight: 500;
          }
        }
      }
    }

    &__top__row__cancel {
      color: #e84537;
      font-size: 2rem;
      cursor: pointer;
    }

    &__bottom__row__checkbox {
      width: 2rem;
      height: 2rem;
      border-radius: 2px;
      border: solid 1.5px rgba(23, 30, 72, 0.4);
      cursor: pointer;
      &--selected {
        color: $primary;
        border-color: $primary;
        border-radius: 4px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        font-size: 1rem;
      }
    }

    &__footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 2rem;
      &__button {
        color: $white;
        background-color: $primary;
        width: 12.8rem;
        height: 5rem;
        text-align: center;
        line-height: 5rem;
        font-size: 1.4rem;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
      }
    }
  }
}
</style>