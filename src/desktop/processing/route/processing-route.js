import Processing from "../processing";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import ProcessingList from "../components/processing-list/processing-list"
import ProcessingDetails from "../components/processing-details"
import ProcessingConfig from "../components/processing-config/processing-config.vue"
import ProcessingImages from "../components/processing-images/processing-images"
import GCP from "../components/processing-gcp/gcp"
import Events from "../components/processing-events/events"


const Routes = [
  {
    path: "/process",
    components: {
      default: Processing,
      left: Sidebar,
      top: Navbar
    },
    meta: {
      title: "Processing Management",
      requiresAuth: true
    },
    children: [
      {
        path: "",
        name: "process-list",
        component: ProcessingList
      },
      {
        path: ":id/details",
        component: ProcessingDetails,
        children: [
          // {
          //     path: "",
          //     redirect: { name: "processing-config" }
          // },
          {
            path: "",
            name: "processing-config",
            component: ProcessingConfig
          },
          {
            path: "images",
            name: "processing-images",
            component: ProcessingImages
          },
          {
            path: "gcp",
            name: "processing-gcp",
            component: GCP
          },
          {
            path: "events",
            name: "processing-events",
            component: Events
          }
        ]
      }
    ]
  }
];

export default Routes;
