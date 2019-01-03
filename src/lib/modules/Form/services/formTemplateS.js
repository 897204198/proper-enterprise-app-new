import MongoService from '../../../../framework/utils/MongoService';

const formTemplateService = new MongoService('PEP_FORM_TEMPLATE');
const {fetchById, update, save, deleteById, fetchByEqual} = formTemplateService;

export async function queryFormTemplate() {
  return formTemplateService.fetch((query)=>{
    query.addAscending('CT').addAscending('name');
  })
}
export async function queryTemplateById(param) {
  return fetchById(param)
  // return request(`*/form/template/${param}`);
}
export async function saveOrUpdateTemplate(param) {
  return param.id ? update(param) : save(param);
  // return param.id ? request(`/form/template/${param.id}`, {
  //   method: 'PUT',
  //   body: param,
  // }) : request('/form/template', {
  //   method: 'POST',
  //   body: param,
  // });
}
export async function deleteTemplate(param) {
  return deleteById(param);
  // return request(`/form/template/${param}`, {
  //   method: 'DELETE'
  // });
}
export async function updateTemplateFormDetails(param) {
  const {id, formDetails} = param;
  return update({id, formDetails: JSON.stringify(formDetails)});
  // return request(`/form/template/${param.id}/formDetails`, {
  //   method: 'PUT',
  //   body: param.formDetails,
  // })
}

export async function queryTemplateByFormkeydefinition(param) {
  return fetchByEqual({formkeydefinition: param});
}
