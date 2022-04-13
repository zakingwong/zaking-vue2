let id = 0;
// 属性的dep要收集watcher
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 这里存放对应属性得watcher有哪些
  }
  // 用来记录watcher的方法
  addSub(watcher) {
    this.subs.push(watcher);
  }
  depend() {
    // 这里不希望放置重复得watcher
    // this.subs.push(Dep.target);
    // Dep.target是Watcher，所以Dep.target调用的是watcher的方法
    Dep.target.addDep(this);
  }
  // 触发watcher的更新
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}
Dep.target = null;

let stack = [];

export function pushTarget(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
}

export function popTarget(watcher) {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}
export default Dep;
