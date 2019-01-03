#! node

const fs = require('fs');

const PATH = require('path');

const pkg = require('./package.json');

const { stat } = fs;

let fileNum = 0;

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
        if (st.isFile()) {
          fileNum++;
          readable = fs.createReadStream(_src);// 创建读取流
          writable = fs.createWriteStream(_dst);// 创建写入流
          readable.pipe(writable);
        } else if (st.isDirectory()) {
          copyFileIfExist(_src, _dst, copy);
        }
      });
    });
  });
}
const copyFileIfExist = (src, dst, copyFn)=>{
  // 测试源文件夹下是否有文件
  fs.exists(src, (isSrcExist)=>{
    if (!isSrcExist) {
      console.error(`error:${isSrcExist}不存在`)
    } else {
      // 测试某个路径下文件是否存在
      fs.exists(dst, (isDstExist)=>{
        if (isDstExist) {
          copyFn(src, dst);
        } else {
          fs.mkdir(dst, ()=>{ // 创建目录
            copyFn(src, dst)
          })
        }
      })
    }
  })
}

console.log('init...');
copyFileIfExist(PATH.join(__dirname, 'templates'), './proper-enterprise-app', copy);
setTimeout(()=>{
  console.log(`project init successful,total: ${fileNum} files`);
  console.log(`current cli version: ${pkg.version}`);
}, 3000)
