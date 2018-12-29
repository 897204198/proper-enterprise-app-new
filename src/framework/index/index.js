import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';
import createHistory from 'history/createHashHistory';
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
  const last = des[des.length - 1];
  console.info(`当前系统名称： ${pkg.name}, version: ${pkg.version}`);
  console.info(`当前ant-design版本： ${version}`);
  console.info(`当前framework版本： ${framework.version}`);
  if (des.length === 0) {
    import('@pea/package.json').then((pk)=>{
      console.info(`当前pea版本： ${pk.version}`);
    })
  } else {
    try {
      import(`@/../node_modules/@proper/${last}-lib/package.json`).then((pk)=>{
        console.info(`当前${last}版本： ${pk.version}`);
      });
    } catch (err) {
      console.log(err)
    }
  }
})(dependencies), 0);

export default app;
