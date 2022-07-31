import Vue from "vue";
// import Vuex from "vuex";
import Vuex from "@/vuex";
import logger from "vuex/dist/logger";

Vue.use(Vuex);

const persitsPlugin = function (store) {
  let state = localStorage.getItem("VUEX");
  if (state) {
    store.replaceState(JSON.parse(state));
  }
  store.subscribe((mutation, state) => {
    localStorage.setItem("VUEX", JSON.stringify(state));
  });
};

const store = new Vuex.Store({
  strict: true,
  plugins: [persitsPlugin],
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
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit("changeName", "zakingwong");
          resolve();
        }, 1000);
      });
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
      modules: {
        b: {
          namespaced: true,
          state: {
            name: "zakingB",
          },
          getters: {
            introduce(state) {
              return "hello,I'am" + state.name;
            },
          },
          modules: {
            d: {
              state: {
                name: "zakingD",
              },
              getters: {
                introduce(state) {
                  return "hello,I'am" + state.name;
                },
              },
            },
          },
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

store.registerModule(["a", "e"], {
  namespaced: true,
  state: {
    name: "zakingE",
  },
  getters: {
    introduce(state) {
      return "hello,I'am register" + state.name;
    },
  },
  mutations: {
    changeName(state, payload) {
      state.name = payload;
    },
  },
});

export default store;