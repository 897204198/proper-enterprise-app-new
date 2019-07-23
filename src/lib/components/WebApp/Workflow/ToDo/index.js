import React, {Fragment} from 'react';
import { List, Tabs, Spin} from 'antd';
import { Modal, Toast } from 'antd-mobile';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import TimeAgo from 'timeago-react';
import classNames from 'classnames';
import {inject} from '@framework/common/inject';
import {getParamObj} from '@framework/utils/utils';
import styles from './index.less';

const { TabPane } = Tabs;

// function toArray(children) {
//   const c = [];
//   React.Children.forEach(children, (child) => {
//     if (child) {
//       c.push(child);
//     }
//   });
//   return c;
// }

// function getActiveIndex(children, activeKey) {
//   const c = toArray(children);
//   for (let i = 0; i < c.length; i++) {
//     if (c[i].key === activeKey) {
//       return i;
//     }
//   }
//   return -1;
// }

@inject(['OopWorkflowMain$model', 'workflowManager', 'workflowDesigner', 'global'])
@connect(({workflowManager, workflowDesigner, global, loading}) => ({
  workflowManager,
  workflowDesigner,
  global,
  gridLoading: loading.effects['global/oopSearchResult'],
}))
export default class ToDo extends React.PureComponent {
  constructor(props) {
    super(props);
    const state = {
      activeKey: 'task',
      activeIndex: 0,
      task: {data: [], pagination: {}},
      taskAssignee: {data: [], pagination: {}},
    }
    const {location} = props;
    if (location.search) {
      if (location.search.includes('taskAssignee')) {
        state.activeKey = 'taskAssignee';
        state.activeIndex = 1;
      }
    }
    this.state = state
  }
  componentDidMount() {
    this.fetchData();
  }
  componentWillReceiveProps(nextProps) {
    const {location} = nextProps;
    const {activeKey: currentActiveKey} = this.state;
    if (location.search) {
      const {activeKey} = getParamObj(location.search);
      if (activeKey && currentActiveKey !== activeKey) {
        this.setState({
          activeKey,
          activeIndex: activeKey === 'taskAssignee' ? 1 : 0,
          task: {data: [], pagination: {}},
          taskAssignee: {data: [], pagination: {}},
        }, ()=>{
          this.fetchData();
        })
      }
    }
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
    this.props.dispatch(routerRedux.push(`/webapp/workflow/todo?activeKey=${key}`));
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
  handleProcessAgree = (record, event)=>{
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
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
          type: 'OopWorkflowMain$model/submitWorkflow',
          payload: {taskOrProcDefKey: taskId, formData: data},
          callback: (res)=>{
            Toast.hide();
            if (res.status === 'ok') {
              Toast.success('流程提交成功', 2);
              this.fetchData();
            } else {
              Toast.fail(res.result);
            }
          }
        })
      }
    }
  }
  renderListItem = (item, type)=>{
    const {form: {formData}, globalData = {}, pepProcInst: {stateCode, stateValue}} = item;
    const stateColor = stateCode === 'DONE' ? '#00c27e' : '#0079fa';
    const agree = (
      <div className={styles.agree} onClick={(event)=>{ this.handleProcessAgree(item, event) }}>
          <span style={{display: 'flex'}}>
            <img src={require('./assets/agree.png')} alt="" height={14} />
            <span style={{lineHeight: '14px', marginLeft: 4}}>同意</span>
          </span>
      </div>
    );
    const listItem = (
    <Fragment>
      <div style={{lineHeight: '20px', color: '#6c6c6c'}}>
        {
          type === 'todo' ? (
          <Fragment>
            <span>到达时间 : </span>
            <span>{moment(item.createTime).format('YYYY-MM-DD HH:mm')}</span>
          </Fragment>) : (
          <Fragment>
            <span>办理时间 : </span>
            <span style={{marginLeft: 8}}>{item.endTime}</span>
          </Fragment>)
        }
      </div>
      <div style={{lineHeight: '20px', color: '#6c6c6c'}}>
        <span>发起人 : </span><span>{item.pepProcInst.startUserName}</span>
        {type === 'todo' ? agree : (<span className={styles.processStatus} style={{color: stateColor}}>{stateValue}</span>)}
      </div>
    </Fragment>);
    if (type === 'todo' && globalData.formTodoDisplayFields && globalData.formTodoDisplayFields.length) {
      return (
        <div>
        {
          globalData.formTodoDisplayFields.map(it=> (
            <div key={it.name} style={{lineHeight: '20px', color: '#6c6c6c'}}>
              <span>{it.label} : </span>
              <span>{formData[`${it.name}_text`] ? formData[`${it.name}_text`] : formData[`${it.name}`]}</span>
            </div>))
        }
        {agree}
      </div>);
    }
    return listItem;
  }
  renderImage = (item)=>{
    const {globalData: {workflow_icon: workflowIcon}} = item;
    let img = require('./assets/default.png');
    if (workflowIcon) {
      img = require(`./assets/${workflowIcon}`);
    }
    return img;
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
          defaultActiveKey={activeKey}
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
                  hasMore={!gridLoading && task.data.length < task.pagination.total}
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
                              <span style={{display: 'flex'}}>
                                <img src={this.renderImage(item)} alt="" height={22} width={22} />
                                <span style={{fontWeight: 'bold', marginLeft: 8}}>{item.pepProcInst.processTitle}</span>
                              </span>
                              <span style={{color: '#262626', fontSize: 12}}><TimeAgo datetime={item.createTime} locale="zh_CN" live={false} /></span>
                            </div>
                            <List.Item>
                              <List.Item.Meta
                                description={this.renderListItem(item, 'todo')}
                              />
                            </List.Item>
                          </a>
                          {/* <div className={styles.toolbar}><Button type="primary" onClick={(event)=>{ this.handleProcessAgree(item, event) }}>同意</Button></div> */}
                        </div>
                      </div>
                    )}
                  />
                </InfiniteScroll>
                {gridLoading && task.data.length < task.pagination.total && (
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
                  hasMore={!gridLoading && taskAssignee.data.length < taskAssignee.pagination.total}
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
                              <span style={{display: 'flex'}}>
                                <img src={this.renderImage(item)} alt="" height={22} width={22} />
                                <span style={{color: '#262626', fontWeight: 'bold', marginLeft: 8}}>{item.pepProcInst.processTitle || `${item.pepProcInst.startUserName}的${item.pepProcInst.processDefinitionName}`}</span>
                              </span>
                              <span style={{color: '#6c6c6c', fontSize: 12}}><TimeAgo datetime={item.endTime} locale="zh_CN" live={false} /></span>
                            </div>
                            <List.Item>
                              <List.Item.Meta
                                description={this.renderListItem(item)}
                              />
                            </List.Item>
                          </a>
                        </div>
                      </div>
                    )}
                  />
                </InfiniteScroll>
                {gridLoading && taskAssignee.data.length < taskAssignee.pagination.total && (
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
