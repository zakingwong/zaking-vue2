import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;

// 每个属性有一个dep（属性就是被观察者），watcher就是观察者（属性变化了会通知观察者来更新）

class Watcher {
  // 不同的组件有不同得watcher，目前只有一个，渲染跟实例
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options; // 标识是一个渲染watcher
    this.getter = fn; // 意味着调用这个函数可以发生取值操作
    this.deps = []; // 后续实现计算属性和清理工作需要用到
    this.depsId = new Set();
    this.get();
  }
  // 一个视图对应多个属性，重复得属性也不用记录
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this); // watcher已经记住dep了，现在需要dep也记住watcher
    }
  }
  get() {
    pushTarget(this);
    this.getter();
    popTarget();
  }
  update() {
    queueWatcher(this);
    // this.get(); // 重新渲染
  }
  run() {
    this.get();
  }
}

let queue = [];
let has = {};
let pending = false;

function flushSchedulerQueue() {
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

// 需要给每一个属性增加一个dep，目的就是收集watcher
// 一个视图中，会有n个属性
// n个dep对应一个watcher
// 一个属性，对应多个视图，1个dep对应多个watcher
// 视图和属性是多对多得关系

export default Watcher;
