import React, { PureComponent, Fragment } from 'react';
import {Table, Button, Divider, Popconfirm, Tooltip, Icon} from 'antd';
import styles from './CacheTable.less';

export default class CacheTable extends PureComponent {
  state = {
    selectedRowKeys: [],
    selectedRowItems: []
  }
  rowSelectionChange = (selectedRowKeys, selectedRowItems)=>{
    this.setState({
      selectedRowKeys,
      selectedRowItems
    })
  }
  clearSelection = ()=>{
    this.setState({
      selectedRowKeys: [],
      selectedRowItems: []
    })
  }
  createTopButtons = (topButtons)=>{
    return topButtons.map(btn =>(
      // 1.btn属性配置了displayReg并且displayReg执行返回结果为true 或者 2.没有配置displayReg 渲染按钮
      ((btn.display && btn.display(this.state.selectedRowKeys)) || !btn.display) &&
      (
        <Button
          key={btn.name}
          icon={btn.icon}
          type={btn.type}
          size={btn.size}
          onClick={()=>{
            btn.onClick && btn.onClick(this.state.selectedRowKeys, this.state.selectedRowItems)
          }}>
          {btn.text}
        </Button>
      )
    ))
  }
  createRowButtons = (columns, rowButtons)=>{
    const cols = [...columns]
    rowButtons.length && cols.push({
      title: '操作',
      width: rowButtons.length * 50,
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
                          <Icon type={item.icon} style={item.style} />
                        </a>
                      </Tooltip>) : <a>{item.text}</a>
                  }
                </Popconfirm>
              ) : (
                item.icon ? (
                  <Tooltip placement="bottom" title={item.text}>
                    <a onClick={() => item.onClick(record)}>
                      <Icon type={item.icon} style={item.style} />
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

  render() {
    const { grid,
      columns, loading, topButtons = [], rowButtons = [], checkable = true, size } = this.props
    const cols = this.createRowButtons(columns, rowButtons)
    const rowSelectionCfg = checkable ? {
      onChange: this.rowSelectionChange,
      selectedRowKeys: this.state.selectedRowKeys,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      })
    } : undefined

    return (
      <div className={styles.oopTableWrapper}>
        <div className={styles.toolbar}>
          {
            this.createTopButtons(topButtons)
          }
        </div>
        <Table
          dataSource={grid}
          rowKey={record => record.id}
          rowSelection={rowSelectionCfg}
          columns={cols}
          loading={loading}
          size={size}
        />
      </div>
    )
  }
}
