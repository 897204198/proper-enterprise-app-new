import React, {Fragment} from 'react';
import {connect} from 'dva';
import { Card, Modal, Switch, Popover } from 'antd';
import CreateAppForm from '../Forms/CreateAppForm';
import AppConfForm from '../Forms/AppConfForm';
import MailConfForm from '../Forms/MailConfForm';
import MessageConfForm from '../Forms/MessageConfForm';
import PageHeaderLayout from '../../../../../framework/components/PageHeaderLayout';
import OopSearch from '../../../../components/OopSearch';
import OopTable from '../../../../components/OopTable';
import FormModal from '../Forms/components/FormModal';
import { inject } from '../../../../../framework/common/inject';
import { oopToast } from '../../../../../framework/common/oopUtils';
import styles from './Manage.less';

const primaryColor = require('@/config/theme.js')['primary-color']

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 5},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16},
  },
};

@inject(['messageManage', 'global'])
@connect(({messageManage, global, loading}) => ({
  messageManage,
  global,
  loading: loading.models.messageManage,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class Manage extends React.PureComponent {
  state = {
    // isBasicFormFieldsChange: true,
    addOrEditModalTitle: null, // 新建编辑模态窗口 title
    modalVisible: false,
    // viewModalVisible: false,
    isCreate: !this.props.messageManage.appBasicInfo.id,
    closeConfirmConfig: {
      visible: false
    },
    warningWrapper: false, // from 是否记录修改状态
    warningField: {}, // from 字段变化
    curForm: 'appForm', // 当前加载form
    formApis: {
      appForm: {
        post: 'addApp',
        put: 'editAppById',
        delete: 'deleteAppById'
      },
      appConfForm: {
        post: 'pushAppConf',
        put: 'editAppConf',
        delete: 'deleteAppConf'
      },
      mailConfForm: {
        post: 'pushMailConf',
        put: 'editMailConf',
        delete: 'deleteMailConf'
      },
      messageConfForm: {
        post: 'pushSMSConf',
        put: 'editSMSConf',
        delete: 'deleteSMSConf'
      }
    },
    curRecord: {}
  }

  componentDidMount() {
    this.onLoad()
  }
  onView = (record) => {
    const me = this
    me.props.dispatch({
      type: 'messageManage/fetchAll',
      payload: record.id,
      callback() {
      }
    });
    // this.setState({
    //   viewModalVisible: true
    // });
  }
  handleDelete = ()=>{
    const record = this.props.messageManage.appBasicInfo;
    this.onDelete(record);
    this.handleAddOrEditModalCancel(false)
  }
  onCreate = () => {
    const me = this
    this.setState({
      addOrEditModalTitle: '新建应用信息',
      modalVisible: true,
      isCreate: true,
      curForm: 'appForm'
    });
    this.props.dispatch({
      type: 'messageManage/getAppKey',
      callback(res) {
        me.form.setFieldsValue({appKey: res})
      }
    })
  }
  onEdit = (record, opt) => {
    const { title, form, action, isCreate } = opt
    this.setState({
      addOrEditModalTitle: title,
      modalVisible: true,
      isCreate,
      curForm: form,
      curRecord: Object.assign(this.state.curRecord, record)
    })
    if (!isCreate) {
      this.props.dispatch({
        type: `messageManage/${action}`,
        payload: record
      });
    }
  }
  onDelete = (record) => {
    const me = this
    me.props.dispatch({
      type: 'messageManage/deleteAppById',
      payload: {id: record.id},
      callback(res) {
        oopToast(res, '删除成功', '删除失败');
        me.onLoad()
      }
    })
  }
  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag
    });
  }
  // handleViewModalVisible = (flag) => {
  //   this.setState({
  //     viewModalVisible: flag
  //   });
  //   this.props.dispatch({
  //     type: 'messageManage/clear'
  //   });
  // }
  handleCloseConfirmCancel = (warningWrapper) => {
    this.setState({
      warningWrapper
    })
  }

  handleAddOrEditModalCancel = () => {
    this.handleModalVisible(false);
    setTimeout(() => {
      this.setState({
        isCreate: true,
        closeConfirmConfig: {
          visible: false
        },
        warningWrapper: false,
        warningField: {},
      });

      this.props.dispatch({
        type: 'messageManage/clear'
      });
    }, 300);
  }
  // 启停切换
  handleToggleApp = (checked, record) => {
    const me = this
    this.props.dispatch({
      type: 'messageManage/toggleApp',
      payload: {
        id: record.id,
        enable: checked
      },
      callback(res) {
        if (checked) {
          oopToast(res, '启用成功', '启用失败');
        } else {
          oopToast(res, '停用成功', '停用失败');
        }
        me.onLoad()
      }
    })
  }
  batchDelete = (items) => {
    const me = this;
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${items.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        me.props.dispatch({
          type: 'messageManage/deleteAppById',
          payload: {ids: items.toString()},
          callback(res) {
            me.oopTable.clearSelection()
            oopToast(res, '删除成功', '删除失败');
            me.onLoad()
          }
        })
      }
    });
  }
  submitData = (opt) => {
    const me = this
    this.props.dispatch({
      type: `messageManage/${opt.type}`,
      payload: opt.data,
      callback: (res)=>{
        this.setState({
          isCreate: false,
          closeConfirmConfig: {
            visible: false
          },
          warningWrapper: false,
          warningField: {},
        });
        oopToast(res, '保存成功', '保存失败');
        me.handleAddOrEditModalCancel()
        me.onLoad();
      }
    });
  }
  handleSubmit = () => {
    let formData = {}
    const me = this
    const { isCreate, curForm } = this.state
    const { post, put } = this.state.formApis[curForm]
    const type = isCreate ? post : put
    if (this.form.getForm) {
      formData = this.form.getForm();
      if (formData) {
        formData.validateFieldsAndScroll((err, data) => {
          if (err) return;
          if (!data.appKey) {
            const { appKey } = me.state.curRecord
            data.appKey = appKey
          }
          if (!data.id) {
            const { id } = me.state.curRecord
            data.id = id
          }
          const opt = {
            type,
            data
          }
          me.submitData(opt)
        });
      }
    } else {
      formData = this.form.getFormDatas();
      if (formData) {
        const { id, appKey } = me.state.curRecord
        formData.id = id
        formData.appKey = appKey
        const opt = {
          type,
          data: formData
        }
        me.submitData(opt)
      }
    }
  }
  // 查询方法 加载所有数据
  onLoad = (param = {})=> {
    const { pagination } = param;
    const params = {
      pagination,
      ...param,
      userEnable: 'ALL'
    }
    this.oopSearch.load(params)
  }
  changeToken = () => {
    const { setFieldsValue } = this.form
    this.props.dispatch({
      type: 'messageManage/changeToken',
      callback: (res)=>{
        setFieldsValue({
          appToken: res
        })
      }
    })
  }
  changeColor = (data) => {
    const { setFieldsValue } = this.form
    setFieldsValue({ color: data.color.hex })
  }
  deleteConf = () => {
    const me = this
    const type = this.state.formApis[this.state.curForm].delete
    if (this.state.curForm === 'appForm') {
      this.onDelete(this.state.curRecord)
    } else {
      this.props.dispatch({
        type: `messageManage/${type}`,
        payload: {appKey: this.state.curRecord.appKey},
        callback: (res)=>{
          this.setState({
            isCreate: false,
            closeConfirmConfig: {
              visible: false
            },
            warningWrapper: false,
            warningField: {},
          })
          oopToast(res, '修改成功', '修改失败')
          me.handleAddOrEditModalCancel()
          me.onLoad()
        }
      })
    }
  }
  handleUserInfoFormChange = (warningField) => {
    const visible = Object.keys(warningField).length > 0;
    this.setState((prevState) => {
      return {
        closeConfirmConfig: {
          ...prevState.closeConfirmConfig,
          visible
        },
        warningField
      }
    });
  }

  render() {
    const defaultColor = primaryColor || '#1890ff'
    const {
      messageManage: { appBasicInfo },
      loading,
      gridLoading,
      global: { size, oopSearchGrid }
    } = this.props;
    const { isCreate, modalVisible, addOrEditModalTitle, closeConfirmConfig,
      warningField, warningWrapper, curForm } = this.state;
    const buttonType = curForm === 'appForm' ? (isCreate ? '' : '删除') : '清空配置'
    const colorIconStyle = {
      height: '8px',
      width: '16px',
      display: 'inline-block',
      marginRight: '5px'
    }
    const column = [
      {
        title: '应用名称',
        dataIndex: 'appName',
        render: (text, record) => {
          return (
            <div><span style={{...colorIconStyle, backgroundColor: record.color}} /><span>{text}</span></div>
          )
        }
      },
      {
        title: '编码',
        dataIndex: 'appKey',
        className: styles.wordDetail,
        render: (text) => {
          return (
            <Popover content={text} placement="bottomLeft">
              <span>{text}</span>
            </Popover>
          )
        }
      },
      {
        title: 'token',
        dataIndex: 'appToken',
        className: styles.wordDetail,
        render: (text) => {
          return (
            <Popover content={text} placement="bottomLeft">
              <span>{text}</span>
            </Popover>
          )
        }
      },
      {
        title: '描述',
        dataIndex: 'appDesc',
        className: styles.wordDetail,
        render: (text) => {
          return (
            <Popover content={text} placement="bottom">
              <span>{text}</span>
            </Popover>
          )
        }
      },
      {
        title: '启/停用',
        dataIndex: 'enable',
        key: 'enable',
        width: 120,
        filterMultiple: false,
        filters: [
          { text: '已启用', value: true },
          { text: '已停用', value: false },
        ],
        render: (text, record) => (
          <Fragment>
            <Switch checkedChildren="启" unCheckedChildren="停" checked={text} onClick={checked => this.handleToggleApp(checked, record)} />
          </Fragment>
        )
      }
    ]
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.onCreate() }
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        onClick: (items)=>{ this.batchDelete(items) },
        display: items=>(items.length),
      }
    ]
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record) => {
          this.onEdit(record, {
            title: '编辑应用配置',
            form: 'appForm',
            action: 'fetchApp',
            isCreate: false
          })
        },
        display: record=>(!record.superuser)
      }, {
        text: 'APP配置',
        name: 'PushConf',
        icon: 'shake',
        style: (record) => {
          return {
            color: record.havePushConf ? defaultColor : '#d9d9d9'
          }
        },
        onClick: (record) => {
          this.onEdit(record, {
            title: '配置App推送配置',
            form: 'appConfForm',
            action: 'fetchAppConf',
            isCreate: !record.havePushConf
          })
        },
        display: record=>(!record.superuser),
        disabled: record=>(record.havePushConf)
      }, {
        text: '邮件配置',
        name: 'EmailConf',
        icon: 'mail',
        style: (record) => {
          return {
            color: record.haveEmailConf ? defaultColor : '#d9d9d9'
          }
        },
        onClick: (record) => {
          this.onEdit(record, {
            title: '配置邮件配置',
            form: 'mailConfForm',
            action: 'fetchMailConf',
            isCreate: !record.haveEmailConf
          })
        },
        display: record=>(!record.superuser),
        disabled: record=>(record.haveEmailConf)
      }, {
        text: '短信配置',
        name: 'SMSConf',
        icon: 'message',
        style: (record) => {
          return {
            color: record.haveSMSConf ? defaultColor : '#d9d9d9'
          }
        },
        onClick: (record) => {
          this.onEdit(record, {
            title: '配置短信配置',
            form: 'messageConfForm',
            action: 'fetchSMSConf',
            isCreate: !record.haveSMSConf
          })
        },
        display: record=>(!record.superuser),
        disabled: record=>(record.haveSMSConf)
      }, {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '确认删除吗？',
        onClick: (record)=>{ this.onDelete(record) },
        display: record=>(!record.superuser)
      },
    ]
    const forms = {
      appForm: {
        key: 'createApp',
        content: <CreateAppForm
          ref={(el) => {
            this.form = el;
          }}
          isCreate={isCreate}
          changeToken={this.changeToken}
          changeColor={this.changeColor}
          warningWrapper={warningWrapper}
          formItemLayout={formItemLayout}
          appBasicInfo={appBasicInfo}
          warningField={warningField}
          loading={!!loading}
          conductValuesChange={this.handleUserInfoFormChange} />
      },
      appConfForm: {
        key: 'appConf',
        content: <AppConfForm
          ref={(el) => {
            if (el) this.form = el;
          }}
          isCreate={isCreate}
          warningWrapper={warningWrapper}
          formItemLayout={formItemLayout}
          appBasicInfo={appBasicInfo}
          warningField={warningField}
          loading={!!loading}
          conductValuesChange={this.handleUserInfoFormChange} />
      },
      mailConfForm: {
        key: 'mailConf',
        content: <MailConfForm
          ref={(el) => {
            if (el) this.form = el;
          }}
          isCreate={isCreate}
          warningWrapper={warningWrapper}
          formItemLayout={formItemLayout}
          appBasicInfo={appBasicInfo}
          warningField={warningField}
          loading={!!loading}
          conductValuesChange={this.handleUserInfoFormChange} />
      },
      messageConfForm: {
        key: 'messageConf',
        content: <MessageConfForm
          ref={(el) => {
            if (el) this.form = el;
          }}
          isCreate={isCreate}
          warningWrapper={warningWrapper}
          formItemLayout={formItemLayout}
          appBasicInfo={appBasicInfo}
          warningField={warningField}
          loading={!!loading}
          conductValuesChange={this.handleUserInfoFormChange} />
      }
    }
    return (
      <PageHeaderLayout content={
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          moduleName="noticeserverapp"
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            grid={{...oopSearchGrid,
              list: oopSearchGrid.list.map(item=>({...item, disabled: item.superuser === true}))}}
            columns={column}
            loading={gridLoading}
            onLoad={this.onLoad}
            size={size}
            topButtons={topButtons}
            rowButtons={rowButtons}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <FormModal
          title={addOrEditModalTitle}
          visible={modalVisible}
          width={800}
          closeConfirm={closeConfirmConfig}
          closeConfirmCancel={this.handleCloseConfirmCancel}
          onCancel={this.handleAddOrEditModalCancel}
          onOk={this.handleSubmit}
          onDelete={this.handleDelete}
          onCheck={this.handleCheck}
          onClear={this.deleteConf}
          isCreate={isCreate}
          loading={!!loading}
          buttonType={buttonType}
          content={forms[curForm].content}
        />
      </PageHeaderLayout>);
  }
}
