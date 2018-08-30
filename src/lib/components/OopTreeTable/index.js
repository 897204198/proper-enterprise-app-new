import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col, Card, Tree, Spin, Input, Icon, Menu, Modal } from 'antd';
import OopTable from '../OopTable';
import OopSearch from '../OopSearch';
import styles from './index.less';

const {confirm} = Modal;
const { TreeNode } = Tree
const { Search } = Input
const dataList = []
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
const generateList = (data, props) => {
  const key = props.treeKey || 'key';
  const title = props.treeTitle || 'title';
  const parentId = props.treeParentKey || 'parentId';
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    dataList.push({ key: node[key], title: node[title], parentId: node[parentId]});
    if (node.children) {
      generateList(node.children, props);
    }
  }
};
export default class OopTreeTable extends PureComponent {
  constructor(props) {
    super(props);
    const {tree: {_defaultSelectedKeys = []}} = props
    this.state = {
      currentSelectTreeNode: null,
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      selectedKeys: [..._defaultSelectedKeys],
      popoverConfig: {
        treeMenuState: 'button',
        popoverInfo: null,
        popoverRenderDom: {},
      },
    }
  }
  handleOnSelect = (treeNode, event)=>{
    if (event.selected) {
      const id = event.node.props.dataRef.id || event.node.props.dataRef.key;
      this.setState({
        selectedKeys: [id]
      });
      const currentSelectTreeNode = treeNode.length ? {...event.node.props.dataRef} : null;
      this.setState({
        currentSelectTreeNode
      }, ()=>{
        const { onTableTreeNodeSelect } = this.props;
        if (onTableTreeNodeSelect) {
          // 传递了树节点点击的函数 并且 执行结果为 false 那么不继续执行
          if (onTableTreeNodeSelect(treeNode, event) === false) {
            return
          }
        }
        this.onLoad({
          pagination: {
            pageNo: 1,
            pageSize: 10
          }
        });
        this.table.clearSelection()
      });
    }
  }
  handleOnRightClick = ({event, node}) => {
    if (!(this.props.tree.onRightClickConfig) || event.target.className !== '') {
      return
    }
    this.props.tree.onRightClickConfig.rightClick(node.props.dataRef)
    let renderDom = null
    if (event.target.children.length !== 0) {
      [renderDom] = event.target.children;
      while (renderDom.hasChildNodes()) {
        renderDom.removeChild(renderDom.firstChild);
      }
    } else {
      renderDom = event.target;
      const renderDomTxt = renderDom.firstChild;
      while (renderDom.hasChildNodes()) {
        renderDom.removeChild(renderDom.firstChild);
      }
      renderDom.appendChild(renderDomTxt)
    }
    this.handleClosePopover();
    const divDom = document.createElement('div');
    renderDom.style.position = 'relative';
    divDom.style.position = 'absolute';
    divDom.style.top = `${22}px`
    divDom.style.left = '40px'
    divDom.style.zIndex = '9999'
    renderDom.appendChild(divDom)
    const data = {
      popoverInfo: node,
      treeMenuState: 'button',
      popoverRenderDom: divDom,
    }
    this.setState({
      popoverConfig: data,
    }, ()=>{
      let menuHTML = null;
      let menuList = null;
      if ((this.props.tree.onRightClickConfig)) {
        const {menuList: temp} = this.props.tree.onRightClickConfig
        menuList = temp
      }
      menuList !== null && (this.state.popoverConfig.treeMenuState === 'button' ? menuHTML = (
        <Menu style={{width: 120}}>
          {
            menuList.map((item)=>{
              const {name} = item;
              if (!item.confirm) {
                return (
                  <Menu.Item disabled={item.disabled} className={`popoverLine ${item.name}`} key={name} onClick={(nameParam)=>{ this.handelPopover(nameParam) }}>
                  <div style={{paddingLeft: 0}}>
                    <Icon type={item.icon} style={{fontSize: 16}} />
                        <span >{item.text}</span>
                        </div>
                  </Menu.Item>
                )
              } else {
                return (
                  <Menu.Item disabled={item.disabled} className={item.name} key={name} onClick={()=>{ this.confirm(item) }}>
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
      )
    });
  }
  confirm = (item) => {
    this.handleClosePopover()
    const {props} = this.state.popoverConfig.popoverInfo;
    const { onClick } = item;
    confirm({
      title: item.confirm,
      onOk() {
        onClick(props)
      },
      onCancel() {
      },
    });
  }
  componentDidMount() {
    if (this.props.tree.onRightClickConfig) {
      document.querySelectorAll('.ant-card-body')[1].classList.add('popoverParent')
      document.addEventListener('click', (e)=>{
        let flag = false;
        console.log(e.path)
        e.path.forEach((item)=>{
          if (item.className === 'rightClickPopover') {
            flag = true;
          }
        })
        const dom = document.querySelector('.rightClickPopover');
        if (!flag && dom) {
          dom.parentNode.removeChild(dom);
        }
      })
    }
  }
  handleClosePopover = ()=>{
    this.forceUpdate();
    const dom = document.querySelector('.rightClickPopover')
    dom && dom.parentNode.removeChild(dom);
  }
  handelPopover = (type) =>{
    let menuList = null;
    if ((this.props.tree.onRightClickConfig)) {
      const {menuList: temp} = this.props.tree.onRightClickConfig
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
    setTimeout(()=>{
      this.forceUpdate();
    }, 1000)
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
      ) : <span>{item.title}</span>;
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
          {...item}
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
    const { tree } = this.props;
    const { treeData } = tree;
    generateList(treeData, tree)
    const expandedKeys = dataList.map((item) => {
      if (item.parentId === null) {
        return item.key
      }
      if (item.title.indexOf(value) > -1) {
        return getParentKey(item.key, treeData, tree);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      autoExpandParent: true,
      searchValue: value
    });
  }
  onLoad = (param)=>{
    this.props.table.onLoad(param)
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
  render() {
    console.log(111111)
    const { searchValue, expandedKeys, autoExpandParent, selectedKeys } = this.state;
    const treeConfig = this.props.tree;
    const tableConfig = this.props.table;
    const { treeData, treeTitle, treeKey, treeRoot, treeLoading, _defaultSelectedKeys, } = treeConfig;
    const { gridLoading, grid, columns, topButtons = [], rowButtons = [], oopSearch } = tableConfig;
    const {size} = this.props;
    if (selectedKeys.length === 0 && _defaultSelectedKeys) {
      _defaultSelectedKeys.forEach((item) => {
        selectedKeys.push(item);
      });
    }
    return (
      <Row gutter={16} className={styles.OopTreeTable}>
        <Col span={18} push={6}>
          <Card bordered={false} title={tableConfig.title}>
            <OopSearch
              {...oopSearch}
              ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
            />
            <OopTable
              grid={grid}
              columns={columns}
              loading={gridLoading}
              onLoad={this.onLoad}
              size={size}
              topButtons={topButtons}
              rowButtons={rowButtons}
              {...tableConfig}
              ref={(el)=>{ this.table = el }}
            />
          </Card>
        </Col>
        <Col span={6} pull={18} >
          <Card bordered={false} title={treeConfig.title}>
            <Spin spinning={treeLoading}>
              <Search style={{ marginBottom: 8}} placeholder="搜索" onChange={this.handleOnChange} />
                <Tree
                  defaultExpandAll={true}
                  onExpand={this.onExpand}
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  onSelect={this.handleOnSelect}
                  selectedKeys={selectedKeys}
                  {...treeConfig}
                  ref={(el)=>{ this.tree = el }}
                  onRightClick={this.handleOnRightClick}
                  defaultSelectedKeys={['-1']}
                >
                  {this.renderTreeNodes(treeData, treeTitle, treeKey, treeRoot, searchValue)}
                </Tree>
            </Spin>
          </Card>
        </Col>
      </Row>
    )
  }
}
