import FormsDashboard from "../components/dashboard/dashboard";
import FormCreate from "../components/form/create/form-create";
import FormSubmission from "../components/form/submission/form-submission";
import FormReport from "../components/form/reports/form-report";
import FormPreview from "../components/form/create/form-preview";
import Forms from "../forms";
import Form from "../components/form/form";
import Sidebar from "@/desktop/shared/components/sidebar.vue";
import Navbar from "@/desktop/shared/components/navbar/navbar.vue";

const Routes = [
  {
    path: "/forms",
    name: "forms",
    redirect: { name: "formsDashboard" },
    components: {
      default: Forms,
      left: Sidebar,
      top: Navbar,
    },
    meta: {
      title: "Forms",
      mini_sidebar: true,
      requiresAuth: true,
    },
    children: [
      {
        path: "/forms/dashboard",
        name: "formsDashboard",
        components: {
          default: FormsDashboard,
          left: Sidebar,
          top: Navbar,
        },
        meta: {
          title: "Forms",
          mini_sidebar: true,
          requiresAuth: true,
        },
      },
      {
        path: "/forms/:form",
        name: "form",
        redirect: "/forms/:form/create",
        components: {
          default: Form,
          left: Sidebar,
          top: Navbar,
        },
        meta: {
          title: "Forms",
          mini_sidebar: true,
          requiresAuth: true,
        },
        children: [
          {
            path: "/forms/:form/create",
            name: "formCreate",
            components: {
              default: FormCreate,
              left: Sidebar,
              top: Navbar,
            },
            meta: {
              title: "Forms",
              mini_sidebar: true,
              requiresAuth: true,
            },
          },
          {
            path: "/forms/:form/submission",
            name: "formSubmission",
            components: {
              default: FormSubmission,
              left: Sidebar,
              top: Navbar,
            },
            meta: {
              title: "Forms",
              mini_sidebar: true,
              requiresAuth: true,
            },
          },
          {
            path: "/forms/:form/report",
            name: "formReport",
            components: {
              default: FormReport,
              left: Sidebar,
              top: Navbar,
            },
            meta: {
              title: "Forms",
              mini_sidebar: true,
              requiresAuth: true,
            },
          },
          {
            path: "/forms/:form/preview",
            name: "formPreview",
            components: {
              default: FormPreview,
              left: Sidebar,
              top: Navbar,
            },
            meta: {
              title: "Forms",
              mini_sidebar: true,
              requiresAuth: true,
            },
          },
        ],
      },
    ],
  },
];

export default Routes;
