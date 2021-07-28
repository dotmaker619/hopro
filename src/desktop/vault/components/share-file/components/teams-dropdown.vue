<template>
  <div>
    <div class="is-sh-dropdown width" v-click-outside="() => (active ? (active = false) : null)">
      <div class="sh-dropdown-selection is-pointer">
        <sh-icon
          v-if="custom_icon && custom_icon.name && !watcher_uids.length"
          @click.native="active = !active"
          class="is-pointer is-30x30"
          :file="custom_icon.file"
          :name="custom_icon.name"
        ></sh-icon>
        <sh-icon v-else :name="'add-users-teams'" class="is-24x24 ml-10" @click.native="active = !active"></sh-icon>
      </div>

      <ul class="is-options-list has-slimscroll-xs" v-if="active" style="border-radius:10px"
        :class="{'is-viewer-right':['terra-viewer','therm-viewer'].includes($route.name) }"
      >
        <li class="item mobile-header">
          <p class="is-medium-16-500-19">Select Teams</p>
        </li>
        <div class="field px-10 py-5 has-background-white is-marginless">
          <p class="control has-icons-left has-icons-right">
            <input class="input pt-10" type="email" placeholder="Search" v-model="searchQuery" />
            <span class="icon is-small is-left">
              <sh-icon :name="'search'" class="is-16x16"></sh-icon>
            </span>
          </p>
        </div>
        <div v-if="filtered_teams.length == 0" class="is-flex mt-30 is-center">No search found</div>

        <li v-else class="item is-vcenter" v-for="team in filtered_teams" :key="team.uid" @click="update_share_list(team)">
          <div class="item--icon is-relative">
            <div
              class="tiny-user-avatar"
              :style="
                `background-color: ${
                  team && team.properties && team.properties.color
                    ? team.properties.color
                    : hashed_color(team ? team.name : team.uid, 'userManagement')
                }`
              "
            >
              {{ team ? team.name.charAt(0).toUpperCase() : team.uid.charAt(0).toUpperCase() }}
            </div>
            <sh-icon class="is-16x16 watcher_selected" :name="'tick-blue-bg'" v-if="watcher_uids.includes(team.uid)"></sh-icon>
          </div>
          <span v-tooltip="{ content: team.name && team.name.length > 12 ? team.name : null , html: false}" class="sh-dropdown-content__item--text item--text username-truncate">{{
            team.name | truncate(12)
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import HashColor from "@/desktop/shared/mixins/hash-color.mixin.vue";
  export default {
    props: ["ticket_watchers", "custom_icon"],
    mixins: [HashColor],
    data() {
      return {
        active: false,
        searchQuery: "",
        is_loading: false,
        watchers: [],
        team_interaction: false,
      };
    },
    computed: {
      watcher_uids() {
        return _.map(this.watchers, (w) => w.uid);
      },
      filtered_teams() {
        if (this.searchQuery.length) {
          return Object.values(this.$store.getters.state_teams)
            .filter((team) => _.includes(team.name.toLowerCase(), this.searchQuery.toLowerCase()))
            .splice(0, 5);
        } else {
          let allTeams = this.$store.state.teams.filter((s) => !this.watcher_uids.includes(s.uid));
          return [...(this.watchers || []), ...(allTeams || [])].splice(0, 5);
        }
      },
    },
    async created() {
      this.watchers = [...this.ticket_watchers];
    
    },
    watch: {
      ticket_watchers() {
        this.watchers = [...this.ticket_watchers];
      },
    },
    methods: {
      update_share_list(team) {
        this.team_interaction = true;
        let new_team = { name: team.name, uid: team.uid };

        if (_.includes(this.watcher_uids, new_team.uid)) {
          this.watchers = _.filter(this.watchers, (watcher) => watcher.uid != new_team.uid);
        } else this.watchers.push(new_team);

        this.$emit("update-watchers", this.watchers);
      },
    },
  };
</script>
