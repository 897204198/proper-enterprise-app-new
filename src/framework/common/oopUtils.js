import { message } from 'antd';

export const oopToast = (response, succText, errText, duration = 3) => {
  if (response) {
    if (response.status === 'ok') {
      if (succText) {
        return message.success(succText, duration);
      } else if (!succText && (typeof response.result === 'string') && response.result !== '') {
        return message.success(response.result, duration);
      }
    }
    if (errText) {
      return message.error(errText, duration);
    } else if (!errText && (typeof response.result === 'string') && response.result !== '') {
      return message.error(response.result, duration);
    }
  }
}

export const getUuid = (len)=>{
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = [];
  let i = null;
  const radix = chars.length;
  if (len) {
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | Math.random() * radix]
    }
  }
  return uuid.join('');
}
