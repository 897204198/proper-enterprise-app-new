/*
* @auth denggy
* @date 2018-7-6 10:08:50
* @desc workflow办理的公共页
* taskOrProcDefKey 任务ID或者流程定义ID
* isLaunch 是否为发起节点
* 如果isLaunch为true taskOrProcDefKey为流程定义ID 否则为任务ID
 */
import React, { PureComponent, Fragment } from 'react';
import { Input, Modal, Button, Popover, Alert, message } from 'antd';
import OopWorkflowMain from '../OopWorkflowMain';

const { TextArea } = Input;

export default class OopWorkflowMainModal extends PureComponent {
  state = {
    buttonLoading: false,
    activeTabKey: 'handle'
    // popoverVisible: false
  }
  submitWorkflow = ()=>{
    this.setButtonLoading(true);
    this.oopWorkflowMain.submitWorkflow((res, formData)=>{
      if (res.status === 'ok') {
        this.props.closeModal();
        this.setButtonLoading(false)
        message.success('流程提交成功');
        this.props.afterProcessSubmit(res, formData);
      } else {
        message.error(res.result);
      }
    })
  }
  launchWorkflow = ()=>{
    this.setButtonLoading(true)
    this.oopWorkflowMain.launchWorkflow((res, formData)=>{
      if (res.status === 'ok') {
        this.props.closeModal();
        this.setButtonLoading(false)
        message.success('流程提交成功');
        this.props.afterProcessSubmit(res, formData);
      } else {
        message.error(res.result);
      }
    })
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
    this.props.closeModal();
    this.setButtonLoading(false);
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
        <Button onClick={this.handleCancel} style={{marginRight: 8}}>取消</Button>
        <Button type="primary" onClick={this.returnWorkflow} loading={this.state.buttonLoading}>提交</Button>
      </div>
    </div>)
  }
  handleTabsChange = (key)=>{
    this.setState({
      activeTabKey: key
    })
  }
  render() {
    const {visible, ...otherProps} = this.props;
    const {taskOrProcDefKey} = this.props;
    const footer = (
      <Fragment>
        <Popover
          placement="bottom"
          content={this.getPopoverContent()}
          trigger="click"
        >
          {!this.props.isLaunch ? <Button type="danger" ghost loading={this.state.buttonLoading} style={{display: 'none', float: 'left'}}>退回</Button> : null}
        </Popover>
        <Button onClick={this.handleCancel}>取消</Button>
        {taskOrProcDefKey ? (this.state.activeTabKey === 'handle' ? (this.props.isLaunch ? <Button type="primary" onClick={this.launchWorkflow} loading={this.state.buttonLoading}>发起</Button>
          : <Button type="primary" onClick={this.submitWorkflow} loading={this.state.buttonLoading}>提交</Button>) : null) : null}
      </Fragment>);
    return (
      <Modal
         width={800}
         visible={visible}
         footer={footer}
         onCancel={this.handleCancel}
         destroyOnClose={true}
         afterClose={this.handleAfterClose}
         maskClosable={false}>
        <OopWorkflowMain
          {...otherProps}
          setButtonLoading={this.setButtonLoading}
          onTabsChange={this.handleTabsChange}
          ref={(el) => { if (el) { this.oopWorkflowMain = el.getWrappedInstance() } }} />
      </Modal>);
  }
}
