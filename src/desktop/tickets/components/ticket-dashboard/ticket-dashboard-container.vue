<template>
  <div>
    <div class="ticket-layout">
      <div class="ticket-layout-left has-slimscroll">
        <ticket-sidebar />
      </div>
      <div class="ticket-layout-right">
        <div class="nav-sticky">
          <Navbar />
        </div>
        <!-- <keep-alive> -->
          <router-view />
        <!-- </keep-alive> -->
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import TicketSidebar from "@/desktop/tickets/components/ticket-dashboard/ticket-sidebar/ticket-sidebar";
import TicketOverview from "../ticket-dashboard/components/overview/ticket-overview";

export default {
  components: {
    Navbar,
    TicketSidebar,
    TicketOverview
  }
};
</script>

<style lang="scss">
.ticket-layout {
  display: flex;
  &-left {
    min-height: 100vh;
    max-height: 100vh;
    flex: 0 0 24.3rem;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 39;
    position: fixed;
    object-fit: contain;
    box-shadow: 0 1px 3px 0 rgba(23, 30, 72, 0.2);
    background-color: #ffffff;
  }
  &-right {
    width: 100%;
    background: #f4f7fc;
    margin-left: 24.3rem;
    // overflow: hidden;
  }
}
.nav-sticky {
  z-index: 38;
  position: sticky;
  top: 0;
}
</style>
