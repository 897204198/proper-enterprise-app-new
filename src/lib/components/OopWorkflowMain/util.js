import {dependencies} from '@/config/config';

// 根据表单的权限设置 过滤掉不显示的字段 或者 设置某些字段为只读
export const authorityFormField = (formConfig)=>{
  const {formJson, formProperties} = formConfig;
  if (formProperties) {
    const filter = (it)=>{
      if (formProperties[it.name]) {
        const {props = {}} = it.component;
        props.disabled = !formProperties[it.name].writable;
        it.component.props = {
          ...it.component.props,
          ...props
        }
        if (!it.rules) {
          it.rules = [];
        }
        it.rules = [...it.rules];
        it.rules.push({required: formProperties[it.name].require, message: '此项为必填项'})
        return it
      }
    }
    formConfig.formJson = formJson.map(filter).filter(it=>it !== undefined);
  }
};

// 根据工作流中配置的表单相对路径获取真实表单的方法
export const getWorkflowFormByFormPath = (formPath)=>{
  if (formPath) {
    let route = null;
    try {
      route = require(`@/lib/modules/${formPath}`);
    } catch (e) {
      if (is404Exception(e.message)) {
        if (length === 0) {
          handleError(formPath, e);
        } else {
          for (let i = length - 1; i >= 0; i--) {
            try {
              const root = dependencies[i];
              route = require(`@proper/${root}-lib/modules/${formPath}`);
              break;
            } catch (err) {
              if (!is404Exception(err.message)) {
                handleError(formPath, err);
                break;
              }
            }
          }
        }
      } else {
        handleError(formPath, e)
      }
    }
    return route;
  }
}


function is404Exception(errMsg) {
  return errMsg.includes('Cannot find module');
}

function handleError(formPath, err) {
  if (is404Exception(err.message)) {
    console.error(`No matching page found named '/${formPath}'`);
    window.location.hash = '#/404';
  } else {
    console.error(err);
  }
}
