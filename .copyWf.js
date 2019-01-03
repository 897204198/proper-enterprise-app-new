// 把node_modules里的工作流代码拷贝到dist构建目录中

const fs = require('fs');

const { stat } = fs;
const sourcePath = './node_modules/flowable-ui-app-static-resources';
const targetPath = './dist/workflow';
if (!fs.existsSync(sourcePath)){
  console.log(`warning:${sourcePath} not find !`);
  return
}
fs.exists(targetPath, (isExist)=>{
  if (!isExist) {
    fs.mkdirSync(targetPath);
  }
  copy(sourcePath, targetPath);
})
const copy = (src, dst)=>{
  // 读取目录
  fs.readdir(src, (err, paths)=>{
    if (err) {
      throw err;
    }
    paths.forEach((path)=>{
      const _src = `${src}/${path}`;
      const _dst = `${dst}/${path}`;
      let readable;
      let writable;
      stat(_src, (err2, st)=>{
        if (err2) {
          throw err2;
        }
        // console.log(_src)
        if (st.isFile()) {
          readable = fs.createReadStream(_src);// 创建读取流
          writable = fs.createWriteStream(_dst);// 创建写入流
          readable.pipe(writable);
        } else if (st.isDirectory()) {
          console.log(_src, _dst)
          if (!fs.existsSync(_dst)) {
            fs.mkdirSync(_dst);
          }
          copy(_src, _dst);
        }
      });
    });
  });
}
