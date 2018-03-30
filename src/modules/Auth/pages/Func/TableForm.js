import React, { PureComponent, Fragment } from 'react';
import { Table, Button, Input, message, Popconfirm, Divider } from 'antd';
import styles from './TableForm.less';

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
      this.props.value.pop()
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
    }
    // 调用父组件的方法 返回数据
    this.props.onChange(type, data)
  }
  newMember = () => {
    const newData = this.props.value
    newData.push({
      id: `NEW_TEMP_ID_${this.index}`,
      identifier: '',
      name: '',
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
      target[fieldName] = e.target.value;
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
      if (!target.identifier || !target.name) {
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
        title: '状态', dataIndex: 'enable', width: 80, render: (record)=>{
          if (record) {
            return '已启用';
          } else {
            return '已禁用';
          }
        }
      },
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (text, record) => {
          if (!!record.editable && this.state.loading) {
            return null;
          }
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                  <a onClick={e => this.saveRow(e, record.id)}>添加</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.id)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            }
            return (
              <span>
                <a onClick={e => this.saveRow(e, record.id)}>保存</a>
                <Divider type="vertical" />
                <a onClick={e => this.cancel(e, record.id)}>取消</a>
              </span>
            );
          }
          return (
            <span>
              <a onClick={e => this.toggleEditable(e, record.id)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.id)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        },
      }
    ]
    return (
      <Fragment>
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
        <Button
          style={{ width: '100%', marginTop: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
        >
          添加
        </Button>
      </Fragment>
    );
  }
}
