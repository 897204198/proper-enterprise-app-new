import React from 'react';
import { Modal, Card, Button, Tag, Row, Col, Tree, Switch, Tooltip, Input, Popover } from 'antd';
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import styles from './index.less';
import OopTable from '../OopTable';

const { TreeNode } = Tree;
const { Search } = Input;
const splitMenu = (arr) => {
  let newArr = []
  for (let i = 0; i < arr.length; i++) {
    newArr.push(arr[i])
    if (arr[i].children) {
      newArr = [...newArr, ...splitMenu(arr[i].children)]
    }
  }
  return newArr
}
const findOrg = (orgArr, id) => {
  let orgs = []
  for (let i = 0; i < orgArr.length; i++) {
    if (orgArr[i].id === id) {
      orgs.push(orgArr[i])
      return orgs
    }
    if (orgArr[i].id !== id && orgArr[i].children) {
      const org = findOrg(orgArr[i].children, id)
      if (org.length) {
        orgs = [...orgs, ...org]
        return orgs
      }
    }
  }
  return orgs
}
const filterSearchStr = (arr, str) => {
  let orgs = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].name.includes(str)) {
      orgs.push(arr[i])
    }
    if (!arr[i].name.includes(str) && arr[i].children) {
      const org = filterSearchStr(arr[i].children, str)
      if (org.length) {
        orgs = [...orgs, ...org]
      }
    }
  }
  return orgs
}
@inject(['OopOrgPicker$model', 'global'])
@connect(({ OopOrgPicker$model, global, loading }) => ({
  OopOrgPicker$model,
  listLoading: loading.effects['OopOrgPicker$model/fetchOrgTree'],
  global,
}))
export default class OopOrgPicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      orgList: [],
      selected: [],
      expand: [],
      checkedKeys: [],
      selectedKeys: [],
      checkedOrgs: [],
      visible: false,
      strictly: true
    };
  }
  handleButtonClick = () => {
    this.setState({visible: true})
    this.props.dispatch({
      type: 'OopOrgPicker$model/fetchOrgTree',
      callback: () => {
        const {OopOrgPicker$model: {orgTreeData = []}, value = []} = this.props;
        const keys = value.length && value.map(val => val.id)
        this.setState({
          orgList: orgTreeData,
          expand: [orgTreeData[0].id],
          checkedKeys: {checked: keys, halfChecked: []},
          checkedOrgs: value
        })
      }
    });
  }
  handleExpand = (key) => {
    this.setState({
      expand: key
    })
  }
  // handleChange = (data) => {
  //   this.setState({
  //     selected: data
  //   })
  //   const {onChange} = this.props;
  //   if (onChange) {
  //     onChange(data);
  //   }
  // }
  handleSelect = (value, event) => {
    const { dataRef } = event.node.props
    this.setState({
      selected: [dataRef],
      selectedKeys: value
    })
  }
  handleCheck = (value) => {
    const { strictly } = this.state
    const keys = value.checked || value
    const { OopOrgPicker$model: {orgTreeData = []}} = this.props
    let orgs = keys.length ? keys.map(val => [...findOrg(orgTreeData, val)]).reduce((arr1, arr2) => arr1.concat(arr2)) : []
    let keysArr = []
    let arr = []
    // 级联时，自动关联下级
    if (!strictly) {
      for (let i = 0; i < orgs.length; i++) {
        if (orgs[i].children) {
          arr = [...arr, ...orgs[i].children]
        }
      }
      keysArr = [...new Set(arr.map(item => item.id).concat(keys))]
      if (keysArr.length) {
        orgs = keysArr.map(val => [...findOrg(orgTreeData, val)]).reduce((arr1, arr2) => arr1.concat(arr2))
      }
    }
    this.setState({
      checkedKeys: strictly ? {checked: keys, halfChecked: []} : keysArr,
      checkedOrgs: orgs,
    })
  }
  handleTagClose = (item) => {
    const { checkedKeys, strictly } = this.state
    const keys = checkedKeys.checked || checkedKeys
    const newKeys = keys.filter(key => key !== item.id)
    const checked = strictly ? {checked: newKeys, halfChecked: []} : newKeys
    this.handleCheck(checked)
  }
  clearAll = () => {
    this.setState({
      checkedKeys: [],
      checkedOrgs: []
    })
  }
  changeStrictly = (value) => {
    this.setState({
      strictly: !value
    }, () => {
      const { checkedKeys } = this.tree.props
      this.handleCheck(checkedKeys)
    })
  }
  handleModalOk = () => {
    const {onChange, onOk} = this.props;
    const {checkedOrgs} = this.state;
    this.setState({
      visible: false,
    });
    if (onChange) {
      onChange(checkedOrgs);
    }
    if (onOk) {
      onOk(checkedOrgs);
    }
  }
  handleSearch = (e) => {
    const {OopOrgPicker$model: {orgTreeData = []}} = this.props;
    const val = e.target.value
    const result = [...filterSearchStr(orgTreeData, val)]
    this.setState({
      orgList: val ? result : orgTreeData
    })
  }
  renderTreeNodes = data =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.title} key={item.key} dataRef={item} />;
    });
  render() {
    const { value = [], btnCfg = {} } = this.props
    const btnText = value.length ? value.map(item => item.name).join(',') : '请选择'
    const columns = [
      {title: '名称', dataIndex: 'name'},
      {
        title: '人员',
        dataIndex: 'employees',
        render: (text) => {
          const name = text ? text.map(item => item.id).join(',') : ''
          return <Popover content={name}>
                    <div className={styles.ellipsis}>{name}</div>
                  </Popover>
        }
      },
    ]
    const footer = (
      <div>
        <Button onClick={() => this.setState({visible: false})}>取消</Button>
        <Button type="primary" onClick={this.handleModalOk}>保存</Button>
        <span style={{float: 'left'}}>级联：<Switch checkedChildren="是" unCheckedChildren="否" checked={!this.state.strictly} onChange={this.changeStrictly} /></span>
      </div>
    )
    return (
      <div>
        <Tooltip title={btnText}>
          <Button onClick={this.handleButtonClick} style={{maxWidth: 300, ...btnCfg}}>{btnText}</Button>
        </Tooltip>
        <Modal
          style={{top: 20}}
          width={1200}
          maskClosable={false}
          wrapClassName={styles.assignModal}
          visible={this.state.visible}
          onCancel={() => this.setState({visible: false})}
          destroyOnClose={true}
          footer={footer}
        >
          <div className={styles.oopTabContainer}>
            <div className={styles.tableInfo}>
              <div style={{minWidth: 80}}>已选择(<span className={styles.primaryColor}>{this.state.checkedOrgs.length}</span>):</div>
              <div style={{lineHeight: 2, minHeight: 28}}>
                {this.state.checkedOrgs.map((item) => {
                  return this.state.strictly ? (
                    <Tag
                      key={item.id}
                      closable
                      onClose={(e) => {
                        this.handleTagClose(item, e);
                    }}>{item.name}</Tag>
                  ) : (
                    <Tag
                      key={item.id}
                      closable={false}
                      >{item.name}</Tag>
                  )
                })}
                {this.state.checkedOrgs.length ? (<Tag color="red" onClick={this.clearAll}>清空选择</Tag>) : null}
              </div>
            </div>
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Search
                    placeholder="查找部门"
                    onChange={this.handleSearch}
                    // style={{ width: 200 }}
                  />
                  <Tree
                    checkable
                    onExpand={this.handleExpand}
                    expandedKeys={this.state.expand}
                    onCheck={this.handleCheck}
                    checkedKeys={this.state.checkedKeys}
                    selectedKeys={this.state.selectedKeys}
                    onSelect={this.handleSelect}
                    checkStrictly={this.state.strictly}
                    ref={(el) => { this.tree = el }}
                  >
                    {
                      this.state.orgList.length ? this.renderTreeNodes(this.state.orgList) : null
                    }
                  </Tree>
                </Card>
              </Col>
              <Col span={16}>
                <Card>
                  <OopTable
                    grid={{list: this.state.selected}}
                    columns={columns}
                    checkable={false}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        </Modal>
      </div>
    );
  }
}

