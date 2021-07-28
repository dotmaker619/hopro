import therm from "../therm.vue";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";

import ThermViewer from "../components/viewer";
import ViewList from "../components/view-list/view-list"
import ViewDetails from "../components/view-details/view-details";
import ViewerEBS from "@/desktop/shared/components/viewer-ebs";

const Routes = [
  {
    path: "/therm/view/:id/viewer",
    name: "therm-viewer",
    components: {
      default: ThermViewer,
      left: Sidebar,
      tickets: ViewerEBS
    },
    meta: {
      active_component:"vault-list",
      title: "Therm viewer",
      requiresAuth: true,
      requiresThermPermissions:true
    },
  },
  {
    path: "/therm",
    components: {
      default: therm,
      left: Sidebar,
      top: Navbar
    },
    meta: {
      title: "Therm",
      requiresAuth: true,
      requiresThermPermissions:true
    },
    children: [
      {
        path: "",
        name: "therm-view-list",
        component: ViewList
      },
      {
        path: "view/:id/details",
        name: "therm-view-details",
        component: ViewDetails
      }
    ]
  }
];

export default Routes;
