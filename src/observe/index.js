import newArrayProto from "./array";
class Observer {
  constructor(data) {
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
      console.log(item, "array-item");
      observe(item);
    });
  }
}

export function defineReactive(target, key, value) {
  console.log(key, "key");
  // 这里递归一下，如果value还是对象的话，oberve里面做了判断
  observe(value);
  // 这就好理解了，target就是data，
  // 我们给data上的属性做了defineProperty的绑定。
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
