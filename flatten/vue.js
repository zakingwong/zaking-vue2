function newArrayProto() {
  let oldArrayProto = [];

  let newArrayProto = Object.create(oldArrayProto);
  console.log(newArrayProto, "newArrayProto");
  let methods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice",
  ];
  methods.forEach((method) => {
    newArrayProto[method] = function (...args) {
      const result = oldArrayProto[method].call(this, ...args);

      let inserted;
      let ob = this.__ob__;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;

          break;
        case "splice":
          inserted = args.slice(2);
        default:
          break;
      }
      if (inserted) {
        ob.observeArray(inserted);
      }
      return result;
    };
  });
  return newArrayProto;
}

class Observer {
  constructor(data) {
    console.log(this, "this");
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    // data.__ob__ = this;
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto();
      console.log(data.__proto__);
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    data.forEach((item) => observe(item));
  }
}

function defineReactive(target, key, value) {
  observe(value);

  Object.defineProperty(target, key, {
    get() {
      return value;
    },
    set(nv) {
      if (nv === value) {
        return;
      }
      observe(nv);
      value = nv;
    },
  });
}

function observe(data) {
  if (typeof data !== "object" || data === null) {
    return;
  }
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  return new Observer(data);
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
// 要注意的是，在现在的阶段，我们是可以这样写，因为不涉及后续更多的逻辑
// 但是，随着后续的逻辑增加，这样写就会导致耦合和不可阅读性。
// 这也是为什么在src的源码中要把它分割开的原因，
// 随着代码的深入，也就不会再有flatten这个文件夹了

function Vue(options) {
  const vm = this;
  vm.$options = options;
  const opts = vm.$options;
  if (opts.data) {
    let data = vm.$options.data;
    data = typeof data === "function" ? data.call(vm, vm) : data;
    vm._data = data;
    observe(data);
    for (let key in data) {
      proxy(vm, "_data", key);
    }
  }
}
