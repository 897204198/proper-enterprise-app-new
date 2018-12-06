import React from 'react';
import moment from 'moment';
import {connect} from 'dva';
import { Card, Modal, Popover, Breadcrumb, Icon, message, Upload, Button, Input, Popconfirm } from 'antd';
import { inject } from '@/framework/common/inject';
import { oopToast } from '@/framework/common/oopUtils';
import PageHeaderLayout from '@/framework/components/PageHeaderLayout';
import { getApplicationContextUrl } from '@/framework/utils/utils';
// import OopSearch from '@/lib/components/OopSearch';
import OopTable from '@/lib/components/OopTable';
import styles from './index.less';

import iconDir from './assets/dir.png'
import iconEtc from './assets/etc.png'
import iconExcel from './assets/excel.png'
import iconPdf from './assets/pdf.png'
import iconPng from './assets/png.png'
import iconPpt from './assets/ppt.png'
import iconPwf from './assets/pwf.png'
import iconTxt from './assets/txt.png'
import iconWord from './assets/word.png'
import iconZip from './assets/zip.png'

// const primaryColor = require('@/config/theme.js')['primary-color']

const { Item } = Breadcrumb
const { Dragger } = Upload

const sortMap = {
  ascend: 'ASC',
  descend: 'DESC'
}
const token = window.localStorage.getItem('proper-auth-login-token')
const removeFailUploadFile = (fileList) => {
  setTimeout(() => {
    if (fileList.length) {
      fileList[fileList.length - 1].classList.add('remove')
      setTimeout(() => {
        fileList[fileList.length - 1].remove()
      }, 8000)
      removeFailUploadFile(fileList)
    }
  }, 5000)
}
const limitInputCharLen = (str, maxLen) => {
  let w = 0;
  // length 获取字数数，不区分汉子和英文
  for (let i = 0; i < str.length; i++) {
    // charCodeAt()获取字符串中某一个字符的编码
    const c = str.charCodeAt(i);
    // 单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f) || (c >= 48 && c <= 57)) {
      w++;
    } else {
      w += 3;
    }
  }
  return w > maxLen
}

