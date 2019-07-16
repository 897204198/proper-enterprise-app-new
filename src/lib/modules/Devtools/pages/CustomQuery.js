import React, {Fragment} from 'react';
import FileSaver from 'file-saver';
import { Modal, Card, Select, Switch, Icon, Input, Button, message, Row, Popconfirm, Tabs, Spin, Popover} from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { connect } from 'dva';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { inject } from '@framework/common/inject';
import Debounce from 'lodash-decorators/debounce';
import { oopToast } from '@framework/common/oopUtils';
import OopSearch from '@pea/components/OopSearch';
import OopForm from '@pea/components/OopForm';
import OopTable from '@pea/components/OopTable';
import OopFormDesigner from '@pea/components/OopFormDesigner';
import OopTableForm from '@pea/components/OopTableForm';
import { makeDefaultButtons, filterDefault, checkRepeat, makeRandomId, isJson } from './PupaUtils/utils'
import styles from './customQuery.less';

const { TabPane } = Tabs
const { Option } = Select
const tableInputStyle = {
  height: '32px'
}
const addColBtnStyle = {
  fontSize: '22px',
  verticalAlign: '-webkit-baseline-middle',
  color: '#1890ff'
}
const defaultBtnArr = makeDefaultButtons(true).map(btn => btn.name)
const renderTitle = (text) => {
  return (
    <span style={{display: 'flex', alignItems: 'center'}}>
      <Icon type="bars" style={{fontSize: 24}} /><span style={{marginLeft: 8}}>{text}</span>
    </span>
  )
}
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;
  return result;
};
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  ...draggableStyle
});
const getListStyle = isDraggingOver => ({
  border: '2px dashed transparent',
  borderColor: isDraggingOver ? '#ddd' : 'transparent',
  padding: '5px 10px',
  minHeight: '42px',
  display: 'flex'
});
@inject(['devtoolsCustomQuery', 'workflowManager', 'global'])
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
    modalModalCfgVisible: false,
    curRecord: {},
    curTableRecord: {},
    gridConfig: {},
    buttons: [],
    workflowSelection: [],
    selectedKeys: [],
    isCreate: false,
    list: [],
    showCols: [],
    hideCols: [],
    curCol: null,
    dragging: false
  }
  id2List = {
    show: 'showCols',
    hide: 'hideCols'
  }
  currentRowRecordId = null;
  getList = id => this.state[this.id2List[id]]
  onDragUpdate = () => {
    const { curRecord, gridConfig, showCols, hideCols } = this.state
    showCols.forEach((item) => {
      item.enable = true
    })
    hideCols.forEach((item) => {
      item.enable = false
    })
    const newColumns = [...showCols, ...hideCols]
    gridConfig.columns = newColumns
    this.setState({
      dragging: false,
    })
    const params = {
      ...curRecord,
      gridConfig: JSON.stringify(gridConfig),
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
            gridConfig,
          })
          this.onLoad()
        }
      }
    });
  }
  onDragStart = () => {
    this.setState({
      dragging: true
    })
  }
  onDragEnd = (result) => {
    const { source, destination } = result;
    // dropped outside the list
    this.setState({
      dragging: false
    })
    if (!destination) {
      return;
    }
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === destination.droppableId && source.droppableId === 'hide') return
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );
      let state = { showCols: items };
      if (source.droppableId === 'hide') {
        state = { hideCols: items }
      }
      this.setState(state, () => this.onDragUpdate())
    } else {
      /* eslint-disable-next-line */
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );
      this.setState({
        showCols: result.show,
        hideCols: result.hide
      }, () => this.onDragUpdate());
    }
  }
  componentDidMount() {
    this.onLoad();
  }
  onLoad = (param = {}) => {
    const { pagination, condition } = param;
    if (pagination) {
      this.setState({
        pagination
      })
    }
    this.props.dispatch({
      type: 'devtoolsCustomQuery/fetch',
      payload: {
        pagination: pagination || this.state.pagination,
        ...condition
      },
      callback: (res) => {
        if (res.status === 'ok') {
          this.setState({
            list: res.result
          })
        }
      }
    });
    this.getWf()
  }
  getWf = () => {
    this.props.dispatch({
      type: 'workflowManager/findDesign',
      payload: {
        modelType: '0',
        sort: 'modifiedDesc',
        modelStatus: 'DEPLOYED'
      },
      callback: (resp) => {
        if (resp && resp.data && resp.data.length) {
          const workflowSelection = resp.data.map(it=>({
            label: it.name,
            value: it.key
          }))
          this.setState({
            workflowSelection: this.filterWf(workflowSelection)
          })
        }
      }
    });
  }
  filterWf = (data) => {
    const newData = [...data]
    const { devtoolsCustomQuery: {list} } = this.props;
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < newData.length; j++) {
        if (list[i].wfKey && (list[i].wfKey === newData[j].value)) {
          newData[j].disabled = true
        }
      }
    }
    return newData
  }
  onSearch = (value, filter) => {
    const {devtoolsCustomQuery: {list}} = this.props;
    const newList = value ? filter(list, ['functionName', 'tableName', 'code', 'wfKey']) : list
    this.setState({
      list: newList
    })
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
          initialValue: formEntity.id || undefined,
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
              addonBefore: 'PEP_PUPA_',
              placeholder: '请输入表名',
              disabled: !!formEntity.tableName
            }
          },
          initialValue: formEntity.tableName ? formEntity.tableName.replace('PEP_PUPA_', '') : '',
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
          initialValue: formEntity.code || undefined,
          rules: rule.checkCodeRepeat
        },
        {
          label: '关联流程',
          key: 'relaWf',
          name: 'relaWf',
          component: {
            name: 'Switch',
            props: {
              checkedChildren: '是',
              unCheckedChildren: '否'
            }
          },
          initialValue: formEntity.relaWf || undefined,
          valuePropName: 'checked'
        },
        {
          label: '选择流程',
          key: 'wfKey',
          name: 'wfKey',
          display: false,
          component: {
            name: 'Select',
            props: {
              placeholder: '请选择流程',
              showSearch: true
            },
            children: this.state.workflowSelection,
          },
          rules: [{
            required: true,
            message: '此项为必填项'
          }],
          initialValue: formEntity.wfKey || undefined,
          subscribe: [{
            name: 'relaWf',
            publish: [{
              value: true,
              property: 'display'
            }]
          }],
        },
        {
          label: '备注',
          key: 'note',
          name: 'note',
          component: {
            name: 'TextArea',
            props: {
              placeholder: '请输入备注',
              autosize: true
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
  makeTableCfgConfig = (formEntity) => {
    return {
      columnsNum: 2,
      formLayoutConfig: {
        labelCol: {
          xs: {span: 24},
          sm: {span: 4},
        },
        wrapperCol: {
          xs: {span: 24},
          sm: {span: 18},
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
          name: 'syncTag',
          component: {
            name: 'Input',
            props: {
              type: 'hidden',
            }
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
          label: '列宽',
          key: 'width',
          name: 'width',
          component: {
            name: 'InputNumber',
            props: {
              placeholder: '请输入字段名',
            }
          },
          initialValue: formEntity.width || '',
          rules: [{
            required: false,
            message: '此项为必填项'
          }],
          subscribe: [{
            name: 'hover',
            publish: [{
              value(chanageValue) {
                return chanageValue === true
              },
              property: 'rules[0].required'
            }]
          }],
        },
        {
          label: '排序',
          key: 'sorter',
          name: 'sorter',
          component: {
            name: 'RadioGroup',
            children: [{
              label: '否',
              value: false
            }, {
              label: '是',
              value: true
            }, {
              label: '自定义',
              value: 'custom'
            }],
          },
          initialValue: formEntity.sorter || false,
        },
        // {
        //   label: '筛选',
        //   key: 'filter',
        //   name: 'filter',
        //   component: {
        //     name: 'TextArea',
        //     props: {
        //       placeholder: '请输入筛选规则',
        //       autosize: true
        //     }
        //   },
        //   initialValue: formEntity.filter || '',
        // },
        {
          label: '自定义渲染',
          key: 'render',
          name: 'render',
          component: {
            name: 'TextArea',
            props: {
              placeholder: '例：(text) => {return <span style={{color: "red"}}>{text}</span>}',
              autosize: true
            }
          },
          initialValue: formEntity.render || '',
        },
        {
          label: '排序规则',
          key: 'sorterRule',
          name: 'sorterRule',
          component: {
            name: 'TextArea',
            props: {
              placeholder: '例：(a, b) => { return a - b }',
              autosize: true
            }
          },
          rules: [{
            required: true,
            message: '请输入排序规则'
          }],
          initialValue: formEntity.sorterRule || '',
          subscribe: [{
            name: 'sorter',
            publish: [{
              value(chanageValue) {
                return chanageValue === 'custom'
              },
              property: 'display'
            }]
          }],
        },
        {
          label: '鼠标悬停提示',
          key: 'hover',
          name: 'hover',
          component: {
            name: 'RadioGroup',
            children: [{
              label: '关闭',
              value: false
            }, {
              label: '开启',
              value: true
            }],
          },
          initialValue: formEntity.hover || false,
        },
      ]
    }
  }
  makeTableInfoCfgConfig = (entity = {}, submit) => {
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
          label: '列表信息扩展',
          key: 'tableInfoExtra',
          name: 'tableInfoExtra',
          component: {
            name: 'TextArea',
            props: {
              placeholder: '请输入扩展内容',
              autosize: true,
            },
          },
          extra: '列表扩展信息将展示在表格的上部',
          initialValue: entity.tableInfoExtra || ''
        },
        {
          label: '显示序号',
          key: 'order',
          name: 'order',
          component: {
            name: 'RadioGroup',
            children: [{
              label: '否',
              value: false
            }, {
              label: '是',
              value: true
            }],
          },
          extra: '列表每条数据前是否显示序号',
          initialValue: entity.order || false,
        },
        {
          key: 'submitBtn',
          component: () => {
            return (
              <div>
                <Button type="primary" onClick={submit} style={{marginLeft: '20%'}}>保存</Button>
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
  clearState = () => {
    this.setState({
      curRecord: {},
      curTableRecord: {},
      gridConfig: {},
      buttons: [],
      workflowSelection: [],
      selectedKeys: [],
    })
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
    setTimeout(() => {
      this.props.dispatch({
        type: 'devtoolsCustomQuery/clearEntity'
      });
    }, 300)
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
            me.setState({
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
      params.tableName = `PEP_PUPA_${params.tableName.toUpperCase()}`
      if (params.gridConfig) {
        const { gridConfig } = params
        const config = JSON.parse(gridConfig)
        const startBtnArr = config.topButtons.filter(btn => btn.name === 'start')
        if (params.relaWf) {
          if (!startBtnArr.length) {
            const startBtn = {
              _id: `${Date.now() + Math.random()}`,
              text: '发起',
              name: 'start',
              position: 'top',
              type: 'primary',
              icon: 'branches',
              enable: true,
              default: true
            }
            config.topButtons.unshift(startBtn)
          }
        } else if (startBtnArr.length) {
          config.topButtons = config.topButtons.filter(btn => btn.name !== 'start')
          params.wfKey = ''
        }
        params.gridConfig = JSON.stringify(config)
      }
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
      this.props.dispatch({
        type: 'devtoolsCustomQuery/clearEntity',
      });
    });
  }
  handleCancel = () => {
    this.setState({
      modalCreateVisible: false,
      curRecord: {}
    })
    this.props.dispatch({
      type: 'devtoolsCustomQuery/clearEntity',
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
    const { topButtons, rowButtons, columns } = JSON.parse(gridConfig)
    const buttons = [...topButtons, ...rowButtons]
    const curCol = columns.filter(item => item.enable)[0] || columns[0]
    this.setState({
      curRecord: record,
      curTableRecord: curCol,
      curCol: curCol.dataIndex,
      gridConfig: JSON.parse(gridConfig),
      buttons,
      showCols: columns.filter(item => item.enable === true),
      hideCols: columns.filter(item => !item.enable),
    })
    this.currentRowRecordId = record.id;
    this.setModalVisible('modalTableCfgVisible', true);
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
  }
  handleFormDesignerModalSubmit = () => {
    const formDetails = this.oopFormDesigner.getFormConfig();
    if (formDetails === undefined) {
      console.log('有语法错误');
    } else if (formDetails.formJson && formDetails.formJson.length === 0) {
      message.warning('请设计表单');
    } else {
      const { curRecord } = this.state
      const { gridConfig, modalConfig, relaWf } = curRecord;
      const { formJson, ...otherProps } = formDetails;
      formJson.forEach((item) => {
        if (!item.syncTag) {
          if (gridConfig) {
            const hasCol = JSON.parse(gridConfig).columns.filter(col => col.dataIndex === item.name)
            if (hasCol.length) {
              item.syncTag = hasCol[0].syncTag
            } else {
              item.syncTag = makeRandomId()
            }
          } else {
            item.syncTag = makeRandomId()
          }
        }
      });
      const FormObj = {
        ...otherProps,
        formJson: formJson.map(fj=>({...fj, active: false})),
      }
      let columns = []
      let topButtons = []
      let rowButtons = []
      let gridObj = {}
      let modalObj = {}
      if (!gridConfig) {
        for (let i = 0; i < formJson.length; i++) {
          const obj = {
            _id: makeRandomId(),
            title: formJson[i].label,
            dataIndex: formJson[i].name,
            syncTag: formJson[i].syncTag,
            colIndex: `${i + 1}`,
            enable: true
          }
          columns.push(obj)
        }
        topButtons = makeDefaultButtons(relaWf).filter(item => item.position === 'top')
        rowButtons = makeDefaultButtons(relaWf).filter(item => item.position === 'row')
        gridObj = JSON.stringify({columns, topButtons, rowButtons})
      } else {
        const { columns: cols } = JSON.parse(gridConfig)
        columns = [...cols]
        for (let k = 0; k < formJson.length; k++) {
          for (let j = 0; j < columns.length; j++) {
            // 同步title和dataIndex
            if (columns[j].syncTag === formJson[k].syncTag) {
              columns[j].title = formJson[k].label
              columns[j].dataIndex = formJson[k].name
            }
            // 如果列信息没有syncTag字段，加上该字段
            if (columns[j].dataIndex === formJson[k].name && !columns[j].syncTag) {
              columns[j].syncTag = formJson[k].syncTag
            }
          }
          // 判断是否为新增字段
          const filterArr = cols.filter(col => col.syncTag === formJson[k].syncTag)
          if (!filterArr.length) {
            const newCol = {
              _id: makeRandomId(),
              title: formJson[k].label,
              dataIndex: formJson[k].name,
              syncTag: formJson[k].syncTag,
              enable: true
            }
            columns.push(newCol)
          }
        }
        gridObj = JSON.stringify({
          ...JSON.parse(gridConfig),
          columns
        })
      }
      if (!modalConfig) {
        modalObj = JSON.stringify({
          title: '',
          width: 1000,
          footer: ['cancel', 'submit'],
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
            this.clearState()
            this.onLoad()
          }
        }
      });
    }
  }
  handleTableCfgCancel = () => {
    this.setState({
      curTableRecord: {},
      curCol: null
    })
    this.setModalVisible('modalTableCfgVisible', false)
  }
  onTableCfgSelect = (col) => {
    const form = this.oopTableCfgForm.getForm()
    form.resetFields()
    this.setState({
      curTableRecord: col,
      curCol: col.dataIndex
    }, () => {
      for (const key in col) {
        if (key !== 'enable') {
          form.setFieldsValue({[key]: col[key]})
        }
      }
    })
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
            return Object.assign(col, fieldsValue)
          }
          return col
        })
        // list.sort((a, b) => parseInt(a.colIndex, 10) - parseInt(b.colIndex, 10))
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
                selectedKeys: [JSON.stringify(fieldsValue)],
                showCols: list.filter(item => item.enable === true),
                hideCols: list.filter(item => !item.enable),
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
        oopToast(res, '删除成功', '删除失败')
        if (res.status === 'ok') {
          const record = list.length ? list[0] : {
            _id: '',
            title: '',
            dataIndex: '',
            sorter: false,
            // filter: '',
            render: '',
            enable: false
          }
          this.setState({
            curRecord: params,
            gridConfig: obj,
            curTableRecord: record,
            showCols: list.filter(item => item.enable === true),
            hideCols: list.filter(item => !item.enable),
          })
          this.onLoad()
          this.onTableCfgSelect(record)
        }
      }
    });
  }
  handleTableInfoCfgSubmit = () => {
    const { curRecord, gridConfig } = this.state
    const form = this.oopTableInfoCfgForm.getForm()
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const obj = {
        ...gridConfig,
        props: fieldsValue
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
            })
            this.onLoad()
          }
        }
      })
    })
  }
  addTableCol = () => {
    const { gridConfig } = this.state
    const { columns } = gridConfig
    const newCol = {
      _id: makeRandomId(),
      title: '新建列',
      dataIndex: makeRandomId(),
      sorter: false,
      // filter: '',
      render: '',
      enable: true
    }
    const config = {
      ...gridConfig,
      columns: [
        ...columns,
        newCol
      ]
    }
    const { length } = config.columns
    const record = config.columns[length - 1]
    this.setState({
      gridConfig: config,
      showCols: config.columns.filter(item => item.enable === true),
      hideCols: config.columns.filter(item => !item.enable),
    })
    this.onTableCfgSelect(record)
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
  checkUpload = (successNum, JSONObj) => {
    if (successNum === 2) {
      this.props.dispatch({
        type: 'devtoolsCustomQuery/saveOrUpdate',
        payload: JSONObj,
        callback: (res) => {
          this.onLoad();
          oopToast(res, '文件导入成功')
        }
      })
    }
  }
  handleDownload = (records) => {
    const record = JSON.parse(JSON.stringify(records));
    const name = record.functionName
    delete record.CT
    delete record.CU
    delete record.LT
    delete record.LU
    delete record.id
    delete record._ClientVersion
    delete record._InstallationId
    delete record._id
    const data = JSON.stringify(record)
    const blob = new Blob([data], {type: ''})
    FileSaver.saveAs(blob, `${name}.json`)
  }
  handleUpload = () => {
    const fileBox = document.getElementById('file')
    const file = fileBox.files[0]
    const filename = file.name
    const ext = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
    if (ext !== 'json') {
      message.error('请上传json文件')
      return false
    }
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      if (isJson(reader.result)) {
        // this.ImportJSON = JSON.parse(reader.result)
        const JSONObj = JSON.parse(reader.result)
        if (!JSONObj.code || JSONObj.code === '' || !JSONObj.tableName || JSONObj.tableName === '') {
          message.error('文件内容缺少关键信息')
          fileBox.value = ''
          return false
        }
        let successNum = 0
        this.props.dispatch({
          type: 'devtoolsCustomQuery/checkCodeRepeat',
          payload: JSONObj.code,
          callback: (cb)=>{
            if (cb.result.length) {
              message.error('表单编码已存在');
            } else {
              successNum++
              this.checkUpload(successNum, JSONObj)
            }
            fileBox.value = ''
          }
        });
        this.props.dispatch({
          type: 'devtoolsCustomQuery/checkTableNameRepeat',
          payload: JSONObj.tableName,
          callback: (cb)=>{
            if (cb.result.length) {
              message.error('表单表名已存在');
            } else {
              successNum++
              this.checkUpload(successNum, JSONObj)
            }
            fileBox.value = ''
          }
        })
      } else {
        message.error('文件内容不是JSON格式')
        fileBox.value = ''
      }
    }
    reader.onerror = () => {
      message.error('文件上传失败')
    }
  }
  handleOpenfile = () => {
    document.getElementById('file').click()
  }
  handleOnAddItem = (item)=>{
    // 默认设置新添加的组件关联按钮为‘新建和编辑’
    item.relateBtn = ['create', 'edit'];
  }
  render() {
    const {devtoolsCustomQuery: {entity}, loading,
      global: { oopSearchGrid, size }, gridLoading } = this.props;
    const { modalCreateVisible, modalTableCfgVisible, modalModalCfgVisible, list, curRecord, gridConfig, modalConfig = {},
      isCreate, buttons, curTableRecord = {}, workflowSelection, pagination, showCols, hideCols, curCol, dragging } = this.state;
    const { formConfig = {formJson: [], formLayout: 'horizontal'} } = curRecord
    const { props } = gridConfig
    const parseFormConfig = typeof formConfig === 'string' ? JSON.parse(formConfig) : formConfig
    const buttonCfgDatas = filterDefault(buttons, defaultBtnArr)
    const formdata = isCreate ? {} : entity
    const oopTablecolumns = [
      {title: '功能名', dataIndex: 'functionName', width: 150},
      {title: '表名', dataIndex: 'tableName',
        render: (text) => {
          return (
            <Popover content={text}>
              <div className={styles.ellipsis}>{text}</div>
            </Popover>
          )
        }
      },
      {title: '编码', dataIndex: 'code',
        render: (text) => {
          return (
            <Popover content={text}>
              <div className={styles.ellipsis}>{text}</div>
            </Popover>
          )
        }
      },
      {title: '关联流程', dataIndex: 'wfKey',
        render: (text, record) => {
          if (record.relaWf && workflowSelection.length) {
            const wf = workflowSelection.filter(item => item.value === text)
            return wf.length ? <Popover content={wf[0].label}>
              <div className={styles.ellipsis}>{wf[0].label}</div>
            </Popover> : '流程不存在'
          }
          return null
        }
      },
      {title: '启/停用', dataIndex: 'enable',
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
      {
        text: '导入',
        name: 'upload',
        type: 'default',
        icon: 'upload',
        style: {
          float: 'right'
        },
        onClick: ()=>{ this.handleOpenfile() }
      }
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
        text: '导出',
        name: 'download',
        icon: 'download',
        onClick: (record)=>{ this.handleDownload(record) }
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
              {label: '删除', value: 'delete'},
              {label: '取消', value: 'cancel'},
              {label: '保存', value: 'submit'}
            ],
            props: {
              placeholder: '请选择按钮',
              mode: 'multiple'
            }
          },
          initialValue: modalConfig.footer || ['cancel', 'submit'],
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
          onInputChange={this.onSearch}
          ref={(el) => { this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <input type="file" id="file" hidden onChange={this.handleUpload} />
          <OopTable
            loading={loading === undefined ? gridLoading : loading}
            grid={{list: list.data, pagination: {...pagination, total: list.count}} || oopSearchGrid}
            columns={oopTablecolumns}
            onLoad={this.onLoad}
            rowButtons={rowButtons}
            topButtons={topButtons}
            size={size}
            // showTableInfo
            ref={(el) => { this.oopTable = el }}
            order
          />
        </Card>
        <Modal
          visible={modalCreateVisible}
          // width={800}
          title={renderTitle(`${isCreate ? '新建' : '查看'}`)}
          onCancel={this.handleCancel}
          onOk={this.handleSubmit}
          destroyOnClose={true}
          maskClosable={false}
          // footer={<Button type="primary" onClick={() => { this.setState({modalAssignmentCollectVisible: false}) }}>关闭</Button>}
        >
          {isCreate || Object.keys(formdata).length > 0 ?
            <OopForm {...this.makeCreateFormConfig(formdata, this.checkCode, this.checkTableName)} ref={(el)=>{ this.oopCreateForm = el && el.getWrappedInstance() }} />
            : <div style={{textAlign: 'center'}}><Spin /></div>
          }
        </Modal>
        <Modal
          visible={this.state.modalFormDesignerVisible}
          width="90%"
          title="设计表单"
          style={{top: '20px'}}
          onCancel={this.handleFormDesignerModalCancel}
          onOk={this.handleFormDesignerModalSubmit}
          okText="保存"
          maskClosable={false}
          destroyOnClose={true}
        >
          <OopFormDesigner
            onAddItem={this.handleOnAddItem}
            ref={(el)=>{ this.oopFormDesigner = el }}
            formDetails={parseFormConfig} />
        </Modal>
         <Modal
           visible={modalTableCfgVisible}
           width="90%"
           title="设计列表"
           onCancel={() => { this.setState({modalTableCfgVisible: false}) }}
           destroyOnClose={true}
           maskClosable={false}
           style={{top: '20px'}}
           footer={
             <Fragment>
               <Button onClick={this.handleTableCfgCancel}>关闭</Button>
             </Fragment>
           }
         >
           <div style={{marginTop: '-24px'}}>
             <Tabs defaultActiveKey="1" animated={false}>
               <TabPane tab="列编辑" key="1">
                 <div>
                  <Spin spinning={loading}>
                    <Row gutter={16}>
                      <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
                        <div className="colLine" style={{marginBottom: '10px'}}>
                          <div style={{padding: '5px 10px', width: '80px', lineHeight: '2.3'}}>显示列:</div>
                          <div className={`${dragging ? 'dragging' : ''}`}>
                            <Droppable droppableId="show" direction="horizontal">
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                                    {showCols.map((item, index) => (
                                        <Draggable
                                            key={item.dataIndex}
                                            draggableId={item.dataIndex}
                                            index={index}
                                            >
                                            {/* eslint-disable-next-line */}
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                onClick={()=>this.onTableCfgSelect(item)}
                                                className={`colItem ${curCol === item.dataIndex ? 'active' : ''}`}
                                                style={getItemStyle(
                                                  snapshot.isDragging,
                                                  provided.draggableProps.style
                                              )}>{`${index + 1} ${item.title}`}</div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                          <div style={{padding: '5px 10px', lineHeight: '2'}}><Popover content="新建列"><Icon type="plus-circle" style={{...addColBtnStyle}} onClick={this.addTableCol} /></Popover></div>
                        </div>
                        <div className="colLine">
                          <div style={{padding: '5px 10px', width: '80px', lineHeight: '2.3'}}>不显示列:</div>
                          <div className={`${dragging ? 'dragging' : ''}`}>
                            <Droppable droppableId="hide" direction="horizontal">
                                {(provided, snapshot) => (
                                    <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                                        {hideCols.map((item, index) => (
                                            <Draggable
                                                key={item.dataIndex}
                                                draggableId={item.dataIndex}
                                                index={index}
                                                >
                                                {/* eslint-disable-next-line */}
                                                {(provided, snapshot) => (
                                                  <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={()=>this.onTableCfgSelect(item)}
                                                    className={`colItem ${curCol === item.dataIndex ? 'active' : ''} hideCol`}
                                                    style={getItemStyle(
                                                      snapshot.isDragging,
                                                      provided.draggableProps.style
                                                  )}>{item.title}</div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                          </div>
                        </div>
                      </DragDropContext>
                      <Card title="列信息编辑" bordered={false}>
                        <OopForm {...this.makeTableCfgConfig(curTableRecord)} ref={(el)=>{ this.oopTableCfgForm = el && el.getWrappedInstance() }} defaultValue={curTableRecord} />
                        <div style={{textAlign: 'right', paddingRight: '5%'}}>
                          <Button type="primary" onClick={this.handleTableCfgSubmit} style={{marginLeft: '20%'}}>保存</Button>
                          <Popconfirm
                            title="确认删除？"
                            onConfirm={() => this.handleTableCfgRemove(curTableRecord._id)}>
                            <Button type="danger" style={{marginLeft: '10px'}}>删除</Button>
                          </Popconfirm>
                        </div>
                      </Card>
                    </Row>
                  </Spin>
                 </div>
               </TabPane>
               <TabPane tab="按钮编辑" key="2">
                <Spin spinning={loading}>
                  <OopTableForm
                    columns={buttonCfgColumns}
                    onChange={this.onButtonCfgChange}
                    value={buttonCfgDatas}
                    ref={(el)=>{ this.buttonCfgForm = el }}
                  />
                  <div style={{textAlign: 'right', marginTop: '10px'}}><Button type="primary" onClick={this.handleButtonCfgSubmit}>保存</Button></div>
                 </Spin>
               </TabPane>
               <TabPane tab="其他" key="3">
                  <Spin spinning={loading}>
                    <Card bordered={false}>
                      <OopForm {...this.makeTableInfoCfgConfig(props, this.handleTableInfoCfgSubmit)} ref={(el)=>{ this.oopTableInfoCfgForm = el && el.getWrappedInstance() }} defaultValue={props} />
                    </Card>
                  </Spin>
               </TabPane>
             </Tabs>
           </div>
        </Modal>
        <Modal
          visible={modalModalCfgVisible}
          title="设计模态窗口"
          width={800}
          onCancel={() => { this.setState({modalModalCfgVisible: false}) }}
          destroyOnClose={true}
          maskClosable={false}
          style={{top: '20px'}}
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
