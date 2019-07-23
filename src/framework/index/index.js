import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';
import { createHashHistory as createHistory } from 'history';
// user BrowserHistory
// import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';
import { routerRedux } from 'dva/router';
import models from '@framework/modules/Base/models';
import {version} from 'antd';
import {dependencies} from '@/config/config';
import pkg from '@/../package.json';
import framework from '@framework/package.json';
// import plpk from '@pea/lib/package.json';
import './index.less';

// 1. Initialize
const app = dva({
  history: createHistory(),
  onError(err, dispatch) {
    // 401状态处理
    if (err.name === 401 || err.status === 401) {
      const hash = window.location.hash.split('#')[1]
      if (hash && hash !== '/base/login') {
        window.sessionStorage.setItem('proper-route-noAuthPage', window.location.hash);
        window.localStorage.removeItem('proper-auth-login-token');
        dispatch(routerRedux.push('/base/login'));
      }
    }
  }
});

// 2. Plugins
app.use(createLoading());
// 3. Register global model
models.forEach(model=>app.model(model.default));
// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

// log dependencies version
// eslint-disable-next-line
setTimeout((function (des = []) {
  const {length} = des;
  console.info(`当前系统名称： ${pkg.name}, version: ${pkg.version}`);
  console.info(`当前ant-design版本： ${version}`);
  console.info(`当前framework版本： ${framework.version}`);
  if (length === 0) {
    const pkJson = require('@pea/package.json');
    console.info(`当前${pkJson.name}版本： ${pkJson.version}`);
  } else {
    try {
      for (let i = 0; i < length; i++) {
        const packageJson = require(`@proper/${des[i]}-lib/package.json`);
        console.info(`当前${packageJson.name}版本： ${packageJson.version}`);
      }
    } catch (err) {
      console.error(err)
    }
  }
})(dependencies), 0);

export default app;
