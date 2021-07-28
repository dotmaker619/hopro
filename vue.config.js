// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
// .BundleAnalyzerPlugin;
module.exports = {
  chainWebpack: (config) => {
    // If you wish to remove the standard entry point
    config.entryPoints.delete("app");

    // then add your own
    config
      .entry("desktop")
      .add("src/desktop/desktop-main.js")
      .end()
      .entry("mobile")
      .add("src/mobile/mobile-main.js")
      .end();
  },
  configureWebpack: {
    // plugins: [new BundleAnalyzerPlugin()],
    // externals: {
    //   vue: 'Vue'
    // }
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/style/prepend-styles.scss";`,
      },
    },
  },
  devServer: {
    watchOptions: {
      poll: true,
    },
    hotOnly: true,
    disableHostCheck: true,
  },
  pwa: {
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "./public/service-worker.js",
      exclude: [/.*_redirects.*$/, /.*_headers.*$/],
    },
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
  },
};
