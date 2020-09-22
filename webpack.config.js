const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackCopyPlugin = require("copy-webpack-plugin"); //資料複製
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin"); //壓縮css
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); //清除檔案資料
module.exports = {
  /*build: {
    assetsPublicPath: "/dist/",
    assetsSubDirectory: "/dist/",
  },*/
  resolve: {
    //擴展路徑別名
    alias: {
      "@img": path.resolve(__dirname, "./src/img/"),
      "@css": path.resolve(__dirname, "./src/css/"),
      "@js": path.resolve(__dirname, "./src/js/"),
      "@src": path.resolve(__dirname, "./src/"),
    },
    //擴展副檔名
    extensions: [".js", ".json"],
  },
  entry: {
    main: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "./dist/"),
    //publicPath: "/assets/",
    filename: "js/[name].[hash].js",
  },
  devServer: {
    contentBase: path.join(__dirname, "/"),
    compress: true,
    port: 9002,
    inline: true,
  },
  module: {
    rules: [
      //css提取
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: "../",
            },
          },
          "css-loader",
        ],
      },
      //圖檔載入器
      {
        test: /\.(png|jpg|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "img/[name].[hash].[ext]",
              /*publicPath: "../",*/
              /*outputPath: "/",*/
            },
          },
        ],
      },
      /*{
        test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpg|gif)$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 1000, //bytes
            name: "[hash:7].[ext]",
            outputPath: "assets",
          },
        },
      },*/
      //字型載入器
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "fonts/[name].[hash].[ext]",
              /*publicPath: "../",*/
              //outputPath: "./",
            },
          },
        ],
      },
      //js轉舊
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.html$/,
        use: [{ loader: "html-loader" }],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      //cleanOnceBeforeBuildPatterns: ["./js/*", "./css/*", "./fonts/*", "./index,html"],
      cleanOnceBeforeBuildPatterns: ["./*"],
    }),
    /*new WebpackCopyPlugin({
      patterns: [{ from: "./src/assets", to: "assets" }],
    }),*/
    new MiniCssExtractPlugin({ filename: "css/[name].[hash].css" }),
    new HtmlWebpackPlugin({
      //title: "scrollEffect",
      template: "./src/index.html",
      filename: "index.html",
    }),
    new OptimizeCssAssetsWebpackPlugin(),
  ],
};
