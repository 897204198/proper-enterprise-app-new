import {dependencies} from './src/config/config';
const config = {
  'entry': {
    'app': dependencies.length ? './node_modules/@proper/framework/index/index.js' : './src/framework/index/index.js',
    'common': ['./src/config/vendor.js']
  },
  'commons': [
    {
      'name': 'common',
      'filename': 'vendor.[hash:8].js'
    }
  ],
  'env': {
    'development': {
      'extraBabelPlugins': [
        'dva-hmr'
      ]
    }
  },
  "extraBabelPlugins": dependencies.length  ? [] : [
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }],
    ["import", { "libraryName": "antd-mobile", "libraryDirectory": "es", "style": true }, "antd-mobile"]
  ],
  'ignoreMomentLocale': true,
  'theme': './src/config/theme.js',
  'html': {
    'template': dependencies.length  ? './node_modules/@proper/framework/index/index.ejs' : './src/framework/index/index.ejs'
  },
  'publicPath': '/',
  'disableDynamicImport': false,
  'hash': true,
  "proxy": {
    "/api": {
      "target": "http://localhost:8080",
      "pathRewrite": {"^/api" : "/pep"}
    },
    "/workflow": {
      "target": "http://localhost:8080",
      "pathRewrite": {"^/workflow" : "/pep/workflow"}
    },
    "/repository": {
      "target": "http://localhost:8080",
      "pathRewrite": {"^/repository" : "/pep/repository"}
    },
    "/pep": {
      "target": "http://localhost:8080",
      "pathRewrite": {"^/pep/workflow/service" : "/pep/workflow/service"}
    }
  }
}
export default config
