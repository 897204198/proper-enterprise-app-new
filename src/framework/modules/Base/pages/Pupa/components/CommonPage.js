import React from 'react';
import {Modal, Card, Spin, Button, message, Tooltip} from 'antd';
import {connect} from 'dva';
import cloneDeep from 'lodash/cloneDeep';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import DescriptionList from '@framework/components/DescriptionList';
import { inject } from '@framework/common/inject';
import { oopToast } from '@framework/common/oopUtils';
import OopSearch from '@pea/components/OopSearch';
import OopForm from '@pea/components/OopForm';
import OopTable from '@pea/components/OopTable';
import OopWorkflowMainModal from '@pea/components/OopWorkflowMainModal';
import styles from './CommonPage.less';

const {Description} = DescriptionList;

const ModalForm = (props) => {
  const {modalConfig: {title, width, footer: footerKeys = [], maskClosable, saveAfterClosable},
    formConfig, loading, visible, onModalCancel, onModalSubmit, formEntity, self} = props;
  const submitForm = ()=>{
    const form = self.oopForm.getForm();
    const data = self.oopForm.getFormData();
    form.validateFields((err) => {
      if (err) return;
      onModalSubmit(data, form);
      if (saveAfterClosable) {
        cancelForm()
      }
    });
  }
  const cancelForm = ()=>{
    const form = self.oopForm.getForm()
    onModalCancel(form)
  }
  const footer = [];
  footerKeys.forEach((key)=>{
    if (key === 'delete') {
      footer.push(<Button key={key} onClick={cancelForm}>删除</Button>)
    } else if (key === 'submit') {
      footer.push(<Button key={key} type="primary" onClick={submitForm} loading={loading}>保存</Button>)
    } else if (key === 'cancel') {
      footer.push(<Button key={key} onClick={cancelForm}>取消</Button>)
    }
  })
  return (
    <Modal
      title={formEntity.id ? `编辑${title}` : `新建${title}`}
      visible={visible}
      footer={footer}
      onCancel={cancelForm}
      destroyOnClose={true}
      width={width || 1000}
      maskClosable={maskClosable}
      className={styles.commonPageModalContainer}
      style={{
        top: 20,
        height: 'calc(100vh - 32px)',
        overflow: 'hidden'
      }}
    >
      <Spin spinning={loading}>
        <OopForm {...formConfig} ref={(el)=>{ self.oopForm = el && el.getWrappedInstance() }} defaultValue={formEntity} />
      </Spin>
    </Modal>
  )
}
const ViewModal = (props) => {
  const {onModalCancel, loading, visible, formEntity = {}, columns = []} = props;
  return (
    <Modal
      title="查看详情"
      visible={visible}
      onCancel={onModalCancel}
      destroyOnClose={true}
      width={1000}
      maskClosable={true}
      className={styles.commonPageModalContainer}
      footer={<Button type="primary" onClick={onModalCancel}>确定</Button>}
      style={{
        top: 20,
        height: 'calc(100vh - 32px)',
        overflow: 'hidden'
      }}
    >
      <Spin spinning={loading}>
        <DescriptionList col="2">
          {
            columns.map((col)=>{
              const {title, dataIndex, render} = col;
              let value = formEntity[dataIndex];
              if (value && render) {
                value = render(value, formEntity);
              }
              return <Description term={title} key={dataIndex}>{value}</Description>
            })
          }
        </DescriptionList>
      </Spin>
    </Modal>
  )
}

