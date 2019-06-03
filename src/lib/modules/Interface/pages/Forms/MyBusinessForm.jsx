/* eslint-disable*/
import React, {Fragment} from 'react';
import {Form, Input, InputNumber, Radio, message} from 'antd';
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import OopTable from '@pea/components/OopTable';


const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

@inject('formCurrentComponentSetting')
@connect(({formCurrentComponentSetting, loading})=>({
  formCurrentComponentSetting,
  loading: loading.models.formCurrentComponentSetting
}), null, null, {withRef: true})
export default class MyBusinessForm extends React.PureComponent {
  state = {
    list: []
  }
  componentDidMount() {
    this.onLoad();
  }
  onLoad = ()=>{
    this.props.dispatch({
      type: 'formCurrentComponentSetting/fetch',
      callback: (resp)=>{
        this.setState({
          list: resp.result
        })
      }
    });
  }
  validateOopForm = (formData)=>{
    console.log(formData);
    if (this.state.list.length === 0) {
      message.error('必须添加一条数据');
    } else {
      formData.list = this.state.list;
      return true
    }
  }
  render() {
    const {form, defaultValue: groupsBasicInfo, loading} = this.props;
    const {list} = this.state;
    // console.log(this.props);
    const {columns} = {
      columns: [
        {title: '名称', dataIndex: 'name'},
        {title: '编码', dataIndex: 'code'},
        {title: 'URL', dataIndex: 'url'},
        {title: '回显的属性值', dataIndex: 'showPropName'},
        {title: '是否可编', dataIndex: 'editable', render: (text)=>{
          if (text === 1) {
            return '是';
          } else if (text === 0) {
            return '否';
          } else {
            return '';
          }
        }},
        {title: '排序', dataIndex: 'sort'}
      ]
    };
    return (
      <Fragment>
        <div style={{flex: '0 0 100%'}}>
          {form.getFieldDecorator('id', {
            initialValue: groupsBasicInfo.id,
          })(
            <Input type="hidden" />
          )}
        </div>
        <FormItem
          {...formItemLayout}
          label="名称"
          style={{flex: '0 0 100%'}}
        >
          {form.getFieldDecorator('name', {
            initialValue: groupsBasicInfo.name,
            rules: [{ required: true, message: '名称不能为空' }],
          })(
            <Input placeholder="请输入名称" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="顺序"
        >
          {form.getFieldDecorator('seq', {
            initialValue: groupsBasicInfo.seq,
            rules: [
              { required: true, message: '顺序不能为空' },
              { pattern: /\d+/i, message: '顺序只能为数字'}
            ],
          })(
            <InputNumber placeholder="请输入顺序" min={1} max={999} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="状态"
        >
          {form.getFieldDecorator('enable', {
            initialValue: groupsBasicInfo.enable == null ? true : groupsBasicInfo.enable
          })(
            <RadioGroup>
              <Radio value={true}>启用</Radio>
              <Radio value={false}>停用</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="描述"
        >
          {form.getFieldDecorator('description', {
            initialValue: groupsBasicInfo.description
          })(
            <TextArea placeholder="请输入描述" autosize={{ minRows: 2, maxRows: 5 }} />
          )}
        </FormItem>
        <OopTable
          loading={!!loading}
          grid={{list}}
          columns={columns}
        />
    </Fragment>);
  }
}
