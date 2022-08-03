import { route } from "quasar/wrappers";
import User from "src/services/User";
import
{
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";

export default route(function (/* { store, ssrContext } */)
{
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    history: createHistory(
      process.env.MODE === "ssr" ? void 0 : process.env.VUE_ROUTER_BASE
    ),
  });

  Router.beforeEach((to, from, next) =>
  {
    const roles = to.meta.roles && Array.isArray(to.meta.roles) ? to.meta.roles : [];
    if (roles.length)
    {
      if (!User.isAuthenticated())
      {
        const address = new URL(document.URL);
        localStorage.clear();
        if (address.pathname === "/")
        {
          next({ path: '/login' });
        } else
        {
          document.location = "/logout";
        }
      } else
      {
        const hasRoles = roles.some(role => User.hasRoles(role) || role === "*");
        if (hasRoles)
        {
          next();
        } else
        {
          next({ path: '/403' + to.fullPath });
        }
      }
    } else
    {
      next();
    }
  });

  return Router;
});
