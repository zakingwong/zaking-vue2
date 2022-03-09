import { initState } from "./state";
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    console.log(this, "this");
    vm.$options = options;
    initState(vm);
  };
}
