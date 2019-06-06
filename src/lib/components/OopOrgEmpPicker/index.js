import React from 'react';
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import OopTabTableModal from '../OopTabTableModal';


@inject(['OopOrgEmpPicker$model', 'global'])
@connect(({ OopOrgEmpPicker$model, global, loading }) => ({
  OopOrgEmpPicker$model,
  tableLoading: loading.effects['OopOrgEmpPicker$model/findUser'],
  listLoading: loading.effects['OopOrgEmpPicker$model/findGroup'],
  global,
}))
export default class OopOrgEmpPicker extends React.PureComponent {
  constructor(props) {
    super(props);
    const { value = [] } = props;
    this.state = {
      selectedRowItems: [...value],
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value.length) {
      this.setState({
        selectedRowItems: [...nextProps.value]
      })
    }
  }
  handleButtonClick = () => {
    const self = this;
    this.props.dispatch({
      type: 'OopOrgEmpPicker$model/findGroup',
      callback: () => {
        const { OopOrgEmpPicker$model: {group} } = self.props;
        if (group.length > 0) {
          this.findUser(group[0].id);
        }
      }
    });
  }

  findUser = (groupId) => {
    this.props.dispatch({
      type: 'OopOrgEmpPicker$model/findUser',
      payload: {
        moduleName: 'hrmemployee',
        pageNo: 1,
        pageSize: 9999,
        organizationId: groupId
      },
    });
  }

  handleChange = (data) => {
    this.setState({
      selectedRowItems: data
    })
    const {onChange} = this.props;
    if (onChange) {
      onChange(data);
    }
  }

  render() {
    const {
      placeholder = '请选择',
      OopOrgEmpPicker$model: {group = [], user = []},
      listLoading,
      tableLoading,
      disabled,
      onOk,
      onCancel,
      buttonCfg = {},
      multiple = true
    } = this.props
    // const { selectedRowItems } = this.state
    // const users = user
    // if (users.length && selectedRowItems.length) {
    //   users.forEach((item, i) => {
    //     selectedRowItems.forEach((key, index) => {
    //       if (item.id === key.id && key.hasOwnProperty('disabled')) {
    //         users[i].disabled = key.disabled
    //       }
    //     })
    //   });
    // }
    const columns = [
      {title: '工号', dataIndex: 'account'},
      {title: '姓名', dataIndex: 'name'},
      {title: '部门', dataIndex: 'orgName'},
      {title: '手机号码', dataIndex: 'telephone'},
    ]

    const filterColums = [
      'account', 'name', 'orgName', 'telephone'
    ]

    const treeCfg = {
      dataSource: group,
      loading: listLoading,
      title: '用户组列表'
    };

    const tableCfg = {
      columns,
      filterColums,
      data: user,
      loading: tableLoading,
      onLoad: this.findUser,
      total: user.length
    };

    if (group.length > 0) {
      treeCfg.defaultSelectedKeys = [group[0].id];
      tableCfg.title = group[0].name;
    }

    return (
      <OopTabTableModal
        buttonCfg={{
          icon: 'user',
          onClick: this.handleButtonClick,
          text: placeholder,
          disabled,
          showIcon: true,
          ...buttonCfg
        }}
        defaultSelected={ this.state.selectedRowItems }
        modalTitle={placeholder}
        onChange={this.handleChange}
        tableCfg={tableCfg}
        treeCfg={treeCfg}
        onOk={onOk}
        onCancel={onCancel}
        multiple={multiple}
      />
    );
  }
}

