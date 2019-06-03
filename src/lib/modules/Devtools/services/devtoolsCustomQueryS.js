// import {stringify} from 'qs';
// import request from '@framework/utils/request';
import MongoService from '@framework/utils/MongoService';

const customQueryService = new MongoService('PEP_DEVTOOLS_CUSTOMQUERY');
const {fetchPagable, update, save, deleteById, batchDelete, fetchByEqual} = customQueryService;

export async function fetch(param) {
  return fetchPagable(param)
}
export async function fetchById(param) {
  return customQueryService.fetchById(param)
}
export async function saveOrUpdate(param) {
  return param.id ? update(param) : save(param);
}
export async function removeAll(param) {
  return batchDelete(param)
}
export async function remove(param) {
  return deleteById(param.id);
}
export async function queryFormTemplate() {
  return customQueryService.fetch((query)=>{
    query.addDescending('CT');
  })
}
export async function queryTemplateById(param) {
  return fetchById(param)
  // return request(`*/form/template/${param}`);
}
export async function saveOrUpdateTemplate(param) {
  return param.id ? update(param) : save(param);
}
export async function deleteTemplate(param) {
  return deleteById(param);
}
export async function updateFormConfig(param) {
  return update(param);
}

export async function checkCodeRepeat(param) {
  return fetchByEqual({code: param});
}
export async function checkTableNameRepeat(param) {
  return fetchByEqual({tableName: param});
}