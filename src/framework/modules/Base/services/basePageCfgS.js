import MongoService from '@framework/utils/MongoService';

const formTemplateService = new MongoService('PEP_DEVTOOLS_CUSTOMQUERY');
const {fetchByEqual} = formTemplateService;

export async function queryPageConfigByCode(param) {
  return fetchByEqual({code: param, enable: true})
}
