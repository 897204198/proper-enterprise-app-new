import MongoService from '../../../../framework/utils/MongoService';
import request from '../../../../framework/utils/request';


const formTemplateService = new MongoService('PEP_FORM_TEMPLATE');

export async function fetchByFormCode(param) {
  return formTemplateService.fetchByEqual({
    formkeydefinition: param
  })
}
export async function launchWorkflow(params) {
  const {taskOrProcDefKey, formData} = params;
  return request(`/workflow/process/${taskOrProcDefKey}`, {
    method: 'POST',
    body: formData,
  });
}
export async function submitWorkflow(params) {
  const {taskOrProcDefKey, formData} = params;
  return request(`/workflow/task/${taskOrProcDefKey}`, {
    method: 'POST',
    body: formData,
  });
}
export async function fetchProcessProgress(params) {
  return request(`/workflow/process/${params}/path`);
}
