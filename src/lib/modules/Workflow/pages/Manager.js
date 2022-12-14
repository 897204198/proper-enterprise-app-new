import React from 'react';
import {connect} from 'dva';
import { Tabs, Badge, message } from 'antd';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { inject } from '@framework/common/inject';
import { oopToast } from '@framework/common/oopUtils';
import OopSearch from '../../../components/OopSearch';
import OopTable from '../../../components/OopTable';
import OopWorkflowMainModal from '../../../components/OopWorkflowMainModal';

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
export default class Manager extends React.PureComponent {
  state = {
    activeKey: 'task',
    design: {},
    wfVisible: false,
    isLaunch: false,
    taskOrProcDefKey: null,
    businessObj: null,
    procInstId: null,
  }

  componentDidMount() {
    this.handleSearchTask();
  }

  fetchDesign = () => {
    const self = this;
    this.props.dispatch({
      type: 'workflowManager/findDesign',
      payload: {
        modelType: '0',
        sort: 'modifiedDesc',
        modelStatus: 'DEPLOYED'
      },
      callback: () => {
        const { workflowManager } = self.props;
        this.setState({
          design: workflowManager.design
        })
      }
    });
  }
  handleSearchTask = (param = {})=>{
    const { pagination } = param;
    const params = {
      pagination,
      ...param,
    }
    this.taskSearch.load(params);
  }
  handleSearchDesign = (inputValue, filter) => {
    const { workflowManager: { design } } = this.props;
    const filterList = inputValue ? filter(design.data, ['name', 'processVersion']) : design.data;
    this.setState({
      design: {
        ...design,
        data: filterList,
        total: filterList.length
      }
    });
  }
  handleSearchProcess = (param = {})=>{
    const { pagination } = param;
    const params = {
      pagination,
      ...param,
    }
    this.processSearch.load(params);
  }
  handleSearchTaskAssignee = (param = {})=>{
    const { pagination } = param;
    const params = {
      pagination,
      ...param,
    }
    this.taskAssigneeSearch.load(params);
  }
  // ????????????
  handleProcessDeployed = (record)=>{
    console.log('handleProcessDeployed', record);
    this.props.dispatch({
      type: 'workflowDesigner/repository',
      payload: record.id,
      callback: (res) => {
        oopToast(res, '????????????', '????????????');
        this.fetchDesign();
      }
    });
  }
  // tab??????
  handleTabsChange = (key) => {
    const self = this;
    const { children } = this.tabs.props
    let activeIndex = getActiveIndex(children, key);
    if (activeIndex === -1) {
      activeIndex = 0;
    }
    this.setState({
      activeKey: key,
    }, () => {
      if (key === 'task') {
        self.handleSearchTask({pagination: {pageNo: 1, pageSize: 10}});
      } else if (key === 'design') {
        self.fetchDesign();
      } else if (key === 'process') {
        self.handleSearchProcess({pagination: {pageNo: 1, pageSize: 10}});
      } else if (key === 'taskAssignee') {
        self.handleSearchTaskAssignee({pagination: {pageNo: 1, pageSize: 10}});
      }
    });
  }
  // ????????????
  handleProcessLaunch = (record)=>{
    console.log('handleProcessLaunch', record);
    this.props.dispatch({
      type: 'workflowDesigner/fetchByProcDefKey',
      payload: record.key,
      callback: (res)=>{
        const { result: {key, name, startFormKey, id, formProperties} } = res;
        if (key && name && startFormKey && id) {
          this.setState({
            wfVisible: true,
            isLaunch: true,
            taskOrProcDefKey: key,
            businessObj: {
              formKey: startFormKey,
              formProperties
            },
            name,
            processDefinitionId: id,
            stateCode: 'DONE',
          })
        } else {
          message.error('???????????????????????????????????????');
        }
      }
    });
  }
  // ??????
  handleProcessSubmit = (record)=>{
    console.log('handleProcessSubmit', record)
    const {pepProcInst: {procInstId, processTitle}, taskId, name} = record;
    this.props.dispatch({
      type: 'workflowManager/findBusinessObjByTaskId',
      payload: taskId,
      callback: (res) => {
        console.log(res);
        // TODO ??????forms?????????????????????
        const {forms} = res;
        const businessObj = forms.length ? forms[0] : null;
        // HACK ?????????????????????????????????
        if (businessObj.formData[businessObj.formKey]) {
          businessObj.formData = businessObj.formData[businessObj.formKey]
        }
        this.setState({
          wfVisible: true,
          isLaunch: false,
          taskOrProcDefKey: taskId,
          procInstId,
          businessObj: {...businessObj, formTitle: processTitle},
          name,
          stateCode: undefined
        })
      }
    });
  }
  // ????????????
  handleProcessView = (record)=>{
    console.log('handleProcessView', record);
    const {procInstId, processDefinitionId, stateCode} = record;
    this.props.dispatch({
      type: 'workflowManager/findBusinessObjByProcInstId',
      payload: procInstId,
      callback: (res) => {
        console.log(res);
        // TODO ??????forms?????????????????????
        const {forms} = res;
        const businessObj = forms.length ? forms[0] : null;
        this.setState({
          wfVisible: true,
          isLaunch: false,
          taskOrProcDefKey: null,
          procInstId,
          businessObj,
          name: null,
          processDefinitionId,
          stateCode
        })
      }
    });
  }
  // ?????????
  handleDoneProcessView = (record)=>{
    console.log('handleDoneProcessView', record);
    const {pepProcInst: {procInstId, processTitle, stateCode, processDefinitionId}} = record;
    this.props.dispatch({
      type: 'workflowManager/findBusinessObjByProcInstId',
      payload: procInstId,
      callback: (res) => {
        console.log(res);
        // TODO ??????forms?????????????????????
        const {forms} = res;
        const businessObj = forms.length ? forms[0] : null;
        this.setState({
          wfVisible: true,
          isLaunch: false,
          taskOrProcDefKey: null,
          procInstId,
          businessObj,
          name: processTitle,
          processDefinitionId,
          stateCode
        });
      }
    });
  }
  closeProcessModal = ()=>{
    this.setState({
      wfVisible: false
    })
  }
  afterProcessSubmit = ()=>{
    this.handleTabsChange(this.state.activeKey);
  }
  render() {
    const {
      loading,
      global: { size, oopSearchGrid },
      gridLoading
    } = this.props;
    const {
      design,
      activeKey,
    } = this.state;
    const column = {
      task: [
        {title: '??????', dataIndex: 'pepProcInst.processDefinitionName'},
        {title: '????????????', dataIndex: 'pepProcInst.createTime'},
        {title: '?????????', dataIndex: 'pepProcInst.startUserName'},
        {title: '????????????', dataIndex: 'createTime', render: (val, record) => {
          return record.createTime
        }},
        {title: '??????', dataIndex: 'pepProcInst', render: (pepProcInst) => {
          if (pepProcInst) {
            const {stateValue} = pepProcInst;
            return (
              <Badge
                status="processing"
                text={stateValue}
              />
            );
          }
        }}
      ],
      design: [
        {title: '??????', dataIndex: 'name'},
        // {title: '??????', dataIndex: 'pepProcInststateValue'},
        {title: '????????????', dataIndex: 'created'},
        {title: '????????????', dataIndex: 'lastUpdated'},
        {title: '????????????', dataIndex: 'deploymentTime'},
        {title: '?????????', dataIndex: 'processVersion'},
        {title: '????????????', dataIndex: 'status', render: (val) => {
          return (
            <Badge
              status={ val ? (val.code === 'UN_DEPLOYED' ? 'default' : (val.code === 'DEPLOYED' ? 'success' : (val.code === '2' ? 'processing' : 'error'))) : 'default' }
              text={ val ? val.name : '?????????' } />
          );
        }},
      ],
      process: [
        {title: '??????', dataIndex: 'processDefinitionName'},
        {title: '????????????', dataIndex: 'createTime', width: 400},
        {title: '????????????', dataIndex: 'stateValue', width: 200, render: (text, record) => {
          if (text) {
            const {stateCode} = record;
            let status = 'success';
            if (stateCode === 'DOING') {
              status = 'processing';
            }
            return (
              <Badge
                status={status}
                text={text}
              />
            );
          }
        }},
      ],
      taskAssignee: [
        {title: '??????', dataIndex: 'pepProcInst.processDefinitionName'},
        {title: '????????????', dataIndex: 'pepProcInst.createTime'},
        {title: '?????????', dataIndex: 'pepProcInst.startUserName'},
        {title: '????????????', dataIndex: 'endTime', render: (val, record) => {
          return record.endTime
        }},
        {title: '??????', dataIndex: 'pepProcInst', render: (pepProcInst) => {
          if (pepProcInst) {
            const {stateValue, stateCode} = pepProcInst;
            let status = 'success';
            if (stateCode === 'DOING') {
              status = 'processing';
            }
            return (
              <Badge
                status={status}
                text={stateValue}
              />
            );
          }
        }},
      ]
    }

    const actionLaunchColumn = [
      {
        text: '????????????',
        name: 'deployed',
        icon: 'api',
        confirm: '??????????????????',
        onClick: (record)=>{ this.handleProcessDeployed(record) },
        display: record=> record.status.code === 'UN_DEPLOYED'
      },
      {
        text: '????????????',
        name: 'view',
        icon: 'select',
        onClick: (record)=>{ this.handleProcessLaunch(record) },
        display: record=> record.status.code === 'DEPLOYED'
      }
    ];
    const actionSubmitColumn = [
      {
        text: '????????????',
        name: 'view',
        icon: 'select',
        onClick: (record)=>{ this.handleProcessSubmit(record) }
      }
    ];
    const actionViewColumn = [
      {
        text: '????????????',
        name: 'view',
        icon: 'select',
        onClick: (record)=>{ this.handleProcessView(record) }
      }
    ];
    const actionDoneProcessColumn = [
      {
        text: '????????????',
        name: 'view',
        icon: 'select',
        onClick: (record)=>{ this.handleDoneProcessView(record) }
      }
    ];

    return (
      <PageHeaderLayout content={
        <Tabs animated={false} defaultActiveKey="task" onChange={this.handleTabsChange} ref={(el)=>{ this.tabs = el }}>
          <TabPane key="task" tab="??????">
            <div>
              <OopSearch
                placeholder="?????????"
                enterButtonText="??????"
                moduleName="workflow_task"
                ref={(el)=>{ this.taskSearch = el && el.getWrappedInstance() }}
              />
              <OopTable
                checkable={false}
                columns={column[activeKey]}
                grid={oopSearchGrid}
                loading={gridLoading}
                onLoad={this.handleSearchTask}
                rowButtons={actionSubmitColumn}
                rowKey="taskId"
                size={size}
              />
            </div>
          </TabPane>
          <TabPane key="design" tab="??????">
            <div>
              <OopSearch
                placeholder="?????????"
                enterButtonText="??????"
                onInputChange={this.handleSearchDesign}
                ref={(el) => { this.designSearch = el && el.getWrappedInstance() }}
              />
              <OopTable
                grid={{list: design.data}}
                columns={column[activeKey]}
                loading={loading}
                size={size}
                rowButtons={actionLaunchColumn}
                checkable={false}
                // pagination={{total: design.total}}
              />
            </div>
          </TabPane>
          <TabPane key="process" tab="????????????">
            <div>
              <OopSearch
                placeholder="?????????"
                enterButtonText="??????"
                moduleName="workflow_process"
                ref={(el)=>{ this.processSearch = el && el.getWrappedInstance() }}
              />
              <OopTable
                checkable={false}
                columns={column[activeKey]}
                grid={oopSearchGrid}
                loading={gridLoading}
                onLoad={this.handleSearchProcess}
                rowButtons={actionViewColumn}
                rowKey="procInstId"
                size={size}
              />
            </div>
          </TabPane>
          <TabPane key="taskAssignee" tab="???????????????">
            <div>
              <OopSearch
                placeholder="?????????"
                enterButtonText="??????"
                moduleName="workflow_taskAssignee"
                ref={(el)=>{ this.taskAssigneeSearch = el && el.getWrappedInstance() }}
              />
              <OopTable
                checkable={false}
                columns={column[activeKey]}
                grid={oopSearchGrid}
                loading={gridLoading}
                onLoad={this.handleSearchTaskAssignee}
                rowButtons={actionDoneProcessColumn}
                rowKey="taskId"
                size={size}
              />
            </div>
          </TabPane>
          <TabPane key="5" disabled tab="???????????????" />
        </Tabs>
      }>
        <OopWorkflowMainModal
          name={this.state.name}
          isLaunch={this.state.isLaunch}
          visible={this.state.wfVisible}
          closeModal={this.closeProcessModal}
          afterProcessSubmit={this.afterProcessSubmit}
          businessObj={this.state.businessObj}
          taskOrProcDefKey={this.state.taskOrProcDefKey}
          procInstId={this.state.procInstId}
          processDefinitionId={this.state.processDefinitionId}
          stateCode={this.state.stateCode}
        />
      </PageHeaderLayout>
    );
  }
}
