import React from 'react';
import { NavBar, SearchBar, Picker, Icon} from 'antd-mobile'
import { Tree, Icon as IconMobile } from 'antd';
import {connect} from 'dva';
import { intersection, cloneDeep } from 'lodash';
import {inject} from '@framework/common/inject';
import styles from './index.less'
import orgIcon from './static/org.png'
// import Item from 'antd-mobile/lib/popover/Item';
// import InfiniteScroll from 'react-infinite-scroller';
const { TreeNode } = Tree;
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
const findOrgChilds = (item) => {
  let orgs = [];
  orgs.push(item.id)
  if (item.children && item.children.length > 0) {
    for (let i = 0; i < item.children.length; i++) {
      const childOrg = findOrgChilds(item.children[i])
      orgs = [...orgs, ...childOrg]
    }
  }
  return orgs;
}
const findSiblings = (group, item) => {
  const orgs = [];
  if (item.parentId) {
    const parentItem = findOrg(group, item.parentId)[0];
    for (const child of parentItem.children) {
      if (child.id !== item.id) {
        orgs.push(child.id)
      }
    }
  }
  return orgs;
}
const findSingleParent = (group, item) => {
  let orgs = [];
  const parentItem = findOrg(group, item.parentId)[0];
  if (parentItem.children.length === 1) {
    orgs.push(parentItem.id);
    const parentOrg = findSingleParent(group, parentItem);
    orgs = [...orgs, ...parentOrg];
  }
  return orgs;
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
// 底部固定选人组件
const BottomFixed = (props) => {
  const { group, show, subGroup, delSelected, strictly, showMore, showMoreStatus } = props
  if (show) {
    return (
      <div className={styles.bottom}>
        <div className={styles.selectUser}>
        {
          group.map((item) => {
            return (
              <div className={styles.user} key={item.id}>
                <span>{item.name}</span>
                {
                  (!item.disabled && strictly) && <Icon type="cross-circle-o" className={styles.iconbox} onClick={()=> delSelected(item)} />
                }
              </div>
            )
          })
        }
        </div>
        <div className={styles.btnBox}>
          <div className={`container ${styles.subBtn} ${group.length === 0 ? styles.noUser : ''}`} onClick={()=> subGroup()}>确认({group.length})</div>
          <div className={styles.arrowBox} onClick={() => showMore()} >
            <Icon type={!showMoreStatus ? 'down' : 'up'} />
          </div>
        </div>
        {
          showMoreStatus && (
            <div className={styles.moreWrapper}>
              <div className={styles.moreBox}>
              {
                group.map((item) => {
                  return (
                    <div className={styles.moreChild} key={item.id}>
                      <span>{item.name}</span>
                      {
                        (!item.disabled && strictly) && <Icon type="cross-circle-o" className={styles.iconbox} onClick={()=> delSelected(item)} />
                      }
                    </div>
                  )
                })
              }
              </div>
            </div>
          )
        }
      </div>
    )
  } else {
    return null;
  }
}
@inject(['OopSelectOrg$model', 'global'])
@connect(({ OopSelectOrg$model, global }) => ({
  OopSelectOrg$model,
  global,
}))
class OopSelectOrg extends React.PureComponent {
  constructor(props) {
    super(props);
    // const { multiply = true, users = [], open = false } = props;
    const { multiply = true, group = [] } = props;
    this.state = {
      multiply,
      checkedKeys: [],
      selectedKeys: [],
      checkedOrgs: [],
      expand: [],
      group, // 选人数组
      isSearch: false,
      strictly: true,
      searchValue: '',
      showMoreStatus: false,
      // open
    };
  }
  componentDidMount() {
    this.findGroup();
  }
  findGroup() {
    this.props.dispatch({
      type: 'OopSelectOrg$model/findGroup',
      callback: () => {
        const { value = [], OopSelectOrg$model: {group = []}} = this.props;
        const keys = value.length ? value.map(val => val.id) : []
        this.setState({
          checkedKeys: {checked: keys, halfChecked: []},
          // checkedKeys: keys,
          checkedOrgs: value,
          expand: [group[0].id],
          group
        })
      }
    });
  }
  navCancel = () => {
    const { onChange } = this.props
    if (onChange) {
      onChange('')
    }
  }
  searchClick = () => {
    this.setState({
      isSearch: true,
      group: []
    }, ()=>{
      this.autoFocusInst.focus();
    })
  }
  subGroup = () => {
    const { onChange } = this.props
    const { checkedOrgs } = this.state
    if (checkedOrgs.length === 0) {
      return false
    }
    if (onChange) {
      onChange(checkedOrgs)
    }
  }
  delSelected = (item) => {
    const { checkedNodes, checkedKeys, link } = this.state
    for (const [key, value] of checkedNodes.entries()) {
      if (value.id === item.id) {
        checkedNodes.splice(key, 1)
        if (link) {
          checkedKeys.splice(key, 1)
        } else {
          checkedKeys.checked.splice(key, 1)
        }
        this.setState({
          checkedNodes: [...checkedNodes],
          checkedKeys
        })
      }
    }
  }
  cancelSearch = () => {
    const { OopSelectOrg$model: {group = []}} = this.props;
    this.setState({
      isSearch: false,
      group,
      searchValue: ''
    })
  }
  renderTreeNodes = (data) => {
    const { searchValue } = this.state
    return data.map((item) => {
      const index = item.name.indexOf(searchValue);
      const beforeStr = item.name.substr(0, index);
      const afterStr = item.name.substr(index + searchValue.length);
      const title =
      index > -1 ? (
        <span>
          <img src={orgIcon} alt="" style={{width: '10px', height: '10px', marginRight: '5px'}} />
          {beforeStr}
          <span style={{ color: '#108ee9' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : (
        <span>
          <img src={orgIcon} alt="" style={{width: '10px', height: '10px', marginRight: '5px'}} />
          <span>{item.name}</span>
        </span>
      );
      if (item.children) {
        return (
          <TreeNode title={title} key={item.id} dataRef={item} >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={title} key={item.id} />;
    });
  }
  handleCheck = (value, e) => {
    const { strictly, checkedKeys } = this.state
    let keys = []
    if (e && e.checked) {
      keys = [...new Set((value.checked || value).concat(checkedKeys.checked || checkedKeys))]
    } else {
      keys = value.checked || value
    }
    const { group = [] } = this.props.OopSelectOrg$model
    let orgs = keys.length ? keys.map(val => [...findOrg(group, val)]).reduce((arr1, arr2) => arr1.concat(arr2)) : []
    let keysArr = []
    let arr = []
    // 级联时，自动关联下级
    if (!strictly) {
      arr = splitMenu(orgs)
      keysArr = [...new Set(arr.map(item => item.id).concat(keys))]
      if (keysArr.length) {
        orgs = keysArr.map(val => [...findOrg(group, val)]).reduce((arr1, arr2) => arr1.concat(arr2))
      }
    }
    this.setState({
      checkedKeys: strictly ? {checked: keys, halfChecked: []} : keysArr,
      checkedOrgs: orgs,
    })
  }
  changeStrictly = (value) => {
    this.setState({
      strictly: !value[0],
    }, () => {
      const { checkedKeys = [] } = this.tree.props;
      if (value[0]) {
        this.toggleLink(checkedKeys);
      } else {
        this.handleCheck(checkedKeys)
      }
    })
  }
  toggleLink = (checkedKeys) => {
    const { OopSelectOrg$model: {group = []}} = this.props;
    const keys = cloneDeep(checkedKeys);
    for (let i = 0; i < checkedKeys.checked.length; i++) {
      const org = findOrg(group, checkedKeys.checked[i])
      const siblingKeys = findSiblings(group, org[0])
      const intersect = intersection(siblingKeys, checkedKeys.checked);
      if (siblingKeys.length === intersect.length && siblingKeys.length > 0) {
        if (keys.checked.indexOf(org[0].parentId) === -1) {
          keys.checked.push(org[0].parentId)
        }
      }
      if (siblingKeys.length === 0) {
        const parentKeys = findSingleParent(group, org[0])
        keys.checked = [...keys.checked, ...parentKeys]
      }
    }
    this.handleCheck(keys);
  }
  onSelect = (selectedKeys, info) => {
    const { OopSelectOrg$model: {group = []}} = this.props;
    const { multiply, strictly } = this.state;
    let {checkedKeys} = this.state;
    const key = info.node.props.eventKey
    if (multiply) {
      if (strictly) {
        if (checkedKeys) {
          if (checkedKeys.checked.indexOf(key) !== -1) {
            checkedKeys.checked.splice(checkedKeys.checked.indexOf(key), 1);
          } else {
            checkedKeys.checked.push(key)
          }
        } else {
          checkedKeys = {
            checked: [key]
          }
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (checkedKeys) {
          const org = findOrg(group, key)
          const siblingKeys = findSiblings(group, org[0])
          const intersect = intersection(siblingKeys, checkedKeys)
          if (checkedKeys.indexOf(key) !== -1) {
            let orgKeys = findOrgChilds(org[0])
            if (siblingKeys.length === 0) {
              const parentKeys = findSingleParent(group, org[0])
              orgKeys = [...orgKeys, ...parentKeys]
            } else {
              orgKeys.push(org[0].parentId)
            }
            for (let i = 0; i < orgKeys.length; i++) {
              if (checkedKeys.indexOf(orgKeys[i]) !== -1) {
                checkedKeys.splice(checkedKeys.indexOf(orgKeys[i]), 1);
              }
            }
          } else {
            let allCheck = false;
            if (siblingKeys.length === intersect.length && siblingKeys.length > 0) {
              allCheck = true
            }
            if (siblingKeys.length === 0) {
              const parentKeys = findSingleParent(group, org[0])
              checkedKeys = [...checkedKeys, ...parentKeys]
            }
            if (allCheck) {
              checkedKeys.push(org[0].parentId)
            }
            checkedKeys.push(key)
          }
        } else {
          checkedKeys = [key]
        }
      }
      this.handleCheck(checkedKeys)
    } else {
      const selected = findOrg(group, selectedKeys[0]);
      this.setState({
        checkedOrgs: selected
      }, () => {
        this.subGroup();
      })
    }
  };
  handleTagClose = (item) => {
    const { checkedKeys, strictly } = this.state
    const keys = checkedKeys.checked || checkedKeys
    const newKeys = keys.filter(key => key !== item.id)
    const checked = strictly ? {checked: newKeys, halfChecked: []} : newKeys
    this.handleCheck(checked)
  }
  handleSearch = (val) => {
    const {OopSelectOrg$model: {group = []}} = this.props;
    const result = [...filterSearchStr(group, val)]
    this.setState({
      group: val ? result : [],
      searchValue: val
    })
  }
  handleExpand = (key) => {
    this.setState({
      expand: key
    })
  }
  showMore = () => {
    const { showMoreStatus, checkedOrgs } = this.state;
    if (checkedOrgs.length === 0) {
      return false;
    }
    this.setState({
      showMoreStatus: !showMoreStatus
    })
  }
  render() {
    const { isSearch, checkedKeys, selectedKeys, checkedOrgs, strictly, group = [], expand, multiply, showMoreStatus } = this.state
    const link = [
      {
        label: '非级联',
        value: false,
      },
      {
        label: '级联',
        value: true,
      },
    ];
    const page = (
      <div className={styles.pageWrapper}>
        <NavBar
          mode="light"
          leftContent={
            <span onClick={this.navCancel}>取消</span>
          }
          rightContent={
            <Picker
              data={link}
              title="选择部门是否级联"
              // value={[strictly]}
              cols={1}
              onChange={this.changeStrictly}
            >
              <span>{!strictly ? '级联>' : '非级联>'}</span>
            </Picker>
          }
          >选择部门</NavBar>
        <div onClick={() =>this.searchClick()}>
          <SearchBar placeholder="输入查询条件" maxLength={8} disabled />
        </div>
        <div className={`${styles.mainbox} ${!multiply ? styles.radioBox : ''}`}>
          {
            group.length > 0 && (
            <Tree
              autoExpandParent
              onExpand={this.handleExpand}
              checkable={multiply}
              expandedKeys={expand}
              // defaultExpandAll
              onCheck={this.handleCheck}
              checkedKeys={checkedKeys}
              onSelect={this.onSelect}
              // selectedKeys={selectedKeys}
              checkStrictly={strictly}
              switcherIcon={<IconMobile type="down" />}
              ref={(el) => { this.tree = el }}
              blockNode={true}
            >
              {this.renderTreeNodes(group)}
            </Tree>
            )
          }
        </div>
      </div>
    )
    const search = (
      <div className={styles.searchWrapper}>
        <SearchBar
        placeholder="输入查询条件"
        maxLength={8}
        ref={(ref) => { this.autoFocusInst = ref }}
        onCancel={() => this.cancelSearch()}
        onChange={this.handleSearch}
       />
       <div className={styles.searchBox}>
        {
          group.length > 0 && (
            <Tree
              // onExpand={this.handleExpand}
              // expandedKeys={expand}
              defaultExpandAll
              autoExpandParent
              checkable={multiply}
              onCheck={this.handleCheck}
              checkedKeys={checkedKeys}
              onSelect={this.onSelect}
              selectedKeys={selectedKeys}
              checkStrictly={strictly}
              switcherIcon={<IconMobile type="down" />}
              blockNode={true}
              ref={(el) => { this.tree = el }}
            >
              {this.renderTreeNodes(group)}
            </Tree>
            )
          }
       </div>
      </div>
    )
    return (
      <div className={styles.selectUserWrapper}>
        {
          isSearch ? search : page
        }
        {
          multiply && <BottomFixed strictly={strictly} show={true} group={checkedOrgs} subGroup={this.subGroup} delSelected={this.handleTagClose} showMore={this.showMore} showMoreStatus={showMoreStatus} />
        }
      </div>
    )
  }
}

export default OopSelectOrg