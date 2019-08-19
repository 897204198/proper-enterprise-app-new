import React, { PureComponent, Fragment } from 'react';
import { Card, Button, Divider, Modal, Spin, Badge,
  Form, Input, Radio, Select, Tooltip } from 'antd';
import classNames from 'classnames';
import { connect } from 'dva';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import DescriptionList from '@framework/components/DescriptionList';
import { oopToast } from '@framework/common/oopUtils';
import OopSearch from '../../../components/OopSearch';
import OopTable from '../../../components/OopTable';
import OopModal from '../../../components/OopModal';
import OopAuthMenu from '../../../components/OopAuthMenu';
// import OopOrgEmpPicker from '../../../components/OopOrgEmpPicker';
import { dataFilter, commonSearch } from './utils';
import styles from './Role.less';

const { Description } = DescriptionList;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

function onValuesChange(props, changedValues, allValues) {
  const { roleInfo, conductValuesChange } = props;
  if (conductValuesChange) {
    const warningField = {};
    for (const k in allValues) {
      if (Object.keys(roleInfo).length === 0) {
        if (allValues[k]) {
          warningField[k] = {hasChanged: true, prevValue: allValues[k]};
        }
      } else if (Object.prototype.hasOwnProperty.call(roleInfo, k) &&
      allValues[k] !== roleInfo[k]) {
        warningField[k] = {hasChanged: true, prevValue: roleInfo[k]};
      }
    }
    conductValuesChange(warningField);
  }
}

