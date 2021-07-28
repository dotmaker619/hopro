import UserManagement from "../user-management/user-management";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";
import UserList from "@/desktop/core/components/user/user-list/user-list";
import UserDetails from "@/desktop/core/components/user/user-details/user-details";

import UserPermissions from "@/desktop/core/components/user/user-details/components/user-permissions"
import UserProfile from "@/desktop/core/components/user/user-profile/user-profile"

import RoleList from "@/desktop/core/components/role/role-list/role-list";
import RoleDetails from "@/desktop/core/components/role/role-details/role-details";
import RolePermissions from "@/desktop/core/components/role/role-details/components/role-permissions";

import TeamList from "@/desktop/core/components/team/team-list/team-list";
import GuestOrganizationList from "@/desktop/core/components/guest/guest-list";
import TeamDetails from "@/desktop/core/components/team/team-details/team-details";

import AssetList from "@/desktop/core/components/user/user-details/components/user-asset-list";
import ContainerList from "@/desktop/core/components/user/user-details/components/user-container-list";
import GroupList from "@/desktop/core/components/user/user-details/components/user-group-list";
import TopSection from "@/desktop/core/user-management/components/top-section";


const Routes = [
  {
    path: "/core/user-management",
    components: {
      default: UserManagement,
      left: Sidebar,
      top: Navbar
    },
    meta: {
      title: "User management",
      requiresAuth: true
    },
    children: [
      // users routes
      {
        path: "",
        redirect: { name: "user-list" }
      },
      {
        path: "users",
        name: "user-list",

        meta: {
          title: "Users"
        },
        components: {
          default: UserList,
          "top-section": TopSection
        },
      },

      {
        path: "users/:id/profile",
        name: "user-profile",
        component: UserProfile,
      },

      {
        path: "users/:id/details",
        component: UserDetails,
        children: [
          {
            path: "",
            redirect: { name: "user-details" }
          },
          {
            path: "assets",
            name: "user-details",
            meta: {
              title: "User details"
            },
            component: AssetList
          },
          {
            path: "groups",
            name: "user-details-groups",
            component: GroupList
          },
          {
            path: "containers",
            name: "user-details-containers",
            component: ContainerList
          },
          {
            path: ":type/permissions",
            name: "user-permissions",
            component: UserPermissions
          }
        ]
      },
      // guest org routes
      {
        path: "guest-organization",
        name: "guest-organization",
        meta: {
          title: "Guest organization"
        },
        components: {
          default: GuestOrganizationList,
          "top-section": TopSection
        }
      },
      // roles routes
      {
        path: "roles",
        name: "role-list",
        meta: {
          title: "Roles"
        },
        components: {
          default: RoleList,
          "top-section": TopSection
        }
      },
      {
        path: "roles/:id/details",
        component: RoleDetails,
        children: [
          {
            path: "",
            redirect: { name: "role-details" }
          },
          {
            path: "users",
            name: "role-details",
            meta: {
              title: "Role Details"
            },
            component: UserList
          },
          {
            path: "permissions",
            name: "role-permissions",
            component: RolePermissions
          }
        ]
      },
      // teams routes
      {
        path: "teams",
        name: "team-list",
        meta: {
          title: "Teams"
        },
        components: {
          default: TeamList,
          "top-section": TopSection
        }
      },
      {
        path: "teams/:id/details",
        component: TeamDetails,
        children: [
          {
            path: "",
            redirect: { name: "team-details" }
          },
          {
            path: "users",
            name: "team-details",
            meta: {
              title: "Team details"
            },
            component: UserList
          },
          {
            path: "assets",
            name: "team-details-assets",
            component: AssetList
          }
        ]
      }
    ]
  }
];

export default Routes;
