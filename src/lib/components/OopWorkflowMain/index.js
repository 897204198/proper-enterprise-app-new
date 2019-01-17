/*
* @auth denggy
* @date 2018-7-6 10:08:50
* @desc workflow办理的公共页
 */
import React, { PureComponent } from 'react';
import {connect} from 'dva/index';
import { Tabs, Spin, Timeline, message } from 'antd';
import {inject} from '@framework/common/inject';
import {isApp, getApplicationContextUrl} from '@framework/utils/utils';
import OopForm from '../OopForm';
import OopPreview from '../OopPreview';
import styles from './index.less';

// 根据表单的权限设置 过滤掉不显示的字段 或者 设置某些字段为只读
const authorityFormField = (formConfig)=>{
  const {formJson, formProperties} = formConfig;
  if (formProperties) {
    const filter = (it)=>{
      if (formProperties[it.name]) {
        const {props = {}} = it.component;
        props.disabled = !formProperties[it.name].writable;
        it.component.props = {
          ...it.component.props,
          ...props
        }
        if (!it.rules) {
          it.rules = [];
        }
        it.rules = [...it.rules];
        it.rules.push({required: formProperties[it.name].require, message: '此项为必填项'})
        return it
      }
    }
    formConfig.formJson = formJson.map(filter).filter(it=>it !== undefined);
  }
};

const { TabPane } = Tabs;
const BusinessPanel = (props)=>{
  const {self, formConfig = {}, defaultValue = {}, formLoading, isLaunch, taskOrProcDefKey, approvalRemarksRequire = false} = props;
  // 清空approvalRemarks审批说明字段
  defaultValue.approvalRemarks = null;
  // { *如果审批节点 包含 审批意见 表单为只读*}  以前的逻辑
  // 如果设置了表单权限 那么按照权限来 必填也一样 如果没有设置表单权限 那么一律只读可见 必填按照表单设计的来 2018-9-26
  if (formConfig.formProperties) {
    // 解析form的权限 设置require相关
    authorityFormField(formConfig);
  } else {
    if (!formConfig.formJson) {
      formConfig.formJson = [];
    }
    formConfig.formJson.forEach((item)=>{ item.component.props = {...item.component.props, disabled: true} });
  }
  if (!isLaunch) {
    // 如果是历史节点 没有taskOrProcDefKey 没有审批意见 否则有审批意见
    if (taskOrProcDefKey) {
      const children = [
        {label: '同意', value: 1},
        {label: '不同意', value: 0},
      ];
      const ApprovalPanelJson = [{
        label: '审批意见',
        name: 'passOrNot',
        component: {
          name: 'RadioGroup',
          children,
          props: {
            onChange: (e)=>{
              // ad与am不同的组件 e代表不同的值 ad: e为ad的事件对象 am：e为picker data的索引 切为数组 如：[0]--代表第一项;
              const value = !Array.isArray(e) ? e.target.value : e[0];
              self.setState({
                approvalRemarksRequire: value === 0
              }, ()=>{
                if (value === 1) {
                  const form = self.oopForm.wrappedInstance.getForm();
                  form.validateFields(['approvalRemarks'], { force: true });
                }
              })
            }
          }
        },
        initialValue: 1
      },
      {
        label: '审批说明',
        name: 'approvalRemarks',
        component: {
          name: 'TextArea',
          props: {
            placeholder: '请对审核意见进行说明',
          },
        },
        rules: [{
          required: approvalRemarksRequire,
          message: '请填写审批意见',
        }],
      }];
      formConfig.formJson = formConfig.formJson.concat(ApprovalPanelJson);
    }
  }
  return (
    <Spin spinning={formLoading}>
      <OopForm {...formConfig} defaultValue={defaultValue} wrappedComponentRef={(el)=>{ if (el) { self.oopForm = el } }} />
    </Spin>);
}

