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
  // 部署流程
  handleProcessDeployed = (record)=>{
    console.log('handleProcessDeployed', record);
    this.props.dispatch({
      type: 'workflowDesigner/repository',
      payload: record.id,
      callback: (res) => {
        oopToast(res, '部署成功', '部署失败');
        this.fetchDesign();
      }
    });
  }
  // tab切换
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
  // 发起流程
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
          message.error('该流程未部署或参数解析错误');
        }
      }
    });
  }
  // 待办
  handleProcessSubmit = (record)=>{
    console.log('handleProcessSubmit', record)
    const {pepProcInst: {procInstId, processTitle}, taskId, name} = record;
    this.props.dispatch({
      type: 'workflowManager/findBusinessObjByTaskId',
      payload: taskId,
      callback: (res) => {
        console.log(res);
        // TODO 多个forms情况先不予考虑
        const {forms} = res;
        const businessObj = forms.length ? forms[0] : null;
        // HACK 兼容后台数据结构的问题
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
        {title: '名称', dataIndex: 'pepProcInst.processDefinitionName'},
        {title: '发起时间', dataIndex: 'pepProcInst.createTime'},
        {title: '发起人', dataIndex: 'pepProcInst.startUserName'},
        {title: '到达时间', dataIndex: 'createTime', render: (val, record) => {
          return record.createTime
        }},
        {title: '状态', dataIndex: 'pepProcInst', render: (pepProcInst) => {
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
        {title: '名称', dataIndex: 'name'},
        // {title: '标识', dataIndex: 'pepProcInststateValue'},
        {title: '创建时间', dataIndex: 'created'},
        {title: '更新时间', dataIndex: 'lastUpdated'},
        {title: '部署时间', dataIndex: 'deploymentTime'},
        {title: '版本号', dataIndex: 'processVersion'},
        {title: '部署状态', dataIndex: 'status', render: (val) => {
          return (
            <Badge
              status={ val ? (val.code === 'UN_DEPLOYED' ? 'default' : (val.code === 'DEPLOYED' ? 'success' : (val.code === '2' ? 'processing' : 'error'))) : 'default' }
              text={ val ? val.name : '未部署' } />
          );
        }},
      ],
      process: [
        {title: '名称', dataIndex: 'processDefinitionName'},
        {title: '发起时间', dataIndex: 'createTime', width: 400},
        {title: '流程状态', dataIndex: 'stateValue', width: 200, render: (text, record) => {
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
        {title: '名称', dataIndex: 'pepProcInst.processDefinitionName'},
        {title: '发起时间', dataIndex: 'pepProcInst.createTime'},
        {title: '发起人', dataIndex: 'pepProcInst.startUserName'},
        {title: '办理时间', dataIndex: 'endTime', render: (val, record) => {
          return record.endTime
        }},
        {title: '状态', dataIndex: 'pepProcInst', render: (pepProcInst) => {
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
        text: '流程部署',
        name: 'deployed',
        icon: 'api',
        confirm: '确定部署吗？',
        onClick: (record)=>{ this.handleProcessDeployed(record) },
        display: record=> record.status.code === 'UN_DEPLOYED'
      },
      {
        text: '流程发起',
        name: 'view',
        icon: 'select',
        onClick: (record)=>{ this.handleProcessLaunch(record) },
        display: record=> record.status.code === 'DEPLOYED'
      }
    ];
    const actionSubmitColumn = [
      {
        text: '流程办理',
        name: 'view',
        icon: 'select',
        onClick: (record)=>{ this.handleProcessSubmit(record) }
      }
    ];
    const actionViewColumn = [
      {
        text: '流程查看',
        name: 'view',
        icon: 'select',
        onClick: (record)=>{ this.handleProcessView(record) }
      }
    ];
    const actionDoneProcessColumn = [
      {
        text: '流程查看',
        name: 'view',
        icon: 'select',
        onClick: (record)=>{ this.handleDoneProcessView(record) }
      }
    ];

    return (
      <PageHeaderLayout content={
        <Tabs animated={false} defaultActiveKey="task" onChange={this.handleTabsChange} ref={(el)=>{ this.tabs = el }}>
          <TabPane key="task" tab="待办">
            <div>
              <OopSearch
                placeholder="请输入"
                enterButtonText="搜索"
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
          <TabPane key="design" tab="发起">
            <div>
              <OopSearch
                placeholder="请输入"
                enterButtonText="搜索"
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
          <TabPane key="process" tab="发起历史">
            <div>
              <OopSearch
                placeholder="请输入"
                enterButtonText="搜索"
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
          <TabPane key="taskAssignee" tab="已处理流程">
            <div>
              <OopSearch
                placeholder="请输入"
                enterButtonText="搜索"
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
          <TabPane key="5" disabled tab="流程草稿箱" />
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
