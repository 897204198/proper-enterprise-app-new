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
import {authorityFormField, filterRelateBtn, getWorkflowFormByFormPath} from './utils';
import styles from './index.less';


const { TabPane } = Tabs;
const BusinessPanel = (props)=>{
  const {children, self, formConfig = {}, defaultValue = {}, formLoading, isLaunch, taskOrProcDefKey, approvalRemarksRequire = false} = props;
  filterRelateBtn(formConfig);
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
      const radioGroupChildren = [
        {label: '同意', value: 1},
        {label: '不同意', value: 0},
      ];
      const ApprovalPanelJson = [{
        label: '审批意见',
        name: 'passOrNot',
        component: {
          name: 'RadioGroup',
          children: radioGroupChildren,
          props: {
            onChange: (e)=>{
              // ad与am不同的组件 e代表不同的值 ad: e为ad的事件对象 am：e为picker data的索引 切为数组 如：[0]--代表第一项;
              const value = !Array.isArray(e) ? e.target.value : e[0];
              self.setState({
                approvalRemarksRequire: value === 0
              }, ()=>{
                if (value === 1) {
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
          message: '该项为必填项',
        }],
      }];
      formConfig.formJson = formConfig.formJson.concat(ApprovalPanelJson);
    }
  }
  return (
    <Spin spinning={!!formLoading}>
      <OopForm {...formConfig} defaultValue={defaultValue} ref={(el)=>{ self.oopForm = el && el.getWrappedInstance() }}>
        {children}
      </OopForm>
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
    tabActiveKey: this.props.tabActiveKey ? this.props.tabActiveKey : 'handle',
    businessForm: undefined
  }
  // 表单是否加载完成
  isComplete = false;
  // 根据表单ID获取表单对象
  componentDidMount() {
    if (this.props.businessObj) {
      const { businessObj: {formKey}} = this.props;
      if (!formKey) {
        message.error('表单ID未设置')
        return
      }
      this.getFormConfig(formKey);
      if (this.state.tabActiveKey === 'progress') {
        this.handleTabsChange(this.state.tabActiveKey);
      }
    }
  }
  /**
   *  三种情况
   *  1. example 自定义表单中的唯一编码
   *  2. @example 代表是Pupa的配置 example 表示是Pupa中的唯一编码
   *  3. @basePageCfg/fetchPageCfgByCodeForWf#example 暴露出的redux action 此时example为参数
   *  4. /module/Interface/pages/Forms/MyBusinessForm.jsx 用户开发的表单组件
   *  注1: 第二种@example是语法糖 最终会被转换成 @basePageCfg/fetchPageCfgByCodeForWf#example
   *  注2: 第四种情况需要用户自己处理权限行为
   */
  getFormConfig = (key)=>{
    let formKey = key
    const {setButtonLoading} = this.props;
    if (formKey.startsWith('@') && !formKey.includes('/')) {
      formKey = `@basePageCfg/fetchPageCfgByCodeForWf#${formKey.split('@')[1]}`;
    }
    // formKey包含“.jsx”则代表是表单的相对路径
    if (formKey.includes('.jsx')) {
      const businessForm = getWorkflowFormByFormPath(formKey);
      if (businessForm && businessForm.default) {
        // eslint-disable-next-line
        this.setState({
          businessForm: businessForm.default
        }, ()=>{
          this.isComplete = true
        })
      }
      // formKey包含“/”则代表是一个redux 的action 参数用#分割
    } else if (formKey.includes('/')) {
      const action = formKey.split('#')[0];
      const payload = formKey.split('#')[1];
      const type = action.split('@')[1];
      if (type === undefined) {
        message.error(`formkey${formKey}配置错误`);
        return
      }
      this.props.dispatch({
        type,
        payload,
        callback: (resp)=>{
          this.isComplete = true;
          if (!resp) {
            setButtonLoading(true);
            message.error(`表单接口${formKey}获取表单数据失败`);
          } else {
            // 让数据走一遍redux
            this.props.dispatch({
              type: 'OopWorkflowMain$model/saveFormEntity',
              payload: {
                result: [{formDetails: resp}]
              }
            })
          }
        }
      })
    } else {
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
    if ((formEntity === undefined || formEntity.formDetails === undefined) && this.state.businessForm === undefined) {
      return null;
    }
    // console.log('formLoading', formLoading)
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
          formLoading={this.state.businessForm !== undefined ? false : formLoading}
          defaultValue={formData}
          formConfig={{...formConfig, formTitle, formProperties}}
          approvalRemarksRequire={this.state.approvalRemarksRequire}>
          { this.state.businessForm }
        </BusinessPanel>
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
    this.doWorkflow(callback, 'submitWorkflow');
  }
  // 发起工作流的方法
  launchWorkflow = (callback)=>{
    console.log('launchWorkflow...');
    this.doWorkflow(callback, 'launchWorkflow');
  }
  // 工作流具体业务
  doWorkflow = (callback, type)=>{
    const {taskOrProcDefKey, setButtonLoading, OopWorkflowMain$model: {formEntity: {formTodoDisplayFields = []}}} = this.props;
    if (!this.isComplete) {
      message.loading('有点卡哦，数据还没返回', ()=>{
        setButtonLoading(false);
      });
      return
    }
    const {oopForm} = this;
    const form = oopForm.getForm();
    const oopFormChildrenRef = oopForm.childrenRef;
    form.validateFields({force: true}, (err)=>{
      if (err) {
        setTimeout(()=>{
          setButtonLoading(false);
        }, 200)
        oopForm.showValidErr(err);
        return
      }
      const formData = oopForm.getFormData();
      if (oopFormChildrenRef && oopFormChildrenRef.validateOopForm) {
        if (!oopFormChildrenRef.validateOopForm(formData)) {
          setTimeout(()=>{
            setButtonLoading(false);
          }, 200)
          return
        }
      }
      console.log('formData before commit', formData);
      oopForm.showPageLoading(true);
      this.props.dispatch({
        type: `OopWorkflowMain$model/${type}`,
        payload: {taskOrProcDefKey, formData: type === 'launchWorkflow' ? {...formData, formTodoDisplayFields} : formData},
        callback: (res)=>{
          oopForm.showPageLoading(false);
          callback && callback(res, formData)
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
