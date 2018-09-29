import React from 'react';
import { Upload, Button, Icon, message} from 'antd';
import OopPreview from '../OopPreview';
import { getApplicationContextUrl } from '../../../framework/utils/utils';

const getFileDownloadUrl = (id)=>{
  if (id) {
    const token = window.localStorage.getItem('proper-auth-login-token');
    return `${getApplicationContextUrl()}/file/${id}?access_token=${token}`;
  }
}
const imgSuffix = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
export default class OopUpload extends React.PureComponent {
  constructor(props) {
    super(props);
    const { defaultFileList = [], value = [] } = this.props;
    const fileList = [...defaultFileList.concat(value)];
    fileList.length && fileList.forEach((item, index)=>{
      if (typeof item === 'string') {
        item = {
          id: item
        }
      }
      const {id, url, uid} = item;
      if (!uid) {
        item.uid = -(++index);
      }
      if (!url && id) {
        // 兼容http模式 base64模式 proper自己的服务器模式（即一个ID）
        item.url = (id.includes('http') || id.includes('data:image/')) ?
          id : getFileDownloadUrl(id);
        item.thumbUrl = item.url;
      }
    });
    this.state = {
      fileList,
      uploading: false,
      previewVisible: false,
      previewUrl: ''
    }
  }
  beforeUpload = (file) => {
    const { type = [], size, maxFiles = -1 } = this.props;
    if (this.state.fileList.length === maxFiles) {
      message.error(`文件上传数量已达上限${maxFiles}个`);
      return false;
    }
    const fileName = file.name.split('.').pop();
    if (type.length && !type.includes('.'.concat(fileName))) {
      message.error(`文件只能是${type.join('、')}格式!`);
      return false;
    }
    const fileSize = file.size / 1024 / 1024;
    const isLt = size ? fileSize < size : fileSize < 10;
    if (!isLt) {
      message.error(`文件必须小于${size ? (size > 1 ? size : size * 1024) : 10}${(size && size < 1) ? 'KB' : 'M'}!`);
      return isLt;
    }
    this.setState(({ fileList }) => ({
      fileList: [...fileList, file],
      uploading: true
    }));
    return true;
  }

  defaultExtra = ()=>{
    const {uploading} = this.state;
    return (
    <Button disabled={uploading}>
      <Icon type={uploading ? 'loading' : 'upload'} />
      {uploading ? '上传中...' : (this.props.buttonText ? this.props.buttonText : '点击上传')}
    </Button>);
  };
  getInitProps = ()=>{
    const extra = this.defaultExtra();
    const defaultProps = {
      name: 'file',
      action: `${getApplicationContextUrl()}/file`,
      beforeUpload: this.beforeUpload,
      fileList: this.state.fileList,
      showUploadList: {
        showRemoveIcon: !this.props.disabled,
        showPreviewIcon: true
      },
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        }, ()=>{
          onChange && onChange(this.state.fileList.map(it=>({
            id: it.id,
            name: it.name,
            url: it.url,
            uid: it.uid,
          })));
        });
      },
      onPreview: (file)=>{
        const fileNameSuffix = file.name.split('.').pop();
        // 只有图片的情况再预览
        if (imgSuffix.includes(fileNameSuffix)) {
          this.setState({
            previewUrl: file.url
          }, ()=>{
            setTimeout(()=>{
              this.setState({
                previewVisible: true
              })
            });
          });
        } else {
          const downloadUrl = getFileDownloadUrl(file.id);
          let a = document.createElement('a');
          a.href = downloadUrl;
          a.target = '_blank';
          a.click();
          a = null;
        }
      },
      extra,
      ...this.props
    };
    const token = window.localStorage.getItem('proper-auth-login-token');
    defaultProps.headers = {
      'X-PEP-TOKEN': token
    }
    const {onChange} = defaultProps;
    defaultProps.onChange = (info)=> {
      if (info.file.status === 'done') {
        message.success('上传成功!');
        const {file: {response}, fileList} = info;
        const lastFile = fileList[fileList.length - 1];
        lastFile.id = response;
        lastFile.url = getFileDownloadUrl(response);
        this.setState(() => ({
          fileList: [...fileList],
          uploading: false
        }), ()=>{
          onChange && onChange(this.state.fileList.map(it=>({
            id: it.id,
            name: it.name,
            url: it.url,
            uid: it.uid,
          })));
        });
      } else if (info.file.status === 'error') {
        if (info.file.error && info.file.error.status === 401) {
          // TODO 处理401
        }
        message.error('上传失败!');
        this.setState({
          uploading: false
        })
      }
    }
    return defaultProps;
  }
  preViewPic = ()=>{
    this.setState({
      previewVisible: false,
    }, ()=>{
      setTimeout(()=>{
        this.setState({
          previewUrl: ''
        })
      }, 300);
    })
  }
  render() {
    const props = this.getInitProps();
    const {previewVisible, previewUrl} = this.state;
    return (
      <div>
        <Upload {...props}>
          {props.extra}
        </Upload>
        {previewVisible ? (
        <OopPreview
          visible={previewVisible}
          onCancel={() => this.preViewPic()}
          img={{
            src: previewUrl,
            alt: '预览'
          }}
        />) : null}
      </div>
    );
  }
}
