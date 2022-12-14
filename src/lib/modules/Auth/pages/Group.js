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
          label="??????"
          className={warningField && warningField.name && styles.hasWarning}
        >
          {form.getFieldDecorator('name', {
            initialValue: groupsBasicInfo.name,
            rules: [{ required: true, message: '??????????????????' }],
          })(
            <Input placeholder="???????????????" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="??????"
          className={warningField && warningField.seq && styles.hasWarning}
        >
          {form.getFieldDecorator('seq', {
            initialValue: groupsBasicInfo.seq,
            rules: [
              { required: true, message: '??????????????????' },
              { pattern: /\d+/i, message: '?????????????????????'}
            ],
          })(
            <InputNumber placeholder="???????????????" min={1} max={999} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="??????"
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
                value={true}>??????</Radio>
              <Radio
                className={
                  warningField &&
                  warningField.enable &&
                  !warningField.enable.prevValue && styles.hasWarning}
                value={false}>??????</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="??????"
          className={warningField && warningField.description && styles.hasWarning}
        >
          {form.getFieldDecorator('description', {
            initialValue: groupsBasicInfo.description
          })(
            <TextArea placeholder="???????????????" autosize={{ minRows: 2, maxRows: 5 }} />
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
          placeholder="?????????"
          enterButtonText="??????"
          onInputChange={preciseFiltrationGroups}
          extra={
            <Select
              defaultValue="all"
              style={{ width: '10%' }}
              onSelect={value => changeSearchType(value)} >
              <Option value="all">??????</Option>
              <Option value="checked">?????????</Option>
              <Option value="unchecked">?????????</Option>
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
    addOrEditModalTitle: null, // ???????????????????????? title
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
    warningWrapper: false, // from ????????????????????????
    warningField: {}, // from ????????????
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

  // ????????????
  handleSwitchOnChange = (checked, record) => {
    this.props.dispatch({
      type: 'authGroups/update',
      payload: {
        enable: checked,
        ids: [record.id]
      },
      callback: (res) => {
        oopToast(res, '?????????', '?????????');
        this.refresh();
      }
    });
  }

  // ????????????
  handleRemoveAll = (selectedRowKeys) => {
    const me = this;
    Modal.confirm({
      title: '??????',
      content: `?????????????????????${selectedRowKeys.length}????????????`,
      okText: '??????',
      cancelText: '??????',
      onOk: () => {
        me.props.dispatch({
          type: 'authGroups/removeAll',
          payload: {
            ids: selectedRowKeys.toString()
          },
          callback: (res) => {
            oopToast(res, '????????????', '????????????');
            if (me.oopTable) {
              me.oopTable.clearSelection();
              me.refresh();
            }
          }
        });
      }
    });
  }

  // ????????????
  handleRemove = (row) => {
    const me = this;
    this.props.dispatch({
      type: 'authGroups/remove',
      payload: {
        ids: row.id
      },
      callback: (res) => {
        oopToast(res, '????????????');
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
        oopToast(res, '????????????');
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

  // ???????????????
  handleCreate = (flag) => {
    this.setState({
      addOrEditModalTitle: '??????',
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

  // form????????????
  handleFormSubmit = (customForm, fields) => {
    // const activeKey = this.state.currentTabKey;
    const activeKey = 'basic';
    const self = this;
    if (activeKey === 'basic') {
      this.props.dispatch({
        type: 'authGroups/createOrUpdate',
        payload: fields,
        callback: (res) => {
          oopToast(res, '????????????');
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

  // tab??????
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

  // ??????????????????
  handleEdit = (record) => {
    this.setState({
      addOrEditModalTitle: '??????',
      modalVisible: true,
      isCreate: !record.id
    });
    this.props.dispatch({
      type: 'authGroups/fetchById',
      payload: record.id
    });
  }

  // user?????????change
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
          oopToast(res, '????????????', '????????????');
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
          oopToast(res, '????????????', '????????????');
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

  // ??????????????????
  handleView = (record) => {
    const userInfoView = record;
    const text = userInfoView.enable;
    userInfoView.enableLabel = text === true ? '?????????' : '?????????';
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

  // ??????????????????
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
      { title: '??????', dataIndex: 'name', key: 'name',
        render: (text, record) => (
          <span onClick={() => this.handleView(record)} style={{textDecoration: 'underline', cursor: 'pointer'}}>
            {text}
          </span>
        )
      },
      { title: '????????????', dataIndex: 'description', key: 'description', },
      { title: '??????', dataIndex: 'seq', key: 'seq', },
      {
        title: '??????', dataIndex: 'enable', key: 'enable', render: text => (
          <Fragment>
            {text === true ?
              <Badge status="processing" text="?????????" /> :
              <Badge status="default" text={<span style={{color: '#aaa'}}>?????????</span>} />}
          </Fragment>
        )
      }
    ];

    const userColumns = [
      { title: '?????????', dataIndex: 'username' },
      { title: '?????????', dataIndex: 'name' },
      { title: '??????', dataIndex: 'email' },
      { title: '?????????', dataIndex: 'phone' },
      {
        title: '??????', dataIndex: 'enable', render: text => (
          <Fragment>
            {text === true ?
              <Badge status="processing" text="?????????" /> :
              <Badge status="default" text="?????????" />}
          </Fragment>
        )
      }
    ];

    const topButtons = [
      {
        text: '??????',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.handleCreate(true) }
      },
      {
        text: '??????',
        name: 'delete',
        icon: 'delete',
        onClick: (items)=>{ this.handleRemoveAll(items) },
        display: items=>(items.length),
      }
    ]
    const rowButtons = [
      {
        text: '??????',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.handleEdit(record) }
      }, {
        text: '??????',
        name: 'delete',
        icon: 'delete',
        confirm: '???????????????????????????',
        onClick: (record)=>{ this.handleRemove(record) }
      },
    ]
    return (
      <PageHeaderLayout content={
        <OopSearch
          placeholder="?????????"
          enterButtonText="??????"
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
          title={`${addOrEditModalTitle}?????????`}
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
              title: '????????????',
              main: true,
              tips: (<div>??????????????????<a>??????????????????????????????????????????</a>??????????????????????????????????????????????????????????????????</div>),
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
              title: '????????????',
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
          title="???????????????"
          visible={viewVisible}
          userInfoView={userInfoView}
          groupUsers={groupUsers}
          userGroups={userGroups}
          footer={<Button type="primary" onClick={()=>this.handleViewModalVisible(false)}>??????</Button>}
          onCancel={()=>this.handleViewModalVisible(false)}
        >
          <Spin spinning={loading}>
            <DescriptionList size="small" col="1">
              <Description term="??????">
                {userInfoView.name}
              </Description>
              <Description term="??????">
                {userInfoView.seq}
              </Description>
              <Description term="??????">
                {userInfoView.description}
              </Description>
              <Description term="??????">{userInfoView.enable ? '?????????' : '?????????'}</Description>
            </DescriptionList>
            <Divider style={{ marginBottom: 16 }} />
            <DescriptionList size={size} col="1" title="?????????????????????">
              <Description>{groupUsers.map(item=>item.name).join(', ')}</Description>
            </DescriptionList>
          </Spin>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
