import admin from "../admin.vue";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import OrganizationList from "../components/organizations/organization-list";
import OrganizationDetails from "../components/organizations/organization-details";
import UserList from "@/desktop/core/components/user/user-list/user-list";
import OrganizationPermissions from "../components/organizations/organization-permissions";
import EntityList from "../components/entity/entity-list";
import JobList from "../components/job/job-list";

import TopSection from "../top-section";
import QcViewer from "../shared/components/qc-viewer";

const adminRoutes = [
  {
    path: "/qc/terra/:id/viewer",
    name: "qc-terra-viewer",
    components: {
      default: QcViewer,
      left: Sidebar,
      // tickets: TicketList
    },
    meta: {
      title: "QC Terra",
      requiresAuth: true,
      requiresQCPermissions:true
    },
  },
  {
    path: "/qc/therm/:id/viewer",
    name: "qc-therm-viewer",
    components: {
      default: QcViewer,
      left: Sidebar,
      // tickets: TicketList
    },
    meta: {
      title: "QC Therm",
      requiresAuth: true,
      requiresQCPermissions:true
    },
  },
  {
    path: "/admin",
    components: {
      default: admin,
      left: Sidebar,
      top: Navbar
    },
    meta: {
      requiresAuth: true,
      requiresAdmin:true
    },
    children: [
      // temp home page for admin module
      {
        path: "",
        redirect: { name: "organization-list" }
      },
      // organitions routes
      {
        path: "organizations",
        name: "organization-list",
        components: {
          default: OrganizationList,
          "top-section": TopSection
        },
      },
      {
        path: ":id/details",
        component: OrganizationDetails,
        children: [
          {
            path: "",
            redirect: { name: "organization-details" }
          },
          {
            path: "users",
            name: "organization-details",
            component: UserList
          },
          {
            path: "permissions",
            name: "organization-permissions",
            component: OrganizationPermissions
          }
        ]
      },
      {
        path: "entities",
        name: "entity-list",
        components: {
          default: EntityList,
          "top-section": TopSection
        },
      },
      {
        path: "users",
        name: "admin-user-list",

        meta: {
          title: "Users"
        },
        components: {
          default: UserList,
          "top-section": TopSection
        },
      },
      {
        path: "jobs",
        name: "job-list",
        components: {
          default: JobList,
          "top-section": TopSection
        }
      },
    ]
  }
];

export default adminRoutes;
