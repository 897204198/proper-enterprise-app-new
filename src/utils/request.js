import fetch from 'dva/fetch';
import { notification } from 'antd';
import { routerRedux } from 'dva/router';
import app from '../index';
import { prefix, devMode } from '../config';

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据,的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};

function checkStatus(response) {
  if ((response.status >= 200 && response.status < 300) || response.headers.get('X-PEP-ERR-TYPE') === 'PEP_BIZ_ERR') {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  response.text().then((msg)=>{
    notification.error({
      // message: `请求错误 ${response.status}: ${response.url}`,
      message: `请求错误 ${response.status}`,
      description: msg || errortext,
    });
  });
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 * @desc 如果url以"$"开头，那么在发送请求前此url不会被加前缀（主要为开发调用调试接口考虑。）
 * @desc2 如果是开发模式下，并且在localStorage缓存中存在系统请求前缀，那么请求前缀都换成缓存的
 */
export default function request(url, options) {
  let newUrl = '';
  if (url.indexOf('$') === 0) {
    newUrl = url.replace('$', '')
  } else {
    newUrl = `${prefix}${url}`;
  }
  const peaDynamicRequestPrefix = window.localStorage.getItem('pea_dynamic_request_prefix')
  if (devMode === 'development' && peaDynamicRequestPrefix) {
    if (peaDynamicRequestPrefix.indexOf('http:') === 0 || peaDynamicRequestPrefix.indexOf('https:') === 0) {
      newUrl = `${peaDynamicRequestPrefix}${url}`;
    }
  }
  // 如果是全路径以http或者https开头那么之前的前缀和缓存域 都无效
  if (url.indexOf('http:') === 0 || url.indexOf('https:') === 0) {
    newUrl = url
  }
  const defaultOptions = {
    // credentials: 'same-origin',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT' || newOptions.method === 'DELETE') {
    newOptions.headers = {
      Accept: '*/*',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
    newOptions.body = JSON.stringify(newOptions.body);
  }
  const { headers } = newOptions;
  newOptions.headers = {
    ...headers,
    'X-PEP-TOKEN': window.localStorage.getItem('proper-auth-login-token')
  }
  return fetch(newUrl, newOptions)
    .then(checkStatus)
    .then((response) => {
      let codeStyle = null;
      let thePromise = null;
      if (response.status >= 200 && response.status < 300) {
        codeStyle = 'ok';
      } else {
        codeStyle = 'err';
      }
      if (response.headers) {
        if (response.headers.get('content-type').indexOf('text/') !== -1) {
          thePromise = response.text();
        } else if (response.headers.get('content-type').indexOf('application/json') !== -1) {
          thePromise = response.json();
        }
      } else {
        thePromise = response;
      }
      return new Promise((resolve)=>{
        thePromise.then((res)=>{
          resolve({
            status: codeStyle,
            result: res
          });
        })
      });
    })
    .catch((e) => {
      const { dispatch } = app._store;
      const status = e.name;
      if (status === 401) {
        window.localStorage.removeItem('proper-auth-login-token');
        dispatch(routerRedux.push('/base/login'));
        return;
      }
      if (status === 409) {
        return;
      }
      if (status === 403) {
        dispatch(routerRedux.push('/exception/403'));
        return;
      }
      if (status <= 504 && status >= 500) {
        dispatch(routerRedux.push('/exception/500'));
        return;
      }
      if (status >= 404 && status < 422) {
        dispatch(routerRedux.push('/exception/404'));
      }
    });
}
