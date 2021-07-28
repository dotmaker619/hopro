import Missions from "../missions";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import MissionViewer from "../components/viewer";
import MissionList from "../components/mission-list";
import MissionDetails from "../components/mission-details/mission-details";


const Routes = [
  {
    path: "/missions/view/:id/viewer",
    name: "missions-viewer",
    components: {
      default: MissionViewer,
      left: Sidebar
    },
    meta: {
      title: "Terra viewer",
      requiresAuth: true
    },
  },
  {
    path: "/missions",
    components: {
      default: Missions,
      left: Sidebar,
      top: Navbar
    },
    meta: {
      title: "Missions Management",
      requiresAuth: true
    },
    children: [
      {
        path: "",
        name: "mission-list",
        component: MissionList
      },
      {	
        path: ":id/details",	
        name: "mission-details",	
        component: MissionDetails,		
      }
    ],
  },
  
]

export default Routes;
