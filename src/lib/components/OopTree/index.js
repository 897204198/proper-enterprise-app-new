import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import Throttle from 'lodash-decorators/throttle';
import { Tree, Spin, Input, Icon, Menu, Modal} from 'antd';
import styles from './index.less';

const {confirm} = Modal;
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
const clickEvent = (e)=>{
  let flag = false;
  e.path.forEach((item)=>{
    if (item.className === 'rightClickPopover') {
      flag = true;
    }
  })
  const dom = document.querySelector('.rightClickPopover');
  if (!flag && dom) {
    dom.parentNode.parentNode.removeChild(dom.parentNode);
  }
}
const preventDefaultEvent = (e)=>{
  e.preventDefault();
}
const renderMenu = (divDom, that)=>{
  let menuHTML = null;
  let menuList = null;
  if (that.props.onRightClickConfig) {
    const {menuList: temp} = that.props.onRightClickConfig
    menuList = temp
  }
  menuList !== null && (that.state.popoverConfig.treeMenuState === 'button' ? menuHTML = (
    <Menu style={{width: 120}}>
      {
        menuList.map((item)=>{
          const {name} = item;
          if (!item.confirm) {
            return (
              <Menu.Item
                disabled={item.disabled}
                className={`popoverLine ${item.name}`}
                key={name}
                onClick={(nameParam)=>{ item.onClick ? item.onClick(nameParam) : that.handelPopover(nameParam) }}>
                <div style={{paddingLeft: 0}}>
                  <Icon type={item.icon} style={{fontSize: 16}} />
                      <span >{item.text}</span>
                </div>
              </Menu.Item>
            )
          } else {
            return (
              <Menu.Item disabled={item.disabled} className={item.name} key={name} onClick={()=>{ that.confirm(item) }}>
                <div style={{paddingLeft: 0}}>
                  <Icon type={item.icon} style={{ fontSize: 16}} />
                    <span>{item.text}</span>
                </div>
              </Menu.Item>
            )
          }
        })
      }
    </Menu>) : ''
  )
  ReactDOM.render(
    <div className="rightClickPopover">
      {menuHTML}
    </div>,
    divDom
  );
}
const creatDiv = (renderDom, y, top = 184)=>{
  const divDom = document.createElement('div');
  renderDom.style.position = 'relative';
  divDom.style.position = 'absolute';
  divDom.style.zIndex = 9999;
  divDom.style.top = `${y - top}px`
  divDom.style.left = '120px'
  divDom.style.zIndex = '9999'
  renderDom.appendChild(divDom)
  return divDom
}
export default class OopTree extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultExpandedKeys = [], defaultSelectedKeys = []} = this.props;
    this.state = {
      currentSelectTreeNode: null,
      expandedKeys: [...defaultExpandedKeys],
      autoExpandParent: false,
      searchValue: '',
      selectedKeys: [...defaultSelectedKeys],
      defaultKeys: [...defaultSelectedKeys],
      popoverConfig: {
        treeMenuState: 'button',
        popoverInfo: null,
        popoverRenderDom: {},
      },
    }
  }

  // 缓存树节点的所有数据
  treeNodeDataListCache = []
  handleOnSelect = (treeNode, event)=>{
    if (event.selected) {
      const {dataRef} = event.node.props
      const id = dataRef.id || dataRef.key;
      this.setState({
        selectedKeys: [id],
        defaultKeys: [id],
        currentSelectTreeNode: treeNode.length ? {...event.node.props.dataRef} : null
      }, ()=>{
        const { onTreeNodeSelect } = this.props;
        if (onTreeNodeSelect) {
          onTreeNodeSelect(treeNode, dataRef);
        }
      });
    } else {
      const { inverseSelect = false } = this.props;
      if (inverseSelect) {
        this.setState({
          selectedKeys: [],
          currentSelectTreeNode: null
        }, () => {
          const { onTreeNodeSelect } = this.props;
          const {dataRef} = event.node.props;
          if (onTreeNodeSelect) {
            onTreeNodeSelect(treeNode, dataRef);
          }
        })
      }
    }
  }
  // findParentNode = (dom) =>{
  //   if (dom.parentNode.tagName === 'LI') {
  //     return dom.parentNode
  //   } else {
  //     const parent = dom.parentNode
  //     return this.findParentNode(parent)
  //   }
  // }
  handleOnRightClick = ({event, node}) => {
    // const domLi = this.findParentNode(event.target)
    if (this.props.onRightClickConfig) {
      this.props.onRightClickConfig.rightClick(node.props.dataRef);
      this.handleClosePopover();
      const {top} = this.props.onRightClickConfig;
      const y = document.documentElement.scrollTop + event.clientY;
      const divDom = creatDiv(document.querySelector('.getTreeDom').parentNode, y, top)
      const data = {
        popoverInfo: node,
        treeMenuState: 'button',
        popoverRenderDom: divDom,
      }
      this.setState({
        popoverConfig: data
      }, ()=>{
        renderMenu(divDom, this)
      });
    }
  }
  confirm = (item) => {
    this.handleClosePopover()
    const {props} = this.state.popoverConfig.popoverInfo;
    const {treeTitle} = this.props;
    const { onClick } = item;
    const txt = props.dataRef[treeTitle] || props.dataRef.name;
    confirm({
      title: `'${txt}'-${item.confirm}`,
      onOk() {
        onClick(props);
      },
      onCancel() {
      },
    });
  }
  componentDidMount() {
    this.treeNodeDataListCache = [];
    if (this.props.onRightClickConfig) {
      document.addEventListener('click', clickEvent)
      document.querySelector('.getTreeDom').addEventListener('contextmenu', preventDefaultEvent)
      document.querySelector('.ant-tree.ant-tree-directory').addEventListener('scroll', this.scollEvents)
    }
  }
  @Throttle(300)
  scollEvents() {
    const dom = this.parentNode.querySelector('.rightClickPopover');
    dom && dom.parentNode.remove();
  }
  componentWillUnmount() {
    if (this.props.onRightClickConfig) {
      document.removeEventListener('click', clickEvent);
      document.querySelector('.ant-tree.ant-tree-directory').removeEventListener('scroll', this.scollEvents);
      document.querySelector('.getTreeDom').removeEventListener('contextmenu', preventDefaultEvent);
      this.scollEvents.cancel();
    }
  }
  handleClosePopover = ()=>{
    this.forceUpdate();
    const dom = document.querySelector('.rightClickPopover')
    dom && dom.parentNode.parentNode.removeChild(dom.parentNode);
  }
  handelPopover = (type) =>{
    let menuList = null;
    if ((this.props.onRightClickConfig)) {
      const {menuList: temp} = this.props.onRightClickConfig
      menuList = temp
    }
    menuList.forEach((item)=>{
      if (item.name === type.key) {
        ReactDOM.render(
          <div className="rightClickPopover">
            {item.render}
          </div>,
          this.state.popoverConfig.popoverRenderDom
        )
      }
    })
  }
  renderTreeNodes = (data = [], treeTitle, treeKey, treeRoot, searchValue, selectedKeys = [])=> {
    const { currentSelectTreeNode } = this.state
    const treeNodes = data.map((node) => {
      const item = {
        ...node,
      }
      item.title = item.title || node[treeTitle]
      item.key = item.key || node[treeKey]
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const selectedStyle = currentSelectTreeNode && currentSelectTreeNode.id === item.id ? {color: '#fff'} : {}
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span className={selectedKeys[0] === item.id ? '' : styles.primaryColor} style={selectedStyle}>{searchValue}</span>
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
      if (index > -1) {
        return (
          <TreeNode
            isLeaf={true}
            title={item.title}
            key={item.key}
            dataRef={item}
            icon={ item.icon ? <Icon type={item.icon} /> : null } />);
      } else {
        return false
      }
    }).filter(it=>it !== false);
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
    if (value === '') {
      this.setState({
        selectedKeys: this.state.defaultKeys
      })
    } else {
      this.setState({
        selectedKeys: ['']
      })
    }
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
  generateList = (data = [], props) => {
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
  setTitle = ()=>{
    document.querySelectorAll('.ant-tree-title').forEach((item)=>{
      if (item.offsetWidth > 180) {
        item.classList.add('setTitle')
      }
      let txt = null;
      if (item.children && item.children[0] && item.children[0].childNodes) {
        if (item.children[0]) {
          if (item.children[0].childNodes) {
            txt = item.children[0].childNodes[2].nodeValue;
            item.setAttribute('title', txt)
          }
        }
      }
    })
  }
  render() {
    const { searchValue, expandedKeys, autoExpandParent, selectedKeys } = this.state;
    const { treeData, treeTitle, treeKey, treeRoot, treeLoading, ...treeConfig} = this.props;
    this.setTitle();
    return (
      <Spin spinning={treeLoading}>
        <div className={styles.OopTree}>
          <Search style={{ marginBottom: 8}} placeholder="搜索" onChange={this.handleOnChange} allowClear={true} />
          <DirectoryTree
            expandAction="doubleClick"
            className="getTreeDom"
            onExpand={this.onExpand}
            expandedKeys={[...expandedKeys]}
            autoExpandParent={autoExpandParent}
            onSelect={this.handleOnSelect}
            selectedKeys={[...selectedKeys]}
            onRightClick={this.handleOnRightClick}
            ref={(el)=>{ this.tree = el }}
            {...treeConfig}
          >
            {this.renderTreeNodes(treeData, treeTitle, treeKey, treeRoot, searchValue, selectedKeys)}
          </DirectoryTree>
        </div>
      </Spin>
    )
  }
}
