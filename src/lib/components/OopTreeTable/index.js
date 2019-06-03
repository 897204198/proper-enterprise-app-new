import React, { PureComponent } from 'react';
import { Row, Col, Card, Spin } from 'antd';
import OopTable from '../OopTable';
import OopTree from '../OopTree';
import OopSearch from '../OopSearch';
import styles from './index.less';

export default class OopTreeTable extends PureComponent {
  state = {
  }
  handleOnSelect = (treeNode, dataRef)=>{
    const {onTreeNodeSelect} = this.props;
    if (onTreeNodeSelect) {
      const returnValue = onTreeNodeSelect(treeNode, dataRef);
      // 传递了树节点点击的函数 并且 执行结果为 false 那么不继续执行
      if (returnValue === false) {
        return
      }
    }
    this.oopTable.clearSelection();
    this.oopTable.resetPagination(()=>{
      this.oopSearch.clearSearchCondition(()=>{
        this.onLoad({
          pagination: {
            pageNo: 1,
            pageSize: 10
          }
        });
      });
    });
  }
  componentDidMount() {
  }
  onLoad = (param)=>{
    this.props.table.onLoad(param)
  }
  getCurrentSelectTreeNode = ()=>{
    return this.oopTree.getCurrentSelectTreeNode();
  }
  render() {
    // const {test} = this.state;
    const treeConfig = this.props.tree;
    const tableConfig = this.props.table;
    const { treeLoading } = treeConfig;
    const { title, gridLoading, grid, columns, selectedDisabled, topButtons = [], rowButtons = [], oopSearch, onRightClickConfig, multiple = true, ...otherTableProps } = tableConfig;
    const {size} = this.props;
    return (
      <Row gutter={16} className={styles.OopTreeTable}>
        <Col span={18} push={6}>
          <Card bordered={false} title={title}>
            {oopSearch ? (
              <OopSearch
                {...oopSearch}
                style={{
                  marginBottom: 16
                }}
                ref={(el)=>{ el && (this.oopSearch = el && el.getWrappedInstance()) }}
              />) : null}
            <OopTable
              grid={grid}
              columns={columns}
              loading={gridLoading}
              onLoad={this.onLoad}
              size={size}
              topButtons={topButtons}
              rowButtons={rowButtons}
              multiple={multiple}
              selectedDisabled={selectedDisabled}
              {...otherTableProps}
              ref={(el)=>{ el && (this.oopTable = el) }}
            />
          </Card>
        </Col>
        <Col span={6} pull={18} >
          <Card bordered={false} title={treeConfig.title}>
            <Spin spinning={treeLoading}>
              <OopTree
                onTreeNodeSelect={this.handleOnSelect}
                onRightClickConfig={onRightClickConfig}
                {...treeConfig}
                ref={(el)=>{ el && (this.oopTree = el) }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    )
  }
}
