import React, {Fragment} from 'react';
import {connect} from 'dva';
import { Card, Divider, Form, Modal, Button, Input, Radio, Badge, Spin, Select} from 'antd';
import classNames from 'classnames';
import PageHeaderLayout from '../../../../framework/components/PageHeaderLayout';
import DescriptionList from '../../../../framework/components/DescriptionList';
import OopSearch from '../../../components/OopSearch';
import OopTable from '../../../components/OopTable';
import OopModal from '../../../components/OopModal';
import {inject} from '../../../../framework/common/inject';
import { oopToast } from '../../../../framework/common/oopUtils';
import styles from './User.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { Option } = Select;
const {Description} = DescriptionList;
const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 5},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16},
  },
};

function onValuesChange(props, changedValues, allValues) {
  const { userBasicInfo, conductValuesChange } = props;
  if (conductValuesChange) {
    const warningField = {};
    for (const k in allValues) {
      if (Object.keys(userBasicInfo).length === 0) {
        if (allValues[k]) {
          warningField[k] = {hasChanged: true, prevValue: allValues[k]};
        }
      } else if (Object.prototype.hasOwnProperty.call(userBasicInfo, k) &&
      allValues[k] !== userBasicInfo[k]) {
        warningField[k] = {hasChanged: true, prevValue: userBasicInfo[k]};
      }
    }
    conductValuesChange(warningField);
  }
}

