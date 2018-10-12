import fetch from 'dva/fetch';
import { notification } from 'antd';
import { prefix, devMode } from '../../config/config';

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
  // const error = new Error(errortext)
  const error = {
    name: response.status,
    errortext,
    response
  }
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
  // defaultActionWhenNoAuthentication 没有访问权限时的默认行为值 默认为true 即跳转到登陆页
  const defaultOptions = {
    // credentials: 'same-origin',
    defaultActionWhenNoAuthentication: true
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method && ['post', 'put', 'delete'].includes(newOptions.method.toString().toLowerCase())) {
    newOptions.headers = {
      Accept: '*/*',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
    if (typeof newOptions.body === 'string') {
      // 如果请求参数是个字符串 那么修改其 'Content-Type'
      newOptions.headers['Content-Type'] = 'text/plain; charset=utf-8';
    } else if (typeof newOptions.body === 'object') {
      newOptions.body = JSON.stringify(newOptions.body);
    }
  }
  const { headers } = newOptions;
  newOptions.headers = {
    ...headers,
  }
  // 请求可以覆盖默认的X-PEP-TOKEN
  if (!newOptions.headers['X-PEP-TOKEN']) {
    newOptions.headers['X-PEP-TOKEN'] = window.localStorage.getItem('proper-auth-login-token');
  }
  // 如果请求不属于指定的域 那么删除 X-PEP-TOKEN TODO
  if (peaDynamicRequestPrefix && !newUrl.includes(peaDynamicRequestPrefix)) {
    delete newOptions.headers['X-PEP-TOKEN'];
  }
  if (!peaDynamicRequestPrefix && newUrl.includes('http')) {
    delete newOptions.headers['X-PEP-TOKEN'];
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
        const contentType = response.headers.get('content-type');
        if (contentType === null) {
          return new Promise((resolve)=>{
            resolve({
              status: codeStyle,
              result: []
            });
          });
        }
        if (contentType.indexOf('text/') !== -1) {
          thePromise = response.text();
        } else if (contentType.indexOf('application/json') !== -1) {
          thePromise = response.json();
        } else if (contentType.indexOf('application/x-msdownload') !== -1) {
          thePromise = response.blob();
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
      const { defaultActionWhenNoAuthentication } = newOptions;
      if (e.name === 401 && defaultActionWhenNoAuthentication === true) {
        throw e
      }
      return new Promise((resolve)=>{
        resolve({
          status: e.constructor.name === 'TypeError' ? 500 : e.response.status,
          result: []
        });
      });
    });
}
