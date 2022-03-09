import newArrayProto from "./array";
class Observer {
  constructor(data) {
    // data.__ob__ = this;
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    if (Array.isArray(data)) {
      // 重写数组的方法，7个变异方法，这些方法可以修改数组本身
      // 除了数组，数组内的引用类型也要劫持
      data.__proto__ = newArrayProto;
      // 需要保留数组原有的特性，并且可以重写部分方法
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

export function defineReactive(target, key, value) {
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

export function observe(data) {
  if (typeof data !== "object" || data === null) {
    return;
  }
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  return new Observer(data);
}
