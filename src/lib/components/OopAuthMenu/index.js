import React, { PureComponent } from 'react';
import { Tree, Input, Button } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const { TreeNode } = Tree;
const { Search } = Input;

const dataList = [];

const getParentId = (id, tree) => {
  let parentId;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.id === id)) {
        parentId = node.id;
      } else if (getParentId(id, node.children)) {
        parentId = getParentId(id, node.children);
      }
    } else if (node.resources) {
      if (node.resources.some(item => item.id === id)) {
        parentId = node.id;
      } else if (getParentId(id, node.resources)) {
        parentId = getParentId(id, node.resources);
      }
    }
  }
  return parentId;
};

export default class OopAuthMenu extends PureComponent {
  state = {
    expandedKeys: [],
    searchValue: '',
    autoExpandParent: true,
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onCheck = (checkedKeys, e) => {
    const { onCheck } = this.props;
    onCheck(checkedKeys, e);
  }

  onSearch = (value) => {
    const { data } = this.props;
    const expandedKeys = dataList.map((item) => {
      if (item.name.indexOf(value) > -1) {
        return getParentId(item.id, data);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }

  render() {
    const { searchValue, expandedKeys, autoExpandParent } = this.state;
    dataList.splice(0, dataList.length);
    const formatName = (key, name) => {
      if (key) {
        const index = name.indexOf(key);
        const beforeStr = name.substr(0, index);
        const afterStr = name.substr(index + key.length);
        const title = index > -1 ? (
          <span title={name}>
            {beforeStr}
            <span className={classNames(styles.oopAuthMenuMark)}>{key}</span>
            {afterStr}
          </span>
        ) : name;
        return title;
      }
      return name;
    }
    const loop = data => data.map((item) => {
      dataList.push({id: item.id, name: item.name});
      const title = formatName(searchValue, item.name);
      if (item.children || (item.resources && item.resources.length > 0)) {
        return (
          <TreeNode
            className={classNames(styles.oopAuthMenuFieldset,
              (
                item.resources && item.resources.length > 0
              ) && styles.oopAuthMenuResourceWrapper)}
            title={title}
            key={item.id}
            dataRef={item}
            disableCheckbox={!item.enable}>
            {loop(item.children ? item.children : item.resources)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          className={classNames(
            !('parentId' in item) && 'inline-block')}
          title={title}
          key={item.id}
          dataRef={item}
          disableCheckbox={!item.enable} />
      );
    });

    return (
      <div>
        <Search
          placeholder="搜索"
          onSearch={this.onSearch}
          onChange={e => this.onSearch(e.target.value)}
          enterButton={<Button type="primary" icon="search">搜索</Button>}
        />
        <Tree
          className={styles.oopAuthMenu}
          checkable
          checkedKeys={this.props.checkedAllKeys}
          onCheck={this.onCheck}
          onExpand={this.onExpand}
          // defaultExpandedKeys={this.props.checkedAllKeys}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
        >
          {
            loop(this.props.data)
          }
        </Tree>
      </div>
    )
  }
}