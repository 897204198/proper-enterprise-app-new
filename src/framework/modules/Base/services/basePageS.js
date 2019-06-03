import MongoService from '@framework/utils/MongoService';
import request from '@framework/utils/request';

export default class BasePageService {
  constructor(tableName) {
    if (tableName) {
      this.service = this.serviceCache[tableName] ? this.serviceCache[tableName] : (this.serviceCache[tableName] = new MongoService(tableName));
    } else {
      throw Error('the \'tableName\' cannot be empty when you instantiate an \'BasePageService\' object ');
    }
  }
  serviceCache = {}
  fetch = async ()=>{
    return this.service.fetch((query)=>{
      query.addDescending('CT');
    })
  }
  fetchById = async (param)=>{
    return this.service.fetchById(param)
  }
  fetchByEqual = async (param)=>{
    return this.service.fetchByEqual(param)
  }
  saveOrUpdate = async (param)=>{
    return param.id ? this.service.update(param) : this.service.save(param);
  }
  removeAll = async (param)=>{
    return this.service.batchDelete(param)
  }
  remove = async (param)=>{
    return this.service.deleteById(param);
  }
  sendRestful = async (payload)=>{
    const {restPath, param, tableName} = payload;
    return request(restPath, {
      method: 'post',
      body: JSON.stringify({param, tableName})
    });
  }
}
