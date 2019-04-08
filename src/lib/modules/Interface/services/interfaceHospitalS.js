/* eslint-disable*/
import {stringify} from 'qs';
import request from '@framework/utils/request';
import MongoService from '@framework/utils/MongoService';

const interfaceHospitalService = new MongoService('PEP_INTERFACE_HOSPITAL');
const {fetchPagable, update, save, deleteById, batchDelete} = interfaceHospitalService;

export async function fetch(param) {
  return fetchPagable(param)
  // return request(`/interface/hospital/?${stringify(param)}`);
}
export async function fetchById(param) {
  return interfaceHospitalService.fetchById(param)
  // return request(`/interface/hospital/${param}`);
}
export async function saveOrUpdate(param) {
  return param.id ? update(param) : save(param);
  // return param.id ? request(`/interface/hospital/${param.id}`, {
  //  method: 'PUT',
  //  body: param,
  // }) : request('/interface/hospital', {
  //  method: 'POST',
  //  body: param,
  // });
}
export async function removeAll(param) {
  return batchDelete(param)
  // return request(`/interface/hospital/?${stringify(param)}`, {
  //  method: 'DELETE'
  // });
}
export async function remove(param) {
  return deleteById(param);
  // return request(`/interface/hospital/${param}`, {
  //  method: 'DELETE'
  // });
}
