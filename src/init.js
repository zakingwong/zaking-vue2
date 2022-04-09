import { initState } from "./state";
import { complierToFcuntion } from "./complier/index";
import { mountComponent } from "./lifecycle";
export function initMixin(Vue) {
  // 很简单，我们给Vue的原型上挂载了一个_init方法，以便我们可以在Vue类中执行。
  // 这里还要注意，整个Vue都是通过在类的实例上绑定方法来通信的，然后才可以在Vue的各个地方调用
  Vue.prototype._init = function (options) {
    const vm = this;
    // 在vm上绑定传入的options。
    vm.$options = options;
    // 然后再去初始化状态
    initState(vm);
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
