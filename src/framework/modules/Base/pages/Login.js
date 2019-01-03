import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Checkbox, Alert, Icon, Modal, Form, Input, message } from 'antd';
import Login from '@framework/components/Login';
import {inject} from '@framework/common/inject';
import styles from './Login.less';


const { Tab, UserName, Password, Mobile, Captcha, Submit } = Login;
const FormItem = Form.Item;
const AddressForm = Form.create()((props)=>{
  const { form, address, addressCache = [], self } = props;
  const {getFieldDecorator} = form;
  const selectAddress = (event)=>{
    const {value} = event.currentTarget.parentNode.parentNode.firstElementChild
    self.addAddress(value);
  }
  const clearAddress = ()=>{
    self.clearAddress();
  }
  const arr = ['address', 'address1', 'address2'];
  return (
    <Form>
      {
        arr.map((it, index)=>{
          const value = addressCache ? addressCache[index] : '';
          return (
            <FormItem key={it} label={`请求地址${++index}`} >
              {getFieldDecorator(it, {
                initialValue: value,
                rules: [{
                  pattern: /^http:\/\/|https:\/\/[A-Za-z0-9]+.[A-Za-z0-9]+[=?%\-&_~`@[\]':+!]*([^<>""])*$/, message: 'url地址格式不正确',
                }]
              })(
                <Input
                  className={value === address ? styles.active : ''}
                  placeholder="请输入请求地址"
                  addonAfter={
                    value === address ? <a style={{color: 'red'}} onClick={clearAddress}><Icon type="close" /></a> : <a onClick={selectAddress}><Icon type="check" /></a>
                  }
                />
              )}
            </FormItem>
          )
        })
      }
    </Form>
  )
})

@inject('baseLogin')
@connect(({ baseLogin, loading }) => ({
  baseLogin,
  submitting: loading.effects['baseLogin/login'],
}))
export default class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  }

  onTabChange = (type) => {
    this.setState({ type });
  }

  handleSubmit = (err, values) => {
    if (!err) {
      this.props.dispatch({
        type: 'baseLogin/login',
        payload: {
          ...values,
        },
      });
    }
  }

  changeAutoLogin = (e) => {
    this.setState({
      autoLogin: e.target.checked,
    });
  }

  renderMessage = (content) => {
    return (
      <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
    );
  }
  toggleModalShow = (flag)=>{
    this.props.dispatch({
      type: 'baseLogin/toggleShowModal',
      payload: flag
    })
  }
  handleOnOk = ()=>{
    const {validateFields} = this.addressForm;
    validateFields((err, fieldsValue) => {
      if (err) return;
      this.props.dispatch({
        type: 'baseLogin/setAddressCache',
        payload: fieldsValue,
        callback() {
          message.success('后台地址保存成功!');
        }
      })
    });
  }
  addAddress = (address)=>{
    const {validateFields} = this.addressForm;
    validateFields((err, fieldsValue) => {
      if (err) return;
      this.props.dispatch({
        type: 'baseLogin/setAddressCache',
        payload: fieldsValue,
        callback: ()=>{
          this.props.dispatch({
            type: 'baseLogin/addAddress',
            payload: address,
            callback() {
              message.success(`后台地址切换成功! ${address}`)
            }
          })
        }
      })
    });
  }
  clearAddress = ()=>{
    this.props.dispatch({
      type: 'baseLogin/clearAddress',
      callback() {
        message.success('后台暂无设置地址')
      }
    })
  }
  render() {
    const { baseLogin, submitting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
        >
          <Tab key="account" tab="账户密码登录">
            {
              baseLogin.showError && this.renderMessage('账户或密码错误')
            }
            <UserName name="username" placeholder="请输入账户名" />
            <Password name="pwd" placeholder="请输入密码" />
          </Tab>
          <Tab key="mobile" tab="手机号登录">
            {
              baseLogin.status === 'error' &&
              baseLogin.type === 'mobile' &&
              !baseLogin.submitting &&
              this.renderMessage('验证码错误')
            }
            <Mobile name="mobile" />
            <Captcha name="captcha" />
          </Tab>
          <div>
            <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin}>自动登录</Checkbox>
            <a style={{ float: 'right' }} href="">忘记密码</a>
          </div>
          <Submit loading={submitting}>登录</Submit>
          <div className={styles.other}>
            其他登录方式
            <Icon className={styles.icon} type="alipay-circle" />
            <Icon className={styles.icon} type="taobao-circle" />
            <Icon className={styles.icon} type="weibo-circle" />
            <Link className={styles.register} to="/base/register">注册账户</Link>
          </div>
        </Login>
        <Modal
          visible={ baseLogin.modalVisible }
           onCancel={()=>{ this.toggleModalShow(false) }}
           onOk={this.handleOnOk}
           destroyOnClose={true}>
          <AddressForm address={baseLogin.address } addressCache={baseLogin.addressCache} ref={(el)=>{ this.addressForm = el }} self={this} />
        </Modal>
      </div>
    );
  }
}
