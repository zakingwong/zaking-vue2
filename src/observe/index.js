import newArrayProto from "./array";
import Dep from "./dep";
class Observer {
  constructor(data) {
    this.dep = new Dep();

    // data.__ob__ = this;
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    // 如果是数组的话，要做特殊处理
    if (Array.isArray(data)) {
      // 重写数组的方法，7个变异方法，这些方法可以修改数组本身
      // 除了数组，数组内的引用类型也要劫持
      data.__proto__ = newArrayProto;
      // 需要保留数组原有的特性，并且可以重写部分方法
      // 这个observeArray，并不是真正的数组观测的地方，真正的触发观测，是使用newArrayProto的方法时。
      // 它只是为了继续观测数组的元素是否还是数组的情况
      this.observeArray(data);
    } else {
      // 走walk
      this.walk(data);
    }
  }
  walk(data) {
    // walk就是循环data中的key，然后取绑定defineProperty
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    data.forEach((item) => {
      observe(item);
    });
  }
}

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
  let childOb = observe(value);
  let dep = new Dep();
  // 这就好理解了，target就是data，
  // 我们给data上的属性做了defineProperty的绑定。
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend(); // 让这个属性得收集器记住这个watcher
        if (childOb) {
          childOb.dep.depend();
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
// 接下来我们来看这个observe
export function observe(data) {
  // 这个不说了吧
  if (typeof data !== "object" || data === null) {
    return;
  }
  // 这个东西有点意思，等会再说
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  // 返回个实例就完事了
  return new Observer(data);
}
