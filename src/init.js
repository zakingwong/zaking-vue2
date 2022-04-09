import { initState } from "./state";
export function initMixin(Vue) {
  // 很简单，我们给Vue的原型上挂载了一个_init方法，以便我们可以在Vue类中执行。
  // 这里还要注意，整个Vue都是通过在类的实例上绑定方法来通信的，然后才可以在Vue的各个地方调用
  Vue.prototype._init = function (options) {
    const vm = this;
    // 在vm上绑定传入的options。
    vm.$options = options;
    // 然后再去初始化状态
    initState(vm);
  };
}
