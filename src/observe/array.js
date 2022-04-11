// 重写数组中的部分方法
// 暂存真正数组原型对象
let oldArrayProto = Array.prototype;

//  依据真实的数组原型对象，创建一个对象
let newArrayProto = Object.create(oldArrayProto);

// 这些方法会修改原数组
let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];

methods.forEach((method) => {
  // 然后，我们在这个对象上的methods内的方法，
  newArrayProto[method] = function (...args) {
    // 这个this是调用方法的那个数组
    // 执行我们自己的逻辑，并返回真正的方法调用的结果
    const result = oldArrayProto[method].call(this, ...args);

    let inserted;
    // 这个就是__ob__的作用了。可以在想要的，可以获取到实例的地方，调用observe
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
    // 我们只需要知道inserted，即新增的元素，绑定observe
    if (inserted) {
      ob.observeArray(inserted);
    }
    return result;
  };
});

export default newArrayProto;
