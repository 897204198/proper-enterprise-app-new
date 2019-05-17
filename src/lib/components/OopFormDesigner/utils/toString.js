/**
 * 把一个对象序列化成字符串 保留函数
 * @param object
 * @returns {string}
 */
export const toString2 = (object)=>{
  let r = '{';
  for (const k in object) {
    const value = object[k];
    if (typeof value === 'string') {
      r += `${k}:'${value}',`
    } else if (Array.isArray(value)) {
      let ar = '';
      value.forEach((v)=>{
        if (v && v.toString() === '[object Object]') {
          ar += `${k}:[${toString2(v)}],`
        } else {
          ar += `${k}:[${value}],`
        }
      })
      r += ar;
    } else if (value && value.toString() === '[object Object]') {
      r += `${k}:${toString2(value)},`
    } else {
      r += `${k}:${value},`
    }
  }
  r = r.substring(0, r.length - 1); r += '}';
  return r;
}
