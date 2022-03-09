// 重写数组中的部分方法

let oldArrayProto = Array.prototype;

let newArrayProto = Object.create(oldArrayProto);

let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];

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

export default newArrayProto;