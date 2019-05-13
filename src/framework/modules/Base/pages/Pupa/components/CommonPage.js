import React from 'react';
import { Modal, Card, Spin, Button, message } from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { inject } from '@framework/common/inject';
import { oopToast } from '@framework/common/oopUtils';
import OopSearch from '@pea/components/OopSearch';
import OopForm from '@pea/components/OopForm';
import OopTable from '@pea/components/OopTable';
import OopWorkflowMainModal from '@pea/components/OopWorkflowMainModal';
import styles from './CommonPage.less';

const ModalForm = (props) => {
  const {modalConfig: {title, width, footer: footerKeys = [], maskClosable, saveAfterClosable},
    formConfig, loading, visible, onModalCancel, onModalSubmit, formEntity} = props;
  const submitForm = ()=>{
    const form = this.oopForm.getForm();
    const data = this.oopForm.getFormData();
    form.validateFields((err) => {
      if (err) return;
      // 直接归档入库
      data.Pupa__filed = 1;
      onModalSubmit(data, form);
      if (saveAfterClosable) {
        cancelForm()
      }
    });
  }
  const cancelForm = ()=>{
    const form = this.oopForm.getForm()
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
        <OopForm {...formConfig} ref={(el)=>{ this.oopForm = el && el.getWrappedInstance() }} defaultValue={formEntity} />
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
    this.state = {
      modalFormVisible: false,
      list: [],
      relaWf: props.relaWf,
      modalWfFormConfig: {
        wfVisible: false,
        isLaunch: false,
        taskOrProcDefKey: null,
        businessObj: null,
        procInstId: null,
      }
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
      this.props.formConfig.formJson.forEach(
        (item)=>{
          item.initialValue = undefined
        }
      );
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
  // modal开启 关闭
  setModalFormVisible = (flag) =>{
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
  // 构建列表按钮
  constructGridButtons = (tbCfg = [], rbCfg = [])=>{
    const topButtons = [];
    const createBtn = tbCfg.find(it=>it.name === 'create');
    if (createBtn && createBtn.enable) {
      topButtons.push({
        text: '新建',
        type: 'primary',
        icon: 'plus',
        ...createBtn,
        name: 'create',
        onClick: ()=>{ this.handleCreate() }
      })
    }
    const startBtn = tbCfg.find(it=>it.name === 'start');
    if (startBtn && startBtn.enable) {
      topButtons.push({
        text: '发起',
        type: 'primary',
        icon: 'branches',
        ...startBtn,
        name: 'start',
        onClick: ()=>{ this.handleStart() }
      })
    }
    const batchDeleteBtn = tbCfg.find(it=>it.name === 'batchDelete');
    if (batchDeleteBtn && batchDeleteBtn.enable) {
      topButtons.push({
        text: '删除',
        icon: 'delete',
        ...batchDeleteBtn,
        display: items=>(items.length > 0),
        name: 'batchDelete',
        onClick: (items)=>{ this.handleBatchRemove(items) }
      })
    }
    const otherTopBtns = tbCfg.filter(it=>!'create,start,batchDelete'.includes(it.name));
    if (otherTopBtns && otherTopBtns.length) {
      otherTopBtns.forEach((button)=>{
        if (button) {
          button.onClick = (items)=>{
            if (button.restPath.includes('/')) {
              this.restfulActionButtonHandle(button, items)
            } else {
              message.error(`${button.restPath} 不是一个合法的restful接口，请以'/'开头`)
            }
          }
        }
      })
    }
    const rowButtons = [];
    const editBtn = rbCfg.find(it=>it.name === 'edit');
    if (editBtn && editBtn.enable) {
      rowButtons.push({
        text: '编辑',
        icon: 'edit',
        ...editBtn,
        name: 'edit',
        onClick: (record)=>{ this.handleEdit(record) },
      })
    }
    const otherRowBtns = rbCfg.filter(it=>!'delete,edit'.includes(it.name));
    const deleteBtn = rbCfg.find(it=>it.name === 'delete');
    if (deleteBtn && deleteBtn.enable) {
      rowButtons.push({
        text: '删除',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        ...deleteBtn,
        name: 'delete',
        onClick: (record)=>{ this.handleRemove(record) },
      })
    }
    if (otherRowBtns && otherRowBtns.length) {
      otherRowBtns.forEach((button)=>{
        if (button.restPath) {
          button.onClick = (items)=>{
            if (button.restPath.includes('/')) {
              this.restfulActionButtonHandle(button, items)
            } else {
              message.error(`${button.restPath} 不是一个合法的restful接口，请以'/'开头`)
            }
          }
        }
      })
    }
    return {
      topButtons: topButtons.concat(otherTopBtns),
      rowButtons: otherRowBtns.concat(rowButtons)
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
  afterProcessSubmit = (res, formData)=>{
    const data = {
      ...formData,
      procInstId: res.result.procInstId,
      Pupa__filed: 0
    }
    this.handleModalSubmit(data, true);
  }
  render() {
    const {list, modalFormVisible, modalWfFormConfig: {
      name,
      isLaunch,
      wfVisible,
      businessObj,
      taskOrProcDefKey,
      procInstId,
      processDefinitionId,
      stateCode
    }} = this.state;
    const {basePage, global: {size},
      loading, gridLoading, gridConfig: {columns: cols = [], topButtons: tbCfg, rowButtons: rbCfg}, formConfig, modalConfig, tableName } = this.props;
    let entity = {};
    if (basePage && basePage[tableName]) {
      entity = basePage[tableName].entity || {};
    }
    const {topButtons, rowButtons} = this.constructGridButtons(tbCfg, rbCfg);
    const columns = cols.filter(it=>it.enable !== false);
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
          onModalSubmit={this.handleModalSubmit}
          formEntity={entity}
          loading={!!loading}
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
      </PageHeaderLayout>
    )
  }
}
