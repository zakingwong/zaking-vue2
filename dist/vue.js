(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  var startTagClose = /^\s*(\/?)>/;
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = [];
    var currentParent;
    var root;

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    function start(tag, attrs) {
      var node = createASTElement(tag, attrs);

      if (!root) {
        root = node; // 如果是root得话那么当前的节点就是根节点
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
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
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
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
          match.attrs.forEach(function (item) {
            item.name = item.name.replace(/\s+/g, "");
            item.value = item.value.replace(/\s+/g, "");
          });
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false;
    }

    while (html) {
      var textEnd = html.indexOf("<");

      if (textEnd === 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd);

        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }

    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function genProps(attrs) {
    var str = "";

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === "style") {
        (function () {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  }

  function genChildren(children) {
    if (children) {
      return children.map(function (child) {
        return gen(child);
      }).join(",");
    }
  }

  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length ? genProps(ast.attrs) : "null").concat(ast.children.length ? ",".concat(children) : "", ")");
    return code;
  }

  function complierToFcuntion(template) {
    var ast = parseHTML(template);
    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code);
    return render;
  }

  var strats = {};
  var LIFECYCLE = ["beforeCreate", "created"];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        if (p) {
          return p.concat(c);
        } else {
          return [c];
        }
      } else {
        return p;
      }
    };
  });
  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key];
      }
    }

    return options;
  }

  function initGlobalAPI(Vue) {
    Vue.options = {};

    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = []; // 这里存放对应属性得watcher有哪些
    }

    _createClass(Dep, [{
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null; // 5.1 先修改下dep，把存watcher的结构维护成一个栈
  // dep记住的watcher，我们来维护一个栈结构
  // 一个dep，可能会跟多个不同的watcher关联

  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget(watcher) {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = options; // 标识是一个渲染watcher
      // watch.1-1.2
      // 如果是字符串就变成函数好了，没了

      if (typeof exprOrFn === "string") {
        this.getter = function () {
          return vm[exprOrFn];
        };
      } else {
        this.getter = exprOrFn; // 意味着调用这个函数可以发生取值操作
      }

      this.deps = []; // 后续实现计算属性和清理工作需要用到

      this.depsId = new Set(); // 用来确定是否重复存储了dep

      this.lazy = options.lazy; // 5.3.1

      this.dirty = this.lazy; // 5.3.1

      this.vm = vm;
      this.user = options.user; // watch.1-1.3，标识是否是用户自己的watch

      this.cb = cb; // watch.1-1.4，把老值存起来

      this.value = this.lazy ? undefined : this.get(); // 5.3.1 如果是true的话就不执行咯
    }

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住dep了，现在需要dep也记住watcher
        }
      } // 计算属性触发执行回调

    }, {
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get();
        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this);
        var value = this.getter.call(this.vm);
        popTarget(); // 把值返回，就获得到了用户定义的computed的值

        return value;
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend();
        }
      }
    }, {
      key: "update",
      value: function update() {
        // 如果是计算属性的值变化了，就标识它脏了，下一次获取，要重新计算，不走缓存的value了
        if (this.lazy) {
          this.dirty = true;
        } else {
          queueWatcher(this);
        }
      }
    }, {
      key: "run",
      value: function run() {
        var ov = this.value; // 通过this.value就能拿到老值了

        var nv = this.get(); // watch.1-1.4，再更新，我们就拿到了新值

        if (this.user) {
          this.cb.call(this.vm, nv, ov);
        }

        this.get();
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {};
  var pending = false;

  function flushSchedulerQueue() {
    console.log("notify");
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;

      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    });
  }

  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks);
    };
  }

  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      timerFunc(); // Promise.resolve().then(flushCallbacks);
      // setTimeout(() => {
      //   flushCallbacks();
      // }, 0);

      waiting = true;
    }
  }

  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (data === null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  }
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function isSameVnode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === "string") {
      vnode.el = document.createElement(tag);
      patchProps(vnode.el, {}, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // 老的属性中有，新的没有，要删除掉老的。
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};

    for (var key in oldStyles) {
      if (!newStyles[key]) {
        el.style[key] = "";
      }
    }

    for (var _key in oldProps) {
      if (!props[_key]) {
        el.removeAttribute(_key);
      }
    }

    for (var _key2 in props) {
      if (_key2 === "style") {
        for (var styleName in props[_key2]) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    var isRealElement = oldVNode.nodeType;

    if (isRealElement) {
      var elm = oldVNode;
      var parentElm = elm.parentNode;
      var newElm = createElm(vnode);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      return newElm;
    } else {
      // diff
      // 1.两个节点不是同一个节点，没有比对，直接把老的换成新的
      // 2.两个节点是同一个节点，判断节点的tag和节点的key
      // 比较两个节点的属性是否有差异，复用老的节点，将差异的属性更新
      // 3.节点比较完毕后就需要比较两个人的子节点
      return patchVnode(oldVNode, vnode);
    }
  }

  function patchVnode(oldVNode, vnode) {
    if (!isSameVnode(oldVNode, vnode)) {
      var _el = createElm(vnode);

      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    }

    var el = vnode.el = oldVNode.el; // 复用老节点的元素

    if (!oldVNode.tag) {
      // 是文本的话
      if (oldVNode.text !== vnode.text) {
        el.textContent = vnode.text;
      }
    } // 是标签，我们需要比对标签的属性


    patchProps(el, oldVNode.data, vnode.data); // 比较儿子节点
    // 一方有，一方没有
    // 两方都有

    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 完整的diff算法，需要比较两个
      updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      // 没有老的，有新的
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      // 新的没有，老的有，要删除
      unmountChildren(el);
    }

    return el;
  }

  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function unmountChildren(el, oldChildren) {
    el.innerHTML = "";
  }

  function updateChildren(el, oldChildren, newChildren) {
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];

    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }

    var map = makeIndexByKey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode);
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode);
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else {
        var moveIndex = map[newStartVnode.key];

        if (moveIndex !== undefined) {
          var moveVnode = oldChildren[moveIndex];
          el.insertBefore(moveVnode.el, oldStartVnode.el);
          oldChildren[moveIndex] = undefined;
          patchVnode(moveVnode, newStartVnode);
        } else {
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        }

        newStartVnode = newChildren[++newStartIndex];
      }
    }

    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]);
        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
        el.insertBefore(childEl, anchor);
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i].el) {
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el;
      vm.$el = patch(el, vnode);
    };

    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    };

    Vue.prototype._render = function () {
      var vm = this;
      return vm.$options.render.call(vm);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el;

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, true);
  }
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));

      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
      }

      if (inserted) {
        ob.observeArray(inserted);
      } // 5.3.3
      // 数组变化了，通知对应的watch实现更新


      ob.dep.notify();
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 5.3.1
      this.dep = new Dep(); // data.__ob__ = this;

      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false
      });

      if (Array.isArray(data)) {
        data.__proto__ = newArrayProto;
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          observe(item);
        });
      }
    }]);

    return Observer;
  }(); // 递归多了性能肯定会很差


  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  function defineReactive(target, key, value) {
    // 5.3.2
    // 对所有的对象都进行属性劫持，childOb.dep用来收集依赖
    var childOb = observe(value);
    var dep = new Dep();
    Object.defineProperty(target, key, {
      get: function get() {
        if (Dep.target) {
          dep.depend(); // 让这个属性得收集器记住这个watcher

          if (childOb) {
            childOb.dep.depend(); // 让数组和对象本身也实现依赖收集
            // 让数组内的数组，再做一层依赖收集

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(nv) {
        if (nv === value) {
          return;
        }

        observe(nv);
        value = nv;
        dep.notify();
      }
    });
  }
  function observe(data) {
    if (_typeof(data) !== "object" || data === null) {
      return;
    }

    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }

    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) {
      // 在这里开始，初始化Computed的工作
      initComputed(vm);
    } // watch.1


    if (opts.watch) {
      initWatch(vm);
    }
  }

  function initWatch(vm) {
    var watch = vm.$options.watch;

    for (var key in watch) {
      var handler = watch[key]; // 可能是字符串，数组，函数
      // 如果是数组的话，循环一下就好了

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  } // 给每个实例上增加的属性和对应的处理函数


  function createWatcher(vm, key, handler) {
    if (typeof handler === "string") {
      handler = vm[handler];
    }

    return vm.$watch(key, handler);
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(nv) {
        vm[target][key] = nv;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === "function" ? data.call(vm, vm) : data;
    vm._data = data;
    observe(data);

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  } // 5.2 初始化computed
  // 计算属性本身不收集依赖，只会让自己内部绑定的属性去收集依赖


  function initComputed(vm) {
    var computed = vm.$options.computed; // 5.4 把watcher存起来，后面会用到，存到vm上，在createComputedGetter中会用到

    var watchers = vm._computedWatchers = {}; // 遍历computed中的计算属性

    for (var key in computed) {
      // userDef就是computed中的每一个计算属性
      var userDef = computed[key]; // 我们判断一下是函数还是对象，如果是函数的话，那么就直接用函数，如果是对象的话，就用对象的get方法

      var fn = typeof userDef === "function" ? userDef : userDef.get; // 5.3 我们进入到watcher里
      // 这里，之前我们使用Watcher的时候，一旦new了，就会立即执行回调，这里我们肯定不希望computed的watcher立即执行get。
      // 所以，我们要额外的传入一个参数，lazy，表示不需要new的时候就立即执行

      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      }); // 5.2.x 这是中间阶段的方式，如果是对象的形式，直接把get和set传给defineProterty。如果是函数，会做简单的处理
      // 但是这样会有很大的问题，大家可以自己试一下
      // defineComputed(vm, key, fn, userDef); //2.x

      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(target, key, userDef) {
    // function defineComputed(target, key, userDef) { //2.x
    var setter = userDef.set || function () {};

    Object.defineProperty(target, key, {
      // get: fn, //2.x
      get: createComputedGetter(key),
      set: setter
    });
  }

  function createComputedGetter(key) {
    return function () {
      var watcher = this._computedWatchers[key];

      if (watcher.dirty) {
        // 5.5 第一次取值后，dirty就会变为false，下一次就不会再走evaluate了
        watcher.evaluate();
      } // 5.6 计算属性出栈后，还要让计算属性watcher里面的属性，去绑定上一层的watcher


      if (Dep.target) {
        watcher.depend();
      } // 这个时候执行完watcher.evaluate，watcher上已经有了value，返回即可


      return watcher.value;
    };
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick; // watch.1-1,最终的核心就是这个方法

    Vue.prototype.$watch = function (exprOrFn, cb) {
      // exprOrFn：
      // name 或者是 () => name，我们去Watcher里处理，user代表是用户创建的
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = mergeOptions(this.constructor.options, options);
      callHook(vm, "beforeCreated");
      initState(vm);
      callHook(vm, "created");

      if (options.el) {
        vm.$mount(options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;

      if (!ops.render) {
        var template;

        if (!ops.template && el) {
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template;
          }
        }

        if (template && el) {
          var render = complierToFcuntion(template);
          ops.render = render;
        }
      }

      mountComponent(vm, el);
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);
  initLifeCycle(Vue);
  initGlobalAPI(Vue);
  initStateMixin(Vue);
  var render1 = complierToFcuntion("<ul key=\"x\" style=\"color:red;\">\n    <li key=\"a\">a</li>\n    <li key=\"b\">b</li>\n    <li key=\"c\">c</li>\n    <li key=\"d\">d</li>\n  </ul>");
  var vm1 = new Vue({
    data: {
      name: "zaking"
    }
  });
  var prevVNode = render1.call(vm1);
  var render2 = complierToFcuntion("<ul key=\"x\" style=\"background:blue;\">\n    <li key=\"b\">b</li>\n    <li key=\"m\">m</li>\n    <li key=\"a\">a</li>\n    <li key=\"p\">p</li>\n    <li key=\"c\">c</li>\n    <li key=\"q\">q</li>\n</ul>");
  var vm2 = new Vue({
    data: {
      name: "wong"
    }
  });
  var nextVNode = render2.call(vm2);
  var el = createElm(prevVNode);
  document.body.appendChild(el);
  createElm(nextVNode);
  setTimeout(function () {
    // el.parentNode.replaceChild(newEl, el);
    patch(prevVNode, nextVNode);
  }, 1000);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
