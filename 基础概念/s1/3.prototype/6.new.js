function myNew(construct) {
  var obj = {};
  obj.__proto__ = construct.prototype;
  construct.call(obj);
  return obj;
}

function A() {}
A.prototype.m = 1;
var a = myNew(A);
console.log(a.m);
console.log(a.__proto__ === A.prototype);

function myFn() {
  console.log(1);
  console.log(this);
}

const b = new myFn();
console.log(b.__proto__ === myFn.prototype);
