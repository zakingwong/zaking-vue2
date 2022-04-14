import { popTarget, pushTarget } from "./dep";

let id = 0;

class Watcher {
  constructor(vm, exprOrFn, options, cb) {
    this.id = id++;
    this.renderWatcher = options; // 标识是一个渲染watcher
    // watch.1-1.2
    // 如果是字符串就变成函数好了，没了
    if (typeof exprOrFn === "string") {
      this.getter = function () {
        return vm[exprOrFn];
      };
    } else {
      this.getter = exprOrFn; // 意味着调用这个函数可以发生取值操作
    }
    this.deps = []; // 后续实现计算属性和清理工作需要用到
    this.depsId = new Set(); // 用来确定是否重复存储了dep
    this.lazy = options.lazy; // 5.3.1
    this.dirty = this.lazy; // 5.3.1
    this.vm = vm;
    this.user = options.user; // watch.1-1.3，标识是否是用户自己的watch
    this.cb = cb;
    // watch.1-1.4，把老值存起来
    this.value = this.lazy ? undefined : this.get(); // 5.3.1 如果是true的话就不执行咯
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this); // watcher已经记住dep了，现在需要dep也记住watcher
    }
  }
  // 计算属性触发执行回调
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }
  get() {
    pushTarget(this);
    let value = this.getter.call(this.vm);
    popTarget();
    // 把值返回，就获得到了用户定义的computed的值
    return value;
  }
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
  update() {
    // 如果是计算属性的值变化了，就标识它脏了，下一次获取，要重新计算，不走缓存的value了
    if (this.lazy) {
      this.dirty = true;
    } else {
      queueWatcher(this);
    }
  }
  run() {
    let ov = this.value; // 通过this.value就能拿到老值了
    let nv = this.get(); // watch.1-1.4，再更新，我们就拿到了新值
    if (this.user) {
      this.cb.call(this.vm, nv, ov);
    }
    this.get();
  }
}

let queue = [];
let has = {};
let pending = false;

function flushSchedulerQueue() {
  console.log("notify");
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach((q) => q.run());
}

function queueWatcher(watcher) {
  const id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    if (!pending) {
      nextTick(flushSchedulerQueue, 0);
      pending = true;
    }
  }
}

let callbacks = [];
let waiting = false;
function flushCallbacks() {
  let cbs = callbacks.slice(0);
  waiting = false;
  callbacks = [];
  cbs.forEach((cb) => cb());
}

let timerFunc;
if (Promise) {
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  };
} else if (MutationObserver) {
  let observer = new MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => {
    textNode.textContent = 2;
  };
} else if (setImmediate) {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  };
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks);
  };
}
export function nextTick(cb) {
  callbacks.push(cb);
  if (!waiting) {
    timerFunc();
    // Promise.resolve().then(flushCallbacks);
    // setTimeout(() => {
    //   flushCallbacks();
    // }, 0);
    waiting = true;
  }
}
export default Watcher;
