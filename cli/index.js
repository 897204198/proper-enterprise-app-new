#! /usr/bin/env node


const inputArgs = process.argv[2];
if (!inputArgs) {
  console.error('Error:', 'please input your project name');
  return
}

const fs = require('fs');

const path = require('path');

const pkg = require('./package.json');

const { stat, rename } = fs;

let fileNum = 0;

const copy = (src, dst)=>{
  // 读取目录
  fs.readdir(src, (err, paths)=>{
    if (err) {
      throw err;
    }
    paths.forEach((file)=>{
      const _src = `${src}/${file}`;
      const _dst = `${dst}/${file}`;
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
          console.log(`copy file: ${_dst}`);
          // 上传到私服的.gitignore 在全局安装脚手架后变成.npmignore 不知道为啥 很无解
          if (file === '.npmignore') {
            setTimeout(()=>{
              rename(_dst, `${dst}/.gitignore`, ()=>{
                if (!err) {
                  console.log('rename success')
                }
              });
            })
          }
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
copyFileIfExist(path.join(__dirname, 'templates'), `./${inputArgs}`, copy);
setTimeout(()=>{
  console.log(`project init successful,total: ${fileNum} files`);
  console.log(`current cli version: ${pkg.version}`);
}, 3000)
