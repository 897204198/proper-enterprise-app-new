const fs = require('fs');
const SCP = require('simple-scp');
const path = require('path');
const { execSync } = require('child_process');

// 解析需要遍历的文件夹，我这以E盘根目录为例
const filePath = path.resolve('./tests/modules');
const seleniumRunnerPath = path.resolve('./node_modules/proper-selenium-side-runner/dist/index.js');
// const resultPath = path.resolve('./result/html-report');

const serverConfig = {
  up: {
    host: '59.110.140.112',
    port: 22022,
    username: 'root',
    password: 'ds@Proper20!^'
  }
};

const fileResult = []
// const errPath = []
readDirSync(filePath)

execute()
// console.log(fileResult)

function execute() {
  const errs = [];
  for (let i = 0; i < fileResult.length; i++) {
    try {
      // execSync(`node ${seleniumRunnerPath} ${fileResult[i]} --output-directory=result --output-html=true --output-format=junit -c "browserName=chrome chromeOptions.binary='/opt/google/chrome/chrome'  chromeOptions.args=[disable-infobars,--no-sandbox,--headless,--disable-dev-shm-usage,--disable-gpu,--disable-extensions]"`)
      execSync(`node ${seleniumRunnerPath} ${fileResult[i]} --output-directory=result --output-html=true --output-format=junit`)
    } catch (ex) {
      errs.push(ex);
      // errPath.push(fileResult[i]);
      console.log('此用例失败')
    }
    if (i === fileResult.length - 1 && errs.length > 0) {
      const deploy = new SCP(serverConfig.up);
      deploy.dest('./result/html-report/', '/root/');
      // throw errs
    }
  }
}

function readDirSync(pathItem) {
  const pa = fs.readdirSync(pathItem);
  pa.forEach((ele) => {
    const info = fs.statSync(`${pathItem}/${ele}`)
    if (info.isDirectory()) {
      readDirSync(`${pathItem}/${ele}`);
    } else {
      fileResult.push((`${pathItem}/${ele}`).replace(/\\/g, '/'))
    }
  })
}