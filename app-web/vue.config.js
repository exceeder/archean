module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],

  pluginOptions: {
    express: {
      port: 8080,
      distPath: './dist',
      shouldServeApp: false,
      serverDir: './backend',
      isInProduction: false
    }
  },

  devServer: {
    proxy: 'http://localhost:30000'
    // public: 'localhost:30000',
    // clientLogLevel: 'silent'
  }
}
