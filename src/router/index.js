import Vue from "vue";
// import VueRouter from "vue-router";
import VueRouter from "@/vue-router";
import Home from "../views/Home.vue";
import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    children: [
      {
        path: "a",
        component: {
          render: (h) => <h1>Home a</h1>,
        },
      },
      {
        path: "b",
        component: {
          render: (h) => <h1>Home b</h1>,
        },
      },
    ],
  },
  {
    path: "/about",
    name: "About",
    component: About,
    children: [
      {
        path: "a",
        component: {
          render: (h) => <h1>About a</h1>,
        },
      },
      {
        path: "b",
        component: {
          render: (h) => <h1>About b</h1>,
        },
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});
// router.beforeEach((fron, to, next) => {
//   setTimeout(() => {
//     console.log(1);
//     next();
//   }, 1000);
// });
// router.beforeEach((fron, to, next) => {
//   setTimeout(() => {
//     console.log(2);
//     next();
//   }, 1000);
// });

export default router;
