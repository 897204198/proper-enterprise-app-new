import React, { PureComponent, Fragment } from 'react';
import {Table, Button, Divider, Popconfirm, Tooltip, Icon, Dropdown, Menu, message, Alert} from 'antd';
import styles from './index.less';

const isReactObject = (component)=>{
  return component && component.$$typeof && component.$$typeof.toString() === 'Symbol(react.element)'
}
const getStringFromReactObj = (reactNode)=>{
  let r = reactNode;
  while (isReactObject(r.props.children)) {
    r = r.props.children
  }
  if (typeof r.props.children === 'string') {
    return r.props.children
  }
  return reactNode.toString();
}

// 计算rowButtons的长度 18:图标的宽度 17:中间竖线的长度+margin 32:td的内边距 5:再加5px的余量 怕有人对icon自定义大小影响长度导致换行
const caculateRowButtonWidth = (n)=>{
  if (n <= 0) {
    return 0;
  }
  return n === 1 ? 60 : (n * 18) + ((n - 1) * 17) + 32 + 5
}

const getFilterParams = (filters)=>{
  if (filters) {
    const filtersParam = {}
    if (Object.keys(filters).length) {
      for (const k in filters) {
        if (filters[k].value) {
          filtersParam[k] = filters[k].value.toString()
        }
      }
    }
    return filtersParam
  } else {
    return {}
  }
}
const orderCol = {
  title: '序号',
  width: 60,
  render: (text, record, index)=>`${index + 1}`
}
export default class OopTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRowItems: [],
      changeRows: [],
      filters: null,
      sorter: null,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
        showSizeChanger: true,
      },
      exporting: false
    };
  }
  componentWillReceiveProps(props) {
    const state = {};
    if (props.dataDefaultSelectedRowKeys) {
      state.selectedRowKeys = props.dataDefaultSelectedRowKeys
    }
    if (props.grid.pagination) {
      state.pagination = props.grid.pagination === false ? false : {
        ...props.grid.pagination,
      }
    }
    if (Object.keys(state).length > 0) {
      this.setState({
        // ...this.state,
        ...state
      })
    }
  }
  onLoad = (param = {}) =>{
    const {onLoad} = this.props;
    const {pagination, filters, sorter} = this.state;
    const filtersParam = getFilterParams(filters)
    if (onLoad) {
      onLoad({
        ...param,
        pagination: {
          pageNo: pagination.current || pagination.pageNo,
          pageSize: pagination.pageSize,
        },
        ...filtersParam,
        ...sorter,
      });
    }
  }
  rowSelectionChange = (selectedRowKeys, selectedRowItems)=>{
    this.setState({
      selectedRowKeys,
      selectedRowItems
    })
  }
  onChange = (pagination, filters, sorter)=>{
    const { columns } = this.props
    const filterObj = {}
    if (filters) {
      for (const key in filters) {
        if (filters[key]) {
          const obj = {
            title: [],
            value: []
          }
          filters[key].forEach((fliter) => {
            for (let i = 0; i < columns.length; i++) {
              if (columns[i].dataIndex === key) {
                obj.title.push(columns[i].filters.find(it => it.value === fliter).text)
              }
            }
          })
          obj.value = filters[key]
          filterObj[key] = obj
        }
      }
    }
    if (!pagination.current) {
      pagination.current = pagination.pageNo
    }
    this.setState({
      filters: filterObj,
      pagination,
      sorter
    }, ()=>{
      this.onLoad();
    });
  }
  clearSelection = ()=>{
    this.setState({
      selectedRowKeys: [],
      selectedRowItems: []
    })
  }
  createTopButtons = (topButtons)=>{
    const btns = topButtons.map((btn)=> {
      if (btn.render) {
        return btn.render()
      } else {
        // 1.btn属性配置了display为true或者display为函数 执行返回结果为true 或者 2.没有配置display 渲染按钮
        return (btn.display === true || btn.display === undefined || (typeof btn.display === 'function' && btn.display(this.state.selectedRowKeys))) ? (
          <Button
            key={btn.name}
            icon={btn.icon}
            type={btn.type}
            loading={btn.loading}
            disabled={btn.disabled}
            style={(typeof btn.style === 'function') ? btn.style() : btn.style}
            onClick={()=>{
              btn.onClick && btn.onClick(this.state.selectedRowKeys, this.state.selectedRowItems)
            }}>
            {btn.text}
          </Button>
        ) : false;
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
          <Button style={{ paddingLeft: 8, paddingRight: 8, float: 'right'}} icon="export" loading={this.state.exporting}>
            导出 <Icon type="down" />
          </Button>
        </Dropdown>
      );
      btns.push(exportButton)
    }
    return btns
  }
  createRowButtons = (actionColumn, columns, rowButtons)=>{
    const cols = [...columns]
    cols.forEach((col)=>{
      const defaultRender = text => text
      const oldRender = col.render || defaultRender;
      col.render = (text, record)=>{
        // if (text) {
        if (isReactObject(text)) {
          return text
        } else {
          try {
            const result = oldRender(text, record);
            return result;
          } catch (e) {
            return <Tooltip placement="bottom" title={e.message}><span style={{color: 'red'}}>渲染异常</span></Tooltip>
          }
        }
        // }
      }
    })
    const getBtnDisabled = (disabled, record)=>{
      const type = typeof disabled;
      if (type === 'boolean') {
        return type
      } else if (type === 'function') {
        return disabled(record);
      } else if (type === 'undefined') {
        return false;
      } else {
        return undefined;
      }
    }
    if (rowButtons.length) {
      cols.push({
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
                          <a disabled={getBtnDisabled(item.disabled, record)}>
                            <Icon type={item.icon} style={(typeof item.style === 'function') ? item.style(record) : item.style} />
                          </a>
                        </Tooltip>
                      ) : <a disabled={getBtnDisabled(item.disabled, record)}>{item.text}</a>
                    }
                  </Popconfirm>
                ) : (
                  item.icon ? (
                    <Tooltip placement="bottom" title={item.text}>
                      <a disabled={getBtnDisabled(item.disabled, record)} onClick={() => item.onClick(record)}>
                        <Icon type={item.icon} style={(typeof item.style === 'function') ? item.style(record) : item.style} />
                      </a>
                    </Tooltip>
                  ) : <a disabled={getBtnDisabled(item.disabled, record)} onClick={() => item.onClick(record)}>{item.text}</a>
                )
              }
            </Fragment>)
            actions.push(<Divider key={`divider-${item.name}`} type="vertical" />)
          })
          rowButtons.forEach((item)=>{
            if (item.display === true) {
              renderButtons(item)
            } else if (typeof item.display === 'function') {
              item.display(record) && renderButtons(item);
            } else if (item.display === undefined) {
              renderButtons(item)
            }
          });
          actions.pop();
          return actions;
        }
      });
    }
    return cols;
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
      if (pagination === undefined) {
        if (list.length) {
          // 前端分页 静态数据导出
          this.exportTableDataToCSV(list);
        } else {
          message.warning('没有可以导出的数据哦')
        }
      } else {
        console.log('调用后台导出接口');
      }
    }
  }
  exportTableDataToCSV = (data)=> {
    this.setState({
      exporting: true
    }, ()=>{
      const {columns} = this.props;
      const titles = columns.map(it=>it.title);
      // const titleForKey = columns.map(it=>it.dataIndex);
      const str = [titles.join(',').concat('\n')];
      for (let i = 0; i < data.length; i++) {
        const temp = [];
        const record = data[i];
        for (let j = 0; j < columns.length; j++) {
          const column = columns[j];
          let value = record[column.dataIndex];
          if (value) {
            if (column.render) {
              if (typeof value !== 'string') {
                const r = column.render(value, record);
                if (typeof r === 'string') {
                  value = r;
                } else if (isReactObject(r)) {
                  value = getStringFromReactObj(r);
                }
              }
            }
            // value = value.toString();
            if (value.includes(',')) {
              // 把英文的,转换成中文的， 因为,与最终的字符格式冲突
              value = value.replace(new RegExp(',', 'gm'), '，');
            }
          }
          temp.push(value);
        }
        str.push(temp.join(',').concat('\n'));
      }
      const context = str.join(' ');
      this.downloadContext(context);
    });
  }
  downloadContext = (context)=>{
    const url = 'data:text/csv;charset=UTF-8,\uFEFF'.concat(context);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'table.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{
      a.remove();
      a = null;
      message.success('数据导出成功！');
      this.setState({
        exporting: false
      })
    })
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
  // 重置分页信息
  resetPagination = (callback)=>{
    this.setState({
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        pageSizeOptions: ['10', '20', '50', '100'],
        showQuickJumper: true,
        showSizeChanger: true,
      }
    }, ()=> {
      callback && callback();
    });
  }
  clearFilters = () => {
    this.setState({
      filters: null
    }, () => {
      this.onLoad()
    })
  }
  clearSorter = () => {
    this.setState({
      sorter: null
    }, () => {
      this.onLoad()
    })
  }
  render() {
    const { grid: {list = [] },
      actionColumn, columns, loading, topButtons = [], rowButtons = [], extra, checkable = true, size,
      onRowSelect, selectTriggerOnRowClick = false, onSelectAll, rowKey,
      _onSelect, _onSelectAll, multiple = true, selectedDisabled = [],
      showTableInfo, tableInfoExtra, order = false, ...otherProps } = this.props;
    const { selectedRowKeys, pagination, filters, sorter } = this.state;
    const hasFilters = filters && Object.keys(filters).length > 0;
    const hasSorter = sorter && Object.keys(sorter).length > 0;
    let filterFields = []
    if (hasFilters) {
      for (const field in filters) {
        if (filters[field].value && filters[field].value.length) {
          filterFields = [...filterFields, ...filters[field].title]
        }
      }
    }
    columns.forEach((col)=>{
      if (hasFilters) {
        for (const key in filters) {
          if (col.dataIndex === key && filters[col.dataIndex].value) {
            col.filteredValue = filters[col.dataIndex].value
          }
        }
      } else if ('filteredValue' in col || col.filters) {
        col.filteredValue = null
      }
      if (hasSorter) {
        if (col.dataIndex === sorter.field) {
          col.sortOrder = sorter.order
        }
      } else if ('sortOrder' in col) {
        col.sortOrder = null
      }
    })
    const cols = this.createRowButtons(actionColumn, columns, rowButtons);
    if (order) {
      cols.unshift(orderCol)
    }
    const tableData = [...list];
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
    let rowSelectionCfg;
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
        {
          showTableInfo ? (
            <div className={styles.tableInfo}>
              <Alert
                message={
                  <Fragment>
                    {
                      selectedRowKeys && selectedRowKeys.length
                      ? <span>已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;<a onClick={this.clearSelection}>清空</a></span>
                        : <span>{`共${pagination.total || tableData.length}条`}&nbsp;&nbsp;</span>
                    }
                    {
                      filterFields.length
                      ? <span>已按 <a>{filterFields.join(',')}</a> 筛选 <a onClick={this.clearFilters}>重置 </a>{(sorter && Object.keys(sorter).length) ? ',' : ''} </span>
                      : null
                    }
                    {
                      sorter && Object.keys(sorter).length
                      ? <span>已按 <a>{sorter.column.title}</a> {`${sorter.order === 'ascend' ? '升序' : '降序'}排序`} <a onClick={this.clearSorter}>重置</a></span>
                      : null
                    }
                    {
                      tableInfoExtra ? <span>&nbsp;&nbsp;{tableInfoExtra}</span> : null
                    }
                  </Fragment>
                }
                type="info"
                showIcon
              />
            </div>
          ) : null
        }
        <Table
          className={this.getTableClassName()}
          dataSource={tableData}
          rowKey={record => this.getTableRowKey(record)}
          rowSelection={rowSelectionCfg}
          columns={cols}
          loading={loading}
          pagination={{
            ...pagination
          }}
          onChange={this.onChange}
          size={size}
          onRow={onRowSelect ? this.rowClick : undefined}
          {...otherProps}
        />
      </div>
    )
  }
}
