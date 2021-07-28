import Vault from "../vault.vue";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import DownloadShareFile from "@/desktop/vault/components/download-share-file.vue";

const VaultRoutes = [
  {
    path: "/vault/share/:uid/download",
    name: "download-shared-file",
    component: DownloadShareFile,
    meta: {
      requiresAuth: true
    }
  },
  // {
  //   path: "/vault/recents",
  //   name: "vault-recents",
  //   components: {
  //     left: Sidebar,
  //     default: Vault
  //   },
  //   meta: {
  //     active_component: "vault-recents",
  //     title: "Vault",
  //     vault_sidebar: true,
  //     app_navbar:true,
  //     mini_sidebar: true,
  //     requiresAuth: true
  //   }
  // },
  {
    path: "/vault/activities",
    name: "vault-activities",
    components: {
      left: Sidebar,
      default: Vault
    },
    meta: {
      active_component: "vault-activities",
      title: "Vault",
      vault_sidebar: true,
      app_navbar: true,
      mini_sidebar: true,
      requiresAuth: true,
    }
  },
  {
    path: "/vault/:folder_id?",
    name: "vault",
    components: {
      left: Sidebar,
      default: Vault
    },
    meta: {
      active_component: "vault-list",
      title: "Vault",
      vault_sidebar: true,
      app_navbar:true,
      mini_sidebar: true,
      requiresAuth: true,
    }
  },
];

export default VaultRoutes;
