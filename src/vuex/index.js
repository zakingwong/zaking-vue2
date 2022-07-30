import install, { Vue } from "./install";
import ModuleCollection from "./module/module-collection";
import { forEachValue } from "./util";

function installModule(store, rootState, path, rootModule) {
  if (path.length > 0) {
    let parent = path.slice(0, -1).reduce((start, current) => {
      return start[current];
    }, rootState);
    parent[path[path.length - 1]] = rootModule.state;
  }
  rootModule.forEachMutation((mutationKey, mutationValue) => {
    store._mutations[mutationKey] = store._mutations[mutationKey] || [];
    store._mutations[mutationKey].push((payload) => {
      mutationValue(rootModule.state, payload);
    });
  });
  rootModule.forEachAction((actionKey, actionValue) => {
    store._actions[actionKey] = store._actions[actionKey] || [];
    store._actions[actionKey].push((payload) => {
      actionValue(store, payload);
    });
  });
  rootModule.forEachGetter((getterKey, getterValue) => {
    if (store._wrapperGetters[getterKey]) {
      return console.warn("duplicate key in getters");
    }
    store._wrapperGetters[getterKey] = () => {
      return getterValue(rootModule.state);
    };
  });
  rootModule.forEachModule((moduleKey, module) => {
    installModule(store, rootState, path.concat(moduleKey), module);
  });
}

function resetStoreVM(store, state) {
  store.getters = {};
  const computed = {};
  const wrapperGetters = store._wrapperGetters;

  forEachValue(wrapperGetters, (getterKey, getterValue) => {
    computed[getterKey] = getterValue;
    Object.defineProperty(store.getters, getterKey, {
      get: () => {
        return store._vm[getterKey];
      },
    });
  });

  store._vm = new Vue({
    data: {
      $$state: state,
    },
    computed,
  });
}

class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);
    this._wrapperGetters = Object.create(null);

    const state = this._modules.root.state;
    installModule(this, state, [], this._modules.root);

    resetStoreVM(this, state);
  }
  commit = (type, payload) => {
    if (this._mutations[type]) {
      this._mutations[type].forEach((fn) => fn.call(this, payload));
    }
  };
  dispatch = (type, payload) => {
    if (this._actions[type]) {
      this._actions[type].forEach((fn) => {
        console.log(fn, "fn");
        return fn.call(this, payload);
      });
    }
  };
  get state() {
    return this._vm._data.$$state;
  }
}

export default {
  Store,
  install,
};
