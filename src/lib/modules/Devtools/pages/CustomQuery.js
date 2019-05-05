import React, {Fragment} from 'react';
import { Modal, Card, Select, Switch, Icon, Input, Button, message, Tree, Row, Col, Popconfirm } from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import {inject} from '@framework/common/inject';
import Debounce from 'lodash-decorators/debounce';
import { oopToast } from '@framework/common/oopUtils';
import OopSearch from '@pea/components/OopSearch';
import OopForm from '@pea/components/OopForm';
import OopTable from '@pea/components/OopTable';
import OopFormDesigner from '@pea/components/OopFormDesigner';
import OopTableForm from '@pea/components/OopTableForm';
import styles from './CustomQuery.less'

const { Option } = Select
const { TreeNode } = Tree
const tableInputStyle = {
  height: '32px'
}
const defaultButtons = [
  {
    _id: `${Date.now() + Math.random()}`,
    text: '新建',
    name: 'create',
    position: 'top',
    type: 'primary',
    icon: 'plus',
    enable: true,
    default: true
  },
  {
    _id: `${Date.now() + Math.random()}`,
    text: '删除',
    name: 'batchDelete',
    position: 'top',
    type: 'default',
    icon: 'delete',
    display: 'items=>(items.length > 0)',
    enable: true,
    default: true
  },
  {
    _id: `${Date.now() + Math.random()}`,
    text: '编辑',
    name: 'edit',
    position: 'row',
    icon: 'edit',
    type: 'default',
    enable: true,
    default: true
  },
  {
    _id: `${Date.now() + Math.random()}`,
    text: '删除',
    name: 'delete',
    position: 'row',
    icon: 'delete',
    type: 'default',
    enable: true,
    default: true
  }
]
const defaultBtnArr = defaultButtons.map(btn => btn.name)