const UserBasicInfoForm = Form.create({onValuesChange})((props) => {
  const {form, userBasicInfo, loading, warningField, warningWrapper} = props;
  const {getFieldDecorator} = form;

  const checkPassword = (rule, value, callback) => {
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码输入不一致');
    } else {
      callback();
    }
  };
  return (
    <Spin spinning={loading}>
      <Form
        className={classNames({[styles.warningWrapper]: warningWrapper})}>
        <div>
          {getFieldDecorator('id', {
            initialValue: userBasicInfo.id,
          })(
            <Input type="hidden" />
          )}
        </div>
        <FormItem
          {...formItemLayout}
          label="用户名"
          className={warningField && warningField.username && styles.hasWarning}
        >
          {getFieldDecorator('username', {
            initialValue: userBasicInfo.username,
            rules: [{
              required: true, message: '用户名不能为空',
            }],
          })(
            <Input placeholder="请输入用户名" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="显示名"
          className={warningField && warningField.name && styles.hasWarning}
        >
          {getFieldDecorator('name', {
            initialValue: userBasicInfo.name,
            rules: [{
              required: true, message: '显示名不能为空',
            }],
          })(
            <Input placeholder="请输入显示名" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="密码"
          className={warningField && warningField.password && styles.hasWarning}
        >
          {getFieldDecorator('password', {
            initialValue: userBasicInfo.password,
            rules: [{
              required: true, message: '密码不能为空',
            }],
          })(
            <Input type="password" placeholder="请输入密码" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="确认密码"
          className={warningField && warningField.confirm && styles.hasWarning}
        >
          {getFieldDecorator('confirm', {
            initialValue: userBasicInfo.password,
            rules: [{
              required: true, message: '请确认密码',
            }, {
              validator: checkPassword,
            }],
          })(
            <Input type="password" placeholder="请确认密码" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="电子邮件"
          className={warningField && warningField.email && styles.hasWarning}
        >
          {getFieldDecorator('email', {
            initialValue: userBasicInfo.email,
            rules: [{
              required: true, message: '电子邮件不能为空',
            }, {
              type: 'email', message: '请输入正确的电子邮件',
            }],
          })(
            <Input placeholder="请输入电子邮件" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="手机号码"
          className={warningField && warningField.phone && styles.hasWarning}
        >
          {getFieldDecorator('phone', {
            initialValue: userBasicInfo.phone,
            rules: [{
              required: true, message: '手机号码不能为空',
            }, {
              pattern: /^(13[0-9]|14[0-9]|15[0-9]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/i, message: '请输入正确的手机号码',
            }],
          })(
            <Input placeholder="请输入手机号码" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="状态"
        >
          {getFieldDecorator('enable', {
            initialValue: userBasicInfo.enable == null ? true : userBasicInfo.enable
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
    </Spin>);
});
const RoleInfoRelevance = (props) => {
  const { userRoles, userAddRoles, loading, columns, userRolesList, filterRolesAll } = props;
  const handleChange = (record, selectedRowKeys) => {
    userAddRoles(selectedRowKeys, record.id)
  }

  // 默认选中keys
  const deafultSelectedRowKeys = userRoles.map(item => item.id)
  return (
    <Card bordered={false}>
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          onInputChange={filterRolesAll}
          extra={
            <Select
              defaultValue="ALL"
              style={{ width: '10%' }} >
              <Option value="ALL">全部</Option>
              <Option value="checked">已绑定</Option>
              <Option value="unchecked">未绑定</Option>
            </Select>
          }
          ref={(el) => { this.oopSearch = el && el.getWrappedInstance() }}
        />
        <OopTable
          onLoad={this.onLoad}
          loading={loading}
          size="small"
          grid={{ list: userRolesList }}
          columns={columns}
          onRowSelect={handleChange}
          selectTriggerOnRowClick={true}
          dataDefaultSelectedRowKeys={deafultSelectedRowKeys}
          // onSelectAll={onSelectAll}
          />
      </Card>
  );
}
const UserGroupRelevance = (props) => {
  const { userGroups, userAddGroups, loading,
    columns, userGroupsList, filterGroupsAll } = props;
  const handleChange = (record, selectedRowKeys) => {
    userAddGroups(selectedRowKeys, record.id)
  }
  // 默认选中keys
  const deafultSelectedRowKeysGroups = userGroups.map(item => item.id);

  return (
      <Card bordered={false}>
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          onInputChange={filterGroupsAll}
          ref={(el) => { this.oopSearch = el && el.getWrappedInstance() }}
        />
        <OopTable
          onLoad={this.onLoad}
          loading={loading}
          grid={{ list: userGroupsList }}
          columns={columns}
          size="small"
          onRowSelect={handleChange}
          selectTriggerOnRowClick={true}
          dataDefaultSelectedRowKeys={deafultSelectedRowKeysGroups}
          />
      </Card>);
};

@inject(['authUser', 'global'])
@connect(({authUser, global, loading}) => ({
  authUser,
  global,
  loading: loading.models.authUser,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class User extends React.PureComponent {
  state = {
    // isBasicFormFieldsChange: true,
    addOrEditModalTitle: null, // 新建编辑模态窗口 title
    modalVisible: false,
    viewModalVisible: false,
    isCreate: !this.props.authUser.userBasicInfo.id,
    userRolesList: [],
    userGroupsList: [],
    closeConfirmConfig: {
      visible: false
    },
    warningWrapper: false, // from 是否记录修改状态
    warningField: {} // from 字段变化
  }

  componentDidMount() {
    this.onLoad()
  }
  onEdit = (record) => {
    this.setState({
      addOrEditModalTitle: '编辑',
      modalVisible: true,
      isCreate: false
    });
    this.props.dispatch({
      type: 'authUser/fetchById',
      payload: record.id
    });
  }
  onView = (record) => {
    const me = this
    me.props.dispatch({
      type: 'authUser/fetchAll',
      payload: record.id,
      callback() {
      }
    });
    this.setState({
      viewModalVisible: true
    });
  }
  handleDelete = ()=>{
    const record = this.props.authUser.userBasicInfo;
    this.onDelete(record);
    this.clearModalForms();
  }
  onDelete = (record) => {
    const me = this
    me.props.dispatch({
      type: 'authUser/deleteUsers',
      payload: {ids: record.id},
      callback(res) {
        oopToast(res, '删除成功', '删除失败');
        me.onLoad()
      }
    })
  }
  onCreate = () => {
    this.setState({
      addOrEditModalTitle: '新建',
      modalVisible: true,
      isCreate: true
    });
  }
  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag
    });
  }
  handleViewModalVisible = (flag) => {
    this.setState({
      viewModalVisible: flag
    });
    this.props.dispatch({
      type: 'authUser/clear'
    });
  }
  handleTabChange = (activeKey) => {
    const me = this;
    me.setState({
      currentTabKey: activeKey
    })
    if (activeKey === 'roleUser') {
      if (this.props.authUser.userRolesAll.length === 0) {
        me.props.dispatch({
          type: 'authUser/fetchUserRoles',
          payload: this.props.authUser.userBasicInfo.id,
          callback: (res) => {
            me.operationsData(res, 'roleUser');
          }
        })
      }
    } else if (activeKey === 'userGroups') {
      if (this.props.authUser.userGroupsAll.length === 0) {
        me.props.dispatch({
          type: 'authUser/fetchUserGroups',
          payload: this.props.authUser.userBasicInfo.id,
          callback: (res) => {
            me.operationsData(res, 'userGroups');
          }
        });
      }
    }
  }
  onSubmitForm = () => {
    const basicUserForm = this.basicUser.getForm();
    if (basicUserForm) {
      basicUserForm.validateFieldsAndScroll((err, data) => {
        if (err) return;
        this.props.dispatch({
          type: 'authUser/saveOrUpdateUser',
          payload: data,
          callback: (res)=>{
            this.setState({
              isCreate: false,
              closeConfirmConfig: {
                visible: false
              },
              warningWrapper: false,
              warningField: {},
            });
            oopToast(res, '保存成功', '保存失败');
            this.onLoad();
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
        userRolesList: [],
        userGroupsList: [],
        isCreate: true,
        closeConfirmConfig: {
          visible: false
        },
        warningWrapper: false,
        warningField: {},
      });

      this.props.dispatch({
        type: 'authUser/clear'
      });
    }, 300);
  }
  batchDelete = (items) => {
    const me = this;
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${items.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        me.props.dispatch({
          type: 'authUser/deleteUsers',
          payload: {ids: items.toString()},
          callback(res) {
            me.oopTable.clearSelection()
            oopToast(res, '删除成功', '删除失败');
            me.onLoad()
          }
        })
      }
    });
  }
  // 查询方法 加载所有数据
  onLoad = (param = {})=> {
    const { pagination } = param;
    const params = {
      pagination,
      ...param,
      userEnable: 'ALL'
    }
    this.oopSearch.load(params)
  }
  addUserRoles = (typeAdd, id, typeRoles) => {
    this.props.dispatch({
      type: typeAdd,
      payload: {
        userId: this.props.authUser.userBasicInfo.id,
        id
      },
      callback: (res) => {
        oopToast(res, '添加成功', '添加失败')
        this.props.dispatch({
          type: typeRoles,
          payload: this.props.authUser.userBasicInfo.id
        })
      }
    });
  }
  deleteUserRoles =(typeDel, id, typeRoles) => {
    this.props.dispatch({
      type: typeDel,
      payload: {
        userId: this.props.authUser.userBasicInfo.id,
        id
      },
      callback: (res) => {
        oopToast(res, '删除成功', '删除失败')
        this.props.dispatch({
          type: typeRoles,
          payload: this.props.authUser.userBasicInfo.id
        })
      }
    });
  }
  userAddDel = (value, typeAdd, typeDel, typeRoles, data, id) => {
    const userIds = [];
    for (let i = 0; i < data.length; i++) {
      userIds.push(data[i].id);
    }
    // 添加用户
    if (value.length > userIds.length) {
      this.addUserRoles(typeAdd, id, typeRoles);
    }
    // 删除用户
    if (value.length < userIds.length) {
      this.deleteUserRoles(typeDel, id, typeRoles);
    }
  }
  // 用户添加角色
  userAddRoles = (value, id) => {
    const typeAdd = 'authUser/userAddRole';
    const typeDel = 'authUser/userDelRole';
    const typeRoles = 'authUser/fetchUserRoles';
    const data = this.props.authUser.userRoles;
    this.userAddDel(value, typeAdd, typeDel, typeRoles, data, id);
  }
  // 用户添加用户组
  userAddGroups = (value, id) => {
    const typeAdd = 'authUser/userAddGroup';
    const typeDel = 'authUser/userDelGroup';
    const typeRoles = 'authUser/fetchUserGroups';
    const data = this.props.authUser.userGroups;
    this.userAddDel(value, typeAdd, typeDel, typeRoles, data, id);
  }
  setRolesList = (list) => {
    this.setState({
      userRolesList: list
    })
  }
  setGroupsList = (list) => {
    this.setState({
      userGroupsList: list
    })
  }
  filterRolesAll = (inputValue, filter) => {
    const { authUser: { userRolesAll } } = this.props;
    const rolesList = inputValue ? filter(userRolesAll, ['name', 'description', 'parentName', 'enableStatus']) : userRolesAll;
    this.setRolesList(rolesList)
  }
  filterGroupsAll = (inputValue, filter) => {
    const { authUser: { userGroupsAll } } = this.props;
    const groupsList = inputValue ? filter(userGroupsAll, ['name', 'description', 'seq', 'enableStatus']) : userGroupsAll;
    this.setGroupsList(groupsList)
  }
  // 添加字段支持静态搜索（对布尔值会报错）
  formatAllList = (data) => {
    data.map((item) => {
      item.enable === true ? item.enableStatus = '已启用' : item.enableStatus = '已停用'
      return data
    })
  }
  operationsData = (res, type) => {
    const { status } = res.resp2;
    const { userGroupsAll, userRolesAll } = this.props.authUser;
    if (status === 'ok') {
      type === 'roleUser' ? this.setRolesList(userRolesAll) : this.setGroupsList(userGroupsAll)
    }
  }

  handleUserInfoFormChange = (warningField) => {
    const visible = Object.keys(warningField).length > 0;
    this.setState((prevState) => {
      return {
        closeConfirmConfig: {
          ...prevState.closeConfirmConfig,
          visible
        },
        warningField
      }
    });
  };

  render() {
    const {
      authUser: { userBasicInfo, userRoles, userGroups, },
      loading,
      gridLoading,
      global: { size, oopSearchGrid }
    } = this.props;
    const { isCreate, modalVisible, viewModalVisible, userRolesList,
      userGroupsList, addOrEditModalTitle, closeConfirmConfig,
      warningField, warningWrapper } = this.state;
    const column = [
      {
        title: '用户名', dataIndex: 'username', render: (text, record) => {
          return <div onClick={() => this.onView(record)} style={{textDecoration: 'underline', cursor: 'pointer'}}>{text}</div>;
        }
      },
      {title: '显示名', dataIndex: 'name'},
      {title: '电子邮箱', dataIndex: 'email'},
      {title: '手机号码', dataIndex: 'phone'},
      {
        title: '状态', dataIndex: 'enable', render: text => (
          <Fragment>
            {text === true ?
              <Badge status="processing" text="已启用" /> :
              <Badge status="default" text={<span style={{color: '#aaa'}}>已停用</span>} />}
          </Fragment>
        )
      }
    ]
    const userRolesColumns = [
      { title: '角色名称', dataIndex: 'name' },
      { title: '功能描述说明', dataIndex: 'description' },
      { title: '继承', dataIndex: 'parentName' },
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
        onClick: ()=>{ this.onCreate() }
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        onClick: (items)=>{ this.batchDelete(items) },
        display: items=>(items.length),
      }
    ]
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.onEdit(record) },
        display: record=>(!record.superuser)
      }, {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '确认删除吗？',
        onClick: (record)=>{ this.onDelete(record) },
        display: record=>(!record.superuser)
      },
    ]

    return (
      <PageHeaderLayout content={
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          moduleName="authusers"
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            grid={{...oopSearchGrid,
              list: oopSearchGrid.list.map(item=>({...item, disabled: item.superuser === true}))}}
            columns={column}
            loading={gridLoading}
            onLoad={this.onLoad}
            size={size}
            topButtons={topButtons}
            rowButtons={rowButtons}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <OopModal
          title={`${addOrEditModalTitle}用户`}
          visible={modalVisible}
          width={800}
          closeConfirm={closeConfirmConfig}
          closeConfirmCancel={this.handleCloseConfirmCancel}
          onCancel={this.handleAddOrEditModalCancel}
          onOk={this.onSubmitForm}
          onDelete={this.handleDelete}
          isCreate={isCreate}
          loading={!!loading}
          onTabChange={this.handleTabChange}
          tabs={[{
            key: 'basicUser',
            title: '基本信息',
            main: true,
            tips: (<div>新建时，需要<a>填写完基本信息的必填项并保存</a>后，滚动页面或点击左上角的导航来完善其他信息</div>),
            content: <UserBasicInfoForm
              ref={(el) => {
                this.basicUser = el;
              }}
              warningWrapper={warningWrapper}
              formItemLayout={formItemLayout}
              userBasicInfo={userBasicInfo}
              warningField={warningField}
              loading={!!loading}
              conductValuesChange={this.handleUserInfoFormChange} />
          }, {
            key: 'roleUser',
            title: '角色信息',
            tips: (<div>新建时，需要<a>填写完基本信息的必填项并保存</a>后，滚动页面或点击左上角的导航来完善其他信息</div>),
            content: <RoleInfoRelevance
              userRoles={userRoles}
              userAddRoles={this.userAddRoles}
              loading={!!loading}
              columns={userRolesColumns}
              userRolesList={userRolesList}
              filterRolesAll={this.filterRolesAll}
            />
          }, {
            key: 'userGroups',
            title: '用户组信息',
            content: <UserGroupRelevance
              userGroups={userGroups}
              userAddGroups={this.userAddGroups}
              loading={!!loading}
              columns={userGroupsColumns}
              userGroupsList={userGroupsList}
              filterGroupsAll={this.filterGroupsAll}
            />
          }]}
        />
        <Modal
          visible={viewModalVisible}
          destroyOnClose={true}
          width={600}
          footer={<Button type="primary" onClick={() => this.handleViewModalVisible(false)}>确定</Button>}
          onCancel={() => this.handleViewModalVisible(false)}>
          <Spin spinning={loading}>
            <DescriptionList size={size} col="2" title="基本信息">
              <Description term="用户名">{userBasicInfo.username}</Description>
              <Description term="显示名">{userBasicInfo.name}</Description>
              <Description term="电子邮箱">{userBasicInfo.email}</Description>
              <Description term="手机号码">{userBasicInfo.phone}</Description>
              <Description term="状态">{userBasicInfo.enable ? '已启用' : '已停用'}</Description>
            </DescriptionList>
            <Divider style={{marginBottom: 16}} />
            <DescriptionList size={size} col="2" title="角色信息">
              <Description>{userRoles.map(item => item.name).join(', ')}</Description>
            </DescriptionList>
            <Divider style={{marginBottom: 16}} />
            <DescriptionList size={size} col="2" title="用户组信息">
              <Description>{userGroups.map(item => item.name).join(', ')}</Description>
            </DescriptionList>
          </Spin>
        </Modal>
      </PageHeaderLayout>);
  }
}
