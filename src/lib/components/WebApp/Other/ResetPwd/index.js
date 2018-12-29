import React, { Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Form, Input, Button, Icon} from 'antd';
import {inject} from '@framework/common/inject';
import {getParamObj} from '@framework/utils/utils';
import {oopToast} from '@framework/common/oopUtils';
import * as properties from '@/config/properties';
import logo from '@/assets/logo.svg';
import styles from './index.less';

const FormItem = Form.Item;

const FormPanel = Form.create()((props)=>{
  const {loading, title, form, onSubmit} = props;
  const checkPassword = (rule, value, callback) => {
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码输入不一致');
    } else {
      callback();
    }
  };
  const formItem = (
    <Form>
      <FormItem>
        {form.getFieldDecorator('password', {
          rules: [{
            required: true, message: '密码不能为空',
          }],
        })(
          <Input type="password" placeholder="请输入密码" />
        )}
      </FormItem>
      <FormItem>
        {form.getFieldDecorator('confirmPwd', {
          rules: [{
            required: true, message: '密码不能为空',
          },
          {
            validator: checkPassword,
          }],
        })(
          <Input type="password" placeholder="请再次输入密码" />
        )}
      </FormItem>
      <Button loading={loading} onClick={()=>{ onSubmit(form) }} type="primary" style={{width: '100%'}}>提 交</Button>
    </Form>
  )
  return (<div><div className={styles.panel}>{title}</div>{formItem}</div>)
})
const SuccessPanel = ()=>{
  return (
    <div style={{textAlign: 'center'}}>
      <div><a><Icon type="check-circle" theme="filled" style={{fontSize: 50}} /></a></div>
      <div style={{fontSize: 18, marginTop: 16}}><a>新密码设置成功</a></div>
      <div style={{fontSize: 12, color: '#999', marginTop: 16}}>您可以用新设置的密码登录手机普日协同办公APP</div>
    </div>
  );
}


@inject('basePersonalCenter')
@connect(({ baseLogin, loading }) => ({
  baseLogin,
  submitting: loading.effects['basePersonalCenter/changePassword'],
}))
export default class LoginPage extends Component {
  constructor(props) {
    super(props);
    const { token } = getParamObj(this.props.location.search);
    this.state = {
      submited: false,
      token
    }
  }
  handleSubmit = (form) => {
    form.validateFieldsAndScroll((err, data) => {
      if (err) return;
      delete data.confirmPwd;
      const param = {
        ...data,
        token: this.state.token
      }
      this.props.dispatch({
        type: 'basePersonalCenter/changePassword',
        payload: param,
        callback: (resp)=>{
          oopToast(resp, '重置密码成功', '重置密码失败');
          if (resp.status === 'ok') {
            this.setState({
              submited: true
            })
          }
        }
      });
    });
  }
  render() {
    const { submitting } = this.props;
    const { submited } = this.state;
    return (
      <div className={styles.main}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>{properties.loginTitle}</span>
            </Link>
          </div>
          <div className={styles.desc}>{properties.loginSubTitle}</div>
        </div>
        {
          submited ?
          <SuccessPanel /> :
          <FormPanel title="设置新密码" onSubmit={this.handleSubmit} loading={submitting} />
        }
      </div>
    );
  }
}
