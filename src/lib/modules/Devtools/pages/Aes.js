import React from 'react';
import { connect } from 'dva';
import { Card, Input, Button, Row, Col, Divider, Form, Spin } from 'antd';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { oopToast } from '@framework/common/oopUtils';

const FormItem = Form.Item;
const { TextArea } = Input;
const CreateForm = Form.create()((props) => {
  const { loading, conInfo, submitForm, form, encryptCode, decryptCode, type } = props;
  const req = { required: true, whitespace: true, message: `${type}不能为空`, };
  let str = '';
  if (type === 'ENCRYPT') {
    str = '加密'
  } else {
    str = '解密'
  }
  const handleClick = () => {
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
          extra={`请输入需要AES ${str}内容,进行AES进行${str}，右侧为${str}结果`}
          >
          {form.getFieldDecorator('aes', {
            rules: [req]
          })(
            <Col offset={1}span={9} style={{ marginBottom: 20 }}>
              <Input placeholder={`请输入需要AES ${str}内容`} />
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
            value={type === 'ENCRYPT' ? encryptCode : decryptCode}
          />
        </Col>
        </FormItem>
      </Row>
      </Card>
    </Form>
    </Spin>
  )
})
@inject(['devtoolsAes', 'global'])
  @connect(({ devtoolsAes, global, loading }) => ({
    devtoolsAes,
    global,
    loading: loading.models.devtoolsAes,
    decryptLoading: loading.effects['devtoolsAes/decrypt'],
    encryptLoading: loading.effects['devtoolsAes/encrypt']
  }))
export default class Aes extends React.Component {
  state = {
    decryptCode: '',
    encryptCode: ''
  }
  submitForm = (form, fields, type) => {
    const me = this;
    const params = fields.aes;
    if (type === 'ENCRYPT') { me.encrypt(params, me) }
    if (type === 'DECRYPT') { me.decrypt(params, me); }
  }
  // 解密
  decrypt = (params, me) => {
    me.props.dispatch({
      type: 'devtoolsAes/decrypt',
      payload: params,
      callback: (res) => {
        me.setState({
          decryptCode: res.result
        })
        oopToast(res, 'AES 解密成功', 'AES 解密失败');
      }
    })
  }
  // 加密
  encrypt = (params, me) => {
    me.props.dispatch({
      type: 'devtoolsAes/encrypt',
      payload: params,
      callback: (res) => {
        me.setState({
          encryptCode: res.result
        })
        oopToast(res, 'AES 加密成功', 'AES 加密失败');
      }
    })
  }
  render() {
    const { decryptLoading, encryptLoading } = this.props;
    const first = { title: 'AES 加密', leftDef: '请输入', rightDef: '', buttonText: 'ENCRYPT', type: 'ENCRYPT' };
    const second = { title: 'AES 解密', leftDef: '请输入', rightDef: '', buttonText: 'DECRYPT', type: 'DECRYPT' };
    const { encryptCode, decryptCode } = this.state;
    return (
      <PageHeaderLayout>
        <CreateForm
          loading={!!encryptLoading}
          conInfo={first}
          type={first.type}
          submitForm={this.submitForm}
          encryptCode={encryptCode}
        />
        <CreateForm
          loading={!!decryptLoading}
          conInfo={second}
          type={second.type}
          submitForm={this.submitForm}
          decryptCode={decryptCode}
        />
      </PageHeaderLayout>
    );
  }
}
