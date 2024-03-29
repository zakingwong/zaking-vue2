let id = 0;
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 这里存放对应属性得watcher有哪些
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  depend() {
    Dep.target.addDep(this);
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}
Dep.target = null;
// 5.1 先修改下dep，把存watcher的结构维护成一个栈
// dep记住的watcher，我们来维护一个栈结构
// 一个dep，可能会跟多个不同的watcher关联
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
