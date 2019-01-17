import React from 'react';
import { connect } from 'dva';
import { Card, Input, Button, Row, Col, Divider, Form, Spin, message } from 'antd';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { oopToast } from '@framework/common/oopUtils';

const FormItem = Form.Item;
const { TextArea } = Input;
const CreateForm = Form.create()((props) => {
  const { loading, conInfo, submitForm, form, headerVal, tokenVal, type } = props;
  let req = { required: true, whitespace: true, message: `${type}不能为空`, };
  const { getFieldValue } = form;
  let handleConfirmJson = null;
  if (type === 'header') {
    req = { required: true, whitespace: true, message: 'JWT不能为空', }
    handleConfirmJson = (rule, value, callback) => {
      try {
        const obj = JSON.parse(getFieldValue('jswHeader'))
        if (Object.keys(obj).length > 2) {
          callback('输入JSON格式错误')
        } else if (Object.keys(obj)[0] !== 'id' || Object.keys(obj)[1] !== 'name') {
          callback('输入JSON格式错误')
        }
      } catch (err) {
        callback('输入JSON格式错误')
      }
      callback()
    }
  }
  const handleClick = () =>{
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      submitForm(form, fieldsValue, type);
    });
  }
  return (
    <Spin spinning={loading}>
     <Form style={{marginBottom: 20}}>
      <Card bordered={false}>
      <Row>
      <Divider orientation="left" style={{ marginTop: 0 }}>{conInfo.title}</Divider>
        <FormItem
          extra={`请输入JWT转换内容，${conInfo.leftDef}`}
          >
          {form.getFieldDecorator('jswHeader', {
            rules: [
              req, {
              validator: handleConfirmJson
            }]
          })(
            <Col offset={1}span={9} style={{ marginBottom: 20 }}>
              <Input placeholder="请输入JWT转换内容" />
            </Col>
          )
          }
        <Col span={4} style={{ textAlign: 'center', marginBottom: 20 }}>
          <Button type="primary" onClick={handleClick} style={{width: '70%', textAlign: 'center'}}>{conInfo.buttonText}</Button>
        </Col>
        <Col span={9} >
          <TextArea
            autosize
            placeholder={conInfo.rightDef}
            value={type === 'header' ? headerVal : tokenVal}
          />
        </Col>
        </FormItem>
      </Row>
      </Card>
    </Form>
    </Spin>
  )
})

@inject(['devtoolsConversion', 'global'])
@connect(({ devtoolsConversion, global, loading }) => ({
  devtoolsConversion,
  global,
  loading: loading.models.devtoolsConversion,
  tokenLoading: loading.effects['devtoolsConversion/postDecode'],
  headerLoading: loading.effects['devtoolsConversion/postHeader']
}))
export default class Conversion extends React.Component {
  state = {
    tokenVal: '',
    headerVal: ''
  }
  submitForm = (form, fields, type) => {
    const me = this;
    const params = fields.jswHeader;
    if (type === 'header') { me.postHeader(params, me) }
    if (type === 'token') { me.postCode(params, me); }
  }
  postHeader = (params, me) => {
    if (params) {
      try {
        const param = JSON.parse(params);
        me.props.dispatch({
          type: 'devtoolsConversion/postHeader',
          payload: param,
          callback: (res) => {
            me.setState({
              headerVal: res.result
            })
            oopToast(res, '转换JWT header成功', '转换JWT header失败');
          }
        })
      } catch (e) {
        message.error('输入格式不正确');
      }
    }
  }
  postCode = (params, me)=>{
    me.props.dispatch({
      type: 'devtoolsConversion/postDecode',
      payload: params,
      callback: (res) => {
        me.setState({
          tokenVal: res.result
        })
        oopToast(res, '转换Token成功', '请正确输入token');
      }
    })
  }
  render() {
    const { tokenLoading, headerLoading } = this.props;
    const first = { title: 'JWT转换', leftDef: '格式严格按照{"id":"XX","name":"XX"}，否则无法转换为json对象', rightDef: 'token(hearder part)', buttonText: '转换', type: 'header'};
    const second = { title: 'token', leftDef: 'token', rightDef: 'decodede token', buttonText: '转换', type: 'token' };
    const { tokenVal, headerVal } = this.state;
    return (
      <PageHeaderLayout>
        <CreateForm
          loading={!!headerLoading}
          conInfo={first}
          type={first.type}
          submitForm={this.submitForm}
          headerVal={headerVal}
          tokenVal={tokenVal}
            />
        <CreateForm
          loading={!!tokenLoading}
          conInfo={second}
          type={second.type}
          submitForm={this.submitForm}
          headerVal={headerVal}
          tokenVal={tokenVal}
        />
      </PageHeaderLayout>
    );
  }
}
