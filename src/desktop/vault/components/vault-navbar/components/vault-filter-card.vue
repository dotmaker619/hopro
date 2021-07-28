<template>
  <div>
    <div class="mobile-background" @click="$emit('close_filter')"></div>

    <div class="dropdown">
      <div class="dropdown-header">
        <span>
          <span class="is-medium-14-500-17 has-primary-text mr-10">Filters</span>
          <span
            class="is-medium-14-500-17 is-pointer"
            @click="$store.commit('vault/SET_VAULT_FILTERS','reset')"
            :class="{ 'selected-filter' : selected_filter }"
          >Clear All</span>
        </span>
        <span class="is-pointer" @click.stop.prevent="$emit('close_filter')">
          <sh-icon :name="'ticket-close-filter'" class="is-10x10" />
        </span>
      </div>
      <div class="filter-dropdown-content">
        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Owner</span>
          <span>
            <watcher-dropdown class="mr-2"
              :user_count="3"
              :ticket_watchers="vault_filters.owners"
              @update-watchers="vault_filters.owners = $event"
              :custom_icon="'add-users-teams'"
              :custom_icon_size="24"
            ></watcher-dropdown>
          </span>
        </div>

        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Users</span>
          <span>
            <watcher-dropdown
              :user_count="3"
              :ticket_watchers="vault_filters.users"
              @update-watchers="vault_filters.users = $event"
              :custom_icon="'add-users'"
              :custom_icon_size="30"
            ></watcher-dropdown>
            <!-- <user-tag
              class="users is-pointer"
              :custom_class="'user-style is-30x30'"
              :custom_size="30"
              :tagsCountToShow="2"
              v-if="vault_filters.users.length"
              @handle_click="add_users({readUsers:vault_filters.users||[]}, 'folder')"
              :no_access="true"
              :users="vault_filters.users"
            ></user-tag>
            <sh-icon
              v-else
              class="is-pointer is-30x30"
              @click.native="add_users({readUsers:vault_filters.users||[]}, 'folder')"
              :file="'vault_sprite'"
              :name="'add-users'"
            ></sh-icon> -->
          </span>
        </div>

        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Teams</span>
          <span class="is-flex align-center" @click.stop.prevent>
              <!-- @clicked_tag="add_teams({}, 'folder')" -->
            <primary-tag
              :no_access="true"
              v-if="vault_filters.teams.length"
              :toShowCount="1"
              :type="'team'"
              :tags="vault_filters.teams"
            ></primary-tag>
            <teams-dropdown 
            :custom_icon="{file:'vault_sprite',name:'add-teams'}"
            :ticket_watchers="vault_filters.teams"
            @update-watchers="vault_filters.teams=[...$event]"></teams-dropdown>
            <!-- <sh-icon
              v-else
              class="is-pointer is-30x30"
              @click.native="add_teams({readLabels:vault_filters.teams||[]}, 'folder')"
              :file="'vault_sprite'"
              :name="'add-teams'"
            ></sh-icon> -->
          </span>
        </div>

        <div class="filter-dropdown-content__item has-primary-text is-medium-14-500-17">
          <span class="has-opacity-5">Tags</span>
          <span class="is-flex align-center">
            <div v-if="isMobile">
              <mobile-tags-dropdown
                @input="vault_filters.tags = $event"
                :initial_value.sync="vault_filters.tags"
                :search_layout="true"
                :component="'tags'"
              />
            </div>
            <div v-else>
              <all-filter-dropdown
                :add_icon_on_hover="false"
                :search_layout="false"
                :component="'tags'"
                :allFilters="vault_filters.tags"
                @updateValue="vault_filters.tags = $event"
              />
            </div>
          </span>
        </div>

        <div class="filter-dropdown-footer">
          <label class="filter-dropdown-footer__item">
            <span class="is-flex">
              <sh-icon :name="'ticket-star-rating'" class="is-16x16 mr-10" />
              <span class="is-medium-14-500-17 has-primary-text">Bookmarked</span>
            </span>
            <span>
              <input
                type="checkbox"
                class="sh-custom-checkbox"
                autocomplete="false"
                v-model="vault_filters.bookmark"
              />
            </span>
          </label>
          <label class="filter-dropdown-footer__item">
            <span class="is-flex">
              <sh-icon :name="'ticket-archieved'" class="is-16x16 mr-10" />
              <span class="is-medium-14-500-17 has-primary-text">Archived</span>
            </span>
            <span>
              <input
                type="checkbox"
                class="sh-custom-checkbox"
                autocomplete="false"
                v-model="vault_filters.archive"
              />
            </span>
          </label>
          <label class="filter-dropdown-footer__item">
            <span class="is-flex">
              <sh-icon :name="'share-grey'" :file="'vault_sprite'" class="is-16x16 mr-10" />
              <span class="is-medium-14-500-17 has-primary-text">Sharing</span>
            </span>
            <span>
              <input
                type="checkbox"
                class="sh-custom-checkbox"
                autocomplete="false"
                v-model="vault_filters.share"
              />
            </span>
          </label>
          <div
            @click="vault_filters={...vault_filters};$emit('close_filter');"
            class="filter-dropdown-button is-semiBold-14-600-17"
          >Apply Filters</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import AllFilterDropdown from "@/desktop/tickets/shared/components/filter-card/components/all-filter-dropdown";
