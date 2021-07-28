<template>
  <div
    v-if="permissionCategories && activePermission && organizationPermissions"
    class="organization-permissions"
  >
    <div class="organization-permissions__main">
      <div class="organization-permissions__main__left">
        <div
          @click="set_active_permission(category)"
          class="organization-permissions__main__left__each"
          v-for="(category, i) in permissionCategories"
          :key="i"
        >
          <div
            class="organization-permissions__main__left__each__left"
            :class="{
              'organization-permissions__main__left__each__left--active' 
              : activePermission.name === category.name
            }"
          >
            <img :src="require(`@/assets/icons/permissions/${category.name}.svg`)" />
            {{category.label}}
          </div>
          <span
            v-if="organizationPermissions.permissions.hasOwnProperty(category.name) 
            && organizationPermissions.permissions[category.name].length"
            class="sh-access-tag"
            :class="[
              category.permissions.length === organizationPermissions.permissions[category.name].length 
              ? 'sh-access-tag--read-inverse' 
              : 'sh-access-tag--read'
            ]"
          >
            <i class="fa fa-check" aria-hidden="true" />
          </span>
          <span
            v-else
            class="sh-access-tag"
            :class="{'sh-access-tag--read' : organizationPermissions.permissions.hasOwnProperty(category.name)}"
            @click="give_app_access(category.name)"
          >
            <i class="fa fa-circle" aria-hidden="true"></i>
          </span>
        </div>
      </div>
      <div
        class="organization-permissions__main__right"
        :class="{
          'organization-permissions__main__right--disabled'
          : !organizationPermissions.permissions.hasOwnProperty(activePermission.name)
        }"
      >
        <span class="organization-permissions__main__right__title">{{activePermission.label}}</span>
        <div
          class="organization-permissions__main__right__each"
          :class="{
            'organization-permissions__main__right__each--disabled' 
            : !organizationPermissions.permissions.hasOwnProperty(activePermission.name)
          }"
          v-for="(permission, i) in activePermission.permissions"
          :key="i"
          @click="modify_permissions(permission)"
        >
          <div
            class="organization-permissions__main__right__each__checkbox"
            :class="[{
              'organization-permissions__main__right__each__checkbox--selected'
              : organizationPermissions.permissions[activePermission.name] 
              && organizationPermissions.permissions[activePermission.name].includes(permission.name)
            }]"
          >
            <i class="fa fa-check" aria-hidden="true"></i>
          </div>
          <div class="organization-permissions__main__right__each__right">
            <div
              class="organization-permissions__main__right__each__right__title"
            >{{permission.label}}</div>
            <div
              class="organization-permissions__main__right__each__right__text"
            >{{permission.description}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="organization-permissions__button">
      <div v-if="awaitingResponse" class="sh-button" style="min-width: 18.3rem">
        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
      </div>
      <div v-else @click="save_permissions" class="sh-button">Save Permissions</div>
    </div>
  </div>
</template>

<script>
import { permissionService } from "@/desktop/shared/services/";

export default {
  data() {
    return {
      permissionCategories: {},
      activePermission: null,
      organizationPermissions: null,
      awaitingResponse: false
    };
  },
  computed: {
    // CREATE COMPUTED PROPERTIES FOR ALL YOUR BIG CLASS CONDITIONS
  },
  created() {
    permissionService
      .get_permissions({})
      .then(res => {
        this.permissionCategories = res;
        this.activePermission = this.permissionCategories[0];
      })
      .catch(err => this.handleErrors(err));

    permissionService
      .get_organization_permissions({ id: this.$route.params.id })
      .then(res => {
        this.organizationPermissions = res;
      });
  },

  methods: {
    set_active_permission(category) {
      this.activePermission = category;
    },
    give_app_access(category) {
      if (this.organizationPermissions.permissions.hasOwnProperty(category))
        delete this.organizationPermissions.permissions[category];
      else this.organizationPermissions.permissions[category] = [];
      this.organizationPermissions = { ...this.organizationPermissions };
    },
    modify_permissions(permission) {
      let index = -1;
      if (
        this.organizationPermissions.permissions.hasOwnProperty(
          this.activePermission.name
        )
      ) {
        index = this.organizationPermissions.permissions[
          this.activePermission.name
        ].indexOf(permission.name);

        if (index > -1) {
          this.organizationPermissions.permissions[
            this.activePermission.name
          ].splice(index, 1);
        } else
          this.organizationPermissions.permissions[
            this.activePermission.name
          ].push(permission.name);
        this.organizationPermissions = { ...this.organizationPermissions };
      }
    },
    async save_permissions() {
      this.awaitingResponse = true;
      let result = await permissionService
        .update_organization_permissions({
          id: this.$route.params.id,
          body: { permissions: this.organizationPermissions.permissions }
        })
        .catch(err => this.handleErrors(err));

      if (result) {
        this.organizationPermissions.permissions = result.permissions;
        this.$eventHub.$emit("refresh-organization-details");
        this.$eventHub.$emit("refresh-organization-list");
        this.organizationPermissions = { ...this.organizationPermissions };
      }
      this.awaitingResponse = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.organization-permissions {
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
            // font-weight: 600;
            font-family: Barlow-SemiBold;
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
        // font-weight: 600;
        font-family: Barlow-SemiBold;
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
        }
        &__right {
          &__title {
            font-size: 1.6rem;
            // font-weight: 600;
            font-family: Barlow-SemiBold;
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