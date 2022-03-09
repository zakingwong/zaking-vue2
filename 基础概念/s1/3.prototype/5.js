console.log(typeof this);
console.log(this instanceof Object);
console.log(this.__proto__ === null);
console.log(this.__proto__ === Object.prototype);
console.log(Object.prototype.__proto__ === null);
console.log(this.__proto__.__proto__ === null);
console.log(Object.prototype.prototype);
