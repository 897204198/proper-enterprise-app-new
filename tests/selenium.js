const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 解析需要遍历的文件夹，我这以E盘根目录为例
const filePath = path.resolve('./tests/modules');

console.log(filePath)
const fileResult = []

readDirSync(filePath)

execute()
// console.log(fileResult)


function execute() {
  for (let i = 0; i < fileResult.length; i++) {
    console.log(fileResult[i])
    execSync(`selenium-side-runner ${fileResult[i]} --output-directory=result --output-format=junit -c "browserName=chrome chromeOptions.binary='/opt/google/chrome/chrome'  chromeOptions.args=[disable-infobars,--no-sandbox,--headless,--disable-dev-shm-usage,--disable-gpu,--disable-extensions]"`)
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