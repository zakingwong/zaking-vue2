import { complierToFcuntion } from "./complier/index";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./utils";
export function initMixin(Vue) {
  // 很简单，我们给Vue的原型上挂载了一个_init方法，以便我们可以在Vue类中执行。
  // 这里还要注意，整个Vue都是通过在类的实例上绑定方法来通信的，然后才可以在Vue的各个地方调用
  Vue.prototype._init = function (options) {
    const vm = this;
    // 在vm上绑定传入的options。
    // 这里的this.constructor.options，就是通过mixin方法，传入的options
    // options，就是new Vue时传入的那个
    vm.$options = mergeOptions(this.constructor.options, options);
    callHook(vm, "beforeCreated");
    // 然后再去初始化状态
    initState(vm);
    callHook(vm, "created");
    // 真正的挂载调用是$mount,记不记得我们使用Vue开发项目的时候，通常都会手动调用一下$mount?
    // 其实你不手动调用，传个el也行的。
    if (options.el) {
      vm.$mount(options.el);
    }
  };
  // 真正的挂载调用时机
  // 还是强调一下，你只有new Vue的时候，这个才会执行，不然只是实例上的一个方法罢了。
  Vue.prototype.$mount = function (el) {
    const vm = this;
    // 找el节点，也就是我们需要挂载的根节点
    el = document.querySelector(el);
    // 判断没有render函数的话，有的话这里没写，嘻嘻
    // 没有的话
    // 这就是各种判断，有没有传template参数，传了的话就优先使用template
    // 没传就使用传入的挂载的根节点的内容作为template
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
        // 然后传入template，通过complierToFcuntion方法，拿到render函数，注意这里的render是个真正的方法了
        const render = complierToFcuntion(template);
        // 放到vm.$options上
        ops.render = render;
      }
    }
    // 然后，开始挂载
    mountComponent(vm, el);
  };
}
