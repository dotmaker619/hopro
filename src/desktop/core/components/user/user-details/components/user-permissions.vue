<template>
  <div
    v-if="permissionCategories && activePermission && organizationPermissions && userPermissions"
    class="user-permissions"
  >
    <div class="user-permissions__main">
      <div class="user-permissions__main__left">
        <div
          @click="set_active_permission(category)"
          class="user-permissions__main__left__each"
          v-for="(category, i) in permissionCategories"
          :key="i"
        >
          <div
            class="user-permissions__main__left__each__left"
            :class="{'user-permissions__main__left__each__left--active' : activePermission.name === category.name}"
          >
            <img :src="require(`@/assets/icons/permissions/${category.name}.svg`)" />
            {{category.label}}
          </div>
          <span
            v-if="show_permission_category_actionable_icon(category)"
            class="sh-access-tag"
            :class="[
              {'sh-access-tag--read' : userPermissions.hasOwnProperty(category.name)},
              {'sh-access-tag--disabled' : $store.getters.is_org_user}
            ]"
            @click="give_app_access(category.name)"
          >
            <i class="fa fa-circle" aria-hidden="true"></i>
          </span>
          <span
            v-else
            class="sh-access-tag"
            :class="[
             show_permission_category_unactionable_icon(category)
                ? 'sh-access-tag--read-inverse' 
                : userPermissions[category.name] && userPermissions[category.name].length
                  ? 'sh-access-tag--read' 
                  : 'sh-access-tag--blank', 
                {'sh-access-tag--disabled' : $store.getters.is_org_user}]"
          >
            <i class="fa fa-check" aria-hidden="true" />
          </span>
        </div>
      </div>
      <div
        class="user-permissions__main__right"
        :class="{
          'user-permissions__main__right--disabled'
          : (!organizationPermissions.permissions.hasOwnProperty(activePermission.name))
        }"
      >
        <span class="user-permissions__main__right__title">{{activePermission.label}}</span>
        <div
          class="user-permissions__main__right__each"
          :class="{
            'user-permissions__main__right__each--disabled' 
            : disable_permission_subcategory(permission)
          }"
          v-for="(permission, i) in activePermission.permissions"
          :key="i"
          @click="modify_permissions(permission)"
        >
          <div
            class="user-permissions__main__right__each__checkbox"
            :class="[{ 
              'user-permissions__main__right__each__checkbox--selected'
              : organizationPermissions.permissions.hasOwnProperty(activePermission.name) 
                && userPermissions[activePermission.name] 
                && userPermissions[activePermission.name].includes(permission.name)
              }, {
              'user-permissions__main__right__each__checkbox--disabled' : $store.getters.is_org_user
            }]"
          >
            <i class="fa fa-check" aria-hidden="true"></i>
          </div>
          <div class="user-permissions__main__right__each__right">
            <div class="user-permissions__main__right__each__right__title">{{permission.label}}</div>
            <div class="user-permissions__main__right__each__right__text">{{permission.description}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="user-permissions__button">
      <div v-if="awaitingResponse" class="sh-button" style="min-width: 18.3rem">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div
        v-else
        @click="save_permissions"
        class="sh-button"
        :class="{'sh-button--disabled' : $store.getters.is_org_user}"
      >Save Permissions</div>
    </div>
  </div>
</template>

<script>
import {
  permissionService,
  guestUserService,
  userService
} from "@/desktop/shared/services/";

export default {
  data() {
    return {
      user: null,
      permissionCategories: {},
      activePermission: null,
      organizationPermissions: null,
      userPermissions: null,
      awaitingResponse: false
    };
  },

  async created() {
    await userService
      .get({ id: this.$route.params.id })
      .then(res => (this.user = res))
      .catch(err => this.handleErrors(err));

    await permissionService
      .get_permissions({})
      .then(res => {
        this.permissionCategories = res;
        this.activePermission = this.permissionCategories[0];
      })
      .catch(err => this.handleErrors(err));

    await permissionService
      .get_organization_permissions({
        id: this.$store.state.current_organization.uid
      })
      .then(res => {
        this.organizationPermissions = res;
      })
      .catch(err => this.handleErrors(err));

    if (this.$route.params.type === "guest") {
      let result = await guestUserService
        .get_guest_user_details({
          id: this.$route.params.id
        })
        .catch(err => this.handleErrors(err));
      if (result) {
        this.userPermissions = result.permissions;
      }
    } else
      await permissionService
        .get_user_permissions({ id: this.$route.params.id })
        .then(res => {
          this.userPermissions = res.permissions;
        })
        .catch(err => this.handleErrors(err));
  },

  methods: {
    show_permission_category_actionable_icon(category) {
      return (
        (this.organizationPermissions.permissions.hasOwnProperty(
          category.name
        ) ||
          this.user.role) &&
        (!this.userPermissions.hasOwnProperty(category.name) ||
          !this.userPermissions[category.name].length)
      );
    },

    show_permission_category_unactionable_icon(category) {
      return (
        this.organizationPermissions.permissions[category.name] &&
        this.userPermissions[category.name] &&
        this.organizationPermissions.permissions[category.name].length <=
          this.userPermissions[category.name].length
      );
    },

    disable_permission_subcategory(permission) {
      if (this.user.role) return false;
      return !(
        this.organizationPermissions.permissions[this.activePermission.name] &&
        this.organizationPermissions.permissions[
          this.activePermission.name
        ].includes(permission.name)
      );
    },

    set_active_permission(category) {
      this.activePermission = category;
    },
    give_app_access(category) {
      if (!this.$store.getters.is_org_user) {
        if (this.userPermissions.hasOwnProperty(category))
          delete this.userPermissions[category];
        else this.userPermissions[category] = [];
        this.userPermissions = { ...this.userPermissions };
      }
    },
    modify_permissions(permission) {
      if (!this.$store.getters.is_org_user) {
        if (!this.disable_permission_subcategory(permission)) {
          let index;
          if (this.userPermissions.hasOwnProperty(this.activePermission.name))
            index = this.userPermissions[this.activePermission.name].indexOf(
              permission.name
            );
          else {
            this.userPermissions[this.activePermission.name] = [];
            index = -1;
          }
          if (index > -1)
            this.userPermissions[this.activePermission.name].splice(index, 1);
          else
            this.userPermissions[this.activePermission.name].push(
              permission.name
            );
          this.userPermissions = { ...this.userPermissions };
        }
      }
    },
    async save_permissions() {
      if (
        !this.$store.getters.is_org_user ||
        this.$store.getters.is_internal_user
      ) {
        this.awaitingResponse = true;
        let result;
        if (this.$route.params.type === "guest")
          result = await guestUserService
            .put_guest_user_details({
              id: this.$route.params.id,
              body: { permissions: this.userPermissions }
            })
            .catch(err => this.handleErrors(err));
        else
          result = await permissionService
            .update_user_permissions({
              id: this.$route.params.id,
              body: { permissions: this.userPermissions }
            })
            .catch(err => this.handleErrors(err));

        if (result) {
          this.userPermissions = result.permissions;
          this.userPermissions = { ...this.userPermissions };
        }
        this.awaitingResponse = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.user-permissions {
  &__main {
    display: flex;
    width: 100%;
    &__left {
      width: 42%;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
      margin-right: 1rem;
      padding: 0.5rem 3rem;
      &__each {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2rem 0 3rem 0;
        cursor: pointer;

        &__left {
          display: flex;
          align-items: center;
          color: #171e48;
          font-size: 1.6rem;
          font-family: Barlow-Regular;

          text-transform: capitalize;
          img {
            margin: 0 1.5rem 0 0.5rem;
          }
          &--active,
          &:hover {
            color: $primary;
            font-family: Barlow-SemiBold;
            // font-weight: 600;
          }
        }
        &:not(:last-child) {
          border-bottom: 2px solid #f3f3f5;
        }
      }
    }
    &__right {
      width: 58%;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 4px 0 rgba(23, 30, 72, 0.07);
      padding: 2rem 3rem;
      &--disabled {
        opacity: 0.5;
        user-select: none;
        cursor: not-allowed;
      }
      &__title {
        font-size: 2.1rem;
        font-family: Barlow-SemiBold;
        // font-weight: 600;
        color: #171e48;
      }
      &__each {
        margin: 3rem 0;
        display: flex;
        align-items: flex-start;
        color: #171e48;
        cursor: pointer;
        &--disabled {
          opacity: 0.5;
          user-select: none;
          cursor: not-allowed;
        }
        &__checkbox {
          width: 2.4rem;
          height: 2.4rem;
          margin: 0.5rem 2rem 0 0;
          padding: 0 0.5rem;
          border-radius: 2px;
          border: solid 1.5px rgba(23, 30, 72, 0.4);
          color: transparent;
          &--selected {
            color: $primary;
            border-color: $primary;
            border-radius: 4px;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            font-size: 1.2rem;
          }
          &--disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
        &__right {
          &__title {
            font-size: 1.6rem;
            font-family: Barlow-SemiBold;
            // font-weight: 600;
          }
          &__text {
            opacity: 0.7;
            font-size: 1.4rem;
            font-family: Barlow-Regular;
          }
        }
      }
    }
  }
  &__button {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }
}
</style>