import React from 'react';
import { Row, Col, Form, Button, Input, Radio, Spin } from 'antd';
import classNames from 'classnames';
import ColorPicker from './components/ColorPicker';
import styles from '../Server/Manage.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
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

const CreateAppForm = Form.create()((props) => {
  const {form, appBasicInfo, loading, warningField, warningWrapper, isCreate, changeToken, changeColor } = props;
  const {getFieldDecorator} = form;
  // const changeColor = (data) => {
  //   console.log(data.color.hex)
  //   const { setFieldsValue, getFieldValue } = this.form;
  //   setFieldsValue({ appColor: data.color.hex })
  //   console.log(getFieldValue('color'))
  // }
  const { TextArea } = Input;
  return (
    <Spin spinning={loading}>
      <Form
        className={classNames({[styles.warningWrapper]: warningWrapper})}>
        <FormItem
          {...formItemLayout}
          label="启/停用"
        >
          {getFieldDecorator('enable', {
            initialValue: appBasicInfo.enable || false
          })(
            <RadioGroup>
              <Radio
                className={
                  warningField &&
                  warningField.enable &&
                  warningField.enable.prevValue && styles.hasWarning}
                value={true}>启用</Radio>
              <Radio
                className={
                  warningField &&
                  warningField.enable &&
                  !warningField.enable.prevValue && styles.hasWarning}
                value={false}>停用</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用名称"
          className={warningField && warningField.username && styles.hasWarning}
        >
          {getFieldDecorator('appName', {
            initialValue: appBasicInfo.appName || '',
            rules: [{
              required: true, message: '应用名不能为空',
            }],
          })(
            <Input placeholder="请输入服务地址, 长度100个字" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用编码"
          className={warningField && warningField.name && styles.hasWarning}
        >
          {getFieldDecorator('appKey', {
            initialValue: appBasicInfo.appKey || '',
            rules: [{
              required: true, message: '应用编码不能为空',
            }],
          })(
            <Input placeholder="请输入管理员帐号, 长度20个字, 不能包含中文" disabled={!isCreate} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="Token"
          className={warningField && warningField.appToken && styles.hasWarning}
        >
          <Row gutter={10}>
            <Col span={20}>
              {getFieldDecorator('appToken', {
                initialValue: appBasicInfo.appToken || '',
                rules: [{
                  required: true, message: 'token不能为空',
                }],
              })(
                <Input disabled={true} />
              )}
            </Col>
            <Col span={4}>
              <Button type="default" onClick={changeToken}>重新生成</Button>
            </Col>
          </Row>
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="描述"
          className={warningField && warningField.appDesc && styles.hasWarning}
        >
          {getFieldDecorator('appDesc', {
            initialValue: appBasicInfo.appDesc || '',
            rules: [{
              required: true, message: '描述不能为空',
            }],
          })(
            <TextArea rows={4} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用颜色"
          className={warningField && warningField.appColor && styles.hasWarning}
        >
          {getFieldDecorator('color', {
            initialValue: appBasicInfo.color || '',
          })(
          <Input type="hidden" />
          )}
          <ColorPicker colorChange={changeColor} color={appBasicInfo.color} /> <span> 请选择应用的代表颜色</span>
        </FormItem>
      </Form>
    </Spin>);
});

export default CreateAppForm