import UserTag from "@/desktop/shared/components/tags/user-tag-new";
import PrimaryTag from "@/desktop/shared/components/tags/primary-tag";
import WatcherDropdown from "@/desktop/tickets/shared/components/watchers-dropdown";
import TeamsDropdown from "@/desktop/vault/components/share-file/components/teams-dropdown";

export default {
  components: {
    AllFilterDropdown,
    UserTag,
    PrimaryTag,
    TeamsDropdown,
    // UserDropdown,
    WatcherDropdown
  },
  props: ["filtersData"],
  data() {
    return {
      is_create_folder: true,
      selected_filter: true,
      active: false,
      hide_access: true
    };
  },
  created() {},
  computed: {
    ...mapState("vault", ["filter_query"]),
    vault_filters: {
      get() {
        return this.$store.state.vault.vault_filters;
      },
      set(value) {
        this.$store.commit("vault/SET_VAULT_FILTERS", value);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown {
  box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.16);
  border: solid 1px rgba(23, 30, 72, 0.1);
  background-color: #ffffff;
  position: absolute;
  width: 260px;
  z-index: 20;
  border-radius: 1rem;
  top: 2.5rem;
  left: 12px;
  display: block;
  @include for-size(portrait-tablets) {
    position: fixed;
    width: 100vw;
    top: auto;
    left: 0;
    bottom: 0;
    z-index: 100;
  }

  &-header {
    padding: 2rem 2rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(23, 30, 72, 0.15);
  }

  &-input {
    margin: 0 2rem;
  }
  &-content {
    padding: 2rem;
  }
}
.filter-dropdown-content {
  border-bottom: 1px solid rgba(23, 30, 72, 0.15);
  &__item {
    min-height: 4.2rem;
    padding: 1.2rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.filter-dropdown-footer {
  border-top: 1px solid #eee;
  margin: 1.2rem 0 1rem 0;
  &__item {
    display: flex;
    justify-content: space-between;
    padding: 0.7rem 2rem;
    //   padding: 0.5rem 2rem 2rem;
    cursor: pointer;
    &:first-child {
      margin-top: 1rem;
      // padding: 2rem 2rem 0.5rem /2rem;
    }
  }
}
.filter-dropdown-button {
  height: 4rem;
  margin: 1rem 2rem 2rem;
  border-radius: 6px;
  box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  border: solid 1px $primary;
  background-color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  cursor: pointer;
  &:hover {
    background-color: $primary;
    color: $white;
    box-shadow: 0 2px 5px 0 rgba(92, 126, 247, 0.2);
  }
}

.is-options-list {
  z-index: 10;

  width: 20rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.16);
  border: solid 1px rgba(23, 30, 72, 0.1);
  background-color: $white;
  .input {
    height: 4rem;
  }

  .control.has-icons-left .icon.is-left {
    height: 4rem;
    width: 1.5rem;
  }
  .item--text {
    width: 15ch;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
.add-followers {
  visibility: hidden;
}
.selected-filter {
  color: $primary;
}
</style>
