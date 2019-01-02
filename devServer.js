const http = require('http');
const fs = require('fs');
const mime = require('mime');
const url = require('url');
// const httpProxy = require('http-proxy');
// const proxy = httpProxy.createProxyServer({changeOrigin: true});

const listener = (req, res)=>{
  const {pathname} = url.parse(req.url, true)
  // console.log('pathname', pathname)
  res.setHeader('Content-Type', `${mime.lookup(pathname)};`)
  fs.exists(`./dist${pathname}`, (exists) => {
    if (!exists) {
      res.statusCode = 404
      res.end()
    } else {
      fs.readFile(`./dist${pathname}`, (err, data) => {
        if (!err) {
          res.end(data)
        } else {
          console.log(err)
        }
      })
    }
  })
}
const port = 8888;
const server = http.createServer(listener);
server.listen(port, () => {
  console.log(`代理服务端口：${port} 启动成功`);
})