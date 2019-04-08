import React from 'react';
import { Button, Form, Input } from 'antd';
import OopUpload from '@pea/components/OopUpload/index';

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
  render() {
    return (<UploadForm />)
  }
}