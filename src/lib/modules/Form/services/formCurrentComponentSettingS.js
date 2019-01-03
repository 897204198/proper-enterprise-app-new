// import {stringify} from 'qs';
// import request from '../../../../framework/utils/request';
import MongoService from '../../../../framework/utils/MongoService';

const formCurrentComponentSettingService = new MongoService('PEP_FORM_CURRENTCOMPONENTSETTING');
const {update, save, deleteById, batchDelete} = formCurrentComponentSettingService;

export async function fetch() {
  return formCurrentComponentSettingService.fetch((query)=>{
    query.addAscending('sort');
  })
  // return request(`/form/currentComponentSetting/?${stringify(param)}`);
}
export async function fetchById(param) {
  return formCurrentComponentSettingService.fetchById(param)
  // return request(`/form/currentComponentSetting/${param}`);
}
export async function saveOrUpdate(param) {
  return param.id ? update(param) : save(param);
  // return param.id ? request(`/form/currentComponentSetting/${param.id}`, {
  //  method: 'PUT',
  //  body: param,
  // }) : request('/form/currentComponentSetting', {
  //  method: 'POST',
  //  body: param,
  // });
}
export async function removeAll(param) {
  return batchDelete(param)
  // return request(`/form/currentComponentSetting/?${stringify(param)}`, {
  //  method: 'DELETE'
  // });
}
export async function remove(param) {
  return deleteById(param);
  // return request(`/form/currentComponentSetting/${param}`, {
  //  method: 'DELETE'
  // });
}
