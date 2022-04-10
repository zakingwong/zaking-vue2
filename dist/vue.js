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

  // 重写数组中的部分方法
  // 暂存真正数组原型对象
  var oldArrayProto = Array.prototype; //  依据真实的数组原型对象，创建一个对象

  var newArrayProto = Object.create(oldArrayProto); // 这些方法会修改原数组

  var methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    // 然后，我们在这个对象上的methods内的方法，
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 这个this是调用方法的那个数组
      // 执行我们自己的逻辑，并返回真正的方法调用的结果
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));

      var inserted; // 这个就是__ob__的作用了。可以在想要的，可以获取到实例的地方，调用observe

      var ob = this.__ob__;

      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;

        case "splice":
          inserted = args.slice(2);
      } // 我们只需要知道inserted，即新增的元素，绑定observe


      if (inserted) {
        ob.observeArray(inserted);
      }

      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // data.__ob__ = this;
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false
      }); // 如果是数组的话，要做特殊处理

      if (Array.isArray(data)) {
        // 重写数组的方法，7个变异方法，这些方法可以修改数组本身
        // 除了数组，数组内的引用类型也要劫持
        data.__proto__ = newArrayProto; // 需要保留数组原有的特性，并且可以重写部分方法
        // 这个observeArray，并不是真正的数组观测的地方，真正的触发观测，是使用newArrayProto的方法时。
        // 它只是为了继续观测数组的元素是否还是数组的情况

        this.observeArray(data);
      } else {
        // 走walk
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // walk就是循环data中的key，然后取绑定defineProperty
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
  }();

  function defineReactive(target, key, value) {
    // 这里递归一下，如果value还是对象的话，oberve里面做了判断
    observe(value); // 这就好理解了，target就是data，
    // 我们给data上的属性做了defineProperty的绑定。

    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(nv) {
        if (nv === value) {
          return;
        }

        observe(nv);
        value = nv;
      }
    });
  } // 接下来我们来看这个observe

  function observe(data) {
    // 这个不说了吧
    if (_typeof(data) !== "object" || data === null) {
      return;
    } // 这个东西有点意思，等会再说


    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    } // 返回个实例就完事了


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      // 我们再看初始化Data。后续这里还会有一堆初始化
      initData(vm);
    }
  } // 我们先来看proxy，其实啥也没干，就是通过defineProperty
  // 在vm实例上，绑定了_data，也就是data中的所有的属性，
  // 这样之后我们就可以直接在vm上拿到data中的数据了。
  // 这也是为什么我们在vue项目里，可以通过this.xxx拿到data中的xxx的原因了。
  // 我们来分析下proxy这个方法。
  // 我们传入的是vm，_data,以及_data中的key

  function proxy(vm, target, key) {
    // 此时，我们给vm上绑定key
    Object.defineProperty(vm, key, {
      // 那么我们取值的时候，实际上是取得vm._data[key]上的值
      get: function get() {
        return vm[target][key];
      },
      set: function set(nv) {
        // 我们设置值得时候，实际上也是给vm._data[key]上，设置值
        // 这样，我们就形成了vm.xxx实际上是vm._data.xxx得代理
        // 修改实例上中data内的属性，实际上就是修改了vm._data中的属性
        vm[target][key] = nv;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data; // 这里做了一个有趣的事情，也就是说，你可以在data中有一个参数，这个参数就是vm
    // 但是，会有一些神奇的事情，比如，你打印vm.name是undefined，打印vm却是有的。
    // 这是为啥呢？
    // 继续说，这里的data.call。就执行了data()方法，但是执行的时候，下面的observe和proxy都没执行呢，所以vm上肯定没有属性吖。
    // 如果data是函数，那么就执行下，把它赋值给data变量。

    data = typeof data === "function" ? data.call(vm, vm) : data;
    vm._data = data; // 然后，我们通过observe来观测它

    observe(data); // 然后，我们通过proxy，在vm上，绑定data中的属性

    for (var key in data) {
      proxy(vm, "_data", key);
    }
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
      // 开始要创建一个AST对象
      var node = createASTElement(tag, attrs);

      if (!root) {
        // 是否是空树
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
    } // 如果匹配到尾标签了，说明需要清楚栈中存储的对象，这样我们就完成了一个标签的匹配


    function end() {
      stack.pop();
      currentParent = stack[stack.length - 1];
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      // 匹配标签的开始
      var start = html.match(startTagOpen); // 如果存在的话，就放到这样的一个对象里

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        }; // 需要删除掉匹配到的部分，匹配一部分就删除一部分

        advance(start[0].length); // 如果不是开始标签的结束，就一直匹配下去

        var attr, _end; // 匹配属性


        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          }); // 去下空格，感觉这样不太好，但是功能达到了，嘻嘻

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
      var textEnd = html.indexOf("<"); // 如果textEnd是0，说明是一个开始标签或是一个结束标签

      if (textEnd === 0) {
        // 这个就是通过正则，来匹配目标字符串了
        var startTagMatch = parseStartTag(); // 如果存在的话，那么跳过此次循环，获取到对应的标签名和属性

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // 匹配尾部标签


        var endTagMatch = html.match(endTag); // 同样的

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      } // 如果textEnd大于0，说明就是文本的结束位置
      // 匹配文本


      if (textEnd > 0) {
        var text = html.substring(0, textEnd);

        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }

    console.log(root, "root");
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
    // 将template转换成ast
    var ast = parseHTML(template); //生成render方法，返回虚拟DOM

    var code = codegen(ast); // 这里，通过with，让其内部的字符串适用this

    code = "with(this){return ".concat(code, "}"); // 生成真正的函数

    var render = new Function(code);
    return render;
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

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text; // 判断tag是不是字符串，因为如果是文本的话，是没有tag属性的

    if (typeof tag === "string") {
      // 创建DOM
      vnode.el = document.createElement(tag); // 挂载DOM上的属性

      patchProps(vnode.el, data); // 循环子节点

      children.forEach(function (child) {
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
    for (var key in props) {
      // 特殊处理下style
      if (key === "style") {
        for (var styleName in props[key]) {
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
    var isRealElement = oldVNode.nodeType;
    console.log(isRealElement, "isReal");

    if (isRealElement) {
      // 这个就是我们的div#app
      var elm = oldVNode; // 这个就是body了

      var parentElm = elm.parentNode; // 我们使用createElm方法，把我们已经构建好的vnode对象，生成真正的DOM，

      var newElm = createElm(vnode); // 并且把它插入到跟div#app同级，其实就是body里拉

      parentElm.insertBefore(newElm, elm.nextSibling); // 然后移除那个div#app就好了

      parentElm.removeChild(elm);
      return newElm;
    }
  }

  function initLifeCycle(Vue) {
    // 这个方法用来创建真正的DOM
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el; // patch才是真正执行渲染挂载DOM的地方

      console.log(vnode, "vnode");
      vm.$el = patch(el, vnode);
    }; // 创建标签节点VNode


    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // 创建文本节点VNode


    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // 创建纯内容


    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    }; // 执行render函数，并把render里的this通过call方法指向vm
    // 这样，我们生成的render函数内部就可以使用vm上的_c,_v,_s方法啥的了


    Vue.prototype._render = function () {
      var vm = this;
      return vm.$options.render.call(vm);
    };
  } // 触发mount的外围方法

  function mountComponent(vm, el) {
    // 调用render方法，产生虚拟节点
    // 根据虚拟DOM生成真实DOM
    // 插入到el中
    vm.$el = el;

    vm._update(vm._render());
  }

  function initMixin(Vue) {
    // 很简单，我们给Vue的原型上挂载了一个_init方法，以便我们可以在Vue类中执行。
    // 这里还要注意，整个Vue都是通过在类的实例上绑定方法来通信的，然后才可以在Vue的各个地方调用
    Vue.prototype._init = function (options) {
      var vm = this; // 在vm上绑定传入的options。

      vm.$options = options; // 然后再去初始化状态

      initState(vm); // 真正的挂载调用是$mount,记不记得我们使用Vue开发项目的时候，通常都会手动调用一下$mount?
      // 其实你不手动调用，传个el也行的。

      if (options.el) {
        vm.$mount(options.el);
      }
    }; // 真正的挂载调用时机
    // 还是强调一下，你只有new Vue的时候，这个才会执行，不然只是实例上的一个方法罢了。


    Vue.prototype.$mount = function (el) {
      var vm = this; // 找el节点，也就是我们需要挂载的根节点

      el = document.querySelector(el); // 判断没有render函数的话，有的话这里没写，嘻嘻
      // 没有的话
      // 这就是各种判断，有没有传template参数，传了的话就优先使用template
      // 没传就使用传入的挂载的根节点的内容作为template

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
          // 然后传入template，通过complierToFcuntion方法，拿到render函数，注意这里的render是个真正的方法了
          var render = complierToFcuntion(template); // 放到vm.$options上

          ops.render = render;
        }
      } // 然后，开始挂载


      mountComponent(vm, el);
    };
  }

  // 所以，注意这里，我们声明了一个Vue，但是，此时并没有执行new Vue。注意，我说的此时，就是js引擎执行到这里的时候。

  function Vue(options) {
    // 这个this，指的的vm，也就是Vue的实例
    this._init(options);
  } // 所以，在这里，我们引入了initMixin，并且执行了initMixin。那么我们去initMixin中看下它干了啥


  initMixin(Vue); // 首先啊，我们通过initLifeCycle给Vue类上绑定一些方法

  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
