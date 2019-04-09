import React, { PureComponent, Fragment } from 'react';
import { Table, Button, message, Popconfirm, Divider, Tooltip, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import styles from './index.less';

export default class OopTableForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // loading: false,
    };
  }

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
  createRowButtons = (columns)=>{
    const cols = [...columns]
    cols.push({
      title: '操作',
      key: 'action',
      width: 100,
      render: (text, record) => {
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
    })
    return cols
  }
  newMember = () => {
    const { columns } = this.props;
    const newObj = {};
    columns.forEach((element) => {
      newObj[element.key] = element.defaultValue;
    });
    const newData = this.props.value;
    newData.unshift({
      ...newObj,
      id: `NEW_TEMP_ID_${this.index}`,
      editable: true,
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
  handleFieldChange(e, fieldName, key, type = false) {
    const target = this.getRowByKey(key, this.props.value);
    if (target) {
      if (e.target == null) {
        target[fieldName] = e;
      } else {
        target[fieldName] = e.target.value;
      }
      this.forceUpdate();
      if (type && !target.editable) {
        this.onChange('post', target);
      }
    }
  }
  saveRow(e, key) {
    e.persist();
    const {columns} = this.props;
    const requiredArray = [];
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].required) {
        requiredArray.push(columns[i].dataIndex);
      }
    }
    // this.setState({
    //   loading: true,
    // });
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key) || {};
      let notValue = false;
      Object.keys(target).forEach((k)=> {
        for (let i = 0; i < requiredArray.length; i++) {
          if (k === requiredArray[i]) {
            if (target[k] === '') {
              notValue = true;
            }
          }
        }
      })
      if (notValue) {
        message.error('请填写完整信息。');
        e.target.focus();
        // this.setState({
        //   loading: false,
        // });
        return;
      }
      delete target.isNew;
      this.toggleEditable(e, key);
      this.onChange('post', target);
      // this.setState({
      //   loading: false,
      // });
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
  titleFactory = (title) => {
    return (
      <div>
        <span style={{color: 'red'}}>*</span>{title}
      </div>
    )
  }
  render() {
    const { columns } = this.props;
    const colarray = cloneDeep(columns);
    for (let i = 0; i < colarray.length; i++) {
      if (colarray[i].required) {
        colarray[i].title = this.titleFactory(colarray[i].title)
      }
    }
    const cols = this.createRowButtons(colarray);
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
          columns={cols}
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
