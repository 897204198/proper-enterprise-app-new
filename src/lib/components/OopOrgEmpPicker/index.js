import React from 'react';
import {connect} from 'dva';
import OopTabTableModal from '../OopTabTableModal';
import {inject} from '../../../framework/common/inject';


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
      onCancel
    } = this.props

    const columns = [
      {title: '工号', dataIndex: 'number'},
      {title: '姓名', dataIndex: 'name'},
      {title: '部门', dataIndex: 'organization'},
      {title: '手机号码', dataIndex: 'phone'},
    ]

    const filterColums = [
      'number', 'name', 'organization', 'phone'
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
          disabled
        }}
        defaultSelected={ this.state.selectedRowItems}
        modalTitle={placeholder}
        onChange={this.handleChange}
        tableCfg={tableCfg}
        treeCfg={treeCfg}
        onOk={onOk}
        onCancel={onCancel}
      />
    );
  }
}
