import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import TicketList from "../components/tickets-list/tickets-list";
import TicketDetails from "@/desktop/tickets/components/ticket-details/components/ticket-details-popup-handler";
import TicketDashboard from "@/desktop/tickets/components/ticket-dashboard/ticket-dashboard-container.vue";
import TicketOverview from "@/desktop/tickets/components/ticket-dashboard/components/overview/ticket-overview.vue";
import TicketFavorites from "@/desktop/tickets/components/ticket-dashboard/components/favorites-dashboard.vue";
import TicketReport from "@/desktop/tickets/components/ticket-dashboard/components/reports/ticket-reports.vue";
import TicketOverviewMember from "@/desktop/tickets/components/ticket-dashboard/components/overview/components/member-expand";
import TicketOverviewPriority from "@/desktop/tickets/components/ticket-dashboard/components/overview/components/priority-expand";
import TicketOverviewTag from "@/desktop/tickets/components/ticket-dashboard/components/overview/components/tag-expand";
import Checklists from "@/desktop/tickets/components/ticket-dashboard/components/checklists/checklists-dashboard";
import ChecklistDetails from "@/desktop/tickets/components/ticket-dashboard/components/checklists/components/checklist-details";
import Schedules from "@/desktop/tickets/components/ticket-dashboard/components/schedules/schedules-dashboard";
import Templates from "@/desktop/tickets/components/ticket-dashboard/components/templates/templates-dashboard";
import TemplateDetails from "@/desktop/tickets/components/ticket-dashboard/components/templates/components/template-details";
import ScheduleDetails from "@/desktop/tickets/components/ticket-dashboard/components/schedules/components/schedule-details";
import FilteredTicketsList from "@/desktop/tickets/components/ticket-dashboard/components/overview/components/filtered-tickets-list";

const Routes = [
  {
    path: "/tickets",
    name: "tickets-list",
    components: {
      default: TicketList,
      left: Sidebar,
      top: Navbar,
    },
    children: [
      {
        path: ":id/details",
        name: "ticket-details",
        component: TicketDetails,
      },
    ],
    meta: {
      title: "Tickets",
      mini_sidebar:true,
      requiresAuth: true,
    },
  },
  {
    path: "/ticket-dashboard",
    name: "ticket-dashboard",
    components: {
      default: TicketDashboard,
      left: Sidebar,
    },
    meta: {
      requiresAuth: true,
      title: "Ticket Dashboard",
    },
    children: [
      {
        path: "overview",
        name: "overview",
        component: TicketOverview,
        alias: "",
      },
      {
        path: "overview/member",
        name: "overview-member",
        component: TicketOverviewMember,
      },
      {
        path: "overview/priority",
        name: "overview-priority",
        component: TicketOverviewPriority,
      },
      {
        path: "overview/tag",
        name: "overview-tag",
        component: TicketOverviewTag,
      },
      {
        path: "overview/tickets",
        name: "filtered-tickets-list",
        component: FilteredTicketsList,
      },

      {
        path: "tickets",
        name: "tickets",
        component: TicketList,
      },
      {
        path: "templates",
        name: "templates",
        component: Templates,
      },

      {
        path: "templates/:id/details",
        name: "template-details",
        component: TemplateDetails,
      },

      {
        path: "favorites",
        name: "favorites",
        component: TicketFavorites,
      },
      {
        path: "checklists",
        name: "checklists",
        component: Checklists,
      },
      {
        path: "checklists/:id/details",
        name: "checklist-details",
        component: ChecklistDetails,
      },
      {
        path: "schedules/:id/details/:ticket",
        name: "schedule-details",
        component: ScheduleDetails,
      },
      {
        path: "schedules",
        name: "schedules",
        component: Schedules,
      },

      {
        path: "reports",
        name: "reports",
        component: TicketReport,
      },
    ],
  },
];

export default Routes;
