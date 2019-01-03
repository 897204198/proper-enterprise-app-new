module.exports = (webpackConfig) => {
  webpackConfig.resolve.alias = {
    '@': `${__dirname}/src`,
  }
  return webpackConfig
}