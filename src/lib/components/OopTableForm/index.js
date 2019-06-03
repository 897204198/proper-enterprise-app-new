import React, { PureComponent, Fragment } from 'react';
import { Table, Button, message, Popconfirm, Divider, Tooltip, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import styles from './index.less';

export default class OopTableForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // loading: false,
      editState: false
    };
  }

  getRowByKey(key, newData) {
    return (newData || this.props.value).filter(item => item._id === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  toggleEditable = (e, key, type = false) => {
    const { editState } = this.state;
    e.preventDefault();
    if (editState) {
      message.error('正处于编辑状态');
      return false;
    }
    this.setState({
      editState: type
    })
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
    if (key._id.indexOf('NEW_TEMP_ID_') === 0) {
      const { value } = this.props;
      const delIndex = value.map(item=>item._id).indexOf(key);
      value.splice(delIndex, 1);
      this.forceUpdate();
    } else {
      this.onChange('delete', key);
    }
    this.setState({
      editState: false
    })
  }
  onChange = (type, item)=>{
    const data = {
      ...item
    }
    if (type === 'post' && data._id.indexOf('NEW_TEMP_ID_') === 0) {
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
                  <a onClick={e => this.saveRow(e, record._id, 'post')}><Icon type="check" /></a>
                </Tooltip>
                <Divider type="vertical" />
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record)}>
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
                <a onClick={e => this.saveRow(e, record._id, 'put')}><Icon type="check" /></a>
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip placement="bottom" title="取消">
                <a onClick={e => this.cancel(e, record._id)}><Icon type="close" /></a>
              </Tooltip>
            </span>
          );
        }
        return (
          <span>
            <Tooltip placement="bottom" title="编辑">
              <a onClick={e => this.toggleEditable(e, record._id, true)}><Icon type="edit" /></a>
            </Tooltip>
            {
              !record.default ? (
                <Fragment>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record)}>
                    <Tooltip placement="bottom" title="删除">
                      <a><Icon type="delete" /></a>
                    </Tooltip>
                  </Popconfirm>
                </Fragment>
              ) : null
            }
          </span>
        );
      },
    })
    return cols
  }
  newMember = () => {
    const { columns } = this.props;
    const { editState } = this.state;
    if (editState) {
      message.error('正处于编辑状态');
      return false;
    }
    const newObj = {};
    this.setState({
      editState: true
    })
    columns.forEach((element) => {
      newObj[element.key] = element.defaultValue;
    });
    const newData = this.props.value;
    newData.push({
      ...newObj,
      id: `NEW_TEMP_ID_${this.index}`,
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.forceUpdate();
  };
  // handleKeyPress(e, key) {
  //   if (e.key === 'Enter') {
  //     this.setState({
  //       editState: false
  //     })
  //     this.saveRow(e, key);
  //   }
  // }
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
  saveRow(e, key, type) {
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
      this.setState({
        editState: false
      }, () => {
        this.toggleEditable(e, key);
        this.onChange(type, target);
      })
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
    this.setState({
      editState: false
    })
  }
  titleFactory = (title) => {
    return (
      <div>
        <span style={{color: 'red'}}>*</span>{title}
      </div>
    )
  }
  checkStatuAndFormData = () => {
    const { value } = this.props;
    const list = [
      ...value
    ]
    const { editState } = this.state;
    const newList = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i]._id && list[i]._id.indexOf('NEW_TEMP_ID_') === 0 && list[i].editable) {
        // eslint-disable-next-line
        continue;
      } else {
        delete list[i].editable
        newList.push(list[i])
      }
    }
    const obj = {
      list: newList,
      edit: editState
    }
    return obj;
  }
  addItemId = (value) => {
    value.map((item) => {
      if (!item._id) {
        item._id = `${Date.now() + Math.random()}`
      }
      return null
    })
  }
  render() {
    const { columns, value } = this.props;
    const colarray = cloneDeep(columns);
    this.addItemId(value);
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
          rowKey={record=>record._id}
          loading={this.props.loading}
          columns={cols}
          dataSource={value}
          pagination={false}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
        />
      </Fragment>
    );
  }
}
