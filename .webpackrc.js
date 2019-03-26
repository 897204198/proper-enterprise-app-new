import {dependencies, devMode, workflowServerUrl, proxy} from './src/config/config';

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
  "extraBabelPlugins": dependencies.length ? [] : [
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": true }],
    ["import", { "libraryName": "antd-mobile", "libraryDirectory": "es", "style": true }, "antd-mobile"]
  ],
  'ignoreMomentLocale': true,
  'theme': './src/config/theme.js',
  'html': {
    'template': dependencies.length ? './node_modules/@proper/framework/index/index.ejs' : './src/framework/index/index.ejs'
  },
  'publicPath': '/',
  'disableDynamicImport': false,
  'hash': true,
  "proxy": {
    "/api": {
      "target": "http://localhost:8080",
      "pathRewrite": {"^/api" : "/pep"},
    },
    ... proxy
  }
}

if (devMode === 'development') {
  const devProxy = {
    "/workflow/app/rest": {
      "target": workflowServerUrl,
      "pathRewrite": {"^/workflow/app/rest" : "/workflow/service/app/rest"},
      "changeOrigin": true
    },
    "/workflow/ext": {
      "target": workflowServerUrl,
      "pathRewrite": {"^/workflow/ext" : "/workflow/ext"},
      "changeOrigin": true
    },
    "/workflow": {
      "target": "http://localhost:8888",
    },
  }
  config.proxy = Object.assign(config.proxy, devProxy)
}

export default config
