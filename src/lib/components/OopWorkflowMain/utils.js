import {dependencies} from '@/config/config';
import {message} from 'antd';

// 根据表单的权限设置 过滤掉不显示的字段 或者 设置某些字段为只读
export const authorityFormField = (formConfig)=>{
  const {formJson = [], formProperties} = formConfig;
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
  let route = null;
  if (formPath) {
    let path = formPath.charAt(0) === '/' ? formPath : `/${formPath}`;
    if (!path.includes('.jsx')) {
      path += '.jsx';
    }
    try {
      route = require(`@/lib/modules${path}`);
    } catch (e) {
      if (is404Exception(e.message)) {
        if (length === 0) {
          handleError(path, e);
        } else {
          for (let i = length - 1; i >= 0; i--) {
            try {
              const root = dependencies[i];
              route = require(`@proper/${root}-lib/modules${path}`);
              break;
            } catch (err) {
              if (!is404Exception(err.message)) {
                handleError(path, err);
                break;
              }
            }
          }
        }
      } else {
        handleError(path, e)
      }
    }
  }
  return route;
}


function is404Exception(errMsg) {
  return errMsg.includes('Cannot find module');
}

function handleError(path, err) {
  if (is404Exception(err.message)) {
    const errMsg = `No matching page found named '${path}'`;
    console.error(errMsg);
    message.error(errMsg);
  } else {
    console.error(err);
  }
}
