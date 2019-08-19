import moment from 'moment';
import { prefix, devMode } from '@/config/config';
import pinyinUtil from 'proper-pinyin';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - (day * oneDay);

    return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)
    ];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    // 是否包含
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  const keys = Object.keys(routerData);
  if (keys.length === 0) {
    return [];
  }
  let routes = keys.filter(routePath => routePath.indexOf(path) === 0 && routePath !== path);
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map((item) => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
      exact
    };
  });
  return renderRoutes;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;

export function isUrl(path) {
  return reg.test(path);
}

export function formatter(data) {
  return data.map((item) => {
    const { path } = item;
    // if (!isUrl(path)) {
    //   path = item.path;
    // }
    const result = {
      ...item,
      path
    };
    if (item.children) {
      result.children = formatter(item.children);
    }
    return result;
  });
}

// 处理菜单函数
export function controlMenu(oldMenu, newMenu = []) {
  if (oldMenu != null) {
    for (let i = 0; i < oldMenu.length; i++) {
      const item = oldMenu[i];
      item.path = oldMenu[i].route;
      if (oldMenu[i].parentId == null) {
        newMenu.push(oldMenu[i]);
      }
    }
    return delInvalidMenu(culMenu(oldMenu, newMenu));
  } else {
    return [];
  }
}

function culMenu(oldMenu, newMenu) {
  const newMenuTemp = newMenu;
  for (let i = 0; i < newMenuTemp.length; i++) {
    newMenuTemp[i].children = [];
    for (let j = 0; j < oldMenu.length; j++) {
      if (newMenuTemp[i].id === oldMenu[j].parentId) {
        newMenuTemp[i].children.push(oldMenu[j]);
        newMenuTemp[i].children = culMenu(oldMenu, newMenuTemp[i].children);
      }
    }
  }
  return newMenuTemp;
}


// 删除children长度为0的字段
function delInvalidMenu(oldMenu = []) {
  const temp = oldMenu;
  for (let i = 0; i < temp.length; i++) {
    if (temp[i].children && temp[i].children.length === 0) {
      delete temp[i].children;
    } else {
      temp[i].children = delInvalidMenu(temp[i].children);
    }
  }
  return temp;
}

// 处理workflow的日期格式
export function formatDate(date) {
  const str1 = date.substr(0, 10);
  const str2 = date.substr(11, 8);
  return `${str1} ${str2}`;
}
export const format = (fmt) =>{
  let formMate = fmt;
  const now = new Date();
  const o = {
    'M+': now.getMonth() + 1, // 月份
    'd+': now.getDate(), // 日
    'h+': now.getHours(), // 小时
    'm+': now.getMinutes(), // 分
    's+': now.getSeconds(), // 秒
    'q+': Math.floor((now.getMonth() + 3) / 3), // 季度
    S: now.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(formMate)) {
    formMate = formMate.replace(RegExp.$1, (now.getFullYear().toString().concat('')).substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp('('.concat(k).concat(')')).test(formMate)) {
      formMate = formMate.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00'.concat(o[k])).substr((''.concat(o[k])).length)));
    }
  }
  return formMate;
}
export const getParamObj = (search)=>{
  const param = {};
  search && search.replace('?', '').split('&')
    .map(str=>'{"'.concat(str.replace('=', '":"')).concat('"}'))
    .forEach((jsonStr)=>{ Object.assign(param, JSON.parse(jsonStr)) });
  return param;
}

/**
 * @desc
 * 这个方法获取后台url请求的路径 有3处对于此方法的调用
 * 1.request.js  //统一的http请求接口
 * 2.OopUpload组件  //上传组件的后台接口
 * 3.MongoService.js  //mongoDB的后台接口
 */
export const getApplicationContextUrl = ()=>{
  // const {protocol, host, pathname} = window.location;
  const peaDynamicRequestPrefix = window.localStorage.getItem('pea_dynamic_request_prefix');
  if (devMode === 'development' && peaDynamicRequestPrefix) {
    if (peaDynamicRequestPrefix.indexOf('http:') === 0 || peaDynamicRequestPrefix.indexOf('https:') === 0) {
      return peaDynamicRequestPrefix;
    }
  }
  // return `${protocol}//${host}${pathname.substr(0, pathname.lastIndexOf('/'))}${prefix}`;
  return prefix;
}
export const isAndroid = ()=>{
  const {userAgent} = navigator;
  return userAgent.includes('Android') || userAgent.includes('Adr');
}
export const isIOS = ()=>{
  const {userAgent} = navigator;
  return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}