const UploadComponent = (props) => {
  const { onChange, changeFolder, curPath } = props
  const uploadProps = {
    name: 'file',
    multiple: true,
    action: `${getApplicationContextUrl()}/file?path=${curPath}/`,
    headers: {
      'X-PEP-TOKEN': token
    },
    beforeUpload(file) {
      console.log(file)
      const canUpload = file.size / 1024 / 1024 < 10;
      if (!canUpload) {
        message.error('文件大小不能大于10MB');
        const fileItem = document.querySelectorAll('.ant-upload-list-item-undefined')
        removeFailUploadFile(fileItem)
      }
      return canUpload
    },
    onChange(info) {
      const { file: { status, response } } = info;
      if (status !== 'uploading') {
        // console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} 文件成功上传至${curPath}`)
        onChange(info)
        changeFolder(curPath)
      } else if (status === 'error') {
        message.error(`${info.file.name} ${response || '文件上传失败'}`)
      }
    }
  }
  return (
    <Dragger {...uploadProps}>
      <p className="ant-upload-text"><Icon type="plus-square" style={{ fontSize: '16px', verticalAlign: 'text-bottom', marginRight: '10px' }} />点击选择或拖拽文件到此区域上传</p>
    </Dragger>
  )
}
// const UploadModal = (props) => {
//   const { curPath, visible, onCancel, onOk, onChange } = props
//   const uploadProps = {
//     name: 'file',
//     multiple: true,
//     action: `${getApplicationContextUrl()}/file`,
//     onChange(info) {
//       const { file: { status } } = info;
//       if (status !== 'uploading') {
//         console.log(info.file, info.fileList);
//       }
//       if (status === 'done') {
//         message.success(`${info.file.name} file uploaded successfully.`)
//         onChange(info)
//       } else if (status === 'error') {
//         message.error(`${info.file.name} file upload failed.`)
//       }
//     }
//   }
//   return (
//     <Modal
//       title={`上传文件至 ${curPath}`}
//       visible={visible}
//       width={600}
//       onCancel={onCancel}
//       onOk={onOk}
//     >
//       <Dragger {...uploadProps}>
//         <p className="ant-upload-drag-icon">
//           <Icon type="inbox" />
//         </p>
//         <p className="ant-upload-text">点击选择或拖拽文件到此区域上传</p>
//       </Dragger>
//     </Modal>
//   )
// }
const FolderModal = (props) => {
  const { isCreate, curEditFolder, visible, onCancel, onOk, onDelete } = props
  curEditFolder.dir = true
  return (
    <Modal
      title={isCreate ? '新建文件夹' : '编辑文件夹'}
      visible={visible}
      width={600}
      onCancel={onCancel}
      footer={[
        (
          isCreate ? null : (
            <Popconfirm
              key="delete"
              title="确认删除吗？"
              onConfirm={() => onDelete(curEditFolder)}>
              <Button style={{float: 'left'}} type="danger">删除</Button>
            </Popconfirm>
          )
        ),
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="submit" type="primary" onClick={() => onOk(isCreate)}>
          确定
        </Button>
      ]}
    >
      {
        visible ? (
          <Input
            id="folderNameInput"
            placeholder="请输入文件夹名称"
            maxLength={24}
            defaultValue={isCreate ? '' : curEditFolder.fileName}
          />
        ) : null
      }
    </Modal>
  )
}
const renderFileImg = (fileType) => {
  switch (fileType) {
    case 'dir':
      return iconDir;
    case 'etc':
      return iconEtc;
    case 'excel':
      return iconExcel;
    case 'pdf':
      return iconPdf;
    case 'png':
      return iconPng;
    case 'ppt':
      return iconPpt;
    case 'pwf':
      return iconPwf;
    case 'txt':
      return iconTxt;
    case 'word':
      return iconWord;
    case 'zip':
      return iconZip;
    default:
      return iconEtc;
  }
}
@inject(['netdisk', 'global'])
@connect(({netdisk, global, loading}) => ({
  netdisk,
  global,
  loading: loading.models.netdisk,
}))
export default class Netdisk extends React.PureComponent {
  state = {
    folderModalVisible: false,
    // uploadModalVisible: false,
    // curUser: '',
    curPath: '',
    curEditFolder: {
      id: '',
      fileName: ''
    },
    isCreate: true,
    owner: {
      id: '',
      name: ''
    }
  }
  componentDidMount() {
    // this.getCurUser()
    this.getOwner()
    // this.changeFolder('')
  }
  // getCurUser = () => {
  //   const me = this
  //   this.props.dispatch({
  //     type: 'netdisk/queryOwner',
  //     payload: {type: 'my'},
  //     callback(res) {
  //       me.setState({
  //         curUser: res.result.id
  //       })
  //     }
  //   })
  // }
  getOwner = () => {
    const { owner } = this.props
    const ownerName = {
      my: '我的网盘',
      org: '部门网盘',
      public: '公共网盘'
    }
    const me = this
    this.props.dispatch({
      type: 'netdisk/queryOwner',
      payload: {type: owner},
      callback(res) {
        me.setState({
          owner: {
            id: res.result.id,
            name: ownerName[owner]
          }
        })
        me.changeFolder(res.result.id)
      }
    })
  }
  onEdit = (record) => {
    this.setState({
      folderModalVisible: true,
      isCreate: false,
      curEditFolder: {
        id: record.id,
        fileName: record.fileName
      }
    })
  }
  batchDelete = (ids, items) => {
    const { curPath } = this.state
    const me = this;
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${items.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const dirs = items.filter(item => item.dir === true).map(it => it.id)
        const files = items.filter(item => item.dir !== true).map(it => it.id)
        dirs.length && me.props.dispatch({
          type: 'netdisk/deleteDir',
          payload: {ids: dirs},
          callback(res) {
            oopToast(res, '删除文件夹成功', '删除文件夹失败')
            me.oopTable.clearSelection()
            me.changeFolder(curPath)
          }
        })
        files.length && me.props.dispatch({
          type: 'netdisk/deleteFile',
          payload: {ids: files},
          callback(res) {
            oopToast(res, '删除文件成功', '删除文件失败')
            me.oopTable.clearSelection()
            me.changeFolder(curPath)
          }
        })
      }
    })
  }
  onDelete = (record) => {
    const { curPath } = this.state
    const type = record.dir ? 'deleteDir' : 'deleteFile'
    const me = this
    me.props.dispatch({
      type: `netdisk/${type}`,
      payload: {ids: record.id},
      callback(res) {
        oopToast(res, '删除成功', '删除失败')
        this.setState({
          folderModalVisible: false
        })
        me.changeFolder(`${curPath}`)
      }
    })
  }
  handleUploadChange = () => {
    const fileItem = document.querySelectorAll('.ant-upload-list-item-done')
    removeFailUploadFile(fileItem)
  }
  // handleUploadOk = () => {
  //   this.setState({
  //     uploadModalVisible: false
  //   })
  // }
  // handleUploadCancel = () => {
  //   this.setState({
  //     uploadModalVisible: false
  //   })
  // }
  handleFolderOk = (isCreate) => {
    const { curPath, owner, curEditFolder } = this.state
    const fileName = document.getElementById('folderNameInput').value.trim() || '新建文件夹'
    if (/[/]/.test(fileName)) {
      oopToast({status: '1'}, '成功', '文件夹名称不可包含 "/" 符号', 5)
      return
    }
    if (limitInputCharLen(fileName, 24)) {
      oopToast({status: '1'}, '成功', '文件夹名称长度为8个汉字或24个字母', 5)
      return
    }
    const action = isCreate ? 'addDir' : 'editDir'
    const filePath = curPath ? `${curPath}` : `${owner.id}`
    const me = this
    if (fileName) {
      this.props.dispatch({
        type: `netdisk/${action}`,
        payload: {
          path: `${filePath}/`,
          fileName,
          id: curEditFolder.id
        },
        callback: (res)=>{
          oopToast(res, `${isCreate ? '新建' : '编辑'}成功`, res.result)
          this.setState({
            folderModalVisible: false
          })
          me.changeFolder(`${filePath}`)
        }
      })
    } else {
      oopToast({status: '1'}, '成功', '文件夹名称不能为空')
    }
  }
  handleFolderCancel = () => {
    this.setState({
      folderModalVisible: false
    })
  }
  changeFolder = (path) => {
    this.setState({
      curPath: path
    })
    this.props.dispatch({
      type: 'netdisk/queryBreadcrumb',
      payload: {
        path
      }
    })
    this.props.dispatch({
      type: 'netdisk/queryFileList',
      payload: {
        path
      }
    })
  }
  createBreadcrumb = (breadcrumb) => {
    const { owner } = this.state
    const list = breadcrumb.length && breadcrumb.length > 4 ? breadcrumb.slice(-4) : breadcrumb
    return (
      <Breadcrumb separator=">">
        <Item key={owner.name}><a onClick={() => this.changeFolder(owner.id)}>{owner.name}</a></Item>
        {
          breadcrumb.length > 4 ? <Item key={owner.id}>...</Item> : null
        }
        {
          list.length ? list.map((listItem, index) => {
            return (
              <Item key={listItem.id}>
                {
                  index === list.length - 1 ?
                  listItem.name :
                  <a onClick={() => this.changeFolder(`${owner.id}${listItem.path}`)}>{listItem.name}</a>
                }
              </Item>
            )
          }) : null
        }
      </Breadcrumb>
    )
  }
  // closeUploadModal = () => {
  //   this.setState({
  //     uploadModalVisible: false
  //   })
  // }
  onLoad = (config) => {
    const { curPath } = this.state
    const { pagination: { sorter: {field, order} } } = config
    if (field === 'fileName') {
      this.props.dispatch({
        type: 'netdisk/queryFileList',
        payload: {
          path: curPath,
          direction: sortMap[order],
          property: field
        }
      })
    }
  }
  render() {
    const curToken = window.localStorage.getItem('proper-auth-login-token')
    const {
      netdisk: { fileList, breadcrumb },
      loading,
      global: { size }
    } = this.props;
    const { isCreate, owner, curPath, curEditFolder, folderModalVisible } = this.state
    const column = [
      {
        title: '文件名称',
        dataIndex: 'fileName',
        key: 'fileName',
        sorter: true,
        render: (text, record) => {
          const { id, path, fileType, dir, fileName } = record
          let name = fileName
          if (dir && fileName.length > 8) {
            name = `${fileName.substr(0, 8)}...`
          }
          if (!dir && fileName.split('.')[0].length > 8) {
            name = `${fileName.split('.')[0].substr(0, 5)}... .${fileName.split('.')[1]}`
          }
          return (
            <div>
              <img src={renderFileImg(fileType)} style={{width: '22px', marginRight: '8px'}} alt="图标" />
              {
                record.dir ?
                <a className={styles.fileName} onClick={() => this.changeFolder(`${path}${fileName}`)}>{name}</a> :
                <a className={styles.fileName} href={`${getApplicationContextUrl()}/file/${id}?access_token=${curToken}`}>{name}</a>
              }
            </div>
          )
        }
      },
      {
        title: '最后更新时间',
        dataIndex: 'lastModifyTime',
        className: styles.wordDetail,
        key: 'lastModifyTime',
        sorter: ((a, b) => {
          if (a.dir === b.dir) {
            return moment(a.lastModifyTime) > moment(b.lastModifyTime) ? 1 : -1
          } else {
            return 0
          }
        }),
        render: (text) => {
          return (
            <Popover content={text} placement="bottom">
              <span>{text}</span>
            </Popover>
          )
        }
      },
      {
        title: '文件大小',
        dataIndex: 'fileSizeUnit',
        sorter: (a, b) => {
          if (a.dir === b.dir) {
            return parseInt(a.fileSize, 10) - parseInt(b.fileSize, 10)
          } else {
            return 0
          }
        }
      }
    ]
    const topButtons = [
      // {
      //   text: '上传',
      //   name: 'upload',
      //   type: 'primary',
      //   icon: 'upload',
      //   onClick: () => {
      //     this.setState({
      //       uploadModalVisible: true
      //     })
      //   }
      // },
      {
        text: '新建',
        name: 'folder-add',
        type: 'default',
        icon: 'folder-add',
        onClick: () => {
          this.setState({
            folderModalVisible: true,
            curEditFolder: {},
            isCreate: true
          })
        }
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        onClick: (ids, items)=>{ this.batchDelete(ids, items) },
        display: items=>(items.length),
      }
    ]
    const rowButtons = [
      {
        text: '编辑文件夹',
        name: 'edit',
        icon: 'edit',
        onClick: (record) => {
          this.onEdit(record, {
            title: '编辑文件夹',
          })
        },
        display: record=>(record.permission)
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '确认删除吗？',
        onClick: (record)=>{ this.onDelete(record) },
        display: record=>(record.permission)
      },
    ]
    return (
      <PageHeaderLayout content={
        // <OopSearch
        //   placeholder="请输入"
        //   enterButtonText="搜索"
        //   moduleName="noticeserverapp"
        //   ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        // />
        <div className={styles.netdiskUpload}>
          <UploadComponent
            owner={owner}
            curPath={curPath}
            onChange={this.handleUploadChange}
            changeFolder={this.changeFolder}
          />
        </div>
      }>
        <Card bordered={false}>
          <div className={styles.netdiskFileList}>
            <OopTable
              grid={{list: fileList, pagination: false}}
              columns={column}
              loading={loading}
              onLoad={this.onLoad}
              size={size}
              topButtons={topButtons}
              rowButtons={rowButtons}
              extra={this.createBreadcrumb(breadcrumb)}
              ref={(el)=>{ this.oopTable = el }}
              scroll={{y: 500}}
            />
            <FolderModal
              destroyOnClose={true}
              isCreate={isCreate}
              curEditFolder={curEditFolder}
              visible={folderModalVisible}
              onDelete={this.onDelete}
              onCancel={this.handleFolderCancel}
              onOk={this.handleFolderOk}
            />
          </div>
        </Card>
        {/* {
          uploadModalVisible ? (
            <UploadModal
              curPath={curPath}
              visible={uploadModalVisible}
              onCancel={this.handleUploadCancel}
              onChange={this.handleUploadChange}
              onOk={this.handleUploadOk}
            />
          ) : null
        } */}
      </PageHeaderLayout>);
  }
}
