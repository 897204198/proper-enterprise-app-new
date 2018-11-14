import React from 'react';
import { NavBar, SearchBar, Checkbox, Icon } from 'antd-mobile'
import {connect} from 'dva';
import {inject} from '../../../framework/common/inject';
import styles from './index.less'
// import Item from 'antd-mobile/lib/popover/Item';
// import InfiniteScroll from 'react-infinite-scroller';
const firstName = (name) => {
  return name.substr(0, 1)
}
const { CheckboxItem } = Checkbox
// 底部固定选人组件
const BottomFixed = (props) => {
  const { users, show, subUser, delUser } = props
  if (show) {
    return (
      <div className={styles.bottom}>
        <div className={styles.selectUser}>
        {
          users.map((item) => {
            return (
              <div className={styles.user} key={item.id}>
                <span>{item.name}</span>
                <Icon type="cross-circle-o" className={styles.iconbox} onClick={()=> delUser(item)} />
              </div>
            )
          })
        }
        </div>
        <div className={styles.btnBox}>
          <div className={`container ${styles.subBtn} ${users.length === 0 ? styles.noUser : ''}`} onClick={()=> subUser()}>确认({users.length})</div>
        </div>
      </div>
    )
  } else {
    return null;
  }
}
// 多选列表组件
const CheckboxList = (props) => {
  const { list, users } = props
  return (
    <div>
      {/* <div className={styles.userbox}>
        <CheckboxItem key="all" onChange={e=>props.checkAll(e)}>全选</CheckboxItem>
      </div> */}
      {
        list.map((item) => {
          let flag = false;
          for (const node of users) {
            if (node.id === item.id) {
              flag = true
            }
          }
          return (
            <div className={styles.userbox} key={item.id}>
              <CheckboxItem onChange={e=>props.userCheck(e, item)} checked={flag}>
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
    const { multiply = true, users = [] } = props;
    this.state = {
      multiply,
      menus: [], // 全部菜单
      bread: [], // 面包屑菜单
      breadmenu: [], // 除了根节点菜单
      activemenus: [], // 活动菜单
      users, // 选人数组
      isSearch: false
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
            menus: group[0].children,
            activemenus: group[0].children,
            breadmenu: group[0].children,
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
    this.clearSearch()
  }
  checkAll = (e) => {
    let { users } = this.state
    const { user } = this.props.OopSelectUser$model
    if (e.target.checked) {
      users = [...users, ...user]
      this.setState({
        users: [...users]
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
    const { users } = this.state
    users.push(item)
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
  render() {
    const { user = [], searchUser = [] } = this.props.OopSelectUser$model
    const { activemenus, bread, users, isSearch } = this.state
    // let groups = group[0].children || []
    // const { siderbar = [], users = [] } = this.props.OopSelectUser$model
    const { multiply } = this.state
    const page = (
      <div className={styles.pageWrapper}>
        <NavBar
          mode="light"
          // onLeftClick={() => console.log('onLeftClick')}
          rightContent={
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
        {
          multiply ? <BottomFixed show={true} users={users} subUser={this.subUser} delUser={this.delUser} /> : null
        }
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
            <CheckboxList list={searchUser} userCheck={this.userCheck} users={users} checkAll={this.checkAll} /> :
            <RadioList list={searchUser} selectUser={this.selectUser} /> }
       </div>
      </div>
    )
    return (
      <div className={styles.wrapper}>
        {
          isSearch ? search : page
        }
        {
          multiply ? <BottomFixed show={true} users={users} subUser={this.subUser} delUser={this.delUser} /> : null
        }
      </div>
    )
  }
}

export default OopSelectUser