import React from 'react';
import { NavBar, SearchBar, Checkbox, Icon, List } from 'antd-mobile'
// import { Drawer } from 'antd'
import {connect} from 'dva';
import { intersection, cloneDeep } from 'lodash';
import {inject} from '@framework/common/inject';
import styles from './index.less'
// import Item from 'antd-mobile/lib/popover/Item';
// import InfiniteScroll from 'react-infinite-scroller';
const firstName = (name) => {
  return name.substr(0, 1)
}
const { CheckboxItem } = Checkbox
// 底部固定选人组件
const BottomFixed = (props) => {
  const { users, show, subUser, delUser, showMoreStatus, showMore } = props
  if (show) {
    return (
      <div className={styles.bottom}>
        <div className={styles.selectUser}>
        {
          users.map((item) => {
            return (
              <div className={styles.user} key={item.id}>
                <span>{item.name}</span>
                {
                  !item.disabled && <Icon type="cross-circle-o" className={styles.iconbox} onClick={()=> delUser(item)} />
                }
              </div>
            )
          })
        }
        </div>
        <div className={styles.btnBox}>
          <div className={`container ${styles.subBtn} ${users.length === 0 ? styles.noUser : ''}`} onClick={()=> subUser()}>确认({users.length})</div>
          <div className={styles.arrowBox} onClick={() => showMore()} >
            <Icon type={!showMoreStatus ? 'down' : 'up'} />
          </div>
        </div>
        {
          showMoreStatus && (
            <div className={styles.moreWrapper}>
              <div className={styles.moreBox}>
              {
                users.map((item) => {
                  return (
                    <div className={styles.moreChild} key={item.id}>
                      <span>{item.name}</span>
                      {
                        !item.disabled && <Icon type="cross-circle-o" className={styles.iconbox} onClick={()=> delUser(item)} />
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
// 多选列表组件
const CheckboxList = (props) => {
  const { list, users, isSearch } = props
  // console.log(users)
  let allCheck = false;
  const listIds = list.map((item) => {
    return item.id
  })
  const userIds = users.map((item) => {
    return item.id
  })
  const intersect = intersection(listIds, userIds)
  if (listIds.length === intersect.length && listIds.length !== 0) {
    allCheck = true
  }
  return (
    <div>
      <List>
        {
          !isSearch ? (
            <div className={styles.userbox}>
              <CheckboxItem key="all" onChange={e=>props.checkAll(e)} checked={allCheck} >全选</CheckboxItem>
            </div>
            ) : null
        }
        {
          list.map((item) => {
            let flag = false;
            let disabled = false;
            for (const node of users) {
              if (node.id === item.id) {
                flag = true
                if (node.disabled) {
                  // console.log(item)
                  disabled = true
                }
              }
            }
            return (
              <div className={styles.userbox} key={item.id}>
                <CheckboxItem onChange={e=>props.userCheck(e, item)} checked={flag} disabled={disabled}>
                  <div className={styles.imgbox}>{firstName(item.name)}</div>
                  <div className={styles.userInfo}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.post}>{item.description}</span>
                  </div>
                </CheckboxItem>
              </div>
            )
          })
        }
      </List>
    </div>
  )
}
// 单选列表组件
const RadioList = (props) => {
  const { list, selectUser } = props
  return (
    <div>
      {
        list.map((item) => {
          return (
            <div className={`${styles.userbox} ${styles.radiobox}`} key={item.id} onClick={()=> selectUser(item)}>
              {/* <CheckboxItem> */}
              <div className={styles.imgbox}>{firstName(item.name)}</div>
              <div className={styles.userInfo}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.post}>{item.description}</span>
              </div>
              {/* </CheckboxItem> */}
            </div>
          )
        })
      }
    </div>
  )
}
@inject(['OopSelectUser$model', 'global'])
@connect(({ OopSelectUser$model, global }) => ({
  OopSelectUser$model,
  // tableLoading: loading.effects['OopSelectUser$model/findUser'],
  // listLoading: loading.effects['OopSelectUser$model/findGroup'],
  global,
}))
class OopSelectUser extends React.PureComponent {
  constructor(props) {
    super(props);
    // console.log(props)
    // const { multiply = true, users = [], open = false } = props;
    const { multiply = true, users = [] } = props;
    this.state = {
      multiply,
      menus: [], // 全部菜单
      bread: [], // 面包屑菜单
      breadmenu: [], // 除了根节点菜单
      activemenus: [], // 活动菜单
      users, // 选人数组
      isSearch: false,
      showMoreStatus: false,
      // open
    };
  }
  componentDidMount() {
    this.findGroup();
  }
  findGroup() {
    this.props.dispatch({
      type: 'OopSelectUser$model/findGroup',
      callback: () => {
        const { group = [] } = this.props.OopSelectUser$model;
        if (group.length > 0) {
          this.setState({
            menus: group[0].children || [],
            activemenus: group[0].children || [],
            breadmenu: group[0].children || [],
            bread: [
              {
                id: group[0].id,
                name: group[0].name
              }
            ]
          })
          this.findUser(group[0].id);
        }
      }
    });
  }
  findUser = (groupId) => {
    this.props.dispatch({
      type: 'OopSelectUser$model/findUser',
      payload: {
        moduleName: 'hrmemployee',
        pageNo: 1,
        pageSize: 9999,
        organizationId: groupId
      },
    });
  }
  navCancel = () => {
    const { onChange } = this.props
    if (onChange) {
      onChange('')
    }
    this.clearPropUser()
    this.clearSearch()
  }
  searchClick = () => {
    this.setState({
      isSearch: true
    }, ()=>{
      this.autoFocusInst.focus();
    })
  }
  subUser = () => {
    const { onChange } = this.props
    const { users } = this.state
    if (users.length === 0) {
      return false
    }
    if (onChange) {
      onChange(users)
    }
    this.clearPropUser()
    this.clearSearch()
  }
  checkAll = (e) => {
    const { users } = this.state
    const { user } = this.props.OopSelectUser$model
    if (e.target.checked) {
      let userbox = cloneDeep(users)
      const listbox = cloneDeep(user)
      const listIds = user.map((item) => {
        return item.id
      })
      const userIds = users.map((item) => {
        return item.id
      })
      const intersect = intersection(listIds, userIds)
      const intersectIds = intersect.map((item) => {
        return item
      })
      for (let i = 0; i < intersectIds.length; i++) {
        if (listIds.includes(intersectIds[i])) {
          listbox.splice(listIds.indexOf(intersectIds[i]), 1);
          listIds.splice(listIds.indexOf(intersectIds[i]), 1);
        }
      }
      userbox = [...userbox, ...listbox]
      this.setState({
        users: [...userbox]
      })
    } else {
      const userbox = cloneDeep(users)
      const listIds = user.map((item) => {
        return item.id
      })
      const userIds = users.map((item) => {
        return item.id
      })
      for (let i = 0; i < listIds.length; i++) {
        if (userIds.includes(listIds[i])) {
          if (!userbox[userIds.indexOf(listIds[i])].disabled) {
            userbox.splice(userIds.indexOf(listIds[i]), 1);
            userIds.splice(userIds.indexOf(listIds[i]), 1);
          }
        }
      }
      this.setState({
        users: userbox
      })
    }
  }
  userCheck = (e, item) => {
    const { users } = this.state
    if (e.target.checked) {
      const nUsers = [
        ...users,
        item
      ]
      this.setState({
        users: nUsers
      })
    } else {
      for (const [key, value] of users.entries()) {
        if (value.id === item.id) {
          users.splice(key, 1)
          this.setState({
            users: [...users]
          })
        }
      }
    }
  }
  getsidebar = (item) => {
    const { bread } = this.state
    if (item.children) {
      this.setState({
        activemenus: item.children
      })
    }
    const user = {
      id: item.id,
      name: item.name,
      parentId: item.parentId
    }
    const breadArray = bread
    if (breadArray[breadArray.length - 1].parentId && item.parentId === breadArray[breadArray.length - 1].parentId) {
      breadArray[breadArray.length - 1] = item
    } else {
      breadArray.push(user)
    }
    this.setState({
      bread: breadArray
    })
    this.findUser(item.id)
  }
  breadbar = (item) => {
    const { breadmenu, menus, bread} = this.state
    let breadArray = bread
    if (item.id === 'root') {
      breadArray = [
        item
      ]
      this.setState({
        activemenus: breadmenu,
        bread: breadArray
      })
      this.findUser(item.id);
    } else {
      for (const node of menus) {
        if (node.id === item.id) {
          if (node.children) {
            for (let i = 0; i < bread.length; i++) {
              if (item.id === bread[i].id) {
                breadArray.splice(i + 1, bread.length)
                this.setState({
                  activemenus: node.children,
                  bread: breadArray
                })
                this.findUser(node.id);
              }
            }
          } else {
            if (node.parentId === 'root') {
              this.setState({
                activemenus: breadmenu,
              })
              this.findUser(node.id);
              return false;
            }
            for (const parent of menus) {
              if (node.parentId === parent.id) {
                this.setState({
                  activemenus: parent.children
                })
                this.findUser(node.parentId);
              }
            }
          }
        }
      }
    }
  }
  selectUser = (item) => {
    const { users, multiply } = this.state
    if (multiply) {
      users.push(item)
    } else {
      users.length = 0
      users.push(item)
    }
    this.setState({
      users: [...users],
      isSearch: false
    }, ()=>{
      this.subUser()
      this.clearSearch()
    })
  }
  delUser = (item) => {
    const { users } = this.state
    for (const [key, value] of users.entries()) {
      if (value.id === item.id) {
        users.splice(key, 1)
        this.setState({
          users: [...users]
        })
      }
    }
  }
  cancelSearch = () => {
    this.setState({
      isSearch: false
    })
    this.clearSearch()
  }
  clearSearch = () => {
    this.setState({
      isSearch: false
    })
    this.props.dispatch({
      type: 'OopSelectUser$model/delSearchUser'
    })
  }
  searchUser = (value) => {
    if (value === '') {
      this.props.dispatch({
        type: 'OopSelectUser$model/delSearchUser',
      })
      return false
    }
    this.props.dispatch({
      type: 'OopSelectUser$model/searchUser',
      payload: {
        name: value,
        pageNo: 1,
        pageSize: 9999
      }
    })
  }
  clearPropUser = () => {
    this.props.dispatch({
      type: 'OopSelectUser$model/delUser'
    })
  }
  showMore = () => {
    const { showMoreStatus, users } = this.state;
    if (users.length === 0) {
      return false;
    }
    this.setState({
      showMoreStatus: !showMoreStatus
    })
  }
  render() {
    const { user = [], searchUser = [] } = this.props.OopSelectUser$model
    const { activemenus, bread, users, isSearch, showMoreStatus } = this.state
    // let groups = group[0].children || []
    // const { siderbar = [], users = [] } = this.props.OopSelectUser$model
    const { multiply } = this.state
    const page = (
      <div className={styles.pageWrapper}>
        <NavBar
          mode="light"
          // onLeftClick={() => console.log('onLeftClick')}
          leftContent={
            <span onClick={this.navCancel}>取消</span>
          }
          >选择人员</NavBar>
        <div onClick={() =>this.searchClick()}>
          <SearchBar placeholder="输入查询条件" maxLength={8} disabled />
        </div>
        <div className={styles.crumb}>
        {
          bread.map((item) => {
            return (
              <div key={item.id} onClick={() => this.breadbar(item)}>{item.name}</div>
            )
          })
        }
        </div>
        <div className={styles.mainbox}>
          <div className={`container ${styles.sideBar} ${multiply ? null : styles.radioHeight}`}>
          {
            activemenus.map((item) => {
              return (
                <div className={styles.menu} key={item.id} onClick={() =>this.getsidebar(item)}>{item.name}</div>
              )
            })
          }
          </div>
          <div className={`container ${styles.conList} ${multiply ? null : styles.radioHeight}`}>
            { multiply ?
            <CheckboxList list={user} userCheck={this.userCheck} users={users} checkAll={this.checkAll} /> :
            <RadioList list={user} selectUser={this.selectUser} /> }
          </div>
        </div>
        {/* {
          multiply ? <BottomFixed show={true} users={users} subUser={this.subUser} delUser={this.delUser} /> : null
        } */}
      </div>
    )
    const search = (
      <div className={styles.searchWrapper}>
        <SearchBar
        placeholder="输入查询条件"
        maxLength={8}
        ref={(ref) => { this.autoFocusInst = ref }}
        onCancel={() => this.cancelSearch()}
        onChange={this.searchUser}
       />
       <div className={styles.searchBox}>
       { multiply ?
            <CheckboxList list={searchUser} userCheck={this.userCheck} users={users} checkAll={this.checkAll} isSearch={isSearch} /> :
            <RadioList list={searchUser} selectUser={this.selectUser} /> }
       </div>
      </div>
    )
    return (
      // <Drawer
      //   placement="right"
      //   width={document.documentElement.clientWidth}
      //   closable={false}
      //   className={styles.selectUserWrapper}
      //   onClose={this.onClose}
      //   visible={open}
      // >
      <div className={styles.selectUserWrapper}>
        {
          isSearch ? search : page
        }
        {
          multiply ? <BottomFixed show={true} users={users} subUser={this.subUser} delUser={this.delUser} showMoreStatus={showMoreStatus} showMore={this.showMore} /> : null
        }
      </div>
      // </Drawer>
    )
  }
}

export default OopSelectUser