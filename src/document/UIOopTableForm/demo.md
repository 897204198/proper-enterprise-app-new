import React from 'react';
import OopTableForm from '@pea/components/OopTableForm';
import { Switch, Input } from 'antd';

export default class APP extends React.PureComponent {
  state = {
    loading: false
  }
  onChange = (type, item) => {
    console.log(type, item)
  }
  render() {
    const {loading} = this.state;
    const columns = [
      {
        title: '关系',
        dataIndex: 'relationship',
        key: 'relationship',
        defaultValue: '',
        required: true,
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              value={text}
              onChange={e => this.tableForm.handleFieldChange(e, 'relationship', record.id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '联系人',
        dataIndex: 'username',
        key: 'username',
        defaultValue: '',
        required: true,
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              value={text}
              onChange={e => this.tableForm.handleFieldChange(e, 'username', record.id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
        defaultValue: '',
        required: true,
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              value={text}
              onChange={e => this.tableForm.handleFieldChange(e, 'phone', record.id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '联系地址',
        dataIndex: 'addr',
        key: 'addr',
        defaultValue: '',
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              value={text}
              onChange={e => this.tableForm.handleFieldChange(e, 'addr', record.id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '邮编',
        dataIndex: 'code',
        key: 'code',
        defaultValue: '',
        render: (text, record) => {
          if (record.editable) {
            return (
            <Input
              size="small"
              value={text}
              onChange={e => this.tableForm.handleFieldChange(e, 'code', record.id)}
              placeholder="请输入" />
            )
          }
          return text;
        }
      }, {
        title: '有/无效',
        dataIndex: 'enable',
        key: 'enable',
        defaultValue: false,
        filters: [
          { text: '有', value: true },
          { text: '无', value: false },
        ],
        render: (text, record) => {
          return (
          <Switch
            checkedChildren="有"
            unCheckedChildren="无"
            checked={text}
            onChange={e => this.tableForm.handleFieldChange(e, 'enable', record.id, true)}
            // onClick={checked => this.handleToggleEnable(checked, record)}
            />
          )
        }
      }
    ]
    const gridList = [
      { id: '2', username: 'shasha', relationship: '父子', addr: '哈哈', code: '77777', phone: '13236676767', enable: true },
      { id: '1', username: 'shasha', relationship: '父子', code: '77777', phone: '13236676767', enable: true },
    ]
    return (
      <OopTableForm
        ref={(el)=>{ this.tableForm = el }}
        columns = {columns}
        value={gridList}
        onChange={this.onChange}
        loading={loading}
        // size="small"
    />
    )
  }
}