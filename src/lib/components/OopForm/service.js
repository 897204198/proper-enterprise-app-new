import {stringify} from 'qs';
import request from '@framework/utils/request';
import MongoService from '@framework/utils/MongoService';

// 查询数据字典
export async function fetchDictionary(param) {
  return request(`/sys/datadic?${stringify(param)}`);
}
// 根据URL查询数据源
// url是一个对象
export async function findUrlData(urlObj) {
  if (typeof urlObj === 'object') {
    const {value} = urlObj;
    if (value) {
      // restful
      if (value.includes('/')) {
        return request(value);
      }
      // Mongo
      if (value.includes('_')) {
        const ms = new MongoService(value);
        return ms.fetch();
      }
    }
    return new Promise((resolve)=>{
      setTimeout(()=>{
        resolve({
          result: []
        });
      }, 1000)
    });
  }
  return new Promise((resolve)=>{
    setTimeout(()=>{
      resolve({
        result: []
      });
    }, 1000)
  });
}
