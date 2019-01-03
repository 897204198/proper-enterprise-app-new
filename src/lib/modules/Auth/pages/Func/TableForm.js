import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider, Select, Tooltip, Icon, Spin } from 'antd';
import styles from './TableForm.less';

const { Option } = Select;

export default class TableForm extends PureComponent {
  state = {
    loading: false,
  };
  getRowByKey(key, newData) {
    return (newData || this.props.value).filter(item => item.id === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  toggleEditable = (e, key) => {
    e.preventDefault();
    const target = this.getRowByKey(key, this.props.value);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.forceUpdate();
    }
  };
  remove(key) {
    if (key.indexOf('NEW_TEMP_ID_') === 0) {
      const { value } = this.props;
      const delIndex = value.map(item=>item.id).indexOf(key);
      value.splice(delIndex, 1);
      this.forceUpdate();
    } else {
      this.onChange('delete', this.props.value.filter(item => item.id === key)[0]);
    }
  }
  onChange = (type, item)=>{
    const data = {
      ...item
    }
    if (type === 'post' && data.id.indexOf('NEW_TEMP_ID_') === 0) {
      delete data.id
      delete data.editable
    }
    // 调用父组件的方法 返回数据
    this.props.onChange(type, data)
  }
  newMember = () => {
    const newData = this.props.value
    newData.unshift({
      id: `NEW_TEMP_ID_${this.index}`,
      method: '',
      name: '',
      resourceCode: '0',
      editable: true,
      enable: true,
      isNew: true,
    });
    this.index += 1;
    this.forceUpdate();
  };
  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(e, key);
    }
  }
  handleFieldChange(e, fieldName, key) {
    const target = this.getRowByKey(key, this.props.value);
    if (target) {
      if (e.target == null) {
        target[fieldName] = e;
      } else {
        target[fieldName] = e.target.value;
      }
      this.forceUpdate()
    }
  }
  saveRow(e, key) {
    e.persist();
    this.setState({
      loading: true,
    });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};
      if (!target.method || !target.name) {
        message.error('请填写完整信息。');
        e.target.focus();
        this.setState({
          loading: false,
        });
        return;
      }
      delete target.isNew;
      this.toggleEditable(e, key);
      this.onChange('post', target);
      this.setState({
        loading: false,
      });
    }, 300);
  }
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const target = this.getRowByKey(key, this.props.value);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.forceUpdate();
    this.clickedCancel = false;
  }
  render() {
    const column = [
      {
        title: '名称', dataIndex: 'name', width: 100, render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                style={{width: '100px'}}
                size="small"
                value={text}
                autoFocus
                onChange={e => this.handleFieldChange(e, 'name', record.id)}
                onKeyPress={e => this.handleKeyPress(e, record.id)}
                placeholder="名称"
              />
            );
          }
          return text;
        }
      },
      {title: '标识', dataIndex: 'identifier', width: 100, render: (text, record) => {
        if (record.editable) {
          return (
            <Input
              style={{width: '100px'}}
              size="small"
              value={text}
              onChange={e => this.handleFieldChange(e, 'identifier', record.id)}
              onKeyPress={e => this.handleKeyPress(e, record.id)}
              placeholder="标识"
            />
          );
        }
        return text;
      }
      },
      {title: '请求方法', dataIndex: 'method', width: 100, render: (text, record) => {
        if (record.editable) {
          return (
            <Select
              placeholder="请求方法"
              defaultValue={text}
              style={{ width: 90 }}
              onChange={e => this.handleFieldChange(e, 'method', record.id)}
              onKeyPress={e => this.handleKeyPress(e, record.id)}
              size="small">
              <Option value="GET">GET</Option>
              <Option value="POST">POST</Option>
              <Option value="PUT">PUT</Option>
              <Option value="DELETE">DELETE</Option>
            </Select>
          );
        }
        return text;
      }
      },
      {title: '请求路径', dataIndex: 'url', width: 150, render: (text, record) => {
        if (record.editable) {
          return (
            <Input
              style={{width: '150px'}}
              size="small"
              value={text}
              onChange={e => this.handleFieldChange(e, 'url', record.id)}
              onKeyPress={e => this.handleKeyPress(e, record.id)}
              placeholder="请求路径"
            />
          );
        }
        return text;
      }
      },
      {
        title: '状态', dataIndex: 'enable', width: 100, render: (text, record)=>{
          const statusText = text ? '启用' : '停用';
          if (record.editable) {
            return (
              <Select
                defaultValue={statusText}
                style={{ width: 90 }}
                onChange={e => this.handleFieldChange(e, 'enable', record.id)}
                onKeyPress={e => this.handleKeyPress(e, record.id)}
                size="small">
                <Option value="true">启用</Option>
                <Option value="false">停用</Option>
              </Select>
            );
          }
          return statusText;
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (text, record) => {
          if (!!record.editable && this.state.loading) {
            return <Spin spinning={true} size="small" />;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <Tooltip placement="bottom" title="添加">
                    <a onClick={e => this.saveRow(e, record.id)}><Icon type="check" /></a>
                  </Tooltip>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.id)}>
                    <Tooltip placement="bottom" title="删除">
                      <a><Icon type="close" /></a>
                    </Tooltip>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <Tooltip placement="bottom" title="保存">
                  <a onClick={e => this.saveRow(e, record.id)}><Icon type="check" /></a>
                </Tooltip>
                <Divider type="vertical" />
                <Tooltip placement="bottom" title="取消">
                  <a onClick={e => this.cancel(e, record.id)}><Icon type="close" /></a>
                </Tooltip>
              </span>
            );
          }
          return (
            <span>
              <Tooltip placement="bottom" title="编辑">
                <a onClick={e => this.toggleEditable(e, record.id)}><Icon type="edit" /></a>
              </Tooltip>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.id)}>
                <Tooltip placement="bottom" title="删除">
                  <a><Icon type="delete" /></a>
                </Tooltip>
              </Popconfirm>
            </span>
          );
        },
      }
    ]
    return (
      <Fragment>
        <Button
          style={{ marginBottom: 8 }}
          type="primary"
          onClick={this.newMember}
          icon="plus"
        >
          新建
        </Button>
        <Table
          {...this.props}
          rowKey={record=>record.id}
          loading={this.props.loading}
          columns={column}
          dataSource={this.props.value}
          pagination={false}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
        />
      </Fragment>
    );
  }
}
