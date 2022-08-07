import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const Foo = () => import("./components/Foo");
const Bar = () => import("./components/Bar");

export default () => {
  const router = new VueRouter({
    mode: "history",
    routes: [
      { path: "/foo", component: Foo },
      { path: "/bar", component: Bar },
    ],
  });
  return router;
};
