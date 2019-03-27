
category | type | title | subtitle 
| -------- | -----: | :----:|  :----: |
Components | Data Entry | OopUpload | 上传图片 |

文件选择上传和拖拽上传控件。

## 何时使用

上传是将信息（网页、文字、图片、视频等）通过网页或者上传工具发布到远程服务器上的过程。

- 当需要上传一个或一些文件时。
- 当需要展现上传的进度时。
- 当需要使用拖拽交互时。

## API
#### OopUpload
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| extra | 上传按钮的自定义形式 | ReactNode | - |
| type | 支持上传文件的类型 | string[] (例如：['.jpg','.png','.jpeg']) | - |
| size | 限制上传图片的大小 | string | - |
| maxFiles | 上传文件的个数 | string | -1 |
| wrapperStyles | 容器样式 | object | - |
| dragable | 可拖拽上传 | boolean | false |
| hideMessage | 隐藏上传结果全局提示 | boolean | false |
其他属性详见[upload](https://ant.design/components/upload-cn/)
