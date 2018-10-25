import React from 'react';
import { Form, Input, Spin } from 'antd';
import classNames from 'classnames';
import styles from '../Server/Manage.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 5},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16},
  },
};

const MessageConfForm = Form.create()((props) => {
  const {form, appBasicInfo, loading, warningField, warningWrapper } = props;
  const {getFieldDecorator} = form;
  return (
    <Spin spinning={loading}>
      <Form
        className={classNames({[styles.warningWrapper]: warningWrapper})}>
        <FormItem
          {...formItemLayout}
          label="服务地址"
          className={warningField && warningField.smsUrl && styles.hasWarning}
        >
          {getFieldDecorator('smsUrl', {
            initialValue: appBasicInfo.smsUrl || '',
            rules: [{
              required: true, message: '服务地址不能为空',
            }]
          })(
            <Input placeholder="请输入服务地址, 长度100个字" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="管理员帐号"
          className={warningField && warningField.userId && styles.hasWarning}
        >
          {getFieldDecorator('userId', {
            initialValue: appBasicInfo.userId || '',
            rules: [{
              required: true, message: '帐号不能为空',
            }],
          })(
            <Input placeholder="请输入管理员帐号, 长度20个字, 不能包含中文" autoComplete="off" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="密码"
          className={warningField && warningField.password && styles.hasWarning}
        >
          {getFieldDecorator('password', {
            initialValue: appBasicInfo.password || '',
            rules: [{
              required: true, message: '密码不能为空',
            }],
          })(
            <Input placeholder="请输入密码, 长度20个字" type="password" autoComplete="off" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="字符集"
          className={warningField && warningField.smsCharset && styles.hasWarning}
        >
          {getFieldDecorator('smsCharset', {
            initialValue: appBasicInfo.smsCharset,
            rules: [{
              required: true, message: '字符集不能为空',
            }],
          })(
            <Input placeholder="请输入字符集, 长度20个字" />
          )}
        </FormItem>
      </Form>
    </Spin>);
});

export default MessageConfForm