export const isApp = ()=>{
  return isIOS() || isAndroid()
}
const replaceSafetyCharactor = (str)=>{
  return str.replace(/_/g, '/').replace(/-/g, '+');
}
export const getCurrentUser = (token)=>{
  const {JSON, decodeURIComponent, escape, atob} = window;
  if (!token) {
    return null;
  }
  const u = JSON.parse(atob(replaceSafetyCharactor(token.split('.')[0])));
  const u2 = JSON.parse(decodeURIComponent(escape(atob(replaceSafetyCharactor(token.split('.')[1])))));
  const user = {
    ...u,
    ...u2,
    username: u.name
  };
  return user;
}
const exchange = (strArr) => {
  const results = [];
  const result = [];
  const permutation = (arr, index) => {
    for (let i = 0; i < arr[index].length; i++) {
      result[index] = arr[index][i]
      if (index !== arr.length - 1) {
        permutation(arr, index + 1)
      } else {
        results.push(result.reduce((strs, str) => strs + str))
      }
    }
  }
  permutation(strArr, 0)
  return results
}
/*
* 汉字转成拼音
* 返回一个对象里面包含这个汉字的拼音和首字母
 */
export const convertChineseToPinyin = (string) => {
  const qp = pinyinUtil.getPinyin(string, ',', false, true) // 参数：（要翻译的字符串，分隔符，是否显示声调，是否支持多音字）
  const szm = pinyinUtil.getFirstLetter(string, true) // 参数：（要翻译的字符串，是否支持多音字）
  const quanpin = exchange(qp)
  const shouzimu = exchange(szm)
  return {quanpin, shouzimu}
}

const trimWhiteSpace = (str)=>{
  return str.replace(/ /g, '');
}

/*
* 根据你的输入字符与目标字符做匹配
* 返回结果是boolean
* 例如：目标字符“流程设计” 输入字符：“liuchengsheji、lcsj、liucshej、lcsheji、流程设计”都能够返回true
 */
export const matchInputStrForTargetStr = (targetStr, searchStr) => {
  if (!isString(targetStr) || !isString(searchStr)) return false;
  targetStr = trimWhiteSpace(targetStr);
  searchStr = trimWhiteSpace(searchStr);
  const strObj = convertChineseToPinyin(targetStr);
  const strs = [targetStr, ...strObj.shouzimu, ...strObj.quanpin];
  const rule = searchStr.split('').reduce((sum, val) => { return sum.includes('.*') ? `${sum}${val}.*` : `${sum}.*${val}.*` });
  let checkRule = new RegExp(rule, 'gim');
  let hasValue = false;
  for (let i = 0; i < strs.length; i++) {
    if (checkRule.test(strs[i])) {
      hasValue = true
      break;
    }
  }
  checkRule = null;
  return hasValue;
}

export const isObject = (object)=>{
  return Object.prototype.toString.call(object) === '[object Object]';
}
export const isArray = (object)=>{
  return Object.prototype.toString.call(object) === '[object Array]';
}
export const isFunction = (object)=>{
  return Object.prototype.toString.call(object) === '[object Function]';
}
export const isString = (object)=>{
  return Object.prototype.toString.call(object) === '[object String]';
}
export const isNumber = (object)=>{
  return Object.prototype.toString.call(object) === '[object Number]';
}
export const isBoolean = (object)=>{
  return Object.prototype.toString.call(object) === '[object Boolean]';
}
export const isDate = (object)=>{
  return Object.prototype.toString.call(object) === '[object Date]';
}
export const isRegExp = (object)=>{
  return Object.prototype.toString.call(object) === '[object RegExp]';
}
export const isSymbol = (object)=>{
  return Object.prototype.toString.call(object) === '[object Symbol]';
}
export const isReactObject = (object)=>{
  return isSymbol(object) && object.$$typeof !== undefined;
}
export const isEmptyObject = (object)=>{
  for (const name in object) {
    return false;
  }
  return true;
}
