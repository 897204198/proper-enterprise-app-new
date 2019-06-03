import React, {Fragment} from 'react';
import { List, Icon, Tabs, Badge, Spin } from 'antd';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {inject} from '@framework/common/inject';
import {getParamObj} from '@framework/utils/utils';
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

@inject(['workflowManager', 'workflowDesigner', 'global'])
@connect(({workflowManager, workflowDesigner, global, loading}) => ({
  workflowManager,
  workflowDesigner,
  global,
  loading: loading.models.workflowManager,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class History extends React.PureComponent {
  static contextTypes = {
    setHeader: PropTypes.func,
    goHome: PropTypes.func,
  }
  constructor(props) {
    super(props);
    const {atob, decodeURIComponent, JSON} = window;
    const { param, delta = -1 } = getParamObj(this.props.location.search);
    const { name } = JSON.parse(decodeURIComponent(atob(param)));
    this.state = {
      activeKey: 'process',
      activeIndex: 1,
      design: {data: [], pagination: {}},
      process: {data: [], pagination: {}},
      name,
      delta
    }
  }
  componentWillMount() {
    this.context.setHeader({
      headerLeftButton: {
        text: '返回',
        icon: 'left',
        onClick: ()=>{
          const {name, delta} = this.state;
          this.context.setHeader({
            title: name
          });
          console.log('delta', delta);
          history.go(delta);
        }
      },
      headerRightButton: {
        icon: 'home',
        onClick: ()=>{
          this.context.goHome();
        }
      },
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchDesign = () => {
    const self = this;
    this.props.dispatch({
      type: 'workflowManager/findDesign',
      payload: {
        modelType: '0',
        sort: 'modifiedDesc'
      },
      callback: () => {
        const { workflowManager } = self.props;
        this.setState({
          design: workflowManager.design
        })
      }
    });
  }

  fetchData = (page) => {
    const self = this;
    const { activeKey, name } = this.state;
    const {[activeKey]: {pagination} } = this.state
    this.props.dispatch({
      type: 'global/oopSearchResult',
      payload: {
        moduleName: `workflow_${activeKey}`,
        pageNo: page || 1,
        pageSize: pagination.pageSize || 10,
        req: JSON.stringify([{key: 'processDefinitionName', value: name, operate: 'like', table: 'act_re_procdef '}])
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
    const self = this;
    const { children } = this.tabs.props
    let activeIndex = getActiveIndex(children, key);
    if (activeIndex === -1) {
      activeIndex = 0;
    }
    this.setState({
      activeKey: key,
      activeIndex,
      design: {data: [], pagination: {}},
      process: {data: [], pagination: {}},
    }, () => {
      if (key === 'design') {
        self.fetchDesign();
      } else if (key === 'process') {
        self.fetchData();
      }
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
        this.context.setHeader({
          headerLeftButton: {
            text: '返回',
            icon: 'left',
            onClick: ()=>{
              history.go(-1);
            }
          },
        });
        this.props.dispatch(routerRedux.push(`/webapp/workflow/workflowMainPop?param=${param}`));
      }
    });
  }
  afterProcessSubmit = ()=>{
    this.handleTabsChange(this.state.activeKey);
  }

  render() {
    const {
      loading,
      gridLoading
    } = this.props;
    const {
      design,
      process,
      activeKey,
      activeIndex
    } = this.state;
    return (
      <div className={styles.container}>
        <Tabs
          animated={false}
          defaultActiveKey="process"
          className={styles.tabs}
          onChange={this.handleTabsChange}
          style={{display: 'none'}}
          ref={(el)=>{ this.tabs = el }}>
            <TabPane key="design" tab="发起" />
            <TabPane key="process" tab="发起历史" />
        </Tabs>
        <div className={classNames(styles.tabsContent, styles.tabsContentAnimated)} style={{marginLeft: `${-activeIndex * 100}%`}}>
          <div className={classNames(styles.tabsTabpane,
            {
              [styles.tabsTabpaneActive]: (activeKey === 'design'),
              [styles.tabsTabpaneInactive]: (activeKey !== 'design')
            }
          )}>
            <List
              itemLayout="horizontal"
              dataSource={design.data}
              loading={loading}
              renderItem={item => (
                <div className={styles.listItemWrapper}>
                  <div className={styles.listLine}>
                    <a onClick={ (event)=>{ item.status.code === 'DEPLOYED' ? this.handleProcessLaunch(item, event) : null }}>
                      <List.Item actions={[item.status.code === 'DEPLOYED' ? <Icon type="right" /> : null]}>
                        <List.Item.Meta
                          title={<span style={{fontWeight: 'bold'}}>{item.name}</span>}
                          description={
                          <Fragment>
                            <Icon type="clock-circle-o" className={styles.icon} />
                            <span>部署时间 : </span>
                            <span>{moment(item.lastUpdated).format('YYYY-MM-DD HH:mm')}</span>
                          </Fragment>}
                        />
                        <div>
                          <Badge
                            status={
                              item.status ?
                                (item.status.code === 'UN_DEPLOYED' ?
                                    'default' :
                                    (item.status.code === 'DEPLOYED' ?
                                        'success' :
                                        (item.status.code === '2' ? 'processing' : 'error')
                                    )
                                ) : 'default'
                            }
                            text={ item.status ? item.status.name : '未部署' }
                            className={styles.status} />
                        </div>
                      </List.Item>
                    </a>
                  </div>
                </div>
              )}
            />
          </div>
          <div className={classNames(styles.tabsTabpane,
            {
              [styles.tabsTabpaneActive]: (activeKey === 'process'),
              [styles.tabsTabpaneInactive]: (activeKey !== 'process')
            }
          )}>
            {activeKey === 'process' ? (
              <Fragment>
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={1}
                  loadMore={this.fetchData}
                  hasMore={!gridLoading && process.data.length < process.pagination.total}
                  useWindow={false}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={process.data}
                    loading={gridLoading}
                    renderItem={item => (
                      <div className={styles.listItemWrapper}>
                        <div className={styles.listLine}>
                          <a onClick={ (event)=>{ this.handleProcessView(item, event) }}>
                            <List.Item actions={[<Icon type="right" />]}>
                              <List.Item.Meta
                                title={<span style={{fontWeight: 'bold'}}>{item.processDefinitionName}</span>}
                                description={
                                  <Fragment>
                                    <Icon type="clock-circle-o" className={styles.icon} />
                                    <span>创建时间 : </span>
                                    <span>{moment(item.createTime).format('YYYY-MM-DD HH:mm')}</span>
                                  </Fragment>}
                              />
                              <div className={styles.listContent}>
                                {item.stateValue}
                              </div>
                            </List.Item>
                          </a>
                        </div>
                      </div>
                    )}
                  />
                </InfiniteScroll>
                {gridLoading && process.data.length < process.pagination.total && (
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
