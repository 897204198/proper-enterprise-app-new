import MongoService from '@framework/utils/MongoService';

const pupaCfgService = new MongoService('PEP_DEVTOOLS_CUSTOMQUERY');
const {fetchByEqual} = pupaCfgService;

export async function queryPageConfigByCode(param) {
  return fetchByEqual({code: param});
}

export async function queryPageConfigByWfKey(param) {
  return fetchByEqual({...param});
}
