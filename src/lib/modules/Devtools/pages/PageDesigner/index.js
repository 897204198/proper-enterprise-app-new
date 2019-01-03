import React, {PureComponent} from 'react';
import fetch from 'dva/fetch';
import {Card, Form, Input, Button, Alert, Modal, message} from 'antd';
import OopFormDesigner from '../../../../components/OopFormDesigner';
import PageHeaderLayout from '../../../../../framework/components/PageHeaderLayout';


const FormItem = Form.Item;
// 替换tpl中的模板字符串${}
const getReplaceFunction = (str, ...variableName)=>{
  return Function.call(null, variableName, 'return'.concat('`').concat(str).concat('`'))
}
const {btoa, unescape, encodeURIComponent} = window;
const utf8ToB64 = (str)=>{
  return btoa(unescape(encodeURIComponent(str)));
}
const downloadContext = (context)=>{
  const contextBase64 = utf8ToB64(context);
  const url = 'data:text/plain;charset=UTF-8;base64,'.concat(contextBase64);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'config.js';
  a.click();
  a = null;
  setTimeout(()=>{
    message.success('配置文件生成成功！')
  })
}


@Form.create()
export default class PageDesigner extends PureComponent {
  state = {
    modalVisible: false,
    formDetails: {
      formJson: [],
      formLayout: 'horizontal'
    }
  }
  handleFormDesignerModalSubmit = ()=>{
    const formDetails = this.oopFormDesigner.getFormConfig();
    if (formDetails.formJson.length === 0) {
      message.warn('表单不能为空');
      return
    }
    this.setState({
      modalVisible: false,
      formDetails
    })
  }
  handleFormDesignerModalCancel = ()=>{
    this.setState({
      modalVisible: false
    })
  }
  onSubmit = (form)=>{
    const {formDetails} = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (formDetails.formJson.length === 0) {
        message.warn('表单不能为空');
        return
      }
      formDetails.formJson.forEach((item)=>{
        delete item.active
      })
      const gridConfig = {
        columns: formDetails.formJson.map(item=>({title: item.label, dataIndex: item.name}))
      }
      // 添加默认的ID
      formDetails.formJson.unshift({
        name: 'id',
        component: {name: 'Input', props: {type: 'hidden'}},
        wrapper: true
      })
      const config = {
        ...fieldsValue,
        formConfig: formDetails,
        gridConfig
      }
      this.generateConfigJs(config);
    });
  }
  designForm = ()=>{
    console.log('designForm');
    this.setState({
      modalVisible: true
    })
  }
  generateConfigJs = (config)=>{
    fetch('./config.tpl').then((resp)=>{
      resp.text().then((res)=>{
        const str = getReplaceFunction(res, 'formConfig', 'route', 'gridConfig')(JSON.stringify(config.formConfig), config.route, JSON.stringify(config.gridConfig));
        downloadContext(str)
      })
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };
    return (
      <PageHeaderLayout content={<Alert closable message="页面设计器用于生成#代码生成器#所需要的'config.js'配置文件" type="info" showIcon />}>
        <Card bordered={false}>
          <Form hideRequiredMark style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="前端页面的路由">
              {getFieldDecorator('route', {
                rules: [
                  {
                    required: true,
                    message: '请输入标题',
                  },
                ],
              })(<Input placeholder="例子(auth/user)" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="设计你的表单">
              {getFieldDecorator('formConfig', {
                rules: [
                  {
                    message: '请输入标题',
                  },
                ],
              })(<Button type="primary" icon="layout" onClick={this.designForm}>设计表单</Button>)}
            </FormItem>
            <FormItem {...tailFormItemLayout}>
              <Button type="primary" onClick={()=>{ this.onSubmit(this.props.form) }}>生成配置文件</Button>
            </FormItem>
          </Form>
        </Card>
        <Modal
          visible={this.state.modalVisible}
          width="90%"
          style={{top: '50px'}}
          onCancel={this.handleFormDesignerModalCancel}
          onOk={this.handleFormDesignerModalSubmit}
          okText="保存"
          destroyOnClose={true}>
          <OopFormDesigner
            ref={(el)=>{ this.oopFormDesigner = el }}
            formDetails={this.state.formDetails} />
        </Modal>
    </PageHeaderLayout>);
  }
}
