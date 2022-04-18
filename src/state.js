import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watcher";

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    // 在这里开始，初始化Computed的工作
    initComputed(vm);
  }
  // watch.1
  if (opts.watch) {
    initWatch(vm);
  }
}
function initWatch(vm) {
  let watch = vm.$options.watch;
  for (const key in watch) {
    const handler = watch[key]; // 可能是字符串，数组，函数
    // 如果是数组的话，循环一下就好了
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}
// 给每个实例上增加的属性和对应的处理函数
function createWatcher(vm, key, handler) {
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  return vm.$watch(key, handler);
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
// 5.2 初始化computed
// 计算属性本身不收集依赖，只会让自己内部绑定的属性去收集依赖
function initComputed(vm) {
  const computed = vm.$options.computed;
  // 5.4 把watcher存起来，后面会用到，存到vm上，在createComputedGetter中会用到
  const watchers = (vm._computedWatchers = {});
  // 遍历computed中的计算属性
  for (let key in computed) {
    // userDef就是computed中的每一个计算属性
    let userDef = computed[key];
    // 我们判断一下是函数还是对象，如果是函数的话，那么就直接用函数，如果是对象的话，就用对象的get方法
    let fn = typeof userDef === "function" ? userDef : userDef.get;
    // 5.3 我们进入到watcher里
    // 这里，之前我们使用Watcher的时候，一旦new了，就会立即执行回调，这里我们肯定不希望computed的watcher立即执行get。
    // 所以，我们要额外的传入一个参数，lazy，表示不需要new的时候就立即执行
    watchers[key] = new Watcher(vm, fn, { lazy: true });
    // 5.2.x 这是中间阶段的方式，如果是对象的形式，直接把get和set传给defineProterty。如果是函数，会做简单的处理
    // 但是这样会有很大的问题，大家可以自己试一下
    // defineComputed(vm, key, fn, userDef); //2.x
    defineComputed(vm, key, userDef);
  }
}
function defineComputed(target, key, userDef) {
  // function defineComputed(target, key, userDef) { //2.x
  const setter = userDef.set || (() => {});
  Object.defineProperty(target, key, {
    // get: fn, //2.x
    get: createComputedGetter(key),
    set: setter,
  });
}

function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key];
    if (watcher.dirty) {
      // 5.5 第一次取值后，dirty就会变为false，下一次就不会再走evaluate了
      watcher.evaluate();
    }
    // 5.6 计算属性出栈后，还要让计算属性watcher里面的属性，去绑定上一层的watcher
    if (Dep.target) {
      watcher.depend();
    }
    // 这个时候执行完watcher.evaluate，watcher上已经有了value，返回即可
    return watcher.value;
  };
}

export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick;
  // watch.1-1,最终的核心就是这个方法
  Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    // exprOrFn：
    // name 或者是 () => name，我们去Watcher里处理，user代表是用户创建的
    new Watcher(this, exprOrFn, { user: true }, cb);
  };
}