@inject('workflowDesigner')
@connect(({ basePage, global, loading}) => ({
  basePage,
  global,
  loading: loading.models.basePage
}))
export default class CommonPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.formJson = cloneDeep(props.formConfig.formJson);
    this.state = {
      modalFormVisible: false,
      viewModalVisible: false,
      list: [],
      relaWf: props.relaWf,
      modalWfFormConfig: {
        wfVisible: false,
        isLaunch: false,
        taskOrProcDefKey: null,
        businessObj: null,
        procInstId: null,
      },
      onModalSubmit: this.handleModalSubmit
    }
  }
  componentDidMount() {
    this.onLoad();
  }
  onLoad = (param = {})=>{
    const {pagination, condition} = param;
    const { gridConfig: {columns}, tableName } = this.props;
    this.props.dispatch({
      type: 'basePage/fetch',
      payload: {
        pagination,
        ...condition,
      },
      tableName,
      columns,
      callback: (resp)=>{
        this.setState({
          list: resp.result
        })
      }
    });
  }
  handleCreate = ()=>{
    this.setModalFormVisible(true);
  }
  handleStart = ()=>{
    const {relaWf} = this.state;
    if (relaWf) {
      // 打开工作流面板
      this.props.dispatch({
        type: 'workflowDesigner/fetchByProcDefKey',
        payload: relaWf,
        callback: (res)=>{
          const { result: {key, name, startFormKey, id, formProperties} } = res;
          if (key && name && startFormKey && id) {
            this.setState({
              modalWfFormConfig: {
                wfVisible: true,
                isLaunch: true,
                taskOrProcDefKey: key,
                businessObj: {
                  formKey: startFormKey,
                  formProperties
                },
                name,
                processDefinitionId: id,
                stateCode: 'DONE',
              }
            })
          } else {
            message.error('该流程未部署或参数解析错误');
          }
        }
      });
    }
  }
  handleEdit = (record)=>{
    this.props.dispatch({
      type: 'basePage/fetchById',
      payload: record.id,
      tableName: this.props.tableName
    });
    this.setModalFormVisible(true);
  }
  handleRemove = (record)=>{
    this.props.dispatch({
      type: 'basePage/remove',
      payload: record.id,
      tableName: this.props.tableName,
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
          type: 'basePage/batchRemove',
          payload: {ids: items.toString()},
          tableName: this.props.tableName,
          callback(res) {
            me.oopTable.clearSelection()
            oopToast(res, '删除成功', '删除失败');
            me.onLoad()
          }
        })
      }
    });
  }
  // 点击modal窗口取消按钮
  handleModalCancel = (form)=>{
    this.setModalFormVisible(false);
    setTimeout(()=>{
      form.resetFields();
      this.props.dispatch({
        type: 'basePage/clearEntity',
        tableName: this.props.tableName
      });
      // this.props.formConfig.formJson.forEach(
      //   (item)=>{
      //     item.initialValue = undefined
      //   }
      // );
    }, 300)
  }
  // 点击modal窗口保存按钮
  handleModalSubmit = (values)=>{
    this.props.dispatch({
      type: 'basePage/saveOrUpdate',
      payload: values,
      tableName: this.props.tableName,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.onLoad();
      }
    });
  }
  filterFormJson = (formJson, btnName)=>{
    if (btnName) {
      return formJson.filter(it=>it.relateBtn === undefined || it.relateBtn.includes(btnName));
    }
    return formJson;
  }
  // modal开启 关闭
  setModalFormVisible = (flag) =>{
    // // 重置formConfig的formJson
    // if (flag === true) {
    //   this.props.formConfig.formJson = this.filterFormJson(cloneDeep(this.formJson),);
    // }
    this.setState({modalFormVisible: flag})
  }
  // 顶部搜索监听
  handleInputChange = (inputValue, filter)=>{
    const {basePage, tableName, gridConfig: {columns}} = this.props;
    const columnsKeys = columns.map(it=>it.dataIndex);
    const list = basePage[tableName].list || [];
    const filterList = inputValue ? filter(list, columnsKeys) : list;
    this.setState({
      list: filterList
    })
  }
  bingBtnClickEvent = (btn)=> {
    btn.onClick = (item)=>{
      console.log(btn);
      const {name, restPath, position} = btn;
      // 根据btn的name过滤出formJson
      const formJson = this.filterFormJson(cloneDeep(this.formJson), name);
      // 需要弹出modal
      if (formJson.length > 1) {
        this.props.formConfig.formJson = formJson;
        if (position === 'row') {
          this.handleEdit(item)
        }
        if (position === 'top') {
          this.setModalFormVisible(true);
        }
        if (restPath) {
          this.setState({
            onModalSubmit: ()=>{
              const formData = this.oopForm.getFormData();
              this.doWitchButtonClickAction(btn, formData);
            }
          })
        }
      } else {
        if (name === 'delete') {  // eslint-disable-line
          this.handleRemove(item);
        } else if (name === 'batchDelete') {
          this.handleBatchRemove(item);
        } else {
          this.doWitchButtonClickAction(btn, item);
        }
      }
    }
  }
  // 构建列表按钮
  constructGridButtons = (tbCfg = [], rbCfg = [])=>{
    const topButtons = [];
    tbCfg.forEach((tb)=>{
      if (tb.enable) {
        this.bingBtnClickEvent(tb)
        topButtons.push(tb);
      }
    })
    const rowButtons = [];
    rbCfg.forEach((rb)=>{
      if (rb.enable) {
        this.bingBtnClickEvent(rb)
        rowButtons.push(rb);
      }
    })
    // const createBtn = tbCfg.find(it=>it.name === 'create');
    // if (createBtn && createBtn.enable) {
    //   topButtons.push({
    //     text: '新建',
    //     type: 'primary',
    //     icon: 'plus',
    //     ...createBtn,
    //     name: 'create',
    //     onClick: ()=>{ this.handleCreate() }
    //   })
    // }
    // const startBtn = tbCfg.find(it=>it.name === 'start');
    // if (startBtn && startBtn.enable) {
    //   topButtons.push({
    //     text: '发起',
    //     type: 'primary',
    //     icon: 'branches',
    //     ...startBtn,
    //     name: 'start',
    //     onClick: ()=>{ this.handleStart() }
    //   })
    // }
    // const batchDeleteBtn = tbCfg.find(it=>it.name === 'batchDelete');
    // if (batchDeleteBtn && batchDeleteBtn.enable) {
    //   topButtons.push({
    //     text: '删除',
    //     icon: 'delete',
    //     ...batchDeleteBtn,
    //     display: items=>(items.length > 0),
    //     name: 'batchDelete',
    //     onClick: (items)=>{ this.handleBatchRemove(items) }
    //   })
    // }
    // const otherTopBtns = tbCfg.filter(it=>it.enable === true && it.default === undefined);
    // if (otherTopBtns && otherTopBtns.length) {
    //   otherTopBtns.forEach((button)=>{
    //     if (button) {
    //       this.doWitchButtonClickAction(button);
    //     }
    //   })
    // }
    // const rowButtons = [];
    // const editBtn = rbCfg.find(it=>it.name === 'edit');
    // if (editBtn && editBtn.enable) {
    //   rowButtons.push({
    //     text: '编辑',
    //     icon: 'edit',
    //     ...editBtn,
    //     name: 'edit',
    //     onClick: (record)=>{ this.handleEdit(record) },
    //   })
    // }
    // const deleteBtn = rbCfg.find(it=>it.name === 'delete');
    // if (deleteBtn && deleteBtn.enable) {
    //   rowButtons.push({
    //     text: '删除',
    //     icon: 'delete',
    //     confirm: '是否要删除此条信息',
    //     ...deleteBtn,
    //     name: 'delete',
    //     onClick: (record)=>{ this.handleRemove(record) },
    //   })
    // }
    // const otherRowBtns = rbCfg.filter(it=>it.enable === true && it.default === undefined);
    // if (otherRowBtns && otherRowBtns.length) {
    //   otherRowBtns.forEach((button)=>{
    //     if (button) {
    //       this.doWitchButtonClickAction(button);
    //     }
    //   })
    // }
    return {
      topButtons,
      rowButtons
    }
  }
  // 自定义restful接口
  restfulActionButtonHandle = (button, param)=>{
    const { restPath, confirm } = button;
    if (restPath) {
      const dofn = ()=>{
        this.props.dispatch({
          type: 'basePage/restfulAction',
          payload: {
            restPath,
            param
          },
          tableName: this.props.tableName,
          callback: (res)=>{
            oopToast(res, '操作成功');
            this.oopTable.clearSelection();
            this.onLoad();
          }
        })
      }
      if (confirm) {
        Modal.confirm({
          title: '提示',
          content: confirm,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            dofn();
          }
        });
      } else {
        dofn();
      }
    }
  }
  // 自定义redux接口
  reduxActionButtonHandle = (button, param)=>{
    const { restPath, confirm } = button;
    if (restPath) {
      const dofn = ()=>{
        const path = restPath.split('@')[1]
        const modelUrl = path.split('/')[0]
        inject(modelUrl)();
        this.props.dispatch({
          type: path,
          payload: param,
          tableName: this.props.tableName,
          callback: (res)=>{
            oopToast(res, '操作成功');
            this.oopTable.clearSelection();
            this.onLoad();
          }
        })
      }
      if (confirm) {
        Modal.confirm({
          title: '提示',
          content: confirm,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            dofn();
          }
        });
      } else {
        dofn();
      }
    }
  }
  // 处理按钮的点击事件 约定：包含斜线并且@开头(与工作流中的reduxAction配置一致) ==》reduxAction  @包含斜线 ==》restful请求
  doWitchButtonClickAction = (button, items)=>{
    const {restPath = ''} = button;
    if (restPath.includes('/')) {
      if (restPath.startsWith('@')) {
        this.reduxActionButtonHandle(button, items)
      } else {
        this.restfulActionButtonHandle(button, items)
      }
    } else {
      message.error(`${button.restPath} 不是一个合法的restful接口，请以'/'开头`)
    }
  }
  // 点击流程modal关闭按钮的组件
  closeProcessModal = ()=>{
    this.setState(({modalWfFormConfig})=>({
      modalWfFormConfig: {
        ...modalWfFormConfig,
        wfVisible: false
      }
    }));
    setTimeout(()=>{
      this.props.dispatch({
        type: 'basePage/clearEntity',
        tableName: this.props.tableName
      });
    }, 200)
  }
  // 流程提交成功的回调
  afterProcessSubmit = ()=>{}
  getTableInfoExtra = (list)=>{
    const { gridConfig: {props = {}}} = this.props;
    let extra;
    if (props.tableInfoExtra && list.length) {
      try {
        extra = props.tableInfoExtra(list);
      } catch (e) {
        console.log(e);
        extra = (<Tooltip placement="bottom" title={e.message}><span style={{color: 'red'}}>渲染异常</span></Tooltip>)
      }
    }
    return extra
  }
  handleViewModalVisible = (flag)=>{
    this.setState({
      viewModalVisible: flag
    })
  }
  onView = ({id})=>{
    this.props.dispatch({
      type: 'basePage/fetchById',
      payload: id,
      tableName: this.props.tableName
    });
    this.handleViewModalVisible(true)
  }
  createColumns = (cols)=>{
    const firstCol = cols[0];
    const {render: oldRender} = firstCol;
    firstCol.render = (text, record)=>{
      const value = oldRender ? oldRender(text, record) : text;
      return <div onClick={() => this.onView(record)} style={{textDecoration: 'underline', cursor: 'pointer'}}>{value}</div>;
    }
    return cols.filter(it=>it.enable !== false);
  }
  getHandleFunctionByBtnName = (btnName)=> {
    const map = {
      start: this.handleStart,
      create: this.handleModalSubmit,
      edit: this.handleModalSubmit,
      delete: this.handleRemove,
      batchDelete: this.handleBatchRemove
    }
    return map[btnName];
  }
  render() {
    const {list, modalFormVisible, viewModalVisible, modalWfFormConfig: {
      name,
      isLaunch,
      wfVisible,
      businessObj,
      taskOrProcDefKey,
      procInstId,
      processDefinitionId,
      stateCode
    }, onModalSubmit} = this.state;
    const {basePage, global: {size},
      loading, gridLoading, gridConfig: {columns: cols = [], topButtons: tbCfg, rowButtons: rbCfg},
      formConfig, modalConfig, tableName } = this.props;
    let entity = {};
    if (basePage && basePage[tableName]) {
      entity = basePage[tableName].entity || {};
    }
    const tableInfoExtra = this.getTableInfoExtra(list);
    const {topButtons, rowButtons} = this.constructGridButtons(tbCfg, rbCfg);
    const columns = this.createColumns(cols);
    return (
      <PageHeaderLayout content={
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          onInputChange={this.handleInputChange}
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            showTableInfo={true}
            tableInfoExtra={tableInfoExtra}
            showExport={true}
            loading={loading === undefined ? gridLoading : loading}
            grid={{list}}
            columns={columns}
            rowButtons={rowButtons}
            topButtons={topButtons}
            size={size}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <ModalForm
          formConfig={formConfig}
          modalConfig={modalConfig}
          visible={modalFormVisible}
          onModalCancel={this.handleModalCancel}
          onModalSubmit={onModalSubmit}
          formEntity={entity}
          loading={!!loading}
          self={this}
        />
        <OopWorkflowMainModal
          name={name}
          isLaunch={isLaunch}
          visible={wfVisible}
          businessObj={businessObj}
          taskOrProcDefKey={taskOrProcDefKey}
          procInstId={procInstId}
          processDefinitionId={processDefinitionId}
          stateCode={stateCode}
          closeModal={this.closeProcessModal}
          afterProcessSubmit={this.afterProcessSubmit}
         />
        <ViewModal
          columns={columns}
          formEntity={entity}
          visible={viewModalVisible}
          onModalCancel={()=>this.handleViewModalVisible(false)}
          loading={loading}
        />
      </PageHeaderLayout>
    )
  }
}
