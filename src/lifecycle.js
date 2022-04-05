import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom/index";

function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    vnode.el = document.createElement(tag);
    patchProps(vnode.el, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function patchProps(el, props) {
  for (let key in props) {
    if (key === "style") {
      for (let styleName in props[key]) {
        el.style[styleName] = props.style[styleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode;
    const parentElm = elm.parentNode;
    let newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextSibling);
    parentElm.removeChild(elm);
    return newElm;
  } else {
    // diff
  }
}

export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;
    vm.$el = patch(el, vnode);
  };

  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };

  Vue.prototype._render = function () {
    const vm = this;
    return vm.$options.render.call(vm);
  };
}
export function mountComponent(vm, el) {
  // 调用render方法，产生虚拟节点
  // 根据虚拟DOM生成真实DOM
  // 插入到el中
  vm.$el = el;
  const updateComponent = () => {
    vm._update(vm._render());
  };
  new Watcher(vm, updateComponent, true); // 用true标识是渲染watcher
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
