import React from 'react';
import { Button, Form } from 'antd';
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

const UploadForm = Form.create({ name: 'meetingDetail' })((props) => {
  console.log(props.form)
  const { getFieldDecorator } = props.form
  return (
    <Form
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
              dragable={false}
              disabled={false}
              size="100"
              maxFiles="1"
              type={['.jpg', '.jpeg', '.png', '.gif', '.bmp']}
            />
          )
        }
      </Item>
    </Form>
  )
});
export default class OopUploadUIDOC extends React.Component {
  state = {}
  render() {
    return (<UploadForm />)
  }
}