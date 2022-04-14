import { popTarget, pushTarget } from "./dep";

let id = 0;

class Watcher {
  constructor(vm, exprOrFn, options, cb) {
    this.id = id++;
    this.renderWatcher = options; // 标识是一个渲染watcher
    if (typeof exprOrFn === "string") {
      this.getter = function () {
        return vm[exprOrFn];
      };
    } else {
      this.getter = exprOrFn; // 意味着调用这个函数可以发生取值操作
    }
    this.deps = []; // 后续实现计算属性和清理工作需要用到
    this.depsId = new Set(); // 用来确定是否重复存储了dep
    this.lazy = options.lazy;
    this.dirty = this.lazy;
    this.vm = vm;
    this.user = options.user;
    this.cb = cb;
    this.value = this.lazy ? undefined : this.get();
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this); // watcher已经记住dep了，现在需要dep也记住watcher
    }
  }
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }
  get() {
    pushTarget(this);
    let value = this.getter.call(this.vm);
    popTarget();
    return value;
  }
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
  update() {
    if (this.lazy) {
      this.dirty = true;
    } else {
      queueWatcher(this);
    }
  }
  run() {
    let ov = this.value;
    let nv = this.get();
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
