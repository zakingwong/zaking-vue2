import Vue from "vue";
// import Vuex from "vuex";
import Vuex from "@/vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    name: "zaking",
    a: {
      name: "我故意的",
    },
  },
  getters: {
    introduce(state) {
      return "hello,I'am" + state.name;
    },
  },
  mutations: {
    changeName(state, payload) {
      state.name = payload;
    },
  },
  actions: {
    changeName({ commit }) {
      setTimeout(() => {
        commit("changeName", "zakingwong");
      }, 1000);
    },
  },
  modules: {
    a: {
      namespaced: true,
      state: {
        name: "zakingA",
      },
      getters: {
        introduce(state) {
          return "hello,I'am" + state.name;
        },
      },
      mutations: {
        changeName(state, payload) {
          state.name = payload;
        },
      },
    },
    c: {
      namespaced: true,
      state: {
        name: "zakingC",
      },
      mutations: {
        changeName(state, payload) {
          state.name = payload;
        },
      },
    },
  },
});
