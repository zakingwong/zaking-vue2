import { initState } from "./state";
import { complierToFcuntion } from "./complier/index";
import { callHook, mountComponent } from "./lifecycle";
import { mergeOptions } from "./utils";
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = mergeOptions(this.constructor.options, options);
    console.log(vm.$options);
    callHook(vm, "beforeCreated");
    initState(vm);
    callHook(vm, "created");
    if (options.el) {
      vm.$mount(options.el);
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    let ops = vm.$options;
    if (!ops.render) {
      let template;
      if (!ops.template && el) {
        template = el.outerHTML;
      } else {
        if (el) {
          template = ops.template;
        }
      }
      if (template && el) {
        const render = complierToFcuntion(template);
        ops.render = render;
      }
    }
    mountComponent(vm, el);
  };
}
