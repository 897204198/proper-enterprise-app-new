import '@babel/polyfill';
import 'url-polyfill';
import dva from 'dva';
import createHistory from 'history/createHashHistory';
// user BrowserHistory
// import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';
import {version} from 'antd';
import './index.less';
import syspk from '../../../package.json';
import pfpk from '../package.json';
import plpk from '../../lib/package.json';
// 1. Initialize
const app = dva({
  history: createHistory()
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
