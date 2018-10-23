import React, {Fragment} from 'react';
import { List, Icon, Tabs, Button, Spin} from 'antd';
import { Modal, Toast } from 'antd-mobile';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import TimeAgo from 'timeago-react';
import classNames from 'classnames';
import {inject} from '../../../../../framework/common/inject';
import styles from './index.less';

const { TabPane } = Tabs;

function toArray(children) {
  const c = [];
  React.Children.forEach(children, (child) => {
    if (child) {
      c.push(child);
    }
  });
  return c;
}

function getActiveIndex(children, activeKey) {
  const c = toArray(children);
  for (let i = 0; i < c.length; i++) {
    if (c[i].key === activeKey) {
      return i;
    }
  }
  return -1;
}

@inject(['baseWorkflow', 'workflowManager', 'workflowDesigner', 'global'])
@connect(({workflowManager, workflowDesigner, global, loading}) => ({
  workflowManager,
  workflowDesigner,
  global,
  gridLoading: loading.effects['global/oopSearchResult'],
}))
export default class ToDo extends React.PureComponent {
  state = {
    activeKey: 'task',
    activeIndex: 0,
    task: {data: [], pagination: {}},
    taskAssignee: {data: [], pagination: {}},
  }

  componentDidMount() {
    this.fetchData();
  }


  fetchData = (page) => {
    const self = this;
    const { activeKey } = this.state;
    const {[activeKey]: {pagination} } = this.state
    this.props.dispatch({
      type: 'global/oopSearchResult',
      payload: {
        moduleName: `workflow_${activeKey}`,
        pageNo: page || 1,
        pageSize: pagination.pageSize || 10,
      },
      callback: () => {
        const { global } = self.props;
        const { [activeKey]: listState } = this.state;
        this.setState({
          [activeKey]: {
            data: [...((!page || page === '1') ? [] : listState.data), ...global.oopSearchGrid.list],
            pagination: global.oopSearchGrid.pagination
          }
        });
      }
    });
  }

