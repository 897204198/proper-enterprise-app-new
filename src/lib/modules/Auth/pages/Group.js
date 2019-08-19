import React, { PureComponent, Fragment } from 'react';
import { Card, Button, Divider, Spin, Select,
  Form, Modal, Input, Radio, Badge, InputNumber } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import { inject } from '@framework/common/inject';
import DescriptionList from '@framework/components/DescriptionList';
import { oopToast } from '@framework/common/oopUtils';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import OopSearch from '../../../components/OopSearch';
import OopTable from '../../../components/OopTable';
import OopModal from '../../../components/OopModal';
import { dataFilter, commonSearch } from './utils';
import styles from './Group.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Option } = Select;
const { Description } = DescriptionList;
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
  const { groupsBasicInfo, conductValuesChange } = props;
  if (conductValuesChange) {
    const warningField = {};
    for (const k in allValues) {
      if (Object.keys(groupsBasicInfo).length === 0) {
        if (allValues[k]) {
          warningField[k] = {hasChanged: true, prevValue: allValues[k]};
        }
      } else if (Object.prototype.hasOwnProperty.call(groupsBasicInfo, k) &&
      allValues[k] !== groupsBasicInfo[k]) {
        warningField[k] = {hasChanged: true, prevValue: groupsBasicInfo[k]};
      }
    }
    conductValuesChange(warningField);
  }
}

