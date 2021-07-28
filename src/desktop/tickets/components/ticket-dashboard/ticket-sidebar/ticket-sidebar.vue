<template>
  <div class="ticket-sidebar">
    <div class="ticket-sidebar-title">
      <img src="@/assets/icons/tickets/ticket-logo.svg" alt="" />
      <div class="ticket-sidebar-title__right">
        <div class="primary-title is-semiBold-16-600-19">Tickets</div>
        <div class="secondary-title is-regular-12-00-14">
          Manage assets with ease!
        </div>
      </div>
    </div>

    <div class="ticket-sidebar-content">
      <router-link
        class="ticket-sidebar-content__item"
        v-for="nav in ticketNavList"
        :key="nav.name"
        :to="{ name: nav.to, query: { asset: $route.query.asset } }"
        :class="{ 'is-active': $route.name == nav.name || $route.path.includes(nav.name) }"
      >
        <sh-icon v-if="$route.name == nav.name" :name="`${nav.icon}-active`" class="is-24x24 ticket-sidebar-content__item__icon" />
        <sh-icon v-else :name="`${nav.icon}`" class="is-24x24 ticket-sidebar-content__item__icon" />
        <span class="is-medium-14-500-00 item-name is-capitalized">{{ nav.name }}</span>
        <div :class="{ 'active-indicator': $route.name == nav.name || $route.path.includes(nav.name) }"></div>
      </router-link>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        ticketNavList: [
          {
            name: "overview",
            icon: "sidebar-overview",
            to: "overview",
          },
          {
            name: "tickets",
            icon: "sidebar-tickets",
            to: "tickets",
          },
          {
            name: "templates",
            icon: "sidebar-views",
            to: "templates",
          },
          {
            name: "favorites",
            icon: "sidebar-favorites",
            to: "favorites",
          },
          {
            name: "checklists",
            icon: "sidebar-checklists",
            to: "checklists",
          },
          {
            name: "schedules",
            icon: "sidebar-schedules",
            to: "schedules",
          },
          {
            name: "reports",
            icon: "sidebar-reports",
            to: "reports",
          },
        ],
      };
    },
  };
</script>

<style lang="scss" scoped>
  .ticket-sidebar {
    width: 243px;
    padding: 7rem 0rem;

    &-title {
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
