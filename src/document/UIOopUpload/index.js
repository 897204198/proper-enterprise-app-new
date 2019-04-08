import React from 'react';
import { Button, Form, Input } from 'antd';
import OopUpload from '@pea/components/OopUpload/index';
import UIDocument from '../components/UIDocument';

const { Item } = Form
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 10 },
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

const UploadForm = Form.create()((props) => {
  const { dragable = false, form } = props
  const { getFieldDecorator } = form
  const onSubmit = (e) => {
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
  }
  return (
    <Form
      onSubmit={onSubmit}
      >
      <Item
        {...formItemLayout}
        label="上传附件"
      >
        {
          getFieldDecorator('attachments', {
            initialValue: [],
          })(
              <OopUpload
                extra={<Button type="primary">上传按钮</Button>}
                dragable={dragable}
                disabled={false}
                size="100"
                maxFiles="1"
                type={['.jpg', '.jpeg', '.png', '.gif', '.bmp']}
            />
          )
        }
      </Item>
      <Item
        {...formItemLayout}
        label="姓名"
      >
        {
          getFieldDecorator('name', {
            initialValue: '',
          })(
            <Input />
          )
        }
      </Item>
      <Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit">提交</Button>
      </Item>
    </Form>
  )
});
export default class App extends React.Component {
  state = {}
  onSubmit = () => {
  }
  render() {
    const component = (
      <OopUpload />
    )
    const component2 = (
      <UploadForm />
    )
    const component3 = (
      <OopUpload
        dragable={true}
        wrapperStyles={{marginBottom: '20px'}}
        ref={(up) => { this.OopUpload = up }}
        >
        <div style={{margin: '20px auto', fontSize: '20px'}}>
          拖拽文件至此上传
        </div>
      </OopUpload>
    )
    const option = [
      {component, fileName: 'demo.md', title: '基本用法', desc: '一个简单的OopUpload用法'},
      {component: component2, fileName: 'demo2.md', title: '结合Form组件用法', desc: '结合Form组件的OopUpload用法'},
      {component: component3, fileName: 'demo3.md', title: '拖拽上传基本用法', desc: '一个拖拽上传OopUpload用法'},
    ]
    return (<UIDocument name="OopUpload" option={option} />)
  }
}