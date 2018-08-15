/*
* @auth denggy
* @date 2018-7-6 10:08:50
* @desc workflow办理的公共页
 */
import React, { PureComponent } from 'react';
import {connect} from 'dva/index';
import { Tabs, Spin, Timeline, message } from 'antd';
import {inject} from '../../../framework/common/inject';
import OopForm from '../OopForm';
import OopPreview from '../OopPreview';
import {getApplicationContextUrl} from '../../../framework/utils/utils';
import styles from './index.less';

const isAndroid = ()=>{
  const {userAgent} = navigator;
  return userAgent.includes('Android') || userAgent.includes('Adr');
}
const isIOS = ()=>{
  const {userAgent} = navigator;
  return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}
const { TabPane } = Tabs;
const BusinessPanel = (props)=>{
  const {self, formConfig = {}, defaultValue = {}, formLoading, isLaunch, taskOrProcDefKey, approvalRemarksRequire = false} = props;
  // 清空approvalRemarks审批说明字段
  defaultValue.approvalRemarks = null;
  const ApprovalPanelJson = [{
    label: '审批意见',
    name: 'passOrNot',
    component: {
      name: 'RadioGroup',
      children: [
        {label: '同意', value: 1},
        {label: '不同意', value: 0},
      ],
      props: {
        onChange: (e)=>{
          self.setState({
            approvalRemarksRequire: e.target.value === 0
          }, ()=>{
            if (e.target.value === 1) {
              const form = self.oopForm.getForm();
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

  // 如果审批节点 包含 审批意见 表单为只读
  if (!isLaunch) {
    if (!formConfig.formJson) {
      formConfig.formJson = [];
    }
    formConfig.formJson.forEach((item)=>{ item.component.props = {...item.component.props, disabled: true} });
    // 如果是历史节点 没有taskOrProcDefKey 没有审批意见
    if (taskOrProcDefKey) {
      formConfig.formJson = formConfig.formJson.concat(ApprovalPanelJson);
    }
  }
  return (
    <Spin spinning={formLoading}>
      <OopForm {...formConfig} defaultValue={defaultValue} ref={(el)=>{ if (el) { self.oopForm = el } }} />
    </Spin>);
}

@inject('baseWorkflow')
@connect(({baseWorkflow, loading})=>({
  baseWorkflow,
  formLoading: loading.effects['baseWorkflow/fetchByFormCode'],
  progressLoading: loading.effects['baseWorkflow/fetchProcessProgress']
}), null, null, {withRef: true})
export default class OopWorkflowMain extends PureComponent {
  state = {
    imagePreviewVisible: false,
    isApp: isAndroid() || isIOS(),
    approvalRemarksRequire: false,
    imageLoading: true
  }
  // 表单是否加载完成
  isComplete = false;
  // 根据表单ID获取表单对象
  componentDidMount() {
    if (this.props.businessObj) {
      const { businessObj: {formKey} } = this.props;
      if (!formKey) {
        message.error('表单ID未设置')
        return
      }
      this.props.dispatch({
        type: 'baseWorkflow/fetchByFormCode',
        payload: formKey,
        callback: ()=>{
          this.isComplete = true
        }
      })
    } else {
      this.handleTabsChange('progress');
    }
  }
  // 清空表单对象
  componentWillUnmount() {
    this.props.dispatch({
      type: 'baseWorkflow/clear'
    })
  }
  // 获取当前节点
  getCurrentNode = ()=>{
    const { baseWorkflow: {processProgress: {currentTasks = [], ended = false}} } = this.props;
    if (ended) {
      return (
        <Timeline.Item>
          <h3>已结束</h3>
        </Timeline.Item>)
    } else {
      return (
        currentTasks.length && (
          <Timeline.Item>
          <h3>{currentTasks[0].name}</h3>
            {currentTasks[0].assigneeName ? <div style={{marginTop: 16}}><span>当前经办人: </span>{currentTasks[0].assigneeName}</div> : null}
            {currentTasks[0].candidateGroupNames ? <div style={{marginTop: 16}}><span>候选用户组: </span>{currentTasks[0].candidateGroupNames.join(',')}</div> : null}
            {currentTasks[0].candidateRoleNames ? <div style={{marginTop: 16}}><span>候选角色: </span>{currentTasks[0].candidateRoleNames.join(',')}</div> : null}
            {currentTasks[0].candidateUserNames ? <div style={{marginTop: 16}}><span>候选用户: </span>{currentTasks[0].candidateUserNames.join(',')}</div> : null}
          {/* <div style={{position: 'absolute', top: 0, left: -88, fontSize: 16, fontWeight: 'bold'}}>当前节点</div> */}
        </Timeline.Item>))
    }
  }
  // 获取流程处理tab
  getHandleTabComponent = ()=>{
    const { name = null, baseWorkflow: {formEntity}, businessObj: {formData, formTitle}, formLoading, isLaunch, taskOrProcDefKey} = this.props;
    const { formDetails } = formEntity;
    const formConfig = formDetails ? JSON.parse(formDetails) : {};
    const title = (<h2>{name}</h2>);
    return (
      <div>
        {title}
        <BusinessPanel
          self={this}
          isLaunch={isLaunch}
          taskOrProcDefKey={taskOrProcDefKey}
          formLoading={formLoading}
          defaultValue={formData}
          formConfig={{...formConfig, formTitle}}
          approvalRemarksRequire={this.state.approvalRemarksRequire} />
      </div>
    )
  }
  // 获取流程进度tab
  getProcessProgressTab = ()=>{
    const { baseWorkflow: {processProgress: {hisTasks = [], start = {}}}, progressLoading} = this.props;
    const title = (<h2>流程历史</h2>);
    return (
      <div>
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
      imgUrl = `/repository/process-definitions/${processDefinitionId}/diagram?access_token=${token}`;
    } else {
      if (!procInstId) {
        return null
      }
      imgUrl = `/workflow/service/api/runtime/process-instances/${procInstId}/diagram?access_token=${token}`;
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
      <div>
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
    const { procInstId, baseWorkflow: {processProgress}, onTabsChange } = this.props;
    if (key === 'progress' && processProgress.length === 0 && procInstId) {
      this.props.dispatch({
        type: 'baseWorkflow/fetchProcessProgress',
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
      {title: '流程进度', key: 'progress', content: processProgressTab, disabled: isLaunch},
      {title: '流程图', key: 'image', content: processImageTab, disabled: isLaunch},
    ]
    const tabs = (
      <Tabs defaultActiveKey={panes[0].key} onChange={this.handleTabsChange}>
        {panes.map(tab=>(
          <TabPane key={tab.key} tab={tab.title} disabled={tab.disabled}>{tab.content}</TabPane>
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
    const form = this.oopForm.getForm();
    form.validateFields({force: true}, (err, formData)=>{
      if (err) {
        setButtonLoading(false);
        return
      }
      this.props.dispatch({
        type: 'baseWorkflow/submitWorkflow',
        payload: {taskOrProcDefKey, formData},
        callback: (res)=>{
          callback && callback(res)
        }
      })
    });
  }
  // 发起工作流的方法
  launchWorkflow = (callback)=>{
    console.log('launchWorkflow...');
    const {taskOrProcDefKey, setButtonLoading} = this.props;
    if (!this.isComplete) {
      message.warning('有点卡哦，数据还没返回', ()=>{
        setButtonLoading(false);
      });
      return
    }
    const form = this.oopForm.getForm();
    form.validateFields((err, formData)=>{
      if (err) {
        setButtonLoading(false)
        return
      }
      this.props.dispatch({
        type: 'baseWorkflow/launchWorkflow',
        payload: {taskOrProcDefKey, formData},
        callback: (res)=>{
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
