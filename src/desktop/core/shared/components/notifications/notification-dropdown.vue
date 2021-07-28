<template>
  <div class="notification-dropdown">
    <div class="notification-dropdown__header">Recent Notification</div>
    <div class="notification-dropdown__body">
      <div class="notification-dropdown__body__block">
        <img src="@/assets/icons/user1.png" alt class="user-icon" />
        <div class="user-info">
          <p class="user-name">Sachin Ram</p>
          <p class="notification-time sh-text-normal-10">3m ago</p>
        </div>

        <div class="notification-card">
          Assigned B
          <span class="notification-card__main">Bangalore sloar plant asset</span> to you.
        </div>
      </div>
    </div>
    <div class="notification-dropdown__footer">View All</div>
  </div>
</template>
<style lang="scss" scoped>
.notification-dropdown {
  background: $primary-background;
  position: absolute;
  right: 0;
  max-width: 22rem;
  box-shadow: 0 0.2rem 0.5rem 0 rgba(0, 0, 0, 0.05);

  &__header {
    padding: 1rem 0.5rem;
    font-weight: bold;
    border-bottom: 1px solid grey;
  }
  &__body {
    border-bottom: 1px solid grey;
    &__block {
      padding: 2rem;
      .user-info {
        display: flex;
        justify-content: space-between;
      }
      .notification-card {
        background-color: $white;
        padding: 1rem;
        font-size: 14px;
        box-shadow: 0 0.2rem 0.5rem 0 rgba(0, 0, 0, 0.05);
      }
    }
  }
}
</style>