const BasicInfoForm = Form.create({onValuesChange})((props) => {
  const { form, roleInfo, roleList, loading, warningField, warningWrapper, ruleList = [], typeChange, userGroups, ruleType, userList } = props;
  const ruleChange = (val) => {
    form.setFieldsValue({
      ruleValue: []
    })
    // const type = option.props.code;
    if (val && val.substring(val.length - 3) !== 'All') {
      if (val === 'group') {
        typeChange('group');
      } else if (val === 'user') {
        typeChange('user');
      } else {
        typeChange('');
      }
    } else {
      typeChange('');
    }
  }
  return (
    <Spin spinning={loading}>
      <Form className={classNames({[styles.warningWrapper]: warningWrapper})}>
        <FormItem>
          {form.getFieldDecorator('id', {
            initialValue: roleInfo.id,
          })(
            <Input type="hidden" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="名称"
          className={warningField && warningField.name && styles.hasWarning}
        >
          {form.getFieldDecorator('name', {
            initialValue: roleInfo.name,
            rules: [{ required: true, message: '名称不能为空' }],
          })(
            <Input placeholder="请输入名称" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="继承"
          className={warningField && warningField.parentId && styles.hasWarning}
        >
          {form.getFieldDecorator('parentId', {
            initialValue: roleList ? roleInfo.parentId : null,
          })(<Select
              showSearch
              placeholder="请选择"
              optionFilterProp="children"
              allowClear={true}
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
            >
              {
                roleList ? roleList.map(item => (
                  (
                    <Option
                      key={item.id}
                      disabled={item.id === roleInfo.id}>
                      {item.enable ? item.name :
                        (<Tooltip title="已停用"><Badge status="default" />{item.name}</Tooltip>)}
                    </Option>)
                  // <Option key={item.id}>{item.name}</Option>
                )) : null
              }
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="规则"
          className={warningField && warningField.parentId && styles.hasWarning}
        >
          {form.getFieldDecorator('ruleCode', {
            initialValue: roleInfo.ruleCode,
          })(<Select
              showSearch
              placeholder="请选择"
              // optionFilterProp="children"
              allowClear={true}
              onChange={ruleChange}
              // filterOption={(input, option) =>
              //   option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
            >
              {
                ruleList.length > 0 ? ruleList.map(item => (
                  (
                    <Option key={item.id} value={item.code} code={item.type.code}>
                        {item.name}
                    </Option>)
                )) : null
              }
            </Select>
          )}
        </FormItem>
        {
          ruleType === 'user' ? (
            <FormItem
              {...formItemLayout}
              label="用户"
              className={warningField && warningField.description && styles.hasWarning}
            >
              {/* <OopOrgEmpPicker /> */}
              {form.getFieldDecorator('ruleValue', {
                initialValue: roleInfo.ruleValue && roleInfo.ruleCode === 'user' ? roleInfo.ruleValue.split(',') : [],
              })(<Select
                  showSearch
                  placeholder="请选择"
                  mode="multiple"
                  optionFilterProp="children"
                  allowClear={true}
                  // onChange={ruleChange}
                  filterOption={(input, option) =>
                  option.props.children.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
                >
                  {
                    userList.length > 0 ? userList.map(item => (
                      (
                        <Option key={item.id} value={item.id}>
                          <span className={item.enable ? '' : styles.optionBox}>
                            {`${item.name}(${item.username})`}
                          </span>
                          {/* {item.name} */}
                        </Option>)
                    )) : null
                  }
                </Select>
              )}
            </FormItem>
          ) : null
        }
        {
          ruleType === 'group' ? (
            <FormItem
              {...formItemLayout}
              label="用户组"
              className={warningField && warningField.description && styles.hasWarning}
             >
              {form.getFieldDecorator('ruleValue', {
                initialValue: roleInfo.ruleValue && roleInfo.ruleCode === 'group' ? roleInfo.ruleValue.split(',') : [],
              })(<Select
                  showSearch
                  placeholder="请选择"
                  mode="multiple"
                  optionFilterProp="children"
                  allowClear={true}
                  // onChange={ruleChange}
                  filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
                >
                  {
                    userGroups.length > 0 ? userGroups.map(item => (
                      (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>)
                    )) : null
                  }
                </Select>
              )}
             </FormItem>
          ) : null
        }
        <FormItem
          {...formItemLayout}
          label="描述"
          className={warningField && warningField.description && styles.hasWarning}
        >
          {form.getFieldDecorator('description', {
            initialValue: roleInfo.description
          })(
            <TextArea placeholder="请输入描述" autosize={{ minRows: 2, maxRows: 5 }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="状态"
          className={warningField && warningField.enable && styles.hasWarning}
        >
          {form.getFieldDecorator('enable', {
            initialValue: roleInfo.enable == null ? true : roleInfo.enable
          })(
            <RadioGroup>
              <Radio
                className={
                  warningField &&
                  warningField.enable &&
                  warningField.enable.prevValue && styles.hasWarning}
                value={true}>启用</Radio>
              <Radio
                className={
                  warningField &&
                  warningField.enable &&
                  !warningField.enable.prevValue && styles.hasWarning}
                value={false}>停用</Radio>
            </RadioGroup>
          )}
        </FormItem>
      </Form>
    </Spin>
  )
});

const ManagerInfoForm = Form.create()((props) => {
  const { loading, roleMenus, checkedMenuKeys, checkedResourceKeys,
    handleMenuKeys, roleInfo, labelText } = props;
  const checkedAllKeys = [...checkedMenuKeys, ...checkedResourceKeys];
  const formItemProps = {};
  if (labelText) {
    formItemProps.label = labelText;
  }
  const onCheck = (checkedKeys, info) => {
    handleMenuKeys(checkedKeys, info, roleInfo.id);
  }

  return (
    <Spin spinning={loading}>
      <Form layout="vertical">
        <FormItem
          {...formItemProps}
        >
          <Card bordered={false}>
            <OopAuthMenu data={roleMenus} checkedAllKeys={checkedAllKeys} onCheck={onCheck} />
          </Card>
        </FormItem>
      </Form>
    </Spin>
  )
});

const UserInfoForm = (props) => {
  const { loading, columns, roleUsers,
    handleUserChange, roleUsersList,
    rolesSearchType, userRolesAll, setRolesSearchType, setRolesList,
    filterColumns, rolesCheckedData, setRoleCheckedTypeData, groupSelf, getPaganation, userPagination } = props;
  const handleChange = (record, selectedRowKeys) => {
    handleUserChange(selectedRowKeys, record.id)
  }
  const preciseFiltrationRoles = (inputValue, filter) => {
    groupSelf.searchRoleInputValue = inputValue;
    groupSelf.searchFilter = filter;
    setRolesList(
      commonSearch(inputValue, filter, rolesSearchType, filterColumns,
        rolesCheckedData, userRolesAll)
    )
  }
  const changeSearchTypeUser = (value)=>{
    const checkedTypeData = dataFilter(value, userRolesAll, deafultSelectedRowKeys);
    setRoleCheckedTypeData(checkedTypeData)
    setRolesSearchType(value)
    setRolesList(
      commonSearch(groupSelf.searchRoleInputValue, groupSelf.searchFilter,
        value, filterColumns, checkedTypeData, userRolesAll)
    )
  }
  const deafultSelectedRowKeys = roleUsers.map(item => item.id)
  return (
    <Card bordered={false}>
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          onInputChange={preciseFiltrationRoles}
          extra={
            <Select
              defaultValue="all"
              style={{ width: '10%' }}
              onSelect={value => changeSearchTypeUser(value)} >
              <Option value="all">全部</Option>
              <Option value="checked">已绑定</Option>
              <Option value="unchecked">未绑定</Option>
            </Select>
          }
        />
        <OopTable
          onLoad={getPaganation}
          loading={loading}
          size="small"
          grid={{ list: roleUsersList, pagination: userPagination }}
          columns={columns}
          onRowSelect={handleChange}
          selectTriggerOnRowClick={true}
          dataDefaultSelectedRowKeys={deafultSelectedRowKeys}
          />
      </Card>
  )
}
const GroupInfoForm = (props) => {
  const { loading, roleGroups, handleGroupChange,
    columns, groupUsersList, groupsSearchType,
    userGroupsAll, setGroupsSearchType, setGroupsList, filterColumns,
    groupsCheckedData, setGroupCheckedTypeData, groupSelf } = props;
  const handleChange = (record, selectedRowKeys) => {
    handleGroupChange(selectedRowKeys, record.id)
  }
  const preciseFiltrationGroups = (inputValue, filter) => {
    groupSelf.searchGroupInputValue = inputValue;
    groupSelf.searchFilter = filter;
    setGroupsList(
      commonSearch(inputValue, filter, groupsSearchType,
        filterColumns, groupsCheckedData, userGroupsAll)
    )
  }
  const changeSearchTypeGroup = (value)=>{
    const checkedTypeData = dataFilter(value, userGroupsAll, deafultSelectedRowKeys);
    setGroupCheckedTypeData(checkedTypeData)
    setGroupsSearchType(value)
    setGroupsList(
      commonSearch(groupSelf.searchGroupInputValue, groupSelf.searchFilter,
        value, filterColumns, checkedTypeData, userGroupsAll)
    )
  }
  const deafultSelectedRowKeys = roleGroups.map(item => item.id)
  return (
    <Card bordered={false}>
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          onInputChange={preciseFiltrationGroups}
          extra={
            <Select
              defaultValue="all"
              style={{ width: '10%' }}
              onSelect={value => changeSearchTypeGroup(value)} >
              <Option value="all">全部</Option>
              <Option value="checked">已绑定</Option>
              <Option value="unchecked">未绑定</Option>
            </Select>
          }
        />
        <OopTable
          loading={loading}
          size="small"
          grid={{ list: groupUsersList }}
          columns={columns}
          onRowSelect={handleChange}
          selectTriggerOnRowClick={true}
          dataDefaultSelectedRowKeys={deafultSelectedRowKeys}
          // onSelectAll={onSelectAll}
          />
      </Card>
  )
}

@inject(['authRole', 'global'])
@connect(({ authRole, global, loading }) => ({
  authRole,
  global,
  loading: loading.models.authRole,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class Role extends PureComponent {
  state = {
    addOrEditModalTitle: null, // 新建编辑模态窗口 title
    // 是否显示个人信息
    viewVisible: false,
    // 是否显示form表单
    modalVisible: false,
    // 当前tab页面
    // currentTabKey: 'basic',
    // 是否是新建，新建为true，编辑为false
    isCreate: !this.props.authRole.roleInfo.id,
    // 菜单被选择的项
    checkedMenuKeys: [],
    // 资源被选择的项
    checkedResourceKeys: [],
    // 菜单被选择的项（all）
    allCheckedMenuKeys: [],
    // 当前角色所有的用户
    roleUsersList: [],
    // 当前角色所有的用户组
    groupUsersList: [],
    closeConfirmConfig: {
      visible: false
    },
    warningWrapper: false, // from 是否记录修改状态
    warningField: {}, // from 字段变化
    // 当前角色用户的搜索类型
    rolesSearchType: 'all',
    // 当前角色用户组的搜索类型
    groupsSearchType: 'all',
    rolesCheckedData: [],
    groupsCheckedData: [],
    // 规则类型
    ruleType: '',
    roleEnable: 'ALL'
  };

  componentDidMount() {
    this.onLoad();
    this.fetchRule();
    this.fetchUserGroup();
    this.fetchUserList();
  }

  // 刷新角色列表
  onLoad = (param = {}) => {
    const { pagination } = param;
    const params = {
      pagination,
      ...param,
    }
    this.oopSearch.load(params);
  }

  // 关闭基本信息
  handleViewModalVisible = (flag) => {
    this.setState({
      viewVisible: flag
    });
  }
  // 过去规则项
  fetchRule = () => {
    this.props.dispatch({
      type: 'authRole/fetchRule',
    })
  }
  // 查看基本信息
  handleView = (record) => {
    const { ruleList, userList, userGroups } = this.props.authRole;
    const self = this;
    this.props.dispatch({
      type: 'authRole/fetchById',
      payload: record.id,
      callback: (res) => {
        const text = res.enable;
        res.enableLabel = text === true ? '已启用' : '已停用';
        res.badge = text === true ? 'processing' : 'default';
        if (res.ruleCode) {
          for (let i = 0; i < ruleList.length; i++) {
            if (res.ruleCode === ruleList[i].code) {
              if (res.ruleCode === 'user') {
                res.ruleCode = ruleList[i].name;
                res.ruleTitle = '用户'
                if (res.ruleValue) {
                  let names = '';
                  res.ruleValue = res.ruleValue.split(',');
                  for (let j = 0; j < userList.length; j++) {
                    for (let k = 0; k < res.ruleValue.length; k++) {
                      if (res.ruleValue[k] === userList[j].id) {
                        if (names === '') {
                          names += `${userList[j].name}(${userList[j].username})`
                        } else {
                          names += `, ${userList[j].name}(${userList[j].username})`
                        }
                      }
                    }
                  }
                  res.ruleValue = names
                }
              } else if (res.ruleCode === 'group') {
                res.ruleCode = ruleList[i].name;
                res.ruleTitle = '用户组'
                if (res.ruleValue) {
                  let goups = '';
                  res.ruleValue = res.ruleValue.split(',');
                  for (let b = 0; b < userGroups.length; b++) {
                    for (let a = 0; a < res.ruleValue.length; a++) {
                      if (res.ruleValue[a] === userGroups[b].id) {
                        if (goups === '') {
                          goups += `${userGroups[b].name}`
                        } else {
                          goups += `, ${userGroups[b].name}`
                        }
                      }
                    }
                  }
                  res.ruleValue = goups
                }
              } else {
                res.ruleCode = ruleList[i].name;
                res.ruleValue = ''
              }
            }
          }
        }
        this.setState({
          viewVisible: true,
        });
        self.props.dispatch({
          type: 'authRole/saveRoleInfo',
          payload: res
        });
      }
    })
    this.props.dispatch({
      type: 'authRole/fetchRoleUsersById',
      payload: record.id,
    });
    this.props.dispatch({
      type: 'authRole/fetchRoleGroupsById',
      payload: record.id,
    });
    this.getMenus(record.id);
  }

  // 批量删除
  handleRemoveAll = (selectedRowKeys) => {
    const me = this;
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${selectedRowKeys.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        me.props.dispatch({
          type: 'authRole/removeRoles',
          payload: {
            ids: selectedRowKeys.toString()
          },
          callback: (res) => {
            oopToast(res, '删除成功');
            if (me.oopTable) {
              me.oopTable.clearSelection();
              me.onLoad();
            }
          }
        });
      }
    });
  }
  // 删除功能
  handleRemove = (ids) => {
    let idsArray = [];
    const self = this
    if (ids instanceof Array) {
      idsArray = ids;
    } else {
      idsArray.push(ids.id);
    }
    this.props.dispatch({
      type: 'authRole/removeRoles',
      payload: { ids: idsArray.toString() },
      callback: (res) => {
        self.oopTable.clearSelection();
        oopToast(res, '删除成功');
        this.onLoad();
      }
    });
  }

  onDelete = () => {
    const self = this;
    const {authRole: {roleInfo: {id}}} = this.props;

    this.props.dispatch({
      type: 'authRole/removeRoles',
      payload: { ids: ([id]).toString() },
      callback: (res) => {
        self.oopTable.clearSelection();
        oopToast(res, '删除成功');
        this.onLoad();
        self.setState({
          modalVisible: false
        });
      }
    });
  }

  // 切换状态功能
  handleSwitchOnChange = (value, record) => {
    const self = this;
    const ids = [];
    ids.push(record.id);
    this.props.dispatch({
      type: 'authRole/fetchUpdateStatus',
      payload: {
        enable: value,
        ids
      },
      callback: () => {
        self.onLoad();
      }
    });
  }

  // 编辑功能
  handleEdit = (record) => {
    const self = this;
    this.props.dispatch({
      type: 'authRole/fetchById',
      payload: record.id,
      callback: (res) => {
        self.props.dispatch({
          type: 'authRole/saveRoleInfo',
          payload: res
        });
        const { ruleValue, ruleCode } = res;
        let ruleType = '';
        if (ruleValue) {
          if (ruleValue.substring(ruleValue.length - 3) !== 'All') {
            ruleType = ruleCode
          }
        }
        self.setState({
          addOrEditModalTitle: '编辑',
          modalVisible: true,
          isCreate: !res.id,
          ruleType
        });
      }
    });
    this.getAllRoles();
  }

  // 新建功能
  handleCreate = (flag) => {
    this.getAllRoles();
    this.setState({
      addOrEditModalTitle: '新建',
      modalVisible: flag
    });
  }

  // 取得角色列表
  getAllRoles = () => {
    this.props.dispatch({
      type: 'authRole/fetch',
    })
  }

  // 取得已有角色的菜单和资源
  getMenus = (roleId) => {
    this.props.dispatch({
      type: 'authRole/fetchRoleMenusResources',
      payload: { roleId },
      callback: () => {
        this.setState({
          checkedMenuKeys: this.props.authRole.roleMenusChecked.map(item => item.id),
          checkedResourceKeys: this.props.authRole.roleResourcesChecked.map(item => item.id),
          allCheckedMenuKeys: this.props.authRole.allCheckedMenu.map(item => item.id)
        })
      }
    })
  }

  // 控制菜单选择的渲染
  handleMenuKeys = (checkedKeys, info, id) => {
    const checkedMenus = [];
    const checkedResource = [];
    const halfCheckedMenus = [];
    for (let i = 0; i < info.checkedNodes.length; i++) {
      if (!('parentId' in info.checkedNodes[i].props.dataRef)) {
        checkedResource.push(info.checkedNodes[i].props.dataRef.id);
      } else {
        checkedMenus.push(info.checkedNodes[i].props.dataRef.id);
      }
    }
    for (let i = 0; i < info.halfCheckedKeys.length; i++) {
      halfCheckedMenus.push(info.halfCheckedKeys[i]);
    }
    const allCheckedMenus = halfCheckedMenus;
    for (let i = 0; i < checkedMenus.length; i++) {
      let flag = true;
      for (let j = 0; j < halfCheckedMenus.length; j++) {
        if (checkedMenus[i] === halfCheckedMenus[j]) {
          flag = false;
        }
      }
      if (flag) {
        allCheckedMenus.push(checkedMenus[i]);
      }
    }
    const oldAllMenus = this.state.allCheckedMenuKeys;
    const oldResource = this.state.checkedResourceKeys;
    this.setState({
      checkedMenuKeys: checkedMenus,
      checkedResourceKeys: checkedResource,
      allCheckedMenuKeys: allCheckedMenus
    })
    this.handleMenuKeysRequest(oldAllMenus, allCheckedMenus, id, 'authRole/menusAdd', 'authRole/menusDelete', '菜单');
    this.handleMenuKeysRequest(oldResource, checkedResource, id, 'authRole/resourcesAdd', 'authRole/resourcesDelete', '资源');
  }

  // 控制菜单选择的请求
  handleMenuKeysRequest = (oldItems, checkedKeys, id, addType, delType, typeText) => {
    const changeItems = [];
    if (oldItems.length < checkedKeys.length) {
      for (let i = 0; i < checkedKeys.length; i++) {
        if (oldItems.indexOf(checkedKeys[i]) === -1) {
          changeItems.push(checkedKeys[i]);
        }
      }
      this.props.dispatch({
        type: addType,
        payload: {
          roleId: id,
          ids: changeItems
        },
        callback: (res) => {
          if (typeText) {
            oopToast(res, `${typeText}添加成功`, `${typeText}添加失败`);
          }
        }
      });
    }
    if (oldItems.length > checkedKeys.length) {
      for (let i = 0; i < oldItems.length; i++) {
        if (checkedKeys.indexOf(oldItems[i]) === -1) {
          changeItems.push(oldItems[i]);
        }
      }
      this.props.dispatch({
        type: delType,
        payload: {
          roleId: id,
          ids: {ids: changeItems.toString()}
        },
        callback: (res) => {
          oopToast(res, `${typeText}删除成功`, `${typeText}删除失败`);
        }
      });
    }
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag
    });
  }

  // 显示层的菜单
  handleMenuKeysView = () => {}

  // tab切换
  handleTabChange = (activeKey) => {
    const {authRole: {roleInfo: {id}}} = this.props;
    if (activeKey === 'manager') {
      this.getMenus(id);
    } else if (activeKey === 'user') {
      this.props.dispatch({
        type: 'authRole/fetchAllUsers',
        callback: (res) => {
          this.operationsData(res, 'rolesUser');
        }
      })
      this.props.dispatch({
        type: 'authRole/fetchRoleUsersById',
        payload: id,
      });
    } else if (activeKey === 'group') {
      this.props.dispatch({
        type: 'authRole/fetchAllGroups',
        callback: (res) => {
          this.operationsData(res, 'groupsUser');
        }
      })
      this.props.dispatch({
        type: 'authRole/fetchRoleGroupsById',
        payload: id,
      });
    }
  }
  onSubmitForm = () => {
    const self = this;
    const basicUserForm = this.basic.getForm();
    if (basicUserForm) {
      basicUserForm.validateFields((err, data) => {
        if (err) return;

        const params = data;
        if (data.parentId === 'role_no_select') {
          params.parentId = null;
        }
        if (data.ruleValue) {
          params.ruleValue = data.ruleValue.join(',');
        } else {
          params.ruleValue = ''
        }
        if (!data.ruleCode) {
          params.ruleCode = ''
        }
        this.props.dispatch({
          type: 'authRole/createOrUpdate',
          payload: params,
          callback: (res) => {
            oopToast(res, '保存成功');
            this.getAllRoles();
            this.onLoad();
            self.setState({
              isCreate: false,
              closeConfirmConfig: {
                visible: false
              },
              warningWrapper: false,
              warningField: {},
            });
          }
        });
      });
    }
  }

  handleCloseConfirmCancel = (warningWrapper) => {
    this.setState({
      warningWrapper
    })
  }

  handleAddOrEditModalCancel = () => {
    this.handleModalVisible(false);
    setTimeout(() => {
      this.setState({
        rolesSearchType: 'all',
        groupsSearchType: 'all',
        rolesCheckedData: [],
        groupsCheckedData: [],
        checkedMenuKeys: [],
        checkedResourceKeys: [],
        allCheckedMenuKeys: [],
        roleUsersList: [],
        groupUsersList: [],
        isCreate: true,
        closeConfirmConfig: {
          visible: false
        },
        warningWrapper: false,
        warningField: {},
      });
      this.props.dispatch({
        type: 'authRole/clear'
      });
      this.searchRoleInputValue = '';
      this.searchGroupInputValue = '';
    }, 300);
  }

  // 提交form
  // submitForm = (customForm, fields) => {
  //   const activeKey = this.state.currentTabKey;
  //   const self = this;
  //   const params = fields;
  //   if (fields.parentId === 'role_no_select') {
  //     params.parentId = null;
  //   }
  //   if (activeKey === 'basic') {
  //     this.props.dispatch({
  //       type: 'authRole/createOrUpdate',
  //       payload: params,
  //       callback: (res) => {
  //         oopToast(res, '保存成功');
  //         this.getAllRoles();
  //         this.onLoad();
  //         self.setState({
  //           isCreate: false
  //         });
  //       }
  //     });
  //   }
  // }

  // 添加关联用户
  addRolesUser = (typeAdd, id, typeRoles) => {
    this.props.dispatch({
      type: typeAdd,
      payload: {
        roleId: this.props.authRole.roleInfo.id,
        userOrGroupId: id
      },
      callback: (res) => {
        oopToast(res, '添加成功', '添加失败')
        this.props.dispatch({
          type: typeRoles,
          payload: this.props.authRole.roleInfo.id,
        })
      }
    });
  }
  deleteRolesUser = (typeDel, id, typeRoles) => {
    this.props.dispatch({
      type: typeDel,
      payload: {
        roleId: this.props.authRole.roleInfo.id,
        userOrGroupId: id
      },
      callback: (res) => {
        oopToast(res, '删除成功', '删除失败')
        this.props.dispatch({
          type: typeRoles,
          payload: this.props.authRole.roleInfo.id,
        })
      }
    });
  }
  // 添加删除公用函数
  userAddDel = (value, typeAdd, typeDel, typeRoles, data, id) => {
    const userIds = [];
    for (let i = 0; i < data.length; i++) {
      userIds.push(data[i].id);
    }
    // 添加用户
    if (value.length > userIds.length) {
      this.addRolesUser(typeAdd, id, typeRoles);
    }
    // 删除用户
    if (value.length < userIds.length) {
      this.deleteRolesUser(typeDel, id, typeRoles);
    }
  }
  operationsData = (res, type) => {
    console.log(this.props.authRole)
    const { status } = res;
    const { allUsers, allGroups } = this.props.authRole;
    if (status === 'ok') {
      type === 'rolesUser' ? this.setRolesList(allUsers) : this.setGroupsList(allGroups)
    }
  }
  setRolesList = (list) => {
    this.setState({
      roleUsersList: list
    })
  }
  setGroupsList = (list) => {
    this.setState({
      groupUsersList: list
    })
  }
  setRolesSearchType = (value)=>{
    this.setState({
      rolesSearchType: value
    })
  }
  setGroupsSearchType = (value)=>{
    this.setState({
      groupsSearchType: value
    })
  }
  setRoleCheckedTypeData = (rolesCheckedData)=>{
    this.setState({
      rolesCheckedData
    })
  }
  setGroupCheckedTypeData = (groupsCheckedData)=>{
    this.setState({
      groupsCheckedData
    })
  }
  // 角色添加删除用户
  handleUserChange = (value, id) => {
    const typeAdd = 'authRole/roleAddUsers';
    const typeDel = 'authRole/roleDelUsers';
    const typeRoles = 'authRole/fetchRoleUsersById';
    const data = this.props.authRole.roleUsers;
    this.userAddDel(value, typeAdd, typeDel, typeRoles, data, id);
  }
  // 角色添加删除用户组
  handleGroupChange = (value, id) => {
    const typeAdd = 'authRole/roleAddGroups';
    const typeDel = 'authRole/userDelGroups';
    const typeRoles = 'authRole/fetchRoleGroupsById';
    const data = this.props.authRole.roleGroups;
    this.userAddDel(value, typeAdd, typeDel, typeRoles, data, id);
  }
  handleBasicChange = (warningField) => {
    const newWarningFieldlength = Object.keys(warningField).length;
    const currentWarningFieldlength = Object.keys(this.state.warningField).length;
    if (newWarningFieldlength !== currentWarningFieldlength) {
      this.setState(({closeConfirmConfig}) => {
        return {
          closeConfirmConfig: {
            ...closeConfirmConfig,
            visible: newWarningFieldlength > 0
          },
          warningField
        }
      });
    }
  };
  typeChange = (val) => {
    this.setState({
      ruleType: val
    })
  }
  fetchUserGroup = () => {
    this.props.dispatch({
      type: 'authRole/fetchUserGroup',
    })
  }
  fetchUserList = () => {
    this.props.dispatch({
      type: 'authRole/fetchUserList',
    })
  }
  getPaganation = (param = {}) => {
    const { pagination } = param;
    this.setState({
      userPagination: pagination
    })
  }
  render() {
    const { loading, gridLoading,
      global: { size, oopSearchGrid },
      authRole: { roleInfo, roleUsers, roleGroups,
        roleList, roleMenus, allUsers, allGroups, ruleList, userGroups, userList } } = this.props;
    const { viewVisible, checkedMenuKeys, checkedResourceKeys,
      roleUsersList, groupUsersList, addOrEditModalTitle,
      closeConfirmConfig, warningField, warningWrapper, rolesSearchType,
      groupsSearchType, rolesCheckedData, groupsCheckedData, ruleType, userPagination, roleEnable } = this.state;
    const columns = [
      { title: '名称', dataIndex: 'name', key: 'name',
        render: (text, record) => (
          <span
            onClick={() => this.handleView(record)}
            style={{textDecoration: 'underline', cursor: 'pointer'}}>
            {text}
          </span>
        )
      },
      { title: '功能描述说明', dataIndex: 'description', key: 'description', },
      { title: '继承', dataIndex: 'parentName', key: 'parentName', },
      { title: '状态', dataIndex: 'enable', key: 'enable', render: text => (
           <Fragment>
            {text === true ?
              <Badge status="processing" text="已启用" /> :
              <Badge status="default" text={<span style={{color: '#aaa'}}>已停用</span>} />}
          </Fragment>
      )}
    ];
    const userRolesColumns = [
      { title: '用户名', dataIndex: 'username' },
      { title: '显示名', dataIndex: 'name' },
      { title: '邮箱', dataIndex: 'email' },
      { title: '手机号', dataIndex: 'phone' },
      {
        title: '状态', dataIndex: 'enable', render: text => (
          <Fragment>
            {text === true ? <Badge status="processing" text="已启用" /> : <Badge status="default" text="已停用" />}
          </Fragment>
        )
      },
    ]
    const userGroupsColumns = [
      { title: '用户组名称', dataIndex: 'name' },
      { title: '用户组描述', dataIndex: 'description' },
      { title: '顺序', dataIndex: 'seq' },
      {
        title: '状态', dataIndex: 'enable', render: text => (
          <Fragment>
            {text === true ? <Badge status="processing" text="已启用" /> : <Badge status="default" text="已停用" />}
          </Fragment>
        )
      },
    ]
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.handleCreate(true) }
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        onClick: (items)=>{ this.handleRemoveAll(items) },
        display: items=>(items.length),
      }
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.handleEdit(record) }
      }, {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record)=>{ this.handleRemove(record) }
      },
    ]
    return (
      <PageHeaderLayout content={
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          moduleName="authroles"
          param={{roleEnable}}
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            grid={oopSearchGrid}
            columns={columns}
            loading={gridLoading}
            onLoad={this.onLoad}
            size={size}
            topButtons={topButtons}
            rowButtons={rowButtons}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <OopModal
          title={`${addOrEditModalTitle}角色`}
          visible={this.state.modalVisible}
          destroyOnClose={true}
          width={800}
          closeConfirm={closeConfirmConfig}
          closeConfirmCancel={this.handleCloseConfirmCancel}
          onCancel={this.handleAddOrEditModalCancel}
          onOk={this.onSubmitForm}
          onDelete={this.onDelete}
          isCreate={this.state.isCreate}
          loading={!!loading}
          onTabChange={this.handleTabChange}
          tabs={[
            {
              key: 'basic',
              title: '基本信息',
              main: true,
              tips: (<div>新建时，需要<a>填写完基本信息的必填项并保存</a>后，滚动页面或点击左上角的导航来完善其他信息</div>),
              content: <BasicInfoForm
                ref = {(el) => { this.basic = el; }}
                warningWrapper={warningWrapper}
                roleInfo = {roleInfo}
                roleList = {roleList}
                loading = {loading}
                ruleList = {ruleList}
                warningField={warningField}
                typeChange = {this.typeChange}
                ruleType={ruleType}
                userGroups={userGroups}
                userList={userList}
                conductValuesChange={this.handleBasicChange}
              />
            },
            {
              key: 'manager',
              title: '权限管理',
              content: <ManagerInfoForm
                ref = {(el) => { this.manager = el; }}
                roleInfo = {roleInfo}
                checkedMenuKeys = {checkedMenuKeys}
                checkedResourceKeys={checkedResourceKeys}
                handleMenuKeys = {this.handleMenuKeys}
                roleMenus = {roleMenus}
                loading = {loading}
              />
            },
            {
              key: 'user',
              title: '关联用户',
              content: <UserInfoForm
                loading = {!!loading}
                roleUsers= {roleUsers}
                columns= {userRolesColumns}
                handleUserChange= {this.handleUserChange}
                roleUsersList= {roleUsersList}
                rolesSearchType={rolesSearchType}
                userRolesAll={allUsers}
                dataFilter={dataFilter}
                getPaganation={this.getPaganation}
                userPagination={userPagination}
                setRolesList={this.setRolesList}
                setRolesSearchType={this.setRolesSearchType}
                filterColumns={['name', 'username', 'email', 'enableStatus', 'phone']}
                rolesCheckedData={rolesCheckedData}
                setRoleCheckedTypeData={this.setRoleCheckedTypeData}
                groupSelf={this}
              />
            },
            {
              key: 'group',
              title: '关联用户组',
              content: <GroupInfoForm
                loading = {!!loading}
                roleGroups={roleGroups}
                columns={userGroupsColumns}
                handleGroupChange={this.handleGroupChange}
                groupUsersList={groupUsersList}
                groupsSearchType={groupsSearchType}
                userGroupsAll={allGroups}
                dataFilter={dataFilter}
                setGroupsList={this.setGroupsList}
                setGroupsSearchType={this.setGroupsSearchType}
                filterColumns={['name', 'description', 'seq', 'enableStatus']}
                groupsCheckedData={groupsCheckedData}
                setGroupCheckedTypeData={this.setGroupCheckedTypeData}
                groupSelf={this}
              />
            }
          ]}
        />
        <Modal
          title="角色信息"
          width={800}
          visible={viewVisible}
          userInfoView={roleInfo}
          roleUsers={roleUsers}
          roleGroups={roleGroups}
          footer={<Button
            type="primary"
            onClick={()=>{
            this.handleAddOrEditModalCancel()
            this.handleViewModalVisible(false)
          }}>确定</Button>}
          onCancel={()=>{
            this.handleAddOrEditModalCancel()
            this.handleViewModalVisible(false)
          }}
        >
          <DescriptionList size={size} col="1">
            <Description term="名称">
              {roleInfo.name}
            </Description>
            <Description term="功能描述说明">
              {roleInfo.description}
            </Description>
            <Description term="继承">
              {roleInfo.parentName}
            </Description>
            <Description term="规则">
              {roleInfo.ruleCode ? roleInfo.ruleCode : ''}
            </Description>
            {
              roleInfo.ruleValue ? <Description term={roleInfo.ruleTitle}>{roleInfo.ruleValue}</Description> : <div />
            }
            <Description term="权限">
              <ManagerInfoForm
                roleInfo = {roleInfo}
                checkedMenuKeys = {checkedMenuKeys}
                checkedResourceKeys={checkedResourceKeys}
                handleMenuKeys = {this.handleMenuKeysView}
                roleMenus = {roleMenus}
                loading = {loading}
                labelText = ""
              />
            </Description>
            <Description term="状态">{roleInfo.enable ? '已启用' : '已停用'}</Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 16 }} />
          <DescriptionList size={size} col="1" title="包含的用户信息">
            <Description>{roleUsers.map(item=>item.name).join(', ')}</Description>
          </DescriptionList>
          <Divider style={{ marginBottom: 16 }} />
          <DescriptionList size={size} col="1" title="用户组信息">
            <Description>{roleGroups.map(item=>item.name).join(', ')}</Description>
          </DescriptionList>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
