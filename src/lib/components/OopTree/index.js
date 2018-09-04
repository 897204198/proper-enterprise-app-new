import React, { PureComponent } from 'react';
import { Tree, Spin, Input, Icon} from 'antd';
import styles from './index.less';

const { TreeNode, DirectoryTree } = Tree
const { Search } = Input
const getParentKey = (key, tree, props) => {
  let parentKey;
  const id = props.treeKey || 'key'
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item[id] === key)) {
        parentKey = node[id];
      } else if (getParentKey(key, node.children, props)) {
        parentKey = getParentKey(key, node.children, props);
      }
    }
  }
  return parentKey;
};
export default class OopTree extends PureComponent {
  constructor(props) {
    super(props);
    const {defaultSelectedKeys = [], defaultExpandedKeys = []} = this.props;
    this.state = {
      currentSelectTreeNode: null,
      expandedKeys: [...defaultExpandedKeys],
      searchValue: '',
      autoExpandParent: true,
      selectedKeys: [...defaultSelectedKeys],
    }
  }
  // 缓存树节点的所有数据
  treeNodeDataListCache = []
  handleOnSelect = (treeNode, event)=>{
    if (event.selected) {
      const {dataRef} = event.node.props
      const id = dataRef.id || dataRef.key;
      this.setState({
        selectedKeys: [id]
      });
      const currentSelectTreeNode = treeNode.length ? {...event.node.props.dataRef} : null;
      this.setState({
        currentSelectTreeNode
      }, ()=>{
        const { onTreeNodeSelect } = this.props;
        if (onTreeNodeSelect) {
          onTreeNodeSelect(treeNode, dataRef);
        }
      });
    }
  }
  componentDidMount() {
    this.treeNodeDataListCache = [];
  }
  renderTreeNodes = (data = [], treeTitle, treeKey, treeRoot, searchValue)=> {
    const treeNodes = data.map((node) => {
      const item = {
        ...node,
      }
      item.title = item.title || node[treeTitle]
      item.key = item.key || node[treeKey]
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span className={styles.primaryColor}>{searchValue}</span>
          {afterStr}
        </span>
      ) : item.title;
      item.title = title;
      if (item.children) {
        return (
          <TreeNode
            title={item.title}
            key={item.key}
            icon={ item.icon ? <Icon type={item.icon} /> : null }
            dataRef={item}
          >
            {this.renderTreeNodes(item.children, treeTitle, treeKey, null, searchValue)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          isLeaf={true}
          title={item.title}
          key={item.key}
          dataRef={item}
          icon={ item.icon ? <Icon type={item.icon} /> : null } />);
    })
    return treeRoot ?
      (
        <TreeNode
          title={treeRoot.title}
          key={treeRoot.key}
          icon={ treeRoot.icon ? <Icon type={treeRoot.icon} /> : null }
          dataRef={{...treeRoot}}>
          {treeNodes}
        </TreeNode>)
      : treeNodes
  }
  handleOnChange = (e)=>{
    const { value } = e.target;
    const { props } = this;
    const { treeData } = props;
    if (this.treeNodeDataListCache.length === 0) {
      this.generateList(treeData, props);
    }
    const expandedKeys = this.treeNodeDataListCache.map((item) => {
      if (item.parentId === null || item.parentId === undefined) {
        return item.key
      }
      if (item.title.indexOf(value) > -1) {
        return getParentKey(item.key, treeData, props);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      autoExpandParent: true,
      searchValue: value
    });
  }
  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }
  getCurrentSelectTreeNode = ()=>{
    return {...this.state.currentSelectTreeNode}
  }
  generateList = (data, props) => {
    const key = props.treeKey || 'key';
    const title = props.treeTitle || 'title';
    const parentId = props.treeParentKey || 'parentId';
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      this.treeNodeDataListCache.push({ key: node[key], title: node[title], parentId: node[parentId]});
      if (node.children) {
        this.generateList(node.children, props);
      }
    }
  };
  render() {
    const { searchValue, expandedKeys, autoExpandParent, selectedKeys } = this.state;
    const { treeData, treeTitle, treeKey, treeRoot, treeLoading, defaultSelectedKeys, defaultExpandedKeys, ...treeConfig} = this.props;
    return (
      <Spin spinning={treeLoading}>
        <div className={styles.OopTree}>
          <Search style={{ marginBottom: 8}} placeholder="搜索" onChange={this.handleOnChange} />
          <DirectoryTree
            expandAction="doubleClick"
            defaultExpandAll={true}
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onSelect={this.handleOnSelect}
            selectedKeys={selectedKeys}
            {...treeConfig}
          >
            {this.renderTreeNodes(treeData, treeTitle, treeKey, treeRoot, searchValue)}
          </DirectoryTree>
        </div>
      </Spin>
    )
  }
}
