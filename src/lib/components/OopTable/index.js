import React, { PureComponent, Fragment } from 'react';
import {Table, Button, Divider, Popconfirm, Tooltip, Icon, Dropdown, Menu, message} from 'antd';
import styles from './index.less';

const downloadContext = (context)=>{
  const url = 'data:text/csv;charset=UTF-8,\uFEFF'.concat(context);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'table.csv';
  a.click();
  a = null;
  setTimeout(()=>{
    message.success('数据导出成功！')
  })
}
// 计算rowButtons的长度 18:图标的宽度 17:中间竖线的长度+margin 32:td的内边距 5:再加5px的余量 怕有人对icon自定义大小影响长度导致换行
const caculateRowButtonWidth = (n)=>{
  if (n <= 0) {
    return 0;
  }
  return n === 1 ? 60 : (n * 18) + ((n - 1) * 17) + 32 + 5
}

const getFilterParams = (filters)=>{
  const filtersParam = {}
  if (Object.values(filters).length) {
    for (const k in filters) {
      filtersParam[k] = filters[k].toString()
    }
  }
  return filtersParam
}
export default class OopTable extends PureComponent {
  state = {
    selectedRowKeys: [],
    selectedRowItems: [],
    changeRows: [],
    filters: null
  }
  rowSelectionChange = (selectedRowKeys, selectedRowItems)=>{
    this.setState({
      selectedRowKeys,
      selectedRowItems
    })
  }
  onChange = (pagination, filters, sorter)=>{
    this.setState({
      filters
    }, ()=>{
      const filtersParam = getFilterParams(this.state.filters)
      this.props.onLoad && this.props.onLoad({pagination: {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        sorter,
        ...filtersParam
      }});
    });
  }
  clearSelection = ()=>{
    this.setState({
      selectedRowKeys: [],
      selectedRowItems: []
    })
  }
  createTopButtons = (topButtons)=>{
    const btns = topButtons.map((btn) =>{
      if (btn.render) {
        return btn.render()
      } else {
        // 1.btn属性配置了displayReg并且displayReg执行返回结果为true 或者 2.没有配置displayReg 渲染按钮
        return ((btn.display && btn.display(this.state.selectedRowKeys)) || !btn.display) &&
        (
          <Button
            key={btn.name}
            icon={btn.icon}
            type={btn.type}
            style={(typeof btn.style === 'function') ? btn.style() : btn.style}
            onClick={()=>{
              btn.onClick && btn.onClick(this.state.selectedRowKeys, this.state.selectedRowItems)
            }}>
            {btn.text}
          </Button>
        )
      }
    });
    if (this.props.showExport === true) {
      const menu = (
        <Menu onClick={this.handleExport}>
          <Menu.Item key="all"><Icon type="table" style={{marginRight: 4}} />导出所有</Menu.Item>
          <Menu.Item key="selected"><Icon type="check-square-o" style={{marginRight: 4}} />导出选中</Menu.Item>
        </Menu>
      );
      const exportButton = (
      <Dropdown overlay={menu} key="export">
        <Button style={{ paddingLeft: 8, paddingRight: 8, float: 'right'}} icon="export">
          导出 <Icon type="down" />
        </Button>
      </Dropdown>);
      btns.push(exportButton)
    }
    return btns
  }
  createRowButtons = (actionColumn, columns, rowButtons)=>{
    const cols = [...columns]
    rowButtons.length && cols.push({
      ...actionColumn,
      title: '操作',
      width: caculateRowButtonWidth(rowButtons.length),
      render: (text, record)=>{
        const actions = [];
        const renderButtons = ((item)=> {
          actions.push(<Fragment key={item.name}>
            {
              item.confirm ? (
                <Popconfirm
                  title={item.confirm}
                  onConfirm={() => item.onClick(record)}>
                  {item.icon ?
                    (
                      <Tooltip placement="bottom" title={item.text}>
                        <a>
                          <Icon type={item.icon} style={(typeof item.style === 'function') ? item.style(record) : item.style} />
                        </a>
                      </Tooltip>) : <a>{item.text}</a>
                  }
                </Popconfirm>
              ) : (
                item.icon ? (
                  <Tooltip placement="bottom" title={item.text}>
                    <a onClick={() => item.onClick(record)}>
                      <Icon type={item.icon} style={(typeof item.style === 'function') ? item.style(record) : item.style} />
                    </a>
                  </Tooltip>) : <a onClick={() => item.onClick(record)}>{item.text}</a>
              )
            }
          </Fragment>)
          actions.push(<Divider key={`divider-${item.name}`} type="vertical" />)
        })
        rowButtons.map(item=> (
          item.display ? (item.display(record) ? renderButtons(item) : '') : renderButtons(item)
        ))
        actions.pop()
        return actions;
      }
    })
    return cols
  }
  selectRow = (record) => {
    const selectedRowKeys = [...this.state.selectedRowKeys];
    const delIndex = selectedRowKeys.indexOf(record.id);
    if (delIndex >= 0) {
      selectedRowKeys.splice(delIndex, 1);
    } else {
      selectedRowKeys.push(record.id);
    }
    this.setState({ selectedRowKeys });
    this.rowSelectionChange(selectedRowKeys);
    this.props.onRowSelect(record, selectedRowKeys);
  }
  rowClick = (record) => {
    return {
      onClick: () => {
        this.selectRow(record);
      },
    }
  }
  addSelectRow = (original, modifaction) => {
    original.map(item => modifaction.push(item))
  }
  addSelectRowKeys = (original, modifaction) => {
    original.map(item => modifaction.push(item.id))
  }
  getPreSelectState = () => {
    const { selectedRows, changeRows } = this.state;
    const keys = [];
    const lastCheck = selectedRows.filter(item => !changeRows.some(ele => ele.id === item.id))
    this.addSelectRowKeys(lastCheck, keys)
    if (selectedRows.length < changeRows.length) {
      this.addSelectRow(changeRows, selectedRows)
      this.addSelectRowKeys(selectedRows, keys)
      this.rowSelectionChange(keys, selectedRows)
    }
    this.rowSelectionChange(keys, lastCheck)
  }
  handleExport = (event)=>{
    const {key} = event;
    if (key === 'selected') {
      const exportData = this.state.selectedRowItems;
      if (exportData.length === 0) {
        message.warning('请选择想要导出的数据');
        return
      }
      this.exportTableDataToCSV(exportData);
    } else if (key === 'all') {
      // 导出全部的情况 需要看是否是前端分页还是后台分页
      const {list, pagination} = this.props.grid;
      if (pagination === undefined && list.length) {
        // 前端分页 静态数据导出
        this.exportTableDataToCSV(list);
      }
      if (pagination) {
        console.log('调用后台导出接口');
      }
    }
  }
  exportTableDataToCSV = (data)=> {
    const {columns} = this.props;
    const titles = columns.map(it=>it.title);
    const titleForKey = columns.map(it=>it.dataIndex);
    const str = [titles.join(',').concat('\n')];
    for (let i = 0; i < data.length; i++) {
      const temp = [];
      for (let j = 0; j < titleForKey.length; j++) {
        let value = data[i][titleForKey[j]];
        if (value) {
          // console.log(value)
          value = value.toString();
          if (value.includes(',')) {
            // 把英文的,转换成中文的，
            value = value.replace(new RegExp(',', 'gm'), '，');
          }
        }
        temp.push(value);
      }
      str.push(temp.join(',').concat('\n'));
    }
    console.log(str);
    downloadContext(str);
  }
  componentWillReceiveProps(props) {
    if (props.dataDefaultSelectedRowKeys) {
      this.setState({
        selectedRowKeys: props.dataDefaultSelectedRowKeys,
      })
    }
  }
  getTableClassName = ()=>{
    const {onRowSelect, scroll} = this.props;
    const className = [];
    if (onRowSelect) {
      className.push(styles.rowHover);
    }
    if (scroll) {
      className.push(styles.oopFixedTable);
    }
    return className.length ? className.join(' ') : '';
  }
  getTableRowKey = (record)=>{
    const {rowKey} = this.props;
    if (!rowKey) {
      return record.id || record.key
    }
    if (typeof rowKey === 'string') {
      return record[rowKey];
    }
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
  }
  render() {
    const { grid: {list = [], pagination },
      actionColumn, columns, loading, topButtons = [], rowButtons = [], extra, checkable = true, size,
      onRowSelect, selectTriggerOnRowClick = false, onSelectAll, rowKey,
      _onSelect, _onSelectAll, multiple = true, selectedDisabled = [], ...otherProps } = this.props
    const { selectedRowKeys } = this.state
    const cols = this.createRowButtons(actionColumn, columns, rowButtons);
    const tableData = [...list]
    if (multiple !== false) {
      if (tableData.length && selectedDisabled.length) {
        tableData.forEach((item, i) => {
          selectedDisabled.forEach((key) => {
            if (item.id === key.id && ('disabled' in key)) {
              tableData[i].disabled = key.disabled
            }
          })
        })
      }
    }
    let rowSelectionCfg
    if (checkable) {
      rowSelectionCfg = multiple ? {
        onChange: this.rowSelectionChange,
        selectedRowKeys,
        getCheckboxProps: record => ({
          disabled: record.disabled,
        }),
        onSelect: (record, selected, selectedRows, nativeEvent) => {
          if (selectTriggerOnRowClick) {
            this.selectRow(record);
          }
          if (_onSelect) {
            _onSelect(record, selected, selectedRows, nativeEvent);
          }
        },
        onSelectAll: (selected, selectedRows, changeRows) => {
          // TODO
          this.setState({
            changeRows,
            selectedRows
          })
          if (onSelectAll) {
            onSelectAll(changeRows)
          }
          if (_onSelectAll) {
            _onSelectAll(selected, selectedRows, changeRows);
          }
        },
      } : {
        type: 'radio',
        onChange: this.rowSelectionChange,
        selectedRowKeys,
        getCheckboxProps: record => ({
          disabled: record.disabled,
        }),
        onSelect: (record, selected, selectedRows, nativeEvent) => {
          if (selectTriggerOnRowClick) {
            this.selectRow(record);
          }
          if (_onSelect) {
            _onSelect(record, selected, selectedRows, nativeEvent, multiple);
          }
        }
      }
    }
    return (
      <div className={styles.oopTableWrapper}>
        <div className={styles.toolbar}>
          {
            this.createTopButtons(topButtons)
          }
        </div>
        {
          extra && (
            <div className={styles.extra}>
              {
                extra
              }
            </div>
          )
        }
        <Table
          className={this.getTableClassName()}
          dataSource={tableData}
          rowKey={record => this.getTableRowKey(record)}
          rowSelection={rowSelectionCfg}
          columns={cols}
          loading={loading}
          pagination={
            pagination ? {...pagination,
              current: pagination.pageNo, pageSize: pagination.pageSize, total: pagination.count
            } : (pagination !== false ? {
                showSizeChanger: true,
                showQuickJumper: true,
              } : false)
          }
          onChange={this.onChange}
          size={size}
          onRow={onRowSelect ? this.rowClick : undefined}
          {...otherProps}
        />
      </div>
    )
  }
}
