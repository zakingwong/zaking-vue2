const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const resolve = (dir) => {
  return path.resolve(__dirname, dir);
};
module.exports = {
  mode: "development",
  output: {
    filename: "[name].bundle.js",
    path: resolve("../dist"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".vue", ".css"],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        use: {
          options: {
            presets: ["@babel/preset-env"],
          },
          loader: "babel-loader",
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
