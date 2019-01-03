import app from '../index';

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
        const modelName = parseModuleNameByModelUrl(modelUrl);
        if (modelName) {
          try {
            // 正常的业务代码的model注入
            const model = require(`../../lib/modules/${modelName}/models/${modelUrl}`).default;
            app.model(model);
          } catch (e) {
            // 系统内置的代码的model注入
            const model = require(`../modules/${modelName}/models/${modelUrl}`).default;
            app.model(model);
          }
        }
        // 带有model组件的model注入 包括lib的Oop系列和WebApp系列
        if (modelUrl.includes('$')) {
          const model = require(`../../lib/components/${modelUrl.split('$').join('/')}`).default;
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
