import app from '@framework/index';
import {dependencies} from '@/config/config';
import {message} from 'antd';

// 在加载Router页面 connect属性之前 注入当前Router页面需要的model
export const inject = (url)=> {
  const registeredModels = app._models;
  let arrParam = [];
  if (Array.isArray(url)) {
    arrParam = url
  } else {
    arrParam.push(url)
  }
  const loadModel = (dependArr)=> {
    dependArr.forEach((modelUrl)=> {
      if (!registeredModels.some(model => model.namespace === modelUrl)) {
        const model = getDvaModelByModelUrlAndDepdecs(modelUrl, dependencies);
        if (model) {
          app.model(model);
        }
      }
    })
  }
  return ()=>{
    loadModel(arrParam)
  }
}
// 通过modelUrl解析出modelName
// 如通过authUser解析出Auth
const reg = /^[A-Z]+$/;
const parseModuleNameByModelUrl = (modelUrl) => {
  let result = ''
  const arr = [];
  const letters = modelUrl.split('');
  for (let i = 0; i < letters.length; i++) {
    const l = letters[i];
    if (!reg.test(l)) {
      arr.push(l)
    } else {
      break
    }
  }
  if (arr.length) {
    arr[0] = arr[0].toUpperCase()
    result = arr.join('');
  }
  return result;
}
function is404Exception(errMsg) {
  return errMsg.includes('Cannot find module');
}
function getModel(modelUrl, root) {
  if (modelUrl.includes('$')) {
    if (root) {
      try { // 这块不try catch 构建会报错 下同
        return require(`@proper/${root}-lib/components/${modelUrl.split('$').join('/')}`);
      } catch (e) {
        throw e;
      }
    }
    return require(`@/lib/components/${modelUrl.split('$').join('/')}`);
  } else {
    const modelName = parseModuleNameByModelUrl(modelUrl);
    if (modelName) {
      if (root) {
        try {
          return require(`@proper/${root}-lib/modules/${modelName}/models/${modelUrl}`);
        } catch (e) {
          throw e;
        }
      }
      return require(`@/lib/modules/${modelName}/models/${modelUrl}`);
    }
  }
}
// 获取model通过modelUrl和依赖
const getDvaModelByModelUrlAndDepdecs = (modelUrl, depdecs = []) =>{
  // 带有model组件的model注入 带 $ 属于webapp下的组件中的model注入  其他的是正常的业务模块注入
  let model = null;
  try {
    model = getModel(modelUrl);
  } catch (e) {
    if (is404Exception(e.message) && depdecs.length) {
      for (let i = depdecs.length - 1; i >= 0; i--) {
        const root = depdecs[i];
        try {
          model = getModel(modelUrl, root);
          break;
        } catch (err) {
          if (!is404Exception(err.message)) {
            console.error(e);
            message.error(e.message);
            throw e;
          }
        }
      }
    } else {
      console.error(e);
      message.error(e.message);
      throw e;
    }
  }
  return model.default;
}
