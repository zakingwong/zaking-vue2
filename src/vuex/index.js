export let Vue;

class Store {
  constructor(options) {
    let state = options.state;
    let getters = options.getters;
    let mutations = options.mutations;
    let actions = options.actions;

    this.getters = {};
    const computed = {};
    Object.keys(getters).forEach((getterKey) => {
      computed[getterKey] = () => {
        return getters[getterKey](this.state);
      };
      Object.defineProperty(this.getters, getterKey, {
        get: () => {
          return this._vm[getterKey];
        },
      });
    });
    this._vm = new Vue({
      data: {
        $$state: state,
      },
      computed,
    });
    this.mutations = mutations;
    this.actions = actions;
  }
  get state() {
    return this._vm._data.$$state;
  }
  commit = (type, payload) => {
    this.mutations[type](this.state, payload);
  };
  dispatch = (type, payload) => {
    this.actions[type](this, payload);
  };
}

const install = (_Vue) => {
  Vue = _Vue;
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        this.$store = this.$options.store;
      } else if (this.$parent && this.$parent.$store) {
        this.$store = this.$parent.$store;
      }
    },
  });
};

export default {
  Store,
  install,
};