const filterDefault = (arr) => {
  for (let i = 0; i < defaultBtnArr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j].name === defaultBtnArr[i]) {
        arr[j].default = true
      }
    }
  }
  return arr
}
const renderTitle = (text) => {
  return (
    <span style={{display: 'flex', alignItems: 'center'}}>
      <Icon type="bars" style={{fontSize: 24}} /><span style={{marginLeft: 8}}>{text}</span>
    </span>
  )
}
const checkRepeat = (arr, field, param) => {
  if (param) {
    const tempArr = arr.filter(item => ((item[field] === param[field]) && (item._id !== param._id)))
    if (tempArr.length > 0) return true;
    return false;
  } else {
    const hash = {};
    for (let i = 0; i < arr.length; i++) {
      if (hash[arr[i][field]]) {
        return true
      }
      hash[arr[i][field]] = true;
    }
    return false
  }
}
@inject(['devtoolsCustomQuery', 'global'])
@connect(({ devtoolsCustomQuery, global, loading }) => ({
  devtoolsCustomQuery,
  global,
  loading: loading.models.devtoolsCustomQuery,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class CustomQuery extends React.PureComponent {
  state = {
    modalFormDesignerVisible: false,
    modalTableCfgVisible: false,
    modalButtonCfgVisible: false,
    modalModalCfgVisible: false,
    curRecord: {},
    curTableRecord: {},
    gridConfig: {},
    buttons: [],
    selectedKeys: [],
    isCreate: false,
  }
  currentRowRecordId = null;
  componentDidMount() {
    this.onLoad();
  }
  onLoad = (param = {}) => {
    const {pagination, condition} = param;
    // this.oopSearch.load({
    //  pagination
    // });
    this.props.dispatch({
      type: 'devtoolsCustomQuery/fetch',
      payload: {
        pagination,
        ...condition
      }
    });
  }
  @Debounce(300)
  checkCode(rule, value, callback, self) {
    console.log(this)
    self.props.dispatch({
      type: 'devtoolsCustomQuery/checkCodeRepeat',
      payload: value,
      callback: (cb)=>{
        if (cb.result.length === 0) {
          callback();
        } else {
          callback('表单编码已存在');
        }
      }
    });
  }
  @Debounce(300)
  checkTableName(rule, value, callback, self) {
    console.log(this)
    self.props.dispatch({
      type: 'devtoolsCustomQuery/checkTableNameRepeat',
      payload: value,
      callback: (cb)=>{
        if (cb.result.length === 0) {
          callback();
        } else {
          callback('表单表名已存在');
        }
      }
    });
  }
  makeCreateFormConfig = (formEntity, checkCode, checkTableName) => {
    const me = this
    const rule = {};
    if (!formEntity.code && !formEntity.tableName) {
      rule.checkCodeRepeat = [{
        required: true,
        max: 20,
        pattern: /^[_0-9A-Za-z]+$/,
        message: '字段名称不能为空,且必须是"_"、数字或英文字符'
      }, {
        validator(rules, value, callback) {
          checkCode(rules, value, callback, me);
        }
      }];
      rule.checkTableNameRepeat = [{
        required: true,
        max: 20,
        pattern: /^[_0-9A-Za-z]+$/,
        message: '字段名称不能为空,且必须是"_"、数字或英文字符'
      }, {
        validator(rules, value, callback) {
          checkTableName(rules, value, callback, me);
        }
      }];
    }
    return {
      formLayout: 'horizontal',
      formJson: [
        {
          name: 'id',
          component: {
            name: 'Input',
            props: {type: 'hidden'}
          },
          wrapper: true
        },
        {
          label: '功能名',
          key: 'functionName',
          name: 'functionName',
          component: {
            name: 'Input',
            props: {
              placeholder: '请输入功能名',
            }
          },
          initialValue: formEntity.functionName || '',
          rules: [{
            required: true,
            message: '此项为必填项'
          }]
        },
        {
          label: '表名',
          key: 'tableName',
          name: 'tableName',
          component: {
            name: 'Input',
            props: {
              placeholder: '请输入表名',
              disabled: !!formEntity.tableName
            }
          },
          initialValue: formEntity.tableName || '',
          rules: rule.checkTableNameRepeat
        },
        {
          label: '编码',
          key: 'code',
          name: 'code',
          component: {
            name: 'Input',
            props: {
              placeholder: '请输入编码',
              disabled: !!formEntity.code
            }
          },
          initialValue: formEntity.code || '',
          rules: rule.checkCodeRepeat
        },
        {
          label: '备注',
          key: 'note',
          name: 'note',
          component: {
            name: 'TextArea',
            props: {
              placeholder: '请输入备注'
            }
          },
          initialValue: formEntity.note || '',
        },
        {
          label: '启/停用',
          key: 'enable',
          name: 'enable',
          component: {
            name: 'Switch',
            props: {
              checkedChildren: '启',
              unCheckedChildren: '停'
            }
          },
          valuePropName: 'checked',
          initialValue: formEntity.enable || false,
        }
      ]
    }
  }
  makeTableCfgConfig = (formEntity, submit, remove) => {
    return {
      formLayoutConfig: {
        labelCol: {
          xs: {span: 24},
          sm: {span: 4},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 16},
        },
      },
      formJson: [
        {
          name: '_id',
          component: {
            name: 'Input',
            props: {type: 'hidden'}
          },
          wrapper: true
        },
        {
          label: '列名',
          key: 'title',
          name: 'title',
          component: {
            name: 'Input',
            props: {
              placeholder: '请输入列名',
            }
          },
          initialValue: formEntity.title || '',
          rules: [{
            required: true,
            message: '此项为必填项'
          }]
        },
        {
          label: '字段名',
          key: 'dataIndex',
          name: 'dataIndex',
          component: {
            name: 'Input',
            props: {
              placeholder: '请输入字段名'
            }
          },
          initialValue: formEntity.dataIndex || '',
          rules: [{
            required: true,
            message: '此项为必填项'
          }]
        },
        {
          label: '排序',
          key: 'sorter',
          name: 'sorter',
          component: {
            name: 'TextArea',
            props: {
              placeholder: '请输入排序规则',
            }
          },
          initialValue: formEntity.sorter || '',
        },
        {
          label: '筛选',
          key: 'filter',
          name: 'filter',
          component: {
            name: 'TextArea',
            props: {
              placeholder: '请输入筛选规则'
            }
          },
          initialValue: formEntity.filter || '',
        },
        {
          label: '自定义渲染',
          key: 'render',
          name: 'render',
          component: {
            name: 'TextArea',
            props: {
              placeholder: '请输入自定义渲染规则'
            }
          },
          initialValue: formEntity.render || '',
        },
        {
          label: '启/停用',
          key: 'enable',
          name: 'enable',
          component: {
            name: 'Switch',
            props: {
              checkedChildren: '启',
              unCheckedChildren: '停'
            }
          },
          valuePropName: 'checked',
          initialValue: formEntity.enable || true,
        },
        {
          key: 'submitBtn',
          component: () => {
            return (
              <div>
                <Button type="primary" onClick={submit} style={{marginLeft: '20%'}}>保存</Button>
                <Popconfirm
                  title="确认删除？"
                  onConfirm={() => remove(formEntity._id)}>
                  <Button type="danger" style={{marginLeft: '10px'}}>删除</Button>
                </Popconfirm>
              </div>
            )
          },
          formItemLayout: {
            wrapperCol: {
              xs: {span: 24},
              sm: {span: 20},
            },
          }
        }
      ]
    }
  }
  setModalVisible = (field, flag) => {
    this.setState({[field]: flag})
  }
  handleToggleEnable = (checked, record) => {
    const me = this
    this.props.dispatch({
      type: 'devtoolsCustomQuery/saveOrUpdate',
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
  handleModalCancel = () => {
    this.setModalVisible('modalFormVisible', false);
    // setTimeout(() => {
    //   form.resetFields();
    //   this.props.dispatch({
    //     type: 'devtoolsCustomQuery/clearEntity'
    //   });
    // }, 300)
  }
  handleCreate = () => {
    this.setModalVisible('isCreate', true);
    this.setModalVisible('modalCreateVisible', true);
  }
  handleEdit = (record) => {
    this.props.dispatch({
      type: 'devtoolsCustomQuery/fetchById',
      payload: record.id,
    });
    this.setState({
      curRecord: record
    })
    this.setModalVisible('isCreate', false);
    this.setModalVisible('modalCreateVisible', true);
  }
  handleRemove = (record) => {
    this.props.dispatch({
      type: 'devtoolsCustomQuery/remove',
      payload: {id: record.id},
      callback: (res) => {
        oopToast(res, '删除成功', '删除失败');
        this.setState({
          curTableRecord: {},
          curRecord: {}
        })
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
          type: 'devtoolsCustomQuery/batchRemove',
          payload: {ids: items.toString()},
          callback(res) {
            me.oopTable.clearSelection()
            oopToast(res, '删除成功', '删除失败');
            this.setState({
              curTableRecord: {},
              curRecord: {}
            })
            me.onLoad()
          }
        })
      }
    });
  }
  handleSubmit = () => {
    const form = this.oopCreateForm.getForm()
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { curRecord } = this.state
      const params = Object.assign(curRecord, fieldsValue)
      this.props.dispatch({
        type: 'devtoolsCustomQuery/saveOrUpdate',
        payload: params,
        callback: (res) => {
          oopToast(res, '保存成功', '保存失败');
          if (res.status === 'ok') {
            this.setState({
              curRecord: {}
            })
            this.setModalVisible('modalCreateVisible', false);
          }
          this.onLoad();
        }
      });
    });
  }
  handleDesignForm = (record) => {
    this.setState({
      curRecord: record
    })
    this.currentRowRecordId = record.id;
    this.setModalVisible('modalFormDesignerVisible', true);
  }
  handleDesignTable = (record) => {
    const { gridConfig } = record;
    this.setState({
      curRecord: record,
      curTableRecord: JSON.parse(gridConfig).columns[0],
      gridConfig: JSON.parse(gridConfig)
    })
    this.currentRowRecordId = record.id;
    this.setModalVisible('modalTableCfgVisible', true);
  }
  handleDesignButton = (record) => {
    const { gridConfig } = record
    const { topButtons, rowButtons } = JSON.parse(gridConfig)
    const buttons = [...topButtons, ...rowButtons]
    this.setState({
      curRecord: record,
      buttons
    })
    this.currentRowRecordId = record.id;
    this.setModalVisible('modalButtonCfgVisible', true);
  }
  handleDesignModal = (record) => {
    const { modalConfig = '{}' } = record
    this.setState({
      curRecord: record,
      modalConfig: JSON.parse(modalConfig)
    })
    this.currentRowRecordId = record.id;
    this.setModalVisible('modalModalCfgVisible', true);
  }
  handleFormDesignerModalCancel = ()=>{
    this.setState({modalFormDesignerVisible: false});
    this.currentRowRecordId = null;
    this.oopFormDesigner.resetForm();
    // this.setState({
    //   curRecord: {}
    // })
  }
  handleFormDesignerModalSubmit = () => {
    const formDetails = this.oopFormDesigner.getFormConfig();
    if (formDetails === undefined) {
      console.log('有语法错误');
    } else if (formDetails.formJson && formDetails.formJson.length === 0) {
      message.warning('请设计表单');
    } else {
      const { curRecord } = this.state
      const { gridConfig, modalConfig } = curRecord;
      const { formJson, ...otherProps } = formDetails;
      formJson.forEach((item) => {
        if (item.initialValue && typeof item.initialValue === 'object') {
          if (item.initialValue.constructor.name === 'Moment') {
            const format = (item.component.props && item.component.props.format) || 'YYYY-MM-DD';
            item.initialValue = item.initialValue.format(format);
          }
        }
      });
      const FormObj = {
        ...otherProps,
        formJson: formJson.map(fj=>({...fj, active: false})),
      }
      const columns = []
      let topButtons = []
      let rowButtons = []
      let gridObj = {}
      let modalObj = {}
      if (!gridConfig) {
        for (let i = 0; i < formJson.length; i++) {
          const obj = {
            _id: Math.random().toString(36).substring(2),
            title: formJson[i].label,
            dataIndex: formJson[i].name
          }
          columns.push(obj)
        }
        topButtons = defaultButtons.filter(item => item.position === 'top')
        rowButtons = defaultButtons.filter(item => item.position === 'row')
        gridObj = JSON.stringify({columns, topButtons, rowButtons})
      } else {
        gridObj = gridConfig
      }
      if (!modalConfig) {
        modalObj = JSON.stringify({
          title: '',
          width: 1000,
          footer: ['submit', 'cancel'],
          saveAfterClosable: true,
          maskClosable: false
        })
      } else {
        modalObj = modalConfig
      }
      const params = {
        modalConfig: modalObj,
        gridConfig: gridObj,
        formConfig: JSON.stringify(FormObj),
        id: this.currentRowRecordId
      }
      this.props.dispatch({
        type: 'devtoolsCustomQuery/updateFormConfig',
        payload: params,
        callback: (res)=>{
          oopToast(res, '保存成功', '保存失败');
          if (res.status === 'ok') {
            this.setModalVisible('modalFormDesignerVisible', false)
            this.onLoad();
          }
        }
      });
    }
  }
  handleTableCfgCancel = () => {
    this.setState({
      curTableRecord: {}
    })
    this.setModalVisible('modalTableCfgVisible', false)
  }
  onTableCfgSelect = (record) => {
    if (record.length) {
      const value = JSON.parse(record[0])
      this.setState({
        curTableRecord: value,
        selectedKeys: [record[0]]
      })
      const form = this.oopTableCfgForm.getForm()
      for (const key in JSON.parse(record)) {
        form.setFieldsValue({[key]: JSON.parse(record)[key]})
      }
    }
  }
  onTableCfgChange = (type, item) => {
    const { gridConfig } = this.state
    const { columns } = gridConfig
    if (type === 'delete') {
      columns.map((btn, index) => {
        if (btn.dataIndex === item.dataIndex) {
          columns.splice(index, 1)
        }
        return null
      })
      const obj = {
        ...gridConfig,
        columns
      }
      this.setState({
        gridConfig: obj
      })
    }
    if (type !== 'delete') {
      if (columns.length) {
        const isRepeat = checkRepeat(columns, 'dataIndex', item)
        if (isRepeat) {
          message.error('唯一标识不可重复，请修改')
        }
      }
    }
  }
  handleTableCfgSubmit = () => {
    const { curRecord, gridConfig } = this.state
    const form = this.oopTableCfgForm.getForm()
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const isTitleRepeat = checkRepeat(gridConfig.columns, 'title', fieldsValue)
      const isDataIndexRepeat = checkRepeat(gridConfig.columns, 'dataIndex', fieldsValue)
      if (isTitleRepeat || isDataIndexRepeat) {
        message.error('列名或字段名有重复，请修改后再保存')
      } else {
        const list = gridConfig.columns.map((col) => {
          if (col._id === fieldsValue._id) {
            return fieldsValue
          } else {
            return col
          }
        })
        const obj = {
          ...gridConfig,
          columns: list
        }
        const params = {
          ...curRecord,
          gridConfig: JSON.stringify(obj),
          id: this.currentRowRecordId
        }
        this.props.dispatch({
          type: 'devtoolsCustomQuery/saveOrUpdate',
          payload: params,
          callback: (res) => {
            oopToast(res, '保存成功', '保存失败')
            if (res.status === 'ok') {
              this.setState({
                curRecord: params,
                gridConfig: obj,
                curTableRecord: fieldsValue,
                selectedKeys: [JSON.stringify(fieldsValue)]
              })
              this.onLoad()
            }
          }
        });
      }
    })
  }
  handleTableCfgRemove = (id) => {
    const { curRecord, gridConfig } = this.state
    const { columns } = gridConfig
    const list = columns.filter(col => col._id !== id)
    const obj = {
      ...gridConfig,
      columns: list
    }
    const params = {
      ...curRecord,
      gridConfig: JSON.stringify(obj),
      id: this.currentRowRecordId
    }
    this.props.dispatch({
      type: 'devtoolsCustomQuery/saveOrUpdate',
      payload: params,
      callback: (res) => {
        oopToast(res, '保存成功', '保存失败')
        if (res.status === 'ok') {
          const record = list.length ? list[0] : {
            _id: '',
            title: '',
            dataIndex: ''
          }
          this.setState({
            curRecord: params,
            gridConfig: obj,
            curTableRecord: record,
            selectedKeys: [JSON.stringify(record)]
          })
          this.onLoad()
          this.onTableCfgSelect([JSON.stringify(record)])
        }
      }
    });
  }
  addTableCol = () => {
    const { gridConfig } = this.state
    const { columns } = gridConfig
    const config = {
      ...gridConfig,
      columns: [...columns, {_id: Math.random().toString(36).substring(2), title: '新建列', dataIndex: Math.random().toString(36).substring(2)}]
    }
    const { length } = config.columns
    const record = JSON.stringify(config.columns[length - 1])
    this.onTableCfgSelect([record])
    this.setState({
      gridConfig: config,
      selectedKeys: [record]
    })
  }
  handleButtonCfgCancel = () => {
    const datas = this.buttonCfgForm.checkStatuAndFormData()
    if (datas.edit) {
      message.error('有数据在编辑状态，尚未保存')
    } else {
      this.setModalVisible('modalButtonCfgVisible', false)
    }
  }
  onButtonCfgChange = (type, item) => {
    const { buttons } = this.state
    if (type === 'delete') {
      buttons.map((btn, index) => {
        if (btn.name === item.name) {
          buttons.splice(index, 1)
        }
        return null
      })
      this.setState({
        buttons
      }, () => {
        this.forceUpdate()
      })
    }
    if (type !== 'delete') {
      if (buttons.length) {
        const isRepeat = checkRepeat(buttons, 'name', item)
        if (isRepeat) {
          message.error('唯一标识不可重复，请修改')
        }
      }
    }
  }
  handleButtonCfgSubmit = () => {
    const { curRecord } = this.state
    const datas = this.buttonCfgForm.checkStatuAndFormData()
    const { edit, list } = datas
    if (edit) {
      message.error('有数据在编辑状态，尚未保存')
    } else {
      const isNameRepeat = checkRepeat(list, 'name')
      if (isNameRepeat) {
        message.error('唯一标识有重复，请修改后再保存')
        return;
      }
      const topButtons = list.filter(item => item.position === 'top')
      const rowButtons = list.filter(item => item.position === 'row')
      const params = {
        ...curRecord,
        gridConfig: JSON.stringify({
          ...JSON.parse(curRecord.gridConfig),
          topButtons,
          rowButtons
        }),
        id: this.currentRowRecordId
      }
      this.props.dispatch({
        type: 'devtoolsCustomQuery/saveOrUpdate',
        payload: params,
        callback: (res) => {
          oopToast(res, '保存成功', '保存失败')
          if (res.status === 'ok') {
            this.setModalVisible('modalButtonCfgVisible', false)
            this.onLoad()
          }
        }
      });
    }
  }
  handleModalCfgCancel = () => {
    this.setModalVisible('modalModalCfgVisible', false);
  }
  handleModalCfgSubmit = () => {
    const form = this.oopModalCfgForm.getForm()
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const { curRecord } = this.state
      const params = {
        ...curRecord,
        modalConfig: JSON.stringify(fieldsValue),
        id: this.currentRowRecordId
      }
      this.props.dispatch({
        type: 'devtoolsCustomQuery/saveOrUpdate',
        payload: params,
        callback: (res) => {
          oopToast(res, '保存成功', '保存失败');
          if (res.status === 'ok') this.setModalVisible('modalModalCfgVisible', false);
          this.onLoad();
        }
      });
    });
  }
  render() {
    const {devtoolsCustomQuery: {entity, list}, loading,
      global: { oopSearchGrid, size }, gridLoading } = this.props;
    const { modalCreateVisible, modalButtonCfgVisible, modalTableCfgVisible, modalModalCfgVisible, curRecord, gridConfig, modalConfig = {}, isCreate, buttons, curTableRecord = {}, selectedKeys} = this.state;
    const { formConfig = {formJson: [], formLayout: 'horizontal'} } = curRecord
    const { columns } = gridConfig
    const parseFormConfig = typeof formConfig === 'string' ? JSON.parse(formConfig) : formConfig
    const buttonCfgDatas = filterDefault(buttons)
    const formdata = isCreate ? {} : entity
    const oopTablecolumns = [
      {
        title: '功能名',
        dataIndex: 'functionName',
      },
      {
        title: '表名',
        dataIndex: 'tableName',
      },
      {
        title: '编码',
        dataIndex: 'code',
      },
      {
        title: '备注',
        dataIndex: 'note',
      },
      {
        title: '启/停用',
        dataIndex: 'enable',
        render: (text, record) => {
          return <Switch checkedChildren="启" unCheckedChildren="停" checked={text} onClick={checked => this.handleToggleEnable(checked, record)} />
        }
      }
    ]
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: () => { this.handleCreate() }
      },
      {
        text: '删除',
        name: 'batchDelete',
        icon: 'delete',
        display: items => (items.length > 0),
        onClick: (items) => { this.handleBatchRemove(items) }
      },
    ];
    const rowButtons = [
      {
        text: '设计表单',
        name: 'designForm',
        icon: 'form',
        onClick: (record) => { this.handleDesignForm(record) },
      },
      {
        text: '设计列表',
        name: 'designTable',
        icon: 'table',
        display: record => (record.formConfig && JSON.parse(record.formConfig).formJson.length > 0),
        onClick: (record) => { this.handleDesignTable(record) },
      },
      {
        text: '设计按钮',
        name: 'designButton',
        icon: 'bars',
        display: record => (record.formConfig && JSON.parse(record.formConfig).formJson.length > 0),
        onClick: (record) => { this.handleDesignButton(record) },
      },
      {
        text: '设计模态窗口',
        name: 'designModal',
        icon: 'border',
        display: record => (record.formConfig && JSON.parse(record.formConfig).formJson.length > 0),
        onClick: (record) => { this.handleDesignModal(record) },
      },
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record) => { this.handleEdit(record) },
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record) => { this.handleRemove(record) },
      },
    ];
    const buttonCfgColumns = [
      {
        title: '名称',
        dataIndex: 'text',
        key: 'text',
        defaultValue: '',
        required: true,
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              style={tableInputStyle}
              value={text}
              onChange={e => this.buttonCfgForm.handleFieldChange(e, 'text', record._id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '唯一标识',
        dataIndex: 'name',
        key: 'name',
        defaultValue: '',
        required: true,
        render: (text, record) => {
          if (record.editable && !record.default) {
            return (
            <Input
              size="small"
              style={tableInputStyle}
              value={text}
              onChange={e => this.buttonCfgForm.handleFieldChange(e, 'name', record._id)}
              placeholder="唯一标识不可有重复" />
            )
          }
          return text;
        }
      }, {
        title: '位置',
        dataIndex: 'position',
        key: 'position',
        defaultValue: 'top',
        required: true,
        render: (text, record) => {
          if (record.editable && !record.default) {
            return (
              <Select defaultValue="top" style={{ width: 'auto' }} onChange={e => this.buttonCfgForm.handleFieldChange(e, 'position', record._id)}>
                <Option value="top">顶部按钮</Option>
                <Option value="row">操作按钮</Option>
              </Select>
            )
          }
          return text;
        }
      }, {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        defaultValue: 'default',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Select defaultValue="default" style={{ width: 'auto' }} onChange={e => this.buttonCfgForm.handleFieldChange(e, 'type', record._id)}>
                <Option value="primary">主按钮</Option>
                <Option value="default">次按钮</Option>
                <Option value="dashed">虚线按钮</Option>
                <Option value="danger">危险按钮</Option>
              </Select>
            )
          }
          return text;
        }
      }, {
        title: '图标',
        dataIndex: 'icon',
        key: 'icon',
        defaultValue: 'file',
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              style={tableInputStyle}
              value={text}
              onChange={e => this.buttonCfgForm.handleFieldChange(e, 'icon', record._id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '功能',
        dataIndex: 'restPath',
        key: 'restPath',
        defaultValue: '',
        required: true,
        render: (text, record) => {
          if (record.editable && !record.default) {
            return (
            <Input
              size="small"
              style={tableInputStyle}
              value={text}
              onChange={e => this.buttonCfgForm.handleFieldChange(e, 'restPath', record._id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '确认信息',
        dataIndex: 'confirm',
        key: 'confirm',
        defaultValue: '',
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              style={tableInputStyle}
              value={text}
              onChange={e => this.buttonCfgForm.handleFieldChange(e, 'confirm', record._id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '显示',
        dataIndex: 'display',
        key: 'display',
        defaultValue: '',
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              style={tableInputStyle}
              value={text}
              onChange={e => this.buttonCfgForm.handleFieldChange(e, 'display', record._id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '启/停用',
        dataIndex: 'enable',
        key: 'enable',
        defaultValue: true,
        width: 100,
        render: (text, record) => {
          if (record.editable) {
            return (
              <Switch checkedChildren="启" unCheckedChildren="停" checked={text} onChange={e => this.buttonCfgForm.handleFieldChange(e, 'enable', record._id)} />
            )
          }
          return text === true ? '启用' : '停用';
        }
      }
    ]
    const modalCfgFormConfig = {
      formLayout: 'horizontal',
      formJson: [
        {
          label: '窗口名称',
          key: 'title',
          name: 'title',
          component: {
            name: 'Input',
            props: {
              placeholder: '请输入名称',
            }
          },
          initialValue: modalConfig.title || '',
        },
        {
          label: '窗口宽度',
          key: 'width',
          name: 'width',
          component: {
            name: 'InputNumber',
            props: {
              placeholder: '请输入宽度'
            }
          },
          initialValue: modalConfig.width || '',
        },
        {
          label: '按钮',
          key: 'footer',
          name: 'footer',
          component: {
            name: 'Select',
            children: [
              {label: '保存', value: 'submit'},
              {label: '取消', value: 'cancel'},
              {label: '删除', value: 'delete'}
            ],
            props: {
              placeholder: '请选择按钮',
              mode: 'multiple'
            }
          },
          initialValue: modalConfig.footer || ['submit', 'cancel'],
        },
        {
          label: '保存后是否关闭',
          key: 'saveAfterClosable',
          name: 'saveAfterClosable',
          component: {
            name: 'Switch',
            props: {
              checkedChildren: '是',
              unCheckedChildren: '否'
            }
          },
          valuePropName: 'checked',
          initialValue: modalConfig.saveAfterClosable || false,
        },
        {
          label: '点击遮罩是否关闭',
          key: 'maskClosable',
          name: 'maskClosable',
          component: {
            name: 'Switch',
            props: {
              checkedChildren: '是',
              unCheckedChildren: '否'
            }
          },
          valuePropName: 'checked',
          initialValue: modalConfig.maskClosable || false,
        }
      ]
    }
    return (
      <PageHeaderLayout content={
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          moduleName="devtoolsCustomQuery"
          ref={(el) => { this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            loading={loading === undefined ? gridLoading : loading}
            grid={{list} || oopSearchGrid}
            columns={oopTablecolumns}
            rowButtons={rowButtons}
            topButtons={topButtons}
            size={size}
            // showTableInfo
            ref={(el) => { this.oopTable = el }}
          />
        </Card>
        <Modal
          visible={modalCreateVisible}
          // width={800}
          title={renderTitle(`${isCreate ? '新建' : '查看'}`)}
          onCancel={() => { this.setState({modalCreateVisible: false}) }}
          onOk={this.handleSubmit}
          destroyOnClose={true}
          maskClosable={false}
          // footer={<Button type="primary" onClick={() => { this.setState({modalAssignmentCollectVisible: false}) }}>关闭</Button>}
        >
          <OopForm {...this.makeCreateFormConfig(formdata, this.checkCode, this.checkTableName)} ref={(el)=>{ this.oopCreateForm = el && el.getWrappedInstance() }} defaultValue={formdata} />
        </Modal>
        <Modal
          visible={this.state.modalFormDesignerVisible}
          width="90%"
          title="设计表单"
          style={{top: '50px'}}
          onCancel={this.handleFormDesignerModalCancel}
          onOk={this.handleFormDesignerModalSubmit}
          okText="保存"
          maskClosable={false}
          destroyOnClose={true}>
          <OopFormDesigner
            ref={(el)=>{ this.oopFormDesigner = el }}
            formDetails={parseFormConfig} />
        </Modal>
        <div className={styles.tableCfgModal}>
          <Modal
            visible={modalTableCfgVisible}
            width="60%"
            title="设计列表"
            wrapClassName={styles.tableCfgModal}
            onCancel={() => { this.setState({modalTableCfgVisible: false}) }}
            destroyOnClose={true}
            maskClosable={false}
            footer={
              <Fragment>
                <Button onClick={this.handleTableCfgCancel}>关闭</Button>
              </Fragment>
            }
          >
            <Row gutter={16}>
              <Col span={5}>
                <Card title="字段列表" bordered={false} extra={<Button type="primary" onClick={this.addTableCol}>新建</Button>}>
                  {
                    columns ?
                    (
                      <Tree
                        showLine
                        selectedKeys={selectedKeys.length ? selectedKeys : [JSON.stringify(columns[0])]}
                        onSelect={this.onTableCfgSelect}
                      >
                        {
                          columns.map((col) => {
                            return (
                              <TreeNode title={col.title} key={JSON.stringify(col)} />
                            )
                          })
                        }
                      </Tree>
                    ) : null
                  }
                </Card>
              </Col>
              <Col span={19}>
                <Card title="字段编辑" bordered={false}>
                  <OopForm {...this.makeTableCfgConfig(curTableRecord, this.handleTableCfgSubmit, this.handleTableCfgRemove)} ref={(el)=>{ this.oopTableCfgForm = el && el.getWrappedInstance() }} defaultValue={curTableRecord} />
                </Card>
              </Col>
            </Row>
          </Modal>
        </div>
        <Modal
          visible={modalButtonCfgVisible}
          width="90%"
          title="设计按钮"
          onCancel={() => { this.setState({modalButtonCfgVisible: false}) }}
          destroyOnClose={true}
          maskClosable={false}
          footer={
            <Fragment>
              <Button onClick={this.handleButtonCfgCancel}>关闭</Button>
              <Button type="primary" onClick={this.handleButtonCfgSubmit}>保存</Button>
            </Fragment>
          }
        >
          <OopTableForm
            columns={buttonCfgColumns}
            onChange={this.onButtonCfgChange}
            value={buttonCfgDatas}
            ref={(el)=>{ this.buttonCfgForm = el }}
          />
        </Modal>
        <Modal
          visible={modalModalCfgVisible}
          title="设计模态窗口"
          width={800}
          onCancel={() => { this.setState({modalModalCfgVisible: false}) }}
          destroyOnClose={true}
          maskClosable={false}
          footer={
            <Fragment>
              <Button onClick={this.handleModalCfgCancel}>关闭</Button>
              <Button type="primary" onClick={this.handleModalCfgSubmit}>保存</Button>
            </Fragment>
          }
        >
          <OopForm {...modalCfgFormConfig} ref={(el)=>{ this.oopModalCfgForm = el && el.getWrappedInstance() }} defaultValue={modalConfig} />
        </Modal>
      </PageHeaderLayout>
    )
  }
}
