import React from 'react';
import {routerRedux} from 'dva/router';
import {connect} from 'dva';
import PropTypes from 'prop-types';
import { Spin, message } from 'antd';
import {getParamObj} from '../../../../../framework/utils/utils';
import {inject} from '../../../../../framework/common/inject';
import styles from './index.less';

@inject(['workflowDesigner'])
@connect(({workflowDesigner, loading}) => ({
  workflowDesigner,
  loading: loading.models.workflowDesigner
}))
export default class Launch extends React.PureComponent {
  static contextTypes = {
    setState: PropTypes.func,
    goHome: PropTypes.func,
  }
  constructor(props) {
    super(props);
    const param = getParamObj(this.props.location.search);
    this.state = {
      procDefKey: param.procDefKey,
    }
  }
  componentWillMount() {
    console.log(this);
    this.props.dispatch({
      type: 'workflowDesigner/fetchByProcDefKey',
      payload: this.state.procDefKey,
      callback: (res)=>{
        const { result: {key, name, startFormKey, id} } = res;
        if (key && name && startFormKey && id) {
          const {btoa, encodeURIComponent, JSON} = window;
          const param = btoa(encodeURIComponent(JSON.stringify({
            isLaunch: true,
            taskOrProcDefKey: key,
            businessObj: {
              formKey: startFormKey
            },
            name,
            processDefinitionId: id,
            stateCode: 'DONE'
          })));
          // 设置右上角的图标
          this.context.setState({
            headerLeftButton: {
              text: '返回',
              icon: 'left',
              onClick: ()=>{
                this.context.goHome();
              }
            },
            headerRightButton: {
              text: '历史',
              onClick: ()=>{
                this.context.setState({
                  title: `${name}历史记录`
                })
                this.props.dispatch(routerRedux.push(`/webapp/workflow/history?param=${param}`));
              }
            },
          });
          this.props.dispatch(routerRedux.push(`/webapp/workflow/workflowMainPop?param=${param}`));
        } else {
          message.error('该流程未部署或参数解析错误');
        }
      }
    })
  }
  render() {
    const {loading} = this.props;
    return (
      <div className={styles.container}>
        <Spin spinning={loading} />
      </div>
    );
  }
}
