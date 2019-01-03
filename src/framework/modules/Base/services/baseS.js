import {stringify} from 'qs';
import request from '../../../../framework/utils/request';

export async function query() {
  return request('/users');
}
export async function queryCurrent() {
  return request('/auth/current/user');
}
export async function queryCurrentMenus() {
  return request('/auth/menus?menuEnable=ENABLE');
}
export async function login(params) {
  return request('/auth/login', {
    method: 'POST',
    body: params,
  });
}
export async function fakeRegister(params) {
  return request('/register', {
    method: 'POST',
    body: params,
  });
}
export async function queryNotices() {
  return request('/notices');
}
export async function searchSuggest(params) {
  return request(`/search/inverse?${stringify(params)}`);
}
export async function searchResult(params) {
  // TODO 不这样写  列表不出数据
  // begin
  if (params.moduleName === 'devtoolsappver') {
    return request(`/admin/app/versions?${stringify(params)}`);
  }
  // if (params.moduleName === 'authroles') {
  //   return request(`/auth/roles?${stringify(params)}`);
  // }
  // end
  return request(`/search/query?${stringify(params)}`);
}
export async function fakeChartData() {
  return request('/fake_chart_data');
}
