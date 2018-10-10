import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';
import createHistory from 'history/createHashHistory';
// user BrowserHistory
// import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';
import { routerRedux } from 'dva/router';
import {version} from 'antd';
import './index.less';
import syspk from '../../../package.json';
import pfpk from '../package.json';
import plpk from '../../lib/package.json';
// 1. Initialize
const app = dva({
  history: createHistory(),
  onError(err, dispatch) {
    // 401状态处理
    if (window.location.hash.split('#')[1] !== '/base/login') {
      window.sessionStorage.setItem('proper-route-noAuthPage', window.location.hash);
      window.localStorage.removeItem('proper-auth-login-token');
      dispatch(routerRedux.push('/base/login'));
    }
  }
});

// 2. Plugins
app.use(createLoading());
// 3. Register global model
app.model(require('../modules/Base/models/global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

console.info(`当前系统名称： ${syspk.name}, version: ${syspk.version}`);
console.info(`当前pf版本： ${pfpk.version}`);
console.info(`当前pl版本： ${plpk.version}`);
console.info(`当前ad版本： ${version}`);

export default app;
