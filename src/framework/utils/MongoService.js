/**
 * MongoService 链接MongoDB的前端工具 基于av-core
 */
import AV from 'av-core';
import { prefix, devMode } from '@/config/config';
import {getCurrentUser} from './utils';

// av-core 会把从mongo里的数据加一些奇怪的封装 这里做下清理 和 处理mongo本身的$id 等
const retrievalData = (data)=>{
  if (Array.isArray(data)) {
    return data.map((item)=>{
      const r = {
        ...item._serverData,
        id: item._serverData._id.$oid
      }
      for (const k in r) {
        if (r[k] && r[k].$numberLong) {
          r[k] = Number(r[k].$numberLong)
        }
      }
      return r
    })
  } else if (Object.prototype.toString.call(data) === '[object Object]') {
    const r = {
      ...data._serverData,
      id: data._serverData._id.$oid
    }
    for (const k in r) {
      if (r[k] && r[k].$numberLong) {
        r[k] = Number(r[k].$numberLong)
      }
    }
    return r
  }
}

export default class MongoService {
  static setToken = (token)=>{
    if (token) {
      AV.setToken(token);
    }
  }
  constructor(tableName, url, ctx) {
    const token = window.localStorage.getItem('proper-auth-login-token');
    // const serviceKey = window.localStorage.getItem('proper-auth-service-key');
    if (token) {
      this.currentUser = getCurrentUser(token);
      this.tableName = tableName;
      this.tableObj = AV.Object.extend(this.tableName);
      // const {protocol, host, pathname} = window.location;
      const serverURL = url || (devMode === 'development' && window.localStorage.getItem('pea_dynamic_request_prefix')) || `${prefix}`;
      const context = ctx || '/avdemo';
      AV.initialize(serverURL, context);
      AV.setToken(token);
    }
    // AV.setServiceKey(serviceKey);
  }
  errorFn = (err)=>{
    if (err.status === 401) {
      throw (err);
    }
    return err.resolve({
      status: 'error',
      result: []
    });
  }
  fetch =(callback) =>{
    const query = new AV.Query(this.tableObj);
    const callbackReturn = callback && callback(query);
    return new Promise((resolve, reject)=>{
      if (callbackReturn) {
        callbackReturn.then((callbackReturnValue)=>{
          query.find().then((res)=>{
            resolve({
              result: retrievalData(res),
              extra: callbackReturnValue
            });
          }).catch((e)=>{
            reject({...e, resolve}); // eslint-disable-line
          });
        }).catch((e)=>{
          reject({...e, resolve}); // eslint-disable-line
        })
        return
      }
      query.find().then((res)=>{
        resolve({
          result: retrievalData(res)
        });
      }).catch((e)=>{
        reject({...e, resolve}); // eslint-disable-line
      })
    }).catch((e)=>{
      this.errorFn(e);
    })
  }
  fetchPagable = (params = {}) =>{
    const {pagination = {}, ...queryCondition } = params;
    const {pageNo = 1, pageSize = 10, sorter} = pagination;
    console.log(queryCondition, sorter)
    return new Promise((resolve, reject)=>{
      this.fetch((query)=>{
        query.skip((pageNo - 1) * pageSize).limit(pageSize);
        return query.count();
      }).then((res)=>{
        resolve({
          status: 'ok',
          result: {
            data: res.result,
            count: res.extra
          }
        })
      }).catch((e)=>{
        reject({...e, resolve}); // eslint-disable-line
      })
    }).catch((e)=>{
      this.errorFn(e);
    })
  }
  save = (formValues) => {
    const insertObj = this.tableObj.new(formValues);
    return new Promise((resolve, reject)=>{
      insertObj.save().then((res)=>{
        // 为了给oopToast提供成功的标识
        resolve({
          status: 'ok',
          result: {...res._serverData, id: res.id}
        });
      }).catch((e)=>{
        reject({...e, resolve}); // eslint-disable-line
      })
    }).catch((e)=>{
      return this.errorFn(e);
    })
  }
  // 后台 没有实现的方法 有需要循环遍历调用save方法
  batchSave = (objects = []) =>{
    const listObj = [];
    objects.forEach((object)=>{
      listObj.push(this.tableObj.new(object))
    })
    const {saveAll} = this.tableObj;
    return new Promise((resolve, reject)=>{
      saveAll(listObj).then((res)=>{
        // 为了给oopToast提供成功的标识
        console.log(res)
        resolve({
          status: 'ok',
          result: []
        });
      }).catch((e)=>{
        reject({...e, resolve}); // eslint-disable-line
      })
    }).catch((e)=>{
      return this.errorFn(e);
    })
  }
  update = (formValues)=> {
    const id = formValues && formValues.id;
    if (id) {
      const query = new AV.Query(this.tableObj);
      return new Promise((resolve, reject)=>{
        query.get(id).then((entity)=>{
          for (const k in formValues) {
            entity.set(k, formValues[k]);
          }
          entity.save().then((res)=>{
            // 为了给oopToast提供成功的标识
            resolve({
              status: 'ok',
              result: retrievalData(res)
            });
          }).catch((e)=>{
            reject({...e, resolve}); // eslint-disable-line
          })
        }).catch((e)=>{
          reject({...e, resolve}); // eslint-disable-line
        })
      }).catch((e)=>{
        this.errorFn(e);
      })
    } else {
      console.error('\'id\' cannot be null when update operation ')
    }
  }
  fetchById = (id) =>{
    if (id) {
      const query = new AV.Query(this.tableObj);
      return new Promise((resolve, reject)=>{
        return query.get(id).then((res)=>{
          resolve({
            status: 'ok',
            result: retrievalData(res)
          });
        }).catch((e)=>{
          reject({...e, resolve}); // eslint-disable-line
        })
      }).catch((e)=>{
        this.errorFn(e)
      })
    }
  }
  deleteById = (id) =>{
    if (id) {
      const query = new AV.Query(this.tableObj);
      return new Promise((resolve, reject)=>{
        query.get(id).then((res)=>{
          res.id = res._serverData._id.$oid;
          res.destroy().then((msg)=>{
            resolve({
              status: 'ok',
              result: msg
            });
          }).catch((e)=>{
            reject({...e, resolve}); // eslint-disable-line
          })
        }).catch((e)=>{
          reject({...e, resolve}); // eslint-disable-line
        })
      }).catch((e)=>{
        this.errorFn(e);
      })
    }
  }
  batchDelete = (param) =>{
    if (param.ids) {
      const query = new AV.Query(this.tableObj);
      query.containedIn('_id', param.ids.split(','));
      return new Promise((resolve, reject)=>{
        query.find().then((res)=>{
          if (res.length) {
            res.forEach((re)=>{
              const r = re;
              r.id = r._serverData._id.$oid
            });
            AV.Object.destroyAll(res).then((msg)=>{
              resolve({
                status: 'ok',
                result: msg
              });
            }).catch((e)=>{
              reject({...e, resolve}); // eslint-disable-line
            })
          } else {
            resolve({
              status: 'error',
              result: 'the record no exit'
            });
          }
        }).catch((e)=>{
          reject({...e, resolve}); // eslint-disable-line
        })
      }).catch((e)=>{
        this.errorFn(e);
      })
    }
  }
  fetchByEqual = (params)=> {
    return this.fetch((query)=>{
      if (params) {
        for (const k in params) {
          query.equalTo(k, params[k]);
        }
      }
    })
  }
  getCurrentUser = ()=>{
    return this.currentUser
  }
}

