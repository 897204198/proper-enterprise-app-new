import {stringify} from 'qs';
import request from '../../../../framework/utils/request';
import MongoService from '../../../../framework/utils/MongoService';

const ${modelName}Service = new MongoService('${tableName}');
const {fetchPagable, update, save, deleteById, batchDelete} = ${modelName}Service;

export async function fetch(param) {
  return fetchPagable(param)
  // return request(\`/${routeName}/?\$\{stringify(param)\}\`);
}
export async function fetchById(param) {
  return ${modelName}Service.fetchById(param)
  // return request(\`/${routeName}/\$\{param\}\`);
}
export async function saveOrUpdate(param) {
  return param.id ? update(param) : save(param);
  // return param.id ? request(\`/${routeName}/\$\{param.id\}\`, {
  //  method: 'PUT',
  //  body: param,
  // }) : request('/${routeName}', {
  //  method: 'POST',
  //  body: param,
  // });
}
export async function removeAll(param) {
  return batchDelete(param)
  // return request(\`/${routeName}/?\$\{stringify(param)\}\`, {
  //  method: 'DELETE'
  // });
}
export async function remove(param) {
  return deleteById(param);
  // return request(\`/${routeName}/\$\{param\}\`, {
  //  method: 'DELETE'
  // });
}
