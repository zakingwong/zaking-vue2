import { observe } from "./observe/index";
export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
}
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(nv) {
      vm[target][key] = nv;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data;
  data = typeof data === "function" ? data.call(vm, vm) : data;
  vm._data = data;

  observe(data);
  for (let key in data) {
    proxy(vm, "_data", key);
  }
}

function initComputed(vm) {
  const computed = vm.$options.computed;
  for (const key in computed) {
    let userDef = computed[key];
    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  const getter = typeof userDef === "function" ? userDef : userDef.get;
  const setter = userDef.set || (() => {});
  Object.defineProperty(target, key, {
    get: getter,
    set: setter,
  });
}
