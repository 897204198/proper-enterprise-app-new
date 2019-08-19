#! /usr/bin/env node

const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

const gitAddress = 'https://github.com/propersoft-cn/proper-enterprise-app.git'

const { stat } = fs;
const { exec } = shell;

mergeTemplate()

function removeDir(p) {
  if (fs.existsSync(p)) {
    const statObj = fs.statSync(p); // fs.statSync同步读取文件状态，判断是文件目录还是文件。
    if (statObj.isDirectory()) { // 如果是目录
      let dirs = fs.readdirSync(p) // fs.readdirSync()同步的读取目标下的文件 返回一个不包括 '.' 和 '..' 的文件名的数组['b','a']
      dirs = dirs.map(dir => path.join(p, dir)) // 拼上完整的路径
      for (let i = 0; i < dirs.length; i++) {
        // 深度 先将儿子移除掉 再删除掉自己
        removeDir(dirs[i]);
      }
      fs.rmdirSync(p); // 删除目录
    } else {
      fs.unlinkSync(p); // 删除文件
    }
  } else {
    console.log(`找不到文件夹${p}`)
  }
}

function copy(src, dst) {
  const paths = fs.readdirSync(src)
  paths.forEach((p) => {
    const _src = `${src}/${p}`;
    const _dst = `${dst}/${p}`;
    let readable;
    let writable;
    stat(_src, (error, st) => {
      if (error) {
        throw error;
      }
      if (st.isFile()) {
        readable = fs.createReadStream(_src);
        writable = fs.createWriteStream(_dst);
        readable.pipe(writable);
      } else if (st.isDirectory()) {
        exists(_src, _dst, copy);
      }
    });
  });
  console.log(`复制${dst}`)
}

function exists(src, dst, callback) {
  if (fs.existsSync(dst)) {
    callback(src, dst);
  } else {
    fs.mkdirSync(dst)
    callback(src, dst)
  }
}

function mergeTemplate() {
  exec(`git clone ${gitAddress}`, (code) => {
    if (code === 0) {
      console.log('代码下载成功')
      if(fs.existsSync('./proper-enterprise-app')) {
        removeDir('./cli/templates')
        removeDir('./proper-enterprise-app/src')
        removeDir('./proper-enterprise-app/cli')
        removeDir('./proper-enterprise-app/other')
        removeDir('./proper-enterprise-app/.git')
        removeDir('./proper-enterprise-app/LOOKUPVERSION.md')
        removeDir('./proper-enterprise-app/CONTRIBUTING.md')
        exists('./node_modules/pea-cli/templates/src', './proper-enterprise-app/src', copy)
        exists('./proper-enterprise-app', './cli/templates', copy)
        setTimeout(() => {
          removeDir('./proper-enterprise-app')
          console.log('更新完毕')
        }, 2000);
      }
    } else {
      console.log(`代码下载失败 code:${code}`)
    }
  })
}
