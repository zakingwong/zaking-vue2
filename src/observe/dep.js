let id = 0;
// 属性的dep要收集watcher
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 这里存放对应属性得watcher有哪些
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  depend() {
    // 这里不希望放置重复得watcher
    // this.subs.push(Dep.target);
    Dep.target.addDep(this);
  }
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
}

export default Dep;