  handleTabsChange = (key) => {
    const { children } = this.tabs.props
    let activeIndex = getActiveIndex(children, key);
    if (activeIndex === -1) {
      activeIndex = 0;
    }
    this.setState({
      activeKey: key,
      activeIndex,
      task: {data: [], pagination: {}},
      taskAssignee: {data: [], pagination: {}},
    }, () => {
      this.fetchData();
    });
  }
  handleProcessLaunch = (record)=>{
    console.log('handleProcessLaunch', record);
    const {key, startFormKey} = record;
    const param = btoa(encodeURIComponent(JSON.stringify({
      isLaunch: true,
      taskOrProcDefKey: key,
      businessObj: {
        formKey: startFormKey
      },
      name: '流程发起'
    })));
    this.props.dispatch(routerRedux.push(`/webapp/workflow/workflowMainPop?param=${param}`));
  }
  // 待办
  handleProcessSubmit = (record)=>{
    console.log('handleProcessSubmit', record)
    const {pepProcInst: {procInstId, processTitle}, taskId, name} = record;
    const {btoa, encodeURIComponent, JSON} = window;
    const param = btoa(encodeURIComponent(JSON.stringify({
      isLaunch: false,
      taskOrProcDefKey: taskId,
      procInstId,
      name,
      businessObj: {formTitle: processTitle},
      stateCode: undefined
    })));
    this.props.dispatch(routerRedux.push(`/webapp/workflow/workflowMainPop?param=${param}`));
  }
  // 发起历史
  handleProcessView = (record)=>{
    console.log('handleProcessView', record);
    const {procInstId, processDefinitionId, stateCode} = record;
    this.props.dispatch({
      type: 'workflowManager/findBusinessObjByProcInstId',
      payload: procInstId,
      callback: (res) => {
        console.log(res);
        // TODO 多个forms情况先不予考虑
        const {forms} = res;
        const businessObj = forms.length ? forms[0] : null;
        const param = btoa(encodeURIComponent(JSON.stringify({
          isLaunch: false,
          taskOrProcDefKey: null,
          procInstId,
          businessObj,
          name: null,
          processDefinitionId,
          stateCode
        })));
        this.props.dispatch(routerRedux.push(`/webapp/workflow/workflowMainPop?param=${param}`));
      }
    });
  }
  // 已处理
  handleDoneProcessView = (record)=>{
    console.log('handleDoneProcessView', record);
    const {pepProcInst: {procInstId, processTitle, stateCode, processDefinitionId}} = record;
    this.props.dispatch({
      type: 'workflowManager/findBusinessObjByProcInstId',
      payload: procInstId,
      callback: (res) => {
        console.log(res);
        // TODO 多个forms情况先不予考虑
        const {forms} = res;
        const businessObj = forms.length ? forms[0] : null;
        const param = btoa(encodeURIComponent(JSON.stringify({
          isLaunch: false,
          taskOrProcDefKey: null,
          procInstId,
          businessObj,
          name: processTitle,
          processDefinitionId,
          stateCode
        })));
        this.props.dispatch(routerRedux.push(`/webapp/workflow/workflowMainPop?param=${param}`));
      }
    });
  }
  afterProcessSubmit = ()=>{
    this.handleTabsChange(this.state.activeKey);
  }
  handleProcessAgree = (record)=>{
    console.log(record);
    Modal.alert('提示', '确定同意审批此流程吗？', [
      { text: '取消'},
      { text: '确认', onPress: () => agree() },
    ]);
    const agree = ()=>{
      const {taskId, form} = record;
      if (form.formData) {
        const data = {
          ...form.formData,
          passOrNot: 1,
          approvalRemarks: ''
        }
        Toast.loading('Loading...', 600);
        this.props.dispatch({
          type: 'baseWorkflow/submitWorkflow',
          payload: {taskOrProcDefKey: taskId, formData: data},
          callback: (res)=>{
            Toast.hide();
            if (res.status === 'ok') {
              Toast.success('流程提交成功', 2);
              this.fetchData();
            } else {
              Toast.fail(`流程提交失败,${res.result}`, 4);
            }
          }
        })
      }
    }
  }
  renderListItem = (item, type)=>{
    const {form: {formData}, globalData = {}} = item;
    const listItem = (
    <Fragment>
      <div>
        <Icon type="clock-circle-o" className={styles.icon} />
        {
          type === 'todo' ? (
          <Fragment>
            <span>到达时间 : </span>
            <span>{moment(item.createTime).format('YYYY-MM-DD HH:mm')}</span>
          </Fragment>) : (
          <Fragment><span>办理时间 : </span>
            <span style={{marginLeft: 8}}>{item.endTime}</span>
          </Fragment>)
        }
      </div>
      <div style={{marginTop: 12}}><Icon type="user" className={styles.icon} /><span>发起人 : </span><span>{item.pepProcInst.startUserName}</span></div>
    </Fragment>);
    if (globalData.formTodoDisplayFields && globalData.formTodoDisplayFields.length) {
      return globalData.formTodoDisplayFields.map(it=>
        (<div key={it.name}><span>{it.label} : </span><span>{formData[`${it.name}_text`] ? formData[`${it.name}_text`] : formData[`${it.name}`]}</span></div>)
      )
    }
    return listItem;
  }
  render() {
    const {
      gridLoading
    } = this.props;
    const {
      task,
      taskAssignee,
      activeKey,
      activeIndex
    } = this.state;
    return (
      <div className={styles.container}>
        <Tabs
          animated={false}
          defaultActiveKey="task"
          className={styles.tabs}
          onChange={this.handleTabsChange}
          ref={(el)=>{ this.tabs = el }}>
          <TabPane key="task" tab="待办" />
          <TabPane key="taskAssignee" tab="已办" />
        </Tabs>
        <div className={classNames(styles.tabsContent, styles.tabsContentAnimated)} style={{marginLeft: `${-activeIndex * 100}%`}}>
          <div className={classNames(styles.tabsTabpane,
            {
              [styles.tabsTabpaneActive]: (activeKey === 'task'),
              [styles.tabsTabpaneInactive]: (activeKey !== 'task')
            }
          )}>
            {activeKey === 'task' ? (
              <Fragment>
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={1}
                  loadMore={this.fetchData}
                  hasMore={!gridLoading && task.data.length < task.pagination.count}
                  useWindow={false}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={task.data}
                    loading={gridLoading}
                    renderItem={item => (
                      <div className={styles.listItemWrapper}>
                        <div className={styles.listLine}>
                          <a onClick={ (event)=>{ this.handleProcessSubmit(item, event) }}>
                            <div className={styles.listTitle}>
                              <span style={{color: '#333', fontWeight: 'bold'}}>{item.pepProcInst.processTitle}</span>
                              <span><TimeAgo datetime={item.createTime} locale="zh_CN" /></span>
                            </div>
                            <List.Item actions={[<Icon type="right" />]}>
                              <List.Item.Meta
                                description={this.renderListItem(item, 'todo')}
                              />
                              <div className={styles.listContent}>
                                {item.pepProcInst.stateValue}
                              </div>
                            </List.Item>
                          </a>
                          <div className={styles.toolbar}><Button type="primary" onClick={(event)=>{ this.handleProcessAgree(item, event) }}>同意</Button></div>
                        </div>
                      </div>
                    )}
                  />
                </InfiniteScroll>
                {gridLoading && task.data.length < task.pagination.count && (
                  <div className={styles.loadingContainer}>
                    <Spin />
                  </div>
                )}
              </Fragment>) : null}
          </div>
          <div className={classNames(styles.tabsTabpane,
            {
              [styles.tabsTabpaneActive]: (activeKey === 'taskAssignee'),
              [styles.tabsTabpaneInactive]: (activeKey !== 'taskAssignee')
            }
          )}>
            {activeKey === 'taskAssignee' ? (
              <Fragment>
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={1}
                  loadMore={this.fetchData}
                  hasMore={!gridLoading && taskAssignee.data.length < taskAssignee.pagination.count}
                  useWindow={false}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={taskAssignee.data}
                    loading={gridLoading}
                    renderItem={item => (
                      <div className={styles.listItemWrapper}>
                        <div className={styles.listLine}>
                          <a onClick={ (event)=>{ this.handleDoneProcessView(item, event) }}>
                            <div className={styles.listTitle}>
                              <span style={{color: '#333', fontWeight: 'bold'}}>{item.pepProcInst.processTitle || `${item.pepProcInst.startUserName}的${item.pepProcInst.processDefinitionName}`}</span>
                              <span><TimeAgo datetime={item.endTime} locale="zh_CN" /></span>
                            </div>
                            <List.Item actions={[<Icon type="right" />]}>
                              <List.Item.Meta
                                description={this.renderListItem(item)}
                              />
                              <div className={styles.listContent}>
                                {item.pepProcInst.stateValue}
                              </div>
                            </List.Item>
                          </a>
                        </div>
                      </div>
                    )}
                  />
                </InfiniteScroll>
                {gridLoading && taskAssignee.data.length < taskAssignee.pagination.count && (
                  <div className={styles.loadingContainer}>
                    <Spin />
                  </div>
                )}
              </Fragment>) : null}
          </div>
        </div>
      </div>
    );
  }
}
