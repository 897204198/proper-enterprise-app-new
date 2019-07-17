import React from 'react';
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import OopTabTableModal from '../OopTabTableModal';


@inject(['OopGroupUserPicker$model', 'global'])
@connect(({ OopGroupUserPicker$model, global, loading }) => ({
  OopGroupUserPicker$model,
  tableLoading: loading.effects['OopGroupUserPicker$model/findUser'],
  listLoading: loading.effects['OopGroupUserPicker$model/findGroup'],
  global,
}))
export default class OopGroupUserPicker extends React.PureComponent {
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
      type: 'OopGroupUserPicker$model/findGroup',
      payload: {
        moduleName: 'authusergroups',
        userGroupEnable: 'ALL'
      },
      callback: () => {
        const { OopGroupUserPicker$model: {group} } = self.props;
        if (group.length > 0) {
          this.findUser(group[0].id);
        }
      }
    });
  }

  findUser = (groupId) => {
    this.props.dispatch({
      type: 'OopGroupUserPicker$model/findUser',
      payload: groupId,
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
      OopGroupUserPicker$model: {group = [], user = []},
      listLoading,
      tableLoading,
      disabled
    } = this.props

    const columns = [
      {title: '用户名', dataIndex: 'username'},
      {title: '显示名', dataIndex: 'name'},
      {title: '电子邮箱', dataIndex: 'email'},
      {title: '手机号码', dataIndex: 'phone'},
    ]

    const filterColums = [
      'username', 'name', 'email', 'phone'
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
          showIcon: true,
          disabled
        }}
        defaultSelected={ this.state.selectedRowItems}
        modalTitle={placeholder}
        onChange={this.handleChange}
        tableCfg={tableCfg}
        treeCfg={treeCfg}
      />
    );
  }
}

