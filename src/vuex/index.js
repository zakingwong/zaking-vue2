import install, { Vue } from "./install";
import ModuleCollection from "./module/module-collection";
import { forEachValue } from "./util";

function getState(store, path) {
  return path.reduce((start, current) => {
    return start[current];
  }, store.state);
}

function installModule(store, rootState, path, rootModule) {
  if (path.length > 0) {
    let parent = path.slice(0, -1).reduce((start, current) => {
      return start[current];
    }, rootState);
    Vue.set(parent, path[path.length - 1], rootModule.state);
    // parent[path[path.length - 1]] = rootModule.state;
  }

  let namespaced = store._modules.getNameSpace(path);
  rootModule.forEachMutation((mutationKey, mutationValue) => {
    store._mutations[namespaced + mutationKey] =
      store._mutations[namespaced + mutationKey] || [];
    store._mutations[namespaced + mutationKey].push((payload) => {
      mutationValue(getState(store, path), payload);
      store.subscribes.forEach((fn) =>
        fn({ type: mutationKey, payload }, store.state)
      );
    });
  });
  rootModule.forEachAction((actionKey, actionValue) => {
    store._actions[namespaced + actionKey] =
      store._actions[namespaced + actionKey] || [];
    store._actions[namespaced + actionKey].push((payload) => {
      actionValue(store, payload);
    });
  });
  rootModule.forEachGetter((getterKey, getterValue) => {
    if (store._wrapperGetters[namespaced + getterKey]) {
      return console.warn("duplicate key in getters");
    }
    store._wrapperGetters[namespaced + getterKey] = () => {
      return getterValue(getState(store, path));
    };
  });
  rootModule.forEachModule((moduleKey, module) => {
    installModule(store, rootState, path.concat(moduleKey), module);
  });
}

function resetStoreVM(store, state) {
  let oldVm = store._vm;
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
  if (oldVm) {
    Vue.nextTick(() => {
      oldVm.$destroy();
    });
  }
}

class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);
    this._wrapperGetters = Object.create(null);
    this.plugins = options.plugins || [];
    this.subscribes = [];
    const state = this._modules.root.state;
    installModule(this, state, [], this._modules.root);
    resetStoreVM(this, state);
    this.plugins.forEach((plugin) => plugin(this));
  }
  commit = (type, payload) => {
    if (this._mutations[type]) {
      this._mutations[type].forEach((fn) => fn.call(this, payload));
    }
  };
  dispatch = (type, payload) => {
    if (this._actions[type]) {
      this._actions[type].forEach((fn) => {
        return fn.call(this, payload);
      });
    }
  };
  registerModule(path, module) {
    this._modules.register(path, module);
    installModule(this, this.state, path, module.newModule);
    resetStoreVM(this, this.state);
  }
  get state() {
    return this._vm._data.$$state;
  }
  subscribe(fn) {
    this.subscribes.push(fn);
  }
  replaceState(state) {
    this._vm._data.$$state = state;
  }
}

export default {
  Store,
  install,
};
