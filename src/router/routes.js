const routes = [{
  path: "/",
  component: () => import("layouts/MainLayout.vue"),
  meta: { roles: ['*'] },
  children: [
    { path: "", component: () => import("pages/Index.vue") },
    { path: "requests/draft", component: () => import("pages/request/MyDraft.vue") },
    { path: "requests/nma", component: () => import("pages/request/NMA.vue") },
    { path: "requests/my", component: () => import("pages/request/MyRequest.vue") },
    { path: "requests", component: () => import("src/pages/request/All.vue") },
    { path: "request/:id", component: () => import("pages/request/Form.vue") },
  ],
},
{
  path: "/configuration",
  component: () => import("layouts/MainLayout.vue"),
  meta: { roles: ['*'] },
  children: [
    { path: "parameter", component: () => import("pages/configurations/parameter/View.vue") },
    { path: "parameter/:id", component: () => import("pages/configurations/parameter/Form.vue") }
  ]
},
{
  path: "/login",
  component: () => import("pages/Login.vue"),
},
{
  path: "/403/:catchAll(.*)*",
  component: () => import("pages/Error403.vue"),
},
{
  path: "/:catchAll(.*)*",
  component: () => import("pages/Error404.vue"),
}];

export default routes;
