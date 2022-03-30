import Dep from "./dep";

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
    Dep.target = this;
    this.getter();
    Dep.target = null;
  }
  update() {
    this.get(); // 重新渲染
  }
}

// 需要给每一个属性增加一个dep，目的就是收集watcher
// 一个视图中，会有n个属性
// n个dep对应一个watcher
// 一个属性，对应多个视图，1个dep对应多个watcher
// 视图和属性是多对多得关系

export default Watcher;
