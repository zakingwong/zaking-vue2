import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default () => {
  let store = new Vuex.Store({
    state: {
      name: "zaking",
    },
    mutations: {
      changeName(state, payload) {
        state.name = payload;
      },
    },
    actions: {
      changeName({ commit }, payload) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            commit("changeName", payload);
            resolve();
          }, 1000);
        });
      },
    },
  });
  if (typeof window !== "undefined" && window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
  }
  return store;
};
