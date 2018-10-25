import React from 'react';
import { Form, Input, Spin, InputNumber } from 'antd';
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

const MailConfForm = Form.create()((props) => {
  const {form, appBasicInfo, loading, warningField, warningWrapper} = props;
  const {getFieldDecorator} = form;
  return (
    <Spin spinning={loading}>
      <Form
        className={classNames({[styles.warningWrapper]: warningWrapper})}>
        <FormItem
          {...formItemLayout}
          label="服务地址"
          className={warningField && warningField.mailServerHost && styles.hasWarning}
        >
          {getFieldDecorator('mailServerHost', {
            initialValue: appBasicInfo.mailServerHost || '',
            rules: [{
              required: true, message: '服务地址不能为空',
            }]
          })(
            <Input placeholder="请输入服务地址, 长度100个字" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="端口号"
          className={warningField && warningField.mailServerPort && styles.hasWarning}
        >
          {getFieldDecorator('mailServerPort', {
            initialValue: appBasicInfo.mailServerPort,
            rules: [{
              required: true, message: '端口不能为空',
            }],
          })(
            <InputNumber min={0} max={65535} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="管理员帐号"
          className={warningField && warningField.mailServerUsername && styles.hasWarning}
        >
          {getFieldDecorator('mailServerUsername', {
            initialValue: appBasicInfo.mailServerUsername || '',
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
          className={warningField && warningField.mailServerPassword && styles.hasWarning}
        >
          {getFieldDecorator('mailServerPassword', {
            initialValue: appBasicInfo.mailServerPassword || '',
            rules: [{
              required: true, message: '密码不能为空',
            }],
          })(
            <Input placeholder="请输入密码, 长度20个字" type="password" autoComplete="off" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="默认发送人"
          className={warningField && warningField.mailServerDefaultFrom && styles.hasWarning}
        >
          {getFieldDecorator('mailServerDefaultFrom', {
            initialValue: appBasicInfo.mailServerDefaultFrom,
            rules: [{
              required: true, message: '默认发送人不能为空',
            }],
          })(
            <Input placeholder="请输入默认发送人, 长度20个字" />
          )}
        </FormItem>
      </Form>
    </Spin>);
});

export default MailConfForm