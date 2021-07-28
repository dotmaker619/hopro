<template>
  <div class="vault-sidebar">
    <div class="vault-sidebar-wrapper">
      <div class="vault-sidebar-title">
        <img src="@/assets/icons/tickets/ticket-logo.svg" alt />
        <div class="vault-sidebar-title__right">
          <div class="is-semiBold-16-600-19">
            <router-link :to="{name:'vault'}" class="primary-title">Vault</router-link>
          </div>
          <div class="secondary-title is-regular-12-00-14">Manage assets with ease!</div>
        </div>
      </div>

      <div class="vault-sidebar-content">
        <router-link
          class="vault-sidebar-content__item"
          :class="{ 'is-active':$route.query.recents }"
          :to="{
            name: 'vault',
            query: {recents: true,asset:$route.query.asset }
          }"
        >
          <sh-icon
            :file="'vault_sprite'"
            v-if="$route.query.recents"
            :name="`recent-active`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <sh-icon
            :file="'vault_sprite'"
            v-else
            :name="`recent`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <span class="is-medium-14-500-00 item-name is-capitalized">Recents</span>
          <div :class="{ 'active-indicator': $route.query.recents  }"></div>
        </router-link>
        <router-link
          class="vault-sidebar-content__item"
          :class="{ 'is-active':$route.query.bookmark }"
          :to="{
            name: 'vault',
            query: {bookmark: true,asset:$route.query.asset }
          }"
        >
          <sh-icon
            :file="'vault_sprite'"
            v-if="$route.query.bookmark"
            :name="`bookmark-active`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <sh-icon
            :file="'vault_sprite'"
            v-else
            :name="`bookmark`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <span class="is-medium-14-500-00 item-name is-capitalized">Favorites</span>
          <div :class="{ 'active-indicator': $route.query.bookmark  }"></div>
        </router-link>
        <router-link
          class="vault-sidebar-content__item"
          :class="{'is-active':$route.name === 'vault' 
          && is_everything}"
          :to="{
            name: 'vault',
            query: {asset:$route.query.asset }
          }"
        >
          <sh-icon
            :file="'vault_sprite'"
            v-if="$route.name === 'vault' && is_everything"
            :name="`everything-active`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <sh-icon
            :file="'vault_sprite'"
            v-else
            :name="`everything`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <span class="is-medium-14-500-00 item-name is-capitalized">Everything</span>
          <div :class="{ 'active-indicator': $route.name === 'vault' && is_everything }"></div>
        </router-link>
        <router-link
          class="vault-sidebar-content__item"
          :class="{ 'is-active':$route.query.shared }"
          :to="{
            name: 'vault',
            query: { shared: true,asset:$route.query.asset }
          }"
        >
          <sh-icon
            :file="'vault_sprite'"
            v-if="$route.query.shared"
            :name="`share-grey-active`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <sh-icon
            :file="'vault_sprite'"
            v-else
            :name="`share-grey`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <span class="is-medium-14-500-00 item-name is-capitalized">Shared with me</span>
          <div :class="{ 'active-indicator': $route.query.shared  }"></div>
        </router-link>
        <router-link
          class="vault-sidebar-content__item"
          :class="{ 'is-active':$route.query.owner }"
          :to="{
            name: 'vault',
            query: { owner: true,asset:$route.query.asset }
          }"
        >
          <sh-icon
            :file="'vault_sprite'"
            v-if="$route.query.owner"
            :name="`assignee-active`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <sh-icon
            :file="'vault_sprite'"
            v-else
            :name="`assignee`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <span class="is-medium-14-500-00 item-name is-capitalized">Owned by me</span>
          <div :class="{ 'active-indicator': $route.query.owner  }"></div>
        </router-link>
        <router-link
          class="vault-sidebar-content__item"
          :class="{ 'is-active':$route.name == 'vault-activities' }"
          :to="{
            name: 'vault-activities',
            query:{asset:$route.query.asset}
          }"
        >
          <sh-icon
            :file="'vault_sprite'"
            v-if="$route.name == 'vault-activities'"
            :name="`activity-active`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <sh-icon
            :file="'vault_sprite'"
            v-else
            :name="`activity`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <span class="is-medium-14-500-00 item-name is-capitalized">Activity</span>
          <div :class="{ 'active-indicator': $route.name == 'vault-activities'  }"></div>
        </router-link>
        <router-link
          class="vault-sidebar-content__item"
          :class="{ 'is-active':$route.query.archive }"
          :to="{
            name: 'vault',
            query: { archive: true, asset:$route.query.asset }
          }"
        >
          <sh-icon
            :file="'vault_sprite'"
            v-if="$route.query.archive"
            :name="`archive-grey-active`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <sh-icon
            :file="'vault_sprite'"
            v-else
            :name="`archive-grey`"
            class="is-24x24 vault-sidebar-content__item__icon"
          />
          <span class="is-medium-14-500-00 item-name is-capitalized">Archived</span>
          <div :class="{ 'active-indicator': $route.query.archive  }"></div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    test(val) {
      return _.isEmpty(val);
    }
  },
  computed: {
    is_everything(){
      return (!this.$route.query.recents && 
      !this.$route.query.bookmark && !this.$route.query.shared 
      && !this.$route.query.archive && !this.$route.query.owner )?true:false;
    }
  },
  data() {
    return {
      vaultNavList: [
        {
          name: "recents",
          icon: "recent",
          to: {
            name: "vault-recents"
          },
          is_active: this.$route.name === "vault-recents"
        },
        {
          name: "favorites",
          icon: "bookmark",
          to: {
            name: "vault",
            query: { bookmark: !this.$route.query.bookmark || undefined }
          },
          is_active: this.$route.query.bookmark
        },
        {
          name: "everything",
          icon: "everything",
          to: {
            name: "vault"
          },
          is_active:
            this.$route.name === "vault" && _.isEmpty(this.$route.query)
        },
        {
          name: "shared with me",
          icon: "share-grey",
          to: {
            name: "vault",
            query: { shared: !this.$route.query.shared || undefined }
          },
          is_active: this.$route.query.shared
        },
        {
          name: "owned by me",
          icon: "assignee",
          to: {
            name: "vault",
            query: { owner: !this.$route.query.owner || undefined }
          },
          is_active: this.$route.query.owner
        },
        {
          name: "activity",
          icon: "activity",
          to: {
            name: "vault-activities"
          },
          is_active: this.$route.name === "vault-activities"
        },
        {
          name: "archived",
          icon: "archive-grey",
          to: {
            name: "vault",
            query: { archive: !this.$route.query.archive || undefined }
          },
          is_active: this.$route.query.archive
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.vault-sidebar-wrapper {
  width: 243px;
  position: fixed;
  height: 100vh;
  background-color: white;
  border-right: 1px solid rgba(23, 30, 72, 0.1);
}
.vault-sidebar {
  // width: 243px;
  height: 100vh;
  flex: 0 0 243px;
  // max-height:100vh;
  padding: 0rem 0rem;
  background-color: white;
  &-title {
    margin-top: 7rem;
    display: flex;
    padding: 0 2rem 1.2rem;
    border-bottom: 1px solid rgba(23, 30, 72, 0.1);
    img {
      margin-right: 0.7rem;
      border-radius: 50%;
    }
    &__right {
      .primary-title {
        text-transform: uppercase;
        color: #5c617e;
      }
      .secondary-title {
        color: #747891;
      }
    }
  }

  &-content {
    padding-top: 1rem;
    &__item {
      cursor: pointer;
      padding: 1.6rem 3rem;
      display: flex;
      align-items: center;
      &:hover {
        background-color: rgba(92, 126, 247, 0.1);
      }

      img {
        margin-right: 1.6rem;
      }
      &-name {
        color: #171e48;
      }
      &__icon {
        margin-right: 1.6rem;
      }
    }
  }
}

.item-name {
  color: #171e48 !important;
}

.is-active {
  background-color: rgba(92, 126, 247, 0.1);
}

.active-indicator {
  width: 3px;
  height: 30px;
  background-color: $primary;
  position: absolute;
  right: 0;
  border-radius: 30px;
}
</style>
