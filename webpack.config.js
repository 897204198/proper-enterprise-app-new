import { dependencies, htmlWebpackPlugin } from './src/config/config';
import { generateAlias } from './.generateAlias';

/**
 * 获取webpackConfig
 * des.length === 0 代表 当前是 平台代码
 * @param webpackConfig
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

export default (webpackConfig) => {
  return getWebpackConfig(webpackConfig, dependencies);
}

function getWebpackConfig(webpackConfig, des = []) {
  const {length} = des;
  // 动态设置别名
  const alias = {
    '@': path.resolve(__dirname, 'src'),
    '@framework': length === 0 ? path.resolve(__dirname, 'src/framework') : path.resolve(__dirname, 'node_modules/@proper/framework'),
    ...(
      getBizModuleAliasByDes(dependencies)
    )
  }
  webpackConfig.resolve.alias = alias;
  // 有依赖 需要对依赖包在开发时做编译 所以需要修改webpack配置
  // const pathReg = /(node_modules\\@proper|src\\lib|node_modules\/@proper|src\/lib)/; // window or mac
  const pathReg = [
    path.resolve(__dirname, 'node_modules/@proper'),
    path.resolve(__dirname, 'src/lib')
  ];
  // const antdPathReg = /(node_modules\\antd|node_modules\/antd)/;
  const antdPathReg = [
    path.resolve(__dirname, 'node_modules/antd')
  ]
  if (length) {
    // 处理.js
    const rule = {
      test: /\.js|jsx$/,
      include: pathReg,
      use: [
        {loader: require.resolve('af-webpack/lib/debugLoader')},
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [require.resolve('roadhog/lib/babel'), {browsers: ['last 2 versions']}]
            ],
            plugins: [
              ['import', {libraryName: 'antd', libraryDirectory: 'es', style: true}],
              ['import', {libraryName: 'antd-mobile', libraryDirectory: 'es', style: true}, 'antd-mobile']
            ],
            cacheDirectory: true,
            babelrc: false
          }
        }]
    };
    const {rules} = webpackConfig.module;
    rules.push(rule);
    // 处理 .less
    const lessRule = rules.filter(it=>it.test && it.test.test('.less'));
    // 第一个.less的配置 默认开启cssModule 去掉exclude 增加include /(node_modules\\@proper|src\\lib)/
    const cssModulesRule = lessRule.find(it=>it.exclude !== undefined);
    // 第二个.less的配置 默认关闭cssModule 更改include为/(node_modules\\antd)/;
    const notCssModulesRule = lessRule.find(it=>it.include !== undefined);
    delete cssModulesRule.exclude;
    cssModulesRule.include = pathReg;
    notCssModulesRule.include = antdPathReg;
  }
  // 输出alias配置到webpackAlias.txt
  generateAlias(webpackConfig)
  // 处理 htmlWebpackPlugin
  if (htmlWebpackPlugin) {
    const iframePlugin = new HtmlWebpackPlugin(htmlWebpackPlugin)
    webpackConfig.plugins.push(iframePlugin)
  }
  return webpackConfig;
}

// 根据配置的业务模块依赖 获取webpack的配置
function getBizModuleAliasByDes(des = []) {
  if (des.length === 0) {
    return {
      '@pea': path.resolve(__dirname, 'src/lib')
    }
  } else {
    const result = {};
    des.forEach((it)=>{
      result[`@${it}`] = path.resolve(__dirname, `node_modules/@proper/${it}-lib`)
    });
    return result
  }
}
