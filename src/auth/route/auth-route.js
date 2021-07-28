// import auth from "../auth.vue";
import login from "../components/login.vue";
import handleLogin from "../components/handle-auth.vue";
import signup from "../components/register.vue";

const userRoutes = [
    {
        path: "/signup",
        name: "signup",
        component: signup,
    },
    {
        path: "/auth",
        name: "auth",
        component: login,
    },
    {
        path: "/auth/callback",
        name: "handle-login",
        component: handleLogin,
    },
];

export default userRoutes;