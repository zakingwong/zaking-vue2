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
          console.log(item, "array-item");
          observe(item);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(target, key, value) {
    console.log(key, "key"); // 这里递归一下，如果value还是对象的话，oberve里面做了判断

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

  function initMixin(Vue) {
    // 很简单，我们给Vue的原型上挂载了一个_init方法，以便我们可以在Vue类中执行。
    // 这里还要注意，整个Vue都是通过在类的实例上绑定方法来通信的，然后才可以在Vue的各个地方调用
    Vue.prototype._init = function (options) {
      var vm = this; // 在vm上绑定传入的options。

      vm.$options = options; // 然后再去初始化状态

      initState(vm);
    };
  }

  // 所以，注意这里，我们声明了一个Vue，但是，此时并没有执行new Vue。注意，我说的此时，就是js引擎执行到这里的时候。

  function Vue(options) {
    // 这个this，指的的vm，也就是Vue的实例
    this._init(options);
  } // 所以，在这里，我们引入了initMixin，并且执行了initMixin。那么我们去initMixin中看下它干了啥


  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
