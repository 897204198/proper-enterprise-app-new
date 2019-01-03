import React from 'react';
import { Modal, Card, Form, Input, Button, InputNumber, Spin, Checkbox } from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '../../../../framework/components/PageHeaderLayout';
import DescriptionList from '../../../../framework/components/DescriptionList';
import {inject} from '../../../../framework/common/inject';
import OopSearch from '../../../components/OopSearch';
import OopTable from '../../../components/OopTable';
import OopModal from '../../../components/OopModal';
import OopUpload from '../../../components/OopUpload';
import { oopToast } from './../../../../framework/common/oopUtils';


const { Description } = DescriptionList;
const FormItem = Form.Item;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const ModalForm = Form.create()((props) => {
  const { form, loading, editInfo, handleUploadChange, fileList, isCreate,
    checkAndorid, checkIos, setCheckAndorid, setCheckIos, handleDeleteFile, nowFileId } = props;
  const validateFileId = (rule, value, callback) => {
    if (!value) {
      callback()
      return false;
    }
    if (value.fileList) {
      if (value.file.type !== 'application/x-pkcs12') {
        callback()
        return false;
      }
    }
    // 自定义验证必须callback
    callback();
  };
  const validateJson = (rule, value, callback)=>{
    if (value) {
      try {
        JSON.parse(value)
      } catch (e) {
        callback('json 数据不正确');
      }
    }
    callback();
  }
  const validateIsChoseFile = (rule, value, callback)=> {
    if (!value) {
      callback('请选择配置类型ios/and');
    }
    callback();
  }
  const setForce = (type) => {
    form.validateFields([type], { force: true });
  };
  const handleChangeIos = (e)=>{
    setCheckIos(e);
    setForce('ios')
  }
  const handleChangeAnd = (e)=>{
    setCheckAndorid(e);
    setForce('android')
  }
  const choseGroup = (ios, and)=>{
    handleChangeIos(ios);
    handleChangeAnd(and);
  }
  const plainOptions = [
    { label: '配置ios', value: 'ios'},
    { label: '配置android', value: 'android'},
  ]
  const choseGroupChange = (checkedValue)=>{
    if (checkedValue.length === 2) {
      choseGroup(true, true)
    }
    if (checkedValue.length === 1) {
      if (checkedValue[0] === 'ios') {
        choseGroup(true, false)
      } else {
        choseGroup(false, true)
      }
    }
    if (checkedValue.length === 0) {
      choseGroup(false, false)
    }
  }
  const choseType = () =>{
    let choseArr = [];
    if (checkIos) choseArr = ['ios']
    if (checkAndorid) choseArr = ['android']
    if (checkIos && checkAndorid) choseArr = ['android', 'ios']
    if (!checkIos && !checkAndorid) choseArr = []
    return choseArr;
  }
  return (
    <Spin spinning={loading}>
      <Form>
        <div>
          {form.getFieldDecorator('id', {
            initialValue: editInfo.id,
          })(
            <Input type="hidden" />
          )}
        </div>
        <FormItem
          {...formItemLayout}
          label="渠道名称"
        >
          {form.getFieldDecorator('name', {
            initialValue: editInfo.name,
            rules: [{ required: true, whitespace: true, message: '渠道名称不能为空' }],
          })(
            <Input placeholder="请输入渠道名称" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="渠道描述"
        >
          {form.getFieldDecorator('desc', {
            initialValue: editInfo.desc,
            rules: [{ required: true, whitespace: true, message: '渠道描述不能为空' }],
          })(
            <Input placeholder="请输入渠道描述信息" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="保留时间"
        >
          {form.getFieldDecorator('msgSaveDays', {
            initialValue: editInfo.msgSaveDays,
            rules: [{ required: true, message: '保留时间不能为空'},
            { pattern: /^[0-9]*$/, message: '保留时间只能为数字，且区间为1~5'},
          ],
          })(
            <InputNumber min={1} max={5} placeholder="请输入" />
          )}
          <span className="ant-form-text">天</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="最大发送数量"
        >
          {form.getFieldDecorator('maxSendCount', {
            initialValue: editInfo.maxSendCount,
            rules: [{ required: true, message: '最大发送数量不能为空' },
            { pattern: /^[0-9]*$/, message: '最大发送数量只能为数字'}],
          })(
            <InputNumber min={1} placeholder="请输入" />
          )}
          <span className="ant-form-text">条</span>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="secretKey"
        >
          {form.getFieldDecorator('secretKey', {
            initialValue: editInfo.secretKey,
            rules: [{ required: true, whitespace: true, message: 'secretKey不能为空' }],
          })(
            <Input placeholder="请输入secretKey" />
          )}
        </FormItem>
        <FormItem
        {...formItemLayout}
        label="配置项">
        {form.getFieldDecorator('choseId', {
            initialValue: isCreate ? [] : choseType(),
            rules: [{ required: true, message: '至少配置一种'},
            {validator: validateIsChoseFile, message: '请选择配置项' }]
          })(
            <CheckboxGroup options={plainOptions} onChange={choseGroupChange} />
        )}</FormItem>
        {
        checkAndorid ? (
          <FormItem
          {...formItemLayout}
          label="android配置信息"
          extra='需严格按照示例格式输入。如
          {
            "huawei": {
              "theAppId": "XX",
              "theAppSecret": "XX",
              "theAppPackage": "XXX.XXX.XXX.XXX"
            },
            "xiaomi": {
              "theAppSecret": "XXX",
              "theAppPackage": "XXX.XXX.XXX.XXX"
            }
          }'
        >
          {form.getFieldDecorator('android', {
            initialValue: editInfo.android,
            rules: [{ required: checkAndorid, message: 'android配置信息不能为空'},
                {validator: validateJson, message: '请输入正确的json格式数据' }
          ],
          })(
            <TextArea rows={4} placeholder="请输入android的配置json数据" />
          )}
        </FormItem>) : ''}
        { checkIos ? (
        <FormItem
        {...formItemLayout}
        label="ios配置信息"
        extra='需严格按照示例格式输入。如
          {
            "envProduct": true,
            "keystorePassword": "1234",
            "topic": "sss.sss.sss.sss"
          }'
      >
        {form.getFieldDecorator('ios', {
          initialValue: editInfo.ios,
          rules: [{ required: checkIos, message: 'ios配置信息不能为空' },
          {validator: validateJson, message: '请输入正确的json格式数据' }],
        })(<TextArea rows={4} placeholder="请输入ios的配置json数据" />)
        }
       </FormItem>) : '' }
       {
        checkIos ? (
          <FormItem
          {...formItemLayout}
          label="ios认证证书"
        >
          {form.getFieldDecorator('diplomaId', {
            initialValue: nowFileId,
            rules: [
              {
                required: checkIos, message: '请上传.p12类型的文件'

              }, {
                validator: validateFileId
              }
            ],
          })(
            <OopUpload
              modelName="systemPagePush"
              listType="text"
              onChange={handleUploadChange}
              onRemove={handleDeleteFile}
              fileList={fileList}
              type={['.x-pkcs12']}
              size={200 / 1024}
            />
          )}
        </FormItem>) : '' }
      </Form>
    </Spin>
  )
});

@inject(['systemPagePush', 'global'])
@connect(({ systemPagePush, global, loading }) => ({
  systemPagePush,
  global,
  loading: loading.models.systemPagePush,
}))
export default class PagePush extends React.PureComponent {
  state = {
    modalFormVisible: false,
    detailVisible: false,
    info: {},
    addOrEditModalTitle: null,
    closeConfirmConfig: {
      visible: false
    },
    isCreate: true,
    fileLoading: false,
    // 上传文件显示列表
    fileList: [],
    // 是否配置安卓
    checkAndorid: false,
    // 是否配置ios
    checkIos: false,
    nowFileId: null,
    list: [],
    isDeleteIosFile: false
  }
  componentDidMount() {
    this.onLoad();
  }
  onLoad = ()=>{
    this.props.dispatch({
      type: 'systemPagePush/fetch',
      callback: (res)=>{
        this.setState({
          list: res.result.data
        })
      }
    })
  }
  handleRemove = (record)=>{
    this.props.dispatch({
      type: 'systemPagePush/remove',
      payload: record.id,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.onLoad();
      }
    });
  }
  handleBatchRemove = (items) => {
    const me = this;
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${items.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        me.props.dispatch({
          type: 'systemPagePush/remove',
          payload: items.toString(),
          callback(res) {
            me.oopTable.clearSelection()
            oopToast(res, '删除成功', '删除失败');
            me.onLoad()
          }
        })
      }
    });
  }
  setModalFormVisible = (flag) =>{
    this.setState({modalFormVisible: flag})
  }
  handleView = (record) => {
    this.setState({
      detailVisible: true,
      info: this.formatJsonData(record)
    });
  }
  handleClose = () => {
    this.setState({
      detailVisible: false,
      info: {}
    });
  }
  handleAddOrEditModalCancel = () => {
    this.setModalFormVisible(false);
    setTimeout(() => {
      this.setState({
        isCreate: true,
        isDeleteIosFile: false,
        closeConfirmConfig: {
          visible: false
        },
        fileList: [],
        checkAndorid: false,
        checkIos: false,
        nowFileId: null,
      });
    }, 300);
  }
  formatJsonData = (record)=>{
    const { android, ios} = record;
    if (typeof android === 'object' && android != null) {
      record.android = JSON.stringify(android, null, 4)
    }
    if (typeof ios === 'object' && ios != null) {
      record.ios = JSON.stringify(ios, null, 4)
    }
    return record;
  }
  handleEdit = (record)=>{
    const data = this.formatJsonData(record)
    const { android, ios, diplomaId: fileId} = data;
    if (fileId !== '' && fileId != null) {
      this.props.dispatch({
        type: 'systemPagePush/getFileInfo',
        payload: fileId,
        callback: (res)=>{
          const { result: resData, status } = res;
          if (status === 'ok') {
            this.setState({
              fileList:
              [{
                uid: resData.id,
                name: resData.fileName,
                status: 'done'
              }]
            })
          }
          oopToast(res, '获取文件信息成功', '查无此外文件');
        }
      })
    }
    if (android && android !== '') {
      this.setState({
        checkAndorid: true
      })
    }
    if (ios && ios !== '') {
      this.setState({
        checkIos: true
      })
    }
    this.setState({
      modalFormVisible: true,
      addOrEditModalTitle: '编辑',
      isCreate: false,
      info: data,
      nowFileId: data.diplomaId,
    })
  }
  handleCreate = (flage)=>{
    this.setState({
      modalFormVisible: flage,
      addOrEditModalTitle: '新建',
      isCreate: flage,
      nowFileId: null,
      info: {secretKey: 'b2024e00064bc5d8db70fdee087eae4f', maxSendCount: 5, msgSaveDays: 3}// 默认值
    })
  }
  handleFormChange = () => {
    this.setState((prevState) => {
      return {
        closeConfirmConfig: {
          ...prevState.closeConfirmConfig,
        }
      }
    });
  };
  clearFormDiplomaId = (basicUserForm) => {
    basicUserForm.setFields({
      diplomaId: {
        value: null,
        errors: [new Error('请上传.p12类型的文件')],
      },
    })
  }
  onSubmitForm = () => {
    const self = this;
    const { checkAndorid, checkIos, isDeleteIosFile } = this.state;
    const basicUserForm = this.basic.getForm();
    let andJson = null;
    let iosJson = null;
    let fileId = null;
    if (basicUserForm) {
      basicUserForm.validateFields((err, data) => {
        if (err) return;
        const { id, ios, android, name, desc, msgSaveDays: msgSave,
          maxSendCount: maxCounts, secretKey, diplomaId } = data;
        if (checkAndorid) {
          if (android != null && android) {
            andJson = JSON.parse(android.replace(/\s+/g, ''));
          }
        } else {
          andJson = null;
        }
        if (checkIos) {
          if (ios != null && ios) {
            iosJson = JSON.parse(ios.replace(/\s+/g, ''));
          }
          if (typeof diplomaId === 'object') {
            if (isDeleteIosFile || diplomaId.file.type !== 'application/x-pkcs12') {
              this.clearFormDiplomaId(basicUserForm);
              return false;
            } else {
              fileId = diplomaId && diplomaId.file && diplomaId.file.response;
            }
          }
          if (typeof diplomaId === 'string') {
            fileId = diplomaId;
          }
          if (isDeleteIosFile) {
            this.clearFormDiplomaId(basicUserForm);
            return false;
          }
        } else {
          iosJson = null;
          fileId = null;
        }
        this.props.dispatch({
          type: 'systemPagePush/saveOrUpdate',
          payload: {
            ios: iosJson,
            android: andJson,
            name,
            desc,
            msgSaveDays: msgSave,
            maxSendCount: maxCounts,
            secretKey,
            diplomaId: fileId,
            id
          },
          callback: (res) => {
            oopToast(res, '保存成功');
            if (res.status === 'ok') {
              this.onLoad();
              self.setState({
                isCreate: false,
                checkAndorid: false,
                checkIos: false,
                fileList: [],
                closeConfirmConfig: {
                  visible: false
                },
                info: {},
                modalFormVisible: false,
                isDeleteIosFile: false
              });
            }
          }
        });
      });
    }
  }
  onDelete=()=>{
    const record = this.state.info;
    this.handleRemove(record);
    this.handleAddOrEditModalCancel();
  }
  handleUploadChange = (info) => {
    let { fileList } = info;
    const { file } = info;
    if (file.type !== 'application/x-pkcs12') {
      fileList = [];
    } else if (file.status === 'done') {
      fileList = fileList.filter((item)=>{
        return item.type === 'application/x-pkcs12'
      }).slice(-1);
    }
    this.setState({
      fileList,
      isDeleteIosFile: false
    })
  }
  handleDeleteFile = ()=>{
    this.setState({fileList: [], isDeleteIosFile: true})
  }
  setCheckIos = (flage) => {
    this.setState({
      checkIos: flage
    })
  }
  setCheckAndorid = (flag) => {
    this.setState({
      checkAndorid: flag
    })
  }
  filterPage = (inputValue, filter) => {
    const { systemPagePush: { pageList } } = this.props;
    const list = inputValue ? filter(pageList, ['name', 'msgSaveDays', 'maxSendCount', 'desc']) : pageList;
    this.setState({list})
  }
  render() {
    const { loading, global: { size } } = this.props;
    const { detailVisible, modalFormVisible, info, addOrEditModalTitle, closeConfirmConfig,
      isCreate, fileLoading, fileList, checkAndorid, checkIos, nowFileId, list } = this.state;
    const { columns } = {columns: [
      {title: '渠道名称', dataIndex: 'name', render: (text, record)=>(
        <span
          onClick={()=>this.handleView(record)}
          style={{textDecoration: 'underline', cursor: 'pointer'}}>
          {text}
        </span>
      )},
      {title: '保留时间', dataIndex: 'msgSaveDays'},
      {title: '最大发送数量', dataIndex: 'maxSendCount'},
      {title: '渠道描述', dataIndex: 'desc'}
    ]};
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.handleCreate(true) }
      },
      {
        text: '删除',
        name: 'batchDelete',
        icon: 'delete',
        display: items=>(items.length > 0),
        onClick: (items)=>{ this.handleBatchRemove(items) }
      },
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.handleEdit(record) },
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record)=>{ this.handleRemove(record) },
      },
    ];
    return (
      <PageHeaderLayout content={
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          onInputChange={this.filterPage}
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            loading={!!loading}
            grid={{list}}
            columns={columns}
            rowButtons={rowButtons}
            topButtons={topButtons}
            size={size}
            onLoad={this.onLoad}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <OopModal
          title={`${addOrEditModalTitle}推送信息配置`}
          visible={modalFormVisible}
          destroyOnClose={true}
          width={800}
          closeConfirm={closeConfirmConfig}
          onCancel={this.handleAddOrEditModalCancel}
          onOk={this.onSubmitForm}
          onDelete={this.onDelete}
          isCreate={isCreate}
          maskClosable={false}
          loading={!!loading}
          tabs={[
            {
              key: 'basic',
              title: '基本信息',
              main: true,
              content: <ModalForm
                ref = {(el) => { this.basic = el; }}
                loading = {!!loading}
                conductValuesChange={this.handleFormChange}
                editInfo={info}
                handleUploadChange={this.handleUploadChange}
                handleDeleteFile={this.handleDeleteFile}
                fileList={fileList}
                fileLoading={fileLoading}
                checkAndorid={checkAndorid}
                checkIos={checkIos}
                setCheckIos={this.setCheckIos}
                setCheckAndorid={this.setCheckAndorid}
                isCreate={isCreate}
                nowFileId={nowFileId}
              />
            },
          ]}
        />
        <Modal
          visible={detailVisible}
          title="信息推送配置"
          onCancel={()=>this.handleClose()}
          footer={<Button type="primary" onClick={()=>this.handleClose()}>确定</Button>}
        >
          <DescriptionList size={size} col="1">
            <Description term="渠道名称">
              {info.name}
            </Description>
            <Description term="渠道描述">
              {info.desc}
            </Description>
            <Description term="保留时间">
              {info.msgSaveDays}
            </Description>
            <Description term="最大发送数量">
              {info.maxSendCount}
            </Description>
            <Description term="android配置信息">
              {info.android}
            </Description>
            <Description term="ios配置信息">
              {info.ios}
            </Description>
            <Description term="ios证书">
              {info.diplomaId}
            </Description>
            <Description term="secretKey">
              {info.secretKey}
            </Description>
          </DescriptionList>
        </Modal>
      </PageHeaderLayout>)
  }
}
