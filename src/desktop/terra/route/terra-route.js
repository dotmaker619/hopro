import Terra from "../terra";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import ViewerEBS from "@/desktop/shared/components/viewer-ebs";
import TerraViewer from "../components/viewer";
import TerraList from "../components/terra-list/terra-list";
import TerraDetails from "../components/terra-details/terra-details.vue";
import TicketDetails from "@/desktop/tickets/components/ticket-details/ticket-details";
const Routes = [
  {
    path: "/terra/view/:id/viewer",
    name: "terra-viewer",
    components: {
      default: TerraViewer,
      left: Sidebar,
      tickets: ViewerEBS
    },
    meta: {
      active_component:"vault-list",
      title: "Terra viewer",
      requiresAuth: true,
      requiresTerraPermissions:true
    },
    children: [
      {
        path: ":ticket_id/ticket",
        name: "terra-ticket",
        component: TicketDetails
      }
    ]
  },
  {
    path: "/terra",
    components: {
      default: Terra,
      left: Sidebar,
      top: Navbar
    },
    meta: {
      title: "Terra management",
      requiresAuth: true,
      requiresTerraPermissions:true
    },
    children: [
      {
        path: "",
        name: "terra-list",
        component: TerraList,
        children: [
          // {
          //   path: ":id/edit",
          //   name: "terra-edit",
          //   meta: {
          //     title: "Edit view"
          //   },
          //   component: () =>
          //     import(
          //       /* webpackChunkName: "terra-edit" */ "@/desktop/terra/components/terra-details.vue"
          //     )
          // }
        ]
      },
      {
        path: ":id/details",
        name: "terra-details",
        meta: {
          title: "Terra details"
        },
        component: TerraDetails
      }
    ]
  }
];

export default Routes;
