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
      let ar = `${k}:[`;
      for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (v && v.toString() === '[object Object]') {
          ar += `${toString2(v)},`;
        } else if (typeof v === 'string') {
          ar += `'${v}',`;
        } else {
          ar += `${v},`;
        }
      }
      ar += '],'
      r += ar;
    } else if (value && value.toString() === '[object Object]') {
      r += `${k}:${toString2(value)},`
    } else {
      r += `${k}:${value},`
    }
  }
  r = r.length > 1 ? r.substring(0, r.length - 1) : r;
  r += '}';
  return r;
}