@inject('OopWorkflowMain$model')
@connect(({OopWorkflowMain$model, loading})=>({
  OopWorkflowMain$model,
  formLoading: loading.effects['OopWorkflowMain$model/fetchByFormCode'],
  progressLoading: loading.effects['OopWorkflowMain$model/fetchProcessProgress']
}), null, null, {withRef: true})
export default class OopWorkflowMain extends PureComponent {
  state = {
    imagePreviewVisible: false,
    isApp: isApp(),
    approvalRemarksRequire: false,
    imageLoading: true,
    tabActiveKey: this.props.tabActiveKey ? this.props.tabActiveKey : 'handle'
  }
  // 表单是否加载完成
  isComplete = false;
  // 根据表单ID获取表单对象
  componentDidMount() {
    if (this.props.businessObj) {
      const { businessObj: {formKey}, setButtonLoading} = this.props;
      if (!formKey) {
        message.error('表单ID未设置')
        return
      }
      this.props.dispatch({
        type: 'OopWorkflowMain$model/fetchByFormCode',
        payload: formKey,
        callback: (resp)=>{
          this.isComplete = true;
          if (resp.result.length === 0) {
            setButtonLoading(true);
            message.error(`表单编码为${formKey}的表单不存在`);
          }
        }
      })
      if (this.state.tabActiveKey === 'progress') {
        this.handleTabsChange(this.state.tabActiveKey);
      }
    }
  }
  // 清空表单对象
  componentWillUnmount() {
    this.props.dispatch({
      type: 'OopWorkflowMain$model/clear'
    })
  }
  // 获取当前节点
  getCurrentNode = ()=>{
    const { OopWorkflowMain$model: {processProgress: {currentTasks = [], ended = false}} } = this.props;
    if (ended) {
      return (
        <Timeline.Item>
          <h3>已结束</h3>
        </Timeline.Item>)
    }
    if (currentTasks.length) {
      const current = currentTasks[0];
      return (
        <Timeline.Item>
          <h3>{current.name}</h3>
          {current.assigneeName ? <div style={{marginTop: 16}}><span>当前经办人: </span>{current.assigneeName}</div> : null}
          {
            current.candidates ? (
              current.candidates.map(it=>(
                <div style={{marginTop: 16}}><span>{it.name}: </span>{it.data.map(d=>d.name).join(',')}</div>
              ))
            ) : null
          }
        </Timeline.Item>);
    }
  }
  // 获取流程处理tab
  getHandleTabComponent = ()=>{
    const { name = null, OopWorkflowMain$model: {formEntity}, businessObj: {formData, formTitle, formProperties}, formLoading, isLaunch, taskOrProcDefKey} = this.props;
    if (formEntity === undefined || formEntity.formDetails === undefined) {
      return null;
    }
    const { formDetails } = formEntity;
    const formConfig = formDetails ? JSON.parse(formDetails) : {};
    const title = (<h2 style={{paddingLeft: 16}}>{name}</h2>);
    return (
      <div>
        {title}
        <BusinessPanel
          self={this}
          isLaunch={isLaunch}
          taskOrProcDefKey={taskOrProcDefKey}
          formLoading={formLoading}
          defaultValue={formData}
          formConfig={{...formConfig, formTitle, formProperties}}
          approvalRemarksRequire={this.state.approvalRemarksRequire} />
      </div>
    )
  }
  // 获取流程进度tab
  getProcessProgressTab = ()=>{
    const { OopWorkflowMain$model: {processProgress: {hisTasks = [], start = {}}}, progressLoading} = this.props;
    const title = (<h2>流程历史</h2>);
    return (
      <div style={{paddingLeft: 16, paddingRight: 16}}>
        {title}
        <Spin spinning={progressLoading}>
          <Timeline style={{margin: '16px 0 0 36px'}}>
            {this.getCurrentNode()}
            {hisTasks.map(it=>(
              <Timeline.Item key={it.taskId}>
                <div>{it.endTime}</div>
                <h3>{it.name}</h3>
                {it.sameAssigneeSkip ? <strong>此节点处理人与上一节点相同，已自动跳过</strong> : null}
                {it.assigneeName && <div style={{marginTop: 16}}><span>审批人: </span>{it.assigneeName}</div>}
                {it.form.formData.passOrNot !== undefined && <div style={{marginTop: 16}}><span>审批状态: </span>{it.form.formData.passOrNot === 1 ? '同意' : <span>不同意</span>}</div>}
                {it.form.formData.approvalRemarks !== undefined && <div style={{marginTop: 16}}><span>审批意见: </span>{it.form.formData.approvalRemarks}</div>}
                {/* <div style={{position: 'absolute', top: 0, marginLeft: -160}}>{it.endTime}</div> */}
              </Timeline.Item>)
            )}
            <Timeline.Item>
              <div>{start.createTime}</div>
              <h3>{start.name}</h3>
              <div style={{marginTop: 16}}><span>发起人: </span>{start.startUserName}</div>
              {/* <div style={{position: 'absolute', top: 0, marginLeft: -160}}>{start.createTime}</div> */}
            </Timeline.Item>
          </Timeline>
        </Spin>
      </div>);
  }
  // 获取流程图
  getProcessImageTab = ()=>{
    const { procInstId, processDefinitionId, stateCode} = this.props;
    const token = window.localStorage.getItem('proper-auth-login-token');
    const title = (<h2>流程图</h2>);
    const context = getApplicationContextUrl();
    let imgUrl = null;
    if (stateCode === 'DONE') {
      if (!processDefinitionId) {
        return null
      }
      imgUrl = `/repository/process-definitions/${processDefinitionId}/diagram?access_token=${token}`;
    } else {
      if (!procInstId) {
        return null
      }
      imgUrl = `/workflow/service/process/runtime/process-instances/${procInstId}/diagram?access_token=${token}`;
    }
    if (!imgUrl) {
      return null
    }
    let img = new Image();
    img.onload = ()=>{
      this.setState({
        imageLoading: false
      });
      img = null;
    }
    img.src = `${context}${imgUrl}`;
    return (
      <div style={{paddingLeft: 16, paddingRight: 16}}>
        {title}
        <Spin spinning={this.state.imageLoading}><div style={{textAlign: 'center', overflowX: 'auto'}}>
          {!this.state.imageLoading ? <img alt="流程图" src={`${context}${imgUrl}`} style={{width: '100%'}} onClick={this.handlePreviewImage} /> : null}
        </div></Spin>
        {(this.state.isApp && this.state.imagePreviewVisible) ? (
          <OopPreview
            visible={this.state.imagePreviewVisible}
            onCancel={this.handleClosePreviewImage}
            isApp={this.state.isApp}
            img={{
              src: `${context}${imgUrl}`,
              alt: '流程图',
            }}
          />) : null}
      </div>);
  }
  // 点击tab变化
  handleTabsChange = (key)=>{
    const { procInstId, OopWorkflowMain$model: {processProgress}, onTabsChange } = this.props;
    if (key === 'progress' && processProgress.length === 0 && procInstId) {
      this.props.dispatch({
        type: 'OopWorkflowMain$model/fetchProcessProgress',
        payload: procInstId
      })
    }
    onTabsChange && onTabsChange(key);
  }
  // render 页面
  renderPage = ()=>{
    const { isLaunch } = this.props;
    const processProgressTab = this.getProcessProgressTab();
    const processImageTab = this.getProcessImageTab();
    const handleTab = this.getHandleTabComponent();
    const panes = [
      {title: '流程处理', key: 'handle', content: handleTab},
      (!isLaunch ? {title: '流程进度', key: 'progress', content: processProgressTab} : null),
      {title: '流程图', key: 'image', content: processImageTab},
    ]
    const tabs = (
      <Tabs defaultActiveKey={this.state.tabActiveKey} onChange={this.handleTabsChange}>
        {panes.map(tab=>(
          tab && <TabPane key={tab.key} tab={tab.title} disabled={tab.disabled}>{tab.content}</TabPane>
        ))
        }
      </Tabs>);
    return tabs;
  }
  // 提交工作流的方法
  submitWorkflow = (callback)=>{
    console.log('submitWorkflow...');
    const {taskOrProcDefKey, setButtonLoading} = this.props;
    if (!this.isComplete) {
      message.warning('有点卡哦，数据还没返回', ()=>{
        setButtonLoading(false);
      });
      return
    }
    const oopForm = this.oopForm.wrappedInstance;
    const form = oopForm.getForm();
    form.validateFields({force: true}, (err)=>{
      if (err) {
        setButtonLoading(false);
        oopForm.showValidErr(err);
        return
      }
      const formData = oopForm.getFormData();
      console.log(formData);
      oopForm.showPageLoading(true);
      this.props.dispatch({
        type: 'OopWorkflowMain$model/submitWorkflow',
        payload: {taskOrProcDefKey, formData},
        callback: (res)=>{
          oopForm.showPageLoading(false);
          callback && callback(res)
        }
      })
    });
  }
  // 发起工作流的方法
  launchWorkflow = (callback)=>{
    console.log('launchWorkflow...');
    const {taskOrProcDefKey, setButtonLoading, OopWorkflowMain$model: {formEntity: {formTodoDisplayFields = []}}} = this.props;
    if (!this.isComplete) {
      message.warning('有点卡哦，数据还没返回', ()=>{
        setButtonLoading(false);
      });
      return
    }
    if (!this.oopForm.wrappedInstance) {
      message.error('有点卡哦，数据还没返回');
      return
    }
    const oopForm = this.oopForm.wrappedInstance;
    const form = oopForm.getForm();
    form.validateFields((err)=>{
      if (err) {
        setButtonLoading(false);
        oopForm.showValidErr(err);
        return
      }
      const formData = oopForm.getFormData();
      console.log(formData);
      oopForm.showPageLoading(true);
      this.props.dispatch({
        type: 'OopWorkflowMain$model/launchWorkflow',
        payload: {taskOrProcDefKey, formData: {...formData, formTodoDisplayFields}},
        callback: (res)=>{
          oopForm.showPageLoading(false);
          callback && callback(res)
        }
      })
    });
  }
  handlePreviewImage = ()=>{
    this.setState({
      imagePreviewVisible: true
    })
  }
  handleClosePreviewImage = ()=>{
    this.setState({
      imagePreviewVisible: false
    })
  }
  render() {
    return (
      <div className={styles.container}>
        {this.renderPage()}
      </div>);
  }
}
