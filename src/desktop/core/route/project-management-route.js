import ProjectManagement from "../project-management/project-management";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import ProjectTopSection from "@/desktop/core/project-management/components/top-section";

import AssetList from "@/desktop/core/components/asset/asset-list/asset-list";
import AssetDetails from "@/desktop/core/components/asset/asset-details/asset-details";
import AssetDetailsPage from "@/desktop/core/components/asset/asset-details/components/details";
import AssetDetailsConfiguration from "@/desktop/core/components/asset/asset-details/components/configuration/configuration";
import Applications from "@/desktop/core/shared/components/application";
import TicketsList from "@/desktop/tickets/components/tickets-list/tickets-list";
import Vault from "@/desktop/vault/vault";

import ContainerList from "@/desktop/core/components/container/container-list/container-list.vue";
import ContainerDetails from "@/desktop/core/components/container/container-details/container-details";
import ContainerDetailsPage from "@/desktop/core/components/container/container-details/components/details";

import GroupList from "@/desktop/core/components/group/group-list/group-list";
import GroupDetails from "@/desktop/core/components/group/group-details/group-details";
import GroupDetailsPage from "@/desktop/core/components/group/group-details/components/details";

import ReportList from "@/desktop/core/shared/components/report-list";
import ProjectList from "@/desktop/core/components/project/project-list/project-list";
import ProjectDetails from "@/desktop/core/components/project/project-details/project-details";
import ProjectDetailsPage from "@/desktop/core/components/project/project-details/components/details";
import ProjectImagesList from "@/desktop/core/components/project/project-images-list/project-images-list";
import MissionList from "@/desktop/missions/components/mission-list";
import ProcessingList from "@/desktop/processing/components/processing-list/processing-list";

const Routes = [
  {
    path: "/core/project-management",
    components: {
      default: ProjectManagement,
      left: Sidebar,
      top: Navbar,
    },
    meta: {
      title: "Project management",
      requiresAuth: true,
    },
    children: [
      // assets routes
      {
        path: "",
        redirect: { name: "asset-list" },
      },
      {
        path: "assets",
        name: "asset-list",
        meta: {
          title: "Assets",
        },
        components: {
          default: AssetList,
          "top-section": ProjectTopSection,
        },
      },
      {
        path: "assets/:id",
        component: AssetDetails,
        children: [
          {
            path: "details",
            component: AssetDetailsPage,
            children: [
              {
                path: "",
                name: "asset-details",
                redirect: { name: "asset-details-containers" },
              },
              {
                path: "containers",
                name: "asset-details-containers",
                meta: {
                  title: "Asset details",
                },
                component: ContainerList,
              },
              {
                path: "groups",
                name: "asset-details-groups",
                component: GroupList,
              },
              {
                path: "reports",
                name: "asset-details-reports",
                component: ReportList,
              },
              {
                path: "configuration",
                name: "asset-details-configuration",
                component: AssetDetailsConfiguration,
              },
            ],
          },
          {
            path: "applications",
            component: Applications,
            children: [
              {
                path: "",
                name: "asset-application",
                redirect: { name: "asset-tickets" },
              },
              {
                path: "tickets",
                name: "asset-tickets",
                component: TicketsList,
              },
              {
                path: "vault",
                name: "asset-vault",
                component: Vault,
              },
            ],
          },
        ],
      },
      // groups routes
      {
        path: "groups",
        name: "group-list",
        meta: {
          title: "Groups",
        },
        components: {
          default: GroupList,
          "top-section": ProjectTopSection,
        },
      },
      {
        path: "groups/:id/",
        component: GroupDetails,
        children: [
          {
            path: "details",
            component: GroupDetailsPage,
            children: [
              {
                path: "",
                name: "group-details-projects",
                redirect: { name: "group-details" },
              },
              {
                path: "projects",
                name: "group-details",
                meta: {
                  title: "Group details",
                },
                component: ProjectList,
              },
              {
                path: "reports",
                name: "group-details-reports",
                component: ReportList,
              },
              {
                path: "missions",
                name: "group-details-missions",
                component: MissionList,
              },
              {
                path: "processing",
                name: "group-details-processing",
                component: ProcessingList,
              },
            ],
          },
          {
            path: "applications",
            component: Applications,
            children: [
              {
                path: "",
                name: "group-application",
                redirect: { name: "group-tickets" },
              },
              {
                path: "tickets",
                name: "group-tickets",
                component: TicketsList,
              },
              {
                path: "vault",
                name: "group-vault",
                component: Vault,
              },
            ],
          },
        ],
      },
      // containers routes
      {
        path: "containers",
        name: "container-list",
        meta: {
          title: "Container",
        },
        components: {
          default: ContainerList,
          "top-section": ProjectTopSection,
        },
      },
      {
        path: "container/:id/",
        component: ContainerDetails,
        children: [
          {
            path: "details",
            component: ContainerDetailsPage,

            children: [
              {
                path: "",
                name: "container-details-groups",
                redirect: { name: "container-details" },
              },

              {
                path: "groups",
                name: "container-details",
                meta: {
                  title: "Container details",
                },
                component: GroupList,
              },
            ],
          },
          {
            path: "applications",
            component: Applications,
            children: [
              {
                path: "",
                name: "container-application",
                redirect: { name: "container-tickets" },
              },
              {
                path: "tickets",
                name: "container-tickets",
                component: TicketsList,
              },
              {
                path: "vault",
                name: "container-vault",
                component: Vault,
              },
            ],
          },
        ],
      },
      {
        path: "group/:group_id/project/:id/",
        meta: {
          title: "Project details",
        },
        component: ProjectDetails,
        children: [
          {
            path: "details",
            component: ProjectDetailsPage,
            children: [
              {
                path: "",
                name: "project-details",
              },
            ],
          },
          {
            path: "applications",
            component: Applications,
            children: [
              {
                path: "tickets",
                name: "project-tickets",
                component: TicketsList,
              },
              {
                path: "vault",
                name: "project-vault",
                component: Vault,
              },
            ],
          },
        ],
      },
      {
        path: "project/:id/images",
        name: "project-images-list",
        meta: {
          title: "Project images list",
        },
        component: ProjectImagesList,
      },
    ],
  },
];

export default Routes;
