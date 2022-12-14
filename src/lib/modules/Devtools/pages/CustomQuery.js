import React, {Fragment} from 'react';
import FileSaver from 'file-saver';
import { Modal, Card, Select, Switch, Icon, Input, Button, message, Tabs, Spin, Popover} from 'antd';
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
import { ColumnsEdit } from './Pupa/components/columnsEdit'
import { makeCreateFormConfig, makeDefaultButtons, makeTableInfoCfgConfig, filterDefault, checkRepeat,
  makeRandomId, isJson, reorder, move } from './Pupa/utils'
import styles from './customQuery.less';

const { TabPane } = Tabs
const { Option } = Select
const tableInputStyle = {
  height: '32px'
}
const defaultBtnArr = makeDefaultButtons(true).map(btn => btn.name)
const renderTitle = (text) => {
  return (
    <span style={{display: 'flex', alignItems: 'center'}}>
      <Icon type="bars" style={{fontSize: 24}} /><span style={{marginLeft: 8}}>{text}</span>
    </span>
  )
}
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
        oopToast(res, '????????????', '????????????')
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
      list: { data: newList }
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
          callback('?????????????????????');
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
          callback('?????????????????????');
        }
      }
    });
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
          oopToast(res, '????????????', '????????????');
        } else {
          oopToast(res, '????????????', '????????????');
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
        oopToast(res, '????????????', '????????????');
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
      title: '??????',
      content: `?????????????????????${items.length}????????????`,
      okText: '??????',
      cancelText: '??????',
      onOk: () => {
        me.props.dispatch({
          type: 'devtoolsCustomQuery/batchRemove',
          payload: {ids: items.toString()},
          callback(res) {
            me.oopTable.clearSelection()
            oopToast(res, '????????????', '????????????');
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
              text: '??????',
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
          oopToast(res, '????????????', '????????????');
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
      console.log('???????????????');
    } else if (formDetails.formJson && formDetails.formJson.length === 0) {
      message.warning('???????????????');
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
            // ??????title???dataIndex
            if (columns[j].syncTag === formJson[k].syncTag) {
              columns[j].title = formJson[k].label
              columns[j].dataIndex = formJson[k].name
            }
            // ?????????????????????syncTag????????????????????????
            if (columns[j].dataIndex === formJson[k].name && !columns[j].syncTag) {
              columns[j].syncTag = formJson[k].syncTag
            }
          }
          // ???????????????????????????
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
          oopToast(res, '????????????', '????????????');
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
        if (!'enable,syncTag'.includes(key)) {
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
        message.error('???????????????????????????????????????????????????')
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
            oopToast(res, '????????????', '????????????')
            if (res.status === 'ok') {
              this.setState({
                curRecord: params,
                gridConfig: obj,
                curTableRecord: fieldsValue,
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
        oopToast(res, '????????????', '????????????')
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
          oopToast(res, '????????????', '????????????')
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
      title: '?????????',
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
          message.error('????????????????????????????????????')
        }
      }
    }
  }
  handleButtonCfgSubmit = () => {
    const { curRecord } = this.state
    const datas = this.buttonCfgForm.checkStatuAndFormData()
    const { edit, list } = datas
    if (edit) {
      message.error('???????????????????????????????????????')
    } else {
      const isNameRepeat = checkRepeat(list, 'name')
      if (isNameRepeat) {
        message.error('?????????????????????????????????????????????')
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
          oopToast(res, '????????????', '????????????')
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
          oopToast(res, '????????????', '????????????');
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
          oopToast(res, '??????????????????')
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
      message.error('?????????json??????')
      return false
    }
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      if (isJson(reader.result)) {
        // this.ImportJSON = JSON.parse(reader.result)
        const JSONObj = JSON.parse(reader.result)
        if (!JSONObj.code || JSONObj.code === '' || !JSONObj.tableName || JSONObj.tableName === '') {
          message.error('??????????????????????????????')
          fileBox.value = ''
          return false
        }
        let successNum = 0
        this.props.dispatch({
          type: 'devtoolsCustomQuery/checkCodeRepeat',
          payload: JSONObj.code,
          callback: (cb)=>{
            if (cb.result.length) {
              message.error('?????????????????????');
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
              message.error('?????????????????????');
            } else {
              successNum++
              this.checkUpload(successNum, JSONObj)
            }
            fileBox.value = ''
          }
        })
      } else {
        message.error('??????????????????JSON??????')
        fileBox.value = ''
      }
    }
    reader.onerror = () => {
      message.error('??????????????????')
    }
  }
  handleOpenfile = () => {
    document.getElementById('file').click()
  }
  handleOnAddItem = (item)=>{
    // ??????????????????????????????????????????????????????????????????
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
      {title: '?????????', dataIndex: 'functionName', width: 150},
      {title: '??????', dataIndex: 'tableName',
        render: (text) => {
          return (
            <Popover content={text} placement="topLeft">
              <div className={styles.ellipsis}>{text}</div>
            </Popover>
          )
        }
      },
      {title: '??????', dataIndex: 'code',
        render: (text) => {
          return (
            <Popover content={text} placement="topLeft">
              <div className={styles.ellipsis}>{text}</div>
            </Popover>
          )
        }
      },
      {title: '????????????', dataIndex: 'wfKey',
        render: (text, record) => {
          if (record.relaWf && workflowSelection.length) {
            const wf = workflowSelection.filter(item => item.value === text)
            return wf.length ? <Popover content={wf[0].label} placement="topLeft">
              <div className={styles.ellipsis}>{wf[0].label}</div>
            </Popover> : '???????????????'
          }
          return null
        }
      },
      {title: '???/??????', dataIndex: 'enable',
        render: (text, record) => {
          return <Switch checkedChildren="???" unCheckedChildren="???" checked={text} onClick={checked => this.handleToggleEnable(checked, record)} />
        }
      }
    ]
    const topButtons = [
      {
        text: '??????',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: () => { this.handleCreate() }
      },
      {
        text: '??????',
        name: 'batchDelete',
        icon: 'delete',
        display: items => (items.length > 0),
        onClick: (items) => { this.handleBatchRemove(items) }
      },
      {
        text: '??????',
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
        text: '????????????',
        name: 'designForm',
        icon: 'form',
        onClick: (record) => { this.handleDesignForm(record) },
      },
      {
        text: '????????????',
        name: 'designTable',
        icon: 'table',
        display: record => (record.formConfig && JSON.parse(record.formConfig).formJson.length > 0),
        onClick: (record) => { this.handleDesignTable(record) },
      },
      {
        text: '??????????????????',
        name: 'designModal',
        icon: 'border',
        display: record => (record.formConfig && JSON.parse(record.formConfig).formJson.length > 0),
        onClick: (record) => { this.handleDesignModal(record) },
      },
      {
        text: '??????',
        name: 'edit',
        icon: 'edit',
        onClick: (record) => { this.handleEdit(record) },
      },
      {
        text: '??????',
        name: 'download',
        icon: 'download',
        onClick: (record)=>{ this.handleDownload(record) }
      },
      {
        text: '??????',
        name: 'delete',
        icon: 'delete',
        confirm: '???????????????????????????',
        onClick: (record) => { this.handleRemove(record) },
      },
    ];
    const buttonCfgColumns = [
      {
        title: '??????',
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
                placeholder="?????????" />
            )
          }
          return text;
        }
      }, {
        title: '????????????',
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
                placeholder="???????????????????????????" />
            )
          }
          return text;
        }
      }, {
        title: '??????',
        dataIndex: 'position',
        key: 'position',
        defaultValue: 'top',
        required: true,
        render: (text, record) => {
          if (record.editable && !record.default) {
            return (
              <Select defaultValue="top" style={{ width: 'auto' }} onChange={e => this.buttonCfgForm.handleFieldChange(e, 'position', record._id)}>
                <Option value="top">????????????</Option>
                <Option value="row">????????????</Option>
              </Select>
            )
          }
          return text;
        }
      }, {
        title: '??????',
        dataIndex: 'type',
        key: 'type',
        defaultValue: 'default',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Select defaultValue="default" style={{ width: 'auto' }} onChange={e => this.buttonCfgForm.handleFieldChange(e, 'type', record._id)}>
                <Option value="primary">?????????</Option>
                <Option value="default">?????????</Option>
                <Option value="dashed">????????????</Option>
                <Option value="danger">????????????</Option>
              </Select>
            )
          }
          return text;
        }
      }, {
        title: '??????',
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
                placeholder="?????????" />
            )
          }
          return text;
        }
      }, {
        title: '??????',
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
                placeholder="?????????" />
            )
          }
          return text;
        }
      }, {
        title: '????????????',
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
                placeholder="?????????" />
            )
          }
          return text;
        }
      }, {
        title: '??????',
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
                placeholder="?????????" />
            )
          }
          return text;
        }
      }, {
        title: '???/??????',
        dataIndex: 'enable',
        key: 'enable',
        defaultValue: true,
        width: 100,
        render: (text, record) => {
          if (record.editable) {
            return (
              <Switch checkedChildren="???" unCheckedChildren="???" checked={text} onChange={e => this.buttonCfgForm.handleFieldChange(e, 'enable', record._id)} />
            )
          }
          return text === true ? '??????' : '??????';
        }
      }
    ]
    const modalCfgFormConfig = {
      formLayout: 'horizontal',
      formJson: [
        {
          label: '????????????',
          key: 'title',
          name: 'title',
          component: {
            name: 'Input',
            props: {
              placeholder: '???????????????',
            }
          },
          initialValue: modalConfig.title || '',
        },
        {
          label: '????????????',
          key: 'width',
          name: 'width',
          component: {
            name: 'InputNumber',
            props: {
              placeholder: '???????????????'
            }
          },
          initialValue: modalConfig.width || '',
        },
        {
          label: '??????',
          key: 'footer',
          name: 'footer',
          component: {
            name: 'Select',
            children: [
              {label: '??????', value: 'delete'},
              {label: '??????', value: 'cancel'},
              {label: '??????', value: 'submit'}
            ],
            props: {
              placeholder: '???????????????',
              mode: 'multiple'
            }
          },
          initialValue: modalConfig.footer || ['cancel', 'submit'],
        },
        {
          label: '?????????????????????',
          key: 'saveAfterClosable',
          name: 'saveAfterClosable',
          component: {
            name: 'Switch',
            props: {
              checkedChildren: '???',
              unCheckedChildren: '???'
            }
          },
          valuePropName: 'checked',
          initialValue: modalConfig.saveAfterClosable || false,
        },
        {
          label: '????????????????????????',
          key: 'maskClosable',
          name: 'maskClosable',
          component: {
            name: 'Switch',
            props: {
              checkedChildren: '???',
              unCheckedChildren: '???'
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
          placeholder="?????????"
          enterButtonText="??????"
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
          title={renderTitle(`${isCreate ? '??????' : '??????'}`)}
          onCancel={this.handleCancel}
          onOk={this.handleSubmit}
          destroyOnClose={true}
          maskClosable={false}
          // footer={<Button type="primary" onClick={() => { this.setState({modalAssignmentCollectVisible: false}) }}>??????</Button>}
        >
          {isCreate || Object.keys(formdata).length > 0 ?
            <OopForm {...makeCreateFormConfig(formdata, this.checkCode, this.checkTableName, workflowSelection)} ref={(el)=>{ this.oopCreateForm = el && el.getWrappedInstance() }} />
            : <div style={{textAlign: 'center'}}><Spin /></div>
          }
        </Modal>
        <Modal
          visible={this.state.modalFormDesignerVisible}
          width="90%"
          title="????????????"
          style={{top: '20px'}}
          onCancel={this.handleFormDesignerModalCancel}
          onOk={this.handleFormDesignerModalSubmit}
          okText="??????"
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
           title="????????????"
           onCancel={() => { this.setState({modalTableCfgVisible: false}) }}
           destroyOnClose={true}
           maskClosable={false}
           style={{top: '20px'}}
           footer={
             <Fragment>
               <Button onClick={this.handleTableCfgCancel}>??????</Button>
             </Fragment>
           }
         >
           <div style={{marginTop: '-24px'}}>
             <Tabs defaultActiveKey="1" animated={false}>
               <TabPane tab="?????????" key="1">
                 <ColumnsEdit
                    loading={loading}
                    curTableRecord={curTableRecord}
                    showCols={showCols}
                    hideCols={hideCols}
                    curCol={curCol}
                    dragging={dragging}
                    onSelect={this.onTableCfgSelect}
                    onSubmit={this.handleTableCfgSubmit}
                    onRemove={this.handleTableCfgRemove}
                    onDragStart={this.onDragStart}
                    onDragEnd={this.onDragEnd}
                    addTableCol={this.addTableCol}
                    self={this}
                 />
               </TabPane>
               <TabPane tab="????????????" key="2">
                <Spin spinning={loading}>
                  <OopTableForm
                    columns={buttonCfgColumns}
                    onChange={this.onButtonCfgChange}
                    value={buttonCfgDatas}
                    ref={(el)=>{ this.buttonCfgForm = el }}
                  />
                  <div style={{textAlign: 'right', marginTop: '10px'}}><Button type="primary" onClick={this.handleButtonCfgSubmit}>??????</Button></div>
                 </Spin>
               </TabPane>
               <TabPane tab="??????" key="3">
                  <Spin spinning={loading}>
                    <Card bordered={false}>
                      <OopForm {...makeTableInfoCfgConfig(props, gridConfig, this.handleTableInfoCfgSubmit)} ref={(el)=>{ this.oopTableInfoCfgForm = el && el.getWrappedInstance() }} defaultValue={props} />
                    </Card>
                  </Spin>
               </TabPane>
             </Tabs>
           </div>
        </Modal>
        <Modal
          visible={modalModalCfgVisible}
          title="??????????????????"
          width={800}
          onCancel={() => { this.setState({modalModalCfgVisible: false}) }}
          destroyOnClose={true}
          maskClosable={false}
          style={{top: '20px'}}
          footer={
            <Fragment>
              <Button onClick={this.handleModalCfgCancel}>??????</Button>
              <Button type="primary" onClick={this.handleModalCfgSubmit}>??????</Button>
            </Fragment>
          }
        >
          <OopForm {...modalCfgFormConfig} ref={(el)=>{ this.oopModalCfgForm = el && el.getWrappedInstance() }} defaultValue={modalConfig} />
        </Modal>
      </PageHeaderLayout>
    )
  }
}
