const fs = require('fs');
const path = require('path');
const config = require('./config');
const parse = require('./util');

const {readdir} = fs;
// 浏览器的路由路径
const { routePath, formConfig, gridConfig} = config;
// moduleName: 模块名称, modelName: dva中的model名称, pageName: 页面的page入口文件名称 tableName: mongo的表名
const {moduleName, modelName, pageName, tableName} = parse(routePath);

console.log(`当前路由为${routePath},代码生成开始...`);
// 当前工程中业务模块的路径
const modulePath = './src/lib/modules';
// dva中的model模板的路径
const modelTplPath = './producer/tpl/model.tpl';
// 页面的page入口文件模板的路径
const pageTplPath = './producer/tpl/page.tpl';
// 页面的service文件模板的路径
const serviceTplPath = './producer/tpl/service.tpl';
// 读取文件
const readFile = (filePath, callback)=>{
  fs.readFile(filePath, 'utf-8', (err, res)=> {
    if (err) {
      console.error(err);
      return
    }
    callback && callback(res)
  })
}
const writeFile = (filePath, data, callback)=>{
  fs.writeFile(filePath, data, (err, res)=> {
    if (err) {
      console.error(err);
      return
    }
    callback && callback(res)
  })
}
// 替换tpl中的模板字符串${}
const replaceFileTemplateStr = (str, variableName, name)=>{
  const content = 'return'.concat('`').concat(str).concat('`');
  const fun = new Function(variableName, content);
  return fun(name);
}

const getReplaceFunction = (str, ...variableName)=>{
  return Function.call(null, variableName, 'return'.concat('`').concat(str).concat('`'))
}
// 把JSON.stringify()返回的json串 格式化成 eslint设置的格式
const formatJsonStr = (str)=>{
  return str.replace(/"/g,"'").replace(/{'/g,"{").replace(/,'/g,", ").replace(/':/g,": ");
}

// 写入一个model文件
const generateFile = (content, fileName, type, callback)=>{
  readdir(`${modulePath}/${moduleName}`, (err, paths)=>{
    if (err) {
      fs.mkdirSync(`${modulePath}/${moduleName}`);
      console.log(`【/${moduleName}】目录创建成功。`)
      fs.mkdirSync(`${modulePath}/${moduleName}/${type}`);
      console.log(`【/${moduleName}/${type}】目录创建成功。`)
    } else {
      if (!paths.includes(type)) {
        fs.mkdirSync(`${modulePath}/${moduleName}/${type}`);
        console.log(`【/${moduleName}/${type}】目录创建成功。`);
      }
    }
    writeFile(`${modulePath}/${moduleName}/${type}/${fileName}.js`, content, (res)=>{
      console.log(`======${modulePath}/${moduleName}/${type}/${fileName}.js====== ${fileName}.js文件创建成功!!!`);
      callback && callback()
    })
  })
}

// 生成model
readFile(modelTplPath, (str)=>{
  const content = replaceFileTemplateStr(str, 'modelName', modelName);
  generateFile(content, modelName, 'models',f=>{
    // 生成page
    readFile(pageTplPath, (str)=>{
      //const content = replaceFileTemplateStr(str, 'modelName', modelName);
      const content = getReplaceFunction(str, 'modelName', 'formConfig', 'gridConfig')(modelName, formatJsonStr(JSON.stringify(formConfig)), formatJsonStr(JSON.stringify(gridConfig)));
      generateFile(content, pageName, 'pages', f=>{
        // 生成service
        readFile(serviceTplPath, (str)=>{
          const content = getReplaceFunction(str, 'routeName', 'modelName', 'tableName')(routePath, modelName, tableName);
          generateFile(content, `${modelName}S`, 'services', f=>{
            console.log('代码生成结束###')
          });
        });
      });
    });
  });
});
