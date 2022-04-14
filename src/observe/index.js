import newArrayProto from "./array";
import Dep from "./dep";
class Observer {
  constructor(data) {
    // 5.3.1
    this.dep = new Dep();

    // data.__ob__ = this;
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto;
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    data.forEach((item) => {
      observe(item);
    });
  }
}
// 递归多了性能肯定会很差
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i];
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

export function defineReactive(target, key, value) {
  // 5.3.2
  // 对所有的对象都进行属性劫持，childOb.dep用来收集依赖
  let childOb = observe(value);
  let dep = new Dep();
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend(); // 让这个属性得收集器记住这个watcher
        if (childOb) {
          childOb.dep.depend(); // 让数组和对象本身也实现依赖收集
          // 让数组内的数组，再做一层依赖收集
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(nv) {
      if (nv === value) {
        return;
      }
      observe(nv);
      value = nv;
      dep.notify();
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
