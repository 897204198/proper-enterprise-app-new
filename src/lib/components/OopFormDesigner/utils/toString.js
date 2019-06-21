/**
 * 把一个对象序列化成字符串 保留函数
 * @param object
 * @returns {string}
 */
import {isString, isArray, isObject, isRegExp} from '@framework/utils/utils';

const replaceSpecialCharacters = (str)=>{
  return str.replace(/'/g, '\\\'');
}

export const toString2 = (object)=>{
  let r = '{';
  for (const k in object) {
    const value = object[k];
    if (isString(value)) {
      r += `${k}:'${replaceSpecialCharacters(value)}',`
    } else if (isArray(value)) {
      let ar = `${k}:[`;
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (isObject(v)) {
          ar += `${toString2(v)}`;
        } else if (isString(v)) {
          ar += `'${replaceSpecialCharacters(v)}'`;
        } else if (isRegExp(v)) {
          console.log(1)
        } else {
          ar += `${v}`;
        }
        if ((i + 1) !== value.length) {
          ar += ',';
        }
      }
      ar += '],'
      r += ar;
    } else if (isObject(value)) {
      r += `${k}:${toString2(value)},`
    } else if (isRegExp(value)) {
      console.log('this is regExp')
    } else {
      r += `${k}:${value},`
    }
  }
  r = r.length > 1 ? r.substring(0, r.length - 1) : r;
  r += '}';
  return r;
}
