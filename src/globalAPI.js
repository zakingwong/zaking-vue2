import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
  // 这里，挂载到Vue类上的options实际上，全都是通过调用Vue.mixin方法的options
  Vue.options = {};
  Vue.mixin = function (mixin) {
    // 这里的this，当然就是指Vue实例
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
