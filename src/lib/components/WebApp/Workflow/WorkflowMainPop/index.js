/*
* @auth denggy
* @date 2018-7-6 10:08:50
* @desc workflow办理的公共页
* taskOrProcDefKey 任务ID或者流程定义ID
* isLaunch 是否为发起节点
* 如果isLaunch为true taskOrProcDefKey为流程定义ID 否则为任务ID
* procInstId 流程实力ID
* name 流程办理页面
 */
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import { Input, Button, Popover, Alert, message } from 'antd';
import {inject} from '@framework/common/inject';
import {getParamObj} from '@framework/utils/utils';
import OopWorkflowMain from '../../../OopWorkflowMain';
import styles from './index.less';

const { TextArea } = Input;
const PopPage = (props)=>{
  const { footer, children } = props;
  return (
  <div className={styles.container}>
    {children}
    {footer ? <div className={styles.footer}>{footer}</div> : null}
  </div>)
}

@inject(['workflowManager'])
@connect(({loading})=>({
  formLoading: loading.effects['workflowManager/findBusinessObjByTaskId']
}))
export default class WorkflowMainPop extends PureComponent {
  static contextTypes = {
    closeBrowser: PropTypes.func,
    goHome: PropTypes.func,
  }
  constructor(props) {
    super(props);
    const { param, from = '', close = '' } = getParamObj(this.props.location.search);
    const {isLaunch, taskOrProcDefKey, procInstId, name, businessObj, stateCode, processDefinitionId, tabActiveKey} = JSON.parse(decodeURIComponent(atob(param)));
    this.state = {
      param,
      buttonLoading: true,
      activeTabKey: 'handle',
      from,
      close,
      isLaunch,
      taskOrProcDefKey,
      procInstId,
      name,
      businessObj,
      processDefinitionId,
      stateCode,
      tabActiveKey
    }
  }
  componentDidMount() {
    const {taskOrProcDefKey, businessObj} = this.state;
    // businessObj 没有form数据的时候发送请求
    if (!businessObj.formKey && !businessObj.formData) {
      this.props.dispatch({
        type: 'workflowManager/findBusinessObjByTaskId',
        payload: taskOrProcDefKey,
        callback: (res) => {
          if (typeof res === 'string') {
            message.error('此流程已被他人办理');
            return
          }
          // TODO 多个forms情况先不予考虑
          const {forms = []} = res;
          const obj = forms.length ? forms[0] : null;
          // HACK 兼容后台数据结构的问题
          if (obj.formData[obj.formKey]) {
            obj.formData = obj.formData[obj.formKey]
          }
          this.setState({
            buttonLoading: false,
            businessObj: {
              ...this.state.businessObj,
              ...obj
            }
          })
        }
      });
    } else {
      setTimeout(()=>{
        this.setState({
          buttonLoading: false,
        })
      }, 500)
    }
  }
  // app推送通知后的操作
  afterSubmitByAppNotify = ()=>{
    this.context.goHome();
  }
  // 邮件推送通知后的操作
  afterSubmitByEmailNotify = ()=>{
    console.log('close web');
    window.close();
    history.back();
  }
  submitWorkflow = ()=>{
    if (this.oopWorkflowMain) {
      this.setButtonLoading(true);
      this.oopWorkflowMain.submitWorkflow((res)=>{
        if (res.status === 'ok') {
          message.success('流程提交成功');
          // 如果从手机推送通知进来 点击办理之后 跟点击右上主页图标 逻辑一致
          setTimeout(()=>{
            this.afterSubmit();
          }, 1000);
        } else {
          message.error(res.result);
        }
      });
    }
  }
  launchWorkflow = ()=>{
    if (this.oopWorkflowMain) {
      this.setButtonLoading(true);
      this.oopWorkflowMain.launchWorkflow((res)=>{
        this.setButtonLoading(false);
        if (res.status === 'ok') {
          message.success('流程提交成功');
          // 移动端手机 发起流程之后跳转到历史页
          setTimeout(()=>{
            const {param} = this.state;
            this.props.dispatch(routerRedux.push(`/webapp/workflow/history?param=${param}&delta=-2`));
          }, 500);
        } else {
          message.error(res.result);
        }
      })
    }
  }
  setButtonLoading = (flag)=>{
    this.setState({
      buttonLoading: flag
    })
  }
  returnWorkflow = ()=>{
    console.log('returnWorkflow...');
  }
  handleCancel = ()=>{
    // this.props.dispatch(routerRedux.push('/webapp/workflow'));
    history.go(-1);
  }
  handleAfterClose = ()=>{
    this.setState({
      activeTabKey: 'handle'
    })
  }
  getPopoverContent = ()=>{
    return (
      <div style={{padding: 16}}>
        <Alert message="您正在进行退回流程操作，请填写退回意见并提交。（退回一旦成功无法撤销）" type="warning" showIcon />
        <TextArea style={{marginTop: 16, height: 90}} />
        <div style={{textAlign: 'right', marginTop: 8}}>
          <Button onClick={this.handleCancel}>取消</Button>
          <Button type="primary" onClick={this.returnWorkflow} loading={this.state.buttonLoading} style={{marginLeft: 8}}>提交</Button>
        </div>
      </div>)
  }
  handleTabsChange = (key)=>{
    this.setState({
      activeTabKey: key
    })
  }
  afterSubmit = ()=>{
    if (this.state.from === 'app') {
      this.afterSubmitByAppNotify();
    } else if (this.state.from === 'email') {
      this.afterSubmitByEmailNotify();
    } else {
      const {close} = this.state;
      if (close) {
        this.context.closeBrowser();
        return;
      }
      history.back();
      this.setButtonLoading(false);
    }
  }
  buildFooter = ()=>{
    const {activeTabKey, buttonLoading, taskOrProcDefKey, isLaunch} = this.state;
    const {cancelBtn, submitBtn} = styles;
    if (activeTabKey === 'handle') {
      return (
        <Fragment>
          <Popover
            placement="bottom"
            content={this.getPopoverContent()}
            trigger="click"
          >
            {!isLaunch ? <Button size="large" type="danger" ghost loading={this.state.buttonLoading} style={{display: 'none', float: 'left'}}>退回</Button> : null}
          </Popover>
          <Button size="large" onClick={this.handleCancel} className={cancelBtn}>取消</Button>
          {taskOrProcDefKey ? (isLaunch ? <Button size="large" type="primary" onClick={this.launchWorkflow} loading={buttonLoading} className={submitBtn}>发起</Button>
            : <Button size="large" type="primary" onClick={this.submitWorkflow} loading={buttonLoading} className={submitBtn}>提交</Button>) : null}
        </Fragment>);
    }
    return null;
  }
  render() {
    const {businessObj: {formKey}} = this.state;
    const footer = this.buildFooter();
    return (
      <PopPage
        footer={footer}
        onCancel={this.handleCancel}
        destroyOnClose={true}
        afterClose={this.handleAfterClose}
        maskClosable={false}>
        {formKey ? (
        <OopWorkflowMain
          {...this.state}
          setButtonLoading={this.setButtonLoading}
          onTabsChange={this.handleTabsChange}
          ref={(el) => { if (el) { this.oopWorkflowMain = el.getWrappedInstance() } }} />) : null}
      </PopPage>);
  }
}