const BasicInfoForm = Form.create({onValuesChange})((props) => {
  const { form, groupsBasicInfo, loading, warningField, warningWrapper } = props;

  return (
    <Spin spinning={loading}>
      <Form className={classNames({[styles.warningWrapper]: warningWrapper})}>
        <FormItem>
          {form.getFieldDecorator('id', {
            initialValue: groupsBasicInfo.id,
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
            initialValue: groupsBasicInfo.name,
            rules: [{ required: true, message: '名称不能为空' }],
          })(
            <Input placeholder="请输入名称" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="顺序"
          className={warningField && warningField.seq && styles.hasWarning}
        >
          {form.getFieldDecorator('seq', {
            initialValue: groupsBasicInfo.seq,
            rules: [
              { required: true, message: '顺序不能为空' },
              { pattern: /\d+/i, message: '顺序只能为数字'}
            ],
          })(
            <InputNumber placeholder="请输入顺序" min={1} max={999} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="状态"
        >
          {form.getFieldDecorator('enable', {
            initialValue: groupsBasicInfo.enable == null ? true : groupsBasicInfo.enable
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
        <FormItem
          {...formItemLayout}
          label="描述"
          className={warningField && warningField.description && styles.hasWarning}
        >
          {form.getFieldDecorator('description', {
            initialValue: groupsBasicInfo.description
          })(
            <TextArea placeholder="请输入描述" autosize={{ minRows: 2, maxRows: 5 }} />
          )}
        </FormItem>
      </Form>
    </Spin>
  )
});

const UserRelevance = (props) => {
  const { loading, columns, userList, deafultSelected, handleUserTrans,
    groupsBasicInfo, allUsers, userSearchType, setList, setSearchType,
    filterColumns, groupsCheckedData, setGroupCheckedTypeData, groupsSelf } = props;
  const handleChange = (record, selectedRowKeys) => {
    handleUserTrans(groupsBasicInfo.id, selectedRowKeys)
  }
  const changeSearchType = (value)=>{
    const checkedTypeData = dataFilter(value, allUsers, deafultSelected);
    setGroupCheckedTypeData(checkedTypeData)
    setSearchType(value)
    setList(
      commonSearch(groupsSelf.searchInputValue, groupsSelf.searchFilter,
        value, filterColumns, checkedTypeData, allUsers)
    )
  }
  const preciseFiltrationGroups = (inputValue, filter) => {
    groupsSelf.searchInputValue = inputValue;
    groupsSelf.searchFilter = filter;
    setList(
      commonSearch(inputValue, filter, userSearchType, filterColumns, groupsCheckedData, allUsers)
    )
  }
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
              onSelect={value => changeSearchType(value)} >
              <Option value="all">全部</Option>
              <Option value="checked">已绑定</Option>
              <Option value="unchecked">未绑定</Option>
            </Select>
          }
        />
        <OopTable
          loading={loading}
          grid={{ list: userList }}
          columns={columns}
          size="small"
          onRowSelect={handleChange}
          selectTriggerOnRowClick={true}
          dataDefaultSelectedRowKeys={deafultSelected}
          />
      </Card>);
};

@inject(['authGroups', 'global'])
@connect(({ authGroups, global, loading }) => ({
  authGroups,
  global,
  loading: loading.models.authGroups,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class Group extends PureComponent {
  state = {
    addOrEditModalTitle: null, // 新建编辑模态窗口 title
    modalVisible: false,
    currentTabKey: 'basic',
    userTargetKeys: [],
    viewVisible: false,
    userInfoView: {},
    groupUsers: [],
    userGroups: [],
    isCreate: !this.props.authGroups.groupsBasicInfo.id,
    closeConfirmConfig: {
      visible: false
    },
    warningWrapper: false, // from 是否记录修改状态
    warningField: {}, // from 字段变化
    userSearchType: 'all',
    userList: [],
    groupsCheckedData: [],
    userGroupEnable: 'ALL'
  };

  componentDidMount() {
    this.refresh();
  }

  refresh = (param = {})=>{
    const { pagination } = param;
    const params = {
      pagination,
      ...param,
    }
    this.oopSearch.load(params);
  }

  onChange = (pagination, filters, sorter) => {
    console.log(pagination, sorter);
    this.oopSearch.load({
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    })
  }

  // 状态切换
  handleSwitchOnChange = (checked, record) => {
    this.props.dispatch({
      type: 'authGroups/update',
      payload: {
        enable: checked,
        ids: [record.id]
      },
      callback: (res) => {
        oopToast(res, '已启用', '已停用');
        this.refresh();
      }
    });
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
          type: 'authGroups/removeAll',
          payload: {
            ids: selectedRowKeys.toString()
          },
          callback: (res) => {
            oopToast(res, '删除成功', '删除失败');
            if (me.oopTable) {
              me.oopTable.clearSelection();
              me.refresh();
            }
          }
        });
      }
    });
  }

  // 单个删除
  handleRemove = (row) => {
    const me = this;
    this.props.dispatch({
      type: 'authGroups/remove',
      payload: {
        ids: row.id
      },
      callback: (res) => {
        oopToast(res, '删除成功');
        if (me.oopTable) {
          me.oopTable.clearSelection();
          me.refresh();
        }
      }
    });
  }

  onDelete = () => {
    const self = this;
    const {authGroups: {groupsBasicInfo: {id}}} = this.props
    this.props.dispatch({
      type: 'authGroups/remove',
      payload: {
        ids: id
      },
      callback: (res) => {
        oopToast(res, '删除成功');
        if (self.oopTable) {
          self.oopTable.clearSelection();
          self.refresh();
        }
        self.setState({
          modalVisible: false
        });
      }
    });
  }

  // 打开新建层
  handleCreate = (flag) => {
    this.setState({
      addOrEditModalTitle: '新建',
      modalVisible: flag
    });
  }

  handleCloseConfirmCancel = (warningWrapper) => {
    this.setState({
      warningWrapper
    })
  }

  handleAddOrEditModalCancel = () => {
    this.setState({
      modalVisible: false
    });

    setTimeout(() => {
      this.setState({
        groupsCheckedData: [],
        userSearchType: 'all',
        currentTabKey: 'basic',
        userTargetKeys: [],
        userList: [],
        isCreate: true,
        closeConfirmConfig: {
          visible: false
        },
        warningField: {},
      });
      this.props.dispatch({
        type: 'authGroups/clear'
      });
      this.searchInputValue = '';
    }, 300);
  }

  onSubmitForm = () => {
    const customForm = this.basic.getForm();
    customForm.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      this.handleFormSubmit(customForm, fieldsValue);
    });
  }

  // form确认按钮
  handleFormSubmit = (customForm, fields) => {
    // const activeKey = this.state.currentTabKey;
    const activeKey = 'basic';
    const self = this;
    if (activeKey === 'basic') {
      this.props.dispatch({
        type: 'authGroups/createOrUpdate',
        payload: fields,
        callback: (res) => {
          oopToast(res, '保存成功');
          this.refresh();
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
    }
  }

  // tab切换
  handleTabChange = (activeKey) => {
    this.setState({
      currentTabKey: activeKey
    });
    if (activeKey === 'user') {
      this.props.dispatch({
        type: 'authGroups/fetchUserAll',
        callback: () => {
          this.setState({
            userList: this.props.authGroups.allUsers
          })
        }
      });
      if (this.props.authGroups.groupsBasicInfo.id) {
        this.props.dispatch({
          type: 'authGroups/fetchGroupUsers',
          payload: this.props.authGroups.groupsBasicInfo.id,
          callback: () => {
            const userKey = [];
            for (const item of this.props.authGroups.groupUsers) {
              userKey.push(item.id);
            }
            this.setState({
              userTargetKeys: userKey
            });
          }
        });
      } else {
        this.setState({
          userTargetKeys: []
        });
      }
    // } else if (activeKey === 'group') {
    //   this.props.dispatch({
    //     type: 'authGroups/fetchUserGroups',
    //     payload: this.props.authGroups.groupsBasicInfo.id,
    //     callback: () => {
    //       this.setState({
    //         userGroups: this.props.authGroups.userGroups
    //       });
    //     }
    //   });
    }
  }

  // 点击编辑按钮
  handleEdit = (record) => {
    this.setState({
      addOrEditModalTitle: '编辑',
      modalVisible: true,
      isCreate: !record.id
    });
    this.props.dispatch({
      type: 'authGroups/fetchById',
      payload: record.id
    });
  }

  // user穿梭框change
  handleUserTrans = (groupId, key) => {
    const me = this;
    const userKey = [];
    for (const item of this.props.authGroups.groupUsers) {
      userKey.push(item.id);
    }
    const data = [];
    if (key.length > userKey.length) {
      for (let i = 0; i < key.length; i++) {
        if (userKey.indexOf(key[i]) === -1) {
          data.push(key[i]);
        }
      }
      this.props.dispatch({
        type: 'authGroups/groupAddUsers',
        payload: {
          id: groupId,
          ids: data.toString()
        },
        callback: (res) => {
          oopToast(res, '添加成功', '添加失败');
          me.props.dispatch({
            type: 'authGroups/fetchGroupUsers',
            payload: groupId,
            callback: (userTargetKeys) => {
              me.setState({
                userTargetKeys: userTargetKeys.map(item=>item.id)
              })
            }
          })
        }
      });
    }
    if (key.length < userKey.length) {
      for (let i = 0; i < userKey.length; i++) {
        if (key.indexOf(userKey[i]) === -1) {
          data.push(userKey[i]);
        }
      }
      this.props.dispatch({
        type: 'authGroups/groupDeleteUsers',
        payload: {
          id: groupId,
          ids: data.toString()
        },
        callback: (res) => {
          oopToast(res, '删除成功', '删除失败');
          me.props.dispatch({
            type: 'authGroups/fetchGroupUsers',
            payload: groupId,
            callback: (userTargetKeys) => {
              me.setState({
                userTargetKeys: userTargetKeys.map(item=>item.id)
              })
            }
          })
        }
      });
    }
  }

  // 查看基本信息
  handleView = (record) => {
    const userInfoView = record;
    const text = userInfoView.enable;
    userInfoView.enableLabel = text === true ? '已启用' : '已停用';
    userInfoView.badge = text === true ? 'processing' : 'default';
    this.setState({
      viewVisible: true,
      userInfoView
    });
    this.props.dispatch({
      type: 'authGroups/fetchGroupUsers',
      payload: record.id,
      callback: () => {
        this.setState({
          groupUsers: this.props.authGroups.groupUsers
        });
      }
    });
    // this.props.dispatch({
    //   type: 'authGroups/fetchUserGroups',
    //   payload: record.id,
    //   callback: () => {
    //     this.setState({
    //       userGroups: this.props.authGroups.userGroups
    //     });
    //   }
    // });
  }

  // 关闭基本信息
  handleViewModalVisible = (flag) => {
    this.setState({
      viewVisible: flag
    });
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
  setList = (userList)=>{
    this.setState({
      userList
    })
  }
  setSearchType = (list)=>{
    this.setState({
      userSearchType: list
    })
  }
  setGroupCheckedTypeData = (groupsCheckedData)=>{
    this.setState({
      groupsCheckedData
    })
  }
  render() {
    const { loading, global: { size, oopSearchGrid}, gridLoading } = this.props;
    const { currentTabKey, userTargetKeys, viewVisible, userInfoView,
      groupUsers, userGroups, isCreate, addOrEditModalTitle, userList,
      closeConfirmConfig, warningField, warningWrapper, userSearchType,
      groupsCheckedData, userGroupEnable} = this.state;
    const parentMethods = {
      handleFormSubmit: this.handleFormSubmit,
      closeForm: this.closeForm,
      groupsBasicInfo: this.props.authGroups.groupsBasicInfo,
      groupUsers: this.props.authGroups.groupUsers,
      allUsers: this.props.authGroups.allUsers,
      groupAll: this.props.authGroups.groupAll,
      userGroups: this.props.authGroups.userGroups,
      handleTabChange: this.handleTabChange,
      handleUserTrans: this.handleUserTrans,
      loading: !!loading,
      isCreate,
      currentTabKey,
      userTargetKeys
    };
    const columns = [
      { title: '名称', dataIndex: 'name', key: 'name',
        render: (text, record) => (
          <span onClick={() => this.handleView(record)} style={{textDecoration: 'underline', cursor: 'pointer'}}>
            {text}
          </span>
        )
      },
      { title: '描述说明', dataIndex: 'description', key: 'description', },
      { title: '顺序', dataIndex: 'seq', key: 'seq', },
      {
        title: '状态', dataIndex: 'enable', key: 'enable', render: text => (
          <Fragment>
            {text === true ?
              <Badge status="processing" text="已启用" /> :
              <Badge status="default" text={<span style={{color: '#aaa'}}>已停用</span>} />}
          </Fragment>
        )
      }
    ];

    const userColumns = [
      { title: '用户名', dataIndex: 'username' },
      { title: '显示名', dataIndex: 'name' },
      { title: '邮箱', dataIndex: 'email' },
      { title: '手机号', dataIndex: 'phone' },
      {
        title: '状态', dataIndex: 'enable', render: text => (
          <Fragment>
            {text === true ?
              <Badge status="processing" text="已启用" /> :
              <Badge status="default" text="已停用" />}
          </Fragment>
        )
      }
    ];

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
    ]
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
          moduleName="authusergroups"
          param={{userGroupEnable}}
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            grid={oopSearchGrid}
            columns={columns}
            loading={gridLoading}
            onLoad={this.refresh}
            size={size}
            topButtons={topButtons}
            rowButtons={rowButtons}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <OopModal
          title={`${addOrEditModalTitle}用户组`}
          visible={this.state.modalVisible}
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
                className={styles.base}
                groupsBasicInfo = {parentMethods.groupsBasicInfo}
                loading = {!!loading}
                warningField={warningField}
                conductValuesChange={this.handleBasicChange}
              />
            },
            {
              key: 'user',
              title: '用户信息',
              content: <UserRelevance
                groupsBasicInfo = {parentMethods.groupsBasicInfo}
                deafultSelected={userTargetKeys}
                userAddGroups={this.userAddGroups}
                loading={!!loading}
                columns={userColumns}
                groupUsers={parentMethods.groupUsers}
                handleUserTrans={parentMethods.handleUserTrans}
                userSearchType={userSearchType}
                allUsers={parentMethods.allUsers}
                dataFilter={dataFilter}
                setList={this.setList}
                setSearchType={this.setSearchType}
                userList={userList}
                filterColumns={['phone', 'name', 'username', 'email', 'enableStatus']}
                groupsCheckedData={groupsCheckedData}
                setGroupCheckedTypeData={this.setGroupCheckedTypeData}
                groupsSelf={this}
                />
            }]}
        />
        <Modal
          title="用户组信息"
          visible={viewVisible}
          userInfoView={userInfoView}
          groupUsers={groupUsers}
          userGroups={userGroups}
          footer={<Button type="primary" onClick={()=>this.handleViewModalVisible(false)}>确定</Button>}
          onCancel={()=>this.handleViewModalVisible(false)}
        >
          <Spin spinning={loading}>
            <DescriptionList size="small" col="1">
              <Description term="名称">
                {userInfoView.name}
              </Description>
              <Description term="顺序">
                {userInfoView.seq}
              </Description>
              <Description term="描述">
                {userInfoView.description}
              </Description>
              <Description term="状态">{userInfoView.enable ? '已启用' : '已停用'}</Description>
            </DescriptionList>
            <Divider style={{ marginBottom: 16 }} />
            <DescriptionList size={size} col="1" title="包含的用户信息">
              <Description>{groupUsers.map(item=>item.name).join(', ')}</Description>
            </DescriptionList>
          </Spin>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
