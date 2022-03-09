function newArrayProto() {
  let oldArrayProto = Array.prototype;
  let newArrayProto = Object.create(oldArrayProto);
  let method = "push";
  newArrayProto[method] = function (...args) {
    const result = oldArrayProto[method].call(this, ...args);
    let inserted = args;
    console.log(inserted, "inserted");
    return result;
  };
  return newArrayProto;
}
const data = ["1", "2", "3"];
data.__proto__ = newArrayProto();
console.log(data);
data.push("1");
console.log(data);
