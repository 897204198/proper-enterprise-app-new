/**
 * 输出项目alias路径提示
 */
const fs = require('fs');

exports.generateAlias = (webpackConfig) => {
  fs.readFile('./webpackAlias.txt', 'utf8', (err) => {
    if (err) {
      const { alias } = webpackConfig.resolve
      let tempStr = ''
      for (const key in alias) {
        tempStr += `${key}: ${alias[key]}\r\n`
      }
      fs.writeFile('./webpackAlias.txt', tempStr, (error) => {
        if (error) {
          console.log(error);
        }
      })
    }
  })
}

