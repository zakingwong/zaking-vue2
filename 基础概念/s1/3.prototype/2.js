function Cat() {}
Cat.prototype = {
  food: "fish",
  say: function () {
    console.log("I love " + this.food);
  },
};
var blackCat = new Cat();
console.log(blackCat.__proto__);
console.log(blackCat.__proto__.say === Cat.prototype.say);
console.log(blackCat, "blackCat");
blackCat.say();
var whiteDog = { food: "bone" };
blackCat.say.call(whiteDog);
