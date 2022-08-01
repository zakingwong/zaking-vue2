const Vue = require("vue");
const VueServerRenderer = require("vue-server-renderer");
const Koa = require("koa");
const Router = require("@koa/router");
const fs = require("fs");
const path = require("path");
let app = new Koa();
let router = new Router();
const vm = new Vue({
  template: `<div>I'm {{name}},{{age}} years old now,I like {{favorite}}</div>`,
  data() {
    return {
      name: "zaking",
      age: 18,
      favorite: "coding",
    };
  },
});
const templateContent = fs.readFileSync(
  path.resolve(__dirname, "index.html"),
  "utf-8"
);
const render = VueServerRenderer.createRenderer({
  template: templateContent,
});
router.get("/", async (ctx) => {
  ctx.body = await render.renderToString(vm);
});

app.use(router.routes());
app.listen(3000);
