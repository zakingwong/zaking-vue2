const VueServerRenderer = require("vue-server-renderer");
const Koa = require("koa");
const Router = require("@koa/router");
const fs = require("fs");
const path = require("path");
const KoaStatic = require("koa-static");
const serverBundle = require("./dist/vue-ssr-server-bundle.json");
const clientManifest = require("./dist/vue-ssr-client-manifest.json");

let app = new Koa();
let router = new Router();

const templateContent = fs.readFileSync(
  path.resolve(__dirname, "./dist/index.html"),
  "utf-8"
);
const render = VueServerRenderer.createBundleRenderer(serverBundle, {
  template: templateContent,
  clientManifest,
});
router.get("/(.*)", async (ctx) => {
  ctx.body = await render.renderToString({ url: ctx.url });
});

app.use(router.routes());
app.use(KoaStatic(path.resolve(__dirname, "dist")));
app.listen(3000);
