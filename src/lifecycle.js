import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom/index";

function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  // 判断tag是不是字符串，因为如果是文本的话，是没有tag属性的
  if (typeof tag === "string") {
    // 创建DOM
    vnode.el = document.createElement(tag);
    // 挂载DOM上的属性
    patchProps(vnode.el, data);
    // 循环子节点
    children.forEach((child) => {
      // 插入递归生成的子节点
      vnode.el.appendChild(createElm(child));
    });
  } else {
    // 如果是文本节点，直接创建赋值就好了
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function patchProps(el, props) {
  // 就是循环属性绑定就好了，都是原生的方法
  for (let key in props) {
    // 特殊处理下style
    if (key === "style") {
      for (let styleName in props[key]) {
        console.log(props.style[styleName], "props.style[styleName]");
        console.log(styleName, "styleName");
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function patch(oldVNode, vnode) {
  // 第一次渲染的时候，oldVNode是真实的DOM元素，也就是我们传入的el。
  // 真实的DOM元素会有nodeType属性，而我们自己定义的VNode对象是没有的
  // 所以我们可以据此判断是否是首次挂载
  const isRealElement = oldVNode.nodeType;
  console.log(isRealElement, "isReal");
  if (isRealElement) {
    // 这个就是我们的div#app
    const elm = oldVNode;
    // 这个就是body了
    const parentElm = elm.parentNode;
    // 我们使用createElm方法，把我们已经构建好的vnode对象，生成真正的DOM，
    let newElm = createElm(vnode);
    // 并且把它插入到跟div#app同级，其实就是body里拉
    parentElm.insertBefore(newElm, elm.nextSibling);
    // 然后移除那个div#app就好了
    parentElm.removeChild(elm);
    return newElm;
  } else {
    // diff
    // 那不是第一次挂载的话，就要走我们的diff算法了，这个我们后面再说
  }
}

export function initLifeCycle(Vue) {
  // 这个方法用来创建真正的DOM
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;
    // patch才是真正执行渲染挂载DOM的地方
    console.log(vnode, "vnode");
    vm.$el = patch(el, vnode);
  };
  // 创建标签节点VNode
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  // 创建文本节点VNode
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  // 创建纯内容
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };
  // 执行render函数，并把render里的this通过call方法指向vm
  // 这样，我们生成的render函数内部就可以使用vm上的_c,_v,_s方法啥的了
  Vue.prototype._render = function () {
    const vm = this;
    return vm.$options.render.call(vm);
  };
}
// 触发mount的外围方法
export function mountComponent(vm, el) {
  // 调用render方法，产生虚拟节点
  // 根据虚拟DOM生成真实DOM
  // 插入到el中
  vm.$el = el;
  const updateComponent = () => {
    console.log("---");
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, true); // 用true标识是渲染watcher
}
