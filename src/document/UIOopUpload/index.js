import React from 'react';
import { Button, Form } from 'antd';
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

const UploadForm = Form.create({ name: 'meetingDetail' })((props) => {
  console.log(props.form)
  const { dragable = false } = props
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
                dragable={dragable}
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
  onSubmit = () => {
  }
  render() {
    const component = (
      <UploadForm />
    )
    const component2 = (
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
      {component: component2, fileName: 'demo2.md', title: '拖拽上传基本用法', desc: '一个简单的拖拽上传OopUpload用法'},
    ]
    return (<UIDocument name="OopUpload" option={option} />)
  }
}