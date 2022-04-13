function newArrayProto() {
  let oldArrayProto = [];

  let newArrayProto = Object.create(oldArrayProto);
  console.log(newArrayProto, "newArrayProto");
  let methods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice",
  ];
  methods.forEach((method) => {
    newArrayProto[method] = function (...args) {
      const result = oldArrayProto[method].call(this, ...args);

      let inserted;
      let ob = this.__ob__;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;

          break;
        case "splice":
          inserted = args.slice(2);
        default:
          break;
      }
      if (inserted) {
        ob.observeArray(inserted);
      }
      return result;
    };
  });
  return newArrayProto;
}

class Observer {
  constructor(data) {
    console.log(this, "this");
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false,
    });
    // data.__ob__ = this;
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto();
      console.log(data.__proto__);
      this.observeArray(data);
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    data.forEach((item) => observe(item));
  }
}

function defineReactive(target, key, value) {
  observe(value);

  Object.defineProperty(target, key, {
    get() {
      return value;
    },
    set(nv) {
      if (nv === value) {
        return;
      }
      observe(nv);
      value = nv;
    },
  });
}

function observe(data) {
  if (typeof data !== "object" || data === null) {
    return;
  }
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  return new Observer(data);
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(nv) {
      vm[target][key] = nv;
    },
  });
}

// 模板解析成AST
function parseHTML(html) {
  const attribute =
    /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
  const startTagOpen = new RegExp(`^<${qnameCapture}`);
  const startTagClose = /^\s*(\/?)>/;
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
  // 分割线
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = [];
  let currentParent;
  let root;
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }
  function start(tag, attrs) {
    let node = createASTElement(tag, attrs);
    if (!root) {
      // 是否是空树
      root = node; // 如果是额话那么当前的节点就是根节点
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }

    stack.push(node);
    currentParent = node;
  }
  function chars(text) {
    text = text.replace(/\s/g, "");
    currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent,
    });
  }
  function end() {
    stack.pop();
    currentParent = stack[stack.length - 1];
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      // 如果不是开始标签的结束，就一直匹配下去
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      if (end) {
        advance(end[0].length);
      }
      return match;
    }

    return false;
  }
  while (html) {
    let textEnd = html.indexOf("<");
    // 如果textEnd是0，说明是一个开始标签或是一个结束标签
    // 如果textEnd大于0，说明就是文本的结束位置
    if (textEnd === 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd);
      if (text) {
        chars(text);
        advance(text.length);
      }
    }
  }
  return root;
}

// AST解析成render
function complierToFcuntion(template) {
  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  // 分割线
  function genProps(attrs) {
    let str = "";
    for (let i = 0; i < attrs.length; i++) {
      let attr = attrs[i];
      if (attr.name === "style") {
        let obj = {};
        attr.value.split(";").forEach((item) => {
          let [key, value] = item.split(":");
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }
    return `{${str.slice(0, -1)}}`;
  }

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      let text = node.text;
      if (!defaultTagRE.test(text)) {
        return `_v(${JSON.stringify(text)})`;
      } else {
        let tokens = [];
        let match;
        defaultTagRE.lastIndex = 0;
        let lastIndex = 0;
        while ((match = defaultTagRE.exec(text))) {
          let index = match.index;
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          tokens.push(`_s(${match[1].trim()})`);
          lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return `_v(${tokens.join("+")})`;
      }
    }
  }

  function genChildren(children) {
    if (children) {
      return children.map((child) => gen(child)).join(",");
    }
  }

  function codegen(ast) {
    let children = genChildren(ast.children);
    let code = `_c('${ast.tag}',${
      ast.attrs.length ? genProps(ast.attrs) : "null"
    }${ast.children.length ? `,${children}` : ""})`;
    return code;
  }
  // 又一个分割线
  // 将template转换成ast
  let ast = parseHTML(template);
  //生成render方法，返回虚拟DOM
  let code = codegen(ast);
  code = `with(this){return ${code}}`;
  let render = new Function(code);
  return render;
}
// 创建vnode
function createElementVNode(vm, tag, data = {}, ...children) {
  if (data === null) {
    data = {};
  }
  let key = data.key;
  if (key) {
    delete data.key;
  }
  return vnode(vm, tag, key, data, children);
}

function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
  };
}
// 简单说就是给Vue得原型上绑定一些方法
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
function initLifeCycle(Vue) {
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

function mountComponent(vm, el) {
  // 调用render方法，产生虚拟节点
  // 根据虚拟DOM生成真实DOM
  // 插入到el中
  vm.$el = el;
  vm._update(vm._render());
}

function Vue(options) {
  const vm = this;
  vm.$options = options;
  const opts = vm.$options;
  if (opts.data) {
    let data = vm.$options.data;
    data = typeof data === "function" ? data.call(vm, vm) : data;
    vm._data = data;
    observe(data);
    for (let key in data) {
      proxy(vm, "_data", key);
    }
  }
  if (options.el) {
    vm.$mount(options.el);
  }
}

function init(Vue) {
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

init(Vue);
initLifeCycle(Vue);
// 所以其实你看这些，我就是拼凑了一下
// 看不看这个都行
// 但是基础不好的基础概念一定要看
